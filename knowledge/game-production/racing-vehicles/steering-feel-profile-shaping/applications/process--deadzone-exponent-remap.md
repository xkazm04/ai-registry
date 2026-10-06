---
layer: application
type: application
subject: steering-feel-profile-shaping
technique: deadzone-exponent-remap
stack: process
status: forged
verified_on: 2026-10-01
---

# One shaping pipeline in a couch racer: the remap, the slew, the throttle cliff and the brake floor

Read against a libGDX-class couch racer's simulation core at commit-free working tree `C:\Users\kazda\kiro\firetv-deathride` (source root for every path below), where a phone is the wheel and a television shows the race. Honesty first: the handling, and every profile in it, was exercised only by simulated traces and automated clients. Nobody has felt it, and the owner chose the profiles by hand afterwards. The stack is filed as `process` because the bundle has no JVM stack slot; the code is Kotlin on the JVM.

## The remap, and the power function

`deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:27 "fun shape(value: Double)"` holds the whole stage in one expression: `fun shape(value: Double): Double = sign(value)*power(((abs(value)-deadZone)/(1-deadZone)).coerceIn(0.0,1.0),exponent)`. It matches the standard exactly, in the order the technique requires: subtract, divide by one minus the dead zone, clamp, power, restore sign. Confirmed.

`deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:24 "require(deadZone in 0.0..0.2)"` bounds the dead zone, and line 25 requires every other numeric field to be finite and positive, naming the offending key: `require(v.toDouble().isFinite() && v.toDouble()>0) { k }`. Confirmed, with one nuance: the exponent is validated only as positive, with no upper bound.

Line 38, `fun power(value: Double, exponent: Double): Double = if(value==0.0 || value==1.0 || exponent==1.0)value else exp(log(value)*exponent)`, special-cases the endpoints and the linear exponent, and the comment above it (line 37, "exp/log avoids allocating FdLibm.pow implementations on Java 22") records why the library power call was replaced: an allocation in the hot path. That is the one hot-path constraint this subject borrows; the zero-allocation claim is asserted by `deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:37 "humanProfilesAllocateNothingAfterWarmup"` (`humanProfilesAllocateNothingAfterWarmup`), which measures allocated bytes over ten thousand warmed steps for every profile.

## Where shaping sits, and who it shapes

The pipeline runs in the handling integration. `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:174 "profile.shape(input.steer)"`: `val shaped=if(car.human)profile.shape(input.steer) else input.steer`. Two things follow. Shaping is owned by the core and driven by the vehicle's profile, so every client gets the same pipeline. And it is applied to human vehicles only; scripted drivers keep the raw axis. That is a documented decision in the design note (`docs/concepts/deathride/W1-feel-research.md:11 "AI retains the Spike controller"`), so it is a stated split rather than a silent one, and it means the trace table is a trace of the human path only.

The client owns geometry and nothing else. `deathride/controller/index.html:76 "function steer(e)"` holds `function steer(e)` which converts a drag to a normalised value using `feel.touchTravelPx` and `feel.touchTravelFraction`, clamps it to plus or minus one, and sends it; no dead zone, no curve. Confirmed. The geometry numbers travel in the same profile row (`deathride/core/src/main/resources/data/feel.csv:1 "touchTravelPx,touchTravelFraction"`, header columns `touchTravelPx,touchTravelFraction`), which matches the standard's allowance: one named row, read as layout by the client.

## The slew, and where the direction rule falls short

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:175 "val rate=if(shaped==0.0)"` and `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:176 "car.filteredSteer+="`: `val rate=if(shaped==0.0)profile.steerReturnPerSecond else profile.steerRisePerSecond` then `car.filteredSteer+=(shaped-car.filteredSteer).coerceIn(-rate*dt,rate*dt)`. Two separately validated fields, in full-lock fractions per second, with rise below return in every profile row (`deathride/core/src/main/resources/data/feel.csv:5 "Balanced,0.03,1,115,0.28,6,10"`, and the same ordering in lines 3, 4 and 6). Confirmed for the asymmetry.

**Deviation.** The direction is chosen by `shaped==0.0`, the exact-zero rule the technique rejects. Easing off from full lock to a third of lock keeps the rise rate. The standard stays: select by the direction of the magnitude. The design note's own wording, "a modest return rate catches thumb release" (`docs/concepts/deathride/W1-feel-research.md:13 "a modest return rate catches thumb release"`), describes the release case the rule handles; the partial-ease case is not covered and no trace exercises it (the trace patterns are step, ramp, sine, hold).

## The throttle cliff

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:178 "if(requested<car.filteredThrottle)"`: `car.filteredThrottle=if(requested<car.filteredThrottle)requested else min(requested,car.filteredThrottle+profile.throttleRisePerSecond*dt)`. A lower request is taken at once; a higher one is rate-limited. The condition is request below filter, not request equal to zero, so a partial lift also cuts immediately. Confirmed. The test at `deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:71 "assertEquals(0.0,a.cars[0].filteredThrottle)"` asserts it exactly: `input[0].throttle=0.0; a.step(input); assertEquals(0.0,a.cars[0].filteredThrottle)`.

Line 177 bends the request by `throttleExponent` while skipping exponent one and the endpoints (`input.throttle==0.0 || input.throttle==1.0`), keeping zero and one exact. Confirmed.

## The brake floor and the filter that keeps climbing

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:179 "if(input.brake>0.0)0.0"`: `val throttle=if(input.brake>0.0)0.0 else car.filteredThrottle`: brake wins on the raw input, with no ramp. `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:196 "coerceAtLeast(0.0)"` floors forward speed: `forward=(forward+(throttle*spec.accelerationMps2-brake*spec.brakeMps2)*dt).coerceAtLeast(0.0)`. Confirmed: brake cannot take the forward component negative, and the design note states the rule outright (`docs/concepts/deathride/W1-feel-research.md:13 "Brake suppresses propulsion and never reverses"`).

Line 178 does not look at the brake, so while the brake is held the filter keeps tracking the request, and releasing the brake with the throttle still held resumes at the filtered level. That is one of the two defensible choices in the throttle technique. It is authored, not tested: the trace fixture never brakes. The design note records that this wave made brake override simultaneous with throttle for every profile, (`docs/concepts/deathride/W1-feel-research.md:33 "which changes that formerly ambiguous case"`), so the old calibration preserved the coefficients and not that behaviour.

## What is proved and what is not

The stale-input edge sits outside the pipeline: `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:66 "val stale = nowMs - receivedMs"` computes `val stale = nowMs - receivedMs > Tuning.STALE_MS || ageMs > Tuning.STALE_MS` (the threshold is two hundred fifty milliseconds, line 13) and zeroes throttle and brake in `consume`, so the cliff takes effect in one step after a lost finger. Proved by automated clients over a local network, not by a physical phone. No human felt any of it, and optical latency was not measured (`docs/concepts/deathride/W1-feel-research.md:41 "not measured"`).
