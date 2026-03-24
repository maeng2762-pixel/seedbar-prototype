import { metricsService } from '../analytics/metricsService.js';

async function callOpenAI(model, system, user, maxTokens = 800) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is missing.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: typeof user === 'string' ? user : JSON.stringify(user) },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 200)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content || '{}';
  metricsService.track({ type: 'llm_call', model, tokens_estimated: metricsService.estimateTokens(system + JSON.stringify(user) + content) });
  return JSON.parse(content);
}

export const llmProvider = {
  async lowCostJson({ system, user, fallback }) {
    const model = process.env.OPENAI_LOW_COST_MODEL || 'gpt-4.1-mini';
    try {
      const result = await callOpenAI(model, system, user, 700);
      return result && typeof result === 'object' ? result : fallback();
    } catch {
      return fallback();
    }
  },

  async highCostJson({ system, user, fallback }) {
    const model = process.env.OPENAI_HIGH_QUALITY_MODEL || 'gpt-4.1';
    try {
      const result = await callOpenAI(model, system, user, 1800);
      return result && typeof result === 'object' ? result : fallback();
    } catch {
      return fallback();
    }
  },
};
