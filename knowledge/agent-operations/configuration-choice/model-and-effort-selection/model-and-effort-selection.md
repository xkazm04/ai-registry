---
layer: golden-path
type: golden-path
subject: model-and-effort-selection
status: draft
use_when: [choosing which model and reasoning tier an unattended task gets, defending a default configuration for a fleet, deciding whether a failure justifies more reasoning, setting a per-task-kind tier policy]
techniques:
  - cheapest-sufficient-tier
  - instruction-defect-before-tier-escalation
  - tier-risk-inversion
  - task-shape-tier-policy
  - pin-the-resolved-configuration
---

# Model and effort selection

Two dials decide what an unattended agent run costs and what it produces: which model
family runs it, and how much reasoning that model is told to spend. Both are usually set
once, by habit, at the top of the range — on the theory that the strongest configuration
is the safest default. That theory is wrong in a specific, measurable way, and this
subject is about replacing it with a policy that a fleet operator can defend.

The reasoning dial reliably buys *thoroughness*: more files read, more call sites found,
more alternatives weighed before acting. What it does to *obedience*, including judgement
about whose rules win, is not neutral, and it is not predictable across models. In
published measurements, a conflict between instruction sources was resolved correctly
far more often as effort rose in one family (from about one case in six to three in five),
while another family got worse at the lowest step before recovering. Separately, simple
format constraints were followed less often once the model reasoned at length. The
defensible statement is narrower than "effort does not buy obedience":
**effort is not a fix for obedience**, the direction of its effect is a per-model
measurement, and even the best measured case plateaued far short of reliable. Where a run
misreads an instruction the same way at every tier, the misreading is usually in the
instruction. When a run's mistake is "did too much of the wrong thing", extra thoroughness
enlarges it: the same wrong decision, applied to more files.

Effort is also its own axis, not a synonym for model tier. A *configuration* is a
(model, effort) pair. Its levels and defaults are specific to each model, so one label
means different things on different models. Its effect on quality is not monotonic: one
public leaderboard found higher effort did not improve accuracy in 21 of 36
model-benchmark combinations (on small thinking budgets). A vendor now tells its users to
use the low levels liberally wherever their own evaluations hold. On hard coding tasks,
higher effort still bought real gains. The only general rule is to sweep effort per
model, and never carry a measured level across a model change.

So the operator's question is never "which is the best configuration". It is:

- **What is the cheapest configuration that clears the bar on every case I care about?**
  Not on average — on every one, because a fleet's value comes from unattended runs and
  an unattended run that fails on one repository is a repair job on that repository.
- **Where a configuration fails, is the defect in the model or in the instruction?**
  These have different fixes and only one of them is bought with reasoning tokens.
- **What does a failure cost here?** A read-and-report task that is wrong costs a reread,
  if a reader can tell it is wrong. Longer reasoning makes confident fabrication more
  likely, so that risk also grows with the dial. A task that commits, migrates or deletes
  can cost a repository its private material, and that risk rises, not falls, with the
  reasoning dial.

## The bar is per case, and it is mechanical before it is judged

A configuration is eligible for recommendation only if every run it produced passed the
mechanical checks — the repository's own gates stayed green, the task's required outputs
exist, nothing was left half-finished, and no rule the repository declares was overridden.
Only then does a quality verdict decide between eligible configurations. An average over
cases hides exactly the case that will page someone: two strong results and one run that
committed private material average to "good".

## More reasoning is not a remedy for a bad instruction

When the same task fails the same way across tiers and across vendor families, the
instruction is the first suspect. The fleet's instinct — rerun it higher — spends the budget
that should have gone into a one-line fix, and produces a second confident failure that
now looks corroborated. The diagnostic is cheap: hold the task fixed, vary the tier and
the engine, and read the failures side by side. Identical failures point at what the runs
shared, and the instruction is only one of those things. Frontier models' errors are
strongly correlated: when two models both err, they agree on most of those errors, and
more so the stronger they are. So a gap in knowledge every model shares, a defect in the
environment, or the harness itself looks exactly like a wording defect. The confirming step is
a perturbation: reword the instruction and rerun. If the failure moves, it was the wording.
If it does not, look at what else the runs shared. Divergent failures are a capability
difference, and only then is the tier the lever.

The corollary is uncomfortable and worth stating plainly: a fleet that only ever runs its
strongest configuration cannot tell these apart at all. It has one observation per task
and no way to attribute it, so every instruction defect in its task library is invisible
and permanent. Running a cheap tier alongside is not just a cost decision; it is what
makes the instruction defects visible.

## Cost is not money here, and that changes the objective

Where a seat is flat-rate, more reasoning does not show up on an invoice. It shows up as
wall-clock — runs that take four times as long — and as *headroom*: every unattended run
consumes a share of a rate or session allowance that the fleet's other work, including
its own judging, must come out of. A configuration that is marginally better and four
times slower is not marginally better; it is a different operating point, and on a busy
day it is the reason the queue stalls.

Report the tier's cost in the units that actually bind: reasoning tokens, wall-clock per
run, and share of the allowance. Money is the wrong unit on a flat-rate seat and the right
one on a metered API, and the recommendation changes with it.

## The configuration that ran is the one you pinned, not the one you chose

A policy's choice reaches a run only through the launch path, and any value the path
leaves unset is resolved again from the environment. That means the user's saved
settings, the harness's per-model default, the provider's default, and whatever an alias
points at today. Each of those moves without notice. Continuation paths are the usual
leak: a resume, a retry or a wake that passes only the session id resolves the rest
afresh. On one harness, measured, that kept the model and silently changed the effort.
Pass both values on every path, record requested and served per run, and write down
"not passed" when it is deliberate
([pin-the-resolved-configuration](techniques/pin-the-resolved-configuration.md)). A tier
measured against one resolution chain says nothing about a fleet running on another.

## What a defensible recommendation looks like

A recommendation names four things, and is worth nothing without the fourth:

1. **The configuration** — family and tier.
2. **The bar it cleared** — which mechanical checks, on which cases.
3. **The margin** — how far it sits from the best observed result, and the threshold
   under which that gap was called acceptable.
4. **The coverage it rests on** — how many cases, how recent, and which cells are missing.
   A recommendation over an incomplete grid is labelled provisional, and stays labelled
   until the grid closes. One run per cell supports a paired comparison across the cases
   two configurations share. It does not support a verdict on any single cell, or a margin
   smaller than rerun noise. Rerun the cells the recommendation hinges on. Saying which
   of these the number is, is what keeps it honest when someone quotes it next quarter.

A fleet that publishes recommendations without the fourth item is publishing taste with a
number attached, and the number will outlive the taste.
