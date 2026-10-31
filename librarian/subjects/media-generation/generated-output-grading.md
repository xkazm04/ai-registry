---
domain: media-generation
subject: generated-output-grading
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# generated-output-grading

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-28 - `/librarian run`, the banked proposal lands as an amendment

Dispatched as the run's named next target: never swept, and holder of the
strongest proposal banked from 2026-08-27 - that a grading schema built from
camera-and-lighting vocabulary is **structurally silent about the performer**,
so every performer-side failure passes it.

**Adjudicated as an amendment to `vision-model-grading-schema`.** Both rejected
homes are worth keeping, because they are the reasoning a future run reuses:

- **Not `unconditional-fail-criteria`.** It fails that technique's own three
  tests. A performer freeze needs judgement against a briefed intent rather than
  being a present/absent property of the pixel; it exists only *across a set*
  where a veto is a per-output instrument; and it derives from the **brief**,
  which varies per shot, rather than from the pipeline **contract**, which is
  the invariant a veto is specified to encode.
- **Not its own technique.** Its trigger would duplicate
  `vision-model-grading-schema`'s `use_when` verbatim and route badly, and the
  failure already has an owner in
  [[character-identity-continuity]]'s `reference-shows-only-invariants`. What
  this subject owed was the general rule that *produces* that production check,
  and that is a field-design rule.

## The second voice, and why it changed the claim

The proposal arrived with one voice: a consumer's probe rig whose schema has 25
fields, none naming what a face is doing, and whose free-text `subjects` field is
**explicitly excluded from scoring** as "content" - so the one landing place sits
structurally outside the measurement.

The worker found the second voice **inside this corpus**. `cinematic-language`
covers the performer thoroughly: `performance-direction` specifies action as
enumerated verifiable beats, and `scene-grammar-progression` says to state gaze
direction in every brief. `vision-model-grading-schema` contained **zero**
occurrences of performer, expression, gaze, eyeline or briefed.

That reframed the finding. Not *"schemas omit performers"* but:

> **An asymmetry between the briefing vocabulary and the grading vocabulary.**
> A schema assembled from an existing vocabulary inherits only that vocabulary's
> ENUMERATED half, and silently drops the half its source discipline expressed
> as prose.

The rig corroborates it in shape rather than in rate - its own header records
that its vocabularies were lifted from this registry, and it took the enumerated
half. Two artifacts, one fleet: **no rate was written.** The worker also declined
to over-count three sibling schemas in the same tree, which grade diagram plates
with no performer in them - instances, not voices.

## What landed

A census section placed *before* the existing form rules, since a census
precedes typing: a schema's field list is a claim about what can fail, and a
class with no field is **scored as a pass** under a complete-looking table.
Plus a field-*selection* criterion the subject did not have - **briefed
variables are the schema's free ground truth**, written down before the output
existed, so a field reading one back is scoreable with no second judge, no round
trip, no human. Ground truth is the scarce commodity here; those fields are the
last to cut. Reconciled explicitly with the existing field-budget rule.

Three decision rules, the third being the operational bridge to yesterday's
technique: for a failure that lives across a set, read the field's **variance
across the batch**, not its value per cell - the same reading this subject
already uses to condemn an inert annotator field, pointed at the outputs.

## The deepen pass - not dry

- **`node--trial-matrix-design` now carries a version witness.** All eleven
  citations were re-resolved against live HEAD and hold exactly, so `node@24`
  was written as a by-product. This is the **re-verification** route that
  [[standard]]'s third gap names as the only honest way that field is ever
  written - not a backfill, which the profile forbids. Verified-and-unchanged is
  a first-class result and the date moved to record it.
- **A rotted citation** in `process--unconditional-fail-criteria` pointed at
  fact-counting code rather than the grade schema. Corrected.
- **A self-contradiction of 9x** in `process--replication-as-comprehension-test`:
  the closing caveat still said `n=4` while the title, body and per-field table
  all said `n=36`. Git showed the mechanism - the commit that upgraded the
  measurement retracted the four-frame pilot in the body and left the caveat
  unedited. Rewritten to the true limits (one source, one annotator, one
  generator) with the discriminator that would separate a generator prior from a
  schema defect.
- `verified_on` deliberately **not** moved on that file: it cites no external
  sources or repo paths, so moving the date would assert a re-resolution nobody
  performed. Correct call, and the rule worth reusing.

## Open leads

- **`cinematic-language` owes the grading counterpart.** It instructs "state
  gaze direction in every brief" and never says to read it back. A pointer from
  `performance-direction` to the census rule would close the loop from the
  briefing side. **Return when** a second rig, outside this fleet, shows the same
  brief/grade asymmetry - that is what turns the shape into a rate.
- **`character-identity-continuity` could cite the general rule** that produces
  its production check. One line; weigh the coupling.
- **A gate/runtime divergence for `deployment-contract`, not for here:** the
  consumer's CI pins node 22 while the tree runs node 24 locally and every
  `verified_against` in this corpus reads `node@24`. Not a defect in these
  applications - they document the tree, not CI - but somebody owns it.

### 2026-09-04 - `/intake` (`worldlabs-atlas`), the arms that cannot be made identical

Landed **`input-channel-parity`** (7 -> 8 techniques). Source was a vendor's own
release announcement benchmarking its model against video models on camera control:
it encodes the camera path in its native format, the baselines get the same path
described in a sentence, and the post discloses the confound itself while reporting
that its lead *grows with trajectory complexity*.

**Why it is a technique and not a caveat on `cross-provider-flip-analysis`.** That
technique declares its own completeness - "the diff is only valid if the generator was
the *only* variable… any second difference contaminates every flip" - and the
enumeration does not contain the case where the second difference **cannot be
removed**, because it is a property of what the arms *are* rather than of how they were
run. `arena-benchmark-protocol` next door has the same hole from the budget side. The
resolution is a procedure the subject did not have (enumerate channels per arm, run the
typed arm through prose as a parity column, report both numbers labelled), so:
technique. Counted uncapped greps returned zero hits for affordance / native input /
typed input / input channel across the subject.

The corpus already owned the design half as a law (`typed-input-owns-its-channel`).
The finding sits one level down, at the measurement consequence, rather than restating
it.

**Applied `code` in the consumer, verdict `better`, shipped.** The tree had
independently built this technique's step 1 for *one* control dimension - a
channel-capability flag on the provider descriptor, enforced as a routing constraint,
with the reasoning written into the type. A second dimension had the identical property
and no declaration at all, and the two **invert across the same provider pair**: nobody
designed that, it fell out of the first one being the dimension whose failure was
visible on sight. Declaration rather than routing, because both arms honour it. Paired
counter against `HEAD`: declared 1/2 -> 2/2, recorded 0/2 -> 1/2.

**This closes the open lead below about the node pin.** The new application writes
`verified_against: node@22` and says in its first paragraph *which witness* - the CI
workflow's own `node-version: 22`, on the grounds that it is the version the gate that
graded the change actually runs on. That is the v2.2 witness rule applied; the older
`node@24` rows in this subject document the local tree instead, which is a different
claim and not a wrong one.

## Open leads

- A third sighting of the parity idea would justify asking whether "the arms differ in
  what they can be told" belongs beside `trial-matrix-design` as a shared prerequisite
  rather than as a sibling technique. Two sightings so far (this one; the consumer's
  own reference flag). Return on a third.
- The behavioural half of `input-channel-parity` is unrun everywhere: no tree has yet
  driven a typed-input arm through prose on the same briefs to size its interface
  advantage. The consumer named above has the trial set and the grid already built, so
  it is the cheapest place to run it.

## 2026-09-20 - intake, a typed-decision model batch ([[2026-09-20-jev-batch-practitioner]])

Amendment to `vision-model-grading-schema`: **the fourth remedy for an arguable
field.** The decision rules offered three ways to handle a field that keeps
producing arguable answers — sharpen it into a count, split it into two
booleans, demote it to human judgement — and all three change the field. The gap
the enumeration invited: a field can be sharp, well-anchored and still arguable
because the *case* is borderline, and sharpening a definition against an
ambiguous picture moves the disagreement rather than removing it.

The fourth remedy changes the answer shape instead: ask for a probability across
the field's closed answer set, take the argmax as the grade, read borderline-ness
from the shape. What it buys is a routing signal the discrete grade cannot
carry — the schema already says that when stakes rise you add a second grader
rather than a finer scale, and the band makes that affordable by pointing it at
the cells that actually contain the disagreements instead of at the whole batch.

Two constraints travel with it: the band is fitted on one set of cells and
applied to another (a vendor's published calibration is not a substitute —
calibration is a property of a distribution over a task, not of a model), and
the saturated share is reported beside any band, because a grader at
near-certainty on most cells has no resolution where the band would sit.

**The cost class decides whether it is free**, and this is the half that made
the amendment worth writing: a grader you host yourself already computes the
probabilities it samples from, so recording them adds no call, token or latency;
a hosted endpoint usually will not return them, and asking the model to *state* a
distribution is a second act of generation scaling with the option count. The
rule therefore inverts on deployment. A batch graded locally can also be
re-banded without re-grading, which is regrade-without-regenerate one layer up.

**Boundary with another bundle, stated not linked.** The measured evidence that
this pays at a noisy grader (AUROC 0.82 on borderline-ness; a 0.2–0.8 band
holding 4 of 7 disagreements; and the opposite verdict at a ceiling seam) lives
in llm-observability's generator-uncertainty-scoring. Cross-bundle links are
forbidden, so the mechanism is restated in media prose and recorded here so a
later run recognises the shape instead of re-deriving it. Before this run the
media bundle carried **zero** references to token probabilities of any kind.

Applied to pof as an experiment and recorded `not-better`: the tree has no
logprobs and no self-hosted grader, so the free branch is unreachable, and its
own measured benchmark records every error as a saturated false PASS at 10/10
against a `passAt: 7` gate — which no borderline band can rank. The amendment
carries the saturation rule because of that seam, not in spite of it.

Board: 2 siblings live, one holding four media-generation subjects but not this
one; `check` clear immediately before the write.

**Measured the same day.** The amendment was tested against pof with a local
grader, 18 labelled images, both arms from one response. The floor held 18/18,
the saturation falsifier did NOT fire (median pMax 0.705), and the hypothesis
failed anyway: borderline-ness ranked the gate errors at AUROC 0.542 and the
weighted mean slightly reduced separation (0.675 vs 0.700). Spread is not
information. The technique now carries a correlation admission test, plus the
two-token score trap and the grader-swap threshold trap. Recorded `not-better`.

## Architecture review - 2026-10-31

First architecture review, against `cbccaaef3`. All 15 documents read. The golden
path's prose never reaches two of its eight techniques. The two-grader rule and the
judge-selection application both describe the "rank but cannot score" study as a
repeat-variance-versus-pairwise result; the study used deterministic decoding,
scored every response independently, and means by "ranking" the correlation of
judge scores with human scores. The vision schema's two-token trap holds for a
digit-splitting tokenizer and not for every tokenizer. The consumer tree behind the
two node applications has moved: CI now pins node 24, and the adapters live under
a providers directory. A concurrent working-tree edit (not this run's) is
re-anchoring `applications/node--trial-matrix-design.md`; this digest includes it.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/generated-output-grading",
  "date": "2026-10-31",
  "baseline": "cbccaaef3",
  "digest": "sha256-b2:6cac190be977aee0",
  "disposition": "clarify",
  "coverage": "All 15 documents read in full (golden path, 8 techniques, 6 applications). Three primary sources opened this run: the VLM rank-versus-score study, the LLM-judge bias page, and the Qwen2.5-VL tokenizer. The consumer tree behind the node and process applications was spot-checked, not re-verified. Not evaluated: the vendor announcement behind input-channel-parity, the video-model prompt sources, the private local-model runs. No verification date was refreshed by this run.",
  "counterexamples": [
    "A judge whose scores correlate 0.8 with human order can still be wrong by a full band on one image, so ordering a batch by its score is safe and gating one image on it is not.",
    "At deterministic decoding a repeated scalar grade is byte-identical, so 'repeat it and read the spread' reveals nothing; the spread has to come from another grader or a calibration set.",
    "On a tokenizer that keeps '10' as one token, a 0-10 score is single-token and the first-digit trap does not occur; on Qwen2.5-VL, which isolates every digit, it does.",
    "Two arms that differ in what they can be told (typed camera path against prose) cannot satisfy flip analysis's 'generator is the only variable' rule however carefully the harness is held still.",
    "A field split of half at 100% and half at 50% averages 75%, so the same aggregate hides it whether the split is real or, as the n=36 run showed, pilot noise."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2604.25235",
      "result": "Read. 'VLM inference is greedy and deterministic'; each response scored independently on a 1-5 Likert scale; 'correlation captures ranking ability, while accuracy reflects absolute scoring precision'; pairwise appears only as a recommendation: 'wide intervals signal ambiguity or noise where relative ranking or pairwise comparison is more appropriate'. Refutes the repeat-variance and stable-pairwise reading in two-grader-disagreement-rule and process--vision-model-grading-schema; supports 'rank reliably, score unreliably' in its own sense."
    },
    {
      "url": "https://llm-judge-bias.github.io/",
      "result": "Read. 'Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge': position bias shown by swapping response order; self-enhancement, 'LLM judges may favor the answers generated by themselves'. Text judges, not vision judges; supports the two protocol rules as borrowed from text judging."
    },
    {
      "url": "https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct/resolve/main/tokenizer.json",
      "result": "Read the pre-tokenizer: the split regex isolates '\\p{N}' one character at a time and the vocabulary has no '10' entry. Supports the two-token trap for digit-splitting tokenizers and shows it is tokenizer-dependent."
    },
    {
      "source": "Consumer tree spot-check (read only, nothing executed)",
      "result": "CI workflow now sets node-version 24 (four sites), not the 22 the node input-channel-parity application cites as its witness; the google and leonardo adapters moved under lib/imaging/providers/; negativePromptChannel is still declared in types.ts and stamped in router.ts. The trial set moved from app/library/ to lib/library/trials.ts; GRADE_SCHEMA, CONCURRENCY and the perception pin are present in build-style-trials.mts. FRAMES-PROMPT.md still carries the 77-token truncation note and docs/imaging.md the per-generation leakage sentence."
    }
  ],
  "documents": {
    "generated-output-grading.md": {
      "disposition": "clarify",
      "reason": "Lists input-channel-parity and replication-as-comprehension-test as techniques but its prose reaches neither. Add one sentence in the attribution section on arms that cannot be told the same brief, and one in the grader section on testing a vocabulary by round trip."
    },
    "techniques/unconditional-fail-criteria.md": {
      "disposition": "keep",
      "reason": "Veto tests (contract, character evidence, binary detectability), deterministic-detector preference and the short list are coherent with the schema and the judge-selection application."
    },
    "techniques/cross-provider-flip-analysis.md": {
      "disposition": "clarify",
      "reason": "Prerequisites present 'the generator was the only variable' as satisfiable by matching the harness; input-channel-parity documents the case where it cannot be. Add a pointer there. The 3-4x usability figure is consistent with the node application ($0.052 vs $0.110 at a 1.75x render price implies 3.7x)."
    },
    "techniques/trial-matrix-design.md": {
      "disposition": "keep",
      "reason": "Problems-not-pictures axis, single-variable rule, resumability and row/column reading are sound; the channel exception is owned by input-channel-parity and reached through flip analysis."
    },
    "techniques/replication-as-comprehension-test.md": {
      "disposition": "clarify",
      "reason": "Failure-mode arithmetic: half the fields at 100% and the rest at 50% average 75%, not 77%. The 77% figure comes from the retracted four-frame pilot (5 at 100, 4 at 50), which the application shows was noise, so the example should not call that shape 'the only actionable shape in the data'."
    },
    "techniques/two-grader-disagreement-rule.md": {
      "disposition": "clarify",
      "reason": "The boundary paragraph says the same judge returns different scalar scores across repeats while pairwise verdicts stay stable. The cited study used deterministic decoding, measured neither, and means rank correlation with humans. Restate the finding as scores that order well but carry wide absolute uncertainty, and drop 'repeat it and read the spread', which deterministic decoding makes empty."
    },
    "techniques/vision-model-grading-schema.md": {
      "disposition": "clarify",
      "reason": "The two-token trap is stated as a property of a 0-10 scale; it is a property of a digit-splitting tokenizer (Qwen2.5-VL isolates every digit). Scope it. Still owed and not applied: 'Measured practice is unambiguous' on boolean versus scalar agreement names no source; the 'about twenty-three minutes per frame' clause does not say which reader it timed."
    },
    "techniques/regrade-without-regenerate.md": {
      "disposition": "keep",
      "reason": "Four cell states, explicit regrade mode, whole-corpus migration on schema change and the frozen-set comparison argument hold."
    },
    "techniques/input-channel-parity.md": {
      "disposition": "keep",
      "reason": "The two labelled numbers, the parity arm and the complexity banding follow from its law; the vendor source was not re-read, and the technique's argument does not rest on its numbers."
    },
    "applications/node--input-channel-parity.md": {
      "disposition": "reverify",
      "reason": "Its stated witness is CI's node-version 22 at gates.yml:180,274; the workflow now sets 24 at other lines, and google.ts and leonardo.ts moved to lib/imaging/providers/. The declaration it shipped is still present. Needs a citation re-anchor and a new witness; verified_against is not this run's to write."
    },
    "applications/node--trial-matrix-design.md": {
      "disposition": "keep",
      "reason": "A concurrent working-tree edit, not this run's, re-anchors its citations (lib/library/trials.ts, shifted line ranges) and moves verified_on. Spot-check agrees: trials.ts exists at the new path, GRADE_SCHEMA at :79, CONCURRENCY at :71, the perception pin at :140. Cost arithmetic is consistent."
    },
    "applications/process--replication-as-comprehension-test.md": {
      "disposition": "clarify",
      "reason": "The adjudication table gives 94% and 75% 'vs hand-labelled truth' at 'n=8 graded fields on 2 frames'; 94% is not k/8. Read as 8 fields on each of 2 frames (16 judgements), 15/16 and 12/16 fit. Owed, not applied: the private run was not reopened. Its 80% mean matches the table (79.1% over ten fields). refresh_by 2026-11-25 is close."
    },
    "applications/process--trial-matrix-design.md": {
      "disposition": "reverify",
      "reason": "n=1 screening honestly labelled; its eight sources and the local probe were not re-read or re-run this pass."
    },
    "applications/process--unconditional-fail-criteria.md": {
      "disposition": "reverify",
      "reason": "Two of its anchors (FRAMES-PROMPT truncation note, imaging.md leakage sentence) still resolve; the rubric line ranges were not re-checked one by one."
    },
    "applications/process--vision-model-grading-schema.md": {
      "disposition": "clarify",
      "reason": "Tier-2's first bullet repeats the repeat-variance-versus-pairwise misreading of the rank/score study, and the appendix reads its own probe as an inversion of that misreading. Correct the bullet and qualify the appendix. Other sources not re-read."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied six of the eight clarify items above, against `480a1af74`. Left owed: the
unsourced boolean-versus-scalar sentence and the ambiguous timing clause in the vision
schema, and the 94%-at-n=8 table in the replication application, whose private run
was not reopened. The node input-channel-parity application stays `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/generated-output-grading",
  "date": "2026-10-31",
  "baseline": "480a1af74",
  "digest": "sha256-b2:96d08c3ff7372b87",
  "disposition": "clarify",
  "coverage": "All 15 documents decided. Six of the eight clarify items from the first 2026-10-31 record were applied and the edited passages re-read; each rests on a source opened this run or on internal arithmetic. Other documents are byte-unchanged by this run (node--trial-matrix-design carries a concurrent working-tree edit that is not this run's). No verification date was refreshed by this run.",
  "counterexamples": [
    "A judge whose scores correlate 0.8 with human order can still be wrong by a full band on one image, so ordering a batch by its score is safe and gating one image on it is not.",
    "At deterministic decoding a repeated scalar grade is byte-identical, so 'repeat it and read the spread' reveals nothing; the spread has to come from another grader or a calibration set.",
    "On a tokenizer that keeps '10' as one token, a 0-10 score is single-token and the first-digit trap does not occur; on Qwen2.5-VL, which isolates every digit, it does.",
    "Two arms that differ in what they can be told (typed camera path against prose) cannot satisfy flip analysis's 'generator is the only variable' rule however carefully the harness is held still.",
    "A field split of half at 100% and half at 50% averages 75%, so the same aggregate hides it whether the split is real or, as the n=36 run showed, pilot noise."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2604.25235",
      "result": "Read. 'VLM inference is greedy and deterministic'; each response scored independently on a 1-5 Likert scale; 'correlation captures ranking ability, while accuracy reflects absolute scoring precision'; pairwise appears only as a recommendation: 'wide intervals signal ambiguity or noise where relative ranking or pairwise comparison is more appropriate'. Refutes the repeat-variance and stable-pairwise reading in two-grader-disagreement-rule and process--vision-model-grading-schema; supports 'rank reliably, score unreliably' in its own sense."
    },
    {
      "url": "https://llm-judge-bias.github.io/",
      "result": "Read. 'Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge': position bias shown by swapping response order; self-enhancement, 'LLM judges may favor the answers generated by themselves'. Text judges, not vision judges; supports the two protocol rules as borrowed from text judging."
    },
    {
      "url": "https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct/resolve/main/tokenizer.json",
      "result": "Read the pre-tokenizer: the split regex isolates '\\p{N}' one character at a time and the vocabulary has no '10' entry. Supports the two-token trap for digit-splitting tokenizers and shows it is tokenizer-dependent."
    },
    {
      "source": "Consumer tree spot-check (read only, nothing executed)",
      "result": "CI workflow now sets node-version 24 (four sites), not the 22 the node input-channel-parity application cites as its witness; the google and leonardo adapters moved under lib/imaging/providers/; negativePromptChannel is still declared in types.ts and stamped in router.ts. The trial set moved from app/library/ to lib/library/trials.ts; GRADE_SCHEMA, CONCURRENCY and the perception pin are present in build-style-trials.mts. FRAMES-PROMPT.md still carries the 77-token truncation note and docs/imaging.md the per-generation leakage sentence."
    }
  ],
  "documents": {
    "generated-output-grading.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a paragraph in the attribution section on arms that cannot be told the same brief, pointing to input-channel-parity; a bullet in the grader section on testing a vocabulary by round trip, pointing to replication-as-comprehension-test."
    },
    "techniques/unconditional-fail-criteria.md": {
      "disposition": "keep",
      "reason": "Veto tests (contract, character evidence, binary detectability), deterministic-detector preference and the short list are coherent with the schema and the judge-selection application."
    },
    "techniques/cross-provider-flip-analysis.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the first prerequisite now names the channel difference as the one it cannot remove and links input-channel-parity."
    },
    "techniques/trial-matrix-design.md": {
      "disposition": "keep",
      "reason": "Problems-not-pictures axis, single-variable rule, resumability and row/column reading are sound; the channel exception is owned by input-channel-parity and reached through flip analysis."
    },
    "techniques/replication-as-comprehension-test.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: '77% aggregate' became '75%' to match half at 100% and half at 50%; 'the only actionable shape in the data' now says the shape is what per-field rates exist to show and that a small sample can produce it by chance."
    },
    "techniques/two-grader-disagreement-rule.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the boundary paragraph now states the study's finding (scores order close to human order, absolute scores carry wide intervals), says it used deterministic decoding and measured neither repeat variance nor head-to-head verdicts, and replaces 'repeat it and read the spread' with reading a scalar as a position within the batch."
    },
    "techniques/vision-model-grading-schema.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the two-token trap is scoped to tokenizers that split numbers one digit per token. Still owed: 'Measured practice is unambiguous' on boolean versus scalar agreement names no source; the 'about twenty-three minutes per frame' clause does not say which reader it timed."
    },
    "techniques/regrade-without-regenerate.md": {
      "disposition": "keep",
      "reason": "Four cell states, explicit regrade mode, whole-corpus migration on schema change and the frozen-set comparison argument hold."
    },
    "techniques/input-channel-parity.md": {
      "disposition": "keep",
      "reason": "The two labelled numbers, the parity arm and the complexity banding follow from its law; the vendor source was not re-read, and the technique's argument does not rest on its numbers."
    },
    "applications/node--input-channel-parity.md": {
      "disposition": "reverify",
      "reason": "Its stated witness is CI's node-version 22 at gates.yml:180,274; the workflow now sets 24 at other lines, and google.ts and leonardo.ts moved to lib/imaging/providers/. The declaration it shipped is still present. Needs a citation re-anchor and a new witness; verified_against is not this run's to write."
    },
    "applications/node--trial-matrix-design.md": {
      "disposition": "keep",
      "reason": "A concurrent working-tree edit, not this run's, re-anchors its citations (lib/library/trials.ts, shifted line ranges) and moves verified_on. Spot-check agrees: trials.ts exists at the new path, GRADE_SCHEMA at :79, CONCURRENCY at :71, the perception pin at :140. Cost arithmetic is consistent."
    },
    "applications/process--replication-as-comprehension-test.md": {
      "disposition": "clarify",
      "reason": "The adjudication table gives 94% and 75% 'vs hand-labelled truth' at 'n=8 graded fields on 2 frames'; 94% is not k/8. Read as 8 fields on each of 2 frames (16 judgements), 15/16 and 12/16 fit. Owed, not applied: the private run was not reopened. Its 80% mean matches the table (79.1% over ten fields). refresh_by 2026-11-25 is close."
    },
    "applications/process--trial-matrix-design.md": {
      "disposition": "reverify",
      "reason": "n=1 screening honestly labelled; its eight sources and the local probe were not re-read or re-run this pass."
    },
    "applications/process--unconditional-fail-criteria.md": {
      "disposition": "reverify",
      "reason": "Two of its anchors (FRAMES-PROMPT truncation note, imaging.md leakage sentence) still resolve; the rubric line ranges were not re-checked one by one."
    },
    "applications/process--vision-model-grading-schema.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Tier-2's first bullet now describes the rank/score study as scores ordering close to human order with wide absolute intervals, decoded deterministically, with no pairwise runs; the appendix's 'inverted' sentence is qualified as a contrast with the common reading, not with the study's data. verified_on unchanged: its other sources were not re-read."
    }
  }
}
```
