# Subject proposal — `declarative-resource-lifecycle`

**Status:** EXECUTED 2026-09-03 (same session, three Opus forge workers; the subject and its two siblings landed). Proposed 2026-09-03 by run `intake-kube-0903` (intake 2.3.1; front half by an Opus worker). **Placement decided by the director: the subcategory `operations/control-plane-operations` now exists in `taxonomy.json` with this subject and its two siblings declared.**
**Bundle:** `software-engineering`
**Category:** `operations` → subcategory **`control-plane-operations`** — created by the director on 2026-09-03 (the placement caveat below is retained as the record of the decision).
**Resolved path (if the subcategory is approved):** `knowledge/software-engineering/operations/control-plane-operations/declarative-resource-lifecycle/`
**Raised by:** `/intake`, 2026-09-03, from design-record entries **A3, A4, D1, E1** over `kube-rs/kube` @ `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`.
**Engine:** `domain-knowledge-forge` — read `docs/forge-brief.md` first; it is the contract.

## Placement, verified against the authority

`knowledge/software-engineering/taxonomy.json` is the authority. Counts below were read this run by walking `categories[] → subcategories[] → subjects[]` `[V]` — **`categories` is a list** — with the cap read from `scripts/lib/taxonomy.mjs:39` (`MAX_CHILD_DIRS = 10`, enforced on categories-per-bundle, subcategories-per-category and subjects-per-subcategory alike `[V]`):

- **The bundle holds 10 categories — exactly at the cap.** A new top-level category is impossible without a collapse. Not a candidate.
- **`operations` holds 2 subcategories** — `governance-and-records` (5), `service-operations` (8). **Eight subcategory slots free.**
- **`service-operations` holds 8 of 10.** It could physically take this subject and one more, and then it is full. The §4 argument is that it should take neither, on force grounds; the count merely says the squeeze is also structurally short-sighted.
- Neighbouring caps, for a drafter checking alternatives: `backend-platform.work-execution` 7, `backend-platform.resilience` **9 (one slot)**, `backend-platform.data-layer` 7, `engineering-process.continuous-integration` 5, `llm-agent.runtime-and-io` **10 — FULL**.

> **PLACEMENT CAVEAT — read this before creating any directory.** This spec's placement **depends on a taxonomy change that has not been made**: creating the `control-plane-operations` subcategory under `operations`. That change goes through **`scripts/apply-taxonomy.mjs` and nothing else** — the folder tree is derived from `taxonomy.json`, never the reverse, and a hand-made directory is a corpus-wide link break. If the director declines the new subcategory, the fallback is `operations/service-operations/declarative-resource-lifecycle` (taking it to 9 of 10), and the drafter must then **re-derive every link depth in this spec** — they are identical between the two, but the sibling list is not. **A worker that finds no `control-plane-operations` entry in `taxonomy.json` must stop and report, not create one.**

Link depths, stated so they are not derived wrongly (identical under either placement):

- from `declarative-resource-lifecycle/declarative-resource-lifecycle.md` → `../../../_laws.md`
- from `declarative-resource-lifecycle/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling in the same subcategory (fallback placement): `../health-checks/health-checks.md`, `../node-boot-and-declarative-bootstrap/node-boot-and-declarative-bootstrap.md`
- to another subcategory in the same category: `../../governance-and-records/entity-lifecycle/entity-lifecycle.md`, `../../governance-and-records/versioning-snapshots/versioning-snapshots.md`
- to another category's subject: `../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md`, `../../../backend-platform/data-layer/sync-replication/sync-replication.md`, `../../../backend-platform/resilience/webhook-ingestion/webhook-ingestion.md`, `../../../security/authorization/authorization.md`, `../../../client-architecture/realtime-events/realtime-events.md`

## The gap, measured

Concept probes only — never product names, which return zero by construction against the purity gate — followed by **opening every golden path the map returned** `[V]`, plus an uncapped corpus-wide grep behind every NONE.

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| deletion hook that blocks removal until cleanup completes | `node-boot-and-declarative-bootstrap` (13 pts), `sync-replication` | the same *word* for process teardown (*"the finalizer is deferred at the point of acquisition"*), and a quorum-of-observers reap rule. Neither is a marker on a record that survives the process that wrote it |
| ownership graph mapping a dependent's change back to its parent | three **domain** graphs (civic entity, narrative, AST) | none is an ownership edge used to enqueue work. `realtime-events`' invalidation grammar maps an event to *which reads a consumer drops*, not to a parent's unit of work |
| declarative merge with per-field ownership by multiple writers | `hiring-need-as-structured-brief` (8), `agent-instruction-files` (8) | per-field *provenance* (stated/inferred/default) and marker-fenced *regions*. Both are single-writer records with attribution; neither has a second writer to conflict with |
| synchronous gate that validates or mutates before persistence | `quality-gates` (40), `admission-queue` (23), `authorization` | one non-bypassable chokepoint that **refuses** (authorization), and one that refuses **by capacity** and says so (`admission-queue`). Nothing models a gate that is a separate deployed process, adds a hop to every write, may **mutate**, and must have a stated policy for its own outage |

Corpus-wide term census, uncapped, over all 369 subjects: `finalizer` 9 files (**all** `defer`-style teardown), `owner reference` 1, `cascade delete` 0, `field manager` 0, `server-side apply` 0, `admission webhook` 0, `custom resource` 0.

## Why a subject and not four amendments

Because the four share one premise, and each is unsound without the others. **The record is the coordination medium.** There is no lock, no transaction and no coordinator; several independent writers converge on the same record, and every mechanism here is a contract *written onto the record* that makes their independence safe: a marker says *do not vanish yet*, an edge says *whose work this change is*, a field owner says *whose value this is*, a gate says *what may be written at all*. Land them separately and each becomes a curiosity attached to whichever subject was nearest; land them together and the premise is stateable, which is what a golden path is for.

Two independent reads reached the same grouping — the design record grouped by shared home-if-new, and a corpus sweep run on concepts alone, without seeing that grouping, closed by naming the identical set as *"one coherent unlanded mechanism family."*

## Proposed techniques, each with the decision rule it must carry

1. **`deletion-blocked-until-dependents-confirm`** — a record carrying an owner's marker cannot be removed; the owner removes its own marker only after cleanup succeeds, and a failed cleanup **keeps** the marker. Decision rule: *the marker goes on before the first side effect, never after* — and the write that adds it is itself the trigger for the next pass, so nothing is applied in the same pass that claims custody. Must carry: the deadlock (a marker whose owner is gone blocks deletion forever) and the two operator escapes; the positional-index hazard when markers are a list (the guarded compare-and-remove that keeps one owner from deleting another's); and the requirement that cleanup be re-runnable, including from a cancellation point.
2. **`ownership-edges-that-enqueue-the-parent`** — the dependent carries the identity of the thing responsible for it, and a change to the dependent enqueues **the parent's** unit of work, never its own. Decision rule: *the edge lives on the child as data, so the index survives a restart and needs no registry*. Must carry: the choice between a declared edge and a computed mapping; why the enqueued unit is the parent even when the parent is unchanged; and the boundary against a static dependency graph (`client-state`'s `store-dependency-topology`), which is compile-time and answers a different question.
3. **`per-field-write-ownership`** — a writer names itself, the store records which paths it owns, and a write that would take another owner's path **fails** unless the writer explicitly seizes it. Decision rule: *conflict is the default and seizure is an auditable act; last-writer-wins is the thing this replaces*. Must carry: what happens to a field whose owner stops managing it; why the writer's name must be stable across restarts and deployments; and the client-side validation that makes an impossible combination unrepresentable before a request is sent.
4. **`synchronous-gate-before-persistence`** — an externally registered participant sees every write before it lands, and may refuse it with a reason or **rewrite** it. Decision rule: *the availability policy of the gate is the design question, not its logic* — a gate that fails closed can halt every writer in the system, and one that fails open is not an enforcement point; choose per rule class and state the choice. Must carry: the correlation identifier that must be echoed and the constructor discipline that makes forgetting it impossible; the advisory channel (non-fatal warnings) as distinct from refusal; and the boundary against `webhook-ingestion`, which is the *receiving* side of an asynchronous event and has no verdict that blocks a sender.

## Boundaries it must NOT absorb

- **Durable job state, leases and at-least-once delivery** — `job-coordination` and `delivery-guarantees` own them, and correctly: every queue in the witnessing tree is in-memory, which is a real boundary and not an oversight.
- **Leader election and single-active exclusivity** — `concurrency-guards` owns it (`leadership-is-the-lock`). State the *inverse* here: this subject assumes concurrent writers and refuses to solve them by electing one. The witnessing tree ships **zero** leader-election code `[V]`, and that absence is the argument.
- **Retry classification** — `retry-backoff` owns it.
- **The convergence loop itself and its queue** — reserved for the sibling subject `convergence-loop-and-requeue` (§4). This subject is about contracts on the record; that one is about the loop that reads them.
- **The cache and its resynchronisation** — reserved for `watch-cache-and-resync` (§4).
- **Packaging and rollout of cluster workloads** — `deployment-contract` owns it.

## Open questions the drafter must decide, not discover

1. **Does the deletion-marker technique generalise past a store that supports it natively?** The fleet's nearest analogue is a soft-delete column plus a reaper. Decide whether the technique's `use_when` admits that shape or names it as the degraded case — and say which, because the answer decides whether three fleet projects can apply the subject at all.
2. **Is `per-field-write-ownership` one technique or two?** Recording ownership and *resolving* a conflict may be separable. Decide from the evidence, not from symmetry.
3. **Where does the `entity-lifecycle` subject (`operations/governance-and-records`) end and this one begin?** Both are about a record's states over time. Proposed discriminator, for the drafter to accept or replace: `entity-lifecycle` governs the states a record moves through **for the product's sake**; this subject governs the contracts that let **independent writers** move it safely. Open it before drafting.
4. **Should `synchronous-gate-before-persistence` live here or in `security/authorization`?** It is a chokepoint, and `authorization` owns chokepoints. Proposed answer: it lives here because the mutating half and the gate's own availability are not authorization concerns — but the drafter should read `authorization`'s golden path and **override this spec if that argument does not survive contact**.

## Instances a reader can open

- The witnessing tree: `C:/t/kube` @ `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e` — `kube-runtime/src/finalizer.rs:56-231`, `kube-runtime/src/controller/mod.rs:243-267`, `kube-core/src/params.rs:660-710`, `kube-core/src/admission.rs:244-370`.
- **A fleet instance of technique 1 already exists, under a different name**: `tracklight`'s job lease reclaim at `crates/store/src/sqlite/jobs.rs:106-125` uses a fence token to prove custody before acting — *"Zero rows means this caller no longer holds the job — the affirmative evidence its work loop needs to stop, rather than a guess."* That is the same guarded compare-and-act, at a different scope, and it makes the dispatch cheap.

## Why proposed rather than written

One repository is thin evidence for a whole subject, and this one is a single ecosystem's implementation of an ecosystem's conventions — the risk of writing conventions as if they were principles is exactly what a forge wave's expert-first phase exists to test. **It is not, however, a reason to wait**: the neighbours are open, the boundaries are argued, and the placement is verified. Per Phase 7, dispatch one forge worker on this spec in the same session, **once the director has decided the subcategory** — that decision is the only genuine blocker, and it is the one thing a worker must not decide for itself.
