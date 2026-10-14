/**
 * What a visit costs, in money: the voice, the model behind it, and Jev.
 *
 * Each code keeps two running totals (see access.ts): the seconds of voice it
 * has used, which the budget already counts, and `apiMicros`, the token-priced
 * calls made for it in millionths of a dollar. The cost written to its Notion
 * row is the two together.
 *
 * Prices as of 14 Oct 2026. Check them against the billing pages now and then:
 * a wrong price here makes every row in the table wrong in the same direction.
 */

/** GPT-Live, billed per second while connected. OpenAI's model page. */
const VOICE_PER_MINUTE = 0.05;

/**
 * gpt-5.6-terra, per million tokens, billed on top of the voice. Two price
 * trackers disagree ($2.00/$12.00 and $2.50/$15.00); this is the higher, so
 * the table errs towards too much rather than too little.
 */
const BACKEND = { input: 2.5, cached: 0.25, output: 15 };

/** Jev, per million input tokens. Output is counted but not billed. */
const JEV_INPUT = 0.042;

export type ResponsesUsage = {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { cached_tokens?: number };
};

const micros = (dollars: number) => Math.round(dollars * 1e6);

export function voiceMicros(seconds: number): number {
  return micros((seconds / 60) * VOICE_PER_MINUTE);
}

/** One call to the backend model, from the usage the Responses API reports. */
export function backendMicros(usage: ResponsesUsage | undefined): number {
  if (!usage) return 0;
  const cached = usage.input_tokens_details?.cached_tokens ?? 0;
  const fresh = Math.max(0, (usage.input_tokens ?? 0) - cached);
  return micros((fresh * BACKEND.input + cached * BACKEND.cached + (usage.output_tokens ?? 0) * BACKEND.output) / 1e6);
}

export function jevMicros(inputTokens: number): number {
  return micros((inputTokens * JEV_INPUT) / 1e6);
}
