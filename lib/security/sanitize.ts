/** Input sanitisation shared by every API route. */

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input.replace(CONTROL, "").replace(/\s+\n/g, "\n").trim().slice(0, maxLength);
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(v: unknown): v is string {
  return typeof v === "string" && EVM_ADDRESS.test(v);
}

/** Strips anything that looks like markdown/script from user-facing text. */
export function stripHtml(input: unknown, maxLength = 2000): string {
  return sanitizeText(input, maxLength)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u2028\u2029]/g, " ");
}
