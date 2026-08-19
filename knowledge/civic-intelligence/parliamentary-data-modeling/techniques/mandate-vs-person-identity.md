---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: mandate-vs-person-identity
status: forged
laws: [missing-is-not-zero, non-partisan-symmetry]
shared_with: []
use_when: [linking votes or absences to people, scoring per-member activity, handling replacement and never-seated members]
---

# Mandate vs person identity

A mandate is a seat-holding: one person, in one term, elected from one
region on one list, for some sub-interval of the term. It is a distinct
entity from the person, with its own id — and most publishers' event tables
(ballots, excuses, contact records) reference the **mandate id**, not the
person id. The technique is to keep both entities, map between them through
the mandate table, and treat every place where the two could be conflated as
a defect with a name.

## Why the split is load-bearing

- **One human, many mandates.** A veteran member has one person row and one
  mandate row per term served. Career questions aggregate over mandates;
  term questions select one. A store keyed on person-per-term duplicates
  the human; a store keyed on person-only loses the term.
- **One seat, many humans.** When a member resigns or dies, the next
  candidate on the list is seated — a *new mandate*, same term, different
  person. Ballots cast before and after the handover belong to different
  mandate ids; a person-keyed vote table would need the handover date in
  every query and would still get the handover day wrong.
- **The event tables already chose.** Fighting the publisher's referencing
  scheme (re-keying ballots to persons at ingest) throws away the exact
  information that makes replacements and handovers correct. Keep the
  mandate id on the event; resolve to person through the mandate table when
  a query needs the human.

## Phantom and partial mandates are structural, not behavioral

The mandate table contains rows that never correspond to activity, and
per-person metrics must classify them before scoring:

- **Never-seated mandates** — elected, then declined or immediately
  resigned (typically to take an executive post). Zero ballots, zero
  committee seats. Per [missing-is-not-zero](../../_laws.md#missing-is-not-zero),
  this is an empty coverage cell, not a work ethic of zero; a ranking that
  lets a declined mandate occupy a "least active member" slot has fabricated
  a finding. The condition is deterministically detectable — no
  participation and no memberships — and should be pre-filtered with an
  explicit reason code before any human or model review spends attention on
  it.
- **Replacement mandates** — seated for a fraction of the term. Every
  volume metric (speeches, sponsored bills, attendance) must be read
  against the mandate's actual window, or normalized to it, or the member
  is penalized for arithmetic.
- **Role-window mismatches** — a member who took a government office or a
  chamber leadership post mid-term shows depressed floor activity for the
  remainder. The low number is an artifact of the scoring window crossing a
  role boundary, not a one-sided work profile. Detect it from the office
  windows (see [office-vs-plain-membership](office-vs-plain-membership.md))
  and tag it structurally.

All three classifications must run over the whole population by the same
deterministic rule, per
[non-partisan-symmetry](../../_laws.md#non-partisan-symmetry) — an exemption
applied by hand to one prominent member and not to an obscure one is an
editorial act wearing a data-cleaning costume. Give every mandate a tenure
class (full-term / replacement / departed / never-seated) as a stored,
closed-vocabulary property, computed once.

## Decision rules

- When an event table references mandates, store the mandate id verbatim;
  add person id only as a derived convenience column if at all.
- When displaying "this member's votes", aggregate over the person's
  mandates *in the selected scope* — never over all mandates silently.
- When a metric window is the term but a mandate's window is shorter,
  either normalize by the overlap or exclude with a stated reason; never
  publish the raw count against the full-term population.
- When two person rows might be the same human (publisher re-registration),
  do not merge on name; merge only on the publisher's own identity signal,
  and record the merge. Name matching mints false careers.

## When not to split

For a single-term, single-chamber analysis with no replacements in the data
and no cross-term ambitions, a person-keyed store is workable — but the
condition is fragile (one mid-term replacement breaks it) and the cost of
the mandate table is one join. Default to the split; collapse only in
throwaway analysis that will never publish a per-person claim.
