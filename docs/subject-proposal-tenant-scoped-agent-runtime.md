# Subject proposal — `tenant-scoped-agent-runtime`

**Status:** **EXECUTED** 2026-09-02 by run `intake-hermes-0902`, in the same session that raised it (intake 2.1.1, forge handoff scoped to one subsystem: four `design` candidates with `corpus: NONE` and no corpus home; front half drafted by an Opus worker, subject forged by an Opus worker, both reviewed by the director). Six techniques plus one application. Override recorded by the drafter: `tenant-keyed-caches-evict-their-imports` renamed `tenant-keyed-cache-evicts-loaded-code` (the transplantable claim is that the cache evicts the loaded code its entry captured, not a language's import mechanism); technique 4 kept separate from 1 because its rejected alternative has its own discriminator (does every construction site know the tenant). Two fetches spent on the context-variable propagation and module-cache primaries. Five deviations recorded and carried into the source-tree task row. One purity trap found for future workers: the substring grep for a company name matches inside "asynchronous".
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory **`orchestration`** (see placement note — the
natural subcategory is at its cap)
**Resolved path:** `knowledge/software-engineering/llm-agent/orchestration/tenant-scoped-agent-runtime/`
**Raised by:** `/intake`, 2026-09-02, from [`librarian/sources/2026-09-02-hermes-agent.md`](../librarian/sources/2026-09-02-hermes-agent.md) (design record entries B1-B4; front half drafted by an Opus worker, reviewed by the director).
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

