import type { Attributes, GenerateGodInput, GenerateGodOutput, God } from "@/types";
import { buildGodPrompt, buildPrayerPrompt, GOD_PROFILE_SYSTEM } from "@/lib/ai/prompts";
import { generateGodProfile } from "@/lib/ai/fallback";
import { generatePrayerFallback } from "@/lib/ai/prayerFallback";
import { validateGodProfile, validatePrayerResponse } from "@/lib/ai/schema";

/**
 * AI provider abstraction (server-side only).
 *
 * If AI_API_KEY is present, all generation is delegated to an OpenAI-compatible
 * /chat/completions endpoint and the raw model output is validated before use.
 * If the key is missing, or the call fails, or validation rejects the payload,
 * the deterministic local engine takes over. The user never sees a raw error.
 */

export interface AiStatus {
  provider: "remote" | "local-engine";
  model: string | null;
}

export function aiStatus(): AiStatus {
  const key = process.env.AI_API_KEY;
  return {
    provider: key ? "remote" : "local-engine",
    model: process.env.AI_MODEL ?? null,
  };
}

function completionUrl(): string {
  const base = process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";
  return `${base.replace(/\/$/, "")}/chat/completions`;
}

async function callChat(
  system: string,
  user: string,
  jsonMode: boolean,
  timeoutMs = 45000
): Promise<string | null> {
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(completionUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        temperature: 0.95,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateGodProfileAI(
  input: GenerateGodInput
): Promise<{ profile: GenerateGodOutput; status: AiStatus }> {
  const local = generateGodProfile(input);
  const raw = await callChat(GOD_PROFILE_SYSTEM, buildGodPrompt(input), true);
  if (raw) {
    const parsed = validateGodProfile(raw);
    if (parsed.ok) return { profile: parsed.value, status: aiStatus() };
  }
  return { profile: local, status: aiStatus() };
}

export async function generatePrayerResponseAI(
  god: God,
  text: string,
  history: { text: string; response: string }[]
): Promise<{ response: string; status: AiStatus }> {
  const local = generatePrayerFallback(god, text, history);
  const raw = await callChat(
    `You are ${god.name}, ${god.title}. Stay perfectly in character.`,
    buildPrayerPrompt(god, text, history),
    true,
    30000
  );
  if (raw) {
    const parsed = validatePrayerResponse(raw);
    if (parsed.ok) return { response: parsed.value.response, status: aiStatus() };
  }
  return { response: local, status: aiStatus() };
}

/** Optional image generation hook. Returns null when unavailable. */
export async function generateGodImage(god: {
  name: string;
  title: string;
  visualPrompt: string;
  attributes: Attributes;
}): Promise<string | null> {
  const key = process.env.IMAGE_API_KEY;
  if (!key) return null;
  const base = (process.env.IMAGE_API_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL ?? "gpt-image-1",
        prompt: god.visualPrompt,
        size: "1024x1536",
        n: 1,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
    return data.data?.[0]?.url ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
