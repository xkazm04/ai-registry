---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: membership-window-modeling
status: forged
laws: [disclose-never-repair, missing-is-not-zero]
shared_with: []
use_when: [storing club or committee affiliation, choosing natural keys for dated relationship rows, answering "who was in X on date D"]
---

# Membership window modeling

Every affiliation in a legislature — club, committee, commission,
delegation, office — is a dated interval: a person joined a body at a
moment and left it at a moment, or has not left yet. The technique is to
store affiliation *only* as `[from, to)` windows, to choose natural keys
that include the window start, and to answer point-in-time questions by
interval containment against an index — never from a "current" column.

## Windows, not attributes

A `party` column on the person or mandate row is wrong by construction: it
answers "as of when?" with "as of the last ingest", which repaints history.
The window form answers every temporal question correctly with one
predicate: `from <= D AND (to IS NULL OR D < to)`. Rules:

- **Open end means current.** A null `to` is the live affiliation. Never
  backfill an artificial end date; the absence *is* the fact.
- **Half-open intervals.** Closing a window on the day the successor opens
  produces no gap and no overlap if ends are exclusive. Publishers vary;
  normalize to one convention at ingest and document it.
- **Same-body rejoin is normal.** A member leaves a committee and returns a
  year later — two rows, two windows. This forces the natural key to
  include the window start: person + body alone is not unique, and an
  upsert keyed on it silently merges the two stints into one, destroying a
  real resignation. Key on (person, body, kind, from) at minimum.
- **Sub-windows nest.** An office window (chair from March) sits inside a
  membership window (member from January). Both rows exist; neither
  substitutes for the other.

## Publisher time data is dirty; disclose it

Window columns in bulk exports carry the publisher's whole error surface:
end-before-start pairs, sentinel dates standing in for "unknown", duplicate
rows for one stint, timestamps whose precision silently varies (date-only
in old terms, date-hour in new ones). Per
[disclose-never-repair](../../_laws.md#disclose-never-repair), the rule is
uniform: an impossible window is suppressed and counted, never adjusted; a
sentinel becomes a null plus an explicit unknown flag, never a plausible
guess; a duplicate is eaten by the idempotent upsert and the eaten count is
surfaced as a validity metric. A repaired window is an invented fact about
when a real person held real power.

Precision variance deserves special respect: when one era of data carries
hour precision and another only days, a point-in-time query near a same-day
handover is genuinely ambiguous in the coarse era. Answer with the
ambiguity ("both memberships cover this date at day precision") rather than
picking one; per [missing-is-not-zero](../../_laws.md#missing-is-not-zero),
the unknowable sub-day ordering is a coverage fact, not a tiebreak
opportunity.

## Query discipline

- Point-in-time lookups run on an index over (body, from, to) or
  (person, from, to) — containment scans on an unindexed window column are
  the first thing to fall over at parliament scale.
- "Members of X during period P" is interval *overlap*, not containment;
  the two predicates differ and mixing them up drops everyone who joined
  or left inside P.
- A person can hold overlapping memberships in different bodies (always)
  and occasionally overlapping windows in one body from publisher error —
  the first is data, the second goes to the disclosure counter. Decide per
  body-type which overlaps are legal and validate at ingest, not in each
  consumer.

## When not to use windows

Facts that are genuinely instantaneous — a ballot, a speech, an excuse for
a sitting day — are points, not intervals, and get a timestamp, not a
window. The trap runs the other way: do not "windowize" point events into
synthetic presence ranges, and do not flatten real windows into points (a
join date without a leave date is half a fact). Model each fact in its own
native temporal shape and let queries relate them.
