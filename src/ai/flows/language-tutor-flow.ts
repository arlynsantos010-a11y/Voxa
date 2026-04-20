'use server';
/**
 * @fileOverview Flujo de IA para tutoría de idiomas personalizada.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LanguageTutorInputSchema = z.object({
  message: z.string().describe('El mensaje enviado por el estudiante.'),
  language: z.string().describe('El idioma que el estudiante está aprendiendo.'),
  level: z.string().describe('El nivel actual del estudiante (A1, B2, etc.).'),
});

const LanguageTutorOutputSchema = z.object({
  response: z.string().describe('La respuesta del tutor en el idioma objetivo.'),
  translation: z.string().describe('La traducción de la respuesta al español.'),
  correction: z.string().optional().describe('Sugerencias gramaticales si el estudiante cometió errores.'),
  tips: z.string().optional().describe('Consejos culturales o de vocabulario.'),
});

export async function chatWithTutor(input: z.infer<typeof LanguageTutorInputSchema>) {
  return languageTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'languageTutorPrompt',
  input: { schema: LanguageTutorInputSchema },
  output: { schema: LanguageTutorOutputSchema },
  prompt: `Eres un tutor de idiomas experto y amigable. Tu objetivo es ayudar al estudiante a practicar el idioma {{{language}}}.
El nivel del estudiante es {{{level}}}.

Responde al siguiente mensaje de forma que fomentes la conversación:
"{{{message}}}"

Asegúrate de:
1. Responder principalmente en {{{language}}}.
2. Proporcionar una traducción clara.
3. Si el mensaje del estudiante tiene errores gramaticales en {{{language}}}, corrígelos amablemente.
4. Mantener un tono motivador.`,
});

const languageTutorFlow = ai.defineFlow(
  {
    name: 'languageTutorFlow',
    inputSchema: LanguageTutorInputSchema,
    outputSchema: LanguageTutorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('No se pudo generar respuesta del tutor.');
    return output;
  }
);
