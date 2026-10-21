/**
 * Port for turning raw photo bytes into what is stored in IndexedDB.
 * Identity while app lock is off; the security module swaps in AES-GCM through `use()`.
 */
export interface IHamdelBytesCodec {
  encode(bytes: ArrayBuffer): Promise<ArrayBuffer>;
  decode(bytes: ArrayBuffer): Promise<ArrayBuffer>;
}

export class PlainBytesCodec implements IHamdelBytesCodec {
  public async encode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return bytes;
  }

  public async decode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return bytes;
  }
}

class HamdelBytesCodecRegistry implements IHamdelBytesCodec {
  private current: IHamdelBytesCodec = new PlainBytesCodec();

  public use(codec: IHamdelBytesCodec): void {
    this.current = codec;
  }

  public encode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return this.current.encode(bytes);
  }

  public decode(bytes: ArrayBuffer): Promise<ArrayBuffer> {
    return this.current.decode(bytes);
  }
}

export const hamdelBytesCodec = new HamdelBytesCodecRegistry();
