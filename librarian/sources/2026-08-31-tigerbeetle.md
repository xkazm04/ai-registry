---
source: github:tigerbeetle/tigerbeetle
kind: vendor repository (open engine) — engine + operating docs in one tree
url: https://github.com/tigerbeetle/tigerbeetle
title: "TigerBeetle — the financial transactions database"
author: TigerBeetle team
commit: 9d2f5d625ab6ec0367f88402ef03612f36fc00a4
words: 421 landing page / 111264 in-tree markdown
extracted: 15
accepted: 1
declined: 0
leads: 2
already_covered: 3
untriaged: 11
dispatched: 0
applied: 1
shipped: 0
fetches_spent: 0
run_id: intake-tigerbeetle-0831
siblings: 0
---

# TigerBeetle

## Class and the sweep

An open-engine vendor repository, structurally closest to a **research-model release**:
the engine and its operating instructions ship in one tree, so every claim is checkable
in-run against the code that implements it. It also carries a first-party engineering
doctrine document and a mechanical enforcer that implements a subset of it.

**The landing page is 421 words. The in-tree markdown is 111,264** — a 264x ratio, the
sharpest instance of the Phase 2b tell the ledger holds. Swept at `9d2f5d6`:
`docs/ARCHITECTURE.md`, `docs/TIGER_STYLE.md`, `docs/internals/{testing,vopr,HACKING,
releases,upgrades,docs,lsm,vsr,data_file,sync}.md`, `docs/coding/{api-changes,
data-modeling,reliable-transaction-submission}.md`, `src/tidy.zig`,
`src/scripts/cfo.zig`, `src/fuzz_tests.zig`, `src/testing/exhaustigen.zig`,
`src/vsr/replica.zig`. README last. Zero of three fetches spent; this class corroborates
in-tree by construction.

## The run's real finding is about this corpus, not this source

The first pass produced twelve triage rows, all process, **zero architecture** — from a
database. The operator rejected that framing, correctly, and the investigation that
followed is written up in [[../domains/software-engineering]] § "the construction
frontier". In short: this bundle builds at the application layer and consumes everything
below it; fifteen builder-position systems concepts map to unrelated subjects by
slug-token collision and four (`fsync`, `allocator`, `syscall`, `numa`) return zero
corpus-wide, while the consumer-position control run resolves cleanly. The frontier is
held in place by the source diet (77 sources, this is the first systems-infrastructure
one) and by Phase 4 itself, where a `none` impact reads as "does not belong" rather than
"no home exists yet".

The second sighting is the stronger evidence: on 2026-08-27 a run reached the same
structural conclusion from two database sources and still filled the hole from the
consumer position (`storage-engine-selection`, eight *choosing* rules).

## Accepted

**`self-paced-intake`** → `backend-platform/work-execution/admission-queue`
(new technique, plus a golden-path section and list entry).

Landed on **cross-run convergence**, the corroboration route that costs no fetch. Two
independent sources from different runs reach one root: Headlong (2026-08-30) landed
`engagement-paced-cadence` on `cost-metering` — a self-driven agent loop paces itself —
and TIGER_STYLE states the same rule for a database: *"don't do things directly in
reaction to external events; your program should run at its own pace."* The convergent
root is that **a loop stepping on external events has delegated its work rate to its
environment.** The sibling technique owns the cost axis for a loop with no external
work; this one owns the safety, batching and boundedness axes for a loop that has some.

Home chosen on a missing stage, not a slug: `admission-queue` opens with "requests
arrive faster, or lumpier, than the system can execute them" and its whole vocabulary
governs what to do with an arrival. The stage before — *does an arrival cause a step at
all* — was unowned, and every bound the subject offers is unstatable without it, because
a per-arrival loop has no rate to state.

Applied same-run as a **simulation**, verdict `better`, against the `personas` tree's
change-data drain. The structural fact that tree could not have been built to prove:
**four long-lived consumers, three policies, no rule** — two self-pace (a journal writer
that batches, a jobs worker on a fixed tick), two step per arrival — and the split does
not track any of the technique's three exemptions. Both downstream consumers of the
per-arrival work are themselves self-paced (2s/10s poll, a debouncing sync loop), so
per-arrival signalling is being converted back into ticks one hop later. Three historical
repairs walked under both policies; the strongest is an update-freeze fix that was
correct and multiplied per-row cost by the transition count, which coalescing on rowid
recovers. Falsifier stated and named as the return condition: **the drain-size
distribution is not instrumented** — the tree counts dropped records but not batch
sizes — so proof status is `structural-only`, not `ab-paired`.

## Already covered — and covered better

- **Idempotent per-destination publish, no version burned.** `pipeline-staging` already
  carries the re-run contract with a three-way step classification and names this exact
  fork ("resume the same version's run to completion, or abandon the version number
  entirely — improvising between them at midnight produces the third option").
  TigerBeetle picks one branch of a documented choice.
- **Dead-file detection by import counting.** `dead-code/instrument-per-orphan-class`
  covers it and generalises further: one instrument per orphan *class*, with the alibi
  problem named.
- **70-line functions, 100 columns, zero dependencies.** Several subjects, and the
  registry runs the dependency rule itself.

## Untriaged — extracted, never picked, nobody verified these

Recorded with anchors so a later run does not re-derive them. **Not declines.**

Process half (from the first triage table, which the operator set aside):

1. **The canary enrolled in the judged population.** `cfo.zig` schedules a fuzzer that
   fails on `seed % 100 == 0` alongside the real ones, asserts a PR job carries the
   canary *and* one real fuzzer, and — the interesting half — **inverts the retention
   rule for it**: "for canaries, prefer newer seeds to show that the canary is alive;
   for other fuzzers, prefer older seeds to keep them stable" (`cfo.zig:1194`), dropping
   duration from the canary's ordering because it "can obscure timestamp_start".
   `gate-liveness` covers seeded failure at birth and known-bad fixtures in the gate's
   own suite — both episodic or unit-level; a continuously-scheduled probe in the
   production population, and the aggregation rules that destroy its signal, are not
   there. My read at triage: real gap, amendment-shaped.
2. **Make the release cheap enough to skip.** `docs/internals/releases.md`: skipping is
   an explicit design purpose; when a PR feels like it must land, land it at its natural
   pace and skip the release instead; the changelog still merges under an `(unreleased)`
   header; version numbers are monotonic *with gaps*. `release-pipeline` has no stage for
   the decision to release at all. Read: real gap.
3. **Bounded ledger that keeps failures and carries dropped work forward.** `cfo.zig:35-46`
   — at most 32 commits, 4 seeds per (commit, fuzzer); prefer failing, prefer faster
   failures as coarse minimisation, prefer older for stability; **when dropping a passing
   record, add its count to a survivor** so the aggregate work total is preserved. Read:
   real gap.
4. **Assertion discipline as a subject.** Density ≥2/function, pair assertions on two
   different code paths (before write and after read), assert positive *and* negative
   space, split compound assertions, assertions on in production because "far better to
   stop operating than to continue in an incorrect state", and the control/data-plane
   corollary that a control plane may spend O(N) verifying an O(1) operation. No home
   anywhere in the corpus. XL.
5. **The idempotency key is minted on the device.** `reliable-transaction-submission.md`:
   the app or browser generates the id and **persists it locally before submitting**, so
   a client restart mid-flight is covered. `idempotency-by-design` says "minted once,
   upstream" and stops there; how far upstream is the refinement.
6. **Split the release across two people at the validation boundary** — Friday manager
   cuts the changelog and pushes; a *different* Monday manager validates and triggers.
   Plus: one additional reviewer whose only job is finding upgrade bugs when version
   compatibility is implicated (`HACKING.md`).
7. **Two-tier documentation with an ingest-optimized lane.** `docs/internals/docs.md`:
   user docs are structured (tutorial / guide / reference, plus a concepts tier for the
   why); internal docs deliberately have *no* style requirement — "it's more important to
   have something documented", with a stated compaction promise.
8. **A ban carries its replacement.** `tidy.zig:308` — every banned construct is paired
   with the thing to use instead, grouped by why (provided by stdlib wrapper / library
   footgun / language footgun), the linter exempts itself and vendored code by explicit
   path, and the whole rule set is snapshot-tested.
9. **Assign, don't request review.** Level-triggered rather than edge-triggered, exactly
   one reviewer to avoid the bystander effect, author picks the reviewer.
10. **Port `exhaustigen`** — exhaustive generation of bounded value sequences instead of
    random fuzzing (`src/testing/exhaustigen.zig`), dependency-free, ~100 lines.
11. **Multiversion binaries** — past releases embedded in the current artifact as extra
    ELF/PE/MachO sections; the newest version always starts and decides which to run; the
    process `stat`s its own binary on a 1s timer to learn about new versions without a
    restart.

Architecture half — extracted on the second pass, unplaceable pending the frontier
decision above, all from `docs/ARCHITECTURE.md`:

- **Consensus converts durability into availability**, and its corollary *don't waste
  durability*: a bit-rotted block is repaired *from* the other replicas, so replication
  is a repair resource and not only an availability one.
- **Store the checksum outside the thing it checksums.** An internal checksum cannot
  detect misdirected IO — a disk writing correct data at the wrong offset. External
  checksums are also what make transparent repair possible: the reader already knows the
  checksum, so a failed local read becomes a keyed request to a peer rather than an error.
- **Determinism has a physical half** — same logical result *by the same physical path*.
  Byte-identical replicas turn logical repair into block repair, and this forces
  background compaction to be scheduled deterministically, which bounds worst-case
  latency as a side effect.
- **Static allocation is a forcing function for limits**, distinct from arena allocation
  (bounded, but with no guarantee the bound suffices): every object's worst case is
  computed at startup, so **backpressure needs no explicit code because nothing can grow
  unbounded**, and concurrency is bounded because each in-flight task is a statically
  allocated struct field rather than a heap closure.
- **Separate the deciding phase from the fetching phase.** The commit function is
  synchronous and does zero IO; the working set is predicted from the batch *without
  executing it*, so execution is sequential while all IO is parallel.
- **Control plane / data plane separation licenses asymmetric assertion budgets** —
  control plane is O(1) to data plane's O(N), so it may spend O(N) verifying an O(1)
  operation.
- **Flexible quorums** — replication quorum 3 of 6, view-change quorum 4 of 6, chosen to
  intersect; an even cluster size on purpose.
- **A repair protocol needs a way to prove absence.** Faulty storage cannot be
  encapsulated behind the storage interface; a corrupted, potentially-committed record
  can only be discarded safely because replicas can positively state they never accepted
  it.

## Leads

- **Cross-run convergence, one sighting short of a law.** Two runs now reach "a loop's
  clock is its own, not the world's" from unrelated domains. Laws need convergence across
  runs and this method reads that as three. *Return when a third independent source
  reaches the same root* — at which point the landing is the root at law level, with
  `engagement-paced-cadence` and `self-paced-intake` cited into it.
- **`ARCHITECTURE.md` contradicts itself on replication topology.** Its Mechanical
  Sympathy section says the primary "sends each prepare to just two backups, relying on
  the backups to forward it further" (ring); its Star Replication section says it "sends
  each prepare in parallel to all other replicas". Settled in-tree at zero fetch cost:
  `src/vsr/replica.zig:8586` calls `send_message_to_other_replicas_and_standbys`. Star is
  current; the ring paragraph is stale. *Return if this source is mined again* — a
  document that contradicts itself is a reliability signal for the whole document, and
  this one is otherwise the densest architectural writing the ledger has seen.

## Method notes for the next run of this class

- **A repository's own architecture document is an operating document.** Phase 2b's
  examples are all process-flavored (`RUNBOOK`, `ADR`, `CHANGELOG`, `owners-manual`) and
  I read the category that way, opening `TIGER_STYLE.md` and skipping `ARCHITECTURE.md`
  — the largest document in the tree after the changelog — while it sat in my own file
  listing.
- **The strip test is biased toward process claims.** Architecture claims arrive wrapped
  in named machinery that *looks* like proper nouns and is not, so they read as failing a
  test they pass. Every bullet in the architecture list above survives the strip test
  completely.
