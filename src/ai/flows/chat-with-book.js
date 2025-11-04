'use server';

/**
 * @fileOverview Chat with Book AI agent.
 *
 * - chatWithBook - A function that handles chatting with a book.
 * - ChatWithBookInput - The input type for the chatWithBook function.
 * - ChatWithBookOutput - The return type for the chatWithBook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithBookInputSchema = z.object({
  question: z.string().describe('The user question.'),
  bookContent: z.string().describe('The content of the book to chat with.'),
});

export type ChatWithBookInput = z.infer<typeof ChatWithBookInputSchema>;

const ChatWithBookOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question based on the book content.'),
});

export type ChatWithBookOutput = z.infer<typeof ChatWithBookOutputSchema>;

export async function chatWithBook(input: ChatWithBookInput): Promise<ChatWithBookOutput> {
  return chatWithBookFlow(input);
}

const chatWithBookPrompt = ai.definePrompt({
  name: 'chatWithBookPrompt',
  input: {schema: ChatWithBookInputSchema},
  output: {schema: ChatWithBookOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions based on the provided book content.  Use the book content to answer the question.  If the answer is not in the book content, respond that you cannot answer the question with the provided book content.

Book Content:
{{bookContent}}

Question: {{question}}

Answer: `,
});

const chatWithBookFlow = ai.defineFlow(
  {
    name: 'chatWithBookFlow',
    inputSchema: ChatWithBookInputSchema,
    outputSchema: ChatWithBookOutputSchema,
  },
  async input => {
    const {output} = await chatWithBookPrompt(input);
    return output!;
  }
);
