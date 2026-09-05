---
layer: technique
type: technique
subject: audit-logging
technique: record-axis-predicate
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value, silent-state-is-ungoverned]
shared_with: []
use_when: [a ledger keeps two clocks but every read hard-codes now, adding an as-of parameter to reads over a two-clock store, a rewind must reach every table a read joins, deciding which write paths may ignore the record clock, a state that was rewritten in place has no record-clock column of its own]
---

# The record-axis predicate

[two-clock-records](./two-clock-records.md) settles the write side: store
when the fact held in the world and when this ledger held it, and make
every query name the clock it ranges over. This technique is the **read
side**, and it exists because the write side is routinely done and the read
side routinely is not. A store that has carried `recorded_at` and
`invalidated_at` on every row since its first migration can still be
unable to answer "what did we believe in March", because every read that
selects live rows says `invalidated_at IS NULL` — hard-coded, in dozens of
places, and each of them silently answers *now*.

The measured shape: one graph store had kept both clocks from the start,
and its read side rewound only the world clock. The filter appeared 26
times in one file and 54 times across the store. A fact corrected in March
was invisible at every slider position, and the state before the
correction could be reached only by opening the one entity that carried it.
Everything needed was on disk; nothing shipped could read it.

## One predicate per table, composed in one place

The record axis is a half-open interval on the row: it was held from
`recorded_at` until `invalidated_at`, open when the bound is null. The
predicate is therefore

    recorded_at <= T AND (invalidated_at IS NULL OR invalidated_at > T)

and the rule is that **it is written once, in one module, and every read
calls it.** No read site composes its own `invalidated_at` clause, ever.

The reason is a failure direction, and it is the one SQL is worst at. A
defence spread across read sites fails the moment one site is missed, and
a missed site does not error: the query is well-formed, it returns rows,
they are simply the wrong rows for the moment asked about. The compiler
that checks the application has no opinion about a string. In the same
store, making a column nullable had already produced exactly this class of
bug — a `<>` against a null selected nothing and raised nothing, and a
guard that read correctly in the host language ran silently empty. The
predicate goes in one place so that the place is the whole surface to
audit ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

**Count the sites before writing the predicate.** The count is the
argument: it tells the reader how many silent wrong answers the old shape
was one omission away from, and it is the number the test below is sized
against.

## Null means now, and the predicate degenerates

The parameter is optional, and the predicate is written so that an absent
moment collapses to the present:

    recorded_at <= coalesce($T, now())
    AND (invalidated_at IS NULL OR invalidated_at > coalesce($T, now()))

With `$T` null this is exactly `invalidated_at IS NULL` — no row is
invalidated later than now — so **one statement serves both replay and the
present**. Two statements, one for each, is the next place a filter goes
missing: the pair drifts, and the drift is invisible until someone rewinds.

The cost is real and worth naming. Wrapping a column in a function defeats
the index on it, and "now" is the path every ordinary read takes. Where a
read must join through a rewritten column (below), the measured store keeps
the raw column on the hot path and pays the function only when a moment is
actually supplied — replay is rare and may be slow; the present may not.

## Write paths keep the current-row guard

Confirming, rejecting, undoing, and deduplicating act on **the current
row**, and they keep the hard-coded `invalidated_at IS NULL`. This is not an
exception to the rule; it is the rule's boundary. A correction is never
made as of March. The predicate exists so that reads can ask about a
moment; a write that took a moment would be rewriting history under the
guise of reading it.

## Every table the read joins asks the same question with different columns

A rewound read is only as rewound as its least-rewound join. The graph read
selects facts, but it also joins derivations, open contradictions,
conflicts, documents, passages, and merges — and each has its own clock
columns with its own names. Each gets its own function in the same module,
because the question is the same even where the columns are not:

- a **derivation** was held from when it was derived until it was
  invalidated, so a rewound graph keeps the edges the engine had drawn *by
  then*, not today's conclusions;
- a **finding** (a contradiction, a conflict) was open from detection until
  its decision, with a row that was decided but never stamped treated as
  never open — draw one ghost edge too few rather than invent a March
  finding from today's rule;
- a **document** deleted by tombstone was present at every moment before
  its deletion, so its passages were live evidence then;
- a **passage** superseded by a re-parse was the current version until it
  was superseded.

A row that carries no clock of its own is the hard case, and the rule for
it is: **derive the record axis from the event ledger that rewrote it.**
A merge that rewrites subject ids in place leaves the row looking only as
it does after the merge; "whose fact was this in March" is in neither the
fact row nor the entity row. It is in the merge ledger — created, reverted,
and the arrays of what was moved — and that ledger's own two stamps give
the merged entity a clock. At a moment before the merge, the absorbed
entity grows back with its own facts; at a moment after the revert, it is
back again. The in-place rewrite was the design's economy; the ledger was
already the record; the predicate reads the second to undo the first.

## Two parameters, never one control

The world clock's parameter and the record clock's parameter stay
separate all the way out to the interface, exactly as two-clock-records
requires. Folded into one control they answer "the world in March as we
understand it now" with "the world in March as we understood it then", or
the reverse, and both look plausible on screen. The store's own change
feed already warns that mixing the two column pairs gives a quiet wrong
answer; mixing the two controls is that mistake one layer up
([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
a rewound answer without its moment is a number without its predicate).

## The test asserts both directions on a real store

No compile-time check can stand in for this one, so a database-backed test
asserts the three facts a rewind is made of:

- a retracted row is **absent** at `T = now`;
- the same row is **present** at a `T` before its invalidation;
- a row recorded after `T` is **absent** at `T`.

One test per table the module covers, and a test that must go red if a
read site composes its own clause — which is checked by turning one back
and watching. A green suite that never contained the negative proves the
harness runs, not that the predicate is used.

## Three absences that must not sound alike

A second tree, independent of the first, showed what the predicate leaves
unsaid once the moment comes from a person rather than a slider. A civic
ledger exposes "show me this record as we published it on that day" as a
query parameter over its provenance receipts, and keeps the rule in one
pure module that both of its surfaces read, so the two cannot disagree about
what a day is. Three of its rules belong beside the predicate:

- **The moment of a day is its end.** A reader citing the 3rd saw the last
  version published that day, so a day resolves to `23:59:59.999` of that
  day, never its midnight. Resolving to the start silently shows the
  previous day's record under the cited date.
- **A moment that does not parse is refused, not corrected.** A malformed
  day yields no moment; the surface says so and shows *today's* record
  explicitly labelled as today's. It never snaps to the nearest valid date
  and never falls back to now while implying then
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **"We do not know" is not "it had not changed".** A store that gained its
  record clock by migration stamped every earlier row with one epoch. Before
  that epoch the question is unanswerable, and *unanswerable* is its own
  state — distinct from *absent then* (we kept records that day and this one
  was not among them) and from *not replayable* (this family of derived
  figures is computed through loaders that cannot be run as of a day). The
  tree gives each its own state and its own sentence, and renders a
  historical version only for the one state that actually is one; every
  other state shows today's record and says it is today's.

The predicate answers present-or-absent at T. It cannot distinguish the
three absences on its own, and a surface that folds them into one "nothing
here" has told the reader a fact that the store does not hold.

## Boundaries

- **A full-text index holds one version.** A search engine's index over
  the current passages cannot be rewound by a filter; a timed search over
  it returns correct hits and misses the ones only history holds. Say so
  in the interface rather than filter and imply completeness. Giving the
  index versions is separate work, not a predicate.
- **Reads that ask "what changed" are the other axis.** A change feed
  between two record instants answers "what did we change our minds
  about"; the predicate answers "what did the world look like, as we held
  it then". They read the same columns and are not the same query.

## When not to use it

- **When the record is never consulted about the past** — two-clock-records'
  own exemption. Then the second clock has no readers, and a predicate
  nobody calls is a module nobody maintains.
- **When rows are never invalidated.** An append-only log of actions the
  system performed itself has equal clocks by construction; there is no
  interval to rewind.
