---
layer: technique
type: technique
subject: model-routing
technique: admission-is-not-a-tier
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
shared_with: []
use_when: [evaluating a substitute that is cheaper or free but speaks a different dialect, a benchmark says a candidate is good enough and the client still cannot use it, adding a self-hosted or borrowed endpoint to a roster the client reads, deciding why a fallback never appears in the picker despite being healthy]
---

# Admission is not a tier

[capability-floors](./capability-floors.md) asks how good a substitute has to be,
and answers with an ordinal: a tier, below which the capability breaks. That
question presumes the client can address the candidate at all. **A second gate
sits in front of it, and it is not ordinal.** Either the client speaks the
candidate's protocol, resolves its identifier, and tolerates its transport
behaviour, or the candidate is unreachable — and a larger, stronger, more
expensive model is unreachable in exactly the same way. No amount of capability
crosses this line, which is why it cannot be expressed as a floor.

The distinction matters because the two gates are measured by different
instruments and only one of them is usually measured at all. Capability is
measured by running the candidate. Admission is a property of the *contract
between the client and the candidate*, and running the candidate is precisely
the observation that cannot see it: a bench harness written against the
candidate's own dialect will report an excellent score for an endpoint the real
client will never successfully call. That is [gate-sees-target](../../../../_laws.md#gate-sees-target)
in its most expensive form — the check passes over a proxy, and the proxy
diverges from the target exactly where the gate was needed.

## The three surfaces admission is decided on

- **The wire format.** A client implements a fixed, small set of request
  formats, and "exposes an API" is not one of them. Two endpoints that both
  serve language-model completions over HTTP, both documented as compatible with
  *something*, can be mutually unreachable: different paths, a different message
  model, a different notion of a turn, a different streaming envelope. The
  candidate's compatibility claim names the dialect it imitates, never the
  dialect the client sends.
- **The identifier.** Where a client discovers a roster rather than being told
  one, it filters that roster, and the filter is usually a crude predicate over
  the identifier string rather than a capability query. A candidate whose name
  does not match the predicate is dropped before anything about it is evaluated.
  This is the surface teams discover last, because a dropped candidate produces
  no error anywhere — it simply is not offered.
- **The transport's liveness contract.** Clients that stream commonly enforce a
  silence budget: a connection that produces no bytes for some interval is
  abandoned. A candidate that pauses longer than that budget — loading weights
  on first call, queueing behind another tenant, thinking without emitting — is
  not slow to such a client. It is failed, and it is failed after the request
  was accepted, which puts it on the far side of the
  [failover horizon](./failover-horizon.md).

## The inversion: an unrecognized candidate receives the largest request

The intuition is that a client meeting an unfamiliar backend will be
conservative with it, and the intuition is backwards. A client cannot
distinguish *older and weaker* from *newer than my release*, and the safe
default for the second reading is to send everything: the reasoning-control
field, the structured-output configuration, the context-management directives,
the cache markers. An identifier the client does not recognize therefore selects
the **maximal** request shape, because the client assumes it is talking to
something at least as capable as what it knows.

The consequence is the opposite of the one a roster designer plans for: the
weakest, cheapest, most improvised substitute on the roster is the one that
receives the most demanding request body, while the well-known primary — whose
capabilities are in the client's own tables — receives a request trimmed to what
it is known to accept. A substitute is therefore most likely to fail on the
fields that have nothing to do with the answer, and the failure arrives as a
rejection of a field nobody chose to send.

The operating consequence: **declare the substitute's identity to the client
rather than letting the client infer it.** Where the client offers a way to map
an unfamiliar identifier onto a known capability profile, or to state the real
context window, or to suppress pre-release fields, those declarations are not
tuning. They are the difference between a request the substitute can parse and
one it rejects, and they belong in the same record as the floor.

## Loud admission failures are the cheap half

Admission failures split by whether the client learns anything, and the split
does not follow severity:

- **Loud** — a rejected body field, an unroutable path, an authentication scheme
  the candidate does not implement. These produce a hard error naming the field
  or the path. They cost one debugging session and are then permanently fixed.
- **Silent** — and these are the ones that survive into the incident the
  fallback existed for:
  - the candidate is filtered out of the discovered roster, so it is never
    offered and never tried;
  - cache markers are dropped in translation, so every turn bills as uncached
    and the only symptom is a cost curve nobody is watching during an outage;
  - the silence budget expires mid-answer, which is reported as a stall rather
    than as an incompatibility, and sends the operator to investigate load;
  - a translating shim swallows a field it does not understand, and the request
    succeeds having quietly discarded the constraint the caller depended on.

Every silent form is the shape [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
forbids, displaced from the response into the admission path. The rule that
follows: **an admission check reports which surface refused, or it has not run.**
A substitute that "did not work" without naming the wire format, the identifier
or the liveness contract has produced a verdict nobody can act on, and the next
run re-derives it.

## Translation is a component with an owner, not a configuration line

Where the client and the candidate do not share a dialect, something has to
translate, and the distance between "point it at this URL" and a working
substitute is the whole of that component. It is the escape-hatch case that
[adapter-direction-asymmetry](../../../../backend-platform/resilience/multi-provider-gateway-plane/techniques/adapter-direction-asymmetry.md)
describes from the plane's side: a request shape differing by more than names
and bounds is structural, and a parameter table cannot express it.

Two things follow for a roster that includes such a candidate. The translator is
**on the failover path**, so it inherits every obligation
[failover-path-liveness](./failover-path-liveness.md) places there — it has
never run in production either, and it is newer and less reviewed than anything
it sits in front of. And its fidelity is a **capability of the substitute**, not
of the shim: a translator that discards the reasoning-control field has produced
a candidate that cannot reason on demand, whatever the model behind it could
have done. Record what the translation drops, beside the floor, because that
list is the substitute's real capability profile.

## Decision rules

- **Ask the admission question before commissioning the benchmark.** It is
  answerable from two documents in minutes and it is the one that disqualifies;
  a capability measurement bought first is wasted whenever the answer is no.
- **A compatibility claim names an imitated dialect, never a client.** Check the
  client's own list of accepted formats, and treat "compatible" without a named
  target as unverified.
- **Declare an unfamiliar candidate's identity and limits to the client**, or
  accept that it will be sent the maximal request shape.
- **Record which surface refused.** Wire format, identifier, or liveness
  contract — a bare "it did not work" is not a result.
- **Count a translator as part of the substitute.** What it drops is what the
  substitute cannot do, and it is on the failover path with everything that
  implies.
- **A vendor's statement that a configuration is unsupported is an admission
  fact, not a capability one.** It predicts that the contract will move without
  regard for the substitute, which makes the translator's maintenance cost a
  standing charge rather than a one-off.

## What this technique does not own

How good the substitute must be once it is reachable is
[capability-floors](./capability-floors.md). Whether the transition to it has
ever been exercised is [failover-path-liveness](./failover-path-liveness.md).
Which failure shapes the router must detect, and when substitution stops being
free, are [failover-horizon](./failover-horizon.md). This technique owns only
the prior question — whether the client and the candidate can transact at all —
and it adds no failure classes to that taxonomy.
