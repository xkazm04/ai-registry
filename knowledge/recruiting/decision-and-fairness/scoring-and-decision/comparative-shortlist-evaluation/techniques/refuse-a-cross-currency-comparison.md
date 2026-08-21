---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: refuse-a-cross-currency-comparison
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [comparing compensation expectations across candidates, assembling a prompt that compares people, handling incommensurable fields in a side-by-side view]
---

# Refuse a cross-currency comparison

Some fields look comparable and are not. Compensation expectations quoted in
different currencies are the clean example: two numbers, same field, same
meaning, and any comparison between them is false without a rate, a date, a
basis and a cost-of-living frame that the record does not hold.

The technique's rule is stronger than "caveat it," and stronger than "convert
carefully." It is: **when a field cannot be compared honestly, withhold it from
the comparer entirely.**

## Withholding beats warning

The instinct is to pass the values through with a note — "amounts are in
different currencies, interpret with care." This fails in every real pipeline,
for the same reason in each:

- A generating model handed two numbers will compare them. Instructions not to
  are soft; the presence of the data is hard. It will say over budget, under
  budget, cheaper, more expensive — fluently and with reasoning.
- A rendering surface will align them in a column, and column alignment asserts
  commensurability by geometry, whatever the footnote says.
- A downstream consumer reading the structured record will not carry the note.

The only reliable enforcement is at the boundary: the field never enters the
comparison context. A false claim that cannot be constructed is better than one a
guardrail is asked to catch. What the surface *may* do is show each figure on the
candidate's own record, in its own currency, where it is a fact about one person
and no comparison is implied.

State the withholding rather than hiding it —
[absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)
cuts both ways here. A silently missing compensation column reads as "nobody
stated an expectation," which is a different and equally false claim. The honest
render is: expectations recorded in differing currencies, not compared.

## Do not convert

Conversion is the other tempting escape and it is worse, because it produces a
comparable-looking number that carries invented precision. A converted figure
would need, to be defensible: the rate, the rate's date, the rate's source, the
gross/net basis on both sides, the local statutory contribution structure, and a
purchasing-power adjustment. Systems that convert supply none of these, and the
output is a claim the record cannot support —
[say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds).

The stakes are asymmetric, which is why the conservative rule wins. A withheld
comparison costs the recruiter one manual check. A wrong over-budget conclusion
removes a candidate from consideration on a false arithmetic fact they will never
see and cannot contest —
[uncertainty resolves toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## The family is larger than currency

Currency is the clearest case and the useful test case, but the rule generalizes.
Treat as incommensurable, pending an explicit and recorded mapping:

- **Compensation across currencies, and across pay bases** — annual against
  hourly, gross against net, with or without statutory contributions and
  variable pay.
- **Academic grades across national systems**, where scales differ in direction
  as well as in range, and a naive comparison can invert the ranking outright.
- **Credentials and licences across jurisdictions**, where the same title
  certifies materially different scopes of practice.
- **Tenure across employment norms**, where notice periods, contract structures
  and market norms make equal durations mean different things.
- **Seniority titles across organizations**, where the same word spans several
  levels of scope.
- **Scores produced under different rubric versions.** A verdict is bound to what
  it judged; two candidates graded on different rubrics have no shared axis.

For each, the same three-step handling: detect the mismatch, withhold the field
from any comparative context, and render each value on its own record with its
own frame.

## Procedure

1. **Detect at assembly time.** Compare the unit, currency, scale or rubric
   version across the cohort as the comparison context is built — not at render,
   not in a post-hoc validator.
2. **Withhold on mismatch.** Remove the field from every comparative payload,
   including the prompt handed to any narrating model, the ranked table, and the
   exported summary. Removal is per-field and per-comparison, not global: if the
   whole shortlist quotes one currency, the field is comparable and stays.
3. **Keep the per-candidate render.** Each figure remains visible on that
   candidate's own card in its own unit.
4. **Emit an explicit incommensurable state** so the reason is visible and
   sealed, and so a downstream consumer cannot mistake absence for zero.
5. **Forbid the derived claims that depended on it** — over-budget, under-budget,
   best value, cheapest — as a closed list, checked where the copy is generated.
6. **Provide the manual path.** A recruiter who wants the comparison converts it
   themselves with a rate they choose and can defend. The system's refusal is
   about what *it* may assert, not about what the recruiter may investigate.

## Decision rules

- When two or more distinct units appear in the cohort for a field, withhold it,
  regardless of how many candidates share the majority unit. A partial comparison
  over the majority silently excludes the minority candidate from a stated
  criterion, which is worse than not comparing.
- When the comparison is against a stated reference rather than between
  candidates — a role's budget band, a published range — the test is
  per-candidate against the reference's unit, and the withholding is
  per-candidate too. One candidate quoting a different currency loses only their
  own figure from the comparative context; the rest still compare honestly
  against the band.
- When a candidate's unit is missing rather than different, treat it as unknown,
  not as the cohort default. Assuming the local currency for an unstated figure is
  the same invention with a friendlier face.
- When an authoritative, recorded and dated conversion exists — an explicit
  budget in the candidate's own currency, a stated internal rate table — the
  comparison is permitted and must cite the basis it used.
- When only one candidate has a value at all, there is nothing to compare; the
  field is per-candidate information, not a comparative criterion.

## When not to use it

Do not use this to suppress uncomfortable but genuinely comparable data. Two
expectations in the same currency and the same basis are comparable, and refusing
to compare them is its own dishonesty.

Do not extend it into a general rule against numeric comparison. Scores from one
rubric, competency ratings on one scale, and years counted the same way are
commensurable by construction; over-applying the refusal produces a comparison
surface that compares nothing and gets bypassed by spreadsheet.
