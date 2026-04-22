import { Classification, PhishingIndicator } from '../models/types';
import { BaseAdapter, LLMRawResponse, LLMRequest } from './BaseAdapter';

/**
 * Mock adapter that simulates LLM responses for development/testing
 * without requiring actual API keys.
 */
export class MockAdapter extends BaseAdapter {
    private providerName: string;

    constructor(providerName: 'openai' | 'anthropic') {
        super(providerName);
        this.providerName = providerName;
    }

    protected async callAPI(request: LLMRequest): Promise<LLMRawResponse> {
        // Simulate API latency
        const delays: Record<string, number> = { openai: 800, anthropic: 600 };
        await this.sleep(delays[this.providerName] || 700);

        const emailText = request.email.body.toLowerCase() + ' ' + request.email.subject.toLowerCase();
        const analysis = this.analyzeEmail(emailText, request.email);

        return analysis;
    }

    private analyzeEmail(text: string, email: { subject: string; sender: string; body: string }): LLMRawResponse {
        const indicators: PhishingIndicator[] = [];
        let phishingScore = 0;

        // Check for urgency
        const urgencyTerms = ['urgent', 'immediately', 'act now', 'expire', 'suspended', 'verify your', 'confirm your', 'within 24 hours', 'account will be closed'];
        for (const term of urgencyTerms) {
            if (text.includes(term)) {
                phishingScore += 15;
                indicators.push({
                    type: 'urgency',
                    description: `Creates artificial urgency with "${term}"`,
                    severity: 'high',
                    evidence: term,
                });
            }
        }

        // Check sender
        const suspiciousDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com'];
        const spoofed = ['support', 'admin', 'security', 'helpdesk', 'noreply'];
        if (spoofed.some(s => email.sender.toLowerCase().includes(s)) && suspiciousDomains.some(d => email.sender.includes(d))) {
            phishingScore += 25;
            indicators.push({
                type: 'sender',
                description: 'Sender claims to be official support but uses a free email provider',
                severity: 'critical',
                evidence: email.sender,
            });
        }

        // Check for suspicious links
        const linkPatterns = ['click here', 'click below', 'click this link', 'http://', 'bit.ly', 'tinyurl'];
        for (const pattern of linkPatterns) {
            if (text.includes(pattern)) {
                phishingScore += 10;
                indicators.push({
                    type: 'link',
                    description: `Contains suspicious link pattern: "${pattern}"`,
                    severity: 'medium',
                    evidence: pattern,
                });
                break;
            }
        }

        // Check for credential requests
        const credentialTerms = ['password', 'login', 'credentials', 'ssn', 'social security', 'credit card', 'bank account', 'pin number'];
        for (const term of credentialTerms) {
            if (text.includes(term)) {
                phishingScore += 20;
                indicators.push({
                    type: 'language',
                    description: `Requests sensitive information (${term})`,
                    severity: 'high',
                    evidence: term,
                });
                break;
            }
        }

        // Check for impersonation
        const brands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'netflix', 'facebook', 'bank of', 'wells fargo', 'chase'];
        for (const brand of brands) {
            if (text.includes(brand) && !email.sender.toLowerCase().includes(brand.replace(' ', ''))) {
                phishingScore += 15;
                indicators.push({
                    type: 'impersonation',
                    description: `Mentions ${brand} but sender email doesn't match`,
                    severity: 'high',
                    evidence: `Email mentions "${brand}" but sent from ${email.sender}`,
                });
                break;
            }
        }

        // Check for threats
        const threatTerms = ['legal action', 'law enforcement', 'arrest', 'fine', 'penalty', 'prosecute'];
        for (const term of threatTerms) {
            if (text.includes(term)) {
                phishingScore += 10;
                indicators.push({
                    type: 'language',
                    description: `Uses threatening language: "${term}"`,
                    severity: 'medium',
                    evidence: term,
                });
                break;
            }
        }

        // Vary confidence and classification by provider
        const providerVariance: Record<string, number> = { openai: 0, anthropic: 3 };
        phishingScore += providerVariance[this.providerName] || 0;

        let classification: Classification;
        let confidence: number;

        if (phishingScore >= 40) {
            classification = 'phishing';
            confidence = Math.min(0.95, 0.7 + (phishingScore - 40) / 100);
        } else if (phishingScore >= 20) {
            classification = 'suspicious';
            confidence = 0.5 + phishingScore / 100;
        } else {
            classification = 'legitimate';
            confidence = Math.min(0.95, 0.7 + (40 - phishingScore) / 100);
        }

        // Add some provider-specific variance
        confidence = Math.min(0.98, Math.max(0.3, confidence + (Math.random() * 0.1 - 0.05)));

        const explanation = this.generateExplanation(classification, indicators, email);

        return {
            classification,
            confidence: parseFloat(confidence.toFixed(2)),
            explanation,
            indicators,
            rawResponse: JSON.stringify({ classification, confidence, indicators }),
        };
    }

    private generateExplanation(classification: Classification, indicators: PhishingIndicator[], email: { subject: string; sender: string; body: string }): string {
        if (classification === 'phishing') {
            const reasons = indicators.map(i => `• ${i.description}`).join('\n');
            return `This email shows strong indicators of a phishing attempt.\n\n**Key Findings:**\n${reasons}\n\n**Recommendation:** Do not click any links or provide any personal information. Report this email to your IT security team and delete it.`;
        }

        if (classification === 'suspicious') {
            const reasons = indicators.map(i => `• ${i.description}`).join('\n');
            return `This email contains some elements that warrant caution, though it may not be a definitive phishing attempt.\n\n**Concerning Elements:**\n${reasons}\n\n**Recommendation:** Exercise caution. Verify the sender through official channels before taking any action requested in this email.`;
        }

        return `This email appears to be legitimate. No significant phishing indicators were detected.\n\n**Analysis:** The sender, content, and any links present appear consistent with legitimate communications. However, always exercise caution with unexpected emails requesting action.`;
    }
}
