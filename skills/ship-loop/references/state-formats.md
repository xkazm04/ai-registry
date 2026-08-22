# State file formats — `.claude/ship-loop/`

These shapes are what the resume path parses by eye; keep them stable across sessions so a cold session can pick the loop up from files alone. The status glyphs (☐ ◐ ☑ ✕) and lights (🔴 🟡 🟢) are part of the contract — existing loops in several repos use them, and renaming them breaks resumption.

## `state.md`

```markdown
# Ship loop - state (<project>)

## Context refresher
stack: <one line>   branch: <name>   ship bar: <one line>   cadence: milestone|continuous|per-item
overlay: .claude/ship-loop/config.md (read <date>)

## Value ledger (only when journeys are declared)
| tag | light | what the journey can / cannot do today                  | next slice            | items      |
|-----|-------|---------------------------------------------------------|-----------------------|------------|
| J1  | Y     | <one honest sentence>                                   | <smallest change>     | #12 #15    |

## Scorecard
| # | dimension               | light | evidence (file:line / gate output / lens)   | top gaps -> backlog # |
|---|-------------------------|-------|---------------------------------------------|-----------------------|
| 1 | Build & types           | G     | typecheck 0, build exit 0 (GATE 2026-..)     | -                     |
| 2 | Functional completeness | Y     | src/x.ts:40 stub returns fixture             | #3 #7                 |
(R/Y/G in the table is the ASCII stand-in for the lights when a fenced block must stay ASCII;
 the real file uses the glyphs.)

## Milestones
| M  | theme / journey slice          | items             | status | gate                 |
|----|--------------------------------|-------------------|--------|----------------------|
| M1 | test-pin batch                 | #1 #2 #5 #6       | done   | GATE M1 green (SHA)  |
| M2 | J1 next slice                  | #12 #15 #16       | in flight |                   |

## Checkpoint history
CP0 <date> - ship bar set, cadence milestone, M1 = test-pin batch
CP1 <date> - M2 picked; deferred: pricing question (re-ask at CP2)

## Harness notes
- <gate ordering facts, flake retry rules, environment quirks the next session must know>
```

Rewrite freely; keep it one screen of load-bearing facts. Every scorecard cell carries evidence and its top gaps as backlog numbers.

## `backlog.md`

```markdown
# Backlog (todo / in-progress / done / cut) - numbering append-only, never renumber

| #  | S | J    | Dim        | Size | Item                                                      |
|----|---|------|------------|------|-----------------------------------------------------------|
| 1  | x | hyg  | 3-Tests    | S    | [H] pin flaky date test in lib/schedule.test.ts           |
| 2  |   | J1   | 2-Func     | M    | [C] scan command returns fixture when repo has no .ai/    |
| 3  | ~ | hyg  | 8-Ops      | L    | [M] CI runs e2e concurrently with unit - serialize        |
```

- `S` status glyphs in the real file: ☐ todo · ◐ in progress · ☑ done · ✕ cut (the fence above uses blank/~/x/- as ASCII stand-ins).
- `J` journey tag column exists only when the overlay declares journeys; values are the declared tags or `hyg`.
- `Dim` = `<n>-<short name>` (e.g. `3-Tests`, `5-Pipeline`); `Size` = S/M/L; inline `[C]/[H]/[M]/[L]` severity allowed.
- Themed headings between blocks are fine; numbers never change; cut items stay in the table with ✕ and a reason.
- Deferred-because-hot-area items keep their number and carry the reason in the Item text.

## `journal.md`

```markdown
# Journal (append-only, one line per event)

2026-07-05 BOOT stack=<profile> gate baseline: typecheck 0 lint 0 unit 312/312 build ok
2026-07-05 AUDIT functional lens done - dim2 Y, 5 gaps -> #2 #4 #7 #9 #11
2026-07-05 CP0 done - ship bar "<...>", cadence milestone, M1 = #1 #2 #5 #6
2026-07-06 ITEM 1 done abc1234 (code-verified: test runs 20x green)
2026-07-06 ITEM 5 done def5678 (subagent-claimed; verified at gate)
2026-07-06 GATE M1 green: typecheck 0 lint 0 unit 318/318 build ok e2e skipped (test-only diff)
2026-07-06 NOTE item 4 premise moved - feature is not "permanently disabled", corrected #4
2026-07-07 CP1 done - M2 = J1 next slice #12 #15 #16; deferred pricing question
2026-07-07 SKILL v2.1.0 - overlay adopted, state migrated from state/ to .claude/ship-loop/
```

Verbs: `BOOT`, `GATE(...)` / `GATE M<n>`, `AUDIT <lens> lens done`, `ITEM n done <sha>`, `CP<n> done`, `NOTE`, `DEFER`, `REGRESSION`, `SKILL v<n>`. Every ITEM line says whether it is **code-verified** or **subagent-claimed**. Never edit past lines.

## `decisions.md`

```markdown
# Decisions log

## Boot decisions
- <provisional picks taken at boot when the user was AFK, each marked re-askable>

## Auto-decided (pending user review at next CP)
- <date> <decision> - reversible, re-ask at CP<n>

## CP0 - <date>
- ship bar: <...>   cadence: <...>   M1: <...>   UAT depth: <...>

## CP1 - <date>
- <answers>; deferred: <question> (re-ask at CP2)
```

Every autonomous choice is logged as re-askable. Product calls (ship bar, scope narrowing, feature hide/delete, pricing/positioning, privacy boundaries, security trade-offs) are never auto-decided — they are deferred here until the user answers.

## `value-case.md`

Dimension-9 synthesis from the value-market lens: competitor map, honest moat, production-reality checklist, each claim with evidence. Written once, corrected only with code-verified evidence. When journeys are declared it becomes a pointer to the ledger (and to the product's own value doc if it has one).
