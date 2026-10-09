---
layer: technique
type: technique
subject: live-defect-debugging
technique: reproduction-ladder
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a defect is reported and nobody can say how to trigger it, choosing between writing a reproduction and asking a person to perform steps, a reproduction mutates real state]
---

# Reproduction ladder

Every later step of the loop consumes a way to make the defect happen on demand. A
probe is read after a run; a fix is judged by a second run; a verdict compares two. The
quality of that run is therefore the ceiling on everything downstream, and the choice
of how to get it is made once, in order, and then not remade.

## The three rungs

Prefer them in this order, and stop at the first that is available and safe.

1. **An existing failing check.** It is deterministic, it is cheap, someone already
   vouched for what it asserts, and it needs no new code. Run it before anything else,
   and confirm it fails for the reason the report describes. A check that fails on a
   missing fixture is a different defect, and reading its failure as the reported one
   sends the whole loop after the wrong thing
   ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
2. **A reproduction the debugger writes and runs itself.** A single command, a request,
   a short script, a driven session of the real interface. It costs minutes and no
   human attention, it can be rerun a dozen times in the time a person performs it
   once, and it varies only where the system varies. Tailor it to the runtime the
   defect lives in; a defect in a rendered interface needs something that drives a
   rendered interface, not a unit call that bypasses the layer in question.
3. **A person performing numbered steps.** Reserved for the case where neither earlier
   rung is reachable: the trigger needs a device, an account, a physical gesture, a
   state only they can put the system into. Write the steps as a numbered list a person
   can follow without having read anything else, say what they should see when they
   are done, and say what must be restarted for instrumented code to take effect.
   Offer rung two as an alternative, once, in plain words, and then respect the answer.

The ladder is ordered by cost per iteration, not by faithfulness. Rung three is the
most faithful and the slowest, and the loop will run many iterations.

## Reuse is the other half

Once any rung is confirmed to reproduce the defect, **every later iteration uses it
without being re-asked.** The costliest version of this loop is the one that re-opens
the question after each failed fix: it taxes the person on every round and it
introduces variance, because a reproduction restated is a reproduction altered.
Record the confirmed path once, in the session notes, with its exact command or
steps, and treat a change to it as a deliberate event that invalidates comparison with
earlier runs (the labelling rule in
[run-scoped-evidence](./run-scoped-evidence.md) is what makes that visible).

## When rung two is unsafe

A reproduction the debugger runs itself is also a program the debugger runs, with the
debugger's permissions, against whatever the defect lives in. It is unsafe, and
the ladder drops to rung three or to a different environment, when it:

- mutates state that cannot be rebuilt: a production database, a shared queue, a
  customer-visible account, a file the owner has not backed up;
- sends anything outward that cannot be recalled: mail, payments, webhooks, writes to
  a third party that does not offer a sandbox;
- needs credentials the debugger would have to be handed or would have to find;
- runs against live user data, where the reproduction itself would read or write
  personal records.

Unsafe is not the same as hard. A hard reproduction against a disposable copy is still
rung two. A cheap one against production is not. When the only faithful environment is
the unsafe one, say so and ask, because the decision to touch it belongs to its owner.

## When the ladder fails entirely

If no rung produces the defect, the honest state is "not reproduced", and it is
recorded as such rather than as a clean result
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). A loop
can still make progress, by instrumenting the suspected paths and waiting for the next
natural occurrence, but every verdict it draws is provisional: evidence from a run that
did not show the defect can reject a hypothesis only if the probe sat on a path that
the defective run would certainly have taken, and it cannot confirm a fix at all.

## When not to use it

Do not climb the ladder for a defect the report already pins to a single line with a
captured trace; that is a repair, and the failing check is made from the trace. Do not
spend rung two on a defect that depends on timing or load you cannot recreate in a
script; go to rung three or to instrumenting a live run, and say the reproduction is
statistical.
