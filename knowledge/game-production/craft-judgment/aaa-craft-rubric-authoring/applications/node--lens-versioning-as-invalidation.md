---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: lens-versioning-as-invalidation
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A canon-aware judge that binds rubric and content, and reads a third input it never records

The `node@24` witness here is the interpreter that ran the experiment (v24.14.0, through
`tsx` from the project's own dependencies). The project's `package.json` declares no
`engines` field, so no pin exists to cite instead.

## What the tree binds

The `pof` ARPG production tool stores judge verdicts append-only in `judge_verdicts`
(`src/lib/status/judge-verdicts-db.ts:66`). Each row carries both axes the technique asks
for:

- `rubric_version` is the lens axis. A verdict under an older rubric is shown as
  superseded by `rubricStanding` in `src/lib/judge/verdictStanding.ts`.
- `content_hash` is the content axis. `stepContentHash` in `src/lib/judge/contentHash.ts`
  derives it from the same strip list the judge reads through, and it carries a scheme
  prefix so a rule change never compares across schemes.

`verdictProvenance` in `src/lib/catalog/acceptance/judgeBridge.ts` classifies each
verdict as `current`, `stale`, `unknown` or `superseded`. Only the condemning set counts
as current quality. On the two axes the technique names, the tree is a strong
realisation of it.

## The input neither axis covers

Since rubric v4, the panel judge also reads a **sibling projection**: a bounded summary
of the entity's other pipeline steps, built by `buildSiblingContext`
(`src/lib/judge/siblingContext.ts`) and passed in by `scripts/judge-one.ts:105`. The
rubric tells the judge that a contradiction with that context is a defect to score down.
The `coherence` dimension's bar reads "consistent with sibling steps"
(`src/lib/judge/dimensions.ts:57`). So a finding can rest on a sibling's value, and no
column records what the sibling projection said when the verdict was written.

## The experiment

A read-only pass over the live store (357 verdicts, 473 artifacts) ran the project's own
`stepContentHash` and `isComparableHash`. It took the row acceptance reads (newest rubric,
then newest judgment, per step and judge) and kept the panel verdicts whose content hash
still matches: 152 in all, 131 fails and 21 passes. Of those, 143 have sibling steps, and
for 131 of the 143 at least one sibling artifact was updated after the judgment. Three
invalidation policies were then applied to the same rows:

| Arm | Policy | Verdicts invalidated |
| --- | --- | --- |
| A, as built | sibling context outside every key | 0 of 143 |
| C, full binding | any sibling change stales every verdict of the entity | 131 of 143 (92%) |
| B, evidence per dimension | a sibling change stales a fail only when `coherence` is its weakest dimension | 13 of 131 fails |

A first pass attributed findings by keyword ("sibling", "contradict") and marked 93. Read
row by row, those rows mostly *praised* sibling consistency, with coherence at 88 to 93,
so the keyword instrument was discarded for the rubric's own dimension. Of the 13 that
remained, one (Tooltip / Compare) condemns an off-by-one computed from a sibling
modifier's stated cadence. If that modifier has been edited since, the condemnation is
about text that no longer exists, and acceptance still counts it.

**Verdict: better.** Arm B keeps 118 standing condemnations that no sibling edit can
falsify. It isolates the 13 whose truth depends on a sibling. Arm A hides those 13, and
arm C would have cleared the whole condemnation layer. The seam was chosen to falsify the
technique's new steering case: a prompt input that looks like steering and is in fact
evidence. It did refute the source's framing, where leaving an injected input out of the
key is safe outright. It held as the per-dimension rule the technique now states.

## What this cannot show

- **Drift is an upper bound.** `updated_at` moves on any artifact write, and the
  projection covers a subset of each step. Without a stored projection digest, an edit
  that left the projection unchanged still counts as drift. That missing column is the
  finding the project owes: stamp a digest of the projection the judge read on every
  panel verdict, and classify a `coherence`-weakest fail whose digest has moved as stale.
- **Weakest dimension is a proxy for "the failing dimension."** A fail that is weak on
  coherence and weaker still on plausibility is attributed to plausibility and escapes
  arm B.
- **Adopting it adds a provenance state across acceptance, the standing chips and the
  judge runner.** That is filed as the project's next change in its own `.ai/applied.jsonl`
  rather than shipped from this run.
