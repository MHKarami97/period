import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useProfileStore } from "@application/stores/profileStore";
import { PrintReportService } from "@infrastructure/pdf/PrintReportService";
import { JsonBackupService } from "@infrastructure/backup/JsonBackupService";
import { useAppModeStore } from "@application/stores/appModeStore";
import { useUserProfileStore } from "@application/stores/userProfileStore";

export function useDataManagement() {
  const cycleStore = useCycleStore();
  const symptomStore = useSymptomStore();
  const appModeStore = useAppModeStore();
  const userProfileStore = useUserProfileStore();
  const profileStore = useProfileStore();

  async function exportJson(): Promise<void> {
    await JsonBackupService.downloadAsFile();
  }

  async function importJson(file: File): Promise<void> {
    await JsonBackupService.importFromFile(file);
    await Promise.all([profileStore.initialize(), cycleStore.initialize(), symptomStore.initialize()]);
  }

function downloadSixMonthPdf(): void {
    const profileName = appModeStore.isPartnerMode
      ? profileStore.activeProfile?.name
      : userProfileStore.displayName;

    PrintReportService.openSixMonthReport(cycleStore.sortedCycles, symptomStore.symptoms, profileName);
  }

  return { exportJson, importJson, downloadSixMonthPdf };
}
