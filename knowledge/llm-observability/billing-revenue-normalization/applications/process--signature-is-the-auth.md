---
layer: application
type: application
subject: billing-revenue-normalization
technique: signature-is-the-auth
stack: process
status: forged
refresh_by: 2026-11-20
---

# The 2026 billing-webhook landscape: Standard Webhooks, provider schemes, and where the field converged

A dated survey (August 2026) of billing-webhook practice, mapped to the
technique's claims. Refresh by the frontmatter date — the specification is
young and provider schemes still move.

## The technique's scheme now has a name: Standard Webhooks

What this subject describes as "the common contract" is being codified as
the **Standard Webhooks specification** (standard-webhooks.org), steered by
a committee drawn from Zapier, Twilio, Mux, ngrok, Supabase, Svix, and
Kong. Its shape confirms the technique element by element — HMAC-SHA256,
signature transmitted in a header (`webhook-signature`) beside a timestamp
(`webhook-timestamp`), a recommended replay tolerance of **300 seconds**,
verification over raw bytes, constant-time compare — and adds two things
the technique has absorbed as sharpenings:

- **The delivery id is bound into the MAC.** The signed content is
  `{msg_id}.{timestamp}.{payload}`, not just `{timestamp}.{payload}` —
  so the `webhook-id` header doubles as an idempotency key a replayer
  cannot re-label, and the spec explicitly recommends deduplicating on it
  (e.g. a short-lived seen-set spanning the tolerance window).
- **Asymmetric signatures are a first-class variant** (`v1a`, ed25519),
  with key-version prefixes so multiple schemes and rotations coexist in
  one header. This standardizes the technique's "prefer asymmetric where
  offered" stance.

Incumbent schemes still dominate deployed traffic: **Stripe** signs
`{t}.{body}` with HMAC-SHA256 in `Stripe-Signature` (the exact scheme the
sibling Rust application implements), with the same 5-minute default
tolerance; **PayPal** uses certificate-based verification; most smaller
billing providers ship Stripe-shaped HMAC. The field guidance corpus
(webhooks.fyi, ngrok's field guide, Hookdeck) is unanimous on the
technique's core: raw bytes, constant-time, timestamp bound, and — the
honesty point — that the timestamp is a staleness bound, with replay inside
the window handled by id-level dedup or idempotent persistence.

## Rotation practice

Field guidance converges on dual-secret verification with a bounded
overlap — typically **24–48 hours** — sized so retries of deliveries signed
under the old secret (provider backoff schedules run 1–3 days) do not
fail. One visible 2025-2026 movement: providers minting **short-lived
signing keys published via JWKS-style endpoints** rather than long-lived
shared secrets, shrinking leak blast radius; receivers cache the key set
and roll automatically. Same principle — the issued credential
authenticates — with the issuance loop tightened.

## What the wider survey confirmed about the sibling techniques

- **Identity-based idempotency is field standard, not one product's
  doctrine.** The usage-based billing platforms (Metronome, Orb, Lago —
  a category consolidating fast: Stripe acquired Metronome, Adyen
  acquired Orb, Salesforce acquired m3ter in 2026) all key event
  ingestion on caller-supplied idempotency keys and are explicitly
  designed for **out-of-order, at-least-once** event arrival — the
  premise behind deterministic-external-ids, the upsert, and the golden
  path's unordered-delivery rule.
- **The kind taxonomy's recognition split matches ASC 606 practice.**
  Ratable recognition over the service period for subscriptions is the
  standard treatment (the recurring kind's amortize-over-period promise);
  usage revenue is variable consideration commonly recognized as incurred
  under the **as-invoiced practical expedient** (the usage kind's
  recognize-at-timestamp). The taxonomy's own disclaimer holds: multi-
  element arrangements, constraint estimation, and refund liabilities are
  the accounting system's job, and the operational taxonomy deliberately
  stops short of them.
