export interface TelegramConfig {
  readonly baseUrl: string;
  readonly botUsername: string;
}

export const TELEGRAM_CONFIG: TelegramConfig = {
  baseUrl: "https://task-reminders.mhkarami97.workers.dev",
  botUsername: "my_easy_task_reminder_bot",
} as const;
