---
layer: application
type: application
subject: billing-revenue-normalization
technique: signature-is-the-auth
stack: rust
---

# Signature-is-the-auth in LightTrack's Stripe adapter (Rust)

LightTrack ingests Stripe webhooks through a framework-free adapter trait
(`crates/billing/src/lib.rs:22-37`): the caller hands `verify_webhook` a
header-lookup closure, the **raw body bytes**, and `now_unix` — no HTTP types,
so the same adapter serves a webhook handler or a poll loop, and the replay
clock is an explicit input rather than a hidden syscall.

## The verification path

`crates/billing/src/stripe.rs` implements the scheme the technique describes,
element by element:

- The header is Stripe's `t=<unix>,v1=<hex>` format; `verify_signature`
  (`stripe.rs:67-102`) parses out `t` and `v1`, failing on a missing header
  (`:57-58`), missing timestamp (`:83`), missing signature (`:84`), or
  non-hex MAC (`:93-94`) — every malformed variant terminates in the same
  `BillingError::Signature` arm.
- **Replay bound:** `TOLERANCE_SECS = 300` (`stripe.rs:26`), enforced
  two-sided with `(now_unix - ts).abs() > TOLERANCE_SECS` (`:88-92`) — the
  five-minute default, absolute-valued so a future-dated capture fails too.
- **The MAC binds timestamp to body:** `mac.update(t.as_bytes());
  mac.update(b"."); mac.update(body)` (`:97-99`) — HMAC-SHA256 over
  `"{t}.{body}"` keyed by the issued signing secret, computed over the raw
  bytes before any JSON parse (`serde_json::from_slice` only runs at `:60-61`,
  after verification succeeds).
- **Constant-time compare:** the final check is `mac.verify_slice(&expected)`
  (`:100-101`), the `hmac` crate's constant-time verification — never a `==`
  on byte slices.

## Authenticity vs relevance

The trait's doc comment states the decision table outright
(`lib.rs:28-30`): "An authentic event we don't track yields an empty vec (so
the caller still 200s and the provider stops retrying)." `normalize`
(`stripe.rs:106-117`) realizes it — only `invoice.paid` /
`invoice.payment_succeeded` / `charge.refunded` produce records; every other
authentic type returns `Vec::new()`, and the test
`untracked_event_is_ignored` (`stripe.rs:327-333`) pins that an authentic
`customer.created` is an empty success, not an error. Signature failure is
the only rejecting path.

## What the tests pin

The suite covers each load-bearing property with fixed clocks (possible
because `now_unix` is a parameter): a valid header parses the invoice
(`:253-271`); a single flipped body byte fails (`tampered_body_is_rejected`,
`:273-284`); a wrong secret fails (`:286-294`); and a signature aged one hour
fails the tolerance (`stale_timestamp_is_rejected`, `:296-306`).

One confirmation worth carrying: nothing in the payload participates in
identity before verification — the customer, amount, and object ids are read
only inside `normalize`, which is unreachable until `verify_signature`
returns `Ok`. The repo matches the standard on every point here; the upward
lesson it contributed is the *testability shape* — clock as parameter,
header as closure — which is what let every security property above be a
deterministic unit test instead of an integration hope.
