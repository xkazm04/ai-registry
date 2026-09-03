---
layer: technique
type: technique
subject: model-routing
technique: failover-path-liveness
status: forged
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [a failover path has never run in production, proving a fallback route works before the incident that needs it, a degraded path that only executes when the primary is down, deciding whether an unused fallback is healthy or broken]
---

# Failover path liveness

A failover path has a property no other code path has: **it runs only when
something else is broken.** In steady state it executes zero times, which means
the moment it first executes is simultaneously the moment of highest stakes and
the moment of least evidence that it works. Every other path in a system is
tested by being used. This one is tested by an incident.

The subject already decides *when* to fail over — the horizon that detects a
failure, the floors a substitute must clear, the policy that governs the
transition. All of that is a description of a mechanism nobody has watched run.

## Zero traffic is not evidence, and it is not the same evidence twice

The instinct is to read the substitute's traffic share as the health signal,
because that number already exists wherever degradation is instrumented. It does
not carry here, and the reason is worth stating precisely because the same
number means opposite things for two kinds of fallback.

A fallback that closes a **capability gap** — the substitute runs whenever some
caller needs a thing the primary cannot do — has an ambient trigger. Its traffic
share is a real measurement, a share falling to zero means the gap closed, and
the correct response is to retire the path.

A fallback that answers an **incident** has an exceptional trigger. Its traffic
share is zero for the same reason a fire alarm is silent: nothing has gone
wrong. A share of zero says the primary has been healthy, and it says nothing
whatever about whether the path works. Reading it as a retirement signal deletes
the safety net on the grounds that there has not been a fire.

So the first rule is a classification, made once, at the construction site:
**say which trigger a fallback has**, and let that decide whether its usage
number is evidence about the fallback at all.

## Organic exercise is real, and it withdraws at the worst moment

Where a router explores — sending a small share of live traffic to candidates it
is uncertain about — the failover target is exercised as a side effect, and that
covers the naive version of this problem. Two limits remain, and both are
properties of exploration rather than accidents of a particular implementation.

- **Exploration is throttled by health.** Any responsible exploration policy
  suspends when the healthy-candidate pool is thin, because spending an already
  degraded budget on uncertain candidates is how a brownout becomes an outage.
  That is correct, and it means the mechanism keeping the failover path warm
  switches itself off during precisely the conditions in which the failover path
  is about to be needed.
- **Exploration exercises a destination, not a transition.** It proves a
  candidate can serve a request. The failover path is longer than that: detect
  the failure, classify it, name the implicated scope, exclude it, re-draw, and
  serve. Exploration enters that chain at the last step. The detection and the
  exclusion — the parts most likely to be wrong, because they are the parts
  written against failure shapes nobody has seen — are never touched.

## Inject the failure, on a bounded window, at a stated rate

The instrument that closes the gap is deliberate fault injection against the
live path, and the reason it is affordable here is specific: the failures a
routing layer must survive are **client-observable and client-forgeable**. A
truncated response, a malformed structure, a response in a dialect no parser
accepts, a hostile latency, a refusal — every one can be synthesized at the
client boundary without the provider's cooperation and without a test
environment that mimics a provider badly.

Fault injection in production is a live-traffic instrument, so it is configured
as a **blast radius rather than a switch**, and the three bounds are
independent because they fail independently:

- a **window** — when injection may occur at all, so it never runs unattended
  during a change freeze or an existing incident;
- a **rate ceiling** — the share of eligible calls affected, low enough that the
  injected failure is inside the error budget the system already tolerates;
- an **enabled class set** — which failure shapes are being exercised, because
  the point is to test one detector at a time and a run injecting everything
  tells you only that something broke.

Construct it fail-closed: a configuration with injection enabled and no class
selected, or a rate outside its permitted band, is a misconfiguration rather
than a no-op. An injector that silently does nothing is worse than an absent
one, because it produces a green result nobody earned
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

Two disciplines make the results trustworthy:

- **Never degrade a call that is already failing.** Before injecting, check
  whether the response is already bad; if it is, pass it through untouched.
  Otherwise one real failure is counted as two, and the injected rate stops
  matching the observed rate.
- **Injection is an experiment with a stated expectation.** Write down what the
  detector should do before the run, and treat a *silent success* — the call
  succeeded, the detector never fired — as the finding. A detector that does not
  fire on a synthesized instance of its own failure class is not a detector.

## What must be exercised is the transition, not the destination

Aim the injection at the chain rather than at the endpoint. The claim being
tested is: *given this failure shape, the system detects it, attributes it to
the right scope, excludes that scope, and re-draws to something that serves.*
Assert each step, not just the final response. A failover that produced a good
answer by accident — because the retry happened to hit a healthy instance
before any classification ran — passes an end-to-end check and proves nothing
about the mechanism.

Where a class of failure genuinely cannot be injected against the live path, the
weaker instrument is to **withhold the primary** in a non-production run and
confirm the path executes. Say which of the two a given class gets; a
capability-floor recheck triggered on roster change and a degraded path
exercised against a test store are both real instruments, and both are
event-triggered against non-production, which is a different and lesser claim
than continuous exercise against live traffic.

## Decision rules

- Classify every fallback's trigger as ambient or exceptional at its
  construction site, and never read an exceptional fallback's usage share as
  evidence about its health.
- Do not retire an incident-triggered fallback on zero traffic; retire it when
  the failure it answers becomes impossible, and say what makes it impossible.
- Bound injection by window, rate ceiling and enabled class set; construct
  fail-closed when any is missing.
- Pass through a call that is already failing rather than injecting into it.
- Assert the transition — detect, attribute, exclude, re-draw — not only the
  final response.
- Record the expectation before the run and treat a non-firing detector as the
  result, not as a clean run.
- Where a class cannot be injected live, withhold the primary off-line and say
  in the record that the claim is the weaker one.

## What this technique does not own

Which failure shapes a router must detect, and the horizon over which it decides
to move, are [failover-horizon](./failover-horizon.md) — its taxonomy is the
input here, and this technique adds no failure classes of its own. What a
substitute must be able to do before it is eligible is
[capability-floors](./capability-floors.md). Deciding a fallback has outlived the
gap it closed is the resilience subject's retirement condition; this technique
supplies only the discriminator that says when that condition's usage signal
applies. Randomized fault injection inside a test suite, and the quiet period a
recovery assertion needs, belong to the test-input subject and are a different
instrument aimed at a different claim.
