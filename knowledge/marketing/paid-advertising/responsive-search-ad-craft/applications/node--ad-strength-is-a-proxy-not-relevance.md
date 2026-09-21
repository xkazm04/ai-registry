---
layer: application
type: application
subject: responsive-search-ad-craft
technique: ad-strength-is-a-proxy-not-relevance
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Ad strength as a proxy - a pure client-side rater that says what it is

The Czech-first marketing workspace at `C:\Users\kazda\kiro\systedo-case` (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) realises the technique as one
pure module, `src/lib/ad-strength.ts`, that rates a generated `AdResult` with no network
and no API (`ad-strength.ts:1-7`). The structural fact the tree proves is the
technique's central claim: **the rater has no input that could carry relevance.**
`computeAdStrength(result, locale)` (`ad-strength.ts:91`) takes the generated assets
and the keyword list and nothing else; the request type it rates from, `AdRequest`
(`src/lib/ai-types.ts:248-273`), has product, benefits, audience, platform, tone and
optional brand, patterns and refine fields - no landing URL. A landing-page experiment
module exists in the same tree (`src/lib/lp-exp/`) and has no edge into the rater. A set
can read "Výborná" while pointing at a page that module already ruled against.

## The weights and cutoffs are labelled as hand-tuned

`ad-strength.ts:45-48` is the disclosure the technique requires, in the code's own
words: "Hand-tuned heuristic, NOT Google's real (undocumented) Ad Strength formula. The
per-factor weights below sum to 100, and the rating cutoffs (85/65/40) are chosen so a
minimal valid set (~5 headlines with some keyword coverage) lands around 'average'.
The GOALS mirror Google's published RSA recommendations." Two footings, named
separately: the goals cite the platform's recommendations, the weights and cutoffs are
the workspace's convention.

| Factor | Weight | Goal / edge | Footing | Where |
| --- | --- | --- | --- | --- |
| Headline count | 22 | goal 8, min 5 | goal mirrors platform guidance | `ad-strength.ts:49-50, 141-159` |
| Unique headlines | 20 | share of distinct after normalise | convention | `ad-strength.ts:82-83, 160-183` |
| Length variety | 15 | buckets <=15 / <=24 / longer | convention | `ad-strength.ts:86, 184-198` |
| Keywords in headlines | 20 | goal 0.5 share, capped | convention | `ad-strength.ts:55, 199-228` |
| Description count | 13 | goal 4, min 2 | goal mirrors platform guidance | `ad-strength.ts:51-52, 229-249` |
| Varied callouts | 10 | goal 4 distinct | convention | `ad-strength.ts:53, 250-269` |

Cutoffs: excellent >= 85, good >= 65, average >= 40, else poor (`ad-strength.ts:293-294`).
The partial/pass edge inside a factor is `statusFromFraction` at 0.999 / 0.4
(`ad-strength.ts:88-89`) - also convention, also unlabelled in the output, which is a
small deviation: the rater's UI shows the factor status without saying the 0.4 edge is
a choice.

## The over-limit cap is a consistency rule, not a factor

`ad-strength.ts:272-292` counts assets over `AD_LIMITS` (the documented platform limits,
`src/lib/ai-types.ts:241-246`) and caps the composite at 64, one below the "good" floor,
with the reason written beside it: "a top-line 'Výborná' next to an over-limit headline
is a credibility-damaging contradiction (the per-row TextRow already flags it red)."
The cap is applied after the weighted composite, so a set that would score 95 on
material still reads "Průměrná" until the asset is fixed. That is the technique's rule
that the rating may never contradict the launch-blocker beside it, and the tree
learned it as an incident: the comment names the contradiction it removed.

## An unmeasurable factor is excluded, not zeroed

Keyword coverage carries `measured: keywordsMeasurable` (`ad-strength.ts:202`). When no
keyword survives tokenisation the factor's status is "partial" with the detail "No
measurable keywords provided: coverage not scored" (`ad-strength.ts:205-206, 213-214`),
and the composite is normalised over the measured weights only (`ad-strength.ts:281-291`),
so the absent signal "neither penalises nor inflates". This is the bundle's
not-measured-is-not-zero law applied inside a rater, and it is an upward lesson the
draft took: the first version of a coverage factor scores zero on an empty keyword
list, and the tree's comment at `ad-strength.ts:108-113` records why that was wrong.

## What the tree does not do

The rater's label strings say "Ad Strength"-shaped things ("Výborná", "Excellent") and
the factor detail for headline count says the platform "recommends at least 5"
(`ad-strength.ts:152, 157`). Nothing in the rendered output tells the reader that the
composite is the workspace's convention rather than the platform's label; the
disclosure lives in a source comment. The technique asks for the footing line on the
surface. That is a deviation - the standard stays - and it is cheap to close: one line
of factor detail, or a footnote on the meter.
