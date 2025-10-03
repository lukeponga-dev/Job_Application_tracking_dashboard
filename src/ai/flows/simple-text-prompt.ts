
'use server';

/**
 * @fileOverview A simple text prompt AI agent.
 *
 * - simpleTextPrompt - A function that takes a string prompt and returns the model's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export async function simpleTextPrompt(prompt: string): Promise<string> {
    return simpleTextPromptFlow(prompt);
}

const simpleTextPromptFlow = ai.defineFlow(
  {
    name: 'simpleTextPromptFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: prompt,
    });

    return llmResponse.text;
  }
);

