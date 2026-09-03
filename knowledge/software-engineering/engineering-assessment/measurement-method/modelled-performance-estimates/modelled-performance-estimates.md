---
layer: golden-path
type: golden-path
subject: modelled-performance-estimates
status: forged
use_when: [publishing a performance number for a configuration nobody has run, mixing measured and computed values in one field, deciding what to emit when an estimate's input is unavailable, turning a continuous estimate into a categorical verdict, a correction table has started fitting its own outputs]
techniques:
  - provenance-travels-with-the-value
  - refuse-rather-than-emit-a-sentinel
  - scoped-calibration-fallback
  - one-ratio-then-a-capability-cap
---

# Modelled performance estimates

Some of the numbers a system publishes were observed. Others were computed
from a model of the system that would produce them — a bandwidth figure times
an efficiency, a size divided by a rate, a per-unit traffic cost multiplied by
a count. Both kinds arrive at the reader in the same unit, the same type, the
same two decimal places, and the same column. **A measured throughput and a
formula's guess are both a rate**, and nothing about the rendering separates
them.

This subject owns the second kind. Its unit of work is a **cross-sectional
estimate**: a value for a configuration that nobody has ever run, derived from
properties of the system rather than from any observation of that
configuration. It covers the whole pipeline that such a number travels —
derive it, correct it against whatever local measurement exists, replace it
where a real measurement of that exact configuration turns up, publish it with
the class of evidence behind it, and refuse to publish at all where the inputs
are not there.

## The discriminator, stated first because the near miss is close

There is a neighbouring subject that owns the same asymmetry — a computed
number wearing a measured number's clothes — and the boundary between them is
one question:

> **Does the estimate come from the metric's own history, or from a model of
> the system?**

[Metric forecasting](../metric-forecasting/metric-forecasting.md) owns the
first. Its input is a time series: history exists, the estimate is that
history's continuation, its trustworthiness is a property of the fit, and its
governing repair is **refusal to display** when the series is too thin to
extrapolate from. This subject's estimate has **no history at all**. There is
nothing to fit, so there is no goodness-of-fit figure to withhold; the
question "how many points and over how many days" has no answer here because
the count is zero by construction. Trust comes from somewhere else entirely —
from where the inputs came from — and the repair is not refusal but
**replacement**: the estimate is superseded the moment somebody actually runs
that configuration, and corrected in the meantime by measurements of
neighbouring configurations on the same machine.

The consequence of confusing the two is a document that reaches for the wrong
instrument. A modelled estimate has no confidence interval that means
anything, so a team that expects one either invents a plausible-looking
number, which is worse than none, or concludes the estimate cannot be
published at all, which throws away a genuinely useful bound. The
[fit-confidence honesty](../metric-forecasting/techniques/fit-confidence-honesty.md)
rules are the neighbour's and stay there; the analogue here is the provenance
ladder below, which answers the same reader question — *how much should I lean
on this* — from a completely different kind of evidence.

[Measurement honesty](../measurement-honesty/measurement-honesty.md) owns
whether a measurement was honestly taken and honestly reported. This subject
begins where **no measurement was taken at all**, and it borrows that
subject's vocabulary of datum states rather than re-deriving it. Four
boundaries are firmly outside: which candidate a number should make you
choose, which is routing and not measurement; how a benchmark is scheduled,
queued or budgeted, which is measurement operations and which this subject
only *consumes*; how a measurement contributed by somebody else is validated,
anonymised or weighted before it becomes usable, which is an ingestion
concern; and how the machine's own properties are discovered in the first
place, which is detection. This subject starts with the properties in hand and
ends with a number on a screen.

## A model produces a bound, and a bound is not a prediction

Nearly every model of a system computes a **ceiling**: the fastest this could
go if the bottleneck resource were the only constraint. Divide the working set
by the memory bandwidth and you have the shortest time the data could possibly
move, not the time it will take. Real achievement is a fraction of that
ceiling — scheduling gaps, cache behaviour, contention, the parts of the work
the model does not represent.

The consequence is that a raw modelled figure is **systematically optimistic,
not symmetrically uncertain**, and that asymmetry has to be resolved before
the number is published. A team that treats the ceiling as an expectation has
not made an imprecise promise; it has made a promise it will break in one
direction every time, and the reader will discover the bias long before anyone
internally does. There are exactly two honest resolutions: scale the ceiling
by an efficiency factor derived from real runs — which is the calibrated rung
of the ladder, and which brings its own hazards — or publish the ceiling
labelled as a ceiling, so that a reader knows the true value sits below it.
Publishing a ceiling unlabelled, in a field a measurement can also occupy, is
the founding error of this subject.

## Every value carries the class of evidence behind it

The core rule is short and structural. **When a field can be filled either by
a measurement or by a model, the class of evidence is a sibling field of the
value** — not a naming convention, not a comment, not a footnote in the
documentation, not a formatting difference that a spreadsheet export will
erase. The consumer receives the number and the class together or it receives
neither.

The classes form an **ordered ladder, first match wins, and the ladder is
published**. Its shape is stable across domains even though its rungs are not:
directly measured for this exact configuration on this exact machine; measured
by somebody else on a machine that matches this one under a stated matching
policy; modelled and then scaled by a factor derived from runs on this machine;
modelled alone; and, at the bottom, no estimate is possible. Resolution walks
down and stops at the first rung whose inputs it can satisfy.

The load-bearing part is not the rendering. **The rungs differ in what a
consumer is permitted to do with the value.** A value from the measured rungs
may anchor a calibration; a value from the modelled rungs may not, or the
correction table ends up fitted against its own output and every subsequent
estimate inherits the error it was supposed to remove. A value from the
measured rungs may be quoted as an achieved figure; a modelled one may only be
quoted as an expectation. Encoding that permission in the ladder is what makes
the ladder more than decoration, and it is why the class must be a typed value
that survives to the outermost consumer rather than a string in a log line.

The second rung hides the whole subject's sharpest policy question, and it
must be answered in the open: **what counts as "matching" is a published
policy, not an implementation detail.** Key the match tightly — on the
identity of every component whose properties the model consumes, typically
both the processor and the accelerator — and a stranger's number transfers
only when it genuinely applies. Key it loosely, on a family name or a
generation, and the ladder quietly imports numbers taken on hardware that
behaves differently, at the second-highest trust level in the system, where
nobody will look for them. A loose matching key does not degrade the ladder
gently; it puts fabricated authority one rung below the truth.
[provenance-travels-with-the-value](./techniques/provenance-travels-with-the-value.md)
owns the ladder, the matching policy, and the resolved-basis record below.

## The estimate names the inputs it was actually derived from

An estimate is only auditable if a disagreement between it and a later
measurement can be **attributed**. Without the inputs, a wrong estimate
produces an argument about the formula, and the formula is usually innocent:
the fault was a defaulted bandwidth figure, a size read from the wrong field,
or a fallback that fired silently. So every published estimate carries the
values it actually resolved — the bandwidth it used, the efficiency factor it
applied, which rung it stopped at — at a resolution that lets somebody
recompute the number by hand and get the same answer.

This is the general rule that a
[stored derived value names how it is recomputed](../../../_laws.md#derivation-names-recomputation)
applied at the point where it is least often applied: to a number that looks
like an observation. Its procedure — which inputs qualify, what granularity is
enough, and what to record when the basis was itself a default — belongs with
the ladder, because the class and the basis are the same sibling record and
splitting them produces two fields that each need the other to be read.

## Two kinds of nothing, and they are not interchangeable

When an estimate cannot be produced, there are two distinct states, and a
system that collapses them tells its operator to do the wrong thing.

**Unsupported** means the model structurally cannot represent this
configuration: there is no formula for this shape of system, and no amount of
supplying inputs will produce one. The remedy is to extend the model.
**Missing input** means the formula exists and one of the values it needs is
unavailable on this machine or absent from the catalogue. The remedy is to go
and get the value.

The commonest route into *unsupported* is worth naming because it is easy to
miss: **a model is valid inside one bottleneck regime, and outside that regime
it produces a number with no meaning.** A figure derived from how fast data
can move says nothing about a phase whose limit is how fast arithmetic can be
done, and substituting one for the other is not an approximation — it is an
answer to a different question, formatted like an answer to this one. So the
model's regime is part of its definition, the regime is checked before the
formula runs, and a configuration outside it is unsupported rather than
roughly estimated. These are the modelling analogues of the neighbouring
subject's *unmeasurable* and *not yet measured* states — structural blindness
against a gap that will close — and the same reason applies for keeping them
apart: one of them assigns work to somebody, and the other tells everybody to
stop asking.

Neither of them is a number. **When an estimate's required input is
unavailable, the field is absent — not zero, not minus one, not a plausible
default.** The specific trap in this domain is that performance quantities
have no free sentinel: zero is *inside* the measurable range of every rate,
every size and every duration, so a sort ranks the un-estimated configuration
as the slowest one, a threshold excludes it, and a chart draws it at the floor.
A sentinel is only safe when it lies outside every value the domain can take,
and here there is no such value, which is precisely why the field must be
nullable rather than defaulted. That is
[unknown is not a value](../../../_laws.md#unknown-is-not-a-value) meeting a
domain with nowhere to hide the unknown, and
[refuse-rather-than-emit-a-sentinel](./techniques/refuse-rather-than-emit-a-sentinel.md)
carries the domain test and the places downstream where the absence gets
coerced back into a number.

## A correction table is scoped, or it is a fudge factor

The calibrated rung — a modelled figure scaled by a factor fitted to local
measurement — is where a modelled estimate becomes genuinely good, and it is
also where the subject's slowest-burning failure lives. A correction is fitted
against the cases somebody had. Applied globally, it moves every case,
including the ones nobody measured, and the cases it was not fitted on get
worse in exchange for the ones it was.

The rule is a scoping rule: **a correction's fallback must be arranged so that
adding an entry only ever moves the thing that entry names.** Per-category
entries with a documented default beat one global multiplier, not because the
arithmetic is better but because the *change* is auditable — somebody adding a
case can state exactly which readings move and be believed. And the fallback's
error on an unrepresented case is not a defect in the fallback; it is the
signal that an entry is missing. Tuning the fallback until the newest outlier
looks right is how a table stops being auditable, and it is
[deletion is not repair](../../../_laws.md#deletion-is-not-repair) wearing a
statistician's coat: the visible gap has been removed from the place where it
was visible.
[scoped-calibration-fallback](./techniques/scoped-calibration-fallback.md)
owns the scoping, the no-self-calibration rule that keeps the table from
consuming its own modelled output, and the review discipline for adding an
entry.

## A verdict is one ratio, and then a cap

Most of these estimates exist to feed a categorical answer — will this fit,
will this be fast enough, which tier is this. The construction of that verdict
is where two-input designs go wrong in both directions at once, and the
correction is the strongest rule in the subject:

> **The verdict is a pure function of one ratio. Any capability distinction is
> applied afterwards as a cap, never mixed into the ratio as a second input.**

The naive design blends the fit ratio with something about the environment —
the size of the resource pool, which execution path is available, how much
headroom the machine has in absolute terms — and the resulting verdict tracks
the environment instead of the fit. It **over-promises on tight fits**,
awarding the top tier to a configuration that consumes nearly all of a large
pool because the pool is large; and it **under-rates roomy ones**, demoting a
configuration that sits comfortably in a small pool because the pool is small.
Both directions from one defect is what makes the rule transplantable: a
verdict that fails in a single direction can be corrected by moving a
threshold, and this one cannot, because there is no threshold that satisfies
both cases.

The cap is the second half and it is not optional. An execution path that
cannot deliver the top outcome caps the verdict at the tier below — because
the top tier means *fits with room to spare **and** runs on the fast path* —
and is **not** pushed further down than that, because a configuration that
fits comfortably on a slower path is genuinely usable and saying otherwise
throws away the distinction the verdict exists to draw. The band edges belong
to the same technique, and one of them is worth stating here because it
generalises: **the top band stops short of the theoretical limit.** A pool
filled to its last percent leaves nothing for allocator slack and
fragmentation; a threshold set at 100% is a threshold nobody has tested,
because the configurations that reach it fail for reasons the ratio does not
model.
[one-ratio-then-a-capability-cap](./techniques/one-ratio-then-a-capability-cap.md)
owns the ratio, the cap, the band edges and the derivation each edge owes.

## What this subject refuses

- **A modelled value in a field a measurement can also occupy, with no class
  beside it.** The reader cannot tell, and neither can the next program.
- **A ceiling published as an expectation.** Systematically optimistic is not
  the same as uncertain, and it is not repaired by a disclaimer.
- **A zero, a minus one, or a default where the input was missing.** Every one
  of those is inside the domain and will be sorted, thresholded and charted as
  a real value.
- **"Unsupported" and "missing input" collapsed into one state.** One of them
  is somebody's task; the other is a closed question.
- **A correction table fed by its own modelled output.** The table then fits
  the model's error rather than removing it, and the drift is invisible from
  inside.
- **A global fudge factor.** A correction that moves cases nobody measured is
  a change no reviewer can evaluate.
- **A verdict with two continuous inputs.** It will over-promise and
  under-rate simultaneously, and no threshold move fixes both.
- **A band edge at the theoretical limit.** Nothing has been tested there, and
  the slack the model does not represent lives exactly in the last percent.
- **An estimate whose inputs were not published.** When it is wrong, the
  argument will be about the formula, and the formula is rarely the fault.

## The techniques

- [provenance-travels-with-the-value](./techniques/provenance-travels-with-the-value.md)
  — the ordered evidence ladder as a sibling field, what each rung permits a
  consumer to do, the matching policy that decides whose measurements
  transfer, and the resolved-basis record that makes an estimate re-derivable.
- [refuse-rather-than-emit-a-sentinel](./techniques/refuse-rather-than-emit-a-sentinel.md)
  — the domain test for whether a sentinel is safe, why performance quantities
  have none, the difference between unsupported and missing input, and the
  serialization boundaries where absence is coerced back into a number.
- [scoped-calibration-fallback](./techniques/scoped-calibration-fallback.md) —
  fitting a correction so that adding an entry moves only what it names, the
  fallback's error as a signal rather than a bug, and the rule that keeps a
  table from calibrating against its own estimates.
- [one-ratio-then-a-capability-cap](./techniques/one-ratio-then-a-capability-cap.md)
  — the single-ratio verdict, the bidirectional failure of a two-input one,
  the capability cap that stops one tier down, and band edges derived from
  slack rather than from the theoretical limit.
