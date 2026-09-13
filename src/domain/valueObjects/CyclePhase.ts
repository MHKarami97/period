/**
 * CyclePhase - Value Object (enum) representing the four physiological
 * phases of a menstrual cycle. Kept as a plain string enum so it stays
 * framework-agnostic and trivially serializable.
 */
export enum CyclePhase {
  Menstrual = "MENSTRUAL",
  Follicular = "FOLLICULAR",
  Ovulation = "OVULATION",
  Luteal = "LUTEAL",
}

export const CYCLE_PHASE_LABELS_FA: Record<CyclePhase, string> = {
  [CyclePhase.Menstrual]: "قاعدگی",
  [CyclePhase.Follicular]: "فولیکولار",
  [CyclePhase.Ovulation]: "تخمک‌گذاری",
  [CyclePhase.Luteal]: "لوتئال",
};
