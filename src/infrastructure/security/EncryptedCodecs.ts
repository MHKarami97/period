import type { HamdelValues } from "@domain/hamdel/HamdelEntry";
import type { IHamdelBytesCodec } from "../hamdel/HamdelBytesCodec";
import { PlainJsonPayloadCodec, type IHamdelPayloadCodec } from "../hamdel/HamdelPayloadCodec";
import { decryptBytes, decryptText, encryptBytes, encryptText, isEncryptedBytes, isEncryptedText } from "./VaultCrypto";
import { vaultSession, type VaultSession } from "./VaultSession";

/**
 * Encrypts every entry payload with the vault's data key. Decoding also accepts legacy plain
 * payloads, so data written before encryption was switched on (or mid-migration) stays readable.
 */
export class EncryptedPayloadCodec implements IHamdelPayloadCodec {
  private readonly plain = new PlainJsonPayloadCodec();

  public constructor(private readonly session: VaultSession = vaultSession) {}

  public encode(values: HamdelValues): Promise<string> {
    return encryptText(this.session.requireKey(), JSON.stringify(values));
  }

  public async decode(payload: string): Promise<Record<string, string>> {
    const json = isEncryptedText(payload) ? await decryptText(this.session.requireKey(), payload) : payload;
    return this.plain.decode(json);
  }
}

export class EncryptedBytesCodec implements IHamdelBytesCodec {
  public constructor(private readonly session: VaultSession = vaultSession) {}

  public encode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return encryptBytes(this.session.requireKey(), bytes);
  }

  public async decode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return isEncryptedBytes(bytes) ? decryptBytes(this.session.requireKey(), bytes) : bytes;
  }
}
