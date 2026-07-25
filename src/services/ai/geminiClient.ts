import { GEMINI_CONFIG, isGeminiConfigured } from '../../config/gemini';

type GeminiGenerateResult = {
  text: string;
  raw?: unknown;
};

/**
 * Thin Gemini REST client. Swap baseUrl/model in config only.
 */
export const generateGeminiText = async (
  prompt: string,
  systemInstruction?: string
): Promise<GeminiGenerateResult> => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const url = `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${encodeURIComponent(
    GEMINI_CONFIG.apiKey.trim()
  )}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeoutMs);

  try {
    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 512,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // RN/TS AbortSignal typing can disagree with DOM lib
      signal: controller.signal as any,
    });

    const json = (await response.json()) as {
      error?: { message?: string };
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    if (!response.ok) {
      const message =
        json?.error?.message || `Gemini request failed (${response.status})`;
      throw new Error(message);
    }

    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || '')
        .join('')
        .trim() || '';

    if (!text) {
      throw new Error('Empty Gemini response');
    }

    return { text, raw: json };
  } finally {
    clearTimeout(timer);
  }
};
