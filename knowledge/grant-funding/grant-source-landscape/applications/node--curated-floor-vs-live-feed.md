---
layer: application
type: application
subject: grant-source-landscape
technique: curated-floor-vs-live-feed
stack: node
status: forged
---

# Node: curated floors under gated live feeds (grant-writing-nonprofits)

The `grant-writing-nonprofits` repo (a Next.js/TypeScript grant-matching
product) realizes the two-layer source design in its ingest feature at
`src/features/grant-ingest/sources/`.

## The registry and the configured-filter

`sources/index.ts:22-44` is the single flat source registry
(`GRANT_SOURCES: GrantSource[]`): the always-on federal backbone
(`grantsGovSource`, `isConfigured: () => true` — free, public, no auth,
`sources/grantsGov.ts:6-12`), opt-in live adapters (`sediaSource` behind
`INGEST_EU_SEDIA=1`, the bulk `grantsGovExtractSource` behind
`INGEST_GRANTSGOV_EXTRACT=1`), and then the floors spread in at the end:

```ts
...stateGrantSources,        // Socrata factory output, LIVE/gated
...curatedStateGrantSources, // always-on curated regional floors
```

`configuredSources()` (`index.ts:49-51`) filters the registry on
`s.isConfigured()` — the "runnable subset" is computed, never a second
list. The registry comment states the design intent verbatim: curated
floors exist "so no jurisdiction renders an empty corpus by default".

## The floor: offline, region-scoped, real funders

`stateGrantsCurated.ts` holds `US_STATE_CURATED`, one
`CuratedStateConfig` per state (`key: "ny-curated"`, `region: "ny"`, a
grants array). Its header comment (lines 5-19) is the technique in
miniature: an "always-on, OFFLINE regional floor so an org outside
California isn't federal-only out of the box", region-scoped via each
state's `US_REGIONS.sourceKeys` so "a NY org sees ny-curated and a TX org
sees tx-curated — never each other's", with the live upgrade path named in
the same comment: set `INGEST_<STATE>_GRANTS=1` plus a verified dataset id
"and the real-time portal layers ON TOP of this curated floor". Entries
name real grantmakers (e.g. the state arts council's recurring program
support) with maintained ISO close dates — "refresh close dates as cycles
roll over" is written into the file as accepted maintenance debt.
`curatedFoundations.ts` and `czCuratedFoundations.ts` /
`gbCuratedFoundations.ts` are the same pattern for foundation and
non-US-market floors; `curatedFoundations.ts:5-11` explicitly labels its
set an illustrative seed, not scraped data — the curation-honesty rule in
force.

## The gated live layer, and the fail-fast template

`statePortal.ts` is a Socrata adapter *factory*: `US_STATE_PORTALS` config
rows become `GrantSource`s via `makeSocrataGrantSource`. Every portal is
gated (`envFlag: "INGEST_WA_GRANTS"` etc., lines 98-102) "so the default
ingest never depends on a live state API — the always-on curated floors
are the no-network baseline."

The file also carries the landscape's key measured finding
(`statePortal.ts:104-112`, dated verification sweep): state open-data
portals "overwhelmingly publish grant AWARD HISTORY … NOT open RFPs with
application windows". Exactly one verified live opportunity dataset was
found (Washington's Fund Finder, wired at lines 114-133 with verified
column names); the other states remain TEMPLATES whose `resourceId` is a
`REPLACE_WITH_DATASET_ID` placeholder — and the factory **fails fast if a
template is enabled without a real id**, while "the `*-curated` floors
cover those states meanwhile" (lines 135-154). Even the verified adapter
shows curation judgment: WA's `funding_limitation` column is deliberately
NOT mapped to an award amount because it is a program-level cap that would
mislead award-size matching (lines 118-120).

## Why this is a faithful realization

Both layers emit the same `IngestedGrant` shape under distinct source
keys, so a jurisdiction upgrades from floor-only to floor+feed by flipping
one env flag — no migration. The known limitation the technique demands be
recorded is recorded: the corpus resource map notes the curated-floor rows
are the only ones without a public URL cross-reference, filed as a
follow-up rather than papered over with fabricated links
(`docs/data-source-resource-map.md` §1).
