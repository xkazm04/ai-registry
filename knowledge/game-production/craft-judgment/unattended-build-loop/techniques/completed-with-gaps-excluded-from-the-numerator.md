---
layer: technique
type: technique
subject: unattended-build-loop
technique: completed-with-gaps-excluded-from-the-numerator
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [an automated item is promoted despite failing checks, reporting a success rate that has a third outcome, letting downstream work proceed on partially verified input]
---

# Completed-with-gaps, excluded from the numerator

Loops need a third terminal status. An item that was worked, retried, still has
unverified parts, and is promoted anyway so that dependent work can proceed is
neither a success nor a failure. The rule is small, precise, and violated almost
everywhere: **the third status must not be quietly counted as either neighbour,
and the reported rate must state its denominator.**

## The procedure

1. **Name the status explicitly** in the same enumeration as success and failure.
   It is a terminal state, not a transient one, and it is recorded per item.
2. **Let it unblock dependents.** That is the reason it exists. Work that
   depends on a partially-verified item may proceed, because the alternative —
   stalling the whole plan on one unverifiable item — is worse and produces no
   more truth.
3. **Exclude its items from the success numerator.** Every item under a gapped
   parent is skipped when counting confirmed passes, regardless of what the
   producer said about them individually.
4. **Keep it in the denominator.** The plan still contains those items. Dropping
   them raises the rate by shrinking the population — the same lie by
   subtraction.
5. **Surface the gapped count as its own figure** beside the rate, in run
   history and in run-to-run comparison, so a run that hit its target and a run
   that hit its target with eleven gapped items are visibly different runs.
6. **Record why each item is gapped** — which check was unsatisfied, and whether
   it failed or could not verify. Those two reasons call for different
   follow-up.

## Decision rules

- **When an item exhausts its retries and is promoted, it is gapped — never
  completed.** The promotion is a scheduling decision. It is not a quality
  finding, and it must not be laundered into one.
- **When a rate is reported, it names its numerator and its denominator.**
  "Verified passes over planned items, with N items gapped" is a sentence an
  operator can act on. A bare percentage is not.
- **When the target could only be reached by counting gapped items, the target
  was not reached.** This is the invariant that stops promote-with-gaps from
  becoming a route to a green run: if gapped items counted, a loop could satisfy
  its stop condition entirely on unverified work.
- **When you are tempted to add a fourth status, check whether it differs in what
  a consumer would do about it.** Statuses that produce identical downstream
  behaviour are labels, not states, and belong in the reason field.
- **Never let a gapped item's own sub-items be counted individually.** The
  producer's per-item claims under a gapped parent were made in the same session
  that failed its check; they inherit the doubt.

## The general form

This is not specific to build loops. Any pipeline with a partial-success outcome
faces it: a batch job that processed most records, an import that skipped
malformed rows, a migration that converted all but a few. The general rule has
three parts.

**A tri-state outcome needs a tri-state report.** If the system can end in three
states, a two-column summary is guaranteed to misrepresent one of them.

**The middle state defaults to the pessimistic side for counting, and to the
optimistic side for scheduling.** It does not count as success, and it does not
block progress. These are different questions and they get different answers;
most implementations pick one answer and apply it to both.

**The count of middle-state items is a first-class metric, trended over runs.**
A rising gapped count with a flat success rate is a system quietly degrading
while its headline number holds steady — the exact pattern a single percentage
is unable to show.

## When NOT to use this

- **When partial completion is not actually possible** because every item is
  atomic and every check is total. Introducing a third status that nothing can
  ever occupy adds branches to every consumer for no gain.
- **When downstream work genuinely cannot proceed on partial input.** If a
  dependent step will corrupt data given a half-done predecessor, the correct
  terminal state is failure and the plan stalls. The third status is for
  soft dependencies, not for wishing hard ones away.
- **When the audience for the number is a contract or an external commitment.**
  There, only fully verified completion counts, and the gapped population is
  reported separately as outstanding work rather than folded into any rate.
