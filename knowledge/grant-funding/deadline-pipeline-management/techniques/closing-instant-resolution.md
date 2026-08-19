---
layer: technique
type: technique
subject: deadline-pipeline-management
technique: closing-instant-resolution
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [deciding whether a call is still open, handling funders that publish a closing time and timezone, an opportunity with multiple cutoffs vanished after the first one passed]
---

# Closing-instant resolution

A funder does not close a call "on March 12"; it closes it at a specific
moment — 17:00 in the funder's own timezone, or five in the afternoon in the
program office's capital. Closing-instant resolution converts the published
date, optional wall-clock time, and optional timezone into one unambiguous
universal instant, so "is this still open?" is a single comparison of two
instants instead of a guess dressed as a date.

## Why the date-only model lies

With date-only expiry, a call that shuts at 17:00 in a European capital stays
"open" in the pipeline of a North American applicant until their local
midnight — six-plus hours during which the radar shows a submission window
that no longer exists. The inverse error also occurs: an applicant east of the
funder sees the call expire early. Either way the pipeline's most important
boolean is wrong at exactly the moment it matters most — the final hours.

## Resolution procedure

1. **Parse the date defensively.** Accept the funder ecosystem's common
   formats; validate that the date is real (a silently-rolled impossible date
   is a corrupted deadline); return null for anything unparseable. Null means
   *no deadline known* and flows through as "never expires by clock" — a
   human decision, not a machine guess. Never substitute a default date.
2. **Choose the timezone.** The funder's published zone when given; otherwise
   the organization's business timezone as fallback. The fallback is a
   documented approximation, not a claim of knowledge.
3. **Choose the time.** The funder's published closing time when given;
   otherwise default to end-of-day (23:59) in the chosen zone. End-of-day is
   the conservative default for *display* but note its bias: it always errs
   toward showing the call open longer. Where a funder family is known to
   close at a fixed afternoon hour, capture that as data rather than
   hard-coding it.
4. **Convert wall-clock to instant.** Interpreting "that date, that time, in
   that zone" as a universal instant requires an offset lookup at the target
   moment (daylight-saving shifts change the offset seasonally). A
   guess-then-correct conversion — guess the instant with zero offset, read
   the zone's offset at the guess, shift — is accurate except within an hour
   of a daylight-saving transition, an acceptable error for deadlines; a full
   timezone database removes even that.
5. **Expire by comparison.** The call is closed exactly when the resolved
   instant is at or before *now*. Records that carry no time and no zone keep
   the calendar-day rule so date-only data behaves unchanged.

## Multiple cutoffs: earliest future, else latest past

Rolling and multi-stage calls publish several submission cutoffs. Two rules,
both learned from the failure of keeping only the first:

- **The operative deadline is the earliest cutoff still in the future.** That
  is the date to band, remind, and count down against.
- **When every cutoff has passed, report the latest one.** Downstream expiry
  then correctly reads the whole call as closed — whereas reporting the first
  (long-past) cutoff makes the opportunity vanish from radars the moment
  stage one closes, even when stage two is a year out and perfectly live.

Recompute the selection against *now* on every read; a cutoff crosses from
future to past without any data changing.

## Decision rules

- **Instant for expiry and countdowns; day count for pacing.** Once an
  instant exists, "hours until close" powers final-day urgency, but the
  human-facing "N days left" still comes from timezone-correct day math so
  the two never disagree about which day it is.
- **Store time and zone as separate optional fields**, not baked into the
  date string. Their *absence* is information — it selects the calendar-day
  fallback — and a pre-combined timestamp destroys that signal.
- **Clamp parsed times into valid range** rather than rejecting the record; a
  deadline with a slightly-mangled published time is still a deadline.

## When not to use it

Do not fabricate precision the funder never published: if the source gives
only a date, resolve with the documented defaults but keep human-facing copy
at day granularity — rendering "closes 23:59" for a call whose funder said
only "closes March 12" presents a guess as a fact. And do not use the
resolved instant for day-count arithmetic; that path runs through the
calendar-day projection, or the two clocks drift.
