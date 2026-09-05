---
layer: application
type: application
subject: error-handling
technique: structured-propagation
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.85
---

# A retryability marker that rides the cause chain across a crate boundary

A knowledge-graph server's job queue lives in a store crate that cannot see
the LLM crate's error types, and must not: the queue asks one question of a
failure — *will trying again help?* — and the answer is domain knowledge the
handler has and the queue does not. The tree answers with a marker type in
the error's context chain, and it is a clean instance of the technique's
"category-specific data travels in the value" rule at a boundary the
technique's prose does not name: **the deciding layer is below the layer
that knows the category.** The floor witnessed is the README's stated
minimum (`Rust 1.85+`); the pipeline pins `stable` and no toolchain file
pins a version.

## The marker

`Terminal` is a unit struct implementing `std::error::Error` whose display
reads "will not recover by retrying" (`crates/utopia-core/src/error.rs`,
the `Terminal` block after `AppResult`). A handler that hits a failure it
knows is permanent — the measured case was an exhausted provider balance —
attaches it as context: `err.context(Terminal)`. Nothing else changes:
alerting still fires on the failure (the observer recognises the marker so
that failing *faster* does not mean failing *quieter*), and `last_error` is
still written.

The queue side is one predicate, `is_terminal(&anyhow::Error) -> bool`,
which walks the **whole chain** — `err.chain().any(|e| e.is::<Terminal>())`
— rather than inspecting the outermost error. The comment beside it states
why: after the handler attaches the marker, layers above keep wrapping with
their own context, so reading only the top of the chain is reading nothing.
That is the technique's "wrap, never replace" rule seen from the consumer:
enrichment above must not hide a category decided below, and the consumer
must search rather than peek.

`retry_delay(attempts, max_attempts, terminal)` in
`crates/utopia-store/src/jobs.rs` returns `None` — fail now — when the
marker is present or attempts are spent, and a quadratic backoff otherwise;
`mark_failed` passes `is_terminal(err)` in. The queue never names a domain
error. It asks "is it marked".

## The structural fact

The technique says the category is decided at birth, where structure
exists, and that consumers branch on a category field. Here the category
field would have to be *typed* to be visible in the store crate, and the
only type both crates share is the marker. The tree's crate graph makes
this a fact rather than a preference: `utopia-store` depends on
`utopia-core`, `utopia-llm` depends on both, and the queue's retry policy
runs in the store. A retryability enum in the LLM crate is unreachable from
the queue by construction; a marker in the core crate is reachable from
everywhere. The decision the record beside the code states — "the judgment
stays on the handler's side, the queue only asks whether it was attached" —
is the only shape the dependency graph permits without inverting it.

The measured cost of the pre-marker behaviour is in the same comment: three
retries at 30 seconds, 2 minutes and 4.5 minutes meant the failure an
operator needed to see arrived seven minutes late, restated three times.

## What this realization cannot do

- It carries **one bit** — terminal or not. The technique's fault-line axis
  (whose situation must change) and any retry-interval hint a throttling
  peer supplied are not in the marker; a provider's `retry-after` would need
  a second context type or a typed variant.
- The chain walk is **by type**, so a handler that attaches the marker
  through a boundary that flattens errors to strings loses it silently.
  Every path from handler to queue here stays inside `anyhow`, which is why
  it holds; a future serialised job result would have to carry the bit as a
  field.
- Nothing here classifies at birth. The marker is attached by the handler
  that *recognised* the failure, which is the right layer for "balance
  exhausted" and the wrong layer for a socket error; the tree leaves those
  to the default retry, which is the technique's conservative default for an
  unclassified failure.
