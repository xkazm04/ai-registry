---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: judge-independent-of-generator
status: forged
laws: [a-predictor-cannot-grade-its-own-labels, inference-must-look-like-inference, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a model both produces and grades assessment material, certifying a scoring pipeline, a validation run looks suspiciously clean]
---

# Judge independent of generator

When the thing that made the material also grades it, the grade is not evidence.
This is the oldest rule in measurement and it is broken constantly in machine-
assisted assessment, because the same capable model is the convenient choice for
both jobs and nothing in the output reveals the coupling.

Three couplings occur, in increasing subtlety:

- **The same model generates the candidate submissions in a validation cast and
  scores them.** The run measures the model's agreement with itself.
- **The same model generates the assessment content — the case, the rubric, the
  expected answers — and judges real submissions against it.** This is the
  production version, and the one people miss. The judge is grading against a
  standard it authored, in its own idiom, and it recognises its own idiom.
- **The same model family, different version.** Weaker, real, and routinely
  ignored. Self-preference is not a property of an exact checkpoint; a
  successor grades a predecessor's style favourably too.

Self-preference in model judges is a measured effect with a large range, not a
worry to be argued away. A gate handed the generator's own model is a gate that
grades its own homework, and the certification it emits is worth exactly nothing
([a-predictor-cannot-grade-its-own-labels](../../_laws.md#a-predictor-cannot-grade-its-own-labels)).

## Independence is measured and reported per run, not asserted once

The failure mode of this rule is a design decision recorded in a document and
then quietly violated by a configuration change, a default, a fallback path
after an outage, or a cost-saving consolidation nobody connected to assessment
integrity. Six months later every run is self-graded and every report still
says the architecture separates them.

So: **independence is a property of a specific run, computed from what that run
actually used, and printed in that run's output.** Concretely —

1. Record the identity of the generator and the identity of the judge as the run
   executes, from the actual invocation, never from configuration intent.
2. Compare them and emit an explicit independence flag with its basis: which two
   identities were compared and how they differed — different model, different
   family, or same.
3. Print the flag in the report alongside every verdict it conditions. An
   independence result that lives only in a log is not reported.
4. **In strict mode, a non-independent run cannot certify.** It returns a
   non-passing verdict regardless of how good the margins look, because the
   margins are the artifact of the coupling.
5. **Pin the rule as a contract in the test suite**, not just in the scoring
   path. A test that asserts the gate refuses to certify a self-graded run is
   what stops the rule from being deleted by someone who does not know why it
   exists. Doctrine enforced only inside the implementation is doctrine one
   refactor from gone.

A strict mode should refuse one more thing while it is checking provenance: **a
run in which any row silently fell back off the judged path.** A scoring call
that errored and degraded to a deterministic default produces output that looks
like a clean deterministic run and is not one — it is a degraded provider
masquerading as a design choice. Count the fallbacks, report them, and refuse to
certify a run that has any, because the alternative is a certification whose
coverage nobody can state.

Where the two are unavoidably the same and the run must proceed — a degraded
path, a single available model — the run proceeds with its provenance
truthfully downgraded and the verdict marked as internally consistent rather
than validated
([inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)).
A downgraded verdict is honest. A downgraded verdict rendered like a clean one
is the failure.

## Independence is a spectrum; report where you are

Full independence — a different model family, prompted from a rubric written by
a person, scoring material it did not produce — is the ceiling and is often
affordable for validation runs even when it is not affordable in production.
Below it:

- different family, same generic capability class: acceptable, report it;
- same family, different generation: weak, report it and interpret margins
  conservatively;
- same model, different prompt: not independence. A different system prompt does
  not create a second grader; it creates the same grader in a different mood.
- deterministic checks written by a person: fully independent by construction,
  and the reason artifact-anchored deterministic checks carry so much weight in
  a layered scoring pipeline.

The strongest configuration for a validation run is a person-authored rubric, a
generator for the cast, and a judge from a different family — and the strongest
production configuration keeps at least the deterministic layer authored by
someone who is not the judge.

## What independence does not fix

Independence removes self-preference. It does not remove the other judge biases,
and a validation report that claims independence and stops has overclaimed:
position effects (which submission was presented first), verbosity preference,
and format preference all survive an independent judge. Control them separately
— randomise or swap presentation order and check the verdict is stable, and
include a verbose-but-empty persona in the cast specifically to see whether
length buys score.

Independence also does not survive a rubric change. A verdict binds to what it
judged ([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)),
so a run's independence result is stamped with the rubric version it was
computed under and does not carry forward.

## Decision rules

- **When the generator and judge identities are equal, the run is
  non-independent — no exceptions for "the prompt is different".**
- **When independence cannot be determined**, because a run did not record the
  identities, treat it as non-independent. Unknown provenance downgrades; it
  never upgrades.
- **When a validation run comes back unusually clean, check the independence
  flag first.** Suspiciously clean separation is the characteristic signature of
  a self-graded run.
- **When cost forces a shared model in production, put the independent judge in
  the validation run at least** — you pay for it once per instrument version,
  not once per candidate.
- **When you cannot achieve independence anywhere, say so on the instrument
  record.** An instrument documented as internally consistent but not
  independently validated can still be used with human decision-making on top;
  one that claims validation it never had cannot.

## When not to use it

There is nothing to measure where no model participates in scoring: a purely
deterministic instrument, or one graded entirely by trained human raters, needs
inter-rater agreement rather than a generator-judge comparison. And independence
is not the whole of judge quality — an independent judge that has never been
checked against human ratings on the same material is independent and possibly
wrong. Independence is a necessary condition, and the practice on general
model-judge scaffolding owns the rest of the harness.
