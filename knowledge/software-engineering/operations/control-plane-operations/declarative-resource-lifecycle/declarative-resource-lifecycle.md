---
layer: golden-path
type: golden-path
subject: declarative-resource-lifecycle
status: forged
use_when: [several independent processes write the same record and none of them holds a lock, a record must not disappear while somebody still owns resources created from it, a change to a dependent should re-run the work that produced it, deciding what may be written to a shared record at all and by whom]
techniques:
  - deletion-blocked-until-dependents-confirm
  - ownership-edges-that-enqueue-the-parent
  - per-field-write-ownership
  - synchronous-gate-before-persistence
---

# Declarative resource lifecycle

A declarative control plane has one shared object at its centre: a **record**
stating what somebody wants to be true. Around it stand several writers who
have never met — the author who wrote the record, the automation that fills
in what the author left out, the process responsible for making the world
match it, the tool that redeploys the whole set from a repository. None of
them holds a lock over the record. There is no transaction spanning their
writes. There is no coordinator that serialises their intentions, and adding
one would defeat the point, because the writers have independent lifetimes
and any of them may be restarted, upgraded or removed at any moment without
the others noticing.

What makes that independence safe is not a scheduler. It is a small set of
**contracts written onto the record itself**, where a writer who has never
met the others can read them:

- a **marker** says *this record may not vanish yet, and here is who is
  holding it open*;
- an **edge** says *this dependent belongs to that record, and a change here
  is that record's problem*;
- a **field owner** says *this value is mine, and taking it is an act you
  have to perform on purpose*;
- a **gate** says *this is what may be written at all, judged before the
  write lands*.

That is the whole subject: **the record is the coordination medium.** Every
mechanism below is a way of putting coordination *into* the shared object so
that it survives the death of the process that wrote it, binds writers that
were deployed before the contract existed, and needs no agreement between the
writers beyond their agreement to read the record.

The naive reading is that this is ordinary record-keeping with some extra
metadata bolted on. It is not, and the tell is where each contract fails:
none of the four is visible until two writers meet. A system with no marker
works perfectly until the first delete races a cleanup. A system with no
field ownership works perfectly until the second writer ships. A system with
no gate works perfectly until a record that should never have existed is read
by something that builds from it. Every defect in this subject is a defect
that only manifests under the condition the subject exists for, which is why
the contracts are designed in rather than added after the incident.

## Where this subject ends

The boundaries come first here, because this subject sits in a crowded
neighbourhood and almost every mechanism below has a near-twin somewhere
else in the corpus that answers a different question with the same words.

[entity-lifecycle](../../governance-and-records/entity-lifecycle/entity-lifecycle.md)
governs the states a record moves through **for the product's sake** —
created, archived, restored, deleted — with the ceremony that a destructive
act owes the human who requested it: a computed blast radius, a reversible
promise distinct from a permanent one, a transition log that outlives the
entity. This subject governs the contracts that let **independent writers**
move a record safely, and its audience is a program rather than a person. The
rule for the reader: if the question is *what does removing this mean for
everything that points at it, and does the user understand that*, read there;
if the question is *who else is writing this record right now and what stops
us from undoing each other*, read here. The two meet at exactly one seam,
and that subject already names it — a dependent the store's own declarations
cannot reach needs an application-level reaper. This subject's marker is the
form that reaper takes when the reaper is a separate process with its own
lifetime.

[concurrency-guards](../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md)
owns single-active exclusivity, and its
[leadership-is-the-lock](../../../backend-platform/work-execution/concurrency-guards/techniques/leadership-is-the-lock.md)
technique owns the case where one participant is elected and the others wait.
This subject states the **inverse** and means it: it assumes concurrent
writers and refuses to solve them by electing one. That is not a gap. A
mature realization of this subject ships **no election code at all**, and the
absence is the argument — an election would require every writer to
participate in one protocol, which is exactly the coupling the record was
introduced to remove, and it would still not help, because the writers that
matter most are the human and the deployment tool, neither of which will ever
join an election. The rule: if the design question is *which one of us acts*,
read there; if it is *how do all of us act without wrecking each other's
work*, read here.

[job-coordination](../../../backend-platform/work-execution/job-coordination/job-coordination.md)
and delivery-guarantees own durable work: the job record that precedes its
executor, the lease renewed against a clock, the claim won by conditional
write, the at-least-once delivery whose duplicates you must survive. None of
that is here, and the boundary is sharper than it looks: **every queue in
this subject is in-memory by design.** A control plane's queue holds *keys
that need re-examining*, and losing it costs one full re-read of the world at
the next start, which the design already performs anyway. A durable queue
would add a second source of truth about what needs doing beside the records
themselves, which is precisely the duplication the declarative posture exists
to avoid. If losing the queue loses work, it is that subject's; if losing the
queue loses only latency, it is here.

[retry-backoff](../../../backend-platform/resilience/retry-backoff/retry-backoff.md)
owns the classification of a failure and the delay before the next attempt.
This subject's mechanisms fail and are retried like anything else; they
contribute no retry policy of their own, and a technique here that invented
one would be a second authority on a question already settled.

[deployment-contract](../../../engineering-process/continuous-integration/deployment-contract/deployment-contract.md)
owns packaging and rollout — that a specific verified build reached a named
environment by a declared path, with platform configuration held as code.
That subject stops when the record is applied. This one begins there: what
the record means once several parties are writing it, which is the question
the deploy tool becomes one of the answers to the moment it runs twice.

Two sibling subjects share this subcategory and take the halves this one
deliberately does not hold.
[convergence-loop-and-requeue](../convergence-loop-and-requeue/convergence-loop-and-requeue.md)
owns the loop that reads these records — the level-driven pass that is told
*that* something changed and never *why*, the per-key deduplicated queue, the
requeue, the rate limiting. This subject is about the contracts on the
record; that one is about the machinery that reads them, and the seam is the
moment a key is enqueued.
[watch-cache-and-resync](../watch-cache-and-resync/watch-cache-and-resync.md)
owns the cache those reads are served from and its resynchronisation after a
desync — which is why this subject can treat a lost change message as an
optimisation lost rather than a fact lost, and why the one message it refuses
to depend on is the one announcing a removal.

Finally, two subjects that look like the fourth contract and are not.
[authorization](../../../security/identity-and-access/authorization/authorization.md) owns the
chokepoint that grades the **caller** — identity to permitted action, inside
the program that serves the request, with one failure direction: when in
doubt, refuse. The gate in this subject grades the **content of the write**,
may rewrite it, and lives in a separately deployed process whose own
availability has two legitimate answers rather than one. Those three
differences are the design, which is why the gate lives here; who may
*register* a gate is an ordinary authorization question and is answered
there.
[webhook-ingestion](../../../backend-platform/resilience/webhook-ingestion/webhook-ingestion.md)
is the receiving side of an asynchronous delivery — unverified bytes, at
least once, the sender long gone, no verdict that blocks anybody. The gate
here has the opposite geometry: the store calls out and *waits*, and the
original writer is still holding the connection. The two share a word and
nothing else, and conflating them produces a gate that logs its objection and
returns success.

## A marker is how a record refuses to disappear

The first contract is the one that turns deletion from an event into a
negotiation. A record carrying an owner's marker **cannot be removed**: the
store accepts the removal request, stamps the record with the instant it was
requested, and then stops. The record stays readable and stays enumerable
until the last marker is gone, and each owner removes its own marker only
after its own cleanup has succeeded.

Two rules carry the whole weight. **The marker goes on before the first side
effect, never after** — which means the pass that claims custody applies
nothing at all, and the write that adds the marker is itself what triggers
the next pass ([record-precedes-effect](../../../_laws.md#record-precedes-effect)).
And **a failed cleanup keeps the marker**: the failure path does not remove
it "to unblock the delete", because removing it is a claim that cleanup
finished, and that claim would be false.

The cost is stated as plainly as the guarantee, or the design is dishonest:
a marker whose owner is gone blocks deletion **forever**. That is the
mechanism working, not failing — but an operator meets it as a record that
will not die, and the two escapes must be named where they will be read.
[deletion-blocked-until-dependents-confirm](./techniques/deletion-blocked-until-dependents-confirm.md)
owns the marker's placement, the guarded compare-and-remove that stops one
owner deleting another's marker, the requirement that cleanup be re-runnable
from any cancellation point, and the two escapes from the deadlock.

## An edge is how a dependent's change becomes the parent's problem

The second contract answers a routing question that looks trivial and is
not. Work arrives as changes to *dependents* — the things a record caused to
exist — while the unit of work is the *record*, because the record is the
only place the desired shape of the whole subtree is written. A dependent
that drifted or was deleted out from under the responsible process cannot
repair itself; it does not know what it was supposed to be.

So the dependent carries the **identity of the thing responsible for it**, as
data on the dependent, and a change to the dependent enqueues the parent's
unit of work rather than its own. Storing the edge on the child is what makes
the index free: it is derivable by reading the children, needs no registry,
and survives every restart, because the authority was never in anybody's
memory. A registry held by the responsible process would have to be rebuilt
from the same children after a restart, which proves it was a cache all
along.

The rule that surprises people is that **the parent is enqueued even when the
parent is unchanged** — indeed, especially then, because an unchanged parent
plus a drifted dependent is exactly the drift the pass exists to repair.
[ownership-edges-that-enqueue-the-parent](./techniques/ownership-edges-that-enqueue-the-parent.md)
owns the declared-edge-versus-computed-mapping decision, the minted identity
that stops a recreated parent adopting the old one's children, the scope
limit on an enforceable edge, and the boundary against a static dependency
graph, which answers a compile-time question with the same picture.

## A field owner is how one record holds several minds

The third contract is the one that makes last-writer-wins visible as the
absence of a policy. Each writer **names itself**, the store records which
field paths that name owns, and a write that would take a path owned by
another name **fails** — unless the writer seizes it deliberately, which is
an act with a record rather than a side effect of arriving second.

Everything else follows from taking that seriously. The writer's name must be
stable across restarts and deployments, or the ledger fills with dead owners
and every conflict is against a ghost. The write must state everything the
writer owns rather than only what it changed, because the *absence* of a
field is how a writer gives one up — and a writer that sends deltas can never
relinquish anything. Relinquishing has a consequence the naive reading
misses: a field nobody owns any more is removed or reset, so "I no longer
manage this" and "I want this value to stay" are different acts that must be
spelled differently.

The alternative this replaces is read-modify-write over the whole record
under an optimistic-concurrency check. That construction is correct against
*concurrent* writers and useless against *independent* ones: the retry loop
re-reads and writes back the whole record, so a writer that succeeds has
re-asserted every field it read — including the fields another owner set an
hour ago and this writer has no opinion about. The version check catches the
collision and misses the reversion, and the reversion is what gets reported a
week later as "the setting keeps coming back".
[per-field-write-ownership](./techniques/per-field-write-ownership.md) owns
the ledger, the conflict, the seizure, shared ownership and its trap, and the
client-side check that makes an impossible combination unrepresentable rather
than merely diagnosable.

## A gate is how a policy binds writers it never met

The fourth contract is the only one that is not a piece of data on the
record: an **externally registered participant** that sees every write before
it lands, and may refuse it with a reason or rewrite it. It exists because a
policy that lives in the clients binds only the clients that loaded it — and
the writers that matter are the ones that predate the policy, the ones nobody
owns, and the human at a terminal.

The design question is not the gate's logic, which is usually a dozen lines.
It is the gate's **availability policy**. A gate that fails closed can halt
every writer in the system when it is the gate itself that is down; a gate
that fails open is not an enforcement point, it is advice. Both are
legitimate and neither is a default: the choice is made per rule class and
stated where the rule is registered, because a rule preventing an
unrecoverable state and a rule supplying a convenience default want opposite
answers, and one global setting is guaranteed wrong for half of them
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) — a gate that
degrades to open must say so, loudly, rather than pass a write silently).

The second-order rules matter as much. The gate must see the object **as it
will be persisted**, which orders rewriting participants before judging ones
and forbids a judging gate from assuming it is alone. The refusal is a reason
rather than a boolean, and it travels back to the original writer. A separate
advisory channel carries non-fatal remarks without blocking, and keeping it
separate is what lets a rule be a warning this quarter and a refusal the
next.
[synchronous-gate-before-persistence](./techniques/synchronous-gate-before-persistence.md)
owns the availability decision, the narrowing at registration, the echoed
correlation identifier and the constructor discipline that makes forgetting
it impossible, and the boundary against the receiving side of an
asynchronous delivery.

## What "done" looks like for this subject

A control plane meets the bar when: every process that creates something
outside the record's own store places a marker on the record before its first
side effect and removes it only after its own cleanup succeeded, with the
removal guarded so it cannot take another owner's marker, and with the
deadlock and its two escapes written where an operator will read them; every
dependent carries the minted identity of the record responsible for it, so
that a change anywhere in the subtree re-runs the one pass that knows the
subtree's desired shape, and the index needs no registry to survive a
restart; every writer names itself with a name that outlives its process,
states the whole of what it owns rather than a delta, and meets a refusal
rather than a silent overwrite when it reaches for a field somebody else
holds — with seizure available, recorded, and rare; and every rule that must
bind writers the system does not control is enforced by a gate before the
write lands, whose scope is narrowed at registration, whose availability
policy is chosen per rule class and written down, and whose refusals arrive
at the writer as reasons rather than as failures with no author.

## The techniques

- [deletion-blocked-until-dependents-confirm](./techniques/deletion-blocked-until-dependents-confirm.md)
  — the marker placed before the first side effect, the failed cleanup that
  keeps it, the guarded compare-and-remove under positional storage, the
  re-runnable cleanup, and the deadlock's two escapes.
- [ownership-edges-that-enqueue-the-parent](./techniques/ownership-edges-that-enqueue-the-parent.md)
  — the edge as data on the dependent, the parent as the enqueued unit,
  minted identity over name, declared edge versus computed mapping, and the
  scope an enforceable edge cannot cross.
- [per-field-write-ownership](./techniques/per-field-write-ownership.md) —
  the ownership ledger and its refusal as one mechanism, the stable writer
  name, statement-not-delta, relinquishment and its consequence, shared
  ownership, and auditable seizure.
- [synchronous-gate-before-persistence](./techniques/synchronous-gate-before-persistence.md)
  — the availability policy as the design question, narrowing at
  registration, rewriting before judging, the echoed identifier, and the
  advisory channel kept apart from refusal.
