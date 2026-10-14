---
layer: technique
type: technique
subject: agent-memory
technique: scope-before-similarity
status: forged
laws: [one-validation-door, derivation-names-recomputation]
shared_with: []
use_when: [a compaction or reflection pass clusters memories by similarity, a distiller or consolidation pass chooses its input window, one store holds several projects or private scratch beside shared items, a rollup or merged item is written with a scope field, a merge or supersede accepts a member list from a caller, the test fixtures for a maintenance pass all share one scope, a write-time dedup recalls candidates from the current session while search reads across sessions]
applied: code
ab_verdict: better
---

# Scope before similarity

A maintenance pass groups memories because they look alike: compaction builds families,
consolidation looks for the item a new one duplicates, a distiller reads a window of
episodes and writes one belief from them. Every one of those groupings is computed by a
similarity measure, and **similarity is not an equivalence relation over ownership.** Two
notes can be near-identical and belong to different projects, different teams, or one
author's private scratch and the shared store. A clustering pass crosses every boundary its
measure does not encode, and a text measure encodes none.

The read side of this is already a rule: a lane that cannot express a scope predicate has it
re-imposed before anything reaches the consumer. The write side is where it goes missing,
because a maintenance pass runs under no request, holds no viewer, and is usually handed
"everything live in the tenant" as its working set. The tenant boundary is enforced. The
boundaries inside the tenant are not, because no query on this path ever names them.

## What a crossing does

- **A rollup files one scope's knowledge under another.** A family unioned across two
  projects gets one namespace, usually the first member's or the caller's. Recall in the other
  project stops finding its own material, because its members are now superseded by an item
  that lives elsewhere.
- **Private becomes shared.** A private scratch note folded into a family the pass writes as
  shared is published to every reader of the store, and its original is superseded. The
  content leaked even if the supersede is reversible.
- **The owner of the merged item is a guess.** "All members should match" is an assumption,
  and a merge that copies the first member's scope turns the assumption into a record.
- **A destructive merge makes it permanent.** Where sources are deleted rather than marked
  superseded, the crossing cannot be undone, because the evidence of which scope each member
  came from is gone.

## The rule

> **Partition by ownership scope first, then measure similarity inside each partition. The
> write door re-checks that every member shares one scope, and the merged item inherits that
> scope from its members, never from the caller or from a default.**

Three parts, because each one fails alone:

1. **Partition before the measure.** The scope key is every field that decides who may read
   or delete an item inside the tenant: the namespace or project, the visibility, and for
   private items the author. A pair whose keys differ never joins, however alike the text.
   Filtering the input window to one scope does the same job for a distiller: a derived fact
   is built from one team's slice, not from the tenant's whole recent history with a scope
   stamped on afterwards.
2. **The door re-checks.** The clustering pass is not the only writer. A merge or apply call
   that accepts a member list from a caller has to resolve the members under the caller's own
   visibility, so another author's private item is "not found" exactly as it is in every read,
   and then refuse the whole write when the members span more than one scope. A comment or a
   header that says the scope was "validated upstream" describes a caller that exists today,
   not the door, per [one-validation-door](../../../../_laws.md#one-validation-door).
3. **The merged item inherits.** Its namespace, visibility and, for a private item, its author
   come from the members. A request field that disagrees is a refusal, not an override. A
   stored derivation whose scope cannot be recomputed from its members has no arbiter when the
   two disagree
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## The fixture tell

A suite whose every fixture sits in one scope cannot represent this defect. Omitted scope
fields, a single hard-coded "global" scope, or a mock that ignores the scope argument all
make the crossing unrepresentable, so the suite stays green on a pass that merges across
every boundary in the store. Test with at least:

- three similar items in one scope (the positive control: the family still forms);
- the same three split across two namespaces;
- two shared items and one private item;
- private items from two authors;
- a merge call naming members from two scopes, and one naming another author's private items.

Measured on one real reflection pass, the four crossing fixtures and two door fixtures were
all red before the change (6 of 6 crossings accepted, including a private note written into a
shared rollup) and all green after it, with the same-scope family still forming and the
project's full suite unchanged.

## Where the codebase already knows

The tell that a store has this defect is an asymmetry, not an absence. The same codebase often
scopes one similarity pass and not its sibling: the write-time duplicate check compares only
against items in the same namespace, while the batch rollup pass unions the whole tenant.
When one pass is scoped, check the others. When the reason given for the scoping is cost ("so
the candidate set is not the whole store"), it was scoped by accident, and the sibling pass
that had no cost pressure was not.

## Finer than the read is a crossing too

The rule has a mirror failure, and it is quieter. A pass partitioned by *more* than the scope
key never merges across a boundary; it never compares across one either. The read path is not
partitioned that way, so the reader is served both sides of a contradiction the pass could not
see.

The usual extra field is the conversation. A write-time duplicate check that recalls candidates
from the current session only is cheap, keeps its prompt small, and reads as isolation, while
search on the same store reads across every session the owner has had. A value restated in a
later session is then written beside the one it replaces: never updated, never superseded,
because nothing on the write path ever saw the old row. In one released engine the shared
candidate helper states both filters in one comment, cross-session for its search caller and
session-scoped for its dedup caller, and the reason given for the second is that extraction runs
per session. That is the asymmetry above, inherited rather than chosen.

Priced with no model on a simulated year of one user's work (176 facts, 73 state changes): a
pool partitioned by project and day reaches **0 of 73** changes, by project and week 3, by the
read scope all 73. Fifty-one of the old values were last stated more than thirty days before
they changed, because a value that does not change is not repeated. The replay that produced
those numbers ingests every arm as one conversation, so it could not show this until the
partition was made a variable: the fixture tell below, in the instrument that prices every
other design.

Two things decide what the miss costs:

- **It is a served-stale cost before it is an answered-stale one**
  ([stale-served-versus-stale-answered](./stale-served-versus-stale-answered.md)). A reader
  handed both values with their dates can still pick the newer; one handed bare text cannot.
- **A field may guard this path's delete without being a scope field.** The same engine
  filters the dedup's own delete by session, which is sound: its target list came from a
  session-scoped pool, so the guard matches the pool. The error is making that guard the pool.

So the key is exact, not a floor: every field that decides who may read or delete, and **no
field the read path ignores**. A conversation, a day, a batch or an import run is provenance.
Record it on the item, and never partition the comparison by it.

## When not to use it

- A store with one owner and one scope has nothing to partition.
- Promoting a pattern that recurs across scopes to a wider scope ("three projects hit the same
  failure") is a real operation, but it is a promotion that passes through governance and
  writes a new item in the wider scope. It is never a family that happened to span scopes (see
  [owner-and-counterpart-scope](./owner-and-counterpart-scope.md)).
- Scope is not trust grade. Items from different trust grades in one scope still must not be
  compacted together ([rollup-compaction](./rollup-compaction.md)), but that is a separate check.

## Decision rules

- Name the scope key before writing the pass: every field that decides read or delete rights
  inside the tenant.
- Union or compare only pairs with equal keys. Scope a distiller's input window by the same key.
- At the merge door, resolve members under the caller's visibility and refuse a member list
  that spans more than one key.
- Derive the merged item's scope from its members. Refuse a request scope that disagrees.
- Keep merged members recoverable (superseded, not deleted), so a crossing that slipped through
  can be undone.
- Seed tests with at least two scopes. A single-scope suite passes on the defect.
- Partition the comparison by the read scope's fields and nothing finer. Check what the search
  caller filters by, and match it; a session, a day or a batch is provenance.
- Seed one value stated in one session and changed in a later one. A single-session suite
  cannot represent the miss.
