import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sampleEmails } from '../db/seeds/sampleData';
import { query, queryOne } from '../db/connection';
import { TestSession, TestAnswer, Classification } from '../models/types';

const router = Router();

/**
 * POST /api/evaluation/start
 */
router.post('/start', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    const { type = 'pre-test' } = req.body;

    if (type !== 'pre-test' && type !== 'post-test') {
        return res.status(400).json({ success: false, error: 'Type must be "pre-test" or "post-test"' });
    }

    // Select 20 emails (10 phishing, 10 legitimate)
    const phishingEmails = sampleEmails.filter(e => e.isPhishing === true).slice(0, 10);
    const legitimateEmails = sampleEmails.filter(e => e.isPhishing === false).slice(0, 10);
    const testEmails = [...phishingEmails, ...legitimateEmails]
        .sort(() => Math.random() - 0.5)
        .map(e => ({
            id: e.id,
            subject: e.subject,
            sender: e.sender,
            body: e.body,
            difficulty: e.difficulty,
        }));

    try {
        const session = await queryOne<TestSession>(
            `INSERT INTO test_sessions (user_id, type, total_questions, correct_answers, score, answers, started_at)
             VALUES ($1, $2, $3, 0, 0, $4, NOW())
             RETURNING id, type, total_questions`,
            [userId, type, testEmails.length, '[]']
        );

        res.json({
            success: true,
            data: {
                sessionId: session!.id,
                type: session!.type,
                totalQuestions: session!.totalQuestions,
                emails: testEmails,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

/**
 * POST /api/evaluation/answer
 */
router.post('/answer', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    const { sessionId, emailId, userAnswer, timeSpentMs = 0 } = req.body;

    try {
        const session = await queryOne<TestSession>(
            'SELECT * FROM test_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]
        );
        if (!session) return res.status(404).json({ success: false, error: 'Test session not found' });

        const email = sampleEmails.find(e => e.id === emailId);
        if (!email) return res.status(404).json({ success: false, error: 'Email not found' });

        const correctAnswer: Classification = email.isPhishing ? 'phishing' : 'legitimate';
        const isCorrect = userAnswer === correctAnswer;

        const answers = session.answers || [];
        answers.push({ emailId, userAnswer, correctAnswer, isCorrect, timeSpentMs });

        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const score = Math.round((correctAnswers / answers.length) * 100);

        await query(
            'UPDATE test_sessions SET answers = $1, correct_answers = $2, score = $3 WHERE id = $4',
            [JSON.stringify(answers), correctAnswers, score, sessionId]
        );

        res.json({
            success: true,
            data: {
                answeredCount: answers.length,
                totalQuestions: session.totalQuestions,
                remaining: session.totalQuestions - answers.length,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

/**
 * POST /api/evaluation/complete
 */
router.post('/complete', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    const { sessionId } = req.body;

    try {
        const session = await queryOne<TestSession>(
            'SELECT * FROM test_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]
        );
        if (!session) return res.status(404).json({ success: false, error: 'Test session not found' });

        const completedAt = new Date();
        // Fix: Use snake_case properties from the DB result
        const total = session.total_questions || session.totalQuestions || 0;
        const correct = session.correct_answers || session.correctAnswers || 0;
        const score = total > 0 ? Math.round((correct / total) * 100) : 0;

        await query('UPDATE test_sessions SET completed_at = $1, score = $2 WHERE id = $3', [completedAt, score, sessionId]);

        const answers = session.answers || [];
        const phishing = answers.filter(a => a.correctAnswer === 'phishing');
        const legit = answers.filter(a => a.correctAnswer === 'legitimate');

        const metrics = {
            falsePositiveRate: legit.length > 0 ? Math.round((legit.filter(a => a.userAnswer === 'phishing').length / legit.length) * 100) : 0,
            falseNegativeRate: phishing.length > 0 ? Math.round((phishing.filter(a => a.userAnswer === 'legitimate').length / phishing.length) * 100) : 0,
            averageResponseTimeMs: answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.timeSpentMs, 0) / answers.length) : 0
        };

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                type: session.type,
                score,
                correctAnswers: correct,
                totalQuestions: total,
                metrics,
                completedAt,
                duration: completedAt.getTime() - new Date(session.started_at || session.startedAt).getTime()
            }
        });
    } catch (error: any) {
        console.error('Complete evaluation error:', error.message);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

/**
 * GET /api/evaluation/compare/:userId
 */
router.get('/compare/:userId', async (req: Request, res: Response) => {
    const userId = req.user!.uid;

    try {
        const preTest = await queryOne<any>(
            `SELECT score, correct_answers AS "correctAnswers", total_questions AS "totalQuestions", completed_at AS "date" 
             FROM test_sessions 
             WHERE user_id = $1 AND type = $2 AND completed_at IS NOT NULL 
             ORDER BY completed_at DESC LIMIT 1`,
            [userId, 'pre-test']
        );
        const postTest = await queryOne<any>(
            `SELECT score, correct_answers AS "correctAnswers", total_questions AS "totalQuestions", completed_at AS "date" 
             FROM test_sessions 
             WHERE user_id = $1 AND type = $2 AND completed_at IS NOT NULL 
             ORDER BY completed_at DESC LIMIT 1`,
            [userId, 'post-test']
        );

        if (!preTest) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    preTest: null,
                    postTest: null
                }
            });
        }

        const improvement = postTest ? (postTest.score - preTest.score) : 0;

        res.json({
            success: true,
            data: {
                available: true,
                preTest,
                postTest,
                improvement,
                improvementPercentage: preTest.score > 0 ? Math.round((improvement / preTest.score) * 100) : improvement
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

export default router;
