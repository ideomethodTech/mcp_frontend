'use server';
/**
 * @fileOverview Generates PowerPoint presentations from book chapters.
 *
 * - generatePpt - A function that handles the PPT generation process.
 * - GeneratePptInput - The input type for the generatePpt function.
 * - GeneratePptOutput - The return type for the generatePpt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePptInputSchema = z.object({
  chapterText: z
    .string()
    .describe('The text content of the book chapter to generate a PPT from.'),
  topic: z.string().describe('The main topic of the chapter.'),
});
export type GeneratePptInput = z.infer<typeof GeneratePptInputSchema>;

const GeneratePptOutputSchema = z.object({
  presentation: z
    .string()
    .describe(
      'A PowerPoint presentation in .pptx format (base64 encoded) generated from the chapter text.'
    ),
});
export type GeneratePptOutput = z.infer<typeof GeneratePptOutputSchema>;

export async function generatePpt(input: GeneratePptInput): Promise<GeneratePptOutput> {
  return generatePptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePptPrompt',
  input: {schema: GeneratePptInputSchema},
  output: {schema: GeneratePptOutputSchema},
  prompt: `You are an expert presentation creator.

You will receive the text from a book chapter, and your job is to turn it into a PowerPoint presentation.

The presentation should be returned as a base64 encoded .pptx file. Do your best to extract the core concepts of the chapter.

Topic: {{{topic}}}
Chapter Text: {{{chapterText}}}`,
});

const generatePptFlow = ai.defineFlow(
  {
    name: 'generatePptFlow',
    inputSchema: GeneratePptInputSchema,
    outputSchema: GeneratePptOutputSchema,
  },
  async input => {
    // In a real implementation, this would involve calling a service or library
    // to generate a .pptx file and then base64 encoding it.
    // For this example, we'll just return a placeholder.
    const {output} = await prompt(input);
    return output!;
  }
);
