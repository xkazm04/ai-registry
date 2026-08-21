---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: attribute-precedence-lists
status: forged
laws: [nullable-never-zero]
shared_with: []
use_when: [mapping standard-telemetry spans whose attribute names have churned, supporting senders on old instrumentation versions, auditing a mapper against a conventions changelog]
---

# Attribute precedence lists

For every field of the internal event model, read an **ordered list** of
accepted attribute names — the current standard name first, its deprecated
predecessors next, then each widely-deployed pre-standard or third-party
convention — and take the first present value. The list, not any single
name, is the mapping.

## Why a list and not a name

The generative-AI semantic conventions are pre-stable and have churned
through renames while already widely deployed: the provider-identity
attribute changed names mid-life; token-usage attributes migrated from
"prompt/completion" naming to "input/output" naming; content attributes were
removed in favor of opt-in structured-message attributes. Transition tooling
even encourages emitters to dual-emit old and new names simultaneously. On
top of the standard's own history sit several instrumentation ecosystems
that predate it, each with its own attribute namespace and its own casing
conventions for the same facts.

A mapper keyed to one generation of names does not error on the others — it
maps *nothing*, and for token counts "nothing" downstream reads as free
traffic. The under-count is silent, proportional to how outdated the sender
population is, and concentrated on exactly the senders least likely to
notice. The precedence list converts an unbounded compatibility problem
into a bounded, auditable table.

## Construction rules

- **Order is newest-standard first.** When a dual-emitting sender supplies
  both the current and the deprecated name, the current one wins
  deterministically. Precedence is a tie-break rule, so it must be stated,
  not incidental to iteration order.
- **One list per internal field, side by side.** Publish the full table —
  field, then its accepted names in order — in the mapper's own
  documentation. The table is what an operator audits against the standard's
  changelog when a new release renames something; a mapping smeared through
  parsing code cannot be audited.
- **Admit third-party conventions explicitly, not by wildcard.** Each legacy
  namespace earns its entries because a real sender population emits it.
  Pattern-matching "anything that looks like a token attribute" re-opens the
  door to guessing.
- **Distinguish absent from zero at read time.** Fields that are optional in
  the internal model (cached-input tokens, reasoning tokens, explicit cost)
  stay null when no listed name matched — never defaulted to zero, which
  would turn "this sender's instrumentation predates cache accounting" into
  "this sender never hits cache".
- **A non-standard but load-bearing name may join the list, flagged.** An
  explicitly exported cost attribute has no stable standard name, yet some
  senders carry one; accepting the known variants — marked non-standard in
  the table — beats discarding sender-supplied truth. What it must never do
  is override the pipeline's own pricing silently in aggregate views; an
  honored sender cost is provenance-worthy.
- **Keep the losers.** When multiple names matched, or the value came from a
  deprecated name, preserve the raw attribute(s) in provenance metadata. The
  day a precedence decision is discovered wrong, the raw material to re-map
  must still exist.

## Maintenance discipline

Treat the list as versioned configuration with a review trigger: every
release of the conventions gets diffed against the table. Additions go at
the *front* (a rename means a new current name); nothing is removed while
any measurable sender population still emits it — deployed instrumentation
outlives deprecation notices by years.

## When not to use it

On the builder side — normalizing the one SDK you call at a version you pin
— a precedence list is over-engineering; read the one shape you know.
Precedence lists earn their complexity exactly when the sender population's
instrumentation versions are outside your control. And a list is not a
license to map semantically different attributes to one field: names may
only share a list when they name the *same fact* across generations, never
when they name related-but-different facts (a total is not an input count —
see refuse-to-derive).
