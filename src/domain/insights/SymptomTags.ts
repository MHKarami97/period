export interface SymptomTag {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

/** Predefined tags for the symptom logger; ids are stored, so never rename an existing id. */
export const SYMPTOM_TAGS: readonly SymptomTag[] = [
  { id: "cramps", label: "گرفتگی شکم", icon: "⚡" },
  { id: "headache", label: "سردرد", icon: "🤕" },
  { id: "bloating", label: "نفخ", icon: "🎈" },
  { id: "breast-tenderness", label: "حساسیت سینه", icon: "💗" },
  { id: "backache", label: "کمردرد", icon: "🦴" },
  { id: "acne", label: "جوش", icon: "🔴" },
  { id: "nausea", label: "تهوع", icon: "🤢" },
  { id: "fatigue", label: "خستگی", icon: "🥱" },
  { id: "cravings", label: "هوس غذایی", icon: "🍫" },
  { id: "insomnia", label: "بی‌خوابی", icon: "🌙" },
  { id: "dizziness", label: "سرگیجه", icon: "💫" },
  { id: "low-mood", label: "دلتنگی و غم", icon: "☁️" },
];

export function tagLabel(id: string): string {
  return SYMPTOM_TAGS.find((tag) => tag.id === id)?.label ?? id;
}
