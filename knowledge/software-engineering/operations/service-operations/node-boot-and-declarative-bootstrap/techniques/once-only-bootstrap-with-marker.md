---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: once-only-bootstrap-with-marker
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
stage: team
use_when: [a fresh node must configure its own policy and auth without a human, a provisioner stores a root credential returned by initialisation, deciding what a node does when bootstrap failed halfway last time, a bootstrap that re-runs on every start reverts operator edits]
---

# Once-only bootstrap with marker

Privileged bootstrap is the sequence that takes a node from *initialised and empty* to
*configured enough to serve its first real client*: a root policy, an authentication method,
an audit sink, whatever the deployment considers minimum. This technique moves that sequence
from a human holding a long-lived credential into the node's own first start, and bounds it
with three mechanisms — first-start detection, a failure marker, and a credential that names
its own revocation.

## It runs on first start, detected by state, not by flag

The bootstrap runs exactly when the node's storage reports *never initialised* and the
configuration declares a bootstrap. It never runs because a flag says so, because a flag
outlives the condition it describes: a provisioner that sets `bootstrap = true` on first
start leaves it set, and the operator who later edits a policy through the API finds it
reverted at the next restart. The naive reading — reconcile the declared configuration on
every start, the way a desired-state controller does — is the wrong model for this class of
object: bootstrap creates *initial* state that the operator then owns, and a controller that
keeps reasserting the initial state has taken ownership away. The decision rule: **when the
object created by bootstrap is meant to be edited afterwards through the API, apply it once;
when it is meant to be owned by configuration forever, it is not bootstrap but a
configuration-born object with its own record type**, handled by the sibling technique.

First-start detection has a precondition that is easy to omit: the node must reach an
unsealed state without a human present, because the bootstrap requests run against the
unsealed core. A configuration that declares a bootstrap and a sealing mechanism that needs
an operator to supply key shares is a contradiction, and it is refused at configuration
validation time, not discovered at three in the morning when the node sits sealed with a
bootstrap pending. **Unattended unseal is the precondition, not an option.**

Two more preconditions are cluster-shaped. In a replicated deployment the bootstrap runs on
exactly one node — the one that won leadership after initialising — and a node that
initialised but did not win leadership **refuses with an instruction**, never retries: the
operator brought up more than one voting node at once, and the honest remedy is to reset
storage and start one, because two nodes each believing they own first start is not a state
a retry loop can reason its way out of. A node that finds initialisation already done by a
peer skips its own bootstrap silently; the peer is running it. And where initialisation
would normally return secret material — recovery shares alongside the credential — the
first start returns none, and creates them later through an authenticated operation, so
that no secret is minted as a side effect of a process starting.

## The marker brackets the sequence

Before the first privileged request is sent, the node writes a durable record — in its own
storage, under a reserved key — that says *bootstrap began*. After the last request completes
and the credential is revoked, it removes the record. The record's presence on any later
start refuses to proceed: the node stays sealed or refuses to serve, logs which start left
the marker, and waits for an operator.

The marker lives inside the sealed store, under the same protection as everything the
bootstrap created, and is checked at the moment of unseal — so "refuses to proceed" means
the node will not finish unsealing, which is the earliest point at which it could have read
the marker at all. A marker whose value is neither the expected sentinel nor absent is a
fourth outcome, refused with a different message that names storage corruption, because an
unexpected value is unknown and unknown is not "finished".

The marker is what makes the three outcomes distinguishable
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)): *never ran*
(no initialised state), *ran and finished* (initialised, no marker), *ran and did not finish*
(initialised, marker present). Without it the third collapses into the second, and a node
whose bootstrap failed after the root policy and before the authentication method comes up
looking configured and admits nobody. The write-before rule is load-bearing: a marker written
*after* a failure is a marker the failure can prevent — a crashed process, a lost storage
connection — and the naive reading, "write the marker when something goes wrong", is exactly
the reading that produces a clean-looking node after the worst kind of failure. Write it
before the first effect, remove it after the last; refuse the action if the marker cannot be
written.

Recovery from a present marker is an operator decision, deliberately. The two honest options
are to clear the marker and let the node serve in whatever partial state it holds, then finish
configuration by hand, or to wipe storage and start again. Automatic retry is not an option
because the requests are not idempotent in general — a second "create policy" may fail or
may overwrite an operator's edit — and because the marker was written to make exactly this
state visible rather than to make it self-healing.

## The credential is revoked on every exit path

The bootstrap sequence obtains a privileged credential — the same root credential a manual
initialisation would have returned — uses it for every request in the chain, and revokes it
in a finalizer bound at acquisition ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
The finalizer runs whether the chain finished, whether request three failed, whether the
process is shutting down on a signal. The credential is never written to storage as a
returned value, never logged at a level an operator would run in production, and never
returned to the caller of the start command. The rule: **a bootstrap credential exists for
the duration of the chain and not one request longer.**

The naive reading revokes at the end of the happy path. Its failure mode is a failed
bootstrap that leaves a root credential valid indefinitely in memory or in a log, on a node
that an operator will now investigate with debug logging turned up.

One consequence for observability: the chain's trace-level output contains the privileged
responses (the credential itself, any secret a request minted), and the documentation for
the bootstrap says so in the sentence that documents the log level. An operator who turns
trace on to debug a failed bootstrap should know what they are about to write to disk.

## What bootstrap may create, and what it should not

Bootstrap is for state the deployment needs before its first real client and that the
operator will own afterwards: a root policy, the first authentication method and its first
role, an initial audit sink where the sink is API-managed. It is the wrong place for anything
that must stay under configuration control — those are configuration-born objects — and for
anything a running node could create later on demand. A long bootstrap chain is a symptom:
either the deployment is doing per-tenant setup at node start (which belongs in a
post-serve workflow), or it is reasserting configuration (which belongs in a record type,
not a chain).

## When not to use this

A single operator running one node by hand can initialise it, configure it, and revoke the
root credential in one sitting, and the marker discipline is ceremony. The technique starts
to pay at the point where nodes are provisioned by automation — because that is where the
root credential ends up in a state file — and it becomes mandatory when the same automation
provisions nodes it will never again touch by hand.
