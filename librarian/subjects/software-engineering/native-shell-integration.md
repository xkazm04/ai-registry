---
subject: native-shell-integration
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# native-shell-integration

First touch: [[2026-09-04-everywhere]] — an intake against a design-deep desktop
assistant repository. Class: YOUNG (forged 2026-09-03; this run took it from
five techniques to eight, one day after it was forged).

## State

Eight techniques. The subject was scoped around what a native process is
*entitled to do* — grants as a vector, presence as a separate axis, focus
custody, input synthesis, stream ownership — and it was scoped well: a source
carrying three unmodelled decisions about overlays landed entirely inside it,
with no argument for a new subject anywhere in the routing count.

## 2026-09-04 — /intake `Everywhere` (run `everywhere-build`)

Three techniques, all of them one enumeration's missing third item.

`non-stealing-overlay` closes on a rule that reads as complete: *"a defensive
teardown is judged by what remains **clickable**, not by what remains
visible."* Two axes, and the golden path's whole overlay section is a **focus
custody chain**. That framing is correct and it is short by one: an overlay
belonging to a product that *reads* other applications is also **queryable**,
and the accessibility layer it queries through will return the overlay itself
unless the overlay is excluded from that layer explicitly.

- **`query-transparent-overlay`** — exclude the surface from the accessibility
  layer rather than making it transparent to input. The rejected rungs are the
  valuable part and both were shipped first: input-transparency plus global
  low-level hooks (which broke under privilege-elevation dialogs, leaving the
  user's real mouse button stuck, and fought other hook-installing tools), and
  hide-query-reshow around each call (the call is synchronous, the compositing
  effect is not, so it flickers). Carries the acceptance test parallel to the
  neighbour's: judge the query axis by walking the tree from an inspection tool
  with the surface up, as the neighbour judges the click axis by clicking.
- **`observer-perturbation`** — the general one. A fullscreen opaque surface
  trips the *observed application's own* occlusion optimization, which
  hibernates its renderer and reparents its accessibility provider out of the
  subtree being queried; the query then returns a bare root and the cause is
  invisible from the query site. Also carries the isolation method: shrink the
  apparatus to a fraction of the screen and scale the coordinates, so the path
  exercises the full space while the target stays unobscured — a general way to
  ask "is my own instrument causing this".
- **`unexported-capability-ladder`** — the rungs for reaching a capability the
  platform does not export (symbol lookup rejected on per-call cost, hardcoded
  offsets rejected because they had already shifted between releases, an
  anchor inside the target's own binary taken), and the rule that ends the
  ladder: **when the instrument perturbs a subsystem, look for that
  subsystem's own opt-out before building a scoped replacement for its
  interface.** In the source, the opt-out found in chapter four retired two
  chapters of reverse engineering.

The worker was invited to fold the third into the second and declined, arguing
the rungs carry non-derivable content with no home in a technique about
perturbation. It also declined to invent the taken fix for the second, writing
the supported rule — fix at the perturbation, not at the reaction, because
there is one apparatus and an open-ended number of occlusion heuristics — and
giving the remedies as a ranked ladder instead.

Unapplied: no authorized fleet project ships a native process that reads other
applications' accessibility trees. Return condition in `applied.md`.
