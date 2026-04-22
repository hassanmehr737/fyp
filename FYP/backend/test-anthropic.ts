import dotenv from 'dotenv';
// import { config } from './src/config/env';

dotenv.config({ override: true });

async function testAnthropic() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-5-20251101';

    console.log('Testing Anthropic API...');
    console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
    console.log('Model:', model);

    if (!apiKey) {
        console.error('Error: ANTHROPIC_API_KEY is not set or is empty');
        return;
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 10,
                messages: [
                    { role: 'user', content: 'Hello' },
                ],
            }),
        });

        console.log('Response Status:', response.status);
        
        if (response.ok) {
            const data = await response.json() as any;
            console.log('SUCCESS! Model found and responded.');
            console.log('Response:', JSON.stringify(data.content, null, 2));
        } else {
            const errorBody = await response.text();
            console.error('Error Body:', errorBody);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testAnthropic();
