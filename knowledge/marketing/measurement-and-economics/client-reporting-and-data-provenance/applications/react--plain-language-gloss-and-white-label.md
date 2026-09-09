---
layer: application
type: application
subject: client-reporting-and-data-provenance
technique: plain-language-gloss-and-white-label
stack: react
status: forged
verified_on: 2026-09-09
verified_against: react@19
---

# Plain-language gloss and white label - the shared report page

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) renders the client-facing
report as a server component at `src/app/report/[token]/page.tsx`, reached by a
tokenised link the agency shares. The page realises three of the technique's rules
structurally - never the vendor's name, a gloss beside every ratio, no indexing - and
it is also where the report's provenance pill and the tile-skip rule from sibling
techniques land on the client's screen.

## Never the vendor's name

`page.tsx:122-124`:

```ts
// Never fall back to the vendor name on a client-facing report — use the brand
// captured at share time (white-label or project), else the client account name.
const brand = shared.brandName || shared.accountName || "Report";
```

The resolution order is the technique's: the share-time white-label brand, then the
client's own account name, then a generic word. The vendor's product name appears
nowhere in the chain, and the final fallback is the neutral "Report", not a brand -
an explicit empty-ish slot rather than an invented credential. The identity is
*captured at share time* (`shared.brandName`, `shared.logoUrl`, `shared.accentColor`,
`page.tsx:121-124, 150-154`), which realises the technique's last decision rule: a link
opened after the contract ends still renders under the identity it was generated with
and never re-resolves.

The accent bar (`page.tsx:146`) and logo (`page.tsx:150-153`) follow the same pattern -
present when captured, absent otherwise. The eyebrow (`page.tsx:154`) reads
`{brand} · {heading}`, so the agency's name is the first thing on the page.

## The gloss

`page.tsx:132-138` glosses the two ratios a non-marketer cannot read, and says why in
the comment: *"a client report is read by non-marketers, so ROAS/PNO get a one-line
plain-language explanation (Cost/Conversion value are already plain)."* The hints are
locale strings at `page.tsx:29-31` (Czech) and `:59-61` (English): *"návratnost
výdajů na reklamu"* / *"return on ad spend"* and *"podíl nákladů na obratu"* / *"cost
share of revenue"*. The gloss is attached to the metric, not typed per report, and it
is absent on the two plain-money tiles - the technique's "absent when the metric has
no plain reading" applied in the narrower form of "absent when the label is already
plain".

## Not indexed

`page.tsx:83-84`:

```ts
// Shared links are private; never index them (the root layout is noindex too).
export const metadata: Metadata = { robots: { index: false, follow: false } };
```

The directive is unconditional - live or illustrative - and is belt-and-braces with
the root layout. This is the technique's private-page rule, and it is distinct from
the microsite's conditional indexability (`src/lib/microsite.ts:229-230`, *"robots
index + no disclosure banner ONLY on a fully synced-real view"*), which belongs to
`honest-proof-and-illustrative-data`.

## What lands on the same page from sibling techniques

`MonthlyReportPrimary` (`page.tsx:249-293`) renders the tile model that
`src/lib/report/assemble.ts` built:

- The provenance pill at `page.tsx:267` - `mr.live ? "Živá data" : "Ilustrativní
  data"` - sits at the top of the primary block, beside the heading, not in a footer.
- The tile-skip rule at `page.tsx:273-277`: `tileSnapshotValue` returns `null` for a
  metric key absent from the persisted snapshot and the tile is skipped, while a real
  `0` renders - *"Skip (don't fabricate 0 for) a tile whose metric drifted out of the
  persisted snapshot."* The helper is pure and tested (`test-unit/report.test.mjs:6`).
- The verdict-not-number rule at `page.tsx:285-288`: the signed delta is printed by
  `fmtSignedPct(d)` and the colour by `deltaTone(d, spec.goodWhenDown)`
  (`src/lib/report/compute.ts:145-150`). Delta only when `spec.hasDelta`
  (`page.tsx:278`), so ratio tiles show a single figure.

## Where the tree falls short of the standard

- The gloss is a *name* for the ratio ("return on ad spend"), not a sentence
  generated from the number ("for every crown spent, 4.20 came back"). The technique
  asks for the generated sentence in the client's currency; the tree stops at the
  label.
- The gloss does not carry the provenance verb. Conversion value is labelled
  "Conversion value" (`page.tsx:136`), which is honest, but nothing says "the platform
  attributed"; the descriptive verb the technique asks for is absent.
- The white-label identity for the *microsite* resolves, as a final fallback, to the
  case-study demo tenant's name (`src/lib/microsite-identity.ts:26-32`), so a
  never-configured tenant publishes under a fictional client's identity rather than
  an empty slot. That surface is `honest-proof-and-illustrative-data`'s, and the
  report page under review here does not share the fallback - but the two resolvers
  disagree about what an unset field means, which the technique says they must not.
