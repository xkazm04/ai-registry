---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: ad-strength-is-a-proxy-not-relevance
status: forged
laws: [label-convention-as-convention, platform-reported-is-not-causal]
shared_with: []
use_when: [building or reading a local ad-strength rater, explaining a platform's strength label to a client, deciding whether a set is launch-ready]
---

# Ad strength is a proxy, not relevance

The platform's Poor-to-Excellent label, and any local rater that mirrors it, is computed
from the material alone: whether the keywords appear, how many headlines and
descriptions, how distinct they are, and sitelinks on the platform's documented list,
with length spread and callouts commonly added by a local rater. It has no input for the
landing page, the offer, the price or the ad's own results. A set can be rated
"Excellent" while pointing at a page that a landing-page experiment already proved
loses, and the label will not move. The label is a completeness check on the material.
It is useful for exactly that and must be presented as exactly that.

## What the evidence says

A 2024 analysis by an ad-management vendor across more than twenty-two thousand
accounts found "no clear correlation between ad performance and Ad Strength": no
meaningful difference in click-through, and sets rated "Average" had the best cost per
acquisition, conversion rate and return on spend; most sets carried "Poor" or "Average"
and still performed well. A practitioner experiment found an "Excellent" set losing to
a "Good" one on click-through, conversion rate and the platform's quality score. The
platform's own documentation states the label "does not measure external factors",
naming the landing page and the offer, and is not used to calculate Ad Rank or Quality
Score. None of this makes the label useless; it makes it a lint.

## Building a local rater honestly

A local rater is worth having because it runs on generated output with no network and
tells the writer what is missing before upload. Its honesty comes from three
disclosures.

1. **Weights and cutoffs are hand-tuned convention.** A composite of, say, headline
   count, distinctness, length spread, keyword coverage, description count and callout
   variety, with weights summing to a hundred and cutoffs that put a minimal valid set
   around "Average" - every one of those numbers is a choice, and the rater's own
   comment says so. The platform's formula is undocumented; a local rater does not
   claim to be it.
2. **Goals mirror the platform's published recommendations; limits are the platform's
   documented facts.** "At least five headlines", "ideally eight or more" - the
   platform's own guidance, cited as guidance. Thirty characters - the platform's
   limit, cited as a limit. The two footings are labelled differently in the rater's
   output.
3. **An over-limit asset caps the rating below "Good", whatever the composite says.**
   A top label next to a headline that cannot ship is a contradiction the writer will
   stop trusting; the cap keeps the label consistent with the per-row red flag.

An unmeasurable factor - no keywords supplied - is excluded and the remaining weights
renormalised, so an absent signal neither penalises nor inflates the score. Each
factor carries a one-line detail: what is there and what would move it, in the writer's
language.

## Decision rules

- **When a set is "Excellent" and the landing page is unproven, the set is not
  launch-ready, because** the label has not read the page and cannot; readiness needs
  the page's own evidence.
- **When a client asks why a "Poor" set converts, answer that the label measures
  material completeness, not results, because** the alternative - rewriting a
  converting set to please the label - is the label's most expensive misuse.
- **When a rater's factor lacks a measurable input, exclude it and renormalise, never
  score it zero, because** zero is a verdict and the absence is not one.
- **When any asset is over the limit, cap the rating below the "good" band, because**
  the rating must never contradict the launch-blocker beside it.
- **When the platform's label drops after pinning, do not unpin to recover it, because**
  the label counts combinations and the pin was placed for a reason the label cannot
  see; unpin only when the reason is gone.

## When NOT to use

- Do not use the rater to compare two sets' expected performance. It compares their
  completeness. A/B evidence, with its sample, is the only comparison of performance
  (`landing-page-experiment-statistics` holds the statistics).
- Do not feed the label into a budget or bid decision. The label is not an outcome
  metric and a reallocation ranked by it moves money on a lint score.
- Do not report the local rater's score to a client as "ad strength" without the
  footing line. A client who has seen the platform's label will read a local score as
  the platform's, and the local score is a convention the workspace chose.
