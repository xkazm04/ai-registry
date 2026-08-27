---
layer: application
type: application
subject: embedded-db
technique: analytical-reads-off-the-serving-store
stack: node
verified_on: 2026-08-27
verified_against: node@24
---

# Two trees on opposite sides of the rule — politicas and wellspring

Two applications on the same in-process row store, both with a directory named
for analysis, and neither running an analytical engine in production. One
measured the alternative in detail and has not landed it; the other declined it
on the axis the technique says does not decide. Together they are a better
argument for the rule than either would be alone, because the failure survives
having been studied.

Citations are against politicas at `68f10e4` (2026-08-27) and the grant-writing
tree at `6d7f240` (2026-08-25).

## The measurement exists, and it is unambiguous

politicas carries `docs/db-architecture-guide.md` — 392 lines, four dated
experiment cases over its own real datasets, harnessed in `scripts/db-bench/`.
Case #1 runs three engines over the 406k-row `vote_ballot` table with a
cross-engine checksum on every result (816 groups; 2,030 groups; **14,890,662**
agreement pairs, identical across all three, so the comparison is measuring
speed and not divergence).

Warm-median latency, in ms:

| workload | incumbent row store | column-oriented | ratio |
| --- | ---: | ---: | ---: |
| group-by, two keys | 101.7 | 7.2 | 14× |
| per-vote rate aggregate | 106.4 | 4.3 | 25× |
| **analytical self-join** | **5,635.8** | **131.5** | **43×** |

This is the technique's first condition measured directly: **the gap is a
function of query shape, and it widens with join complexity** — 14× on the
simple group-by, 43× on the self-join. A team that had benchmarked only the
group-bys would have found a real but survivable gap and generalised from the
shape where the gap is smallest.

Case #4 repeats the result on a different data structure and adds a negative
finding worth as much: over the co-voting graph, the heavy triangle self-join
went to the column-oriented engine at 20.3 ms against 412.6 ms for the
incumbent — while a *native graph engine*, benchmarked alongside, lost every
workload and was ~130× slower than a recursive CTE on deep traversal. The guide
records that as its rule R12, "no graph DB at this scale". The tree is
therefore not credulous about adding engines in general; it rejected one on
evidence in the same pass that it accepted another.

Load cost lands where the technique predicts: **81 ms** to stand up 406k rows
in the columnar engine from a flat export, against a 5.6-second query it
replaces.

## The rule was written down, and the workload never moved

The guide's rule R3 is explicit — the serving store keeps the transactional and
graph work, the analytical layer goes to the columnar engine, and it names the
workload: *"the `kg-compute` workload **is** A3."* A3 is the 5,635.8 ms
self-join.

`scripts/data-analysis/kg-compute.ts:53` imports `getStore` from the
application's store module, and `:94` opens it. The named workload is still
running on the engine measured slowest at it.

**Nobody designed this, and it is the finding.** Every step was correct in
isolation: the benchmark was built, the correctness cross-check was run, the
recommendation was derived and written as a numbered rule with its evidence
cited. What did not happen is the part with no artifact of its own — the
adoption. A decision recorded in a document and a decision present in the
import graph are different states, and only the second one runs. The gap is
invisible to every gate in the repository, because a document that recommends
an engine and a script that does not use it are each individually valid.

The dependency boundary makes the gap legible and is worth copying on its own
terms. `scripts/db-bench/package.json` is a private, benchmark-only manifest
with its own lockfile and a gitignored install, described in the file as kept
*"OUT of the product package.json so these native engines never touch the app's
dependency tree or CI"*. That is how an engine gets evaluated at full fidelity
without being adopted by accident — and it is also why the un-adoption is
checkable from outside: the product manifest declares one store engine, so the
absence of the second is a fact about the tree rather than an inference.

## The contention cost, paid twice, by two trees

The technique claims the deciding condition is usually the one no latency
table shows: an analytical scan through a single-writer directory buys the
whole contention surface of
[single-writer-holder-discipline](../techniques/single-writer-holder-discipline.md).
Both trees pay it, in a comment, and neither reads the comment as a cost.

- `scripts/db-bench/olap.ts:9` instructs the operator to `cp -r` the store
  directory before benchmarking. The measurement of the incumbent cannot be
  taken against the live store.
- In the grant-writing tree, `scripts/data-analysis/slice-stats.ts:10` carries
  the same instruction as standing operating procedure: *"Run against a COPY
  when the dev server holds ./.pglite"*.

That second one is the signature the technique names. It is not a quirk of the
script; it is the transactional quadrant's locking contract being charged to a
read-only aggregate that never needed exclusion. And it is the worse case of
the two, because a copy taken while the store is held is exactly what the
sibling technique warns is torn by construction — the workaround for the
contention is itself inside the hazard.

## The other tree declined on the axis that does not decide

The grant-writing tree has 20 tracked scripts under `scripts/data-analysis/`
and **zero** of them import an analytical engine; all reach the same row store
the application serves from. The single file in the tree that names a columnar
engine names it in order to defer it — `scripts/data-analysis/eval/sql.ts:1-5`
selects the embedded row store because it is *"already a dependency"* and
serves *"at low-thousands-row scale"*, with the columnar path parenthesised as
*"the SCALE path, out of scope here."*

Both halves of that reasoning are the ones the technique flags:

- *Already a dependency* is the inherited axis. It is a real cost and a fair
  tiebreak, but it is not a workload argument, and here it is doing the
  workload argument's job.
- *Low-thousands-row scale* is the row count. At that scale the conclusion is
  **correct** — the technique's own instruction below all three conditions is
  add nothing — but it is correct by accident, because the stated reason will
  not notice when it stops being true. A threshold expressed in rows changes
  silently as the corpus grows; a threshold expressed in query shape and
  contention does not.

The honest reading of this tree is therefore not "it got the answer wrong". It
is that the tree cannot tell you when to revisit, because the recorded reason
is not the operative one.

## What this pair cannot show

Neither tree runs the hybrid in production, so nothing here is evidence about
**operating** one: the freshness contract, export scheduling, and the pruning
of an export directory are all untested by these citations. What the pair
establishes is narrower and prior to that — that the decision is routinely
inherited rather than made, that measuring it does not by itself land it, and
that the contention cost shows up in operating instructions before it ever
shows up in a benchmark.
