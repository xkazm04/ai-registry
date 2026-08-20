---
layer: technique
type: technique
subject: deadline-pipeline-management
technique: escalating-reminder-thresholds
status: forged
laws: [clean-is-not-ready]
shared_with: []
use_when: [designing scheduled deadline reminders, a recipient got three reminders about one deadline in one day, reminders re-fired after a scheduler rerun]
---

# Escalating reminder thresholds

A deadline deserves several notices, spaced to match how work actually ramps:
an early heads-up, a mid-range check, a final-week alert, a day-before nudge.
The technique is a threshold ladder — canonically 30 / 14 / 7 / 1 days out —
with the two invariants that separate a trusted channel from one people mute:
each rung fires **at most once** per application, and a late arrival **never
bursts**.

## The selection rule

On each scheduled run, for each in-flight application:

1. Compute days-until-close with timezone-correct day math. A negative count
   means the deadline has passed — nothing to remind about (the *miss* is
   triage's concern, not the reminder ladder's).
2. An application has **crossed** every threshold `T` where `daysOut ≤ T`.
3. Of the crossed thresholds not yet recorded as handled, **fire the smallest
   (most urgent) one and suppress the rest** — record the suppressed rungs as
   handled without sending anything.
4. Record the fired rung under a stable key of application × threshold.

Over successive daily runs against a long-lived application this fires
30 → 14 → 7 → 1 as each rung is crossed. An application entering the pipeline
at day 5 fires only the 7-rung (silently retiring 30 and 14), then the 1-rung
later — one message now, one at the end, never a three-message burst about a
single deadline. Burst suppression is the load-bearing half: without step 3's
suppression, every late entry and every threshold reconfiguration detonates
the whole crossed set at once.

## Idempotence and the sent-set

The sent-set (the recorded application × threshold keys) is what makes the
ladder safe to rerun. Scheduled jobs double-fire — retries, overlapping
schedules, manual replays — and a selector that consults only the calendar
sends duplicates on every rerun. Design rules for the record:

- Key on application id + threshold value, nothing derived from the date —
  the same rung must dedupe even if the close date shifts by a day.
- Record suppressed rungs the same as fired ones; "handled" is the property
  the selector checks, and a suppressed rung must never fire later as the
  count keeps falling.
- Keep selection pure: drafts + clock + sent-set in, fire/suppress lists out.
  The scheduler owns reading and writing the record; the selector owns the
  logic. Purity is what lets the burst and rerun cases be table-driven tests
  instead of production incidents.

## Configurability

Thresholds are policy, so read them from configuration with a hard-coded
fallback — but sanitize: parse to positive integers, de-duplicate, sort, and
fall back wholesale on empty or invalid input. A misconfigured threshold
string that silently yields an empty ladder is a reminder system that stopped
working with no error anywhere — the clean-is-not-ready failure exactly: a
quiet channel and a broken channel must be impossible to confuse.

Sort ascending once at the boundary and let the selection rule depend on that
order ("smallest crossed unsent"); re-sorting defensively at each use hides
the contract instead of enforcing it.

## Escalation of content, not just timing

The rung reaching the recipient should sound like its urgency. Pair the ladder
with miss-risk scoring for emphasis: the 1-day rung for a finished draft is a
calm "submit today"; the same rung for a half-done draft leads the digest
flagged as at-risk with its work-left estimate. The ladder guarantees *that*
notice happens; the risk score decides *how loudly*.

## Decision rules

- **One digest per run, not one message per rung.** Batch everything that
  fired this run into a single ranked message; five separate emails from one
  scheduler tick is the burst problem re-created at the transport layer.
- **When adding a rung** (say, 60), existing applications past it must not
  retro-fire it: the "smallest crossed unsent" rule fires the new rung only
  for applications that legitimately sit inside it, and suppression retires
  it for everyone deeper — verify this with a test before shipping the config
  change.
- **When a submission buffer is in force** (submission-lead-time-buffers),
  run the ladder against the effective plan-to date, not the funder close —
  a day-before nudge aimed at the funder's date arrives after the internal
  deadline it was supposed to protect.
- **Day-of coverage comes from the 1-rung plus correct day math.** If the
  last-day reminder is unreliable, suspect the timezone frame before the
  ladder.

## When not to use it

Threshold ladders assume a scheduled cadence against date-certain deadlines.
For rolling opportunities with no fixed close, a ladder has nothing to anchor
on — cadence-based check-ins fit better. And do not extend the ladder past
the deadline (−1, −3 rungs) to nag about misses; overdue-and-unfinished is a
triage state with a human conversation attached, not a rung.
