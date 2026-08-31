---
layer: application
type: application
subject: audit-logging
technique: two-clock-records
stack: sql
verified_on: 2026-08-31
verified_against: sql@0.4
applied: simulation
ab_verdict: better
proof: structural-only
---

# A bitemporal schema with one clock enforced and one clock empty (SQL, civic knowledge graph)

This tree is the confirming case rather than the corrective one: it ingests
public records from external publishers, so every fact is learned strictly
after it happened, and its authors reached the two-clock design independently.
That makes it useful for a different reason than a gap would be — it shows what
the technique looks like when a team already knows the rule, and where the
implementation still drifts.

## What the schema gets right

The graph's node and edge tables carry four time columns, split exactly along
the technique's line and documented in the migration itself:

- **`valid_from` / `valid_to`** — world time, when the fact was true;
- **`recorded_at` / `superseded_at`** — record time, when the store learned the
  version and when a newer one replaced it.

Superseded versions move to append-only history tables whose record-time span
is documented as half-open, `[recorded_at, superseded_at)`, "so at the exact
supersede instant the new version is visible and the old one is not" — the
boundary condition stated rather than left to whoever writes the next query.
The serving tables keep `superseded_at` null by definition, the history tables
have no primary key because one claim key legitimately has many versions, and
the writers are named and enumerated. The correction discipline this subject
already requires is fully present.

The migration is also honest about its own backfill: `default now()` on
`recorded_at` fills pre-existing rows with the migration instant, and the
comment says the honest reading is "recorded since this migration" rather than
pretending the older rows carry a real record time.

## The structural fact: enforcement splits along which clock the system owns

The finding this tree could not have been designed to produce is in the column
constraints, and it is visible without reading a single writer:

| clock | column | constraint |
| --- | --- | --- |
| record time | `recorded_at` | **`not null default now()`** |
| world time | `valid_from`, `valid_to` | **nullable, and unpopulated** |

The migration states it outright: the world-time columns exist so later work
can adopt them without another migration, and *"Writers do not populate these
yet."* So the store enforces the clock it **originates** — it cannot fail to
know when it learned something — and leaves optional the clock it must
**learn from the world**, which is the harder one and the one every ingestion
path would have to carry a value for.

That split is not a decision anyone recorded making; it is what happens when
one clock is available for free at the write site and the other has to be
parsed out of a source document. It is the same asymmetry the technique
predicts, appearing in a tree that designed *for* two clocks — which is
stronger evidence for the rule than a single-clock tree would have been, since
a single-clock tree only shows that people forget.

The honest consequence: for every row written to date, the effective clock is
NULL, so the store is currently a well-designed bitemporal schema operating as
a single-clock ledger. It can reconstruct its history of belief exactly and
cannot reproduce a report about the world.

It gets the failure mode right that would have made this unrecoverable, though:
the unknown world time is stored as NULL rather than defaulted to the record
time ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
Because the rows say "unknown" instead of asserting a wrong instant, a later
backfill from the source documents is still possible. Had the schema defaulted
`valid_from` to `now()`, every row would be indistinguishable from a genuine
one and the data would be permanently unrecoverable.

## Three cases from this tree, under both policies

Walked as reasoning, not measured — this is a simulation and is labelled as one.

1. **A recorded vote.** The vote table carries its own world-time column, so
   "how did this body vote on the 3rd" is answerable. The graph claims derived
   from it are not: their `valid_from` is null, so a question asked of the graph
   as of the 3rd silently answers from record time instead. Under policy B the
   two questions separate and both are answerable. **Prediction: B strictly
   better; A is not wrong, it is silently answering a different question.**
2. **A supersede.** A claim is revised because the publisher corrected the
   source. The history row records when the store learned both versions, which
   is enough for "what did we publish on the 3rd" — the accountability
   question, and the one this subject exists for. It is not enough for "when
   did the corrected fact become true", which is the analytical question.
   **Prediction: A sufficient for audit, insufficient for reporting** — and
   this is the case that shows the two clocks serve different readers rather
   than one being a better version of the other.
3. **The migration backfill.** Pre-existing rows carry the migration instant as
   record time and null world time. Under A this is the honest maximum. Under B
   nothing improves for those rows, because the information was never captured.
   **Prediction: no difference** — and it is the useful negative: adopting the
   second clock does not repair history, it only stops the loss going forward,
   which is the argument for adopting it early rather than when it is needed.

**What would falsify this:** if the ingestion sources do not actually publish a
usable world time — if the documents carry only a retrieval date — then
`valid_from` cannot be populated from them, the split above is a property of
the sources rather than of the write path, and the correct move is to record
that as a known limit rather than to plan a backfill. Checking one publisher's
document for an explicit effective date settles it, and was not done here.

## What this realization cannot do

Nothing here was measured: no query was run, no rows were counted, and the
claim that the world-time columns are unpopulated rests on the migration's own
comment rather than on a `count(*) where valid_from is not null`. That count is
the instrument that would promote this from `structural-only` to a real
before/after, and it needs a populated database this run did not open. The
technique's query-obligation half is also untested here — whether the read
paths *name* which clock they range over cannot be assessed while only one
clock has values in it.
