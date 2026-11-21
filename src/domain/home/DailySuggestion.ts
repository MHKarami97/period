export interface SuggestionTarget {
  readonly name: string;
  readonly params?: Readonly<Record<string, string>>;
  readonly query?: Readonly<Record<string, string>>;
}

/** One actionable idea shown on the home page; `to` is a vue-router location so the UI stays a dumb renderer. */
export interface DailySuggestion {
  readonly id: string;
  readonly icon: string;
  readonly text: string;
  readonly to: SuggestionTarget;
}
