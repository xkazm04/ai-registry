---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: absent-score-is-its-own-tier
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [scoring did not run or failed for a candidate, a competency row has no assessed cell, sorting or filtering a list by score]
---

# An absent score is its own tier

Scoring does not always produce a number. The run failed, the document was
unreadable, the candidate applied before the rubric existed, the analysis was
refused on policy grounds, the assessment never reached that competency, the
job is still processing. In every one of those cases the correct value is
**not a number**, and the whole technique is refusing to let it become one.

The pressure is real: types are simpler when the field is non-null, sorts are
simpler when everything is comparable, averages are simpler when nothing is
missing. Each simplification buys convenience with a claim about a person that
nobody made — [absence-of-evidence-is-not-evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence).

## What each numeric default actually asserts

- **Zero** asserts *worst possible*. In any list sorted descending, the
  unscored candidate sinks to the bottom; in any pipeline with a minimum
  threshold, they are rejected on a figure nobody computed. This is the
  version that causes harm fastest.
- **A neutral midpoint** asserts *average*, and is worse in a subtler way: it
  is indistinguishable from a measured midpoint, so the unmeasured person is
  laundered into the measured population and no downstream consumer can tell
  them apart ever again.
- **The population mean** asserts *typical for this cohort* and additionally
  corrupts the cohort statistic it was drawn from.
- **A hundred** asserts *perfect* and is occasionally shipped by someone
  reasoning that a missing penalty should not penalize. It flatters, which is
  the direction the honest default must never take.

There is no safe number. There is only a distinct state.

## The procedure

**1. Model absence as a type, not a sentinel.** The score field is nullable
(or a tagged variant), and the absence carries a **reason**: not yet run,
failed, refused, out of scope, blocked on missing evidence. The reason is what
the recruiter and the candidate-facing process both need; "no score" alone
generates a support ticket.

**2. Render it as itself.** A dash, an em rule, "not assessed" — never a
greyed-out zero, never an empty gauge sitting at the bottom of its arc, which
reads as zero to every viewer. If the surface has bands, absence is an
additional tier with its own neutral treatment, present in the legend.

**3. Group it in sorts; never interleave it by an imputed value.** Unscored
candidates form their own block, sorting strictly after every scored one in a
ranked view — including after a genuine, measured zero, which an absent
measurement must never tie with or beat — and always as a visibly separate
group, so nobody reads position as performance. Filters treat "unscored" as an explicit selectable state, not
as a range that happens to catch it.

**4. When a filter hides rows, count the two reasons separately.** "12 hidden"
under a min-fit floor conflates candidates who scored below it with candidates
who were never assessed — and the second group is the one a recruiter would
want back. Report them as distinct counts, with an affordance to reveal the
unassessed. A floor is a statement about measured performance; it must never
quietly double as a way to discard the unmeasured.

**5. Exclude it from every denominator, and say so.** Averages, rates and
distributions are computed over the scored population, and the surface states
the base ("42 of 58 scored"). Silently dropping nulls from a denominator
produces an average that is right and a claim that is wrong.

**6. Block automated adverse routing.** An unscored candidate is not eligible
for any automated path whose outcome is adverse — no threshold rejection, no
bulk action, no auto-archive. They route to a human. **A blocked candidate is
not a bad candidate**: uncertainty resolves toward the candidate
([uncertainty-resolves-toward-the-candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate)),
and no adverse outcome is solely automated
([no-adverse-outcome-is-solely-automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated)).

**7. Apply the same rule one level down.** Inside a breakdown or a competency
matrix, a cell with no assessment is null, never zero. A null cell does not
contribute to a row average, does not tint like a low cell, and does not drag
a candidate's composite down. A row of nulls means *we did not look*, and the
row must say that rather than reading as a wall of failures.

## Decision rules

- **When a partial run produced some dimensions**, publish a partial score
  over the weight actually assessed, labelled partial, with the missing
  dimensions listed. Do not renormalize silently to a full-looking figure.
- **When absence is caused by your own constraints** — a queue backlog, a
  quota, an outage — the candidate's process must not stall on it. Score later,
  route now, and never let an operational absence turn into a decision.
- **When a positive-only affordance depends on the score** (encouraging copy,
  a "strong match" badge), unknown may be treated as false. When a *safety*
  predicate depends on it, unknown may never be treated as false.
- **Absence is not an error state to be cleared.** Resist the "backfill
  missing scores" job. Backfilling with a computation is fine; backfilling
  with a constant is the original sin at scale.

## When not to use this

- **Where a zero is genuinely measured.** A candidate assessed on a dimension
  and found to have no evidence of it scores zero, and that zero is real. The
  distinction between *measured zero* and *not measured* is exactly what this
  technique preserves; collapsing them in the other direction (calling every
  zero "unknown") is the mirror failure and equally dishonest.
- **In a strictly internal throughput metric** where nulls have already been
  filtered upstream and the base is stated. Even there, keep the base visible;
  the moment that number reaches a person it is a claim about a cohort.
