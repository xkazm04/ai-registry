---
layer: technique
type: technique
subject: local-page-doorway-prevention
technique: boilerplate-strip-then-containment
status: forged
laws: [label-convention-as-convention, the-results-page-is-the-verdict]
shared_with: []
use_when: [measuring similarity across a set of templated pages, auditing a site's area pages for clones, checking generated pages against their siblings before publishing]
---

# Boilerplate strip, then containment

Similarity across a templated page set is measured in three steps, in a fixed order:
extract each page's main content; drop every phrase the *set itself* shares; then
compare what remains by containment as well as resemblance. Skip the second step and
every number the third produces is about the template, not the pages.

## Why the strip comes first

On a templated site the navigation, footer, shared sections and calls to action can be
most of the tokens. Compared raw, every page is 90-95% similar to every other and the
measurement discriminates nothing. A 2006 study over 1.6 billion pages found that both
the shingling method and the fingerprint method performed poorly at finding duplicates
*within one site* while performing well across sites - shared chrome dominates the
within-site comparison. That is the published reason the strip is the highest-leverage
step in the pipeline.

Two passes do it. First, main-content extraction: drop script, style, navigation,
header, footer and form regions, or use a dedicated extractor (the best performer in a
2023 peer-reviewed comparison of extraction algorithms favours recall). Second, a
document-frequency filter over the set: build word-window shingles for every page,
count on how many pages each shingle appears, and drop any shingle present on more
than a convention fraction of the set - a third is the working default. What survives
is what each page says that the set does not.

## Then measure both ways

With sets of shingles S(A) and S(B) after the strip:

```
resemblance  r(A,B) = |S(A) ∩ S(B)| / |S(A) ∪ S(B)|
containment  c(A,B) = |S(A) ∩ S(B)| / |S(A)|
```

Resemblance is symmetric and is the 1997 syntactic-clustering measure. Containment is
asymmetric, and that is the point: a template clone is not a page that *resembles* the
master, it is a page *contained in* it. "Master plus forty words of city fluff" has a
modest resemblance - the union grows with the fluff - and a containment near one. Report
the larger of the two containments for each pair and name which page is the inner one.

The shingle width is a convention: the 1997 paper used ten words; five suits short web
copy and is the practitioner default. Tokenise to lower-case words with punctuation
removed so that headings and body compare on the same footing.

## Thresholds, with provenance

| Measure | Threshold | Footing |
|---|---|---|
| Resemblance | at or above 0.50 = near-duplicate | Published: the 1997 syntactic-clustering paper, shipped at web scale in the search engine of its day |
| Containment | at or above 0.80 = template clone, even when resemblance looks acceptable | Derived convention; the right measure for templated sets |
| Resemblance | at or above 0.85 = duplicate, consolidate | Convention |
| Unique shingles after the strip | the most actionable number the method produces | Convention; a page that owns a dozen distinct phrases is a doorway page regardless of word count |
| 64-bit fingerprint, Hamming distance at most 3 | web-scale near-duplicate | Published: a 2007 paper from the dominant engine's own researchers - a fingerprint distance, never convertible to a "percent similar" |

No percentage has ever been published by the engine; its spokesperson answered a
direct question in 2022 with "there is no number". The one named-authority uniqueness
figure - a practitioner guide's 40-60% unique per location page - is guidance and is
labelled so ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
The rows above are internal conventions with their sources stated, and a report that
cites them says so.

## Procedure

1. **Collect the set** - every page sharing the template, discovered by crawl from
   the root under a path pattern or given as an explicit list. Two pages minimum.
2. **Extract main content per page** and tokenise.
3. **Shingle, count document frequency across the set, drop the boilerplate
   shingles.** Print how many were removed; that number is itself a finding about how
   much of the template is shared.
4. **Per page, count the surviving shingles.** Flag any page under the unique-phrase
   floor - fifty is the practitioner convention - as "owns almost nothing its siblings
   don't".
5. **Per pair, compute resemblance and both containments.** Classify: duplicate
   (resemblance at or above 0.85), template clone (containment at or above 0.80),
   near-duplicate (resemblance at or above 0.50), otherwise pass.
6. **For every flagged pair, print the sentences that are actually unique** to each
   page. That line does more than any ratio: when the unique content is the place name
   in the headline, the problem explains itself.
7. **Never gate on word count.** Report it as context if at all. The engine has said
   word count is neither a ranking factor nor a thin-content signal, and the
   unique-phrase count measures what word count was a proxy for.

## Decision rules

- When a set has not been boilerplate-stripped, refuse to report a percentage from it,
  because the number describes the template and will flag healthy pages and clones
  alike.
- When containment is high and resemblance is moderate, report the clone, because the
  asymmetry is the fingerprint of "template plus filler" and resemblance alone would
  pass it.
- When a page's unique-phrase count is under the floor, flag it even if no pair
  crosses a threshold; a page that owns nothing is thin whatever its neighbours are.
- When the same page set is also inspected in the engine's console, the console's
  canonical and coverage read outranks every ratio here; the ratios explain the
  verdict, they do not overrule it ([the results page is the verdict](../../../_laws.md#the-results-page-is-the-verdict)).
- When an audit's finding bands - "above ~80% identical is a doorway, 70-80% at risk"
  - do not match this method, the bands are the error: they are a raw-overlap folklore
  figure applied without the strip. Replace them with the stripped containment and the
  unique-phrase count, and label those as convention.

## When not to use this

Do not run it across pages that do not share a template - a service hub against a
blog post. The document-frequency strip assumes a shared skeleton; across unrelated
pages it removes nothing and the ratios are meaningless.

Do not run it on two pages alone and treat the strip as done. With two pages, "on more
than a third of the set" means "on both", which removes everything they share -
including the legitimately shared service description. A small set needs a manual read
of what was removed.

Do not use it to decide *whether* to build a page. It measures pages that exist; the
material gate decides what gets built. Running the measurement on generated drafts
before publishing is the right place for it in a generation pipeline, but it catches
clones - it does not supply material.
