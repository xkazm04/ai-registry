---
layer: application
type: application
subject: evidence-bound-visuals
technique: precision-limit-propagation
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the citation resolved, and the grade stayed behind

*Verified against the consuming tree at commit `78fe0aa`, 2026-08-29.*

A scene validator that refuses an uncited figure has enforced
`figure-must-cite-a-fact` and nothing else. It has proved the citation
**exists**. What the citation **permits** is a separate question, and the
tree answered it by default: it did not ask.

## The seam

`app/_phases/frames/sceneSpec.ts:157-166` is where a text element is
validated:

```
if (role === "figure" && !factId)
  throw new SceneSpecError("A figure cites no fact. Every number on screen must be traceable.");
if (factId && !knownFactIds.has(factId))
  throw new SceneSpecError(`It cites "${factId}", which is not in this notebook.`);
```

`knownFactIds` is a `Set<string>`. The set is the whole contract: an id
either resolves or it does not, and the fact record's `confidence`,
`confidenceNote`, `unit` and `period` — all present at
`app/_phases/_shared/notebook/types.ts:80-102` — stop at the notebook
layer. `app/_phases/frames/useFrames.ts` built that set from `FACTS` and
discarded everything else on the way past.

The exposure is not hypothetical. `f-midtier-distribute` is graded
`confidence: "low"`, with its own note recording that the window is
unresolved and that the original comparison was arithmetically false. It
resolves. It could therefore be drawn as an exact figure — `77,800` over
an accent bar — visually identical to a fact graded `high`, with a valid
citation attached. Certainty laundering with the audit trail intact.

## A and B

**A** — the shipped policy. A scene citing `f-midtier-distribute` as a
`figure` is accepted.

**B** — `reviewSceneSpecs` and `parseSceneSpecs` take an optional
`ReadonlyMap<string, Confidence>` beside the id set, and `parseScene`
refuses an exact `figure` whose fact is graded `low`. The refusal states
the escalation the technique demands rather than the edit: *if the figure
is right, re-grade the fact; do not out-draw the grade here.*

## What was read

A probe (`tests/golden-path/scene-grade-cap.probe.spec.ts`) drives the
same two scene specs through the real validator, differing only in which
fact they cite.

- A: the low-confidence figure is accepted — `rejected` is empty, one spec
  applies.
- B: it is one per-beat rejection, and the same scene citing `f-ath`
  (graded `high`) still passes.

The probe's third case asserts `f-midtier-distribute` is still graded
`low`, so that a re-grade makes the probe say so instead of going quietly
green over a case that no longer tests anything.

## The structural fact

The validator's own commentary already knew where its authority ended.
Twenty lines above the citation check it refuses to add a verb whitelist
or a duration vocabulary, and says why: "Nothing has measured those, and a
validator built on an impression rejects good direction with total
confidence." That restraint is what the confidence cap inherits — the cap
lands at `low` only, and only on `figure`, because `medium` is a real
question nothing in this tree has measured. A file that had already
written down when it may not judge made the narrow version of this rule
the obvious one.

## What this realization cannot do or prove

- **It is half the technique.** Confidence caps *certainty*. The
  free-text **precision limit** that caps *precision* — "draw the band,
  never the midpoint", stated once on the material — has no field
  anywhere in the fact record, so axis fineness, label exactness and
  band-versus-value remain undirected.
- **It cannot enforce the comparability rule.** "Two facts whose
  comparability is itself uncertain → never a shared axis" is
  unreachable: an element carries no fact binding at all
  (`app/_phases/frames/frames.ts:35-48`), so nothing knows which two facts
  a shared axis is comparing.
- **`medium` is untouched, and that is the larger population.** Eighteen
  of twenty-one facts in the shipped notebook are graded `medium` or
  `high`; the cap fires on one. A guessed threshold at `medium` would
  reject good direction with total confidence, so the honest position is
  that the middle of the ladder is still undefended.
- **It judges the spec, not the plate.** The refusal happens before
  rendering. A frame that acquires an exact-looking figure some other way
  — a label that reads as a value, a bar whose height is measurable
  against a rule — is outside what this check can see.
