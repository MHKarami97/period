import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useProfileStore } from "@application/stores/profileStore";
import { PdfReportService } from "@infrastructure/pdf/PdfReportService";
import { JsonBackupService } from "@infrastructure/backup/JsonBackupService";

/**
 * useDataManagement - Presentation-layer composable exposing the data
 * export/import/reporting actions to the Settings view. The PDF report
 * operates on the CURRENTLY ACTIVE profile's in-memory data
 * (cycleStore/symptomStore), while JSON export/import always covers the
 * whole local database (all profiles) since a "backup" is meant to be a
 * full device snapshot, not a per-profile one.
 */
export function useDataManagement() {
  const cycleStore = useCycleStore();
  const symptomStore = useSymptomStore();
  const profileStore = useProfileStore();

  async function exportJson(): Promise<void> {
    await JsonBackupService.downloadAsFile();
  }

  async function importJson(file: File): Promise<void> {
    await JsonBackupService.importFromFile(file);
    await Promise.all([profileStore.initialize(), cycleStore.initialize(), symptomStore.initialize()]);
  }

  function downloadSixMonthPdf(): void {
    PdfReportService.download(cycleStore.sortedCycles, symptomStore.symptoms, profileStore.activeProfile?.name);
  }

  return { exportJson, importJson, downloadSixMonthPdf };
}
