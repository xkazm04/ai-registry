---
source: repository (a cloud vendor's open-source agent context database)
kind: vendor repository
url: https://github.com/volcengine/OpenViking
title: OpenViking - Self-evolving Context Database for AI Agents
author: OpenViking maintainers (a cloud vendor's open-source team)
commit: 85b4923d06efc521f48298d5a7a076408cdd7d38
words: 1779 landing / ~323,000 in-tree docs (447 md files; 20 design documents ~40,000; 16 concept pages ~20,000; 6,932 changelog) / ~23,700 benchmark md / ~114,500 examples
extracted: 24
accepted: 9
declined: 0
leads: 4
already_covered: 6
untriaged: 9
dispatched: 1
applied: 5
shipped: 1
fetches: 3 of 3 (spent by the forge worker on the subject's primaries; the intake lane spent 0)
run_id: intake-openviking-0902
siblings: 1 at claim (deer-flow), 2 by Phase 7 (deer-flow, monai); neither held agent-memory, retrieval or the new subject
routing_count: 5 NONE of 12 design entries; three share one home -> XL spec, forged in-session; two -> techniques
handoff: no (single subject; one forge worker dispatched under the XL trigger rather than a bundle-wide /forge)
rescan_when: "the changelog's Unreleased section ships as a release carrying the ext-<base64> peer-id migration, or the concept docs stop describing unconditional parent bubbling as current (they lag the code at 85b4923), or 8 weeks elapse (2026-10-28)"
---

# OpenViking - source note

**First fresh run under intake 2.0.0**, and the first repository run to reach a subject:
the design read produced twelve entries, five with `corpus: NONE`, and three of those
five shared one home. That is the mechanical XL trigger, and it fired: the spec
[`docs/subject-proposal-context-hierarchy.md`](../../docs/subject-proposal-context-hierarchy.md)
was written, one forge worker dispatched, and `context-hierarchy` (four techniques, one
application) landed in `llm-agent/prompt-and-context` beside `agent-memory` and
`retrieval` - marked EXECUTED with three overrides recorded. The other two NONE entries
became techniques in `agent-memory`; two boundary cases became amendments; five
applications were written against the source tree itself.

## Class, and where the yield sat

**Vendor repository.** The README is a benchmark ad ("Proof it works": three harnesses
rising to the 80% range on a memory benchmark) and the tree behind it holds the judge
prompts, the per-arm budgets and the caveats the README omits. The three sources wearing
one name, as the class predicts: the marketing surface (README, the numbers), the
production rules (the 16 concept pages, the 20 design documents, six dated bug-fix specs
under `docs/superpowers/specs/`), and the types (the retriever's class constants, the
config keys). No CHANGELOG at the root; `docs/en/about/02-changelog.md` (6,932 words) was
read first per the standing fragments-first focus and carried 8 of the 24 candidates.

**Expected yield, said before the table:** a design-deep vendor repository under 2.0.0
should route, not amend. It did.

Four readers were dispatched over disjoint slices (design documents; concept pages;
benchmarks; code and tests). The code reader died on a rate limit and its slice was
covered by targeted greps from the director instead - the retriever's constants and the
failure-named tests. The forge worker also died once on a rate limit after writing the
golden path and one technique, and was resumed with its context intact.

## Design record (Phase 2d)

Twelve entries, product names allowed here. `corpus:` is the routing line.

1. **Per-directory summary tiers.** decision: every directory carries a generated
   `.abstract.md` (<=256 chars, embedded) and `.overview.md` (<=4000 chars); the original
   file is the leaf; per-file summaries are inputs to the directory's overview, never
   sidecars. forces: vector recall needs a short unit, navigation a medium one, and
   per-file sidecars multiply model calls and index rows. buys: relevance from ~100
   tokens, scope from ~2k, leaf only when both said yes. rejects: per-file sidecars
   (`docs/en/concepts/03-context-layers.md:53`). where: `03-context-layers.md:7-17, :76,
   :128-138, :178`. stage: extract -> retrieve. **corpus: NONE** - `agent-memory`'s
   golden path names the surveyable-shape force (lines 77-89) and no technique models it.
2. **Filesystem as record, index as derived.** vector index holds URIs+vectors+scalars,
   never content; record id = hash(account:uri). where: `05-storage.md:21-34`,
   `04-viking-uri.md:63`, `01-architecture.md:145-152`. stage: store. **corpus:**
   `companion-identity/disk-truth-db-index` + `agent-memory/lane-reconciliation`. Catch.
3. **Seeded hierarchical retrieval.** global search over tiers 0-1 seeds a priority-queue
   descent; `score_propagation_alpha` (default 1.0 = parent ignored); `DIRECTORY_DOMINANCE_RATIO
   = 1.2` (declared, applied nowhere at this commit - the forge worker's finding);
   `MAX_CONVERGENCE_ROUNDS = 3`; a query-only path with no model call vs a full path with
   typed sub-queries and rerank. where: `openviking/retrieve/hierarchical_retriever.py:56-60,
   :83, :478-495`; `07-retrieval.md:13-21, :74-149`. stage: retrieve. **corpus: NONE** -
   `retrieval` ranks a flat candidate set; neither structural lane descends anything.
4. **Session commit split.** sync lock-free archive (messages.jsonl, task id returned),
   async idempotent extraction from the archive via a persistent queue, `memory_diff.json`
   per commit. forces: "LLM calls have unpredictable latency (5s~60s+) and cannot be
   inside a lock-holding operation" (`09-transaction.md:209`). where: `08-session.md:99-116,
   :168-227`; `09-transaction.md:72-78, :203-232`. stage: session-commit. **corpus:**
   `consolidation` ("resumable and idempotent over the window", line 61) +
   `episodic-capture`. Catch; the no-model-inside-a-lock clause is a candidate boundary
   for `consolidation` - untriaged below.
5. **Path locks plus operation-ordered writes across two stores.** invariant "better to
   miss a search result than to return a bad one"; delete index-first, move
   copy/re-key/delete. where: `09-transaction.md:7-17, :82-128, :358-364, :389`. stage:
   store. **corpus:** `lane-reconciliation` states the opposite order and its quiet
   failure. Boundary case -> **amendment** (accepted #4).
6. **User/Peer identity.** owner (address root) vs counterpart (sub-scope, request-level
   view filter that "never changes the tenant or user identity"); `agent_id` retired to a
   transition alias; `role_id` isolation dropped; ownerless sessions fail migration
   preflight; lossy peer ids not read automatically. where:
   `docs/en/migration/01-user-peer-model.md:74-88, :138-177`; `11-multi-tenant.md:119-133`;
   changelog Unreleased lines 11-16. stage: serve/store. **corpus: NONE** -
   `memory-governance` covers who wrote and approved, not who owns vs who it is about;
   `security/authorization` is generic scope. -> **technique** (accepted #2).
7. **Links in metadata with request-local page ids.** 1-99 existing, 100+ new, resolved
   after the loop, never persisted; links written on both ends; match text rendered only
   on user-facing surfaces. where: `docs/design/memory-link-design.md:1120-1137, :1305-1351,
   :1584-1626`; reused by `ov-compile-design.md:385-401`. stage: extract/resolve.
   **corpus: NONE** - `relationship-proximity-lane` consumes edges; `markdown-vault/link-graph-extraction`
   is editor-vault link health. -> **technique** (accepted #3).
8. **Digest-gated upward refresh with a change-ratio for wide nodes.** where:
   `freshness-aware-parent-bubbling-design.md:32-67, :118-166, :358`;
   `l0-l1-okf-sidecars-rfc.md:259`. stage: ingest/refresh. **corpus: NONE** for the
   mechanism; `lane-reconciliation` holds the trigger doctrine (cited, not restated).
   Same home as 1 and 3 -> the XL trigger.
9. **Benchmark the integration, native memory as baseline; paired same-seed cells;
   diagnostics labelled.** where: `benchmark/locomo/claudecode/README.md:8-14`;
   `benchmark/tau2/llm/config/baseline.yaml:8-45`; `tau2/llm/README.md:17-20, :269-292`.
   **corpus:** `baseline-ladder` models the rungs; the judge and the per-arm budget were
   not in the list a number travels with. Boundary -> **amendment** (accepted #5).
10. **Retrieved memory is advisory; never copy identifiers into write arguments.** where:
    `benchmark/tau2/llm/config/scope_prompts/generic_memory_scope.md:2-13`. **corpus:**
    `recall-injection` ("Memory proposes; for destructive acts, the present confirms",
    line 164). Catch.
11. **Experience learning behind a global switch (default off), train-only extraction,
    commit tool unregistered for the measured epoch.** where:
    `agent-evolution-global-switch-design.md:21-33`; `tau2/vikingbot/README.md:164-199`.
    **corpus:** `probe-without-write-back` + `procedure-promotion` + `memory-governance`.
    Catch; application written (accepted #9).
12. **Account-scoped in-process git, forward-only restore.** where:
    `git-version-control-design.md:24-40, :161-181, :1206-1214`. **corpus:**
    `versioning-snapshots/restore-semantics` ("mints forward"). Catch.

Routing count: **5 NONE of 12** (entries 1, 3, 6, 7, 8). Entries 1, 3, 8 share one home
-> spec + forge worker. Entries 6, 7 -> techniques. Count >= 3 would route to a
bundle-wide `/forge` handoff; declined as a handoff because every NONE entry has one
category and the XL trigger already covers the shared-home three - said here so the
scorecard's handoff cell reads honestly.

## Triage (unattended; `real gap` rows advanced, `partial` rows had their promoting question executed)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | design (x3) | XL | Context hierarchy: tiers, descent, refresh | agent-memory hedge / retrieval | new-subject | real gap | **accepted** - spec, forged |
| 2 | K | design | M | Owner and counterpart scope | agent-memory | new-technique | real gap | **accepted** |
| 3 | K | design | M | Read-set-bounded links | agent-memory | new-technique | real gap | **accepted** |
| 4 | K | design | S | Invariant chooses the write order per operation | lane-reconciliation | corrects-claim | partial -> promoted (the technique states record-first as "the usual answer" and nothing about deletes) | **accepted** - amendment |
| 5 | K | claim | S | Judge and per-arm budget travel with the rung | baseline-ladder | corrects-claim | partial -> promoted (lines 156-158 list consumer, index, embedding, depth, rung; no judge, no per-arm budget) | **accepted** - amendment |
| 6 | K | design | - | Filesystem record, derived index | disk-truth-db-index, lane-reconciliation | none | likely catch | already covered |
| 7 | K | design | - | Commit split: archive then idempotent extraction | consolidation:61 | none | partial -> not promoted (idempotent re-run is modelled) | already covered; boundary clause untriaged |
| 8 | K | design | - | Advisory memory, no identifier copy | recall-injection:158-166 | none | likely catch | already covered |
| 9 | K | design | - | Switch-gated learning, train-only extraction | probe-without-write-back | none | likely catch | already covered; application written |
| 10 | K | design | - | Forward-only restore | restore-semantics | none | likely catch | already covered |
| 11 | K | design | - | Multi-write with declared-read backups | backend-platform (replication) | none | thin for this run | untriaged |
| 12 | K | claim | S | Keep model calls out of lock-held sections | consolidation | amendment? | partial | untriaged |
| 13 | T | claim | S | Stabilise the full lock set before the first mutation (reread under lease, release, reacquire, 3 tries) | embedded-db? batch-undo-commit-window | none | partial | untriaged |
| 14 | K | claim | S | Validate patches against the representation the model saw | structured-output? | none | partial | untriaged |
| 15 | K | claim | S | Report the first block that fails in execution order | structured-output? | none | partial | untriaged |
| 16 | K | claim | S | Embedding config is the cache key; recompute vectors on mismatch, hybrid index cannot snapshot | retrieval/embedding-lifecycle | none | likely catch | untriaged |
| 17 | K | claim | S | No silent fallback from local embedding to remote | embedding-lifecycle, optional-dependency-degradation | none | likely catch | untriaged |
| 18 | K | claim | S | Freeze routing decisions in the queue message; consumers never re-classify | work-execution | none | partial | untriaged |
| 19 | O | claim | S | Metric labels: allowlist plus `__overflow__`/`__unknown__` sentinels; never user/session/uri | platform-observability | none | likely catch | untriaged |
| 20 | K | claim | S | Whitelist the metadata that enters embeddings | context-hierarchy (landed inside per-node-summary-tiers) | - | - | folded into #1 |
| 21 | K | claim | S | Deterministic stable sampling for wide directories | context-hierarchy (stable-sampling-for-wide-nodes) | - | - | folded into #1 |
| 22 | K | measurement | - | GPU exact-search crossover per (dim, N); filter-mask caching moves the cost | vector index (backend) | dated fact | thin | lead |
| 23 | K | claim | S | Compile: one agent loop, deterministic post-processing, batch write under one lease | fleet-orchestration ("workers propose, director writes") | none | partial | lead |
| 24 | K | claim | - | Lossless `ext-<base64>` peer ids under a reserved prefix | agent-memory | - | - | folded into #2 |

## Accepted

### 1. `context-hierarchy` - a new SUBJECT (XL, specced and forged in-session)

Four techniques in `llm-agent/prompt-and-context`: `per-node-summary-tiers`,
`seeded-descent-retrieval`, `digest-gated-upward-refresh`, `stable-sampling-for-wide-nodes`,
plus `applications/python--seeded-descent-retrieval.md`. Spec marked EXECUTED with the
drafter's three overrides. The strongest of them: **the source's concept docs describe
unconditional parent bubbling as the current behaviour and the ratio policy as future;
the code at the pinned commit implements the policy.** The docs lag the code - which is
the subject's own thesis (a derived description that lags its source is followed, not
read) instantiated by the tree that taught it. The second: the dominance ratio is a
declared constant used nowhere, so the technique writes it as a knob to declare
default-off, the same rule it gives score propagation.

Reviewed as a diff, not a report: gate clean, purity grep over the source's vocabulary
(product, URI scheme, cloud vendor, model names, "L0/L1/L2") returned nothing in the upper
layers, `use_when` on all four techniques, and the dominance-ratio claim verified by
grep (declared once in the retriever, referenced otherwise only by an eval fixture).

### 2. `owner-and-counterpart-scope` -> `agent-memory`

A memory answers two identity questions - who owns it (derivable from its address) and
who it was formed with (a sub-scope, applied as a per-request view filter that never
changes the requester's identity) - and the runtime that wrote it is neither. Carries
the migration's two refusals (ownerless sessions fail preflight; lossy ids are not read
automatically) and the lossless-encoding rule under a reserved prefix.

### 3. `read-set-bounded-links` -> `agent-memory`

The model names, code resolves: request-local integers for everything read in (1-99)
and everything about to be written (100+), resolved after the pass, so a link can only
target a memory that exists or is being created. Links beside the body, rendered on
read, written on both ends.

### 4. Amendment to `lane-reconciliation`: the invariant chooses the write order, per operation

The technique named record-first-then-lanes as the usual order and its quiet failure.
The source states its invariant once and derives the order per operation: delete
lane-first so the crash state is the survivable one. With a scope condition the apply
row found: where the consumer reaches the record through the lane and the join drops
missing rows, the order is a matter of taste.

### 5. Amendment to `baseline-ladder`: the judge and the per-arm budget travel with the rung

Two judges in one tree, both lenient by default (at least one gold item; "be generous"),
an answer prompt that forbids abstention, a treatment arm under a six-item /
ten-thousand-token cap against a control under whatever the native memory does, and one
"native" arm run against a different model than it is named for. None of it in the
README; all of it in code.

### 6-9. Applications against the source tree (v2)

`python--lane-reconciliation`, `python--baseline-ladder`, `python--owner-and-counterpart-scope`,
`python--read-set-bounded-links`, `python--probe-without-write-back` in `agent-memory`,
plus the worker's `python--seeded-descent-retrieval` in the new subject. Stack `python`
(added to the bundle's declared stacks by a sibling run earlier today; `verified_against`
is `python@3.10` from the tree's `requires-python`, the commit pinned in prose).

## Applied - 5 rows (0c / 0e / 3s / 1t; one unapplied by fleet shape)

Every seam was chosen to falsify (the declared focus), and three of three simulations
came back `not-better` with the condition landed:

- `lane-reconciliation` amendment -> personas, simulation, **not-better**: recall lifts
  vector hits only through the candidate rows, so a dangling vector is filtered before
  anyone sees it; the amendment's scope condition was written from this seam.
- `owner-and-counterpart-scope` -> personas, simulation, **not-better**: one human
  operator; the tree's second axes (group, team, use case) are *audience*, not
  counterpart; the technique's own exclusion holds.
- `read-set-bounded-links` -> personas, simulation, **not-better**: the model names ids
  in free text and the reflection engine filters them against the fetched pool, whose
  comment records that hallucinated ids occur - validation against the read set is the
  same property, and the construction buys nothing here. Structural fact: the tree is
  evidence the problem is real even where validation suffices.
- `context-hierarchy` -> registry (self), **task**: plan at `docs/tasks/2026-09-02-context-hierarchy-descent.md`
  on branch `intake-openviking-0902` with the first step committed (`aa61f50`): a
  14-row labeled query set with the flat map's baseline measured - 8 top-3 hits, 6
  misses, three of them the new subject reachable only through a node abstract. The
  plan names the cheaper control (a stop-word list) that must lose before the descent
  counts as earned. ~180 lines across three files.
- `baseline-ladder` amendment -> **unapplied**: no managed project runs a model-judged
  benchmark (pumper's lanes are numeric bounds judged by code; the others hold the word
  only in manifests). Return condition: when a project grows an LLM-judged eval.

Shipped: 1 (the registry's own task branch, not pushed). Personas received three ledger
rows in `.ai/applied.jsonl` and no code change - every row was a rejection.

## Already covered - and covered better

- Filesystem as record, index derived, rebuild named: `disk-truth-db-index` says the
  rebuild must be total and idempotent; the source's migration guide says migration does
  not reindex - the corpus's rule is the stricter one.
- Commit split with idempotent extraction: `consolidation` line 61.
- Advisory memory for irreversible actions: `recall-injection` line 164.
- Switch-gated learning and the commit tool unregistered per epoch: `probe-without-write-back`.
- Forward-only restore: `restore-semantics`.
- Stale compiled lanes need a stated trigger: `lane-reconciliation`'s compiled-lane
  section - the new subject cites it rather than restating it.

## Untriaged - extracted, reached the table, nobody picked

Rows 11-19 above, with anchors: multi-write declared-read backups
(`14-multi-write-storage.md:45-58`); model calls outside lock-held sections
(`09-transaction.md:209`); lock-set stabilisation
(`docs/superpowers/specs/2026-08-11-memory-link-lock-stabilization-design.md:16-38`);
patch validation against the model's own view
(`2026-08-11-plain-content-patch-validation-design.md:5`); first failing block in
execution order (`2026-08-11-first-failing-patch-block-design.md:5-7, :42-68`);
embedding config as snapshot key (`docs/en/guides/09-ovpack.md:106-109, :583-585`);
no silent local-to-remote embedder fallback
(`docs/design/local-embedding-llama-cpp-design.md:46, :274-276`); frozen routing in the
queue message (`docs/design/resource-ingestion-routing.md:110, :197`); metric label
allowlist with sentinel buckets (`docs/design/metric-design.md:586, :690-694`). Nobody
verified these; two of them (patch validation, first failing block) look like a pair
for `structured-output` and are the first thing a re-scan should map.

## Leads

- **GPU exact-search crossover is per (dimension, N) and per concurrency, not one
  speedup** - 50x at batch 1 on a 1.2M x 100-D set, native CPU wins below ~2-5K vectors
  at 768-D, and a GPU path behind one index-wide lock plateaus at concurrency 16
  (`benchmark/cuvs/PRELIMINARY_RESULTS.md:150-154, :385-396, :415-420, :490-493`; the file
  says "not a final performance claim"). Return: when the corpus gains a vector-index
  subject in the backend bundle, or a second measurement of the crossover.
- **One agent loop, deterministic post-processing, one batch write** as a compile shape
  (`docs/design/ov-compile-design.md:258-273, :484-514`). Return: a second first-party
  compile pipeline stating the same split.
- **Score propagation and the dominance ratio have no measurement anywhere** - the
  source defaults one off and never applies the other. Return: the registry task's B arm,
  or any labeled-set result.
- **Law candidate (three sightings, one wave - not a law):** "a derived description that
  lags its source is followed, not read" - RAPTOR's tracker, the source's docs-vs-code,
  `lane-reconciliation`'s compiled-lane section. Return: a sighting from a different run.

## Method notes

- The mechanical XL trigger worked on its first firing, and the spec-to-forge path cost
  one worker and one resume. The count replaced the noticing exactly as 2.0.0 intended.
- Both worker deaths this run were rate limits, not errors; the resume-with-context path
  (a message to the same agent) recovered the forge worker without re-reading anything.
- The `verified_against` field is `<stack>@<version>` and nothing else; the commit goes in
  prose. Three siblings' applications and all five of mine tripped this the same afternoon.
