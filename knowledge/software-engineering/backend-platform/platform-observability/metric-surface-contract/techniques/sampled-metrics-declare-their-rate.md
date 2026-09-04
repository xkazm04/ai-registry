---
layer: technique
type: technique
subject: metric-surface-contract
technique: sampled-metrics-declare-their-rate
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [an observation costs more than it informs at full volume, publishing a sampled count or distribution, designing per-unit internal metrics]
---

# Sampled metrics declare their rate

Some quantities are worth knowing and unaffordable to observe on every
occurrence: the residency of every unit in a cache, the lifetime of every
object in a pool, a distribution over every internal item a busy system
touches. The two reflexive answers are both losses. Instrumenting everything
adds a per-unit tax to a path that handles units at machine rates. Dropping
the metric leaves a class of operational question — *is this store stranded or
churning?* — answerable only by guessing.

The third answer treats the cost as a **knob with a published position**:
observe a stated fraction of occurrences, let the operator choose the
fraction, and put the fraction on the exported surface. Note the difference
from budgeting an in-process instrument's overhead against its host: that
question is about what the probe costs the process. **This one is about what
the sample rate obliges the exporter to tell the outside world**, because the
consumer of a sampled series is downstream, has no access to the
configuration, and will otherwise read the number as an absolute.

## Why the declaration is the technique

A sampled count is an estimate scaled by a factor the consumer cannot see. Its
failure is not noise — noise is honest and visible — but a **confident value
that is wrong by exactly that factor**, with no signal anywhere in the data
that a factor exists. Every downstream use inherits the error silently: a
capacity model sized off a tenth of the traffic, an alert threshold tuned
against a rate that changes when an operator turns the knob, a comparison
between two instances that were sampling differently. The rate is part of the
number's predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); a
sampled value published without it renders a guess as a fact
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## The procedure

1. **Measure the full-rate cost before deciding to sample.** Sampling adds a
   branch and a decision to the fast path; if the observation was affordable,
   sampling has made the surface harder to read for nothing.
2. **Make the rate an operator setting, and prefer a low default-on rate over
   default-off.** This is the tension worth resolving deliberately rather than
   by reflex: a metric that must be switched on is, in practice, of very
   limited use, because it is absent during the incident that would have
   justified it and nobody enables it in production speculatively. Sampling
   exists precisely to buy the right to be on by default — a single-digit
   percentage costs almost nothing and answers the question when it is asked.
   Default-off remains legitimate for a family that is expensive even sampled,
   or whose observation touches something risky; when you choose it, know that
   you have chosen an instrument that will be off the first time it matters.
3. **Sample the *unit*, not the observation.** Decide once, when a unit is
   created, whether it is observed, and carry the decision with it. Sampling
   each event independently gives a distribution whose start and end
   observations belong to different populations, which is how a "lifetime"
   histogram ends up with lifetimes that were never lived.
4. **Publish the rate on the surface.** In descending order of preference: the
   rate as its own exported value alongside the family; the rate in the
   metric's description; the rate in the operator documentation, as a last
   resort. It is never only in a configuration file, because the consumer does
   not have the configuration file.
5. **Scale nothing on the way out.** Export the observed counts as observed,
   and let the consumer multiply by the declared rate if it wants an estimate.
   An exporter that pre-multiplies has published a synthesised number that
   looks measured, and has destroyed the only signal of how many observations
   backed it.
6. **Say how many samples the number rests on.** A distribution over twelve
   samples and one over twelve million are not comparable claims; the count of
   observations is part of the family.
7. **Declare every other truncation the same way.** Sampling is rarely the
   only bound: a per-unit history kept in a small fixed buffer means the
   distribution covers only the most recent few observations per unit, which
   is a second, independent restriction on the population. If the description
   says "sampled" but not "and only the last few accesses per unit", the
   consumer has been told about one bound and not the other — and the one it
   was not told about is the one that changes the shape of the tail.

## Design the family, not the metric

The single sampled number is usually too weak to act on. The value comes from
a small set of distributions, chosen so that reading them **together** answers
a question no one of them answers alone. The canonical example for a cache or
a pool is three:

- **total lifetime** of a unit, from creation to release;
- **idle time before reclamation** — how long the unit sat unused before it
  was evicted;
- **the reuse gap** — the interval between successive uses of a unit that was
  reused.

Individually, each is a curiosity. Together they separate two states that look
identical from the outside and demand opposite responses: a store that is
*stranded* (long lifetimes, long idle times, few reuses — the capacity is held
by things nobody will ask for again) from one that is *churning* (short
lifetimes, short reuse gaps, evictions of units that were about to be used —
the capacity is too small). Design the set against the decision it must
support, and export it as a set.

## Decision rules

- **When the observation cost per occurrence exceeds a stated fraction of the
  operation it observes, sample.** Below that, do not — an unnecessary sample
  rate is a permanent caveat on the number.
- **When a sampled value is compared across instances, the rate must be equal
  or the comparison must divide it out.** Publish the rate per instance for
  exactly this reason.
- **When the rate changes at runtime, the change is visible in the exported
  rate value at the same moment.** A rate published only at startup is wrong
  precisely when someone has just intervened.
- **When a consumer needs an absolute, it multiplies — and the surface says
  the result is an estimate.** The exporter's job ends at supplying honest
  terms.

## When not to use this

- **A quantity that is cheap at full volume.** Counting is nearly free; do not
  sample a counter to look rigorous.
- **A quantity where the tail is the point and the tail is rare.** Uniform
  sampling erases exactly the rare events that matter; either observe them all
  (they are rare, so it is affordable) or use a scheme that biases toward
  them — and then declare *that*, which is a harder predicate to state and
  easier to get wrong.
- **Anything feeding an exact obligation** — billing, quota enforcement, an
  audited count. Estimates cannot back a claim that must be exactly right, and
  no declaration of the rate makes them able to.
