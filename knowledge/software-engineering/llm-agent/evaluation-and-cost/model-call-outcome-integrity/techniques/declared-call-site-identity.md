---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: declared-call-site-identity
status: forged
laws: [identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [outcomes cannot be grouped by what the call was for, deciding what identifier a call carries into telemetry, a new call path shipped and nobody noticed it spending, telling a use case that went quiet from one that was never instrumented]
---

# Declared call-site identity

Every call carries a **stable identifier for the purpose it serves**, chosen by the call
site and required by the seam. Not the model, not the module, not the transport: what the
call is *for*.

## Why the obvious substitutes fail

Seams tend to record what is nearest to hand at the boundary — the transport, the vendor,
the class that made the call. Each is a fact about the mechanism, and none survives the
questions that matter:

- **The model** changes for reasons unrelated to purpose, so grouping by it mixes two
  variables and can never answer "is this task getting more expensive".
- **The module or file** is refactored, and history breaks at the rename.
- **The transport** is shared by every purpose in the system, so it groups everything
  into one bucket.

The identifier has to be chosen where the intent is known — at the call site — and it has
to be stable across the code moving. That is a different property from being unique, and
it is the whole reason the call site declares it rather than the seam deriving it.

## The rule

**The identifier is a required argument of the call, not an optional field on the
telemetry.** A seam that permits an anonymous call will accumulate them, because the
default costs nothing at the moment it is written and the cost lands on someone reading a
dashboard six months later.

Its shape is constrained by where it travels: it is compared exactly, appears in queries
and paths, and is read by people. A short lowercase token, dot-separated by scope, with
no spaces. It names the job — not the function that happens to do it today.

## Declared and observed

An identifier on an event answers "what were these calls for". It does not answer "what
are all the things this system does", because nothing enumerates the identifiers that
*should* exist. Those are different questions and the second needs a **declaration**: a
list, maintained deliberately, of the call sites this system has.

The difference between the declared set and the observed set is where the value is:

- **observed but not declared** — a call path that shipped without anyone registering it,
  or a typo splitting one purpose's spend across two buckets. Both are invisible when the
  identifier is the only thing that exists, because every string is equally valid.
- **declared but not observed** — either the path is dead, or it broke and nobody noticed.
  Which one depends on whether it was supposed to be running, which is why a declaration
  carries a lifecycle state and not just a name.
- **observed under a model the declaration never listed** — drift, and the only way to see
  it is to have written down what was intended.

Declaring nothing is not the same as declaring "anything is acceptable". A seam that
reports no expectation must report *that*, rather than reporting conformance.

## Decision rules

- **No identifier, no call.** Enforce at the seam's signature so the check cannot be
  skipped under deadline.
- **Anonymous calls are counted, never dropped.** In a system that has not been
  instrumented, "calls that declared nothing" is the largest and most actionable number
  there is; folding it into another bucket makes an uninstrumented system look like a
  typo problem.
- **The identifier is not the prompt version, the model, or the tenant.** Those are
  separate dimensions with separate lifetimes; overloading one identifier to carry them
  destroys all of them.
- **A workaround is a signal.** If call sites are smuggling purpose into a free-text tag
  because the record has no field for it, the record is missing a field — and the tag
  will be inconsistent by the time anyone tries to use it.
