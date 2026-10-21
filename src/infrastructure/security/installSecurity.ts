import { hamdelBytesCodec, PlainBytesCodec } from "../hamdel/HamdelBytesCodec";
import { hamdelPayloadCodec, PlainJsonPayloadCodec } from "../hamdel/HamdelPayloadCodec";
import { EncryptedBytesCodec, EncryptedPayloadCodec } from "./EncryptedCodecs";
import { vaultService } from "./VaultService";

export function useEncryptedCodecs(): void {
  hamdelPayloadCodec.use(new EncryptedPayloadCodec());
  hamdelBytesCodec.use(new EncryptedBytesCodec());
}

export function usePlainCodecs(): void {
  hamdelPayloadCodec.use(new PlainJsonPayloadCodec());
  hamdelBytesCodec.use(new PlainBytesCodec());
}

/** Must run before the app mounts: when a vault exists, all Hamdel reads/writes go through encryption. */
export function installSecurity(): void {
  if (vaultService.hasVault()) {
    useEncryptedCodecs();
  }
}
