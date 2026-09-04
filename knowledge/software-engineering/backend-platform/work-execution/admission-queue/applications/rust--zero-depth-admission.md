---
layer: application
type: application
subject: admission-queue
technique: zero-depth-admission
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.93.0
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Rust — a service framework whose every hop refuses rather than waits

How the shared service runtime of an open-source real-time chat platform stands
against [zero-depth-admission](../techniques/zero-depth-admission.md). The
version witness is the toolchain the tree's own CI pins for every Rust job
(`1.93.0`), not a guess from the manifest.

Read at a single commit of the public tree; nothing was executed, which is why
the verdict is `unmeasurable` rather than a comparison — see the closing
section for the instrument that would settle it.

## The shape

Every backend service in this tree is one binary run in one of two roles
selected by an environment variable — a stateless *router* that fans requests
over a message bus, and a *shard* that owns a key range and holds the only
database connection pool. Both hops admit through a counting semaphore, and
both call the **non-blocking** acquire. Neither has a waiting room. On no
permit the request is answered immediately with an `overloaded` error.

The concurrency numbers live in the framework rather than in each service,
keyed by service name: 320 for the identifier allocator, 192 for the message
service, 64 for everything else. That inverts the usual arrangement, and the
force is the operator — the platform is meant to be self-hosted by people who
will not tune six services, so the default has to be right out of the box and
the person who can pick it is the framework author who knows the relative cost
of each call, not the deployer.

## Why the arithmetic lands on zero here

This is the ratio the technique's table calls the low end. The callers are
peer services making request/reply calls over a message bus with a deadline in
the low seconds against handlers that are single-digit milliseconds — a
key-range read, an identifier batch, a permission check. A deadline that holds
one service time leaves no position in a line that could be filled and drained
before its occupant leaves, so the honest depth is the concurrency itself.

Two details show the choice was made rather than inherited:

- **The acquire is `try`, not a timed wait.** A short timed wait is a waiting
  room with its depth spelled in milliseconds, and it would have looked
  equivalent while re-importing everything zero depth exists to avoid.
- **The bound on the request itself is separate and explicit** — a 2 MiB cap on
  a shard request — so the concurrency limit is not doing double duty as a size
  limit.

## The structural fact: the invariant is tested, and the test is named wrong

The technique's central claim is that a zero-depth gate is worthless unless the
refusal's latency is independent of the work in flight, and that this is the
property nobody tests.

This tree tests it. Both the router and the shard carry a case that saturates
capacity with a request that blocks on a signal the test controls, then issues
a second request and asserts the refusal comes back. The second request's own
deadline is ten seconds while the assertion window is 250 milliseconds, so a
pass cannot be an artifact of the client giving up — which is precisely the
second step the technique says suites omit.

What is worth recording is the gap between the test's *name* and its
*assertion*. The name says the shard sheds when permits are exhausted; the
assertion that would fail if the invariant broke is the timeout wrapper, and
the message on it says the shed reply must not wait behind the in-flight
request. The name describes the decision, the assertion describes the latency
independence, and only the second one is the property that makes the design
work. A reader skimming test names sees coverage of shedding; the invariant is
in the failure message.

That is the strongest evidence available here that the design is deliberate,
and it is evidence nobody wrote down as documentation — it fell out of somebody
needing the test to fail for the right reason.

## What this realization cannot show

The tree is read, not run, and the numbers above are declarations rather than
measurements. Specifically it cannot show whether the per-service concurrency
constants are *right* — whether 64 is the honest bound for a service whose
handler holds a connection from a pool sized elsewhere — because that is a
question about a deployment under load, and this reading has neither.

The instrument that would settle it is the one the technique's other
application used: replay a fixed arrival schedule against the real admission
path with a deterministic handler, sweeping the caller deadline, and read the
crossover. The framework's in-memory transport already exists for its own
tests, so the harness is reachable without the message bus; what is missing is
a service-shaped workload to drive through it.
