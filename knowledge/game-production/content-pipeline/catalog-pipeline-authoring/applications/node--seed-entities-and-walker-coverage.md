---
layer: application
type: application
subject: catalog-pipeline-authoring
technique: seed-entities-and-walker-coverage
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The catalog-pipeline walker and its guards

`docs/catalog/E2E-COVERAGE.md` documents PoF's end-to-end coverage of its 32 registered
catalog pipelines: "Every registered catalog pipeline is walked end-to-end through the
real `/layout` lab UI by Playwright, in stub mode (real Next.js dev server + real
SQLite; no Claude CLI / UE bridge — `CliProduce` writes artifacts synchronously)."

## The pieces

| File | Role |
|------|------|
| `e2e/catalog-pipeline-walker.spec.ts` | data-driven walker: enumerates `allCatalogPipelines()`, opens each catalog's first seeded entity, walks every step |
| `e2e/catalog-items-reference.spec.ts` | bespoke deep walk of the 13-step Items pipeline |
| `e2e/helpers/pipeline-coverage.ts` | `WALKER_SKIP` — the single documented skip list |
| `e2e/helpers/walk-status.ts` + `e2e/walk-status.json` | the committed walk-success signal |
| `src/__tests__/catalog/pipeline-e2e-coverage.test.ts` | gap guard, runs in `npm run validate` |

Seed entities live in `src/lib/catalog/seed-*.ts` / `new-catalogs.ts`;
`character-pipeline`'s seeded entity "Jinx" is the technique's "seed carries the
calibration" case — its header notes the seed "carries the real provenance (task ids,
gate verdicts, the P1/v2.5 failures) so future sessions inherit the calibration, not
just the recipe."

## The per-step assertions

Per `E2E-COVERAGE.md` §"The assertions (per step)": the view renders; produce dispatches
(a unique direction typed into `cli-produce-direction`, `cli-produce-run` clicked,
gallery steps also selecting the first candidate); **"The typed direction reaches the
artifact"** — the persisted row carries `data.produceDirection.direction` VERBATIM via
`expectPersistedDirection`, "the Direction text area is a real produce input, not a
write-only box"; and the terminal-status rule:

> **Acceptance derives a config-complete terminal status**: `status ∈ {pass, deferred}`,
> never `fail`/`pending`.

`pass` for L0/L1/L2 (data / selection / static), `deferred` for L3/L4 (runtime / visual,
pending a live bridge) — and a `deferred` gate must show a reason. A persist round-trip
follows: the row is asserted config-complete in its own right, and a second test wipes
`localStorage['pof-lab-pipeline']`, reloads, and asserts every step rehydrates from the
server.

## Two truths, never against each other

The section "Two truths, asserted separately — never against each other" is the upward
lesson in full. The walker used to assert `persisted status === on-screen status`, which
"is **structurally unsatisfiable** whenever a judge verdict binds, because the two are
different verdicts on purpose":

| Truth | Source | What it is |
|-------|--------|------------|
| On-screen banner | `resolveStepAcceptance` | checker → server drain overlay → judge bridge |
| Persisted row | `POST /api/pipeline-artifacts` | the pure checker verdict (`graded.raw`); judge state lives in `judge_verdicts`, bridged only on read |

"So a content-bound judge FAIL correctly turns the banner red while the row correctly
still says `pass` — and the old equality assertion called that a walker failure." Both
are now checked for config-completeness independently, and the rationale is carried in
`expectPersistedConfigComplete` itself, where the next maintainer will look.

## Hermeticity

`playwright.config.ts` passes `POF_DB_PATH=e2e/.tmp/e2e.db` to its `webServer` and wipes
that file plus `-wal`/`-shm` before launch (`e2e/helpers/e2e-db.ts`; the reset is guarded
to the runner process because the config module re-evaluates in every worker).
`reuseExistingServer` is **off by default** (opt in with `POF_E2E_REUSE_SERVER=1`),
because "an already-running dev server was started without `POF_DB_PATH`, so adopting one
would silently put the real DB back under the suite."

The stated reason is exactly the technique's: "acceptance is a function of persisted
state… The walker's verdict was therefore a property of the machine, not of the code — a
fresh clone and a long-lived dev box could not agree, and 'the walker is red' carried no
information." And the qualifier: "this is **isolation, not erasure**: the developer's
real DB is untouched."

## Gap guard + walk-success signal

`pipeline-e2e-coverage.test.ts` fails fast if a registered pipeline cannot be walked: no
`CATALOG_SECTIONS`/`NEW_CATALOGS` entry, no seeded entity, or an undocumented
`WALKER_SKIP`. "Because the walker enumerates the registry, a new pipeline is
auto-covered the moment it self-registers; the guard turns 'added a pipeline with no e2e
path' into a red `validate` instead of a silent gap."

The second half is the rot check: "Registration hygiene only proves a pipeline *could* be
walked; it can't notice a walker that has rotted." A full green run writes
`e2e/walk-status.json`, committed, "and a `--grep`/`--shard` subset never rewrites it, so
a partial run can't shrink the record". The guard fails when a registered, non-skipped
pipeline has no green walk on record, or when the recorded `WALKER_SKIP` set no longer
matches the code.

## The skip list

`e2e/helpers/pipeline-coverage.ts:1` states the rule in its header: "never skip a
pipeline to dodge a real failure. A skip means the pipeline is covered better elsewhere,
or genuinely cannot be exercised in stub mode (explain exactly why)." One entry today —
`items` — because the lab renders the ordered union of two specs (13 bespoke step UIs
plus 5 registry-only labels that "carried 31 of the catalog's 90 persisted rows while
having no screen at all"), which the generic 11-label walk would not cover; it is walked
in depth by the bespoke reference spec and linted by
`src/__tests__/catalog/items-spec-duality.test.ts`. `player-movement` was un-skipped on
2026-06-21 once it had a section, a starter entity and bridge steps that are
deferred-to-the-bridge in stub mode.

## The offline complement

The walk is slow and sees the UI → store → persistence seams; the fleet spec linter
(`src/__tests__/catalog/pipeline-spec-linter.test.ts`) is a pure vitest walker with no
dev server that covers the whole corpus in seconds. Both run in `npm run validate`. The
autonomous authoring path (`src/lib/one-shot/orchestrator.ts`, five routes under
`src/app/api/one-shot/`) reuses the same registered `StepSpec` pipeline and inherits both
guards.
