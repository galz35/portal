'use server';
/**
 * @fileOverview Flujo de Genkit para realizar un triaje médico automático.
 *
 * - analisisTriajeMedico: Analiza los síntomas de un paciente y devuelve una clasificación de urgencia.
 * - AnalisisTriajeInputSchema: El esquema de entrada para el flujo.
 * - AnalisisTriajeOutputSchema: El esquema de salida del flujo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AnalisisTriajeInputSchema = z.object({
  sintomas: z.string().describe("El texto con los síntomas del paciente y, si los hay, signos vitales."),
});
export type AnalisisTriajeInput = z.infer<typeof AnalisisTriajeInputSchema>;

export const AnalisisTriajeOutputSchema = z.object({
  nivel_urgencia: z.enum(["Baja", "Moderada", "Alta", "Emergencia"]).describe("El nivel de urgencia clasificado."),
  especialidad_sugerida: z.string().describe("La especialidad médica más adecuada, ej: Cardiología, Medicina General."),
  resumen_medico: z.string().describe("Un resumen de 1 línea de los síntomas clave para el doctor."),
  accion_recomendada: z.string().describe("La acción inmediata sugerida, ej: 'Agendar cita semana próxima', 'Enviar a urgencias ahora'."),
});
export type AnalisisTriajeOutput = z.infer<typeof AnalisisTriajeOutputSchema>;


const analisisTriajePrompt = ai.definePrompt({
    name: 'analisisTriajePrompt',
    input: { schema: AnalisisTriajeInputSchema },
    output: { schema: AnalisisTriajeOutputSchema },
    system: "Eres un asistente médico de triaje. Analiza los síntomas con cautela. Si hay riesgo vital (dolor de pecho, dificultad para respirar, pérdida de conciencia, sangrado incontrolable), marca urgencia como Emergencia. No diagnostiques, solo clasifica la urgencia y sugiere una especialidad.",
    prompt: `Analiza los siguientes síntomas de un paciente y devuelve la clasificación de triaje.

Síntomas: {{{sintomas}}}
`,
});

const analisisTriajeMedicoFlow = ai.defineFlow(
    {
        name: 'analisisTriajeMedicoFlow',
        inputSchema: AnalisisTriajeInputSchema,
        outputSchema: AnalisisTriajeOutputSchema,
    },
    async (input) => {
        const { output } = await analisisTriajePrompt(input);
        return output!;
    }
);

export async function analisisTriajeMedico(input: AnalisisTriajeInput): Promise<AnalisisTriajeOutput> {
    return analisisTriajeMedicoFlow(input);
}
