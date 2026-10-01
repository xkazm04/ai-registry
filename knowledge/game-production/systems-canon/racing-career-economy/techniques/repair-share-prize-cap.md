---
layer: technique
type: technique
subject: racing-career-economy
technique: repair-share-prize-cap
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [pricing damage repair in a racing career, a bad race costs the player net money, repair feels either meaningless or ruinous]
---

# Capping the repair charge as a share of the prize

The named concern: **how much of a race's prize the damage bill may take, and who pays the
rest.** In a racing career with collisions, repair is the dominant sink and it is correlated
with the worst outcomes. Left as an absolute price it is the instrument that turns a bad
race into a net loss.

## The rule

Compute three numbers at settlement, in this order.

- **Gross** — the prize for the finishing position, before any deduction.
- **Service** — the true cost of restoring the car, from the damage taken. This is the
  number the garage screen shows; it is never reduced for the sake of the cap.
- **Paid** — the smaller of the service cost and a whole-unit share of gross: the share is a
  data value between zero and one, applied to gross and rounded down.

The **insured remainder** is service minus paid. It is not charged. It is the game's
absorption of the part of the bill the prize could not carry, and it is recorded on the
receipt as its own line so that the player sees what the accident really cost and what the
career forgave. Net is gross minus paid.

Net is therefore at least gross times one minus the share, whenever gross is positive. With a
share of 0.6 a bad race still returns at least 40% of the prize. That inequality is the
property to test, and it holds at every tier without per-tier tuning because it is a
fraction, not an amount.

## Choosing the share

The share is the dial between two failures. Near one, the cap vanishes: repair can consume the
whole prize and the ratchet returns. Near zero, repair is decoration and the consequence of
damage disappears. A useful working band is the middle of the range, chosen so that the
worst plausible race leaves a clearly visible remainder and the median race is bounded by the
service cost rather than by the cap. If the cap binds in most races, the cap is the economy
and the service price is dead data; if it never binds, it is not protecting anyone.

Measure the binding rate over a simulated career and report it: the fraction of races in which
paid equals the cap rather than the service cost. That figure says whether the insurance is
doing work. A binding rate is a statement about the driver that produced it; a careful driver
and a reckless one give different rates from the same share.

In a sensitivity sweep over a simulated career economy, the repair rate was the second most
influential input on final wealth, behind reward size and ahead of part prices. That is a
result about one economy and one proxy driver, but the order is worth expecting: repair is
priced as an afterthought and moves the outcome as much as the shop does, so it deserves the
same sweep and the same owner as any headline price.

## Decision rules

- **When the service cost is below the cap, charge the service cost.** The cap is a ceiling,
  not a flat fee. Charging the cap on a light scrape punishes careful driving.
- **When gross is zero, paid is zero.** The cap composes with the participation floor; it must
  not be the reason a result nets negative.
- **Show the insured remainder.** A career that quietly forgives a bill teaches the player that
  damage is cheap. A career that shows the forgiven amount teaches that damage is expensive
  and survivable, which is the intent.
- **Round the cap down, never up.** Rounding the other way lets paid exceed the share by a unit
  and breaks the inequality at small prizes.
- **One owner for the share.** The share lives in one data table; the settlement, the garage
  preview and any simulator read it from there. Two copies diverge and the preview lies.
- **Preview what will be charged, not just the service cost.** The pre-race screen must say
  how much would be charged at the best and worst finish, or the player learns the cap only
  after the loss.

## Evidence grade

The inequality is a property of the arithmetic and is testable exactly. The claim that a given
share feels forgiving but not free is a design intention; a simulated driver measures the
binding rate, and no person has reported the feel.

## When not to use this

- **When damage does not exist or is cosmetic.** There is no bill to cap.
- **When repair is a deliberate, uncapped hardcore mode.** Then the career has opted back into
  the ratchet; state that the no-dead-end guarantee is carried by something else, because the
  cap no longer carries it.
- **As the only protection.** The cap bounds a prize; it does not create one. It needs the
  participation floor beside it.
