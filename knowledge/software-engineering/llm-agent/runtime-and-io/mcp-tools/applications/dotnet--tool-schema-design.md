---
layer: application
type: application
subject: mcp-tools
technique: tool-schema-design
stack: dotnet
verified_on: 2026-09-04
verified_against: dotnet@10.0.202
---

# Lowering a schema for an endpoint that accepts less than it was given

`Sylinko/Everywhere` at commit `a4345a5` is a desktop assistant that routes one
tool set to several model endpoints. The stack version is witnessed by
`global.json`, which pins the SDK to `10.0.202` with `allowPrerelease: false`;
that pin is the witness used here.

It is the tree that makes the narrowing case concrete, because it is the side
of the boundary that has to do something about it. A publisher authors a schema
once; this consumer forwards that schema to endpoints accepting a conservative
subset of it, and has to decide, keyword by keyword, what happens to the rest.

## The transform, and the three rungs it implements

`OpenAICompatibleToolSchemaTransformer` rewrites every tool's parameter schema
before a request leaves. Its own summary states the aim as converting to "a
conservative JSON Schema subset … while retaining enough information to guide
tool argument generation", and the implementation is the ladder the amendment
describes, written out as a switch over schema keywords:

- **Structural keywords pass through** — type, description, enum, required,
  reference, and the recursive containers. This is an allowlist, not a
  denylist, which is what makes the transform safe against an endpoint that
  rejects anything it does not recognize.
- **The exact lowering keeps enforcement.** A single-permitted-value keyword
  is rewritten as a one-member enumeration, which the subset carries and a
  validator still checks. Exclusive and inclusive alternation are merged into
  the one alternation form the subset accepts — a real semantic downgrade,
  since exclusivity is lost, and one the transform does not record anywhere.
  That omission is the amendment's third rung failing quietly in the tree that
  otherwise implements it best.
- **A named list of keywords is demoted into the description.** Twenty-one of
  them — formats, numeric and length and item bounds, multiple-of, uniqueness,
  the conditional triple, negation — are appended as a single
  `Constraints: …` sentence. These are exactly the keywords the registry rule
  said should stay in the schema, and against this endpoint they cannot.
- **A redundant constraint is dropped rather than demoted.** A key-name schema
  saying only that keys are strings restates what the container already
  guarantees, so it is elided; a *constrained* key-name schema is demoted like
  the rest. The distinction is the first rung's honesty test.
- **Everything unrecognized falls through and is dropped**, silently. The
  allowlist that makes the transform safe is also the mechanism by which an
  unanticipated keyword disappears with no record.

## What this tree contributes that the publisher side cannot see

Two mechanics here are invisible from a publisher's vantage and are the reason
this application exists beside the Rust one.

**Pruning is what orphans references, so reference integrity is checked after
it.** The transform preserves complete local definition graphs, then validates
that no reference dangles or points outside the document *before the request is
sent*. The ordering is the point: removing keywords is precisely the operation
that can strip the last user of a definition, so the pass that creates the
defect is followed immediately by the gate that catches it, on the near side of
the network call.

**The transform is identity-preserving when nothing was lowered.** Options are
cloned only if at least one tool's schema actually changed, so a catalog that
was already portable crosses at no cost and with its object identity intact. A
lowering pass that rewrote unconditionally would make every catalog look
transformed and would hide which ones genuinely were.

## What this realization cannot do

The demoted constraints arrive as a bare `Constraints: minimum=1, maxItems=10.`
line — the bound without the reason. That is the weaker half of the amendment's
second discipline, and the contrast is instructive rather than theoretical: an
observability service audited for the same technique demotes the same class of
constraint with the reason attached ("below the evidence floor a trend cannot
be presented"), which lets a caller decide whether to retry at all rather than
merely how. The transform here cannot do better, and this is a limit of where
it sits: it runs at the boundary, over schemas authored elsewhere, and the
reason for a bound is not in the keyword. Carrying the reason is a duty of the
surface that authored the constraint, not of the pass that relocates it — which
is why the amendment places that discipline on the publisher.

The transform also judges rather than measures. Nothing in the tree counts how
many constraints it demoted or dropped on a given request, so the downgrade is
invisible in operation; the `Constraints:` sentence is the only trace, and the
silently dropped keywords leave none at all.
