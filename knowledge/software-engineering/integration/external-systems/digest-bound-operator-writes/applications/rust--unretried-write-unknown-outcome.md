---
layer: application
type: application
subject: digest-bound-operator-writes
technique: unretried-write-unknown-outcome
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.97
---

# A money write's lost answer is unknown, and its retry is keyed (paypal wallet)

Project `paypal`, https://github.com/xkazm04/paypal at main, commit a52d8f6d (read from
`origin/main` through `git show`, toolchain 1.97, edition 2024). It is a seller's
wallet. On the owner's behalf it creates PayPal orders, authorizes and captures them,
voids holds, and sends invoices. Every money step is reserved in a local ledger under
a request id before it is sent. A step whose answer was lost goes to a resolver that
reaches PayPal's truth once before anything new is tried. This tree shows where the
technique's "do not retry writes" meets an idempotency key, and the bounds that
meeting needs.

## Three outcomes at the transport

| Piece | Anchor | What it does |
|---|---|---|
| The third value | `crates/table-paypal/src/types.rs:249` "PayPal transport outcome unknown; reconcile before a new attempt" | `Error::Unknown` is a variant beside `Api` (PayPal answered and refused) and `Credentials`. It carries every observation made on the way |
| Lost answer | `crates/table-paypal/src/client.rs:281` "Status 0: the request may have reached PayPal; its answer did not arrive." | A transport error after the request left is recorded as a status-0 observation and becomes `Unknown` once attempts end |
| Deadline after send | `crates/table-paypal/src/client.rs:206` "Err(_) if on_wire.load(Relaxed)" | The call-wide deadline yields `Unknown` only when a request was on the wire. A deadline hit while still at the token step sent nothing, and reads as credentials unreachable |
| Unparseable success | `crates/table-paypal/src/client.rs:341` "let value = serde_json::from_value(r.value).map_err(" | A 2xx whose body does not decode is unknown, not invalid. This is the technique's "could not parse after a success status" |

## When a write is retried, and under what

| Piece | Anchor | What it does |
|---|---|---|
| One id per operation | `crates/table-paypal/src/types.rs:28` "pub fn for_operation(deal: DealId, attempt: u8, operation: &str)" | The PayPal-Request-Id is derived from deal, attempt and operation name. It is never random, so every attempt and every re-send carries the same key |
| Reserved before sent | `crates/table-app/src/pipeline/send.rs:39` "self.wallet.ledger.reserve_operation(" | The operation and its request id are written to the ledger before `send_create` at `:50` dials PayPal |
| Keyed calls retry | `crates/table-paypal/src/client.rs:188` "self.execute_policy(method, path, body, id, true).await" | Order create, authorize, capture and void retry a lost answer, a 429 or a 5xx inside one bounded call, under the same id |
| Unproven calls do not | `crates/table-paypal/src/secondary.rs:212` "Some(body), Some(id), false)" | Invoice and subscription mutations go once (`retry: false`), whatever came back |
| Tested | `crates/table-paypal/tests/client.rs:300` "async fn secondary_mutation_unknown_or_5xx_does_not_retry_without_proven_idempotency()" | A 500 or a transport error on an invoice create leaves exactly one request on the wire |
| The window | `crates/table-app/src/pipeline/resolve.rs:28` "pub(crate) const REQUEST_ID_KEPT_SECS: i64 = 6 * 3600;" | A lost create is re-POSTed with the same id only inside six hours, which returns the first order if one was made. At `:379` "Past the window with no order id it is parked." |
| No new identity | `crates/table-app/src/pipeline/resolve.rs:8` "operation identity is never minted" | What the resolver cannot settle is parked for the owner with one audit row, and is not sent again |
| Read after commit | `crates/table-app/src/pipeline/resolve.rs:30` "a read that races the commit sees the old" | `SETTLE_SECS` (5) holds back the read-back of a call whose answer was lost in this process |

## Judgment calls worth copying

- **The key is part of the operation's identity, not of the HTTP attempt.** Deriving it
  from (deal, attempt, operation) means a process restart, a resolver pass and an
  in-call retry all speak the same key without having to find it again.
- **Retry is a per-endpoint grant, stated in a test.** The test name says the rule:
  no retry without proven idempotency. It fails if someone flips the secondary path
  to the retrying default.
- **The window has a number and a source.** The six hours come from the project's
  research notes on the Orders v2 idempotency store. Past it, the code parks instead
  of re-sending. PayPal's published OpenAPI files, read raw on 2026-11-03
  (https://github.com/paypal/paypal-rest-api-specifications), agree. The Orders v2
  spec says the server "stores keys for 6 hours. The API callers can request the times
  to up to 72 hours by speaking to their Account Manager". The Payouts spec says
  "stores keys for 30 days". So one vendor documents two windows, and they can be
  changed by request.

## Gaps against the technique

- **Capture and void retry under a window nobody documented.**
  `crates/table-paypal/src/client.rs:393` "UNVERIFIED: that Payments v2 capture and void keep `PayPal-Request-Id` like Orders v2".
  Half of this is now settled. The Payments v2 OpenAPI file declares
  `PayPal-Request-Id` on both capture and void as "A unique ID identifying the request
  header for idempotency purposes", and shows a capture repeated under the same id
  answering 200 OK. It states no retention window. Under the corrected technique, a
  retry inside one bounded call is keyed, and a re-send hours later is not. The tree
  also bounds a replay by the remote's own state:
  `crates/table-paypal/src/client.rs:395` "`final_capture: true` is what bounds a capture".
  A second capture of a fully captured authorization cannot move money twice. That is
  the alternative bound the technique now names. Its refusal has to read as "look",
  and the resolver does read back before acting.
- **A 5xx on an unretried write is `Api`, not `Unknown`, at the client.** With
  `retry: false`, a 500 returns `Error::Api { status: 500 }`, a refusal-shaped value.
  The corrected technique places an undocumented 5xx in unknown. Whether the pipeline
  above the client reads a 5xx on an invoice create as unknown was not traced in this
  pass.
- **A replayed answer is read for the resource it names.** PayPal's idempotency page
  says a retry reports "the status of a request at the current time and not the status
  of the original request". The resolver applies a read-back only after the step's own
  checks have passed:
  `crates/table-app/src/pipeline/resolve.rs:5` "the same truth checks the step itself runs (`Order::verify`, the amount and status checks)".
  That is the safe reading: nothing here assumes the answer it gets is the first one.
