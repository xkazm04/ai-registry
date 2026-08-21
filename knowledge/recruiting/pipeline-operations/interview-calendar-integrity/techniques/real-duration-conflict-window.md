---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: real-duration-conflict-window
status: forged
laws: [a-verdict-is-bound-to-what-it-judged]
use_when: [computing whether an interview collides with an existing commitment, choosing a collision key for your own bookings, interviews of differing lengths share one grid]
---

# Real-duration conflict window

## The concern

"Is this time free" is not a question about a point. An interview occupies an
interval, and so does everything it might collide with. A check written against
the start instant catches only exact ties and misses every real overlap: the
ninety-minute panel that swallows the next two slots, the call that begins
fifteen minutes before yours ends, the interview whose length was configured per
round while the conflict check kept using the default.

There is a second, opposite error that looks like rigour: computing the exact
interval for everything, including your *own* bookings, and thereby permitting
two interviews for the same interviewer at ten past and half past the same hour
because their intervals technically do not overlap. That is arithmetically
correct and operationally wrong.

The technique is to keep two windows with two different jobs, and never let one
impersonate the other.

## The procedure

1. **Derive the interval from the interview, not from a constant.** Start plus
   the round's own configured duration, plus whatever buffer the process requires
   on each side — travel, notes, a debrief. If the duration is per-round or
   per-interview-type, the check must read the same field the booking will write;
   a duration that lives in two places will disagree in production.

2. **Anchor the interval in the interviewer's zone.** Business hours, lunch,
   day boundaries and holidays are facts about the interviewer's working life.
   The candidate's zone is a rendering concern and the server's zone is an
   accident of deployment; neither may enter the arithmetic. The neighbouring
   self-scheduling discipline owns the anchoring rule itself — this technique
   simply obeys it.

3. **Test overlap, not equality.** Two intervals collide when one starts before
   the other ends and ends after the other starts. State it once, in one shared
   predicate, and call it from suggestion time, confirm time and any batch
   consistency sweep. Written three times it will be written three ways.

4. **Use a coarse bucketed key against your own bookings.** Key on the
   interviewer plus the hour, in the interviewer's zone. Two bookings in that
   same interviewer-hour collide even when their minutes differ. This key is
   cheap, index-friendly, immune to rounding differences, and enforceable as a
   uniqueness constraint — which makes it a real guarantee rather than a
   best-effort read-then-write.

5. **Use the real interval against the external calendar.** You do not control
   the lengths of other people's commitments and cannot bucket them without
   either inventing conflicts or missing them.

6. **Never let the coarse key produce a claim.** It answers "may we offer this
   hour", not "is this person free". Its rejections are internal policy and
   should be presented as "not available" and nothing more precise.

## Decision rules

- **When the interview duration is unknown at check time, do not default it
  silently.** Resolve it from the round. A fallback constant is defensible for
  records created before durations were stored, but it must be documented as a
  legacy path, not treated as the normal one — a default that undershoots
  produces confident, wrong all-clears.
- **When the duration is stored on the booking, read it from that same field at
  every check site.** Suggestion time, confirm time and the recruiter's own
  re-offer must all use one source. A duration resolved one way for the candidate
  and another way for the recruiter produces two different grids for one
  interview.
- **When a longer window empties the horizon, route into the existing escalation,
  not into an error.** A ninety-minute interview legitimately survives fewer
  slots than a thirty-minute one, so a fully-conflicted horizon becomes normal
  rather than exceptional — and it must reach the propose-your-own-times path
  that the neighbouring self-scheduling discipline already owns.
- **When a buffer is configured, include it in the conflict window but exclude it
  from the event written back**, unless the buffer is a real block someone should
  see. A conflict window and a calendar event are different objects with
  different audiences.
- **When two of your own bookings fall in the same interviewer-hour, reject —
  even if the intervals do not overlap.** Back-to-back interviews inside one hour
  are a scheduling smell independent of the arithmetic, and the blunt key is the
  cheap way to stop it before a human has to notice.
- **When an all-day or unbounded entry appears on the external calendar, do not
  treat it as blocking the whole day by default.** All-day markers are frequently
  informational, and treating them as busy empties the grid for anyone who
  records birthdays. Prefer entries with real bounds, and let the unbounded ones
  inform a recruiter rather than filter a candidate.
- **When a conflict is found, the verdict is bound to the interval it examined.**
  Record which window was checked, so a later dispute does not have to guess
  whether the buffer was included
  ([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

## When not to use it

- **For a check against your own bookings, the real interval is the wrong tool.**
  It is more precise than the policy requires and buys you double-books at
  minute granularity. Use the bucket.
- **When the process genuinely wants dense back-to-back interviews** — an
  assessment day, a rotation with a fixed cadence — the hour bucket must be
  replaced by an explicit schedule model rather than loosened. A bucket relaxed
  by exception becomes no bucket at all.
- **When the external calendar exposes only an opaque boolean per slot** rather
  than intervals, do not synthesize intervals from it. Take the answer at the
  granularity given, and record that the granularity was coarse.

## The tell

You have this right when changing a round's duration from forty-five minutes to
ninety immediately changes which suggestions are filtered out, with no other
edit anywhere in the system.
