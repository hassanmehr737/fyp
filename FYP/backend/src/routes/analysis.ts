import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AdapterFactory } from '../adapters/AdapterFactory';
import { PromptManager } from '../prompts/PromptManager';
import { query, queryOne } from '../db/connection';
import { AnalysisRequest, AnalysisResult, Provider, PromptStrategy, ComparisonResult } from '../models/types';

const router = Router();

/**
 * POST /api/analyze
 * Analyze an email for phishing using one or more LLM providers.
 * Persists results to PostgreSQL for the authenticated user.
 */
router.post('/', async (req: Request, res: Response) => {
    const userId = req.user!.uid;

    try {
        const {
            emailContent,
            subject = '(No subject)',
            sender = 'unknown@unknown.com',
            providers = ['openai', 'anthropic'] as Provider[],
            promptStrategy = 'chain-of-thought' as PromptStrategy,
        }: AnalysisRequest = req.body;

        if (!emailContent || emailContent.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Email content is required' });
        }

        const emailId = uuidv4();

        // Generate prompt
        const prompt = PromptManager.generate(promptStrategy, {
            subject,
            sender,
            body: emailContent,
        });

        // Run analysis on all requested providers in parallel
        const analysisPromises = providers.map(async (provider) => {
            const adapter = AdapterFactory.getAdapter(provider);
            const start = Date.now();

            try {
                const result = await adapter.analyzeWithRetry({
                    email: { subject, sender, body: emailContent },
                    prompt,
                });

                const duration = Date.now() - start;

                // Persist to DB
                const dbResult = await queryOne<any>(
                    `INSERT INTO analysis_results (
                        user_id, email_content, subject, sender, provider, 
                        classification, confidence, explanation, indicators, 
                        response_time_ms, token_usage, prompt_strategy
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id, created_at`,
                    [
                        userId, emailContent, subject, sender, provider,
                        result.classification, result.confidence, result.explanation,
                        JSON.stringify(result.indicators), duration,
                        JSON.stringify({
                            promptTokens: Math.ceil(prompt.length / 4),
                            completionTokens: Math.ceil((result.explanation || '').length / 4),
                            totalTokens: Math.ceil((prompt.length + (result.explanation || '').length) / 4)
                        }),
                        promptStrategy
                    ]
                );

                const analysisResult: AnalysisResult = {
                    id: dbResult.id,
                    emailId,
                    provider,
                    classification: result.classification,
                    confidence: result.confidence,
                    explanation: result.explanation,
                    indicators: result.indicators,
                    responseTimeMs: duration,
                    tokenUsage: {
                        promptTokens: Math.ceil(prompt.length / 4),
                        completionTokens: Math.ceil((result.explanation || '').length / 4),
                        totalTokens: Math.ceil((prompt.length + (result.explanation || '').length) / 4),
                        estimatedCost: 0,
                    },
                    promptVersion: promptStrategy,
                    createdAt: dbResult.created_at,
                };

                return analysisResult;
            } catch (error: any) {
                console.error(`Provider ${provider} failed:`, error.message);
                return {
                    id: uuidv4(),
                    emailId,
                    provider,
                    classification: 'suspicious' as const,
                    confidence: 0,
                    explanation: `Analysis failed: ${error.message}`,
                    indicators: [],
                    responseTimeMs: 0,
                    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
                    promptVersion: promptStrategy,
                    createdAt: new Date(),
                    error: error.message,
                } as any;
            }
        });

        const results = await Promise.all(analysisPromises);

        // Calculate consensus
        const validResults = results.filter(r => !r.error);
        const classifications = validResults.map(r => r.classification);
        const consensus = classifications.sort((a, b) =>
            classifications.filter(v => v === a).length - classifications.filter(v => v === b).length
        ).pop() || 'suspicious';

        const agreementLevel = classifications.length > 0
            ? classifications.filter(c => c === consensus).length / classifications.length
            : 0;

        res.json({
            success: true,
            data: {
                emailId,
                results,
                consensus,
                agreementLevel,
                promptStrategy,
            },
        });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze email' });
    }
});

/**
 * GET /api/analyze/:id
 * Get analysis results by DB ID (UUID)
 */
router.get('/:id', async (req: Request, res: Response) => {
    const userId = req.user!.uid;
    const { id } = req.params;

    try {
        const result = await queryOne('SELECT * FROM analysis_results WHERE id = $1 AND user_id = $2', [id, userId]);
        if (!result) return res.status(404).json({ success: false, error: 'Analysis not found' });
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

/**
 * GET /api/analyze/history/recent
 * Get user's recent analysis history from DB
 */
router.get('/history/recent', async (req: Request, res: Response) => {
    const userId = req.user!.uid;

    try {
        const history = await query(
            `SELECT id AS "emailId", created_at AS timestamp, classification AS consensus, provider
             FROM analysis_results 
             WHERE user_id = $1 
             ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );

        res.json({ success: true, data: history });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

export default router;
