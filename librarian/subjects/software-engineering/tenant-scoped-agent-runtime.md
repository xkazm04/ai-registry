---
subject: tenant-scoped-agent-runtime
domain: software-engineering
last_touched: 2026-10-10
dry_streak: 0
---

# tenant-scoped-agent-runtime

Born 2026-09-02 from `/intake` run `intake-hermes-0902` (intake 2.1.1): a forge handoff
scoped to one subsystem of a peer agent runtime, where four design decisions carried
`corpus: NONE` with no neighbouring home - the tenant as a task-local scope never an
ambient one; a credential accessor whose fail direction follows the deployment mode;
caches keyed on the tenant that evict the loaded code their entries captured; handles
resolved at call time; ownership stamped before the router; and a written inventory of
what stays process-global. Placed in `llm-agent/orchestration` (ninth of ten) because
`runtime-and-io` reached its cap the same morning with `agent-browser-control`; the
golden path records the forced placement and states the `agent-runtime-assembly` boundary
in both directions. Front half by an Opus worker, subject by an Opus worker, director
review: gate green, purity clean (one trap: "asynchronous" contains a company name as a
substring), the first cited deviation opened and read verbatim. Spec:
`docs/subject-proposal-tenant-scoped-agent-runtime.md` (EXECUTED). No fleet seam - no
connected project serves several tenants from one agent process; the apply step is a
source-tree task row. Deviations recorded in the source note for that backlog: the home
resolver and the secret resolver have opposite fail directions; the global-prefix
allowlist admits a whole platform prefix; the keyed caches have no production reaper.

## Architecture review - 2026-09-09

Historical source observations remain historical. This pass corrects the Python
version claim and narrows isolation guarantees that were stronger than the
mechanisms. Task scope transports trusted identity; it does not replace routing
authorization or isolate arbitrary loaded code. All six technique identities
remain, with explicit applicability and counterexamples.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/tenant-scoped-agent-runtime",
  "date": "2026-09-09",
  "baseline": "e197423b",
  "digest": "sha256:5379db022c5af337",
  "disposition": "clarify",
  "coverage": "All eight owned documents read in full. Pinned daemon pool and CPython pool implementation plus primary context/import contracts checked. Local synthetic Python 3.12.1 primitive checks ran; no full Hermes runtime or fleet execution.",
  "counterexamples": [
    "A copied context can reference the same mutable dictionary as its parent.",
    "A reused pool thread does not acquire each submitting callers context merely from thread-start inheritance.",
    "Evicting module names leaves existing references and can race with another tenants imports.",
    "An untrusted event stamp cannot override a trusted connector owner by specificity alone.",
    "Two tenant objects can point at the same storage address; separate handles do not establish data isolation.",
    "Separate processes may share files, credentials and external services."
  ],
  "sources": [
    {
      "url": "https://github.com/python/cpython/blob/v3.14.0/Lib/concurrent/futures/thread.py",
      "result": "Read worker context, submit and thread creation; no fresh Context capture per submitted work item."
    },
    {
      "url": "https://github.com/NousResearch/hermes-agent/blob/0cbc6e37ac9fce50905157805c89fae06da93845/tools/daemon_pool.py",
      "result": "Full pinned source read; per-submit wrapper exists but comments overstate Python 3.14 guarantees."
    },
    {
      "url": "https://docs.python.org/3.14/library/contextvars.html",
      "result": "Primary binding, copy, enter and restore semantics; shallow value behavior confirmed with synthetic Python 3.12.1 fixture."
    },
    {
      "url": "https://docs.python.org/3.14/library/threading.html#threading.Thread",
      "result": "Context parameter added in 3.14; default inheritance flag differs by build and concerns thread start."
    },
    {
      "url": "https://docs.python.org/3.14/library/asyncio-task.html#asyncio.to_thread",
      "result": "This bridge explicitly propagates context, unlike a generic pool submission contract."
    },
    {
      "url": "https://docs.python.org/3.14/reference/import.html#the-module-cache",
      "result": "Removing module-cache entry does not destroy referenced module objects; reload/import distinctions constrain eviction claims."
    }
  ],
  "documents": {
    "tenant-scoped-agent-runtime.md": {
      "disposition": "clarify",
      "reason": "State transport is not authentication or a sandbox; remove arbitrary process-count threshold and unsafe universal eviction/default-tenant guidance."
    },
    "techniques/task-local-tenant-scope.md": {
      "disposition": "clarify",
      "reason": "Explicit parameters and immutable scope are valid; copied bindings can share mutable values and child lifetimes; propagation depends on the actual primitive."
    },
    "techniques/fail-direction-follows-deployment-mode.md": {
      "disposition": "clarify",
      "reason": "Single-tenant strict scoping is valid; classify host authority explicitly, reject unsafe defaults and distinguish diagnostic clues from unique causes."
    },
    "techniques/tenant-keyed-cache-evicts-loaded-code.md": {
      "disposition": "clarify",
      "reason": "Global eviction during concurrent tenant use is not isolation; require loader-specific lifecycle, namespace/instance options and bounded keyed caches."
    },
    "techniques/resolve-handles-at-call-time.md": {
      "disposition": "clarify",
      "reason": "Address and object identity do not prove tenant isolation; capture transaction handles, coordinate cache lifetime and support correctly scoped shared pools."
    },
    "techniques/stamp-ownership-before-the-router.md": {
      "disposition": "clarify",
      "reason": "Trust precedes specificity; reject forged/conflicting stamps, use collision-free keys and separate legacy defaults from unresolved identity."
    },
    "techniques/written-inventory-of-what-stays-global.md": {
      "disposition": "clarify",
      "reason": "A warning cannot legitimize an isolation-breaking fallback; separate processes still share infrastructure requiring inventory."
    },
    "applications/python--task-local-tenant-scope.md": {
      "disposition": "reverify",
      "reason": "Correct false Python 3.14 per-submission propagation claim from pinned primary code; primitive Python 3.12.1 checks ran, but full source runtime was not rerun."
    }
  }
}
```

## 2026-09-23 - `/deepen` currency lane ([[2026-09-23-3]])

`python--task-local-tenant-scope` refreshed before its 2026-10-15 clock; ~35 anchors re-resolved, one gone for good (the upstream ADR file was deleted with its docs tree; the claim it supported still stands from code, and the application says so). **The one substantive upstream move: multiplexing is now on by default and the explicit off is marked retired** - the application's "opt-in" framing was corrected. The non-raising home resolver still never raises. `refresh_by` kept, moved to 2026-11-05.

Banked lead (proposal, not landed): when a multi-tenant mode becomes the default, the warn-only fallbacks in non-raising resolvers move onto the default path, and their fail direction deserves a second look. Return condition: the next pass that opens this technique, or a fleet project adopting a default-on tenant mode.

Impact: no judged verdict moved.

## 2026-10-10 - `/intake apply` (run ap-fdfdm-1010)

Dispatched from the attention scan for **single stack (python)**. `fail-direction-follows-deployment-mode`
had been unapplied since 2026-09-02 for want of a multi-tenant fleet process. The search
went for the technique's other half instead: an overlay over a process environment in a
deployment it calls isolation-off. personas' cloud worker is that shape (persona model
profile = scope, worker env = process, any non-empty bearer admitted), and its seam could
falsify the sentence "there is nothing to leak from". It did. The scope names the
destination as well as the credential, so the overlay sent the worker's own key to a
caller-chosen host. A second fall-through, to a differently named credential, sent each
provider's key to the other.

- Code A/B, ab-paired: foreign-host deliveries 13/48 -> 0/48, floor 35/35 unchanged; real-HTTP
  canary agrees. Shipped and pushed to personas origin/master (`1e755be94`, `8bfc211f64`).
- Landed: `applications/node--fail-direction-follows-deployment-mode.md` (9/9 anchors held at
  `8bfc211f64`); a boundary section in the technique ("the overlay falls through per
  destination, not per name") plus a decision-rule clause and a `use_when` entry; one clause in
  the golden path's pointer sentence. Scored GAIN 2 / RISK 0 / COST 1, append: the file's
  existing sentences stay true.
- The tree disagrees with itself: the same repository's desktop egress makes a
  caller-named destination unrepresentable (`credential-vault/brokered-egress`), and the
  worker did the opposite. The technique now names that door as the case with nothing to handle.
- Open: the worker's isolation mode is undeclared (any bearer is admitted), so a keyless
  persona with no base address still spends the operator's key on the default host.
  Return: when the worker gains real caller auth or a second caller.

## Architecture review - 2026-10-31

Re-review after the 2026-09-23 currency refresh of `python--task-local-tenant-scope` and
the 2026-10-10 apply that landed `node--fail-direction-follows-deployment-mode`, with a
destination-binding section in its technique and one clause in the golden path. All
eight documents were read. Of the 2026-09-09 clarifications, only the application's
Python 3.14 correction landed. The technique still asserts what that correction refutes:
task-local-tenant-scope says "a standard pool that propagates in a recent release". The
pinned CPython 3.14.0 pool does not capture a fresh context per submission. The hermes
daemon-pool docstring still makes the 3.14 claim at the refreshed commit. Every other
2026-09-09 technique item is unaddressed and carried forward. Nothing is retracted.

The new destination-binding section is sound. A miss falls through only toward the host
the process credential was issued for, with binding by parsed host and no cross-name
substitution. It closes a leak the overlay rule had no words for. Its personas
application anchors hold at the current tree: the fix commit cited is not in the local
clone's history, but the cited lines read identically at `f8e62cb9`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/tenant-scoped-agent-runtime",
  "date": "2026-10-31",
  "baseline": "c052abb9",
  "digest": "sha256-b2:e25b75ee0d820e2b",
  "disposition": "clarify",
  "coverage": "All 8 owned documents read: golden path, 6 techniques, 2 applications. Primary checks: the hermes daemon_pool.py at the refreshed commit 9d799e05, and the personas cloud-worker server.mjs at f8e62cb9 (read, not run). CPython 3.14 pool and contextvars sources relied on from the 2026-09-09 reads. No runtime, gateway or worker executed.",
  "counterexamples": [
    "On CPython 3.14 a ThreadPoolExecutor worker reused across submissions does not take each caller's context, so 'a standard pool that propagates in a recent release' is false and the explicit copy is never a no-op to rely on.",
    "A scope that names an endpoint and no key sent the worker's own key to a caller-chosen host in 13 of 48 cases with one tenant, so isolation-off is not 'nothing to leak from'.",
    "An untrusted event stamp outranks a trusted connector owner under specificity-first resolution.",
    "Two tenant scopes can resolve to the same storage address; distinct handles keyed by address then share data.",
    "Evicting module names while another tenant is importing races, and existing references keep the old module alive.",
    "A subsystem that falls back to single-tenant behaviour with a warning is still running outside the isolation claim."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/NousResearch/hermes-agent/9d799e0531c24c7f6015f45ca27e05022c3db81a/tools/daemon_pool.py",
      "result": "submit docstring 'Submit a callable, propagating the caller's contextvars.' and states stdlib does so only from 3.14; body captures ctx = copy_context() and runs the callable via ctx.run. Confirms the application's 'claim still in source' sentence; the technique repeats the unsupported claim."
    },
    {
      "url": "https://github.com/python/cpython/blob/v3.14.0/Lib/concurrent/futures/thread.py",
      "result": "Carried from 2026-09-09, not re-fetched: work items carry callable and arguments, not a captured Context. Refutes the technique's version-dependent propagation sentence."
    },
    {
      "source": "personas source at f8e62cb9: cloud-worker/server.mjs",
      "result": "Lines 151 (DASHSCOPE_HOST parsed-host regex), 177 and 186 (apiKey: mp.auth_token || workerKeyFor(baseUrl)) and 376 (accept any non-empty Bearer) match the application's quotes. The cited fix commit 8bfc211f64 is not in the local clone's history, so the A/B arms were not re-derived."
    }
  ],
  "documents": {
    "tenant-scoped-agent-runtime.md": {
      "disposition": "clarify",
      "reason": "Still owed. Drop the 'about the fourth one' process-count threshold. State that scope transport is neither authentication nor a sandbox. Replace 'process-level work runs under the default tenant's scope' with an explicit host-authority class. Replace universal eviction on tenant switch with loader-specific lifecycle. The new destination clause is fine."
    },
    "techniques/task-local-tenant-scope.md": {
      "disposition": "clarify",
      "reason": "Remove 'a standard pool that propagates in a recent release' and 'on a runtime which already propagates the extra copy is a harmless no-op'. A generic pool never captures per submission, and the explicit copy is the mechanism, not a version patch. Still owed: copied bindings share mutable values; explicit parameters and immutable scope are valid alternatives."
    },
    "techniques/fail-direction-follows-deployment-mode.md": {
      "disposition": "clarify",
      "reason": "The destination-binding section is sound and measured. Still owed from 2026-09-09: classify host authority explicitly, reject unsafe defaults, and present the background-fails/foreground-works fingerprint as a clue, not a unique cause. The undeclared isolation mode the application reports is the live instance."
    },
    "techniques/tenant-keyed-cache-evicts-loaded-code.md": {
      "disposition": "clarify",
      "reason": "Still owed. Global sys.modules eviction during concurrent tenant use is not isolation: require loader-specific lifecycle or per-tenant namespaces or instances, and bounded keyed caches with a reaper."
    },
    "techniques/resolve-handles-at-call-time.md": {
      "disposition": "clarify",
      "reason": "Still owed. 'Two tenants never share a handle ... the whole isolation claim' needs the address resolver itself to be tenant-distinct. Capture the handle for a transaction's duration. Correctly scoped shared pools are valid."
    },
    "techniques/stamp-ownership-before-the-router.md": {
      "disposition": "clarify",
      "reason": "Still owed. Trust precedes specificity: an event's own stamp outranks the configured owner only from a trusted router, and forged or conflicting stamps are rejected. Use collision-free keys. Separate the legacy default from unresolved identity."
    },
    "techniques/written-inventory-of-what-stays-global.md": {
      "disposition": "clarify",
      "reason": "Still owed. The 'documented fallback ... with a warning' row must not legitimize a subsystem that acts across tenants; such a subsystem is fatal or fail-closed. The inventory also covers infrastructure that separate processes still share."
    },
    "applications/python--task-local-tenant-scope.md": {
      "disposition": "keep",
      "reason": "Refreshed 2026-09-23 within refresh_by 2026-11-05. It carries the corrected 3.14 reading, and the refreshed commit's daemon_pool still matches its quote. Multiplex-on-by-default framing as refreshed."
    },
    "applications/node--fail-direction-follows-deployment-mode.md": {
      "disposition": "keep",
      "reason": "Quoted anchors read identically in the current personas tree. The 48-case A/B and the canary arm are dated observations, with the open undeclared-mode limit stated. The fix commit was not available locally to re-derive the arms."
    }
  }
}
```

## Clarify apply - 2026-10-31

Every clarify owed by the 2026-10-31 review landed. The golden path loses the
process-count threshold, says scope transport is neither authentication nor a sandbox,
replaces the default-tenant rule for process-level work with a declared host-authority
class, and replaces universal eviction with the loader's own lifecycle. The pool
paragraph in task-local-tenant-scope now treats the explicit per-submission copy as the
mechanism. This rests on CPython 3.14.0's thread.py, re-read this run. The technique's
process-level paragraph was changed to the host-authority class in the same pass so it
agrees with the golden path. The two applications were not reopened; their dispositions
and dates are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/tenant-scoped-agent-runtime",
  "date": "2026-10-31",
  "baseline": "8b6ac3fa8",
  "digest": "sha256-b2:2d3422c2e1c1946e",
  "disposition": "keep",
  "coverage": "Clarify apply over the earlier 2026-10-31 record: golden path and all 6 techniques edited and re-read; 2 applications not reopened (dispositions carried). Primary sources re-fetched and read this run: CPython 3.14.0 concurrent/futures/thread.py, the 3.14 contextvars, threading and import-system documentation. No runtime, gateway or worker executed.",
  "counterexamples": [
    "On CPython 3.14 a ThreadPoolExecutor worker reused across submissions does not take each caller's context, so 'a standard pool that propagates in a recent release' is false and the explicit copy is never a no-op to rely on.",
    "A scope that names an endpoint and no key sent the worker's own key to a caller-chosen host in 13 of 48 cases with one tenant, so isolation-off is not 'nothing to leak from'.",
    "An untrusted event stamp outranks a trusted connector owner under specificity-first resolution.",
    "Two tenant scopes can resolve to the same storage address; distinct handles keyed by address then share data.",
    "Evicting module names while another tenant is importing races, and existing references keep the old module alive.",
    "A subsystem that falls back to single-tenant behaviour with a warning is still running outside the isolation claim."
  ],
  "sources": [
    {
      "url": "https://github.com/python/cpython/blob/v3.14.0/Lib/concurrent/futures/thread.py",
      "result": "Re-read this run (raw v3.14.0). submit() builds 'task = self._resolve_work_item_task(fn, args, kwargs)' and '_WorkItem(f, task)'; the worker runs 'work_item.run(ctx)' where ctx is the per-thread WorkerContext created once in _adjust_thread_count, not a contextvars copy. Supports dropping the version-dependent propagation sentence."
    },
    {
      "url": "https://docs.python.org/3.14/library/contextvars.html",
      "result": "Context.copy(): 'Return a shallow copy of the context object.' Supports the shared-mutable-values clause."
    },
    {
      "url": "https://docs.python.org/3.14/library/threading.html#threading.Thread",
      "result": "'The default value is None which indicates that the sys.flags.thread_inherit_context flag controls the behaviour. If the flag is true, threads will start with a copy of the context of the caller of start(). If false, they will start with an empty context.' Supports the raw-thread wording: a copy is taken at start, once."
    },
    {
      "url": "https://docs.python.org/3.14/reference/import.html#the-module-cache",
      "result": "'Deleting a key may not destroy the associated module (as other modules may hold references to it)' and a re-import after invalidation yields a different module object. Supports the loader-lifecycle rewrite."
    }
  ],
  "documents": {
    "tenant-scoped-agent-runtime.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: dropped the 'about the fourth one' threshold (separate processes stay the stronger isolation at any count); scope transport is neither authentication nor a sandbox; process-level work runs under an explicit host authority, not the default tenant; eviction on tenant switch replaced by loader-specific lifecycle with bounded reaped caches, in body, invariant and technique list."
    },
    "techniques/task-local-tenant-scope.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: removed the recent-release propagation sentence and the harmless-no-op clause; the per-submission copy is stated as the mechanism for reused pool threads; added shallow-copy sharing of mutable values, immutable scope values and explicit parameters as a valid alternative; process-level work now runs under the host-authority class, matching the golden path."
    },
    "techniques/fail-direction-follows-deployment-mode.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: new section classifies host versus tenant authority in writing with no default into the host class; an undeclared mode with several callers admitted resolves as isolation on (unsafe default rejected); single-tenant strict scoping stated as valid; the background-fails/foreground-works fingerprint is now a clue with named alternative causes, confirmed from the resolver's output."
    },
    "techniques/tenant-keyed-cache-evicts-loaded-code.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: global module-cache eviction during concurrent tenant use named a race, not isolation; preference order per-tenant namespaces or instances, loader-owned eviction at a quiescent point, separate processes; keyed cache bounded with a reaper; decision rules updated."
    },
    "techniques/resolve-handles-at-call-time.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the isolation claim now rests on a tenant-distinct address resolver, with the test asserting distinct addresses; handles captured for a transaction's duration; correctly scoped shared pools (tenant enforced below the handle) stated as valid."
    },
    "techniques/stamp-ownership-before-the-router.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: trust precedes specificity (an event stamp counts only from a trusted router; untrusted ignored or rejected; conflicting trusted stamp rejected); collision-free key encoding with a reserved legacy shape; the legacy default tenant is an explicit owner, separate from unresolved identity, which produces no key."
    },
    "techniques/written-inventory-of-what-stays-global.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the documented-fallback row is limited to subsystems that cannot act across tenants; one that can is fatal or fail-closed; process isolation still inventories shared infrastructure (filesystem, injected credentials, database, log sink, upstream account)."
    },
    "applications/python--task-local-tenant-scope.md": {
      "disposition": "keep",
      "reason": "Refreshed 2026-09-23 within refresh_by 2026-11-05. It carries the corrected 3.14 reading, and the refreshed commit's daemon_pool still matches its quote. Multiplex-on-by-default framing as refreshed."
    },
    "applications/node--fail-direction-follows-deployment-mode.md": {
      "disposition": "keep",
      "reason": "Quoted anchors read identically in the current personas tree. The 48-case A/B and the canary arm are dated observations, with the open undeclared-mode limit stated. The fix commit was not available locally to re-derive the arms."
    }
  }
}
```
