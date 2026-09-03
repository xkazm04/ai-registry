---
layer: technique
type: technique
subject: settings
technique: applied-defaults-ledger
status: forged
laws: [unknown-is-not-a-value, identity-survives-reuse]
shared_with: []
use_when: [a default the user deleted comes back after every upgrade, shipping a new default entry into a collection users already edited, deciding between a settings schema version and something simpler, a stored collection cannot say whether an entry is missing because the user removed it or because their build never offered it, renaming a shipped default and discovering it breaks every installation]
---

# Applied-defaults ledger

The rest of this subject treats a default as a constant behind a typed door:
absent means "use the declared value", the store never holds the default as a
row, and a release that changes the default reaches every installation that
never expressed a preference ([typed-accessors](./typed-accessors.md)). That
model breaks on one kind of key, and it breaks in a way the subject's own
signature failure predicts: a **collection of shipped entries that the user
may edit individually**. Keyboard bindings, default filters, starter
templates, a built-in list of quick actions. Each entry is a row the user can
rebind, edit, or delete, so the rows have to be stored; and once they are
stored, the absence of one of them means two different things that look
identical: *the user removed it*, or *this build never shipped it*.

A store that cannot tell those apart fails in one of two directions. Re-apply
the shipped set on every boot and every deleted default resurrects on the next
launch, forever. Apply the shipped set only on first run and a default added
in a later release never reaches anyone who installed before it - the
persisted-defaults freeze the subject already refuses. Both are
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
row level: an absent row rendered as a definite claim about the user's intent.

## The mechanism: record application, not values

The store keeps, beside the collection, a **ledger of the names of the
defaults that have already been applied to this installation**. Every shipped
default carries a stable name, minted once. On load:

1. Read the ledger.
2. For every default the build ships whose name is *not* in the ledger, add
   the entry to the collection and add the name to the ledger.
3. For every default whose name *is* in the ledger, do nothing - not check,
   not repair, not compare. The entry may be present, edited, or gone, and
   all three are the user's business.
4. If the ledger grew, persist the collection and the ledger together.

The ledger records that an application *happened*, never what the value was
or is. That single choice buys all three properties at once. A deleted
default stays deleted, because its name is in the ledger and step 3 never
looks for it again. A new default reaches every installation, because its
name is in nobody's ledger until the first boot that ships it. A user's edit
is never overwritten, because the procedure never reads the user's rows. This
is also the standard shape for one-shot data seeds in migration frameworks -
a table of seed names that have run - reached there for the same reason: a
seed re-run against edited data is destruction, and a seed skipped is a gap.

## Why not a version number

The obvious alternative is the one
[persistence-and-migration](../../../../client-architecture/client-state/techniques/persistence-and-migration.md)
prescribes for persisted shapes: a schema version inside the payload and an
ordered chain of steps, each transforming version N into N+1. It is the right
tool for its problem and the wrong tool for this one, and the difference is
what the step would have to know.

A migration step transforms *what is there*. A step that ships a new default
into a user-edited collection cannot be written as a transform, because the
correct output depends on a fact the payload does not carry: did this user
delete the entry the step is about to add? The step either overwrites
(destroying an edit) or checks for presence (resurrecting a deletion) - the
same two failure directions, now with a version number attached. The chain
also imposes an ordering the problem does not have: defaults are independent,
and a build that ships defaults A and C but not B has to invent a version for
a state no release produced. The ledger is a set, not a sequence; membership
is the whole state, and it composes across builds and channels without anyone
assigning numbers.

## The decision rule

> When a shipped default is an *entry in a user-editable collection*, so that
> its absence cannot distinguish the user's deletion from a build that never
> offered it, keep a ledger of applied default names; at load, apply only the
> unrecorded ones and never revisit the recorded ones. When the change is to
> the *shape* of what the user wrote - a field renamed, a value re-encoded, a
> row split in two - use a version chain, because that is a transform over
> existing data and a ledger cannot express one.

The two mechanisms coexist in one store without conflict: the version chain
owns shape, the ledger owns membership. A collection can carry both. What must
not happen is the ledger being asked to do the chain's job - "apply default
set v7, which also rewrites every existing row's format" - because the rows it
would rewrite are the rows it promised never to read.

## The cost: names are permanent

The ledger keys on the default's name, so the name is the default's identity
and it must survive every later release
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Rename a shipped default and every installation's ledger lacks the new name;
step 2 adds it, and the user now has the old entry (possibly edited) and the
new one, both bound. The tree this was read from documents the consequence in
one sentence: renaming a default is not possible, because it would be
recreated for everyone. The honest mechanism for a rename is a *new* default
under the new name plus a **tombstone**: the old name is recorded in the
ledger as applied on every installation that lacks it, without adding a row,
so the old entry is neither resurrected nor removed. The old name then stays
in the ledger forever - a retired default has no reaper, and a ledger that
prunes names it no longer ships re-opens the resurrection it exists to close.

Two smaller obligations follow. Names are unique across the shipped set, and
a collision is a build-time check. And the ledger and the collection persist
in one write: a ledger that says "applied" beside a collection lacking the
row has manufactured a deletion the user never performed.

## Boundaries

- **A scalar default is not a ledger case.** One key, one constant: never
  write it to the store, and the subject's absence-is-information rule does
  the work. The ledger begins where absence stopped being informative.
- **A default that follows a live source** is
  [inherited-default-override](./inherited-default-override.md); its row's
  presence means "detached", not "applied", and a ledger would misread it.
- **Reset to defaults** is the one operation that reads the ledger the other
  way: clear the ledger, clear the collection, and let the next load apply
  everything. A reset that clears the collection but keeps the ledger produces
  an empty collection that nothing will ever refill.
- **The ledger says nothing about removals.** A default the product no
  longer ships stays wherever the user's collection has it; retiring it is a
  warning at load naming the dead entry, then a deliberate user act. The
  ledger is not a licence to delete.

## Testing for the property

Three fixtures, each a stored collection plus a ledger, each run through one
load against a build that ships a known default set:

- **Deleted stays deleted.** Ledger contains the name, collection lacks the
  row. After load the row is still absent.
- **New reaches everyone.** Ledger lacks a name the build ships. After load
  the row is present and the ledger contains the name.
- **Edited stays edited.** Ledger contains the name, collection holds a row
  under that name with a user-changed value. After load the value is
  unchanged, byte for byte.

A fourth guards the cost: rename a default in the shipped set and assert the
build fails or a tombstone is declared. A store that passes the first three
and not the fourth is one refactor away from losing the mechanism.

## When a replay already owns the property

The ledger earns its place only where the stored values are the user's to
change. A store whose migrations are idempotent replays over *structure* - a
column added if absent, an index created if missing, a foreign key repointed
when its stored DDL still names the old table - already has the "new reaches
everyone" property without a ledger, and has something the ledger cannot give:
a hand-edited or hand-restored file is re-checked on every boot and healed,
where a ledger would read its own "applied" entry and skip the check. Tested
against such a tree on 2026-09-03, the ledger came out not-better on every
structural case; the one shape it improved was a user-overridable default set,
which that tree did not ship. So the rule has a precondition worth stating
before the mechanism: **the ledger is for shipped sets of values the user may
edit or delete. For structure, keep the replay.** A store that has both keeps
both, and does not let the ledger's "applied" stand in for the replay's
re-check.
