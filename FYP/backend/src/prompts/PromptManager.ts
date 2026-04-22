import { PromptStrategy } from '../models/types';

interface PromptContext {
    subject: string;
    sender: string;
    body: string;
    examples?: Array<{ email: string; classification: string; explanation: string }>;
}

export class PromptManager {
    /**
     * Generate a prompt based on strategy
     */
    static generate(strategy: PromptStrategy, context: PromptContext): string {
        switch (strategy) {
            case 'zero-shot':
                return this.zeroShot(context);
            case 'few-shot':
                return this.fewShot(context);
            case 'chain-of-thought':
                return this.chainOfThought(context);
            case 'structured-json':
                return this.structuredJson(context);
            default:
                return this.zeroShot(context);
        }
    }

    /** Baseline zero-shot classification */
    private static zeroShot(ctx: PromptContext): string {
        return `You are a cybersecurity expert specialized in phishing email detection. Analyze the following email and determine whether it is a phishing attempt or a legitimate email.

**Email Details:**
- Subject: ${ctx.subject}
- Sender: ${ctx.sender}
- Body:
${ctx.body}

**Instructions:**
1. Classify this email as "phishing", "legitimate", or "suspicious"
2. Provide a confidence score between 0 and 1
3. Explain your reasoning in plain, non-technical language that anyone can understand
4. List any specific indicators you found (e.g., suspicious sender, urgency tactics, credential requests, suspicious links)

Please provide a clear, helpful explanation that would help a non-technical user understand why this email is or isn't dangerous.`;
    }

    /** Few-shot with examples */
    private static fewShot(ctx: PromptContext): string {
        const examples = ctx.examples || this.getDefaultExamples();
        const exampleText = examples.map((ex, i) =>
            `Example ${i + 1}:\nEmail: ${ex.email}\nClassification: ${ex.classification}\nReasoning: ${ex.explanation}`
        ).join('\n\n');

        return `You are a cybersecurity expert. Here are some examples of email classifications:

${exampleText}

Now analyze this email:
- Subject: ${ctx.subject}
- Sender: ${ctx.sender}
- Body:
${ctx.body}

Based on the patterns shown in the examples, classify this email as "phishing", "legitimate", or "suspicious". Provide a confidence score (0-1) and explain your reasoning clearly for a non-technical audience.`;
    }

    /** Chain-of-thought step-by-step reasoning */
    private static chainOfThought(ctx: PromptContext): string {
        return `You are a cybersecurity expert. Analyze this email step by step for phishing indicators.

**Email to analyze:**
- Subject: ${ctx.subject}
- Sender: ${ctx.sender}
- Body:
${ctx.body}

**Please follow these steps carefully:**

Step 1 - SENDER ANALYSIS: Examine the sender's email address. Is the domain legitimate? Does it match who they claim to be? Look for typosquatting or use of free email providers for official communications.

Step 2 - LANGUAGE ANALYSIS: Check for urgency, threats, unusual grammar, emotional manipulation, or generic greetings that suggest a mass-sent email.

Step 3 - LINK & ATTACHMENT ANALYSIS: Are there any links or attachments? Do URLs match the claimed sender's organization? Are there URL shorteners or suspicious domains?

Step 4 - CONTEXT ANALYSIS: Is the request reasonable? Would this organization normally contact someone this way? Is sensitive information being requested?

Step 5 - FINAL ASSESSMENT: Based on all the above steps, provide your classification ("phishing", "legitimate", or "suspicious"), a confidence score (0-1), and a plain-language summary that explains your findings to a non-technical user.`;
    }

    /** Structured JSON output */
    private static structuredJson(ctx: PromptContext): string {
        return `You are a cybersecurity expert. Analyze this email for phishing indicators and respond ONLY with a valid JSON object.

**Email:**
- Subject: ${ctx.subject}
- Sender: ${ctx.sender}
- Body:
${ctx.body}

**Respond with this exact JSON structure:**
{
  "classification": "phishing" | "legitimate" | "suspicious",
  "confidence": <number between 0 and 1>,
  "explanation": "<plain-language explanation for non-technical users>",
  "indicators": [
    {
      "type": "sender" | "link" | "language" | "urgency" | "impersonation" | "attachment" | "header",
      "description": "<what was found>",
      "severity": "low" | "medium" | "high" | "critical",
      "evidence": "<specific text or element that triggered this>"
    }
  ],
  "recommendation": "<what the user should do>"
}`;
    }

    private static getDefaultExamples() {
        return [
            {
                email: 'Subject: Your PayPal account has been limited\nFrom: security@paypa1-support.com\nDear Customer, We noticed unusual activity on your account. Click here to verify your identity immediately or your account will be permanently suspended within 24 hours.',
                classification: 'phishing',
                explanation: 'The sender domain "paypa1-support.com" uses the number 1 instead of the letter l to mimic PayPal. It creates urgency with "24 hours" and "permanently suspended". It asks you to click a link to "verify identity" which is a credential harvesting tactic.',
            },
            {
                email: 'Subject: Team standup moved to 3PM\nFrom: sarah.jones@company.com\nHi team, Just a heads up that tomorrow\'s standup is moved to 3PM due to the client call in the morning. Same Zoom link as usual. Thanks, Sarah',
                classification: 'legitimate',
                explanation: 'This is a routine internal communication about a meeting schedule change. The sender uses a company domain, the tone is casual and appropriate for a workplace, and there are no requests for sensitive information or suspicious links.',
            },
            {
                email: 'Subject: Invoice #INV-2024-3847 attached\nFrom: accounting@supplier-co.com\nPlease find attached the invoice for last month\'s services. Amount due: $4,250.00. Payment terms: Net 30. Let me know if you have questions.',
                classification: 'suspicious',
                explanation: 'While this could be legitimate, invoice emails are commonly used in phishing. Without being able to verify the attachment or confirm this is an expected invoice from a known supplier, caution is warranted. The email itself doesn\'t have strong phishing indicators, but the context requires verification.',
            },
        ];
    }
}
