---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: source-turn-traceability
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a requirement is challenged and nobody knows where it came from, designing a review surface over an extracted brief, preparing a brief for an external review meeting]
---

# Source-turn traceability

Every requirement and every facet in the brief carries a pointer to the
numbered moment it came from: the turn in the intake transcript, or the edit
that introduced it. Not a session id — a *turn*. The difference is the whole
technique. "This came from the kickoff" is unfalsifiable and unhelpful; "this
came from turn 14" resolves to a sentence a human can read in three seconds and
either recognise or disown.

## Why the granularity has to be a turn

Three jobs depend on it, and all three fail at session granularity.

**Disowning an invented requirement.** The characteristic error of an
extracting intake is a requirement nobody asked for — an item carried over from
a template, or a plausible elaboration of something adjacent. The requestor
reviewing the brief sees a line that looks reasonable and has no way to check
it. With a turn pointer, checking is instant: they read what they said and
either confirm it or delete the row. Without it, review degenerates into
plausibility judgement, which invented requirements pass by construction.

**Defending a real one.** Months later, a rejected applicant, an internal
challenge, or a regulator asks why the role required a thing. "Because it was
in the brief" is circular. "Because the hiring manager said this, in these
words, at this point in the intake" is an account — the record holding what is
being said about it, per
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds).
A requirement whose origin cannot be named is not defensible, and it should not
be gating anyone.

**Attributing the actor.** A turn identifies who spoke — the requestor, the
interviewer, the extractor proposing and the requestor confirming. Briefs are
rarely single-author; a talent partner suggesting a requirement and a manager
accepting it are a different provenance from the manager raising it unprompted,
and only the turn-level pointer preserves the distinction, which is what
[every decision names its actor](../../_laws.md#every-decision-names-its-actor)
requires of a record this consequential.

## Both paths, or neither

An intake brief has two write paths and both must carry traceability:

- **The conversational path** — the extractor writes entries as the session
  runs, stamping each with the turn index it was extracted from.
- **The manual path** — a human adds or edits an entry in a review surface,
  and the entry is stamped with that edit event: who, when, and against which
  version.

Systems routinely instrument the first and forget the second, on the reasoning
that a human edit is self-evidently human. The result is a brief where the
extracted rows are auditable and the hand-added ones — the ones most likely to
carry a personal preference that would not survive scrutiny — are the anonymous
ones. Traceability on one path is worse than none, because it produces
confident audits that systematically miss the riskiest entries.

## Traceability is only real if it is reachable

A stored pointer that no surface resolves is bookkeeping. Three surfaces make
it operational:

- **Click-to-evidence.** Every entry in the review view is a link to its
  source moment, rendered in place. The cost of checking a line must be one
  click, or reviewers check nothing and approve everything.
- **A portable export.** Some review happens away from the tool — a panel
  meeting, a compliance conversation, an approval chain. A plain-text export
  of the brief with each entry's source excerpt inline lets the defence travel
  with the artifact. A brief that is only defensible while logged in is not
  defensible where it is actually challenged.
- **A visible unsourced state.** An entry with no resolvable source renders as
  unsourced rather than as ordinary. Imported items, migrated records and
  template carry-over all land here, and they are exactly the entries that
  most need a second look.

## Decision rules

- **When an entry is written, stamp it in the same operation.** Backfilling
  source turns after a session is reconstruction, and reconstruction of
  provenance is fabrication with a good motive.
- **When a turn is edited or the transcript is re-numbered, the pointer must
  survive** — reference turns by stable identity, not by position in a list
  that a later insertion shifts. A pointer that silently slides to a different
  sentence is worse than no pointer.
- **When an entry is confirmed at a later turn than it was extracted, keep
  both.** The origin explains where the idea came from; the confirmation is
  what upgraded its basis to stated, and a challenge may test either.
- **When a brief is promoted and frozen, freeze the pointers with it.** A
  decision is bound to the material it judged, per
  [a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged);
  a brief whose sources can still move afterwards cannot support that binding.
- **When an entry cannot be traced, it may be kept but not used as a gate.**
  Un-sourced content can inform search and conversation; it must not
  disqualify a person.

## When not to use this

- **On a spine scalar whose value is a schema default.** There is no source
  turn, and stamping one implies a moment that never happened; the `default`
  basis is the correct record.
- **Where the transcript itself must not be retained.** If the recording or
  transcript is deleted under a retention rule, keep an inline excerpt with
  each entry rather than a dangling pointer — the retention policy governs the
  raw material, but the brief still owes an account of itself. Pointers into a
  store that no longer holds the target are the worst of both outcomes.
