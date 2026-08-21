---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: synthetic-candidate-behaviour-landscape
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [validating an assessment before it has candidates, a scoring change needs a regression cohort, deciding what a validation run should contain]
---

# Synthetic candidate behaviour landscape

Before deployment there are no candidates, and there must not be — the first
cohort of a selection instrument cannot be a pilot group carrying real adverse
outcomes. The substitute is a constructed cast: simulated candidates spanning
the *behaviour* space the instrument will actually meet, pushed through the real
scoring path so the instrument is exercised end to end rather than reasoned
about.

The word doing the work is **behaviour**. The naive cast is a quality ladder —
excellent, good, mediocre, poor — and it validates almost nothing, because an
instrument that merely orders four quality tiers can do so on response length.
The useful cast is a landscape of *strategies*: the different ways real people
approach an assessment, of which quality is only one axis.

## Constructing the cast

Start from the question "what will people actually do when handed this?" and
enumerate the recurring answers. Across role families the same shapes appear:

- **The thorough performer.** Does the work, verifies it, evidences it. The
  ceiling reference — if the instrument does not put this persona at the top,
  nothing else in the run matters.
- **The competent-but-unverified performer.** Does the work, does not check it.
  The most common real submission, and the one that reveals whether the rubric
  rewards verification or merely completion.
- **The minimal-effort candidate.** Satisfies the letter of the brief and stops.
  Not dishonest; time-constrained. The floor reference for honest work.
- **The ambitious failure.** Attempts more than they can finish and leaves it
  broken. This persona is the reason a total ordering is unsound: whether it
  should outrank minimal effort is a live question about the role.
- **The delegator.** Hands the task to an assistant and passes the result on
  with little review. Distinguished from the thorough performer only by traces
  of unreviewed output — the persona that tests whether the instrument measures
  the candidate or their tooling.
- **The instruction-optimiser.** Reads the brief as a specification for the
  grader and writes to it: hits every named keyword, produces the shape the
  rubric asks for, engages with the problem as little as possible.
- **The fabricator.** Reports a process that did not happen. Belongs to the
  adversarial half of the cast and is covered by
  [adversarial-persona-red-teaming](adversarial-persona-red-teaming.md); it is
  named here because a cast without it is not a landscape, it is a ladder.

Add the personas specific to your role family. The test of a cast is whether a
practitioner who runs this hiring process reads it and recognises everyone.

## Rules that keep the cast honest

**One behavioural variable per persona.** A persona that is simultaneously
low-effort and dishonest cannot tell you which property the instrument reacted
to. When two personas differ in exactly one dimension and score identically, you
have located a blind spot precisely.

**Every persona is a fixed, versioned artifact.** A cast regenerated per run is
not a regression suite: a score change could be the instrument or the cohort,
and you will never know which. Freeze the submissions, version them, and change
them deliberately with a note saying why. Regeneration also silently drifts the
difficulty of the cast toward whatever the generator currently finds natural.

**The cast runs through the production scoring path, not a copy.** A validation
harness with its own reimplementation of scoring validates the reimplementation.
Where the real path calls a model, the run calls the model. Where it applies
deterministic checks first, the run applies them in that order.

**Write down which paths the cast does not reach.** A landscape built from one
kind of input exercises one set of branches in the scoring pipeline, and a green
run over it reads as coverage of the whole. Keep an explicit note beside the cast
naming the branches it does *not* exercise and where they are covered instead —
and treat that note as part of the cast, updated whenever the cast is enriched.
The alternative is a suite whose real coverage is known only to whoever wrote it,
which is the same as unknown.

**Freeze the instrument version with the result, and invalidate on either
change.** A cached validation result is only reusable when both the instrument
version and the model that produced the material match the current ones.
Re-using a cached run after a rubric or model change certifies artifacts the
instrument under test never produced — the most confident possible way to
certify nothing ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

**Stratify, and record the stratification.** A cast drawn entirely from one role
family, one seniority band or one submission format proves the instrument works
there and nowhere else. Record what the cast spans and what it does not, beside
the result — a claim carries its sample
([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
When a gate threshold was derived from a corpus, that corpus's composition is
part of the threshold's meaning.

**Label synthetic results as synthetic, everywhere they surface.** A separation
rate produced by constructed personas is evidence about the instrument's
sensitivity to constructed differences. Rendered in the same grammar as a
measurement over real cohorts, it becomes a claim nobody can support
([inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)).

## Procedure

1. **Write the personas as briefs, not as outputs.** Each persona is a short
   description of a strategy and its constraints. Producing the submission from
   the brief — by hand or with generation — keeps the behaviour explicit and
   makes the cast readable a year later.
2. **Produce the submissions once and freeze them.** Store them with the persona
   brief that generated each one.
3. **Declare the sound invariants before the first run** — the orderings any
   competent reviewer would agree on, and no others. Everything else is
   reported, not asserted.
4. **Run the whole cast through the real scoring path**, capturing every
   intermediate: deterministic check results, judge verdicts, final rank.
5. **Read the report, not just the verdict.** Ties, near-misses and clusters in
   the unasserted band are the findings. A green run whose report you did not
   read has told you nothing.
6. **Re-run on every scoring change**, and treat a rubric edit as a new
   instrument whose previous evidence does not transfer.

## Decision rules

- **When two personas that differ in one behaviour score identically, the
  instrument is blind to that behaviour.** Decide explicitly whether that is
  acceptable. Sometimes it is; recording that decision is the point.
- **When the cast separates cleanly on the first attempt, suspect the cast
  before congratulating the instrument.** Personas written after the rubric tend
  to be written to it. The strongest cast is one drafted by someone who has not
  read the scoring prompt.
- **When a persona cannot be scored at all, that is a finding, not an error to
  work around.** It means a real submission of that shape would also fail to
  score, and the honest state for it is *not evaluable*.
- **When the instrument changes and the cast does not, keep the old run.** The
  pair of runs is the evidence that the change did what it claimed.
- **When adding a persona because a real candidate did something unexpected,
  add it permanently.** The cast should accumulate the field's actual creativity.

## When not to use it

A synthetic cast cannot establish that the instrument separates *people* at
human rates, cannot estimate score distributions, and cannot say anything about
group impact — real cohorts and the practice on adverse impact own that, and
substituting synthetic figures there would be fabricating a population. It is
also poor value for an instrument whose scoring is entirely deterministic and
already unit-tested at the rule level; there the cast adds cost without adding
coverage. Its domain is exactly the judgment-bearing part of a scoring pipeline,
where correctness cannot be asserted from reading the code.
