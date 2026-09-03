---
layer: golden-path
type: golden-path
subject: node-boot-and-declarative-bootstrap
status: forged
use_when: [designing the startup sequence of a stateful node, deciding whether a configuration change needs a restart or a reload, provisioning a node whose first start must configure itself without a human holding a root credential, a device or component created from configuration is being edited through the API, a startup diagnostic disagrees with what the real boot does]
techniques:
  - ordered-boot-dag
  - reload-partition
  - once-only-bootstrap-with-marker
  - config-objects-are-api-immutable
  - request-chain-not-dsl
  - seal-before-storage-plugins
---

# Node boot and declarative bootstrap

A stateless service starts by binding a port. A stateful node — a store, a coordinator, a
secrets server, anything that owns durable state and guards it — starts by *earning the right
to serve*: it must find its storage, prove it can read what is there, establish the boundary
that protects what it reads, bring up the subsystems that depend on that boundary, open its
listeners, and only then admit a request. Each of those steps reads the output of the one
before it, and each can fail in a way the next must not paper over. The naive implementation
is a `main` function that does these things in the order somebody first typed them, with
cleanup added wherever a bug was last found. It works, for a while, because on the happy path
order is invisible. It fails the day a step is added that reads something not yet initialised,
or a verify-only mode exits early and leaks the lock it acquired, or an operator sends a
reload signal expecting a certificate swap and gets a node that silently re-reads its storage
address and keeps the old one.

This subject holds three commitments about the startup of such a node, and they share one
stance: **startup is declared, not narrated.** The order of components is a dependency graph
that the code states and the diagnostic replays. The configuration is partitioned, in
writing, into what a reload may change and what only a restart may. And the privileged act of
bringing a fresh node from "empty" to "configured" is a once-only sequence of ordinary
requests read from the configuration and bracketed by a marker — never a human at a terminal
holding a credential that is valid indefinitely.

## Startup is a dependency graph, and the code says so

The order in which a stateful node comes up is not a matter of taste. Storage is opened
first because everything else reads it. The sealing boundary — whatever mechanism decides
whether the data at rest can be read at all — comes next, because the core cannot be
constructed without knowing how it will decrypt. The core comes after the boundary. Listeners
open after the core exists but before it is unsealed, because a sealed node must still answer
"I am sealed" and accept the operation that unseals it. Unseal follows; bootstrap, if this is
a first start, follows unseal; serving follows all of it. The rule behind the order is one
sentence: **a component starts after everything it reads.** A component started earlier is a
component that read a nil, a default, or yesterday's value, and did so without error.

Two consequences are less obvious and matter more. First, **the finalizer is deferred at the
point of acquisition**, not at the point where somebody remembered to release: a storage
lock, a listener, a plugin process, a temporary file each names its reaper in the same
statement that creates it
([creation-names-reaper](../../../_laws.md#creation-names-reaper)), because every startup has
paths that exit early — a verify-only flag, a configuration that fails validation after
storage was already opened, a test mode — and each of those paths is a leak unless release was
bound to acquisition. Second, **the startup diagnostic replays the same graph.** A tool that
tells the operator "this node would start" is a gate, and per
[gate-sees-target](../../../_laws.md#gate-sees-target) it must observe the real sequence in
the real order, as non-fatal spans that continue past a failure so the operator sees every
red rather than the first. When the check list and the boot order are two lists, they diverge
at exactly the step somebody added last; the standard is that the check list *is* the graph.
The procedure, the verify-only discipline and the diagnostic contract are
[ordered-boot-dag](./techniques/ordered-boot-dag.md).

## Configuration is two files wearing one name

A running node's configuration divides into values that can be swapped without invalidating
anything in flight and values that cannot. A certificate can be replaced under a live listener
— connections already established keep the handshake they negotiated, new ones get the new
chain. A log level is a flag the logger reads on each call. A file sink can be reopened after
rotation. None of these holds a lock, owns a key, or names an address that a peer has already
connected to. Contrast a storage path, a cluster address, a seal configuration, a listener
bind: each of those is *held* by something — an open handle, an established quorum, a
decrypted keyring, a bound socket — and "reloading" it means tearing that thing down, which is
a restart under another name.

The naive reload reads the whole file again and applies whatever it can, and its failure mode
is the worst kind: the reload succeeds, the log says so, and the value the operator changed is
not the value the node runs on. The standard is a **declared partition**: every key is marked
reloadable or restart-only in the one place keys are defined
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)), a reload
applies the first set and reports the second as *ignored, restart required* — never as
applied. One more rule carries the operational weight: **a reload whose configuration fails
to parse still runs the safe reload functions.** Reopening a rotated log file must not depend
on the operator having written a syntactically valid file that morning, because the reload
that reopens sinks is the one that runs from a rotation hook at three in the morning. Which
keys fall where, how the partition is declared, and what a reload reports are
[reload-partition](./techniques/reload-partition.md).

## First start is a privileged act, and it happens once

A node that has never run holds no policy, no authentication method, no audit sink. Something
has to create them, and that something historically was a human: initialise the node, receive
a root credential valid until revoked, use it to configure everything, and then — the step
that gets skipped — revoke it. Every deployment that automated this reproduced the same shape
in a script, and the script kept the root credential in a variable, a log line, or a
provisioner's state file, where "valid indefinitely" is a liability with a clock on it.

The standard moves the act into the configuration and bounds it in three ways. It runs **on
first start only**, detected by the absence of the node's initialised state, never by a flag
that an operator can leave set. It is **bracketed by a marker**: before the first privileged
request, the node writes a durable record that says *bootstrap began and has not finished*;
after the last, it removes it; and on any later start, the presence of that marker refuses to
proceed, because a half-applied bootstrap is not a state anyone can reason about — the node
may have a root policy and no authentication method, or an audit sink pointed at a path that
does not exist. The alternative, re-running bootstrap until it succeeds, is continual
re-initialisation, and it silently converts every later edit an operator makes into a value
the next restart will revert. Third, the **bootstrap credential is revoked on every exit
path**, including the failing one: the sequence obtains a privileged credential, applies its
requests with it, and revokes it in a finalizer that runs whether the last request succeeded
or the third one failed. This requires that the node can reach an unsealed state without a
human present — an unattended sealing mechanism is the precondition, not an option, and a
configuration that declares a bootstrap without one is an error at validation time. The
first-start detection, the marker's lifecycle, the credential's lifecycle and the
precondition are [once-only-bootstrap-with-marker](./techniques/once-only-bootstrap-with-marker.md).

## Objects born from configuration are not API objects

When a device — an audit sink, a plugin registration, a listener — can be created either by
configuration or by an API call, a node accumulates two populations of the same kind with
different provenance and, in the naive design, one record type. Then the API can delete the
audit sink the configuration created, and the next restart recreates it, and between those
two events the node ran without the sink the operator believed was always on. Worse: some of
these devices write to host paths or spawn host processes, which is a *system operator*
privilege, and letting an API principal create one is letting a network principal act on the
host.

The standard is a **distinct record type** for configuration-born objects, stored alongside
the API-born ones but marked, so that every API path that alters or deletes consults the
type and refuses. Reconciliation runs at start and on reload: a configuration entry with no
stored record is created, a stored configuration-born record with no configuration entry is
removed, and a conflict — the same name existing as an API-born object — fails startup loudly
rather than adopting or overwriting. The mismatch never resolves silently, because a silent
resolution is a decision about which authority wins made by whichever code path ran last.
The record type, the reconciliation and the refusal are
[config-objects-are-api-immutable](./techniques/config-objects-are-api-immutable.md).

## The bootstrap sequence is a chain of requests, not a language

Once bootstrap lives in configuration, the temptation is to invent a vocabulary for it: a
schema per resource kind, a templating layer, a small language for conditionals. Every such
vocabulary is a second copy of the API surface, maintained by hand, that lags the first and
must be documented twice. The standard refuses it: **a bootstrap is an ordered list of
ordinary requests** — the same paths, operations and bodies an external client would send —
with one addition, a way for a later request to reference a field of an earlier request's
response, keyed by the earlier request's position in the history. Anything a client can do,
the chain can do; anything the chain does, a client could have done; and the chain passes
through the same audit, authentication and policy checks as any external request, because
a chain that bypasses them is a privileged back door with a configuration syntax
([one-validation-door](../../../_laws.md#one-validation-door)).

The chain shape has one hazard the request shape does not: a chain can be triggered by a
request, so a chain can invoke a chain. The rule is that an **unauthenticated chain may never
invoke another chain**, and an authenticated chain's invocation depth is capped by counting,
not by hoping nobody writes a cycle. The request shape, history references, the equal-checks
rule and the recursion rule are [request-chain-not-dsl](./techniques/request-chain-not-dsl.md).

## What comes before storage cannot live in storage

The sealing boundary is the thing that makes storage readable. Its own providers — the
mechanism that holds or fetches the key that unwraps the rest — therefore cannot be
discovered by reading storage, and the same holds for their configuration and, if they are
loaded as separate components, the components themselves. A catalog of loadable components
kept *behind* the boundary is unreachable at exactly the moment the boundary is being
established. The standard: **anything needed before storage is readable is declared in the
configuration and stored in plaintext on the host**, never in a storage-backed catalog. This
is not a weakening of the trust model; it is an acknowledgement of one that already exists.
Whoever writes the configuration file already controls the host the node runs on, and can
already replace the binary. A component declared there shares the operator's trust, and an
integrity digest for it is optional — while a component registered through the API, by a
network principal who does not hold the host, requires one, because the digest is the only
thing standing between an API call and host code execution
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) — the guard is absent on the
configuration path *deliberately and in writing*, not by default). Where the line falls and
what each side of it demands is [seal-before-storage-plugins](./techniques/seal-before-storage-plugins.md).

## What this subject owns, and what the neighbours own

[settings](../../governance-and-records/settings/settings.md) owns the store of what the
operator decided at runtime: a key registry, typed accessors, defaults with a fail direction,
and the audit of every write. That subject's values are read while the node is up and change
while it is up; this subject owns the file the node reads *before* it is up — the boot order
those values cannot influence, and the partition that says which of them a running node may
absorb without a restart. The rule a reader uses: if a value is set through the node's own API
and takes effect on the next read, it is a setting; if a value is set in a file the process
reads at start and the question is whether a signal or a restart applies it, it is here. The
settings subject's edit-ceremony rule for operational config ("may warrant a restart notice")
is the seam: it names the fact that a restart may be needed, and this subject owns deciding
which keys need one.

[deployment-contract](../../../engineering-process/continuous-integration/deployment-contract/deployment-contract.md)
owns what a deploy promises: that a specific verified build reached a named environment
through a declared path, with the platform's configuration held as code rather than dashboard
state. It stops at the moment the process starts. This subject begins there — what the node
does with the configuration the deploy delivered, in what order, and how it configures itself
on its first start so that the deploy never had to hand a human a root credential. The
deployment contract's config-as-code rule and this subject's bootstrap chain are the same
instinct at two altitudes: that subject keeps the platform's knobs in the repository; this
one keeps the node's own first-start requests there. The rule: before the process exists, it
is the deployment contract; from the first line of the process's startup, it is here.

[optional-dependency-degradation](../../../backend-platform/resilience/optional-dependency-degradation/optional-dependency-degradation.md)
owns what an *unset* configuration value means — that absent degrades to a named fallback and
malformed fails fast — for dependencies the node can run without. This subject owns the
dependencies the node cannot run without and the order in which it acquires them: storage
and the sealing boundary have no fallback, and the question is not "what does the node do
without it" but "what must already be true before it is opened". The two meet at the
malformed edge: a malformed value on either side fails the boot, and this subject's diagnostic
replays that failure as a span rather than a crash. The rule: a dependency with a named
fallback is that subject; a dependency that appears in the boot graph is this one.

One sibling in the same category is worth a sentence. [health-checks](../health-checks/health-checks.md)
owns the present-tense question "does this dependency work, right now" and the three-state
verdict vocabulary a probe returns. The startup diagnostic in this subject borrows that
vocabulary and adds one constraint the general discipline does not need: its probes run in
boot order, because the question it answers is not "is the store up" but "would this node
start, and at which step would it stop".

## The techniques

- [ordered-boot-dag](./techniques/ordered-boot-dag.md) — the dependency graph of startup,
  finalizers deferred at acquisition on every exit path, and the diagnostic that replays the
  graph as non-fatal spans.
- [reload-partition](./techniques/reload-partition.md) — the declared split between what a
  signal may change and what needs a restart, and the safe functions that run even when the
  new file does not parse.
- [once-only-bootstrap-with-marker](./techniques/once-only-bootstrap-with-marker.md) — the
  first-start privileged sequence: detection, the failure marker, credential revocation on
  every exit, and the unattended-seal precondition.
- [config-objects-are-api-immutable](./techniques/config-objects-are-api-immutable.md) — a
  distinct record type for configuration-born devices, API refusal to alter them, and
  reconciliation that never resolves a conflict silently.
- [request-chain-not-dsl](./techniques/request-chain-not-dsl.md) — bootstrap and workflows
  as ordered ordinary requests with history-keyed references, the same checks as external
  traffic, and the recursion rule.
- [seal-before-storage-plugins](./techniques/seal-before-storage-plugins.md) — what must be
  declared in configuration because it precedes storage, and the split trust model that
  makes a digest optional there and mandatory through the API.
