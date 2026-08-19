---
layer: technique
type: technique
subject: eligibility-analysis
technique: deadline-and-cutoff-evaluation
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [deciding whether a submission window is still open, evaluating multi-cutoff calls, an open opportunity showed as closed near midnight or near a cutoff]
---

# Deadline and cutoff evaluation

The deadline gate answers "is the window open *now*?" — the only eligibility
check whose answer changes by the hour. Its authority makes its arithmetic
dangerous: a fail here forces the ineligible verdict, so a clock error does
not merely mislabel an opportunity, it *hides it on its most urgent day*. The
technique is the timezone and multi-cutoff discipline that makes the gate
trustworthy at the edges, which is where deadlines live.

## The core distinction: dates vs instants

Published deadlines come in two shapes, and each demands its own comparison:

- **A calendar date** ("closes on the 15th") has no time-of-day. The correct
  question is *what day is it for the applicant?* — compute the current
  calendar day in the applicant's business timezone, then diff calendar days.
  Comparing against the current day in server time or universal time produces
  the classic off-by-one: an evaluation running shortly after universal
  midnight but before the applicant's local midnight counts the day early —
  which, at the boundary, flips the last open day to "closed" and suppresses
  the single most important nudge the pipeline can send.
- **A real closing instant** (a date plus a wall-clock time plus a named
  timezone — common in supranational calls that close at a specific afternoon
  hour in the funder's zone) expires *at that instant*, not at anyone's
  midnight. When the row carries time and zone, resolve them to an absolute
  instant (interpret the wall clock in the stated zone, correcting for
  daylight-saving offset at that moment) and compare instants. When it
  carries only a date, fall back to the calendar-day rule — never invent a
  time the funder did not publish, beyond the source's own documented
  end-of-day convention stamped at ingest.

The two rules coexist in one predicate: instant comparison when time/zone are
present, calendar-day comparison otherwise. Mixing them — expiring a dated
row at universal midnight, or a timed row at local end-of-day — produces
errors in exactly the final hours applicants care about.

## Multi-cutoff calls

Some programmes hold several submission cutoffs (staged calls, recurring
rounds). Two failure modes:

- **Keeping only the first cutoff** makes the whole call vanish the moment
  round one passes, even when the next round is a year out.
- **Keeping only the last** shows a comfortably distant deadline while the
  actionable round closes next week.

The rule: **the effective deadline is the earliest cutoff still in the
future; when all have passed, the latest one** — so downstream expiry reads
the call as genuinely closed rather than resurrecting it. Re-resolve on every
evaluation (the effective cutoff changes as rounds pass), and surface the
existence of later rounds in the detail: "this cutoff closed; the next is…"
is a doorway, not a fail.

## Decision rules

- **No parseable close date → unknown ("no close date published"), not
  fail and not open-forever-pass, because** rolling deadlines, paused
  programmes and sparse listings all look identical as a missing date, and
  only a human can tell them apart. (For *expiry* purposes a dateless row is
  treated as not-past — absence of a deadline must not delete the row — but
  the gate's status stays unknown.)
- **Compute days-until-close in the applicant's business timezone with an
  explicit, overridable default, because** the number feeds urgency copy and
  reminder scheduling, and every consumer re-deriving it from raw dates
  reinvents the off-by-one.
- **Accept up to an hour of imprecision at daylight-saving transitions,
  because** a guess-then-correct zone conversion can be off by the shifted
  hour exactly at the transition; for deadlines this is acceptable — but say
  so in the contract rather than discovering it in an incident.
- **Never let a scoring layer resurrect a passed deadline, because** prose
  often still advertises a date that has gone by; the clock is structured
  evidence and hard-blocks.

## When not to use

This gate governs *submission windows*. Do not apply it to award-history
records (nothing to submit), to forecast listings whose dates are estimates
(gate as unknown-with-forecast, since failing a forecast punishes early
planning), or to post-award reporting deadlines, which belong to a different
pipeline with different stakes.
