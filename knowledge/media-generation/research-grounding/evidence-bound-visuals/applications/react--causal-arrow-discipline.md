---
layer: application
type: application
subject: evidence-bound-visuals
technique: causal-arrow-discipline
stack: react
status: forged
verified_on: 2026-10-15
applied: experiment
ab_verdict: unmeasurable
---

# Causal-arrow-discipline in the Gravitone frames validator (React/TypeScript)

The studio's frame model gives arrows and loops a citation field, and stops
there. The technique asks for two things of a connective mark: that it cite a
fact record, and that the record grade the relation as causal. The tree
carries the first half as an option and has no carrier for the second.

## What the tree does

`lib/frames/frames.ts` types an element's `factId` as optional and says why:
an arrow or loop "states a relation exactly as a sentence does", while a
purely compositional element "asserts nothing". `lib/frames/sceneSpec.ts`
refuses an id the notebook does not hold, and (for text) refuses a `figure`
with no id. For elements it refuses nothing absent. The three kinds the
technique reserves for sourced causation, `arrow` and `loop`, validate on
kind and clamp their box, as every other element kind does.

A notebook fact (`lib/notebook/types.ts`, `Fact`) carries a `kind`
(found, derived, absence, utterance, plan), a confidence and a `contests`
edge. It carries no field saying what relation a claim states. The causal
grade lives one level up, in a mechanism's chain, where `THEREFORE` links are
authored prose.

## The experiment (no product code changed)

A scratch probe, deleted after the run, called the real functions over the
shipped fixtures. Gravitone at `ec399f2`, tree with unrelated working-tree
edits, none in the files read.

- Arm A, the gate as it is: `framesFromRender` over all 3 shipped renders
  seeds 11 arrows and loops (`turn` beats get "the reversal", `movement`
  beats get "the mechanism"); 0 of 11 carry a `factId`. `reviewSceneSpecs`
  accepts an uncited arrow, accepts an arrow citing the notebook's
  correlation fact (0.70-0.80 against equity indices), and accepts a loop
  citing the fact that records the liquidity relationship breaking down.
  All 21 facts are citable by an arrow; no fact has a relation-grade field.
- Arm B, the technique applied (arrows and loops must cite a fact graded
  causal): unbuilt. It needs a relation grade on the fact or a rule reading
  mechanism chains, which is a notebook schema decision, and the notebook
  types are shared with the research phase.

Target: arrows and loops that reach the compositor with no causal record.
Floor: scenes that pass today must keep passing when their arrows are cited.
Arm A fixes the target at 11 of 11 seeded, uncited, plus a correlational
citation passing. The seam was chosen to falsify: had the schema's optional
`factId` been enforced elsewhere (the seeder, the direction prompt) the
count would have been zero. It was not.

## What it shows, and what it cannot

The technique's step 1 ("name the fact record that grades the relation as
causal") has two obligations the tree separates: citation is checkable
today, grading is not. Making `factId` required on arrows would raise
citation to 100% and still let the correlation fact back a directed mark,
which is the case the technique's correlation row exists to forbid. So the
requirement belongs on a relation grade, not on the id alone.

This does not measure whether a viewer reads the seeded arrows as causal, and
the seeded labels ("the reversal") sit on beats whose script already uses
`BUT`/`THEREFORE`, so some of the 11 may be earned. The count says they are
unattributed, not that they are wrong.

## Return condition

`unmeasurable` until arm B exists. The instrument is the same probe re-run
after a relation grade (or a chain-reading rule) lands: the target should fall
from 11 of 11 uncited to the number of beats whose chain supports the mark,
and the floor is the existing element-citation probe staying green.
