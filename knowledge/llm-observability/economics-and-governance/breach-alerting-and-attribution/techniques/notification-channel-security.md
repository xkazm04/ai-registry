---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: notification-channel-security
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [operators configure their own webhook sinks, a receiver needs to verify an alert really came from the platform, reviewing the alert path as an egress surface, rotating a channel signing secret]
---

# Notification-channel security

The identity refusal governs what an alert payload may *say*; this technique
governs the *pipe*. A breach-alert delivery path is an outbound webhook
producer whose destinations are operator-supplied URLs — which makes it two
attack surfaces at once. Inbound to the receiver: an unauthenticated endpoint
that anyone who learns the URL can post forged "breach" alerts to, and forged
enforcement news drives real operator action (killing a key, capping a
customer). Outbound from the platform: an operator-controlled URL that the
platform's own infrastructure will connect to, which is the textbook shape of
a server-side request forgery. Neither surface is exotic; both have settled
field norms, and an alerting design that omits them ships the megaphone
unsecured.

## Sign what you send

Every delivered payload carries a signature the receiver can verify: an HMAC
over the **exact bytes delivered** (never a re-serialization — parse-and-re-sign
lets middleware drift break verification), keyed by a per-channel secret issued
when the channel is configured. The signed material includes a delivery
timestamp, and the receiver's verification contract is published alongside the
channel setup: check the signature, then check the timestamp against a short
freshness window so a captured payload cannot be replayed later as fresh
enforcement news. The timestamp is the **server's** delivery-time stamp — the
same clock that owns the accounting — never anything derived from client-supplied
event time.

Rotation is part of the contract, not an afterthought: verification accepts a
current and a previous secret for an overlap window, so a rotation never
produces a gap during which alerts fail verification and get dropped — a
security control that silences breach alerts has been pointed at the wrong
threat.

## Vet where you send

An operator-configured sink URL is untrusted input into the platform's own
egress. Minimum bar, applied at configuration time *and* re-checked at
delivery time (DNS answers change between the two):

- **Encrypted transport only** — plaintext destinations are refused at
  configuration, not warned about.
- **Private-address refusal** — resolve the destination and refuse addresses
  in private, loopback, and link-local ranges, and re-apply the check on every
  redirect hop. Without this, a tenant-facing "add a webhook" form is a probe
  into the platform's internal network.
- **Optional destination allowlist** — deployments that can enumerate their
  legitimate sinks (a chat domain, a paging domain) should be able to pin
  them; the default stays open, the knob exists.

## Deliver with bounded trust

The sink's response is attacker-influenced data. Bound the connection with
tight timeouts and a response-size cap (off-path delivery protects the ingest
path, not the delivery worker's own resources), never follow redirects
across the vetting boundary, and never echo response bodies verbatim into
logs or operator surfaces — a hostile sink that answers with markup or
control sequences should find nothing that renders it. Failed verifications
and delivery failures are counted where the operator can see them, per the
off-path technique's non-silence rule.

## Decision rules

- When a channel type is added that carries its own authentication (a paging
  provider's token API, an email relay with credentials) → the signing
  requirement is satisfied by that channel's native authentication; do not
  bolt a second signature on.
- When an operator asks to skip verification "because the URL is secret" →
  a URL is a bearer credential that leaks through logs, referrers, and chat
  scrollback; the answer is signing, not URL secrecy.
- When the platform is single-tenant and self-hosted → the SSRF surface
  collapses (the operator already owns the network), but signing keeps its
  value: the receiver still cannot otherwise tell the platform's alerts from
  anyone else's POST.

## When not to use this

The structured log line — the one delivery channel with no external
dependency — needs none of this; it never leaves the process boundary.
Authenticated per-tenant surfaces (the console, the limits-usage endpoint)
carry their own access control and are out of scope. And do not let channel
security ambitions grow into guaranteed delivery: signing and vetting harden
the best-effort pipe, they do not change its best-effort semantics.
