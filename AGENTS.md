# waterforlife_app — agent standards

Before any substantive change to this repo, read `/c/Users/adaml/.claude/projects/C--Users-adaml/PROCESS.md`. It governs the six-phase lifecycle and the eight quality dimensions that every ship in this repo must satisfy.

## Repo-specific rules

- **React + Vite** deployed on Railway. Auto-deploys on push to `main`.
- **Client-side only** — no backend, no server. All state is either derived from `src/data/*.json` at build time or persisted in `localStorage`.
- **Mobile-first.** This app is used by people on the bed at the light-therapy session. Design at 375px first.
- **No em dashes in copy.** Adam's standard applies here too. Use commas or periods.
- **PDF export via `document.title`.** The Save as PDF flow relies on the browser's print dialog filename defaulting to the page title. Any change to `ConditionDetail.jsx` / `FrequencyDetail.jsx` must preserve the `useEffect` that sets `document.title` to the ailment name / frequency label.
- **Doug is the product owner.** Any addition to the frequency guide data (`src/data/conditions.json`) must trace to Doug's SpectraLight reference books via `scripts/parse-2024-books.cjs`. Never invent frequency-to-ailment mappings.

## Test rig

- `tests/smoke.spec.ts` — Playwright, screenshots at 375px and 1440px, fails on page errors.
- See `tests/README.md` for how to run.
- Every new UI flow adds a test block. UI change without a browser walk does not count as shipped per PROCESS.md Phase 4.

## Standard patterns to follow

- **Sessions saved in localStorage** with 10-item cap (see `src/pages/Dashboard.jsx`).
- **Deep-links via `?condition=`, `?frequency=`, `?startAt=wellness&search=`** — preserve these when refactoring routing.
- **PDF-friendly styles** in `.freq-sheet` + `@media print` — any print-related layout change must be verified in the browser's print preview.
