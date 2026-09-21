---
layer: application
type: application
subject: responsive-search-ad-craft
technique: headline-angle-coverage
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Headline angle coverage - the ad-copy prompt, its golden fingerprint, and the judge

The marketing workspace at `C:\Users\kazda\kiro\systedo-case` (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) puts the angle list into the
system prompt of its ad tool, freezes that prompt under a golden fingerprint, and judges
the output against a copywriter character whose acceptance bar is angle count. The
structural fact: **angle coverage is instructed and judged, but never measured by
angle** - the rater's proxy for it is string distinctness.

## The instruction

`src/lib/ai/tools/ads.ts:21-29` (`AD_SYSTEM`) ends with the angle rule, in Czech:
headlines cover different angles - main benefit, target audience, call to action,
trust/quality, breadth of range; at least one headline is a direct call to action; if
the brief names a brand or shop, at least one headline contains it. The user prompt
(`ads.ts:47`) asks for eight headlines "vzájemně se lišící úhlem" (differing from one
another in angle), four descriptions, four callouts, eight keywords, one long headline
and a one-to-two-sentence rationale. Eight is the request; fifteen is the slot count
(`src/lib/ads-editor.ts`, `src/lib/sklik-export.ts:28`) - the tree asks for angles,
not slots, which is the technique's rule.

The anti-fabrication clause on the line above (`ads.ts:26`, via `antiFabrication` in
`src/lib/ai/tools/_fragments.ts`) is what keeps the trust angle honest - no unbacked
claims, no discounts, no numbers not in the brief. That clause is
`grounded-marketing-generation`'s contract and is cited here only because the
trust-angle headline depends on it.

## The fingerprint

`test-llm/golden/ads.json` stores the exact system prompt text, its hash
(`promptHash: "153848e7e409aed6"`) and the schema keys. The brand block, winning
patterns and refine note ride on the *user* prompt only, "so the system prompt + schema
(and the eval/golden fingerprint) stay byte-identical" (`ads.ts:36-40, 52-58`). The
angle rule is therefore a versioned artefact: changing "five angles" to "six" breaks the
golden and forces a re-evaluation. That is a stronger discipline than the technique
asks for and an upward lesson worth naming - an angle list in a prompt is a contract,
and a contract gets a fingerprint.

## The judge

`tiger/characters/petr-ppc-copywriter.md` is the acceptance bar: "Eight headlines,
eight DIFFERENT angles - not the same line reworded", scored as "headlines cover >=5
distinct angles (no near-duplicates)", plus within-limits, specific to the USPs given,
no invented numbers, no generic filler keywords. The benchmark at
`tiger/models/benchmark-2026-06-20.md:21-27` scored three model tiers against that bar
and found angle variety held at the mid and top tiers while the fast tier failed on
limits, not angles. The five-angle floor in the technique is this character's
convention, and the technique labels it so.

## Where the rater falls short of the judge

`src/lib/ad-strength.ts:100-102` scores "Unique headlines" as the count of distinct
normalised strings over the headline count, with the comment "proxy for distinct
angles". Fifteen headlines on the template "X pro Y" are fifteen distinct strings and
one angle; the factor passes and the judge fails. The technique's step five - count
distinctness mechanically, then read for near-duplicates the normaliser cannot catch -
is exactly this gap, and the tree closes it only at evaluation time (the character
judging a benchmark), not in the rater the writer sees. Deviation; the standard stays.

## The catalog path

`src/lib/catalog/ad-copy.ts:208-220` (`adRequestForProduct`) builds the per-product
request the batch and the single generation both send: product title, benefits from the
catalog's USP list with a fallback to the category or title, audience derived from the
category. The benefits that feed the benefit and range angles arrive from here - that
is `product-feed-and-catalog-spine`'s territory, and the fallback ("a USP-less product
still passes the validator") is the place where a set can pass the angle instruction
with no real benefit to state. The prompt will then write a benefit headline from a
category name. The technique's rule - an angle with no material is left out, not faked -
is not enforced on this path.
