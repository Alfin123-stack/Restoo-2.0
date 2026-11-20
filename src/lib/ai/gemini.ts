import "server-only";
import type { ZodType } from "zod";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** True when a Gemini key is configured. Without it every AI feature falls back to a local demo mode. */
export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/** Models are tried in order; the second one is used when the first is rate limited or unavailable. */
function models(): string[] {
  return [
    process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-flash-lite-latest",
  ];
}

export type GeminiPart =
  { text: string } | { inlineData: { mimeType: string; data: string } };

type GenerateOptions<T> = {
  /** Trusted instructions. Never put user text here. */
  system: string;
  /** Untrusted user content (query text, review text, an image). */
  parts: GeminiPart[];
  schema: ZodType<T>;
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  /** Override the model list, e.g. a lighter model for bulk jobs. */
  modelList?: string[];
};

function extractJson(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(trimmed);
}

/**
 * Calls Gemini and returns validated JSON, or null when the call failed or the output
 * did not match the schema. Callers must always have a non-AI fallback.
 * Prompts and responses are never logged.
 */
export async function generateJSON<T>({
  system,
  parts,
  schema,
  maxOutputTokens = 1024,
  temperature = 0.2,
  timeoutMs = 12_000,
  modelList,
}: GenerateOptions<T>): Promise<T | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  for (const model of modelList ?? models()) {
    try {
      const response = await fetch(
        `${ENDPOINT}/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature,
              maxOutputTokens,
            },
          }),
          signal: AbortSignal.timeout(timeoutMs),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        // Rate limited, overloaded or model missing: try the next model. Anything else is a config error.
        if ([404, 429, 500, 502, 503, 504].includes(response.status)) continue;
        console.error(`Gemini request failed (${model}): HTTP ${response.status}`);
        return null;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("");
      if (!text) continue;

      const parsed = schema.safeParse(extractJson(text));
      if (parsed.success) return parsed.data;
      console.error(`Gemini output did not match the schema (${model})`);
    } catch (error) {
      console.error(`Gemini call error (${model}):`, (error as Error).name);
    }
  }
  return null;
}
