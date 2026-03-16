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
    .optional()
    .describe('The content of the worksheet for which to generate an answer key.'),
  bookContext: z
    .string()
    .describe('The relevant context from the book to use for generating the answer key.'),
  prompt: z
    .string()
    .optional()
    .describe('Custom instructions or specific questions to answer.'),
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
  prompt: `You are an expert teacher. Your task is to generate an answer key using the provided book context.

---
INSTRUCTION PROMPT:
{{{prompt}}}
---

If specific questions are listed in the INSTRUCTION PROMPT above, you MUST generate answers for EXACTLY those questions and NOTHING ELSE.

If NO specific questions are listed, use the Worksheet Content below:
Worksheet Content: {{{worksheetContent}}}

Book Context:
{{{bookContext}}}

Answer Key:`, 
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
