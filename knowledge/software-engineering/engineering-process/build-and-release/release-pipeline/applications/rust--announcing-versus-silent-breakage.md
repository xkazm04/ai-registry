---
layer: application
type: application
subject: release-pipeline
technique: announcing-versus-silent-breakage
stack: rust
status: forged
verified_on: 2026-09-20
verified_against: rust@2021
applied: code
ab_verdict: better
proof: ab-paired
---

# Silent breakage, consumer side - pinning an order the query never promised

A desktop application's spend rollup, read and then changed on 2026-09-20. The
stack witness is the crate's own edition pin, `edition = "2021"` in the manifest
the function compiles under, with the embedded SQL engine bundled as a build
dependency rather than taken from the host.

This is the **consumer half** of
[announcing-versus-silent-breakage](../techniques/announcing-versus-silent-breakage.md):
the technique's third aid, a perturbation test pinning a regularity the
contract never promised. The seam was chosen because it could falsify the
technique, and one half of it did.

## The seam

One function unions two ledgers into per-day, per-origin rows. Neither of its
two queries carries an ordering clause, so the order groups come back in is a
property of the plan the engine picks, not of the statement. The function does
not rely on that: it sorts explicitly afterwards, on `(day DESC, ledger,
origin)`, with a comment saying the sort lives there rather than in SQL so the
two ledgers interleave correctly.

**That comparator is total.** `(day, ledger, origin)` is the full grouping key
across both queries — the two ledgers are tagged distinctly, so no two rows can
tie — and a total comparator over a stable sort erases whatever order the engine
produced. The code is correct, and correct for the technique's own reason.

So the falsifying question was not "is there a bug here". It was: **if this
became non-total, would anything notice?** A CAUGHT outcome would have taught
that a well-written suite is already the aid and the technique's third rule is
redundant.

## What was measured

The function and its six tests were lifted into a standalone harness (no
product code changed, and the tree's own `cargo check --lib` is red at HEAD for
an unrelated build-script reason). Arms differ in the comparator only; a
`perturb` flag reverses the collected rows before sorting, modelling a
different engine order. Row count, values and multiset are identical in every
arm.

| arm | perturb | pass/fail | emitted sequence |
| --- | --- | --- | --- |
| A — full comparator | no | 6 / 0 | `dev_spend/cycle turn/chat turn/headless turn/maintenance` |
| A — full comparator | **yes** | 6 / 0 | **identical** — the order owes the engine nothing |
| B1 — no `origin` tiebreak | yes | **6 / 0** | `dev_spend/cycle turn/maintenance turn/headless turn/chat` |
| B2 — no `ledger` tiebreak | no | **6 / 0** | `turn/chat dev_spend/cycle turn/headless turn/maintenance` |
| C — no `day` term (control) | no | 5 / 1 | control fired |

- **Target**: tests failing when the sort is weakened to non-total while values
  and multiset hold. Predicted ~0; **measured 0 of 6, on two independent
  weakenings**, each with a provably different emitted sequence.
- **Floor**: arm A green, and the perturbation provably fires. Both held — A is
  byte-identical under perturbation, B1 is not, so a green arm is not a
  harness that failed to run.
- **Control**: arm C failed one test, so the harness can see an ordering change
  at all. Without it, eight green cells would have been unreadable.

Five of the six tests assert by keyed lookup (`.iter().find(...)`); the sixth
reads `rows[0]`. The module's one ordering assertion, `rows[0].day >=
rows[1].day`, covers the `day` term only — and one-sidedly: under arm C with
the rows arriving reversed it passes by luck, 6 / 0.

## What shipped

The comparator was extracted as a named function carrying the totality contract
in its doc comment, and one test added that feeds it two permutations and
requires the same sequence back. Verified in the same harness: it **passes on
the shipped comparator and fails on all three weakenings**, which is the
property the six existing tests do not have.

The in-tree gate could not run — the crate's build script rejects the shipped
capability set at HEAD, unrelated to this change and present before it. The
repository's staged hooks (formatting, secret scan) ran green on the commit.
That is an honest `ab-paired` proof on a standalone copy plus a red-at-HEAD
tree, not a green suite, and it is recorded that way rather than upgraded.

## What this realization cannot do

The test pins the comparator, not the pipeline. If a later change moves the
ordering decision back into SQL — adding an `ORDER BY` and dropping the Rust
sort — the test still passes while the property it guards has moved somewhere
it no longer looks. Pinning a *behaviour* consumer-side is only as good as the
assumption that the behaviour stays where the test found it.

It also does not generalize itself. The same audit over the rest of the tree
found 41 unordered aggregations of which 13 reach a sequence; the other 12 were
not examined, and a keyed-lookup suite would be equally blind at any of them.
The technique's second aid — a probe the consumer can run over their own call
sites — is what would close that, and it is not built here.
