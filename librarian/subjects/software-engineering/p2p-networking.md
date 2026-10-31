---
subject: p2p-networking
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# p2p-networking

First touch: [[2026-08-22-9]], external reconcile against `tailscale/tailscale`
@ `de9ec7e` (1.103.0). Gained `go--peer-state-honesty` - second stack;
single-stack debt cleared. The connection-lifecycle hint was refuted BY ABSENCE
OF THE OBJECT: the transport is connectionless, so "one session per peer pair,
chosen deterministically" has no referent - the technique should note when its
central noun does not exist.

## Open leads (banked, convergence rule applies)

- Ask the decider, don't mirror it: the display calls the same function the
  data path calls, so divergence is impossible rather than detectable.
- A trust window with an explicit until-timestamp makes demotion free - the
  read-side comparison IS the demotion.
- N layer witnesses, each written by exactly one subsystem, merged by union -
  disagreement rendered, never papered over.
- An optional-to-non-optional boundary that zero-fills is the standard
  laundering mechanism for unknown. (FOURTH-family member: see
  unknown-is-not-a-value in [[2026-08-22-9]].)
- A field comment naming a duration is a derivation that can drift from its
  constant (documented 2 minutes vs shipped 45s).

## Cross-subject proposals

- resilience-and-reconnection seam confirmed rich (link-change rebinding,
  endpoint re-derivation) - untouched, banked for a future wave.
- The zero-filling optional accessor as an observability-lane hazard note.
- Timing constants that state what they trade - constants-as-documented-policy.

## Applied to the technique layer

- 2026-08-22-10: `peer-state-honesty` now cites the promoted `unknown-is-not-a-value` law - its own text was already the family's cleanest prose ([[2026-08-22-10]]).

## Architecture review - 2026-10-31

First architecture review, against `0b2e4954c`. All nine documents read in full.
The Go application's citations were re-read at the pinned commit `de9ec7ee`
(`VERSION.txt` 1.103.0): every anchor resolves and the two deviations stand. Two
small inaccuracies surfaced there. The Rust application cites a consumer tree with
no commit pin; a current read shows the anchors drifted while the substance,
including the deviation, still holds. The 2026-08-22 lead that connection-lifecycle
should say when its central noun does not exist is now backed by WireGuard's own
protocol page and becomes a clarify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/p2p-networking",
  "date": "2026-10-31",
  "baseline": "0b2e4954c",
  "digest": "sha256-b2:c6291d8abe49c1d3",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full. Tailscale sources re-read at de9ec7ee for every anchor the Go application cites. The Rust application's consumer file was read at its current state, not at an unrecorded 2026-08-21 state. Primary protocol sources opened: WireGuard protocol page, RFC 6762. Not evaluated: any runtime, the consumer tree at the date of the original verification.",
  "counterexamples": [
    "A connectionless transport (WireGuard) has no session object, so 'one session per peer pair' and session teardown have no referent; the honesty pressure moves to a recomputed path claim.",
    "A WireGuard-only Tailscale endpoint keeps reporting a direct address after the trust window lapses, because addrForSendLocked has no DERP address to fall back to.",
    "Revoking the last paired device leaves a listener bound on every interface: no data crosses, but the surface stays open until process exit.",
    "A peer whose online status the control plane declined to report renders as offline, a negative claim built on no evidence."
  ],
  "sources": [
    {
      "url": "https://github.com/tailscale/tailscale/tree/de9ec7ee",
      "result": "Re-read endpoint.go, magicsock.go, ipnstate.go, local.go, userspace.go, views.go, tailcfg.go, cli/status.go, cli/cli.go. Confirmed: populatePeerStatus calls addrForSendLocked and sets CurAddr only with no DERP address; trustUDPAddrDuration = 6500ms, heartbeatInterval = 3s, sessionActiveTimeout = 45s; Active comment says 'past two minutes'; Online is '*bool' with 'nil means unknown, or the current node doesn't have permission to know' and is flattened by ValuePointer.Get, which 'returns a zero value'. Refuted in detail: the health print condition names Starting, but sits inside the !ok branch that Starting never reaches; the trust-lapse 'send to both' has a WireGuard-only exception."
    },
    {
      "url": "https://www.wireguard.com/protocol/",
      "result": "Section heading 'Connection-less Protocol'; 'You don't need to worry about asking it to reconnect or disconnect or reinitialize'. Supports a boundary note in connection-lifecycle."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6762.html",
      "result": "Section 10.1: a host about to invalidate records 'SHOULD send an unsolicited Multicast DNS response packet' with 'an RR TTL of zero'; Section 10 recommends 120 s for host-name records and 75 minutes for others. Supports discovery-advertisement's goodbye and TTL hygiene."
    },
    {
      "source": "Consumer tree, companion_api.rs and pairing.rs (current read)",
      "result": "File now 704 lines, not 658. authorize at :227 (cited :223), REMOTE_APPROVAL_ACTIONS :258 (:254), RemoteSession :262 (:258), CompanionAct :433 (:425), require_remote_approval :607 (:591). Unchanged: AUTH_FAIL_DELAY_MS = 350 at :58, MAX_REPLY_CHARS = 500 at :61, static PORT OnceLock at :63, start_if_paired :73, ensure_started :90, pairing.rs any_active_device :90 and ensure_started call :290, no stop path. is_lan_peer admits ::1 and v4-mapped v6 only, as the text says."
    }
  ],
  "documents": {
    "p2p-networking.md": {
      "disposition": "keep",
      "reason": "Scope, the pairing boundary and the six technique summaries agree with the techniques. Links resolve."
    },
    "techniques/connection-lifecycle.md": {
      "disposition": "clarify",
      "reason": "Add a boundary: over a connectionless transport there is no session object, so the tie-break and session teardown have no referent and the discipline moves to the path claim and peer record (2026-08-22 lead, backed by WireGuard's 'Connection-less Protocol')."
    },
    "techniques/discovery-advertisement.md": {
      "disposition": "keep",
      "reason": "Goodbye-on-exit and announcement TTL match RFC 6762 sections 10 and 10.1; minimized-surface and hostile-input rules are design guidance, not disputed claims."
    },
    "techniques/exposure-controls.md": {
      "disposition": "keep",
      "reason": "Allowlist, one door at the serving edge, read-at-use revocation and the no-secrets rule are coherent. The Rust application proposes an unnamed rung (tear the surface down when the last grant goes); that is an extension lead, not a defect here."
    },
    "techniques/manifest-negotiation.md": {
      "disposition": "keep",
      "reason": "Filter-then-summarize, intersection, ignore-unknown and verify-against-manifest are internally consistent and hand off to sync-replication cleanly."
    },
    "techniques/peer-state-honesty.md": {
      "disposition": "keep",
      "reason": "Four-state vocabulary, restart voids connected, and per-instrument timestamps are confirmed by the Go application's re-read sources."
    },
    "techniques/resilience-and-reconnection.md": {
      "disposition": "clarify",
      "reason": "'multicast filtering is direction-blind in neither direction' says nothing; the point is that filtering need not be symmetric."
    },
    "applications/go--peer-state-honesty.md": {
      "disposition": "clarify",
      "reason": "All anchors verified at de9ec7ee. Two corrections: the health print reaches only NoState (Starting returns ok and never enters that branch); the trust-lapse 'send to both' excludes WireGuard-only endpoints, which keep a direct claim."
    },
    "applications/rust--exposure-controls.md": {
      "disposition": "reverify",
      "reason": "No commit pin. A current read shows five anchors shifted (authorize :223->:227 and others) while the guards, enumerations, projection and the never-closing listener all still hold. Re-anchoring needs a pinned commit of the consumer tree."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items the record above named. The Go application's
citations were all re-checked at `de9ec7ee` this run, so its `verified_on` moved
to 2026-10-31; the pin date in its prose is unchanged. The Rust application was
not touched and keeps `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/p2p-networking",
  "date": "2026-10-31",
  "baseline": "0b2e4954c",
  "digest": "sha256-b2:894d2f6be97cd9c7",
  "disposition": "reverify",
  "coverage": "All 9 documents decided. Three edited documents re-read after the change; the other six are byte-unchanged and keep their dispositions. Sources as in the record above, opened this run. No runtime executed.",
  "counterexamples": [
    "A connectionless transport (WireGuard) has no session object, so 'one session per peer pair' and session teardown have no referent; the honesty pressure moves to a recomputed path claim.",
    "A WireGuard-only Tailscale endpoint keeps reporting a direct address after the trust window lapses, because addrForSendLocked has no DERP address to fall back to.",
    "Revoking the last paired device leaves a listener bound on every interface: no data crosses, but the surface stays open until process exit.",
    "A peer whose online status the control plane declined to report renders as offline, a negative claim built on no evidence."
  ],
  "sources": [
    {
      "url": "https://github.com/tailscale/tailscale/tree/de9ec7ee",
      "result": "Basis for both Go application corrections: status.go:145-155 enters health printing only inside !ok, which Starting never reaches; endpoint.go:584-589 returns a WireGuard-only endpoint's UDP address with no DERP address, chosen by addrForWireGuardSendLocked (:604-650) by latency or at random."
    },
    {
      "url": "https://www.wireguard.com/protocol/",
      "result": "'Connection-less Protocol' section heading; basis for the connection-lifecycle boundary paragraph."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6762.html",
      "result": "Unchanged from the record above; supports discovery-advertisement keep."
    },
    {
      "source": "Consumer tree, companion_api.rs and pairing.rs (current read)",
      "result": "Unchanged from the record above; anchors drifted, substance holds, no commit pin."
    }
  ],
  "documents": {
    "p2p-networking.md": {
      "disposition": "keep",
      "reason": "Scope, the pairing boundary and the six technique summaries agree with the techniques. Links resolve."
    },
    "techniques/connection-lifecycle.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a 'check first that the noun exists' paragraph: over a connectionless transport there is no session, tie-break or per-peer teardown, and the discipline moves to the path claim and peer record, linking peer-state-honesty."
    },
    "techniques/discovery-advertisement.md": {
      "disposition": "keep",
      "reason": "Goodbye-on-exit and announcement TTL match RFC 6762 sections 10 and 10.1; minimized-surface and hostile-input rules are design guidance, not disputed claims."
    },
    "techniques/exposure-controls.md": {
      "disposition": "keep",
      "reason": "Allowlist, one door at the serving edge, read-at-use revocation and the no-secrets rule are coherent. The Rust application proposes an unnamed rung (tear the surface down when the last grant goes); that is an extension lead, not a defect here."
    },
    "techniques/manifest-negotiation.md": {
      "disposition": "keep",
      "reason": "Filter-then-summarize, intersection, ignore-unknown and verify-against-manifest are internally consistent and hand off to sync-replication cleanly."
    },
    "techniques/peer-state-honesty.md": {
      "disposition": "keep",
      "reason": "Four-state vocabulary, restart voids connected, and per-instrument timestamps are confirmed by the Go application's re-read sources."
    },
    "techniques/resilience-and-reconnection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'multicast filtering is direction-blind in neither direction' -> 'multicast filtering need not be symmetric'."
    },
    "applications/go--peer-state-honesty.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: health printing now said to reach only NoState, with the unreachable Starting clause named; added the WireGuard-only exception to trust-window demotion (:584-589, :604-650); verified_on 2026-08-22 -> 2026-10-31 after re-checking every anchor at de9ec7ee."
    },
    "applications/rust--exposure-controls.md": {
      "disposition": "reverify",
      "reason": "No commit pin. A current read shows five anchors shifted (authorize :223->:227 and others) while the guards, enumerations, projection and the never-closing listener all still hold. Re-anchoring needs a pinned commit of the consumer tree."
    }
  }
}
```
