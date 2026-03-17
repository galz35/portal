import { ai } from '../genkit';
import { z } from 'zod';

const PsychosocialAnalysisSchema = z.object({
    analisis: z.string().describe('Análisis detallado del estado emocional y psicosocial del paciente basado en sus respuestas'),
    recomendaciones: z.array(z.string()).describe('Lista de 3-5 recomendaciones prácticas y personalizadas para mejorar su bienestar'),
    nivelRiesgo: z.enum(['Bajo', 'Medio', 'Alto']).describe('Evaluación del nivel de riesgo psicosocial'),
    mensajePaciente: z.string().describe('Un mensaje empático y de apoyo dirigido directamente al paciente'),
});

export const analisisPsicosocialFlow = ai.defineFlow(
    {
        name: 'analisisPsicosocial',
        inputSchema: z.object({
            nivelEstres: z.string(),
            estadoAnimo: z.string(),
            calidadSueno: z.string(),
            consumoAgua: z.string(),
            modalidadTrabajo: z.string(),
            comentarioGeneral: z.string().optional(),
        }),
        outputSchema: PsychosocialAnalysisSchema,
    },
    async (input) => {
        const prompt = `Actúa como un psicólogo clínico empático y profesional. Analiza el siguiente reporte de auto-chequeo de un paciente:
    
    - Nivel de Estrés: ${input.nivelEstres}
    - Estado de Ánimo: ${input.estadoAnimo}
    - Calidad del Sueño: ${input.calidadSueno}
    - Consumo de Agua: ${input.consumoAgua}
    - Modalidad de Trabajo: ${input.modalidadTrabajo}
    - Comentario Adicional: ${input.comentarioGeneral || 'Ninguno'}

    Proporciona un análisis, recomendaciones prácticas, evalúa el nivel de riesgo y escribe un mensaje cálido para el paciente.`;

        const { output } = await ai.generate({
            prompt: prompt,
            output: { schema: PsychosocialAnalysisSchema },
        });

        if (!output) {
            throw new Error('No se pudo generar el análisis psicosocial.');
        }

        return output;
    }
);
