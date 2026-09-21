---
layer: technique
type: technique
subject: agent-memory
technique: observation-clock
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [a distillation pass turns conversation into stored claims, memory is written asynchronously or backfilled from an import, a stored claim says "next week" or a date nobody can explain, choosing what date a memory prompt calls today]
---

# The observation clock

A distillation pass does one thing to time that nothing downstream can undo.
It reads "we moved the launch to next Tuesday" and writes a claim, and if the
claim is any good it says *which* Tuesday. The relative phrase is gone after
that, and so is the only input that could have re-derived the date. A store
that keeps "next Tuesday" is useless in a month. A store that turned it into a
date against the wrong instant is worse, because the result looks precise and
cannot be checked.

So the clock that grounds a relative reference is an input to a stored
derivation, and it has to be the right clock
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
There are two, and they diverge:

- **The observation clock** is when the words were said. It belongs to the
  episode, not to the pass. It is the only clock that can resolve "yesterday",
  "last sprint" or "from today".
- **The writer's clock** is when the pass runs. It is correct for exactly one
  thing: what the pass may call *now* when it reasons about which claims are
  still current.

They are equal only when distillation is synchronous with the conversation,
and the principled design says it should not be: capture is cheap and
immediate, while consolidation is batched, deferred and horizon-bound. The gap
is minutes under normal load, hours when a batch backs up, and years when a
history is imported. A pass that grounds against the writer's clock is correct
exactly as long as nothing is late.

## The rule

**Every episode reaches the distiller carrying its own observation instant,
and the distiller is told to resolve relative references against that instant
and against nothing else.** The writer's clock is stated too, labelled as
*now*, and forbidden for grounding. Both are inputs the harness supplies. Neither
is read from the process: a pass that calls the system clock cannot be replayed,
backfilled or tested at a fixed date.

Three consequences:

- **An import is a replay, not a write.** A backfilled conversation is
  distilled against the instants its messages carry. If the import format has
  no per-message instant, the import says so and stamps the episodes with the
  best bound it has (the export's date range), marked as a bound. It does not
  stamp them with the import time.
- **Grounding is an instruction, not a hope.** Printing a timestamp beside each
  episode lets a model ground correctly but does not tell it to. A pass that
  shows instants and never says "resolve relative references against the
  episode's instant" leaves the choice to the model, and a model with no stated
  *now* will often keep the phrase verbatim.
- **A grounded claim carries its anchor.** "Launch moved to 2025-03-18 (said
  2025-03-11, 'next Tuesday')" can be audited when the grounding is doubted.
  "Launch moved to 2025-03-18" cannot. Keep the anchor at least in provenance.

## The failure is invisible from the prompt

A first-party memory library shows the failure in its sharpest form, and the
correct half is what makes it hard to see. Its extraction prompt is emphatic and
right. It defines an Observation Date and a Current Date as separate inputs,
calls the observation date "your ONLY temporal anchor", and forbids using the
current date to resolve references. But the open-source build's prompt builder
defaults the observation date to the current date when none is passed, neither
call site passes one, and the public write call *refuses* the parameter that
would supply it as a feature of the hosted tier. Every prompt that build sends
prints two dates under two headings, and they are always the same value. A
reviewer reading the prompt sees the rule. Only a reviewer tracing the
parameter from the entry point to the builder sees that nothing can satisfy it.

The inverse failure is as easy to ship. A consolidation prompt that prints each
episode's timestamp in its header, and never states *now* or asks for grounding,
has every input it needs and no instruction to use them. It can also carry a
rule of its own that says a request made "today" is an episode, not a fact,
while never saying what today is.

## Testing for it

- **Trace the instant from the entry point to the prompt.** Assert on the
  rendered prompt, not the template. Call the public write path with a message
  timestamped a year ago and read the observation line in what reaches the
  model. If the observation and current lines are equal, or the observation line
  is missing, the rule is unreachable, however well the template states it.
- **Replay at two base dates, and do not mask the dates you shifted.** A
  replay that shifts the clock and then erases every date before comparing
  cannot see a wall-clock read in a rendered date. Rebase the dates onto each
  arm's base. The contaminated arm has to fail
  ([rebase-the-varied-input](../../../evaluation-and-cost/eval-harness/techniques/rebase-the-varied-input.md)).
- **Check that the benchmark exercises the decision before ranking on it.**
  A scenario whose events carry almost no relative references cannot separate a
  design that grounds correctly from one that does not. Both score the same, and
  the tie measures the scenario. One replayed simulated year of 3,571 events
  held 12 relative references, all one template ("X is Y from today, not Z"),
  consolidated on the same simulated day. On that scenario this axis is
  unmeasured on every arm. Seed relative references whose absolute date is the
  ground truth, add a probe class that asks for that date, and make the gap
  between observation and distillation longer than a day.

## Boundaries

- **This is not which timestamp a read keys on.** Recording an event time and
  a receipt time on a row, then routing each query to the right one, is a
  storage decision and both clocks survive it. This technique governs a
  *language interpretation* made once at write time. Its output keeps no second
  clock to switch to later.
- **It does not decide supersedence.** Grounding "from today, not Z" to a date
  tells consolidation *when* the transition happened. Whether the new value
  closes the old one is a question of claim type and authority, and belongs to
  consolidation.
- **It does not validate the observation instant.** A client that reports a
  wrong message time produces a wrongly grounded claim. Bounding a reported
  instant is an ingest concern. What this technique guarantees is that the
  claim was grounded against the instant the system *believed*, and that the
  belief is on record.
