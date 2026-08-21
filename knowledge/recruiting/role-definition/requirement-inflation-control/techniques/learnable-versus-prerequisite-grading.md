---
layer: technique
type: technique
subject: requirement-inflation-control
technique: learnable-versus-prerequisite-grading
status: forged
laws: [uncertainty-resolves-toward-the-candidate, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [grading a requirement as must or nice, a requirement list is all musts, implementing the must/nice partition in tooling]
---

# Learnable versus prerequisite grading

The grading axis is not importance. It is **time**: can this be acquired
inside the role's ramp by someone who has the other prerequisites?

- **Prerequisite** — must exist at hire, because the outcome that needs it
  arrives before the learning could. This is what "must-have" means, and it is
  a hard filter.
- **Learnable** — acquirable during the ramp. This is what "nice-to-have"
  means. It never filters; at most it breaks a tie, and it is often better
  expressed as an illustrative example than as a criterion at all.

Stated that way, the two labels stop being intensity words and become a
question with an answer. "Is this important?" cannot be adjudicated between a
requestor and a recruiter. "Would someone with the other four pick this up
before day ninety?" can.

## The axis is independent of the must/nice grade

The two are usually implemented as separate fields, and they must stay
separate. The tempting simplification — musts are prerequisites, nices are
learnable — makes the most diagnostic item in the taxonomy inexpressible: the
**learnable must-have**, a requirement the requestor insists on that someone
could nonetheless acquire during the ramp. That item is the single richest
output of the whole grading pass. It is the one that gets demoted on review,
the one that opens a role to a wider pool, and the one every ratio below is
computed from. A system whose deterministic path stamps hardness from kind can
never surface one, and its downstream trainability signal is then measuring a
constant.

So: grade kind and hardness in two passes, and let them disagree. Where a fast
path must default the second field, the default is an *assumption* and is
labelled as one, not a derivation presented as a finding.

## What the axis fixes

Grading by importance produces the all-musts list, and it produces it
honestly: everything on a requirement list is important, or it would not have
been mentioned. The requestor is not exaggerating when they call twelve things
essential; they are answering a question that has no discriminating answer.
Replacing the question is more effective than disputing the answers.

The time framing also relocates the cost correctly. A skill can be genuinely
valuable and still learnable in three weeks — in which case filtering on it
discards strong candidates to save three weeks of ramp, and stating it that
way is usually enough. Conversely a modest-sounding capability whose absence
blocks a day-thirty outcome is a real prerequisite however unglamorous. The
axis promotes as often as it demotes, which is what keeps it from reading as
a cost-cutting device.

## The grading procedure

1. **Establish the ramp.** How long before this person is expected to be
   producing independently? Grading without that number is guesswork, and the
   number varies enormously by role and by team capacity to teach.
2. **For each requirement, ask the acquisition question.** "Someone who has
   the rest of this list but not this one — how long until they have it?"
   Under the ramp, it is learnable. Over the ramp, or blocking an outcome that
   lands before the ramp ends, it is a prerequisite.
3. **Ask who would teach it.** A capability that is technically learnable but
   that nobody on the team has the bandwidth to teach is, for this
   requisition, a prerequisite. This question surfaces a real constraint the
   requestor knows and rarely volunteers, and it prevents the axis from
   becoming naively optimistic.
4. **Grade the evidence, not the label.** What makes a prerequisite gradeable
   is the demonstration that would satisfy it, not the word that names it.
   A grade attached to a display string will be enforced against the string
   ([meaning-does-not-live-in-a-label](../../../_laws.md#meaning-does-not-live-in-a-label)).
5. **Record the grade with its reason.** "Prerequisite — the first close is in
   week three and there is no one to cover it" survives review. A bare grade
   gets re-argued by every reader.

## The ratio is a signal about the role

Once a list is graded, the proportion of the *must* list that turns out to be
learnable is diagnostic, and it reads in both directions.

- **Mostly learnable musts** — the role was specified as a *person*, not as
  work: a portrait of an ideal hire whose attributes were all promoted to
  filters. The remedy is the outcome filter, not more grading.
- **No learnable content at all** — the role was specified as a *replacement*,
  usually for whoever left. A role with nothing to learn attracts nobody who
  wants to grow into it, and it is the shape most likely to have been built by
  reading the departed person's history backwards.
- **A healthy list** has a small prerequisite core with the rest expressed as
  preferences and examples, and the core's items each name what would
  demonstrate them.

The same ratio, computed from the other side, is a serviceable proxy for how
*trainable* a role is when comparing roles or reporting on a portfolio of
requisitions — with the usual caution that a ratio over a handful of
requirements is a description, not a measurement, and should not be
rendered as a score with a precision the sample cannot support.

## The partition must fail in one direction only

Must and nice are usually derived from one graded list by a partition rule,
and that rule gets re-implemented wherever the list is consumed: the sourcing
query, the screening rubric, the description writer, the reporting view. The
failure this produces is specific and hard to see.

When one consumer's partition treats an unrecognised grade as *must* and
another treats it as *nice*, the same item is simultaneously a hard sourcing
filter and a decorative preference, and neither reader can see the other's
reading. An item that fell off the taxonomy — a renamed grade, a typo, a value
from an older version of the vocabulary — is then silently promoted into a
gate that excludes people, by a default nobody chose.

The discipline is two rules, and both are needed:

- **Single-source the partition.** One function, one definition of which
  grades filter; every consumer calls it. Two implementations that agree today
  are one edit away from disagreeing, and the disagreement is invisible
  because each side is individually correct.
- **Mirror the vocabulary across every boundary the list crosses.** Where the
  graded list passes between components — a scoring stage and a publishing
  surface, a pipeline and an interface, two teams' schemas — the closed set of
  grade values is declared once and restated on each side as a checked
  contract, so an off-taxonomy value is caught where the boundary is crossed
  rather than at the moment somebody is filtered out by it. The runtime
  fallback below is the second line of defence, not the first.
- **Make the fallback the non-filtering side, everywhere.** Anything
  unrecognised is a preference, never a must, per
  [uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
  The asymmetry is the point: a wrongly-demoted requirement costs a reviewer
  a second look, and a wrongly-promoted one costs candidates the role on a
  grade nobody defined. Where the fallback direction is chosen for local
  convenience — "musts are the safer default here, we don't want to miss
  anything" — the convenience is being paid for by people who will never know
  it happened.

## When not to use it

- **Before the outcome filter has run.** Grading an unfiltered list grades
  sediment carefully. Filter first, grade what survives.
- **On a regulated credential.** Legally mandated qualifications are
  prerequisites by law regardless of learnability, and asking how long the
  licence takes to obtain is not the relevant question.
- **As a promise to the candidate.** A requirement graded learnable is a
  statement about the filter, not a commitment that the organization will
  teach it. Where the advertisement implies training, that has to be true —
  and whether it is said at all belongs to the advertising practice.
- **To justify hiring under the bar.** The axis decides what the pipeline
  filters on. Whether a particular finalist who lacks a learnable item should
  be hired is a shortlist judgment with its own evidence and its own owner.
