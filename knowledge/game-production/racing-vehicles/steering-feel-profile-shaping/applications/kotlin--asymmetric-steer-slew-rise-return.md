---
layer: application
type: application
subject: steering-feel-profile-shaping
technique: asymmetric-steer-slew-rise-return
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the exact-zero slew rule against the magnitude rule, eighty-eight paired runs

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. The magnitude rule was tried through a toggle in a scratch worktree
and is not in the game. Every figure is a headless simulation at sixty hertz. No thumb has felt
either rule.

## The rule in the game

The slew picks its rate from the shaped target alone:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:201 "val rate=if(shaped==0.0)profile.steerReturnPerSecond else profile.steerRisePerSecond"`.
The next line clamps the change to that rate times the step:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:202 "car.filteredSteer+=(shaped-car.filteredSteer).coerceIn(-rate*dt,rate*dt)"`.
That is the exact-zero rule the technique rejects. A full release gets the return rate. Easing
from full lock to a third of lock, or flicking from one lock to the other, keeps the slower rise
rate, because the target is not zero. The rates sit in the profile table
(`deathride/core/src/main/resources/data/feel.csv:5 "Balanced,0.03,1,115,0.28,6,10"` has a rise
of six and a return of ten, in full-lock fractions per second). The baseline row runs both at a
thousand, which makes the filter transparent.

## The experiment

The scratch toggle replaced the condition with the technique's: use the return rate when the
target's magnitude is below the filtered magnitude, or when the signs differ. At 18 m/s with a
pinned speed and full throttle, the car held full lock for three seconds, then:

- **ease**: input to one third of lock;
- **reverse**: input to full opposite lock;
- **release**: input to zero.

Each manoeuvre ran for every profile on the bare default spec and on all ten catalogue classes,
under both rules. Two numbers were recorded per run: **input lag**, the time until the filtered
steer is within 0.01 of the new shaped target; and **yaw settle**, the time until yaw stays
within ten per cent (at least 0.05 rad/s) of its late mean.

Two controls came out as they should. Release was identical under both rules in every run,
since the rules differ only for a non-zero target. The baseline profile was identical
everywhere too, since its two rates are equal. So the differences below come from the rule.

| Profile (rise / return) | Ease, input lag cut | Reverse, input lag cut | Settle faster / slower / same (of 22) |
|---|---|---|---|
| Loose (10 / 14) | 17 ms | 33 ms | 5 / 2 / 15 |
| Agile (8 / 12) | 17 ms | 50 ms | 9 / 2 / 11 |
| Balanced (6 / 10) | 33 ms | 67 ms | 10 / 4 / 8 |
| Stable (4 / 8) | 100 ms | 133 ms | 19 / 0 / 3 |

The input-lag cut was the same on every vehicle, as expected, because the slew comes before the
vehicle. On the default spec, the Stable profile's ease went from 200 ms to 100 ms.

## Verdict

`better`, as an experiment, with a condition. Input lag on a partial ease or a reversal fell in
all 88 paired runs. The vehicle followed in most of them: settle time improved in 43, matched in
37 and got worse in 8. All 8 slower runs were on the three livelier profiles. The
mechanism was not isolated; overshoot after a faster unwind is the likely reading, not a measured one. The gain grows with the gap between the two rates:
it is largest on Stable, whose return is double its rise, and close to a single frame on Loose.

So the technique keeps its rule. Its claim that the magnitude rule "removes the sticky-ease
defect" holds for the input. On the vehicle it is a likely improvement rather than a free one,
and a profile with an underdamped yaw response should be traced on the ease and reversal
patterns before it ships. The game's trace patterns are step, ramp, sine and hold
(`deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:15 "min(1.0,i/120.0)"`),
so neither manoeuvre is covered today. Changing the rule changes how every human profile
feels, so that change belongs to the owner. The return condition is an owner call on the rule,
or an ease pattern added to the trace test.
