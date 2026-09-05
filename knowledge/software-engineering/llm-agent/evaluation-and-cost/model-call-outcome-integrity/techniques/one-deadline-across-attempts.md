---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: one-deadline-across-attempts
status: forged
laws: [limits-are-derived, record-precedes-effect]
shared_with: []
use_when: [a retry ladder sits inside a caller that has its own deadline, a supervising process can kill the seam mid-call, deciding whether a stated retry delay may be shortened, a remote window ends calls the local timeout never sees]
---

# One deadline across attempts

The seam computes **one wall-clock budget when the call begins**, and every attempt spends
from it. A per-attempt timeout multiplied by a retry count is not a budget; it is a
number nobody chose.

## What per-attempt timeouts actually mean

A seam with a 60-second per-attempt timeout and three attempts can occupy three minutes
plus backoff. Nobody decided three minutes. It emerged from two settings picked
independently, and it is the number that matters — because it is the one an enclosing
deadline collides with.

The collision is the expensive part. When the enclosing context gives up first, the seam
is terminated in the middle of an attempt, and everything this subject cares about is
lost: no outcome is reported, no ledger entry is written, and the spend that already
happened remotely is never recorded. The call cost money and left no trace.

## The rule

1. **Compute the deadline once**, at entry, from the caller's remaining time — not from a
   constant per attempt.
2. **Before each attempt, check what remains.** An attempt that cannot plausibly finish
   inside the remainder is not started; the seam reports a void with its own named reason
   rather than beginning work it will abandon.
3. **Size the budget to expire inside any external supervisor's own limit**, so the final
   act is always the seam's — the ledger write and the outcome report — rather than a
   signal from outside.
4. **A stated wait outranks a computed one.** Where a vendor says how long to wait, that
   is a schedule, not a suggestion, and the ladder honours it. Retrying earlier than asked
   is the one move politeness must never make.
5. **When the stated wait does not fit the remaining budget, end the ladder** and say so
   as its own terminal outcome. Shortening the wait to fit is a silent violation; the
   honest report is that the budget was found insufficient in advance, carrying the wait
   that did not fit as the evidence.

## The third budget

Two limits are usually visible — the completion ceiling and the local deadline — and a
third is not: the remote side may end a request on its own schedule. It appears as a
transport error at a suspiciously round, repeatable elapsed time, on a call that neither
reached the token ceiling nor the local timeout.

Treat a repeatable elapsed-time failure as a **remote window**, and record it as a
capability limit at this input size rather than as an infrastructure flake to retry
forever. It has a fix, and the fix is a smaller request or a different engine — not a
longer local timeout, which is the change it superficially invites.

## Decision rules

- **The budget is derived from the caller's remainder, never from a constant.** A seam
  that does not accept a deadline from its caller cannot participate in one.
- **Backoff spends the budget too.** A ladder that counts only request time will overrun
  by the sum of its waits.
- **Prefer ending the ladder to violating the budget.** A void reported inside the
  deadline is worth more than an answer delivered after the caller stopped listening.
- **Cancellation must reach the work.** Where the call is performed by a child process,
  cancelling the local future is not enough — the process tree keeps running and keeps
  spending, and an abandoned agentic loop can spend indefinitely with nothing watching.
