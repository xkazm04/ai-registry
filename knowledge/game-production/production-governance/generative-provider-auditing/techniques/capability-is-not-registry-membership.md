---
layer: technique
type: technique
subject: generative-provider-auditing
technique: capability-is-not-registry-membership
status: forged
laws: [one-authority-per-quantity, no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [registering a generative provider in a pipeline, a provider supports more kinds than you validated, deciding whether output may ship commercially]
---

# Capability is not registry membership

## The concern

A provider's **capability** is what its service can technically produce. Its **registry
membership** is the set of asset kinds your system is authorised to route to it. These
are different sets, and the second is always smaller. Conflating them is the mechanism by
which a pipeline silently begins using a provider for a kind of work nobody validated:
someone adds a new content kind, the provider happens to accept the request, the output
looks plausible, and a class enters the build with no benchmark, no budget check, and
possibly no licence to ship it.

The provider's own documentation is a capability claim made by the party selling the
capability. It is an input to your decision. It is never the decision.

## Procedure

1. **Declare membership explicitly per provider**: the list of kinds this provider is
   registered to serve. A kind absent from the list is not served, regardless of what the
   service accepts.
2. **For every kind the provider could plausibly be asked for and is not registered to
   serve, record the reason** alongside the list. Reasons fall into a small set:
   unbenchmarked, benchmarked and rejected with numbers, licence forbids the intended
   use, or quality is adequate but a systems constraint rules it out.
3. **Gate every dispatch on membership, not on the provider's acceptance.** The check
   happens in your code before the request leaves; a provider returning an error for an
   unsupported kind is a fallback, not the gate.
4. **Give licence terms first-class standing in the membership record**, declared only
   for kinds that are actually served. Whether the output may be redistributed in a
   commercial product, and what provenance disclosure it obliges, decides membership as
   firmly as any quality number. A kind with no declared term renders as *licence not
   declared*, never as permitted.
5. **Enforce membership at the dispatch site as well as at the entry point.** The caller
   is refused first, but the provider adapter re-checks before it builds a request, so a
   direct caller cannot slip an unregistered kind past the outer gate.
6. **Re-derive membership when a provider adds capability.** A new kind appearing in the
   provider's catalogue changes nothing about your registry until it is benchmarked and
   admitted.

## Decision rules

- **When a provider can serve a kind but has not been benchmarked for it, membership is
  denied with reason `unbenchmarked`.** Not "provisionally allowed", not "allowed for
  prototypes that might ship" — an unmeasured kind renders as unmeasured, and unmeasured
  is not a pass.
- **When one kind is registered and an adjacent kind is not**, the boundary must be
  enforced at the exact granularity of the registration. A provider registered for short
  ambient loops is not registered for spoken dialogue merely because both are audio.
- **When the provider's licence permits the output only under a non-commercial or
  attribution-bound term**, membership is denied for shipping classes and may still be
  granted for internal previsualisation — with the term stated, so nobody promotes a
  preview asset into a build.
- **When two providers are both registered for a kind**, that is a routing question and
  belongs to the routing discipline, not here. Membership answers *may this be used for
  this kind*; it does not answer *which one this time*.
- **When your own system claims a provider serves a kind, that claim is self-reported.**
  The authority is the benchmark result and the licence text, held separately from the
  integration that would benefit from a yes.

## Remove a false claim rather than half-keeping it

The worst membership entries are the aspirational ones: a kind listed because the
provider's brochure lists it, served in practice by whichever endpoint the integration
happens to have. The request succeeds, an artifact comes back, and it is filed under the
kind that was asked for — so a sound effect ends up stored and labelled as music, or a
long-form piece as a short loop. Every downstream consumer now holds a mislabelled asset
with a plausible provenance record.

When you discover such a claim, **delete it and record the reason** rather than keeping a
degraded version of it. "Serving this kind properly requires a different endpoint, a
resource we do not have a catalogue for, and its own settings — that is a second
integration, not a flag" is an honest non-membership. A half-kept capability is worse
than an absent one, because it produces artifacts that look audited and are not.

## Why the reason is the valuable half

A membership list without reasons degrades within one staffing change into folklore:
nobody remembers why the obvious provider is not used for the obvious kind, so someone
adds it. The reason is what makes the list self-defending. It is also what makes the
refusal useful at the moment of the request — the refusal can quote it
(`refuse-with-reason-not-greyed-out`).

## When NOT to use this

- **Single-provider, single-kind integrations** where the pipeline produces exactly one
  content kind and the provider does exactly one thing. The list would have one entry and
  no boundary to defend — though the licence term still needs recording.
- **Internal research pipelines whose output can never enter a build.** The separation
  costs more than it protects, provided the one-way barrier into production is real and
  enforced somewhere else.
