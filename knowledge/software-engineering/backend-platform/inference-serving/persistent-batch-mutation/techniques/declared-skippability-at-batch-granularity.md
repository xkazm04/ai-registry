---
layer: technique
type: technique
subject: persistent-batch-mutation
technique: declared-skippability-at-batch-granularity
status: forged
laws: [silent-state-is-ungoverned, one-authority-per-vocabulary]
shared_with: []
use_when: [an optional transform costs real time on every step, deciding where an invariance is declared, a per-item optimisation is not paying off, designing an extension interface with an opt-out]
---

# Declared skippability, at batch granularity

A stateful extension sitting in a hot loop is pure cost on every step where it
cannot change the outcome. There are always such steps: a transform whose
effect is annihilated by the mode the consumer downstream is running in, or
whose parameters are at their identity values, or which nobody in the current
population has switched on. The saving is real and it is available every step.

The engine cannot find it. Whether a given transform is outcome-preserving
under a given mode is a fact about that transform's mathematics and its
configuration, and nothing at the call site can derive it. So it must be
**declared** — the extension converts a private fact about itself into a value
the scheduler can branch on
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
The interface is a single property: *"under this mode, I cannot change the
result."*

Three rules make it work, and each of them is non-obvious.

## 1. Evaluate once, at startup

The property is read when the extension is constructed and never again. This
is a deliberate restriction, not an optimisation of the check.

A property re-evaluated per step is a per-step branch on state that can change
under it, and it invites exactly the extension that answers "skippable" while
holding pending work — at which point the skip is a correctness bug rather
than a saving. Freezing it at construction makes the declaration a **property
of the configuration**, which is something an operator can reason about, a
startup log can report, and a test can assert. If a transform's skippability
genuinely varies at runtime, it does not have this property; it has an
internal fast path, which is its own business and must not be exposed as a
scheduler-level skip.

The practical consequence: everything the declaration depends on must be known
at construction time. In practice this is the mode of the consumer downstream
and the extension's own configuration — both fixed for the lifetime of the
process. If a proposed dependency is not fixed, the design is wrong before the
property is.

## 2. Per instance, never per class

The declaration belongs to the **instance**, not to the type. This is the rule
that gets argued about, and the argument has one decisive answer: **the same
extension type, configured two ways, has two different answers.** A transform
parameterised into its identity values is skippable; the identical type with
live parameters is not. A class-level annotation therefore has to be either
conservatively false — throwing away the saving in every configuration that
would have qualified — or optimistically true, which is a correctness bug that
only appears in the configurations nobody tested.

Two secondary reasons reinforce it. A class-level answer cannot be reported
per running instance, so an operator asking "why is this deployment slower
than that one" gets no signal from the interface. And a class-level answer is
a second place where the same fact lives, alongside the configuration that
actually determines it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

The interface should make the per-instance nature structural rather than
documented: the property is read from a constructed object, and there is no
way to ask the type. An interface that offers both will get the type asked.

The two rules combine into the implementation that makes the skip cheap.
Because the answer is fixed at construction and belongs to the instance, the
scheduler **partitions the extensions into two collections at startup** — the
skippable ones and the rest — and places the skippable collection after the
point where the step decides it can take the shortcut. The skip is then the
absence of a loop, not a branch inside one, and no per-step test of the
property exists anywhere. If a design cannot be expressed as that partition,
the property is not startup-fixed and the whole technique does not apply.

## 3. The granularity trap — a per-item property, exploitable only per batch

This is the finding, and it is where the naive reading fails.

The property is naturally *per item*: this member's configuration makes the
transform a no-op for **this member**. But the transform executes over the
whole batch at once — that is the entire reason the batch exists. There is no
seam at which one member's rows are skipped, because the operation is one bulk
computation, and carving an item out of it costs more than the computation
saves.

So the skip fires **only when every occupant of the batch qualifies.** One
non-qualifying member and the full cost is paid for all of them.

The economics that follow are the opposite of what "per-item property"
suggests:

- **The saving is not proportional to the qualifying fraction.** It is a step
  function at 100%. Ninety percent qualifying saves nothing.
- **The saving decays with batch size.** With a large, heterogeneous
  population, the probability that no occupant has enabled the feature falls
  fast. The optimisation is most valuable exactly where batches are small or
  populations are homogeneous — a single-tenant deployment, a workload where
  one setting dominates — and close to worthless in the mixed traffic that
  a shared deployment actually sees.
- **It changes what to measure.** The useful metric is not "what fraction of
  items qualify" but "what fraction of *steps* had a fully qualifying batch".
  The first number can sit at ninety-something percent while the second is
  near zero, and reporting the first is how this optimisation gets claimed as
  a win it never delivered.
- **It changes admission's incentives.** If the saving matters, grouping like
  with like at admission converts a step function into a real one — but that
  is a scheduling decision with fairness costs, and it belongs to admission,
  not here. Say so rather than letting someone rediscover it as a hack.

Name this shape when you see it. **A per-item property that can only be
exploited at batch granularity** recurs wherever a vectorised or bulk
operation meets per-item configuration, and every time it does, the per-item
framing misleads the person doing the estimate.

## Implementer corollaries

Two rules for anyone writing an extension behind such an interface, both
consequences of the same fact that the work is bulk work:

- **Return the input unmodified when no occupant has enabled you.** Not a
  copy, not a zero-filled overlay — the input itself. A bulk implementation
  cannot cheaply skip individual members, so the only cheap skip available is
  the whole-batch one, and this is where you take it. The check is over the
  extension's own per-slot state, which the mutation protocol keeps current;
  it is a size test, not a scan of the payload.
- **Exit early on the unchanged-membership record when your state is
  membership-derived.** The state-update phase is entered on every step, and
  for an extension whose entries depend only on membership there is provably
  nothing to do. This is the one place where the unchanged value legitimately
  means "no work" — and it is legitimate *because the extension has reasoned
  about it*, not because empty records are skippable in general.

Both of these are corollaries of the declaration, not alternatives to it: the
declaration removes the extension from the step entirely, and these remove the
work from an extension that is still in the step.

## When not to use it

Do not add a declared skip where the transform is already cheap relative to
the step. The interface cost is permanent — a property every implementer must
answer, an operator-visible knob, a branch in the hot loop, and a failure mode
where a wrong declaration silently changes results — and it is only repaid by
a transform whose cost is measurable against the step it sits in.

Do not use it for behaviour that can be expressed as configuration absence. If
"nobody enabled this" can be answered by simply not constructing the extension
at all, do that: an extension that is not in the pipeline needs no property,
no evaluation, and no rule about when it is read.

And do not declare the property on anything with side effects — accounting,
metrics, logging, state that later steps read. Skippability means *the outcome
is identical*, and an extension that is skipped does not run at all. A
transform that also records something is not outcome-preserving; it merely
looks that way from the payload's point of view, and the skip will silently
delete its records under exactly the conditions where the saving is largest.
