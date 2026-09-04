---
layer: application
type: application
subject: demo-data-plane
technique: one-interface-many-planes
stack: next
status: forged
verified_on: 2026-09-02
verified_against: next@16
applied: experiment
ab_verdict: better
---

# Provenance on the session, provenance on the wrapper, provenance on nothing — counted

*Verified against `xkazm04/systedo-case` at `ab11a8b4` (Next 16.3, React 19.2),
read on 2026-09-02. The harness enumerated every call of the sample-only loader
and of the provenance-wrapped resolver outside the loader's own folder; the
classification of each site is by hand, with the predicate stated.*

This tree is the consumer that produced the technique's condition, so it is the
right place to ask whether the condition partitions its call sites better than
the unconditioned rule did. It does. The unconditioned rule ("no plane identity
on the interface, identity is session state") scored the project's contexts as
conformant on 2026-08-31 — and under that rule they *are*: no consumer calls a
"which plane am I" method, and every surface that labels itself reads the label
from a session-level boolean. The condition finds what that verdict missed.

## The three shapes the tree holds

The product has exactly the sample and live planes the technique describes,
and it carries provenance in three different places at once:

- **On the session.** `hasSyncedMetrics(projectId)` (`src/lib/report-metrics/store.ts:24`)
  is the one honest signal — true only once a tenant has synced rows — and
  `projectDataSource(live, locale)` (`src/lib/project-data/source.ts:43`) maps
  it to the pill copy. Nothing about the *data* is consulted.
- **On a wrapper.** `resolveReportDataset(project)` (`src/lib/report-metrics/resolve.ts:46`)
  returns `{ data, source, live, syncedAt, ... }` — provenance beside the value,
  one call, and the value inside is plane-blind `PerformanceData`.
- **On nothing.** `getProjectDataset(project)` (`src/lib/project-data/dataset.ts`)
  returns the sample plane for *any* project, real tenant included, and the
  `PerformanceData` shape (`src/lib/types.ts:62`) has no field that says so.

The technique's condition asks one question of each site: **can a fabricated
value arrive in the same result as a real one?** If it cannot, session identity
is the right home; if it can, the value must carry its plane.

## The count

Twenty sample-loader call sites and nine resolver call sites, partitioned by
that predicate:

| class | n | sites | under the condition |
| --- | --- | --- | --- |
| demo project by construction | 8 | `api/ai/grounding.ts:204`, `dashboard/report/page.tsx:31`, `components/demo/DemoModule.tsx` ×6 | one plane; session identity is correct, no provenance field owed |
| provenance on the wrapper | 3 (+9 resolver consumers) | `report-metrics/resolve.ts:104`, `microsite.ts:267,280` | expected shape; the wrapper is provenance-on-the-value for as long as nobody unwraps `data` and passes it on |
| clock anchor only | 2 | `app/[projectId]/katalog/page.tsx:35`, `twin/page.tsx:17` | the sample's last date is used as a deterministic "now"; no fabricated metric reaches the viewer (though a synced tenant's "now" here disagrees with the report's `asOf`) |
| mixed constructor, by design | 1 | `report-metrics/build.ts:51` | real `daily` rows spread over the sample spine; the sample `channels`, `events` and `meta` are neutralized **by hand, field by field**, because the value has no field that could say which half is which |
| source-blind, real tenant reachable | 6 | below | the failure the condition names |

The six:

1. `src/components/app/ProjectOverview.tsx:129` loads the sample dataset,
   `:139` reads `hasSyncedMetrics`, `:165` turns that into the
   "Živá data · Google Ads" pill, and `:217` renders the KPI band from
   `totalsOf(data.daily.slice(-30))` — the *sample* series. A synced tenant's
   overview shows sample numbers under a live label.
2. `src/components/app/overview/portfolio-model.ts:200` builds each
   comparison row with `live: synced` and `totals` from the same sample
   loader; `PortfolioCompare.tsx:99-108` renders the pill and the totals side
   by side.
3. `src/lib/insights/aggregate.ts:96` computes the unprofitable-channel
   recommendation from sample `channels` and tags it `from(metricsLive, ...)`
   — a session boolean stamped onto a value computed from the other plane.
4. `src/app/app/[projectId]/srovnani-seo/page.tsx:22` prices comparison
   queries with `data.channels` and calls them "real channel economics" in
   its own comment; `build.ts:15-18` says the opposite of the same field.
5. `src/app/app/[projectId]/sklad-sezonnost/page.tsx:25` derives the
   seasonality curve from the sample series and, at `:56`, the trailing spend
   from the live resolver — one plan from two planes, the fabricated half
   unmarked.
6. `src/app/api/ai/grounding.ts:345` grounds the social-drafting prompt on
   `getProjectDataset(project)` for an *owned* project as well as a demo one;
   the comment says so ("not the live-Ads resolveReportDataset the recap
   uses"). This is the re-fed-to-a-model case the condition calls out.

Under the unconditioned rule these twenty sites scored as roughly forty-two
breaches, because every read of provenance anywhere counted. Under the
condition fourteen are the expected shape, six are the failure, and the six are
a real mislabel the "conformant" verdict did not see. That is the A/B: same
tree, same sites, two rules; the conditioned rule is the one whose count means
something.

## The structural fact

`buildLiveDataset` is the tree's own proof of the condition. It has to make a
live value out of a sample spine plus real rows, and because `PerformanceData`
carries no provenance it neutralizes the sample fields one by one — `channels`
to `[]`, `events` to `undefined`, `meta.disclaimer` to `""`, `meta.seed` to
`0` — and retains `goals`, whose `monthlyRevenue` is the base fixture scaled by
a hash of the project id (`dataset.ts:scaledDataset`, `seed.ts:projectScale`).
The commit that added the neutralization (`eba069c2`, "strip the sample
spine's meta when building the live dataset") is the source-blind failure
being fixed after the fact, field by field, with a comment as the only guard
against the next field. A provenance field on the value would have made the
mixed constructor a type error instead of a convention.

## What this realization cannot do

The wrapper shape (`ResolvedDataset`) protects only the call that receives it.
`resolved.data` is passed onward to `buildSnapshot`, `perfGrounding` and the
chart models as bare `PerformanceData`, and from that point the plane is
unrecoverable. The project's honesty is therefore enforced by nine consumers
remembering to read `resolved.live` before they unwrap, not by the value.

## Follow-up the project owes itself

The narrowest `code` arm is two lines: `ProjectOverview.tsx:129` and
`portfolio-model.ts:200` swap `getProjectDataset(project)` for
`(await resolveReportDataset(project)).data`, which the sibling pages
(`vykon`, `zisk`, `mesicni-report`) already do. It was not made in this run
because no unit test sees the overview's KPI band, so the proof would be
`structural-only`; the paired instrument is a test that renders the overview
model for a project with one synced row and asserts the last-30 totals equal
the row, not the sample.
