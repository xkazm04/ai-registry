---
layer: application
type: application
subject: review-iteration-loops
technique: edit-plan-over-regeneration
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# React: the operations were honest and the joins were not

*Verified against the consuming tree at commit `78fe0aa`, 2026-08-29.*

This tree implements the technique's spine well. The revision engine's
deliverable is a closed operation set — retime, rewrite, cut, insert —
parsed by a reject-don't-repair validator
(`app/_phases/script/editPlan.ts:265-283`) that refuses an unknown op, a
plan with no `why`, and a rewrite that does not declare the notebook ids
it rests on. Beat marks are recomputed from durations rather than trusted
from the model. The one clause it did not carry is the one about the
places an operation touches indirectly.

## The seam

`applyEdits` performs a cut with `rows.splice(i, 1)`
(`app/_phases/script/editPlan.ts:146-148`) and re-lays the timeline. Every
surviving beat keeps the `connector` it was authored with — and a
connector is a claim about the beat in front of it: `Beat.connector` is
documented as "The connector to the PREVIOUS beat"
(`app/_phases/script/types.ts:22-27`).

So a cut silently re-points every BUT and THEREFORE that followed it. On
the shipped fixture, cutting the wish-list beat at `0:12` leaves the
complication at `0:30` — "And in that same ten months, Bitcoin lost
roughly half its value", connector `BUT` — answering the opening
situation instead of the delivery it was written against.

Nothing downstream could see it. `ScriptStep.tsx:160-171` does re-gate
after apply, which is the technique's re-gate rule honoured — but the gate
is `gateChains`, a lexical evidence-and-hedge check. Both beats are
individually well-formed. The relation between them is what broke, and no
lexical pass has a relation in its vocabulary.

## A and B

**A** — apply the plan; the applied render carries beats, attribution and
seconds, and no representation of a join that changed.

**B** — `applyEdits` returns `chainBreaks`: every survivor whose
connector was written for a predecessor the plan removed or displaced,
each with a `why` addressed to the person deciding whether to accept the
plan. Each base row carries `wasAfter`, the mark that stood in front of it
before the plan ran; an inserted row carries none, because its connector
was authored for the position the plan put it in.

Reported, never repaired. Rewriting a connector to fit its new neighbour
would be an edit nobody asked for, made by the code least qualified to
judge the argument — which is the same crime, at one-beat scale, that
choosing an edit plan over a regeneration exists to prevent.

## What was read

`tests/golden-path/edit-plan-chain-seam.probe.spec.ts`, driving the real
render through the real `applyEdits`:

- A: the information does not exist on the returned object.
- B: cutting `0:12` yields exactly one break — `BUT ... written for 0:12,
  and now follows 0:00` — and cutting the opener yields a render that
  opens on a connector.
- Both directions: a retime and an empty plan yield none. A structural
  check that fires on an unedited render is a check people switch off.

## What this realization cannot do or prove

- **It detects; it does not report to anyone.** No surface renders
  `chainBreaks`. `DeclinedList`'s four kinds are card-shaped — a cardId
  and a reason — and a chain break is beat-shaped, so folding it into
  `unsupported` would file it under the wrong noun and make the count
  mean two things. Until a surface exists, this is a value a probe reads
  and a creator does not.
- **It is structural, not semantic.** It can say a connector's
  predecessor changed. It cannot say whether the new relation happens to
  hold anyway — sometimes a cut leaves a BUT that still reads. Every
  finding needs a human, which is the correct division and also a cost.
- **`rewrite` is not covered.** Rewriting the text under an unchanged
  connector can break the same relation with no positional evidence at
  all, and no check here notices.
- **It cannot enforce the technique's byte-identity clause.** "Beats not
  named by any operation must be byte-identical in the applied result" is
  testable and still untested in this tree; nothing diffs the applied
  render against the base to catch edits the plan did not declare.
