---
layer: technique
type: technique
subject: multi-jurisdiction-hiring-compliance
technique: codified-threshold-only-where-one-exists
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [a jurisdiction has no numeric fairness standard, a fairness gate needs a pass line, reviewing a compliance field that is null]
---

# Codified threshold only where one exists

## The concern

A fairness gate wants a number. A product manager wants a green badge. A
dashboard wants a bar with a line on it. All three pressures push toward
filling an empty legal cell with a plausible figure, and the plausible figure is
always the same one: the four-fifths selection-rate ratio from a decades-old
national employee-selection guideline, because it is the only number in the
domain that everyone has heard of.

Applying it to a jurisdiction that has not codified it is inventing law. The
product then enforces the invented standard, produces adverse outcomes
justified by it, records that it did so, and hands a future claimant a written
admission that the employer applied a threshold its own legislature declined to
set — and, worse, is bound by it in the eyes of anyone reading the record, even
where the local test would have been more forgiving.

## The state of the world

Duties without numbers are the norm. Regimes commonly require: that AI not
produce a discriminatory effect; that impact ratios be computed and published;
that a human review adverse decisions; that use be disclosed in advance; that
worker representatives be notified. None of those is a threshold. Even the
jurisdiction that mandates an annual independent bias audit and the publication
of impact ratios does not set a pass line — falling below the familiar figure
draws attention, it does not constitute the violation.

So the honest field is **nullable**, and in a catalog of eight jurisdictions
you should expect seven nulls. If your catalog has a number in most rows,
someone has been filling cells.

## Procedure

1. **Model the field as a value-or-absent type**, not a number with a
   sentinel. Zero, `-1`, and `1.0` are all catastrophic defaults: zero makes
   every cohort fail, `1.0` makes every cohort fail, and any mid-range default
   silently becomes the company's standard.
2. **Name the test, not just the number.** Where a codified test exists, store
   the instrument and the figure together, because the figure without its
   instrument cannot be defended and cannot be checked for currency.
3. **Render the null as a sentence, not a blank.** "This jurisdiction has not
   codified a numeric adverse-impact threshold" is a finding. An empty cell
   reads as "we did not look", and a dash reads as "not applicable", which is
   false — the duty exists, the number does not
   ([law](../../_laws.md#absence-of-evidence-is-not-evidence)).
4. **Compute anyway; judge separately.** Absence of a codified line does not
   mean absence of a measurement. Compute the selection-rate ratio, present it
   with its cohort sizes and its basis
   ([law](../../_laws.md#a-claim-carries-its-sample-and-its-basis)), and let a
   human read it. What you must not do is attach an automatic pass/fail verdict
   derived from another jurisdiction's number.
5. **If an internal bar is wanted, mark it internal — loudly.** A team may
   legitimately adopt a house standard stricter than the law. It must be
   labelled as a policy choice, attributed to the person who set it, and
   rendered in different language from a statutory test. "Below our internal
   review trigger" and "below the statutory threshold" must never be the same
   string, because one is a management decision and the other is a legal
   conclusion.
6. **Never let an internal bar drive an automated adverse action.** A house
   number may open a review, hold a cohort, or raise a flag. It may not reject,
   because a rejection justified by an invented threshold is the exact artifact
   this technique exists to prevent.

## Decision rules

- When the catalog's threshold field is null and a gate needs a verdict, the
  verdict is *no codified standard — human review required*, which is a
  distinct outcome from pass and from fail.
- When a jurisdiction requires publication of ratios without a pass line,
  publish the ratios and publish the absence of a line alongside them. Omitting
  the second sentence lets every reader supply the familiar number themselves.
- When someone asks "what number do we use here", the answer is a question:
  which instrument codifies it. If no instrument can be named, no number is
  used.
- When a codified figure exists, apply it only within its own jurisdiction's
  scope, and only to the population that jurisdiction covers. A national
  convention does not travel with a candidate who applies from abroad.
- When a threshold is later codified somewhere, the change is a catalog edit
  with a new as-of date — not a code change, and not a retroactive re-judgment
  of cohorts already assessed under no standard.

## When not to use this

This technique governs *legal* thresholds only. Operational thresholds — a
sample size below which a ratio is not shown, a minimum cohort for a stable
proportion, a confidence floor — are engineering choices, must exist, and are
not constrained here; their craft belongs to the adverse-impact subject.

It also does not apply to contractual standards. If a customer contract or a
public commitment specifies a ratio, that ratio binds you by agreement and is
recorded as such, with the contract as its instrument. That is still naming the
instrument; it simply is not a statute.
