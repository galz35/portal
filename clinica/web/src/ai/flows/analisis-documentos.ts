import { ai } from '../genkit';
import { z } from 'zod';

const DocumentAnalysisSchema = z.object({
    tipo_documento: z.enum(['RECETA', 'EXAMEN', 'INFORME', 'FACTURA', 'OTRO']).describe('El tipo de documento médico'),
    fecha: z.string().optional().describe('Fecha del documento en formato YYYY-MM-DD'),
    paciente: z.string().optional().describe('Nombre del paciente si aparece'),
    medico: z.string().optional().describe('Nombre del médico si aparece'),
    resumen: z.string().describe('Un breve resumen del contenido del documento'),
    datos_clave: z.record(z.string(), z.any()).describe('Pares clave-valor con información relevante extraída (ej. medicamentos, diagnósticos, valores de laboratorio)'),
    nivel_confianza: z.number().min(0).max(1).describe('Nivel de confianza en la extracción (0-1)'),
});

export const analisisDocumentosFlow = ai.defineFlow(
    {
        name: 'analisisDocumentos',
        inputSchema: z.object({
            fileBase64: z.string().describe('Contenido del archivo en base64'),
            mimeType: z.string().describe('Tipo MIME del archivo (ej. image/jpeg, application/pdf)'),
        }),
        outputSchema: DocumentAnalysisSchema,
    },
    async ({ fileBase64, mimeType }) => {
        const prompt = `Analiza este documento médico y extrae la información clave en formato JSON estructurado.
    Identifica el tipo de documento, fechas, nombres y crea un resumen.
    Extrae cualquier dato relevante específico del tipo de documento (ej. lista de medicamentos en una receta, resultados en un examen).`;

        // Construct the media part correctly for Genkit/Gemini
        // Note: The exact format for inline media depends on the Genkit version/adapter.
        // Assuming standard Part format: { media: { url: ..., contentType: ... } } or inline data.
        // For base64, we usually use a data URI or specific object structure.

        // Using the 'media' helper if available or constructing the part manually.
        // Since we don't have the full docs here, we'll try the standard content format.

        const { output } = await ai.generate({
            prompt: [
                { text: prompt },
                { media: { url: `data:${mimeType};base64,${fileBase64}` } }
            ],
            output: { schema: DocumentAnalysisSchema },
        });

        if (!output) {
            throw new Error('No se pudo generar el análisis del documento.');
        }

        return output;
    }
);
