---
layer: application
type: application
subject: honest-proof-and-illustrative-data
technique: indexability-follows-provenance
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Node: per-request provenance and the three indexability policies

Workspace `systedo-case` at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08). The public microsite route `/m/{slug}` renders one of three page
kinds - a client performance page, a local service landing page, an experiment
arm - and the server decides provenance and indexability per request in
`src/lib/microsite.ts` and `src/app/m/[slug]/page.tsx`. This application covers
both the binary-provenance technique and the indexability technique, because in
this tree they are one bit read twice.

## The provenance bit

`src/lib/microsite.ts:229-236` declares the view type with a single `live:
boolean`, documented as "the page's honest source signal: robots index + no
disclosure banner ONLY on a fully synced-real view". `resolveMicrositeView`
(lines 311-323) computes it per request: if the config has an owning project,
read its report metrics; if `isLiveMetrics(metrics)` - actually synced rows, the
reporting subject's liveness rule, imported at line 35 rather than re-derived -
and the account is in the base currency, return the synced view with `live:
true`; otherwise, or on any store error (line 318-320), return the disclosed
sample view with `live: false`. The comment at lines 305-310 states the
integrity rule verbatim: "a view is either fully synced-real ... or fully
disclosed-sample; the two series are never blended", and the currency refusal:
"publishing a EUR series relabelled as Kč on an indexable page is the exact
dishonesty this seam exists to prevent".

No blending is enforced by construction. Both branches end in one function,
`buildView(config, data, provenance)` (lines 240-253), which takes a whole
dataset and a provenance label. The real branch's dataset, `syncedDataset`
(lines 279-300), keeps only `daily` and `meta` from the rows and sets `channels:
[]`, `channelDaily: undefined`, `events: undefined` - the sample spine's channel
mix and event calendar are dropped, not inherited (comment, lines 272-278). The
one thing retained from the sample spine is `goals`, with the documented reason
"a forward-looking target, not a fabricated result". The sample branch,
`buildMicrositeView` (lines 257-269), passes `"illustrative"` provenance into the
article builder so that "the FAQ/perex" do not "self-certify demo numbers as the
client's real series (and the Markdown twin has no page banner)" - the technique's
step 4 in the author's own words.

## The banner follows the bit

`src/components/microsite/PerformanceMicrosite.tsx:99-103` renders the
illustrative disclosure only when `!live && config.illustrative`, with the
comment "a live view IS the client's real synced series, so the banner would be
the opposite lie". The structured data at lines 47-74 - an `Article` node and a
`Dataset` node with `variableMeasured` for revenue, cost, conversions and the
cost ratio - is built from the same `snapshot` as the page, so the markup and the
chrome cannot carry different provenance.

## The three indexability policies

`src/app/m/[slug]/page.tsx` sets robots by page kind, and only one kind reads
the bit:

- Lines 43-65: `config.kind === "local-landing"` returns `robots: { index: true,
  follow: true }` unconditionally, with the comment "A local landing page exists
  TO RANK: it carries the tenant's own service, price and locality - nothing
  illustrative".
- Lines 67-80: `config.kind === "lp"` returns `{ index: false, follow: true }`,
  "deliberately the opposite call": an experiment arm "exists to be measured and
  DIES when the test ends", indexing would rank "whichever arm the crawler
  happened to draw" and land organic arrivals "on a page whose split they were
  never randomised into"; `follow` stays true "so an operator's own link check
  still works".
- Lines 82-91: the performance page awaits `resolveMicrositeView(config)` and
  sets `robots: view.live || !config.illustrative ? { index: true, follow: true }
  : { index: false, follow: true }`, with the comment "an illustrative
  (case-study) microsite is NEVER indexed - demo numbers must not be published
  as search-findable 'proof'. `view.live` is decided per request from
  actually-synced rows, so a cleared sync reverts to noindex".

The route is dynamic by design (`page.tsx:1-4`: no caching, re-renders on every
request), which is what makes the per-request decision real rather than a flag
cached at publish time.

## Where the tree stops short

Deviation: the `!config.illustrative` disjunct at line 89 lets a config flagged
non-illustrative index even when `view.live` is false - a config written by hand
as "real" would index its scaled sample. The technique's rule is that the
performance page's flag is the provenance bit "and nothing else"; the tree keeps
a second, config-level override. The standard stays.

Upward lessons taken into the techniques: `follow: true` on noindex so link
checks resolve; the currency refusal as a reason to stay on the sample branch;
`goals` retained as a plan rather than a result; the sample branch passing its
provenance into the article body because the plain-text twin has no banner.
