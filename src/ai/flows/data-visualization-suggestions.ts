'use server';

/**
 * @fileOverview A data visualization suggestion AI agent.
 *
 * - getDataVisualizationSuggestions - A function that suggests charts and graphs based on job application data.
 * - DataVisualizationSuggestionsInput - The input type for the getDataVisualizationSuggestions function.
 * - DataVisualizationSuggestionsOutput - The return type for the getDataVisualizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataVisualizationSuggestionsInputSchema = z.object({
  jobApplicationData: z.string().describe('The job application data in JSON format.'),
});
export type DataVisualizationSuggestionsInput = z.infer<
  typeof DataVisualizationSuggestionsInputSchema
>;

const DataVisualizationSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of suggestions for charts and graphs based on the job application data.'
    ),
});
export type DataVisualizationSuggestionsOutput = z.infer<
  typeof DataVisualizationSuggestionsOutputSchema
>;

export async function getDataVisualizationSuggestions(
  input: DataVisualizationSuggestionsInput
): Promise<DataVisualizationSuggestionsOutput> {
  return dataVisualizationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataVisualizationSuggestionsPrompt',
  input: {schema: DataVisualizationSuggestionsInputSchema},
  output: {schema: DataVisualizationSuggestionsOutputSchema},
  prompt: `You are an expert data visualization specialist.

  Based on the following job application data, suggest charts and graphs that would be helpful for the user to gain insights into their application progress and identify areas for improvement.

  Data: {{{jobApplicationData}}}

  Please provide your suggestions as a list of strings.
  `,
});

const dataVisualizationSuggestionsFlow = ai.defineFlow(
  {
    name: 'dataVisualizationSuggestionsFlow',
    inputSchema: DataVisualizationSuggestionsInputSchema,
    outputSchema: DataVisualizationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
