---
layer: technique
type: technique
subject: public-verdict-badge
technique: verdict-honesty-qualifiers
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a published verdict is narrower than it appears, deciding whether to qualify or refuse, wording a preview or partial result for a small artifact]
---

# Verdict honesty qualifiers

A qualifier is the word that makes a published verdict true: *preview*,
*partial*, *sampled*, *as of last week*. In a report you have a paragraph for
it. In an embeddable artifact you have a handful of characters, in a place
that may be cut off, rendered by a text-only client, or read at a glance by
someone who never intended to read it at all. The technique is about placing
the qualifier where it cannot be separated from the number, and knowing the
class of claim that no qualifier can repair.

## The qualifier lives in the value, never only in the label

A two-part badge has a label on the left and a value on the right. These two
halves have very different survival rates. Thumbnails, aggregator cards,
narrow columns, and screenshots crop from the left; the value survives, the
label does not. A badge labelled "preview score" showing `82` degrades, under
cropping, into a badge showing `82` — a full-strength verdict with the
qualification silently removed, published under your name.

So: **`preview 82`, not label:`preview score` / value:`82`.** The qualifier is
part of the value string. This is
[count-carries-predicate](../../_laws.md#count-carries-predicate) applied to
layout rather than to prose: the predicate travels *inside* the value, because
everything outside the value is optional in practice.

Two corollaries follow:

- The alternative text repeats the qualifier too. Text-mode readers get the
  alternative text *instead of* the pixels, so it is a second full rendering
  of the same claim, not a description of an image.
- If the qualifier will not fit, the qualifier is not what gets dropped. Shorten
  the value — a coarser band, a letter grade, a shorter number — or render a
  neutral state. A badge that had to choose between fitting and being true and
  chose fitting is a badge you will hear about from someone who was harmed by
  it.

## Which qualifiers are legitimate

A qualifier is legitimate when it **narrows the scope of a claim that is
otherwise sound**. That gives a short, closed list:

- **Provisional / preview** — computed by a cheaper path than the full
  assessment, or before the assessment completed. The subject exists, the
  method is named, the number will be superseded.
- **Partial** — some dimensions were unmeasurable and were excluded rather
  than zeroed. The composite is honest over what it covered, and the coverage
  figure is what "partial" is standing in for.
- **Sampled** — computed over a bounded subset, deliberately, for cost.
- **Dated** — deliberately frozen at a point in time, where freshness is not
  claimed. Distinct from *stale*, which is a defect, not a qualifier.

Anything else is usually a hedge covering a design problem. "Approximate",
"beta", "unofficial" and their relatives tell the reader that you are uneasy
without telling them what to discount, and readers convert unspecified unease
into "sloppy" rather than "conservative".

## The rule a qualifier cannot save

Run this test on every proposed qualifier:

> **If the qualifier were deleted, would the remaining claim be merely
> over-broad — or would it be a claim about a thing that does not exist?**

Over-broad is qualifiable. About-nothing is refusable, and the difference is
categorical rather than a matter of degree.

The canonical failure is aggregation over provisional members. One subject's
provisional result, labelled provisional, is honest: the reader knows what
they are looking at, and the thing exists. An **average across many
provisional results is not a provisional average.** Each member was computed
by a cheap path with its own bias; the mean of many biased cheap estimates is
not an estimate of the true mean, and it is not a preview of anything, because
there is no full computation it approximates. No adjective fixes it. The badge
renders a neutral state instead.

The same test kills other tempting numbers: a coverage-weighted composite over
subjects that mostly had no coverage; a "trend" over two points where one is
provisional; a rank within a cohort assembled from whoever happened to be
assessed. In each case removing the qualifier leaves a claim about a
population that was never measured.

**Provenance is a refusal, not a suffix.** Where the honest label would have
to describe the *absence* of a referent rather than the *narrowness* of one,
the artifact declines to render a number at all.

## Procedure

1. **State the claim in one full sentence**, as a reader would understand the
   unqualified badge: "this subject scores 82 out of 100 on the published
   rubric, as of now."
2. **List every way the sentence is currently false.** Cheaper method, missing
   dimensions, bounded sample, frozen input, aggregate over non-comparable
   members.
3. **Classify each.** Narrowing → a qualifier from the closed list. Referent
   missing → refuse; go to the neutral vocabulary.
4. **Compose the value** so the qualifier precedes or immediately abuts the
   number, inside the value half.
5. **Emit the same string into the alternative text**, and into any structured
   payload the endpoint also serves, from one shared formatter — two hand-kept
   copies of a qualified value diverge on the first wording change.
6. **Set the tone visually.** A qualified verdict does not get the full
   confident verdict colour; it gets a muted or intermediate treatment, so the
   most-glanced channel agrees with the text.
7. **Add the non-colour marker.** The value carries a glyph or word that
   distinguishes the verdict without hue, so the claim survives for viewers
   who do not perceive the colour distinction — and survives a greyscale
   print, a screenshot filter, and a monochrome terminal rendering.

## When not to use this

- **Do not qualify to avoid refusing.** The pull is strong — a number looks
  like progress and a neutral state looks like a bug. Resist it; a wrong
  number on a public page costs more than an unhelpful one.
- **Do not qualify a stale value.** Staleness is a caching defect with a fix;
  labelling it converts a bug into a permanent feature nobody removes.
- **Do not qualify when the honest fix is cheap.** If "partial" is standing in
  for one collector that has been broken for a month, repair the collector.
  Permanent qualifiers become invisible: readers stop parsing a word that is
  always present, which is exactly the state where it stops protecting anyone.
