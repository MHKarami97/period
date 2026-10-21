import type { HamdelEntry } from "@domain/hamdel/HamdelEntry";
import { buildHamdelStats } from "@domain/hamdel/hamdelStats";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { format } from "date-fns-jalali";
import { DexieHamdelPhotoRepository } from "../repositories/DexieHamdelPhotoRepository";
import { buildHamdelReportHtml } from "./HamdelReportBuilder";

const photoRepository = new DexieHamdelPhotoRepository();

export interface HamdelReportOptions {
  readonly profileName: string;
  readonly includePhotos: boolean;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function toJalali(iso: string, pattern: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return format(new Date(year, month - 1, day), pattern);
}

async function loadDiaryPhotos(entries: readonly HamdelEntry[]): Promise<Map<string, string[]>> {
  const photos = new Map<string, string[]>();
  for (const entry of entries.filter((candidate) => candidate.section === "diary")) {
    const stored = await photoRepository.listByEntry(entry.id);
    if (stored.length > 0) {
      photos.set(entry.id, await Promise.all(stored.map((photo) => blobToDataUrl(new Blob([photo.bytes], { type: photo.mime })))));
    }
  }
  return photos;
}

/**
 * HamdelReportService - opens ONE print-ready document with the whole notebook
 * (stats + every section, optionally diary photos). The user saves it as PDF from
 * the browser print dialog, the same mechanism as the 6-month period report, which
 * keeps Persian text correct without bundling a PDF font.
 */
export class HamdelReportService {
  public static async openFullReport(entries: readonly HamdelEntry[], options: HamdelReportOptions): Promise<void> {
    // The window must be opened synchronously inside the click, before any await, or popup blockers stop it.
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      throw new Error("Popup blocked. Please allow popups for this site to generate the report.");
    }
    reportWindow.document.write("<p style=\"font-family:sans-serif\">در حال آماده‌سازی گزارش...</p>");
    try {
      const today = DateOnly.today();
      const photos = options.includePhotos ? await loadDiaryPhotos(entries) : new Map<string, string[]>();
      const html = buildHamdelReportHtml({
        profileName: options.profileName,
        generatedLabel: `تاریخ گزارش: ${toJalali(today.toIsoString(), "yyyy/MM/dd")}`,
        today,
        stats: buildHamdelStats(entries, today),
        entries,
        formatDate: (iso) => toJalali(iso, "yyyy/MM/dd"),
        photos,
        fontBaseUrl: `${window.location.origin}/fonts/webfonts`,
      });
      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
    } catch (error) {
      reportWindow.close();
      throw error;
    }
  }
}
