import type { HamdelValues } from "@domain/hamdel/HamdelEntry";

/**
 * Port for turning an entry's values into the string stored in IndexedDB.
 * Indexed metadata (profile, section, date) stays outside the payload; everything
 * personal lives inside it, so swapping in an encrypting codec protects it
 * without touching the repository or the schema.
 */
export interface IHamdelPayloadCodec {
  encode(values: HamdelValues): Promise<string>;
  decode(payload: string): Promise<Record<string, string>>;
}

export class PlainJsonPayloadCodec implements IHamdelPayloadCodec {
  public async encode(values: HamdelValues): Promise<string> {
    return JSON.stringify(values);
  }

  public async decode(payload: string): Promise<Record<string, string>> {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Invalid Hamdel payload.");
    }
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        values[key] = value;
      }
    }
    return values;
  }
}

class HamdelPayloadCodecRegistry implements IHamdelPayloadCodec {
  private current: IHamdelPayloadCodec = new PlainJsonPayloadCodec();

  public use(codec: IHamdelPayloadCodec): void {
    this.current = codec;
  }

  public encode(values: HamdelValues): Promise<string> {
    return this.current.encode(values);
  }

  public decode(payload: string): Promise<Record<string, string>> {
    return this.current.decode(payload);
  }
}

/** Shared codec; the security batch replaces the plain codec with an AES-GCM one via `use()`. */
export const hamdelPayloadCodec = new HamdelPayloadCodecRegistry();
