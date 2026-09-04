---
layer: application
type: application
subject: conformance-checking
technique: edition-stratified-conformance
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# One lane keyed by the ruler, one lane that was not

The tree is a maturity-index service that scores repositories against a rubric
it revises: a `SCORING_RUBRIC_VERSION` constant (`src/lib/maturity/model.ts:192`,
`"r16"` at the time of reading) is the edition of the standard every score is
computed under, and the tree witnesses Node 24 through the `engines` field of
its `package.json` (`"node": "24.x"`, line 7). It is not a conformance checker
against an external suite; it is the *other* half of the technique's situation -
a checker whose own standard moves - and it had already reached the technique's
conclusion in one lane and not in the other.

## The structural fact

The outcomes lane keys every aggregate by the instrument that produced it. The
comment at `src/lib/outcomes/aggregate.ts:9` states the rule in the technique's
own words: a movement across rubric versions "is a measurement of the ruler
changing", and `rubricVersion` plus the engine provider are part of the
aggregation key (`aggregate.ts:64-75`). That lane cannot compare an r15 score
to an r16 score, by construction.

The regression-alert lane did not. `checkAndAlertRegression`
(`src/lib/scan-alerts.ts`) diffed the fresh report against the previously
persisted one (`diffReports(prev, fresh)`) and handed the delta to
`detectRegression` with no check that both reports were scored under the same
rubric. A persisted report carries its rubric (`src/lib/types.ts:1168-1183`
says it is populated on a database-reconstructed row); the fresh one is the
current constant. So the first scan after a rubric bump compared two editions
and, where the new rubric scored a repository more than five points lower, would
have paged the owning organisation with a regression it did not cause - across
every organisation in the fleet, on the same day. Nobody designed the
asymmetry; the outcomes lane was written by someone holding the rule and the
alert lane by someone who was not.

## The paired proof

The instrument is the file's own unit suite (`npx vitest run
src/lib/scan-alerts.test.ts`), which mocks the detector so the glue's decision
can be driven directly. The fixture: a previous report scored under rubric
`r0`, a fresh report under the current rubric, the detector forced to answer
"regressed", a webhook configured.

| arm | change | dispatches | suite |
| --- | --- | --- | --- |
| A | none | 1 | 37 of 38 pass (the new case fails) |
| B | rubric guard before the diff | 0, `rulerChanged: true` | 38 of 38 pass |

The guard is nine lines: read `prev.engine.rubricVersion`, take
`fresh.engine.rubricVersion` or the constant, and return without diffing when
both are present and differ. A second case pins the technique's
unknown-is-not-a-value rule: a legacy persisted row with *no* recorded rubric
is unknown, not changed, and still takes the ordinary path - it dispatches. The
counts are per arm at n=1 fixture each, which is the whole claim.

## What the tree cannot do

It cannot stratify. The rubric has no edition structure to stratify *by*: an
r16 score is not "r15 plus new checks", it is a rescoring, so the technique's
second move (older editions hold still) has no purchase here and the right
behaviour is the first and third moves only - treat the rubric version as part
of the run's identity, and refuse the comparison rather than reinterpret it. A
deliberate re-baselining an organisation wants to hear about would need its own
message class; none exists, and the guard makes that silence explicit
(`rulerChanged`) rather than hiding it inside a false regression.
