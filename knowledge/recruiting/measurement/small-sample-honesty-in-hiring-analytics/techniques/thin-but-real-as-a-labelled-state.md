---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: thin-but-real-as-a-labelled-state
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
use_when: [a figure has some data but under its minimum, designing analytics for a young hiring team, deciding what to show below a threshold]
shared_with: []
---

# Thin but real, as a labelled state

Between *measured* and *not measurable* sits the state most hiring data is
actually in: there are observations, there are not enough of them, and both
facts matter. Six offers is not nothing and it is not a rate. The discipline is
to give that condition a name, a type and a presentation grammar of its own —
rather than rounding it up into confidence or down into an empty state.

Rounding up is the obvious sin. Rounding down is the subtler one, and it is
what teams do after they get burned by the first: they raise the floor, suppress
everything under it, and hand a young workspace a page of grey boxes. Recruiters
conclude the analytics do not work and go back to counting rows by hand — and
having taught them that, you do not get their trust back when the sample grows.

## What changes below the floor

The state carries a different grammar, and the difference has to be visible
without reading a tooltip:

- **No derived percentage.** Show the observations. "Three of the last four
  offers were accepted" rather than 75%. A reader confronted with four data
  points reads them as four data points; a reader confronted with 75% reads a
  rate, whatever the label next to it says.
- **No trend, no arrow, no delta.** A change between two thin figures is noise
  differenced with noise. Nothing may be compared against a previous period, a
  target, a benchmark or another segment while thin.
- **No verdict colour.** Green, amber and red are claims. A thin figure has not
  earned one — [inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
  applies to visual grammar as directly as to wording.
- **The observations themselves, listed.** This is the substitution that makes
  the state useful rather than merely honest: below the floor, the raw record
  is more actionable than anything derived from it. Two candidates sitting at
  technical review, named, is better guidance than an average dwell time
  computed over two candidates.
- **The count, prominently.** The basis is mandatory everywhere
  ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)),
  but in the thin state it is the primary content, not the footnote.

The state degrades correctly in both directions, which is the sign it was
designed rather than bolted on: at n=2 the list is short and the rate is
meaningless; at n=400 the list is unusable and the rate is solid. The crossover
is the floor.

## Procedure

1. Compute the figure anyway. Do not skip the arithmetic — the value is still
   the best estimate available and downstream code may legitimately want it for
   a non-decision purpose.
2. Tag it *thin* with its count and its floor. Both numbers: how many there
   are, and how many are needed.
3. Choose the raw-observation substitute for this claim in advance. Every
   claim that can go thin needs one, decided when the claim is written, not
   improvised in the component.
4. Block the thin value from entering any aggregate, headline, export, external
   comparison or automated decision. The block is enforced by the type, not by
   convention.
5. State what would move it to measured: how many more observations, or how
   much more time — the accrual horizon has its own technique.

## Decision rules

- When a headline is composed of several metrics and any one of them is thin,
  the composite is thin. A single certification flag over a set of metrics —
  true only when every contributing metric is fully measured — is worth more
  than per-metric badges, because it is the one bit a person quoting the number
  externally will actually check.
- When a thin figure and a measured figure appear on the same surface, they
  must not share a visual treatment. Same font, same colour, same card shape
  means same confidence, and the label loses to the layout every time.
- When a thin figure is exported or copied, the state travels with it or the
  export is refused. Analytics leave the product as screenshots and
  spreadsheets, and a state that only exists in the interface does not survive
  the trip.
- When thin data is the input to an automated action — a routing rule, a
  threshold, an alert — the action does not fire. Thin informs a human; it does
  not drive a machine.
- When the sample is thin because the *window* is short rather than the
  population small, widening the window is a legitimate fix and is preferable
  to widening the floor. Say which window was used.

## When not to use this

Do not use the thin state for a claim that is structurally impossible rather
than under-observed — a comparison with one item, a curve where every outcome
is identical. Those are refusals, and dressing them as thin implies that more
data would fix them when it would not.

Do not use it to launder a claim you want to make anyway. If the thin figure is
still shown in the headline slot, still coloured, still compared, the label is
decoration and the state has bought nothing. The test of a real thin state is
that a product decision was actually constrained by it.

Do not use it for counts and lists, which are true at any size and need no
state at all.
