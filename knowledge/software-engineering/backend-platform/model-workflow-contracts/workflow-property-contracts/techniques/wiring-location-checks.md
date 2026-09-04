---
layer: technique
type: technique
subject: workflow-property-contracts
technique: wiring-location-checks
status: forged
laws:
  - gate-sees-target
  - unknown-is-not-a-value
shared_with: []
use_when: [an optional component exists but the host cannot tell whether the workflow uses it, deciding what the contract check verifies beyond existence, a component's position in the graph is not fixed]
---

# Wiring location checks

An optional property that exists is not an optional property that works. A validation
dataset can be defined in a workflow and never handed to the evaluator; a
post-processing chain can be present and attached to nothing; an evaluator can be
built and never called. An existence probe passes on all three, and the host finds out
at the end of an epoch when the metric it was promised is missing. The stance: for an
optional property with a stated reference location, **verify that the expected
consumer actually refers to it at that location**, and where the consumer's location
cannot be known, say so rather than pass.

## Existence is a proxy; wiring is the target

What the host cares about is that when the loop reaches validation, the evaluator it
runs reads the validation data the host supplied. Whether an object with that name
exists is a proxy for that outcome, and a proxy passes exactly when it diverges from
the target ([gate-sees-target](../../../../_laws.md#gate-sees-target)) — here, when
the object exists in the wrong place or under a second copy. The property record's
reference location names the target directly: the address of the argument, in the
consuming component, where a reference to this property is expected. The check reads
what sits at that address and asks whether it is a reference to the property.

The procedure for one optional property: if the property has no reference location,
skip it — there is nothing to verify beyond existence, and existence of an optional
thing is not a finding. Otherwise, read the value at the reference location. If the
value is a reference to the property's own location, the wiring is correct. If the
value is an expression — a computed value the workflow's language allows in place of a
reference — the check cannot decide statically and treats it as acceptable, because an
expression is the author's explicit choice to compute the value and the contract does
not forbid it. Anything else — a literal, a reference to some other id, an absence —
is a wiring failure, reported by name.

The distinction between a reference and an expression is load-bearing. A reference is
a pointer the resolver follows; the check can compare its target against the expected
address without evaluating anything. An expression is code, and evaluating it to see
what it produces would run part of the workflow. The check reads syntax, never
results: it classifies the value at the address, and it does not resolve it.

## The unknowable position

Some components have no fixed address. A validation trigger is a handler in the
trainer's handler list, and its index depends on how many handlers the author
registered before it; the argument that names the evaluator is at a position the table
cannot state in advance. For such components the honest reference location is not a
path but an **argument name**, and the check locates the consumer differently: it
scans the list the consumer is known to live in, matches the consumer by its declared
kind rather than its index, and reads the named argument from the match. The table
entry names the consumer kind and the argument; the position is discovered at check
time. When no consumer of that kind is present, nothing refers to the property and the
optional semantics say it may be absent — that is a pass on the merits, not a skip.

The exception proper is narrower: a component that has no fixed address *and* no
declared kind to match on cannot be wiring-checked, and the report must say which
properties were not checked and why. A check that silently skips them has converted
"we could not look" into "we looked and it was fine", which is the confident claim in
the place confidence misleads most
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The design
that keeps the exception empty is the one in which every consumer of an optional
property can be wired *after* construction, by argument name — a trainer that accepts
its validator through a setter has an evaluator property whose reference location is
that setter's argument, whatever else the author registered.

## Decision rules

When an optional property has exactly one canonical consumer — the validation data has
the evaluator's data-loader argument, the post-processing chain has the trainer's
post-processing argument — give it a reference location and let the check verify
wiring. When it has several plausible consumers, do not pick one; leave the reference
location unset and accept that the check verifies existence only, because a check
that insists on one of several correct wirings produces false findings that teach the
host to ignore the report. When the consumer's position is unknowable but its kind is
declared, match by kind and read the argument by name; when neither is available, list
the property under the exception and make the report say so.

When the value at the reference location is an expression, accept it and move on; do
not evaluate it. When the reference points at a different id that happens to resolve
to the same object — an alias — report it anyway: the contract asked for a reference
to this location, and an alias that resolves the same today is a rename away from not
doing so.

Do not apply wiring checks to required properties. A required property is one the
host reads directly; the host is its consumer, and the check for it is existence.
Wiring is a question about components inside the workflow that consume each other,
and only the optional set has that shape.
