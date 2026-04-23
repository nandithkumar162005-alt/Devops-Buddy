// lib/gemini.js — Google Gemini AI Reflexive Learning Loop
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Support both naming conventions from .env
const MIN_ITERATIONS = parseInt(
  process.env.MIN_AI_ITERATIONS || process.env.AI_MIN_ITERATIONS || 2
);
const MAX_ITERATIONS = parseInt(
  process.env.MAX_AI_ITERATIONS || process.env.AI_MAX_ITERATIONS || 5
);
const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.AI_CONFIDENCE_THRESHOLD || 0.9
);

/**
 * Parse Gemini response text into structured output.
 * Extracts JSON from markdown code fences if present.
 */
function parseGeminiResponse(text) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr.trim());
  } catch {
    return {
      fixedContent: null,
      confidence: 0.5,
      rootCause: 'Could not parse Gemini response',
      fixMethod: text,
    };
  }
}

function buildAnalysisPrompt(errorLog, fileContent, filePath, hint = null) {
  return `You are an expert software engineer and DevOps specialist.
Your task is to analyze the following error log and the broken source file, then produce a complete corrected version of the file.

## Error Log
\`\`\`
${errorLog}
\`\`\`

## Broken File: ${filePath}
\`\`\`
${fileContent}
\`\`\`

${hint ? `## Previous Fix Attempt (use as a starting point)\n\`\`\`\n${hint}\n\`\`\`` : ''}

## Instructions
1. Identify the root cause of the error.
2. Produce the COMPLETE corrected file content (not just a diff — the full file).
3. Rate your confidence in this fix from 0.0 to 1.0.
4. Describe the fix method in plain English.

## Required JSON Response Format
\`\`\`json
{
  "rootCause": "Brief explanation of why this error occurs",
  "fixMethod": "Step-by-step description of what was changed and why",
  "fixedContent": "FULL corrected file content here as a string",
  "confidence": 0.85
}
\`\`\`

CRITICAL: Return ONLY valid JSON in a \`\`\`json code block. The fixedContent must be the entire corrected file.`;
}

function buildReflectionPrompt(errorLog, originalFile, previousFix, iteration) {
  return `You are reviewing your own previous fix attempt (iteration ${iteration}) for a software bug.
Your goal: find any remaining issues, edge cases, or incomplete fixes and produce an IMPROVED version.

## Original Error Log
\`\`\`
${errorLog}
\`\`\`

## Original (Broken) File
\`\`\`
${originalFile}
\`\`\`

## Your Previous Fix (Iteration ${iteration})
\`\`\`
${previousFix}
\`\`\`

## Reflection Questions
- Is the fix complete? Does it handle all code paths?
- Are there any edge cases the fix misses?
- Could this fix break anything else in the file?
- Is the fix syntactically correct for the language used?

## Required JSON Response Format
\`\`\`json
{
  "rootCause": "Updated root cause analysis if refined",
  "fixMethod": "What was improved in this iteration",
  "fixedContent": "COMPLETE improved file content",
  "confidence": 0.92,
  "improvements": ["List of specific improvements made in this iteration"]
}
\`\`\`

CRITICAL: Return ONLY valid JSON in a \`\`\`json code block. Always return the full file in fixedContent.`;
}

/**
 * Main Reflexive Fix Loop.
 * Runs min MIN_ITERATIONS up to MAX_ITERATIONS.
 * Stops early if confidence >= threshold AND min iterations done.
 */
async function reflexiveFixLoop(errorLog, fileContent, filePath, hint = null) {
  // Model fallback chain — tried in order, switches on quota/404 errors
  // Names confirmed available via /v1beta/models endpoint
  const MODEL_CHAIN = [
    process.env.GEMINI_MODEL,       // user override first
    'gemini-2.5-flash',             // latest, best quality
    'gemini-2.0-flash-lite',        // lighter quota limits
    'gemini-2.0-flash-001',         // stable 2.0 flash version
    'gemini-flash-latest',          // always-latest flash alias
    'gemini-pro-latest',            // pro fallback
  ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

  let modelIndex = 0;
  const getModel = () => genAI.getGenerativeModel({ model: MODEL_CHAIN[modelIndex] });

  let currentFix = null;
  let currentConfidence = 0;
  let rootCause = '';
  let fixMethod = '';
  let allImprovements = [];
  let iterations = 0;

  console.log(`[Gemini] Starting reflexive loop (min: ${MIN_ITERATIONS}, max: ${MAX_ITERATIONS})`);
  console.log(`[Gemini] Model chain: ${MODEL_CHAIN.join(' → ')}`);

  while (iterations < MAX_ITERATIONS) {
    if (modelIndex >= MODEL_CHAIN.length) {
      throw new Error(
        `All Gemini models exhausted. Check GEMINI_API_KEY quota at https://aistudio.google.com/app/apikey`
      );
    }

    iterations++;
    const currentModelName = MODEL_CHAIN[modelIndex];
    console.log(`[Gemini] Iteration ${iterations}/${MAX_ITERATIONS} using ${currentModelName}`);

    const prompt = iterations === 1
      ? buildAnalysisPrompt(errorLog, fileContent, filePath, hint)
      : buildReflectionPrompt(errorLog, fileContent, currentFix, iterations - 1);

    try {
      const result = await getModel().generateContent(prompt);
      const responseText = result.response.text();
      const parsed = parseGeminiResponse(responseText);

      currentFix = parsed.fixedContent || currentFix;
      currentConfidence = typeof parsed.confidence === 'number' ? parsed.confidence : currentConfidence;
      rootCause = parsed.rootCause || rootCause;
      fixMethod = parsed.fixMethod || fixMethod;
      if (parsed.improvements) allImprovements = allImprovements.concat(parsed.improvements);

      console.log(`[Gemini] Iteration ${iterations} confidence: ${currentConfidence}`);

      if (iterations >= MIN_ITERATIONS && currentConfidence >= CONFIDENCE_THRESHOLD) {
        console.log(`[Gemini] Threshold met at iteration ${iterations}. Stopping.`);
        break;
      }
    } catch (err) {
      const msg = err.message || '';

      if (msg.includes('429') || msg.includes('quota')) {
        // Rate limited — switch to next model
        console.log(`[Gemini] ${currentModelName} quota exceeded → switching to next model`);
        modelIndex++;
        iterations--; // Retry this iteration with the new model
        continue;
      }

      if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded')) {
        // Server temporarily unavailable — wait briefly then switch model
        console.log(`[Gemini] ${currentModelName} unavailable (503) → retrying with next model`);
        await new Promise(r => setTimeout(r, 2000));
        modelIndex++;
        iterations--;
        continue;
      }

      if (msg.includes('404') || msg.includes('not found') || msg.includes('not supported')) {
        // Model doesn't exist — try next
        console.log(`[Gemini] ${currentModelName} not available → switching to next model`);
        modelIndex++;
        iterations--;
        continue;
      }

      if (msg.includes('500') || msg.includes('Internal Server')) {
        // Internal Gemini error — try next model
        console.log(`[Gemini] ${currentModelName} internal error → switching to next model`);
        modelIndex++;
        iterations--;
        continue;
      }

      // Unknown error — log and break if min iterations done
      console.error(`[Gemini] Error in iteration ${iterations}:`, msg.slice(0, 150));
      if (iterations >= MIN_ITERATIONS) break;
    }
  }

  return {
    fixedContent: currentFix,
    confidence: currentConfidence,
    iterations,
    rootCause,
    fixMethod,
    improvements: allImprovements,
    modelUsed: MODEL_CHAIN[modelIndex] || MODEL_CHAIN[0],
  };
}

module.exports = { reflexiveFixLoop };
