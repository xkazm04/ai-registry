---
layer: application
type: application
subject: simulated-audience-testing
technique: cheapest-passing-tier-selection
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@7
applied: code
ab_verdict: better
---

# The console's heatmap bounded a cell over checks its runs shared

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 82c2c29, 2026-10-21. The
console resolves TypeScript 7.0.2. The "before" state is 44a8faa, the commit the fix sits
on. Figures come from the ten tournaments in the local `runs/sim` folder, n as stated. The
run data is private.*

The Rust application of this technique reads Shadowrunr's tournament report, where the
`shadowrunr-sim` crate writes `results.json` and its `heatmap.md`. This application reads
the other side of the same results: the operator console (`apps/console`, React and
TypeScript), whose Simulator heatmap is where the owner reads a tournament cell by cell
before choosing a tier. The page reads one daemon call, `tournament.results`, typed by the
contract the Rust side generates, and its ordering module claims agreement with the report:

- `apps/console/src/pages/simulator/cells.ts:3 "so the console and heatmap.md agree"`

## What the heatmap claimed, before

The report bounds only tallies whose n is runs. Each rule is judged once per run, so a
rule's tally counts runs, and its bound is sound on that axis:

- `crates/shadowrunr-types/src/results.rs:32 "Evaluated runs: pass + fail."`
- `crates/shadowrunr-sim/src/summary.rs:61 "t.fail_bound = rate_bound(t.fail, t.n);"`

The report's own cell table counts and does not bound. Its header is runs, judged, rule
fails, NP and NE, with no interval:
`crates/shadowrunr-sim/src/summary.rs:611 "rule fails | NP | NE"`.

At 44a8faa the console added a figure the report never stated. Its main column was
"Fails / provoked", and the model behind it summed every rule's fails and passes in the
cell and bounded the total. The doc comment read "The cell's fail rate across every rule,
with n and its 95% bound", and the return line was
`return { rate: n > 0 ? k / n : undefined, k, n, bound: rateBound(k, n) };`. The page lede
promised the band was "what the sample size lets us say". The sample size it used was
checks, not runs. The checks inside one run share its host, seed and room, so they are
not independent. A bound over them claims the precision of the check count.

Measured over the ten local tournaments (107 cells): **every cell, 107 of 107, showed a
bound whose n exceeded its judged runs.** The worst was a cell with 2 judged runs shown as
n = 95, with a fail band of 0 to 3.2%. The "thin" chip sat beside it, because the chip
reads judged runs. The band beside the chip read like a near-certain pass.

The same column hid a verdict state. The Rust cell table prints NE, but the console's
table had no not-evaluable column, so a cell whose checks could not be decided read only
as fewer checks.

## The fix

82c2c29 removes the pooled bound and counts instead, which is what the report does:

- `apps/console/src/pages/simulator/cells.ts:84 "The cell's rule checks, counted and never bounded."`
- `apps/console/src/pages/simulator/cells.ts:86 "judged runs and 95 checks is two observations, not 95"`
- `apps/console/src/pages/simulator/Heatmap.tsx:72 "Not evaluable"`
- `apps/console/src/pages/simulator/Heatmap.tsx:175 "counted, not bounded."`

The column reads rule fails over evaluated checks, with Not evaluable beside Not provoked.
The cell detail adds the void-judge and failed run counts, which the contract already
carried and the page did not print. It also says the cell is as many observations as it
has judged runs. Bounds stay where they hold, on each failing rule, from the rule's own
`fail_bound`
(`apps/console/src/pages/simulator/Heatmap.tsx:187 "t.fail_bound ?? rateBound(t.fail, t.n)"`).
The page test asserts the cell table draws no bound:
`apps/console/src/pages/simulator/layer2.test.tsx:84 "toHaveLength(0)"`.

After: the cell table draws 0 bounds, and across the same 107 cells no rule's n is above
the cell's judged runs. The console suite (412 tests), typecheck and lint pass.

## The rule this sharpened

The technique already said a bound over pooled checks is too narrow. This tree showed
where that bound comes back. The report writer had avoided it, and the next layer down
put it back, because a view can only see tallies. It cannot see which checks shared a
run, so it cannot count the runs that contained any failure. A view that sums across
rules or facts and then draws an interval has rebuilt the pooled bound. The rule it needed
is: **a total over rules is counted, not bounded, unless run identity reaches the view.**

## Deviations recorded

- **Quality bounds are still pooled over facts.** The cell detail draws each quality
  dimension's bound as the report computes it,
  `crates/shadowrunr-sim/src/summary.rs:66 "q.bound = rate_bound(q.true_count, q.n);"`,
  and the facts there are many per run. That is the Rust application's open deviation. It
  lives upstream, so this fix left it alone; the console now inherits it, not adds to it.
- **Mean quality still averages dimension rates.** It ranks, and the Rust report ranks the
  same way. It carries no bound and claims none.
