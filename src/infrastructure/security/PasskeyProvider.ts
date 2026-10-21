import { PasskeyUnsupportedError } from "./errors";
import { fromBase64, toBase64 } from "./encoding";

export interface PasskeyEnrollment {
  readonly credentialId: string;
  readonly prfOutput: ArrayBuffer;
}

/** Port for a passkey that can return a stable secret (WebAuthn PRF extension). */
export interface IPasskeyProvider {
  isSupported(): Promise<boolean>;
  /** Creates a platform passkey and proves it can evaluate the PRF for `prfSalt`. */
  enroll(prfSalt: Uint8Array): Promise<PasskeyEnrollment>;
  authenticate(credentialId: string, prfSalt: Uint8Array): Promise<ArrayBuffer>;
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
 * Adapter over the WebAuthn PRF extension (see MDN "Web Authentication extensions").
 * The authenticator derives the secret only after user verification (biometrics / device PIN);
 * the signature is not verified because nothing is authenticated against a server - the
 * secret itself is what unwraps the data key.
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

  public async enroll(prfSalt: Uint8Array): Promise<PasskeyEnrollment> {
    if (!(await this.isSupported())) throw new PasskeyUnsupportedError();

    const created = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "ماهک" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "mahak-user", displayName: "ماهک" },
        pubKeyCredParams: [
          { type: "public-key", alg: COSE_ES256 },
          { type: "public-key", alg: COSE_RS256 },
        ],
        authenticatorSelection: { authenticatorAttachment: "platform", residentKey: "preferred", userVerification: "required" },
        timeout: TIMEOUT_MS,
        extensions: prfExtension(),
      },
    });
    if (!(created instanceof PublicKeyCredential)) throw new PasskeyUnsupportedError();

    // Support is only certain once the PRF returns a value, so evaluate it right away.
    const credentialId = toBase64(new Uint8Array(created.rawId));
    const prfOutput = await this.authenticate(credentialId, prfSalt);
    return { credentialId, prfOutput };
  }

  public async authenticate(credentialId: string, prfSalt: Uint8Array): Promise<ArrayBuffer> {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: fromBase64(credentialId) as BufferSource }],
        userVerification: "required",
        timeout: TIMEOUT_MS,
        extensions: prfExtension(prfSalt),
      },
    });
    if (!(assertion instanceof PublicKeyCredential)) throw new PasskeyUnsupportedError();
    const output = (assertion.getClientExtensionResults() as PrfClientResults).prf?.results?.first;
    if (!output) throw new PasskeyUnsupportedError();
    return output;
  }
}
