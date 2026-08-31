---
layer: technique
type: technique
subject: model-routing
technique: quality-axis-separation
status: forged
laws:
  - unknown-is-not-a-value
  - count-carries-predicate
  - failure-not-empty-success
shared_with: []
use_when: [feeding request outcomes back into candidate ranking, a provider ranks well on transport and badly on answers, deciding what a clean response proves about a candidate]
---

# Two quality axes, and only one of them is free

[candidate-ranking](./candidate-ranking.md) orders the surviving candidates
from live measurement, and one of its terms is how *good* a candidate has been.
That term is where a routing layer quietly decides what "good" means, and the
default answer is the one the request path can compute for free: the call
returned, so the candidate worked. Every reliability estimator built on
successes-over-attempts inherits that definition without stating it.

It is a definition about **transport**. It says the endpoint accepted the
request, stayed connected, and produced a well-formed response — real
information, worth ranking on, and the only kind of information the hot path
can produce without paying for a second opinion. What it cannot say is whether
the answer was any good, and this subject's own opening insists on why that
gap matters: **a mis-route does not error, it produces a plausible answer.** A
ranking layer that scores candidates on transport and calls the result
"quality" is measuring the one axis on which a bad route is indistinguishable
from a good one.

So the layer carries two axes, and their difference is not a matter of degree:

- **The operational axis** is derived from the request path, at no extra cost,
  for every call. It is always available and it is always a fact.
- **The semantic axis** is the value of what was generated. It cannot be
  derived from the request path at any price, because nothing on that path
  read the answer. It exists only when something judged it.

Collapsing them produces the specific pathology this technique exists to
prevent: a provider that reliably returns fast, well-formed, mediocre answers
outranks one that returns slower, better ones, and the ranking is *working
correctly* — it was never given the term that would separate them.

## What the operational axis may contain

Everything the hot path can observe about the exchange, and nothing about the
content's worth:

- Transport and status outcomes: refusals, upstream errors, connection
  failures, rate-limit responses.
- Timing: latency and time-to-first-token, held as decayed estimates rather
  than raw last-values.
- Stream integrity: interruptions, aborts, and truncations before a clean
  finish.
- **The unusable successes.** A clean status whose answer cannot serve the
  caller — an empty completion, an output stopped at the cap mid-value,
  structure requested and prose returned — is an *operational* fact, not a
  semantic judgement: no evaluator was needed to notice it, and the request
  path detected it directly. [failover-horizon](./failover-horizon.md) owns
  catching these in time to substitute on the current call; this technique
  owns the other half of their value, which is that they are the strongest
  operational evidence the hot path produces and the part a status-shaped
  estimator throws away
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
  a call that returned nothing usable must not be recorded as a success).

The discipline that makes this axis honest is that a 200 is the *weakest*
member of the list, not the definition of the list. An estimator that treats
the status code as the outcome has one signal; one that treats the status code
as one signal among the above has a usable one.

## What the semantic axis may contain: nothing, until something judged it

The semantic axis is written by exactly one kind of writer — an evaluator that
actually examined the output. A deterministic checker, a model judge, a
downstream acceptance signal, a human verdict. Until one of those has spoken
for a given candidate, the axis holds **no value**, and "no value" is a state
the ranking must be able to represent
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Three rules keep it that way, and each one closes a hole through which a
manufactured number arrives:

- **Never default it to a number.** An unjudged candidate scored zero is
  ranked as if it were judged and found worthless; scored one, as if judged and
  found excellent; scored at the midpoint, as if judged and found average —
  which is the most dangerous of the three, because it looks like neutrality
  and behaves like evidence. Absent is its own state, and a candidate with no
  semantic evidence is ranked on its operational term alone.
- **Never let the operational axis write it.** The failure has a specific
  shape: an implementation computes an operational score, stores it in the
  field the ranking reads as "quality", and an evaluator later writes the same
  field. From then on nobody can tell which calls were judged, the evaluator's
  verdicts are diluted by transport statistics, and disabling the evaluator
  silently leaves a populated field behind that still reads as judgement. Two
  fields, two writers, one direction each.
- **The verdict carries its own predicate**
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  what judged it, over how many samples, on what slice of traffic, and when.
  A semantic score over eleven judged calls and one over eleven thousand are
  different claims, and the second axis is precisely where sample counts are
  smallest, because judging costs something.

## The evaluator is a sink, not a dependency

Because the semantic axis is optional by construction, the layer that produces
it attaches through a seam rather than sitting in the request path. The routing
layer emits a typed outcome record per completed call; whatever wants to judge
subscribes to that stream, judges asynchronously, and writes verdicts back
through a narrow interface.

- **Nothing judged synchronously.** An evaluator on the request path adds its
  latency and its failure modes to every call, in order to improve calls that
  have not happened yet. The feedback loop is inherently asynchronous — the
  verdict informs *future* routing — so nothing is lost by treating it that way
  and a whole failure class is avoided.
- **The layer must route correctly with the evaluator absent.** Not degrade
  gracefully — route correctly, on the operational axis, with the semantic term
  simply not present. An evaluator that goes down, is not configured, or is
  removed changes what the ranking knows, never whether it works.
- **The outcome record is typed and separate from the notification channel.**
  Systems reaching this point usually already have an event bus — one carrying
  named events with opaque payloads for interface consumers. Reusing it means
  the feedback consumers parse untyped payloads shaped for a different reader.
  A routing outcome is a struct with a known shape and a small set of
  subscribers; it is worth its own channel.
- **The sink never backpressures the request path.** Recording an outcome is an
  in-memory, constant-time operation, and any sink that transports data
  elsewhere buffers with a bound and drops the oldest under overload, counting
  the drops. A telemetry path that can slow the data plane will do so during
  the incident it was installed to observe — and a dropped-event counter is
  itself a number that must carry its predicate, or a quiet exporter is
  indistinguishable from a quiet system.

## The semantic axis prefers, it does not exclude

Both axes feed the ranking as *terms*, under the discipline
[candidate-ranking](./candidate-ranking.md) already sets: they are
commensurable contributions to a bounded score, never gates. A candidate that
judges badly is de-preferenced and recovers as its evidence improves. Hard
exclusion remains where it already lives — policy, capability floors, quota
exhaustion, authentication failure, an open breaker — and none of those consult
either quality axis. The reason is the estimator's own weakness: a semantic
score is drawn from a small, expensive, possibly stale sample, and letting a
term that thin remove a candidate from eligibility means one bad judged
afternoon retires an endpoint that nothing else objected to.
