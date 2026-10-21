import { useCycleStore } from "@application/stores/cycleStore";
import { useSymptomStore } from "@application/stores/symptomStore";
import { useProfileStore } from "@application/stores/profileStore";
import { useHamdelStore } from "@application/stores/hamdelStore";
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
  const hamdelStore = useHamdelStore();

  /** Plain (unprotected) backup: contains the notebook in clear text. */
  async function exportJson(): Promise<void> {
    await JsonBackupService.downloadAsFile();
  }

  /** Password-protected backup (PBKDF2 + AES-256-GCM). */
  async function exportEncryptedJson(password: string): Promise<void> {
    await JsonBackupService.downloadEncrypted(password);
  }

  /** Reads the file once so the UI can decide whether a password is needed. */
  async function readBackupFile(file: File): Promise<{ text: string; isEncrypted: boolean }> {
    const text = await file.text();
    return { text, isEncrypted: JsonBackupService.isEncrypted(text) };
  }

  async function importBackupText(text: string, password?: string): Promise<void> {
    await JsonBackupService.importFromJson(text, password);
    await Promise.all([profileStore.initialize(), cycleStore.initialize(), symptomStore.initialize(), hamdelStore.load()]);
  }

  function downloadSixMonthPdf(): void {
    const profileName = appModeStore.isPartnerMode
      ? profileStore.activeProfile?.name
      : userProfileStore.displayName;

    PrintReportService.openSixMonthReport(cycleStore.sortedCycles, symptomStore.symptoms, profileName);
  }

  return { exportJson, exportEncryptedJson, readBackupFile, importBackupText, downloadSixMonthPdf };
}
