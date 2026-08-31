---
layer: technique
type: technique
subject: entity-lifecycle
technique: archive-restore-semantics
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse, one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [deciding what archived means for each behavior, an archived entity still fires its schedules, restore meets a name claimed while it slept, a bulk delete destroyed rows a soft delete should have kept, a name is rejected as taken and nothing visible holds it]
---

# Archive / restore semantics

Archive is the lifecycle's reversible promise: the entity keeps its
identity, content, and relationships; it leaves the default views and
stops acting; restore brings it back whole. The promise sounds simple
and is not, because "stops acting" and "comes back whole" each hide an
enumeration most teams skip — and every behavior left unenumerated is a
behavior that will surprise someone, in production, with an archived
entity doing (or failing to do) something nobody decided.

## The archived-behavior matrix

For every behavior the entity participates in, the design states what
archived means — a table, written once, owned next to the entity's
definition:

- **Visibility**: filtered from default lists and pickers; reachable
  through an explicit "show archived" affordance. An archived entity
  that still appears in a selection dropdown is a bug; one that cannot
  be found *anywhere* is indistinguishable from deleted, which breaks
  the promise in the other direction.
- **Activity**: automations, schedules, and subscriptions held by the
  entity do not fire. This is usually the *reason* for archiving — quiet
  without destruction — and it is the clause most often missed, because
  the firing paths query the entity table directly and each one must
  honor the archived predicate.
- **Referential duties**: things that reference the archived entity keep
  working — history renders, links resolve (to a clearly-archived
  surface, not a not-found error). Archive never breaks inbound edges;
  that is delete's territory.
- **Resource claims**: does an archived entity still hold its unique
  name? Count against quotas? Consume a license seat? Each is a product
  decision; the technique's demand is only that each is *decided* and
  the decision is discoverable.

The predicate "is this entity visible/active?" is defined **exactly
once** and every consumer derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The characteristic decay of archive features is each list, each firing
path, and each counter re-implementing "where not archived" by hand
until one of them doesn't — centralize the predicate in the data-access
layer or a single shared filter, and treat a hand-written archived check
in a caller as a review flag.

## Flag versus status

Two encodings compete. A dedicated **archived-at timestamp** (absent =
live) is the stronger default: it is simultaneously the flag, the audit
fact (when), and — paired with an archived-by — the attribution; it
composes with an existing status enum instead of fighting it; and it
cannot collide with the entity's domain states. Folding "archived" into
a status enum that also holds domain states (draft, active, failed)
tangles two vocabularies — one describes what the entity *is doing*, the
other whether it *participates at all* — and every status transition
now has to reason about whether it may overwrite archival. Keep the
axes orthogonal: domain status on one field, existence state on
another.

## Restore into a world that changed

Restore is not "clear the flag." While the entity slept, the world moved:
its unique name may have been claimed, entities it referenced may have
been deleted, the vocabulary of its category may have migrated. Restore
therefore validates the entity against the *current* world through the
same door creation uses ([one door](../../../../_laws.md#one-validation-door)
— restore is a writer too), and resolves conflicts explicitly: name
collisions surfaced to the user rather than silently suffixed, dangling
outbound references repaired or reported, migrations applied so the
restored entity is current-shaped, not archaeology. The entity's
identity never changes across the round trip
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) —
restore that re-creates under a new identifier is not restore; it
orphans every inbound reference and every line of history the original
accumulated.

## The flag's two populations: who writes it, who honors it

A same-row existence flag — the archived-at timestamp above, or any column
standing in for it — is a **convention**, and a convention binds only the code
that has heard of it. Two populations have to be enumerated separately, and each
fails silently in the opposite direction from the other.

**The writers.** The flag is normally applied by overriding the single-entity
delete: the call that used to destroy a row now stamps the timestamp and
returns, and every existing caller keeps working. But that override sits on the
entity, and the entity is not the only thing that can issue a delete. A
set-level delete — the one issued against a query rather than an instance, which
most data-access layers offer and which bulk paths prefer for being an order of
magnitude faster — does not route through a per-entity override. It performs the
destruction the override exists to prevent, under the same verb, from a call
site that reads identically to the safe one. The result is a single method name
with two meanings, split by whether the caller happened to be holding an
instance or a query, and the destructive meaning is the one every bulk path
reaches for.

This is [one-validation-door](../../../../_laws.md#one-validation-door) applied
to the archive act itself: an override reachable through one door is not a
policy, it is a default for the callers who use that door. The enumeration to
run is every delete issued against this entity type, classified by whether it
passes through the override. Where the framework allows it, the honest fix is to
make the bypassing form unavailable — a guard each caller must remember to use
is a guard the codebase converges on not having
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The asymmetry is what makes this worth a pass of its own. The safe path is the
ceremonious one a reviewer reads carefully; the bypassing path is the one taken
by cleanup jobs, batch tools, and administrative surfaces — the code least
likely to be reviewed as a deletion and most likely to run against many rows at
once.

**The readers.** The default query path is taught to filter the flag, and that
is what makes archiving look complete from the application's side. Uniqueness is
not a query, and it was never taught anything. A unique index over a natural key
counts every row in the table, and an archived row is a row — so an archived
entity goes on holding its key for as long as it exists.

That inverts an assumption the previous section rests on. *Restore into a world
that changed* is written for the case where the sleeping entity's unique name
"may have been claimed," and specifies how restore resolves the collision. It
can only have been claimed if archiving released it. **Whether archiving
releases the key is a decision**, it is made by the uniqueness scope, and in the
common encoding it is made by default, silently, in the direction nobody chose:

- **The key stays held.** Restore is trivially safe, because nothing could take
  the name. The cost moves to the *creation* door and is paid by a different
  person: a user is told a name is taken and shown nothing holding it. That
  rejection is correct and unexplainable, which is worse than either honest
  outcome, and it is the same defect as the fabricated sentinel one subject over
  — a constraint answering on behalf of rows the product has promised are gone.
- **The key is released**, by scoping uniqueness to the live predicate: a partial
  index over unarchived rows, or the existence column as a component of the key.
  The live namespace then says what the product says. Restore inherits a real
  collision — which is precisely the case *restore into a world that changed*
  already specifies how to handle.

The second is the default worth choosing, and the argument is not that
collisions are pleasant. It is that the second option's failure mode is one this
technique has already been written for, while the first option's failure mode
surfaces to a user who has no vocabulary for it and no view that would explain
it.

The general form covers both halves and is the pass worth running once per
entity type: for every constraint, index, aggregate, quota and count over this
entity, ask whether it reads the flag. The default query manager does — that is
usually the only reader anyone verifies. Unique indexes, foreign-key targets,
totals shown to users, and quota arithmetic each need the question asked
separately, and every one that answers "no" is a place where archived silently
means present.

## Archive is not a delete queue — unless it explicitly is

Some products layer the two promises: archive now, hard-delete after a
retention window. The layering is legitimate but must be **stated on the
archive act itself** ("archived items are permanently deleted after N
days") — an archive that silently expires is a delete wearing archive's
reassurance. If a window exists, the sweep that enforces it is a named
reaper with the full ceremony of deletion (blast radius, survivors,
transition record), not a cleanup job that quietly does what no user
confirmed.

And when the product offers *both* archive and a deletion grace period,
**scheduled-for-deletion is its own axis, not a use of archive**. The
tempting implementation — flip the archived flag when a delete is
scheduled, clear it on cancel — fuses two independent facts, and the fuse
shows on cancellation: an entity that was archived *before* its deletion
was scheduled comes back live, because "cancel" cleared the flag it
borrowed. Cancelling a scheduled deletion must return the entity to its
exact prior existence state, which is only expressible if pending-deletion
is stored beside the archive fact rather than overloading it — the same
orthogonality argument as flag-versus-status, one axis further out.
