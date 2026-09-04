---
layer: application
type: application
subject: fleet-orchestration
technique: soft-budget-under-the-hard-cap
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# Two bounds on one loop, and only one of them was tunable

The version witness is the toolchain the repository pins for itself
(`rust-toolchain.toml`, `channel = "1.96.1"`), not a version a dispatch
guessed.

A local-first scraping service runs an agentic research app: a durable loop
that chunks a research job into bounded steps, each a resumable call to an
external agent CLI, checkpointing between them so a crash costs a session
resume rather than the whole run. The loop carries three ceilings — a step
count, a total turn budget, and a spend ceiling — and the tree had already
reached, independently, the technique's central distinction: a `StopReason`
enum separates a real finish from four different truncations, and its doc
comment gives the technique's own reason for existing — *"so a caller can tell
a finished report from a truncated one instead of inferring it from
`structured: false`"*.

What it had not reached is the derivation. The step cap is a literal constant
in the source file. The turn budget is a request parameter whose published
description reads *"total CLI turns for the whole run, spread across the
checkpointed steps"*. Nothing computed either from the other.

## The measurement, taken before the change

The claim "the two numbers drift and nobody can see it" is checkable here at
zero model cost, because the app's own test harness drives the loop with a
scripted researcher. Arm A, on the tree as it stood: a researcher that never
returns the promised report shape, a requested turn budget of 200, the default
chunk of 8 turns per step.

The loop stopped with `stop_reason: step_cap`, `steps: 12`, `num_turns: 96`.

104 of the 200 requested turns were never spendable. No field in the result
said so — and `step_cap` alone cannot say it, because it is also what a run
that legitimately exhausted twelve productive steps reports. Raising the
parameter past the ceiling was indistinguishable, in every observable, from
raising it below one.

## Arm B

A derivation beside the constant — the reachable total is the step cap times
the chunk size — and two fields in the result: the reachable number, and
whether the caller asked for more than it. Both follow the convention this app
already applies to two other ceilings, which report a cut list rather than
silently dropping the surplus.

The measurable is the count of result fields naming the unreachable surplus:
**0 before, 2 after**, with the loop's behaviour unchanged. Fifty-five tests
green, the linter clean at deny-warnings, formatting clean.

## What the tree taught back

The change was rejected on its first run by a gate the registry does not
model. This app declares an `output_shape` string enumerating every key its
result may carry, and a contract test asserts that the run emits *no key the
shape does not declare* — three tests went red naming the two new fields
before any of them checked a value. The vocabulary and the emitter are held to
one authority by a test, so a field cannot be added quietly and discovered
later by a consumer that had no way to know it existed.

That is a stronger version of what this technique asks for. The technique says
a limit must be derived from another limit; this tree says a *published field*
must be derived from a published shape, and enforces it. The two are the same
move at different altitudes, and the second one caught the first one's
implementation.

## What this realization cannot do

The behavioural half is untested here. The technique's soft budget is a number
stated in the agent's own brief so it elects to stop before the machinery cuts
it; this change tells the **caller**, not the agent, and the loop's three step
prompts still carry a stopping condition with no count. Whether stating the
remaining budget in the prompt moves the cap-fired fraction cannot be settled
by this tree's gate — it needs metered runs over a real topic set — so it is
banked as a scoped work item with its measurable and its falsifier named,
rather than shipped on an argument.
