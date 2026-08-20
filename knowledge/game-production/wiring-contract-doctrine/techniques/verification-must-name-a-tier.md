---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: verification-must-name-a-tier
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [writing the verification field of a wiring contract, deciding what a completion claim may assert, auditing verification text that reads as confident but proves nothing]
---

# Verification must name a tier

The verification field of a wiring contract is invalid unless it names the **rung
of evidence** it constitutes, drawn from the shared ordered vocabulary the project
already uses to grade completion. Free-text verification is not a weaker version
of this; it is a different thing, and what it produces is confidence without
grade.

The ordered vocabulary itself — which rungs exist, what each may conclude, how a
claim binds to the rung it was proven at — is a separate subject with its own
owner. This technique owns only the join: the wiring contract must reference that
ladder, and the rung it names is the ceiling on what any downstream status may
claim about the artifact.

## The failure this closes

Verification text is the easiest field to produce and the hardest to falsify. Ask
any author, human or machine, "how is this verified?" and you get fluent sentences
whose evidential weight ranges across three orders of magnitude with no surface
difference between them:

- "The asset loads without error." — an existence claim.
- "All required properties are populated." — a structural claim.
- "The projectile travels, collides, and applies the effect to the target." — a
  behavioural claim.
- "The impact reads clearly at combat distance and does not obscure the enemy." —
  a perceptual claim.

Every one of those is a legitimate sentence. Only the last two say anything about
whether the artifact works. Yet in a status field, all four render identically as
"verified" — and the aggregate then reports a catalog as verified when what it
actually knows is that the files parse. The rung requirement is what stops a
low-rung observation from being laundered into a high-rung claim by fluent
phrasing.

## The procedure

1. **Write the observation first, the rung second.** Authors who pick a rung first
   write to the rung; authors who describe the observation first get graded
   honestly. The rung is a classification of what was written, not a target.
2. **One observation, not a list.** A verification field with five bullets is a
   field where nobody knows which one was actually performed. Name the single
   strongest observation that, if it holds, implies the wiring worked. If two
   genuinely independent observations are needed, the artifact is two artifacts.
3. **State it in the present tense and in the second person of the observer** —
   "cast it and the target slows" — because that phrasing forces a concrete
   subject, a concrete action, and a concrete visible consequence. Passive
   constructions ("it can be verified that…") are where vagueness hides.
4. **Classify against the ladder, and reject a rung the observation does not
   support.** If the sentence describes a property inspection, it is structural
   regardless of how the author labelled it. The classification is adversarial; it
   is not the author's self-report.
5. **Carry the rung forward.** The artifact's status may claim the named rung and
   no higher. An artifact whose verification is a structural observation is
   *structurally verified*, and every rollup that says otherwise is wrong.

## Decision rules

- **When the verification names no rung, the field fails.** Not a warning — the
  same failure as an empty field. An unclassified observation is unmeasured, and
  unmeasured is not a pass.
- **When the honest rung is the lowest one, accept it and record it.** The point
  is not to force behavioural evidence everywhere; some artifacts genuinely cannot
  be observed without a running engine and a human. Recording "structural only" is
  a true and useful statement. Recording "verified" is not.
- **When an observation would require infrastructure that does not exist yet,
  write it anyway and mark the rung as not-yet-reached.** The verification field
  doubles as the specification for the test that should exist; a wish written down
  precisely is a backlog item, and it is the only artifact of this exercise that
  survives to be automated later.
- **When the same verification sentence appears on many artifacts, distrust it.**
  Genuine per-artifact observation produces per-artifact sentences. Identical text
  across a batch is a signature of the field being filled rather than answered.

## What the rung requirement is not

It is not a demand that everything be tested at the highest rung. The doctrine's
claim is about *labelling*, not about coverage: an honest low rung beats an
unlabelled high-sounding one, because the low rung propagates truthfully into
every aggregate above it while the unlabelled one poisons them.

It is also not a re-derivation of the ladder. Do not invent per-artifact tiers, do
not extend the vocabulary locally, and do not let a wiring contract define what
"behavioural" means — one project has one ladder, and a second definition of a
rung is worse than none, because the disagreement stays invisible until it is
load-bearing.

## When not to use it

- **Not where the project has no shared ladder.** Requiring a rung name against a
  vocabulary that does not exist produces invented tiers, which is strictly worse
  than free text. Establish the ladder first; this technique depends on it.
- **Not as a gate on artifacts nobody will ever aggregate.** The cost of the rung
  discipline is paid back in rollups. For a handful of hand-built artifacts under
  one person's eye, the free-text sentence is adequate and the ceremony is not.
