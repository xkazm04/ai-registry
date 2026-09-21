---
layer: technique
type: technique
subject: blind-judging-of-agent-runs
technique: withhold-rather-than-half-judge
status: draft
laws: [the-judge-never-grades-its-own-family, a-refusal-is-not-a-result]
shared_with: []
use_when: [a judge seat refuses mid-panel, planning judging against rate limits, deciding whether to publish verdicts produced by a reduced panel]
---

# Withhold rather than half-judge

The concern: judging panels fail partially. One seat exhausts its window, one provider is
at capacity, one model is deprecated mid-run. The tempting response is to record whatever
verdicts arrived — a score is better than no score — and that produces a corpus where some
numbers mean "two families agreed" and others mean "one family, alone, with its own bias
unchecked", under the same column heading.

**A verdict is recorded only when the intended panel produced it. Otherwise the run keeps
its facts, records no score, and is re-judged when the panel is available.**

## The rule in practice

1. **Detect a judge refusal the same way as an agent refusal** — the message text, not the
   status field — and treat it as "no verdict", never as a zero or a missing dimension.
2. **Record nothing partial.** Not the arrived verdict, not an averaged placeholder. The
   run stays eligible and unjudged, which is a visible, recoverable state.
3. **Fail the job loudly** so the queue's log shows why, and requeue the scoring.
4. **Re-judge when the panel is whole**, on the same packet. Same evidence, later clock;
   note the delay rather than hiding it.
5. **Keep the judges' identities in the verdict record.** Without them, a later reader
   cannot tell which panel produced which number — and that is the whole distinction being
   protected.

## When a whole panel is unavailable for a long time

A fleet cannot always wait. Where one family is unreachable for days, judging with an
available panel is legitimate *if the substitution is explicit*:

- the verdict records the judges that produced it;
- the affected phase is labelled single-family and provisional wherever it is reported;
- the phase is re-judged with the intended panel when it returns, and the two verdict sets
  are **compared**, not merged — the comparison measures the bias the panel exists to
  control, which is worth having on the record;
- publication of standards from that phase waits for the comparison.

## Decision rules

- **Never fill a missing judge with a second judge of the same family and call it a panel.**
  That is the one substitution that looks equivalent and is not.
- **Reserve scoring allowance ahead of producing.** Unjudged runs are inventory; a window
  spent entirely on production leaves a queue of work nobody can score.
- **Deferred judging is a legitimate mode**, not a degradation — but it must be *deferred*,
  with the runs stored intact, rather than skipped.
