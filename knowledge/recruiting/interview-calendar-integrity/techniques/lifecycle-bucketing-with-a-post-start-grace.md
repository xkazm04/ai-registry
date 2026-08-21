---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: lifecycle-bucketing-with-a-post-start-grace
status: forged
laws: [say-only-what-the-record-holds, a-candidates-process-never-stalls-on-your-constraints]
use_when: [splitting interviews into upcoming and past, an interview disappears from a dashboard while it is happening, deciding reminder or re-invite eligibility, laying out a schedule grid]
---

# Lifecycle bucketing with a post-start grace

## The concern

An interview view that splits its rows with a single comparison against the
current instant has a hole in it, and the hole is exactly one interview long.

At the start time the interview stops being upcoming. It has no outcome recorded
yet, so it is not completed either. For the whole duration in which it is
actually being conducted — and usually for hours afterwards, until somebody
remembers to write something down — it appears in **neither** list. The recruiter
watching the dashboard sees it vanish at precisely the moment they most expect to
see it, and the reasonable conclusion they draw is that it was cancelled.

The general fault is broader than this one bug: bucket membership is being
computed as a set of independently-authored predicates that happen to cover most
of the timeline, rather than as a partition that covers all of it.

## The procedure

1. **Enumerate the buckets as a partition.** A workable set is: *attention*
   (something is wrong or unanswered and a human must act), *today*, *upcoming*,
   *awaiting outcome* (it has happened, nothing has been recorded), and *closed*
   (an outcome or a terminal state exists). Every live interview belongs to
   exactly one, at every instant, for every possible clock value.

2. **Give the live buckets a post-start grace.** An interview does not leave the
   live agenda at its start time. It leaves at start plus its real duration plus
   a margin — long enough to cover an overrun, short enough that the agenda stays
   honest. Only after the grace does it move, and it moves into *awaiting
   outcome*, never into nothing.

3. **Assign in a fixed priority order, first match wins.** Terminal states beat
   time-based ones; attention beats today; today beats upcoming. Ordering is the
   logic, and writing it as an ordered cascade rather than as parallel booleans
   is what makes the partition provable. Taking the terminal fates *first*
   matters in particular: a declined or no-showed interview must not surface as
   an actionable row just because a stale flag is still set on it.

   The closed bucket must also admit **derived** fates, not only recorded ones.
   An invitation that aged past its deadline was never explicitly ended by
   anyone, and if the partition only recognises stored statuses it becomes the
   next thing with no home. Derive it at read time from the deadline and the
   clock, and label the closed row with which fate it was — expired, declined,
   no-showed — from the same function that did the bucketing, so the reason on
   screen cannot drift from the bucket it sits in.

4. **Test the partition, not the buckets.** The test that matters iterates a
   range of clock values across an interview's whole life and asserts that
   bucket count is exactly one at every step — before, at start, mid-interview,
   at start plus duration, inside the grace, after the grace, after an outcome.
   Testing each bucket's predicate in isolation is what let the hole in.

5. **Derive re-invite eligibility and reminder eligibility from one predicate.**
   "Is this still live and still actionable" is a single question that two
   features ask. Written twice, they drift, and the drift is visible to users as
   a reminder for something nobody can act on, or a re-invite control on an
   interview that is already gone.

6. **Make displayed time windows a union, not a configuration.** A week or day
   grid's rows must be the union of the configured business hours, the proposal
   window, and every hour any real booking actually occupies. Configuration
   describes what you *offer*; it has no authority over what *exists*. A booking
   made by hand at seven in the evening, or one made before someone narrowed the
   business day, must still be drawn.

## Decision rules

- **When an interview has started but has no outcome, it stays visible.** Absence
  from every list is a stronger, falser claim than any label — it reads as
  cancelled ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- **When the grace expires with no outcome, escalate rather than archive.**
  *Awaiting outcome* is an attention state after a while, because an interview
  that happened and was never recorded is a candidate whose process has stopped
  moving for reasons entirely internal to you
  ([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When choosing the grace margin, size it to the process, not to a round
  number.** It must exceed the longest realistic overrun; a grace shorter than
  the interview itself is the original bug with extra steps.
- **When a bucket must be recomputed by another surface, export the assignment
  instead.** A second, private notion of "is this interview still live" living in
  a queue or a report is how one interview comes to be described two ways.
- **When setting reminder eligibility, use two distinct and deliberately unequal
  durations.** A look-ahead window ("fire when the start is this close") and a
  short-notice floor ("below this, the confirmation the candidate just received
  *is* the reminder") answer different questions. Set to the same number, they
  leave every booking made inside that window with **no** reminder at all — the
  last-minute bookers, who need one most. Keep the floor, keep it small, and make
  the short-notice confirmation copy say see-you-soon rather than promising a
  later reminder it will never send.
- **When the confirmation time is unknown, do not suppress the reminder.** A
  missing timestamp is a gap in your data, not evidence that someone was already
  told ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## When not to use it

- **When outcomes are recorded automatically at the end of the interview**, the
  awaiting-outcome bucket may be near-empty — but keep it, because the automation
  will fail and the interviews it drops must land somewhere visible.
- **When the surface is a strict historical report** rather than a working
  agenda, a clean before/after split is correct; the partition discipline is for
  views people act from.
- **When there is genuinely no duration** — an asynchronous exercise, an untimed
  take-home — grace has no meaning and the lifecycle is driven by deadlines
  instead. Do not stretch the bucketing metaphor over an object it does not fit.

## The tell

You have this right when you can set the clock to the exact midpoint of a
scheduled interview and find it in precisely one bucket on every surface that
shows it.
