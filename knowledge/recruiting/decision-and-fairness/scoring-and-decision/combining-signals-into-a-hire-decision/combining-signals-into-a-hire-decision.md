---
layer: golden-path
type: golden-path
subject: combining-signals-into-a-hire-decision
status: forged
use_when: [merging a résumé score an interview scorecard a work sample and a reference into one call, designing the final decision object a hiring panel acts on, deciding whether a strong number may advance a candidate on its own, calibrating a promote threshold against real hires]
techniques:
  - weight-signals-by-validity-not-by-precision
  - a-hold-that-blocks-auto-advance
  - promote-floor-calibrated-against-real-outcomes
  - discrepancy-between-signals-is-itself-a-signal
  - terminal-decisions-stay-with-a-person
  - outcome-feedback-loop-per-team
---

# Combining signals into a hire decision

By the time a hiring decision is made, the evidence has already been gathered by
other people, under other instruments, on other scales. A résumé produced a
number. An interview produced a filled scorecard. A work sample produced a
graded artifact. A former manager produced four sentences on a call. This
subject is about the last mile: turning those four things into one call, and
doing it so that the resulting call is *better* than the best single signal
rather than an average of all of them diluted by the worst.

Almost every bad combination is a variant of one mechanism, so name it first:
**the most quantified signal dominates because it is the most quantified.** The
résumé score arrives as `78`; the work sample as a rubric with four axes and a
reviewer's paragraph; the reference as prose. When these meet in a spreadsheet, a
model prompt, or a manager's head, the `78` is the only one that slots straight
into arithmetic — so it becomes the spine of the decision and everything else
becomes commentary on it, even when it is known to be the weakest predictor in
the room.

Precision is a property of the *scale*. Validity is a property of the
*relationship between the signal and job performance*. They are unrelated: a
résumé score can be computed to three decimals and be close to uninformative,
while a work sample graded coarsely on four levels carries most of the decision's
real information. A combination rule that does not distinguish the two is not
combining evidence, it is combining formatting.

## What a combined decision actually is

Not a number. The output of this subject is a **decision object**, and a number
is at most one of its fields:

- a **recommendation** drawn from a closed vocabulary — advance, hold, decline
  — never a free-text verdict and never a bare score;
- a **confidence** in that recommendation, derived from the *weakest* evidence
  behind it, not the average;
- the **red flags** that must be visible to whoever acts, stated in the words
  the record holds;
- an explicit account of **what was not measured** — a dimension nobody reached
  is a distinct state, never a zero and never a neutral midpoint
  ([law](../../../_laws.md#absence-of-evidence-is-not-evidence));
- the **actor** who will make or has made the call
  ([law](../../../_laws.md#every-decision-names-its-actor)).

Collapsing this object to a scalar before a human sees it destroys exactly the
information the human is there to weigh. The score survives the collapse; the
caveats do not. That asymmetry is why so many pipelines make confident bad
decisions — the confidence was manufactured by the data structure, not by the
evidence.

## Weight by validity, and know which validities you actually have

The stable craft finding, across decades of selection research and every
re-analysis of it, is not a table of coefficients. The coefficients move in
both directions: one re-analysis revised them upward, the 2022 one sharply
downward, and the range-restriction corrections that drive the difference are
still disputed. What survives every re-analysis is a **coarse split by
structure**, not a ranking:

- Signals that are *job-specific and structured* — structured interviews with
  anchored scales, job-knowledge tests, work samples graded on a fixed rubric,
  biographical questionnaires keyed empirically against outcomes — form the top
  group.
- Signals that observe the candidate *talking about the job* without a fixed
  rubric — unstructured interviews, "culture fit" conversations, informal
  chemistry reads — have low agreement between interviewers (around .4) and,
  under the current conservative estimates, roughly half the validity of the
  structured form.
- Signals that observe *proxies for having done the job* — years of experience,
  education level, employer prestige, résumé keyword density — predict weakest
  of all, and are the ones most often available as a tidy number.

**The order inside the top group is not stable.** An older summary put work
samples first; the 2022 re-analysis put structured interviews ahead of both
job-knowledge tests and work samples, with an empirically keyed questionnaire —
something the candidate *reports* — also above work samples. So the family a
signal belongs to is decided by how it was built, not by the form it arrives
in, and "a demonstration outranks a conversation" is not a measured fact.

Note the inversion: across the coarse split, the ordering by predictive value
runs almost exactly opposite to the ordering by how cheaply and precisely each
signal quantifies.
This is not a coincidence to be worked around; it is the central design
pressure of the subject. See
[weight-signals-by-validity-not-by-precision](./techniques/weight-signals-by-validity-not-by-precision.md).

A warning about borrowing those orderings wholesale: published validity is an
average over many roles, instruments and settings. *Your* interview may be
structured on paper and unstructured in practice; *your* work sample may be
solvable by a language model in nine seconds, in which case it measures nothing
about the candidate. The literature tells you which family a signal belongs to;
only your own outcome data tells you what your instrument does — which is why
weighting and calibration are two techniques, not one.

## The mechanical-versus-holistic question, answered precisely

Two claims that sound contradictory are both true, and confusing them produces
most of the bad arguments in a debrief.

**Mechanical combination equals or beats holistic combination of the same
data, and is almost never beaten by it.** Given a fixed set of scored inputs, a
formula applied consistently predicts job performance better than an expert
looking at the same inputs and forming an impression — human integration is where
recency, vividness, halo and preference enter. The rare cases where the expert
won are almost all cases where the expert held information the formula did not,
which is an argument for putting that information into the rule, not for
weighing it in the room.

**What goes into the sum matters far more than the weights.** Round, equal
weights over standardized signals whose direction is known predict nearly as
well as fitted weights — better, at the sample sizes hiring actually has — and
still beat the expert. An undocumented weight is not what ruins a composite. An
invalid *member* does: equal-weighting a signal that predicts at .40 with one
that predicts nothing yields about .28, which is roughly the accuracy of the
holistic judgment the formula was supposed to replace. A composite with a noise
signal in it launders ignorance into a number that carries the authority of
arithmetic.

The reconciliation: **fix the rule in advance, but only over the signals you can
defend, and route everything else to a hold rather than into the sum.** Unknown
*optimal weights* are fine — use equal ones. An unknown *sign* or unknown
*validity* is not. A composite of two validated signals plus an explicit "these
three things need a human look" beats a composite of five where three are noise
wearing a scale.

## Independence, or why agreement can be an illusion

Combination assumes the signals are separate observations. Very often they are
not, and the correlation is invisible in the final numbers: the interviewer read
the résumé *and its score* before the conversation; the work sample brief was
generated from the parsed résumé, so a candidate the parser read well gets a task
closer to their strengths; the reference was nominated by the candidate after
they knew how the interview went; two panellists debriefed before either wrote
anything down, and the senior one spoke first.

Every one of these turns two signals into one signal counted twice, and the
system reads the duplication as *corroboration* — the most dangerous possible
misreading, because corroboration is what raises confidence. Three practices
defend against it: **score before you confer** (each assessor commits a written
score before any debrief), **blind what can be blinded** (an interviewer does not
need the screening score to run a structured interview), and **treat a signal
derived from another signal as an elaboration of it, not as new evidence**. When
independence cannot be established, lower confidence rather than enjoying the
agreement.

## Confidence: verification is a chain, evidence is not

A decision cannot be more *verified* than the least-verified input it depends
on. When the work sample's authorship is unresolved, or the reference could not
be confirmed as the person it claims to be, every conclusion built on that input
inherits the doubt, however strong the scores are. Averaging here is how a
single strong signal drags a thin file into the advance lane: three unverified
signals and one verified one average to "moderate", and moderate advances. For
**dependent** inputs, the min rule is correct: an evaluation assembled entirely
from two upstream signals is no stronger than the weaker of them, and an
unverified or suspect input caps everything downstream of it.

The min rule is wrong for **independent** evidence. Two independent
observations that agree are stronger than either alone — a composite is more
reliable than its parts — and a rule that caps a well-corroborated file at its
weakest member throws that away. A min over *every* input also lets a
low-confidence signal that carries almost no weight veto the whole file. So:

- **min over the inputs a conclusion actually depends on**, and over
  verification status everywhere;
- **compounding for independent agreement**, and none for agreement that shares
  a source (see the next section);
- and **where the record cannot say which inputs a conclusion depends on, min
  over all of them** — an unknown dependency is treated as a dependency.

Where no input carries a confidence at all, the combined confidence is the
floor, not the ceiling: unknown evidence strength is untrustworthy, never
silently high.

## Discrepancy is information, not noise to be averaged out

Averaging is not the enemy. Two independent scores of the *same* dimension that
differ by about as much as the instruments' own error predicts should be pooled:
that is how a panel of structured interviews earns its validity, and the mean of
two noisy readings errs no more than the two readings do on average. But when the
work sample is excellent and the interview is weak by *more* than that error can
explain, the mean describes neither candidate in the room.

A disagreement between signals of comparable weight that exceeds what their
reliability predicts, or a categorical conflict between them, is a finding:
either an instrument is broken, or an observation was contaminated, or the
candidate is genuinely uneven in a way that matters for the role. All three
demand a *targeted next step* — a probe on the disputed dimension, a re-review of
the sample, a second reference — and none are served by a mean. Give the
composite an explicit discrepancy rule so a file cannot read healthy while its
component judgments failed. See
[discrepancy-between-signals-is-itself-a-signal](./techniques/discrepancy-between-signals-is-itself-a-signal.md).

## Three gates the combination must pass

**A hold that actually blocks.** The combined verdict must have a third value
that is neither advance nor decline, and it must be *load-bearing*: an
authenticity concern or a low evidence confidence forces a hold, and a strong
technical score does not override it. A hold that a good number can outvote is
decoration. See
[a-hold-that-blocks-auto-advance](./techniques/a-hold-that-blocks-auto-advance.md).

**A floor that came from somewhere.** If a threshold advances people, it must be
derived from what actually happened to the people it advanced before, on *this*
team, with the sample size stated and a fallback for when the sample is too
small ([law](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)). See
[promote-floor-calibrated-against-real-outcomes](./techniques/promote-floor-calibrated-against-real-outcomes.md)
and, because a floor depends on this team's base rate and bar in a way a weight
does not, [outcome-feedback-loop-per-team](./techniques/outcome-feedback-loop-per-team.md):
other teams' outcomes may enter only as a named prior that local outcomes
overrule as they accrue.

**A person at the end.** The machine may rank, surface, recommend and hold. The
advance-to-offer step and every decline are human acts, recorded as such
([law](../../../_laws.md#no-adverse-outcome-is-solely-automated)). A human act
counts only if the person can and does weigh the evidence: a sign-off that
routinely follows the score leaves the score as the decision, legally and in
fact. See
[terminal-decisions-stay-with-a-person](./techniques/terminal-decisions-stay-with-a-person.md).

## Where this subject stops

This subject owns the **combination** and nothing else. Each input has its own
craft, and duplicating it here produces two divergent standards:

- The interview instrument — anchors, dimensions, interviewer training, what a
  scorecard may ask — belongs to the structured-interview-scorecard subject.
  This subject takes the filled scorecard as given and asks what weight it earns.
- Designing a work sample in an era where a language model completes most
  take-home tasks, and establishing whether an instrument measures anything at
  all, belong to the work-sample-design and instrument-validation subjects. This
  subject assumes the sample is valid *and requires evidence that it is* before
  weighting it highly.
- Rendering one score to a recruiter — the typography of uncertainty, the
  wording of a band — belongs to the score-presentation subject. This subject
  decides what the number *is*; that one decides how it looks.
- Ranking candidates against each other, and whether a lead is real, belong to
  the comparative-shortlist subject. Combination is within-candidate; comparison
  is across candidates.
- Which steps may be automated at all belongs to the automated-screening-fairness
  subject. This subject inherits its constraint — the machine's actionable
  outputs are advance and hold — and does not relitigate it.

The seam is deliberate: a combination rule that also owns its inputs will drift
its inputs to make its combination look good.

## Failure modes worth memorizing

- **The weighted average of everything.** Every signal present, weights chosen
  by feel, missing signals imputed as the mean. Maximally defensible-looking,
  minimally informative.
- **Missing scored as zero.** A dimension the conversation never reached ranks
  the candidate below one who tried and failed — the most common arithmetic
  injustice in hiring software.
- **Missing renormalized away.** The mirror injustice, and the one that looks
  principled: averaging over only what was measured gives every gap the
  candidate's mean on the rest. When the missing dimension is the heavy one —
  often missing *because* it would have scored low — the file's score rises by
  its absence. A missing heavy dimension holds; it is not averaged around.
- **Recency and vividness as weight.** This morning's conversation outweighs last
  week's artifact because it is more available, not more valid. A light, recent,
  vivid signal needs a *higher* bar to be credited, not a lower one.
- **The strong score that walks past a red flag.** An authenticity concern raised
  at intake, resolved by nobody, silently outvoted by a good technical result
  three stages later.
- **Confidence by averaging.** The mechanism by which thin files advance.
- **Averaging the disagreement that mattered — or refusing to average the one
  that did not.** A split larger than the instruments' error is a finding; a
  split within it is noise that pooling removes. The tolerance comes from the
  instruments' reliability, not from how uncomfortable the gap feels.
- **Two quantities, one field name.** A decision card carries a *confidence*
  field; upstream, an evidence-strength rating is also called *confidence*. They
  are different scales, and the moment a display contract fixes one meaning the
  other is dropped in transit — so a fallback-grounded assessment renders exactly
  as confidently as a fully evidenced one. Name them differently, carry both.
- **The score that grades its own labels.** Calibrating a floor against outcomes
  the floor itself selected: a screener that rejects everyone below 60 produces a
  beautiful curve above 60 and no evidence at all
  ([law](../../../_laws.md#a-predictor-cannot-grade-its-own-labels)).
- **Borrowed calibration, unlabelled.** A floor imported from another team, role
  family or market and presented as this team's. Pooled evidence is a
  legitimate prior when its population is named and local outcomes shrink it
  away; it is contamination when it wears local authority.
- **Overrides as ground truth.** A human reversing the machine is a labelled
  *disagreement*, not a labelled error. Which side was right is known only when
  the outcome resolves, and in the field evidence the managers who overrode a
  hiring test more often made worse hires on average. Score the override; do not train on it.
