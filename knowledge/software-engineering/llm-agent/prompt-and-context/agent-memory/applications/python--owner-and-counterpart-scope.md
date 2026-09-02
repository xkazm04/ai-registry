---
layer: application
type: application
subject: agent-memory
technique: owner-and-counterpart-scope
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# A store that retired its runtime key for an owner/counterpart split, and what the migration refused to guess (OpenViking)

This is the tree the technique was reconstructed from. Through the 0.3 series the store
filed memories under the runtime that wrote them — `viking://agent/<agent_id>/memories/…`
— and sessions under a bare session id. The 0.4 release replaced that with a User / Peer
model: the **user** is the natural or business owner and the address root
(`viking://user/<user_id>/…`); a **peer** is "an interaction identity under a User", a
sub-scope (`viking://user/<user_id>/peers/<peer_id>/…`); skills and sessions live under
the user, not the peer (`docs/en/migration/01-user-peer-model.md:138-158`).

## The counterpart is a view filter, and the tree says so in one sentence

"`peer_id` is a content scope inside the current user boundary. It never changes the
tenant or user identity" (`docs/en/concepts/11-multi-tenant.md:119-121`). A request
that sets the actor-peer header sees that peer's memories plus the user's shared
resources, and filesystem operations "cannot read, list/tree, grep/find/search, write,
move, or delete another peer" (`11-multi-tenant.md:124-131`). The tree enforces this
with tests named for the property: an actor-peer view blocks mutating another peer and
the peer collection, and blocks read, stat and write to another peer
(`tests/` — `test_actor_peer_view_blocks_mutating_other_peer_and_peer_collection`,
`test_actor_peer_view_blocks_read_stat_and_write_to_other_peer`).

## The runtime key survives only as a transition alias

The legacy `agent_id` maps to the request-level actor peer; configuring both fails the
request; a message-level peer id is never inferred from the alias when omitted; and the
older `role_id` isolation is "ignored after upgrade" (`01-user-peer-model.md:74-88`) —
the technique's "one axis wearing two names" defect, retired rather than kept beside.

## What the migration refused to guess

Two admissions in the tree are the technique's boundary, stated by the people who paid
for it. Sessions that carry no owner metadata "fail preflight" and are not migrated
(`01-user-peer-model.md:169`): an ownerless record is refused, not attributed. And the
unreleased changelog entry for external peer identities says older lossy peer
directories "are not read automatically because multiple identities may have collided
with each other or with a real ASCII peer; migrating that ambiguous history requires an
operator-controlled ownership decision" (`docs/en/about/02-changelog.md:11-16`). The
fix that entry ships — lossless `ext-<base64>` ids under a reserved prefix, with ASCII
ids that would enter the prefix encoded too — is the technique's encoding rule verbatim.

## What this realization cannot do

The migration copies files and rewrites vector records but "does not re-embed content
and does not automatically call `reindex`", and legacy agent instructions are not
migrated at all (`01-user-peer-model.md:158, :171-177`). A reader adopting the split on
a live store should budget the reindex and the instruction move as separate steps the
tree leaves to the operator.
