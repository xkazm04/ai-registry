---
layer: technique
type: technique
subject: quality-gates
technique: vacuous-by-evaluation
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
  - count-carries-predicate
shared_with: []
use_when: [a rule set reports conformant on data you know is wrong, a checker runs with an inference or expansion layer beneath it, deciding whether a green rule was satisfied or was unfalsifiable, seeding a violation to prove a rule can fire, a schema rule and its type declaration say the same thing]
---

# Vacuous by evaluation

The subject's foundational test is **name the input that makes it block**, and
the golden path lists three ways a check fails it: severity set to advisory,
a threshold beyond any reachable count, findings printed where no exit code
reads them. All three are defects of *plumbing*, and all three are found the
same way — trace the path from the finding to the merge decision and believe
only what it can do
([severity-by-construction](./severity-by-construction.md)).

There is a fourth, and tracing the plumbing does not find it, because the
plumbing is correct. The rule is wired to a blocking severity. The exit code
depends on it. The engine runs, reads the real target, and reports. And the rule
still cannot fail — because **the layer that evaluates it supplies the very
condition it tests**. The gate is enforced by construction and empty by
semantics, and the only observable difference between "this data is conformant"
and "this rule is incapable of objecting" is that both print the word
*conformant*.

## Where a predicate gets satisfied by its own evaluator

The pattern needs two things that are individually good ideas: a rule language
that states constraints, and an evaluation layer that *derives* facts before the
constraints are checked. Inference, entailment, defaulting, coercion, schema
expansion, normalization — the layer exists to save the author from restating
what the model already implies. Then a constraint asserts something the
derivation layer produces on its own, and the check becomes a tautology:

- **A rule that asserts a value's declared type**, evaluated with a regime that
  *infers* the declared type onto every value it sees. Every value now carries
  the type; nothing can violate it; non-conforming data reports clean.
- **A range or domain constraint** duplicated by a normalizer that clamps
  out-of-range values before validation reads them.
- **A required-field rule** downstream of a defaulting step that fills the
  field.
- **A cross-reference check** run after a step that creates the referent when it
  is missing.

In each case the author wrote a real constraint and the pipeline quietly
guaranteed it upstream. The gate is not misconfigured; it is answering a
question that the input can no longer get wrong
([gate-sees-target](../../../../_laws.md#gate-sees-target)) — it sees a target
already conformed to it.

Note that the fix is rarely to delete the rule. The rule is usually the one you
want; what is wrong is *where in the pipeline it runs* relative to the layer
that derives. The same constraint over the raw input is exactly the check the
author intended.

## Detection: a rule that never fired is a rule that may be unable to

The diagnostic is the subject's existing one, applied per rule rather than per
job. [gate-liveness](./gate-liveness.md) says to seed a known violation and
watch the gate go red; this technique is the reason that discipline has to reach
**rule granularity**, because a rule set is scored as a unit and a single
vacuous rule inside a red-capable set is invisible. Three cheap probes, in
increasing cost:

- **Seed a targeted counterexample per rule.** Construct input that violates
  exactly this constraint and assert it is reported. A rule with no such
  fixture has never been shown to be a rule. This is the only probe that
  actually proves the thing, and it is the one that scales worst — which is why
  the two below exist as filters.
- **Run the set twice, with the derivation layer off and on, and diff.** Rules
  whose verdict is identical in both runs and passing in both are the suspects:
  either the data genuinely satisfies them, or the derivation is what satisfies
  them, and a targeted counterexample separates those in one test. This probe
  costs one extra run and indicts a whole class at once. Where the evaluator
  cannot be run without its derivation layer, the equivalent is validating a
  fixture that is deliberately wrong and confirming it is still wrong on the
  other side.
- **Read every constraint against what the derivation layer produces.** A
  constraint whose predicate is a fact the layer is documented to derive is
  vacuous on inspection, before anything runs.

Report the result as a count with its predicate attached
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"eighteen rules, twelve with a firing counterexample" is a finding; "eighteen
rules, all passing" is the sentence this technique exists to distrust.

## Why this is worse than an unfireable threshold

A misconfigured severity is discovered the first time somebody looks at the
config, and everyone who looks at it is qualified to see the problem. A vacuous
predicate is discovered by someone who understands both the rule language *and*
the evaluation semantics beneath it, which is a much smaller set than the people
who will read the green result and act on it. So it survives longer, and it
survives in exactly the settings that attract this kind of tooling —
conformance, compliance, data-contract enforcement — where a clean report is not
merely reassuring but is *filed*, and where the downstream reader has no way to
distinguish a validated artifact from an unvalidatable one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- **A passing rule is not evidence until something has made it fail.** Green is
  the state a broken rule and a satisfied rule share.
- **Ask what the evaluator derives before asking what the rule asserts.** The
  overlap between those two sets is the vacuous region.
- **Validate before the layer that conforms, or accept that you validated the
  layer.**
- **Liveness is per rule, not per rule set.** A red-capable set can contain any
  number of rules that cannot go red.
- **Where the derivation layer is switchable, a passing run with it off is the
  cheap proof; where it is not, a deliberately-wrong fixture is.**
- **Never report conformance without reporting how many rules were shown able
  to refuse.**
