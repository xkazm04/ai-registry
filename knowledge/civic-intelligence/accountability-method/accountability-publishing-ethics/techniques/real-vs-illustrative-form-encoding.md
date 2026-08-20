---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: real-vs-illustrative-form-encoding
status: forged
laws: [provenance-or-nothing, disclose-never-repair]
shared_with: []
use_when: [mixing computed figures with sample or demo figures on one surface, a data outage forces fallback content, designing citation and labeling primitives]
---

# Real-vs-illustrative form encoding

Accountability surfaces sometimes must show numbers that are not measurements:
sample figures on a landing strip before real data loads, demo content in an
outage, illustrative values in a methodology explainer. Each is legitimate —
until a reader mistakes one for a measurement, at which point the platform has
fabricated a statistic with its credibility attached. The naive defense is a
caption: "illustrative data". The technique's core insight is that **the
caption is the first thing a skimming reader drops**. Eye-tracking-obvious and
still routinely ignored: readers consume the numeral and the headline; the
small sourced line below is read by a minority. So the real/illustrative
distinction must be carried in the *form* — the visual variant of the element
itself — with the caption as the second channel, not the only one.

## The procedure

1. **Give the display primitive an explicit mode.** The stat tile, chart, or
   figure component takes real vs illustrative as a declared variant, and the
   illustrative variant differs in ways that survive a glance: a different
   surface tone, a marked edge, a visible tag, and the numeral set in a
   subordinate color rather than full-strength ink. A reader who reads
   nothing still perceives "this element is a different kind of thing".
2. **Make the mode a required decision, not a default.** The dangerous path
   is a component that renders identically unless someone remembers to pass
   the flag. Invert it: the call site declares which kind of figure it is
   showing, and review treats an undeclared sample as a defect of the same
   class as an uncited number — because it is one: a figure whose provenance
   claim ("this was measured") is false.
3. **Escalate from element to page when the whole surface is affected.** When
   the entire store is unreachable and a page falls back to demo content,
   per-element tags are not enough — the reader's model of the page is set
   once, at the top. A single page-level notice states that live data is
   unavailable and what is shown instead. The framing matters: **an outage
   must never read as an editorial choice.** A page of demo figures with no
   notice looks like the platform *chose* to show these people and these
   numbers.
4. **Keep the citation legible, because the citation is the real half's
   form.** A real figure's form-marker is its readable citation line. A
   citation set too small, too low-contrast, or letter-spaced into
   illegibility has not been made — and then the real and illustrative
   variants differ only by decoration. Typeset citations by their length
   (short labels may be styled as labels; sentence-length citations are set
   as sentences), and enforce it inside the citation primitive itself so no
   call site can get it wrong. Keep exactly one citation primitive: a second
   name for the same idea guarantees the two drift.

## Decision rules

- **One question decides the variant: was this value computed from ingested
  data by the published method?** Yes → real, with citation. No → illustrative,
  with the marked form. There is no third state; a "projected" or "estimated"
  figure is a modeled figure and needs its own labeled treatment, not a quiet
  seat among measurements.
- **Named entities never get illustrative values.** A sample figure may
  decorate an aggregate ("a chamber's monthly total might look like…"), never
  a person ("MP X: 47 contracts" as demo copy). Fabricated-but-labeled is
  still fabricated when a real name is attached; use unnamed or clearly
  fictional entities in demos.
- **The fallback must be visibly a fallback in syndication too.** Feeds and
  exports carry no visual form — there, the machine-readable payload carries
  the real/illustrative status as data, and an illustrative figure is best
  simply excluded from feeds, which readers consume without any of the page's
  framing.
- **Never let a style override defeat the encoding.** A call-site override
  that shrinks the citation or restyles the illustrative variant back toward
  the real one silently un-publishes the distinction; treat such overrides as
  removable defects, and prefer primitives that do not expose the knob.

## When not to use it

- Not for degraded-but-real data. A stale-but-measured figure is real data
  with a freshness disclosure ("as of date D"), not an illustrative variant —
  marking it illustrative would falsely disclaim a genuine measurement.
- Not a substitute for the honest-empty-states vocabulary on detail surfaces
  about a named person, where no illustrative fallback is permissible at all.
