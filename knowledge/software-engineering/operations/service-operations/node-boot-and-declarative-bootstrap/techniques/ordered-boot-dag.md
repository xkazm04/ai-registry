---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: ordered-boot-dag
status: forged
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [adding a startup step to a stateful node, a verify-only or dry-run mode leaks a lock or a listener, writing a startup diagnostic tool, a component reads a value that is nil at boot, deciding where in startup a new subsystem is constructed]
---

# Ordered boot DAG

The startup of a stateful node is a directed acyclic graph whose edges are *reads*: a
component depends on every component whose output it consumes at construction time. The
naive implementation flattens that graph into whatever order the code was first written in
and relies on the happy path never exercising a missing edge. This technique makes the graph
explicit, binds every acquisition to its release, and makes the diagnostic replay the same
graph so the two cannot drift.

## The canonical order and why each edge exists

For a node that owns encrypted durable state the order is: **storage, then the sealing
boundary, then the core, then listeners, then unseal, then bootstrap, then serve.** Each
position is forced by a read.

There is a rung before storage that the canonical sentence hides: components that read
*only* the configuration and the host — the sealing boundary's own providers when they are
loaded as separate processes, the fetch that obtains them, the telemetry sink — start before
storage is opened, because storage is not among the things they read and the seal, which is,
cannot be built until they exist. Storage is then first among the stateful rungs because the
sealing boundary reads a persisted seal configuration to know which mechanism it is, and the
core reads storage to know whether it has ever been initialised.
The sealing boundary precedes the core because the core is constructed *with* its seal — the
core's decryption path is the seal's unwrap, and a core built before its seal exists would
have to be mutated later, which is the pattern that produces a nil read. Listeners open after
the core because a listener's handler dispatches into the core; they open *before* unseal
because a sealed node must still serve its status and accept the unseal operation — a node
whose listeners wait for unseal cannot be unsealed over the network. Unseal follows because
the operations after it read decrypted state — and unseal is a *retrying* step, not an
attempt: a node whose unattended mechanism is configured but whose storage has not yet been
initialised by a peer loops until it can unseal, so the edge in the graph is "unseal has
completed", never "unseal was tried once". Bootstrap follows unseal because its requests are
ordinary requests that require an unsealed core, and it runs only when the core reports it
has never been initialised. Serving is last: the readiness the node advertises — to the
operator, and to a supervisor that waits for a readiness notification before routing traffic
— is the assertion that every prior step completed.

The decision rule: **when adding a component, place it immediately after the last thing it
reads, and if it reads nothing that exists yet, it is being constructed too early or its
input is being constructed too late.** The failure mode of the naive reading — "put it where
it fits" — is a component that reads a default in production and a real value in the test
that happened to construct things in a different order.

Some steps are conditional on the node's role. A node that is a member of a cluster joins
the cluster after storage but before unseal, because the join is how it obtains the state it
will unseal. A node that is in a recovery or maintenance mode runs a shorter graph and skips
the unseal-dependent tail entirely. The conditional is a branch in the graph, not a second
graph; the diagnostic must take the same branch.

## The finalizer is deferred at acquisition

Every acquisition in the graph — a storage lock, a file lock, a bound socket, a spawned
process, a temporary file, a metrics exporter — names its reaper in the statement that
creates it ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)), and the
reaper runs on every exit path. The exit paths are more numerous than the happy path suggests:
a verify-only flag that validates the configuration and stops; a configuration that fails
validation after storage has been opened, because some validation needs storage; a test
harness that constructs the node and tears it down; a signal received mid-boot. **When a
resource is acquired on a path that can exit early, defer its release in the same block,
before the next statement that can fail** — not at the end of the function, not in a cleanup
routine that the early return skips. The naive reading, "verify-only never gets that far so
it does not matter", is exactly the path on which the lock leaks: verify-only opens storage to
verify it, exits before the serving loop whose teardown releases it, and the next real start
finds the lock held by a process that no longer exists.

Verify-only is a distinct rung of the graph, not a flag checked at the end. It runs storage
open, seal construction, core construction and the listener bind — because those are the
things whose configuration can be wrong in ways only construction reveals, and a port
already in use is one of them — and stops before anything irreversible: before unseal is
attempted, before bootstrap, before a request is served. The bind is admissible on this path
only because its close was deferred at the bind; a verify-only mode that binds and returns
without that deferral has turned a check into an outage for the real start that follows.
Its output is the same span list the diagnostic produces, which is the next section.

## The diagnostic replays the graph as non-fatal spans

A startup diagnostic is a gate: the operator runs it to learn whether a node would start,
and acts on the answer. Per [gate-sees-target](../../../../_laws.md#gate-sees-target) the
diagnostic must observe the real boot in the real order — the same configuration parse, the
same storage open, the same seal construction, the same listener bind check — rather than a
checklist that somebody wrote from memory of what the boot does. The rule: **the check list
is the graph.** Each node of the graph is one span with a name, a verdict, and on failure the
remediation; the diagnostic runs every span even after one fails, so the operator sees that
storage is unreachable *and* the certificate has expired in one run rather than two. A span
that cannot be evaluated because its dependency failed reports *skipped, because X failed*,
never *passed* and never silently absent — the three-state vocabulary is borrowed from the
general health-check discipline, and the ordering constraint is what this technique adds.

The failure mode of two lists is specific: a startup step added last is added to the boot and
not to the checklist, and the diagnostic reports green for a configuration the node cannot
start on. The structural fix is that the diagnostic invokes the same construction functions
the boot invokes, with side effects suppressed at the edges (no port bound, no bootstrap run,
storage opened read-only where the backend allows it). Where a step cannot be dry-run — a
cluster join, an unattended unseal against a remote key service — the span says so and
reports what it *could* check (reachability, credential shape) with its verdict labelled
partial.

## When not to use this

A stateless service that reads configuration and binds a port has a two-node graph and does
not need the machinery; a finalizer discipline is still worth having, but a diagnostic that
replays two steps is the boot itself. The technique earns its cost when the graph has an
unseal-shaped step — a point before which durable state is unreadable and after which a
different set of components becomes constructible — because that is the step whose ordering
errors are invisible on a fresh development instance and fatal on a node with real data.
