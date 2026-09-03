---
layer: technique
type: technique
subject: modelled-performance-estimates
technique: refuse-rather-than-emit-a-sentinel
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [an estimate's required input is unavailable, choosing a placeholder for a number that could not be computed, deciding whether a configuration is unsupported or merely un-estimated, a missing estimate is being sorted or thresholded as though it were a value]
---

# Refuse rather than emit a sentinel

When an estimate cannot be produced, the field is **absent**. Not zero, not
minus one, not the previous value, not a plausible default computed from a
neighbouring configuration. This is
[unknown is not a value](../../../../_laws.md#unknown-is-not-a-value) applied
at the exact boundary where it is most often violated — an optional result
meeting a non-optional field — and the technique does not re-derive the law.
What it adds is the **domain test** that says whether a sentinel was ever
available, and the answer for performance quantities is no.

## The domain test

A sentinel is safe if and only if it lies **outside every value the measured
domain can take**. That is the whole test, and it is why sentinels work in
some domains and are catastrophic in this one.

An identifier space can spare a zero, because no real record has that
identifier. A percentage of a whole can sometimes spare a negative, because no
real share is below nothing. A performance quantity can spare **nothing**:
zero is a legitimate reading for a rate that stalled, sizes and durations are
non-negative by definition, and there is no value in the range that a real
measurement could not also produce. Every candidate sentinel is therefore
*inside* the domain, and being inside the domain is not a cosmetic problem —
it is a functional one:

- **A sort ranks the un-estimated configuration as the worst one.** A zero
  rate sorts last; a zero size sorts first. Either way the absent estimate has
  acquired a position it did not earn.
- **A threshold excludes or includes it silently.** "Show anything above ten"
  drops every un-estimated row without saying so, and the reader concludes the
  rows do not exist rather than that they were not estimated.
- **An aggregate absorbs it.** A mean over a column where a third of the
  entries are sentinel zeros is not a mean of anything, and it will be
  reported to two decimal places.
- **A chart draws it at the floor.** Which reads as a measured catastrophe,
  and is the most persuasive lie in the set.

So: **where the domain has no free value, the field is nullable.** A nullable
field is a modest cost paid at every read site, in exchange for the guarantee
that no read site can silently mistake absence for a reading. Where absence
must be distinguished from several *kinds* of absence, the field carries a
variant rather than a null — see the two states below.

Note what the test does *not* say. It does not say "use null everywhere". If
the domain genuinely has an unreachable value and it is documented as the
sentinel and validated at the one door values enter through, a sentinel is
fine and cheaper. The failure is choosing a sentinel without running the test,
which in practice means choosing zero because it is what the type initialises
to.

## Unsupported and missing input are two states

Absence has two causes and they license opposite behaviour:

**Unsupported** — the model structurally cannot represent this configuration.
There is no formula for this shape of system; supplying more inputs will not
produce one. The remedy is to extend the model, and until somebody does, the
answer will not change.

**Missing input** — the formula exists and one value it needs is unavailable:
the machine did not report it, the catalogue does not carry it, the detection
step could not see it. The remedy is to go and obtain the value, and the
answer changes the moment somebody does.

The subtler entrance to *unsupported* is a **regime** boundary rather than a
missing formula. A model is valid inside one bottleneck regime, and the
question that falls outside it has no fallback model to degrade to — a figure
derived from how fast data moves is not a worse answer for a phase limited by
arithmetic, it is an answer to a different question. That is the case where
refusal is most tempting to skip, because a number is trivially computable and
would be *indistinguishable from a measurement* once printed. Check the regime
before the formula runs, and report unsupported rather than a plausible
figure.

Collapsing them is expensive in both directions. Reported as unsupported, a
missing input becomes a closed question and the one cheap fix is never done.
Reported as missing input, an unsupported configuration generates a permanent
backlog item that nobody can close, and eventually a defaulted value invented
to make the message go away. Emit them as different states, name the missing
input in the second, and the operator's next action is unambiguous in both
cases.

## The absence must survive downstream

Refusing at the computation site is the easy half. The absence then crosses a
serialization boundary, a schema, a template, an export, an aggregation and a
chart, and **every one of those is an opportunity to coerce it back into a
number**. The commonest three, in order of frequency:

1. **A serializer that omits nothing.** A format that cannot express absence,
   or a writer configured to fill defaults, turns the null into a zero on its
   way out. Assert this at the wire boundary with a test, not by reading the
   configuration.
2. **A read site that defaults.** Any unwrap-or-zero on the read path
   destroys the distinction permanently, and it is invisible in review because
   it looks like caution.
3. **A template that formats whatever it is handed.** An absent value renders
   as an empty cell, which is honest, or as "0", which is not, depending on a
   detail in the formatting layer that nobody owns.

The structural defence is to make the absent state **unformattable**: a
distinct variant that a numeric formatter cannot accept, so the compiler or
the template engine raises the question at every site rather than answering it
silently. That is a [classified outcome reaching every boundary that acts on
it](../../../../_laws.md#verdict-survives-boundary) — an absence erased into a
zero at the first hop has not survived, no matter how carefully it was
constructed upstream.

## The same refusal applies to derived labels, not just numbers

The rule generalises past the numeric field, and a system that applies it only
to numbers leaks in the places nobody instrumented. Two recurring cases:

**A derived label that cannot be derived yields nothing.** A size band, a
tier, a category computed from a value that is itself missing must be absent,
not the band a zero would fall into. A configuration whose parameters are
unknown is not "the smallest one".

**A lookup that cannot be resolved yields nothing, never an invented key.**
When an identifier's shape says it belongs to a different namespace than the
one the mapping covers, the honest output is no mapping — not a constructed
key that looks plausible, resolves to nothing, and sends the next reader to
investigate a resource that never existed. Fabricating a well-formed
identifier is the most durable of these errors because it survives every
schema check.

## Decision rules

- **When choosing a sentinel, run the domain test first.** If a real
  measurement can produce the candidate, there is no sentinel and the field is
  nullable.
- **When the input is unavailable, emit no estimate and name the input.** The
  name is the entire actionable content of the refusal.
- **When the model cannot represent the configuration, say unsupported and
  stop.** Do not report it as a missing input; there is no input that fixes
  it.
- **When a field must exist in the wire format, make its empty state a
  variant, not a number.** A variant cannot be averaged, sorted, or formatted
  by accident.
- **When sorting or thresholding, exclude the absent rather than placing
  them.** They are not at either end of the ranking; they are not in it.
- **When a derived label's input is absent, the label is absent.** Deriving
  from a default propagates the fabrication into a field that no longer looks
  numeric.

## When not to use this

- **Where absence is genuinely impossible.** A value the system always
  computes needs no absent state, and a nullable field that is never null
  costs every reader a branch for nothing.
- **As a reason to publish nothing.** Refusal applies per field. An estimate
  that could not compute one component still publishes the components it
  could, with the missing one absent — collapsing the whole record to nothing
  because one part failed throws away evidence the operator has.
- **In place of a bound.** When the model can produce a defensible ceiling, a
  labelled ceiling beats an absence: the reader can act on "no faster than
  this", and cannot act on silence. Refuse when there is no defensible value,
  not when the value is merely imprecise.
- **On a categorical verdict whose vocabulary has a free conservative
  value.** The domain test is the whole rule, and a closed set of tiers often
  passes it where a rate cannot: if the bottom tier means "we cannot claim
  this works", an unsizable input can honestly resolve to it, because that
  tier is a statement nobody will mistake for a measurement. Take the
  conservative tier there rather than an absence, and see
  [the verdict technique](./one-ratio-then-a-capability-cap.md) for the
  direction the conservatism has to point.
