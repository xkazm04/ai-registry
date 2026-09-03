---
layer: technique
type: technique
subject: native-shell-integration
technique: permission-gate-vector
status: forged
laws: [unknown-is-not-a-value, absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [a feature needs two or more capabilities the host grants separately, the shortcut is dead and nothing anywhere reports an error, users grant a permission in system settings and the product still says it is missing, deciding whether a missing permission should disable a control or annotate it, a permission prompt only ever appears once and users have already dismissed it]
---

# Permission gate vector

A feature that needs several host-granted capabilities is almost always shipped
with one readiness boolean, because at the moment it was written the author had
granted everything and the distinction had no observable consequence. It has
consequences for everybody else. The capabilities have **different blast
radii**, and the single boolean is forced to pick one of them: either it
includes every capability and disables the whole feature over a grant that
costs one optional stage, or it includes only the critical ones and the feature
appears armed while a stage of it silently does nothing. Both are worse than
the vector, and the vector costs a list instead of a flag.

## Classify by blast radius, not by importance

For each capability the feature depends on, ask one question: **does its
absence kill the feature, or degrade it?**

- **Killer.** Without the grant, no event is ever delivered, no input is ever
  observed, nothing downstream can run. Arming the feature is a promise the
  product cannot keep. Killers go into the gate that enables the control.
- **Degrader.** Without the grant, the feature runs and one stage of it is
  swallowed — a delivery that does not land, an enrichment that is skipped, a
  surface that does not appear. The work is still done and still reaches the
  user by some other route. Degraders never gate; they raise a notice attached
  to the stage they cost, phrased as what the user loses rather than as an
  error.

The classification is a property of the *pipeline*, not of the capability's
name or its scariness in the host's own settings surface. The same capability
can be a killer in one feature and a degrader in another, so it is classified
per feature and the classification lives beside the gate rather than beside the
capability.

The vector then has three products, and all three come from one place: the
boolean the control binds to (killers only), the list of unmet capabilities the
checklist renders (all of them, in a stable order), and the "everything is
green" predicate used for onboarding. Deriving those three from one declared
list rather than computing them at three call sites is the whole point
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary));
three hand-maintained conjunctions of the same capabilities drift the first
time a fourth capability is added.

## Poll the state, never discover it by trying

The capabilities in this class share a property that makes the obvious approach
fail silently: **denial does not raise**. The call that observes input returns
nothing forever; the call that posts an event returns success and the event is
dropped in transit. There is no exception to catch, so "try it and handle the
failure" degenerates into "try it and report success". Read the grant state up
front, through the host's dedicated query — the one that reports without
prompting — and branch on the answer.

Two hazards attach to that query and both are load-bearing:

- **The query has three answers, not two.** Granted, denied, and *not yet
  determined* are distinct, and so is a fourth state the product creates for
  itself: the query failed. Reading any of the last three as "denied" is
  survivable; reading a failed query as "granted" arms a dead feature, and
  reading "not determined" as "denied" sends a first-run user to a settings
  surface they never needed to open. Keep unknown out of the definite answers
  ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)), and
  when the query itself fails, hold the previous known state and say the check
  could not run.
- **The prompting call is not the query.** The host's request-and-prompt entry
  point returns "already granted" or queues a dialog and returns false. It is
  useful exactly once, from a deliberate, user-initiated point, so the dialog
  appears attached to the user's own action instead of as a side effect of some
  background initialisation the user cannot connect it to. Never call it to
  find out the current state.

## The system dialog cannot be the user interface

On the hosts that gate these capabilities, the first denial is usually final:
the host will not prompt again, and every later request is a silent no-op. A
product whose only path to the grant is the system dialog therefore has exactly
one chance per install, and it spends it during a first run when the user has
no context for the question. So the product's own surface is the durable path:
a persistent, inline notice next to the control the capability serves, naming
the capability in the host's own words, with an action that opens the host's
settings surface directly, and a recheck action beside it. The prompt, where a
prompt exists at all, is an accelerator on top of that surface — never the
surface itself. A guard whose only trigger is a dialog the user has already
dismissed is an absent guard
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

## The grant happens out of band, so reconcile on focus

The user does not grant these capabilities inside the product. They leave, flip
a toggle in a surface the product does not control and cannot observe, and come
back. Nothing notifies the product, and the naive reconciliation points are all
wrong: on mount is too early, on the next call is too late and has already
failed, and on restart is a lie the product tells because restarting was what
the author happened to do while testing.

**Recheck on the window regaining focus.** It is the one event that reliably
follows the user's return, it costs a cheap query, and it makes the notice
disappear at the moment the user expects it to. Mount plus focus covers every
real sequence. Where the same surface also depends on slower out-of-band work —
a download finishing in another view, an engine warming — poll that on an
interval instead, and stop polling once it is satisfied, because those answers
cannot change again without an explicit product action that can invalidate them
directly.

## Decision rules

- For each capability: absence kills → gate; absence degrades → notify. Never
  gate on a degrader; never merely notify about a killer.
- One declared vector, three derived products. No second conjunction anywhere.
- Query without prompting to read; prompt once, from a user-initiated point.
- A failed query is its own state and never collapses into granted.
- Recheck on refocus. Poll only what changes without the user leaving.

## When not to use this

- **One capability.** A feature with a single host grant has no vector; a
  boolean plus a notice is the whole design, and the classification question
  answers itself.
- **The host reports denial as an error you can catch.** Where the platform
  raises on the first denied call and the error is distinguishable from every
  other failure, the try-and-handle path is honest and the up-front poll is
  redundant work on every start.
- **The capability is not grantable on this host at all.** That is presence,
  not grant, and it is a different technique — treating it here produces a
  notice telling the user to open a settings surface their machine does not
  have.
