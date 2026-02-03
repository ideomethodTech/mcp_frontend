'use server';

/**
 * @fileOverview AI agent that generates answer keys for worksheets.
 *
 * - generateAnswerKey - A function that generates answer keys for worksheets.
 * - GenerateAnswerKeyInput - The input type for the generateAnswerKey function.
 * - GenerateAnswerKeyOutput - The return type for the generateAnswerKey function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAnswerKeyInputSchema = z.object({
  worksheetContent: z
    .string()
    .describe('The content of the worksheet for which to generate an answer key.'),
  bookContext: z
    .string()
    .describe('The relevant context from the book to use for generating the answer key.'),
});
const GenerateAnswerKeyOutputSchema = z.object({
  answerKey: z.string().describe('The generated answer key for the worksheet.'),
});

export async function generateAnswerKey(input) {
  return generateAnswerKeyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerKeyPrompt',
  input: { schema: GenerateAnswerKeyInputSchema },
  output: { schema: GenerateAnswerKeyOutputSchema },
  prompt: `You are an expert teacher and your task is to generate an answer key for a given worksheet using the context from the book.

Worksheet Content: {{{worksheetContent}}}

Book Context: {{{bookContext}}}

Answer Key:`, // The answer key is generated here using the worksheet content and book context.
});

const generateAnswerKeyFlow = ai.defineFlow(
  {
    name: 'generateAnswerKeyFlow',
    inputSchema: GenerateAnswerKeyInputSchema,
    outputSchema: GenerateAnswerKeyOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output;
  }
);
