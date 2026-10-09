---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: width-in-widest-car-widths
status: forged
laws: [a-number-carries-its-unit-and-basis, law-and-check-share-one-source, one-authority-per-quantity]
shared_with: []
use_when: [setting the minimum road width for a circuit, the roster of cars changes size, a corner feels like a funnel and nobody can say why]
---

# Width in widest-car widths

Road width is the single most consequential number in a racing circuit's data, and it is the one
most often written in the wrong unit. This technique states the minimum width as a **multiple of
the widest car in the roster**, resolves it at check time against the roster as it stands, and
compares it to the narrowest point of the baked ribbon.

## Why the unit is a car and not a metre

A road width in metres has no meaning without a car beside it. Sixteen metres is a motorway for a
small buggy and a squeeze for a wide armoured car, and the number will not tell you which. Two
things follow. First, when the roster is rescaled, a metre-denominated minimum keeps passing while
the experience changes underneath it: the designer enlarges the cars by half, every authored road
is now proportionally narrower, and the linter reports green because it was never told the cars
moved. Second, a metre figure invites tuning by eye on one car, which hides the case that
matters: the widest car on the narrowest stretch.

Stating the rule as a multiple makes the roster part of the check. A roster change then either
passes with the roads still adequate or fails loudly with a named track, and the designer learns
about the consequence at the moment of the change.

## What the multiple buys

The multiple is not a clearance, it is a **racing budget**. The width has to hold the widest car
and room for a second car beside it, plus room to pass without contact and a verge on each side
that the car is permitted to touch. A useful way to hold the number: one car, one overtaking lane
alongside it, one car's worth of margin to split between the verges and the lateral error of a
non-expert driver. That arithmetic lands at a few car widths, well above the single car of the
existence proof, which is what separates a racing road from a corridor. Published design
guidance for arcade racing lands in the same region, with lanes of about one and a half to one and
two thirds car widths and a shoulder of around half a car, so that three cars abreast fit on a road
of two lanes with almost no margin; a multiple of around three to four widest-car widths for a
circuit where several cars run together is the same shape of answer.

An authored default of this order, a little over three and a half, is defensible and is **authored,
not tuned on human play**. A game whose design is about contact and close quarters wants the high
end; a game about clean lines and time attack can go lower, and the technique does not choose
between them. It makes the choice a stated number in one place.

## A floor is not the whole width rule

The minimum says the road fits racing. It does not say cars can pass. Width is also wanted where
passing happens, at braking zones and corner entries. Practitioner design guidance widens the
road at a corner for margin, and wider still for more players. Motorsport regulation keeps the
grid width through the first corner and ties a circuit's permitted field size to its minimum
width. So state a second number in the same unit: a **passing width** held over a stated length
after a braking point, with a minimum count of such zones per lap. Pair it with a **compression
limit**, the share of the lap allowed to sit below a technical width. In one measured library the
floor was 3.6 widest-car widths. The circuits were tuned to 3.7 technical road, with 5.15 passing
areas and at least two passing zones of 5 widths over 4 car lengths per lap. Measured compression
failures forced some technical releases up to 4.15. The floor alone would have accepted every one
of those roads. Treat the passing width as a review gate on content, not a load-time lint failure.

## Procedure

1. **Name the reference.** Compute the widest car as the maximum body width across the whole
   roster, from the same dimension table that draws the cars and builds their collision shapes.
   Never a copy of the number inside the linter ([one authority per quantity](../../../_laws.md#one-authority-per-quantity)
   is the rule; the check reads the table).
2. **Convert units once.** Ribbons are commonly stored as a half-width from the centreline. The
   check compares the full width, twice the stored value, against the multiple times the car
   width. The doubling is the classic place for a silent factor of two; write the unit in the
   name of the variable and in the finding text, per
   [a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
3. **Take the minimum over the baked ribbon, not the control points.** Width is interpolated
   between control points. If it is interpolated linearly the minimum is at a control point and
   the shortcut is sound; if it is eased or splined the minimum can sit between control points and
   only the baked samples reveal it.
4. **Read the multiple from the canonical rules table**, the same one a designer reads, per
   [the law and the check share one source](../../../_laws.md#law-and-check-share-one-source).
   A missing key is a loud failure, never a fallback to a default in code.
5. **Say how wide the road is in the finding.** "Road narrower than minimum" is a nag. "Narrowest
   point is 2.9 widest-car widths, minimum 3.6, at 41% of the lap" names the number and the place.
6. **Keep the width needed for the corner separate.** A road can pass the straight-line minimum and
   still be a funnel at a corner. The radius rule does not measure width, so the passing width
   above owns that, not the floor.

## Decision rules

When the roster gains a larger car, re-run the linter before anything else; a failure is the
intended outcome and the fix is to widen the road or re-author the corner, not to lower the multiple.
When a designer wants one narrow section for drama, lower the *local* width at one control point
rather than the global minimum, and record the exception where the track is declared; a global
loosening is how every circuit drifts narrower.

## What was measured, simulated, authored

The width check itself is exact arithmetic over the baked data: its verdict on a given track is a
measurement of that track. The multiple is authored. That simulated opponents finish races on roads
that satisfy it is a simulation result about the opponents, not evidence that a person finds the
road comfortable.

## When not to use this

- **For a single-car time trial** where cars never share the road; a margin on one car is the right
  rule and the multiple is waste.
- **For a roster of identical cars**, where the unit adds nothing over metres. It still costs
  nothing, and it protects the day the roster stops being identical.
- **As a comfort verdict.** Passing means the road is not narrower than authored. It does not say the
  road is pleasant, and it must not be reported that way.
