---
layer: technique
type: technique
subject: perf-regression-gating
technique: per-thread-budgets-not-one-frame-time
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, a-budget-shapes-the-output]
shared_with: []
use_when: [declaring the runtime budget a gate compares against, a frame got slower and nobody can say which stage moved, a cheap run mode has no renderer and a budget names the graphics stage, deciding whether a gate compares to a budget or to a baseline]
---

# Per-thread budgets, not one frame-time

The concern: what the gate compares, once the window is fixed. A frame is not one piece of
work. The simulation, the preparation of what to draw, and the graphics processor's
execution of it run as concurrent stages, and the frame is as late as the slowest of them.
A single frame-time number says that the frame was late and cannot say which stage was
responsible; worse, it cannot see a regression in a stage that has headroom, because the
interval does not change until that stage becomes the binding one. By then the headroom is
spent and the change that spent it is several builds back.

## Procedure

**1. Declare one budget per stage, as a share of a named interval.** Write it as a
sentence with the unit, the interval, the stage and the statistic: *the simulation stage
consumes at most a share x of the interval T at percentile p of the window*, with x, T and
p filled in from the target rate. The headroom is written beside it, so that neither the
consumed share nor the remainder can be read inverted. Stages overlap, so the budgets are each against the
interval and are not required to sum to it; state the overlap assumption, and where the
engine serializes two stages, they do sum.

**2. Measure each stage's busy time, not its elapsed time.** The cost of a stage is the
work it did. A stage that waited on another has an elapsed time that includes the other's
cost, and a gate reading elapsed times attributes a regression to the wrong stage. State
which of the two a number is.

**3. Give every stage a result of three kinds: within, over, not measured.** A boolean
*within budget* has no place for the third, and the third is the one a cheap run produces
most often. A result carries the stage, the statistic, the budget, the observation and,
for the third kind, the reason the run could not observe the stage.

**4. Bind each stage to the run modes that can observe it.** A run with no renderer does
no graphics work, so a graphics budget cannot be evaluated in it; it can observe the
simulation stage and whatever preparation does not need a device. A run with an offscreen
renderer on a machine with a real graphics processor can observe all three. Record the
mapping once, as a table the harness reads, and refuse a request whose mode cannot serve
its stage — the same refusal as a perceptual request served by a render-less run.

**5. Put the graphics stage in its own lane when its machine class differs.** The cheap
lane gates the stages it can observe and reports the graphics stage as *not measured*; a
lane on hardware with a graphics processor gates graphics against its own baseline. When
both modes run on one machine class a second boot in the same lane is enough. Either way
the two lanes' numbers are never merged into one verdict: each carries its own mode, its
own spread and its own baseline, and a roll-up counts the unmeasured stage as not
evaluated, not as passed.

**6. Name the stage in the regression.** A regression is a stage, a statistic and a delta
beyond that stage's spread. A stage whose cost rose while the interval did not is a
regression, and it is the case this technique exists for: headroom consumed is a cost
paid, and the budget makes it visible while there is still headroom.

**7. Label the binding stage only among the measured ones.** "The frame is bound by the
simulation stage" is a claim about the stages that were measured. With one stage not
measured, the claim is "binding among the measured stages", because the unmeasured one may
be the larger.

## Budget and baseline are different objects

A **budget** is a policy: what the team will accept, derived from the target rate and from
what else shares the frame. A **baseline** is a measurement: what this build did, on this
lane, with its spread. A gate compares to one or the other and says which, because they
fail differently. A build can sit well inside its budget and have doubled its cost since
yesterday, which only the baseline sees; and a build can be flat against its baseline and
over budget for a month, which only the budget sees. Both gates exist, and the budget is
what stops accepted regressions from compounding, since a within-spread increase accepted
at each promotion is invisible to every baseline taken after it.

The budget is also an instruction about the target, not only a ceiling
([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)): it is stated
to the authors of the content before the run, in the same sentence form, and a stage whose
declared headroom nothing ever measures is a wish. What binds a baseline to the machine
and the build that produced it is the baseline technique; this one only fixes that the two
are not the same thing and that a gate never compares to one while naming the other.

## Decision rules

- When the only budget is the whole-frame interval, split it before gating, or the gate
  answers only whether the frame was late.
- When a stage cannot be observed in the run mode, record *not measured* with the reason;
  never a zero, never a default, never a stage mean taken from the stages that were seen.
- When the run mode cannot serve a stage a budget names, either add the lane that can or
  state that the budget is unenforced for now. An unenforced budget printed as a gate is the
  worst of the three.
- When a stage is within budget and its measurement rose by more than its spread, report
  the regression for that stage; within budget is not unchanged.
- When per-stage timing is not exposed by the platform at all, gate the interval, say that
  stage attribution is not available, and do not invent a split from a model.
- When the statistic a budget is compared against is not stated, the budget is not
  checkable: a mean and a tail give opposite verdicts on the same run, and a result that
  hides which was used can be read either way.

## When not to use

Do not split a budget for content whose cost is one stage by construction, such as a small
two-dimensional game with no separate preparation stage. The stage budget is the frame
budget, and splitting it adds a field with no information.

Do not decline to gate because a platform hides stage timing. Gate what the platform does
expose, say what it does not, and let the report carry the limit; refusing to measure the
interval because the stages are hidden loses the signal that does exist.

Do not use a per-stage budget as a substitute for authoring-time class budgets. Those decide
what an artifact may spend before it exists, from its description; these check what a
running build spent, and both are needed because only one of them can shape what an author
makes.
