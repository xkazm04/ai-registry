---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: graded-requirements-two-axes
status: forged
laws: [meaning-does-not-live-in-a-label, inference-must-look-like-inference]
shared_with: []
use_when: [turning a must/nice list into a decision-ready record, designing the requirement row of a hiring brief, a screen rejects on the wrong requirement]
---

# Graded requirements on two axes

A requirement in a hiring brief has to answer two **independent** questions,
and a single must/nice flag answers only the first:

1. **Necessity — does its absence disqualify?** Is this a bar the candidate
   must clear, or something that improves them without gating them?
2. **Acquirability — must they arrive with it?** Is this a prerequisite they
   have to walk in holding, or is it learnable at acceptable cost once they
   are here?

They are not the same question, and the four cells of the grid are all real
hires. Collapsing them produces the classic pathology: a list of nine
"required" items of which two are genuine bars, and a screen that rejects a
strong candidate for missing the seventh.

## The grid

| | **Prerequisite** (must arrive with it) | **Learnable** (acquirable on the job) |
| --- | --- | --- |
| **Must-have** | the licence, the working language, the legal right to practise — a hard gate | the core of the job that nobody in the market has: they must end up able to do it, and you will teach them |
| **Nice-to-have** | a credential you would be pleased to see and will not develop internally | the ordinary tool list: pleasant on arrival, taught in a fortnight |

Keep both vocabularies closed and two-valued. Their value is that every
downstream consumer knows exactly what to do with each cell: the top-left cell
gates, the bottom-right cell must never gate, and the two off-diagonal cells
are where the interesting hiring decisions live — the must-learnable is the
cell that lets a team hire for potential without pretending the requirement is
optional, and the nice-prerequisite is the cell that stops "would be lovely"
from quietly becoming a filter.

A brief that can only express the diagonal — hard musts and soft nices — has
one axis wearing two names, and it will systematically mis-handle exactly the
candidates worth arguing about.

## Acquirability is the regulators' line, and it is a time

This axis is not a design novelty. The US selection guidelines already draw it:
content validity "is also not an appropriate strategy when the selection
procedure involves knowledges, skills, or abilities which an employee will be
expected to learn on the job" (29 CFR 1607.14(C)(1)), and users "should avoid
making employment decisions on the basis of measures of knowledges, skills, or
abilities which are normally learned in a brief orientation period, and which
have an adverse impact" (1607.5(F)). That second clause is a caution, and it
applies where adverse impact exists; it is not a flat ban. The US federal
job-analysis template states the rule directly: "Only those competencies that
applicants are expected to possess the first day on the job are appropriate to
use for selection purposes".

The same template also shows that the axis is graded, not binary. It rates
need-at-entry on four points: needed the first day, within three months,
within four to six months, and after six months. A competency counts as
critical at an average of 2.0 or below, so "within three months" still counts
as at entry. Keep the brief's two-valued vocabulary for the decision, but
store the horizon the requestor gave. "Learnable" means learnable inside this
role's actual ramp, and the sibling subject **requirement inflation control**
treats the grade as a statement about time for exactly this reason.

## Weight ranks within a kind; it is not a third axis

Alongside the two axes each requirement carries a **weight**: a continuous
importance in a bounded range that ranks it *against the other requirements of
the same kind in this brief*. It exists because "must speak the local
language" and "must have seen this tool once" stop being the same claim only
when something separates them.

Weight is within-kind and within-brief. It is not a probability, not a score,
and it is meaningless across roles — the first misuse anyone attempts is
averaging weights across requisitions. And it never encodes gating: **weight
1.0 does not mean disqualifying, only the necessity axis does.** Systems that
express gating as a weight threshold acquire an invisible, drifting cutoff
that nobody voted for.

## The lift from a flat list is a default, not a judgement

Most requirements arrive already flattened: a template, a previous
advertisement, a manager who thinks in two buckets. The mechanical lift is
worth doing — must-haves become prerequisites at a high default weight,
nice-to-haves become learnables at a low one — because a graded record with
honest defaults is strictly more useful than an ungraded one.

But notice what the lift does: it places every requirement on the **diagonal**
of the grid, which is the one thing the two axes exist to stop being
automatic. The lift cannot know which musts are learnable; it can only assume
none are.

But the lift **must be marked as what it is**. The grading was produced by a
rule, not by anyone's assessment of this role, and it must not present itself
as the requestor's considered judgement. Two consequences follow, and skipping
either of them is where teams go wrong:

- The grading carries a basis of *default*, never *stated*, until a human
  touches it. It is a schema-shaped guess in exactly the sense that
  [inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
  is about — and a default is a weaker claim than an inference, since no
  evidence was even read.
- The review surface shows the grade as adjustable and visibly untouched, so
  the requestor's attention lands on the ones that are wrong. The point of a
  default is to give a human something to correct, not to spare them the
  correction.

The inverse error is refusing to grade until someone confirms every item. That
leaves the requirements list ungraded — which downstream consumers read as
*uniformly critical*, the harshest possible reading, and the one that produces
the most false rejections.

**A lifted or fallback grade may be displayed, but it may not gate.** The
diagonal lift puts every must-have in the prerequisite cell, the one cell
that excludes people, and marking it `default` protects nobody if a
downstream rubric reads the cell and ignores the basis. The same trap sits in
every coercion that fills a missing or unrecognised grade: the fallback
chooses a cell. Make it the non-excluding cell. Where the necessity is known
but the acquirability is not, a must-learnable still ranks as a must, excludes
no one, and shows the requestor exactly which row they have not yet graded.

There is one exception, and it is about who authored the list, not about the
lift. When the source list was published to candidates as what they "must
possess in order to be considered", the organisation stated the prerequisite
itself: the US federal-contractor rule treats such advertised qualifications
as basic qualifications (41 CFR 60-1.3). Only a flat list of unknown meaning,
such as a template, a generated specification or an internal wish list, lifts
to a default.

## Decision rules

- **When a condition is named as a hard bar, it becomes a must-have
  prerequisite at the moment it is said** — one row per condition,
  immediately, before any discussion of how negotiable it is. Later laddering
  may demote it to a nice-to-have or reclassify it as learnable; **it never
  deletes the row.** A requirement that vanishes because it turned out to be
  soft takes its source and its story with it, and the next reader cannot tell
  it was ever considered.
- **When a requirement's kind is uncertain, grade it down, not up.** A
  learnable wrongly graded is recoverable in an interview; a prerequisite
  wrongly graded silently removes people from the pool before anyone looks.
- **When a requirement is expressed as a duration** ("five years of X"), store
  the underlying capability as the requirement and the duration as a separate,
  softer attribute. Years are a proxy for a capability and a poor one (pre-hire
  experience correlates .06 with job performance, Van Iddekinge et al., 2019;
  Sackett et al., 2022, put experience at .07). Van Iddekinge et al. name the
  exception worth keeping: prehire experience "is somewhat more predictive of job
  performance when workers first start a new job", so the softer attribute
  still carries a little signal and should be kept, not deleted. A brief
  that stores only the proxy has lost the thing it was proxying for, and
  [meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label).
- **When two requirements are always asserted together**, keep them as two
  rows. Merging them makes the compound un-gradeable and un-removable.
- **Pin the grading vocabulary to whatever the matching stage already
  speaks.** A brief that grades on axes the screening engine cannot read
  projects onto it lossily and re-invents the flattening it was built to
  prevent. Where the projection does drop something — weight and rationale
  usually survive nowhere downstream — the brief stays the richer record and
  the loss is documented, not discovered.

## When not to use this

- **When the brief is being rendered for an audience.** An advertisement or a
  candidate-facing summary should not expose weights; publishing internal
  comparative weights invites gaming and reads as a scoring scheme applicants
  can litigate. Render kinds as language, keep weights internal.
- **When there is genuinely one requirement.** Weighting a single item against
  itself is theatre; grade the kind, leave the weight at its default.
- **When no cell of the grid fits the item.** That is usually a sign it is not
  a requirement at all but context — belonging in a facet, with the story
  attached — rather than a sign the grid needs a fifth cell.
