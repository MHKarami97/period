import type { Position } from "./Position";

/**
 * Port: where positions come from. The implementation is responsible for
 * decrypting the data with the access password.
 */
export interface IPositionsSource {
  /** @throws InvalidAccessPasswordError when the password cannot decrypt the data. */
  load(password: string): Promise<readonly Position[]>;
  /** Returns a displayable image reference, or null when the item has no image. */
  resolveImageUrl(position: Position): Promise<string | null>;
  /** Releases decrypted resources (keys, image URLs). */
  close(): void;
}
