---
domain: software-engineering
subject: ui-controls
last_touched: 2026-09-24
touched_by: intake-tPQgw
dry_streak: 0
---

# ui-controls

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox. Never swept before.

## 2026-09-01 - inbox leads landed

Two leads (kp, ascent). `micro-interaction-contracts`: hover and focus are two flags, reveal
on (hovered OR focused), each entry path clears only its own - the accessibility standard's
persistence clause says the same. `control-inventory-and-discovery`: when a shared primitive
is disabled product-wide, delete the export rather than leaving a null-rendering shim; a
symbol that still resolves emits no signal, a removed one enumerates the call sites.
Application `next--micro-interaction-contracts` at kp `c6a63199` (three shared-flag instances
and one additive counter-example). No application for the shim rule: the pattern is not
reachable from HEAD in ascent or kp, and the worker wrote nothing rather than fabricate.
Proposals: the two-flag rule and the coarse-pointer third modality belong in accessibility.

## 2026-09-24 - intake: call-site ownership

Source [[2026-09-24-shadcn-lint-tailwind-design-system]] (a video review; the primary is a design-system
linter repository with a paired, controlled eval). New technique `call-site-ownership`: the caller
places a control, the control owns its appearance, and the gate reads the property family, not the
value. It sits beside variant-discipline, which closed the variant set but left the passthrough
undivided. Application `react--call-site-ownership` at personas `a056cdc06`, experiment, better:
34 of 678 shared-button call sites restyle it, 17 of those with no raw value, and the project's full
lint config sees 0. Boundary with design-tokens, stated in both notes: design-tokens owns *which
value*, this subject owns *what a primitive lets a caller set*. Open: whether the 13 foreground-text
overrides are one missing quiet variant (a reader of the sites decides, the census cannot).
