---
subject: concurrency-guards
domain: software-engineering
last_touched: 2026-09-01
touched_by: intake
dry_streak: 0
---

# concurrency-guards

First touch: [[2026-08-22-7]], external reconcile against `golang/sync`
@ `3ffd83c` (v0.22.0 era). Gained `go--release-guarantees` (uncovered) -
second stack; single-stack debt cleared. Hint confirmed; the worker's re-check
caught itself inverting a test's meaning and fixed it against the assertion.

## Open leads (banked, convergence rule applies)

- Any manual/out-of-band release door makes identity-checked eviction
  mandatory - the incumbent is then guaranteed to outlive its own entry.
- The enemy list should split panic from abrupt-thread-exit; they need
  different waiter treatment.
- The release must decide what the waiters GET - replay the failure, crash
  loudly, or release-and-stay-silent - and the unstated choice becomes the
  wedge.
- An acquisition that can never be satisfied belongs on the enemy list;
  failing fast is a release-design decision.

## Cross-subject proposals

- The joiner reaps the scope it created (Wait-calls-cancel) -> scheduling /
  background-jobs.
- Deliberate head-of-line blocking to prevent large-request starvation ->
  admission-queue territory; note it is the OPPOSITE trade to the one the
  API-server reconcile flagged as a deviation - the two documents together
  frame the real design choice.

## 2026-08-27 - intake, [[2026-08-27-picomq-durable-streams]]

Two amendments from one open-source stream engine. No new techniques; both
findings had homes that already existed and were incomplete rather than
absent.

**`single-flight-primitives` was enumerating wrong.** Its second-caller list
(refuse / join / queue / coalesce) closes by telling the reader to pick one
explicitly per operation - which makes an incomplete list consequential
rather than cosmetic. **Merge** is a fifth: N callers with *distinct*
payloads satisfied by one execution, each getting its own outcome. Join
returns one shared result to callers who wanted the same thing; coalesce
keeps the last arrival and discards the rest as waste; merge discards nothing
and duplicates nothing, and is the only policy that lowers the *cost* of the
guarded operation rather than its frequency. Landed with a window-closing
section: the batch can self-close on the previous execution finishing - no
timer, no tuning, no added latency for a lone caller - **only while
executions are serial.** Pipeline them and there is no single previous
execution to close against, so an explicit timer has to come back. Buffer
bounded with a distinguishable over-capacity refusal.

**`cross-process-exclusion` treats the cost of a duplicate as a measured
input.** Amendment: that cost can be engineered. Route every effect the
holder produces through a shared serialization point and the lease demotes
from safety mechanism to availability knob - which changes what its TTL has
to be defended against, and should be stated so a reader can tell which kind
of lease they are looking at. Two conditions written down because neither
survives assumption: no side-channel writes past the door, and the holder
worklist living in shared state rather than in process memory. Weakest of the
run - the premise is already owned by `idempotency-by-design`; the increment
is the consequence for lease sizing.

## Open leads from this run

- **Classify what a stale view decides: speed or correctness.** Only
  correctness decisions need freshness; they get a fence at the write site
  instead of a fresher view. The fencing half is already owned here - the
  classification framing is not, and reads as doctrine rather than technique.
  One sighting. **Return on a second independent one**, then propose at
  doctrine level rather than as a technique.

## 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

`single-flight-primitives` amended for the second time in two runs, both times against its
own enumeration. picomq's run added `merge` as a sixth second-caller policy; this run
**scopes `join`**.

Join is written for a **computation**: one execution, N waiters, one result, finished.
Pointed at the *establishment of a durable resource* - a connection, a session, a spawned
server that drops and returns - the execution recurs, and the natural broadcast primitive
for join (a one-shot completion signal that wakes all waiters at once) is one-shot **by
construction** in most concurrency models. So the first reconnect performs it a second
time and the process dies at the moment it was recovering. The source's own note: "the
first implementation re-closed on reconnect and panicked."

Three rules landed, plus a `use_when` entry and a decision rule: the signal means "the
first attempt settled", not "usable" (settled covers failure too, which is what makes the
fire-once invariant unbreakable); callers read live state under the lock afterwards, never
the signal; every watcher carries the generation that spawned it, or a stale drop event
tears down a healthy resource.

The reusable half is the closing distinction: single-flight over a computation guards
**work** and yields a value that is delivered and forgotten; over a resource it guards
**establishment** and yields state with a lifetime - so the guard needs a generation and
the signal needs a meaning that survives being observed forever.

Boundary noted, not linked: `mcp-tools/client-integration` says only "treats reconnects as
routine rather than exceptional" and models catalog freshness in detail beside it. That is
the same boundary from the protocol side; the mechanism lives here because the source hits
it in three unrelated subsystems.

## Open leads

- **Untriaged, from the same source:** `guard-key-design` enumerates the identity axes and
  says entity is "almost always included" - a shell command's side effects are attributable
  to no path, so it takes a single global guard while per-path writes run in parallel. The
  enumeration does not contain the case where the entity axis cannot be determined. Return
  if a second source draws the same boundary.

## 2026-09-01 - intake [[2026-09-01-matrix-rust-sdk]]

`cross-process-exclusion` gained a section on the lease generation's second
reader: the technique carried the generation OUT as a write fence and never
read it back IN on re-acquisition, where an advance proves another holder
wrote in between and every cache derived from the shared store is stale. The
source's own bug was the sharper half: it detected the dirtied generation,
reloaded the one cache whose code path noticed, and consumed the flag -
leaving the other caches serving the pre-handover picture. Rule landed: one
dirt flag on the store's shared state, every derived cache reloads under it,
cleared once after all of them. Plus the in-process holder-count trap (the
handle is not a holder; cloning a guard counts).

Applied at `simulation` against the one fleet tree with a real leadership
lease: **not-better**, and recorded as the condition - every leader loop
re-reads its cursor from the store per tick, so nothing is derived across
tenures and the generation would have nothing to dirty. The falsifier is the
first in-memory cache over the shared store; the verdict flips the day one
appears.

Open lead (no home, XL): the source's other concurrency finding is a
lock-ordering deadlock - a read guard held across a call that takes a second
read guard while a writer is queued between them, on writer-preferring
reader-writer locks; fixed by taking one guard over the composite and
projecting it. The corpus holds no material on in-process lock composition
at all (zero hits for reader-writer, lock ordering, nested acquisition), and
this subject is about single-flight, not mutual exclusion. A subject on
in-process lock discipline is the home; one changelog entry is thin evidence
for a subject. Return condition: a second source, or a managed project's
incident, of the same shape.
