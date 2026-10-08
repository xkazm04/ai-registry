---
layer: application
type: application
subject: steering-feel-profile-shaping
technique: five-profile-trace-bands
stack: process
status: forged
verified_on: 2026-10-01
---

# A five-row feel table, a pinned-speed trace test, and a baseline row

Read against the same couch-racer working tree as the sibling application (`firetv-deathride`, root for every path). Everything below is simulated or authored: sixty headless traces on one Windows JVM at a fixed sixty hertz, a table the owner's later hand selection did not derive from, and a touch distance that is a design hypothesis. No one has driven these profiles on a phone with a thumb.

## The table, with its bands beside it

`deathride/core/src/main/resources/data/feel.csv:2 "Spike,0.045"` through line 6 holds the five rows, `Spike`, `Loose`, `Agile`, `Balanced`, `Stable`, and the header at line 1 shows that each row carries its own acceptance bands: `yawMinRadPerSecond,yawMaxRadPerSecond,turnInMaxSeconds,recoveryMaxSeconds` (for example line 5, `Balanced,0.03,1,115,0.28,6,10,1.35,1.05,30,0.75,1.1,3,1.15,1,0.4,2,0.8,2.5`). The profile and its acceptance sit in one place, the standard's rule. The load check at `deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:25 "isFinite() && v.toDouble()>0"` requires every numeric field to be finite and positive.

**Deviation.** Radius and saturated slip have no band columns. The header lists yaw, turn-in and recovery only. Radius is implicitly bounded, since the test computes it as speed over yaw (`deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:28 "Trace(turn,yaw,speed/yaw"`) and yaw is banded, but slip, the column the research note calls its finding, is recorded and never asserted.

## The fixture and the instrument

`deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:9 "data class Trace"` defines the measurement record, `data class Trace(val turnIn: Double, val yaw: Double, val radius: Double, val slip: Double, val recovery: Double)`. Line 11 (`deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:11 "c.human=true; c.feel=p"`) builds an isolated vehicle for a human profile (`c.human=true; c.feel=p; c.vx=speed`), and line 17 pins the speed after every step: `val v=c.speedMps; c.vx*=speed/v; c.vy*=speed/v`. That is the standard's "hold speed". Line 15 drives four patterns, `"ramp"`, `"sine"`, `"hold"` and the default full step. Line 19 accumulates slip over the last sixty of two hundred forty steps. Line 22 finds the first step where yaw reaches ninety per cent of its late mean, `yaws.indexOfFirst { it>=yaw*.9 }`, and lines 23-27 release and time yaw falling under `.05`. All four columns the technique asks for, with the recovery threshold named in the report header.

`deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:52 "assertEquals(5,FeelProfiles.all.size)"`, is the scope assertion; the loop at line 53 runs every profile at 8, 18 and 28 metres per second over the four patterns, which is the sixty traces. `deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:58 "yawMinRadPerSecond"` and the two lines after assert bands for the step only: yaw within the row's yaw band, turn-in within its maximum, recovery within its maximum. `deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:63 "w1-steering-traces"` writes the evidence to the build report, with a header carrying the units (`turnInSeconds90,...,slipDegrees,recoverySecondsBelow0.05RadPerSecond`). Confirmed. **Deviation:** the ramp, sine and hold traces are recorded, and only asserted finite for radius and positive for yaw (line 56); no band applies to them.

## The table and the reading that did and did not hold

`docs/concepts/deathride/W1-feel-research.md:27 "| Spike | 0.183"` through line 31 is the eighteen-metre step table. The rows relevant to the technique: `| Loose | 0.133 | 1.308 | 13.761 | 38.631 | 0.633 |`, `| Agile | 0.150 | 1.309 | 13.748 | 20.520 | 0.133 |` and `| Stable | 0.317 | 1.081 | 16.645 | 7.932 | 0.250 |`. Line 33 reads it correctly in its first half: "compare both radius and transient time". Loose and Agile differ in radius by about one hundredth of a metre and in slip by a factor of nearly two, which is the strongest argument in the corpus for not reporting radius alone. The turn-in column shows the slew and authority working in the expected direction, from 0.133 s to 0.317 s.

**Upward lesson and caveat.** The note's second sentence says "simply increasing yaw authority can increase saturated slip at high speed". The table supports the *pairing* of high authority with high slip, and does not isolate authority. Loose and Agile differ in several fields at once (`deathride/core/src/main/resources/data/feel.csv:3 "Loose,0.02,0.8,95"` against `deathride/core/src/main/resources/data/feel.csv:4 "Agile,0.025,0.85,105"`: authority 1.5 and 1.25 against 1.45 and 1.15, stability scale 0.6 against 0.9, yaw response scale 0.65 against 0.6, brake scale, steer rates). The stability restoring term, which scales the slip-correcting yaw in `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:186 "profile.stabilityScale"`, is the likelier driver of the slip gap, and a one-setting sweep was not run. The technique now carries the rule: a cause is named only after a sweep that changes it alone.

## The baseline row, and who is not shaped

`deathride/core/src/main/resources/data/feel.csv:2 "Spike,0.045,1,150"` is the preserved baseline: `Spike,0.045,1,150,0.30,1000,1000,1,1,30,1,1,1000,1,1,...`. Every added stage is transparent: exponent one, steer rise and return of one thousand per second, throttle rise one thousand, authority one at both ends, scales one. Its dead zone, `0.045`, equals the old input mapping per the research note (`docs/concepts/deathride/W1-feel-research.md:7 "a 4.5% dead zone, linear thereafter"`), and it is the row the loader exposes as the scripted-driver controller at `deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:32 "val spike=all.first"` with `deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:33 "val default=all.first"` naming a separate human default. The note labels that default honestly as a proposal: "Balanced is the proposed human default, not an owner verdict" X. Confirmed for the technique, with the caveat recorded at `docs/concepts/deathride/W1-feel-research.md:33 "formerly ambiguous case"`: the baseline keeps its coefficients, not its behaviour, because the brake override is now simultaneous with throttle for all rows.

## What is not claimed

`docs/concepts/deathride/W1-feel-research.md:41 "not measured"` says it directly: "Owner feel, optical latency, competing-stream performance and thermal soak are **not measured** in W1." The bands are bands on a model. The fixture is an isolated car, not a lap (`docs/concepts/deathride/W1-feel-research.md:15 "The fixture is an isolated car, not a lap"`). The profiles were later chosen by the owner by hand, and nothing here says that choice agrees or disagrees with the table.
