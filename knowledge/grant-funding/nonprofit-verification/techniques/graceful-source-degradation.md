---
layer: technique
type: technique
subject: nonprofit-verification
technique: graceful-source-degradation
status: forged
laws: [honest-null-over-forced-guess, clean-is-not-ready]
shared_with: []
use_when: [a registry source is flaky, credential-gated, or not yet built for a jurisdiction, deciding what to cache when an upstream returns a partial payload, a verification verdict must stay honest while its check roster is incomplete]
---

# Graceful source degradation

A verification pipeline lives on other people's registries, and other
people's registries misbehave: they rate-limit, time out, return partial
payloads, require credentials the deployment may not have, or simply do not
exist yet for a jurisdiction the product already serves. The technique is
the set of rules that keep the *verdict honest while the roster degrades* —
every declared check visible, every gap explicit, and no failure of
infrastructure ever laundered into a statement about the applicant.

## The degradation ladder

Order the states a source can be in, and give each an explicit, visible
representation:

1. **Built and healthy** — real outcomes.
2. **Built but unconfigured** — the adapter exists but its credential or
   endpoint is absent in this deployment. The source still appears in the
   roster, env-gated out of the *built* set and into an explicit
   "unavailable here" inconclusive. It never silently vanishes.
3. **Declared but unbuilt** — the jurisdiction's profile names the source;
   no adapter exists. The registry of adapters returns a uniform
   not-implemented adapter that yields an inconclusive saying so — "coming
   soon" as a first-class result, never a fake pass and never a gap the
   verdict quietly closes over.
4. **Built but currently failing** — network error, timeout, unparseable
   body. An inconclusive with the failure named, and *not cached*.

The invariant across all four: the set of sources in the result equals the
set of sources the jurisdiction declares. A verdict computed over a
silently shrunken roster is the "clean is not ready" defect in verification
clothing — three greens presented as if they were five.

## Partial payloads: the hardest case

The genuinely difficult upstream behavior is the *plausible partial
response*: a well-formed success status whose body is missing the fields
that decide. It is indistinguishable from a sparse-but-genuine record, and
both optimistic and pessimistic guesses are wrong — optimism mints a
verified badge for an unconfirmed entity, pessimism records a legitimate
organization as defunct. The rules:

- **A response missing every decisive field is a retryable error, not a
  verdict.** Classify it inconclusive and, critically, *do not cache it* —
  caching converts a five-second upstream hiccup into a full cache-lifetime
  of a false answer served with confidence.
- **When some decisive fields are present, degrade downward only.** An
  entity that is found but whose registration states are empty or
  unrecognized is "not confirmed active" — a determinate non-pass — never
  promoted to active because the record superficially exists. The
  asymmetry is deliberate: a false verified badge is the costlier lie.
- **Parse defensively for structure drift.** Registries reshape payloads
  without notice — a field that is normally a flat map arrives nested, and
  a shallow extraction silently reads "no states" from a record that
  contains an active one. Walk for the values you need rather than
  assuming the happy-path shape, and let the drift widen what you *find*,
  never what you *assume*.

## Decision rules

- **When adding a deployment-optional source, gate it on its credential's
  presence at the registry-of-adapters level, not inside the adapter,
  because** the roster is where "which checks exist here" must be readable
  in one place, and an adapter that half-runs without its key produces
  ambiguous failures.
- **When a source is down, keep the run going: fan out in parallel, let
  each adapter fail independently, and aggregate whatever decided,
  because** one registry's outage must not black-hole the four that
  answered — the outcome model already knows how to carry the gap.
- **When choosing cache lifetimes, cache decided outcomes briefly (registry
  facts move slowly but revocations matter) and cache errors not at all;
  when offering a manual re-check, let it bypass the cache, because** the
  user staring at a stale negative needs a path that provably re-asks.
- **When the inconclusive rate for a source rises above its baseline, page
  a human, because** graceful degradation without monitoring is how a
  parser broken by upstream drift runs quietly for a month while every
  verdict weakens.

## When not to use

Degradation is for *sources*, not for the verdict's core: the aggregation
rule (at least one pass, zero fails, no name mismatch) never relaxes to
compensate for a thin roster — a jurisdiction where nothing could run yields
"could not verify", not a lowered bar. And do not use the not-implemented
placeholder as a permanent parking spot: a source that has been "coming
soon" across releases is either worth building or worth removing from the
jurisdiction's declaration, because a roster padded with perpetual greys
teaches users to ignore exactly the state that is supposed to mean
"attention needed".
