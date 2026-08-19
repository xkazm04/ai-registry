---
layer: application
type: application
subject: funder-intelligence-index
technique: k-anonymity-suppression
stack: node
status: forged
---

# Node — k-anonymity suppression in a live funder index

How the Wellspring grant-writing product (repo `grant-writing-nonprofits`)
realizes the suppression floor — plus the consent gate and write-time
generalization it composes with — in plain server-side functions.

## The floor: one constant, distinct-contributor counting

`src/features/wellspring-index/aggregate.ts` owns the floor:

- `export const K_ANONYMITY = 5;` (line 17) — the single named constant.
  Every aggregation defaults to it (`k: number = K_ANONYMITY`), and the
  public disclosure string is composed *from the same import* (below), so
  the disclosed and enforced floors cannot drift.
- Both aggregators group applications while accumulating a
  `orgs: Set<string>` per cell, and gate on set cardinality, not row count:
  `if (g.orgs.size < k) continue; // k-anonymity floor` — line 110 for the
  per-(funder × revenue-bracket) quartiles, line 155 for the per-funder
  leaderboard records. A prolific single org can never publish a cell.
- Suppression is total: a failing cell is simply not pushed to the output
  array. There is no "shown with warning" branch to leak partial columns.

Upstream of the floor, `collapseApplications` (lines 35-56) reduces
per-transition outcome rows to one application each — the row id ends in
`:submitted|:awarded|:declined` and `applicationKey` strips the suffix
(lines 31-33), with `awarded` winning the collapsed verdict — so
denominators count applications, not events.

## Write-time generalization

`src/features/match-engine/outcomes.ts` coarsens quasi-identifiers before
anything is stored:

- `revenueBracketFor` (lines 17-22) maps exact revenue to four brackets
  (`< $250K` … `> $10M`); non-finite input falls into the most conservative
  band rather than erroring.
- `programHashFor` (lines 37-40) buckets the free-text program title into a
  16-hex-char sha256 prefix — outcomes group by program without the raw RFP
  title ever being stored.
- `cycleFor` (lines 43-47) reduces dates to calendar quarters
  (`2026-Q2`), the dimension rates trend on.
- `buildOutcomeRecord` (lines 62-82) mints an idempotent id per
  `(org, grant, outcome)` so re-marking a transition overwrites instead of
  inflating the signal.

## The consent gate runs first, as a separate function

`src/features/wellspring-index/signals.ts` is the server-only bridge. Its
comment (lines 20-25) states the layering contract this technique demands:
consent is load-bearing ("we contribute when you apply / opt out anytime"),
k-anonymity is "a SEPARATE protection (small-bucket suppression), never the
consent mechanism", and orgs with no profile row are excluded
(privacy-conservative default). `consentingOutcomes()` (lines 26-33)
filters the outcome pool to currently consenting org ids on every read —
retroactive opt-out by construction — and only then do
`getFunderQuartileSignals` / `getFunderRecordSignals` aggregate.

## The disclosure has one home

`liveSignalNotice(prefix)` (signals.ts lines 59-62) composes the
provenance line every index data route attaches:
`` `${prefix}, n=${count} contributing orgs (k>=${K_ANONYMITY} suppressed)` ``.
Routes supply only their prefix; the count comes from the consent-filtered
pool and the floor from the enforced constant. The published methodology
(`src/app/intelligence/IndexMethodology.tsx` lines 40-44) repeats the
promise in prose — "no funder is reported below k=5 … small-population
funders are surfaced only at the funder level, not the program level" —
which is the dimension-hierarchy containment (drop the finest dimension
first) stated as user-facing contract, alongside as-of date, refresh
cadence, and a bias note (lines 22-54).

## The private-view contrast

`src/features/funder-desk/kpis.ts` shows the other floor from the
technique's "when not to use this": the org's own dashboard applies
`MIN_DECIDED_FOR_WIN_RATE = 3` (line 12) — a statistical noise guard
("otherwise one win reads as 100%"), not a k-floor — and `winRatePct` is
`null` below it (lines 44-47). Two floors, two threat models, two
constants.

## Upward lesson carried into the technique

The blend of live over curated data was originally an all-or-nothing
cutover: the first funder to clear k made the live set non-empty and
replaced the entire 15-funder curated leaderboard with one row. The fix,
`mergeFunderRecords` (aggregate.ts lines 183-202), merges per funder id —
live replaces its fixture counterpart, unmatched fixtures are retained,
live-only funders are appended, and each row's `signalNote` carries its own
provenance ("Observed from N applications across M orgs." — line 177). This
incident is why the golden path names the cliff cutover as a first-class
failure mode.
