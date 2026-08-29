---
layer: application
type: application
subject: agent-chaining
technique: stop-reason-ledgers
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Stop-reason ledgers — gating the vocabulary against the vocabulary

*Verified against the project tree at `bf2a1e249`.*

The [stop-reason-ledgers](../techniques/stop-reason-ledgers.md) technique asks
for one closed, owned stop vocabulary. This tree has one: a `pub mod
stop_reason` block of string consts in `src-tauri/db/src/chain.rs:44-86`,
written to `chain_stop_reasons.reason_token`, resolved to a human label by
`status_tokens.chain_stop` in the locale catalogs. Two artifacts, one
vocabulary, across a language boundary — the mirroring problem, and the tree
knew it: `src/i18n/__tests__/chainStopReasons.parity.test.ts` exists precisely
to gate the mirror.

## The seam

The gate was over a proxy. The test held the Rust consts as a hand-copied
TypeScript array (`chainStopReasons.parity.test.ts:15`) and compared *that copy*
to `en.json`. Its own header said why it had to exist: `reason_token` crosses
the binding boundary as a raw `String`, nothing typechecks it, and the label
resolver falls back to printing the raw snake_case token behind a DEV-only
warning. So the failure it was built to catch is exactly "a new Rust const
ships with no label" — and the instrument for catching it was a second
hand-maintained list, which drifts under the same conditions as the first.

## A and B

- **A** — the test as written: assert the hand-copy has 13 members, and that
  `en.json` has exactly those 13 keys.
- **B** — the test parses the `pub mod stop_reason` block out of
  `src-tauri/db/src/chain.rs` at run time, and asserts it found consts before
  it reports anything clean.

Nothing else changed about what the gate claims. Only what it reads.

## What was read, and what it said

`vitest run src/i18n/__tests__/chainStopReasons.parity.test.ts`, the narrowest
gate that can see the difference:

- **A: 2 passed.** Green.
- **B: 1 failed.** `expected [ 'breadth_exceeded', …(12) ] to deeply equal
  [ 'breadth_exceeded', …(14) ]`, with the diff naming `lookup_failed` and
  `cost_ceiling_corrupt`.

Both are real, shipped members of the vocabulary. `LOOKUP_FAILED` is the
machinery-side reason the technique's second family predicts almost verbatim —
the edge lookup errored before anything was evaluated, so the cascade halted
because there was nothing to evaluate rather than because a trigger decided.
`COST_CEILING_CORRUPT` is the guard-configuration-found-corrupt case, and its
own doc comment is careful about why it must not collapse into the unset
ceiling. Both were rendering to every operator as the raw token text, in every
locale, for as long as they have existed.

Adding the two labels turned the gate green again — but the strict i18n hook
(`lefthook` pre-commit, `check-coverage.mjs --strict`) refuses a key that
exists in `en.json` and not in the other thirteen catalogs, so the repair is a
14-file atomic unit. That is worth naming: the cost of correcting a drift in
this vocabulary is 14 files, which is a fair part of why a hand-copy was the
convenient thing to maintain and why the drift sat.

## The structural fact

The vocabulary's Rust side is deliberately open — the module comment says it
is "kept open so sibling directions can add reasons … without a schema change".
That is the technique's own advice about budgeting for the machinery family
before it arrives. But an open vocabulary and a hand-copied mirror are
incompatible by construction: the property that makes the producer cheap to
extend is exactly the property that makes an unverified mirror wrong. The tree
had both, and the two members that appeared after the mirror was written are
precisely the ones missing. Nobody designed that; it fell out of the shape.

## What this realization cannot do or prove

- **It does not make the vocabulary complete.** The set gates cleanly now and
  is still missing `completed`, `cancelled` and `condition-unevaluable`. Every
  member is a reason a chain did *not* continue; the happy path writes no stop
  record at all, so "the chain finished" and "no decision pass ever ran" remain
  the same silence, and the technique's stuck-versus-stopped query cannot be
  written against this table. The gate cannot detect a *missing* member — only
  a member that exists on one side.
- **It does not classify.** Nothing in either artifact marks a reason
  success-shaped or error-shaped; `cas_lost` (informational — the chain
  continues via the winner) and `quarantined` are the same kind of row to every
  consumer. That bit is still re-judged by each reader.
- **The parse is a regex over Rust source**, not a compiler. It reads
  `pub const NAME: &str = "token";` inside one named block; a reason introduced
  by a macro, a `const` assembled from parts, or a token minted at a write site
  rather than declared here is invisible to it. The self-check ("did I find any
  consts at all?") catches a parse that broke completely, not one that silently
  under-matches.
- **It proves nothing about production traffic.** That a token has a label does
  not mean any row carries it. Whether `lookup_failed` has ever been written is
  a question for the table, and this gate never looks at data.
