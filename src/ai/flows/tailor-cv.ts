'use server';

/**
 * @fileOverview An AI agent for tailoring a CV to a specific job description.
 *
 * - tailorCv - A function that takes a CV and a job description and returns a tailored CV.
 * - TailorCvInput - The input type for the tailorCv function.
 * - TailorCvOutput - The return type for the tailorCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorCvInputSchema = z.object({
  jobDescription: z.string().describe('The job description to tailor the CV for.'),
  currentCv: z.string().describe('The current CV of the user.'),
});
export type TailorCvInput = z.infer<typeof TailorCvInputSchema>;

const TailorCvOutputSchema = z.object({
  tailoredCv: z.string().describe('The tailored CV.'),
});
export type TailorCvOutput = z.infer<typeof TailorCvOutputSchema>;

export async function tailorCv(
  input: TailorCvInput
): Promise<TailorCvOutput> {
  return tailorCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailorCvPrompt',
  input: {schema: TailorCvInputSchema},
  output: {schema: TailorCvOutputSchema},
  prompt: `You are an expert career coach and resume writer. Your task is to tailor the user's current CV to a specific job description.

Analyze the job description to identify the key skills, experiences, and qualifications the employer is looking for.

Then, review the user's current CV and rewrite it to highlight the most relevant aspects that match the job description. Rephrase bullet points, adjust the summary, and reorder sections if necessary to make the CV as compelling as possible for this specific role.

The output should be the full text of the newly tailored CV.

Job Description:
{{{jobDescription}}}

Current CV:
{{{currentCv}}}
  `,
});

const tailorCvFlow = ai.defineFlow(
  {
    name: 'tailorCvFlow',
    inputSchema: TailorCvInputSchema,
    outputSchema: TailorCvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
