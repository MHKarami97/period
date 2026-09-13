# Period — Local-First Menstrual Cycle Tracker (PWA)

Local-first, privacy-first, offline-capable menstrual cycle tracker built with **Vue 3**, **Domain-Driven Design**, and **Clean Architecture**. All data stays on-device (IndexedDB via Dexie.js) — nothing is sent to a server.

> Status: **Step 1 delivered** — architecture skeleton, Domain layer (`Cycle` aggregate + WMA prediction algorithm) and Infrastructure layer (Dexie repositories). UI, Pinia stores and PDF export land in the next steps.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | Vue 3 (Composition API, `<script setup>`), Tailwind CSS |
| Build | Vite, `vite-plugin-pwa` |
| State / Application Services | Pinia |
| Persistence | Dexie.js (IndexedDB) — local-first, offline-first |
| Calendar | `date-fns-jalali` (Jalali/Persian calendar in presentation layer only) |
| Reporting | jsPDF (6-month PDF summary) |

## Architecture — Clean / Onion Architecture

Dependencies point **inward only**: `presentation → application → domain ← infrastructure`. The `domain` folder has zero imports from Vue, Pinia or Dexie.

```
src/
├── domain/                     # Enterprise business rules — framework-agnostic, 100% unit-testable
│   ├── entities/
│   │   ├── Cycle.ts             # Aggregate Root: start/end dates, invariants, corrections
│   │   └── Symptom.ts           # Entity: one logged day (mood, pain, flow)
│   ├── valueObjects/
│   │   ├── DateOnly.ts          # Immutable calendar-day VO (calendar-system agnostic)
│   │   ├── CyclePhase.ts        # MENSTRUAL | FOLLICULAR | OVULATION | LUTEAL
│   │   ├── FlowLevel.ts         # NONE..HEAVY
│   │   └── Mood.ts
│   ├── services/
│   │   └── CyclePredictionService.ts   # Pure WMA prediction algorithm (see below)
│   └── repositories/            # Ports (interfaces) — Dependency Inversion
│       ├── ICycleRepository.ts
│       └── ISymptomRepository.ts
│
├── infrastructure/               # Adapters — implement domain ports with real tech
│   ├── database/
│   │   └── AppDatabase.ts        # Dexie schema (IndexedDB)
│   ├── repositories/
│   │   ├── DexieCycleRepository.ts     # implements ICycleRepository
│   │   └── DexieSymptomRepository.ts   # implements ISymptomRepository
│   └── pdf/                      # (next step) jsPDF report generation
│
├── application/                  # Pinia stores acting as Application Services
│   ├── stores/
│   │   ├── cycleStore.ts         # orchestrates Cycle aggregate + repository
│   │   └── symptomStore.ts
│   └── dto/                      # data shaped for the presentation layer
│
├── presentation/                 # Vue-specific: components, views, composables
│   ├── components/
│   │   ├── dashboard/            # circular cycle-day chart, quick actions
│   │   ├── calendar/             # Jalali calendar grid
│   │   └── symptoms/             # symptom logger form
│   ├── views/
│   ├── composables/
│   └── styles/
│
├── App.vue
└── main.ts
```

## Prediction Algorithm — Weighted Moving Average (WMA)

Implemented in `src/domain/services/CyclePredictionService.ts`, fully pure and unit-testable with no external dependency.

```
nextCycleLength = (C1 × 3 + C2 × 2 + C3 × 1) / 6
```

- `C1` = most recent completed cycle length (days between the last two period start dates)
- `C2` = the cycle before that
- `C3` = the cycle before `C2`
- If fewer than 3 historical cycles exist, weights are re-normalized over the available samples instead of failing (e.g. with 2 cycles: `(C1×2 + C2×1) / 3`).

**Ovulation date** = `nextPeriodStartDate − 14 days` (fixed luteal phase, per the standard clinical assumption that the luteal phase length is far more stable than the follicular phase). The fertile window is modeled as 5 days before to 1 day after ovulation.

## Dual Mode

Two roles are supported at the domain/application boundary:

- **Self-tracking**: full write access — log periods, symptoms (mood/pain/flow), corrections.
- **Partner-tracking**: read-only projection — current phase, next period countdown, calendar — no symptom logging UI.

The mode is a UI/application concern (a feature flag in the Pinia store), not a domain concept — the `Cycle` and `Symptom` aggregates are identical regardless of who is viewing them.

## Getting Started

```bash
npm install
npm run dev      # Vite dev server
npm run build    # type-check + production build
```

## Roadmap (next steps)

1. Pinia application stores (`cycleStore`, `symptomStore`) wiring domain + Dexie repositories.
2. Presentation layer: circular dashboard chart, Jalali calendar grid, symptom logger, quick actions (start/end period, backdate correction).
3. `PdfReportService` (jsPDF) — 6-month summary export.
4. JSON export/import for the whole Dexie database.
5. PWA install prompt, offline shell caching via `vite-plugin-pwa`.

## References

- [Dexie.js documentation](https://dexie.org/docs/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)
- [Pinia documentation](https://pinia.vuejs.org/)
- [date-fns-jalali](https://github.com/date-fns-jalali/date-fns-jalali)
- Domain-Driven Design, Eric Evans (Aggregate Root, Value Object, Repository pattern)
