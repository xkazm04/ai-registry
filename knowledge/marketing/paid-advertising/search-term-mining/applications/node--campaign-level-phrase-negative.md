---
layer: application
type: application
subject: search-term-mining
technique: campaign-level-phrase-negative
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
---

# The recommender that emitted the right criterion on the wrong evidence

At commit `962c2a1b` (2026-10-14) the Czech-first adtech workspace already realizes
the technique's visible half. `src/lib/campaigns/mutator.ts:288-296` adds a
campaign-level negative; `src/lib/google/ads.ts:1051` hard-codes `matchType: "PHRASE"`;
`src/lib/campaigns/term-moves.ts` de-duplicates on campaign plus term, gates on zero
conversions read from an unrounded number, and the removal is by created criterion
identity. Scope and match type were not the gap. The gap was that the scope and match
type were chosen for the criterion while the gate was still written for the row.

## What the per-row gate could not see

The recommender tested each report row alone. A campaign-scope phrase negative is wider
than the row that justified it, in two ways, both reproduced before the fix with four
fixtures through the real recommender:

- **Sibling ad group.** The same query wasted in one ad group and converting in another
  of the same campaign. With the wasted row met first the negative was emitted and the
  converting row skipped as already spoken for; met the other way it was a promote.
  The outcome depended on row order.
- **Phrase reach.** A wasted `boty` and a converting `boty na beh` in one campaign. The
  phrase negative blocks the second; the gate had no way to know it existed.

## The change

Evidence is the term's total across the campaign's ad groups, and any converting query
in the same campaign that contains the term as a contiguous run of whole words vetoes
the negative (`term-moves.ts`, `containsPhrase`, `blocksConverting`). Whole words only:
a different word that merely starts with the same letters does not veto, and neither
does a converting query in another campaign.

## Measured

Paired, four fixtures: harmful negatives emitted (a negative whose phrase would block a
converting query) A 2 of 2, B 0 of 2. Floor: the single-row waste and the
other-campaign cases still emit their negative, 33 existing and new term-move tests,
tsc and eslint clean. Not measured: how often a live account holds such a pair, and
whether the veto should instead route the term to an ad-group negative for a person.
