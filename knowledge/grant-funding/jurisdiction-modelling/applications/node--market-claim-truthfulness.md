---
layer: application
type: application
subject: jurisdiction-modelling
technique: market-claim-truthfulness
stack: node
status: forged
---

# Node: coverage claims derived from profiles, with an honest boundary

The grant-writing-nonprofits repo derives every market claim from the
jurisdiction profile set and gives unsupported markets a dedicated surface —
the two halves of the technique.

## Derived market lists

`src/features/jurisdictions/registry.ts:207-260` holds the whole claim
pipeline:

- `MARKET_BLURBS` (registry.ts:207-212) — one hand-written coverage sentence
  per **supported** market, keyed by country code; nothing else about the
  list is hand-maintained.
- `ROADMAP_MARKETS` (registry.ts:219-226) — announced-but-not-live markets.
  Its comment records the auto-graduation rule and an actual graduation:
  "EU graduated to a supported profile (eu.ts) — the listMarkets filter also
  auto-drops any roadmap market that ships, but keep this list truthful."
- `listMarkets()` (registry.ts:231-247) — supported profiles first (filtered
  on `j.supported`), then roadmap entries filtered by
  `!isSupportedJurisdiction(m.code.toLowerCase())`, so "coming soon" can
  never advertise a market that shipped. The JSDoc names the point: it
  "drives the landing coverage band and the onboarding country picker from
  one list, so the two can't disagree about what Wellspring covers."
- `listCountryMarkets()` (registry.ts:258-260) — the countries-only view for
  geographic claims: "Use this for any GEOGRAPHIC claim — a coverage
  sentence, a market count, a list of places — so a supranational body (the
  EU) is never rendered as a peer of a nation, and never inflates a coverage
  count that a member state already covers via `memberOf`." The same JSDoc
  states where the full list is correct instead: the onboarding picker
  ("a pan-EU applicant must be able to choose it"), per-market grant pages,
  and the sitemap. Two functions, and the call site must choose — exactly
  the technique's forced-choice rule.

The supranational discrimination this rests on is typed at
`src/features/jurisdictions/types.ts:13-17` and defended in `eu.ts:17-26`,
whose comment records the incident shape: `level: "supranational"` with
"NOT 'country': you cannot incorporate a nonprofit 'in the EU'. Typing this
as a country made every consumer treat the EU as a peer of CZ/US/GB/JP —
which double-counts coverage, since CZ already inherits the eu-sedia corpus
through `memberOf`."

## The unsupported-market surface

`src/components/UnsupportedRegionNotice.tsx:1-27` is the honest boundary.
Shown when an org's jurisdiction has no supported profile, it (a) states the
reason in the applicant's terms — "Grant eligibility is set by each
country's laws and registries, so we launch one jurisdiction at a time" —
(b) names what is covered today, (c) offers a country-tagged waitlist
mailto, and (d) replaces, rather than decorates, the default experience.
The file comment makes the fallthrough ban explicit: it "offers a waitlist
instead of a broken / US-assumption experience. International expansion =
registering a JurisdictionProfile, after which this surface no longer
triggers there."

## Deviation

The notice's body copy names the supported market statically ("We currently
support the United States…") while the market list itself is derived — a
small drift risk the derived-lists half of the file family exists to
eliminate; the fix is rendering the covered-market names from
`listCountryMarkets()` in the notice too.
