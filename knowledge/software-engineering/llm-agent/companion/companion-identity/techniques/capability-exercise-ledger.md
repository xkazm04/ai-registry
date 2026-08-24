---
layer: technique
type: technique
subject: companion-identity
technique: capability-exercise-ledger
status: forged
laws: [gate-sees-target, failure-not-empty-success, derivation-names-recomputation]
shared_with: []
use_when: [an agent's self-description lists things it can do, a capability quietly stopped working, writing documentation of what a companion is able to do]
---

# The capability exercise ledger

A companion has two accounts of what it can do. One is the set of actions its
host actually permits and implements. The other is the prose it and its person
rely on — the self-description, the help text, the mental model. These drift
apart immediately, in both directions, and neither drift announces itself.

The described-but-absent direction produces a companion that confidently offers
something that was removed in a refactor eighteen months ago, discovers the
failure mid-task, and spends the person's trust on it. The present-but-
undescribed direction is quieter and costs more in aggregate: a real capability
nobody ever offers, so the person keeps doing that job by hand for years next to
a companion that could have done it.

This technique closes both, with a derived inventory and a ritual that produces
evidence.

## The inventory is derived, not maintained

The document listing what the companion can do is **re-generated from the
permitted-action list**, not written by hand and not updated by discipline. The
action list is the authority: it is what the runtime consults, so it is
definitionally current, and any hand-maintained description is a copy that
drifts the first time somebody adds an action in a hurry.

Being a derived artifact, the inventory names its recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
a stated command regenerates it, running it is part of the routine that follows
any change to the action set, and regenerating produces no diff when nothing has
changed. Hand-written material — what a capability is *for*, its caveats, the
example that makes it click — lives in clearly-delimited sections that survive
regeneration, keyed by the action's identity rather than by its position in the
document.

Regeneration also reports the two deltas explicitly: **actions with no
description** and **descriptions with no action**. Those two lists are the drift,
made visible, and an empty pair is the only clean state.

## The ritual: exercise it, together, once

A derived inventory proves an action *exists*. It proves nothing about whether it
works, and the gap between "wired up" and "works for this person on this machine"
is where most phantom capabilities live.

So the person and the companion walk the inventory and **exercise each entry** —
actually invoke it, on real data, and look at what came back. This is not a test
suite and it is not trying to be one. A test suite checks the code paths the
authors thought of, in an environment the authors control; this ritual checks the
capability end to end in the only environment that matters, and it catches the
class of failure a suite structurally cannot: a credential that expired, an
integration whose other side changed, an action that works and produces something
useless, and an action whose output the companion cannot actually interpret.

Each exercise writes a durable entry: the capability, the date, the outcome, and
enough evidence to re-read later — what was invoked, what came back, what the
person concluded. The log is durable and append-only, because the interesting
question later is not "does this work" but "when did it stop".

## Three states, and unexercised is not a pass

The ledger has three states and they are all distinct:

- **Working** — exercised, on a date, with evidence.
- **Broken** — exercised, on a date, with the failure recorded.
- **Unexercised** — never tried.

Collapsing the third into either of the others is the defect this technique
exists to prevent. Treated as working, an unexercised capability is a claim
nobody has checked, presented with the same confidence as one that was checked
this morning. Treated as broken, it discourages use of something that is probably
fine. It is its own state, it renders as its own state, and a summary that
reports "14 capabilities" without splitting them is reporting a number that
cannot support the claim anyone will make with it.

The same discipline applies to the exercise itself: a capability whose exercise
could not be attempted — the integration was unreachable, the credential absent —
is **not** a failure of the capability and **not** a pass. It is a fourth
outcome, "could not test", and spelling it as either of the others is the most
expensive lie the ledger can tell
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Behaviour wins

The rule the whole ritual encodes, stated plainly: **when the documentation and
the behaviour disagree, the behaviour is right and the document is what
changes.**

This is not humility, it is a consequence of what a gate is allowed to read. A
check that inspects the self-description is checking a proxy; it passes exactly
when the proxy has diverged from the runtime, which is the case it existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Any assurance about
what the companion can do must be grounded in an invocation, and any statement
that survives an exercise proving otherwise is not a statement, it is a wish.

The corollary matters for the companion's own conduct: it does not assert a
capability it has not exercised. Offering to do something and discovering
mid-task that the action does not exist is worse for the person than saying "I
have this listed but have never used it — shall we try it and see?", which is
both honest and how the ledger gets filled.

## Cadence

Exercise the whole inventory on a slow cycle — after any change to the action
set, and otherwise on a stated interval — and let entries **age out** rather than
stand forever. An exercise from two years ago is evidence about two years ago;
the ledger states the date so a reader can judge, and a capability whose last
evidence is older than the interval reverts to unexercised rather than silently
retaining a stale pass.

Every entry's age is visible in the ledger, because the whole instrument is
worthless if a reader must assume its rows are current.

## When not to use this

This is for capabilities in the sense of **actions with side effects in the
world** — the small, enumerable set a host permits. Do not extend it to the
model's general abilities: "can it summarise well" is an evaluation question with
its own machinery, and a binary works/broken ledger row is the wrong instrument
for a graded competence. And for a large, fast-changing action surface the
person-in-the-loop ritual does not scale — there the derived inventory and the
drift report still pay, while the exercise becomes sampled rather than
exhaustive, with the sample stated so nobody mistakes it for coverage.
