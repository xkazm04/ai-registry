---
layer: application
type: application
subject: client-reporting-and-data-provenance
technique: live-means-synced-rows
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Live means synced rows - one predicate, and freshness derived beside it

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) defines "live" in exactly one
place and derives freshness from one sync timestamp in exactly one other, and both
modules are pure and framework-free by design so the rule is unit-tested without a
store or a clock. The tree proves the technique's structural claim: liveness is a
predicate over the stored rows, and a credential is not an input to it.

## The single liveness predicate

`src/lib/report-metrics/types.ts:96-111` is the definition, and its doc comment is the
technique's thesis in the tree's own words: *"a project is live once it has actually
SYNCED rows - not the moment an Ads account is linked (linking and syncing are
separate, non-atomic actions)."* `isLiveMetrics` (`types.ts:109-111`) delegates to `isLiveSection`
(`types.ts:116-120`), whose body is the whole rule:

```ts
return !!section && !!section.meta && Array.isArray(section.rows) && section.rows.length > 0;
```

Two things about that line matter. First, no token, credential or "linked" flag
appears in it. Second, the predicate doubles as the **shape guard** for the stored
blob (`types.ts:103-108`): a blob that parses but lacks `rows` or `meta` - a partial
write, a hand edit, schema drift - is *not live* and degrades to the sample dataset
instead of throwing on the first tile. That is the upward lesson the technique's
step 2 now carries: malformed is a provenance state, not an exception.

The predicate is imported directly by four modules (`grep -l isLiveMetrics src`) -
the report resolver (`src/lib/report-metrics/resolve.ts`), the store
(`src/lib/report-metrics/store.ts`), the public microsite
(`src/lib/microsite.ts:302-316`) and the blend - and every other surface (the
settings page, the overview, the AI grounding) reads liveness through the resolver
or the store's `hasSyncedMetrics` accessor, which the comment at `types.ts:98-99`
says derives from the same rule.
The comment at `types.ts:99-100` names why: *"so the Monthly Report, the AI recap and
the Settings/Overview labels never disagree."* One predicate, every surface - the
technique's decision rule about two predicates producing a settings page that says
"live" while the report says "illustrative" is precisely the incident this
consolidation prevents.

The per-section form is what lets the blend refuse a half-written section
(`src/lib/report-metrics/blend.ts:24`, and the test *"an empty or malformed section
never becomes a channel"* at `test-unit/report-metrics-blend.test.mjs:175`): a section
that is not live cannot contribute a channel row or be picked as the primary.

## Freshness beside it: two thresholds, both labelled as convention

`src/lib/report-metrics/freshness.ts` carries the two ages:

- `RESYNC_MIN_HOURS = 20` (`freshness.ts:7-11`), with the reasoning the technique
  adopted as an upward lesson: *"a hard 24h gate would skip a whole day whenever a
  run drifts a few minutes late."* The gate sits below the cadence it protects.
- `STALE_AFTER_DAYS = 7` (`freshness.ts:13-15`): *"a monthly report a week behind its
  account is materially misleading."*

Both are practitioner constants chosen for a daily sync; neither is documented
platform behaviour, and the module's own comments argue them from cron jitter and
report cadence, not from any platform. The technique labels them as convention on
that basis.

`isResyncDue` (`freshness.ts:34-42`) and `isReportStale` (`freshness.ts:47-55`) are
where the two edge cases are decided:

- **Never synced is not stale.** `isReportStale` returns `false` on a missing or
  unparseable timestamp - *"the report is honestly on sample data - a different
  state, not 'stale live data'"* (`freshness.ts:44-46`). The test at
  `test-unit/report-freshness.test.mjs:45` pins it.
- **A future timestamp is recent.** `ageMs` yields a negative number on clock skew,
  which reads as not due and not stale (`freshness.ts:20-22, 33`), so *"a skewed
  clock never thrashes the Ads API"*. Test at `report-freshness.test.mjs:33`.

`isResyncDue` is consumed by the hourly sync cron (`src/app/api/cron/sync/route.ts:102,
196`), so the resync-before-render decision is the cron's, not the page's, and a
report requested at any hour finds rows at most ~20 hours old.

## The caveat that travels

`staleCaveatText` (`freshness.ts:63-78`) returns `""` when not stale - *"so the
ungrounded/fresh prompt stays byte-identical"* - and a dated caveat otherwise. The AI
grounding injects it at `src/app/api/ai/grounding.ts:237`, user-prompt only. The
technique's "when not to use" now names this structural form: the fresh branch adds
nothing, so a cached or fingerprinted generation is not disturbed.

## Where the tree falls short of the standard

- The caveat says *"last synced N days ago"* rather than naming the sync date, and the
  narrative is instructed to *"say so in the summary"* but no validator checks the
  output for the date. The standard stands: the caveat carries the date, and a stale
  report's narrative is checked for it rather than trusted to the prompt.
- Liveness is a whole-blob predicate; there is no *synced, not for this period* state.
  A project whose rows stop three weeks before the report period reads as live, and
  the period gap is caught only by `truncated` on the snapshot
  (`src/lib/report/compute.ts:124-133`) and by staleness. The technique's four-state
  vocabulary keeps the third state; the tree collapses it into the other two.
- There is no page-level minimum over tiles because there is one blob per project
  and the live flag is per project; a multi-source project with one live section and
  one pending section is live. The blend refuses the pending section as a channel,
  which is the right half of the rule.
