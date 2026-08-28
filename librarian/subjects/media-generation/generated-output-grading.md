---
domain: media-generation
subject: generated-output-grading
last_touched: 2026-08-28
touched_by: librarian
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
