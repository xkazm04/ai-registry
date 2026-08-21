---
layer: technique
type: technique
subject: production-coverage-measurement
technique: source-provenance-marks
status: forged
laws: [no-gate-self-certifies, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a heuristic guess renders identically to a measured fact, choosing how to encode claim origin on a report, reconciling a self-declared value against an audited one]
---

# Source provenance marks

Every claim on a report carries a visible mark saying where it came from. A guess and a
measurement are different epistemic states; rendering them in the same weight is how a
guess becomes a fact by the following Wednesday.

## The vocabulary

Four values, plus one that exists to catch the omission:

- **audited** — an independent reader or checker examined this and recorded what it found.
- **authored** — the item declares this about itself, and the declaration is stored as
  data.
- **inferred** — nothing authored or audited it; the value is a heuristic guess over
  whatever signals were available.
- **unsourced** — the claim was built without recording where it came from. Treat the
  value as unverified.

The fourth is load-bearing. An absent provenance must be **its own loud state**, never
silently treated as known — a claim built without recording its origin has proven nothing,
and letting the omission render like an audited fact is precisely the lie the marks exist
to expose. Naming the state is also what lets you count unsourced claims and drive the
count down; a system with no name for the gap cannot report its own coverage.

A fifth value earns its place once self-correction is in play: **authored-demotion**, for
an item declaring a *lower*-credibility origin than its audit records.

## Precedence, and the one asymmetry

Audited outranks authored, which outranks inferred. The audit wins over the item's own
declaration because an item must not be able to promote itself past the reader who
examined it — that is the self-certification rule applied to provenance.

But a strictly downward correction is different, and is accepted **immediately**:

> A subject may always tell the report it earned less than the audit credited it with. It
> may never tell it more.

A self-demotion cannot be an overclaim, because nothing games a report by looking worse on
it. So the downward direction carries no risk and should not wait on the audit catching
up. Record the disagreement so it can be reconciled, mark the claim as a demotion, and
grade on the *less flattering* of the two values. Preferring the audit unconditionally is
correct against overclaims and silences the one correction that is always safe.

## Rendering: marks, never hue

Each provenance value renders as a **glyph plus a word**, with an explanatory note
available on inspection. Colour may reinforce; it may never carry the distinction alone.

Three reasons, and the accessibility one is only the first. A distinction carried only by
hue is invisible to a substantial share of readers. It also vanishes when the board is
printed, screenshotted into a deck, or pasted into a monochrome document — which is how
status reports actually travel. And hue is already spent: a report of this kind has one
colour ramp for the readiness rungs, and a second hue language competing on the same cell
will contradict the first. The reader then believes whichever encoding is greener.

Keep one vocabulary object — glyph, word, note — and have every render site read from it.
Two render sites defining their own glyphs will drift, and the drift is invisible from
either side.

## Procedure

1. **Enumerate the sources** the resolution path can actually produce, and add the
   unsourced case for the path that records nothing.
2. **Resolve provenance in the same function that resolves the value**, and return both.
   Whoever computes the value is the only party that knows where it came from; recovering
   it later is guesswork wearing a mark.
3. **Stamp it onto the record**, not onto the view. A view that re-derives provenance is a
   second authority for the same quantity.
4. **Look up the mark through a helper that handles the missing case loudly** — an
   undefined provenance resolves to unsourced, never to the flattering default.
5. **Publish the note per value**, stating in one sentence what that origin does and does
   not prove.

## Decision rules

- **When a value's origin is not recorded, mark it unsourced and render it.** Hiding
  unsourced claims makes the report look better and makes it worthless.
- **When an item declares less than the audit says, take the item's word now.** Log the
  disagreement for reconciliation; grade on the lower value meanwhile.
- **When an item declares more than the audit says, take the audit's word.** No exception,
  no override flag. The flag will be used.
- **When a mark would be the only new thing on a crowded cell, still add it.** Provenance
  is what makes every other number on the cell interpretable; it is the last thing to cut.
- **When two claims on one report have different provenance, never combine them into one
  aggregate figure without stating the weakest provenance present.** A number carries the
  basis it was computed under, and an aggregate inherits its worst input.

## When not to use it

- **For content lineage or attribution.** These marks describe how confidently a *claim
  about* an item is known, not who owns the item or which model produced its bytes.
- **Where every claim has identical provenance.** If everything is audited by the same
  pass, the mark is noise — add it when the second source appears, which it will.
- **As a substitute for the credibility class.** Provenance says how well you know what
  produced something; the class says what that producer's pass is worth. An audited mark
  on an untrusted class is entirely normal, and collapsing the two loses that.
