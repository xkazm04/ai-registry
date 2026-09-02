---
layer: application
type: application
subject: learning-curve-and-teaching-design
technique: skill-atom-inventory
stack: process
status: forged
verified_on: 2026-09-02
---

# A step-pipeline production line as a partial atom inventory

Read against the PoF repository at commit `9aa31407`, whose catalog-pipeline system builds
game content as ordered steps with per-step acceptance checkers. One of its pipelines,
`src/lib/catalog/pipelines/tutorial-beats.ts` (612 lines), is the closest thing in the tree
to a teaching artifact, and it is a useful realization precisely because it gets the
identity discipline right and the inventory discipline wrong.

## What it realizes: one identity token per atom

The pipeline derives the mechanic being taught from the beat entity's own name — `"Learn to
Dodge"` → `"Dodge"` — in a pair of one-line helpers at
`src/lib/catalog/pipelines/tutorial-beats.ts:26-28`, and the header comment at lines 12-25
states the rule explicitly: this is "the single identity token every step in this pipeline
derives from, so a beat can never write another beat's tags/keys/assets". Everything hangs
off it — the gameplay tags `Tutorial.<M>.Introduced / .Skipped / .Failed / .Executed`, the
taught input and ability keys `IA_<M>` / `GA_<M>`, the sandbox scope `<m>_only_zone`, the
advance signal `<m>_executed`, the metric `<m>_success_rate`, the coaching cue ids
`coach_<m>_prompt / _success / _retry`, and the text-key prefix `TUT_<M>_`.

That is the identity-token step of the technique, implemented and enforced by construction
rather than by convention. It is the upward lesson this tree taught the standard: with one
token, an atom's teaching artifacts are traceable back to the atom by name alone, and a
machine authoring twelve beats in parallel cannot cross-contaminate them.

The pipeline also realizes the introduce beat's **isolation** requirement mechanically. Its
"Lock / Sandbox" step (`tutorial-beats.ts:122-169`) locks `IA_Attack, IA_Skill_1,
IA_Skill_2, IA_Interact` inside a `<m>_only_zone` scope and leaves the taught input as the
only active one, restoring every binding on beat exit in the same frame. That is rung two of
the teaching ladder — a constructed situation where the correct action is the only available
one — expressed as data an acceptance checker can verify, and it is the strongest part of
the implementation.

And the taught set is durable player state: the skip condition at `tutorial-beats.ts:251`
reads `GameplayTag_Present:Tutorial.<M>.Introduced OR player_level >= 5`, so "already
taught" is a queryable flag on the player rather than a position in a progress counter. The
outcome step insists all three terminals exist, with the reason stated inline: "a beat with
no fail terminal can silently block" (`tutorial-beats.ts:261`). Both are upward lessons.

## Deviation: it is a beat catalog, not an inventory

The technique asks for an enumerated, prerequisite-linked set of atoms, each with an
introduction site, practice sites and a test site. This tree has beats, and a beat is only
the introduction site.

- **No prerequisite graph.** The pipeline comments at `tutorial-beats.ts:172-175` record a
  deliberate choice — "linear advance by default … branchingEnabled=false, so the step
  sequence is deterministic (no reachability analysis needed)". That is sound *inside* one
  beat. Across beats there is no ordering structure at all, so the check "this content
  demands an atom introduced later" cannot be expressed.
- **No practice or test sites.** The terminal state of a beat is the tag
  `Tutorial.<M>.Introduced`, granted the first time the player performs the action inside the
  sandbox (`tutorial-beats.ts:245-248`). Nothing in the pipeline schedules a later
  load-bearing demand for the same mechanic. This is the introduce-and-never-test shape
  encoded as the data model's terminal state, and the standard does not move to accommodate
  it: an atom whose only site is its introduction renders as *told about*, not as taught.
- **Atoms are counted as mechanics.** One beat teaches one named mechanic. The dodge that
  grants invulnerability and the dodge whose invulnerability is spent are one beat here, and
  the second half is never taught or checked.
- **Gap analysis does not look for missing atoms.** The registered gap plugin for this
  pipeline (`src/lib/catalog/gap-analysis/plugins/tutorial-beats.ts`, 9 lines) declares a
  single dimension, `stage`, and a summary line. It can report which beats are unfinished; it
  cannot report which mechanics have no beat, which is the sweep the technique's step eight
  asks for.

## How to close it without rebuilding the pipeline

The identity token already gives the inventory its primary key. The missing structure is
three fields on the beat entity and one sweep:

1. `prerequisites: <token>[]` on each beat, checked against the beats ordered before it.
2. `practiceSites` and `testSite`, each naming a real entity elsewhere in the catalog — the
   link checkers already used by this pipeline (`linksResolve`, imported at line 7) are the
   right instrument, since they fail when a link names something that does not exist.
3. A batch-level sweep, the mirror of the existing per-entity acceptance: for every ability
   or input in the content, assert a beat exists whose token matches; for every beat, assert
   a test site exists. Both are graph queries over data the tree already holds, and both run
   before anything is generated.
