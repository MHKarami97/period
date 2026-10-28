import { PasskeyUnsupportedError } from "./errors";
import { fromBase64, toBase64 } from "./encoding";

export interface PasskeyEnrollment {
  readonly credentialId: string;
  readonly prfOutput?: ArrayBuffer;
}

/** Port for a platform passkey (fingerprint / biometric authenticator). */
export interface IPasskeyProvider {
  isSupported(): Promise<boolean>;
  /** Creates a platform passkey (fingerprint/biometric) and derives PRF secret if supported. */
  enroll(prfSalt?: Uint8Array): Promise<PasskeyEnrollment>;
  authenticate(credentialId: string, prfSalt?: Uint8Array): Promise<ArrayBuffer | null>;
}

interface PrfClientResults {
  prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } };
}

const TIMEOUT_MS = 60_000;
const COSE_ES256 = -7;
const COSE_RS256 = -257;

function prfExtension(prfSalt?: Uint8Array): AuthenticationExtensionsClientInputs {
  // `prf` is newer than some TypeScript DOM libs, so the object is built loosely and cast once.
  const extensions: Record<string, unknown> = { prf: prfSalt ? { eval: { first: prfSalt } } : {} };
  return extensions as AuthenticationExtensionsClientInputs;
}

/**
 * Adapter over WebAuthn platform authenticator (fingerprint / biometrics / Windows Hello / Touch ID).
 * If hardware PRF extension is present, PRF output is returned; otherwise standard platform
 * user verification is performed and device-bound storage is used by the vault.
 */
export class WebAuthnPasskeyProvider implements IPasskeyProvider {
  public async isSupported(): Promise<boolean> {
    if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  public async enroll(prfSalt?: Uint8Array): Promise<PasskeyEnrollment> {
    if (!(await this.isSupported())) {
      throw new PasskeyUnsupportedError("این دستگاه از حسگر اثرانگشت پشتیبانی نمی‌کند.");
    }

    const created = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "ماهک" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "mahak-user", displayName: "کاربر ماهک" },
        pubKeyCredParams: [
          { type: "public-key", alg: COSE_ES256 },
          { type: "public-key", alg: COSE_RS256 },
        ],
        authenticatorSelection: { authenticatorAttachment: "platform", residentKey: "preferred", userVerification: "required" },
        timeout: TIMEOUT_MS,
        extensions: prfSalt ? prfExtension(prfSalt) : undefined,
      },
    });
    if (!(created instanceof PublicKeyCredential)) {
      throw new PasskeyUnsupportedError("ایجاد دسترسی اثرانگشت با خطا مواجه شد.");
    }

    const credentialId = toBase64(new Uint8Array(created.rawId));
    const prfResults = (created.getClientExtensionResults() as PrfClientResults)?.prf;
    const prfOutput = prfResults?.results?.first;

    return { credentialId, prfOutput };
  }

  public async authenticate(credentialId: string, prfSalt?: Uint8Array): Promise<ArrayBuffer | null> {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: fromBase64(credentialId) as BufferSource }],
        userVerification: "required",
        timeout: TIMEOUT_MS,
        extensions: prfSalt ? prfExtension(prfSalt) : undefined,
      },
    });
    if (!(assertion instanceof PublicKeyCredential)) {
      throw new PasskeyUnsupportedError("تأیید حسگر اثرانگشت لغو شد یا با خطا مواجه شد.");
    }
    const output = (assertion.getClientExtensionResults() as PrfClientResults)?.prf?.results?.first;
    return output ?? null;
  }
}

