---
domain: software-engineering
subject: import-normalization
last_touched: 2026-09-01
touched_by: librarian-inbox-writer
dry_streak: 0
---

# import-normalization

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox. Never swept before; it sat 8th on the worklist on demand alone.

## 2026-09-01 - inbox leads landed

Two leads (personas, systedo-case). New technique `overlay-merge-absence-semantics`, written as
a stated design choice not a universal: three states (absent / present-and-empty / filled),
empty means "not mentioned", wholesale replacement needs an explicit marker; the vacuous
guard ("all of them are X" is an authorization the empty set always wins); integrity must
cover the merged result, not its ancestor. `intermediate-representation` gains "nothing
writes to the IR after the waist has run" (an override runs before the waist or re-applies
every guarantee by name; a guarantee attaches at a moment). Applications:
`node--overlay-merge-absence-semantics` (personas `b6dcf28aa`, the landed fix and three
honest divergences) and `node--intermediate-representation` (systedo-case `6279066f`, the
legitimate override form with guarantees re-applied in the caller rather than the override).
Proposals: the vacuous-guard rule belongs beside `gate-sees-target` in quality-gates;
"digest what lands" is a checksum-scope sighting for versioning-snapshots.
