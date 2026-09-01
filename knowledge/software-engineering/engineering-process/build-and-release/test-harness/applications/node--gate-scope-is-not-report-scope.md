---
layer: application
type: application
subject: test-harness
technique: gate-scope-is-not-report-scope
stack: node
verified_on: 2026-09-01
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Two scoped coverage gates, measured against their own trees

Both codebases had introduced a Vitest coverage gate the correct way: a
`coverage.include` naming only what the suite genuinely covers, floors set
just under the measurement taken the day they were written, and a comment
promising to extend the list as more tests land. One scopes to five named
files, the other to three directories with per-directory floors and an
explicit ratchet policy ("raise a floor, never silently lower it").

Neither sets the runner's instrument-everything switch, and neither publishes
a second, whole-tree report. So in both, that one list is simultaneously the
gate's population and the report's population.

## The paired comparison

Same suite, same inputs, same runner; the only variable is the include set.
Arm A is the shipped configuration. Arm B adds `all: true` with
`include: ["src/**/*.{ts,tsx}"]` and floors dropped to zero, so the gate
cannot influence the measurement.

| | Arm A (shipped) | Arm B (whole tree) | source files in `src/` |
| --- | --- | --- | --- |
| codebase 1 | **5 files**, 95.74% lines | **1,171 files**, 4.32% lines | 1,156 |
| codebase 2 | **175 files**, 58.54% lines | **1,529 files**, 68.98% lines | 1,529 |

Both arms ran each project's full suite — 20 files / 153 tests for the first,
782 files for the second — and every threshold still passes in arm B, because
neither gate's population changed.

**1,070 source files in the first codebase are absent from its report
entirely** — not reported at 0%, absent. The headline 95.74% is true, and it
is a statement about five files. The second codebase is the more instructive
case and cuts the other way: its whole-tree number is **68.98%**, so the suite
is genuinely broad, and the scoped report was *understating* the project. What
it hides is not a bad number but a population — **490 files sit at 0% and none
of them were visible before**, and no floor in the three gated directories can
ever be lowered by a four-hundred-and-ninety-first.

## What the trees say that the configuration does not

The stronger evidence is structural and neither team built it deliberately.
Both include lists carry a comment committing to grow them — "extend as more
batches land", "promote them into the gate as their batches grow". That is an
obligation with no instrument behind it: nothing fails, nothing warns, and
nothing reports when the list falls further behind the tree. It is the shape
that converges on absent.

The second codebase makes the ratchet's blind spot concrete. Its floors are
described as ratcheting so that "new untested code in these dirs that drops
coverage below the floor fails CI" — which is exactly right, and scoped to
three directories out of a 1,529-file tree. A new feature directory written
with no tests lowers no floor in those three, so the mechanism built to stop
coverage decay cannot observe the most common way coverage decays. Nobody
designed that; it follows from the denominator being hand-chosen.

## The change, and what it deliberately does not do

Both gates keep their scoped include sets and their floors untouched — the
technique's claim is that the two populations differ, not that the gate should
widen. Each config gains whole-tree instrumentation plus a `json-summary`
report, so the untested surface becomes a visible number with a trend line
while the gate keeps protecting what it protected.

## What this realization cannot do

The whole-tree number is a report, not a gate: nothing fails when it drops,
and a reader who only watches CI status will not see it move. Making it a gate
would require a second threshold with its own floor, which neither codebase
has adopted, and which is the wrong first step — the point of the number is to
be looked at before anyone knows what floor is honest.

One test in the first codebase was observed failing twice and passing twice
across four runs, on both the old and the new configuration, with no code
change between them. It is a flake, it predates this change, and it carries no
quarantine label — which is the neighbouring failure mode in the same golden
path ([flake-lifecycle](../techniques/flake-lifecycle.md)) and is left for its
owner rather than fixed here.
