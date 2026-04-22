import { config } from '../config/env';
import { BaseAdapter, LLMRequest, LLMRawResponse } from './BaseAdapter';

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
        index: number;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenAIAdapter extends BaseAdapter {
    private apiKey: string;
    private model: string;

    constructor() {
        super('openai');
        this.apiKey = config.openai.apiKey;
        this.model = config.openai.model;
    }

    protected async callAPI(request: LLMRequest): Promise<LLMRawResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a cybersecurity expert specialized in phishing email detection.' },
                    { role: 'user', content: request.prompt },
                ],
                temperature: 0.1,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
        }

        const data = (await response.json()) as OpenAIResponse;
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

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
