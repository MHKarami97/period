const DEFAULT_MAX_SIDE_PX = 1280;
const DEFAULT_JPEG_QUALITY = 0.82;

export interface ResizedImage {
  readonly bytes: ArrayBuffer;
  readonly mime: string;
}

/**
 * Shrinks a photo to a JPEG whose longest side is at most `maxSidePx`.
 * Keeps IndexedDB small (a phone photo is 3-8 MB; the result is ~150-300 KB)
 * and strips the EXIF metadata (including GPS) because the canvas re-encode drops it.
 */
export async function resizeImage(file: File, maxSidePx = DEFAULT_MAX_SIDE_PX, quality = DEFAULT_JPEG_QUALITY): Promise<ResizedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSidePx / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available.");
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) {
      throw new Error("Could not encode the image.");
    }
    return { bytes: await blob.arrayBuffer(), mime: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}
