import { defineFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/core';
import { gemini15Flash } from '@genkit-ai/google-genai';
import * as z from 'zod';

export const simpleTextPromptFlow = defineFlow(
  {
    name: 'simpleTextPrompt',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
    });

    return llmResponse.text();
  }
);
