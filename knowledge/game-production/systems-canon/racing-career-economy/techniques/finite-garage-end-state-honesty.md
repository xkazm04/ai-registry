---
layer: technique
type: technique
subject: racing-career-economy
technique: finite-garage-end-state-honesty
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a career has a finite catalogue of cars and parts, a class is already at its stat limit, deciding what money is for once everything is owned]
---

# A finite garage ends, and says so

The named concern: **what the shop shows and what money means when the catalogue is
exhausted or a purchase can no longer help.** A finite set of cars and parts has a last
purchase. An economy that pretends otherwise ends in a screen of offers that do nothing.

## Three honest states

- **Affordable and useful.** The offer raises something the player's car can still use, and
  the player can pay. It is shown as buyable.
- **Not yet affordable or not yet unlocked.** The offer is useful and out of reach. It is shown
  with its price and the reason ("earn more", "clear round N"), and it is part of the pacing:
  the races-to-afford figure comes from here.
- **Inert.** The offer would do nothing, because the part is at its maximum tier or the class
  is at its stat limit. It cannot be bought. It may be hidden or shown disabled with the
  reason spelled out ("at class limit"); showing it keeps the shop layout stable and tells
  the player the limit is real rather than a bug, hiding it keeps the shop short. Either is
  honest. What is not honest is an enabled button.

The third state is the technique. A part whose stat is already at the positive limit for that
class of car cannot be sold, because selling it takes currency for no change in the car. The
test is a stat comparison, not a list of exclusions: for every offer, the resulting stat
differs from the current one in the direction the part is for. The reason string is chosen in
a fixed order — maximum tier, then no useful effect, then locked, then unaffordable — so that
the player is told the most permanent obstacle, not the most temporary one.

## The end state

When every offer is absent and the player owns every car and part, the career is **complete**.
Completion is a state with a name, shown on the garage screen and visible in the profile; it
is not a shop that has quietly stopped selling. It does three things.

- It stops the player wondering whether they missed a screen. Where parts belong to one car
  rather than the garage, completion is per car and the career-level state is the conjunction;
  say which cars are done.
- It frees the designer from inventing a sink. A currency that no longer has a use is a
  currency the economy has finished with, and the faucet-sink band no longer applies to it.
- It leaves a decision for the designer: what do races pay after completion? Either they keep
  paying a currency with no use, or the prize collapses to something that is not currency,
  or the career ends. Each is acceptable. Pretending the currency still matters is not.

## Procedure

1. Enumerate the catalogue and each class's stat limits from the data.
2. For every offer in every garage state reachable in a simulated career, classify it into one
   of the three states, using the stat comparison.
3. Assert that no offer is enabled that leaves the stat unchanged.
4. Assert that the garage reaches the complete state on the intended path, and report the race
   count at which it does.
5. Render completion explicitly and test that the screen exists.

## Decision rules

- **When a part's effect is clamped by a limit, the offer disappears at the limit, not after
  it.** A part that is half useful is still bought at full price; state the usable fraction or
  hide it.
- **When a cheaper and a dearer part give the same stat, show one.** Two offers for one effect
  is a price trap.
- **When there is a wallet cap, it is the end state's other half, and the receipt shows it.**
  A cap stops currency accumulating with nothing to buy; the discarded part of a payout is
  recorded as the difference between net and banked, never swallowed.
- **The cap sits above the dearest useful offer still on sale.** A cap at or below a price
  the player still needs to pay turns the cap into the wall. The check is mechanical: in every
  simulated state where the wallet is at the cap, no useful offer is unaffordable. One shipped
  racer set its earned-credit cap at the price of its dearest cars and raised it fivefold
  within weeks of launch.
- **When cars can be traded, resale never exceeds the price paid and installed parts do not
  survive the trade.** A buy-and-resell profit loop turns a finite garage into an infinite
  faucet. A trade may never leave the player without a car.
- **When the player is rich and the shop is empty, do not add a luxury sink.** A sink added to
  absorb currency with no designed use is a tax. If one is wanted, design it as a feature.
- **When completion is reached much earlier than the intended end, the economy is too
  generous or the catalogue is too small.** Read it as a pacing finding, with the simulated
  driver's limits attached.

## Evidence grade

The state classification is exact. The race count at which the garage completes is a
simulated output of a proxy driver and is reported as one.

## When not to use this

- **When the catalogue is open-ended.** Procedural or purchasable-forever content needs a real
  sink model and the general economy method owns it.
- **When a cosmetic or collectible layer is the goal.** Offers that change nothing mechanical
  are the point there; the rule applies to offers that claim a mechanical effect.
