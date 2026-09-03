---
layer: application
type: application
subject: settings
technique: inherited-default-override
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: better
proof: structural-only
---

# Every conflict rule keys on a decision, so no default can be blamed — until resume

Two connected trees were read against the technique's derived-default
section: an operations server whose configuration is a typed file with
per-section defaults and a single validator, and a desktop application whose
model selection is a specificity cascade over routing rules with an explicit
per-persona override on top.

## The structural fact

In the server, **every cross-key rule in the validator is guarded by a boolean
whose default is off.** A remote fetch fabric must carry a secret when
enabled; an archive must have an absolute base address when enabled. Because
the guard's default disables the rule, the only way a rule can fire is an
explicit decision, and the defaulted operand — an empty secret — is named in
the message as the consequence, after the decision that caused it. Nobody
wrote "rules fire only on decided keys"; the tree cannot violate it, because
its defaults are shaped so that no derived value can ever be the trigger.

In the desktop application the cascade "fills the model only when the persona
has no explicit one", and the server's role presets say "any field a request
sets explicitly overrides the role". Explicit beats derived in both trees,
stated in a comment in each, and neither carries the provenance set the
section asks for — because neither has a rule that names two keys, so nothing
could ever blame a derivation.

## The paired comparison

Arm A is the technique before the section: constant and inherited defaults,
"a recorded decision may be revised only by the decider". Arm B adds the
derived column and the provenance rule. Three cases from the trees.

1. **Fabric enabled, secret absent.** A: the validator errors, naming the
   secret. B: the same error, and the section's exception applies — nothing
   can be derived for a secret — so the message names the decision as cause
   and the derived key as consequence, which it already does. Equal.
2. **A routing rule sets the model and the persona sets it explicitly.** A and
   B both take the explicit value; there is no conflict rule to fire. Equal,
   and structural confirmation that the trees practise the rule where it
   costs nothing.
3. **Resume replays a constant effort.** The initial run derives its effort
   from the model profile, falling back to a pinned default; the resume path
   passes the pinned default unconditionally, with a comment saying the intent
   is to keep the continued session on the initial run's effort. The code
   fails its own intent for every persona whose profile decided a non-default
   effort. A flags it under "revised only by the decider". B names the
   remedy's shape — re-derive from the same inputs, never replay the
   derivation's stored or hard-coded result — and predicts the continued
   session's effort changes for exactly the profiles with an explicit one.
   Falsifier: if resume is meant as a cost cap regardless of the first run,
   the constant is a policy value and belongs in the first column, labelled.

Verdict `better`, on one case with a concrete next change and two equal. The
change is not shipped: it crosses a provider-trait signature and the tree had
a sibling run live in it during this one.

## What this realization cannot do

Neither tree emits which keys were decided and which derived, so the
provenance rule is unfalsifiable here beyond reading the code. The instrument
that would measure it is a validator that logs, per rejection, whether every
named key was explicit — a count the server's typed configuration could
produce in a few lines and the desktop cascade could not, because it has no
rejection path at all.
