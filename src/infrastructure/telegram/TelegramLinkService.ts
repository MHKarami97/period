import { TELEGRAM_CONFIG } from "./TelegramConfig";

export type TelegramLinkState = "unconfigured" | "disabled" | "pending" | "linked";
export interface TelegramLinkStatus { linked: boolean; username: string | null; }

const STORAGE_KEY = "mahak:telegram-link-code";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export interface HttpClient {
  get(url: string): Promise<Response>;
  post(url: string, body: unknown): Promise<Response>;
}

export class FetchHttpClient implements HttpClient {
  public async get(url: string): Promise<Response> { return fetch(url); }
  public async post(url: string, body: unknown): Promise<Response> {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }
}

export class TelegramLinkService {
  private static readonly CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  public constructor(private readonly http: HttpClient = new FetchHttpClient()) {}

  public isConfigured(): boolean {
    return TELEGRAM_CONFIG.baseUrl.length > 0 && TELEGRAM_CONFIG.botUsername.length > 0;
  }

  public isEnabled(): boolean { return localStorage.getItem(STORAGE_KEY) !== null; }

  public enable(): string {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const code = this.createLinkCode();
    localStorage.setItem(STORAGE_KEY, code);
    return code;
  }

  public disable(): void { localStorage.removeItem(STORAGE_KEY); }
  public getStoredCode(): string | null { return localStorage.getItem(STORAGE_KEY); }

  public getBotUrl(code: string): string {
    return `https://t.me/${TELEGRAM_CONFIG.botUsername}?start=${encodeURIComponent(code)}`;
  }

  public async getLinkStatus(): Promise<TelegramLinkStatus> {
    const code = this.getStoredCode();
    if (!code) return { linked: false, username: null };
    const response = await this.http.get(
      `${TELEGRAM_CONFIG.baseUrl}/api/mahak/link/status?code=${encodeURIComponent(code)}`,
    );
    if (!response.ok) throw new Error(`Telegram link status failed: ${response.status}`);
    return (await response.json()) as TelegramLinkStatus;
  }

  public async waitForLink(onStateChange?: (state: TelegramLinkState) => void): Promise<TelegramLinkStatus> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
      const status = await this.getLinkStatus();
      if (status.linked) { onStateChange?.("linked"); return status; }
      onStateChange?.("pending");
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    return { linked: false, username: null };
  }

  private createLinkCode(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    return "mhk" + [...bytes]
      .map((byte) => TelegramLinkService.CODE_ALPHABET[byte % TelegramLinkService.CODE_ALPHABET.length])
      .join("");
  }
}
