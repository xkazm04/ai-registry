---
subject: tenant-scoped-agent-runtime
domain: software-engineering
last_touched: 2026-11-16
dry_streak: 2
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

## 2026-11-16 - `/deepen` loop (run `filler-deepen-20261116b`, /shift filler)

Dispatched for one expired application (`python--task-local-tenant-scope`, override clock 2026-11-05) and one stack-drift flag (`node--fail-direction-follows-deployment-mode`, node@18 against fleet 24). The pass found something larger than the clock. **The 2026-09-09 architecture review's technique-level clarifications are not in the files.** The 2026-09-10 restore (`7792d1b1a`, "restore 34 documents the line-based revert filter missed") reset the seven upper-layer documents to `159b40b0` to undo a compression pass. Only the applications kept their edits. Since then the techniques have contradicted their own application on the pool claim. This pass re-earned the parts of that review that primary sources and the upstream tree support today. It did not restore the review's text.

#### Round 1 (survey round)

**Not dry; no new technique.** Lanes:
- a read lane over hermes `4162ecf1` (shallow clone, 2026-11-15) and personas `8d076db46a` (HEAD, via git show);
- a counter-evidence lane over the CPython 3.14 branch source (`Lib/concurrent/futures/thread.py` and `Lib/threading.py` at `5885d6d3`) and four docs.python.org 3.14 pages (threading, contextvars, asyncio-task, the import reference), plus a synthetic fixture on 3.12.15, 3.13.16 and 3.15.0;
- a blind lane, written before any search;
- the volatile figures, re-opened at the vendor's post.

- `task-local-tenant-scope` **flipped (two conditions, one correction)**.
  1. The claim that a standard pool propagates context "in a recent release" is false. In 3.14, `submit` queues a callable and workers are reused. A new thread copies the context of the code that started it only under `sys.flags.thread_inherit_context`, which "defaults true on free-threaded builds and false otherwise". Measured with a one-worker pool and two tenants: with the flag off, both saw no scope. **With the flag on, the second tenant saw the first tenant's.** A per-submission copy gave each its own under both settings, so the copy is never a no-op. A test asserting that a bare thread loses the scope passes on one build and fails on the other; upstream deleted theirs. The blind lane predicted the stale-inheritance leak, and upstream's own pool comment now says the same (#54937).
  2. Home-then-credentials is the order of building, not of installing: install both as one immutable value. Upstream moved to a single `ScopeState` with replaying resets, which is the review's "a single validated scope object".
  3. Copies share mutable values. The fixture showed a dict mutated inside a copy is visible to the parent; a rebinding is not.
- `tenant-keyed-cache-evicts-loaded-code` **flipped (condition)**: when switching between tenants that run concurrently, give each tenant its own import name instead of evicting. Upstream's loader now gives the first scope the bare name and any other a `__home_<digest>` suffix. Three lanes converged: the review counterexample, the blind lane and upstream.
- `stamp-ownership-before-the-router` **flipped (condition)**: the event's stamp outranks the surface owner only for where the turn runs, and only when a trusted party set it. Admission is read from the owner of the receiving surface. Resolve once and pin the result. Upstream `gateway/session_identity.py` now separates transport, authorization and runtime, and reads authorization from the transport owner's home. The review and the blind lane reached the same rule.
- `fail-direction-follows-deployment-mode` **flipped (condition)**; **the 2026-09-23 banked lead was examined and closed**.
  - Upstream's resolver now decides per scope. A scope stamped with a foreign home is authoritative even with multiplexing off. The launch profile gets its frozen launch environment copied into its scope instead of falling through at read time. The flag can also arm after boot.
  - Upstream derives the mode from the served-profile count (a single profile stays standalone), so turning multiplexing on by default did not put single-tenant installs on the strict path.
  - The lead's prediction did come true in one place: the multiplexed config reload falls back to the unscoped load on any exception and logs it at **debug** level, against its own docstring. The existing rule "a fallback that fires says so" already covers it, so it is an application deviation, not a flip.
- `python--task-local-tenant-scope` was rewritten against `4162ecf1`: every anchor re-pinned, python@3.14, `refresh_by` 2026-12-28 (six-week override, reason restated).
  - The 09-23 deviation (the daemon-pool comment claimed 3.14 propagation) is fixed upstream in the pool. The same claim survives in the pool test's docstring.
  - New deviations: the debug-level config fallback; a design doc that carries both the two-scope diagram and the one-value section; an embedding host that mirrors the turn into `HERMES_HOME`, which upstream pays for with a pinned launch identity.
  - Volatile figures: the post says "reduced non-test Python source by 34.4%" and "merged the PR on September 4th". The application said "refactored by 34.4%" and is corrected. "Two days" holds. The six-week window is our own override.
- `node--fail-direction-follows-deployment-mode`: all 9 anchors byte-identical at personas HEAD, and no commit has touched `cloud-worker/` since the fix. `cloud-worker/package.json` still declares `>=18`, and it is the component's only pin (root `.nvmrc` 22, root engines `>=20`, no CI job runs the worker). `verified_against` stays node@18; the drift is on the fleet's side.

Confirmed and left untouched:
- `asyncio.to_thread` propagates context ("the current contextvars.Context is propagated"), and tasks copy the current context.
- Process-level config reload under the default root's scope: upstream still does exactly this.
- The import reference's account of two live module copies.
- Token-based nested restore.
- `resolve-handles-at-call-time` "ten minutes" (L33): a figure of speech for "later", not a measured interval.

Applied (fragment rows):
- `task-local-tenant-scope` **not-better** (simulation, athena-muse): the per-job ContextVar is always handed to threads as a value, so neither setting changes an outcome.
- `tenant-keyed-cache` **better** (simulation, gravitone): the kernel's `gt_kernel_lease` namespace is the shape; the old rule would have evicted under a live broker. 3 of 3 cases agree with the amendment.
- `fail-direction` **not-better** (simulation, personas): the issued-host binding already acts as the owner test there.
- `stamp-ownership` unapplied: no multi-tenant ingress in the fleet.

Declined: restoring the 2026-09-09 review text wholesale, because its other clarifications were not re-sourced on this pass.

Banked:
- `resolve-handles-at-call-time` says "Two tenants never share a handle". That holds only while the resolver gives distinct addresses: two tenants that resolve to one address share one handle under the technique's own keying (review counterexample, not re-sourced). Return: the next pass that opens that technique.
- The remaining 09-09 counterexamples for `written-inventory` (a warning cannot legitimize an isolation-breaking fallback; separate processes still share infrastructure). Return: a pass that opens `written-inventory-of-what-stays-global`.

#### Round 2

Dry. Standing claims probed against the blind lane:
- the written inventory's "updated in the same change": upstream's stale terminal row is the failure the rule predicts, so it is confirmed;
- token restore to the previous value, not to absent: upstream's replaying reset is a stronger form of the same rule;
- the default-tenant rule for process work: upstream unchanged.

Nothing earned.

#### Round 3

Dry. Probed:
- `stamp-ownership`: an absent stamp means the default tenant, and an unresolved event is never treated as default. Upstream keeps `None` for the primary on the wire and raises a distinct `IdentityUnresolved`.
- The allowlist's exact-or-prefix membership: upstream unchanged; the deviation stands.
- "One process per configuration is cheaper below two tenants": upstream now keeps single-profile installs standalone.

All confirmed. dry=2; the loop idles until 2026-12-28 (hermes override) or an event.

Impact: not computed. The map regeneration is owed to the Director's step 4 and was not run here.
