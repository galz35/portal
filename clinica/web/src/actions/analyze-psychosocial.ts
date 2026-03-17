'use server';

import { analisisPsicosocialFlow } from '@/ai/flows/analisis-psicosocial';

export async function analyzePsychosocial(data: any) {
    try {
        const result = await analisisPsicosocialFlow(data);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error analyzing psychosocial data:', error);
        return { success: false, error: error.message };
    }
}
