---
layer: application
type: application
subject: p2p-networking
technique: exposure-controls
stack: rust
status: forged
verified_on: 2026-08-21
verified_against: rust@1.80
---

# Four closed doors, and one that never shuts

A desktop application serving a phone on the same network is the asymmetric
case of this technique: one peer listens, the other dials, and the listener
holds everything worth protecting. The realization is a single axum server
(`src-tauri/src/commands/fleet/companion_api.rs`, 658 lines) whose module
doc opens by naming security as the product and then numbers its rules — and
the numbering is not decoration, it is the evaluation order.

## The guards are ordered, and the order is the argument

`authorize` (`:223-249`) runs three checks in a fixed sequence, and each one
is cheaper and blunter than the next:

1. **Peer address.** `is_lan_peer` (`:192`) admits loopback, RFC-1918 and
   link-local only, on both v4 and v6-mapped addresses. Its comment states
   the reason for its position: *"Guard #1 — evaluated before any token work
   so an internet-exposed misconfiguration answers 403 with zero
   secret-bearing computation."* The technique asks for exposure to be
   enforced at one door; this stack additionally sorts what happens at that
   door so the cheapest refusal is also the one that leaks least.
2. **Bearer token**, resolved to exactly one paired device by constant-time
   comparison, with the device store re-read *per request*
   (`pairing::load_devices`) so a revocation is effective on the next call
   rather than the next restart.
3. **Failure cost.** A bad token sleeps `AUTH_FAIL_DELAY_MS = 350`
   (`:58`) before answering 401.

The LAN gate carries a unit test that asserts both directions —
`10.x`, `172.16.x`, `192.168.x`, `169.254.x` and loopback pass; public
addresses fail (`:607-609`). An exposure control with a test naming the
addresses it refuses is a control that survives a refactor.

## Two enumerations, both closed by construction

The technique's demand is to enumerate what is shared, never what is
withheld. This code does it twice, at two different grains:

- **Verbs.** `CompanionAct` (`:425-442`) is an enum of exactly five
  variants — approve, reject, reply, wake, kill. A phone cannot express a
  sixth request; there is no string dispatch to fall through.
- **Answerable approvals.** Within `approve`/`reject`,
  `REMOTE_APPROVAL_ACTIONS` (`:254`) narrows further to two action
  names, and `require_remote_approval` (`:591-600`) re-checks that the
  specific approval id is still in the pending set before acting. Its
  refusal names all three ways it can fail: *"unknown, resolved, or not a
  fleet proposal"*.

That second gate is the interesting one, because it is a **grant whose
precondition is re-verified at use**, not at connect. An approval that
resolved on the desktop between the phone's render and the phone's tap is
refused, not replayed.

## The projection is the exposure record

The technique asks that an exposure name the *fields* that cross, not just
the resource. `RemoteSession` (`:258`) is that record as a Rust struct: the
phone receives a fixed shape, and each field is chosen rather than inherited.
The `label` field carries the rule in a comment — *"Never a filesystem
path"* (`:261`) — which is the field-level version of the same discipline,
enforced by the type rather than by the caller remembering.

Reply text is bounded at `MAX_REPLY_CHARS = 500` (`:61`), with the
reasoning stated as a fact about the peer: *"the companion sends short
verdicts, not documents."* A cap justified by what the peer is *for* ages
better than one justified by a buffer size.

Because the response is built from a projection struct rather than
serialized from the domain model, a field added to a session next quarter
is absent from the phone by default. That is the allowlist property the
technique argues for, obtained structurally rather than by vigilance.

## The deviation: the listener outlives the trust that opened it

The server exists only after an operator pairs a device — `fleet_pair_device`
starts it (`pairing.rs:290`), and on restart `start_if_paired` (`:73`)
consults `any_active_device` (`pairing.rs:90-92`) and binds only if a
non-revoked device exists. Creation is properly gated on trust.

Nothing closes it. `ensure_started` (`:90`) memoizes the bound port in a
`static PORT: OnceLock<u16>` (`:63`), there is no stop path anywhere in the
module, and revoking the last device does not unbind the socket. The port
stays open on `0.0.0.0` until the process exits — and because `OnceLock` can
be set once, the server could not be rebound on a different port even if a
stop existed.

The data consequence is nil: with every device revoked, `authorize` fails at
guard 2 for every request, so nothing crosses. The consequence is
[creation-names-reaper](../../../_laws.md#creation-names-reaper): a listening
socket on every interface, created by an act of trust that has since been
withdrawn, whose only reaper is application exit. The user's revocation
removes their access and leaves the door standing.

The technique's own framing predicts this shape — pairing answers *who*,
exposure answers *what*, and neither answers *for how long the machinery
stays up*. Worth stating as a rung the standard does not yet name: an
exposure surface should be torn down when the last grant that justified it
is gone, and "no data crosses" is not the same as "the surface is closed".
