---
layer: application
type: application
subject: site-architecture-and-topic-clusters
technique: pillar-weighted-completeness-and-decay
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Pillar-weighted completeness and a decay threshold that has never met real data

The marketing workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) realizes both ledgers of this technique as one pure module,
`src/lib/content-engine/compute.ts` (117 lines, no store, no framework), fed by a
fixture. The arithmetic matches the technique closely; the provenance of the numbers it
runs on is the structural finding, and the workspace states it more honestly than most.

## Completeness

`compute.ts:7-8` declares `PILLAR_WEIGHT = 3` and `SUPPORTING_WEIGHT = 1`, and the
doc comment at lines 4-6 gives the reason the technique adopted as its own: "a cluster
with three supporting articles but no pillar still reads as incomplete." The constant
carries its justification, which is the standard; the value three is unargued, which
is why the technique labels the ratio a convention. `completeness()` at lines 51-58 is
published weight over total weight and returns 0 on an empty cluster rather than
dividing by zero.

`nextGap()` at lines 63-68 returns the planned pillar when one exists and otherwise
`planned[0]`. The comment at lines 60-62 says "otherwise the planned supporting article
in the highest-volume cluster context" - but volume is a cluster property
(`sample.ts:18-19`), not an article property (`sample.ts:6-14`), so within a cluster
the tie is broken by plan order, not by the spoke's own volume. The technique's rule
("by the spoke's own volume where the map carries it, and by position in the plan
where it does not") is written to name both branches; this workspace is the second.

`rankedClusterStats()` at lines 104-108 sorts least-complete first, ties by cluster
volume descending - the technique's cross-cluster rule verbatim.

## Link debt

`clusterLinkGraph()` at lines 72-85 is the link-debt ledger: every supporting article
is a spoke, `linked` is true only when spoke and pillar are both published *and*
`linksToPillar === true` (line 80), and `missingLinks` counts published spokes under a
published pillar that are unlinked (line 83). The "only meaningful once both pages are
published" clause at lines 14-15 is the upward lesson the technique took as "a planned
page cannot owe a link". But `linksToPillar` is a fixture flag: `sample.ts:10-13` marks
it "Real-integration seam: a crawler / link audit", and the fixture at `sample.ts:37`
and `:55` sets it false by hand. The technique's rule that link debt "comes from a
crawl or a link audit, never from the plan's own flag" is the standard; here the flag is
the plan's own, and the module says so.

## Decay, and the fact the caller asked for

`DECAY_THRESHOLD = -0.1` at `compute.ts:111`, applied at line 115 as a strict
`trafficChangePct < DECAY_THRESHOLD` over a `DecayingPost` whose field is documented as
"YoY organic traffic change (negative = decaying)" (`sample.ts:23-28`). The second band
lives elsewhere: `ContentEngine.tsx:429-430` colours a row negative and labels it
high-priority at `<= -0.3`, and `src/lib/insights/aggregate.ts:428` repeats the same
`-0.3` literal to choose a warning tone. Two files, one unnamed constant, no shared
symbol - the ten-percent trigger is named and the thirty-percent band is not, which
is the "one target, one threshold" shape the bundle's laws warn about applied to a
content queue rather than a campaign.

**Neither threshold has ever been checked against real data, because clusters and
decay are still fixtures.** `sample.ts:1-2` opens "Illustrative topic clusters +
decaying posts ... Real-integration seam: keyword tool + Search Console (traffic
trend)". `SAMPLE_DECAY` at lines 60-65 is four hand-typed rows (-0.38, -0.22, -0.15,
+0.04) chosen so that three clear the trigger and one clears the high band.
`src/lib/content-engine/resolve.ts:33-35` defines `ContentDerivation = "sample" |
"search-console"` and line 60 hard-codes `derivedFrom: "sample"` as "the only branch
that exists today". So the -10% and -30% numbers are conventions that have selected
only rows written to be selected by them; whether -10% is the right trigger on a real
Czech-market content site is unknown, and the workspace has not claimed otherwise.

What the workspace does do is label the provenance correctly. `resolve.ts:1-25`
records the incident: the module once labelled itself live whenever the project had
synced ad metrics, while every number on the screen came from the fixture. The fix
made the label follow `derivedFrom` rather than the connection, and carries `adsSynced`
only as "the honest caveat" (lines 19-22) that this screen is not computed from the
synced data. That is the bundle's provenance law realised in a resolver, and it is the
reason this document can say "never checked against real data" as a fact read from the
tree rather than an inference.

## Structural facts

- **Confirmed:** pillar-weighted completeness, missing-pillar-is-the-next-gap,
  least-complete-first with volume tie-break, and link debt gated on both pages being
  published are all implemented as the technique describes, in a pure module.
- **Deviation:** within-cluster gap order is plan order, not spoke volume; the map
  carries no per-article volume to do otherwise.
- **Deviation:** the -0.3 priority band is duplicated as a literal in two files with no
  name, against the named `DECAY_THRESHOLD`.
- **Unverified by design:** both decay thresholds and the link-debt flag run on
  fixtures; the search-performance-console seam named at `sample.ts:2` and
  `resolve.ts:13-17` does not exist. The technique's decision rule that a queue "says
  so beside the number" when thresholds are unchecked is met here by the derivation
  label, not by a note on the threshold itself.
- **Not present:** no weekday balancing, window-equality or partial-bucket handling
  around the year-over-year figure, and no absent-value path for a page younger than a
  year - the fixture supplies every post with a number. Those rules apply the day the
  seam lands and are absent, not wrong, today.
