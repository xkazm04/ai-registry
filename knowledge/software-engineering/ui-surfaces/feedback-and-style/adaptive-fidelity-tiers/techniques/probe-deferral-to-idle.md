---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: probe-deferral-to-idle
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [deciding when a capability probe first samples, a fast machine is being demoted during page load, an idle-scheduled callback may never fire on the slow devices that need it]
---

# Probe deferral to idle

The first sample is scheduled for when the main thread reports itself idle,
with a timeout that fires the probe anyway. Two mechanisms, and each one
exists because the other alone is broken.

## The first frames are the wrong frames

The frames immediately after first paint are the most expensive of the
session and the least representative of it. Style and layout run for the
whole document. Fonts load and swap, forcing re-layout. Images decode. The
first data arrives and re-renders the surfaces waiting for it. The
framework performs its own initial render, which is the one render it never
does incrementally.

A probe that starts at frame zero measures all of that, concludes the
machine is slow, and demotes a genuinely fast device on the strength of
work it will never do again. The correction then costs a run of good
windows to undo, so the fast device spends the visible beginning of its
session at a reduced tier for no reason.

And it is worse than an inaccurate reading, because the probe **competes
with the paint it is measuring**. Installing a per-frame callback, a buffer
and a percentile pass during the busiest frames in the session adds cost to
exactly those frames, which makes the verdict more pessimistic, which is a
measurement that biases itself. Deferring is not politeness toward the
load; it is the only way the number means anything.

## An idle request without a deadline never fires on a slow device

The obvious deferral — ask the platform's idle scheduler to run the first
sample when there is spare time — has a failure mode that lands precisely
on the population the whole subject exists for. On a genuinely busy page,
on a genuinely slow machine, idle may not arrive for many seconds, or at
all. The result is a probe that runs on every fast device and never on a
slow one, leaving the slow device at whatever default was declared, which
is the outcome the adaptive system was built to avoid.

So **every idle deferral carries a timeout: idle, or this many
milliseconds, whichever comes first.** A few hundred milliseconds to a
couple of seconds is the useful range — past the initial paint burst,
before the user has formed an impression of the page. Whichever path wins,
it **cancels the other**, and both handles are cancelled if the surface
tears down first: an idle handle and a timer are two reapers, and a
callback landing in a torn-down context is the classic shape of this bug
([creation names its reaper](../../../../_laws.md#creation-names-reaper)).

Where no idle scheduler exists at all, the timeout is the whole mechanism
and that is fine. What is not fine is treating its absence as a reason to
sample immediately.

## Unmeasured is a state, not a tier

Before the first window closes there is no measurement, and the system must
say so rather than quietly meaning "capable". A probe that could not run —
no clock, the surface never visible, the scheduler unavailable — must be
distinguishable from a probe that ran and found the device fast; collapsing
the two is
[failure spelled the same as empty success](../../../../_laws.md#failure-not-empty-success),
and it hides the case where the measurement silently never happened for
anybody.

So the unmeasured state resolves to a **declared default** — an explicit
constant with a comment saying why that rung, which is the tier you would
have shipped to everyone if measurement had been impossible. Not the top
tier by omission, and not a value that happens to be first in an
enumeration.

## The first transition should be an arrival, not a removal

Which rung the default should be has a better answer than "high" or "low".
Effects that are expensive *during load* should not start rich and then get
cut, because a downgrade that removes something the user has already seen
is a visible loss, and it lands during the seconds when the user is
deciding whether the page is any good. An effect that simply appears a beat
later is not a loss — it reads as the page finishing, which is what is
happening.

The rule that follows: **load-phase-visible effects mount at or below the
declared default and step up when the first window lands; effects that only
appear after interaction may take the default optimistically.** The result
is that the common transition on a fast device is an upgrade — richness
arriving — and the common transition on a slow device is nothing at all,
because it was never given anything to take away.

This also removes the temptation to make the pre-measurement window shorter
by sampling sooner, which is how a team ends up back at frame zero.

## Sequence

1. If an explicit preference or user quality setting is set, do not
   schedule anything
   ([preference-short-circuits-measurement](./preference-short-circuits-measurement.md)).
2. Publish the declared default tier; load-phase effects mount at or below
   it.
3. Request an idle callback **and** set a timeout; the winner cancels the
   loser.
4. On whichever fires, start sampling; discard any window that straddles a
   visibility change.
5. First window closes: publish a real tier, and the transition rules in
   [asymmetric-tier-transitions](./asymmetric-tier-transitions.md) take over.
6. Stop on the settle budget
   ([measurement-settle-budget](./measurement-settle-budget.md)).

## When not to use this

If the surface's expensive effects do not exist until after a user
interaction — a heavy view reached by navigation, a visualisation behind a
control — the load-phase argument does not apply and the probe can simply
start when that surface mounts. Deferral matters when the measurement would
otherwise overlap the application's own first paint. It also does not apply
to a re-arm, which by construction happens on a settled page: a re-armed
probe samples straight away.
