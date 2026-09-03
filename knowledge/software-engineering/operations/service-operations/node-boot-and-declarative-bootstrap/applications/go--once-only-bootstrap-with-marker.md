---
layer: application
type: application
subject: node-boot-and-declarative-bootstrap
technique: once-only-bootstrap-with-marker
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Self-initialization: the marker, the revoked root token, and the request chain beneath it

OpenBao's declarative self-initialization (`internal/command/server.go:1748-1842`,
`internal/vault/self_init.go`, RFC `website/content/community/rfcs/self-init.mdx`) is
[once-only-bootstrap-with-marker](../techniques/once-only-bootstrap-with-marker.md) realised
almost clause for clause, and the profile engine it runs on
(`internal/helper/profiles/profiles.go`, `internal/vault/workflow_store.go`) is the evidence
for [request-chain-not-dsl](../techniques/request-chain-not-dsl.md).

## First start only, detected by state, on the leader, with auto-unseal

`ServerCommand.Initialize` returns immediately when no `initialization` block is configured
or in dev mode (`server.go:1750`). It then refuses outright when the seal cannot support
recovery keys — "self-initialization requires auto-unseal as there is no way to persist the
Shamir's keys" (`:1754-1756`) — which is the unattended-seal precondition, checked at every
start rather than at config validation and therefore loud on a Shamir node forever. The
fast path at `:1761-1771` skips when the core is already initialised, and the comment is
the technique's argument: "We refuse to rerun self-initialization as it is a highly
privileged way of sidestepping authentication. At first startup there is no other
authentication information but on subsequent startups presumably the admin has created an
alternative mechanism we should defer to." The RFC's problem statement adds the failure mode
of the alternative: a dev-mode root token is "valid indefinitely, letting any leak gain root
access", and "one-time initialization limits scope versus continual re-initialization".

`core.Initialize` is called with an empty recovery config (`:1776-1783`) — zero recovery
shares, so first start emits no secret; a root token creates them later. A lost race
(`ErrParallelInit`, `ErrAlreadyInit`, `:1785`) returns nil: a peer initialised, the peer
bootstraps. Then `waitForLeader` (`:1825`), and the non-leader is refused, not retried:
"initializing node did not win leadership election: ensure only one active, voting node
during initialization" (`:1830`). Both cluster rules were upward lessons to the draft.

## The marker, written before, removed after, checked at unseal

`MarkSelfInitStarted` writes the literal `failed` to `core/status/self-init`
(`self_init.go:14-35`) before `doSelfInit` runs (`server.go:1834-1836`), and
`MarkSelfInitCompleted` deletes it after (`self_init.go:37-40`, `server.go:1842`). The
constant's own comment states the write-before rule: the marker "ensures that self-init is
considered 'failed' if interrupted before we reach MarkSelfInitCompleted". `checkSelfInit`
(`self_init.go:44-61`) is called from `unsealInternal` immediately after the barrier
unseals (`internal/vault/core.go:1806`), so a present marker means "refusing to unseal"
(`self_init.go:56`), and any *other* value is refused separately with "unknown status …, is
storage corrupted?" (`:58`) — the fourth outcome the technique now names, taken from here.

## The credential revoked on every exit path

The root token returned by `core.Initialize` is revoked in a `defer` registered before
leadership is awaited (`server.go:1790-1822`): a synthetic `auth/token/revoke-self` request
(`:1791-1796`), with an `alreadyRevoked` lookup so that a revocation that fails because the
token is already gone does not turn a successful bootstrap into a failed one (`:1797-1804`),
and every other failure joined into the returned error. The revocation runs whether
`doSelfInit` succeeded or failed. The profiles concept document
(`website/content/docs/concepts/profiles.mdx`, "Output Generation") carries the
observability warning the technique asks for: self-init output "is logged at the Trace
level; this will contain privileged information and should not be exposed to arbitrary
users".

## The chain beneath it: ordinary requests, call-site sources, two escape hatches

The profile engine's header comment (`profiles.go:17-38`) describes "a mechanism for
embedding requests in a configuration file" with "one or more `request` blocks inside,
executed in the given order", and warns it "should not be used in scenarios where durability
(retries, &c) are considered" — retry is the caller's, as the technique holds.
`evaluateRequest` (`profiles.go:382-425`) builds the request, stashes it in history, sends it
through the injected request handler, and stashes the response only on success. The concept
doc's admonition confirms the equal-checks rule: "All requests are subject to the same
restrictions as if they were executed normally: audit logging, authentication, and API
variable restrictions … still apply."

The source set is call-site restricted, as the technique now states: self-init constructs
the engine with `WithEnvSource`, `WithFileSource` and `WithRequestSource`
(`server.go:1860-1862`), while the workflow store constructs it with request, response, CEL,
template and *input* sources and the comment "Do not allow sources which could bypass
authorization" (`workflow_store.go:340-346`); the concept doc marks `env` and `file` as
"only available for declarative self-initialization". The two escape hatches are exactly the
tree's `when` (outer block at `profiles.go:347`, per request at `:483`) and `allow_failure`
(`:477`) — a skip predicate and a tolerate-failure flag, and nothing else. The RFC's
"Rationale" says the shape "does not use any HCL-specific features … and thus could be
portable to any other configuration language"; its problem statement says "we should not
attempt to build a new DSL". One reservation the standard keeps: the RFC floats a future
`for_each`, which the technique refuses as a loop.

## Recursion: the request identifier is the counter

`WorkflowStore.Execute` (`workflow_store.go:288-330`) refuses trace output to an
unauthenticated caller (`:290`), answers a missing or non-public workflow with permission
denied rather than not-found when unauthenticated (`:302-304`), refuses any chain whose
request-id lineage contains `.unauthed.workflow.` (`:311-322`), and caps authenticated depth
by `strings.Count(reqId, ".workflow.") == maxWorkflowRecursion` (`:324-328`), with the cap
at 5 (`:28`). The lineage is built at `:357-360` — "Allow auditing our generated requests by
tying this to the input API request" — so audit lineage and depth counter are one string,
the upward lesson the technique now carries. Unauthenticated workflows are off unless
`allow_unauthenticated_workflows` is set (`internal/command/server/config.go:145-149`).
