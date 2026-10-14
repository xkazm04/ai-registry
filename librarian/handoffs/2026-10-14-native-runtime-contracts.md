---
spec: forge-scout-brief
status: EXECUTED
subject: native-runtime-contracts (working name; the scouts decide the subjects)
bundle: software-engineering
source: https://github.com/NVIDIA-Omniverse/PhysX
source_commit: 6dc53585d7db07346f53d0598a5fd3bfdce47d8d
run_id: px1014
date: 2026-10-14
---

# Scout brief: the design record of a native runtime library

**Why this is banked, not forged.** Four design decisions in one system (the C API
and Python runtime in `ovphysx/`) have no confirmed home, but the evidence is the
tree's requirement and decision records read as documents, not the implementation, the
corpus check was the slug map (noisy: it returned subjects named `generation` for a
question about handle generation), and the decisions land in three different
software-engineering subjects, which is a `/forge` scout's job and not one worker's.
Not executed in the intake session (single author's account; spans more than one
subject). Verify each `corpus:` line with `research-map --prose` before scoping.

## Design record

**D1. The library never chooses a persistent write location; leaving it unset is itself
a choice made by someone else.**
- forces: a cache of expensive derived artifacts needs a directory; a dependency's own
  default resolved relative to the interpreter, which in a standard virtual environment
  is not writable.
- buys: the host owns every persistent location; an unset value falls back to a
  process-private location instead of the dependency's guess.
- rejects: reading an environment variable, and deriving a per-user default.
- where: ovphysx/plc/adr/ADR-0001-cooked-collider-cache-location.md:31 "Please no env variables, this is something that the app should provide"
- stage: configuration resolution, before first use.
- corpus: partial. Nearest `optional-dependency-degradation`
  (`misconfiguration-never-reaches-a-fallback`) and `settings`
  (`cross-source-precedence-chain`); neither says "unset delegates the choice to a
  dependency". Home if new: `software-engineering/backend-platform/resilience`.

**D2. A bounded wait leaves the pending operation unconsumed; poll and infinite are
named literals.**
- forces: a caller that times out and retries must not lose the result; a numeric
  sentinel for "forever" gets passed through unit conversions.
- buys: timeout is a status, not a state change; the final-boundary check proceeds to
  finalize even when finalization overruns the budget.
- where: ovphysx/plc/requirements/capi/REQ-CAPI-ASYNC-001.md:33 "leaves that operation unconsumed"
- stage: the wait call of an asynchronous operation API.
- corpus: unverified. Home if new: `software-engineering/backend-platform/work-execution`.

**D3. A handle carries the generation it was created under, and every entry point
checks it, before any other validation.**
- forces: detach and reattach of the underlying state invalidates views while the
  handle table still holds the entry; six entry points checked, six metadata getters
  did not, so a caller got stale data from some and a rejection from others.
- buys: one consistent "recreate it" rejection; a stale handle is reported as stale
  rather than as the wrong kind.
- where: ovphysx/plc/requirements/capi/REQ-CAPI-BINDING-STALE-001.md:44 "binding is reported as stale rather than as the wrong binding kind"
- stage: argument validation order.
- corpus: unverified. Nearest `concurrency-guards` (`cache-value-not-handle`).

**D4. Execution is stream-ordered: calls run in submission order and see prior writes,
the step call only enqueues, and a cost shows up under the wait.**
- forces: GPU work is asynchronous; a synchronous API would serialize the caller.
- where: ovphysx/docs/ovphysx_overview.md:56 "Stream-ordered execution: calls run in submission order"
- corpus: unverified. The profiling consequence (the enqueue is cheap, the wait pays)
  is the part a technique would carry.

**D5. Two population backends are held to one contract by a parity test, and a known
divergence is asserted as a canary that fails the day it is fixed without the contract
being updated.**
- forces: a stage populated by hand must parse like one populated from the schema;
  eleven defects were found where the consumer's default differs from the schema's
  fallback (a friction default of 0.5 against 0.0; a limit enabled at [0, 0] when a
  column is absent, locking the joint).
- buys: a defect no composition observes is documentation only; a fix cannot silently
  invalidate the contract.
- where: ovphysx/docs/population/findings.md:10 "would fail the day the consumer is fixed"
- corpus: partial. `seams-and-adapters` pins current behaviour with characterization
  tests; it does not say a pin carries a ledger entry or that an unobserved defect is
  only documentation. Probably a boundary section in that technique, one source.

**D6. Requirements are files with numbered acceptance criteria, each listing the tests
and the code that satisfy it.** (`plc/requirements/`, 80+ files.) The checker that binds
them is not in this tree; the scouts should look for it before treating this as a
technique.

## Routing count (written, per Phase 2d)

Entries with `corpus:` NONE or unverified: D2, D3, D4, D6 (four); partial: D1, D5.
Per system this clears three, but the verification is the slug map alone, so the
handoff is a scout brief and the count is a claim to check, not a fact.

## Not for the scouts

The physics-stability material in the same tree is already forged separately
(`2026-10-14-rigid-body-simulation-stability.md`). The cooked-collider cache is the
only physics-adjacent decision here (D1) and is a configuration question.

## Execution record (2026-10-14, run fg1014)

Scouted by three read-only workers against the implementation and the neighbours' prose,
then forged by three workers on disjoint folders; reviewed by diff (purity grep clean,
anchors 26/26 and 11/11 on the two applications, `use_when` present). Outcomes:

- D2 landed: `background-jobs/techniques/timeout-is-a-status-not-a-consumption` (subject 6 -> 7
  techniques) + a cpp application.
- D1 landed as an amendment of `optional-dependency-degradation/misconfiguration-never-reaches-a-fallback`
  (host at 10 techniques, over the ceiling) + a cpp application. The discriminator the scout found:
  a configured-but-unwritable location degrades quietly here, against the technique's own
  fail-fast rule, because the fallback is a throwaway cache of derived data.
- D5 landed as a section of `module-design/seams-and-adapters` (host at 16). No application: the
  parity generator is not in the clone.
- D3 -> lead (no home for a native-API-surface rule). D4 -> lead (one sentence of content).
  D6 -> lead (no checker in the tree; 66 requirement files, not 80+).

Corrections to this brief found by the scouts: the requirement count is 66, and the
tests under `plc/tests` are markdown scenarios (the executable tests carry `@implements` /
`@covers` tags that nothing in the tree parses); the ADR is `proposed`, not decided; seven
entry points already carried the stale-handle guard, five getters lacked it, and the test
enumerates by hand; "lowest pending" is the first timed-out operation in list order; the
forces line for D4 is not in the cited source.
