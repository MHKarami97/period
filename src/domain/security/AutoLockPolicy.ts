/** Auto-lock choices in minutes; 0 means "lock as soon as the app is hidden". */
export const AUTO_LOCK_OPTIONS: readonly { readonly minutes: number; readonly label: string }[] = [
  { minutes: 0, label: "هنگام خروج از برنامه" },
  { minutes: 1, label: "۱ دقیقه" },
  { minutes: 5, label: "۵ دقیقه" },
  { minutes: 15, label: "۱۵ دقیقه" },
  { minutes: 30, label: "۳۰ دقیقه" },
];

export const DEFAULT_AUTO_LOCK_MINUTES = 5;
const MS_PER_MINUTE = 60_000;

export function isValidAutoLockMinutes(minutes: number): boolean {
  return AUTO_LOCK_OPTIONS.some((option) => option.minutes === minutes);
}

/** True when the app was away (hidden) long enough that it must be locked on return. */
export function shouldLockAfterAbsence(absentMs: number, timeoutMinutes: number): boolean {
  return timeoutMinutes <= 0 || absentMs >= timeoutMinutes * MS_PER_MINUTE;
}
