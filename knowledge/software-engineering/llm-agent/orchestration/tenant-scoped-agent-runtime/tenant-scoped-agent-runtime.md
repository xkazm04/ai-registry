---
layer: golden-path
type: golden-path
subject: tenant-scoped-agent-runtime
status: forged
use_when: [one long-lived agent process must serve several isolated configurations, a credential read in a shared process could return the wrong owner's value, a cache keyed on the tenant still serves the previous tenant's code, deciding whether tenancy belongs in the process environment or in a task-local scope, writing down what a multi-tenant runtime deliberately still shares]
techniques:
  - task-local-tenant-scope
  - fail-direction-follows-deployment-mode
  - tenant-keyed-cache-evicts-loaded-code
  - resolve-handles-at-call-time
  - stamp-ownership-before-the-router
  - written-inventory-of-what-stays-global
---

# Tenant-scoped agent runtime

When one process serves several configurations, each operation must use the
intended tenant's credentials, storage and extensions. Decide first whether
sharing a process is appropriate. Resource cost, trust boundaries and operational
requirements determine that choice; there is no tenant-count threshold at which
separate processes become wrong.

This subject uses tenant to mean an isolated configuration, not a person or a
session. It adds ownership and sharing rules to
[agent-runtime-assembly](../../runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md).
[Credential-vault](../../../security/identity-and-access/credential-vault/credential-vault.md)
owns secret custody; authorization establishes which caller may act for which
tenant. A task-local variable transports an established identity. It neither
authenticates that identity nor sandboxes untrusted code in the same address space.

## Establish and carry tenant identity

Resolve tenant ownership from an authenticated routing or configuration boundary
before any tenant-sensitive read, write or batching operation. Pass it explicitly
or install a task-local scope that nested calls can read. Do not switch a shared
process environment between concurrent tenants or build a union of tenant secrets
that child processes inherit. An explicitly constructed child environment can
contain only the selected tenant's permitted values.

[Task-local tenant scope](./techniques/task-local-tenant-scope.md) covers ingress,
reconnects, background jobs and worker handoffs. Context propagation depends on
the actual runtime and primitive. Copying bindings need not copy mutable values,
and restoring a parent scope does not revoke a child's already captured context.
Use immutable scope data and bound detached work's authority and lifetime.

## Make missing scope and missing credentials distinct

Under isolation, a missing tenant scope is an error; a missing credential is
explicit absence or a required-input failure. Neither may silently borrow another
tenant's process value. A compatibility overlay can be appropriate in a verified
single-tenant deployment, but strict scoping can also be correct there.
[Fail direction follows deployment mode](./techniques/fail-direction-follows-deployment-mode.md)
defines the migration choice and the classification of host-owned settings.

Host work uses a distinct host capability or a deliberately selected tenant.
Do not give every process-level operation a default tenant merely to satisfy
the resolver. A warning that a subsystem falls back does not make cross-tenant
access acceptable when isolation was promised.

## Caches include every ownership-relevant input

Key tenant-derived caches by stable tenant identity, configuration/code revision
and relevant credential generation. A normalized storage address alone may not
identify the tenant or its authorization context. Bound cache size and coordinate
creation, refresh and disposal with in-flight users.

Loaded code needs a separate isolation strategy. Removing a module-cache entry
does not destroy objects already referenced by another tenant, stop background
callbacks or make global re-import safe under concurrency. Prefer shared stateless
code with explicit tenant state, isolated module namespaces where supported, or
separate execution boundaries. Use eviction only with a loader-specific, quiescent
lifecycle. See
[tenant-keyed-cache-evicts-loaded-code](./techniques/tenant-keyed-cache-evicts-loaded-code.md).

## Resolve storage at a stable operation boundary

An instance dedicated to one tenant can bind its handle at construction. A facade
shared across tenants resolves the correct handle at call time or receives an
explicit tenant-bound dependency. Capture that handle for the operation or
transaction so nested scope changes cannot switch storage halfway through it.
Shared database pools can be valid when their authorization and session-reset
contracts are enforced. See
[resolve-handles-at-call-time](./techniques/resolve-handles-at-call-time.md).

## Stamp trusted ingress ownership before use

For a dedicated connector, bind its owner during configuration and retain it
across reconnects. For multiplexed ingress, authenticate and route before touching
tenant state. An event field does not outrank a configured owner merely because
it is more specific: validate who may assert it and reject conflicting identities.
Use collision-free tenant/connector/conversation keys consistently. See
[stamp-ownership-before-the-router](./techniques/stamp-ownership-before-the-router.md).

## State the remaining sharing

Publish the actual trust and isolation boundary, shared surfaces, failure impact,
owner and planned mitigations. Include memory/code execution, resource quotas,
logs, caches, queues, mounts and external services as applicable. Separate
processes still share some infrastructure and require this assessment.
[Written inventory of what stays global](./techniques/written-inventory-of-what-stays-global.md)
keeps intentional sharing distinct from a gap in a claimed guarantee.

## Acceptance and evidence

Interleave two tenants through every entry path, including retries, reconnects,
pooled workers and background work. Use synthetic credentials and isolated data
to verify no cross-owner results, writes, environment inheritance or cache reuse.
Test missing scope, forged/conflicting ingress stamps, same-named extensions,
rotation, unload during use and child work surviving its parent.

The [Python application](./applications/python--task-local-tenant-scope.md)
records runtime-specific context semantics and a corrected source claim. These
mechanism checks do not establish isolation against malicious in-process code.
