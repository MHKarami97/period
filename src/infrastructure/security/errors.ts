/** The secret (PIN / passphrase / backup password) is wrong, or the encrypted data was tampered with. */
export class InvalidSecretError extends Error {
  public constructor(message = "رمز اشتباه است.") {
    super(message);
    this.name = "InvalidSecretError";
  }
}

/** Encrypted data was touched while the app is locked. */
export class VaultLockedError extends Error {
  public constructor() {
    super("برنامه قفل است.");
    this.name = "VaultLockedError";
  }
}

export class PasskeyUnsupportedError extends Error {
  public constructor(message = "این دستگاه یا سیستم از باز کردن قفل با بایومتریک (WebAuthn PRF) پشتیبانی نمی‌کند.") {
    super(message);
    this.name = "PasskeyUnsupportedError";
  }
}

export class BackupPasswordRequiredError extends Error {
  public constructor() {
    super("این بکاپ رمزنگاری شده است؛ رمز آن را وارد کنید.");
    this.name = "BackupPasswordRequiredError";
  }
}

export class InvalidBackupFormatError extends Error {
  public constructor() {
    super("فرمت فایل بکاپ معتبر نیست.");
    this.name = "InvalidBackupFormatError";
  }
}
