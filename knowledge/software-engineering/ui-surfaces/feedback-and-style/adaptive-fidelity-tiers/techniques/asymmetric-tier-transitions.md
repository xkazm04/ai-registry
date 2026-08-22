---
layer: technique
type: technique
subject: adaptive-fidelity-tiers
technique: asymmetric-tier-transitions
status: forged
laws: []
shared_with: []
use_when: [wiring the rule that moves a device between fidelity tiers, a device visibly pulses between two visual treatments, deciding how quickly richness may be restored after a slow patch]
---

# Asymmetric tier transitions

A tier that moves by the same rule in both directions is either too slow to
protect the device or fast enough to oscillate. The transition rules are
deliberately lopsided, and the lopsidedness has two independent
justifications that happen to point the same way.

## Down on one window, up on a run

**One bad window downgrades, immediately.** **A run of N consecutive good
windows is required to upgrade.**

The first justification is cost asymmetry. Being one tier too rich is
visible stutter — the precise failure the system exists to prevent, felt at
once, on the device least able to absorb it. Being one tier too lean is a
slightly plainer page, and the number of users who have ever noticed that a
background had six drifting shapes instead of twelve is approximately zero.
When the two errors differ that much in cost, the estimator should be
biased, and it should be biased toward lean.

The second is evidential. A single bad window is strong evidence: something
on this machine, right now, cost more than the frame budget, and the tier's
job is to respond to that. A single good window is weak evidence, because
the cheap explanation — the page happened to be idle for those frames — is
at least as likely as the expensive one. Requiring a run is what converts
weak evidence into a decision, and three to five consecutive windows is the
usual honest range: fewer and idle stretches promote devices that will
stutter the moment they are used; more and a genuinely capable device that
hit one slow patch spends the rest of the session under-served.

**A downgrade may skip rungs; an upgrade may not.** A catastrophically bad
window — several multiples of the budget — means the current tier is not
merely marginal, and walking down one rung at a time costs one bad window
per rung, which is visible stutter repeated on the worst device in the
fleet. Going straight to the floor and climbing back is strictly kinder.
Climbing, by contrast, is always one rung at a time, because every rung is
a new workload the run of good windows said nothing about.

## The dead band, and why the counter resets in it

Adaptation is a feedback loop with real gain: changing the tier changes the
workload that the next window measures. With a single threshold, a device
sitting on it alternates forever. The lean tier measures well, so it
upgrades; the rich tier costs two milliseconds more, so the next window is
bad and it downgrades; the lean tier measures well again. The user watches
the page pulse between two visual treatments — which is worse than either
tier, and worse than the un-adapted page the whole system replaced.

The fix is hysteresis. **The downgrade threshold and the upgrade threshold
are different numbers with a gap between them**, and the gap is wider than
the cost difference between adjacent tiers — otherwise the loop still
closes, just more slowly. Sizing it is empirical and it is worth doing
honestly: measure one effect-heavy view at two adjacent tiers on a
mid-range device, take the difference in the percentile, and make the band
comfortably larger than that.

A window landing inside the band is **neither good nor bad**. It does not
downgrade. And — the part that is routinely omitted — it **resets the
upgrade counter**. A naive implementation resets only on a downgrade, so a
device producing good, neutral, good, neutral, good accumulates three
"good" counts across five windows and promotes itself into a tier it cannot
hold; two windows later it drops back, and the pulse the dead band was
introduced to prevent reappears with a longer period. Consecutive means
consecutive. The counter has exactly one increment path and every other
window outcome zeroes it.

## Keep the ladder short

Three tiers is the right number: full, reduced, and floor. Every additional
rung adds another boundary to oscillate at, another row in every effect's
table that nobody will tune, and a difference between adjacent tiers too
small for any designer to have chosen deliberately. If two adjacent tiers
cannot be told apart in a screenshot, they are one tier with two names, and
the ladder should be shortened rather than the thresholds re-tuned.

## A tier change must not remount

The transition is a parameter change, not a lifecycle event. Effects read
the new row and continue with different values; they are not torn down and
rebuilt. This matters more than it sounds: a downgrade that unmounts and
remounts a dozen effects does its layout and paint work in one frame, on a
device that just proved it cannot afford a frame — the correction becomes a
jank spike, and on a boundary device the spike itself provokes the next bad
window. Where a parameter genuinely cannot change in place, the effect
crossfades between the old and new configuration rather than cutting, and
the crossfade is the cheapest thing in the effect.

Related: **the tier is delivered to effects as a live value, not a
snapshot.** An effect that captures the tier at mount and never re-reads it
is immune to every transition described here, which is a defect that
presents as "the adaptive system does nothing" and survives review because
the code appears to consult the tier.

## When not to use this

If the product has exactly one adaptive effect and it is cheap to toggle,
the ladder and its counters are ceremony — a single threshold with a
generous margin, checked once, is defensible. The transition machinery
earns its complexity when several effects share the tier and when the tier
can change during a session; if it cannot change during a session, what is
being described is a startup decision and it belongs in
[probe-deferral-to-idle](./probe-deferral-to-idle.md)'s declared default,
not in a transition rule.
