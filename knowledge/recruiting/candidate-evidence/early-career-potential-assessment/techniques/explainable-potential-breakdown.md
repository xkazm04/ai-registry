---
layer: technique
type: technique
subject: early-career-potential-assessment
technique: explainable-potential-breakdown
status: forged
laws: [say-only-what-the-record-holds, no-adverse-outcome-is-solely-automated, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [presenting a potential score to a recruiter, writing feedback for an early-career candidate, designing the output contract of a match score]
---

# Explainable potential breakdown

A potential score that arrives as one number is unusable in both directions. A recruiter
cannot act on it — they can only trust or ignore it. A candidate cannot learn from it.
A reviewer cannot contest it. And when someone asks why one graduate was advanced and
another was not, the answer is a number, which is not an answer.

The technique: **the score is emitted as a per-dimension account with labels that fit
the population, and no dimension appears without its basis.** Explainability here is not
a UI nicety bolted on afterwards; it is the shape of the output contract, decided when
the rubric is designed.

## What the breakdown carries

- **Every dimension, including the unmeasured ones.** A dimension with no input renders
  as *not measured*, visibly, with the reason. Dropping it silently is how a four-part
  score becomes an unexplained three-part one and how a candidate never learns that a
  blank field cost them.
- **The weight beside the sub-score.** A reader cannot judge whether a low depth score
  mattered without knowing depth carries the most weight. Hiding weights makes every
  breakdown a set of numbers whose consequences are invisible.
- **The basis for each sub-score** — what in the file produced it. "Depth: strong,
  from a two-year thesis and one extended project" is reviewable; "Depth: 0.8" is not.
- **The population label the score was computed under**, so nobody compares a potential
  score against a tenure score as though they were the same axis.

## Labels follow the population

The dimension a candidate sees should describe what was actually measured for *them*.
Where an experienced candidate's breakdown says career, an early-career candidate's
should say potential; where one says personal fit against a role's stated culture, the
other may say fit differently, because different inputs went in. The renaming is not
cosmetic kindness — it is accuracy, and it prevents a recruiter reading "career: low"
about someone who has not had one.

Two rules keep the renaming honest. First, the label is presentation; nothing downstream
may key off the displayed string, because renamed labels are exactly where meaning
leaks out of a system ([meaning-does-not-live-in-a-label](../../../_laws.md#meaning-does-not-live-in-a-label)).
The stable dimension identity stays constant underneath and every rule, filter and
metric keys off that. Second, the label set is declared once, in one shared contract
consumed by every surface — the scoring pipeline, the recruiter view, the candidate
view, the export. A second copy of the label map in a front end is a guarantee that
some surface will show a candidate a dimension name that stopped being true two
releases ago.

## Visible separation beats silent interleaving

A recruiter's list is where the breakdown finally lands, and there is a real choice
there with a counter-intuitive answer. Interleaving early-career candidates into one
ranked list beside experienced ones *looks* like equal treatment and is not: the ranking
is computed on a scale with a tenure-flavoured history, and the early-career candidates
sink to the bottom by construction, where nobody scrolls.

Show them as their own group instead, with the rubric named on the group and the
protections stated in plain words — scored on potential, adverse decisions stay with a
person. This costs an optics argument ("are we second-class?") and buys the thing that
actually matters, which is being read at all. The framing that resolves the argument is
*different rubric, same bar*: the separation is in what is measured, never in how high
the bar sits.

## Decision rules

- **State only what the record holds.** A breakdown line that says "limited practical
  experience" when the file simply lacks an artifact is a claim about the person that
  nobody made ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)).
  Say what was absent, not what its absence implies. Never advise a candidate to add
  something their own file already shows.
- **A breakdown explains a recommendation; it never authorizes an adverse outcome.**
  However legible the account, the rejection is made by a named person
  ([no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)).
  A well-explained automatic rejection is still an automatic rejection — the quality of
  the explanation is not the safeguard.
- **The recruiter-facing and candidate-facing breakdowns share their facts and differ in
  their framing.** They must never differ in their content: a system whose internal
  reason and stated reason diverge has built a record it cannot show, and the record is
  what a challenge is decided on.
- **When a dimension's inputs were degraded** — a model unavailable, a document
  unreadable, a source skipped — the breakdown says so at the dimension, not in a
  footnote. A silently degraded sub-score is worse than a missing one.
- **Round to bands where the reader will over-read precision.** Strong / adequate /
  limited / not measured survives contact with a human better than two decimals, and a
  band is a more honest description of what a four-input rubric actually resolves.

## When not to use it

- **Not as a substitute for feedback the candidate asked for.** A breakdown is an
  internal instrument; the dignity of a rejection is a separate discipline with its own
  standards for what to send and when.
- **Not where the breakdown would expose another candidate's data.** Comparative
  framing ("scored below the median of this pool") is a claim about a cohort and
  requires the sample discipline that comparative claims carry — and often should
  simply be omitted from anything the candidate sees.
- **Not as an argument to expose the raw weights externally in every context.** Publish
  what the dimensions are and what they value; publishing an exact weight vector to
  applicants converts the rubric into a target and rewards gaming rather than growth.
