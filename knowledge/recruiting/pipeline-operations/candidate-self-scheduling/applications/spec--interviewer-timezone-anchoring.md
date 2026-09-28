---
layer: application
type: application
subject: candidate-self-scheduling
technique: interviewer-timezone-anchoring
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2026-12-28
source: IETF/RFC-5545+RFC-5546+RFC-9557+TC39/Temporal+IANA/tz-theory
---

# The anchor zone as the standards and the products write it

**Pin.** Retrieved 2026-09-28. RFC 5545, RFC 5546 and RFC 9557 as plain text
from `rfc-editor.org`. The TC39 Temporal proposal README and the MDN pages for
`Temporal.ZonedDateTime`. The tz database's `theory.html` from `data.iana.org`.
Product help pages from three scheduling vendors, named below because this is
the layer that may name them. Every quotation was matched against the fetched
text after drafting. The clock is three months, set by the vendor half; the
standards half would carry a year.

## The standards

**Store a zone name, never an offset or an abbreviation.** Confirmed three
ways. RFC 5545 §3.3.5 forbids offsets in a date-time: "The form of date and
time with UTC offset MUST NOT be used." A fixed time is "either UTC time or
local time with time zone reference" (FORM #2 or FORM #3, the `TZID` form).
RFC 9557 §1.2 says of offset zones: "use of offset time zones is strongly
discouraged". The tz database's theory page on abbreviations: "these
abbreviations are ambiguous in practice: e.g., CST means one thing in China and
something else in North America". The technique's step 1, and its new line
that an abbreviation is not a zone name, are these sentences.

**The wall clock is the agreement, and the instant can drift from it.** This is
the source of the technique's "store more than the instant" condition. RFC 9557
§3.4: "a calendar application could store an IXDTF string representing a
far-future meeting ... If that time zone's definition is subsequently changed
to abolish daylight saving time, IXDTF strings that were originally consistent
may now be inconsistent." With the critical flag on the zone suffix, "an
application MUST act on the inconsistency". RFC 5545's FORM #3 stores a local
time plus a zone reference and resolves the instant when the value is read,
which is the same position from the other end. Both reject "store UTC only" for
a future event whose meaning is a local hour. The technique's rule (the anchor
wall clock wins, the instant is re-derived) is what acting on the
inconsistency means for an interview.

**Gaps and overlaps have a default, and the default is wrong for generation.**
RFC 5545 §3.3.5: for a local time that occurs twice, "the DATE-TIME value refers
to the first occurrence"; for one that does not occur, it "is interpreted using
the UTC offset before the gap in local times". Temporal's `ZonedDateTime`
defaults to `compatible`, which MDN describes as "Same behavior as Date: use
`later` for gaps and `earlier` for ambiguities". Both defaults shift a
non-existent 02:30 to 03:30. That is right for *reading* a stored value, and it
is why the technique's generation rule departs from it: a generator should ask
for `reject` ("Throw a `RangeError` whenever there is an ambiguity or a gap")
and skip the slot. Temporal is Stage 4 and ships in Firefox 139, Chrome 144 and
Node 26 (README, retrieved 2026-09-28). It is not in Safari's JavaScriptCore,
which keeps a hand-rolled offset correction alive in any candidate-facing code
that must run there.

**Reschedule, cancel and decline are three different messages.** RFC 5546 §1.4
gives the organizer `PUBLISH, REQUEST, ADD, CANCEL, DECLINECOUNTER` and the
attendee `REPLY, REFRESH, COUNTER`. A reschedule is a `REQUEST` with the same
`UID` and a greater `SEQUENCE` (§3.2.2.1). `CANCEL` "is sent by the "Organizer"
of the event" (§3.2.5). A `REPLY` is "used to respond (e.g., accept or decline)
to a "REQUEST"". The candidate's withdrawal is a decline, which the
withdraw-is-not-cancel technique now cites in plain words. `COUNTER` is the
standard's own propose-a-new-time message, from the attendee.

## The products

**The anchor is not always the interviewer, and the shipped rule is
location-first.** GoodTime's time-zone overview: "If hosting an onsite
interview: Interview time zone = Onsite time zone", and "If interview is
occurring remotely : Interview time zone = Candidate time zone", with the
scheduler's zone as the fallback. Its stated reason is display for the panel:
"it is valuable for interviewers to understand the time at which the candidate
is interviewing (especially if a candidate is interviewing either very late or
very early in their local time zone ...)". Each interviewer's availability is
still their own. This is the source of the technique's "place first" condition
and of its interviewer-side mirror render. Calendly shows availability "in
their local time" and recommends "locking the time zone to the event location"
for in-person events. Greenhouse renders each viewer's own zone.

**No product seen shows the candidate both zones.** The dual render stays a
design position of this subject. It is not refuted, and no one has measured it.

## What is not settled

- Whether the daylight-saving failure still bites shipped products. Vendors
  state that they adjust automatically. The only incident reports found are from
  general calendars, around the weeks when regions change clocks on different
  dates, and they were seen as search snippets only.
- Whether candidates misread single-zone pickers often enough to matter. No UX
  measurement of dual-zone display was found.
