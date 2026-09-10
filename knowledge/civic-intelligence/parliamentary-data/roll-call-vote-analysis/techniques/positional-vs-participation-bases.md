---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: positional-vs-participation-bases
status: forged
laws: [missing-is-not-zero, one-definition-one-import]
shared_with: []
use_when: [choosing a denominator for any vote metric, an attendance and a discipline metric disagree, a rate looks implausibly high or low]
---

# Positional vs participation bases

For roll-call rates, the denominator defines the claim.
The choice vocabulary yields two canonical bases, and every metric in the
pipeline names which one it stands on:

- **The participation base (present):** choices that the source defines as registered or participating — yes, no, abstain, not-voting, and any
  source-merged abstain/not-voting category. This supports recorded voting participation; it need not measure physical
  presence or all parliamentary work.
- **The positional base:** the choices retained by this subject's binary definition — **yes and no**.
  This is the base for the binary metrics described here: party lines,
  rebellion, cohesion, pairwise agreement. Abstention, not-pressing, the
  merged bucket, excusal and absence are all *non-participation* with respect
  to position, and they never count as agreement or as rebellion.

The two bases are exported constants defined once beside the choice
vocabulary. A metric that lists its qualifying choices inline has forked the
definition, and the fork will drift.

## Why this binary measure excludes abstention

The temptation is to read abstention as "half a no" or "soft defiance", and
some chambers' voting arithmetic encourages it (where passage requires a
majority of those *present*, an abstention has the mechanical effect of a no).
Resist encoding that into the base. The mechanical effect on the outcome is a
fact about the *threshold rule* of that vote and belongs in the outcome
layer; the binary metric excludes abstention; it does not establish hesitation or
absence of political intent. Other declared metrics can analyze abstention
separately without presenting them as the same yes/no measure. Where the effect matters — a member whose abstentions repeatedly
sank their own party's motions — it is a story for the interpretive layer,
argued from the outcome arithmetic, not a silent redefinition of the base.

## The decision rules

- **When a metric measures side-taking** (line, rebellion, cohesion,
  agreement), use the positional base, and let the metric go to *not
  measured* when the base is empty — a member with no positional votes has no
  rebellion rate, not a rate of zero. Missing is not zero.
- **When a metric measures presence** (attendance, participation rate), use
  the participation base, and treat excused absence as its own category —
  "excused" and "unexcused" are different facts the source distinguishes on
  purpose.
- **When the two bases tell different stories, publish both.** The member who
  is 98% loyal on the positional base but present for only 40% of divisions
  is the interesting case, and the divergence is only visible if neither
  number absorbed the other. This is also the honest answer to strategic
  absence: a positional rebellion metric cannot see the member who skips
  votes to avoid defecting on the record, and no denominator trick fixes that
  without breaking the metric's meaning. The participation number beside it
  is the disclosure.
- **Name numerator and denominator separately.** Positional votes divided by
  registered participants validly measures the share taking a yes/no position;
  it is not a rebellion rate. Validate the subset relation and handle a zero
  denominator. Participation eligibility must respect mandate dates, oath or
  voting rights and documented missing divisions, rather than all term votes.

## Eligibility is an additional filter

Some metrics need more than a base — they need per-observation eligibility.
A rebellion rate only counts votes where the member was positional *and*
their party had a non-tied line; a pairwise agreement only counts votes where
*both* members were positional. Eligibility filters compose on top of the
base; they do not replace it. Name them in the output ("eligible votes", not
"votes"), because a reader who assumes the denominator is "all divisions"
will misread every rate.

## When not to use it

- A member without a resolved group has no group-line rebellion rate, but can
  still have pairwise agreement or participation metrics on supported ballots.
- Additional bases require a separate named question and method. Do not silently
  change the qualifying choices of an existing metric per surface.
