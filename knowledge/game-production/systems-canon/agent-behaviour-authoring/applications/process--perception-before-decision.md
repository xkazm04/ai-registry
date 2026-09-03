---
layer: application
type: application
subject: agent-behaviour-authoring
technique: perception-before-decision
stack: process
status: forged
verified_on: 2026-09-02
---

# Perception before decision, as a prompt-pipeline contract

How one machine-driven UE5 production line realizes the knowledge-model-first rule. Citations
are against the PoF repository at commit `9aa31407`; every line was re-opened on the date in
the frontmatter.

The line does not hand a human an editor. It hands a coding agent a checklist item whose
`prompt` field is the whole specification, and grades the result with a second prompt. So the
technique has to survive being expressed twice — once as a generation constraint and once as a
rubric criterion — and the two expressions are in different files.

## Where the knowledge model is specified

`src/lib/module-registry.ts:806` is the checklist item `ai-3`, *Configure AI Perception*, and
its prompt is the closest thing the line has to a knowledge-model declaration:

> Add sight sense: SightRadius 1500, LoseSightRadius 2000, PeripheralVisionAngle 45,
> AutoSuccessRange 500. Add hearing sense: HearingRange 1000 … If target lost (out of sight
> for 5s), clear target and return to patrol.

Read against the technique this is a genuinely good specification and it is worth saying why,
because most generated behaviour specs are worse. It enumerates senses rather than assuming
them; every sense carries parameters rather than defaults; and `LoseSightRadius` sitting apart
from `SightRadius` is hysteresis on detection — the agent does not flicker at the range
boundary. The five-second clear is a decay window, and it is what buys the return-to-patrol
behaviour without any of it being scripted.

The grading half is `src/lib/evaluator/module-eval-prompts.ts:322-340`, the `ai-behavior` entry
of `MODULE_CONTEXTS`. Two of its criteria are this technique:

- `:326` — *"Perception senses should be configured per AI archetype"* (a structure check: the
  sense set exists, and it varies by class rather than being one global setting).
- `:331` — *"Perception should have proper sight radius, angle, and age settings"* (a quality
  check, and *age* is the decay parameter under another name).

That the same rule appears as both a generation constraint and a rubric criterion, in two
files, is the shape the technique wants. It is also the shape that drifts, and the two are
already phrased differently enough that a grader could pass a spec the generator never
produced.

## Deviations recorded

**The authoring order is not enforced by the dependency graph.** In
`src/lib/feature-definitions.ts:395-403`, `Behavior Tree system` (`:397`) declares
`dependsOn: ['AI Controller base']` and `AI Perception setup` (`:398`) declares the same. They
are siblings. Nothing in the graph prevents the decision layer being authored, generated and
marked complete before any sense exists — which is exactly the sequence the technique forbids,
and the one that produces the blind agent. The one-line fix the standard implies is that the
behaviour-tree feature depends on the perception feature; the standard stays either way.

**Sense parameters carry no reference target.** `SightRadius 1500` is a number without the
basis it is meaningful against: 1500 of what, to detect a target of what size, lit how, moving
how. Both the generator and the grader would accept the same figure for a crouched target in
darkness and a sprinting one in daylight. This is the unit-and-basis law biting on a value the
line already treats as canonical.

**There is no competence dial and therefore nowhere to implement a difficulty ceiling.** The
prompt specifies what the agent can *find* — ranges, angles, decay — and nothing about how fast
it may *use* what it finds. No reaction delay separates the stimulus arriving in the knowledge
model from the decision layer acting on it. The practical consequence is the one the technique
names: the only available lever for making an agent less punishing is to make it blinder, so a
responsiveness complaint is fixed by degrading the agent's search competence.

**No three-valued rule.** Neither file distinguishes *known false* from *never sensed*. The
generated controller in `:806` binds `OnTargetPerceptionUpdated` and sets or clears a
blackboard target; a cleared target and a target never acquired are the same state downstream,
so nothing above the knowledge model can express *go and look where I have not been*.

## The one upward lesson

`src/lib/module-registry.ts:800` carries a knowledge tip that has no analogue in the
traditional literature:

> Behaviour Trees are binary content … BT graphs cannot be authored from Python. PoF generates
> the C++ leaf nodes (BTTask/BTService/BTDecorator); the BT graph itself is editor-authored.

This is a constraint on the *pipeline*, not on the agent, and it propagates into the knowledge
model: the perception configuration in `:806` is C++ and generatable, while the tree that
consumes it is not, so the two halves of one agent are produced by different mechanisms with
different verification. The line's own answer is checklist item `ai-7` at `:810`, a
deliberately behaviour-tree-free controller for the vertical slice. Generalized, that is the
sixth model-selection criterion the technique's sibling now carries: **what the production line
can emit is part of the model choice**, and a knowledge model that only one half of an agent
can act on is a knowledge model with a wiring risk.
