---
layer: application
type: application
subject: correlated-exchange-over-broadcast
technique: reply-fan-out-filtering
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
---

# A shared reply socket whose filter lives in one pure function, and survives every mutant

The Personas desktop app embeds browser tabs and lets an agent call "hands"
on a page. Every tab's page script answers over one shared loopback WebSocket
route, so the reply edge is exactly the technique's shape: N clients (tabs),
one edge. The relay is `src-tauri/src/browser_bridge/webview/relay.rs`. The
toolchain witness is the pinned channel in `rust-toolchain.toml`.

## What the tree does, against the technique

- **The filter is one helper, not a per-caller habit.** `Relay::settle` is the
  only place a reply is placed: no id, an id for another tab, an unknown or
  expired id, and a caller that stopped waiting each return a named
  `Settled::Ignored(reason)`. Nothing else reads the socket for replies.
- **The outstanding set is a map.** `pending: HashMap<String, oneshot::Sender>`
  holds the continuation per id; an entry leaves by the matching reply or by
  the timer, and the timeout path forgets the id so a late reply cannot match a
  fresh wait.
- **Identifiers are `<tab>:<n>-<random>`.** A prefix plus a counter, which the
  technique accepts, plus a random tail it does not ask for.

## Seam chosen to falsify

The claim under test: the filter is structural, so removing any one of its
parts is caught. A CAUGHT outcome would teach nothing new; a SURVIVING mutant
would show a filter part that is habit rather than structure, which is what
the technique warns about. Four mutants of the extracted module (the app crate's
test binary does not launch on this machine, `STATUS_ENTRYPOINT_NOT_FOUND`, so
the pure `Relay` type and its seven tests were lifted verbatim into a scratch
crate; baseline 7 of 7):

| Mutant | Result |
| --- | --- |
| tab-ownership check in `settle` removed | 1 test fails (a tab answering another tab's parked request) |
| random tail replaced by a constant | 1 test fails (tail not derivable from the counter) |
| prefix and ownership check both removed | 3 tests fail |
| `forget_tab` made a no-op | 1 test fails (abandoned requests survive a closed tab) |

Target: surviving mutants, 0 of 4. Floor: baseline 7 of 7 green before each
mutation. The finding held, and was at risk.

## What the tree adds that the technique does not say

The random tail exists because the replier is **untrusted**: a hostile page
must not be able to name a request it was never handed. The technique's
uniqueness argument assumes cooperating clients, where prefix plus counter is
enough; the unguessability requirement is a separate force (a trust boundary
on the reply edge) and the tree's tests pin it separately.

## What it cannot show

- **No census.** The technique asks for received and kept per client. The
  relay logs each drop at `debug` with its reason and counts nothing, so a
  tab whose replies are all dropped is invisible except in a debug log.
- The mutants ran on an extracted copy of the pure type, not the app binary,
  and cover the filter, not the axum route that feeds it.
- One shared edge with a handful of tabs and small replies: the topology
  question (split the reply edge) is never forced here.
