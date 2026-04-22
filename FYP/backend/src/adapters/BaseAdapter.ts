import { AnalysisResult, Classification, PhishingIndicator, Provider, TokenUsage } from '../models/types';

export interface LLMRequest {
    email: {
        subject: string;
        sender: string;
        body: string;
    };
    prompt: string;
}

export interface LLMRawResponse {
    classification: Classification;
    confidence: number;
    explanation: string;
    indicators: PhishingIndicator[];
    rawResponse: string;
}

export abstract class BaseAdapter {
    protected provider: Provider;
    protected maxRetries: number = 3;
    protected retryDelayMs: number = 1000;

    constructor(provider: Provider) {
        this.provider = provider;
    }

    async analyzeWithRetry(request: LLMRequest): Promise<LLMRawResponse> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const start = Date.now();
                const response = await this.callAPI(request);
                return response;
            } catch (error: any) {
                lastError = error;
                console.error(`[${this.provider}] Attempt ${attempt}/${this.maxRetries} failed:`, error.message);

                if (attempt < this.maxRetries) {
                    // Exponential backoff
                    const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
                    console.log(`[${this.provider}] Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        throw new Error(`[${this.provider}] All ${this.maxRetries} attempts failed. Last error: ${lastError?.message}`);
    }

    protected abstract callAPI(request: LLMRequest): Promise<LLMRawResponse>;

    protected parseStructuredResponse(text: string): Partial<LLMRawResponse> {
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    classification: this.normalizeClassification(parsed.classification || parsed.verdict),
                    confidence: parseFloat(parsed.confidence || parsed.confidence_score || '0.5'),
                    explanation: parsed.explanation || parsed.reasoning || '',
                    indicators: this.parseIndicators(parsed.indicators || parsed.suspicious_elements || []),
                };
            }
        } catch {
            // Fall through to text parsing
        }

        // Text-based fallback parsing
        const classification = this.extractClassification(text);
        const confidence = this.extractConfidence(text);

        return {
            classification,
            confidence,
            explanation: text,
            indicators: [],
        };
    }

    private normalizeClassification(raw: string): Classification {
        const lower = (raw || '').toLowerCase().trim();
        if (lower.includes('phishing') || lower.includes('malicious')) return 'phishing';
        if (lower.includes('legitimate') || lower.includes('safe') || lower.includes('clean')) return 'legitimate';
        return 'suspicious';
    }

    private extractClassification(text: string): Classification {
        const lower = text.toLowerCase();
        if (lower.includes('phishing') && !lower.includes('not phishing') && !lower.includes('no phishing')) {
            return 'phishing';
        }
        if (lower.includes('legitimate') || lower.includes('not phishing') || lower.includes('safe')) {
            return 'legitimate';
        }
        return 'suspicious';
    }

    private extractConfidence(text: string): number {
        const match = text.match(/confidence[:\s]*(\d+(?:\.\d+)?)[%]?/i);
        if (match) {
            const val = parseFloat(match[1]);
            return val > 1 ? val / 100 : val;
        }
        return 0.5;
    }

    private parseIndicators(raw: any[]): PhishingIndicator[] {
        if (!Array.isArray(raw)) return [];
        return raw.map((item: any) => ({
            type: item.type || 'language',
            description: item.description || String(item),
            severity: item.severity || 'medium',
            evidence: item.evidence || '',
        }));
    }

    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getProvider(): Provider {
        return this.provider;
    }
}
