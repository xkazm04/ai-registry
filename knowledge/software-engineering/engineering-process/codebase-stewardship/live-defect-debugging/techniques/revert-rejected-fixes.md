---
layer: technique
type: technique
subject: live-defect-debugging
technique: revert-rejected-fixes
status: forged
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [evidence just rejected a hypothesis that a code change was written for, starting a new round after a failed fix, a diff contains defensive guards nobody can justify, the defect moved instead of disappearing]
---

# Revert rejected fixes

A debugging session writes code on behalf of ideas, and most of the ideas turn out
wrong. The edits written for them do not know that. A defensive guard added for a
rejected hypothesis still guards, still changes behaviour at the margin, and still
looks like intent to the next reader. Left in place, a sequence of failed rounds leaves
a sequence of plausible-looking changes, none supported, and the code is now harder to
reason about than when the session began.

## The rule

**When evidence rejects a hypothesis, the code changed on its behalf is reverted before
the next round begins.** Not at the end, not when the fix is finally found. Before the
next round, because the next round's evidence is only meaningful against a baseline that
contains nothing speculative. What survives a round is exactly two kinds of change: the
probes, which are temporary by design
([marked-temporary-probes](./marked-temporary-probes.md)), and fixes that evidence has
confirmed. Everything else was a loan against an idea, and the idea defaulted.

Every edit therefore names, at creation, the hypothesis that justifies it and the
verdict that retires it ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
That is bookkeeping a single line of session notes carries; it is what makes the revert
a lookup rather than an archaeology exercise.

## Why speculative guards are worse than they look

Three effects compound. They **mask the next defect**: a guard that swallows a null, a
clamp that bounds a value, a fallback that substitutes a default can each turn the next
real fault into silence, in code the session itself wrote. They **corrupt the baseline**:
a later round compares against a system that has been quietly altered, so an
improvement or regression may belong to a guard from three rounds ago and be
attributed to the current idea. And they **read as design**: the next maintainer
cannot tell a guard that answers a real case from one that answered a guess, and the
safest assumption is to keep it.

The last one is why revert is not optional politeness. A change with no recorded
reason is indistinguishable from a deliberate one, and deliberate things are not
deleted.

## Revert exactly the rejected change

Not the whole working tree, and not the probes. Revert the specific lines written for
the rejected hypothesis, by reading the diff and removing those hunks, and leave
anything evidence supports. Where two hypotheses shared an edit, the edit is rejected
only when all hypotheses it served are. After the revert, run the confirmed
reproduction once into a labelled sink if there is any doubt that the baseline is what
you think it is; a revert is a change and can be wrong
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Boundary with runtime rollback

An automatic rollback
([auto-rollback](../../../../backend-platform/resilience/self-healing/techniques/auto-rollback.md))
is a system healing itself: a runtime component that reverses a change when a health
signal degrades. This technique is a person's or an agent's own edit discipline inside a
working tree, with no runtime component and no health signal; the signal is the verdict
the evidence returned. Different actor, different trigger, and the same instinct that
a change which did not earn its place goes away.

## The case where the defect moved

If the failure changed shape after an edit rather than vanishing, treat the edit as
rejected for the original hypothesis and examine what the new shape says. A moved
defect often means the edit was masking: the guard intercepted the original path and
exposed a second one. The shape change is itself a datum, and it is only readable on a
baseline that still has the original behaviour, which is another reason the revert
comes first.

## When not to use it

A change made for a rejected hypothesis that is independently correct — it fixes a real
second defect the evidence also shows — is not speculative. Keep it, but promote it:
state the evidence that supports it, as its own fix, so it stops being a leftover and
becomes a decision.
