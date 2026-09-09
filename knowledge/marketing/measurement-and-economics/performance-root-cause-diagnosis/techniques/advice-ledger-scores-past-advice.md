---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: advice-ledger-scores-past-advice
status: forged
laws: [provenance-is-binary-and-labelled, not-measured-is-not-zero, platform-reported-is-not-causal]
shared_with: []
use_when: [answering "did our recommendations work", persisting what a surface showed the operator, deciding when a recommendation counts as resolved]
---

# An advice ledger scores past advice

Every recommendation a surface shows is a claim that acting on it would move a number.
A ledger records what was shown - first sight, last sight, how many times, and the
producing signal's own metric at each sighting - and when the recommendation stops
appearing, it scores the claim by that signal's own first value against its own last
value. It reads nothing else. That restriction is the design's honesty core: a resolved
subject has no current row by definition, so the only defensible measurement is the
last thing the producing signal said before it fell silent. Anything richer is the tool
grading its own homework with a different pen.

## The record

Each recommendation carries a locale-free subject key - its identity across renders
and languages - and, where a real number underlies it, a snapshot of that number with a
key naming which metric it is. The ledger holds one record per subject key: module,
severity, the title in the language of first sight (never rewritten), the two
timestamps, a sighting count, a reopen count, the snapshot's first and last values, an
impact amount where the producer had one, a sample flag, and a status of open, resolved
or dismissed.

## The update, on every render

1. Every sighting upserts: create, or bump last-seen and the count and overwrite the
   snapshot's last value. Severity and impact follow the signal; the title and the
   baseline do not.
2. Every **open** record absent from this render for at least the absence window
   resolves, and is scored if and only if it has a non-sample snapshot. Three days is
   the convention: the ledger only updates on render, so one missed day of visits must
   not mint an outcome.
3. The blob is trimmed to a cap, settled records first - resolved oldest-first, then
   dismissed, then open; an open subject is live advice and is never dropped while a
   settled one could go.

**When a recommendation is absent for the window, resolve it and score its own
snapshot under the same dead-band and inverse-key rule as the diagnosis chip, because
a ledger that scores by any other number is measuring something the advice never
claimed.**

## What the ledger refuses

- **No snapshot, no outcome.** A record without a number resolves silently
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- **Sample is sticky and never scored.** Once a subject has been seen on illustrative
  data its baseline is fiction; a project later going live cannot retroactively make it
  real. Failing closed costs a chip; failing open puts a fabricated number under the
  word "improved"
  ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
  The flag is set per recommendation from the liveness of the signal it read, and
  unknown liveness reads as sample.
- **A late baseline is not a free improvement.** When a producer gains a snapshot after
  the subject was first tracked, that sighting becomes the baseline; there is nothing
  to compare it to yet.
- **Reopening keeps the baseline and drops the outcome.** A subject that returns after
  resolving reopens under the same key: counters keep running, the baseline is not
  re-taken, the stale outcome is deleted because it described a resolve that did not
  hold.
- **Dismissed belongs to the operator.** A dismissed subject stays dismissed while it
  is still seen; only the operator's route reopens it, never the clock.
- **Insufficient is not unchanged.** When applied changes with a measured realisation
  join the list, only realisations the control plane marked *measured* qualify; one
  marked *insufficient* - the stored series did not cover both windows - is left out
  rather than rendered as a zero move.

## Reading it back

The operator sees the recently resolved, scored, non-sample records, newest first,
capped small; the monthly narrative gets every scored outcome with no window, and is
told which outcomes it may claim and forbidden to claim others. Every outcome row says
what the metric did while the advice stood, in the metric's own sign; it does not say
the advice caused it
([platform-reported is not causal](../../../_laws.md#platform-reported-is-not-causal)).

## Decision rules

- When a stored blob predates a field, read it tolerantly: default counters, drop
  keyless records, and discard an outcome that sits on a record without a snapshot or
  with the sample flag - a blob claiming otherwise is a blob to distrust.
- When two outcome surfaces exist, their band and inverse-key list are one value; a
  test asserts they agree.
- When the ledger's cap is reached, evict settled records before open ones, never the
  reverse.
- When a producer's metric is lower-is-better, register the key on the inverse list
  before the producer ships; an unregistered key reads higher-is-better and scores a
  worsening as an improvement.

## When NOT to use

- As an experiment log. The ledger measures whether numbers moved beside advice; it
  cannot say the advice moved them, and a surface that implies it has overclaimed.
- For advice with no number underneath. Track it - the sighting count is still useful
  - but expect no outcome, and do not invent a proxy metric so it can be scored.
- On illustrative data, for anything but the sighting count.
- As a substitute for the change-set's own realisation. An applied money move is
  measured by the control plane's pass, on its own windows; the ledger only displays
  that verdict beside its own rows and never recomputes it.
