---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: strictly-positive-blend-weights
status: forged
laws: [absent-guard-is-loud]
shared_with: []
use_when: [a tapered blend produces not-a-number along the input border, choosing the width of a bell-shaped window weight, running the stitch in reduced precision]
---

# Strictly positive blend weights

A tapered blend weight is a bell-shaped map over the window: one at the centre,
falling toward the border, so that the prediction a window made at its own edge
— where the model had the least context — counts least. The shape is right and
the tail is the problem. A bell falls toward zero and never reaches it in exact
arithmetic, but the weight map is not built in exact arithmetic, and the
accumulator it is summed into is frequently half-precision. Somewhere along the
tail the weight becomes zero.

## The failure, precisely

The normaliser canvas at a position is the sum of the weights of every window
covering it. In the interior that sum has a large term from whichever window is
centred nearby. Along the input's outer border there is no such window: the
outermost position of the input is the outermost position of every window that
covers it, and every one of those windows contributes its tail. If the tail is
zero, the normaliser is zero, the numerator is zero, and the division produces
not-a-number. The not-a-number sits along the border of the result and
propagates into any reduction over the canvas — a mean becomes not-a-number, an
argmax becomes the first class, a downstream loss becomes undefined.

The failure does not appear on the interior of the canvas, does not appear when
the border happens to be covered by a pulled-back window whose tail is not the
outermost one, and does not appear at all in full precision with a wide taper.
It appears in production, on a narrow taper, in half precision, along one face
of one axis.

## The rule

**Every weight is strictly positive at every position a window covers.** The
implementation enforces this by flooring the weight map before its first use,
and the floor is built into the map's constructor rather than left for the
caller to apply. A guard the caller must remember is a guard the caller will
forget the one time the taper is narrowed, and a floor that engages on its own
is the only kind that protects an installation nobody is watching
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The floor itself has a shape worth stating. Take the minimum of the computed
map; if that minimum is already positive and not below a small absolute
constant, the floor is the minimum itself and nothing changes. If the minimum
is below the constant — including zero — clamp the whole map up to the constant.
The relative half means a well-behaved wide taper is never distorted; the
absolute half means a taper that underflowed anywhere is lifted everywhere it
underflowed. A constant on the order of one part in a thousand is a good default:
small enough that the taper's centre-to-edge ratio is preserved in every case a
practitioner would choose on purpose, large enough that the quotient at a
border position is a stable number rather than a division by something near the
precision floor.

## Precision

Build the weight map in full precision, floor it, and only then cast to the
accumulator's precision. A map built in half precision may underflow to zero in
its tail before the floor is applied, and a floor applied after the cast can
itself round to zero if the constant is below the format's smallest normal
value. The order — compute, floor, cast — is not negotiable.

Prefer building the map as an outer product of per-axis one-dimensional
profiles rather than evaluating the bell at every position of the window: the
memory is the sum of the axis lengths rather than their product, the profile
along each axis is trivially inspectable, and the floor is applied to the
assembled map so that the corner — the product of three tails — is covered.

## Choosing the width

The taper's width is expressed as a fraction of the window size — the standard
deviation of the bell as a proportion of the window's extent along each axis.
An eighth is the conventional starting point. Narrower tapers concentrate
weight at the centre and are the case where underflow is likeliest; wider
tapers approach the constant map and lose the seam suppression. When the seam
persists at an eighth, widen the overlap before narrowing the taper.

## When not to use this

When blending is constant there is no taper and no floor to apply; the weight
is one. When the model's border predictions are as good as its centre ones the
taper is unnecessary, though the floor still costs nothing. Never resolve a
zero normaliser by replacing not-a-number with zero after the division: it
produces a confident zero prediction along the border and hides the fault the
floor would have prevented.
