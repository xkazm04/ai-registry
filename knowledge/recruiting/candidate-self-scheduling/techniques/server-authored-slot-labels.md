---
layer: technique
type: technique
subject: candidate-self-scheduling
technique: server-authored-slot-labels
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [persisting a candidate-chosen interview time, rendering a booking into an email or feed, reviewing a booking payload's fields]
---

# Server-authored slot labels

The human-readable form of a booked slot — "Tuesday 14 October, 10:00–10:45" —
is **output**, never **input**. It is re-derived on the server from the stored
instant and the invitation's formatting rules every time it is needed, and the
client's version of it is discarded on arrival rather than validated.

## Why the label is the dangerous field

A booking payload usually carries two things the client had no right to author:
the timestamp and its label. The timestamp is the obvious one and gets the
attention. The label is the one that actually hurts, for three reasons.

- **It has a delivery mechanism attached.** A stored label is rendered into a
  confirmation message to the candidate, an interviewer's calendar invitation,
  and a recruiter's activity feed. A field that flows unaltered from an
  unauthenticated stranger into three internal surfaces is not a display string;
  it is a publishing channel. Escaping at render is necessary and insufficient —
  a correctly escaped lie is still a lie in the record.
- **It can disagree with the timestamp.** Nothing forces a transported label to
  describe the transported instant. A payload can book 09:00 and label it 15:00,
  and every human downstream reads the label. The two fields will diverge —
  through malice, through a stale tab, or through a client that formatted in the
  wrong zone — and when they do, the system has two answers to "when is this
  interview" and no rule for which one wins.
- **It is a hiring record.** The label is read months later as evidence of what
  was offered and agreed. A record about a person must say only what the system
  itself established.

Re-derivation makes all three impossible at once, at the cost of a formatting
call. That is the cheapest security control in this subject.

## Procedure

1. **Accept a choice, not a description.** The submit payload carries the
   invitation token and an identifier of the chosen slot — the instant, or an
   index into the offered grid. Nothing else about the slot is read, even if the
   client sends it.
2. **Re-generate the offered grid server-side** from the invitation (window,
   duration, anchor zone, business rules) and confirm the choice is a member of
   it (structural-slot-validation-on-submit).
3. **Compose the label from the matched slot**, using the same formatter the
   picker used, in the anchor zone, with the candidate's zone rendered alongside
   at display time.
4. **Persist the instant as the fact and the label as a cache**, and treat the
   label as recomputable at any moment. If a formatter changes, old labels
   change with it; that is correct, because the fact never moved.
5. **Never accept a label on a reschedule either.** Reschedules are the path
   people forget, and they carry the same payload shape.

## Decision rules

- **When a field in a candidate payload could have been computed server-side, do
  not accept it** — compute it. Duration, end time, day name, week number,
  formatted date, timezone abbreviation, interviewer name: all derived, none
  transported.
- **When a client-supplied string would reach any surface a human reads, treat
  it as content requiring a policy, not as metadata.** There are exactly two
  legitimate free-text fields in this flow: a candidate's proposed-times note
  and a withdrawal reason. Both are attributed to the candidate in the interface
  — shown as *their words*, never as the system's — and both are length-bounded.
- **When the stored label and the stored instant disagree, the instant wins and
  the label is regenerated**, without a repair job and without a migration: if
  the label is always derived on read, they cannot disagree in the first place.
- **When a downstream consumer asks for "the label", give it the derivation, not
  the column.** A cached label that any consumer may read directly will be read
  directly by a consumer that outlives the cache invalidation.

## Interaction with localization

Deriving the label rather than freezing it is also what makes the flow
translatable. A label frozen at booking time is frozen in the language and
formatting conventions of whichever surface composed it; the same record then
renders unreadably for the next reader, and there is no way to re-render it
without re-parsing prose. Store the structured facts — instant, duration, anchor
zone — and compose the sentence at render time, in the reader's language and
their date conventions.

## When not to use this

There is no case for accepting a client label in this flow. But two adjacent
things are legitimate and should not be confused with it:

- **A candidate's free-text note** attached to a proposal or a withdrawal is
  genuinely theirs and is meant to be stored verbatim. It is stored *as a quoted
  candidate statement*, attributed, bounded, and never interpolated into a
  system-voice sentence.
- **A recruiter-authored title** for the round ("Technical screen — backend") is
  authored inside the trust boundary by an accountable, named actor. It is still
  escaped at render, but its provenance is entirely different, and conflating
  the two is what leads teams to conclude that "labels are fine to accept".
