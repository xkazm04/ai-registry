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
