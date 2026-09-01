---
layer: application
type: application
subject: docs-sync
technique: dated-corrections
stack: node
verified_on: 2026-09-01
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The signals lane retracts by omission, and the first silent drop has a date

The technique says a disappearance must have an author, and that the
diagnostic is a single question against the record: *why did this claim
disappear?* This registry's demand-measurement lane fails that question at one
site, and the site is its only writer.

`scripts/signals-collect.mjs` folds each connected project's
`.ai/consults.jsonl` into a per-contributor document, keeping only records
newer than `WINDOW_DAYS = 30` (`scripts/signals-collect.mjs:32,46`), and then
writes the result with a whole-file replace (`:109`). The document is rebuilt
from scratch on every run over a rolling window. A subject witnessed 31 days
ago is therefore not marked expired, aged, or withdrawn — it is simply not
written, and the artifact that replaces it carries no evidence it was ever
there. Omission is the retraction signal, whatever the lane's design document
says.

## The asymmetry that makes this worth writing

The lane models the same distinction correctly one level up, and with visible
care. `scripts/librarian-scan.mjs` documents that "nobody consults this" and
"nobody has told us" are opposite, keeps demand `UNKNOWN` rather than zero
when no contributor file exists, and prints an explicit
`DEMAND IS UNKNOWN for every bundle` line. The bundle-level unknown-versus-zero
distinction is deliberate and sound.

At subject granularity the same distinction is destroyed, not by a decision
but by the write path — a rolling window plus a whole-file replace. One lane,
one author, the distinction modelled where it was thought about and lost where
it was not.

## The paired comparison

Same recorded inputs (104 consult lines across six connected projects), same
fold logic lifted from the collector, one variable: the window. Arm A is the
shipped fold; arm B is unbounded.

| window | consult lines kept | (bundle/subject) pairs witnessed | pairs dropped with no record |
| --- | --- | --- | --- |
| 30d (shipped) | 104 | 87 | **0** |
| 8d | 83 | 71 | **16** |
| 4d | 66 | 51 | 36 |

At the shipped window the defect is real in code and **not yet observable in
the data** — the oldest consult record is 2026-08-23, so nothing has aged out.
Moving the boundary into the existing data measures the arrival directly:
16 of 87 pairs, an 18% loss, every one a real subject a real consult logged,
and the artifact after the drop is indistinguishable from one where those
consults never happened.

The predicate travels with the number: 16 pairs at an 8-day window over 104
recorded lines from six projects. At `WINDOW_DAYS = 30` the first genuine
silent drop lands **2026-09-22**.

## Why this is a rejection of the cheap fix

Widening or removing the window is not the repair, and the technique explains
why: the window is doing real work — demand is an event rate and a five-month-old
consult is not current demand. The defect is that expiry and never-witnessed
produce byte-identical output. The lane's own key set already demonstrates the
correct handling for exactly this problem: `citations` absent means "not
measured, never zero", stated in a comment at `:104-105`. The same reduction
applied to aged-out subjects — a count, not an anchor — would let the artifact
distinguish *fell out of the window* from *never seen*.

## What this realization cannot do

Nothing here is committed to the collector. The measurement establishes the
defect and dates its arrival; choosing the record's shape is a schema decision
for a lane whose key set is closed and validated by `check-signals.mjs`, and
the prior application against this lane already owes it one unemitted key.
Adding a second before the first is emitted would widen a gap rather than
close it.
