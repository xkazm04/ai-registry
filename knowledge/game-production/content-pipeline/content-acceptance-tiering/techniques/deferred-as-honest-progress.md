---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: deferred-as-honest-progress
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [choosing the status vocabulary for a content gate, a board is permanently red, an expensive gate cannot run in this environment]
---

# Deferred as honest progress

A fourth status, alongside pass / fail / pending, meaning: **this check could not run
here, for a stated structural reason, and its absence is expected.** This technique
argues for the fourth status, specifies its legal reasons, and gives the invariant that
turns it from a loophole into an audit instrument.

## The three-status trap

With only pass / fail / pending, an unrunnable check must be encoded as one of them, and
each encoding costs something specific:

- **As pass** — evidence is manufactured from nothing. Every roll-up above this point is
  now wrong, and the wrongness is silent and permanent. This is the encoding teams
  choose under deadline pressure and the one that ends careers.
- **As fail** — the board is red for a condition no author can fix. Within two
  iterations, red stops meaning "act". You have destroyed the alerting property that was
  the ladder's entire product, in exchange for nominal correctness.
- **As pending** — unrunnable becomes indistinguishable from unstarted. Planning reads
  the ladder and schedules work that no author can perform; the backlog fills with
  phantom tasks; and the genuinely unstarted items are camouflaged among them.

There is no fourth option inside three statuses. The state *evaluated as absent, and the
absence is legitimate* is a distinct epistemic state and needs a distinct value.

## What separates deferred from pending

Both mean "no verdict yet". They differ in **who is blocked**.

- **pending** — blocked on an *author*. The work this check examines has not been done.
  Someone can sit down and unblock it today.
- **deferred** — blocked on an *environment*. The work may be entirely finished; what is
  missing is a running system, a built client, a rendering surface, or an attached
  harness. No amount of authoring changes it.

That distinction is the one planning actually needs, which is why collapsing it is so
expensive. It also determines who is notified: pendings go to the content owner,
deferrals go to whoever owns the environment.

## The clean-run invariant

The rule that gives the status its teeth:

> After a clean production run, every step of every produced artifact is either **pass**
> or **deferred**. Never **fail**. Never **pending**.

This converts the status vocabulary into an audit of the producer:

- A **fail** after a clean run means the producing process emitted something broken and
  reported success. That is a producer defect, not a content defect, and it is routed
  differently.
- A **pending** after a clean run means a step was skipped without anyone recording that
  it was skipped. That is a hole in the pipeline, and it is the failure mode that
  otherwise stays invisible for months.

So the four statuses partition cleanly: two of them (`fail`, `pending`) are assertions
about the *pipeline* when they appear post-run, and two (`pass`, `deferred`) are
assertions about the *artifact*. Any team can check this invariant with one query after
every run, and the query is the cheapest real audit in the whole system.

## Legal deferral reasons must be enumerated

Free-text deferral reasons degrade into a mute button within a quarter. The reason is
constrained to a closed set of *environmental or structural preconditions*, each of which
names something outside the author's control:

- the runtime harness is not attached in this environment;
- a built client is required and none exists for this revision;
- this content class has no representation at this rung;
- an upstream dependency is itself unresolved, named explicitly.

And a closed set of things that are **not** legal deferral reasons, because each is a
judgment dressed as a precondition:

- *not important for this item*;
- *will do later*;
- *too expensive right now*;
- *the check is flaky*.

The last one deserves emphasis: a flaky check is a broken check. Deferring around
flakiness hides a defect in the instrument, and an instrument nobody trusts is worse
than no instrument, because it still consumes attention. Fix or delete it.

## Deferral is scoped by rung, not by artifact

Which rungs may defer is a property of the ladder, fixed at design time, not a decision
made per artifact. Rungs that need only the artifact and the graph it participates in
may never defer — that environment is always present, so a deferral there is a skipped
free check. Rungs that need a running system or a rendered frame may defer, and their
deferral is what the configuration-complete predicate is permitted to tolerate.

Enforce this in the shape of the data if you can: make the deferral reason type
per-rung, so a low rung has no legal reason to construct.

## Defer at the rung of the missing evidence

A subtlety that costs a day to rediscover: when a check composed at one rung defers, the
deferral is reported at **the rung of the evidence that is missing**, not the rung the
check was written at. A structural check that cannot conclude because no rendered asset
exists defers at the perceptual rung, because a rendered asset is what would resolve it.
Report it at the structural rung instead and two things break — the completion predicate
sees an illegal low-rung deferral and refuses configuration-complete, and the runner
that drains gates by rung never picks the work up.

The rule generalizes: **a deferral is tagged by what would resolve it.** That is what
makes the deferral queue routable.

## A deferral must not mask a failure

When several checks are composed into one step's verdict and the composition reports the
first non-pass, ordering becomes semantic. Put the deferral-prone check **last**. A
deferral evaluated first will shadow a genuine failure sitting behind it, and the step
displays as legitimately-waiting when it is actually broken — the single worst confusion
this vocabulary can produce, because it routes a defect to the environment owner and
takes it off the author's list.

Where the composition can report all results rather than the first, do that instead, and
let the reader see a failure and a deferral standing side by side. Where it cannot,
ordering is not a style preference; write it down as a rule with this reason attached.

## Deferral counts are a first-class metric

Track, per rung, the ratio of deferred to total, and watch its trend. A rung whose
deferral ratio climbs is a rung being quietly abandoned, and it will be at ninety
percent deferred long before anyone proposes deleting it. Two useful thresholds from
practice: a rung above roughly half deferred across a content class is no longer
providing evidence about that class and should be either resourced or removed from the
class's applicable set; a rung that has not produced a single non-deferred verdict in a
full production cycle is not a rung, it is a plan.

## When not to use this

Do not add `deferred` to a system whose checks all run in one environment. Four statuses
where three suffice invites misuse — someone will find a way to defer, because the value
exists. The status earns its place exactly when some rungs need an environment others do
not.

Do not use `deferred` for a check that is *disabled*. A disabled check should disappear
from the artifact's applicable rung set, so the denominator shrinks honestly. Deferral
keeps the denominator and says the numerator is unknown; disabling says the question does
not apply. Conflating them makes completion ratios unreadable.
