# Water For Life — Frequency & Ailment Guide Rebuild

**Owner:** Adam Lloyd (Mojumedia)
**Client:** Doug (EverForged Health)
**Drafted:** 2026-07-23
**Status:** working spec, roadmap agreed with Adam via Telegram 2026-07-23

## Context

Doug wants the app to render dynamic guides when a user searches an ailment and clicks a frequency, or clicks a frequency directly. The guide is what the user uses to program their light-therapy bed for a session. Doug supplied two reference sheet formats:

- **Frequency guide** ("150 Hz Light Frequency — Master Reference"): category/purpose/apps/duty-cycle/intensity/session-time/best-use/frequency-series table + 6-step Simple Session Flow + source citations + educational disclaimer.
- **Ailment guide** ("Mast Cell Activation Syndrome (MCAS) — Rife Frequency Summary"): symptom-category breakdown (6 rows), Simple Session Structure (3–4 named session presets), Duty Guidance table per symptom category, General Use Notes, educational disclaimer + condition-specific safety notes.

## Design decisions locked with Doug (2026-07-23)

1. **Source-driven, not LLM-generated.** All frequency-to-condition mappings come from ingested source datasets (CAFL, KHZ, PROV, VEGA, XTRA today; plus ALT, BIO, CUST, HC, ODD, R from Doug's 2024 books). No LLM decides which frequency treats which ailment.
2. **Bed = one product with three historical names.** SpectraLight = IllumaForge = EverForged Light Bed. The app serves this one bed. Any bed-name references in content should render as generic "Duty Guidance" or the current wordmark.
3. **General disclaimer, not per-condition clinician-reviewed safety notes.** Doug's call. Every guide gets a fixed general disclaimer + "consult your physician" block. Per-condition medical safety warnings (like the MCAS "stop if flushing / breathing difficulty" line) do NOT get rendered because they'd require clinician review Doug isn't investing in. Only non-medical general use notes (hydrate, start with shorter sessions) can appear.
4. **Launch scope: full range.** Cover all ailments in Doug's 2024 books (512 unique). Iterating with only 424 today.

## Source data

- **`SpectraLight Therapy Bed Frequency Book — Sorted Alphabetically` (2024)** — ailment → frequencies mapping. `2024 - Alphabetical Frequency List.docx.pdf`, sent by Doug via Telegram 2026-07-23. Scratchpad copy at `spectralight_alpha_freq_list_2024.pdf`.
- **`SpectraLight Therapy Bed Frequency Book — Sorted by Frequency` (2024)** — frequency → ailments mapping. `2024 - Numerical Frequency List.docx.pdf`, same source.
- Both books cite PROV, CAFL, KHZ, BIO source lists as their foundation, plus additions ALT, CUST, HC, ODD, R, VEGA, XTRA.

## Current state (as of 2026-07-23)

- `src/data/conditions.json` — 424 conditions ingested from an earlier pass of Doug's books. Sources present: CAFL, KHZ, PROV, VEGA, XTRA (5 of 11).
- `src/data/protocols.json` — 2k-line curated "featured protocols" list with a different id scheme. Overlaps semantically with conditions.json. Tech debt.
- `src/pages/ConditionDetail.jsx` — renders a condition detail with protocols, lets user save 4 frequencies to dashboard. Works but does not match Doug's MCAS-sheet template.
- `src/pages/WellnessGuide.jsx` — search page for conditions, recently fixed for numeric-frequency search + word-order-independent matching.
- `src/pages/Dashboard.jsx` — bed-session dashboard, currently limited to 4 frequencies per session (real bug — MCAS Standard Session is 6, some CAFL protocols are 10+).

## Roadmap

### 1. Top-up ingest from Doug's 2024 PDFs (in progress)

- Parse both PDFs into a normalized ailment list: `(conditionName, bodySystem, frequencies, source)`.
- Diff against `src/data/conditions.json`. Report new ailments, changed protocols, and the 6 new sources (ALT, BIO, CUST, HC, ODD, R).
- **Dry run first — no writes to conditions.json until Adam reviews the diff.**
- Deliverable: `scripts/parse-2024-books.cjs`, `scripts/output/2024-ingest-diff.md`.

### 2. Remove the 4-frequency save limit

- Bug: `ConditionDetail.jsx` saves only `freq1..freq4` to localStorage. Longer protocols lose data.
- Fix: save the full frequency array. Dashboard reads any-length array. Update UI to show all frequencies programmed for the session.

### 3. Rebuild `ConditionDetail.jsx` to match the MCAS-sheet template

- Render symptom-category rows if the condition has sub-categories in the ingested data. Fallback to a single row if not.
- Named session presets (Short / Standard / Recovery) as a first-class data field, owner-curated per condition. Users pick a preset → dashboard loads that specific frequency sequence.
- Duty Guidance table, generic (not bed-name-specific) per Doug's answer.
- General Use Notes (non-medical only — hydrate, start with shorter sessions).
- Fixed general disclaimer + "consult a physician" block at the bottom.
- Source citations under each protocol row so users see whether their protocol came from PROV/CAFL/etc.

### 4. Build `FrequencyDetail.jsx`

- New route: `/frequency/:hz`.
- Layout matches the "150 Hz Master Reference" sheet: category / purpose / common applications / duty cycle / intensity / session time / best use / frequency series table + Simple Session Flow + source-citation paragraph + disclaimer.
- Populated from an inverted index of `conditions.json`: `freq → [{conditionName, source, protocolId}, ...]`.
- Every frequency mentioned on any other page (WellnessGuide search results, ConditionDetail protocols, FrequencyDetail complementary frequencies) is a clickable link to this page.

### 5. Collapse `conditions.json` + `protocols.json`

- Migrate the small `protocols.json` "featured" list into a `featured: true` flag on conditions in `conditions.json` (or a separate `featured_ids` array in a new `curated.json` if that stays cleaner).
- Remove `protocols.json`. Update `ConditionDetail.jsx` and Dashboard reads.

## Non-goals

- LLM-generated content anywhere in the render pipeline. Owner-curated + source-cited only.
- Per-condition clinician-reviewed safety notes. Doug's call — general disclaimer only.
- Bed API push-to-program. Session flow is a timer + prompts; user dials each step manually.
- Ailment × frequency matrix content (e.g., "150 Hz for chronic pain" as a distinct page). Ailment context is a discovery path only; landing pages are per-frequency and per-ailment, not per-pair.

## Compliance guardrails baked into the render pipeline

- Educational-only disclaimer block, hardcoded, cannot be removed by owner CRUD.
- Banned-outcome-word linter on all owner-editable text fields (`relief`, `cure`, `treat`, `heal`, etc. per [[feedback-waterlight-ad-language]]).
- All frequency-to-condition mappings must carry a `source` field. Rows without a source do not render.
- No LLM calls anywhere in the user-facing render path.

## Open items to send back to Doug

1. Confirm he's OK with the tradeoff of removing per-condition safety notes (like the MCAS "stop if flushing" line) in exchange for the general-disclaimer approach.
2. Bed model naming: the "Duty Guidance (SpectraLight Bed)" heading in his printed sheets should render as generic "Duty Guidance" in the app. Confirm.
3. Session preset ownership: Short / Standard / Recovery Session structures — did Doug design those combinations, or should we derive them from the source datasets?
