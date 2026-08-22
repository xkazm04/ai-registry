---
layer: application
type: application
subject: p2p-networking
technique: peer-state-honesty
stack: go
verified_on: 2026-08-22
---

# Peer-state honesty in Tailscale's magicsock and status pipeline (Go)

How a mesh VPN whose peers are reached over NAT, relays and direct UDP keeps its
peer list honest. Citations are against `tailscale/tailscale` `VERSION.txt`
1.103.0, commit `de9ec7ee` (2026-08-22) — an external tree, not the consumer repo
the sibling application cites, so the pin lives in prose rather than in
`verified_against`, whose contract is a stack runtime version.

The technique's vocabulary does not map one-to-one, and the mismatch is the
interesting part. There is no *discovered* state (peers arrive from a control
plane, not multicast) and no *connected* state (WireGuard is connectionless: no
session object exists to point at). What exists instead is a **path claim** —
relayed via DERP, direct UDP, or via a peer relay — and all the honesty pressure
lands there.

## 1. The path claim is recomputed, never stored

`populatePeerStatus` (`wgengine/magicsock/endpoint.go:2021`) reads no `isDirect`
flag. It calls `de.addrForSendLocked(now)` — **the same function the data path
calls to decide where the next packet goes** — and reports `CurAddr` only when
that call returns a UDP address *and no DERP address* (`:2035-2041`).

And that decider is honest about expiry. `addrForSendLocked` (`:577-594`)
returns the direct address alone only while `now` is not after
`de.trustBestAddrUntil`; once the trust window lapses it returns the UDP address
*and* `de.derpAddr` — "send to both, I no longer know" — and status renders that
as relayed, not direct. A lapsed proof demotes the claim with no demotion code
anywhere. The window is `trustUDPAddrDuration = 6500ms`
(`wgengine/magicsock/magicsock.go:4036`) against `heartbeatInterval = 3s`
(`:4032`): a direct claim survives roughly two missed heartbeats and no more, the
technique's "specific evidence, with a specific freshness" reduced to two
constants and a comparison.

`ps.Relay` (`endpoint.go:2025`) is set *unconditionally*, before any activity
check — it is the DERP home region, where traffic would fall back to, not where it
is going. The CLI disambiguates, rendering `relay %q` only when `CurAddr == "" &&
PeerRelay == ""` (`cmd/tailscale/cli/status.go:196-202`): the field is a
capability, the rendering is the claim.

## 2. Three witnesses, and none of them infers the others

`PeerStatus` carries `InNetworkMap`, `InMagicSock` and `InEngine`
(`ipn/ipnstate/ipnstate.go:320-330`), each with the same comment: *"In theory,
all of InNetworkMap and InMagicSock and InEngine should all be true."* Each is
written by exactly one subsystem — the control-plane view at
`ipn/ipnlocal/local.go:1606`, the path layer at `magicsock.go:3972`, the
WireGuard engine at `wgengine/userspace.go:1253` — and `StatusBuilder.AddPeer`
merges them by union, each flag set only if its witness set it
(`ipnstate.go:541-549`).

That is "discovery is not reachability" generalized to three layers: a peer known
to control but absent from magicsock is a *visible divergence*, not a peer
silently rendered as fine. The merge rule generalizes — every field is copied only
when non-zero (`ipnstate.go:517-537`), so a witness that does not know a fact
writes nothing rather than a confident zero over another's knowledge.

## 3. Timestamps carry their instrument

Three time fields, three different instruments, stated in the field comments:
`LastWrite // time last packet sent`, `LastSeen // last seen to tailcontrol;
only present if offline`, `LastHandshake // with local wireguard`
(`ipnstate.go:273-275`). Below them the endpoint keeps `lastRecvWG` and
`lastRecvUDPAny` as *separate* atomics — "destined for wireguard-go (e.g. not
disco)" versus "of any kind" (`endpoint.go:60-61`) — because disco traffic proves
the path works, not that the peer's application is alive. Staleness carries its
timestamp at the display too: offline peers render
`", last seen 3d ago"` via `lastSeenFmt` (`cmd/tailscale/cli/cli.go:573-586`),
which returns the empty string on a zero time rather than inventing an epoch.

## 4. An empty list says why it is empty

`tailscale status` never prints an empty peer table for a broken backend. It
calls `isRunningOrStarting` (`cmd/tailscale/cli/status.go:262-279`) first, which
enumerates five verdicts — stopped, logged out (with the login URL), not yet
approved by the tailnet admin, an unexpected state named verbatim, or
running/starting — and anything but that last case prints the reason and exits 1
(`:145-155`). Health messages are additionally printed when the state is
`Starting` or `NoState` (`:149-152`), on the stated reasoning that a weird state
deserves its context — the rule lands before the loop that would otherwise
render nothing.

## 5. Deviation: a tri-state online collapses to a boolean

`tailcfg.Node.Online` is a `*bool` whose comment is precise: *"A value of nil
means unknown, or the current node doesn't have permission to know"*
(`tailcfg/tailcfg.go:437-440`). The wire protocol models unknown correctly, and
the status pipeline then throws it away. `populatePeerStatusLocked` assigns
`Online: p.Online().Get()` (`ipn/ipnlocal/local.go:1614`), and `Get()` on a
`views.ValuePointer` returns *the zero value* when the pointer is nil
(`types/views/views.go:873-878`); `ipnstate.PeerStatus.Online` is a plain `bool`
(`ipnstate.go:276`). "Unknown" and "not permitted to know" arrive as `false`, and
the CLI renders `false` as a positive claim —
`if !ps.Online { offline = "; offline" + lastSeenFmt(ps.LastSeen) }`
(`cmd/tailscale/cli/status.go:174-176`). A peer whose liveness control declined to
report is shown as *offline*: a strong negative claim built on no evidence. `AddPeer` cannot rescue it either — `if st.Online { e.Online
= true }` (`ipnstate.go:538-540`) is one-directional, so the boolean can only be
promoted, never restored to unknown. The standard stays; the deviation is the
finding.

## 6. Deviation: a field comment that outlived its constant

`PeerStatus.Active`'s doc comment says the definition "currently means that there
was some packet sent to this peer in the past two minutes" (`ipnstate.go:280-285`),
while the code computes `ps.Active = now.Sub(de.lastSendExt) < sessionActiveTimeout`
(`endpoint.go:2033`) with `sessionActiveTimeout = 45 * time.Second`
(`magicsock.go:4016`). The comment concedes the definition is "subject to change" —
honest about the *policy*, wrong about the *number*. A freshness window documented
as 2.7× its actual value is a derivation whose recomputation contradicts it.

## Reconciliation summary

Confirmed: the path claim recomputed from the send-path decider rather than
stored; a trust window whose expiry demotes the claim without demotion code;
per-layer witnesses merged by union with non-zero-only copies; per-instrument
timestamps kept distinct; staleness rendered with its age; an empty peer list
replaced by five named reasons and a non-zero exit. Deviations: the tri-state
`Online` collapsed to a boolean, so *unknown* renders as the positive claim
*offline*; `Active`'s documented window (two minutes) contradicts its constant
(45s). Not present by scope: discovered-versus-proven identity marking — peer
identity is a node key vouched for by a control plane before magicsock sees the
peer — and watcher-liveness, which lives one level up in `Status.Health`.
