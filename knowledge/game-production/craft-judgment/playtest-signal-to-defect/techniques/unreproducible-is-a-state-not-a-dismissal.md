---
layer: technique
type: technique
subject: playtest-signal-to-defect
technique: unreproducible-is-a-state-not-a-dismissal
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [a report could not be reproduced, designing the state vocabulary of a finding queue, the same rumour keeps arriving as a new ticket]
---

# Unreproducible is a state, not a dismissal

The concern: **what happens to a finding that somebody tried to reproduce and could not.** In
most queues the answer is that it disappears, and the cost is invisible by construction: the
project never learns that it is on the fourth sighting of the same thing, because the first
three were closed.

## The vocabulary

Four states, and the distinctions between them are the technique:

- **Reproduced** — the trigger was pulled and the failure occurred, with an attempt count.
- **Not reproduced** — the trigger was pulled a stated number of times on a stated build and the
  failure did not occur.
- **Not attempted** — nobody has tried. Honest, common, and not a conclusion about anything.
- **Cannot attempt** — there is no runnable build, no environment, or the report contains no
  steps to attempt at all. A statement about the project's capability, not about the defect.

The first split that matters is between *not reproduced* and *not attempted*: one says the
harness or the human tried and learned something weak, the other says nothing was learned at all.
Folding them together makes an untested queue indistinguishable from a tested one. The second
split, between *not attempted* and *cannot attempt*, separates a backlog from a blocked pipeline;
they are queued to different people. The same three-outcome instinct governs automated runtime
gates next door, and the reasoning transfers: an observation that could not be made is not a
negative observation.

## The rule the whole technique rests on

**Failing to reproduce is weak evidence against a defect; reproducing is strong evidence for
one.** The asymmetry runs one way only, and every downstream rule follows from it.

Ten failed attempts do not disprove a report. They bound its frequency — usefully, and that bound
belongs in the frequency axis — and they say that the conditions have not been found yet. So
**not reproduced never converts to "works as intended"**, and it never converts to a closed
ticket by itself. The tester saw something. What is unknown is what.

## What the state must carry

A *not reproduced* record with no attempt count is an instrument reporting a conclusion without
saying what it examined, and it is worth nothing to the next person. The record states: how many
attempts, on which build identity, in which world and scenario, which conditions were varied
while trying, and who or what attempted. The varied conditions are the most valuable part —
"tried at three difficulties, both input devices, and with and without the buff" tells the next
attempt where *not* to look, which is the only way a series of failed attempts compounds instead
of repeating.

## Rules

- **A second sighting attaches to the existing state rather than opening a new finding.** This is
  the whole reason the state is durable: it is the only mechanism that turns three unrelated
  rumours into one finding with a frequency. It requires the queue to be searchable by
  observation, not only by title.
- **A session vindicates a finding only within the ground it covered.** A finding absent from a
  session that never went near its area is `not attempted`, not fixed, and a sweep that flips it
  to fixed is manufacturing a repair that never happened — with the further cost that the next
  session to actually cover that ground reports a regression against a fix nobody made. Two
  clauses make the rule work: the vindicating session must **cover every context the finding has
  ever been observed in, not merely overlap one of them**, and **unknown coverage counts as not
  covered**. The asymmetry is deliberate — under-sweeping leaves a finding open, which is an
  honest "we have not shown this is fixed", while over-sweeping invents a fix and then a
  regression against it. Only one of those two errors lies.
- **The state is bound to a build.** A *not reproduced* result speaks for the build it was
  attempted on, exactly as a verdict speaks for the content it judged. A new build does not
  automatically re-test it, but it does expire its currency: the finding is once again unattempted
  on the current build, and says so.
- **Severity survives; frequency does not.** An unreproducible report of a catastrophic outcome
  keeps its severity — the consequence is unchanged by our inability to trigger it — and loses its
  frequency, which becomes unmeasured rather than zero. Downgrading severity because a defect is
  hard to trigger is how the rare catastrophe gets buried.
- **Retirement happens by stated policy and is never a deletion.** A policy — a stated number of
  builds with no further sighting, or a scope that no longer exists in the game — retires the
  finding with a reason, and the record stays searchable so a later sighting can resurrect it.
  Retirement by fatigue is what teaches everyone that reporting is pointless.
- **Route unreproducibles differently from defects.** A defect goes to the discipline that owns
  its class. A finding that could not be reproduced goes, first, to whoever owns the
  instrumentation, because the most common reason a real report cannot be reproduced is that the
  session record was missing the condition that mattered. A rising unreproducible rate is a
  measurement of the session contract, not of the players.

## Decision rules

- **When you cannot tell whether a report failed to reproduce or was never properly attempted, it
  is not attempted.** Falling to the conservative side keeps the queue honest, and the cost of
  being wrong is one more attempt.
- **When a report has no steps at all, the state is `cannot attempt` and the next action is an
  observation request, not a closure.** Ask for the one missing fact; do not ask the reporter to
  re-derive their whole session.
- **When an unreproducible finding is severe, spend the attempts a severe finding deserves and
  record the total.** The attempt count is the visible price of the severity, and it is what
  justifies the next escalation.
- **When the same observation arrives from an automated tester and a human within one build, treat
  it as reproduced.** Two independent instruments producing the same observation is a stronger
  result than one instrument producing it twice.

## When not to use it

- **Not as a parking lot for findings nobody intends to fix.** A finding that reproduces reliably
  and is not being fixed is a deliberate decision and has its own honest state; laundering it
  through "could not reproduce" corrupts the one queue whose credibility this technique exists to
  protect.
- **Not without a retirement policy.** An unbounded queue of durable unreproducibles gets ignored
  wholesale, and ignoring it loses exactly the signal the state was created to preserve. Durable
  means aged and reviewed, not immortal.
- **Not for findings that were never observations.** A tester's theory that failed to reproduce
  was never reproducible in the first place, because there was nothing to reproduce. That belongs
  in the interpretation field, where it started.
