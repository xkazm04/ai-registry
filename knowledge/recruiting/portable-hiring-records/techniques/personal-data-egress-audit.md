---
layer: technique
type: technique
subject: portable-hiring-records
technique: personal-data-egress-audit
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
use_when: [building a bulk export of candidate data, adding a new entity to an existing export, answering whose personal data left the system, gating who may take a full organisation export]
shared_with: []
---

# Personal-data egress audit

## The concern

A full organisation export is the largest personal-data movement a hiring
product performs. Every candidate who ever applied, their contact details,
their documents, their interview transcripts, an automated reading of their
career, and the decisions made about them — in one file, on a laptop,
permanently outside every control you have. Once it is taken, retention
policies do not reach it, erasure requests cannot follow it, and access
controls no longer apply to it.

The engineering framing — a download button on an administrative screen —
is the wrong gravity by an order of magnitude. The right framing is a data
transfer to a third party, because that is what it becomes the moment the file
lands. The question this technique exists to make answerable is the one you
will eventually be asked in earnest, usually under time pressure: **whose data
left this system, when, and who has it?**

## The procedure

### Scope by manifest, and fail closed

The set of entities that may leave is an **explicit enumerated manifest**,
authored deliberately, reviewed like a schema change. Not "all tables", not
"everything except a denylist".

The distinction is structural, not stylistic. Under an exclusion model, a new
table added for a new feature is inside the export the day it ships, and
nobody decided that. Under a manifest, it is outside until someone adds it,
and adding it is a moment where a person asks what is in it.

Then make the manifest enforce itself: **an entity nobody has classified must
fail, not ride along.** A coverage check that enumerates every entity in the
store and asserts each is either listed for export or explicitly marked
excluded — with a reason — turns "we forgot to consider that table" from an
invisible leak into a broken build. Without it, the manifest degrades to
documentation, which is to say to nothing. An unclassified entity is missing
evidence, not permission
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

### Double-gate the authority

Export authority is not ordinary administrative authority. A person who can
edit a requisition, move a candidate, or manage a board should not thereby be
able to walk out with the candidate database. Require two distinct things:

- **A permission that exists only for this** — separately granted, separately
  auditable, and revocable without removing someone's ability to do their job.
- **An explicit confirmation of what is about to leave** — scope, entity
  kinds, and the count of *people* affected, stated before the action, not
  after. "Four thousand and eleven candidate records, including contact
  details and documents" is a sentence that stops an unconsidered click. "12
  tables" is not.

### Record the egress independently of the data

The audit record of an export must survive independently of the export itself
and of the records it covered — including a subsequent erasure of the people
inside it. It names:

- **Who** — the authenticated actor, server-derived, never accepted from the
  caller.
- **When** — sealed at the moment, from a clock the actor does not control.
- **What scope** — organisation, entity kinds, any filter applied.
- **How many people** — the count of distinct data subjects, not the count of
  rows. Rows are an engineering number; people are the number that matters
  when you must notify them.
- **What it did not include** — the entity kinds excluded, so a later reader
  can tell a scoped export from a full one without re-deriving the manifest of
  the day.
- **Where it went**, if the destination is known — a counterparty connection,
  a storage location, or "downloaded by the operator" as an honest answer.

**File a per-subject egress on that subject's own timeline.** An aggregate
export log answers "how many exports happened". A record filed on the affected
person's own immutable history answers the question that actually matters
during an incident: *who looked at this candidate, and when.* It also makes a
slow harvest — one record at a time, over weeks, each one individually
unremarkable — visible as a pattern on the people it touched, which no
aggregate counter would ever surface.

Keep that per-subject marker deliberately light: the record's schema version
and which sensitive parts were included, and nothing more. Never store the
payload itself in the audit trail. An audit store that
accumulates copies of full candidate exports has become the largest liability
in the system and is the one place retention rules are hardest to apply.

## The decision rules

- **When an entity is not on the manifest, it does not export, even where a
  caller asks for it.** The request parameter selects a subset of the
  manifest; it never extends it.
- **When the coverage check fails, the export fails.** Not a warning. A
  warning on a personal-data boundary is an unread log line by the second
  week.
- **When an export is scoped, say so in the export itself and in the audit.**
  A partial export read later as complete produces a false negative about
  whether a person's data was in it — and that is the exact question an
  incident asks.
- **When the actor cannot be resolved to a named person, refuse the export.**
  Unlike a hiring decision, where *not identified* is an honest state to
  record, an egress has a live actor by construction: somebody is holding the
  session. An unattributable export is a broken authentication path, and
  [every decision names its actor](../../_laws.md#every-decision-names-its-actor)
  is at its strictest where the action is irreversible.
- **When the export includes people under an erasure request or past their
  retention date, it must not run.** The consent-and-retention discipline owns
  which those are; this technique's obligation is to *ask* rather than to
  export first and reconcile later, because there is no reconciling afterwards.
- **Report what left in the language of people.** An export summary that
  counts rows and tables understates the event to the only person in a
  position to stop it.

## The read-back

An egress record nobody can query is not an audit. Ship the read path with the
write path: a surface where an operator can see every export taken from their
organisation, by whom, covering how many people, in what period. Two things
follow from having it. The organisation can answer a regulator's or a
candidate's question without an engineer. And the existence of a visible
history changes behaviour — an export that will appear on a screen a colleague
reads is taken more thoughtfully than one that disappears into a log.

## When not to use it

- **A single candidate's own data, provided to them on request**, is a
  different act with a different lawful basis and different gating. It should
  still be recorded, but the double-gate is wrong: a person's access to their
  own record must not be obstructed by an administrative permission.
- **An internal query by an engineer under break-glass access** is governed by
  a different control — privileged-access review — and should not be routed
  through the product's export path just to be logged. Route it through its
  own, with its own approval.
- **Aggregate, non-identifying output** — a funnel count, a benchmark, a chart
  — is not an egress of personal data and does not need this ceremony,
  provided the aggregation genuinely cannot be reversed. That proviso is a
  real threshold and a small cohort fails it; where the numbers are small
  enough to identify someone, it is an egress wearing a chart.
