---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: audience-scoped-calendar-disclosure
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
use_when: [deciding what a candidate is told about why times are missing, designing recruiter-facing availability copy, an integration error must be reported to a user]
---

# Audience-scoped calendar disclosure

## The concern

A free/busy check produces two facts: *these times are available*, and *these
other times were removed because the interviewer is busy*. The first is
information the candidate needs. The second is a description of a named
employee's personal week — how loaded they are, whether they work Fridays, how
much of their time is already committed — and it belongs to a different audience
entirely.

Systems get this wrong in both directions. Some show the candidate "6 times
hidden due to conflicts", leaking an employee's schedule density to a stranger
who may not even be hired. Others show the recruiter nothing, leaving them to
stare at a three-slot grid with no way to tell whether the interviewer is
swamped, the integration is broken, or the configuration is wrong — and a
recruiter who cannot distinguish those three will escalate the wrong one.

The rule is that each fact goes to the audience it is *about*.

## The procedure

1. **Compute one payload with two projections.** The availability result carries
   the offered times, the three-valued status, and the count of times removed as
   busy. The recruiter projection exposes all three. The candidate projection
   exposes the times and a single derived bit.

2. **Give the recruiter the operative detail.** Which status the lookup returned —
   not connected, unavailable, checked — and how many candidate-visible times
   were hidden as busy. The count is what makes a thin grid legible: three
   options is alarming until you know nine were hidden, at which point it is
   merely a busy week and no action is needed.

3. **Give the candidate one bit.** Either *these times reflect the interviewer's
   current availability*, or *these times may not reflect current availability*.
   That is the entire disclosure. It is enough to set expectations honestly and
   carries nothing about anyone's schedule.

4. **Scope error text the same way.** A candidate never sees which integration
   failed, which account, or which error. They see, at most, the second bit
   above. The recruiter sees enough to know whether to reconnect a calendar or
   wait out an incident.

5. **Derive the candidate's bit from the status, never from the count.** A hidden
   count of zero can mean *checked and nothing was in the way* or *we could not
   check at all*, and only the status separates them. Deriving from the count
   reintroduces the two-valued bug in the presentation layer.

## Decision rules

- **When the status is not *checked*, the candidate's bit must be the cautious
  one, and no surface may render affirmative copy.** The label follows the state,
  not the layout
  ([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).
- **When the hidden count is greater than zero, only internal audiences see the
  number.** The candidate is not told that anything was hidden at all — not the
  count, not the fact.
- **When a recruiter asks *which* commitments conflicted, the answer is still
  no.** The count is an operational aggregate; the underlying entries are the
  interviewer's, and reading a colleague's calendar contents through a recruiting
  tool is a disclosure nobody consented to. Surface the aggregate and the status,
  never the titles or attendees
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)
  cuts both ways — hold what you have, and disclose only what you were given
  standing to disclose).
- **When the interviewer's identity itself is not disclosed to the candidate at
  this stage, availability copy must not leak it either** — no name, no "your
  interviewer's calendar", nothing that narrows who it is.
- **When logging, apply the same scoping.** A telemetry event that carries
  conflicting-entry titles has simply moved the disclosure into a system with
  broader access.

## When not to use it

- **When the interviewer has explicitly published their availability** — a public
  booking page they own and control — the asymmetry is theirs to waive, and the
  candidate may legitimately see a fuller picture.
- **When both parties are internal** — an internal mobility process, a panel
  scheduling itself — the "candidate" is a colleague with ordinary calendar
  visibility, and hiding what they can already see in their own client is
  theatre. Scope by what the viewer could otherwise access, not by their role
  name.
- **When the count would be the only explanation for a hostile-looking
  interface** and no internal audience exists to receive it — a fully
  self-service flow with no recruiter — prefer widening the offered window over
  disclosing the interviewer's density.

## The tell

You have this right when a candidate looking at a nearly-empty grid and a
recruiter looking at the same booking see two different, both-true explanations,
and neither of them can reconstruct the interviewer's diary from what they were
shown.
