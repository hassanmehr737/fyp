import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

/**
 * POST /api/auth/register
 * Creates or upserts user profile in PostgreSQL after Firebase signup.
 * Protected: requires Firebase token.
 */
router.post('/register', requireAuth, async (req: Request, res: Response) => {
    const { uid, email } = req.user!;
    const { name, technicalBackground, ageGroup } = req.body;

    try {
        await query(
            `INSERT INTO users (id, email, name, technical_background, age_group)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE
               SET name = EXCLUDED.name,
                   technical_background = EXCLUDED.technical_background,
                   age_group = EXCLUDED.age_group,
                   updated_at = NOW()`,
            [uid, email, name || 'User', technicalBackground || 'none', ageGroup || null]
        );

        res.json({ success: true, message: 'User profile saved' });
    } catch (error: any) {
        console.error('Register error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to save user profile' });
    }
});

/**
 * GET /api/auth/me
 * Returns current user's profile from PostgreSQL.
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    const { uid } = req.user!;

    try {
        const user = await queryOne('SELECT * FROM users WHERE id = $1', [uid]);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

export default router;
