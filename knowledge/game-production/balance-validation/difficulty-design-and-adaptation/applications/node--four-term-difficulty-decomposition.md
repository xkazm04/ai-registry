---
layer: application
type: application
subject: difficulty-design-and-adaptation
technique: four-term-difficulty-decomposition
stack: node
verified_on: 2026-09-07
verified_against: node@24
applied: code
ab_verdict: better
---

# The four terms as evaluator criteria, in a TypeScript game-tooling app

One realization of this technique is not a runtime system at all: it is a **static
criteria set that judges generated designs**. A tooling app that dispatches
implementation prompts per game module, and later evaluates what was built, holds the
four-term model as prose criteria distributed across the module contexts the terms
belong to.

The shape is a single exported record keyed by module id
(`src/lib/evaluator/module-eval-prompts.ts`, `MODULE_CONTEXTS`), where each entry is a
`ModuleEvalContext` (`:60-69`) carrying a `focus` line and three check strings —
`structureChecks`, `qualityChecks`, `performanceChecks` — plus an optional
`tracePass` that only the combat module sets (`:68`). Evaluation runs as ordered passes
(`EVAL_PASSES`, `:20`), and the first is a ground-truth pass that establishes what
actually exists before any change is proposed (`:51-52`).

Design-quality claims live in `qualityChecks`. That placement is the whole reason the
technique fits this stack: the string is injected into a judging prompt, so a criterion
written here is applied to every design the module ever produces, without a schema
change or a migration.

## One term, one module context

The three authorable terms map onto three different module contexts, because each is
owned by a different part of the game:

- **Player power** — the progression module (`:255`). The criterion states the four
  terms, names which of them each lever moves, and requires a progression design to
  carry a power route for players whose skill lags rather than assuming everyone tracks
  the intended curve.
- **Enemy skill vs enemy power** — the enemy-AI module (`:182-183`). The criterion asks
  that a harder tier add at least one new *decision* for the player rather than a longer
  fight, and separately caps the axis that is not difficulty at all: an opposition
  advantage drawn from machine speed is a different game, not a harder one.
- **Adaptation and who chooses it** — the world module (`:278-279`), where encounters
  and spawning live. It carries the hazards of adjusting to live performance and the
  setting-bounded band shape.

## What this realization proves, and what it cannot

**The interesting confirmation is negative.** The record has a context for every module
the tooling knows how to build — character, animation, abilities, combat, enemy AI,
inventory, loot, interface, progression, world, save, materials, dialogue, polish. There
is no context for player skill, and there could not be: nothing in the codebase is
responsible for it, because nothing in a codebase can be. The term the technique says
**nobody sets** is exactly the term with no owning module, and the tooling's own
structure surfaces that asymmetry without having been designed to.

That is the strongest evidence this stack can offer for the four-term split, and it is
worth more than the criteria themselves.

**What it cannot do is measure.** These criteria are read by a judging model, so the
verdict is a judgment and never a measurement — the law that unmeasured is not a pass
applies to the evaluator itself, not only to what it evaluates. Two structural
mitigations exist and both are partial: the ground-truth pass (`:51-52`) forces the
judge to confirm the real classes and properties before it reasons about them, and the
combat module's `tracePass` (`:68`) is the one place a single concrete hit is walked
end to end rather than assessed in the abstract. Nothing here produces a number with a
basis, which is why this application complements a simulation harness rather than
substituting for one.

**A caution about criteria written as prose.** Each check string is injected verbatim
into a dispatch prompt, so an added criterion is live everywhere immediately and is only
as good as its wording. This repository pins the rendered prompts with a golden suite
(`src/__tests__/lib/prompts/`, nine files at the time of writing); editing a criteria
string without running that rail leaves the prompt goldens red while the module's own
unit test stays green — a failure this project has recorded and paid for. The rail is
the closest thing the stack has to a regression gate on knowledge.

## A second seam in the same tree: where the terms are numbers, not prose

The criteria above are how this stack *judges* a design. There is a second place where
it *scores* one, and it is the seam the technique's unsigned-estimator section applies
to. A pure module reduces an opposition archetype's stats to a single danger number by
weighted sum (`src/lib/balance/threat-score.ts`, `WEIGHTS`), and a sibling linter checks
each archetype against its same-tier peers. In four-term vocabulary the weights are a
model of **enemy power** alone, which is correct — but the number is used to answer *how
dangerous is this*, which is a difficulty claim, and a difficulty claim carries its
assumed skill level or it is not one.

The weights carry no basis, and their author never played the game. That is the
technique's unsigned case rather than its optimistic one, and the tree confirms the
distinction matters here rather than merely being available. Both arms were run over the
same twelve-archetype, three-tier roster: the shipped vector, and an equally defensible
one that weights defense level with offense on the argument that survivability compounds.

- **Cross-tier ordering: identical.** Tier separation dominates the sum, so the coarse
  question the score is most often asked — is this a boss or a grunt — is robust to the
  weights, and the unsigned authorship never reaches it.
- **Within-tier ordering: flips in all three tiers**, always on the same pair, moving six
  of twelve archetypes one place. The peer-band linter and encounter budgeting both read
  the within-tier order, so the part that is fragile is the part that is consumed.

**The structural fact is in the test suite, and nobody designed it.** Every assertion the
module had was weight-*independent* — damage outranks health, a score is positive, an
empty stat list is zero, an unknown label still contributes. Each of those passes for any
vector in which damage outranks health, so a suite that looked like coverage pinned no
shipped value at all. The unsigned number was not lightly guarded; it was unguarded by
construction, and a green suite said otherwise.

What shipped is the corrective the technique prescribes, which is explicitly **not** a
retune: the weights are recorded as unestimated with the reason the usual easing reflex
does not apply, and the within-tier ordering is pinned by characterization tests that say
in their own comment that they do not claim the order is right, only that changing it is a
decision. The guard was calibrated in both directions before being left green — red under
the full reweighting, green under a single 0.05 nudge — so the document can state its
reach honestly: it catches a change of stance, not drift. A team copying this should copy
the calibration, not the number; a characterization test that has never been shown to fail
is indistinguishable from one that cannot.
