---
layer: application
type: application
subject: module-design
technique: seams-and-adapters
stack: node
verified_on: 2026-08-22
---

# Node — two production seams in an open-source agent platform

A public tree carrying
[seams-and-adapters](../techniques/seams-and-adapters.md) at two different
altitudes is [onecli](https://github.com/onecli/onecli), an open-source
platform for running sandboxed agents as a team. Citations are against the
public tree at commit `ff7a192`, read for this document on the `verified_on`
date. The two seams are worth one document because they show the same rules
holding at a module boundary and at a vendor boundary.

## Seam one: the sandbox substrate

The runner daemon isolates its container runtime behind a `SandboxBackend`
interface (`apps/runner/src/backend/types.ts:99`):

- **The adapter owns the naming.** The runner's README states the rule the
  technique argues for: *"`docker/` is the only place a container runtime is
  named."* The composition root (`apps/runner/src/index.ts:16`) is the
  enabling point — *"the ONLY place a backend id maps to an implementation"*
  — so the choice of substrate is made outside the code being varied, which
  is what makes the seam a seam. A new substrate (the README names Fly, k8s,
  microVMs as the anticipated suppliers) is *"a new module plus one line in
  `index.ts`"*.
- **The double is a first-class adapter.** `backend/fake.ts` is an in-memory
  implementation *"the whole loop is tested against"* — the runner's poll,
  execute, and reconcile logic (`runner.test.ts`, `orphan-sweep.test.ts`)
  runs deterministically against it. The production Docker adapter and the
  fake are two adapters of one interface, exactly the not-two-kinds-of-object
  stance the technique takes.
- **The interface is in the caller's vocabulary** — `createSandbox`,
  `provisionHome`, `listManaged` — not a transcription of the container
  daemon's API, which is what lets the seam survive a substrate swap.

## Seam two: the agent harness

One level down, inside the sandbox, the same shape recurs at a vendor
boundary. The harness interface
(`packages/agent-protocol/src/harness.ts:1-40`) is *"defined entirely in OUR
vocabulary; an adapter translates a vendor's surface onto it and nothing
above the adapter may know which vendor ran"* — the caller-vocabulary rule,
stated as an invariant. Two disciplines harden it beyond the substrate seam:

- **Capabilities are declared, never probed** (`HarnessCapabilities`): what
  an adapter can do — resume a session, emit tool events, steer an in-flight
  turn — is stated up front, and *"a capability the profile does not declare
  is never exercised."* The callers own the degrade paths for absent
  capabilities, so adapters stay minimal.
- **Every adapter passes one conformance suite, the fake included**
  (`apps/sandbox-supervisor/src/harness/conformance.ts`,
  `fake.conformance.test.ts`). This is the technique's "the double must be
  checked against the same contract" made mechanical: the fake cannot drift
  from the contract, because the contract is an executable suite both the
  fake and every vendor adapter must clear.

## What this realization cannot show

Both seams were designed in from the start; the tree offers no evidence about
retrofitting a seam into seamless code, which is the harder half of the
technique's argument. And the substrate seam has one production adapter so
far — the replaceability claim is structurally credible (the fake proves a
second adapter fits) but has not yet been cashed by a real second substrate.
