---
layer: application
type: application
subject: remediation-handoff
technique: claim-carry-forward-rules
stack: node
status: forged
---

# The resolve rule — pure decision, applied at persist time

The rule lives in two places, split along the seam the technique implies: a
pure decision function with no knowledge of storage, and the persist path that
applies it while writing the new scan.

## The decision (`src/lib/org/followups.ts:61-92`)

```
decideInProgress(row, restated, resolvedIds)
  -> { done, reason: "trailer" } | { done, reason: "not-restated" } | { keep }
```

Three lines of logic, one per admissible outcome: a trailer naming the id wins
outright; absence of restatement closes the row as `not-restated`; a restated
row with no trailer stays claimed. `isRestated` (`:82-84`) is the strict
matcher — it mirrors the general matcher's tier 1 (`dim::title` exact) and
tier 2 (`dim::normalizeRecTitle(title)`) *and stops there*, reusing
`normalizeRecTitle` from `@/lib/report/compare` so both sides normalize
identically. `resolutionNote` (`:89-93`) turns each decision into the archive
sentence — *"Resolved by commit trailer (Ascent-Resolves) — confirmed by scan
<sha>"* or *"Resolved: no longer raised by scan <sha>"* — so every automatic
closure names its own mechanism.

## Why tier 3 is excluded (`src/lib/org/followups.ts:19-26`)

The module header states the hazard in the source's own words: tier-3 pairing
("the lone unmatched item in the dimension is the same gap") is deliberately
not applied to in-progress rows, because *"since r6 every below-green
dimension always has SOME item, so tier 3 would pair a fixed gap with whatever
new gap the dimension produced next and carry 'in progress' onto work nobody
took on."* And the closing rule, quoted verbatim into the golden path: *"A
claimed item is carried only by its title; if the scan does not say it again,
the claim is honoured as resolved."*

This is the subject's most valuable line. It is not a matching optimization —
it is the recognition that a rubric which always emits *something* per weak
dimension makes any structural fallback a claim-forger.

## The application (`src/lib/db/scans-persist.ts:295-324`)

The persist path runs the general matcher first, then corrects it:

- `nextIds` is the new roadmap's `(dim, title)` pairs; `resolvedIds` comes off
  `report.resolvedFollowUpIds`, collected by the engine from the commit sample
  (`src/lib/scoring/engine.ts:324`).
- For each previous `in_progress` row, `isRestated` + `decideInProgress` yield
  the verdict; resolved rows are pushed to `resolvedRows` with their note and
  the 12-character head sha as the scan reference.
- **On close**, every `carryMatch` entry pointing at that row is nulled: *"Un-
  pair any next item carry-forward matched to this row: it is not the same
  gap."* The replacement finding becomes a fresh `open` row and inherits
  nothing.
- **On keep**, the pairing is re-checked rather than trusted:
  `if (m === i && !isRestated({dim, title}, [nextIds[j]]))
  carryMatch[j] = null`, with the comment *"matchRecommendations does not
  report the tier, so re-check the specific pair — a tier-3 pairing joins
  titles that isRestated rejects"* (`:318-322`). This was the **upward lesson**
  in the draft: it is not enough to exclude tier 3 when the claim closes; a
  kept claim paired by tier 3 attaches the row's history to the wrong new gap,
  the same defect running slower.

Resolved rows are copied forward onto the *new* scan as `done` with a system
`RecommendationEvent`, *"so the ledger's archive reads off the latest scan
like everything else"* — the derived status is materialized where it is read,
not reconstructed by a cross-scan query.

## Scope guard

`docs/features/org-followups/README.md` records the precondition the technique
demands: **only default-branch scans persist**; a scoped scan (`ref` /
`subPath`) is deliberately not written as the repo's standing. A narrower run
therefore never gets to close anything by absence — the scope precondition of
close-by-absence is enforced structurally, by which scans are allowed to write
at all, rather than by a check inside the rule.
