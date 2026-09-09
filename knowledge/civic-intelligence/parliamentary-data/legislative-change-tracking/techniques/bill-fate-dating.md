---
layer: technique
type: technique
subject: legislative-change-tracking
technique: bill-fate-dating
status: forged
laws: [disclose-never-repair, one-definition-one-import, incident-anchored-doctrine]
shared_with: []
use_when:
  - reporting a bill's current procedural state
  - dating procedural steps and statute publications
---

# Bill fate dating

A bill's fate is its terminal claim set: the procedural state it currently
holds ("first reading", "upper chamber", "enacted"), and — for bills that made
it — the publication as a numbered statute on a date. Every element is a
published assertion about the law, and this technique exists because the
register's raw material supports those assertions only after three disciplines
are applied: dates belong to their steps, ties break deterministically, and
impossible dates are refused rather than repaired.

## Historical milestone dates: earliest step at the strongest status

For a strongest-ever milestone summary, a bill often reaches
its strongest recorded status through several events. Two rules, in order:

1. **The reported date is the date of the earliest event at the strongest
   status the bill (or a bill-committee pair) reached.** Earliest is the
   defensible tie-break: it is the first moment the record demonstrably shows
   that status held. Any other tie-break — and in particular "last row wins",
   which is what naive `>=`-comparison loops silently implement — makes the
   published date a function of the order the publisher happened to write the
   dump. Measured on a live corpus, that is not theoretical: on the order of
   two hundred pairs had multiple rows at their strongest status, nearly all
   resolving to *different* dates, and at least one was live on the published
   surface with a nine-day discrepancy decided by file order.
2. **A weaker step's date is never borrowed.** If the strongest status has no
   dated event, the fate is reported *undated at that status* — "formally
   referred · on the day it was merely proposed" is a false claim about when
   the referral happened. Status and date are separate assertions; each must
   stand on its own evidence, and the surface renders the two side by side so
   an undated status is visible as such. A strictly stronger step brings its
   own date **including a null one** — arriving at a stronger status must
   overwrite the previous date with the stronger step's date even when that
   date is null, or the weaker date silently survives underneath the new
   status label.

Write the collapse so it is **deterministic under any input row order** —
that property, not elegance, is the acceptance test, and it is cheap to
verify by shuffling input in tests.

## Publication: refuse, keep, count

Enactment closes the loop with a statute number and a publication date, and
some adapters derive the citation year from an event date — which makes a broken date
uniquely dangerous: it corrupts a law number, not just a timestamp. Dumps
contain century typos, month thirteen, and literal "null" strings in date
fields. The discipline:

- **Two distinct checks, because they are two distinct findings.** First,
  calendar validity: do the digits form a real date at all (round-trip
  through a real calendar; reject the 31st of a 30-day month, reject
  two-digit years that a lenient date API would silently remap to another
  century). Second, plausibility: is it a date that could have *happened* —
  inside the era of the statute collection, and not in the future.
- **The plausibility ceiling is the retrieval day, not "now".** A
  publication is a past event relative to the dump that reports it; the
  ceiling travels with the rows, so re-rendering months later cannot change
  a verdict. Default the ceiling to the ingest clock (at ingest, the clock
  *is* the retrieval instant) and let tests and pinned-dump callers pass it
  explicitly.
- **The plausibility boundary is defined once and imported.** The same
  "could this date have happened" rule guards every date-bearing surface in
  a civic product; a second copy will drift and the two surfaces will
  disagree about which claims render.
- **A refused date voids the whole citation, keeps the rest, and is
  counted.** Leave statute number and publication date null together (a
  derived year without its required source date lacks support), keep the bill and its
  procedural state — those are independently attested — and increment a
  refusal counter that the ingest reports as a corpus total. The gap must be
  countable, not silent; the source keeps the blame.
- **Distinguish "no publication" from "refused publication".** A bill with
  empty publication fields has no publication evidenced by those fields (rows whose publication
  fields are empty or literal "null" are not publication events at all — in
  live data such rows turn out to be different event types entirely);
  a bill with a refused date has a publication the pipeline declined to
  cite. These are different facts and both differ from zero.
- **When several publication steps exist, classify their relationship.**
  First publication, correction and reprint are distinct. Do not let the latest
  date silently replace the original publication or imply supersession.

## Decision rules

- When the state vocabulary is a lookup chain (state id → state type →
  label), resolve through the chain and report unresolvable ids as unknown,
  never as the nearest label.
- When fate feeds ranking (e.g. collision triage by procedural velocity),
  rank on status strength, and use dates only where both sides have them —
  an undated status never loses to a dated weaker one.
- Record every refusal class with the incident that proved it (the typo'd
  century that once published a statute "of year 202" is the archetype) and
  keep the offending literal as a test fixture; a guard without its incident
  gets "simplified" away.

## When not to use it

Do not use fate dating to compute durations for legal effect — entry into
force is governed by the statute's own commencement provisions, not by the
publication date, and conflating them misstates when law binds. Do not
extend the earliest-at-strongest rule to *content* questions (which text
version is current) — text versioning follows the document trail, not the
status ladder. And do not backfill historical fates from a later dump's
current-state column: current state is a snapshot, and reconstructing "where
was this bill in month M" needs the event history, not today's summary
field.

## Current state and independent identifiers

Replay source-defined transitions for current state; a return, withdrawal or
revocation can invalidate a strongest-ever reading. Preserve unknown events and
ordering gaps rather than allowing an old known state to imply current certainty.
Reject only fields whose evidence fails: an independently validated collection
identifier can survive a missing publication date. Date plausibility limits are
event-specific; future scheduled steps are not past-publication events. A delayed
ingest must use the snapshot's retrieval date, not automatically its run clock.
