---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: parse-thresholds-from-prose
status: forged
laws: [law-and-check-share-one-source, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [extracting a checker threshold out of a written rule, a canon edit broke the parse, writing patterns that survive rewording]
---

# Parse thresholds from prose

Extract executable thresholds only from a declared, constrained rule grammar.
Arbitrary prose is not a safe numeric interface: punctuation can carry the sign,
comparison operator, interval bounds or approximation policy that determines the rule.
The extraction must preserve these meanings as well as the magnitude.

## Preserve semantics before tolerating typography

A pattern that skips all non-digits can read a negative duration as a positive
duration, or read a minimum as a maximum. Matching the metric name and finding a number
does not establish that the sentence still states the same constraint. Decimals,
negation, multiple clauses and several numbers introduce further ambiguity.

Define accepted forms for each rule: its unique identity, metric, signed numeric
format, operator, unit and basis. Normalize only explicitly equivalent typography.
An approximation symbol is not equivalent to equality unless the rule declares its
tolerance. An unsupported wording is a parse error, even if a number can be extracted.

For free-form explanation, prefer one structured authoritative rule from which the
readable statement and checker inputs are generated. That still provides one authored
authority. Do not maintain a separately edited numeric copy of the same requirement.

## Fail before evaluating artifacts

Load and validate the complete rule set before any conformance run. A missing rule,
duplicate identity, ambiguous match, invalid numeric value, unsupported unit or
inconsistent interval prevents evaluation. Name the rule and expected form in the
diagnostic. Never substitute a default that presents an unread rule as enforced.

Module initialization is one possible boundary; explicit startup validation also works.
An unrelated diagnostic command need not become unavailable because a rule cannot load,
provided it does not emit conformance verdicts based on that rule.

## Carry the unit and basis

Convert percentages to fractions, or durations to the chosen time unit, once at the
boundary. Preserve the operator, inclusive or exclusive bounds, reference quantity and
original rule identity alongside the value. Descriptive names reduce mistakes but do
not replace dimensional checks. A tolerance around zero needs an absolute rule rather
than an undefined relative division.

## Procedure

1. Resolve exactly one authoritative rule by identity.
2. Parse the whole supported constraint, including its operator and signed value.
3. Reject unrecognized clauses and ambiguous matches; do not salvage their digits.
4. Validate finite values, permitted ranges, units and ordered interval bounds.
5. Convert once and pass the typed constraint to the checker.
6. Test equivalent supported typography and meaningful mutations: sign changes,
   reversed comparisons, decimals, negation, duplicate rules and changed units.
7. Confirm that a permitted threshold change alters the checker boundary, while an
   unsupported wording prevents the run. Historical wordings are useful fixtures, not
   a requirement to accept every phrasing.

## Decision rules

- Parse separate class-specific rules by stable identities; positional extraction can
  silently exchange bands after a sentence is reordered.
- Parser length does not establish whether a rule is clear. Choose a structured source
  when the supported grammar becomes difficult to audit.
- For geometric or monotonic requirements, check the declared property over the intended
  domain. A few sampled values or nearly constant ratios do not establish a global law.
- Frequent rule changes require versioned inputs and invalidation, not a period during
  which the checker silently stops following the canon.

## When not to use this

Use a structured authority for tables, complex expressions or unrestricted prose.
If the checker cannot read the authoritative source, report the missing dependency and
withhold its verdict. A manually synchronized number is a separate authority until the
coupling is implemented and verified.
