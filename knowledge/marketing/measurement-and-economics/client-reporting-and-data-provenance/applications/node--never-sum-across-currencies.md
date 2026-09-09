---
layer: application
type: application
subject: client-reporting-and-data-provenance
technique: never-sum-across-currencies
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Never sum across currencies - the blend refuses, and the pair rule sits beside it

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) stores one `{meta, rows}`
section per ad platform on a project and derives the report's single series from them
at read time in `src/lib/report-metrics/blend.ts`. The module is pure - type-only
imports, no store, no clock - so its three rules are unit-tested against fixtures. The
tree proves the technique's two structural facts: a mixed-currency blend is refused
rather than converted, and a blended ratio is emitted only when every contributing row
carried both halves.

## Rule 3: never blend across currencies

The module header (`blend.ts:16-19`) states the rule and its reason: *"the stored
amounts are each account's native money (the sync converts nothing), so summing a
EUR account into a CZK one would fabricate a total. A mixed-currency project serves
the PRIMARY section alone and says so through `mixedCurrency`."* The enforcement is
at `blend.ts:195-199`:

```ts
const currencies = new Set(sources.map((s) => sectionCurrency(sections[s]!)));
if (currencies.size > 1) {
  return { rows: primary.rows, channels: [], sources, mixedCurrency: true };
}
```

Three properties match the technique exactly. The sync converts nothing, so the
"silent conversion" failure cannot occur upstream. The refusal falls back to a
labelled scope - the primary section, which is the dominant platform's section when
present, else the second national platform's (`blend.ts:13-15`) - rather than to a
converted total. And the refusal is *announced*: `mixedCurrency` reaches the resolved
dataset and from there the report's provenance labels, which is the technique's
"scope to the primary currency and label the scope". The test *"sections in different
currencies are NEVER blended - the primary is served, and flagged"*
(`test-unit/report-metrics-blend.test.mjs:153`) and its resolver twin at `:248` pin
both halves.

`sectionCurrency` (`blend.ts:103-108`) is the upward lesson the technique's step 1 now
carries: the code is upper-cased before comparison *"so a stored 'czk' can't read as
a second currency and refuse a perfectly blendable pair"*, and an absent code is
treated as the base currency - a documented default, and a guess the technique says
to label.

The same rule reaches the diagnosis layer independently: the paid-portfolio diagnosis
scopes a mixed-currency request to the primary network
(`src/lib/diagnoses/ads-request.ts:146-170`), so no recommendation runs over a
converted total - the technique's third decision rule, realised at a second call site.

## The pair rule: blended CTR and CPC only over complete rows

`sumRows` (`blend.ts:112-117`) always sums the four dimensions that every row carries
(`visits`, `cost`, `conversions`, `revenue`), and emits the paid-traffic pair for a day
*"only when EVERY row contributing to that day carried it: a partial sum (one
network's clicks presented as the day's total) would silently understate CTR/CPC for
the blended series."* The comment closes with the law in the tree's words: *"the
fields exist precisely so a consumer can tell 'not captured' from 'zero'. Absent is
the honest answer."* The test at `report-metrics-blend.test.mjs:192` pins it.

The consequence propagates to the tiles: `src/lib/report/compute.ts:104-118` defines
CTR and CPC as live-only tiles with `hasDelta: false`, appended by
`src/lib/report/assemble.ts:81-84` on the live branch only, because *"the sample
spine has no paid-traffic pair, so these would read 0 there."* This is the structural
fact the dispatch asked for: a blended ratio exists in the report only when every
row carried the pair, and a ratio the illustrative dataset cannot carry is not shown
at zero on the illustrative branch.

## Currency at the public surface

The microsite resolver (`src/lib/microsite.ts:302-316`) keeps a non-CZK account on the
disclosed sample even when it is live, because the article formatter renders koruny
and *"publishing a EUR series relabelled as Kč on an indexable page is the exact
dishonesty this seam exists to prevent."* The public-surface rule belongs to
`honest-proof-and-illustrative-data`; it is cited here because it is the same refusal
- no relabelling, no conversion - one layer up.

## Where the tree falls short of the standard

- The refusal serves the primary section and drops the others entirely; there is no
  per-currency row for the second account. The technique's alternative rendering -
  one labelled row per currency, no total - is not implemented, so a client with a
  euro account sees only the crown account on the blended report and the
  `mixedCurrency` flag.
- An absent currency code is read as the base currency (`blend.ts:103-107`). The
  technique labels this as a guess; the tree makes it silently.
- Cross-platform conversion counts are summed (`DIMS` at `blend.ts:110`) with no
  attribution dedup; that is a deviation owned by `attribution-and-incrementality`,
  not by this technique, and is named in the scout's own "worse than standard" list.
