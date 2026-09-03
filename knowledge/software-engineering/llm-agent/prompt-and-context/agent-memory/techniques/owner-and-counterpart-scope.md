---
layer: technique
type: technique
subject: agent-memory
technique: owner-and-counterpart-scope
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse, silent-state-is-ungoverned]
shared_with: []
use_when: [deciding which identity a memory is filed under, one agent runtime serves many people, the same person talks to the agent through several channels or bots, a memory about one counterpart surfaces in a conversation with another, migrating a store keyed by the runtime that wrote it]
---

# Owner and counterpart scope

Every durable memory answers two identity questions, and a store that keeps
one field for both will answer them wrongly the moment a second party appears.
**Who owns this memory** — whose store it lives in, whose deletion removes it,
whose export carries it — and **who it is about or was formed with** — the
counterpart in the interaction that produced it. The naive key is neither: it
is the *runtime* that wrote the memory, the agent id, the bot id, the
deployment. That key was fine while one agent talked to one person. It stops
being a key the day one runtime serves many people, or one person reaches the
same agent through two runtimes, because it conflates the writer with the
owner and the owner with the subject.

## Two axes, not one

- **Owner** is the boundary that governs lifetime and access. It is a person,
  a team, or a business account — never a process. Ownership is derivable
  from where the memory lives: given the memory's address, the owner is
  readable without a lookup, and a memory whose owner is not derivable from
  its address has no owner.
- **Counterpart** is the interaction identity the memory was formed with: the
  visitor on a web channel, the colleague in a group thread, the bot on the
  other side of a relay. A counterpart lives *inside* an owner's boundary as
  a sub-scope, and one owner holds many.

The two axes have different physics. Deleting an owner deletes everything under
it; deleting a counterpart archives one sub-scope and leaves the owner's other
memories untouched. Access control attaches to the owner; **the counterpart is
a view filter**, chosen per request, that narrows which sub-scopes recall may
read and write — and a view filter never changes who the requester is. A
request that names a counterpart sees that counterpart's memories plus the
owner's shared ones, and cannot read, list, write, move or delete another
counterpart's sub-scope. That last sentence is the test: if a counterpart id
can be used to reach a different counterpart's memories, the field is a
namespace, not a view, and the design has one axis wearing two names.

## What the runtime key gets wrong, specifically

A store keyed by the runtime that wrote a memory carries three defects that
only show up under multiplicity:

- **Ownerless sessions.** A conversation record stamped only with the runtime
  that hosted it cannot be attributed to a person when the runtime hosts
  several. A later migration to owner scope has to *refuse* those sessions
  rather than guess — the corpus's rule that an unknown is not a value applies
  to identity most of all.
- **Leak by relay.** The same person reaching the agent through two runtimes
  gets two disjoint memories of themselves; two people reaching it through one
  runtime share one. Both are the same bug seen from opposite sides.
- **A second isolation mechanism grows.** Once the runtime key fails, a "role"
  or "tenant tag" is added beside it to isolate what the key cannot, and now
  two fields claim the same vocabulary. Retire the runtime key as an
  identity; keep it as a *transition alias* that maps onto a counterpart for
  old clients, reject any request that sets both, and never infer a
  counterpart from the alias when the request names none.

## Encoding the counterpart

A counterpart id becomes a path segment or a key, so it is constrained by the
store, not by the channel that minted it. Channels mint identities in every
script and every length. Encode losslessly into the safe alphabet (a reversible
encoding under a reserved prefix), and reserve that prefix so a native id that
happens to look encoded is encoded too — otherwise two different upstream
identities can collide on one directory, and the store cannot tell whose
memories it now holds. Where a lossy encoding already shipped, do not read its
directories automatically: several identities may have collapsed into one, and
untangling that is an ownership decision an operator makes, not a migration a
script performs.

## Where this sits in the pipeline

The decision is made at **write time**, once, by the capture path: every
memory is filed under an owner it derives from the session's owner and, where
the session had a counterpart, under that counterpart's sub-scope. Recall
reads the request's view filter and never a field the memory chose for itself.
Consolidation across counterparts — "three visitors independently reported the
same defect" — is a promotion from counterpart scope to owner scope and passes
through [memory-governance](./memory-governance.md) like any change of
standing; it is not a query that happens to span sub-scopes.

## When not to use it

An agent that serves one person through one channel has one owner and one
counterpart and gains nothing but a path segment from separating them. The
technique becomes mandatory at the first *second* party — a shared inbox, a
group thread, a public channel, a relay bot — and the cheapest time to add the
axis is before the store holds anything, because a store keyed by runtime
cannot be migrated without an operator deciding, per ambiguous record, who it
belonged to.
