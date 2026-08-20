---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: signature-is-the-auth
status: forged
laws: [server-owns-the-accounting-clock, aggregates-leave-identity-behind]
shared_with: []
use_when: [exposing a webhook endpoint that writes to a ledger, verifying a billing provider's signed deliveries, deciding what authenticates an inbound machine-to-machine call]
---

# Signature is the auth

A billing provider's webhook endpoint is an internet-reachable URL that writes
money into your ledger. It has no session, no logged-in user, no API key the
caller presents — its entire authentication is the provider's **signature over
the payload**, computed with a secret the provider issued to you at
registration. Verifying that signature is not input validation layered on top
of some other auth; it *is* the auth, complete and sufficient. Everything else
sometimes deployed around such endpoints — IP allowlists that break when the
provider migrates infrastructure, unguessable path segments that leak in logs,
"security by obscurity of the route" — is at best defense in depth and at
worst a substitute that quietly becomes the only lock.

The corollary that bites: **no field inside the payload participates in
authentication or identity decisions before the signature verifies.** The
body of an unverified request is attacker-composed by assumption. Identity
comes from the issued credential — the shared secret proving the provider
sent these bytes — never from an assertion inside the bytes.

## The scheme and its load-bearing details

The common contract is an HMAC (typically SHA-256) over a string that binds a
**timestamp to the exact body bytes** — `"{timestamp}.{body}"` — keyed by the
signing secret, transmitted in a header alongside the timestamp. Each element
earns its place:

- **The timestamp inside the MAC** prevents an attacker who captured one
  valid delivery from replaying it later with a fresh-looking clock: changing
  the timestamp invalidates the signature; keeping it trips the replay bound.
- **The raw body bytes**, not a re-serialization. Verify over the bytes as
  received, *before* JSON parsing. Any parse-then-re-serialize step changes
  key order or whitespace and produces intermittent verification failures
  that teams then "fix" by loosening verification.
- **Constant-time comparison** of the computed MAC against the presented one.
  A short-circuiting byte compare leaks how many leading bytes matched, and a
  forgeable oracle over your revenue ledger is not a theoretical concern
  worth saving one library call over.
- **A bounded replay tolerance** — a few minutes of allowed skew between the
  signed timestamp and your clock, absolute-valued in both directions. Wide
  enough for provider queue delay and modest clock drift; narrow enough that
  a captured delivery goes stale fast. Five minutes is the widely used
  default; treat widening it as a security decision, not a convenience fix
  for a machine whose clock is wrong.

Take the current time as an explicit input to verification rather than
reading the clock inside it — the replay bound is then testable with fixed
timestamps instead of being a flake generator.

## Decision rules

- **Missing signature header → authentication failure**, same as a wrong
  signature. There is no anonymous tier of a signed webhook.
- **Malformed header (missing timestamp, non-hex MAC) → failure**, not a
  parse warning. Every malformed-auth path terminates identically, so no
  variant becomes the bypass.
- **Verification failure → reject and log as a security signal.** Distinguish
  it in telemetry from downstream normalization errors; a burst of signature
  failures is someone probing, or a secret rotation you botched — either way
  a page, not noise.
- **Verification success is where trust begins, not ends.** Authenticity says
  the provider sent it; whether you track the event type is a separate,
  non-error decision.
- **Secrets are per-endpoint and rotatable.** During rotation, verify against
  the incumbent and the candidate secret and accept either; remove the old
  one on a schedule. A design that can only hold one secret forces a
  drop-deliveries window on every rotation.

## When not to use it

The technique is the HMAC-shared-secret pattern; the *principle* — the issued
credential authenticates, payload contents never do — is broader. A provider
offering asymmetric signatures (you hold only a public key) strictly improves
on the shared secret: a leak of your verification material no longer enables
forgery — prefer it where offered, same verification discipline. And for
calls where a real principal authenticates with credentials (a user-facing
API, an internal service with mutual TLS), signature-of-payload is redundant
ceremony — this technique is for deliveries from a party that cannot hold a
session with you.
