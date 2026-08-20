---
layer: technique
type: technique
subject: impact-reporting
technique: report-calendar-derivation
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [building a reports-due queue or reminder system, deciding when a post-award report is overdue, retrofitting due dates onto existing report records]
---

# Report calendar derivation

Post-award reporting is the one recurring, calendar-driven obligation in a
grantee's operation, and it fails silently: a report nobody wrote raises no
error until the funder raises it, by which point the damage — restricted
drawdowns on public awards, a dented relationship on private ones — is done.
The technique is to make every due date a **pure function of data the record
already carries**, so the calendar can never be forgotten, only ignored
loudly.

## The derivation chain

1. **Period notation → period end.** A report is labeled with the period it
   covers, in a small closed notation: a quarter of a year, or a fiscal year.
   Each notation deterministically fixes the period's last day — the third
   quarter of a year ends on the last day of its ninth month; a fiscal year
   ends on its final day. Parse strictly: accept only the notations you
   defined, and return an explicit null for anything else rather than
   guessing at a date.
2. **Period end + grace window → due date.** Funders demand the report a
   fixed window after the period closes. Around thirty days is a workable
   default for foundation narrative reports — and for public funders'
   interim financial reports, which commonly fall due thirty days after the
   quarter closes; annual financial filings commonly get ninety days, and
   final closeout reports up to one hundred twenty. The default is a
   *fallback*: when the award letter or
   notice states a deadline, the stated deadline wins, always. The
   convention exists for records where nobody captured one.
3. **Due date + today → bucket.** Every unsubmitted report lands in exactly
   one of three states: **overdue** (past due), **due soon** (within a
   warning window — about two weeks gives a team time to actually write the
   thing), or **upcoming**. Submitted reports leave the queue entirely.
   Humans act on buckets, not on raw dates; the queue's job is to make
   "something needs writing this week" visible at a glance.

Because every step is derived, the calendar works retroactively: records
created before the calendar existed get due dates the moment the derivation
ships, with no data migration and no backfill project. That property is worth
designing for on purpose — store the period notation, derive everything else.

## The false-alarm rule

The single most important decision rule in the chain: **an unparseable period
label must never raise an alarm.** If the notation cannot be read, the due
date is null and the report sits in "upcoming" — visible, but quiet. This is
[an honest null beating a forced guess](../../_laws.md#honest-null-over-forced-guess)
applied to time: a queue that shouts "overdue" on garbage input trains its
users that red flags are noise, and the cost of that training is paid
precisely once — on the day a real overdue report scrolls past a user who has
learned not to look. Pair the quiet degradation with a separate data-quality
surface that lists unparseable labels for cleanup, so the null is honest
rather than invisible.

## Boundary conditions worth getting right

- **The current period is never reportable.** A quarterly report created
  mid-quarter covers the *previous* quarter — the period that just ended —
  and the first quarter of a year reports on the final quarter of the year
  before. Defaulting to the current period produces reports on incomplete
  data.
- **Compute in a fixed timezone.** Period-end arithmetic done in local time
  drifts a day at zone boundaries; a due date that moves depending on who
  loads the page is not a due date.
- **Day counts round conservatively toward the alarm.** Whether a report is
  13.2 or 14.0 days out, the writer needs the same warning; round so the
  warning fires earlier, not later.

## When not to use it

When a funder issues an explicit reporting schedule — named dates in a notice
of award, a portal that assigns deadlines — derivation is the wrong tool:
record the funder's dates verbatim and drive the buckets from those. The
derivation chain is for the long tail of awards whose paperwork states a
cadence but no calendar, and for retrofitting old records. Never let a
derived default silently override a captured real deadline.
