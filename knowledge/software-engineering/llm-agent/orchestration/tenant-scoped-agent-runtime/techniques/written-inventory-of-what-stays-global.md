---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: written-inventory-of-what-stays-global
status: forged
stage: multi-service
laws: [silent-state-is-ungoverned, absent-guard-is-loud]
shared_with: []
use_when: [publishing an isolation claim for a multi-tenant runtime, a reviewer asks what is actually shared between tenants, deciding whether a partly-scoped registry counts as isolated, enumerating the fail directions at the tenancy boundary]
---

# Written inventory of what stays global

Publish the actual shared surfaces alongside a tenant-isolation claim. A table
makes intentional sharing, known gaps and unverified assumptions reviewable;
it does not make an unsafe fallback acceptable merely because it is documented.
This applies [silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
and [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud).

## Each row names behavior and impact

Record the surface, what is shared, its trust/authorization boundary, failure
impact, evidence, owner and disposition. Include first-writer-wins races explicitly.
Possible surfaces include listeners, locks, module globals, CPU/memory quotas,
rate limits, logs, temporary files, caches, credentials and external services.
Do not force an intentional host service into a defect backlog; state its contract.

Update a row when the implementation or promised guarantee changes. Keep a
history of resolved gaps where useful. A surface can also be removed or replaced,
so scoping it is not the only legitimate way for a row to leave the active list.

## Hybrid registries

A registry may share host-owned definitions while overlaying tenant contributions.
Specify who may modify each layer, collision/override rules and tenant visibility.
Shared code should not capture tenant state in global objects. Apply the chosen
loader and cache lifecycle from
[tenant-keyed-cache-evicts-loaded-code](./tenant-keyed-cache-evicts-loaded-code.md);
global module eviction is not automatically safe during concurrent use.

## Fail directions follow the promised boundary

- Reject malformed isolation configuration or conflicting resource ownership
  before serving affected traffic. Whether this stops one tenant or the process
  depends on whether partial startup preserves the declared contract.
- Quarantine a failed tenant connector and report its status when others can run
  independently. Do not report it as healthy because the process stayed alive.
- Refuse unresolved or unauthorized tenant reads and routing; never guess a default.
- Allow fallback only if it preserves the required isolation and authority. Otherwise
  disable the unsupported subsystem or use a separate execution boundary.

Warnings alone cannot authorize a scheduler to run one tenant's work using
another tenant's context. Publish actual behavior, not merely intended scoping.

## Trust and deployment choices

Configuration scoping is distinct from user authentication and does not sandbox
malicious tenant extensions sharing an address space. State the code-trust
assumption and the enforcement supplied by the surrounding deployment.

Separate processes still can share a user account, mounts, network, credentials,
logs and resource limits. Inventory those boundaries too; an operating-system
process boundary does not make the table empty. Even one tenant can benefit from
distinguishing trusted host services from untrusted plugin or user input.

Review the inventory when adding a tenant-sensitive subsystem, changing routing
or loading code. Validate important claims with interleaving and failure tests;
documentation completeness alone is not runtime isolation evidence.
