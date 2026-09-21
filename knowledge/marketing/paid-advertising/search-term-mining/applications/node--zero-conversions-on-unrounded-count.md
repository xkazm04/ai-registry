---
layer: application
type: application
subject: search-term-mining
technique: zero-conversions-on-unrounded-count
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The negative gate on an unrounded count - the workspace's term recommender

The Czech-first adtech workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) implements the whole of this subject in one pure module,
`src/lib/campaigns/term-moves.ts`, fed by a Google Ads search-term read in
`src/lib/google/ads.ts` and pinned by `test-unit/ads-search-terms.test.mjs`. It
confirms the invariant structurally and documents the deviation the scout recorded:
the floors are absolute constants.

## The invariant, and where it would break

The negative predicate is the exact comparison the technique prescribes,
`term-moves.ts:69-71`:

```ts
export function isWastedTerm(t: SearchTermRow, minSpend: number, minClicks: number): boolean {
  return t.conversions === 0 && t.cost >= minSpend && t.clicks >= minClicks;
}
```

The file header (`:8-15`) states the reason in the technique's own terms: a negative
is "permanent, silent and account-wide", the platform "reports fractional
conversions", and "rounding 0.4 to 0 would turn a converting query into a blocked
one". The structural fact the tree proves is that the invariant is held at the
**mapper**, not only at the rule: `mapSearchTermRows` (`ads.ts:946-967`) keeps
`metrics.conversions` as a float, and the test at
`test-unit/ads-search-terms.test.mjs:95-100` pins exactly that:

```js
test("[S1b] a FRACTIONAL conversion count survives the mapper unrounded", () => {
  // Load-bearing: the negative gate is `conversions === 0`, so rounding 0.4 down here
  // would turn a converting query into one this app blocks forever.
  const [r] = mapSearchTermRows([ROW({ metrics: { ...ROW().metrics, conversions: "0.4" } })]);
  assert.equal(r.conversions, 0.4);
});
```

Had the mapper cast to an integer, `isWastedTerm` would read as correct and negate
every assisted query in the account. The header (`:13-15`) says the invariant is
"pinned twice: as a table of hand-written cases, and as a property loop over a
200-term random fixture asserting no emitted negative has conversions > 0" - the
property test the technique calls for as the only check that catches a mapper
regression.

## Branch order and exclusivity

`recommendTermMoves` (`term-moves.ts:134-169`) tests the promote predicate before the
negative predicate per row (`:153-163`) with the comment "so a converting term can
never fall through to the negative branch, even if a future threshold change made
both gates true", and records every term-and-campaign key it speaks for in a
`spokenFor` set (`:143, :151-152`). Both are the technique's step 3 realized.

## The safe-zero versus not-measured distinction

The mapper test at `:123-129` shows a row with **no metrics block** mapping to
`{ cost: 0, clicks: 0, conversions: 0, conversionValue: 0 }`. That zero is safe only
because the click and spend floors sit after it; a row with zero clicks can never be
negated. The tree does not distinguish a metrics block with a *missing conversion
field* from one with zero - the technique's step 5 asks for that row to be dropped
rather than defaulted - and this is a small deviation: the mapper's `num(m.conversions)` (`ads.ts:967`)
fallback treats absent as zero, so the floors are the only defence.

## The deviation the scout recorded: absolute floors

`term-moves.ts:38-50` declares `TERM_MIN_SPEND_CZK = 500`, `TERM_MIN_CLICKS = 10` and
`PROMOTE_MIN_CONVERSIONS = 2` as constants, each with a one-sentence justification
("a query with 3 clicks and no conversion has not been given a chance to convert").
They are overridable per call (`:56-65`) but no caller derives them from the account's
conversion rate or its target CPA, which the workspace has (`src/lib/targets.ts`
carries the paid-portfolio PNO target). At a 2% conversion rate, ten clicks without a
conversion is an 82% likelihood under the null - not evidence. The floor technique's
relative form is the standard; the tree's constants are the labelled convention it
starts from, and the justification comments are the label.

There is also no lag allowance: `searchTermsQuery` (`ads.ts:924-926`) reads
`segments.date BETWEEN start AND end` for whatever period the sync passes, with no
trailing exclusion for conversions that have not yet been reported. On a period that
ends today, the last days' clicks enter the negative gate with their conversions
missing.

## Unknown match type loses

`ads.ts:929-935` maps any unrecognised match type to `"OTHER"`, never `"BROAD"`, and
the comment names the reason: `matchType !== "EXACT"` is the promote gate, and a
coerced value "would make an unclassifiable row eligible to be added as a keyword".
The test at `test-unit/ads-search-terms.test.mjs:102-109` walks `UNSPECIFIED`,
`UNKNOWN`, `SOMETHING_NEW` and `undefined`. This is the promote technique's third
eligibility condition, held at the same mapper boundary as the invariant.
