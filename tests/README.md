# Tests

Ship-gate for waterforlife_app per PROCESS.md at `/c/Users/adaml/.claude/projects/C--Users-adaml/PROCESS.md`.

## What lives here

- **`smoke.spec.ts`** — Playwright walk of the home page + wellness deep-link. Screenshots at 375px and 1440px. Fails on any non-favicon page error. Runs against localhost or the deployed Railway URL.
- **`output/`** — screenshots (gitignored).

## Running

```bash
# One-time install
npx playwright install chromium

# Against local Vite dev server (start `npm run dev` first, defaults to :5173)
npx playwright test tests/smoke.spec.ts

# Against the deployed Railway URL
BASE_URL=https://waterforlife-app.up.railway.app npx playwright test tests/smoke.spec.ts
```

## Adding coverage

Every new user-visible flow (new page, new deep-link, new form) adds a `test(...)` block covering the happy path + captures a screenshot at both breakpoints. This is REQUIRED per PROCESS.md Phase 4 — a UI change doesn't count as shipped without a browser walk.

## Related

- `../AGENTS.md` — repo-specific standards
- `/c/Users/adaml/.claude/projects/C--Users-adaml/PROCESS.md` — Mojumedia standard
