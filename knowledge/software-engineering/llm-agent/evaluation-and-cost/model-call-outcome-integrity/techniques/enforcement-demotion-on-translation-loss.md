---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: enforcement-demotion-on-translation-loss
status: forged
laws: [one-validation-door, unknown-is-not-a-value]
shared_with: []
use_when: [a structured-output contract is translated into a vendor's own constraint dialect, deciding whether to trust that a vendor enforced what was sent, documentation claims enforcement the adapters do not perform, choosing what to validate after a constrained generation]
---

# Enforcement demotion on translation loss

A structured-output contract expressed for one vendor is **translated**, not transmitted.
When the translation loses something, the seam records that enforcement was weaker than
requested — and validates locally regardless.

## The gap this closes

Vendors accept constraints in incompatible dialects, each a subset of what a general
schema can express. The seam converts its contract into whichever dialect applies, and
the conversion silently drops what the target cannot represent — a conditional, a
cross-field dependency, a closed-set restriction, a prohibition on extra fields.

The result is a seam that believes it constrained the output and did not. Everything
downstream inherits the belief: validation is skipped because "the vendor enforced it",
and a class of malformed answers becomes invisible until something further away breaks.

The documented form of this is worse than the accidental one. A capability table can state
that a strict mode is supported for every provider while the adapters underneath merely
append an instruction to the prompt asking for the right shape. The claim is not a lie
anyone told; it is a claim nobody re-checked after the adapters changed.

## The rule

Three moves, in order:

1. **Inspect the contract for constructs the target dialect cannot express** before
   sending. This is a scan of the contract, not of the answer, and it is cheap.
2. **Demote the recorded enforcement level** when anything would be lost — from
   *enforced by the engine* to *requested in the prompt*. The outcome carries the level
   that actually applied, not the one that was intended.
3. **Validate the answer locally on every path**, including the enforced one. A vendor
   that accepted a constraint may still return something outside it, and a seam that
   trusts the constraint has no way to notice.

Step 3 is what makes steps 1 and 2 safe rather than merely honest: the demotion informs
the *reader*, and local validation protects the *system*.

## One contract, two consumers

The strongest form keeps a single contract object used verbatim in both places — the
request's constraint and the reply's validator are derived from the same value. When they
are separate declarations, they drift, and the drift shows up as answers that pass
validation and violate the request, or the reverse. One authority, two derivations.

## Decision rules

- **Enforcement level is an outcome field, not a configuration setting.** It records what
  happened on this call, which may differ from what was configured.
- **Prefer the strictest mechanism the vendor offers**, which is not always the one
  named for structured output — a forced tool invocation, where available, leaves the
  model no way to emit prose at all.
- **A rejected constraint is a demotion, not a failure.** Retrying without the constraint
  is legitimate; retrying without recording that it happened is not.
- **Never let documentation be the evidence.** The claim "this provider enforces schemas"
  is checked against the adapter that builds the request, and re-checked when either
  changes; a capability table is a summary, and summaries drift silently.
- **Validation failure after enforcement was reported is a finding about the seam.** It
  means the recorded level was wrong, and the translation step needs a case added — not a
  looser validator.
