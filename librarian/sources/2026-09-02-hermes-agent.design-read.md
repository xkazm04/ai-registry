# Intake front half — `NousResearch/hermes-agent` @ `0cbc6e37ac9fce50905157805c89fae06da93845`

Run: `intake-hermes-0902` (front half: Phases 2b, 2d, 3, 4, Phase 5 promoting questions).
Clone: `C:/t/hermes`. Registry read-only. Product names allowed in this file.
Web fetches spent: **0**.

---

## 1. Class read and expected yield

This is a **research-model release** in the `source-classes.md` sense, not a vendor
repository — the discriminating question is whether the engine and the operating
instructions ship in one tree, and here they do: `docs/` carries 36,663 words of
first-party operating documents (ADRs, design docs, wire contracts, an RCA, a research
spike) and `AGENTS.md` carries another 12,585 words of house law, all of it checkable
in-run against ~638,000 lines of Python that implements it. The vendor-repository read
would be wrong because there is no hosted closed engine whose data model has to be
reverse-engineered from a client's types; the whole runtime is present. The class's
stated yield order — first-party prompt-engineering artifacts, then config plus the code
that reads it, then far behind the README — held exactly: the README (1,779 words in
tree, 2,059 on the landing page) contributed nothing to this record, and every entry
below comes from `docs/`, `AGENTS.md`, or the runtime. The class also predicts the
**sibling-instruction discriminator** ("a release shipping two sibling systems hands you
discriminators for free"), and this tree ships three pairs that argue with each other:
observer hooks vs middleware, batch compaction vs micro-compaction, and — the richest —
`docs/rfcs/2026-07-plugin-architecture-lessons-pi-opencode.md`, which is a first-party
comparative spike of *two other* agent harnesses' plugin systems with file:line anchors
and verified absences. Expected yield for the class is high and the run met it: twelve
load-bearing decisions the corpus does not model, across five subsystems. The fetch
budget does not bind for this class and none was spent.

---

## 2. Sweep log

Sweep order followed Phase 2b: operating documents → the instrument and its rules → the
measurement → types and config schema → tests → README last.

### Operating documents (read, in order)

| # | file | words | read |
| --- | --- | ---: | --- |
| 1 | `docs/ADR.md` | 535 | whole |
| 2 | `docs/design/multiplexing-gateway.md` | 1,366 | whole |
| 3 | `docs/design/profile-builder.md` | 996 | whole |
| 4 | `docs/rfcs/2026-07-plugin-architecture-lessons-pi-opencode.md` | 2,918 | whole |
| 5 | `docs/rfcs/plugin-config-state-bridge.md` | 644 | whole |
| 6 | `docs/security/network-egress-isolation.md` | 755 | whole |
| 7 | `docs/state-db-recovery.md` | 643 | whole |
| 8 | `docs/session-lifecycle.md` | 4,137 | outline + §7 restart recovery, §8 queuing in full (~1,900 w) |
| 9 | `docs/micro-compaction.md` | 3,121 | whole |
| 10 | `docs/relay-connector-contract.md` | 7,116 | outline + §3.2–3.4, §6, §6.1, §9 in full (~2,600 w) |
| 11 | `docs/chronos-managed-cron-contract.md` | 1,610 | trust model, at-most-once, reconcile, config (~800 w) |
| 12 | `docs/middleware/README.md` | 1,107 | whole |
| 13 | `docs/observability/README.md` | 1,502 | contract + return-value table (~600 w) |
| 14 | `AGENTS.md` | 12,585 | §Rubric, §Verify-the-premise, §Footprint Ladder, §Session-not-env, §Skill standards, §Toolsets, §Delegation, §Policies, §Profiles (~5,200 w) |

Not opened (recorded, not swept): `docs/billing-lifecycle.md` (2,551 — a client-side
render/error taxonomy, product-shaped), `docs/observability/relay-shared-metrics.md`
(3,570), `docs/observability/monitoring.md` (1,966), `docs/profile-routing.md` (688),
`docs/kanban/multi-gateway.md` (284), `docs/cron-doctor-spec.md` (184),
`docs/streaming-tts.md` (560), `docs/rca-ssl-cacert-post-git-pull.md` (410).
`optional-skills/mlops` (~500k words of vendored ML training references) skipped per the
brief; `website/docs/` deprioritised per the brief.

### The instrument (files opened)

| file | lines (file) | read |
| --- | ---: | --- |
| `toolsets.py` | 1,062 | 1–120 (the core-tools list and its deliberate exclusions) |
| `agent/secret_scope.py` | 267 | 1–195 (module docstring + `get_secret` resolution order) |
| `hermes_cli/plugins.py` | 6,700+ | 355–420 (`VALID_HOOKS` policy comments, timeout allowlist), 6167–6273 (`_plugin_managers_by_home`, `_clear_plugin_submodules`, `get_plugin_manager`) |
| `agent/context_compressor.py` | 5,700+ | 250–270, 300–310, 360–390, 440–470, 823–826, 3526 (summary-marker instruction, alternation exemption, failure guard) |
| `tests/conftest.py` | 1,754 | 1–130 (the isolation preamble) |

### Honest totals

- **Landing page (README.md):** 1,779 words in tree; 2,059 as rendered (per the brief).
- **Operating documents in tree:** 49,248 words (`docs/` 36,663 + `AGENTS.md` 12,585).
  Read in full or near-full this run: **~22,500 words**.
- **Instrument:** ~638,000 lines of Python across `agent/` (163,807), `tools/`
  (152,003), `plugins/` (142,015), `gateway/` (131,891), `cron/` (17,898),
  `providers/` (746), plus root modules (`hermes_state.py` 17,220,
  `hermes_state_search.py` 2,486, `hermes_constants.py` 1,878,
  `hermes_state_schema.py` 1,661, `trajectory_compressor.py` 1,640,
  `hermes_state_common.py` 1,301, `toolsets.py` 1,062, `hermes_state_portability.py` 845,
  `hermes_state_registry.py` 345, `registration_lifecycle.py` 128). Files opened: 5.
- **Tests:** 3,753 files, **1,001,481 lines**.
- **README:** read last, as an index; contributed zero entries.

A tree with a million lines of tests and 49k words of first-party operating documents is
not a claim source. The routing decision in §4 is not a close call.

---

## 3. Design record

Grouped by system. `corpus:` verdicts are stated after opening the golden path the map
returned — no verdict below rests on a slug match or a capped grep.

### Routing count per system

| system | entries | `corpus: NONE` | verdict |
| --- | ---: | ---: | --- |
| **B. profile isolation in one process** | 4 | **4** | ≥3, **and no corpus home** → the forge handoff / XL subject |
| **C. extension host (hooks & middleware)** | 3 | **3** | ≥3, home exists (`agent-runtime-assembly`) → technique triple |
| **A. session state & compaction** | 3 | **3** | ≥3, homes exist (`prompt-assembly` ×2, `embedded-db` ×1) → technique-grain, split across two subjects |
| **F. tools & capability surface** | 2 | **2** | 1–2 → design candidates stay in intake |
| **D. relay / connector** | 2 | **0** | catch + one boundary correction |
| **E. cron** | 1 | **0** | catch |
| **total** | **15** | **12** | |

### The table

| # | decision (tree's terms) | forces | buys | rejects | where | stage | corpus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A1** | Micro-compaction folds **one** oldest exchange into a rolling summary after every completed turn instead of one batch summarisation at a threshold | one batch pays the whole bill at an arbitrary moment (a visible stall mid-session); occupancy sawtooths to the threshold; but per-turn rewriting of already-sent history invalidates the provider prefix cache **every turn** | flat context occupancy (measured: climbed to 22% and held; zero batch compactions in a 3.5h session) and no long stall, at a stated per-turn cache cost dialled by `micro_compact_every_n_turns` | a reclaim-size gate (what `proactive_prune_min_reclaim_tokens` uses to keep rewrites "one big episodic break"); the doc says the equivalent gate here "does not exist yet" | `docs/micro-compaction.md` (whole); `agent/context_compressor.py:823-826, :3526` | end of turn, in `finalize_turn`, after the answer has streamed | **NONE** — `prompt-assembly/history-compaction` |
| **A2** | An "exchange" starts at the **assistant** message: user turns are walked past and are never summarised, for the life of the session | assistant output is an account of derived work and survives compression; user prompts are the intent everything derives from and cannot be reconstructed from the work that followed | the source of truth stays verbatim; the stated cost is a floor on how small the middle can get | summarising the whole window uniformly; the doc names the failure it prevents — "confidently doing the thing you told it not to, six turns later" | `docs/micro-compaction.md` §"Your messages are never compacted"; `agent/context_compressor.py:437-470` (turn boundary is the last user message) | cursor advance, per pass | **NONE** — `prompt-assembly/history-compaction` |
| **A3** | Corruption **class** decides the response: a corrupt derived FTS index detaches (drop triggers, mark `fts_stale`, serve `LIKE`) and keeps writing; bare `SQLITE_CORRUPT` on canonical structure **quarantines the handle** and stops writing entirely | a live write must never turn into an unbounded full-transcript rebuild; and in the field a handle that kept writing ~50 min after the first structural error checkpointed 15 pages under wrong page numbers and turned a damaged-but-readable file into one that would not open | canonical availability under derived-index damage, and forensic recoverability under structural damage — "stopping the writes is the protection" | retry-and-rebuild on the failing operation; the explicit WAL checkpoint on `close()` is skipped, and on 3.12+ SQLite's own last-connection checkpoint is disabled | `docs/state-db-recovery.md` (whole) | live write / search path in `SessionDB` | **NONE** — `backend-platform/data-layer/embedded-db` |
| **A4** | Crash resume marks sessions touched in the last 120s `resume_pending`, auto-continues them at startup, keeps the mark until a turn *succeeds*, and escalates to `suspended` after 3 consecutive restarts; a `.clean_shutdown` marker suppresses the whole sweep | a graceful restart must not reset live conversations, and a crash must not lose a mid-turn one — but a session that crashes the process every time it resumes will do so forever | in-flight work survives crash and drain-timeout; a poison session terminates itself instead of the fleet | clearing the mark at resume time (which would lose the retry), and a plain retry counter with no terminal state | `gateway/session.py:3615`; `gateway/run.py:12460, :14231`; `docs/session-lifecycle.md` §7 | gateway startup, before adapters connect | **partial** — `session-continuation/stuck-loop-detection` |
| **B1** | Profile secrets live in a **contextvar scope**, and the scope's semantics change with the deployment mode: an *overlay* over `os.environ` when multiplexing is off, an *authoritative* mapping that fails closed (`UnscopedSecretError`) when it is on | unioning every profile's `.env` into `os.environ` leaks profile A's keys into B's turns and into every `env=dict(os.environ)` subprocess; but making the scope authoritative unconditionally broke single-profile deployments that inject credentials via systemd/`op run`/shell — cron jobs sent a placeholder key and 401'd while interactive turns kept working | cross-profile non-leakage where there is something to leak from, and no regression where there is not; an un-migrated call site fails loud at its own line | mutating `os.environ` per turn; a global allowlist wide enough to cover everything (the allowlist deliberately excludes `API_SERVER_KEY`) | `agent/secret_scope.py:1-21, :149-195`; `docs/design/multiplexing-gateway.md` §Workstream A | every inbound event, composed with the home override before profile-owned code runs | **NONE** — no home |
| **B2** | The plugin manager is cached **keyed on the resolved home**, and a (re)load evicts `sys.modules[mod]` *and every `mod.` prefixed submodule* | a single-slot singleton is invisible to a contextvar home switch; and even a fresh manager re-imports only the top-level plugin module, so a same-slug plugin's relative imports (`from . import state`) keep resolving to the *previous profile's* already-imported submodule | a profile switch — env var or contextvar, sequential or interleaved — cannot serve another profile's plugin code or state | a "did `HERMES_HOME` change" check; replacing only the top-level module | `docs/ADR.md` (2026-07-13, whole); `hermes_cli/plugins.py:6167, :6188, :6221-6273` | `get_plugin_manager()`, per resolution | **NONE** — no home |
| **B3** | `SessionStore` **binds no database handle at construction**; handles resolve at call time through the active home override, one cached handle per resolved `profiles/<name>/state.db` | one shared store object serves many profiles in a multiplexer; a handle bound at construction pins the first profile that built it | sessions land in the owning profile's store even when the store object is shared | one store instance per profile | `docs/design/multiplexing-gateway.md` §Per-profile persistence (`#88532`) | store call time, not construction time | **NONE** — no home |
| **B4** | Adapters carry an `_owner_profile` stamped at **adapter configuration time**, because adapter ingress runs before `SessionSource.profile` is stamped; session keys are namespaced per profile and batching/busy-guards are keyed per lane | the routing stamp that says which profile an event belongs to is applied *after* the adapter has already begun handling it, so anything the adapter does first has no profile to read | two bots sharing one chat do not share a session lane, and pre-routing adapter work still lands in the right profile | resolving the profile only from the event stamp | `docs/design/multiplexing-gateway.md` §Per-bot session lanes | adapter configuration, before any inbound event | **NONE** — no home |
| **C1** | Two extension surfaces with **opposite return contracts**: observer hooks report and their return values are ignored; behaviour changes only through a separately-registered `middleware` kind that declares which of four points it wraps | a single surface where "returning a dict" may or may not change behaviour makes every consumer guess, and the legacy behaviour-affecting observer hooks (`pre_tool_call` → `{"action":"block"}`) are documented as exactly that exception | a plugin's power is legible from which surface it registered on, not from what it happens to return | veto-by-throw (the RFC names it: "policy denial and plugin bug are indistinguishable in every consumer downstream"); a single hook bag | `docs/observability/README.md` §Contract + return table; `docs/middleware/README.md` §Contract; `hermes_cli/plugins.py:3387, :3567` | plugin registration | **NONE** — `agent-runtime-assembly/semantic-hook-placement` |
| **C2** | `tool_request` middleware runs **before** guardrails, approval and observer hooks, so the rewritten value is what policy evaluates; and if execution middleware calls `next_call` and *then* raises, the downstream result is preserved and the tool is never re-run | a rewrite applied after the gate produces a gate that approved something other than what executed; a wrapper that raises in post-processing must not become a second execution of a non-idempotent tool | policy always sees the effective argument; wrapping is exactly-once | applying rewrites after approval; treating any middleware exception as "retry the base path" | `docs/middleware/README.md` §Execution Order (tool step 3), §Safety Notes | tool-call dispatch, between argument coercion and the pre-execution path | **NONE** — `agent-runtime-assembly/semantic-hook-placement` |
| **C3** | Timeout coverage on plugin callbacks is an **allowlist with a written reason per exemption**, not universal; and no hook name is registered in `VALID_HOOKS` ahead of a real fire site | a hung callback wedges the conversation loop — but abandoning a *last-chance flush* loses state, and abandoning a *policy gate* is unsafe in both directions (fail-open skips auth-like checks, fail-closed drops legitimate messages), so the safe direction has to exist before a timeout can be applied | the hot path cannot hang, and the handlers where abandonment has no safe direction are named rather than silently bounded; and a declared-but-never-fired hook (OpenCode's `permission.ask`, typed-but-dead for 6+ months) cannot exist here by policy | bounding every handler uniformly; joining the worker (which reproduces a ThreadPoolExecutor shutdown hang) | `hermes_cli/plugins.py:365-368, :400-420`; `docs/rfcs/2026-07-...-pi-opencode.md` lessons 3 & 4 | hook dispatch | **NONE** — `session-continuation/advisory-guard-fail-mode` |
| **D1** | The connector is the **sole crypto/identity boundary**; the gateway re-validates nothing and receives a re-serialised normalized event, never the raw signed body | the connector fronts a *shared* multi-tenant bot and holds every tenant's platform secrets; re-validating at the final hop would require handing a customer-managed, internet-exposed gateway the shared signing secret — itself the leak, and a cross-tenant one; and a Discord interaction token lives *inside* the signed JSON, so bytes and credential cannot be separated | the untrusted disposable gateway holds zero platform secrets; enforced by a test asserting the relay package imports no platform crypto | byte-preserving forward-and-re-verify, named and rejected explicitly | `docs/relay-connector-contract.md` §6, §6.1; `tests/gateway/relay/test_relay_sheds_crypto.py` | connector edge, before any gateway sees the event | **CATCH + correction** — `webhook-ingestion` states the opposite absolutely |
| **D2** | Ship the sleep/wake **primitives** (`going_idle` → `going_idle_ack` → close; ack-gated replay; a payload-free unsigned wake GET) with a written section enumerating the six guarantees the future behaviour layer *owes* them | the primitive is useless and unsafe without a consumer that honours ordering, and the consumer does not exist yet; the flip must be acked before teardown or an event racing the flip is lost | a deferred workstream cannot silently violate the assumptions the shipped half was built on | shipping the idle timer and machine suspend together with the transport primitives | `docs/relay-connector-contract.md` §3.2, §3.3, §3.4 | gateway drain transition | **partial** — `stream-proxy-hop`, `realtime-events/subscription-lifecycle` |
| **E1** | Cron fires are **NAS-mediated**: the scheduler signs with keys the agent does not hold, so the relay goes through a service that mints a short-lived JWT the agent already knows how to verify — no new secret on the agent; and reconcile runs on boot/mutation/post-fire, never on a periodic wake | a direct scheduler→agent fire would require distributing scheduler credentials to every agent; a periodic reconcile wake would negate scale-to-zero | at-most-once across N replicas via store CAS, self-healing after a transient provision failure, and a sleeping agent stays asleep | scheduler→agent direct (kept as a pluggable escape hatch, explicitly not the default); a polling reconciler | `docs/chronos-managed-cron-contract.md` §Trust model, §At-most-once, §Reconcile | fire relay + agent-side arm/re-arm | **CATCH** — `job-coordination`, `background-jobs/adaptive-cadence` |
| **F1** | A tool that only works because of *who is on the other end* resolves its availability from the **session's own source**, never from a process env var; `check_fn` may answer reachability or opt-in but never surface, because its results are TTL-cached process-wide | client and backend are separate machines on separate clocks — only two of four desktop topologies are spawned by Hermes and carry `HERMES_DESKTOP=1`, so an env-keyed GUI gate is a silent no-op on the others, and the tool is stripped from the schema before the model sees it while the platform hint still tells the model it is inside the desktop app | one resolver covers every topology; the regression test is "the GUI session gets the tool with the env var absent" — an assertion the original gate could never pass | env-var surface gates; putting per-session answers in `check_fn` | `AGENTS.md` §"Surface capability is a property of the SESSION"; `toolsets.py:33-45, :57-63`; `tools/registry.py` (TTL cache) | toolset resolution at session start | **NONE** — `agent-runtime-assembly` (the golden path *names* this absence) |
| **F2** | Slash commands that mutate system-prompt state default to **deferred invalidation** (effective next session) with an opt-in `--now` | any mid-conversation mutation of skills/tools/memory breaks the provider prefix cache for the rest of the session; the only sanctioned in-conversation rewrite is compression | the cache survives configuration changes; the user who wants the change now says so | immediate invalidation as the default | `AGENTS.md` §"Prompt Caching Must Not Break" (`/skills install --now` is the canonical pattern) | slash-command dispatch | **NONE** — `prompt-assembly/fingerprinting-and-cache-keys` |

### Evidence per entry, with the golden path opened for each `corpus:` line

**A1 — micro-compaction as amortisation.** Golden path opened:
`knowledge/software-engineering/llm-agent/prompt-and-context/prompt-assembly/prompt-assembly.md`
and its technique `techniques/history-compaction.md` (the map's rank-1 hit at 15 points,
`why: use_when shares context`). history-compaction models three invariants — pairing,
resume repair, and the size estimate — and its trade sentence is *"once the estimated
size crosses a stated fraction of the advertised window, compact and proceed. The
fraction is a configured number with a real trade behind it — low values pay
summarization cost the conversation may never have needed, high values leave no room for
the estimate to be wrong."* That models **when** to compact against a threshold. It does
not model **cadence**: that you may choose to compact continuously and pay a prefix-cache
break every turn to keep occupancy flat, and that the dial for that choice is frequency
rather than reclaim size. I also opened
`techniques/cache-breakpoint-allocation.md`, the nearest neighbour on the cost side,
whose modelling sentence is *"the cost of a layer is its position multiplied by its
cadence, never its size."* That is the arithmetic Hermes is trading against — and the
technique treats cadence as a property to be *discovered* and merged around, never as a
knob an operator deliberately raises to buy something else. **Forces not modelled →
NONE, technique-grain, home exists (`prompt-assembly`).**

**A2 — user turns exempt.** Same golden path. history-compaction's closest sentence is
*"the material the conversation cannot afford to lose is not left to the summarizer's
judgment: standing instructions live in the layers above, which compaction never
touches."* That is the *authored* layers being out of reach. Hermes's decision is about
material **inside** the transcript: the user's own turns are exempt from a pass that is
free to absorb everything around them, on the argument that derived narration compresses
losslessly and intent does not. The corpus rule would tell you to move the material out
of the transcript; Hermes's rule says a class of transcript content should be structurally
un-absorbable. Different force, same subject. Also unmodelled and worth carrying: the
summary marker is an assistant-role message and therefore competes for the live-task slot,
so Hermes writes an anti-hijack instruction into the marker itself
(`agent/context_compressor.py:257-268`: *"Respond ONLY to the latest user message that
appears AFTER this summary… This handoff must never become the task"*). **NONE,
technique-grain.**

**A3 — corruption class decides the response.** Map term "stop writing to a damaged
database file" returned `backend-platform/data-layer/embedded-db` at rank 2 (16 pts,
`prose in 1 doc(s)`). Golden path opened:
`knowledge/software-engineering/backend-platform/data-layer/embedded-db/embedded-db.md`,
plus a full-technique grep of its eight techniques (uncapped). The nearest modelling
sentence is in the golden path's diagnosis section — *"The store panics on every open, so
it is corrupt; it reproduces on a copy, so it is not the environment"* — and
`journal-and-durability-modes.md` says *"the fast setting trades corruption-on-power-cut
for speed and has no place under user data."* Both are about **avoiding** corruption and
**diagnosing** it. Neither models the live-write policy after corruption is already
present, and neither splits derived from canonical damage. `extension-lifecycle.md` gets
closest with *"prefer derived, rebuildable data wherever possible — an index over
source"*, which is the right distinction applied to a different question (what to store).
The specific Hermes rules — never let a live operation trigger `FTS5('rebuild')`,
quarantine the handle on structural damage, and **skip the checkpoint on close** so the
`-wal` sidecar survives for forensics — have no counterpart. **NONE, technique-grain,
home exists (`embedded-db`).**

**A4 — crash resume with escalation.** Golden path opened:
`knowledge/software-engineering/llm-agent/orchestration/session-continuation/session-continuation.md`
(map rank 2 on "incremental context compaction", 7 pts). It models the counterpart
directly: *"The standard keys the stop on **failure identity** — the same failure
signature surviving a small number of repair attempts halts that lane with a root-cause
hypothesis handed upward"*, and continuation-as-state's lease rule *"a crashed run must
expire on its own rather than arming every future session opened in that directory."*
Hermes's counter is a **restart** counter, not a failure-identity counter, and the
distinction is real: a session that dies to an *involuntary* interruption produces no
failure signature to key on, so identity-based detection cannot fire. Forces overlap
heavily → **partial**, promoting question in §6.

**B1–B4 — profile isolation.** Map terms "context-local credential scope in a shared
process" and "tenant isolation inside one long-lived worker". The best
software-engineering hits were `security/credential-vault` (13 pts) and
`security/authorization` (13 pts). Golden path opened:
`knowledge/software-engineering/security/credential-vault/credential-vault.md` — its
section headings are *The lifecycle is the spine*, *The cardinal rule: secrets are used
where they are stored*, *Two-part record: public metadata, sealed value*, *Blast radius is
a design input*, *Honesty of state*, *Every use is attributable*, *Retirement is part of
the contract*. The cardinal rule is the closest sentence and it is about **where a secret
is used relative to where it is stored** — a vault-boundary question. It says nothing
about several tenants' secrets coexisting in one process's memory and being disambiguated
per task. `security/authorization/techniques/identity-bearing-keys.md` models the storage
side (*"a cross-tenant read must be unrepresentable rather than merely refused"*) — the
right instinct, applied to database addressing, not to in-process ambient state. The
second-order failure B2 records (a keyed cache that still serves stale *relative-import
submodules*) has no analogue anywhere I could find. And `agent-runtime-assembly`, the
subject that owns "how the code around one model call is put together", scopes itself to
one run's assembly and never to N concurrent tenants' assemblies in one process. **Four
entries, NONE, and no corpus home.** This is the XL subject.

**C1 — observer/middleware split.** Golden path opened:
`knowledge/software-engineering/llm-agent/runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md`
(map rank 1 on "plugin hook result vocabulary and veto semantics", 16 pts) and its
technique `techniques/semantic-hook-placement.md`. semantic-hook-placement models
**placement** exhaustively and correctly — *"a contribution declares a placement class — a
name for the vantage point it requires — and the composer resolves the class to a
position"* — and its refusal list covers unknown classes, double classes and positional
names. What it never addresses is the **return channel**: whether a hook may answer at
all, and if so in what vocabulary. Its one adjacent sentence is *"any hook that can
*answer* a call itself — refuse it, serve it from a cache, block it pending proof — makes
every hook inside it invisible for that call"*, which takes the existence of answering
hooks as given and reasons about their consequence for order. `operator-tier-code-loading`
models failure isolation and the origin rule, not the success protocol. The Hermes/Pi/
OpenCode axis — *typed per-event result enums vs veto-by-throw, and observers with no
return channel at all enforced by which emitter the event flows through* — is a distinct
decision the subject does not carry. **NONE, technique-grain, home exists.**

**C2 — rewrite before the gate, and exactly-once wrapping.** Same golden path and
technique. semantic-hook-placement's invariant list is the load-bearing comparison: *"A
gate that refuses sits outside the accountant that counts"*, *"Input sanitization is the
outermost model wrapper. Retries happen inside the physical model layer; if sanitization
sits inside retry, the first attempt is clean and the retry sends the original."* That
last one is the same *shape* as Hermes's rule and confirms the subject would host it —
but it is stated for the model chain and for retry. Hermes states it for the **tool**
chain against **policy**: the argument rewrite must be outside the guardrail and approval
gates or the gate approves something other than what runs. And the exactly-once rule
(*"If execution middleware calls `next_call(...)` successfully and then raises during
post-processing, Hermes preserves the downstream result and does not run the provider or
tool a second time"*) is nowhere in the subject at all. **NONE, technique-grain.**

**C3 — timeout coverage as an allowlist.** Golden path opened:
`.../session-continuation/techniques/advisory-guard-fail-mode.md`. Its decision rule is
explicit and universal: *"Bound every handler by a registry-enforced timeout whose timer
cannot hold the process open"* (line 122), and the golden path repeats it — *"every
handler is bounded by a timeout whose timer cannot hold the process open."* Hermes
contradicts it deliberately and gives the discriminator the corpus lacks: a timeout is
only applicable where **abandonment has a safe direction**, and it names two classes where
it does not — a last-chance flush (`on_session_finalize`, where fail-open abandon loses
state) and a policy gate (`pre_gateway_dispatch`, where fail-open skips auth-like checks
and fail-closed drops legitimate messages). It also ships the anti-drift half the RFC's
lesson 3 asks for — *"no inert `VALID_HOOKS` surface is registered ahead of
implementation"* — against OpenCode's `permission.ask` sitting typed-but-dead for six
months. Because the corpus states the opposite absolutely, this is both **NONE** (the
forces are not modelled) **and** a correction candidate against a technique that landed
today. **NONE, technique-grain.**

**D1 — edge-only crypto.** Golden path opened:
`knowledge/software-engineering/backend-platform/resilience/webhook-ingestion/webhook-ingestion.md`
(map rank 5 on "verify webhook signature at the edge", 10 pts) and
`techniques/sender-authentication.md`. The corpus **does** model the forces — §"Topology
is a menu, and every option moves the trust boundary" says: *"a **relay** — a reachable
intermediary that accepts deliveries publicly and forwards them over a connection the
private side dialed *outbound*; solves reachability, but the intermediary sees every
payload, so end-to-end sender verification must still happen at the final hop, never
delegated to the middle."* That is exactly the decision, stated with its force, and
decided the **other way**. So this is a catch, not a NONE — and it is the most valuable
row in the record, because Hermes supplies the boundary condition under which the corpus's
absolute clause inverts: when the intermediary fronts a *shared multi-tenant* bot,
delegating verification to the final hop means shipping the shared signing secret to an
untrusted customer-managed gateway (a cross-tenant leak), and for at least one platform
the credential is *inside* the signed bytes so byte-preservation and credential-stripping
are the same operation. `sender-authentication.md`'s *"Verify the bytes, not a
reconstruction"* is preserved — it just happens at the edge. **CATCH + amendment
candidate.**

**D2 — primitive plus the obligations its consumer owes.** Golden paths consulted:
`backend-platform/resilience/stream-proxy-hop` (techniques `idle-heartbeat-injection`,
`reconnect-storm-hygiene`) and `client-architecture/realtime-events`
(`subscription-lifecycle`). The flip-ack-then-close ordering is the familiar
subscribe-before-serve discipline these model. What is not modelled is §3.4's shape — a
written contract of six guarantees a *future, unwritten* workstream owes the primitives it
will consume, shipped in the same document. That is closer to a documentation practice
than a mechanism. **partial**, promoting question in §6.

**E1 — NAS-mediated cron.** Golden path opened:
`knowledge/software-engineering/backend-platform/work-execution/job-coordination/job-coordination.md`
(map rank 1, 20 pts) — techniques `lease-renewal`, `job-state-machines`,
`terminal-state-recovery`, `job-observability` — and
`background-jobs/techniques/adaptive-cadence.md`. Between them the at-most-once CAS claim,
the terminal-state handling on `repeat.times = N`, and the "reconcile on events rather
than on a timer" cadence rule are all modelled. The trust-path argument (route the fire
through the party whose tokens the agent already verifies, so no new secret reaches the
agent) is authorization-shaped and `security/authorization`'s `scope-design` covers the
principle. **CATCH.**

**F1 — session-scoped capability.** Golden path opened: `agent-runtime-assembly`. It
contains a stated absence that this entry fills exactly: *"Where a policy decides which
tools a run may hold, the assembly-time filter that withholds a capability from the roster
and the run-time check that refuses its execution must derive from *one* policy… **The
corpus does not yet carry that pairing as a technique**; it is recorded here as a
consequence of assembly identity, not as a rule of its own."* Hermes supplies the missing
half plus a discriminator the corpus does not have (what the gate may key on: the
session's source, never the process environment; `check_fn` for reachability and opt-in,
never for surface, because its results are TTL-cached process-wide and one process serves
many sessions). I also checked `mcp-tools/mcp-tools.md` uncapped — its nearest is *"the
move is measured on a **fixed model roster**"*, which is about migration measurement, not
about who decides the roster per session. **NONE, technique-grain, home exists, and the
home's own text names the gap.**

**F2 — deferred invalidation.** Golden path opened:
`prompt-assembly/techniques/fingerprinting-and-cache-keys.md` via the golden path's
summary of it: *"A session carries the fingerprint it was born under; when the current
fingerprint differs, the session is stale and must be rebuilt, not continued."* That
models **detection** of a changed prompt interface. Hermes models **avoidance**: the
mutation is queued so the fingerprint does not change mid-session at all, and `--now` is
the opt-in that accepts the rebuild. Complementary, not covered. `cache-breakpoint-
allocation.md`'s *"When a prompt edit shows up as a multiplied bill rather than a marginal
one, the first thing to check is not what was added but *where*"* is the diagnostic for the
same cost with no policy attached. **NONE, technique-grain, home exists
(`prompt-assembly`).**

---

## 4. Routing decision

Stated plainly, per § "Route by depth: the forge handoff (v2)":

**Twelve load-bearing decisions in this tree carry `corpus: NONE`. The threshold is
three. This source is a forge job.**

Per system, per the round-2 rule:

- **System B (profile isolation inside one process) — 4 NONE, and no corpus home at all.**
  This is the system whose count reaches three *with a genuinely new home*, and it is the
  forge handoff proper: the XL subject spec is written for it in §7.
- **System C (extension host) — 3 NONE, all with the same existing home
  (`agent-runtime-assembly`).** Three candidates sharing one home is a subject by the
  mechanical trigger, but the subject already exists and landed today; the correct landing
  is a technique triple inside it, not a competing subject beside it. All three are
  technique-grain findings.
- **System A (session state & compaction) — 3 NONE, but split across two existing homes**
  (`prompt-assembly` ×2, `embedded-db` ×1). Not one subject: two technique pairs. All
  three are technique-grain findings.
- **System F (tools & capability surface) — 2 NONE**, both technique-grain in existing
  homes (`agent-runtime-assembly`, `prompt-assembly`). 1–2 → they stay in intake as design
  candidates.
- **Systems D and E — 0 NONE.** D yields one boundary **correction** against a golden path
  that decided the same question the other way, plus one partial. E is a clean catch.

Recommended shape of the handoff: **scoped**, following the `agent-browser-control`
precedent from earlier today — one forge worker on the new subject (§7), and the eleven
technique-grain entries dispatched as `/deepen`-style briefs against the four existing
subjects they belong to (`agent-runtime-assembly` ×4 incl. F1, `prompt-assembly` ×3,
`embedded-db` ×1, `session-continuation` ×1 correction, `webhook-ingestion` ×1
amendment). The intake half retains the claim rows in §5 and the source-tree
application. Board claims are owed on: `llm-agent/orchestration/<new>`,
`agent-runtime-assembly`, `prompt-assembly`, `session-continuation`, `embedded-db`,
`webhook-ingestion` — the last three are cross-category and the most likely to collide
with a sibling.

---

## 5. Candidates

### 5a. Design candidates (Phase 3 v2 rows)

Product names retained through triage per the v2 rule; stripped at Phase 7.

| # | title | stage | home | impact | eff | read |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Scope credentials by task context, not by process env | inbound event, before profile code | **new subject** | new-subject | XL | real gap |
| D2 | Key the extension cache on the tenant, and evict its submodules | manager resolution | **new subject** | new-subject | XL | real gap |
| D3 | Resolve the store handle at call time, not at construction | store call | **new subject** | new-subject | XL | real gap |
| D4 | Stamp the owner before the router can | adapter configuration | **new subject** | new-subject | XL | real gap |
| D5 | Two extension surfaces, opposite return contracts | plugin registration | `agent-runtime-assembly` | new-technique | M | real gap |
| D6 | Rewrite outside the gate; wrap exactly once | tool dispatch | `agent-runtime-assembly` | new-technique | M | real gap |
| D7 | Timeout coverage is an allowlist with reasons | hook dispatch | `session-continuation` / `agent-runtime-assembly` | corrects-claim | M | real gap |
| D8 | The roster gate reads the session, never the process | toolset resolution | `agent-runtime-assembly` | new-technique | M | real gap |
| D9 | Amortised compaction trades cache prefix for flat occupancy | end of turn | `prompt-assembly` | new-technique | M | real gap |
| D10 | Never compact what the user wrote | cursor advance | `prompt-assembly` | new-technique | M | real gap |
| D11 | Defer the invalidation; make `--now` the opt-in | command dispatch | `prompt-assembly` | new-technique | S | real gap |
| D12 | Corruption class decides degrade-or-quarantine | live DB write | `embedded-db` | new-technique | M | real gap |
| D13 | Edge-only verification when the middle is the only secret holder | connector edge | `webhook-ingestion` | corrects-claim | M | partial |
| D14 | Escalate an involuntary interruption, not just a repeated failure | gateway startup | `session-continuation` | new-technique | M | partial |
| D15 | Ship the primitive with the obligations its consumer owes | drain transition | `stream-proxy-hop` / practices | new-technique | M | partial |

### 5b. Claim candidates

| # | title | claim | anchor | strip | lane | shape | eff | impact | read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Ladder the footprint of a new capability | Choose the highest-footprint-free rung that solves it: extend code → CLI+skill → gated tool → plugin → MCP server → core tool last, because a core tool ships on every API call | `AGENTS.md` §The Footprint Ladder | survives | K | technique | M | new-technique | real gap |
| 2 | Verify the premise before calling it a bug | "A limitation that looks like an oversight is often deliberate… the absence was load-bearing" — four named close-reasons distilled from real rejections | `AGENTS.md` §Before you call it a bug | survives | P | practice | M | none | real gap |
| 3 | No pagination on instructional tools | "Models will read page 1 and skip the rest" — refuse offset/limit on tools loading content the agent must read whole | `AGENTS.md` §What we don't want | survives | K | technique | S | new-technique | real gap |
| 4 | Behaviour contracts, not change-detector tests | Assert how two pieces of data must relate; never freeze a model list, config literal or enumeration count | `AGENTS.md` §What we want | survives | K | correction | S | fills-stack-gap | likely catch |
| 5 | A description budget is an attention budget | Skill `description` ≤ 60 chars, one sentence, no marketing words, don't repeat the name — long descriptions dilute attention when many skills load | `AGENTS.md` §Skill authoring standards | survives | S | practice | S | none | partial |
| 6 | Name the wrapped tool, not the shell utility | Skill prose must point at `search_files`/`read_file`/`patch`, never `grep`/`cat`/`sed` — the wrapped tool is the interaction surface | `AGENTS.md` §Skill standards rule 2 | survives | S | practice | S | none | partial |
| 7 | A per-file interpreter beats a reset fixture | Run each test file in a fresh `python -m pytest <file>` subprocess; cross-file leakage of module dicts, ContextVars and caches becomes impossible | `tests/conftest.py:118-127` | survives | K | technique | M | new-technique | real gap |
| 8 | Your own isolation marker, because theirs gets stripped | Children that rebuild env to "look like a real CLI" strip `PYTEST_*`; export a private marker before any test import and fail hard if a marked child opens the production store | `tests/conftest.py:95-117` | survives | K | technique | S | new-technique | real gap |
| 9 | Capture the real root before you sandbox it | The write-guard deny-list must be built from the pre-sandbox home, or it points at the tempdir and silently protects nothing | `tests/conftest.py:56-63` | survives | K | technique | S | new-technique | real gap |
| 10 | Telemetry must never be what blocks a turn | `occupancy_pct` is null rather than resolved, because resolving it can issue a synchronous `/models` probe | `docs/micro-compaction.md` §Measuring it | survives | K | technique | S | new-technique | real gap |
| 11 | Judge amortisation on occupancy, not tokens saved | The first pass costs ~400 tokens of marker scaffolding and legitimately shows a positive delta; break-even is pass two or three | `docs/micro-compaction.md` §Reading the numbers honestly | survives | K | technique | S | new-technique | partial |
| 12 | Small non-reasoning models for mechanical merges | A thinking model spends reasoning tokens folding one exchange into a summary and is substantially slower for no benefit; measured ~31 s/pass on a 7B 4-bit local | `docs/micro-compaction.md` §Choosing a compression model | survives | K | dated fact | S | dates-application | likely catch |
| 13 | Egress isolation as the second layer under prompt injection | Two Docker networks plus an allowlisting proxy so an injected `curl` cannot reach anything unlisted; DNS still resolves and that is accepted | `docs/security/network-egress-isolation.md` | survives | K | technique | M | new-technique | partial |
| 14 | Reject third-party product integrations from the core tree | "A coupling-and-maintenance decision, not a quality bar — the plugin can be excellent and still be a close" | `AGENTS.md` §What we don't want | survives | P | practice | S | none | likely catch |
| 15 | Bind by import time, or use a subprocess | A module that binds `SKILLS_DIR` at import cannot be redirected by a later context override; the correct mechanism is a fresh child that re-imports under the target home | `docs/design/profile-builder.md` §Seam #1 | survives | K | technique | S | new-technique | partial |

---

## 6. Promoting questions (every `partial` row)

**D13 — edge-only verification.** *Question:* does `webhook-ingestion`'s relay clause
state a force that Hermes's case genuinely falsifies, or does it already carve out a
shared-secret intermediary? *File read:*
`knowledge/software-engineering/backend-platform/resilience/webhook-ingestion/webhook-ingestion.md`
§"Topology is a menu" (uncapped, whole section). *Answer:* the clause is unqualified —
*"the intermediary sees every payload, so end-to-end sender verification must still
happen at the final hop, never delegated to the middle"* — and the only condition it
attaches is that the intermediary can see payloads, which is true in Hermes's case too and
does not distinguish them. No carve-out exists for a multi-tenant intermediary that is the
sole secret holder. **Promoted to `real gap`** (as a boundary amendment, not a new
technique).

**D14 — involuntary-interruption escalation.** *Question:* does
`stuck-loop-detection` model a stop keyed on anything other than failure identity?
*File read:*
`knowledge/software-engineering/llm-agent/orchestration/session-continuation/session-continuation.md`
§"A loop that never stops must still notice it is stuck" plus the technique's summary
line. *Answer:* no — the technique is explicit that *"attempt counts are the wrong
instrument"* and keys entirely on failure signature, with two counters (stagnation,
failure) that both require an observable failure to increment. A crash-restart produces no
signature, so the mechanism cannot fire on Hermes's case; and `continuation-as-state`'s
lease expires a record but does not escalate a session that keeps resuming into the same
crash. **Promoted to `real gap`.**

**D15 — primitive plus obligations.** *Question:* does any subject model shipping a
mechanism together with a written contract for a consumer that does not exist yet? *File
read:* `knowledge/software-engineering/backend-platform/resilience/stream-proxy-hop/`
techniques index and `reconnect-storm-hygiene.md` headings. *Answer:* no — the subject
models the reconnect behaviour itself, not the discipline of deferring a decision layer
while binding it. But the finding is a **documentation practice**, and its natural home is
`practices/` or `engineering-process/codebase-stewardship/docs-sync`, not a
`llm-agent` subject; as a design row against a knowledge subject it does not promote.
**Not promoted — refiled as a `P`-lane practice candidate.**

**Claim 5 — 60-char description budget.** *Question:* does
`agent-instruction-files` already carry a length/attention rule for loaded instruction
units? *File read:*
`knowledge/software-engineering/llm-agent/prompt-and-context/agent-instruction-files/agent-instruction-files.md`
technique list (`line-earning`, `restraint-amplifier-balance`, `capability-before-steering`
among thirteen). *Answer:* `line-earning` is the same principle at the line level and
`restraint-amplifier-balance` governs the tone half; a hard character cap on the
*selection* surface is an instance of `line-earning`, not a new rule. **Not promoted —
catch.**

**Claim 6 — name the wrapped tool.** *Question:* does the corpus model the failure where
prose teaching an agent names a shell utility the harness has already wrapped? *File
read:* same subject, `capability-before-steering.md` heading set and
`capability-coverage-contract` summary in the golden path. *Answer:*
`capability-coverage-contract` covers whether the instruction file's stated capabilities
match the host's real roster — which is the same defect from the other direction (the
document promising what the host cannot do). Naming `grep` when the host has
`search_files` is a coverage-contract violation. **Not promoted — catch inside
`capability-coverage-contract`.**

**Claim 11 — judge on occupancy.** *Question:* does any subject already say that the
first application of an amortised optimisation legitimately costs more than it saves?
*File read:* `prompt-assembly/techniques/cache-breakpoint-allocation.md` §"Audit the
allocation", which contains the nearest thing: *"Treat a reported hit rate as a claim
needing its predicate… the number that governs the bill is the hit rate across all calls,
cold ones included."* *Answer:* that is the same discipline (name the population before
believing the number) applied to caching, and the compaction case is a second sighting of
it rather than a new rule — but the *specific* mechanism (fixed marker scaffolding makes
pass one net-positive by construction) is a measurable Hermes owns. **Promoted to `real
gap`** as a dated measurement to be cited into A1's technique, not as its own technique.

**Claim 13 — egress isolation.** *Question:* does `mcp-tools/egress-argument-gating` or
`security/*` model network-level containment as a second layer under prompt injection?
*File read:* `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/mcp-tools.md`
technique list and the `egress-argument-gating` reference in the golden path. *Answer:*
`egress-argument-gating` gates the *argument* — which host a tool may be asked to reach —
at the tool boundary. Hermes's layer is beneath it: even a command the gate never saw
cannot route. Different layer, same threat; and `prompt-safety` owns the injection ladder
but not the network topology. **Promoted to `real gap`**, home most likely
`security/*` or an application against the deployment-contract subject.

**Claim 15 — import-time binding.** *Question:* is the "module-level constant captured at
import defeats a later context override" failure already modelled? *File read:*
`agent-runtime-assembly/techniques/semantic-hook-placement.md` §"One final composition
point", which states the sibling rule: *"resolve classes at composition time, by calling
into the declaration, and never to fake a resolved value at import time — a lazily
populated stand-in that pretends to be the resolved table is the kind of object that is
correct in tests and wrong in the one process that imported things in a different
order."* *Answer:* the corpus models this exactly, for placement tables. Hermes's case is
the same defect for a path constant with a subprocess as the sanctioned escape. **Not
promoted — catch, though worth one sentence of second-sighting into that technique.**

---

## 7. XL trigger

**FIRED.**

The mechanical test (§Phase 4, v2): three or more `design` candidates carrying the same
`HOME IF NEW`, or the same `corpus: NONE` neighbour. Two clusters meet it and they route
differently, which is the distinction the round-2 rule (b) exists to force:

- **D1–D4 (four candidates), all `corpus: NONE`, no neighbour subject at all.** A subject
  exists by construction. Spec below.
- **D5–D7 + D8 (four candidates), all `corpus: NONE` with the same *existing* neighbour
  `agent-runtime-assembly`.** The count fires, but the home is a subject forged today. The
  correct output is four techniques inside it, not a fifth subject beside it. Recorded as
  technique-grain, not as an XL spec.
- D9/D10/D11 (three) share the existing neighbour `prompt-assembly`. Same reading:
  technique-grain, not a subject.

So one XL spec, for the first cluster.

---

# Subject proposal — `tenant-scoped-agent-runtime`

**Status:** **PROPOSED** 2026-09-02 by run `intake-hermes-0902` (intake 2.1.1, forge
handoff scoped to one subsystem: four `design` candidates with `corpus: NONE` and no
corpus home). Front-half output; the director decides dispatch.
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory **`orchestration`** (see placement note — the
natural subcategory is at its cap)
**Resolved path:** `knowledge/software-engineering/llm-agent/orchestration/tenant-scoped-agent-runtime/`
**Raised by:** `/intake`, 2026-09-02, from this design record (entries B1–B4).
**Engine:** `domain-knowledge-forge` — read `docs/forge-brief.md` first; it is the contract.

---

## Placement, verified against the authority

`knowledge/software-engineering/taxonomy.json` is the authority; `categories` is a list,
and the `llm-agent` node carries five `subcategories`. Counted from the file this run:

- `llm-agent.runtime-and-io` holds **ten** subjects — `streaming-output`,
  `subprocess-lifecycle`, `agent-cli-transport`, `mcp-tools`, `terminal-multiplexing`,
  `sidecar-provisioning`, `voice-io`, `agent-addressable-ui`, `agent-runtime-assembly`,
  `agent-browser-control`. **The cap is ten. This subcategory is full**, and the
  `agent-browser-control` proposal earlier today took the tenth slot.
- `llm-agent.orchestration` holds **eight** — `agent-chaining`, `fleet-orchestration`,
  `model-routing`, `hitl-approval`, `remediation-handoff`, `proactive-nudges`,
  `plan-review`, `session-continuation`. A ninth flat subject is legal and creates no
  mixed node.
- `llm-agent.prompt-and-context` holds seven; `evaluation-and-cost` five; `companion`
  three.

**Placement decision: `orchestration`.** The subject's nearest neighbours by force are
`fleet-orchestration` (what sessions exist and who serves them) and `session-continuation`
(what one session's control loop owns), both of which live here; and the subject is about
*which configuration a unit of work belongs to*, which is an orchestration question even
though its mechanisms are runtime ones. The drafter should record in the golden path's
neighbour section that the placement was forced by the runtime-and-io cap and that the
`agent-runtime-assembly` seam is the one to state most carefully.
**Append the slug to the subcategory's `subjects` array through
`scripts/apply-taxonomy.mjs`; do not edit the tree by hand.**

Link depths, stated so they are not derived wrongly:

- from `tenant-scoped-agent-runtime/tenant-scoped-agent-runtime.md` → `../../../_laws.md`
- from `tenant-scoped-agent-runtime/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject in the same subcategory:
  `../session-continuation/session-continuation.md`,
  `../fleet-orchestration/fleet-orchestration.md`
- to a sibling's technique:
  `../session-continuation/techniques/continuation-as-state.md`
- to another subcategory in the same category:
  `../../runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md`,
  `../../runtime-and-io/agent-runtime-assembly/techniques/operator-tier-code-loading.md`,
  `../../prompt-and-context/prompt-assembly/prompt-assembly.md`
- to another category's subject:
  `../../../security/credential-vault/credential-vault.md`,
  `../../../security/authorization/techniques/identity-bearing-keys.md`,
  `../../../backend-platform/data-layer/embedded-db/embedded-db.md`

## The gap, measured

The corpus has **no subject for one agent process serving several isolated
configurations.** Concept probes (`research-map --prose`, concepts only — never product
names, which return zero by construction against the purity gate) and the golden paths
opened afterwards:

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| context-local credential scope in a shared process | `security/credential-vault` (13 pts) | the vault boundary: *"secrets are used where they are stored"*, sealed values, blast radius, rotation. Nothing about N tenants' secrets coexisting in one process's ambient state |
| tenant isolation inside one long-lived worker | `engineering-process/.../test-harness` (16), `llm-agent/orchestration/fleet-orchestration` (15) | isolation *lanes for tests*; and the registry of sessions across *processes*. Neither models one process's per-task tenant scope |
| cross-tenant reads made unrepresentable | `security/authorization/identity-bearing-keys` | composing the owner into the storage **address** — the right instinct, applied to database keys, not to in-process ambient state or to an import cache |
| extension host loading third-party code | `agent-runtime-assembly/operator-tier-code-loading` (17) | who may load code and how it fails. Scoped to *one run's* assembly; silent on a second tenant's assembly in the same process |
| what the loop may hold across a restart | `agent-runtime-assembly/bounded-projection-of-external-work` | the loop holds nothing a store does not hold first — the closest sentence in the corpus, and it reasons about *durability*, not about *whose* store |

`agent-runtime-assembly` is the nearest neighbour and must be cited as a boundary, never
absorbed: it owns how the code around **one** model call is assembled; this subject owns
what happens when one process assembles that pipeline for several tenants concurrently
and must guarantee that tenant A's turn never observes tenant B's state.

Four design decisions from one tree, each reconstructed with its forces and rejected
alternatives, each `corpus: NONE`, one home. That is a subject by construction, and the
routing count says it is a forge handoff.

## The subject, in one paragraph

**Tenant-scoped agent runtime** is the discipline of serving several isolated
configurations — profiles, tenants, workspaces — from one long-lived agent process
without any of them observing another's state. Its load-bearing idea is that the tenant is
a **task-local scope, never an ambient one**: the process environment is a single slot and
therefore the wrong place to put a per-turn identity, so home paths, credentials, session
stores and extension registries all resolve through a context-local override that
propagates into worker threads and unwinds deterministically. From that follow the
subject's four hard parts: a credential accessor whose fail direction depends on the
deployment mode (an overlay when there is nothing to leak from, an authoritative
fail-closed boundary when there is); caches keyed on the resolved tenant that must also
evict the *module-level state their entries captured*; handles resolved at call time
rather than bound at construction; and identity stamped at configuration time for the code
paths that run **before** the router has decided whose event this is. The subject also owns
the honest half: an explicit, written inventory of what remains process-global and what
that costs.

## Boundaries it must NOT absorb

- **One run's assembly** — `agent-runtime-assembly`. Hook placement, assembly identity,
  operator-tier code loading and checkpoint custody stay there. This subject cites
  `operator-tier-code-loading` for the isolation wrapper and adds only what a *second
  tenant* adds.
- **The fleet above the process** — `fleet-orchestration`. Which sessions exist, dispatch,
  harvest and completion-claim verification are the neighbour's. A tenant here is a
  configuration, not a session and not a person.
- **Secret storage and rotation** — `security/credential-vault`. Where a secret lives, how
  it is sealed and retired stays there; this subject owns only how a *running process*
  decides which tenant's secret a given task may read.
- **End-user identity and authorization** — `security/authorization`. The source says it
  plainly and the drafter should keep the line: *"Multiplexing isolates profiles; it does
  not authenticate or authorize end users. A profile is a configuration, not a person."*
- **The durable record's own lifecycle** — `embedded-db`, `job-coordination`.
- **The prompt** — `prompt-assembly`.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. **`task-local-tenant-scope`** — the tenant is installed as a context variable, never
   written to the process environment, and it propagates into executor threads via
   context copy and unwinds in a `finally`. Every seam where tenant-owned code runs is
   wrapped: adapter startup, connect and reconnect, the inbound handler, preprocessing,
   background tasks, and the turn itself; global-configuration work runs under the default
   tenant's scope on purpose. Rejected alternative: unioning every tenant's environment
   (leaks into every `env=dict(os.environ)` subprocess). Anchors:
   `docs/design/multiplexing-gateway.md` §Scope composition; `gateway/run.py`
   `_profile_runtime_scope`; `hermes_constants.py` (`get_hermes_home` consults the
   override before the env var; `get_process_hermes_home()` exists for the few
   machine-level assets that must *not* follow it).
2. **`fail-direction-follows-deployment-mode`** — the accessor's behaviour on a scope miss
   is a function of whether isolation is required. Multiplexing off: the scope is an
   **overlay** and a miss falls through to the process environment, because single-tenant
   deployments legitimately inject credentials via service-manager environment or a
   secret-manager wrapper and there is no other tenant to leak from. Multiplexing on: the
   scope is **authoritative**, a miss returns the default, and *no scope at all* raises —
   an un-migrated call site fails loud at its own line. Must carry the measured failure
   that produced the split: with the authoritative rule applied unconditionally, every
   cron job (which installs a scope around each run) sent a placeholder key and got 401s
   while interactive turns kept working. Also: a small allowlist of genuinely-global names
   that describe the *process* rather than a tenant, and the discipline that the fix for
   an unscoped read is to wrap the call path, never to widen the allowlist. Anchors:
   `agent/secret_scope.py:149-195`.
3. **`tenant-keyed-caches-evict-their-imports`** — any cache keyed on the tenant must evict
   not only its own entry but the module-level state that entry captured. The observed
   failure has two floors: a single-slot singleton is invisible to a context-local switch
   (a "did the env var change" check cannot see it), and even a correctly rebuilt registry
   re-imports only the top-level module, so a same-slug extension's relative imports keep
   resolving to the previous tenant's already-imported submodules. The rule is to evict the
   module **and every name prefixed with it**, on reload and on tenant switch alike, and to
   drop the whole keyed cache between tests. Anchors: `docs/ADR.md` (2026-07-13);
   `hermes_cli/plugins.py:6167, :6188, :6221-6273`.
4. **`resolve-handles-at-call-time`** — a shared store object binds no handle at
   construction; every operation resolves the tenant's store through the active scope and
   caches one handle per resolved path. The alternative — one store instance per tenant —
   is legitimate and should be named as the discriminator (it costs a construction site
   that knows the tenant, which pre-routing code paths do not have). Anchors:
   `docs/design/multiplexing-gateway.md` §Per-profile persistence.
5. **`stamp-ownership-before-the-router`** — some code runs before the routing decision
   exists. Adapter ingress happens before the event carries a tenant stamp, so the adapter
   carries an owner installed at configuration time, and the resolution order is
   `event stamp → adapter owner → store resolver`. Session keys are namespaced per tenant
   so two bots sharing one chat do not share a lane, and every per-lane structure
   (batching, active-session tracking, busy guards) is keyed the same way. Anchors:
   `docs/design/multiplexing-gateway.md` §Per-bot session lanes, §Inbound routing.
6. **`written-inventory-of-what-stays-global`** — the honest half, and a technique because
   the alternative is an unstated assumption. The design ships a table of every surface
   that is *not* tenant-scoped (tool discovery and registration, terminal environment, the
   built-in registry, provider registries, the HTTP listener and process lock) with what it
   costs and where it is tracked; a hybrid overlay pattern is named for the registries that
   are half-scoped. It also enumerates fail directions at the boundary: fatal at startup
   for configuration errors and for a secondary tenant claiming a port-binding surface;
   skipped-with-a-warning for one misconfigured secondary adapter; fail-closed for an
   unscoped credential read and for an event routed to an unserved tenant; fallback to the
   built-in path for a scheduler that does not support multiplexing. Anchors:
   `docs/design/multiplexing-gateway.md` §Known limitations, §Failure modes.

Five techniques is the floor; six is fine. Do not mint a seventh to reach a number. If
one must be folded, fold 4 into 1.

## Open questions the drafter decides rather than discovers

- **The name.** `tenant-scoped-agent-runtime` was chosen over `profile-isolation` (the
  source's word, and a proper noun in its ecosystem), `multi-tenant-agent-runtime` (reads
  as a hosting product), and `runtime-tenancy` (too abstract to match on). Override with
  an argument.
- **Placement.** `orchestration` is forced by `runtime-and-io` being at its cap of ten. If
  the drafter believes the subject genuinely belongs in `runtime-and-io`, the honest move
  is a nested subcategory there, not an eleventh flat subject — and that is a taxonomy
  decision above this proposal's authority.
- **Whether the fail-direction technique (2) is one technique or two.** The mode-dependent
  overlay and the fail-closed unscoped read are one mechanism read from two deployment
  positions; recommended as one, with the measured cron failure carried as the reason.
- **Whether `written-inventory-of-what-stays-global` earns a technique or is a section of
  the golden path.** Recommended: a technique, because it is the only one an adopter would
  otherwise skip, and skipping it is precisely the defect.

## Instances a reader can open

- The source tree, pinned at `0cbc6e37ac9fce50905157805c89fae06da93845`, cloned at
  `C:/t/hermes` for this run (deleted at Phase 9 unless a task row keeps it — and if a
  task row does, export the branch with `git format-patch` into `librarian/handoffs/`
  rather than keeping the clone).
- **Fleet seam:** thin. `personas` runs local agent personas one-operator-per-install and
  its scope excludes hosted multi-tenant service; `kp` is one-organisation-per-install.
  No connected project serves several tenants from one agent process today, so the apply
  step is a `task` row against the source tree, not a cross-repo edit.

## Web budget for the drafter

At most two fetches, spent on primaries only: the language runtime's context-variable
propagation semantics (the "propagates into worker threads via context copy" claim needs
its primary), and the import-system documentation for submodule caching (technique 3's
mechanism). The source's README and its feature list corroborate nothing here.

## Why proposed rather than written by the intake run

Four mechanisms from one tree and one author, in a subject with no corpus prior art, whose
nearest neighbour was forged today and whose boundary with that neighbour has to be drawn
in both directions. A subject needs a golden path that argues the forces from more than one
source and a technique set reconciled against a neighbour's stated scope — which is a forge
worker's job with `agent-runtime-assembly` and `fleet-orchestration` open.

---

## 8. Already covered, leads, untriaged

### Already covered (verified by reading, technique named)

| finding | covered by | verified |
| --- | --- | --- |
| Fire relay is at-most-once across replicas via store CAS; `repeat.times = N` deletes the job at the limit so no orphan one-shot is armed | `backend-platform/work-execution/job-coordination` — `job-state-machines`, `terminal-state-recovery` | read the golden path's technique list and the two techniques' summaries |
| Reconcile on boot / mutation / post-fire rather than on a timer | `backend-platform/work-execution/background-jobs` — `adaptive-cadence` | read the technique summary in the golden path |
| A rewrite must not renumber identifiers a later stage binds on | `prompt-assembly` — `history-compaction` (via `identity-survives-reuse`) | read the technique whole |
| A module-level constant bound at import defeats a later context override; a fresh child process is the sanctioned escape | `agent-runtime-assembly` — `semantic-hook-placement` §One final composition point | read the section whole |
| Skill prose naming a shell utility the host has wrapped | `agent-instruction-files` — `capability-coverage-contract` | read the golden path's technique summary |
| A hard character cap on a selection surface | `agent-instruction-files` — `line-earning` | read the golden path's technique summary |
| Contributed hooks isolated, failing open, without taking the host down | `agent-runtime-assembly` — `operator-tier-code-loading` | read the golden path's statement of it |
| The summariser must not be trusted with load-bearing material | `prompt-assembly` — `history-compaction` §"The summarizer is a cheaper model with an expensive output" | read whole |
| A guard whose fail-closed interval is a stuck operator fails open with a diagnostic | `session-continuation` — `advisory-guard-fail-mode` | read the technique's grep-verified rules |

### Leads, with return conditions

| lead | return when |
| --- | --- |
| `docs/observability/relay-shared-metrics.md` (3,570 w) — a first-party shared-metrics path between an agent runtime and an RL training relay | a `tracklight` or `llm-observability` lane opens on agent-to-trainer telemetry; the bundle already has `llm-call-telemetry-model` and this is the producer side |
| `docs/billing-lifecycle.md` (2,551 w) — a client-side state/refusal/settlement taxonomy for an agent product's billing surface | `operations/service-operations/plan-entitlements` gets a deepen pass, or a connected project ships billing |
| `docs/kanban/multi-gateway.md` + the kanban toolset — an agent-to-agent work queue with heartbeat, block, request-review and request-changes verbs | `fleet-orchestration` or `hitl-approval` is deepened; the verb set is a stated coordination vocabulary worth diffing against ours |
| `evals/`, `scripts/toolperf_abeval/`, `scripts/analyze_livetest.py` — an unread measurement surface | `eval-harness` gets a deepen pass, or a claim from this tree needs a measured protocol |
| `docs/profile-routing.md` (688 w) — the conjunctive most-specific-first routing table | the new subject is forged; it is technique 5's supporting detail |
| `acp_adapter/`, `optional-mcps/`, `mcp-research-data/` — an MCP client plus research data, unread | `mcp-tools` is deepened |
| Pi (`earendil-works/pi`) and OpenCode (`anomalyco/opencode`) as sources in their own right | the RFC's file:line claims need first-hand verification, or an extension-host lane opens; the RFC is a relay of them and the corroboration table treats it as such |

### Untriaged (recorded with anchors, unverified, never declined)

| finding | anchor |
| --- | --- |
| Delegation roles as capability subtraction: a `leaf` child loses `delegate_task`, `clarify`, `memory`, `send_message`, `cronjob` but keeps `execute_code`; depth capped at 2, concurrency at 3 | `AGENTS.md` §Delegation |
| "Background `delegate_task` is detached from the current turn but still process-local. For work that must survive process restart, use `cronjob` or `terminal(background=True)`" — a durability discriminator stated as a rule | `AGENTS.md` §Delegation, durability rule |
| Curator: usage-tracked auto-archival of agent-created skills, archived not deleted, restorable | `AGENTS.md` §Curator |
| A webhook-safe toolset deliberately narrowed to four read-only tools because webhook events may carry untrusted third-party content (public PR titles/comments) | `toolsets.py:88-96` |
| Plugin settings are namespace-jailed: relative keys only, with POSIX and Windows traversal both rejected, and a legacy-subtree read fallback that writes never target | `docs/rfcs/plugin-config-state-bridge.md` §Namespace jail |
| Plugin durable state: temp-file + fsync + `os.replace`, a sibling lock file serialising across threads *and* processes, a 10 MiB quota whose rejection leaves the previous file untouched, fail-closed on malformed JSON | same doc §State guarantees |
| Escape hatches (`/stop`, `/approve`, busy-policy dispatch on a live turn) are deliberately not observable by plugins — "letting plugins observe (and one day veto) the operator's escape hatches would turn a slow or hostile plugin into a way to lose control of a running agent" | `hermes_cli/plugins.py:379-383` |
| `SHELL_UNSUPPORTED_HOOKS`: a hook whose return carries a directive the shell-hook response parser has no channel for refuses registration **loudly** rather than silently ignoring the output | `hermes_cli/plugins.py:390-399` |
| Contract versioning policy: bump only for additive changes during the experimental phase; the consumer's first PR references the commit SHA of the contract file it implements against | `docs/relay-connector-contract.md` §9 |
| Micro-compaction telemetry is one content-free JSON line per pass carrying only counts, with a report script (`scripts/micro_compaction_report.py`) that turns a log into an answer | `docs/micro-compaction.md` §Measuring it |

---

## 9. Reusable engineering seen

- **Per-file process isolation as the test-isolation primitive.** `run_tests_parallel.py`
  spawns a fresh `python -m pytest <file>` per test file, which makes cross-file leakage of
  module globals, context variables and caches *structurally* impossible and replaced a
  hand-maintained `_reset_module_state` autouse fixture. The trade is stated honestly
  (intra-file ordering becomes the author's problem, and that is a real bug either way).
  Directly portable to `scripts/`: our own gate scripts share module state across checks.
  `tests/conftest.py:118-127`.
- **A private, subprocess-surviving isolation marker.** Tests that spawn children rebuild
  the child environment to "look like a real CLI" and strip `PYTEST_*`, which used to
  disarm the live-database guard in exactly the child that had also lost its home
  redirect. The fix is an own-namespace marker exported before any test module imports,
  inherited by default, with a separate explicit bypass variable for the children that
  legitimately need to look untested. Anyone writing a guard that must survive a
  re-parented process wants this shape. `tests/conftest.py:95-117`.
- **Capture the real root before you sandbox it.** The write-guard deny-list must be built
  from the pre-sandbox home; built after, it points at the throwaway tempdir and silently
  protects nothing. This is a one-line ordering bug with an invisible failure mode and it
  is worth a check in any harness that both sandboxes and guards. `tests/conftest.py:56-63`.
- **`scripts/micro_compaction_report.py` as the shape of a telemetry answer-machine.** One
  content-free JSON line per event, accumulating totals so a whole run summarises from its
  last line, plus a small reader that turns a log into outcome mix, net effect and
  durations. Our `librarian-scan` produces a worklist; this pattern would let a landing's
  A/B produce a comparable per-run artifact without a database.
- **A config surface that dials a cost rather than toggling a feature.**
  `micro_compact_every_n_turns` is the model to copy: the on/off switch is one decision, and
  the *frequency* knob is the one that governs the bill, with values below 1 clamped rather
  than silently disabling, and the counter advancing per turn rather than per committed
  pass so a no-op turn cannot wedge the cadence.
- **A comparative source-level spike as a deliverable.** `docs/rfcs/2026-07-plugin-architecture-lessons-pi-opencode.md`
  is essentially an `/intake` run written as a repo document: two systems read at pinned
  commits with file:line claims, a four-axis table showing they are near-opposites, thirteen
  adopt/adapt/avoid verdicts each mapped to an open issue, and — the part worth stealing — a
  §"Verified absences (findings, not gaps in the spike)" section that reports what was
  searched for and not found, with the search recorded. Our source notes should carry that
  section by name.

---

## 10. Fleet direction notes

Read `librarian/fleet-map.md` (generated 2026-09-02) — summary table plus each project's
scope block and candidate list. `goat` has no manifest scope and is excluded from the
judgments below. Per design-record entry with a corpus home:

**A1, A2, F2 → `prompt-assembly`.** Candidate absences: **`politicas`** only (the fleet map
lists `prompt-assembly` under its `llm-agent/prompt-and-context` candidates). `politicas`
does LLM-assisted extraction with cost tracking over a civic entity graph — its scope
admits the *cache-cost* force (F2's deferred invalidation) but not the *long-conversation*
force: extraction is short-turn and batched, so amortised compaction (A1) and user-turn
exemption (A2) have no purchase there. Every other project either already governs
`prompt-assembly` or excludes agent runtime by scope. **Weak seam.**

**A3 → `embedded-db`.** Candidates: not listed for any project in the
`backend-platform/data-layer` rows I read (`gravity` lists `data-access`, `migrations`,
`sync-replication` but not `embedded-db`, i.e. it is governed or out of domain there).
**`pumper`** is the project whose scope most admits the force — "one Rust binary exposing
an HTTP API over a durable SQLite job queue" is precisely a system where a corrupt derived
index and a corrupt canonical B-tree must be handled differently and where a live write
must never trigger a rebuild. **`tracklight`** (self-hosted observability over an
embedded analytics store) admits it equally. Both would need the fleet map re-read for
`embedded-db`'s actual state in their maps before anything is proposed. **Strong seam,
subject to verification.**

**C1, C2, C3, F1 → `agent-runtime-assembly`.** Candidate absences in **six** projects:
`gravity`, `tracklight`, `pumper`, `personas`, `kp`, `pof`. Scope judgments:
- **`pof`** — "an AI companion for building UE5 C++ games: headless engine tooling, MCP
  wiring, UI workflows". Its scope admits every one of these forces: it wires MCP tools,
  it has a hook surface around tool calls, and F1's exact failure (a capability that exists
  only because of who is on the other end — an editor session vs a headless run) is its
  daily reality. **Strongest seam in the fleet.**
- **`personas`** — "run local AI agent personas over wrapped CLIs… observe runs and tune
  routing from evidence", one operator per install. Admits C1 (observer vs behaviour
  surfaces — it already observes runs) and C3 (bounded callbacks around wrapped CLIs).
  F1 is weaker: one operator, one topology. **Good seam for C.**
- **`tracklight`** — scope explicitly excludes agent runtime, but it *consumes* the hook
  surface's output as telemetry; C1's rule (an observer's return value is ignored, by
  contract) is a claim about the producer it depends on, not a change to it. **Cite, do not
  propose.**
- **`pumper`**, **`gravity`**, **`kp`** — all three exclude or do not do agent runtime
  extension surfaces (`pumper`: "agent orchestration beyond calling a CLI for research";
  `gravity`: excludes `llm-agent/orchestration` by list and ships nowhere; `kp`: "no agent
  fleets or companions"). Candidate by absence, **out of scope by judgment**.

**D14 → `session-continuation`.** Candidate absences: `personas`, `pof`, `systedo-case`,
`ascent`. **`pof`** and **`personas`** both run long agent sessions over spawned processes
and would feel an involuntary-interruption escalation directly — a persona whose CLI
crashes on resume should not re-arm forever. **`systedo-case`** (advertising review loops)
and **`ascent`** (a scoring index) run bounded passes; the force does not reach them.
**Two real seams.**

**D13 → `webhook-ingestion`.** Candidate absence: `gravity` (listed under
`backend-platform/resilience`). But `gravity`'s scope is explicit — "Does not: shipping
anywhere — no deployment target, no auth, no multi-tenant" — and the amendment's whole
force is *multi-tenant shared-secret*. **Scope does not admit it. No fleet seam; the
amendment lands in the corpus and stays there.**

**B1–B4 → the new subject.** No project serves several tenants from one agent process.
`personas` is one-operator-per-install by scope; `kp` is one-organisation-per-install;
everything else excludes agent runtime. **No fleet seam** — the apply step is a source-tree
task row, exactly as the `agent-browser-control` proposal concluded for its own subject.

No proposal is written here. These are judgments for the director's direction pass.
