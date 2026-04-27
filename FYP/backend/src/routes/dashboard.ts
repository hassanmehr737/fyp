import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/connection';

const router = Router();

/**
 * GET /api/dashboard/stats/:userId
 * Returns real user statistics computed from the PostgreSQL database.
 * The userId in the URL is verified against req.user.uid from auth middleware.
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
    const userId = req.user!.uid;

    try {
        // Total analyses
        const analysisRow = await queryOne<{ count: string }>(
            `SELECT COUNT(*) AS count FROM analysis_results WHERE user_id = $1`, [userId]
        );

        // Phishing detected vs legitimate
        const classificationRows = await query<{ classification: string; count: string }>(
            `SELECT classification, COUNT(*) AS count FROM analysis_results WHERE user_id = $1 GROUP BY classification`, [userId]
        );

        const clMap: Record<string, number> = {};
        for (const r of classificationRows) clMap[r.classification] = parseInt(r.count);

        // Training modules completed
        const trainingRow = await queryOne<{ count: string }>(
            `SELECT COUNT(*) AS count FROM training_progress WHERE user_id = $1 AND completed_at IS NOT NULL`, [userId]
        );

        // Overall accuracy from training answers
        const accuracyRow = await queryOne<{ correct: string; total: string }>(
            `SELECT SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct, COUNT(*) AS total
             FROM training_answers WHERE user_id = $1`, [userId]
        );
        const correct = parseInt(accuracyRow?.correct || '0');
        const total = parseInt(accuracyRow?.total || '0');
        const overallAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Weekly progress (last 4 weeks)
        const weeklyRows = await query<{ week: string; correct_answers: string; total_answers: string }>(
            `SELECT TO_CHAR(DATE_TRUNC('week', answered_at), 'Mon DD') AS week,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_answers,
                    COUNT(*) AS total_answers
             FROM training_answers
             WHERE user_id = $1 AND answered_at > NOW() - INTERVAL '4 weeks'
             GROUP BY DATE_TRUNC('week', answered_at)
             ORDER BY DATE_TRUNC('week', answered_at)`, [userId]
        );
        const weeklyProgress = weeklyRows.map(r => ({
            week: r.week,
            correctAnswers: parseInt(r.correct_answers),
            totalAnswers: parseInt(r.total_answers),
            accuracy: parseInt(r.total_answers) > 0
                ? Math.round((parseInt(r.correct_answers) / parseInt(r.total_answers)) * 100)
                : 0,
        }));

        // Category performance
        const categoryRows = await query<{ module_id: string; correct: string; total: string }>(
            `SELECT module_id,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct,
                    COUNT(*) AS total
             FROM training_answers
             WHERE user_id = $1
             GROUP BY module_id`, [userId]
        );
        const categoryPerformance = categoryRows.map(r => ({
            category: r.module_id,
            accuracy: parseInt(r.total) > 0 ? Math.round((parseInt(r.correct) / parseInt(r.total)) * 100) : 0,
            totalAttempts: parseInt(r.total),
        }));

        // Badges from training_progress
        const badgeRows = await query<{ badges: any }>(
            `SELECT badges FROM training_progress WHERE user_id = $1`, [userId]
        );
        const badges = badgeRows.flatMap(r => r.badges || []);

        // Calculate current streak (global consecutive correct answers)
        const recentAnswers = await query<{ is_correct: boolean }>(
            `SELECT is_correct FROM training_answers WHERE user_id = $1 ORDER BY answered_at DESC LIMIT 50`,
            [userId]
        );

        let currentStreak = 0;
        for (const row of recentAnswers) {
            if (row.is_correct) {
                currentStreak++;
            } else {
                break;
            }
        }

        const stats = {
            totalAnalyses: parseInt(analysisRow?.count || '0'),
            phishingDetected: clMap['phishing'] || 0,
            legitimateConfirmed: clMap['legitimate'] || 0,
            trainingModulesCompleted: parseInt(trainingRow?.count || '0'),
            overallAccuracy,
            currentStreak,
            badges,
            weeklyProgress: weeklyProgress.length > 0 ? weeklyProgress : [
                { week: 'Week 1', correctAnswers: 0, totalAnswers: 0, accuracy: 0 },
            ],
            categoryPerformance,
        };

        res.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Dashboard stats error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

/**
 * GET /api/dashboard/recent-activity/:userId
 */
router.get('/recent-activity/:userId', async (req: Request, res: Response) => {
    const userId = req.user!.uid;

    try {
        // Combine recent analyses + training completions
        const analysisActivity = await query<any>(
            `SELECT 'analysis' AS type,
                    CONCAT('Analysed email: ', LEFT(subject, 50)) AS description,
                    classification AS result,
                    created_at AS timestamp
             FROM analysis_results WHERE user_id = $1
             ORDER BY created_at DESC LIMIT 5`, [userId]
        );

        const trainingActivity = await query<any>(
            `SELECT 'training' AS type,
                    CONCAT('Completed module: ', module_id) AS description,
                    'passed' AS result,
                    completed_at AS timestamp
             FROM training_progress
             WHERE user_id = $1 AND completed_at IS NOT NULL
             ORDER BY completed_at DESC LIMIT 5`, [userId]
        );

        const activities = [...analysisActivity, ...trainingActivity]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        res.json({ success: true, data: activities });
    } catch (error: any) {
        console.error('Recent activity error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch activity' });
    }
});

export default router;
