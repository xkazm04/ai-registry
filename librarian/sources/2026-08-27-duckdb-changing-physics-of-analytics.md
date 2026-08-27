---
source: web
url: https://www.allthingsdistributed.com/2026/08/duckdb-and-the-changing-physics-of-analytics.html
title: "DuckDB and the changing physics of analytics"
author: Andy Warfield (posted by Werner Vogels)
kind: first-party practitioner account (hybrid: vendor announcement + systems-design essay)
mined_on: 2026-08-27
words: 3583
skill_version: 0.13.0
extracted: 11
picked: 9
accepted: 4
proposed: 1
already_covered: 0
declined: 0
leads: 2
untriaged: 2
dispatched: 1
fetches_spent: 1
---

# DuckDB and the changing physics of analytics, 2026-08-27 — the source located the hole and a connected project had already measured it

Operator framing at invocation: the `software-engineering` bundle is weak on
database selection and "often overlooks other variants than postgres/pglite".
That framing turned out to be correct, structurally verifiable, and *understated*.

**The run's shape is the lesson.** The post is a first-party practitioner
account wrapped around an acquisition announcement, and by the corroboration
table it can authorize almost nothing on its own. It did what its class is
reliable for: it located a real hole. Everything that landed was authorized by
something else — peer-reviewed literature for one technique, and a connected
project's own measured benchmark for the rest. **The source originated four
findings and authorized none of them.**

## The hole, verified three ways before anything was written

1. **`data-layer` has four subjects and all four begin after the engine
   exists.** `data-access` (the seam above a store), `embedded-db` (operating
   one), `migrations` (evolving its schema), `sync-replication` (converging
   two). Stage zero is unowned. `sync-replication` is the only one of the four
   stating a selection rule, and it selects a replication topology.
2. **`embedded-db` opened by defining embedded as the transactional quadrant
   only** — "against a file the application owns, on a machine the application
   does not" — and all seven of its techniques (pooling, journal modes,
   single-writer discipline, quiet-window maintenance, pruning) are
   transactional-embedded disciplines. A denial that denied too much.
3. **`analytics-store-design` (llm-observability) enumerated its portability
   targets as four**: embedded relational, networked relational, document,
   analytical warehouse. The 2×2 has exactly one hole and it is the quadrant
   the source is about.

`research-map` reported near-empty with spurious hits, and `olap` returned zero
corpus-wide. Product names returning zero (`postgres`, `sqlite`) is the purity
floor working correctly; a *concept* returning zero is the finding.

## Accepted

### A1 — Analytical reads leave the serving store → `embedded-db` (new technique)

[`analytical-reads-off-the-serving-store`](../../knowledge/software-engineering/backend-platform/data-layer/embedded-db/techniques/analytical-reads-off-the-serving-store.md).
Form factor and workload shape as independent axes; three conditions that move
a read out (query shape, not row count; frequency and audience; contention);
the derived copy's reconciliation rules; which of the subject's duties the
second quadrant retires.

The strongest part is not from the source. **An analytical read routed through
a single-writer store buys the entire contention surface of
`single-writer-holder-discipline` for a workload that never needed exclusion**,
and the tell is an operating instruction: an analysis script that must be run
against a copy because something holds the store. Two connected trees carry
that instruction verbatim. It is a cost that appears in a comment before it
ever appears in a benchmark, and no latency comparison counts it.

### A2 — The `embedded-db` opening definition → corrected

Two clarifications added in the file's voice: *embedded* names a **placement,
not a location** (the same engine is at home as a server-side accelerator, a
CLI step, or inside a sandboxed runtime with no filesystem — the duties
enumerated are the end-user placement's, which is the hardest one), and the
form factor is **independent of workload shape**, with every duty below
belonging to the transactional shape.

### A3 — The four-backend enumeration → corrected, plus an amendment

`analytics-store-design` now enumerates five, and
[`analytical-copy-partitioning`](../../knowledge/llm-observability/telemetry-and-data/analytics-store-design/techniques/analytical-copy-partitioning.md)
carries an amendment: **the copy does not have to be a warehouse.**

This is the sharper half. The technique priced the fork as a warehouse
decision, which made the trigger a scale question and left exactly two answers
beneath it — better composites, or summing in the service at O(matched rows).
An in-process columnar engine over an exported file is a third, every
structural rule survives the substitution unchanged (they are rules about the
*role*, not the topology), and **the trigger therefore drops**: a deployment
that correctly refused a warehouse may still be well past the point where
scanning in the service is wrong. Discriminator stated in prose on this side,
per the cross-bundle rule: a warehouse earns its keep when the copy must be
queried from outside the service.

### A4 — The two trees → application

[`node--analytical-reads-off-the-serving-store`](../../knowledge/software-engineering/backend-platform/data-layer/embedded-db/applications/node--analytical-reads-off-the-serving-store.md).
Two projects on the same row store, both with a directory named for analysis,
neither running an analytical engine — one having measured the alternative in
detail, the other having declined it on the axis that does not decide.

## Proposed and dispatched

### A5 — A subject for storage-engine selection → [`docs/subject-proposal-storage-engine-selection.md`](../../docs/subject-proposal-storage-engine-selection.md)

`XL`, specified rather than half-built. Placement verified against
`taxonomy.json` (not a directory count): `backend-platform.data-layer` holds
four subjects against a cap of ten, so a fifth flat subject is legal; link
depths stated so the forger does not derive them wrongly.

**Four fragments folded in rather than banked separately** — the
single-host-baseline rule, constraint dating, deferred storage commitment, and
open-format-as-interop — plus two the source did not supply: a workload-class
inventory, and `evaluate-without-adopting` (below).

## The corroboration that mattered, and the correction to my own triage

I told the operator at triage that two connected projects "already carry both
engines in one tree". **That was wrong** — it came from a survey that swept
untracked `node_modules`. Neither project declares an analytical engine in its
product manifest. The accurate version is stronger:

- `politicas` isolates its benchmark dependencies in a private
  `scripts/db-bench/package.json` with its own lockfile, explicitly *"kept OUT
  of the product package.json so these native engines never touch the app's
  dependency tree or CI"*. That is how an engine gets evaluated at full
  fidelity without being adopted by accident — and it became proposed technique
  6 in the spec.
- Its `docs/db-architecture-guide.md` is 392 lines, four dated cases, five
  workload classes, cross-engine correctness checksums, fifteen numbered rules
  each citing its case. It contains **negative results** — a native graph
  engine lost every workload; a dedicated vector store was found premature —
  which is what separates a decision guide from a shopping list.
- **And its rule R3 recommends a hybrid, names the workload, and that workload
  still runs on the incumbent.** A decision recorded in a document and a
  decision present in the import graph are different states, and only the
  second one runs. No gate in that repository can see the gap, because a
  document recommending an engine and a script not using it are each
  individually valid.

That last one is the most transferable finding of the run and it came from the
tree, not the post.

## Leads (banked, with return conditions)

- **The acquisition and the licence.** The team behind the engine joined the
  vendor on 2026-08-26; the project continues under a foundation, MIT, same
  office, same team. No corpus clock to reset — the corpus never names the
  engine, correctly. **Return when** a connected project declares it in a
  product manifest (at which point the licence and stewardship facts become an
  application-layer concern), or when the stewardship terms visibly change.
- **Async I/O targeting NIC saturation on remote table scans**, stated as
  arriving in the engine's 2.0 release. A dated vendor fact with no home.
  **Return when** a connected project's analytical path reads from object
  storage rather than a local export — the technique landed this run assumes a
  local file and says nothing about remote scans.

## Untriaged (extracted, reached the table, not picked)

Recorded with anchors so a later run does not re-derive them. Nobody verified
these.

| # | Title | Nearest prior art | Anchor |
| --- | --- | --- | --- |
| A10 | Vectorised execution because the bottleneck moved off disk into CPU cache | none — engine internals, low actionability for application teams | *"rebuild query execution around batches of values small enough to stay in cache"* |
| A11 | The engine as the tool agents reach for when working with structured data | `llm-agent/*` — unmapped | *"developers, and increasingly agents, reach for when they work with structured data"* |

## Class observations, for the ledger

**First-party practitioner account, hybrid with a vendor announcement.** The
class row held exactly. The post was authoritative about what its author's team
observed and built, weak about the general claim, and the general claim is the
part that mattered — so it landed as decision rules with conditions attached
rather than as assertions, which is a different editing job and not merely a
lower trust level.

**Two new observations worth the ledger:**

1. **The fetch budget was nearly irrelevant and the corroboration was local.**
   1 of 3 fetches spent, and the primary it targeted 403'd twice at its
   canonical host before the author's own write-up supplied the mechanism. The
   run's real corroboration was a connected project's tree. For this class the
   instruction "reaching for the web is usually a sign the claim has no home
   yet" was correct — the claim had a home, and the home had already measured it.
2. **Survey connected projects with `git grep`, never `grep -r`.** The
   dependency claim I brought to triage was manufactured by sweeping vendored
   `node_modules`, and it inverted the finding: "both projects adopted it"
   versus "both projects evaluated it and neither adopted it" are opposite
   facts, and the second is the interesting one. A tracked-files-only survey is
   also ~100× faster on these trees; the untracked sweep timed out at 120s.

## Not done, and deliberately

- **No law proposed.** The mandatory cross-run convergence check found no
  shared root: prior runs' roots concern news-roundup class behaviour, not
  storage topology. Flagged for a future run — proposed techniques 1 and 2 in
  the spec are the kind of finding that could converge into one.
- **No numbers from the 2015 paper carried into the upper layer.** The core
  counts are a dated fact about dated hardware; the mechanism is the durable
  half and is what the spec instructs the forger to write.
- **No cross-bundle link** between `analytical-copy-partitioning` and the new
  `embedded-db` technique. Same fork seen from opposite ends; the discriminator
  is stated in prose on each side and recorded in both subject notes.
- **No project tree modified.** The operator authorized reading and a proposal
  only; the proposals are in the run report, not committed anywhere.

## For the next run

The spec's open question 4 is the one I would most like an answer to: the
reconciliation tree's failure mode is a storage decision that was measured,
documented, and never landed. A rule that a storage decision names its
implementing call site would catch it — but it may belong to an
engineering-process subject rather than to `storage-engine-selection`, and that
is a placement argument no single source can settle.
