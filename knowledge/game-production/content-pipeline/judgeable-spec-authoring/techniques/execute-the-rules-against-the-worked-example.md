---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: execute-the-rules-against-the-worked-example
status: forged
laws: [structural-proof-is-never-sufficient, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a spec states a composition or format rule and shows a resolved example, auditing artifacts no finding has flagged, a rule has passed review repeatedly, checking a spec before submitting it for grading]
---

# Execute the rules against the worked example

The named concern: **a spec whose stated rule and whose own worked example do not
produce the same result.** Almost every spec that composes something — a display string,
an identifier, a payload, a filename, a formula — contains both a rule and an example of
the rule applied. They are rarely checked against each other, and a reviewer checks them
first.

## Why it survives review

Read separately, both halves are convincing. The rule is a reasonable rule. The example
is a plausible output. A human reader who already understands the intent reconstructs the
correct behaviour from the pair without noticing they disagree — which is exactly why the
defect persists across multiple review rounds.

The worked case: three artifacts described a composed string as *"A, followed by B"*,
while all three showed a resolved example that only works if B already **contains** part
of A. Composed literally, the stated rule renders a duplicated token. It had passed review
three times. Mentally executing the rule against the artifact's own example found it in
minutes.

A second instance from the same corpus: a progress chip specified as `{Progress} /
{Threshold}` *followed by* a pluralised message, which renders `0 / 1 1 kill` — and the
resolved example in the same artifact showed the correct output, not the one the rule
produces.

**Neither defect appeared in any finding.** They were found by audit, not by repair.

## The procedure

For every rule in the artifact that produces an output:

1. **Take the artifact's own example inputs.**
2. **Apply the rule as literally written** — not as intended, not as understood. Read it
   the way a reviewer with no context would, and the way an implementer would code it.
3. **Compare to the artifact's stated output.**
4. When they differ, decide which is right — usually the example, because it was written
   while thinking about the real case — and correct the other.

Then extend the same execution to the categories authors most often get wrong:

- **Composition and concatenation** — separators, whether each segment owns its own
  separator, what happens when a segment is empty.
- **Ordering and precedence** — where a clamp sits relative to a multiply, which of two
  simultaneous writes wins.
- **Boundaries** — the first element, the last, the empty set, the single-element set.
- **Interpolation** — what a token expands to when its value is absent or zero.

## Audit even where no finding points

This is the technique's real value and the reason it is worth doing routinely. The
highest-value single fix in one measured pass appeared in no finding at all. Graders
report what they notice; a rule that a reviewer happens to read charitably in one pass is
still a defect that will be caught in another, and it is cheaper to find by audit than to
discover in the next round of grading.

**Execute the artifact's rules against the artifact's own examples; do not read them.**

## Decision rules

- **When a spec states a rule and shows an example, execute one against the other before
  submitting.**
- **When rule and example disagree, prefer the example as the statement of intent** — then
  fix the rule to produce it.
- **When a rule composes segments, state which side owns the separator.** This single
  ambiguity produces most composition defects.
- **When auditing, do not restrict yourself to the reported findings.** Both worked cases
  above were invisible to the grader that had already reviewed them.

## When NOT to use this

- **Do not treat a deliberately abbreviated example as a contradiction.** Examples are
  sometimes elided for readability; if so, say the example is partial, and then it is not
  claiming to be the rule's output.
- **Do not rewrite a correct rule to match a wrong example.** Where the example is the
  error — a hand-typed output that was never regenerated — the fix belongs to
  `interpolated-counts-over-typed-counts`, which prevents the class outright by
  generating the example from the rule.
