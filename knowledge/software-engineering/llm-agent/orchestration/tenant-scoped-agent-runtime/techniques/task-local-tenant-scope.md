---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: task-local-tenant-scope
status: forged
stage: multi-service
laws: [one-validation-door, creation-names-reaper]
shared_with: []
use_when: [one process must serve several configurations concurrently, a per-turn identity is about to be written to the process environment, a worker thread reads the wrong owner's home directory, choosing where the tenant fact lives in a shared runtime]
---

# Task-local tenant scope

Carry an established tenant identity through each unit of work using explicit
arguments or a task-local scope. Scope is useful in an existing call graph where
passing a parameter everywhere is costly. It is still implicit context, not a
sandbox, and cannot prevent arbitrary in-process code from reading other memory.

## Installation and resolution

Install a validated immutable tenant identity and its configuration revision at
the trusted boundary. Build credentials from that tenant's configuration, then
publish the composed scope. Separate home and credential variables are one
implementation; a single validated scope object can avoid partially installed
state. Do not perform tenant-sensitive callbacks between partial installations.

Route tenant reads through a consistent resolver and distinguish explicitly
host-owned settings. This is [one-validation-door](../../../../_laws.md#one-validation-door).
If isolation is enabled, missing scope cannot fall back to a default tenant.
Do not mutate the shared process environment to select a concurrent tenant.
Dedicated single-tenant processes may use startup environment configuration;
construct subprocess environments deliberately rather than inheriting all secrets.

## Cover the actual work boundaries

Inventory ingress startup, authentication and reconnect, inbound preprocessing,
turn execution, model/session lookup, background tasks and scheduled jobs.
Install scope before each path's first tenant-sensitive operation. Process-wide
work uses a host context or an explicitly selected tenant, according to its
ownership; default-tenant authority is not automatically appropriate.

Verify propagation on the shipped runtime and primitive. Some task/thread bridges
copy context, others do not, and worker-start inheritance is not necessarily
per-submission propagation. Where a bridge lacks the required guarantee, capture
a fresh context for each submission and run inside it. Do not concurrently enter
the same captured context if the runtime forbids it.

Copying a context often copies bindings rather than the objects they reference.
A shared mutable credential mapping can still be modified across copied contexts.
Use immutable values or deliberate value copies and test mutation as well as
rebinding. A child that captured scope can outlive the parent's scoped block;
cancel, join or explicitly transfer that child's authority and lifetime.

## Unwind and test

Restore the previous scope with the runtime's structured exit/token mechanism
on success, exception and cancellation. Do not reset blindly to absent when
nested inside another tenant scope. This is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper).

Interleave two tenants, reuse one pool worker for both, nest scopes, throw during
credential preparation and let a child finish after the parent exits. Verify
bindings, mutable-value behavior and cleanup. Test the configured thread behavior
rather than asserting that every bare thread on every version must lose scope.

If explicit tenant dependencies or one process per tenant meet the requirement
more simply, use them. Task-local scope is a migration/design option, not the only
way to make a shared runtime tenant-aware.
