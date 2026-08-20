---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: retired-outranks-stale-status-precedence
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [rendering status badges on a candidate or analysis record, a record carries several status-like facts at once, deciding which state a list or filter keys on]
---

# Retired outranks stale: status precedence

A record accumulates status-like facts from several independent sources: this
analysis is superseded by a newer one; the document behind it was replaced; the
requisition was edited after the score; the requisition is on hold; the
candidate withdrew; the record was retired; the person's data was anonymised.
Each was added by a different feature, at a different time, for a good reason.

Rendered naively they fight. A badge row reading *stale · withdrawn* invites
the reader to conclude that a re-run will help. A list filtered on "stale"
returns retired records. A remedy is offered where no remedy exists.

The fix is a single, explicit precedence order, decided once and applied by
every surface — badges, list filters, sort orders, exports, notifications.

## Terminal outranks advisory

The organising principle is a two-class split.

**Terminal states** end the record's usefulness. Retired, deleted, withdrawn,
erased, anonymised, do-not-approach, hired elsewhere, requisition cancelled.
They have no remedy, and they are what the reader must see.

**Advisory states** modify a live record and suggest an action. Stale, scored
against an older requirement, superseded by a newer analysis, awaiting review,
low confidence. Every one of them implies *you could do something about this*.

An advisory state on a terminal record is not merely redundant — it is
misleading, because its entire communicative content is a remedy that must not
be offered. A retired record that is also stale is **retired**. The staleness is
not worth a pixel.

## A worked ordering

From strongest, and the order matters more than the exact vocabulary:

1. **Anonymised / erased.** A terminal *identity* state, not a lifecycle state.
   It outranks everything, it is never overridden, and no other status may be
   computed for the record — computing "stale" over an erased record means
   something is still reading the fields that were supposed to be gone.
2. **Retired / deleted.** The record is out of the working set.
3. **Candidate-side terminal.** Withdrew, declined, unreachable by their own
   request.
4. **Role-side terminal.** Requisition cancelled, filled, closed.
5. **Role-side blocking, non-terminal.** On hold, frozen — a live record whose
   process is paused, which is a fact about the role and must not read as a
   fact about the person.
6. **Superseded.** A newer analysis of the same document exists; this one is
   history.
7. **Stale.** Scored before the requirement's last material edit, or past an
   age horizon.
8. **Advisory quality flags.** Low confidence, partial extraction, degraded
   run.

Show the highest-ranked state as the record's state. Lower states may appear in
a detail view, where a reader has gone looking for the record's full history —
never in the summary position where they compete.

## Why one order, everywhere

The characteristic bug is not a wrong badge; it is *two surfaces disagreeing*.
A list computes precedence one way, a detail page another, an export a third,
and the same record reads as active in one place and retired in another. Then
someone acts on the wrong one.

So the precedence lives in one place, as data, and every surface asks it. This
also means the states themselves must be a stable vocabulary rather than
display strings: teams rename their columns, and nothing may derive meaning
from a label
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
A precedence table keyed on the words currently shown in an interface is one
rename away from silently reordering itself.

## The vocabulary is closed, and it keeps its severity order

Two consequences follow from having one precedence table, and both are easy to
get wrong in the interface.

A status filter or grouping control offers a **closed vocabulary** — the same
values the precedence table names — and it lists them in *severity* order,
worst first, rather than alphabetically. Severity is the only ordering that
carries information here; alphabetising a status list is sorting on the
accident of a translation.

And the control offers only the values **actually present** in the data in
front of the reader. A filter that can return zero rows for a state nobody
holds teaches its user that the filter is broken. This costs one pass over the
rows and removes an entire class of "the tool showed me nothing" reports.

## Decision rules

- Terminal always outranks advisory. No exceptions, no "but it's useful to
  know".
- The highest state is what the summary shows, what filters key on, and what
  sorts group by.
- **Actions follow the displayed state.** If the record renders as retired, the
  re-run action is absent — not present-and-disabled, and certainly not
  present-and-working. An affordance that contradicts the badge is worse than
  either alone.
- An unknown or unrecognised state resolves to the safest available reading —
  treat it as blocking, surface it for a human, and never quietly map it to
  active ([uncertainty resolves toward the
  candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- Never compose a status from several facts into invented prose. "Retired" is
  what the record holds; "no longer suitable" is not
  ([say only what the record
  holds](../../_laws.md#say-only-what-the-record-holds)).
- Anonymised is not a badge to be styled alongside the others. It is the
  absence of a subject, and its rendering should make clear that there is no
  person here to act on.

## The staleness vocabulary needs its own reasons

Within the advisory class, "stale" is not one state. A record may be stale
because a newer analysis of the same document exists, because the requirement
was edited after the score, or because the instrument changed. These carry
different remedies, so they are separate values in the vocabulary rather than
one flag with a tooltip. A single "stale" badge covering three causes means the
recruiter cannot tell whether to re-run, to re-read, or to ignore it — and the
one they cannot detect at all is the fourth cause, the person themselves having
moved on, which no badge will ever show.

## When not to use it

Do not apply precedence to an audit or history view. History shows what was
true at a time, including advisory states on records that later went terminal;
collapsing it to the current strongest state destroys the only evidence of what
a recruiter was shown when they decided.

Do not use precedence to hide a terminal state from a reader entitled to it.
Precedence orders what is *most* important, not what is permitted — access
control is a separate concern and answering it with badge ordering produces a
system where the wrong reader sees the wrong thing whenever a new state is
added.

And do not extend the ladder indefinitely. A precedence order with thirty
entries is one nobody can hold, and its lower half will be implemented
differently in every surface. Keep the terminal class small and explicit, keep
the advisory class merely well-named, and resist the urge to rank the last
three.
