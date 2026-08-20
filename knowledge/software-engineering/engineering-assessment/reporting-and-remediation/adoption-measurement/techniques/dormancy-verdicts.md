---
layer: technique
type: technique
subject: adoption-measurement
technique: dormancy-verdicts
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [deciding whether a recorded touch counts as a use, labelling something unused or abandoned, a usage total and an activity verdict disagree on one screen]
---

# Dormancy verdicts

## The concern

Two questions look like one: *has anything happened to this artifact* and
*has anyone chosen to use it*. Systems answer the first because it is easy to
record and then present the answer as if it were the second. Background
synchronization, cache warming, scheduled mirroring, bulk indexing, an
environment bootstrap that materializes every template — all of these write
records that are structurally identical to a person deciding to use the
thing. A counter that does not discriminate reports a thriving practice in an
organization where nothing thrives.

The opposite error is equally common and less discussed: labelling something
dormant when it is simply *new*. "Nobody has used this" and "people used this
and stopped" call for opposite responses — promote it versus retire it — and
a naive recency test maps both to the same verdict.

## The procedure

1. **Write down what a real use is, once.** A qualifying use is deliberate,
   attributable to an actor, and distinguishable from any automated pathway.
   For a shared artifact the useful test is *did a human's action cause this
   record to exist, for the purpose the artifact serves* — a person retrieving
   it to apply it counts; a nightly process retrieving everything does not,
   even though both produce a fetch.
2. **Discriminate at the point of recording, not at report time.** The
   recorder knows whether it is running on a person's request or on a
   schedule; a query written months later has to guess from timestamps and
   user agents, and it will guess wrong for the one pathway added after the
   query was written. Pass the provenance of the trigger into the record and
   store it.
3. **Keep one activity counter per definition, and make the verdict read the
   same writes it reports.** If a total and a verdict are computed from
   different sources, they will eventually contradict each other while both
   are internally correct — and the screen will assert a high usage count
   beside a "dormant" label. That is not a rendering bug to be patched at the
   view; it is two vocabularies for one concept. The repair belongs at the
   **write end**: the pathway that bumps the tally emits the activity record
   in the same transaction, so the two outputs are derived from one write and
   cannot diverge. Reconciling them at read time only moves the disagreement
   to a place with less information.
4. **Guard on age before evaluating recency.** A verdict must first ask
   whether the artifact has existed long enough for absence of use to mean
   anything. Below that age it is *new*, not dormant, and the guard interval
   is derived from the practice's own cadence — at minimum one full cycle of
   the cadence at which use would be expected. Let one constant serve both
   halves — the silence window and the age guard — so the two can never drift
   into a gap where an artifact is simultaneously too young to judge and past
   its window.
5. **Name every verdict state.** At least: `new` (too young to judge),
   `active` (qualifying use within the window), `dormant` (old enough,
   qualifying use once, none within the window), `never-used` (old enough,
   zero qualifying use ever), and `unmeasured` (no instrumentation on this
   pathway). The last one is not optional: an artifact whose usage cannot be
   observed must not silently share a state with one observed to be idle
   (`failure-not-empty-success`).
6. **Order the rules so the strongest evidence wins first.** Evaluate
   *active* before the age guard, or a young artifact that is already being
   used regularly will be labelled `new` and drop out of the active count.
   The age guard is a fallback for the no-evidence case only.
7. **Assert that every verdict state is reachable.** A state with no
   producing pathway is worse than a missing state: it silently makes another
   verdict universal. If the highest-ranked activity type in the ladder has
   no writer anywhere in the system, *active* is unreachable and the entire
   population reads dormant — a total instrument failure that renders as a
   plausible finding. Test each state end to end from a real write, and
   re-run that test whenever an activity type is added or retired.

## Decision rules

- If you cannot tell whether a record came from a human or a machine, it does
  not count as a use. Ambiguity resolves downward, always — the cost of an
  undercount is a conversation; the cost of an overcount is a program
  defended with fictional numbers.
- If a pathway is added that can produce activity records, it declares its
  trigger provenance before it ships, or it is excluded by default.
- If the window over which "recent" is measured changes, the verdict series
  breaks; publish the window with the verdict every time
  (`count-carries-predicate`).
- If an artifact is `unmeasured`, it may not be included in a dormancy count,
  a cleanup sweep, or a retirement decision. Missing instrumentation is not
  evidence of disuse.
- If the total activity figure and the verdict would contradict, block the
  render and fix the source. Two numbers that disagree teach readers to trust
  neither.

## Why the verdict, not the raw recency

A raw "last used" timestamp pushes the interpretation onto every reader, and
every reader interprets differently — one takes three weeks as abandonment,
another as normal for a quarterly practice. A named verdict computed once,
from a stated definition, with the window and the age guard applied, is the
same judgment for everyone and can be audited when someone disagrees with it.
It also survives export: a timestamp in a spreadsheet loses its context
immediately, while a verdict carries its own meaning.

## When not to use this

- **Not for high-frequency product telemetry**, where the subject of
  measurement is your own surface and every event is user-caused by
  construction. There the discipline is coverage and vocabulary, and it lives
  in the product-telemetry subject.
- **Not as a retirement gate on its own.** A dormant verdict is a prompt to
  ask why, not authority to delete — an artifact can be dormant because it is
  correct and finished, or because the one team that needs it needs it once a
  year. Pair the verdict with an owner's answer before acting.
- **Not on artifacts whose use is intentionally invisible.** Some standards
  are adopted by being copied once and never referenced again; measuring
  their retrieval recency measures nothing. Find a structural signal instead.
