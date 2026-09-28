---
layer: technique
type: technique
subject: eval-harness
technique: failure-signatures-beside-the-pass-rate
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value, gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [two runs or cells report the same pass rate and the next change has to be chosen between them, a benchmark report prints a pass rate and a per-class table and nothing about how the failures failed, a scenario class is named after the property it probes and its pass rate is being read as that property's health, adding cheap automatic failure counters to a harness, a failure counter reads zero on a suite that mixes languages runners or output formats, deciding which failing cases to sample for manual attribution]
---

# Failure signatures sit beside the pass rate

A pass rate collapses every failing run into one bit. Two runs at the same rate
can have failed for reasons that call for opposite changes — one emitted output
the parser rejected, the other emitted clean output that left out the action —
and the rate cannot say which, so the next change is chosen by whoever reads the
transcripts first, or by nobody.
[failure-attribution](./failure-attribution.md) is the full answer and it is
manual: a sample, by hand, into owners. This technique is the cheap layer under
it that runs on every trial.

> **Count each failing run by the family of the check it failed, as a case
> count, beside the pass rate — with each family's denominator of runs that
> could have tripped it, so a zero from a detector that cannot fire reads as
> not measured.**

## The scenario's class is not the failure's mechanism

The per-class table is where a harness usually stops, and it is the table that
misleads most, because a class is named after what the scenarios *probe*, not
after how they *fail*. In one measured bench a class named for the output
format contract showed a 20-point gap between two model families, and every one
of the failing runs parsed cleanly: the gap was a dropped second action. A
reader of the class table goes to the output grammar; the fix is in the
instruction. The family has to come from the check that went red, never from the
label on the scenario that contained it.

Families are few and chosen for the lever each points at, not for taxonomy:
malformed or rejected output (the format contract, or the parser), an expected
action absent (instruction or model), an action taken that should not have been
(instruction), the run held open past its budget (the harness's own control
flow — the owner [failure-attribution](./failure-attribution.md) says the funnel
cannot see), and whatever the suite adds for its own surfaces. They map onto
attribution's owners; they do not replace them. A family names where to *look*,
and it makes the attribution sample choosable: sample inside the family whose
count moved.

## Three ways a counter lies

- **Events summed instead of cases counted.** A total of error lines across a
  run cannot distinguish one case that failed ten times in a retry loop from ten
  cases that failed once, and those are different problems. Count a run once per
  family it hit. If an event total is useful, print it as a second column, never
  instead ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
- **One tally across outcomes.** A counter summed over every attempt mixes the
  failure that sank a case with the one a retry recovered from. Split every
  signature by the run's final outcome. A signature on *passing* runs is its own
  finding — a defect the scenario's assertions did not read — and is only
  visible if the signature is computed from the raw output on every run rather
  than from the checks the scenario declared.
- **A detector that cannot fire reports zero.** A syntax-error counter keyed on
  lines that *begin* with the interpreter's error name reads a raw traceback
  correctly and reads **zero** on the same error once a test runner prefixes its
  captured lines with a marker column — and zero again on a compiled language's
  error format. An elision detector that matches one comment syntax is blind in
  every language that uses another. The zero is rendered in the same cell as a
  clean zero ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).
  So each family prints how many runs *declared* a check of that family, and
  each raw detector is shown to fire, once, on each output format the suite
  produces, before its zeros are believed
  ([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## The counter is tested in both directions

A family scheme too coarse separates nothing; one too fine is a list of
scenario ids with a header. Check it on the suite's own history with the pair of
assertions that catches both:

- **It separates where the mechanism moved.** Among groups of runs with
  identical pass counts, some should show different families. Zero separations
  means the scheme adds nothing to the rate.
- **It agrees where only the cases moved.** Among tie groups whose members
  failed on *different* scenarios by the same mechanism, the profiles should
  match. If every tie group separates, the counter is reporting which cases
  failed, which the transcript list already did.

## What it does not license

A family count is a tell, not an attribution: an omitted action is the model's
or the instruction's, and the count cannot say which. It does not make two runs
comparable that were not (different attempt counts, different exclusions —
[selection-over-noise](./selection-over-noise.md),
[uncontrolled-games-beside-the-win-rate](./uncontrolled-games-beside-the-win-rate.md)),
and it never enters the pass rate: it sits beside it, the way the rate's
exclusions do.
