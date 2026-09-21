---
subject: tenant-scoped-agent-runtime
domain: software-engineering
last_touched: 2026-09-09
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
