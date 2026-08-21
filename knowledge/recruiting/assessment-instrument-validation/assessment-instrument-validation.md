---
layer: golden-path
type: golden-path
subject: assessment-instrument-validation
status: forged
use_when: [before an assessment reaches its first candidate, an assessment produces scores nobody can defend, choosing whether to ship or repair a scoring pipeline, a scoring change needs proof it did not break the instrument]
techniques:
  - synthetic-candidate-behaviour-landscape
  - discrimination-margin-gate
  - minimum-cohort-and-inconclusive-verdicts
  - judge-independent-of-generator
  - binary-metrics-over-a-noisy-scale
  - adversarial-persona-red-teaming
---

# Assessment instrument validation

An assessment always produces a number. That is the trap. A rubric with no
discriminating power, a scoring prompt that rewards fluency, a grader that
grades its own output — every one of these emits scores on schedule, fills a
scorecard, and terminates in a hire or a rejection. Nothing in the artifact
tells you it measured nothing. The failure is silent by construction, and it is
discovered, if ever, a year later when the hires do not work out and nobody can
say which part of the process was responsible.

This subject is the discipline that closes that gap **before a candidate ever
sits the instrument**: constructing evidence that the assessment separates
people who differ, that it separates them on the thing it claims to measure,
that it cannot be moved by behaviour unrelated to competence, and that where it
cannot see, it says so instead of quietly penalising someone. The output is not
a feeling that the assessment is good. It is a run, over a defined cohort, of
the real scoring path, producing an explicit verdict against thresholds fixed in
advance.

The step is skipped almost universally, and the reason is structural: validation
has no natural forcing function. A broken instrument does not crash. Its cost
lands on candidates, who cannot see it, and on hiring quality, which is measured
too late and too noisily to indict anything specific. Nothing demands the work
except a team that decides to demand it of itself.

## The three questions, in order

An instrument earns deployment by answering three questions, and they are not
interchangeable.

1. **Does it discriminate at all?** Given inputs that genuinely differ in
   quality, do the resulting scores differ, in the right direction, by a margin
   large enough to survive noise? An instrument that returns the same reading
   for a strong and a weak response is broken, not lenient. This is the cheapest
   question and it fails more often than anyone expects — score compression at
   the top, where a generous rubric marks everybody strong, is the single most
   common defect in machine-graded assessment.
2. **Does it discriminate on the right thing?** Rank order can be perfect and
   still be driven by response length, formatting, vocabulary register, or the
   confidence of the prose. A separation you cannot attribute to a competency is
   a separation you cannot defend, and it is exactly the kind that carries
   adverse impact along an axis nobody chose.
3. **Is it robust to behaviour that is not competence?** Someone who narrates a
   plausible process without doing the work, someone who delegates the whole
   task, someone who optimises for the grader rather than the problem — an
   instrument must not reward them above a candidate who honestly did the work
   less well. This is the question that separates a rubric from a game.

A fourth question — *does it predict who succeeds in the role?* — is
deliberately outside this subject. That evidence requires outcomes, which
requires deployment, and validating a score against real outcomes after it has
been used is the neighbouring practice on selection score calibration. The
mistake is to treat that later work as a reason to skip this one. Predictive
validation of an instrument that never discriminated in the first place is a
year spent correlating noise with noise.

## You cannot pilot on candidates

The obvious way to validate an assessment is to run it on people and see what
happens. Before deployment there are no people, and the standard dodge — "we
will learn from the first fifty candidates" — is a decision to make fifty real
applicants the experimental arm of an unvalidated instrument, without telling
them, with an adverse outcome attached. That is not a pilot; it is the harm the
validation exists to prevent, rescheduled.

The way out is a **synthetic behaviour landscape**: a deliberately constructed
cast of simulated candidates spanning the response space the instrument will
meet, run through the *real* scoring path, with the resulting ranking checked
against invariants stated in advance. The cast is not a set of test fixtures;
it is a model of how humans actually behave in front of this assessment,
including the ways they behave badly. Building that cast well is most of the
craft (synthetic-candidate-behaviour-landscape), and the adversarial half of it
— the personas who game rather than perform — is where the findings live
(adversarial-persona-red-teaming).

Synthetic cohorts have a hard limit and it must be stated honestly wherever
their results are cited: they establish that the instrument *can* separate
constructed differences, not that it separates *human* differences at human
rates. They are necessary and insufficient. What they buy is the right to put an
instrument in front of a person at all.

## Assert only invariants that are sound

The discipline that makes a synthetic cohort useful rather than theatrical is
the restraint about what to assert. It is tempting to assert a full ranking of
the cast, top to bottom. Do not. A total order over personas encodes assumptions
nobody has evidence for — whether a careful minimal-effort candidate should
outrank an ambitious failed attempt is a real question about the role, not a
property of the instrument — and a suite that fails on those assumptions
generates noise that teaches nothing and gets muted within two weeks.

Assert only the orderings that are **sound**: the ones where any competent
reviewer of the domain would agree the direction is not debatable. A candidate
who demonstrably did the work outranks one who demonstrably did not. A
fabricated process report does not outrank a genuine artifact. An unattempted
submission does not score above an attempted one. Everything else is *reported*
— printed in the run's output for a human to read — but not asserted. The
difference between a report line and an assertion is the difference between
information and a broken build.

This restraint has a second effect: the reported-but-unasserted band is where
the real findings surface. The clusters, the ties, the personas that landed one
rank off — those are the observations that change instrument design, and they
only exist if the suite was not so over-specified that it went red before
anyone read them.

## Process signals are supporting evidence; artifacts are load-bearing

The most expensive lesson in this territory is about what an instrument is
allowed to believe. Ask a candidate to describe their approach and a fabricator
will describe a beautiful one. Score that description and you have built an
instrument that measures the ability to write a plausible process narrative —
a real skill, and not the one on the job description.

When a scoring pipeline is layered — a deterministic layer reading declared
signals, and a deeper layer reading the produced artifact — the fabricating
persona ties with honest mid-range candidates under the declared-signal layer
and is separated only by the artifact-anchored layer. That result generalises
into a design rule: **anything the candidate asserts about their own process is
supporting evidence at best; only checks anchored in the artifact they produced
are load-bearing.** An instrument whose discriminating power lives entirely in
self-report has not been validated, it has been asked politely for its answer.

The corollary for validation is that a gaming persona must be in the cast from
the first run, not added after a real candidate exploits the gap. You cannot
find this failure by inspecting a rubric; the rubric always looks reasonable.

The most durable artifact-anchored check is also the simplest: **seed the
supplied material with real, pre-verified defects and record whether each
submission addressed them or carried them through.** A fabricated process report
cannot make an unfound defect vanish from the artifact, the check needs no
judge, and it is legible to the candidate afterwards. Its one dangerous default
is covered in the technique on adversarial persona red-teaming, and it is the
same law again: a defect in material the candidate never touched must read as
carried-through, never as fixed.

## Verdicts, and the state that means "nothing to say"

A validation run must be able to conclude that it does not know. A gate with two
outcomes forces every ambiguity into one of them, and in an assessment context
the pressure always resolves the same way — a cohort of two is called a pass
because calling it a fail feels unfair, and an unmeasurable instrument ships
carrying an approval it never earned.

The minimum honest vocabulary is four states: **pass**, **fail**,
**inconclusive** (the run happened, the sample is too small or the margins too
tight to conclude), and **not evaluable** (the run could not be performed —
missing inputs, a scoring path that errored, an instrument shape the harness
cannot exercise). Two rules govern them, and both are load-bearing
([absence-of-evidence-is-not-evidence](../_laws.md#absence-of-evidence-is-not-evidence),
[a-claim-carries-its-sample-and-its-basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)):

- **Inconclusive is not a pass.** It never certifies. It is a distinct value
  everywhere the verdict is rendered, and a strict certification flag refuses
  it exactly as it refuses a fail.
- **No data must never read as unfair.** When the instrument produced no
  measurement, that is a fact about the instrument. Rendering it as a poor score
  is a claim about a person nobody made, and if that person is a real candidate
  it is an adverse outcome derived from an empty cell.

The rules for the sample floor and the verdict lattice are the technique on
minimum cohort and inconclusive verdicts.

## Two structural traps

**The grader is the author.** When the same model that generates candidate
responses also grades them — or, in the real production case, when the model
that generated the assessment content also judges submissions against it — the
gate is self-grading, and self-preference is a measured, sizeable effect, not a
theoretical worry. Independence is not something to assert in a design document;
it is a property of a specific run, and it must be *measured and reported* on
every run, with a strict mode where a non-independent run cannot certify
(judge-independent-of-generator,
[a-predictor-cannot-grade-its-own-labels](../_laws.md#a-predictor-cannot-grade-its-own-labels)).

**The scale is noisier than the effect.** A model judge asked for a score out of
a hundred will not give the same submission the same number twice, and the
run-to-run drift routinely exceeds the difference the assessment is trying to
detect. Tracking those absolute scores across runs produces a metric that moves
for reasons unrelated to the instrument, which then gets tuned against —
optimising a scoring pipeline against judge noise. The escape is to derive
**binary or ordinal facts** from the judge and track those: did the strong
response outrank the weak one, did the required check fire, did the gate open.
Binary facts aggregate into rates with real confidence intervals; absolute
scores from a model judge do not compare across runs
(binary-metrics-over-a-noisy-scale).

## Validating the validator: do not industry-lock it

A validation harness contains its own assumptions about what a legitimate
submission looks like, and those assumptions become an eligibility rule nobody
voted for. The characteristic failure is a validator that requires a technology
stack, a repository, a deliverable shaped like software — perfectly reasonable
until the same instrument is pointed at a role that legitimately has none, at
which point every submission from that role is graded down for the absence of a
thing the role never had.

The rule: a structural validator accepts **any of the shapes a legitimate
submission for this role family can take**, and where it cannot recognise a
shape it returns *not evaluable*, not a low score
([meaning-does-not-live-in-a-label](../_laws.md#meaning-does-not-live-in-a-label)).
Write the alternative shapes down as an explicit list, because the implicit
version of the list is always exactly one shape long.

## Thresholds carry their reasons

Every number in a validation gate — a minimum cohort size, a required margin, a
tolerance defining "not penalised", a discrimination margin — is a judgment
call, and one that will be argued with under deadline pressure. A threshold with
no recorded rationale loses that argument every time, because the person who set
it is not in the room and the number looks arbitrary.

State the reason beside each number, in the artifact that holds it: why this
floor and not a lower one, what noise level the margin has to clear, what the
tolerance is protecting against, what corpus the number was derived from and how
that corpus was stratified. This is the same obligation a public claim carries
([a-claim-carries-its-sample-and-its-basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)),
applied inward. It is also what turns a threshold change from a quiet commit
into a decision someone owns.

## What deployment requires beyond a green run

A passing validation run is an internal artifact. Deploying a selection
instrument carries obligations that outlive it:

- **A record of what was validated.** Instrument version, cohort composition,
  thresholds in force, date, and verdict — because a verdict binds to exactly
  what it judged ([a-verdict-is-bound-to-what-it-judged](../_laws.md#a-verdict-is-bound-to-what-it-judged)),
  and a scoring change invalidates the previous evidence rather than inheriting
  it. Any rubric edit re-opens the gate.
- **Content evidence, not just statistical evidence.** Someone who knows the
  role should attest that the tasks represent work actually done in it. A
  synthetic cohort can prove separation; only a job-content judgment connects
  that separation to the role.
- **Group-impact evidence before use, not after complaints.** Selection rates by
  protected group, computed on real cohorts once they exist and monitored
  thereafter, are a separate and legally distinct obligation from
  discriminating power — and in several jurisdictions an audit dated before
  first use is compulsory. The neighbouring practice on adverse impact and proxy
  neutrality owns that analysis; this subject owns the pre-deployment half and
  hands over the versioned instrument record it needs.
- **A named owner for every override.** Instruments do ship over a failing gate
  when a role must be filled. That is survivable only if the record says who
  decided and the downstream scorecards carry the mark, so a later reader knows
  the instrument was known blind when it ran
  ([every-decision-names-its-actor](../_laws.md#every-decision-names-its-actor)).

## Seams with neighbouring practice

This subject owns **pre-deployment instrument validation** and nothing else.
The boundaries matter because each neighbour answers a different question about
the same assessment.

- **Designing the exercise** — what the case contains, which probes carry the
  decision space, how the brief is written — belongs to the practice on
  work-sample design for an era of ubiquitous machine assistance. That practice
  audits the *design* of a case before it ships; this one audits the *scoring
  pipeline*'s ability to separate people. A case can be beautifully designed and
  scored by an instrument that measures nothing.
- **Whether a signal is fair to a candidate** — whether inferring machine
  assistance from a stylistic marker may be held against them, what a candidate
  is owed when a detector fires — is the practice on assistance detection and
  fairness. Their question is *is this fair to this person*; ours is *does this
  measure anything at all*. An instrument can be perfectly fair and perfectly
  uninformative, and the two audits catch different defects.
- **A live machine interviewer** poses the same validation problem in a medium
  where the stimulus is not fixed: each candidate gets a different conversation,
  so the instrument changes between subjects. That is the practice on
  conversational assessment validation, and its extra machinery — validating a
  policy rather than a fixed artifact — is genuinely different work.
- **After deployment**, validating the score against who actually succeeded is
  selection score calibration, with its own hard problem: the score caused the
  outcomes it would be validated against
  ([a-predictor-cannot-grade-its-own-labels](../_laws.md#a-predictor-cannot-grade-its-own-labels)).
  This subject hands that one a versioned instrument and the evidence that it
  discriminated at all — without which no calibration curve means anything.
