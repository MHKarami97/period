export const MIN_SECRET_LENGTH = 6;
export const MAX_SECRET_LENGTH = 128;

const COMMON_WEAK_SECRETS: ReadonlySet<string> = new Set([
  "123456", "1234567", "12345678", "123456789", "1234567890", "654321", "111111", "000000", "121212", "112233", "123123", "qwerty", "password",
]);

/**
 * Validates a new PIN / passphrase. Returns a Persian error message, or null when acceptable.
 * A local-only PIN can be guessed offline by anyone who copies the browser storage, so very
 * short or obvious values are refused; a longer passphrase is always stronger than a PIN.
 */
export function validateNewSecret(secret: string): string | null {
  if (secret.length < MIN_SECRET_LENGTH) return `حداقل ${MIN_SECRET_LENGTH.toLocaleString("fa-IR")} نویسه لازم است.`;
  if (secret.length > MAX_SECRET_LENGTH) return `حداکثر ${MAX_SECRET_LENGTH.toLocaleString("fa-IR")} نویسه مجاز است.`;
  if (new Set(secret).size === 1) return "همه‌ی نویسه‌ها نباید یکی باشند.";
  if (COMMON_WEAK_SECRETS.has(secret.toLowerCase())) return "این رمز خیلی رایج است؛ رمز دیگری انتخاب کنید.";
  return null;
}

/** Seconds to wait after `failedAttempts` wrong tries in a row: none for the first 4, then 5s doubling up to 60s. */
export function cooldownSecondsAfter(failedAttempts: number): number {
  const FREE_ATTEMPTS = 4;
  const BASE_SECONDS = 5;
  const MAX_SECONDS = 60;
  return failedAttempts <= FREE_ATTEMPTS ? 0 : Math.min(MAX_SECONDS, BASE_SECONDS * 2 ** (failedAttempts - FREE_ATTEMPTS - 1));
}
