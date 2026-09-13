import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { PdfReportService } from "@infrastructure/pdf/PdfReportService";
import { JsonBackupService } from "@infrastructure/backup/JsonBackupService";

/**
 * useDataManagement - Presentation-layer composable exposing the data
 * export/import/reporting actions to the Settings view. It reads current
 * aggregates from the application stores and delegates the actual I/O to
 * the infrastructure adapters (PdfReportService, JsonBackupService).
 */
export function useDataManagement() {
  const cycleStore = useCycleStore();
  const symptomStore = useSymptomStore();

  async function exportJson(): Promise<void> {
    await JsonBackupService.downloadAsFile();
  }

  async function importJson(file: File): Promise<void> {
    await JsonBackupService.importFromFile(file);
    await Promise.all([cycleStore.initialize(), symptomStore.initialize()]);
  }

  function downloadSixMonthPdf(): void {
    PdfReportService.download(cycleStore.sortedCycles, symptomStore.symptoms);
  }

  return { exportJson, importJson, downloadSixMonthPdf };
}
