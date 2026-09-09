---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: advice-ledger-scores-past-advice
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The advice ledger - scoring shown recommendations by their own signal

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) keeps its advice ledger in
`src/lib/advice/ledger.ts`, a pure module whose header (`:1-34`) is the technique's
argument in full. The comparison is "`snapshot.firstValue` vs `snapshot.lastValue` OF
THE SAME SIGNAL. It reads NOTHING else: no re-derivation, no external store, no second
engine" - because "a resolved subject has no current row by definition", and "anything
richer would be the app grading its own homework with a different pen" (`:10-16`). The
tree proves the technique structurally in four places: the sticky sample flag, the
absence window, the reopen semantics, and the read-only join to applied change-sets.

## The record and the sighting

`AdviceRecord` (`:47-70`) carries the locale-free `subjectKey` ("THE key of this
ledger"), a title "in the locale of the FIRST sighting (never re-written)", both
timestamps, `timesSeen`, `reopenedCount`, an optional `snapshot` with `firstValue` and
`lastValue`, an optional `impactCzk`, a `sample` flag documented as "STICKY: true once
the subject has ever been seen on sample data", and an `outcome` that exists "only on
`resolved`, only with a snapshot, NEVER on a sample record". Producers hand in an
`AdviceSighting` (`:108-116`); the per-rec sample flag is set upstream in
`src/lib/insights/aggregate.ts:78-90`, where `from(signalLive, r)` tags a rec from the
liveness of the *signal* it read, "fail-CLOSED: unknown -> sample, so the worst case is
over-disclosure", and `fixture(r)` marks recs from static illustrative fixtures as
always-sample.

## What the ledger refuses, in code

`scoreAdviceRecord` (`:125-145`) returns `null` for a sample record (`:126`), a
missing snapshot (`:127-128`) or non-finite values (`:130`); otherwise it computes the
relative delta with the zero-baseline sign fallback (`:133-140`), negates it for a key
in `ADVICE_INVERSE_KEYS` (`:141`), and applies `ADVICE_OUTCOME_DEADBAND = 0.05`
(`:87`, `:143`). The docstring repeats the rule that `deltaPct` "is never sign-flipped
for an inverse key ... Only the VERDICT inverts".

`upsert` (`:147-198`) carries three of the technique's refusals:

- **Sticky sample** - `...(prev.sample || sighting.sample ? { sample: true } : {})`
  (`:184`).
- **Reopen keeps the baseline, drops the outcome** - a `resolved` record seen again
  becomes `open` with `reopenedCount + 1`, and `resolvedAt` and `outcome` are deleted
  (`:165-189`): "the stale outcome is dropped - it described a resolve that did not
  hold".
- **A late baseline is not a free improvement** - a record with no prior snapshot that
  now receives one sets `firstValue = lastValue = seen.value` (`:190-196`), "this
  sighting becomes the baseline, not a free 'improved'".
- **Dismissed is the operator's** - `status: reopening ? "open" : prev.status`
  (`:181`), "the operator said 'not this'; only the route puts it back to open".

## The absence window and the cap

`ADVICE_RESOLVE_AFTER_DAYS = 3` (`:83`) with the reason: "the ledger only updates on
render, so one missed day of visits must not mint an outcome". `updateAdviceLedger`
(`:218-256`) resolves every `open` record absent this render and older than the cutoff
(`:234-243`), scoring it through `scoreAdviceRecord`, and trims to
`ADVICE_LEDGER_CAP = 200` by `evictionRank` (`:202-206`): resolved oldest-first, then
dismissed, then open - "an open subject is live advice and is never dropped while a
settled one could go". Three days and two hundred are this tree's conventions; the
technique labels both.

## Insufficient is not unchanged

`src/lib/advice/changesets.ts` joins applied budget change-sets to the same digest
row shape, "STRICTLY READ-ONLY" (`:8-10`). `measuredSets` (`:24-34`) admits only
`status === "applied"` with `realized.status === "measured"`; the comment (`:20-23`)
says an `insufficient` realisation "means the stored series did not cover enough of
one window - the control plane's own honest verdict - and a row saying 'beze zmeny'
over it would launder 'we could not measure' into 'nothing happened'". The row's
verdict reads the realised value delta while its percentage reads the ratio to the
projection, and `deltaPct` is `null` when the projection was non-positive
(`:52-62`) - "no percentage rather than an invented one".

## Read tolerance

`sanitizeAdviceLedger` (`:332-381`) is the migration: keyless and duplicate records
dropped, counters defaulted, and an outcome kept only "on a scorable record: with a
snapshot, and never on a sample one. A blob claiming otherwise is a blob to distrust"
(`:370-373`).

## Where the tree falls short

The dead-band and inverse list are copied from `src/lib/diagnoses/outcome.ts` with a
comment that they "must stay in lockstep" (`:29-34`). `test-unit/advice-ledger.test.mjs:56-57`
pins the ledger's copy to the literal `0.05` and the inverse list to
`["pno", "daysToStockout"]`, but no test asserts equality with `OUTCOME_THRESHOLD`
and `INVERSE_METRIC_KEYS` on the other side, so the outcome constant can drift alone.
The technique wants the pairing pinned, not promised. And `recentAdviceOutcomes` (`:261-276`) caps the operator's view at three
rows over seven days by default - a reasonable digest, but a ledger of two hundred
records with a three-row window has most of its evidence unread.

## Verification

Pure module, driven with object literals on Node 24. Two renders of the same sighting
with `sample: true` on the first and `sample: false` on the second leave `sample: true`
on the record; a resolve tick four days after the last sighting yields no `outcome`.
The same sequence without the sample flag, with snapshot values 0.25 then 0.20 on key
`pno`, yields `{ status: "improved", deltaPct: -0.2 }`.
