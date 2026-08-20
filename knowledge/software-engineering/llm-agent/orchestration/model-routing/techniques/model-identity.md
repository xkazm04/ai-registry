---
layer: technique
type: technique
subject: model-routing
technique: model-identity
status: forged
laws:
  - identity-survives-reuse
  - one-authority-per-vocabulary
shared_with: []
---

# Model identity across providers

The class→tier mapping (see turn-classification) assumes a tier resolves to *a
model*. In a system that reaches more than one provider, it does not. The same
published weights are offered by several vendors at once, each behind its own
identifier, its own output cap, its own accepted sampling parameters, its own
quota, and its own bugs. A routing layer that treats the provider-qualified
endpoint as the unit of routing has no vocabulary for the most common
substitution it will ever make — *the same model, somewhere else* — and so
records it as if it were the rarest and most consequential one: a different
model.

## Two substitutions, and only one of them is a quality event

- **In-group substitution** replaces the endpoint while holding the model
  constant. The caller's quality expectation is intact; nothing about the
  answer's capability changed. It should be invisible in the response contract
  and unremarkable in the record.
- **Cross-group substitution** replaces the model. This is a quality change: it
  can cross a capability floor, change the tier the class was calibrated for,
  and alter what the answer is worth. It belongs in the decision record as a
  first-class event, and it is the substitution capability-floors constrains.

Collapsing the two is the defect this technique exists to prevent, and it
fails in both directions. Read as one, an in-group hop looks like a downgrade
and buries the real ones in noise; read as the other, a genuine model swap
disappears into the ordinary retry chatter and nobody learns the frontier
candidate has been unavailable for a week.

## Identity is derived, and the derivation is a guess

Group membership is computed from what the roster publishes — a curated name,
an identifier — by a normalization that is unavoidably heuristic: fold case,
strip the vendor's pricing or routing suffix, keep only the terminal segment of
an organization-namespaced identifier, collapse runs of separator characters to
one. That normalization is **one derivation with one authority** (law:
one-authority-per-vocabulary), used by grouping, by drift detection, and by the
roster's own display, because two spellings of "the same model" is precisely
the drift this technique is about.

And because it is a guess, it will be wrong in both directions: two distinct
models that normalize alike, one model whose vendors name it irreconcilably.
The fix must therefore be **operator data, not a schema change or a code
release** — an override channel with exactly two operations, *merge* (coalesce
these keys into one group) and *split* (force this member out of its computed
group). Anything less means every mis-grouping waits for a deploy; anything
more is a second grouping engine.

The group key must also **survive reuse and restart** (law:
identity-survives-reuse). Deriving it from a display name that the roster feed
may re-word, or from a position in the roster, means yesterday's records name a
group that no longer exists and the measured history of a model resets whenever
a vendor edits a label.

## Members share weights, not capabilities

The temptation, once a group exists, is to treat it as one thing and route to
it. It is not one thing. Members differ in output cap, context window, tool-call
support, accepted sampling parameters, streaming behavior, and quota — and those
differences are exactly what makes one member fail a call another serves. So:

- **Capability lives on the member, never on the group.** The group answers
  "which model"; the member answers "can this call be served here".
- **A capability rejection skips the member, not the group.** A member that
  refuses the requested output length, the declared schema, or the tool
  declaration eliminates itself for this call; the remaining members are still
  the same model and still the right answer.
- **The group's advertised capability is the intersection, not the union.**
  Publishing the union means the roster promises a parameter that the member
  actually chosen may reject, and the caller's request fails on a capability the
  system told it it had.

## The inbound name is an alias, not an instruction

Where the routing layer is reached through an interface that carries a model
name — any compatibility surface does — that name arrives from outside and must
be **resolved through the same grouping**, not obeyed. Passing it through
verbatim delegates the routing decision to the caller, which is the stance the
golden path rejects, only laundered through a wire field. Treat it as a
consumer override (see consumer-overrides): legitimate, applied at the edge,
bounded by policy, and visible in the record as an override rather than as a
routing decision the system made.

## Decision rules

- **Name the group in the record, and the member beside it.** "Which model
  served this call" and "which endpoint served it" are two questions; a record
  that answers only one of them cannot distinguish a provider outage from a
  model retirement.
- **In-group order is a ranking question, not an identity question.** Which
  member goes first is candidate-ranking's job; membership is this technique's.
  Fusing them produces a group that reorders itself into a different model.
- **A group of one is normal and must not be special-cased.** Most models have a
  single provider; the grouping must degenerate cleanly, or every code path
  grows a "grouped or not" branch that the first merge falsifies.
- **Never invent identity from behavior.** Two endpoints that answer alike are
  not evidence of the same model — quantization, system-prompt injection, and
  silent substitution all produce plausible sameness. Identity comes from what
  the roster declares, corrected by an operator, never from output similarity.
- **Overrides are data with an owner and a reason.** A merge nobody can justify
  is unremovable forever, for the same reason a blocklist entry without a
  rationale is (see routing-policy).
