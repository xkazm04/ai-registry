---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: measured-not-declared-capability
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a capability check is about to read a user-agent or core count, deciding what statistic a device tier is computed from, a fast device is getting the stripped experience and a slow one is stuttering]
---

# Measured, not declared, capability

The tier is computed from the frame times the application itself produced,
over its own workload, in this session. Nothing about the hardware is
asked, and nothing is inferred from what the device says about itself.
This is [a gate observing its target](../../../../_laws.md#gate-sees-target)
applied to rendering budget: every declared signal is a proxy, and a proxy
diverges from the target exactly when the divergence matters.

## Why every declaration fails, in both directions

The failure is not noise around a usable centre. It is bias in opposite
directions on different populations, which is why no calibration constant
rescues it.

**Under-serving capable devices.** A recent phone reports itself as mobile,
offers a modest core count, and receives the stripped experience while
comfortably outrunning the median laptop that received the rich one. Pixel
density is read as a premium signal and is simultaneously the reason that
device has several times as many pixels to fill — the same number argues
both ways and the code picks one. Reduced-capability heuristics also catch
whole classes of hardware nobody on the team owns, and no one ever reports
"the site was less pretty than it needed to be".

**Over-serving incapable ones**, which is the expensive direction. A
desktop with a generous core count drives an enormous display from an
integrated graphics chip. A machine is thermally throttled, on battery
saver, inside a virtual machine, or compositing in software because
acceleration was disabled or blocklisted. A browser holds forty other tabs
and the main thread is not the page's to spend. Every one of these declares
itself fast and drops frames. A core count describes what a machine could
do if this page were the only thing it were doing, which is never the
situation any user is actually in.

**And a declaration cannot change.** The same device is a different device
ten minutes later, when the fan spins up or the battery crosses a
threshold. Only a signal taken from the device's own recent behaviour
follows it down.

There is a fourth argument that decides the matter independently of
accuracy: these signals are the raw material of fingerprinting, and
platforms are steadily freezing, coarsening, and removing them. An
experience built on them is built on a foundation that is being withdrawn
on someone else's schedule.

## What to measure, and the statistic

Not a synthetic benchmark — a benchmark measures the benchmark, and it does
so during the frames the page can least afford to lend it. Measure the
interval between the application's own rendered frames, while it is doing
what it actually does.

**Summarise a fixed-size window with a high percentile, never a mean.** The
average is dominated by the frames that were fine; what a user perceives is
the long tail. A page that renders forty-five clean frames and three
eighty-millisecond frames has a comfortable mean and a visible hitch. Take
a high percentile of the window's intervals, or equivalently count the
frames in the window that exceeded the deadline and threshold on that
count. Either way the statistic is about the bad frames, because the bad
frames are the whole phenomenon.

**Windows are fixed in sample count, not in wall-clock duration.** A
fixed-duration window contains far fewer samples on a slow device, and a
percentile over twelve samples is not the same statistic as a percentile
over sixty — the measurement would become less trustworthy exactly where it
is being relied upon most. Fixed sample count makes every window's number
comparable to every other window's.

**The window is the unit of decision.** A continuously updated running
estimate has no boundary at which anything can be counted, so "one bad
window" and "three consecutive good windows" — the whole transition
mechanism in
[asymmetric-tier-transitions](./asymmetric-tier-transitions.md) — would
have nothing to attach to. Windows close; decisions happen at closings.

**The threshold is an absolute duration, not a fraction of the display's
budget.** A high-refresh panel has a shorter frame budget, and a device
comfortably serving it will show frame times well under the conventional
sixteen milliseconds. Deriving the threshold from the panel's cadence makes
the best displays fail first. What is being detected is *perceptible
stutter*, and perceptible stutter begins at roughly the same absolute
duration whatever the panel is doing.

**Discard windows that are not about the page.** A window spanning a
visibility change, a tab returning to the foreground, or a suspension
reports catastrophic intervals for a device that is entirely healthy,
because the clock was throttled or stopped rather than because a frame was
slow. Sample only while the surface is visible, and throw away any window
that straddles the boundary rather than letting it decide a tier.

## Every constant carries its derivation

A threshold, a window size, a percentile, and a run length are four numbers
that will be tuned by someone who was not there when they were chosen. A
bare number is [a count without its predicate](../../../../_laws.md#count-carries-predicate):
it cannot be re-derived, so it gets adjusted by whoever is least informed
and the adjustment is never reviewable.

So each constant states, at its definition, what it is a measurement of and
where it came from: which percentile of what, over how many samples,
against which deadline, and the reasoning that produced the specific value
— "two frames' worth of budget at the lowest refresh rate we support",
"long enough that one garbage-collection pause cannot decide a tier", "the
shortest run in which two independent slow devices stopped flapping". The
comment is not documentation; it is the thing that makes the next tuning a
decision instead of a guess. A constant nobody can re-derive is a constant
nobody may safely change, which in practice means it never changes and the
tier stays mis-tuned forever.

## When not to use this

If the product has no effect with a genuine cost knob — nothing whose count
or complexity could be scaled — there is nothing for a tier to feed and the
measurement is pure overhead. Measure when the answer would change what you
render, and not before. And if the whole visual budget consists of one
effect that is either present or absent, the decision is a design one, not
a measured one: ship the cheap version to everyone rather than building an
adaptive system to choose between two states.
