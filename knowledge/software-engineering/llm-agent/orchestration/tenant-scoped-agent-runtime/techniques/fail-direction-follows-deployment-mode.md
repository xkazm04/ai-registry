---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: fail-direction-follows-deployment-mode
status: forged
stage: multi-service
laws: [absent-guard-is-loud, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a credential resolver must decide what to do when the active scope has no such name, adding tenant isolation to a runtime that single-tenant deployments already ship, background work authenticates with a placeholder while interactive work succeeds, deciding whether a scope is an overlay or a boundary]
---

# Fail direction follows deployment mode

A credential resolver distinguishes missing scope from a scoped missing name.
Choose its fallback policy from the declared deployment and secret-ownership
contract. Tenant count alone does not authorize access to process credentials.

## Strict scope and compatibility overlay

With tenant isolation enabled, require a valid scope for tenant-owned reads.
A missing name yields explicit absence or a required-credential error, never an
unrelated process value or a placeholder that appears to authenticate. A caller
default is allowed only when its semantics are safe and explicit.
See [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) and
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud).

A legacy single-tenant deployment may allow scoped values to overlay known
tenant-owned startup environment values. Validate that ownership and precedence.
A strict resolver is also legitimate for one tenant and may be simpler when
all credentials are already loaded explicitly. Migration must preserve supported
injection methods or announce their deliberate replacement.

Background authentication failing while interactive work succeeds is a useful
clue to compare resolver paths, not a unique diagnosis of scope fallback failure.
Different credentials, configuration, expiry or network paths can also explain it.

## Host-owned names

Classify global settings explicitly, preferably by exact name. A process listener
address may be global; a proxy URL can contain credentials, and an endpoint may
itself be tenant-specific. Do not infer authority from a common prefix or from
two call sites wanting the same value. Validate new names and reject unknown
credential-bearing additions until ownership is defined.

Host credentials, if any, have a separate access policy. Classifying a value as
process-owned does not grant every tenant tool permission to read or inherit it.
Do not union tenant secrets into the process environment, even when strict
resolvers would normally hide them from cooperative callers.

## Failure visibility and checks

Do not repair an unscoped tenant credential read by widening the host allowlist.
Establish the missing scope or supply an explicit tenant capability. A broad
exception handler must not silently turn an isolation failure into plausible
fallback output: [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success).
Keep diagnostics useful without printing secret values.

Test scoped hit/miss, absent scope, credential rotation, host-owned reads,
prefix-adjacent secret names and child environment construction. Compare both
background and interactive paths in every supported deployment mode. Prefer a
fixed startup policy; any live mode change must drain or revalidate affected work.

Where every credential call already accepts an authorized tenant explicitly,
ambient fallback may be unnecessary. Do not add a deployment switch merely to
recreate a compatibility path no consumer needs.
