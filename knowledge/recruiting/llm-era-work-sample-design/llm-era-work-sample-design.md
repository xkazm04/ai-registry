---
layer: golden-path
type: golden-path
subject: llm-era-work-sample-design
status: forged
use_when: [designing a take-home or practical exercise, a work sample stopped separating candidates, deciding what to grade when the artifact proves nothing, planning the debrief that follows a submission]
techniques:
  - anchor-the-task-to-the-role-not-the-material
  - covert-probe-with-a-decision-space
  - mid-flight-requirement-change
  - forced-decision-log-as-normal-practice
  - authorship-verifying-debrief-questions
  - probe-discrimination-audit-before-shipping
---

# Work-sample design when the artifact proves nothing

Start from the assumption that defeats every older design: **the entire
submission was produced by a capable model.** The working code, the tests, the
architecture note, the version-control history, the tidy write-up explaining
the trade-offs — all of it, end to end, with no human hand on any line. This is
not a worst case to guard against. It is the *base case* to design for. Any
exercise whose signal depends on that assumption being false has already
stopped measuring what its rubric says it measures, and the people running it
usually find out a year late, from a hire who could not do the job.

Accept the assumption and one thing follows immediately: **nothing inside the
artifact is evidence of authorship.** Not the quality. Not the idiomatic style.
Not the commit sequence, which is as easy to synthesize as the code. Not the
reflective paragraph about why an approach was chosen, which is the single
easiest thing in the whole submission to generate. A rubric that scores the
artifact is scoring the frontier of available tooling, which is roughly
constant across your candidate pool and therefore has near-zero discriminating
power. The uncomfortable version: your best-scoring submissions and your worst
hires are now drawn from the same distribution.

What survives is not a property of the artifact but of the **path** — the
sequence of judgments a person made while producing it, and their ability to
stand behind those judgments under questioning. So the work sample stops being
a production task and becomes an instrument for *eliciting and recording
decisions*. The design question is no longer "what should they build" but
"where in this task will a person be forced to choose, what will the choices
cost them, and how will I later tell a chosen path from a generated one."

## Ambiguity is the instrument

The load-bearing move is to plant **deliberate ambiguity** in the task and then
observe what the candidate does with it. A model given an underspecified
requirement will resolve it — instantly, plausibly, and without telling anyone
it made a call. A senior practitioner given the same requirement notices the
fork, decides on the basis of stated constraints, and can say a week later why
they went left. That gap between *resolved silently* and *decided
deliberately* is the entire remaining signal, and everything in this subject is
machinery for widening it and reading it.

Ambiguity is not the same as difficulty, and this is the distinction most
redesigns get wrong. Making the task harder or longer does not restore signal;
it inflates cost and drop-off while a model absorbs the extra work at no
marginal effort to the candidate (the economics of that cap are a neighbouring
subject's, on timeboxing and cost — the design here has to fit inside it, not
argue with it). Ambiguity is *cheap in effort and expensive in judgment*: two
lines of requirement that could honestly mean two different things, with a
real cost attached to each reading.

This gives the single most useful rule for calibrating to seniority: **a senior
exercise raises the depth and the ambiguity, never the number of
deliverables.** A junior case is narrow, well-scoped, more scaffolded, with
simpler forks. A senior case has the same three or four tasks and harder calls
inside them. Padding a senior exercise with extra sub-deliverables to make it
"harder" produces exactly the artifact-volume test that assistance makes free,
while consuming the time budget the judgment needed.

Three kinds of ambiguity carry most of the weight:

- **The underspecified requirement.** A stated need that has more than one
  defensible realization, where the constraints in the brief genuinely bear on
  the choice but do not settle it.
- **The surprising or inherited area.** A part of the supplied material that
  behaves unexpectedly, predates the task, or contradicts the obvious approach.
  A person must decide whether to work with it, work around it, or replace it —
  and each answer is defensible with a different justification.
- **The verification trap.** Something that looks correct and is not, or that
  cannot be confirmed by the checks the task hands you. It measures whether the
  candidate trusts output or verifies it — which is the single most
  job-relevant habit in a workflow where most output arrives pre-written and
  fluent.

## Decision space, not right answer plus distractors

Every planted ambiguity must expose a **decision space**: two or three options
that are *all genuinely defensible*, with materially different trade-offs. This
is not a stylistic preference; it is what separates an instrument that measures
judgment from one that measures pattern-matching.

A "one right answer plus plausible-looking wrong ones" design is a quiz. It has
a key, so it can be answered correctly by anyone with a strong retrieval
process, and it punishes the experienced candidate who sees a legitimate reason
for option two. Worse, it collapses the debrief: there is nothing to discuss
about a correct answer, so the conversation degenerates into confirming the
candidate found the key.

A real decision space is recognisable by a simple test: **write the one-sentence
case for each option, and check that a practitioner you respect could hold any
of them.** If one option needs a strawman to lose, delete it and find a better
fork. If all options collapse to the same cost profile, there is no trade-off
and therefore no decision — you have planted decoration.

What you grade is never *which* option they took. It is whether they saw the
fork at all, whether the reason they give matches the constraints they were
handed, and whether they know what they gave up. A candidate who took the
option you would not have taken, for a reason that survives contact with the
brief, outscores one who took your option because it was first in the list.

## The submission is a record of decisions, not proof of authorship

This reframing has to be total, or it leaks back. The artifact is *material for
a conversation*, and the conversation is the assessment. Concretely:

- Ask for a **decision log** alongside the work — but frame it as ordinary
  engineering practice, the note a colleague leaves for the next person, never
  as a test, an anti-cheating measure, or a thing being graded. The moment it is
  labelled an integrity check, it becomes a writing task, and writing tasks are
  exactly what models do best. Framed as normal practice, it is instead a
  *prompt* that makes the candidate's forks visible to themselves — and it seeds
  the debrief with specific claims to interrogate.
- Treat process documentation as **evidence of engagement, never as proof of
  authorship**. A log can be generated as easily as the code. Its value is that
  it commits the candidate to a position they must later defend live; it has no
  value as a certificate.
- Put a **live debrief** after every submission and score there. Ask for the
  *why*, the *rejected alternative*, and the *counterfactual* — what would have
  changed the decision. Those three are reconstructible from understanding and
  not from possession. Someone who delegated the whole task can describe what
  the artifact does; they cannot reliably say what they would have done had the
  volume been ten times higher, because that path was never walked.
- Keep interviewer guidance — what to listen for, what counts as a red flag —
  strictly **internal**. Disclosed criteria are an answer key, and an answer key
  handed to a candidate with a capable model is simply the solution.

## Mid-flight change: the thing one shot cannot absorb

A single generation pass produces a coherent artifact from a fixed brief. So
change the brief *while the work is underway*. Partway through the exercise, a
stakeholder's need shifts — a constraint tightens, a volume assumption jumps, a
consumer of the output turns out to need something the original framing did not
provide.

Two properties make this work, and both are easy to lose:

- **It must plausibly come from a person.** Not "surprise, new requirement" —
  a stakeholder with a reason, phrased the way a real one would phrase it.
  An obviously artificial swerve tells the candidate they are being tested and
  moves them into performance mode.
- **It must genuinely invalidate work already done.** If the change can be
  satisfied by appending, it measures nothing. It should force a real choice:
  adapt what exists, or discard and redo — the closest simulation of the actual
  job available in two hours.

It is also the cleanest structural lever against wholesale delegation: it splits
the work into two phases with a dependency between them, and reconciling a
changed constraint against decisions already committed cannot be handed over as
one prompt by someone who does not know what was committed.

## The clarifying channel, and why it must not resolve anything

Give the candidate someone to ask. A stakeholder — human or a persona standing
in for one — whose job is to supply context and constraints and to **never
resolve the designed ambiguity, and never confirm that any part of the exercise
is deliberate**. The honest in-role answer has a recognisable shape: *we have
seen it both ways, it depends on this business fact, your call.* Context and
cost, never a ruling. Asked something the brief never covered, they improvise a
plausible detail and stay consistent with it, as a real stakeholder does.

Any other in-exercise helper — an assistant embedded in the working environment,
a documentation bot — is held to the same rule and one stronger: it must not
know the design exists. A helper that can be asked "is this part deliberate?"
and answers is a disclosure channel, and disclosure through the side door is
still disclosure.

The reason is that the questions themselves are the signal, often the best one
in the exercise. Which forks a candidate notices, which they think are worth a
stakeholder's time, and how they frame a question when they cannot get a
decision — that is the daily behaviour of the role, observed directly. Resolve
the ambiguity in the channel and you have converted your instrument into a
specification-delivery service.

## Material is terrain, not identity

The exercise needs concrete material to make ambiguity real — ideally a small,
seeded working substrate with genuine seams and, where relevant, planted flaws,
rather than a prose brief that invites a greenfield answer. A prose brief has no
inherited surprises, so it cannot carry the second kind of ambiguity at all.
Size it to be readable in minutes and real enough that the tasks have something
to act on; a substrate large enough to be a project has become the exercise.

None of this is specific to software. The material is whatever body of work the
role acts on — a content library, a financial model, a customer record set and
its playbooks, a design system, a set of recordings — and it should be described
and assessed in that role's own vocabulary. A work sample that talks about
"the codebase" to a marketer has already told them the exercise was designed for
someone else.

Three disciplines govern the material:

- **The material is where the person will work; it does not define the role.**
  If the seeded substrate happens to be a billing service, you are not hiring a
  "billing engineer" — that is a display label, not a job. Renaming the role
  after the material inflates false requirements, deters qualified applicants,
  and makes the exercise measure domain familiarity you never asked for. The
  same discipline forbids importing tools the role's own brief never mentioned:
  an exercise that quietly requires a specific framework has added an
  unstated must-have, and unstated must-haves are how requirement lists reach
  fifteen items nobody meant.
- **When the material cannot carry the role's work, substitute it — never
  invert the exercise.** If the available substrate genuinely cannot support
  what this role does, build a small representative set of materials in the
  *role's* domain instead, and say plainly in the brief that the supplied
  context does not fit. The failure this prevents is the common one: an
  exercise quietly drifts into the substrate's domain because that is what was
  lying around, and a candidate is assessed on a job nobody is hiring for.
- **No fabricated ground truth.** A planted flaw must have a real answer in the
  supplied material. A templated defect with nothing behind it — an alarm that
  points nowhere, a bug that is not actually reachable — grades candidates
  against noise, and worse, it grades the ones who investigate most carefully
  the harshest, because they are the only ones who will spend an hour on it. If
  you cannot materialize the flaw honestly, ship the exercise without it.

## An unshipped case must be audited for discriminating power

A work sample is a measuring instrument and inherits the obligations of one.
Before it goes to a first candidate, audit each planted probe against explicit
load-bearing criteria: does it expose **at least two distinct defensible
options**, is there a **concrete seam** in the material where the decision
actually has to be made, and is there a **stated criterion separating a good
resolution from a naive one**? A probe failing these is decoration — it will
consume candidate time and produce a column of identical scores.

Verdicts here should be blunt — strong, weak, or none — and the case should not
ship at all when nothing in it discriminates. Where an override exists for
urgency, it is recorded with a name against it, because a case shipped over a
failing audit is a known-blind instrument and the record has to say who decided
to use it anyway.

The audit continues after shipping. **A probe that the entire field walks past
is usually a miscalibrated case, not five weak candidates in a row.** Cohort
statistics on each probe are the honest read: a probe nobody engages is
unmeasured, not failed, and treating it as failure quietly converts a design
defect into a series of adverse outcomes for people. The same applies in the
other direction — a probe everybody clears at the same level has zero
discriminating power and is costing candidate hours for nothing.

## Failure modes of the naive redesign

- **Grading the artifact anyway, with a stricter rubric.** Raises the ceiling
  everyone reaches. Score compression is the symptom; near-zero variance across
  a cohort is the measurement.
- **Making it bigger to outrun the tooling.** Costs candidates hours, raises
  drop-off, and shifts the pool toward those with the most free time — a fairness
  problem, not just a funnel one — while the tooling absorbs the extra volume
  for free.
- **Banning assistance.** Unenforceable, and it measures compliance rather than
  competence for a job that will be done with assistance from day one. The
  invariant that tool use is never itself penalized belongs to the neighbouring
  subject on assistance detection and fairness, and it constrains this design
  too: a probe that only fires when someone worked unaided is a trap, not a
  measurement.
- **Gotchas and trick questions.** Distinguishable from a decision space by the
  presence of a key. They measure suspicion and they poison the debrief.
- **Announcing the instrument.** "We have hidden checks in this exercise" turns
  the whole thing into an adversarial game where the candidate optimizes against
  your design instead of doing the work.
- **Treating the debrief as a formality.** If the live conversation is a
  walkthrough of a submission that has already been scored, the artifact is
  still the instrument and none of the above happened.

## Where this subject stops

Case *design* is the whole of this subject. Detecting and fairly handling
assistance — session signals, baseline comparison, and the invariant that tool
use is never penalized — is a neighbouring assessment subject, and so is the
time budget: the cap, the unpaid-labour ethics of asking for hours of work, and
what drop-off does to your pool. The rubric that turns debrief observations into
comparable scores belongs with structured scorecards and with instrument
validation; the plumbing that generates and serves a case belongs to the model-
operations neighbour, and the sandboxing and data-access rules for a supplied
substrate belong to the engineering one. What stays here is the design of the
ambiguity itself, and the discipline that an exercise nobody can fail
differently is not an exercise.
