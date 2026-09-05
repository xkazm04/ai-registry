---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: unattempted-is-not-failed
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a model returns nothing and the seam must decide what that means, output is present but ends mid-structure, a model scores badly and the configuration has not been ruled out, choosing what a completion ceiling does to a reported outcome]
---

# Unattempted is not failed

A call bounded by the caller's own ceiling produced no evidence about the model. The
seam must say so in those words, because every other rendering of that event —  an empty
answer, a parse error, a zero — reads downstream as a fact about the vendor.

## The three faces of one cause

A completion ceiling has three distinct signatures, and a seam that treats them
separately will diagnose the same root cause three different wrong ways:

| what the caller sees | what naive seams report | actual cause |
| --- | --- | --- |
| no output at all | "empty response from the provider" | the ceiling was consumed before any answer began |
| output that ends mid-structure | "the response is not valid" / "wrong shape" | the ceiling was reached during the answer |
| output that parses but is thin | a low score | the ceiling truncated the tail |

The middle row is the most damaging, because a partial structure often *does* parse into
something, and that something is then scored. The third is worse still: nothing looks
broken at all.

The unifying observation is that the response carries a field saying the attempt was
stopped by length, and that field is available before any of the three symptoms are
interpreted. Reading it first collapses three investigations into one.

## The rule

**Read the stop condition before doing anything else with the response.** Not after the
parse fails, not as a fallback when the output is empty — first, unconditionally, on
every call. A seam that inspects the payload before the stop condition has already
allowed a caller-imposed limit to disguise itself as content.

If the attempt was stopped by a ceiling:

1. Report a distinct outcome — not an answer, not a malformed answer. It is a *void*.
2. Name the ceiling's **value** and the **control** that changes it. "Hit the cap" sends
   an operator hunting; "hit the cap of N, raise it with this control" is a work item.
3. Where the response reports how much of the budget went to intermediate work rather
   than to the answer, carry that number. It is the difference between "raise the
   ceiling" and "this model cannot do this task within any sane ceiling".
4. Never let the void reach a scorer, an average or a comparison. It has no value to
   contribute, and contributing zero is the specific mistake.

## Where the cost of getting it wrong lands

Models that spend budget on intermediate reasoning before emitting anything are the
common case now, and they fail this way first and hardest. A ceiling sized for a
non-reasoning model produces, from a reasoning model, a *complete absence of output* on a
task it is entirely capable of — the strongest possible false signal.

Two independent measurement efforts have now reached the same wrong conclusion by this
route: a model was recorded as weak at a task, the record survived review, and the
finding was later traced to a ceiling that had ended the attempt before it began. In one
of them the harness fell back to a deterministic substitute and *scored the substitute as
the model*. That is this technique's canonical failure: not a wrong number, a wrong
number with a plausible story attached.

## Decision rules

- **A void is not a fail; a fail is not a void.** If the command ran and answered
  wrongly, that is evidence. If it never got to answer, it is not. Two different
  outcomes, never one.
- **A stop condition that cannot be observed makes every result provisional.** Some
  transports do not expose one. Say so in the outcome rather than assuming completion:
  an unobservable stop condition is unknown, and unknown is not "fine".
- **Raise the ceiling until no arm can reach it, then record the number.** A comparison
  in which any participant was bounded is a comparison of ceilings.
- **The ceiling is not the only limit.** A wall-clock deadline and a remote request
  window produce the same three symptoms from different causes; each gets its own named
  outcome, because each has a different fix and a different owner.
