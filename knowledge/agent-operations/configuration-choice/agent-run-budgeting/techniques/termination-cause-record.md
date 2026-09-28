---
layer: technique
type: technique
subject: agent-run-budgeting
technique: termination-cause-record
status: draft
laws: [a-ceiling-is-a-measurement-boundary, a-refusal-is-not-a-result, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [a run can end on more than one budget (wall-clock, turns, spend, allowance), writing the parser that turns a runner's final envelope into a stored outcome, a runner's success field disagrees with its error flag, comparing arms whose runners enforce different caps]
---

# Termination cause record

The concern: every budget in this subject has an exit, and each exit produces a run that
looks, in storage, much like a finished one. A wall-clock ceiling, a turn cap, a spend
cap, an allowance refusal, a capacity refusal, a sleeping host and a crashed process all
end a run early, and the only thing that distinguishes them afterwards is what the harness
wrote down at the moment it ended. **Every run ends with exactly one recorded cause from a
closed vocabulary, read from the runner's structured signals, and "finished" is one member
of that vocabulary - never the default for a run whose end was not understood.**

## The vocabulary

A small closed set, the same for every runner the harness drives:

| Cause | What it means | Scored? |
| --- | --- | --- |
| `finished` | the runner reported completion and nothing below applies | yes |
| `wall-clock` | the harness's own ceiling fired | no - [a boundary](../../../_laws.md#a-ceiling-is-a-measurement-boundary) |
| `turn-cap` | the runner's step or turn limit ended it | no |
| `spend-cap` | the runner's cost or credit limit ended it | no |
| `refused-allowance` | the seat, key or model pool is exhausted until a stated time | no - [requeued](../../../_laws.md#a-refusal-is-not-a-result) |
| `refused-capacity` | the provider is overloaded; recovers in minutes | no - requeued |
| `host` | the machine slept, was killed or lost the process | no - requeued |
| `crash` | the runner or harness failed on its own | no - [attributed first](../../../_laws.md#the-harness-is-a-suspect-in-every-red) |
| `unknown` | none of the above could be established | no |

`unknown` is load-bearing. It is where every new failure shape lands until someone reads
it, and it keeps the unexplained out of the population rather than scoring it as work.

## Read the structured signal first; text is the fallback

A runner's outcome field can disagree with itself. Observed on one widely used CLI runner,
reported in its issue tracker and confirmed against its SDK documentation: when the model
request is rejected, the result envelope carries `subtype: "success"` **and**
`is_error: true`, the process exits 0, the stop reason reads as a normal stop, and the only
truthful account is the prose in the result text. The runner's own documentation now says
to check its terminal-reason field *before* the subtype. A parser that keys on the subtype
or the exit code records a finished run that never started.

So the order of reading is:

1. **The error flag and the terminal-reason field**, before any "subtype" or status.
2. **The upstream status the runner forwards**: a 429 against your quota is allowance;
   a 529 is provider-wide overload and is capacity. They get different pauses.
3. **Rate-limit events with a reset instant and a limit type** where the runner streams
   them, and the provider's reset headers or its spend-limit error code where the harness
   calls the API directly. A spend limit is a third family: it has no reset header, and
   the provider's error code is what tells it apart from a rate limit.
4. **Message text last**, and only over the *error* text of an envelope that says it
   errored - never over the model's own output. An open-source review agent tripped its
   fleet-wide limit breaker because a review finding quoted a rate-limit error string;
   text matching over output turns the content of the work into a signal about the seat.

Text matching stays, because some runners give nothing else - but it is the fallback for
the runner that has no field, not the primary instrument for the one that does.

## Caps are enforced by software that can fail

A turn or spend cap is configuration the runner promises to honour, and the promises have
measurable gaps:

- **Spend overshoots.** A workflow runner reported its own guardrail as "used 1K of 1K,
  over by 7.65": the call that crossed the line completes. A spend cap bounds the next
  call, not the total.
- **A cap can end the run with no terminal record.** An open issue against one agent SDK
  (2026-09) reports a spend cap held by a sub-agent ending the parent with no result
  message at all - neither success nor the cap's own error. A harness that waits for the
  terminal envelope to classify the run records nothing, or a crash.
- **A retry loop can outrun a turn cap.** The same runner's changelog records fixing a
  turn that retried indefinitely while ignoring its turn limit.

Hence two rules: **the absence of a terminal record is itself a cause** (`unknown`, or
`host` when the process vanished), and **the harness's own wall-clock ceiling stays on as
the backstop** even when the runner carries its own caps.

## Caps are part of the configuration

- **Every compared arm runs under the same caps, and the caps are stated.** Some runners
  have no turn or spend limit unless one is passed; others default to generous ones. A
  comparison that leaves the defaults in place compares the defaults.
- **A "turn" is not one unit across runners.** One runner counts model requests, another
  tool round-trips, another plan steps. Across runners, state each runner's cap in its own
  unit rather than claiming the caps are equal.
- **What happens to partial work at a cap is a policy, and it is declared.** One widely
  used issue-resolution agent auto-submits its partial patch when its cost limit fires and
  lets it be scored; another submits nothing. Either is defensible alone. Pooling them is
  not, and a scored partial is reported as "within budget X", never among finished runs.

## Reporting

- **The cause sits beside the outcome** in every table a verdict is read from, and the
  coverage table counts causes per arm.
- **A cause that concentrates in one arm is a finding before it is a gap.** Spend caps
  firing only on one tier is that tier's cost; allowance refusals only on one arm is that
  arm's seat; turn caps only on one runner is that runner's unit.
- **Keep the raw terminal envelope** for every non-`finished` run. The next runner release
  will emit a shape the parser has not seen, and the envelope is how `unknown` shrinks.

## Decision rules

- No run is `finished` because nothing said otherwise; it is `finished` because the
  runner's structured fields said so and none of the other causes applies.
- A disagreement between two fields of one envelope resolves toward the error.
- A runner that reports no cause is diagnosed under `unknown`, not re-labelled to the
  nearest familiar cause.
