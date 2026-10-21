---
layer: application
type: application
subject: show-segment-format-design
technique: segment-as-state-table
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@6
applied: code
ab_verdict: better
---

# The operator's view of the table dropped every rule added after it was written

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 5258d9c, 2026-10-21. The
workspace pins TypeScript 6.0.3. The "before" state is e4266cc, the commit the fix sits on.
The fix is 5258d9c.*

The Rust application of this technique shows Shadowrunr's segments as TOML tables run by
one generic interpreter. This application reads the other side of the same tables: the
operator console (`apps/console`, React and TypeScript), whose Segments page prints each
table so the owner can see what a format allows before and while it airs. The page reads
one daemon call, `segments.tables`, and its model claims fidelity to it:

- `apps/console/src/pages/segments/model.ts:3 "nothing is invented"`

## What the view did not show, before

`segments.tables` was a hand-written projection of the table struct. It was written when
a table had states, ops, commands, a poll clock, a handover rule and transitions. Since
then the tables gained four more kinds of rule, each enforced by the interpreter: a cold
open with a floor and a ceiling (SEG-01), per-state rules that narrow the ops a state
allows (SEG-01's cold open allows 4 of the segment's 9), the screens a segment may put up,
and SEG-02A's multi-act arc with its search limit. None of them reached the projection.
The console printed SEG-01 as a segment with 9 open ops in every state, and SEG-02A as a
segment with no clock beyond its polls.

- `crates/shadowrunr-segments/data/segments/seg-01.toml:65 "min_s = 60"`
- `crates/shadowrunr-segments/data/segments/seg-01.toml:73 "[state_rules.cold_open]"`
- `crates/shadowrunr-segments/data/segments/seg-02a.toml:61 "[arc]"`

The card's own prose also restated the handover rule in different terms from the
interpreter's. It said the segment hands over when the viewer count holds for the
sustain window "or at" the ceiling, and drew the grace period only after the ceiling.
The interpreter does two things the sentence left out. The audience path does not start
counting until the cold open has ended. The grace period follows whichever path fired.

- `crates/shadowrunr-segments/src/runtime.rs:1876 "The audience path waits for the cold open"`
- `crates/shadowrunr-segments/src/runtime.rs:1869 "if now_ms - since >= i64::from(rule.grace_s) * 1000"`

## The instrument, and the result

A daemon test reads the four TOML sources the interpreter compiles in, collects every key
path each table declares, and requires each one in that table's `segments.tables`
payload. It reads the declaration, not the projection, so it cannot inherit the
projection's omissions.

- `crates/shadowrunr-daemon/src/catalog.rs:589 "fn segment_tables_carry_every_declared_rule"`

| | before (e4266cc) | after (5258d9c) |
| --- | --- | --- |
| declared key paths missing from the payload | 26 | 0 |
| rule blocks missing (cold open, state rules, screens x4, arc, search limit, Plebiscite length) | 9 | 0 |

The projection now destructures every table struct without `..`. A rule added to a table
fails to compile until the operator's view carries it, and the test catches a rule that
compiles but is dropped.

- `crates/shadowrunr-daemon/src/catalog.rs:338 "Every struct is destructured without"`

The card prints the screens, the cold open, a per-state table, the search limit and the
arc. The handover line now says what the interpreter does:

- `apps/console/src/pages/segments/SegmentCard.tsx:182 "after the cold open"`
- `apps/console/src/pages/segments/SegmentCard.tsx:182 "Either way the brain then has"`

Gates on the fix commit: the daemon and types crates' tests (246) and clippy with
`-D warnings`, `cargo fmt --check`, the contract drift check, typecheck, tests and lint,
and the console's typecheck, 412 tests, lint and build. The cost is page weight: the
tables page went from 296 to 336 DOM nodes at the project's 10x fixture. Its budget moved
from 320 to 365, with the reason recorded in the same change, as the budget file requires.

- `apps/console/budgets/perf.json:15 "measured 336 (+40)"`

## What it teaches the technique

**A view of the table is generated from the table, and checked against the
declaration.** The technique already generates the host's direction from the table so
prose and data cannot disagree. An operator's view is the same kind of copy. Projected by
hand, it keeps the table's shape on the day it was written. Each rule added afterwards is
enforced on air and missing from the screen the owner judges the format by. The check
that holds is the one this tree now runs: walk the declaration, and fail on any key the
view does not carry. A view's own sentence about a rule is prose duplicating the table,
and drifts the same way. Folded into the technique as a decision rule.

## Moved since the Rust application's read

The Rust application read this tree at 4025231 and listed two deviations that the tree
has since narrowed. The cold open now has a floor (`min_s`) as well as a ceiling. The
cold-open state narrows the segment's ops through `[state_rules.cold_open]`. Both landed
in b1b5774 (2026-10-20). Commands are still per segment, the handover rule itself still
has no floor, and SEG-02A still has no handover rule.

## What is still open

- **The console renders; it does not validate.** The table's own validation runs in the
  interpreter at load. The page cannot show a rule the validator would refuse, and does
  not try to.
- **The view shows the declaration, not tonight's values.** A config override (for
  example a cold-open ceiling of 0, which skips the cold open) changes the run but not
  the compiled-in table this page reads. Return: when the daemon exposes the effective
  per-run table.
  `crates/shadowrunr-segments/src/table.rs:204 "A config override of 0 skips"`
