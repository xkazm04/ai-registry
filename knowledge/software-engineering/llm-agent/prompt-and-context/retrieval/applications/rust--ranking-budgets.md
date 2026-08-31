---
layer: application
type: application
subject: retrieval
technique: ranking-budgets
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: code
ab_verdict: better
proof: ab-paired
---

# A budget of twenty that renders between 1.5K and 39K (Rust, Tauri + SQLite)

This tree gets the hard half of this technique right and the easy half wrong,
which makes it a good place to measure the difference. Its recall window is a
genuine shared budget rather than per-lane quotas — the module documents that
as a scar it earned — and the budget is denominated in **items**, over items
whose sizes span three orders of magnitude.

Measured against the live corpus, read-only, at `dd95173`.

## The shared-budget rule is implemented, and it was learned the hard way

`src-tauri/src/companion/brain/retrieval.rs` states the rule in its module
doc before any code: *"The episode window is a budget, not a per-lane quota."*
Both the ml and non-ml paths target one total, `RECALL_EPISODE_TARGET`, with
query-relevant older turns admitted first and a recency tail sized from
whatever the other lanes actually returned.

The doc also records why. An earlier version hard-coded a five-turn recency
tail on the assumption that the vector lane would contribute about twelve
more; with zero embedded episodes it contributed zero, so the richer build
delivered *fewer* memories than the leaner one. Sizing the tail from real
returns makes that asymmetry structurally impossible instead of a tuning
coincidence. That is this technique's dry-lane-waste argument, paid for.

## The budget is a count, and the items are not the same size

`const RECALL_EPISODE_TARGET: u32 = 20;` — twenty episodes. Over the 1,105
episode nodes in the live corpus:

| per-episode size | chars |
| --- | --- |
| min | 2 |
| median | 229 |
| mean | 484 |
| max | 4,918 |

Sliding a 20-episode window across the corpus in arrival order — the shape the
recency tail actually admits — the *rendered* size of that fixed twenty:

| a fixed 20-episode window renders to | chars |
| --- | --- |
| min | 1,560 |
| median | 8,528 |
| max | 39,212 |

**A 25.1x spread at a constant budget.** The technique already predicts this
("top ten items can be a tenth of the window or three times it"); the number
is what a real corpus does with it. Twenty episodes is not a budget in the
consumer's units, it is a count that the surrounding code reasons about as
though it were one — and the context window it spends is downstream of a
number that cannot see it.

## The tier framing is the non-additive part

`recall_synthesis.rs::format_briefing_section` renders the bundle as a briefing
with three fixed framings — a section header, a `## Key facts` header emitted
only when facts are non-empty, and a `## Salient obligations` header emitted
only when obligations are non-empty. Each is paid on the **first** admission to
its tier and costs nothing on every admission after.

That is precisely the cost non-additivity the amended technique describes, and
its weight is not uniform:

| the 83 chars of tier framing are | share of the rendered block |
| --- | --- |
| over the 20 smallest episodes (380 chars) | **17.9%** |
| over the 20 largest episodes (57,209 chars) | **0.14%** |

A 128x swing in the fixed-cost share, invisible to any per-item accounting.
An admission policy that walks the order pricing each item cannot see it at
all: the first item into a tier costs 83 chars more than an identical second
item, and no property of either item says so.

## Arms

- **Arm A — the budget as implemented**: admit until 20 items, cost modelled
  per item and uniform. Rendered size is whatever it turns out to be: the
  1,560–39,212 char range above.
- **Arm B — budget measured on the rendered artifact**: bisect over prefix
  length, rendering and measuring the briefing at each probe, ratcheting the
  best under-budget render, stopping inside a tolerance band.

Arm B is `better` on the only axis this comparison can measure: it bounds the
quantity the consumer actually spends, where Arm A bounds a proxy that varies
25.1x against it. Arm A's variance is not noise to be tuned out — it is the
consequence of measuring the wrong thing, and no value of
`RECALL_EPISODE_TARGET` fixes it.

## Shipped

Arm B is now the tree's behaviour. `format_episodes` admits the largest
trailing run of episodes whose *rendered* block fits a declared budget, and
reports how many it dropped; the fit bisects over prefix length, seeds its
first probe from a calibrated cost-per-item, ratchets the best under-budget
render, and stops inside a tolerance band. Four cases ship with it: everything
fits, the same count at 800x the size does not, the recency tail survives a
cut, and a single oversized episode is admitted anyway rather than blanking the
turn.

The measurement that motivated it is in the commit message, which is where a
reader of this tree will meet it.

## What this does not show

- **The project's test runner has not executed the committed tests.** The crate
  builds only under a feature combination another session held the build lock
  for throughout; `cargo check --lib --features desktop` type-checks both
  changed modules with no diagnostics, and the four cases were run standalone
  under `rustc` against the real size distribution, but the suite itself has
  not run them in place. The pre-commit gate (formatting, secret scan) did run.
- **Answer quality was not measured.** Whether a size-bounded window produces
  better companion turns than a count-bounded one needs an eval slice this tree
  does not have for the companion path. What is shown is that the previous
  budget did not bound what it was believed to bound.
- **The measurement is in characters, not tokens.** For the spread ratio that
  is immaterial — the ratio is what carries the finding — but the block is
  spent in tokens, and a token-denominated version would need the
  sampled-estimator half of the amendment to stay affordable on the request
  path.
- **Only the episode section was cut.** The `recall` block folds five other
  memory sections that remain count-bounded, so the block-level budget is still
  not enforced end to end; the episodes were simply the section with the 25x
  spread.
