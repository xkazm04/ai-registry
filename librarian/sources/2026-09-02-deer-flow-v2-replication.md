---
source: github:bytedance/deer-flow
kind: repository - vendor repository (a company's open long-horizon agent harness over hosted models; a Python runtime behind a web gateway, with sandboxes, subagents, memory backends, skills, channels and a plugin surface)
url: https://github.com/bytedance/deer-flow
title: "deer-flow - controlled replication of the /intake 2.0.0 front half against a source mined under 1.x"
author: bytedance
commit: bbcfd368bf330f63ac69a570530cbd3646d54987
prior_commit: a5ec7f28310b23b05cef38f2dc9f440f4e21f4d9
prior_note: librarian/sources/2026-09-02-deer-flow.md
prior_run: intake-deer-flow-0902
run_id: intake-deerflow-v2rep
method: 2.0.0-replication (Phases 2b, 2d, 3, 4 only; no triage, no landing, no apply)
words: 17479 landing / ~330,000 in-tree markdown (61,222 in the 27 per-package AGENTS.md module guides; 35,152 of those in the nine guides this run read fully)
design_record: 7
routing_count: 4
handoff: forge (routing count >= 3; not dispatched - replication run, --design-only in effect)
design_candidates: 4
catches_from_record: 3
xl_trigger: fired on HOME IF NEW software-engineering/llm-agent/runtime-and-io (4 candidates)
applications_drafted: 3
web_fetches: 0
board: claimed intake-deerflow-v2rep at start (0 live siblings), released at end
---

# deer-flow - v2 front-half replication

**What this note is.** The `/intake` skill was bumped to 2.0.0 after twelve
repository runs produced only paragraph-sized amendments. This run re-executes
the *front half* of the v2 method (clone and sweep, design read, design
candidates, prior-art map with the mechanical XL trigger) against the one
source mined last week under 1.x, so the operator can read the two notes side
by side. Nothing was triaged, landed, applied or committed. The tree moved
between the runs (`a5ec7f2` -> `bbcfd36`, 2026-09-02 19:05 +0800, "scrub
SSH_AUTH_SOCK from the sandbox subprocess env"); every anchor below is against
`bbcfd36`.

**Clone and sweep (Phase 2b).** Depth-1 clone at `C:/t/deerflow` with
`core.longpaths=true` (the 1.x note's long-path warnings did not recur).
Swept in the method's order, but with the design read's question in hand -
*why is it shaped this way* - rather than the claim hunt's: (1) the operating
documents: the tree's own index of module guides (27 `AGENTS.md`, 61k words,
imported by the assistant instruction file and maintained as the source of
truth for agent guidance), of which nine were read end to end - the backend
root, the harness root, `runtime/`, `app/gateway/`, `sandbox/`, `subagents/`,
`agents/middlewares/`, `extensions/`, `mcp/`; the CHANGELOG's Unreleased
breaking-changes block (the `X-Trace-Id` and `/mnt/skills` entries) as the
"why" paragraphs; `backend/docs/ARCHITECTURE.md` and the opening of the
pluggable-authorization RFC for stated forces. (2) The instrument and its
rules: `extensions/ordering.py` and `extensions/stack.py` (the composition
validator), `runtime/checkpoint_mode.py` and `runtime/checkpoint_state.py`
(the mode freeze and the accessor choke point), `tests/test_harness_boundary.py`
(the layering gate) - confirmed present, cited from the guides rather than
re-read. (3) Measurement: the checkpoint benchmark section of the runtime
guide (`bench_channels.py` / `bench_production.py`, with its operational
limits paragraph). (4) Types and config: `contracts/run_event_stream_contract.json`
and `contracts/subagent_status_contract.json` by reference from the guides.
(5) Tests: named from the guides' "pinned by" clauses only. (6) README last,
for vocabulary to strip. **Not read**: the memory, skills, channels, frontend,
tracing and config guides (~20k words), the CHANGELOG body below its breaking
block (~13k words), the two design specs the 1.x run read, and the blocking-IO
guard skill. That omission is the effort half of the before/after paragraph at
the end.

**Corroboration**: 0 web fetches. Every `corpus:` line below was decided by
opening the golden path the map returned (never from the slug, never from a
capped result); the three absences were re-checked with uncapped greps over
`knowledge/` (`middleware`: 46 hits in 21 files, none a hook-chain contract;
`checkpoint` under `llm-agent`: 14 hits in 12 files, none a thread-state
store; `plugin|extension point|entry point`: 20 KB of hits, the only
llm-agent one being mcp-tools' sentence *excluding* in-process plugin
systems from its scope).

## Design record

Seven entries. The rule applied to each: a decision without forces is a
feature and goes back to the claim lane; stage, not slug, decides the home;
the `corpus:` line is the routing count.

### D1 - The backend is a publishable harness package and an unpublished app, with one enforced dependency direction

```
decision:   Split backend into `packages/harness/deerflow` (publishable
            `deerflow-harness`: agents, tools, sandbox, models, MCP, skills,
            config) and `app/` (FastAPI gateway, IM channels). App imports
            deerflow; deerflow never imports app; a CI test enforces it.
            A third package, `packages/extension-api`, imports neither and
            carries no framework dependency.
forces:     The harness must be embeddable without HTTP (`DeerFlowClient`
            runs every capability in-process, no FastAPI) and must stay
            importable cheaply (package roots expose graph/executor entry
            points lazily because the LangGraph server resolves factories
            from the module dictionary). A framework that imported the app
            would recompile, retest and re-review with it, and could not be
            tested alone.
buys:       The same modules serve HTTP and embedded modes; every
            dict-returning client method is conformance-tested against the
            gateway's response models, so drift is a CI failure, not a
            support ticket. Testable: import the harness package in an
            interpreter with the app package absent - it must load.
rejects:    A single application package (the shape the tree started from -
            `rfc-extract-shared-modules.md` records the extraction); an
            extension API that imports the framework (rejected in
            `extensions/AGENTS.md`: "must never import deerflow").
where:      backend/AGENTS.md:172-196 (split, rule, forbidden-import
            example, `tests/test_harness_boundary.py`); 198-206 (lazy roots);
            backend/packages/harness/deerflow/AGENTS.md:49-90 (embedded client,
            conformance tests); extensions/AGENTS.md:138-139.
stage:      Package layout / build - before any run exists.
corpus:     MODELED - data-access/layering-rules (technique) and the
            data-access golden path's "Dependencies point down" section state
            these exact forces: the most trusted layer must be the most
            stable, an upward import ends solo testability, "state the rule
            where it can be read, gate it where it can be enforced", upward
            signals become injected hooks rather than imports (which is what
            `MemoryCallbacks.on_memory_llm_result` is). The corpus wrote it
            for a data layer; the forces are layer-agnostic. Catch ->
            source-tree application A1.
```

### D2 - Thread state persists in a process-frozen checkpoint *mode*, compatibility fails closed in one direction, and a resume that would fork non-self-contained state is rewritten as a linear head write

```
decision:   Checkpointer storage runs in `full` or `delta` channel mode,
            resolved once per process and frozen before the graph compiles
            (a second mode raises). Every delta checkpoint carries a mode
            marker; a full-mode process opening a delta thread is refused
            (409), while delta-mode processes read full checkpoints
            transparently. All thread-state access goes through one
            accessor that injects the marker, runs the gate, and
            materializes state. In delta mode a resume from an older
            checkpoint (regenerate, client-supplied checkpoint) is not a
            fork: the requested checkpoint's complete state is written onto
            the current head through a state-only mutation graph and the
            run proceeds linearly.
forces:     Full-mode checkpoints store the whole message list per step, so
            storage and serde grow O(N^2) in turns (a 2000-turn full run
            produced a ~33 GB sqlite file in the benchmark). Delta
            checkpoints are not self-contained: history walks collect every
            `pending_writes` entry on each on-path ancestor, and a shared
            parent also carries the abandoned sibling's writes - so a fork
            replays the answer it was meant to replace (#4458, reproduced on
            three savers). A full-mode raw read of a delta blob silently
            returns an empty message list, which is why the gate is
            asymmetric and fail-closed. Write-to-child ownership belongs to
            the upstream delta contract, so the tree does not reimplement
            the walk.
buys:       O(N) checkpoint growth with a smooth full->delta migration and
            no silent partial reads. Testable: open a delta thread from a
            full-mode process - it must refuse, not return fewer messages;
            regenerate in a branched delta thread - the superseded message
            must not reappear after reload.
rejects:    Forking in delta mode (the LangGraph default; kept in full mode,
            where checkpoints carry complete channel values); stamping the
            snapshot cadence into checkpoint metadata (deliberately not - it
            lives in the compiled graph's channel table so the compatibility
            marker's semantics do not change); hand-written checkpoints via
            `checkpointer.aput` (severs parentage, breaks delta replay).
where:      backend/packages/harness/deerflow/runtime/AGENTS.md:7 (modes),
            9 (freeze), 15 (asymmetric gate), 17 (accessor choke point,
            degraded raw read in full mode only), 21 (linearized resume,
            #4458), 23 (mutation graph + Overwrite), 25 (rollback flow),
            143-150 (where things live);
            backend/app/gateway/AGENTS.md:131 (fork rewritten before the
            graph starts), 137-159 (lineage-first replay base; settled-
            checkpoint requirement, #4531).
stage:      Run admission -> before the graph starts (resume rewrite), and
            every state read (the accessor).
corpus:     NONE. time-travel-replay's golden path disclaims this ground in
            its own words ("Not undo... resume from here is a checkpoint
            restore - undo-history's checkpoint-restore owns it"), and
            undo-history is a UI subject about a user's edit history, not a
            runtime's durable conversation state. prompt-assembly/history-
            compaction owns the *cut* of the message list, not its
            persistence or lineage. agent-memory owns the belief store, not
            thread state. Uncapped grep for `checkpoint` under llm-agent:
            14 hits, none about a persisted thread-state format, its
            compatibility, or forking. Nearest neighbour: job-coordination
            (models "position is a persisted fact" and terminal recovery
            for a job record, but says nothing about a state whose
            materialization depends on ancestry). HOME IF NEW: llm-agent/
            runtime-and-io.
```

### D3 - Every mutating thread operation, not only a run, is admitted as a durable operation kind under one uniqueness constraint, and ownership is a lease whose loss fences the writer

```
decision:   `runs.operation_kind` distinguishes `run` from
            `checkpoint_write`, `artifact_write`, `artifact_archive`,
            `branch` and `delete`; every active kind shares the durable
            active-thread uniqueness constraint and is created through
            `create_thread_operation_atomic()`. A worker's lease deadline is
            the last durably confirmed ownership; a renewal that reaches
            expiry sets a process-local `ownership_lost` fence, aborts the
            run, and the fenced worker performs no further journal, receipt,
            status, checkpoint or thread-metadata writes - the peer recovery
            path owns the terminal receipt. `cancel()` returns a closed
            outcome enum (cancelled / requested / taken_over /
            lease_valid_elsewhere / not_active_locally / not_cancellable /
            unknown). Orphan reconciliation claims with an atomic
            `claim_for_takeover()` that re-checks status and expiry.
forces:     Multi-worker gateways over one store: a process-local lock alone
            loses updates across workers; a run and a manual state write
            racing on one thread corrupts the checkpoint; a worker that can
            no longer confirm its lease may still be mid-write when a peer
            takes over, so "grace" must delay the peer, never extend the
            owner. Lease-less rows cannot be told apart from a live writer
            in a heartbeat-disabled worker, so they stay fail-closed and
            heartbeat-disabled multi-worker is unsupported.
buys:       One admission door for every thread mutation; an accepted cancel
            cannot be overwritten by a later success (competing CAS on the
            active row); a peer takeover cannot be undone by a late
            finalization (`update_run_completion` refuses to replace a
            different terminal status). Testable: kill a worker's store
            connection mid-run - no write from it may land after a peer's
            claim.
rejects:    "Another lock or metadata marker" per new operation kind
            (explicitly forbidden); a plain `update_status()` in startup
            reconciliation; extra execution time for an owner that cannot
            renew.
where:      backend/app/gateway/AGENTS.md:121 (cancel outcomes), 123 (CAS
            cancel vs finalize), 124 (fence, grace is not extra time), 125
            (claim_for_takeover), 126 (operation kinds, one constraint,
            lease-less fail-closed), 127 (reserve_checkpoint_write);
            backend/AGENTS.md:19 (multi-instance scheduler requires shared
            Postgres + heartbeat + db events), 22 (scheduled occurrence
            leases).
stage:      Admission of any thread mutation; lease renewal loop; startup
            and periodic orphan recovery.
corpus:     MODELED - job-coordination's golden path states the forces as
            its spine: "the record is the job; the process is its executor",
            ownership "won atomically and kept honestly" as a renewed lease
            whose expiry is evidence, "stale-holder writes fenced off",
            per-class verdicts at boot, and reconciliation of both the
            durable and the in-memory store. concurrency-guards owns "only
            one at a time". What the corpus does not say - that *every*
            mutation of the owning aggregate (not only the job) is admitted
            through the same uniqueness constraint - is a boundary case of
            one-validation-door, i.e. amendment-shaped, not a missing
            mechanism. The closed cancel-outcome enum is the same lead the
            1.x note filed as "additive stop-reason over a status enum",
            seen from the cancel side. Catch -> source-tree application A2.
```

### D4 - The agent is assembled as an ordered hook chain with semantic placements, validated ordering invariants, and a self-described fingerprint

```
decision:   Lead and subagent runtimes are built by one composition function
            from an ordered middleware list whose order is a contract:
            receipt stamping is the outermost tool wrapper because gates
            inside it can short-circuit a call with their own result and an
            inner receipt layer would gap the ledger; the write-freshness
            gate sits outside progress accounting so a blocked write costs
            no slot; input sanitization is the outermost model wrapper so
            retries see sanitized messages. Extension contributions declare
            a scope, a stable order and a *placement class*
            (MODEL_LOGICAL / MODEL_PHYSICAL / TOOL_VISIBLE / TOOL_RAW /
            STANDARD), never a list index; `extensions/stack.py` is the
            single final composition point and `extensions/ordering.py`
            validates the composed stack. Every behaviour-affecting
            middleware implements `release_policy_parameters()` (long text
            hashed); the assembly descriptor's fingerprint sorts tools and
            skills, preserves middleware order, and excludes the host build.
forces:     Stack order decides what wraps what, so a placement expressed as
            an index breaks the moment the host inserts a middleware; the
            lead builder appends after the shared base, so a contribution
            injected in the base lands in the wrong place; a fingerprint
            that folded in the build would move on every redeploy and could
            no longer answer "did this agent's assembly change". Module-
            scope imports from `extensions/` into `agents.middlewares` close
            a cycle, so both ordering tables resolve their classes at
            composition time - "defer the call, do not fake a resolved
            value".
buys:       A third party can add behaviour without knowing the host's
            list; ordering regressions are a compose-time failure; two
            deployments can be compared by assembly identity. Testable:
            reorder two middlewares - `assert_ordering` must fail; change a
            middleware's prompt text - the fingerprint must move; redeploy
            the same config - it must not.
rejects:    Index-based insertion; injecting inside the shared base
            builder; probing private attributes as the primary identity
            (kept only as a marked fallback); a lazy container subclass
            standing in for a deferred import.
where:      backend/packages/harness/deerflow/agents/middlewares/AGENTS.md:5
            (three-function assembly), 28-35 (self-description), 43-49
            (declared transform trail), 67-70 (why receipts are outermost,
            why the write gate sits outside progress);
            backend/packages/harness/deerflow/extensions/AGENTS.md:140-155
            (placement classes, single composition point, ordering owner,
            the deferred-call rule), 157-191 (assembly descriptor,
            fingerprint scope, unwrapping isolated middlewares).
stage:      Agent construction, per run and per delegated subagent - before
            the first model call.
corpus:     NONE. prompt-assembly's golden path is the nearest thing in
            the corpus and it models a sibling: composition-as-code, one
            assembler per family, ordering as contract, a fingerprint that
            excludes per-call payload - all for the *prompt text*. The
            hook chain wraps model and tool calls; its ordering decides
            which gate sees a short-circuited result and whether a ledger
            gaps, and its fingerprint feeds a release descriptor, not a
            cache key. prompt-assembly/fingerprinting-and-cache-keys and
            layered-composition mention the words and do not state these
            forces. mcp-tools/server-composition models "one dispatch door"
            on the server side of the wire, not the host's chain. agent-
            chaining is about chaining *agents*. Uncapped grep `middleware`
            over knowledge/: 46 hits in 21 files, all incidental (an
            application citing an Express middleware, audit-logging's
            write chokepoint). HOME IF NEW: llm-agent/runtime-and-io.
```

### D5 - Code enters the process only from operator-controlled startup config, runs isolated and fails open per hook, and its routes mount last behind a proven-shadow check

```
decision:   Python plugins load in deterministic order from the startup-only
            top-level `plugins:` list in `config.yaml` - never from
            `extensions_config.json`, which the gateway API writes. A plugin
            marked `required` fails gateway construction; optional plugins
            fail open with attributed diagnostics. Contributed middlewares
            are wrapped so a failure emits a diagnostic and passes through
            without repeating a downstream side effect; fail-open is decided
            by the *origin* of a `CancelledError` (only a genuine host-task
            cancellation propagates), not its class. Contributed routers are
            built eagerly but mounted after all host routes, and a router is
            rejected atomically when an earlier route provably covers one
            of its paths; contributed WebSocket routes, Mounts and custom
            lifespans are rejected. The install transaction runs `uv` with
            environment overrides discarded, audits the lock for
            non-reproducible local references, and rolls back declarations,
            config and snapshot together.
forces:     Importing a Python entry point is code execution with gateway
            privileges, and `extensions_config.json` is reachable from an
            authenticated HTTP call - the two config files are two trust
            tiers. `required: true` turns any later load failure (a missing
            native library, a deleted snapshot) into a startup abort
            recoverable only by shell access, so it is opt-in. A
            contributor's internal timeout can raise `CancelledError`
            without the host being cancelled; propagating it would end an
            otherwise successful run as cancelled and skip successor
            contributors. A route matcher that only *guessed* at shadowing
            would either block legitimate routes or let an extension
            shadow an auth-exempt host path. `uv add` executes the
            package's build backend, so config validation must precede it.
buys:       An admin with API access cannot load code; a broken extension
            cannot take the gateway down unless the operator said it may;
            host handlers always win; production startup never resolves
            dependencies from the network. Testable: PUT a `plugins:` key
            through the API - it must be ignored; raise `CancelledError`
            from a contributor - the run must complete and later
            contributors must run.
rejects:    A write path for `extensions.middlewares` through the API
            ("must not add ... without an explicit trust-boundary review");
            editable-link installs (snapshots only); a vendored copy of the
            router's path helper (a private import that disappears fails
            loudly, a stale copy diverges silently at a security boundary);
            a bigger denylist as a substitute for the boundary.
where:      backend/packages/harness/deerflow/extensions/AGENTS.md:3-8
            (operator-only list, required vs optional), 20-35 (transaction,
            validate before uv runs), 46-55 (env overrides discarded, uv
            pinned), 84-95 (lock audit), 193-199 (isolation), 225-232
            (fail-open by origin), 285-313 (routers last, proven shadows,
            the private-import argument), 315-329 (principal projection).
stage:      Gateway construction (startup) and per-run contributor dispatch.
corpus:     NONE. ci-execution-trust/injected-code-scope-ladder models the
            tier force generically ("who can change it" per tier, "push
            injected code down the ladder", one enumerable place per tier)
            for a delivery system; its golden path does not state the
            runtime-extension forces - two config files at two trust tiers,
            isolation with fail-open decided by failure origin, route
            mounting order with shadow proofs. mcp-tools' golden path names
            the hole itself: "plugin systems that load code into the host's
            address space (no process boundary, so no protocol - a
            different and weaker isolation story)" are declared *not this
            subject*. Nothing in llm-agent picks them up. HOME IF NEW:
            llm-agent/runtime-and-io.
```

### D6 - Long-running remote work leaves the agent loop after submit; the database is the truth and the loop receives a bounded projection

```
decision:   Long-running MCP work uses a separate durable task runtime
            (`McpTaskService` + `mcp_tasks` rows with lease-based recovery)
            rather than keeping remote task IDs or status polling inside the
            agent loop. Explicit `task_toolsets` bind raw submit/status/
            cancel names; status and cancel are hidden from the model and
            submit is replaced by a wrapper that persists the remote handle
            before returning a local ID. A result returned after lease
            expiry or after a cancel request is discarded even when the
            owner token matches. Terminal and input-required snapshots are
            delivered by idempotent internal agent runs with the trusted
            delivery instruction outside the input boundary and the remote
            event framed as untrusted; a deleted target thread dead-letters
            immediately. `ThreadState` receives only a bounded current-
            thread projection.
forces:     A remote handle held in model context is lost to compaction and
            dies with the run; polling inside the loop ties liveness to a
            model turn; a status result written after lease expiry can
            overwrite a peer's newer state; a notification run that
            recreated a deleted thread would resurrect a chat the user
            removed; a delivery instruction inside the input boundary is an
            injection channel from the remote server.
buys:       Remote work survives gateway restarts and compaction; the model
            sees one ID and no protocol; delivery is idempotent and framed.
            Testable: restart the gateway mid-task - the task must resume
            polling from the row, and the model must not have been asked to
            poll.
rejects:    Remote IDs in `ThreadState`; automatic retry of the submitting
            turn; recreating a missing thread for delivery; management-tool
            exposure driven by config on disk (the installed process-local
            submitter is the source of truth; hot edits wait for restart).
where:      backend/AGENTS.md:20-21; backend/packages/harness/deerflow/mcp/
            AGENTS.md:4 (foundation, lease-owned status writes), 5 (runtime
            availability boundary), 6 (driver binding, only submit
            visible), 7 (payload bounds fail as protocol failures), 37-40
            (durable runtime, fencing, dead-letter, framing);
            backend/app/gateway/AGENTS.md:5 (trusted instruction outside
            the input boundary).
stage:      Tool dispatch for a task-enabled server; then a background loop
            outside any run; then delivery admission.
corpus:     NONE. mcp-tools' golden path models the *wire* half in one
            sentence ("Long-running work gets a durable handle, not a held
            connection") and stops at the host's door. job-coordination
            models the durable-record spine for jobs in general, but its
            forces are about executors dying, not about what a model's
            context may hold; the decision that matters here - the agent
            loop holds neither the handle nor the poll, and receives a
            bounded, untrusted-framed projection - is stated nowhere.
            The 1.x note's U3 boundary finding applies: mcp-tools scopes
            itself to the wire contract. HOME IF NEW: llm-agent/runtime-
            and-io (the map printed `HOME IF NEW: software-engineering/
            llm-agent` for this query).
```

### D7 - Metadata that carries trust is server-owned: stamped unconditionally at the producer, stripped from every client input at one door

```
decision:   Provenance keys (`deerflow_content_kind`, `deerflow_producer_
            kind`, entity id), message seq (`deerflow_seq`), delegation
            receipts and acceptance verdicts, the trace id, `is_internal`,
            `authz_attributes`, `channel_user_id`, `original_user_content`
            and the vision marker are all in server-owned key sets; the
            gateway strips them from inbound messages and run config, and
            producers stamp them whether or not an observer is installed
            ("a fact whose presence depends on whether an observer is
            installed is not a fact"). A caller-sent trace id is replaced,
            never honoured.
forces:     By the model-call boundary an injected message is
            indistinguishable from any other, so provenance must be
            recorded where it is known; a welded-in seq goes stale when a
            fork re-seeds the feed; a persisted run that disagrees with the
            response header and the logs is worse than no correlation;
            `created_by=system` carries privileged semantics in the
            upstream runtime, so it too is server-owned.
buys:       No client can forge a verdict, a provenance, an internal-caller
            flag or a correlation id; observers see the same facts whether
            or not they were installed at write time. Testable: send a
            message with a forged verdict key - it must be absent after
            normalization.
rejects:    Conditional stamping (only when an observer exists); honouring
            a caller-supplied trace id for cross-service pinning (use the
            request header instead); `if trace_id:` guards downstream.
where:      backend/packages/harness/deerflow/agents/middlewares/AGENTS.md:
            7-26 (provenance, unconditional, server-owned), 39
            (original_user_content), 61-66 (authorization outcome under a
            stripped key), 72 (is_internal, channel_user_id);
            backend/app/gateway/AGENTS.md:23 (created_by), 78-85 (seq
            stripped, #4380); backend/packages/harness/deerflow/AGENTS.md:
            5-11 (trace id: ContextVar only source, every carrier derived,
            caller value replaced); runtime/AGENTS.md:60-62.
stage:      Gateway input normalization and every producing middleware.
corpus:     MODELED - across bundles. llm-observability/llm-call-telemetry-
            model's golden path states the forces exactly: "an accounting
            record that happens to arrive over an untrusted channel ...
            owned by its receiver", attribution partitioned into client-
            asserted vs server-owned, "stamped from the authenticated
            principal and any client-sent value is stripped" at "one
            function ... before storage"; its technique server-owned-fields
            is the mechanism, and the bundle carries the law server-owns-
            the-accounting-clock. The agent gateway is a second instance
            of the same decision with message metadata in place of billing
            attribution. The 1.x note read this as U5 "partial" against
            prompt-assembly; the model lives in a different bundle and the
            slug match never found it. Catch -> source-tree application A3
            (cross-bundle; see open question Q3 in the XL spec).
```

**Entries returned to the claim lane** (decisions without forces, or forces
the corpus already models as a boundary case): the benefit-based delegation
policy and the per-run total cap (1.x U1/U2 - parallel-dispatch owns the slot
cap; the total cap is a boundary case of it); the additive `stop_reason`
(a contract-compatibility decision with one force; it is the 1.x lead, and
D3's `CancelOutcome` enum is its other half); the sandbox ownership lease
states (landed last week as the lease-renewal amendment; the two-state
`own:`/`del:` lease with a held teardown is mechanism-shaped and would be a
technique under v2, recorded here as owed rather than re-derived); the
three-layer completion verification (landed last week as
completion-claim-verification, now a clean catch - see A4 in the owed list).

## Routing decision

**Routing count: 4** (D2, D4, D5, D6 read `corpus: NONE`). Under the v2 rule
("three or more -> the source is a forge job"), the decision is **hand off to
`/forge`**: the design record above is the scout brief; the NONE entries are
the first candidate subjects in forge's Phase 1; the source-tree applications
in this note are forge's Phase 3 reconciliation targets. This run does not
dispatch the handoff (it is a replication with `--design-only` semantics), so
the record is banked here rather than under `librarian/handoffs/`. Intake
would resume only for the claims the design read did not absorb: the three
1.x leads, the currency signals in the CHANGELOG's Fixed list, and the
one-paragraph corrections (the lease-renewal and decay-and-forgetting
amendments the 1.x run already landed).

Under 1.x the same tree produced a routing count of zero by construction -
the count did not exist - and the run reached Phase 5 with 22 claim rows.

## Design candidates (Phase 3, v2 rows)

Strip test deferred to Phase 7 for all four; product names kept through
triage by rule. Effort is XL for all four by construction (a mechanism with
no home is a subject or a technique in a new subject, never an amendment).

| # | title | decision (tree's terms) | forces (one line) | stage | lane | shape | eff | prior art (top hit, opened) | impact | HOME IF NEW |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1 (D2) | Freeze the checkpoint mode; fail closed one way; linearize instead of fork | full/delta channel modes, process-frozen; delta->full refused, full->delta transparent; `CheckpointStateAccessor` is the only read path; delta resume rewrites the head instead of forking | O(N^2) storage vs. non-self-contained delta state that replays an abandoned sibling's writes on fork | before the graph starts; every state read | K | design | XL | time-travel-replay (disclaims); undo-history/checkpoint-restore (UI) | new-subject | llm-agent/runtime-and-io |
| C2 (D4) | Compose the agent from placement-classed hooks with validated order and a self-described fingerprint | one composition point, placement classes not indices, ordering validated at compose time, `release_policy_parameters()` identity, order-preserving fingerprint that excludes the build | order decides what wraps what; a short-circuiting gate inside the receipt layer gaps the ledger; a build-inclusive fingerprint moves on every deploy | agent construction | K | design | XL | prompt-assembly (sibling for prompt text, not the hook chain) | new-subject | llm-agent/runtime-and-io |
| C3 (D5) | Load code only from operator startup config; isolate and fail open by failure origin; mount contributed routes last behind proven shadows | `plugins:` in `config.yaml` never in the API-writable file; `required` opt-in; `IsolatedMiddleware`; `CancelledError` propagates only on genuine host cancellation; routers rejected atomically on a provable shadow | two config files are two trust tiers; contributor timeouts look like host cancellation; a guessed shadow check fails in both directions | gateway startup; per-run contributor dispatch | K | design | XL | ci-execution-trust/injected-code-scope-ladder (tiers for CI); mcp-tools (names the hole as out of scope) | new-subject | llm-agent/runtime-and-io |
| C4 (D6) | Keep long-running remote work out of the loop: submit-only visibility, DB truth, bounded projection, framed idempotent delivery | `McpTaskService` + `mcp_tasks` with leases; status/cancel hidden; results after expiry or cancel discarded; delivery via internal runs with the instruction outside the input boundary | a handle in context dies with compaction and the run; a late status write clobbers a peer; delivery inside the input boundary is an injection channel | tool dispatch -> background loop -> delivery admission | K | design | XL | mcp-tools (wire half only); job-coordination (record spine, not the loop boundary) | new-subject | llm-agent/runtime-and-io |

Three record entries are catches and do not become candidates; they become
source-tree applications (A1-A3 below). Per the v2 triage rule, none of the
four rows can be `likely catch` - the record already checked.

## XL spec (the mechanical trigger fired)

**Trigger.** Four `design` candidates carry one HOME IF NEW
(`software-engineering/llm-agent/runtime-and-io`) and two of them share one
NONE-neighbour (mcp-tools, which excludes both C3's and C4's ground in its own
scope sentence). Three is the threshold; the count replaces the noticing. The
1.x run read three of these four subsystems (middlewares, mcp; the
extensions and runtime guides were never opened) and noticed nothing, because
it was reading for quotable claims.

**Placement authority.** `knowledge/software-engineering/taxonomy.json`
(`rkb-taxonomy/1`, layout `nested`) places subjects under
`llm-agent` -> subcategory `runtime-and-io` (currently: streaming-output,
subprocess-lifecycle, agent-cli-transport, mcp-tools, terminal-multiplexing,
sidecar-provisioning, voice-io, agent-addressable-ui). A new subject is added
to that subcategory's `subjects` list and the folder is materialized through
`scripts/apply-taxonomy.mjs`, never by hand - the file's own `$comment` says a
hand-edited recategorization is a corpus-wide link break.

**Bundle / category / subject.**
`software-engineering` / `llm-agent` / `runtime-and-io` /
**`agent-runtime-assembly`** - the layer between the gateway's admission door
and the model call: how a run's execution pipeline is composed from ordered
hooks, what may extend it and under whose authority, what durable state it
holds, and what it must keep outside itself. Slug free of product, framework
and scaffold names.

**Golden-path stance the forge should test against the tree.** A run is an
assembled artifact with an identity, not a list of features that happen to be
on; every gate's position in the chain is a correctness property, not a
preference; code that extends the runtime enters by the operator's hand and
fails in its own lane; and the loop holds only what survives compaction and
a restart - everything else is a projection of a store that outlives the run.

**Proposed techniques** (slug - the decision rule it must carry - record
entry - reconciliation anchor):

1. `semantic-hook-placement` - *a contribution declares where it sits by
   what it needs to see (model-logical / model-physical / tool-visible /
   tool-raw), never by index; one final composition point; ordering
   invariants are validated when the stack is composed, and the invariant
   that names itself is "the outermost tool wrapper is the one whose
   omission would gap a ledger".* D4. `extensions/AGENTS.md:140-155`,
   `middlewares/AGENTS.md:67-70`, `extensions/ordering.py`,
   `extensions/stack.py`.
2. `assembly-identity` - *every behaviour-affecting hook declares its
   policy parameters as an identity (long text hashed, never embedded);
   the assembly fingerprint sorts what is order-insensitive (tools,
   skills), preserves what is not (hook order), and excludes the host build
   so it answers exactly one question - did this agent's assembly change.*
   D4. `middlewares/AGENTS.md:28-35`, `extensions/AGENTS.md:157-191`.
   Boundary with prompt-assembly/fingerprinting-and-cache-keys must be
   written: that one digests the prompt for cache safety; this one digests
   the runtime for release comparison.
3. `operator-tier-code-loading` - *code entry points come only from
   startup config the API cannot write; a load failure is fatal only when
   the operator marked the plugin required; a contributed hook runs
   isolated and fails open without repeating a downstream side effect, and
   fail-open is decided by the origin of the failure (only a genuine host
   cancellation propagates), not its class.* D5.
   `extensions/AGENTS.md:3-8, 193-199, 225-232`.
4. `host-routes-win` - *contributed routes are built early and mounted
   last; a contribution is rejected atomically when an existing route
   provably covers one of its paths for the same method; unprovable
   relationships are allowed rather than guessed; contributed lifespans,
   mounts and socket routes are refused until the host can authenticate
   them; the security predicates classify the path the router actually
   matches on, by importing the router's own helper, because a stale copy
   diverges silently at a security boundary.* D5.
   `extensions/AGENTS.md:285-313`.
5. `bounded-projection-of-external-work` - *a remote operation that
   outlives a turn is submitted from the loop and never polled by it; only
   submit is model-visible and it returns a local id after the handle is
   persisted; the store is the truth and the loop receives a bounded
   projection; a result arriving after lease expiry or after a cancel
   request is discarded even from the right owner; delivery is an
   idempotent run whose trusted instruction sits outside the input boundary
   and whose remote payload is framed as untrusted.* D6.
   `mcp/AGENTS.md:4-7, 37-40`, `backend/AGENTS.md:20`,
   `gateway/AGENTS.md:5`.
6. `checkpoint-mode-custody` - *durable conversation state has a mode
   frozen per process; every read goes through one accessor that gates
   compatibility; compatibility fails closed in the direction that would
   read partial state silently and stays open in the direction that reads
   complete state; when a resume would fork state that is not
   self-contained, the runtime rewrites it as a linear head write rather
   than reimplementing the store's ancestry walk.* D2.
   `runtime/AGENTS.md:7-25`, `gateway/AGENTS.md:131, 137-159`.

**Boundaries the subject must NOT absorb.**
- The prompt's text and budget - prompt-assembly (composition of the
  artifact the model reads; history-compaction owns the cut).
- The wire contract with a tool server - mcp-tools (its scope sentence is
  the seam; this subject is the host-side "plugin systems that load code
  into the host's address space" mcp-tools declares out of scope).
- The job record and its lease - job-coordination (D3 is a catch there;
  technique 5 *consumes* a lease, it does not define one).
- The fleet's session registry and harvest - fleet-orchestration
  (completion-claim-verification stays there; the receipt middleware's
  *placement* is technique 1's example, its *verification* is not).
- The child process - subprocess-lifecycle; the trace id's propagation -
  tracing/cross-boundary-propagation (1.x U4 is an amendment there).
- Delivery-system trust tiers - ci-execution-trust (technique 3 should cite
  injected-code-scope-ladder as the general ladder and state why the runtime
  needs its own tier rule).
- Server-owned metadata - llm-call-telemetry-model/server-owned-fields
  (catch; see Q3).

**Open questions for the forge director.**
- Q1. Is `checkpoint-mode-custody` this subject's, or the seed of a second
  subject (a durable conversation-state store: modes, lineage, replay base,
  branch seeding) that prompt-assembly's history techniques would then
  consume? Two of the four candidates (C1, C4) are about custody rather than
  assembly; if the scouts find a third custody decision in the guides this
  run did not read (memory, channels, config), the pair becomes a subject.
- Q2. Does the tree's own history (the `rfc-extract-shared-modules` and the
  `2026-07-10` authorization RFC with its implementation-notes handoff
  record) carry rejected alternatives the guides compress away? The RFC's
  two-layer authorization (assembly-time capability filter + run-time
  execution check from one policy) is a candidate seventh technique this
  run did not have room to record.
- Q3. Cross-bundle sharing: the taxonomy's `technique@owner` form
  (job-coordination lists `atomic-claiming@delivery-guarantees`) is used
  within a bundle; whether llm-agent may share `server-owned-fields@llm-
  call-telemetry-model` from llm-observability, or must mint a sibling, is a
  registry rule question, not a forge one.
- Q4. `assembly-identity` versus prompt-assembly's fingerprint: one
  technique with two scopes, or two techniques with a written boundary? The
  tree keeps them separate (prompt hash is one field *inside* the assembly
  descriptor).

**Anchors in the tree for the scouts** (all against `bbcfd36`):
`backend/packages/harness/deerflow/extensions/AGENTS.md` (3,652 words - the
densest single document for techniques 1-4), `agents/middlewares/AGENTS.md`
(4,761), `runtime/AGENTS.md` (3,848), `mcp/AGENTS.md` (3,162),
`app/gateway/AGENTS.md` (4,940); instruments `extensions/ordering.py`,
`extensions/stack.py`, `runtime/checkpoint_mode.py`,
`runtime/checkpoint_state.py`; tests named in the guides
(`test_checkpoint_mode.py`, `test_context_compaction.py`,
`test_gateway_request_path.py`, `test_run_worker_rollback.py`); the
unread guides `agents/memory/AGENTS.md`, `skills/AGENTS.md`,
`app/channels/AGENTS.md`, `config/AGENTS.md` as the scouts' first sweep.

## Source-tree applications (draft)

Phase 7 v2 shape: one per design-record entry whose `corpus:` names a
subject, written against the source's own clone, `stack:` the source's
stack, body = the record's decision / forces / buys. Product names allowed.
These are drafts inside the note, not files under `knowledge/`; `status:
draft` says so. `verified_on` is today because the citations were resolved
today against an opened tree; `verified_against` is the commit.

### A1 - `data-access/applications/python--layering-rules.md`

```yaml
---
layer: application
type: application
subject: data-access
technique: layering-rules
stack: python
status: draft
verified_on: 2026-09-02
verified_against: bbcfd368bf330f63ac69a570530cbd3646d54987
commit: bbcfd36
---
```

**Python - a publishable agent harness and an unpublished gateway app, with
the direction gated in CI (deer-flow).** The technique's two boundary
properties appear one layer up from where the corpus wrote them: not a data
layer under application logic, but a framework package
(`packages/harness/deerflow`, published as `deerflow-harness`) under an
application (`app/`, the FastAPI gateway and IM channels), with a third,
dependency-free contract package (`packages/extension-api`) below both.
`backend/AGENTS.md:172-196` states the rule in the technique's own shape -
"App imports deerflow, but deerflow never imports app" - and gates it where it
can be enforced: `tests/test_harness_boundary.py` runs in CI and the guide
shows the forbidden import as a CI failure. The forces are the technique's:
the harness must load without the app (the embedded `DeerFlowClient`,
`deerflow/AGENTS.md:49-53`, runs every capability in-process with no web
framework dependency), and the package roots expose heavy entry points lazily
(`backend/AGENTS.md:198-206`) so that importing the framework stays cheap.
The technique's "upward signals: hooks, not imports" rule is visible in the
memory subsystem, which must stay vendorable and cannot import the extension
API, so it reports through a host callback (`extensions/AGENTS.md:331-340`).
What the tree adds to the technique: the layer boundary is also a
*conformance* boundary - every dict-returning client method is parsed through
the gateway's response model in a test (`deerflow/AGENTS.md:90`), so the two
layers cannot drift in the direction the import rule does not cover.

### A2 - `job-coordination/applications/python--lease-renewal.md`

```yaml
---
layer: application
type: application
subject: job-coordination
technique: lease-renewal
stack: python
status: draft
verified_on: 2026-09-02
verified_against: bbcfd368bf330f63ac69a570530cbd3646d54987
commit: bbcfd36
---
```

**Python - every thread mutation is an operation kind under one lease, and
a lost lease fences the writer (deer-flow gateway runtime).** The record is
the run: `RunManager` and `RunStore` admit a run - and, through the same
`create_thread_operation_atomic()`, a checkpoint write, artifact write,
archive, branch or delete - under one durable active-thread uniqueness
constraint (`app/gateway/AGENTS.md:126`). The lease is the technique's:
`RunRecord.lease_expires_at` is "the last durably confirmed ownership
deadline", renewal is bounded by it, and an attempt that reaches expiry sets
a process-local `ownership_lost` fence, raises the abort event and cancels
the run task; a fenced worker performs none of the terminal writes - journal,
receipt, status, checkpoint, thread metadata - and the peer recovery path
owns the receipt (`:124`). Grace "delays peer reclamation for clock skew but
is not extra execution time for an owner that can no longer confirm its
lease" - the technique's expiry-is-evidence stance stated as policy. Takeover
uses an atomic claim that re-checks status and expiry so a renewal between
the scan and the write keeps the run active (`:125`); cancel and owner
finalization are competing CAS operations on the active row (`:123`), and
`update_run_completion()` refuses to replace a different terminal status,
which closes the late-finalization race the technique warns about. The
condition the corpus's lease-renewal amendment records ("absent is not lost")
is honoured on the scheduler side too: an expired launch claim returns to the
durable queue rather than failing the occurrence (`backend/AGENTS.md:22`).
What the tree adds: the closed `CancelOutcome` vocabulary (`:121`) - seven
values that name *why* a cancel did or did not land locally - is the cancel-
side counterpart of the technique's terminal verdicts, and the lease-less
row is treated as fail-closed because "the store cannot distinguish a stale
row from a live writer in another heartbeat-disabled worker" (`:126`).

### A3 - `llm-call-telemetry-model/applications/python--server-owned-fields.md`

```yaml
---
layer: application
type: application
subject: llm-call-telemetry-model
technique: server-owned-fields
stack: python
status: draft
verified_on: 2026-09-02
verified_against: bbcfd368bf330f63ac69a570530cbd3646d54987
commit: bbcfd36
---
```

**Python - server-owned message metadata in an agent gateway (deer-flow).**
The technique's stamp-and-strip door, applied to a run request instead of a
telemetry event. `_SERVER_OWNED_MESSAGE_METADATA_KEYS` holds the provenance
triple every injecting middleware stamps
(`agents/middlewares/AGENTS.md:7-26`); `services.py::normalize_input` strips
the display seq (`app/gateway/AGENTS.md:78-85`, #4380); the gateway derives
`is_internal` only from the server-side auth source and accepts
`channel_user_id` only from an internally authenticated caller's top-level
context (`middlewares/AGENTS.md:72`); assistant `created_by` is server-owned
because the upstream runtime gives `system` privileged semantics
(`gateway/AGENTS.md:23`); and the request trace id is a ContextVar the
gateway binds, every other carrier "a derived output, never read back as an
input", a caller-sent value "replaced - honouring it would let the persisted
run disagree with the header and the logs" (`deerflow/AGENTS.md:5-11`). The
technique's one-door property holds: `build_run_config` merges metadata onto
a copy so the stamp cannot reach the client's config, and `__`-prefixed
runtime keys are stripped by the same function. What the tree adds, and the
telemetry subject does not say because its producers are SDKs rather than
middlewares: stamping is *unconditional* - "a fact whose presence depends on
whether an observer is installed is not a fact" - and the guide enumerates
which producers deliberately do *not* stamp and why (summarization and title
are attributed through system-model-call observation instead). Cross-bundle
placement is open question Q3 of the XL spec.

**Owed, not drafted (cap of three):** A4
`fleet-orchestration/applications/python--completion-claim-verification.md`
against the tree the technique was forged from - the 1.x run landed the
technique and applied it to two fleet projects but, under v1, wrote no
application against the source; `subagents/AGENTS.md:10-12` is the anchor,
and the acceptance-checklist paragraph is a 4,800-word application in
itself.

## Before/after vs the 1.x note

| dimension | 1.x note (`intake-deer-flow-0902`, `a5ec7f2`) | v2 front half (this run, `bbcfd36`) |
| --- | --- | --- |
| words swept | CHANGELOG to line 760 (~14k) + 4 module guides (subagents, middlewares, sandbox, memory, ~17k) + 2 design specs + 1 skill + contracts; ~35k in-tree | 9 module guides (35,152 words) + CHANGELOG breaking block + ARCHITECTURE + RFC head; ~40k in-tree; CHANGELOG body, memory/skills/channels guides and the specs not read |
| what it read for | claims (quotable rules), then excellence | decisions (forces, rejections, stage) |
| extracted | 22 claim rows | 7 design-record entries -> 4 design candidates + 3 catches |
| routing count | not computed (did not exist) | 4 -> forge handoff |
| accepted / landed | 4: completion-claim-verification (technique), write-freshness-gate (technique), lease-renewal amendment, decay-and-forgetting amendment | none (front half only); the landing shape by rule would be 1 subject with 6 techniques via forge, plus 3 applications |
| already covered | 4 catches, folded or recorded | 3 catches -> 3 source-tree applications drafted (v1 wrote applications only for fleet projects, so the tree's own architecture went nowhere) |
| leads / currency | 3 leads with return conditions; rescan condition set; Fixed-list trace-id lesson | not reached (Phases 5-9 out of scope); the additive stop-reason lead is re-sighted from the cancel side in D3 |
| untriaged | 11 rows (U1-U11) | n/a; U3 (command audit), U5 (provenance), U8 (self-description) reappear as D-record material - U5 resolved as a cross-bundle catch, U8 as a technique in the XL spec, U3 still homeless (a sandbox-execution subject would hold it; not among the four because its forces are audit-not-boundary and it is one middleware's rule, not the runtime's shape) |
| XL spec | none proposed ("no run noticed") | 1: `agent-runtime-assembly`, 6 techniques, 4 open questions |
| applied to fleet | 3 applied (personas x2 better, pumper not-better), 1 unapplied | none (out of scope) |
| web fetches | 0 of 3 | 0 |

**The three biggest things 1.x missed**, in the order a forge director would
care: (1) the **extension system** - operator-tier code loading, isolation
with fail-open by failure origin, proven-shadow route mounting - an entire
3,652-word guide the 1.x run never opened, on ground mcp-tools explicitly
declares out of its scope; (2) the **checkpoint mode design** - frozen mode,
asymmetric fail-closed compatibility, one accessor, forks linearized when
state is not self-contained - the runtime guide was not on the 1.x sweep
list, and nothing in the corpus owns durable conversation state; (3) the
**middleware chain as a composition contract** with placement classes and an
assembly fingerprint - 1.x saw this guide and extracted U5 and U8 as partial
claims, i.e. it read the two most load-bearing paragraphs as quotable rules
about provenance and hashing rather than as the shape of the runtime. The
durable MCP task runtime (D6) is a fourth, missed for the same reason as (1).

**What 1.x caught that the v2 front half does not reach.** All four landings
- the front half produces no landing at all, and two of the four (the
lease-renewal and decay-and-forgetting amendments) are exactly the
one-paragraph corrections v2 says intake should still make *after* the
handoff, so they are not superseded, they are sequenced. The three leads
with their return conditions, the rescan condition, and the excellence sweep
(the blocking-IO guard as an instrument pattern; module guides as the
source of truth) are claim-lane and practices-lane products the design read
does not produce; the trace-id lesson from the Fixed list came from
CHANGELOG depth this run did not have. The untriaged table's honesty - eleven
rows extracted and left visible - has no v2 counterpart yet; the design
record's "returned to the claim lane" paragraph is thinner.

**Method or effort - honestly.** Both, and separably. *Effort*: this run
spent roughly 40 minutes and read nine guides against the 1.x run's four,
so about twice the module-guide words; but it read ~13k fewer CHANGELOG
words and none of the specs, so total in-tree words swept are within ~15% of
each other (~40k vs ~35k). The corpus side was heavier here by rule: eight
golden paths and one technique opened in full, seven map calls, four
uncapped greps, versus the 1.x run's map-and-grep hunt that returned "none"
on *subagent delegation* and stopped. *Method*: the three biggest misses
are not in the guides 1.x skipped by chance - two of the four NONE entries
(D4, D6) sit in guides the 1.x run *did* read end to end (middlewares, and
mcp via the sandbox/subagent cross-references), and it extracted from them
the sentences that could be quoted (U3, U5, U8) rather than the decision
those sentences serve. A claim hunt cannot see a decision because a decision
is never one sentence; the design read found D4 by asking what the ordering
paragraph was *for*. The routing count, not the extra reading, is what
turned "eleven untriaged partials" into "one subject, six techniques": under
1.x the same four subsystems would have produced four more amendment-shaped
rows. So: the additional reading found D2 and D5; the method found D4 and
D6 in material 1.x already had; and the XL spec exists only because the
count replaced the noticing. What effort alone would *not* have fixed is
the cross-bundle catch (D7): the 1.x run's slug map could not see
llm-observability's server-owned-fields from a prompt-assembly neighbourhood,
and only opening the telemetry golden path did.

**Not done, by design.** No triage, no verification lane beyond the design
read's own opening of golden paths, no landing, no fleet application, no
board beats for homes (nothing was claimed as a home because nothing is
being written), no index regeneration, no commit. The clone was deleted by
name at the end; the board claim was released.
