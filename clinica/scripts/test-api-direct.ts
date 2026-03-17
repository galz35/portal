import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

if (!API_KEY) {
    console.error('Error: GOOGLE_GENAI_API_KEY not found in .env.local');
    process.exit(1);
}

async function testApi() {
    console.log(`API Key length: ${API_KEY.length}`);
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];

    for (const model of models) {
        console.log(`Testing Gemini API (${model})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
            });

            if (!response.ok) {
                console.log(`Failed for ${model}: ${response.status}`);
                const errorText = await response.text();
                console.log('Error Body:', errorText);
                continue;
            }

            const data = await response.json();
            console.log(`SUCCESS with ${model}!`);
            console.log('Output:', data.candidates?.[0]?.content?.parts?.[0]?.text);
            return; // Exit on first success
        } catch (error: any) {
            console.error(`Error with ${model}:`, error.message);
        }
    }
    console.error('All models failed.');
    process.exit(1);
}

testApi();
