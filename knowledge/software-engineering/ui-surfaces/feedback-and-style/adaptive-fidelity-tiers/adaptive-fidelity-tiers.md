---
layer: golden-path
type: golden-path
subject: adaptive-fidelity-tiers
status: forged
use_when: [a rich visual surface stutters on some devices and not others, choosing between shipping an effect everywhere and gating it on a device guess, adding an ambient or decorative effect that has a cost knob, a capability check is about to read a user-agent or a core count]
techniques:
  - measured-not-declared-capability
  - asymmetric-tier-transitions
  - measurement-settle-budget
  - probe-deferral-to-idle
  - per-tier-budget-tables
  - preference-short-circuits-measurement
---

# Adaptive fidelity tiers

A product with any optional visual richness — ambient particles, layered
gradients, parallax, blur, a background that breathes — eventually meets a
device that cannot afford it. There are only three answers to that, and two
of them are wrong. Ship the richness everywhere and accept that some users
get a stuttering page. Gate it on a declaration the device makes about
itself — a user-agent string, a core count, a memory hint, a "is this a
phone" guess — and be wrong in both directions on hardware nobody tested.
Or **measure the frame cost of your own page, on this device, in this
session, and let every effect scale itself to what the measurement found.**

An adaptive fidelity tier is that third answer made structural: a small
ordinal value — full, reduced, floor — produced by one component from the
application's own observed frame times, and read by every effect that has a
cost knob. The tier is not a fact about the hardware. It is a fact about
what *this page* costs *this machine* right now, which is the only question
whose answer would have changed what you render.

The subject is not large, and almost all of its difficulty sits in three
places nobody anticipates: the transitions between tiers, the point at
which the measurement stops, and the moment the measurement begins. A
system that gets the statistic right and those three wrong is worse than
having no tier at all, because it adds a visible pulse to the page and a
permanent cost to the device it was built to protect.

## What this subject owns, and what sits next to it

The **motion system** owns authoring discipline: which properties an
animation may touch, how long an entrance may run, how far ambient movement
may travel, and whether a given gesture is permitted to degrade to nothing.
Every one of those decisions is made once, at design time, and holds
identically on every machine that ever loads the page. This subject owns
the one quantity that authoring cannot settle — how much of that
already-disciplined work *this* device, in *this* session, can actually
afford — and it is a runtime value that changes while the page is open. The
rule for picking: if the question is "should this gesture exist, how long
should it run, and may it disappear entirely", it is a motion-system
question and the answer is the same for every user. If the question is "how
many of them, at what complexity, right now", it is this subject's, and two
users looking at the same screen are entitled to different answers.

A **plan entitlement** reads like a tier and is its opposite in every
property that matters. An entitlement is decided by a server from a
commercial fact, is authoritative, must be identical on every device its
holder signs in from, and may never be renegotiated by anything the client
observes — a client that measured its way into a richer plan is a billing
defect. A fidelity tier is decided by the client from its own observation,
is advisory, is *expected* to differ between two devices of one user, and
is *expected* to change mid-session. Neither may borrow the other's
mechanism: an entitlement that adapts to observation is a hole in the
paywall, and a fidelity tier fetched from a server is a guess with a
network round trip attached to it.

A **build-time capability gate** decides what is in the shipped artifact at
all — a decision made once by whoever ran the build, identical for everyone
who receives that artifact, and unchangeable at runtime. This subject
decides how much of what shipped actually gets used. The two compose in one
direction only: an effect gated out of the build has no tier row at all,
and no measurement can conjure code that was never compiled. The test that
separates them cleanly is whether the answer may differ between two users
of the *same* deployed artifact — if it may, it is a fidelity tier; if it
differs only between artifacts, it is a build gate.

## The declared signals are wrong in both directions

The reason to measure rather than ask is not purity; it is that every
declaration available is wrong, and wrong asymmetrically enough that no
correction factor helps.

They **under-serve capable devices**: a recent phone announces itself as
mobile, reports a modest core count, and gets the stripped experience while
comfortably outrunning the median laptop that got the rich one. A high
pixel density reads as a premium device and is simultaneously a reason the
same device has four times as many pixels to fill.

They **over-serve incapable ones**, which is the expensive direction: a
desktop with a generous core count driving an enormous display from an
integrated graphics chip; a machine that is thermally throttled, on battery
saver, running inside a virtual machine, or compositing in software because
acceleration was disabled or blocklisted; a browser with forty other tabs
holding the main thread. Every one of those declares itself fast and drops
frames. A core count describes what the machine could do if this page were
the only thing it were doing, which is never the situation the user is in.

And a declaration cannot express change. The same device is a different
device ten minutes later, when the fan spins up or the battery drops below
a threshold; the only signal that follows the device down is one taken from
the device's own recent behaviour. Layered on top of all of it: capability
sniffing is the raw material of fingerprinting, and platforms are steadily
freezing, coarsening, and removing exactly these signals for that reason.
Building an experience on them is building on a shrinking foundation.

What replaces them is not a synthetic benchmark, which measures the
benchmark. It is the application's own frames, at the application's own
workload, summarised as a high percentile over fixed-size windows — the
detail of which statistic, over what window, against which deadline, is
[measured-not-declared-capability](./techniques/measured-not-declared-capability.md).

## The transitions are where this is won or lost

The two errors a tier can make are not equally expensive. One tier too rich
is visible stutter — the exact failure the system exists to prevent, felt
immediately, on the device least able to absorb it. One tier too lean is a
slightly plainer page that almost nobody notices. So the transition rules
are deliberately lopsided: **one bad window downgrades; a run of
consecutive good windows is required to upgrade.** The system falls
instantly and climbs slowly, because that is the shape of the cost.

Lopsidedness alone is not enough, because adaptation creates a feedback
loop with real gain: changing the tier changes the workload the next window
measures. With a single threshold, a device sitting on it alternates
forever — the lean tier measures well and upgrades, the rich tier costs two
milliseconds more and downgrades, and the user watches the page pulse
between two visual treatments, which is worse than either. The fix is
hysteresis: two thresholds with a **dead band** between them, and a window
landing in the band is neither good nor bad — it does not downgrade, and it
**resets the upgrade counter**. Consecutive has to mean consecutive, or a
device producing alternating good and neutral windows accumulates its way
into a tier it cannot hold. The thresholds, the counter, the skip-down rule
and the no-remount requirement are
[asymmetric-tier-transitions](./techniques/asymmetric-tier-transitions.md).

## The measurement must end

The instinct is to leave the probe running, because the device really does
change mid-session. Resist it. A permanent per-frame sampler is a permanent
cost, and it is paid precisely by the device that could least afford it — a
system spending a fraction of a millisecond per frame to determine whether
this device can spare a fraction of a millisecond per frame has become its
own answer. It is the observer effect stated as a budget line.

The value of continued measurement also decays sharply. The first few
windows carry nearly all of the information; the hundredth window on a
settled device repeats what the third one said. So the probe carries a
**wall-clock settle deadline**, and when the deadline passes it stops for
the rest of the session — unconditionally, whether or not the tier ever
settled, resolving an unsettled flapping device to the lower of the tiers
it flapped between. The legitimate need to notice a mid-session change is
met with cheap, event-shaped re-arming — returning to the foreground after
a long absence, entering a heavier view — which costs nothing until the
event happens and gets a fresh deadline when it does. Polling costs
something always.
[measurement-settle-budget](./techniques/measurement-settle-budget.md)
holds the deadline, the stability condition, and the re-arm triggers.

## The measurement must also begin at the right moment

The frames immediately after first paint are the most expensive of the
session and the least representative of it: style and layout for the whole
document, fonts loading and swapping, images decoding, the first data
arriving, the framework's own initial render. A probe that starts at frame
zero measures the load, concludes the machine is slow, and demotes a fast
device on the strength of work it will never repeat. Worse, it *competes*
with the paint it is measuring, adding its own cost to the busiest frames
in the session and making its own verdict more pessimistic.

So the first sample is scheduled for idle — with a timeout, because on the
genuinely slow device that this whole subject exists to serve, idle may not
arrive for many seconds or at all, and an idle request without a deadline
is a probe that never runs on the machine that most needed it. What runs
before the first window lands is a *declared* default, and the effects that
are expensive during load do not start rich and get cut; they arrive when
the tier is known. **The first transition should be an arrival, not a
removal** — a downgrade that takes away something the user has already seen
is a visible loss, while an effect that appears a beat late is not.
Scheduling, the fallback, and the unmeasured state are
[probe-deferral-to-idle](./techniques/probe-deferral-to-idle.md).

## The tier's meaning lives with the effect

The tier is one small ordinal value. What it *means* is not a fact about
the tier; it is a fact about each effect, because only that effect's author
knows which of its parameters is superlinear in cost and which is nearly
free. So each effect declares its own small table — count, radius, layer
depth, update interval, whether one extra pass runs — keyed by the shared
tier vocabulary and living beside the effect's own implementation.

Not every effect owes a table, and a system that demands one from all of
them defeats itself: a hundred cheap composited transitions each holding a
subscription make the tier the most expensive thing on the page. The
obligation is graded by how much an effect costs — an effect driving its
own clock must carry a table, one that forces expensive compositing should,
and a small composited transition is exempt because it costs less than the
consultation. The tier the effect belongs to is a rendering-cost judgement
the motion system owns; what belongs here is publishing an obligation per
class, so the question "does this new effect need a budget?" is looked up
rather than estimated by the author, who will estimate generously.

The shape is what makes the system maintainable. A global correction — "the
reduced tier was still too generous" — is one constant in one place, and
every effect re-reads its own row without a single component being edited.
The full cost of any tier is enumerable by reading the tables rather than
by finding a slow laptop. And an effect that can only obtain its parameter
through the table cannot be written in a way that forgets the tier exists.
Two rules keep it honest: the table is read at render, not captured once at
mount, or the effect never sees a downgrade; and the table's rows are the
effect's own parameters, so the floor row can be a *reduced* value rather
than an absent one. Whether a particular effect is permitted to reach zero
at all is a motion-system question and is not answered here — this subject
only insists that the table be able to express a floor, because a product
whose every floor row is zero has two designs and only designed one of
them. The table shape is
[per-tier-budget-tables](./techniques/per-tier-budget-tables.md).

## An expressed preference outranks a measurement

When the user has an explicit reduced-motion preference set, the probe does
not run at all — no idle request, no sampling loop, no windows, no
transitions. The tier resolves immediately and stays there. Three reasons,
and the third is the one that gets missed: there is nothing left to budget
for, because the expensive effects are already off; the still-running probe
would then be the single largest thing the system contributes to the frame,
the adaptation outliving the thing it adapted; and a user who has asked for
less has not asked to be profiled. Responding to an accessibility
preference by starting a device-performance measurement — which is, in
aggregate, a fingerprinting surface — is the opposite of the request.

The same logic covers any explicit quality control the product offers its
users. A measured tier is a *default for people who have not said what they
want*, never an override of someone who has. The placement rule, and why
the short-circuit must sit before the scheduling rather than inside the
sampler, is
[preference-short-circuits-measurement](./techniques/preference-short-circuits-measurement.md).

## What this subject refuses

- **Branching on a declaration.** A user-agent test, a core count, a memory
  hint, or a "is this mobile" flag decides fidelity by guessing at the
  thing it could have measured.
- **A synthetic benchmark at startup.** It measures the benchmark, on the
  frames where the page can least afford it.
- **A mean frame time.** The average is dominated by the frames that were
  fine; what the user perceives is the long tail, so the statistic is a
  high percentile or a count of frames over the deadline.
- **A single threshold.** One number for both directions is an oscillator
  with the page as its output.
- **A probe that never stops.** A permanent measurement is a permanent tax
  on the slowest device in the fleet.
- **A tier captured at mount.** An effect that reads the tier once cannot
  respond to the downgrade that was the point.
- **A tier change that remounts.** Tearing effects down and rebuilding them
  makes the correction itself a jank event.
- **Probing a user who asked for less.** An explicit preference ends the
  measurement's job before it starts.
- **A tier constant without its derivation.** A bare threshold nobody can
  re-derive gets tuned by whoever is least informed.

## The techniques

- [measured-not-declared-capability](./techniques/measured-not-declared-capability.md)
  — a high percentile of observed frame time over fixed-size windows, why
  every declared signal fails in both directions, and what each threshold
  constant must carry.
- [asymmetric-tier-transitions](./techniques/asymmetric-tier-transitions.md)
  — one bad window down, N consecutive good windows up, and the dead band
  that resets the counter so a boundary device cannot flicker.
- [measurement-settle-budget](./techniques/measurement-settle-budget.md) —
  the wall-clock deadline after which the probe stops, the stability
  condition, and event-shaped re-arming instead of polling.
- [probe-deferral-to-idle](./techniques/probe-deferral-to-idle.md) — idle
  scheduling with a timeout fallback, the unrepresentative first frames,
  and the declared pre-measurement default.
- [per-tier-budget-tables](./techniques/per-tier-budget-tables.md) — each
  effect declaring its own parameters per tier, read at render, with a
  floor row that can be a reduction rather than an absence.
- [preference-short-circuits-measurement](./techniques/preference-short-circuits-measurement.md)
  — an explicit preference skipping the probe entirely, and why the branch
  belongs before the scheduling.
