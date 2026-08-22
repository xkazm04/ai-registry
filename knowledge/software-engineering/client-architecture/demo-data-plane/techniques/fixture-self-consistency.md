---
layer: technique
type: technique
subject: demo-data-plane
technique: fixture-self-consistency
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [two demo screens disagree about the same entity, adding demo data for a new surface, a header total does not add up from the rows beneath it]
---

# Fixture self-consistency

Every fixture in the demo world **projects from one source**. There is a single
declaration of the entities the product is about, and every list, chart, detail
view, aggregate and count is derived from it. Nothing is re-declared anywhere,
ever.

A fixture set that contradicts itself is worse than no fixture set at all. An
empty product is honest about being empty; an incoherent one asks the viewer to
believe in a world and then withdraws it a screen at a time, and the viewer's
conclusion is not "the demo data is sloppy" — it is "this product's numbers do
not agree with each other."

## The root, and the projections

**The root** is one declaration of the world's primary entities: the accounts,
the people, the devices, the documents, the projects — whatever the product's
nouns are. It holds identity, names, relationships, and the attributes that more
than one surface needs. It is the authority for the demo world's vocabulary
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)).

**A projection** is any fixture computed from the root. The activity series is a
fold over the roster. The detail page's payload is a lookup by identifier. The
summary tiles are aggregates over the same rows the table renders. The
notification list references entities that exist. The search index is built from
the root's names.

Each projection module states, at the top, that it projects — naming what it
derives from and what recomputes it, so that a contributor arriving to add a
screen learns the rule from the file they are already in rather than from a
convention nobody told them
([_laws: derivation-names-recomputation_](../../../_laws.md#derivation-names-recomputation)).
The single most useful sentence a demo fixture file can carry is *the roster is
not re-declared here; it is projected from the root*, because the failure this
technique prevents is committed by someone who did not know the root existed.

## Identity is minted once

An entity's identifier is created in the root and carried by every projection.
Never derived from position in an array, never from a display name, never
regenerated per module
([_laws: identity-survives-reuse_](../../../_laws.md#identity-survives-reuse)).

The operations that break the alternatives are the ordinary ones. Someone sorts
the roster differently for a screen where alphabetical reads better, and every
index-keyed projection now points at the wrong entity. Someone fixes a typo in a
display name, and the name-keyed lookups silently return nothing — which renders
as an empty detail page for one of the demo's entities, discovered by whoever is
demonstrating it.

Mint the identifiers through one small helper, and have that helper **mark them
as fabricated** — a fixed affix on every demo identifier, so the string itself
says what it is. Identifiers travel further than any other fixture value: into
logs, into support tickets, into a screenshot somebody pastes into a bug report,
into a question sent to whoever is on call. A self-labelling identifier answers
"is this real?" wherever it lands, without anyone having to trace it back. It is
the cheapest clause of the honesty contract, and it is the only one that keeps
working after the surface has been cropped out of the picture.

The consequence to design for: **navigation works.** Clicking any row in any
list reaches a detail view that exists, describes the entity the row named, and
links onward to things that also exist. A demo where one click in five reaches a
dead end is a demo the presenter learns to avoid clicking, and a presenter
visibly avoiding clicks is the worst outcome the surface can produce.

## The three coherence checks

Three properties are worth asserting mechanically, because all three fail
silently and all three are what a viewer notices:

1. **Referential closure.** Every identifier referenced by any projection exists
   in the root. This is a test over the fixture set, runs in milliseconds, and
   catches the dead-end click before a human does.
2. **Aggregate agreement.** Any total, count or average shown beside a
   collection is computed from that collection, not typed alongside it. A
   hand-written header total is a claim that will be false the first time
   somebody adds a row — and it will be false in the most damaging possible
   way, since a viewer who bothers to add up the visible rows and gets a
   different answer has found the product lying about arithmetic. The rule
   extends to *generated* series, which is where it is usually missed: a trend
   line drawn under a headline figure must be centred on that figure and take
   its variation as noise around it, or the chart and the number above it make
   two different claims about the same quantity. Write the derivation down at
   the series — the figure it is centred on and where that figure comes from —
   because a bare centre value is indistinguishable from a taste decision and
   will drift away from the headline at the next edit.
3. **Temporal coherence.** Timestamps across the world make a consistent story:
   a record's creation precedes its updates, an activity series ends at the
   world's "now" rather than three months ago, a lifecycle's stages appear in
   order. Timestamps are the fixture attribute most often written by hand and
   the one where incoherence reads most clearly as carelessness.

## The world must be inhabitable, not tidy

A roster of ten identical, healthy, fully-populated rows certifies nothing about
the product and sells a version of it that does not exist. Build the awkward
cases into the root deliberately:

- the entity with no activity at all, so the empty state inside a populated
  world is exercised;
- the name long enough to wrap or truncate, so the layout is honest;
- the record missing its optional fields;
- the state that only occurs after something went wrong — the failed job, the
  expired credential, the disconnected device — because a monitoring product
  whose demo shows nothing but green is demonstrating the one situation in which
  it is not useful;
- enough volume on at least one collection to make pagination, sorting and
  filtering do something.

This is where the demand diverges sharply from a test fixture. A test asserts
one thing and wants the smallest world that supports the assertion. A demo is
read as a *representative sample of reality* by someone deciding whether the
product handles their situation, so the fixture's job is breadth: the shapes
they will recognise as their own.

## Scale of the root

Keep the root as small as it can be while remaining inhabitable — usually a
handful of entities per collection, with volume manufactured by projection where
a surface needs it. A hand-maintained root of two hundred rows stops being
maintained, and once it stops being maintained the coherence rules stop being
honoured, because nobody wants to hand-edit two hundred rows to add a field.

Where a surface genuinely needs many rows, the root declares the few that matter
by hand and the projection expands them — deterministically, from a seed — into
the population the surface needs. The hand-authored entities stay recognisable
and the generated ones stay coherent, because both come out of the same root.

## When not to use it

If the demo is a single screen with no navigation, no aggregates and no
cross-references, a locally declared fixture is fine and the root is
overhead. The technique earns its keep at the second surface, and the honest
moment to introduce it is when the second surface arrives — retrofitting a root
under four screens that each declared their own world is several times the work
of building it under two.
