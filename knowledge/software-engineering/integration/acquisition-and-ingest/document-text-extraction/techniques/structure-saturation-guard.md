---
layer: technique
type: technique
subject: document-text-extraction
technique: structure-saturation-guard
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [an extractor assigns structure the source document did not have, a heading or list detector calibrated from a local sample, a page of display type parsed as an outline, a yield score reports high confidence on an obviously mangled page]
---

# Structure saturation guard

The subject's other techniques are organized around text that is **missing** —
regions that came back empty, glyphs that did not map, a page that needs
re-acquiring. There is a mirror failure that every one of those instruments is
blind to: text that came back **complete and gained structure the document never
had**.

A heading detector, a list detector, a table-boundary detector — each decides
whether a line is structural by comparing it against what *typical* content
looks like nearby, because absolute thresholds do not survive across documents.
The comparison is drawn from a local census: the modal body size on this page,
the median line length in this region, the dominant font. That is the right
design and it has one failure, which is that **the census assumes the region
contains a body to be modal about.**

On a page that is nearly all display type — a cover, a masthead, a divider, a
full-page pull quote, a slide — there is no body text, so the census returns a
baseline drawn from headings, and every line clears the bar. The detector then
promotes the entire page to structure and reports it as a clean extraction,
because nothing was missing. Character counts are healthy. Glyph mapping is
perfect. Every yield measure the subject owns is computed from text statistics,
and the text is all there. Only its *shape* is invented.

## Saturation is the signal, and the response is to emit nothing

The tell is not any individual line — each one genuinely looks structural
against the poisoned baseline. The tell is the **proportion**: when structural
lines cross a large fraction of the region's content lines, the classifier has
stopped discriminating and is labelling rather than detecting.

So the guard is a saturation threshold on the classifier's own output, and the
correct response when it trips is to **suppress the region's structural output
entirely** rather than to emit a reduced or a hedged version. The reasoning is
the same one behind refusing an unreadable region: a classifier that has been
shown not to be discriminating on this region has no basis for any of its
labels, so keeping the most confident half keeps an arbitrary half. Emit the
text with no structure and record that structure was suppressed. Flat text is a
correct, if lossy, reading of a page of display type; an outline is not.

Two shapes are worth guarding separately, because they trip at different scales:

- **Region saturation** — most of a page's content lines classified as
  structural. Suppress the page's structure.
- **Run saturation** — a long unbroken sequence of structural lines with no
  intervening prose. A document legitimately alternates; a run past a handful is
  a classifier that has latched. Demote the run.

## The yield measure cannot be the guard

This is the part worth stating plainly, because the instinct is to route the
detection through the confidence number the subject already computes.

A yield or confidence measure built from character statistics — text per unit
area, alpha ratio, unmapped-glyph count, whitespace distribution — is a
measure of **how much came back and whether it is legible**. Invented structure
changes none of those quantities. The characters are the same characters. A page
whose every line was promoted to a heading can score at the top of the band set
while being unusable, and it will, because the measure was designed against the
opposite failure.

Which yields the general rule, and it is the one to carry out of here:
**an over-production failure is invisible to any measure whose denominator is
the source.** Yield measures ratio what was recovered against what was there;
they are structurally incapable of noticing that the output contains something
the input did not. Over-production needs its own guard, computed on the
*output's* shape, or it goes unreported at high confidence
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The consequence for the band set

The subject's bands route a region to an action, and every band presumes the
defect is a shortfall. A saturated region is not a shortfall and re-acquiring it
will not help — the source is fine and the reader is wrong, so a second pass by
the same reader produces the same output. The action is to suppress and record,
not to escalate.

That makes it a distinct disposition rather than a new band, and it must be
carried in the region's record so a downstream consumer can tell a document
whose structure was suppressed from one that legitimately had none. Those two
look identical in the output and mean opposite things about how much to trust
any structure elsewhere in the document.

## Decision rules

- Compute a saturation ratio on every structural classifier's output per region,
  and a run length across consecutive positive classifications.
- On trip, suppress the region's structural output whole; do not emit a
  confident subset of labels a non-discriminating classifier produced.
- Record suppression in the region's record as its own disposition, distinct
  from "no structure present" and from any yield band.
- Do not route over-production detection through a yield or confidence measure;
  the two measure different denominators and the yield measure cannot see it.
- Where a classifier calibrates from a local census, state what it assumes the
  census contains, and treat a region that violates the assumption as a guard
  case rather than as an input to be tuned around.
- Prefer flat text over invented structure whenever the two are the choice.

## What this technique does not own

Regions that came back empty or illegible, and their refusal, are
[unreadable-region-refusal](./unreadable-region-refusal.md). Banding a region by
how much was recovered, and routing a band to re-acquisition, are
[extraction-yield-bands](./extraction-yield-bands.md) — this technique supplies
the disposition that band set cannot express and does not otherwise touch it.
Memory and byte multipliers during a container parse are
[structural-amplification-caps](./structural-amplification-caps.md); the
saturation here is semantic, not a resource bound. Choosing a different reader
once a region is condemned is
[recognition-boundary-and-escalation](./recognition-boundary-and-escalation.md).
