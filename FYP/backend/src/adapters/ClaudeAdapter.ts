import { config } from '../config/env';
import { BaseAdapter, LLMRequest, LLMRawResponse } from './BaseAdapter';

interface ClaudeResponse {
    id: string;
    type: string;
    role: string;
    content: Array<{
        type: string;
        text: string;
    }>;
    model: string;
    stop_reason: string;
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

export class ClaudeAdapter extends BaseAdapter {
    private apiKey: string;
    private model: string;

    constructor() {
        super('anthropic');
        this.apiKey = config.anthropic.apiKey;
        this.model = config.anthropic.model;
    }

    protected async callAPI(request: LLMRequest): Promise<LLMRawResponse> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 2000,
                messages: [
                    { role: 'user', content: request.prompt },
                ],
                system: 'You are a cybersecurity expert specialized in phishing email detection. Analyze emails carefully and provide detailed, accurate assessments.',
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Claude API error ${response.status}: ${errorBody}`);
        }

        const data = (await response.json()) as ClaudeResponse;
        const content = data.content?.[0]?.text || '';
        const parsed = this.parseStructuredResponse(content);

        return {
            classification: parsed.classification || 'suspicious',
            confidence: parsed.confidence || 0.5,
            explanation: parsed.explanation || content,
            indicators: parsed.indicators || [],
            rawResponse: content,
        };
    }
}
