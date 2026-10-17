import { TELEGRAM_CONFIG } from "./TelegramConfig";
import type { HttpClient } from "./TelegramLinkService";
import type { PlannedMahakEvent } from "@domain/services/MahakReminderPlanner";

export interface MahakSyncResult { success: boolean; linked: boolean; scheduled?: number; }

export interface IMahakReminderGateway {
  sync(events: readonly PlannedMahakEvent[]): Promise<MahakSyncResult>;
  unlink(): Promise<void>;
}

export class MahakReminderApiClient implements IMahakReminderGateway {
  public constructor(
    private readonly http: HttpClient,
    private readonly getLinkCode: () => string | null,
  ) {}

  public async sync(events: readonly PlannedMahakEvent[]): Promise<MahakSyncResult> {
    const linkCode = this.getLinkCode();
    if (!linkCode) return { success: false, linked: false };
    const response = await this.http.post(`${TELEGRAM_CONFIG.baseUrl}/api/mahak/reminders/sync`, {
      linkCode, events,
    });
    if (!response.ok) throw new Error(`Mahak reminder sync failed: ${response.status}`);
    return (await response.json()) as MahakSyncResult;
  }

  public async unlink(): Promise<void> {
    const linkCode = this.getLinkCode();
    if (!linkCode) return;
    const response = await this.http.post(`${TELEGRAM_CONFIG.baseUrl}/api/mahak/unlink`, { linkCode });
    if (!response.ok) throw new Error(`Mahak unlink failed: ${response.status}`);
  }
}
