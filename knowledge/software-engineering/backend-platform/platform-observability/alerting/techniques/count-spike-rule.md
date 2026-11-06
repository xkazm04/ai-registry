---
layer: technique
type: technique
subject: alerting
technique: count-spike-rule
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [judging a daily count for a spike with no model fitting, a baseline of about eight same-weekday points, one earlier spike blinded the rule to the next, median and MAD fired more than the mean and standard deviation, a multiple-of-median guard misses a real surge, a series that is idle on many days, a daily cost anomaly rule]
---

# Count spike rule

A daily count judged for a spike has several separate problems, and each common rule solves
some of them by accident. Name them and the rule's constants stop being folklore. The figures
below come from a synthetic simulation with eight baseline points and a threshold of 2.5, re-run
independently on two seeds. They show the shape of each trade. They are not rates from real
traffic.

**Seasonality.** Compare with the same weekday in earlier weeks. A trailing window of all days
counts the weekly shape as noise, which widens the band and hides real events.

**A past spike in the baseline.** A mean and standard deviation over a short baseline are moved
by the event they should have cleared. With one earlier 5x spike in the baseline, a true 2x event
fired 0 % of the time under them, and over 98 % under the median at rate 50 and up. Use the median,
and a scale built on the median absolute deviation.

**Short baselines.** Robust is not a free upgrade. Over eight points the sampled deviation is often
small by chance, and a rule using it alone fired falsely 5 to 15 % of slice-days on pure count
noise, against 2.5 to 5.5 % for the mean and standard deviation it replaced. For counts, floor the
scale at the square root of the median, because that is the least noise a count can have, and at 1
so a flat baseline can fire without dividing by zero. That brought it to 0.8 to 3.4 %. The floor
helps only a count that behaves like one: with real rate wander of 10 % at volume 1000, the floor
stopped binding and the false rate returned to the deviation-alone figure, about 5 %. A sum of
money has no such floor. Use an absolute or relative minimum there.

**Growth.** A series growing steadily sits above its own history every day: 5 % a week fired on 15
to 23 % of days at moderate volume. A guard requiring the observation to clear a multiple of the
median absorbs that with no trend fit.

## Price the guard

The guard is the part to price, because it does not scale with evidence. With a guard at twice the
median, a 1.5x event is invisible at every volume, 0 % at rate 5,000, and a true doubling fires
about half the time. A tighter constant does not solve it. At 1.35x it caught 94 % of 1.5x events at
rate 200 and let growth back in, 16 % false at rate 50, 7 % at 200, under 1 % only at 1,000. Choose
out loud. Where the series is large and missing a 50 % surge costs more than a growth alert, lower
the guard, make it a function of volume, or fit the trend. A rule that says "the guard absorbs
growth" and does not say what else it absorbs has hidden the larger half of its behaviour.

## Series the rule misreads

**A series idle on many days.** This one has to be checked, because every form above assumes the
baseline describes a working stream. Where about half the same-weekday points are zero, the median
sits at or near zero, the guard collapses, and an ordinary active day reads as a spike: 36 % of them
at rate 50, on the full guarded rule. A minimum baseline median stops the false alerts and buys a
blind spot, since those windows now give no verdict at all, and on a money series of that shape a real
3x day fired only about half the time. Either judge the series over its active days, or report no verdict and
say so ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). Spell it as no
verdict, not as quiet.

**Below a minimum baseline.** Say nothing, and spell that too. Add an absolute floor on the observed
count, so that a jump from 3 to 6 stays silent. For a drop, require a live baseline, and let a stream
that falls to zero fire. State the predicate beside the number
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): same weekday, how many
points, which floor.
