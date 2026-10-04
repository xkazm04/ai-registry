---
layer: technique
type: technique
subject: condition-tagged-line-tables
technique: line-table-schema
status: forged
laws: [declaring-an-input-is-not-consuming-it, law-and-check-share-one-source, compiling-is-not-wiring]
shared_with: []
use_when: [designing the data format writers fill with reactive lines, a generator will author rows for the table, a line was written and recorded and nobody can say whether it ever plays]
---

# Line table schema

The named concern: the shape of the data that holds reactive lines, so that writers can extend
it without a programmer, a selection engine can query it without interpretation, a generator
can fill it without inventing vocabulary, and a linter can prove things about it. The table is
the interface between the writing team and the game, and like any interface it is defined by
what it forbids as much as by what it carries.

## Two tables, not one

**The fact dictionary** declares every fact a criterion may test. Each fact has a name, a type
(flag, count, enumeration, number with its unit), a domain, an owner (the one system that writes
it), and a lifetime (the event, the scene, the race, the session, the save). A fact that has not
been written holds *unknown*, which is distinct from false and from zero. The dictionary is
short, changes rarely, and is owned by the people who own the systems.

**The line table** holds the rows. It is long, changes daily, and is owned by writers. Keeping
the two apart is what lets writers add a row without being able to add a fact — a row that
needs a fact the dictionary does not hold is a request to a system owner, surfaced as such,
rather than a new name invented in a cell and never written by anything.

## The row

A row carries, at minimum:

| Field | Holds |
| --- | --- |
| Row id | a stable identity that survives edits, reorders and renames |
| Event | the event this row answers, from a declared list |
| Speaker, addressee | who says it and to whom, by stable character id |
| Criteria | predicates over dictionary facts, all of which must hold |
| Tier | story-critical, relationship, situational or generic |
| Weight | a tie-breaker inside tier and count |
| Lines | one or more texts, each with its own stable line id |
| Budget | maximum length per line, in a stated unit |
| Repetition | draw rule, cooldown with its clock, once-only scope, sequence position |
| Max age | the oldest act this row may answer, with its clock |
| Writes | facts set when a line from this row plays |
| Follow-up | an event raised after the line, for answers and exchanges |
| Signal | the signal change that accompanies the line, if any |
| Key phrases | the distinctive words of each line, for the cross-pool phrase ledger |
| Cut-off | a short variant, or a mark that the line survives truncation |
| Status | draft, approved, localized, recorded |

Stable ids are the column most often left out and the one most expensive to retrofit. Recency
memory, once-only flags in save files, recordings and translations all point at a line by id;
a table keyed by row position or by text breaks all four the first time someone sorts it or
fixes a typo.

## The checks the schema makes possible

The schema exists so that a linter can answer questions nobody can answer by reading. Run on
every save of the table:

**Undeclared fact.** A criterion or write names a fact absent from the dictionary.

**Unread fact.** A fact in the dictionary that no criterion reads. It is written, it is
declared, it costs its owner something to maintain, and it governs nothing
([declaring-an-input-is-not-consuming-it](../../../../_laws.md#declaring-an-input-is-not-consuming-it)).
Report it at declaration, not when somebody wonders why their carefully tracked statistic never
changed a line.

**Domain violation.** A criterion tests a value outside the fact's domain — a count against a
negative number, an enumeration against a value that does not exist, usually a misspelling.

**Event without fallback, row that can never win, row whose criteria contradict.** The
selection checks, run statically. A row that cannot win was written, approved, translated and
perhaps recorded, and is content no situation reaches
([compiling-is-not-wiring](../../../../_laws.md#compiling-is-not-wiring)).

**Budget overrun and thin pool.** A line over its length budget; a row whose line count is
below the size its fire rate demands.

The limits the linter enforces — tier names, length budgets, minimum pool sizes — are read from
the same declared source the writers' guide quotes, never typed separately into the linter, so
that a change to the guide changes the check
([law-and-check-share-one-source](../../../../_laws.md#law-and-check-share-one-source)).

## Rows written by a generator

A table is an attractive target for generation because rows are independent. The schema is what
keeps generated rows honest. The generator receives the fact dictionary and the event list
verbatim and may reference only names in them; when it needs a fact that does not exist, it
proposes a dictionary row rather than inventing a criterion. Its rows pass the same linter as a
writer's, by a separate reader, before anyone reads the prose. A generator asked for lines tends
to write state lines, because state is what it can see in the prompt; asking for cause rows means
handing it the attribution facts and requiring each row to test at least one.

## Decision rules

- **When a row needs a fact the dictionary lacks, raise it to the fact's would-be owner**; never
  let a writer or a generator mint a fact in a cell.
- **When a line is created, give it an id that never changes**, and never key anything on row
  order or text.
- **When a fact is declared, name the one system that writes it and the lifetime it holds for.**
- **When the table is saved, lint it**, and attach each finding to the row that caused it.
- **When a limit appears in the writers' guide, the linter reads it from there.**
- **When the table is translated or recorded, carry the row's status per language**, so a line
  that changed after recording is visibly stale rather than silently mismatched with its audio.

## Evidence status

That lines belong in data writers can extend without code changes is the central claim of a
studio engineer's primary conference talk, rated high, and the dossier's proposed row shape
— speaker, trigger, conditions, weight, once flag, cooldown — is a design proposal built from
it, not a tested format. The key-phrase ledger comes from the dossier's own revision protocol.
The two-table split, stable ids, the unread-fact census, max age, writes-back and the linter's
single source are practitioner judgement. None of it has been tested in a played game for which
this subject was written.

## When not to use this

A game with a dozen reactive lines and one speaker does not need a fact dictionary and a linter;
a short list with conditions written inline is cheaper and as safe. The schema starts to pay
when several writers, several speakers or a generator write into the same table, because that
is when vocabulary drifts and rows stop being able to see each other.
