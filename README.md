# Period — Local-First Menstrual Cycle Tracker (PWA)

Local-first, privacy-first, offline-capable menstrual cycle tracker built with **Vue 3**, **Domain-Driven Design**, and **Clean Architecture**. All data stays on-device (IndexedDB via Dexie.js) — nothing is sent to a server, and the UI ships with a self-hosted font and self-hosted PWA icons (zero third-party/CDN requests).

> Status: architecture skeleton, full Domain layer, Infrastructure (Dexie, PDF, JSON backup), Application (Pinia) and Presentation layers are implemented, including a Jalali-native calendar and date picker, PWA icons and offline-safe fonts, and a Vitest unit-test suite for the prediction algorithm.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | Vue 3 (Composition API, `<script setup>`), Tailwind CSS |
| Build | Vite, `vite-plugin-pwa` |
| State / Application Services | Pinia |
| Persistence | Dexie.js (IndexedDB) — local-first, offline-first |
| Calendar | `date-fns-jalali` (Jalali/Persian calendar in presentation layer only) |
| Reporting | jsPDF + jspdf-autotable (6-month PDF summary) |
| Fonts / Icons | Self-hosted Vazirmatn (`public/fonts`) + custom PWA icon set (`public/icons`) — no external CDN |
| Testing | Vitest (domain layer unit tests) |

## Architecture — Clean / Onion Architecture

Dependencies point **inward only**: `presentation → application → domain ← infrastructure`. The `domain` folder has zero imports from Vue, Pinia or Dexie.

```
src/
├── domain/                     # Enterprise business rules — framework-agnostic, 100% unit-testable
│   ├── entities/                Cycle.ts (Aggregate Root), Symptom.ts (Entity)
│   ├── valueObjects/             DateOnly, CyclePhase, FlowLevel, Mood
│   ├── services/
│   │   ├── CyclePredictionService.ts       # Pure WMA prediction algorithm
│   │   └── CyclePredictionService.spec.ts  # Vitest unit tests
│   └── repositories/             ICycleRepository, ISymptomRepository (Ports)
│
├── infrastructure/
│   ├── database/                 AppDatabase.ts (Dexie schema)
│   ├── repositories/             DexieCycleRepository, DexieSymptomRepository
│   ├── pdf/                      PdfReportService.ts (jsPDF 6-month report)
│   └── backup/                   JsonBackupService.ts (export/import whole DB)
│
├── application/
│   └── stores/                   cycleStore, symptomStore, appModeStore (Pinia = Application Services)
│
└── presentation/
    ├── components/
    │   ├── dashboard/             CircularCycleChart, QuickActions
    │   ├── calendar/              JalaliCalendarGrid
    │   ├── symptoms/              SymptomLoggerForm
    │   ├── settings/              DataManagementPanel
    │   ├── onboarding/            RoleSelector (Dual Mode)
    │   ├── layout/                AppShell (desktop sidebar + mobile bottom nav)
    │   └── shared/                JalaliDatePicker
    ├── composables/               useJalali, useCycleDashboard, useDataManagement
    ├── router/                    vue-router with onboarding + partner-mode guards
    └── styles/

public/
├── icons/     # icon-48/72/96/144/192/512.png — referenced directly in the PWA manifest
└── fonts/     # Vazirmatn-font-face.css + webfonts/*.woff2 — loaded via <link>, no Google Fonts CDN
```

## Prediction Algorithm — Weighted Moving Average (WMA)

Implemented in `src/domain/services/CyclePredictionService.ts`, fully pure, dependency-free and covered by Vitest.

```
nextCycleLength = (C1 × 3 + C2 × 2 + C3 × 1) / 6
```

- `C1` = most recent completed cycle length, `C2` the one before, `C3` before that.
- With fewer than 3 historical cycles, weights are re-normalized over the available samples (e.g. 2 cycles: `(C1×2 + C2×1)/3`); with zero history, falls back to the clinical default of 28 days.

**Ovulation date** = `nextPeriodStartDate − 14 days` (fixed luteal phase). Fertile window: 5 days before to 1 day after ovulation.

## Dual Mode

- **Self-tracking**: full write access — log periods, symptoms, corrections.
- **Partner-tracking**: read-only projection — current phase, next-period countdown, calendar; the Symptoms route is guarded and redirects to the dashboard.

## Fonts and Icons

- The app self-hosts **Vazirmatn** (`public/fonts/Vazirmatn-font-face.css` + `public/fonts/webfonts/*.woff2`), loaded via a `<link>` tag in `index.html` and set as the default `font-family` in Tailwind (`fontFamily.vazir`) — no Google Fonts or other CDN request is made anywhere in the app, which keeps it fully functional offline.
- PWA icons come from `public/icons/icon-{48,72,96,144,192,512}.png` and are wired into the `vite-plugin-pwa` manifest with both `any` and `maskable` purposes for the 192/512 sizes.

## Getting Started

```bash
npm install
npm run dev        # Vite dev server
npm run build       # type-check + production build
npm run test        # Vitest unit tests (domain layer)
```

## Roadmap

- [x] Domain layer: `Cycle` aggregate, `Symptom` entity, WMA prediction service
- [x] Infrastructure: Dexie repositories, PDF report, JSON backup/restore
- [x] Application: Pinia stores as Application Services
- [x] Presentation: dashboard, Jalali calendar, symptom logger, settings, dual-mode onboarding
- [x] Self-hosted fonts and PWA icons (no external CDN)
- [x] Vitest unit tests for the prediction algorithm
- [ ] Vue Test Utils component tests for `JalaliDatePicker` / `JalaliCalendarGrid`
- [ ] Push notifications reminder (day-before-period) via Web Push + Service Worker

## References

- [Dexie.js documentation](https://dexie.org/docs/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)
- [Pinia documentation](https://pinia.vuejs.org/)
- [date-fns-jalali](https://github.com/date-fns-jalali/date-fns-jalali)
- [Vazirmatn font](https://github.com/rastikerdar/vazirmatn)
- [Vitest documentation](https://vitest.dev/)
- Domain-Driven Design, Eric Evans (Aggregate Root, Value Object, Repository pattern)
