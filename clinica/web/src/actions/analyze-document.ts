'use server';

import { analisisDocumentosFlow } from '@/ai/flows/analisis-documentos';

export async function analyzeDocument(fileBase64: string, mimeType: string) {
    try {
        const result = await analisisDocumentosFlow({ fileBase64, mimeType });
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error analyzing document:', error);
        return { success: false, error: error.message };
    }
}
