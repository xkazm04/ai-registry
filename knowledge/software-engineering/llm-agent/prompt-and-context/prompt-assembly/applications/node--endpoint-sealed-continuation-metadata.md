---
layer: application
type: application
subject: prompt-assembly
technique: endpoint-sealed-continuation-metadata
stack: node
verified_on: 2026-09-03
verified_against: node@24.15.0
---

# A four-provider desktop agent that strips per segment, not per transcript

An open-source local-first desktop coworker whose core package composes
every prompt for a turn-oriented agent runtime. The witness for the version
above is the repository's own release workflow, which pins the Node it
builds against; the model layer's provider adapters and the AI SDK it wraps
are pinned in the core package's manifest at the same commit. Citations
resolved 2026-09-03 against a shallow clone at commit `f4fce64a`.

The tree is worth recording because it is the technique's regime with the
awkward parts already hit rather than anticipated: four provider families
are wired at once, the app switches models mid-conversation as a normal
product action, and the design document names the provider error that
forced the rule.

## The forces, as the tree states them

The conversation prefix is not stored inline. A turn references its
predecessor and the prefix is materialized by walking the chain, which
means a single materialization routinely spans segments produced by
different models — a fallback, a manual switch, a cheap model for a
background pass. Four vocabularies of continuation metadata ride those
segments: thinking signatures, encrypted reasoning, thought signatures,
and a reasoning-details array, one per provider family.

The failure that fixed the design was a provider rejecting a replayed
payload outright with an error saying the encrypted payload can only be
replayed to the endpoint that created it. Not a degradation, not a dropped
field — a refused call. That is the empirical content this application
adds to the technique: the seal is enforced by the provider, so the rule is
not a hygiene preference and cannot be deferred behind a feature flag.

## What the tree does, and where it differs from the standard

The materializing resolver takes the target model as an argument, and gates
replay per walked segment on two conditions: the producing turn's resolved
model equals the target under strict provider-instance and model-id
equality, **and** that turn completed cleanly. Everything else is stripped,
and the inline base of every chain is stripped unconditionally on the
stated grounds that its origin is unrecorded and migrated conversations may
carry foreign metadata. The strip demotes reasoning parts that carry
visible text to plain text and drops signature-only parts — the demotion
the technique argues for, present here without being argued.

Two details the standard states as obligations and the tree gets
structurally, which is the better form:

- **The in-flight exemption is not a condition.** Within-turn replay uses
  request references rather than the resolver, so the signatures between
  tool calls of the loop in progress — the one place the providers hard-
  require them — are preserved because that path was never routed through
  the strip. Nothing tests for "is this the current turn."
- **Reversibility falls out of the storage decision.** The strip happens at
  materialization only and the durable turn files keep full fidelity, so
  switching back to the original model restores verbatim replay of its
  segments with no repair step. The technique presents this as a property
  to preserve; here it is a consequence of never having written the lossy
  form down.

## What the tree cannot tell us

The design document asserts that strict equality is the right granularity
but records no measurement of what a looser rule would have cost — no count
of rejected calls before the fix, no cache-hit comparison across the
change. The rule is corroborated by a provider's refusal, which is a hard
signal about correctness and none at all about the cost of the conservative
choice. A team adopting this should expect to find the same gap in its own
adoption: the failure is loud and the over-stripping is silent, so only the
first half instruments itself.
