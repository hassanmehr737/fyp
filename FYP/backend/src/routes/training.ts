import { Router, Request, Response } from 'express';
import { sampleEmails, trainingModules } from '../db/seeds/sampleData';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { PromptManager } from '../prompts/PromptManager';
import { query, queryOne } from '../db/connection';
import { TrainingProgress, Badge, Classification } from '../models/types';

const router = Router();

/**
 * GET /api/training/modules
 */
router.get('/modules', (_req: Request, res: Response) => {
    const modules = trainingModules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        difficulty: m.difficulty,
        emailCount: m.emails.length,
        order: m.order,
    }));
    res.json({ success: true, data: modules });
});

/**
 * GET /api/training/modules/:id
 */
router.get('/modules/:id', (req: Request, res: Response) => {
    const module = trainingModules.find(m => m.id === req.params.id);
    if (!module) return res.status(404).json({ success: false, error: 'Module not found' });
    
    const sanitizedEmails = module.emails.map(e => ({
        id: e.id,
        subject: e.subject,
        sender: e.sender,
        body: e.body,
        difficulty: e.difficulty,
    }));

    res.json({
        success: true,
        data: { ...module, emails: sanitizedEmails },
    });
});

/**
 * POST /api/training/submit
 */
router.post('/submit', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    const { emailId, userAnswer, moduleId, timeSpentMs = 0 } = req.body;

    try {
        const email = sampleEmails.find(e => e.id === emailId);
        if (!email) return res.status(404).json({ success: false, error: 'Email not found' });

        const correctAnswer: Classification = email.isPhishing ? 'phishing' : 'legitimate';
        const isCorrect = userAnswer === correctAnswer || (userAnswer === 'suspicious' && email.isPhishing);

        // Get or Create Progress
        let progress = await queryOne<TrainingProgress>(
            'SELECT * FROM training_progress WHERE user_id = $1 AND module_id = $2',
            [userId, moduleId || 'general']
        );

        if (!progress) {
            progress = await queryOne<TrainingProgress>(
                `INSERT INTO training_progress (user_id, module_id, total_emails, started_at)
                 VALUES ($1, $2, $3, NOW())
                 RETURNING *`,
                [userId, moduleId || 'general', trainingModules.find(m => m.id === moduleId)?.emails.length || 20]
            );
        }

        // Update progress logic
        const newCompletedEmails = (progress!.completedEmails || 0) + 1;
        const newCorrectAnswers = (progress!.correctAnswers || 0) + (isCorrect ? 1 : 0);
        const newCurrentStreak = isCorrect ? (progress!.currentStreak || 0) + 1 : 0;
        const newBestStreak = Math.max(progress!.bestStreak || 0, newCurrentStreak);

        // Award badges
        const badges = progress!.badges || [];
        const newBadges: Badge[] = [];
        
        const checkAndAddBadge = (id: string, name: string, desc: string, icon: string) => {
            if (!badges.find(b => b.id === id)) {
                const b = { id, name, description: desc, icon, earnedAt: new Date() };
                badges.push(b);
                newBadges.push(b);
            }
        };

        if (newCompletedEmails === 1) checkAndAddBadge('first-analysis', 'First Steps', 'Completed first analysis', '🔍');
        if (newCurrentStreak === 5) checkAndAddBadge('streak-5', 'On Fire', '5 correct answers in a row', '🔥');
        if (newCorrectAnswers === 10) checkAndAddBadge('detective', 'Phishing Detective', '10 correct analyses', '🕵️');
        
        let completedAt = progress!.completedAt;
        if (newCompletedEmails >= progress!.totalEmails && !completedAt) {
            completedAt = new Date();
            checkAndAddBadge('module-complete', 'Module Master', 'Completed all emails in a module', '🏆');
        }

        // Save progress
        await query(
            `UPDATE training_progress 
             SET completed_emails = $1, correct_answers = $2, current_streak = $3, 
                 best_streak = $4, badges = $5, completed_at = $6
             WHERE id = $7`,
            [newCompletedEmails, newCorrectAnswers, newCurrentStreak, newBestStreak, JSON.stringify(badges), completedAt, progress!.id]
        );

        // Save individual answer
        await query(
            `INSERT INTO training_answers (user_id, module_id, email_id, user_answer, is_correct, time_spent_ms)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, moduleId || 'general', emailId, userAnswer, isCorrect, timeSpentMs]
        );

        // AI Explanation (Simplified for this update)
        const adapter = AdapterFactory.getAdapter('openai');
        let explanation = '';
        try {
            const result = await adapter.analyzeWithRetry({
                email: { subject: email.subject, sender: email.sender, body: email.body },
                prompt: PromptManager.generate('chain-of-thought', email),
            });
            explanation = result.explanation;
        } catch {
            explanation = email.isPhishing ? 'Phishing alert! Fake sender detected.' : 'Appears legitimate.';
        }

        res.json({
            success: true,
            data: {
                isCorrect,
                correctAnswer,
                explanation,
                progress: { 
                    completedEmails: newCompletedEmails, 
                    totalEmails: progress!.totalEmails,
                    correctAnswers: newCorrectAnswers,
                    currentStreak: newCurrentStreak 
                },
                newBadges,
                indicators: email.indicators || []
            }
        });
    } catch (error: any) {
        console.error('Training error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/training/progress/:userId
 */
router.get('/progress/:userId', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    try {
        const modules = await query<TrainingProgress>('SELECT * FROM training_progress WHERE user_id = $1', [userId]);
        const summaryRows = await queryOne<any>(
            `SELECT SUM(completed_emails) as total_completed, SUM(correct_answers) as total_correct 
             FROM training_progress WHERE user_id = $1`, [userId]
        );
        
        const totalCompleted = parseInt(summaryRows.total_completed || '0');
        const totalCorrect = parseInt(summaryRows.total_correct || '0');
        const allBadges = modules.flatMap(m => m.badges || []);

        res.json({
            success: true,
            data: {
                modules,
                summary: {
                    totalCompleted,
                    totalCorrect,
                    overallAccuracy: totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0,
                    badgeCount: allBadges.length,
                    badges: allBadges
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

export default router;
