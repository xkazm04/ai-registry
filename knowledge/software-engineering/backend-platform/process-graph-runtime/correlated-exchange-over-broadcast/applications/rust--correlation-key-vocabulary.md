---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: correlation-key-vocabulary
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.95
applied: simulation
ab_verdict: unmeasurable
---

# A one-key exchange that already conforms, and where the vocabulary would start to matter

The Personas desktop app runs one genuine correlated exchange over its event
bus: a Fleet session calls a blocking tool (a guidance question or an approval),
the backend mints a request id, emits a notice to the frontend, parks a oneshot
sender in a process-wide hub, and waits. The operator's answer comes back
through a command that echoes the id; the hub resolves the sender. A TTL sweep
and a cancel-on-session-exit path drain whatever never got answered. The code is
`src-tauri/src/companion/orchestration/mcp/pending.rs` and its handlers.

The policy question was the technique's: is the vocabulary one authority with
every predicate derived from it, or several private copies?

## Seam chosen to falsify

The seam was picked because it could kill the finding: if the tree spelled the
exchange's keys and its "is this a correlated request" test in several layers,
the technique's central claim (duplication is the live failure) would be shown
at work; if it did not, the technique's own "when not to reach for this"
paragraph would be what applies. A caught outcome would have taught a concrete
amendment either way.

## Three real cases walked under policy A (as is) and policy B (technique)

1. **Minting and recognising the id.** The prefix is spelled once in production
   code, at the single `submit` call; the only other occurrences are test
   fixtures. No layer classifies "is this a request id" by prefix; lookup is by
   exact key in the hub. B would add a constant and a predicate with no caller.
2. **The notice payload.** One `RequestNotice` struct carries the id, the
   session and a closed `RequestKind` enum whose `event_name()` is the only place
   the kind-to-event mapping lives. The status set is already an enumeration, not
   free strings. B changes nothing.
3. **Echo on the way back.** The frontend store dedupes by the same key and the
   resolve command takes it as a bare string. This is the one place the "types,
   not free strings" clause bites: the id is a `String` across the night-shift
   watchdogs, the hub and the command, so a session id can be passed where a
   request id is expected and the compiler stays silent. B is a newtype for the
   id. Its payoff is a class of mix-up that has no recorded incident in this
   tree; the cost is a signature change across roughly six modules.

## Verdict and what it refuted

Target (predicates or key spellings duplicated across layers): 0 found. Floor:
not applicable, no code changed. The seam was chosen to falsify "the tree grows
private copies of the classifier" and the tree held: one key, one enum, one hub.
The technique's boundary paragraph is what describes this exchange, a single
pattern between components written and shipped together. Threading in the two
channel feeds (`reply_to`, with a `pch-` display prefix applied in one feed
only) is a different, display-side convention that no scheduler or filter keys
on, so it is not a correlation vocabulary either.

Return condition: when a second correlated pattern joins this bus (a
request/reply for another feature, or a goal/status exchange), or when the id
type is mixed up in a real incident. Instrument that would make the newtype
measurable: a compile-time count of call sites that accept a bare string id,
before and after.
