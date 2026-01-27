'use server';

/**
 * @fileOverview A worksheet generation AI agent.
 *
 * - generateWorksheet - A function that handles the worksheet generation process.
 * - GenerateWorksheetInput - The input type for the generateWorksheet function.
 * - GenerateWorksheetOutput - The return type for the generateWorksheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWorksheetInputSchema = z.object({
  topic: z.string().describe('The topic or chapter name for which to generate the worksheet.'),
});
const GenerateWorksheetOutputSchema = z.object({
  worksheet: z.string().describe('The generated worksheet content, including MCQs and fill-in-the-blanks.'),
});

export async function generateWorksheet(input) {
  return generateWorksheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorksheetPrompt',
  input: { schema: GenerateWorksheetInputSchema },
  output: { schema: GenerateWorksheetOutputSchema },
  prompt: `You are an expert teacher specializing in generating worksheets. Generate a worksheet for the topic: {{{topic}}}. Include a variety of question types, such as MCQs and fill-in-the-blanks.`,
});

const generateWorksheetFlow = ai.defineFlow(
  {
    name: 'generateWorksheetFlow',
    inputSchema: GenerateWorksheetInputSchema,
    outputSchema: GenerateWorksheetOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output;
  }
);
