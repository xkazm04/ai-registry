---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: the-measurement-runs-the-served-configuration
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a benchmark and production disagree about which settings were used, choosing a model from a comparison whose harness was configured separately, a measurement is about to be published as a fact about a vendor, deciding what a result row must disclose]
---

# The measurement runs the served configuration

A comparison is evidence about models only if every participant ran the configuration
production runs. Where the harness holds its own settings, it measures the harness.

## The failure, which is not rare

Benchmark harnesses acquire their own defaults. They are written separately, often
earlier, usually by someone establishing a baseline rather than serving traffic — and
their ceilings, deadlines and working directories drift away from the served path
silently, because nothing connects them.

The consequence is specific and it is always the same shape: an arm is bounded by a
harness setting, produces nothing or produces a fragment, and is recorded as *weak*. The
number is plausible, it is repeatable, and it is wrong. Two independent measurement
efforts have now published such a conclusion, and both traced it to a ceiling the served
path did not have.

The most damaging variant substitutes on failure. Where a harness falls back to a
deterministic stand-in when a call yields nothing, the stand-in's output is scored — and
recorded under the model's name. The result is not a missing measurement but a fabricated
one.

## The rule

**The settings that bound a call are read from one place, by both the served path and the
measuring path.** Not copied, not defaulted in parallel — the same source.

Where a setting genuinely must differ for measurement, the difference is **declared in the
result**, not left in the harness. A run whose ceiling differs from production is a valid
experiment about ceilings and an invalid comparison of models; the difference between
those two readings is a sentence in the report.

Three settings account for most of the damage:

- the **completion ceiling**, which produces the void described elsewhere in this subject
- the **deadline**, which converts a slow-but-capable engine into a failure
- the **ambient context** available to an agentic participant — a participant with access
  to material the others lack is not answering the same question, and that advantage
  arrives silently because it looks like competence

## Disclosure is part of the result

A comparison table without its bounding settings cannot be reproduced, including by the
person who produced it. The result carries the ceiling, the deadline, and — for any
participant capable of reading its surroundings — what it could see.

An arm prevented from answering by a harness condition is reported as **blocked**, with
the condition named. It never receives a low score. A measurement system that lets its own
defects become a participant's rating is worse than no measurement, because it is
persuasive.

## Decision rules

- **One source for bounding settings, read by both paths.** If the harness has its own
  copy, the comparison is about the copy.
- **A participant that hit a limit is void, not weak.** Raise the limit until nothing
  reaches it, then measure, then state the number that was not reached.
- **A substituted answer is never scored as the model's.** If a fallback fired, the row is
  blocked; the substitute's quality is a different measurement.
- **Equalise the context, not just the prompt.** Participants that can read their
  environment must be given the same environment — an empty one — or the comparison
  measures access.
- **State the settings in the report.** A number without its bounding conditions is not a
  result; it is an anecdote with a decimal point.
