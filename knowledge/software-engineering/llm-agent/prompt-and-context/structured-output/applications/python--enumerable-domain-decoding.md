---
layer: application
type: application
subject: structured-output
technique: enumerable-domain-decoding
stack: python
verified_on: 2026-09-06
verified_against: python@3.12
applied: task
ab_verdict: better
proof: structural-only
---

# Python — 153 fields, one declared domain, seventeen clamps

How a hiring-analysis pipeline stands against
[enumerable-domain-decoding](../techniques/enumerable-domain-decoding.md) when
the mechanism is absent. The version witness is the interpreter the tree's own
test run reports (3.12); the tree was opened, an instrument was added to it, and
the figures below are that instrument's output.

## The seam

The pipeline asks a hosted model for a structured analysis and parses it into
typed models. Those models are the contract's authority: a code generator reads
their JSON Schema and emits the TypeScript the web surface consumes.

The instrument added to the tree reports:

```
exported fields            153
with a declared domain     1 (0.7%)
repaired in code           17
```

The single declared domain is incidental — an optional union that happens to
carry an enum. Every other value domain is enforced imperatively: a confidence
clamped to a 0-100 band, a capability rung clamped into a three-value ladder by
a validator and again by its caller, a match score by another validator,
probabilities in four more places.

And the request carries no schema. The tree sets a JSON mime type on its model
calls and nothing else; a response-schema parameter appears nowhere in it.

## The structural fact nobody designed

The schema exists, is complete, is machine-readable, and has exactly one
consumer: the TypeScript code generator. The **model** boundary — the one place
where handing over the schema would prevent the seventeen repairs — is the one
boundary the schema does not cross.

Nobody chose that. The schema was built for the type boundary because that
boundary needed types, and the producer boundary was never asked because the
clamps were already absorbing the damage. The loop closes on itself: the model
returns out-of-domain values because nothing told it the domain, and nothing
tells it the domain because the clamps make the symptom survivable.

## The premise this reading started from was wrong

The reading opened expecting to find the domains *declared and merely unsent* —
the tidy version, where adopting the technique is one parameter. The instrument
refused it. The domains are not declared either: they live in expressions, which
is a form neither the model nor the generated TypeScript can read. So the
contract's shape is written twice and its value domains a third time, in the one
notation with no consumer.

That makes the technique's derive-don't-retype rule the load-bearing one here
rather than a footnote, and it adds a step ahead of the obvious one: lift the
domains into the field declarations first, which serves both boundaries, and
only then send the schema.

## What the tree already gets right, and it is the subtle half

The model calls report whether the schema constraint was **shed**. Grounding and
a response constraint contend for one emission surface, so with search tools
attached the mime-type constraint is dropped, and the tree records the shed on
the result with a comment explaining that an unreported shed would leave the
caller believing syntax is guaranteed while the parser is scanning prose. That
is [constrained-decoding-is-a-shared-budget](../techniques/constrained-decoding-is-a-shared-budget.md)'s
shedding-is-visible rule, implemented and commented. A response schema added
here inherits that flag rather than needing a second one, which is what keeps
the adoption small.

The one clamp that also *records* that it clamped, in a notes field, is the
honest form and it is the minority — sixteen others substitute a plausible value
for an implausible one silently, so a model that misunderstood the task produces
a boundary value that reads as a real judgment.

## The work item and what would falsify it

A plan is committed in the project naming the four steps, the files, a size of
six to nine files and roughly 120-180 net lines, and the gate. The first step is
landed: the instrument plus thirteen tests, green, asserting a known-present
clamp so an empty scan cannot read as a closed gap.

**What would make the rest wrong**, stated in the plan and worth repeating
because it is the cheap check nobody runs: if the model's out-of-domain rate is
already near zero, the seventeen clamps are dead code and declaring their
domains buys types and nothing else. That is measurable before the schema is
ever sent — count how often each clamp actually changes its input on recorded
analyses — and if a clamp has never fired, the honest outcome is to delete it
and shrink the item rather than proceed.

## The reference implementation, for contrast

The technique was derived from a music-generation runtime in the same language
that carries the mechanism in full, and three of its choices are the ones this
pipeline would have to make. It enumerates each domain as a full string set and
compiles a prefix tree rather than tracking a running integer. It keys that tree
on **token-ID sequences** with a comment saying why — string keys mismatch the
tokenizer. And it tokenizes every member as *the field's preamble plus the
value*, carrying two distinct preamble strings per field: one as the state
machine emits it, used to find where the preamble's tokens end, and one as the
tokenizer sees it, with the delimiter, used to get the segmentation right.

That third choice is the one this pipeline cannot skip and would not discover
from the technique's summary alone. It is also where the reference tree is
*weaker* than the technique: its domains are restated as module constants beside
the state machine rather than derived from the declaration its own downstream
validation reads — the same third-copy problem this pipeline has, in its
cheapest form. Neither tree derives the enumeration from one authority, which is
why that rule sits in the technique rather than in either application.
