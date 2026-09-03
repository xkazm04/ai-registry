---
layer: technique
type: technique
subject: modelled-performance-estimates
technique: provenance-travels-with-the-value
status: forged
laws: [derivation-names-recomputation, verdict-survives-boundary, count-carries-predicate]
shared_with: []
use_when: [one field can hold either a measurement or a computed estimate, deciding whether somebody else's measurement applies to this machine, a consumer needs to know how far to trust a published number, an estimate disagreed with reality and nobody can attribute the gap]
---

# Provenance travels with the value

A field that can be filled by a measurement *or* by a model holds two
different kinds of claim in one slot. Nothing about the value distinguishes
them: both are the same type, the same unit, the same magnitude, and both
render identically. The evidence class must therefore be **a sibling field of
the value**, emitted with it, typed, and carried to every consumer.

Everything weaker has been tried and fails in a recognisable way. A naming
convention (`estimated_rate` beside `rate`) breaks the first time somebody
needs one column. A doc comment reaches the person reading the source and
nobody reading the output. A formatting difference — italics, a tilde, fewer
decimal places — dies at the first export, the first copy-paste into a
message, the first chart. A confidence percentage is worse than all of them,
because it invites arithmetic that has no meaning: there is no sense in which
a modelled value is "seventy percent confident", and once a number exists
somebody will average it.

## The ladder

The classes are an **ordered ladder** and resolution **walks down it, taking
the first rung whose inputs it can satisfy**. Rung order is trust order, so
the walk is also the trust decision, and no consumer re-derives it.

A ladder for this kind of estimate has five rungs, and the *shape* transplants
even where the rungs do not:

1. **Measured here.** An observation of this exact configuration on this exact
   machine. Nothing outranks it, including a model that disagrees with it.
2. **Measured elsewhere, on a matching machine.** Somebody else's observation
   of this configuration, admitted because a stated matching policy says their
   machine and this one are the same for the model's purposes.
3. **Modelled and calibrated.** The formula, scaled by a factor derived from
   real runs on this machine. A hybrid: the shape comes from the model, the
   magnitude from local evidence.
4. **Modelled.** The formula alone, from the machine's declared properties.
5. **None.** No rung's inputs are available. This is a rung, not a failure —
   see the [refusal technique](./refuse-rather-than-emit-a-sentinel.md) for
   why it must not be spelled as a number.

**Publish the ladder.** A consumer that can see the rungs can reason about a
value it did not produce; one that receives an opaque flag learns only that
somebody thought about it. And the rung is a
[classified outcome that must survive to the outermost boundary](../../../../_laws.md#verdict-survives-boundary)
as a typed value: a rung erased into a boolean `is_estimated` at the first
serialization has lost the distinction between rungs 2 and 4, which is the
distinction that matters most.

## The rungs differ in what a consumer may *do*, not only in how they render

This is the part that makes the ladder load-bearing rather than decorative,
and it is usually discovered late.

**A measured value may seed a calibration. A modelled value may never.** Feed
rung 3 or 4 output back into the factor that produces rung 3 and the table
fits the model's own error instead of removing it; the estimates then converge
on self-consistency, which looks like improvement on every internal check and
is drift. The rule belongs in the code that collects calibration inputs, as a
filter on the rung, and not in a comment asking people to be careful.

**A measured value may be quoted as achieved. A modelled one may only be
quoted as expected.** Any surface that generates prose, a report line or an
alert takes its verb from the rung. This is the one place where the rung
influences copy, and it is worth the branch: "runs at" and "should run at
about" are different promises and readers hold you to both.

**A measured value may refute the model; a modelled value may not refute a
measurement.** When rung 1 and rung 4 disagree, the finding is about the
model. Systems that quietly prefer the tidy computed number over the noisy
observed one have inverted their own ladder. The same asymmetry governs
calibration's effect on the rung: applying a local correction **promotes a
modelled value to the calibrated rung and never touches a measured one**. A
measured value is not improved by a factor fitted to formula error, and a
system that re-labels it has lost the only reading it could trust.

## The rung is derived from the basis, never stored beside it

Resolve the rung with a **function of the basis record**, and recompute it
after anything that changes the basis, rather than assigning it at each site
that produces a value. A stored rung is a second copy of a fact the basis
already carries, and it goes stale in the one direction that matters: the
value gets corrected, promoted, or replaced by a later measurement, and the
label stays where it was. Where the wire format needs the rung as a field, it
is a projection emitted at serialization, not an independently maintained one.

## The matching policy is published, or rung 2 is a leak

Rung 2 admits a stranger's number at the second-highest trust level in the
system. What makes two machines "matching" is therefore a **policy that is
written down and enforced as a key**, not a similarity judgement made at read
time.

Key it on the identity of **every component whose properties the model
consumes**. If the formula reads a memory bandwidth and a compute figure, the
key contains the identity of the parts those figures come from — typically
both the general processor and the accelerator, because a shared measurement
taken on one accelerator paired with a much faster host is not a measurement
of this machine. A looser key — a family name, a generation, a marketing tier
— admits numbers from hardware that behaves differently, and it does so
*silently*, at rung 2, where nobody looks for a problem.

The failure is asymmetric and that is why the tight key wins. A key that is
too tight loses candidate measurements and the ladder falls through to rung 3
or 4, which is a mild, visible degradation the rung field announces. A key
that is too loose produces a wrong number labelled as measured, which is the
one output this whole subject exists to prevent. **When in doubt, tighten the
key and take the lower rung.**

## The resolved basis

The rung says how much to trust the number. The **basis** says how to
reproduce it, and without it a disagreement between the estimate and a later
measurement cannot be attributed. Publish, beside every estimate, the values
it actually resolved: the bandwidth or rate figure used, the efficiency factor
applied, the size it read, and the rung it stopped at. At a resolution where
somebody can recompute the value by hand and get the same answer.

This is [a derived value naming its own recomputation](../../../../_laws.md#derivation-names-recomputation),
and the reason it is skipped here more often than elsewhere is that the output
does not look derived — it looks like an observation, and nobody asks an
observation to explain itself. The payoff arrives on the day the estimate is
wrong: with the basis, the investigation takes minutes and usually ends at a
defaulted input; without it, the team relitigates the formula, which is
innocent about four times in five.

Three rules on the basis itself. **Record the value that was used, not the
value that was configured** — a fallback that fired silently is exactly the
case the record exists to expose. The way to guarantee it is structural rather
than disciplinary: the computation and the basis record obtain each input from
**one resolution function**, so the two cannot disagree about what was
assumed. A basis assembled separately, by an emitter re-reading configuration,
reports the value somebody intended while the computation used the fallback —
and that is precisely the discrepancy the basis exists to catch, now
undetectable.

**Validate each basis input where it is resolved, and treat an out-of-domain
one as absent.** A non-positive divisor, a negative rate, a non-finite
override does not produce a slightly wrong estimate; it produces nonsense that
propagates silently until it renders. An input that fails its domain check
falls through to the next source and, if there is none, down a rung — it is
never used and never coerced.

And **record the defaulting**: a basis entry that
came from a table default rather than from this machine is a different fact
from one that was detected, and the difference explains most of the residual
error. A basis figure travelling without that predicate is
[a number without what it counts](../../../../_laws.md#count-carries-predicate).

## Decision rules

- **When a field can hold both kinds, add the sibling field before the second
  producer exists.** Retrofitting provenance means auditing every write site,
  and the write site that predates the field is the one that lies.
- **When resolution falls through a rung, record why once, at the resolution
  point.** "No matching shared measurement" and "no compute figure for this
  device" are different diagnoses and both are cheap to keep.
- **When collecting calibration inputs, filter on the rung, not on a
  heuristic.** Anything at rung 3 or below is excluded by construction.
- **When two rungs disagree, the higher rung wins and the disagreement is
  recorded.** A persistent gap between rung 1 and rung 4 on the same
  configuration is the best calibration signal the system will ever get.
- **When a consumer only needs one bit, derive the bit from the rung at the
  edge.** Never store the bit. The rung is derived from the basis and the
  basis is the authority; a boolean beside it is a third copy that will drift.
- **When a basis input fails its domain check, fall through — never coerce.**
  A zero divisor is not a slow estimate, and the rung must reflect that the
  input was not there.
- **When a correction is applied, promote only the modelled rows.** A measured
  value keeps its rung; nothing fitted to formula error may relabel it.

## When not to use this

- **When only one producer can ever fill the field.** A field written by
  exactly one measurement path carries its provenance in its name, and a rung
  column with one possible value trains readers to ignore rung columns.
- **As a substitute for the ladder's bottom rung.** Provenance annotates a
  value that exists. It says nothing useful when there is no value, and a rung
  attached to a fabricated placeholder is worse than no rung at all.
- **As a quality score.** The rung ranks *kinds of evidence*, not accuracy. A
  carefully modelled figure can beat a careless measurement, and a system that
  sorts by rung as though it were error magnitude will eventually be
  embarrassed by a rung-1 number taken while the machine was busy.
