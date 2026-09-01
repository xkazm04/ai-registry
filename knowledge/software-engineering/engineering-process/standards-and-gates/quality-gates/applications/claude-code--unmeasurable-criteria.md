---
layer: application
type: application
subject: quality-gates
technique: unmeasurable-criteria
stack: claude-code
verified_on: 2026-09-01
verified_against: claude-code@2.1.252
applied: experiment
ab_verdict: better
proof: ab-paired
---

# An in-path gate that already runs the three-state split (Claude Code)

Read and exercised 2026-09-01 against `pumper`'s documentation-drift
checker, a Node script mounted as a turn-end hook. It is the fleet's only
gate that sits **in** the work's execution path rather than beside it, and
it is the exhibit for the technique's in-path branch — which it
implemented before the branch was written, and in a better form than the
branch first prescribed.

## Arms

The variable is the gate's state vocabulary. Arm A is the two-state gate
almost every check in this subject is: pass or violation. Arm B is what
the tree ships: pass, violation, and *could-not-check* as a third code.

Four inputs, run against the shipped checker:

| Input | What it represents | Arm B (shipped) | Arm A (two-state) |
| --- | --- | --- | --- |
| hook payload with no transcript path | the trigger is broken | `3` | `0` — green |
| transcript path that does not exist | the target is gone | `3` | `0` — green |
| rule map loaded with zero entries | the standard is empty | `3` | `0` — green |
| real transcript, clean turn | genuinely nothing to report | `0` | `0` — green |

Arm A collapses three distinct instrument failures onto the same value as
the one honest pass. The gate would have run for its whole life reporting
green, which the file's own header records as having actually happened
before the third code existed: it "detected nothing for its whole life and
looked exactly like a clean repo."

The checker's own comment states the routing that makes this work: a `2`
is fed back to the model, while any other non-zero surfaces "to the human
as a non-blocking error, which is the right audience: an operator has to
fix the instrument, and the model cannot."

## The apply corrected the technique before it was committed

The amendment as first drafted told an in-path gate to fail **"open,
silently and deliberately"** on its own breakage. This tree shows that is
wrong in the flattering direction, and shows why: withdrawing and going
quiet are two decisions, not one. The blast-radius argument only licenses
*not blocking the actor*. It says nothing about the operator, who is the
one party that can repair an instrument and the one the actor cannot
substitute for.

The shipped form — **open to the actor, loud to the operator, on a code of
its own** — satisfies both, and a silent fail-open would have bought the
deadlock's cure at the price of a green that means nobody looked. The
technique text was rewritten against this tree before landing.

## Bound

The three arms measure the checker's classification, not its detection
quality: no arm here exercises a true positive against a real
documentation drift. The claim is about what the gate does when it cannot
see, which is the technique's subject; whether it sees well when it can is
a separate row this run did not open.
