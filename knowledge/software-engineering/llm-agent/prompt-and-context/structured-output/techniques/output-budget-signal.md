---
layer: technique
type: technique
subject: structured-output
technique: output-budget-signal
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [one call is asked to produce a growing structured artifact, deciding whether to split a call or raise a limit, diagnosing silently shrinking artifacts]
---

# Output-budget signal

Every producer has a ceiling on how much it will emit in one response, and
the failure at that ceiling is **not an error**. The response simply stops:
the artifact ends mid-structure, the tolerant ladder recovers whatever was
complete, the absent parts look like parts the model chose not to fill, and
the consumer proceeds. Nothing throws. This technique makes the approach to
that ceiling visible **as a measurement of how the flow is built** — and
deliberately refuses to make it a runtime guard.

The asymmetry that motivates it: input growth costs money, output growth
costs **correctness**. A prompt that doubles in size shows up on an invoice
and nowhere else. An artifact that doubles in size crosses a line beyond
which the answer is quietly partial, and partial answers are the hardest
class of defect this subject has, because they validate.

## Measure, do not guard

Record output size against the producing model's ceiling on every call, and
classify it: comfortable, watch, act. Two declared fractions define the
bands — the act line placed below where truncation actually begins so the
warning arrives before the damage, the watch line far enough below the act
line to give a release cycle of notice.

Nothing in this path blocks, retries, trims, or downgrades. That restraint
is the technique's entire point:

- **When responses routinely sit near the ceiling, the ceiling is not the
  problem — the call is.** The fix is to split it: one call per unit, or a
  second pass for the section that grew. A larger-ceiling model buys one
  more feature's worth of growth and re-arms the same trap at a size where
  each failure is more expensive.
- **A runtime fallback here hides the growth it was added to survive.** Auto-
  retrying with a shorter instruction, or silently dropping the sections that
  did not fit, converts a design signal into a handled event; the flow keeps
  growing and the number that would have said so has been consumed by the
  handler. The ceiling is a property of the product's architecture, and
  architecture is not repaired at request time.
- **The warning names the consequence and the remedy.** "Approaching a limit"
  is noise. "This response used most of the model's output ceiling; at this
  size a response is truncated mid-structure, which drops units silently
  rather than failing — split the call" is a work item.

## Not measured is not zero

When the producer reports no output size — an offline path, a stub, a
provider that does not surface usage — the budget is **null: not measured**.
Reporting zero percent used would announce that the artifact is comfortably
small at the exact moment nothing was observed at all
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Every consumer of the metric, including the fleet rollup, propagates the
null rather than substituting a reassuring number.

## The ceiling table, and the two kinds of unknown

Ceilings are per model family, matched by longest prefix against the
producer identifier **as it was persisted with the artifact** — not against
the currently configured producer — because the signal is computed over
historical records too, and the recorded identifier is the only one that
still describes them. Normalize the identifier before matching (case,
deployment-region prefixes, alias forms) so one model does not appear as
three.

Unknown producers get a guess, and the safe direction of the guess depends
on *which* thing is unknown:

- **Unrecognized producer entirely → the conservative low ceiling.** A
  generous assumption for something you cannot identify suppresses the exact
  warning this exists to raise. Under-estimating produces a warning that
  turns out to be early; over-estimating stays silent through the
  truncation, and only one of those is recoverable.
- **Recognized family, unverified member → the family default, not the
  scarier number from an older generation.** Asserting a lower ceiling you
  could not verify manufactures warnings on historical records that may
  never have truncated — and those records cannot be re-run to disprove it.
  A fabricated warning on unreproducible data costs more credibility than a
  missed one, and it teaches operators to skim the whole signal.
- **Either way, mark the ceiling as assumed and carry the mark.** The number
  travels with its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): a
  warning derived from an assumed ceiling says so in its text, and alerting
  can exclude assumed ceilings without losing the verified ones.

## One call, then the fleet

Per-call classification answers "was this response near the limit". The
question that actually triggers the design change is "are responses
*trending* toward it", and that only appears across many calls. Keep the
distribution over a window, and read it at a high percentile rather than the
mean: the mean is dominated by small inputs and stays reassuring long after
the largest inputs have started truncating — the calls that hit the ceiling
are exactly the tail. Compare each call as a **share of its own producer's
ceiling** so a mixed-producer fleet stays comparable; raw token counts across
different ceilings are not one series.

## When not to use it

- **When the producer reports a truncation reason directly.** A stop reason
  of "length" is authoritative; use it as the failure signal and keep the
  budget metric as the leading indicator that predicted it. Two signals, one
  early and one certain, are complementary — but never let the metric
  contradict a reported truncation.
- **When the artifact is a stream of independently closed units** and the
  consumer can tell a complete unit from a torn one, the ceiling is real but
  truncation is already detectable per unit; the budget metric adds a
  capacity-planning number, not a correctness one.
- **When the flow's output is bounded by construction** — a fixed small
  artifact whose size cannot grow with the input — there is no trend to
  watch, and the measurement is ceremony.

The metric's natural partner is the coverage gate
([answer-coverage-gating](./answer-coverage-gating.md)): the budget level says
whether the response *ran out of room*, and coverage says whether it
*answered*. Together they separate truncation from refusal, which are the two
ways a validated artifact arrives half-empty.
