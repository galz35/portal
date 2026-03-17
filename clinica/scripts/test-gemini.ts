import { ai } from '../src/ai/genkit';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Testing Gemini API connection...');
    try {
        const { text } = await ai.generate({
            prompt: 'Hello, are you working? Reply with "Yes, I am working!"',
        });
        console.log('Response from Gemini:', text);
    } catch (error: any) {
        console.error('Error connecting to Gemini:', error);
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

main();
