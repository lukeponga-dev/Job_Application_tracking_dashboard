import { config } from 'dotenv';
config();

import '@/ai/flows/data-visualization-suggestions.ts';
import '@/ai/flows/tailor-cv.ts';
import { simpleTextPrompt } from '@/ai/flows/simple-text-prompt';
import { runFlow } from 'genkit/flow';

async function runSimplePrompt() {
  const prompt = "Explain how AI works in a few words";
  console.log(`Running prompt: "${prompt}"`);

  try {
    const result = await runFlow(simpleTextPrompt, prompt);
    console.log('LLM Response:');
    console.log(result);
  } catch (error) {
    console.error("Error running flow:", error);
  }
}

// To prevent the script from running immediately when imported elsewhere,
// we can check if it's the main module being run.
if (require.main === module) {
  runSimplePrompt();
}
