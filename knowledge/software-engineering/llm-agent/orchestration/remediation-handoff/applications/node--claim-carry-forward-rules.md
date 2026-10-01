---
layer: application
type: application
subject: remediation-handoff
technique: claim-carry-forward-rules
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# The resolve rule — pure decision, applied at persist time

The rule lives in two places, split along the seam the technique implies: a
pure decision function with no knowledge of storage, and the persist path that
applies it while writing the new scan.

## The decision (`decideInProgress` in `src/lib/org/followups.ts`)

```
decideInProgress(row, restated, resolvedIds, movement?, engines?)
  -> { done, reason: "trailer" | "not-restated" }
   | { keep, reason: "restated" | "claimed-but-restated" | "no-movement"
                   | "within-noise" | "mock-scan" | "rubric-changed"
                   | "craft-unclaimed" }
```

The 2026-08 version was three lines: a trailer wins outright, absence closes,
a restated row stays. It no longer is, and each added branch is a lesson:

- **Restated always keeps** (2026-08-26), even with a trailer
  (`claimed-but-restated`). The loop's agent writes the trailer, so closing on
  it was the loop certifying its own work.
- **Absence closes only when the dimension moved**, attributably (2026-08-28):
  not across a mock/real pair, not inside the run-to-run noise band, not across
  a rubric bump. A gap that vanishes while its number stands still is a reworded
  title, not a repair. No movement data (first scan, dimension dropped) falls
  back to the title rule. **The trailer does not waive this bar for a gap.**
  The movement checks run before the final
  `claimed ? "trailer" : "not-restated"`, so the trailer only picks the
  reason's name; `followups.test.ts` pins it — a claimed, unrestated row at
  `{ before: 61, after: 61 }` keeps `no-movement`, and the case "closes a
  not-restated row when the dimension moved — trailer or not" closes both.
- **A craft rung closes on its trailer and nothing else.** It raises a ceiling
  the rubric has no headroom to record, and its absence next scan is model
  variance, so an unclaimed one stays in progress.

`isRestated` is the strict matcher: it mirrors the general matcher's tier 1
(`dim::title` exact) and tier 2 (`dim::normalizeRecTitle(title)`) *and stops
there*, reusing `normalizeRecTitle` from `@/lib/report/compare` so both sides
normalize identically. `resolutionNote` and `keepNote` turn each decision into
the archive sentence, naming the mechanism that closed it or the bar the claim
failed, so every automatic outcome explains itself.

## Why tier 3 is excluded (the module header of `followups.ts`)

The module header states the hazard in the source's own words: tier-3 pairing
("the lone unmatched item in the dimension is the same gap") is deliberately
not applied to in-progress rows, because *"since r6 every below-green
dimension always has SOME item, so tier 3 would pair a fixed gap with whatever
new gap the dimension produced next and carry 'in progress' onto work nobody
took on."* And the closing rule: *"A claimed item is carried only by its
title; if the scan does not say it again, the claim is honoured as
resolved."*

This is the subject's most valuable line. It is not a matching optimization —
it is the recognition that a rubric which always emits *something* per weak
dimension makes any structural fallback a claim-forger.

That header (point 3) is older than the function under it. It still says a
row is DONE "when a commit carries its trailer, or when the new assessment no
longer restates it", which is the pre-2026-08-26 rule. The current rule is in
the doc comment on `decideInProgress`: "the trailer is a hint, not a verdict",
"not restated is weak on its own", and movement must be attributable. Cite
that comment, not the header.

## The application (`persistScanReport` in `src/lib/db/scans-persist.ts`)

The persist path runs the general matcher first, then corrects it:

- `nextIds` is the new roadmap's `(dim, title)` pairs; `resolvedIds` comes off
  `report.resolvedFollowUpIds`, collected by the engine from the commit sample
  (`parseResolvedIds` over the commit sample in `src/lib/scoring/engine.ts`).
- For each previous `in_progress` row, `isRestated` + `decideInProgress` yield
  the verdict, given the dimension's score on both scans and the engine and rubric behind each; resolved rows are pushed to `resolvedRows` with their note and
  the 12-character head sha as the scan reference.
- **On close**, every `carryMatch` entry pointing at that row is nulled: *"Un-
  pair any next item carry-forward matched to this row: it is not the same
  gap."* The replacement finding becomes a fresh `open` row and inherits
  nothing.
- **On keep**, rows the new scan did not restate (no movement, rubric changed, unclaimed craft) are copied forward explicitly as in progress with their note, because nothing matched them and they would otherwise vanish. For a restated row the pairing is re-checked rather than trusted:
  `if (m === i && !isRestated({dim, title}, [nextIds[j]]))
  carryMatch[j] = null`, with the comment *"matchRecommendations does not
  report the tier, so re-check the specific pair — a tier-3 pairing joins
  titles that isRestated rejects"*. This was the **upward lesson**
  in the draft: it is not enough to exclude tier 3 when the claim closes; a
  kept claim paired by tier 3 attaches the row's history to the wrong new gap,
  the same defect running slower.

Resolved rows are copied forward onto the *new* scan as `done` with a system
`RecommendationEvent`, *"so the ledger's archive reads off the latest scan
like everything else"* — the derived status is materialized where it is read,
not reconstructed by a cross-scan query.

## The correction stops at `in_progress` (measured 2026-10-01)

The loop above starts `if (r.status !== "in_progress") return;`, while
`prevRecs` is every row of the previous scan, `done` and `dismissed`
included. The new row is written `status: carried?.status ?? "open"`. So a
dismissed or done row that is the lone leftover in its dimension is paired
by `matchRecommendations`' tier 3 with a lone new gap, and the new gap is
born `dismissed` or `done`. A done row restated verbatim, which is a
regression or a close that was wrong, is carried as `done`. No test covers
either case. The tests cover the claimed and the open row.

Experiment, product code unchanged. The real matcher was exported from
`8998d2c0` and run under node 24 type stripping, with the persist line and its
`in_progress` correction applied. Arm B is the technique's rule: a judged row
keeps its pairing only on a title tier, and a closed row restated on one
reopens. n = 5 constructed cases with known answers:

| Case | Truth | A (as built) | B |
| --- | --- | --- | --- |
| dismissed leftover + different new gap | open | dismissed | open |
| done leftover (copied forward) + new gap | open | done | open |
| open row reworded past normalization | open | open | open |
| dismissed false positive reworded | dismissed | dismissed | open |
| done row restated verbatim | open | done | open |

A is right 2 of 5, B 4 of 5. Every error A makes hides a live finding. B's
one error resurfaces a reworded dismissal, visibly, to be dismissed again.

## Scope guard

`docs/features/org-followups/README.md` records the precondition the technique
demands: **only default-branch scans persist**; a scoped scan (`ref` /
`subPath`) is deliberately not written as the repo's standing. A narrower run
therefore never gets to close anything by absence — the scope precondition of
close-by-absence is enforced structurally, by which scans are allowed to write
at all, rather than by a check inside the rule.
