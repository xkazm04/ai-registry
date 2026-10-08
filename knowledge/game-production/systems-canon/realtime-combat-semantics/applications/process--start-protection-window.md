---
layer: application
type: application
subject: realtime-combat-semantics
technique: start-protection-window
stack: process
status: forged
verified_on: 2026-10-01
---

# A first-pass opening that failed, and the four seconds that fixed it

Source tree: the combat-racing game's repository (`firetv-deathride`). The
claims below are read from its design note and its combat code. Everything about outcomes
is a **seeded simulated sample of 20 races**; no person has played combat, and fairness,
feel and comfort are not measured.

## The failed first pass, in numbers

`docs/concepts/deathride/W4-weapons-and-damage.md:42` "first wreck 1.58-6.02 seconds, 4.35 wrecks/race". The first 20-race sample put the first wreck between 1.58 and 6.02 seconds
and averaged 4.35 wrecks per race, killed mostly by the rapid gun and the dropped hazard.
The note's own verdict is "This was not acceptable opening pacing", which is the lottery
the technique describes. Its fix changed two levers in one step: lower damage and a
protection window, "introduces a visible four-second start-protection/weapon-arming period.
No ammunition is spent before it expires."

The retuned sample over all five tracks reads first wreck 8.35-18.07 seconds, a mean of
3.35 wrecks per race, and one-shot kills 0. The same line is candid that this is "tuning
evidence, not a human balance verdict". Because both levers moved at once the sample
cannot say how much of the change is the window; the technique's decision rule about
recording which lever carried it is a **deviation**: the source did not run the damage-only
and window-only variants.

## One derived value, two gates

`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:74` "val armingSeconds get()=max(0.0,CombatRules["startProtectionSeconds"]-world.seconds)"
derives the remaining protection from the match clock, with no stored countdown, and its
duration is a data row (`startProtectionSeconds,4`) in the combat rules table. This is
confirmed.

The damage gate, `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:104` "if(!enabled || !canAct(id) || raw<=0 || armingSeconds>0)return", refuses
a hit before health is read, and it sits beside the state gate rather than replacing it.
The attack gate, `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:143` "weapon !in Weapons.all.indices || armingSeconds>0)return false", refuses a shot before the decrement
that follows it at `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:166` "ammunition[n]--;cooldowns[n]=w.cooldownSeconds", so a suppressed shot spends
nothing. Both gates read the same derived property. Naming wrinkle: the hazard's own arming
delay is a separate data column of the same name (`armingSeconds` in the weapon table),
which is the collision the technique warns against; the two are different quantities
that share a spelling.

## The neighbours in the same guard

The damage function also carries the other two rules. `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:105` "val dealt=min(hp[id],raw*(1-world.cars[id].armorReduction))" is the reduction applied once,
clamped to remaining health, and the same `dealt` is credited to the shooter. The
design note states the contract at `docs/concepts/deathride/W4-weapons-and-damage.md:9` "Armor is a reduction"
from the W2 mapping, "never a second HP pool", and "`Combat` is the sole writer
of car HP/state". The reduction is bounded by the mapping data: the factor is 0.04 per
armor point on a stat clamped to 1-10, so at most 0.40 and never immunity.

`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:113` "if(full)oneShotKills++" counts a wreck that began from full health, and
the 20-race sample reports it as 0, which is the empirical half of the floor. The
analytic half is the note's claim that the stock rapid gun needs at least 6.6 seconds of
perfect unarmored contact and that "no weapon one-shots".

## An authored budget, labelled as one

`docs/concepts/deathride/W4-weapons-and-damage.md:33` "an authored readability budget"
(the note adds "not a human reaction result"). The hazard's 1.4 second arming delay is argued to
exceed a 0.25 second perception allowance plus 5 metres of traversal at a declared 10 metre
per second reference speed, and all three figures are data rows rather than prose. The
note also says audio and haptic cues are not assumed, so the claim rests on a ring and a
flashing state alone. This is the honesty the technique asks for.

## What did not hold

- The window is global on the race clock, which is what the technique prescribes, but
  the note does not say whether the clock starts at the grid or at the green light; a
  reader cannot tell from the cited lines whether cars wait out part of the window before
  the race begins. Not verified.
- The window is visible by the note's word ("visible"), but no cited line shows the
  readout; that part is unconfirmed here.
