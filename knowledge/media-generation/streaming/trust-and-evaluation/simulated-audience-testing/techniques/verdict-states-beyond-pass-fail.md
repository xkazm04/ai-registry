---
layer: technique
type: technique
subject: simulated-audience-testing
technique: verdict-states-beyond-pass-fail
status: forged
laws: [unmeasured-is-not-pass, refusal-is-a-state]
shared_with: []
use_when: [designing how a simulated run records its outcome, handling judge timeouts or provider outages in a tournament, reporting coverage beside a pass rate]
---

# Verdict states beyond pass and fail

A simulated stream is a long pipeline — scheduler, host model, moderation,
judge — and any stage can fail to produce what the verdict needs. A tournament
that knows only pass and fail must put every one of those gaps somewhere, and
wherever it puts them is a lie: as a pass, the gap inflates the host's record;
as a fail, it indicts the host for an outage. This technique is the live-show
realization of the law that unmeasured is not pass
([_laws: unmeasured-is-not-pass_](../../../../_laws.md#unmeasured-is-not-pass)):
it names the states a live run can actually end in.

## The states

Per **rule** within a judged run:

- **pass** — the rule was provoked and the host's behaviour met it;
- **fail** — the rule was provoked and the behaviour broke it;
- **not provoked** — nothing in the run triggered the rule, so it was not
  tested;
- **not evaluable** — the rule was provoked but the transcript does not let
  the judge decide.

Per **run**:

- **judged** — the judge returned a verdict for every rule and fact;
- **judge void** — the judge answered, but abstained, refused, or returned
  something that does not parse. This is a content outcome of the judging:
  the same transcript will likely void again, so it is kept, counted and
  inspected, never retried into a verdict;
- **judge pending** — the transcript is sound but the judge call failed on
  infrastructure (timed out, rate-limited, provider unavailable) or was
  deferred because nothing could serve it;
- **engine failed** — the stream itself was cut: the host model's provider
  failed or ran out of quota, the engine crashed, the host signed off
  because it lost its model fleet. Classify this from the run's call ledger
  as well as the transcript, with a declared threshold — the host's last few
  calls all failed on the engine, or more than a fixed share of them did —
  because a degraded stream can limp to the end and still not be a
  performance of the host.

A run that is pending or engine-failed contributes nothing to any rate, in
either direction. A judge refusal is a state, not a default verdict and not a
retry loop (law: [refusal-is-a-state](../../../../_laws.md#refusal-is-a-state)).

## Infrastructure is never content

The most damaging misreading is a provider outage scored as a judgement. When
a quota runs out mid-tournament, every remaining call fails the same way; if
the harness records those as void or failing verdicts, a block of runs —
often concentrated in one configuration, because it was scheduled last —
reads as a quality collapse that never happened. The classification is
mechanical and happens before any scoring: was the failure produced by the
model's content, or by the system around it? Only content produces a verdict.

The recovery is equally mechanical, and each state has its own:

- **judge pending is re-judged, never re-run.** The transcript is a sound
  performance; a fresh stream would be a different one, and replacing it
  quietly re-rolls the dice on a run that already happened.
- **engine failed is re-run**, with the cut run's artifacts moved aside
  rather than deleted, so the failure stays inspectable.
- **On a quota or outage signal, stop admitting new runs**, let in-flight
  runs finish, and pause until the provider's window resets. Probe recovery
  with the cheapest possible call, never with a full run. Bound in-session
  retries, cap the total pause, and when the cap is reached stop with a
  summary rather than grinding on.
- **Finish honestly.** A tournament that ended with runs still pending or
  failed reports so in its exit status and its summary; "complete" means
  every planned run reached a verdict or a content void.

Never re-label a run to tidy the table, and never let a resumed tournament
merge its runs with a different instrument's. Spend on excluded runs still
counts in the tournament's cost: a quota outage is part of what the
measurement cost, even though it bought no verdicts.

## Coverage travels with every rate

Every reported rate carries its denominator and its coverage: of the
rule-checks planned, how many reached pass or fail, how many were not
provoked, not evaluable, pending or engine-failed. "2 failures in 500
evaluated, 61 not provoked, 1 run pending" is a finding; "99.6% pass" is not,
because it hides how much of the promise was checked.

## Decision rules

- **When a stage fails, classify the failure's cause before writing a
  verdict.** Timeouts, rate limits, unavailability and transport errors are
  infrastructure; a refusal or an unparseable reply is content, of the host
  or of the judge. Only a judged transcript yields a rule verdict.
- **When the judge times out, check the timeout before the transcript.** A
  timeout set below the judge's measured tail latency manufactures pending
  runs out of long, eventful transcripts.
- **When pending or failed runs cluster in one configuration, the comparison
  is unbalanced until they are re-run.** Do not rank configurations with
  unequal coverage.
- **When a rule is not provoked in most runs, the situation bank is
  inadequate for it.** Fix the bank; do not report the rule as clean.
- **When not evaluable is common for a rule, the rule's wording or the
  transcript format is the defect.** A rubric row the judge cannot decide is
  measuring the rubric.
- **Never let a count of passes equal planned checks minus fails.** Passes
  are counted directly; everything that is neither is named.

## When not to use it

A one-off smoke run during development can live with pass and fail. The
moment results are aggregated, compared across configurations or used to
choose what goes live, the full set of states is mandatory.
