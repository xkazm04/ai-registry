---
layer: technique
type: technique
subject: vehicle-archetype-balance
technique: power-rating-single-function
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a roster needs one number for strength, the shop and the roster check disagree about a vehicle's rating, setting a tier budget]
---

# Power rating as a single function

The concern: how strong a vehicle is gets asked in many places — the roster check, the shop
that prices and offers it, the logic that decides what a rival buys, the stat screen. If each
asks its own way, the answers diverge and nobody notices until a rating is load-bearing. The
technique is one function, one owner, called by all of them.

Status of claims: the function and its budgets are **authored**; what the number *means* about
race outcomes is a **simulated** calibration (see the fit technique), never a measured human
result.

## The function

For each derived physical quantity in a table, take its value, subtract the origin, divide by
the per-point unit, multiply by a weight; the rating is the sum. Dividing by the per-point unit
puts every term in "stat points", so a weight is the rating bought by one point of that
quantity, and the table is readable as a price list. Origins are the reference vehicle's
values, so the reference sits at zero before the budget offset. Parameters enter once; a
duplicate row is a load error. Weights must be finite and strictly positive and no unit may be
zero: a rating with a negative weight rewards a defect.

Each tier carries a **budget**, and every vehicle in a tier must satisfy
`|rating / budget - 1| <= tolerance`, with a tolerance of three percent. Budgets rise with
tier; the curve is an economy decision and is read from the same data as the weights.

Anything that changes a vehicle's capability — upgrades, parts, bonuses — feeds the same
function through the stat layer, so the rating of an upgraded vehicle is computed, not
guessed.

## Where the number lives

The function is a design-time summary. It is called by catalogs, offers and purchases, and it
is **never** called from the step that advances the race: putting a rating into the step makes
design intent into a runtime rule, and then a retuned weight changes how the game plays instead
of how it is audited. The reverse also holds — the audit must read the same derived quantities
the step reads, so the rating cannot describe a vehicle the race does not contain.

The check and the data share one source
([law-and-check-share-one-source](../../../_laws.md#law-and-check-share-one-source)): the
tolerance, the band and the budgets are read from the roster's data; a missing or unparseable
entry is a loud load error, never a fallback to a typed-in default.

## Why a single weighted sum

A published rating system in a well-known racing series computes its index by simulating a
lap of a test track built to be an average of the game's tracks, then buckets cars into classes
by index. That is an *outcome* rating: it answers "how fast" and nothing about how. It is
excellent for matchmaking and nearly silent about shape; two cars with the same index can win
on opposite courses. The vendor's own help text says so: the index is one lap time on a virtual
track and does not guarantee performance on every route or surface. Ratings of either kind get
exploited through the part they under-price. When the competitive stakes rose, one title in
that series dropped the open rating for spec cars with per-car balancing. A weighted sum of physical quantities is the opposite trade: transparent
and predictable for an author, approximate as a predictor. This subject takes the transparent
side for authoring and attaches the outcome side as an acceptance check (the winner-share
technique) and a calibration (the fit technique). Neither alone is enough: an outcome-only
rating cannot be authored toward, and a weights-only rating cannot be trusted.

## Procedure

1. Write the table: parameter, origin, unit per point, weight. Origins and units come from the
   mapping table, not from a second place.
2. Choose tier budgets so they rise by a curve the economy can price; record them in data.
3. Make the roster check compute the rating from derived physics and compare to the budget.
4. Route every consumer (shop, offers, rival purchase, stat screen) through the one function.
5. Add the second assertion of non-emptiness: the check fails if the table or the roster is
   empty, because the cheapest way to pass a budget check is to give it nothing.

## Decision rules

- When two systems need a rating and one needs it faster, cache the function's result; do not
  write a cheaper formula. Why: a legacy formula is a second authority, and a simplified model
  may inform but must not produce a verdict.
- When a parameter's weight was fitted on a simulation that never exercised it, report it as
  unidentified, whatever its value. A near-zero weight prices a stat at nothing and lets a
  class stack it free. A large one charges for something the race never paid out. Both are
  invisible if the report only flags small weights. See the fit technique.
- When a vehicle sits at the tolerance edge, treat that as a calibration finding about the
  weights before treating it as a stat error.
- When a new stat or part adds a parameter, add its row and refit in the same change.
- When the movement step changes, the rating is stale even if no stat moved. Recalibrate it
  or relabel it. A project whose step outran its fit honestly downgraded its rating to "a
  planning index, not a guarantee of equal lap strength". That is a legitimate end state,
  provided the acceptance check carries the verdict.
- When a tool outside the game recomputes the rating (an audit script, a spreadsheet), it is a
  second authority even while it agrees. Make it call the function or read its output. A
  recompute that omits a term which is zero today will start disagreeing silently on the day
  that term is first set.

## When not to use it

For a roster with no shared tier, a single number is a fiction; present stats instead. Also
not as a purchase price by itself: price is a function of tier and rating on a curve owned by
the economy, and conflating the two makes a rebalance of the shop a rebalance of the roster.
Not as a combat rating: a rating fitted to movement results says nothing about hits taken,
and the rating's own report must say which mechanics it was calibrated over.
