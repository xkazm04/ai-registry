---
layer: application
type: application
subject: test-harness
technique: configuration-axes-cross-the-ladder
stack: node
status: forged
verified_on: 2026-09-25
verified_against: node@22
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

<!-- version witness: the project pins its Node line in `.nvmrc:1 "22"`, which its CI workflows read through node-version-file; package.json's engines field only floors it at 20 -->

# An immutable bundle with a second writer

Read against the personas desktop application at commit `26b26be930`. The seam
is the autonomy-evaluation harness under `scripts/test/`, whose run protocol
gathers everything a team run produced into a bundle and then scores it. It
tests the technique's ownership half: records are immutable once written, and
the collection that holds them advances. This is the enforcement boundary added
on 2026-09-25, not the axis half, which the Rust application covers.

## The declaration and the second writer

The gather module states the property in its first lines:
`scripts/test/gather.mjs:2 "produced into an immutable bundle"`. Three modes
call it: the harness run, a watch-and-gather mode for a cascade already in
flight, and a re-gather. The bundle directory is the run id,
`scripts/test/gather.mjs:18 "const dir = join(outRoot, runId);"`, and every
file is written with a plain overwrite,
`scripts/test/gather.mjs:196 "const write = (name, obj) => writeFileSync(join(dir, name), JSON.stringify(obj, null, 2), 'utf8');"`.

The re-gather mode exists to rewrite that bundle:
`scripts/test/regather.mjs:1 "Re-gather an existing run's bundle from current SQLite state."`
It resolves the same directory,
`scripts/test/regather.mjs:26 "const dir = join(RUNS, runId);"`, calls the same
writer, and replaces the run's summary in place. The only trace is a timestamp:
`scripts/test/regather.mjs:42 "run.summary = summary;"` and
`scripts/test/regather.mjs:43 "run.regatheredAt = new Date().toISOString();"`.
The previous bundle is not kept anywhere.

The evaluator writes its scorecard into that same directory,
`scripts/test/evaluate.mjs:342 "writeFileSync(join(dir, 'scorecard.json'), JSON.stringify(scorecard, null, 2), 'utf8');"`.
Its top-level keys (`runId, team, seed, ..., facts, grounding, autonomy`)
record no bundle hash, no gather time and no re-gather marker. The re-gather's
own header shows the authors had the ordering in mind, but only in one
direction:
`scripts/test/regather.mjs:6 "evaluate.mjs recomputes dims from the JSON files anyway."`
That holds when the evaluation runs *after* the re-gather. An evaluation run
before it keeps its scorecard, and the scorecard now sits beside evidence it
never read.

## What was measured

This was an `experiment`, not a code change. It replayed the harness's own
archived output rather than running the harness. The bundles are ignored today,
but fourteen were once committed (eleven at `e7c4090b2c`, three at
`df6146349a`) before a pruning sweep removed them. A read-only script walked
every archived `run.json`, asserting on the first one before counting, and
compared each bundle's `executions.json` length against the execution count its
summary recorded.

| | runs | re-gathered | carrying a scorecard | summary disagrees with bundle |
| --- | --- | --- | --- | --- |
| archived history | 14 | **0** | 2 | 0 of 13 comparable |

**Target:** the number of scorecards sitting beside rewritten evidence. It was
zero in both arms, because the precondition never occurred.
**Floor:** the harness's own reproducibility, meaning every summary agrees with
its bundle. It held on 13 of 13 comparable bundles. The fourteenth holds
neither an executions file nor a summary, so it is incomplete rather than a
disagreement.

## Verdict: unmeasurable, and why nothing shipped

The structure is exactly what the technique warns against: immutability declared
in a comment, a second mode that overwrites in place, and a verdict that names
no evidence. But the history shows no instance, so no change can move the
target on this tree. The Phase 8 rule is that a commit needs a behavioural
proof, and `structural-only` does not supply one. The repair is recorded here
and not committed: write a re-gather beside the previous bundle rather than
over it, or move an existing scorecard aside before re-gathering, and stamp the
scorecard with the gather time it read.

*Return condition:* the first re-gather of a bundle that already carries a
scorecard. The instrument is the same replay script, run over the live run
directory: it reports a row with `regathered: true` and `scorecard: true`, and
that pair is the case where a stale verdict exists.

## What this realization cannot do

It cannot show harm. It can only show that nothing in the tree would stop the
harm, and that nothing in the artifacts would reveal it afterwards. It also
covers only the writer-side failure. The reader-side failure (a consumer
mutating a nested value through a shared reference) cannot happen here, because
every reader of this bundle deserializes it from disk. That is the serialization
boundary the technique names as one place to put the property, and this
harness has it by construction.
