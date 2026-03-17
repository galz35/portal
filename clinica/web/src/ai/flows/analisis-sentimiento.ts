'use server';
/**
 * @fileOverview Flujo de Genkit para analizar el sentimiento de un texto.
 *
 * - analizarSentimiento: Analiza un texto y devuelve si el sentimiento es Positivo, Negativo o Neutro.
 * - AnalisisSentimientoInputSchema: El esquema de entrada.
 * - AnalisisSentimientoOutputSchema: El esquema de salida.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AnalisisSentimientoInputSchema = z.object({
  texto: z.string().describe("El texto del usuario a ser analizado."),
});
export type AnalisisSentimientoInput = z.infer<typeof AnalisisSentimientoInputSchema>;

export const AnalisisSentimientoOutputSchema = z.object({
  sentimiento: z.enum(["Positivo", "Negativo", "Neutro"]).describe("El sentimiento clasificado del texto."),
});
export type AnalisisSentimientoOutput = z.infer<typeof AnalisisSentimientoOutputSchema>;


const analisisSentimientoPrompt = ai.definePrompt({
    name: 'analisisSentimientoPrompt',
    input: { schema: AnalisisSentimientoInputSchema },
    output: { schema: AnalisisSentimientoOutputSchema },
    system: "Eres un experto en análisis de sentimientos. Tu única tarea es clasificar el siguiente texto como 'Positivo', 'Negativo' o 'Neutro'. Sé conciso y responde solo con la clasificación.",
    prompt: `Texto a analizar: {{{texto}}}`,
});

const analisisSentimientoFlow = ai.defineFlow(
    {
        name: 'analisisSentimientoFlow',
        inputSchema: AnalisisSentimientoInputSchema,
        outputSchema: AnalisisSentimientoOutputSchema,
    },
    async (input) => {
        const { output } = await analisisSentimientoPrompt(input);
        return output!;
    }
);

export async function analizarSentimiento(input: AnalisisSentimientoInput): Promise<AnalisisSentimientoOutput> {
    return analisisSentimientoFlow(input);
}
