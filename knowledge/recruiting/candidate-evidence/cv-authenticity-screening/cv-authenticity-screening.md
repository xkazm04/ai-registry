---
layer: golden-path
type: golden-path
subject: cv-authenticity-screening
status: forged
use_when: [screening an application document before or alongside scoring, deciding what a suspicious signal in a career document may conclude, defending a hiring system against document-embedded manipulation, designing the ordering of an evidence pipeline]
techniques:
  - a-screen-is-not-a-verdict
  - claim-density-and-stuffing-heuristics
  - implausible-span-and-arithmetic-checks
  - document-as-data-never-as-instructions
  - hidden-text-and-smuggling-detection
  - ground-the-model-against-a-deterministic-prepass
---

# CV authenticity screening

A career document is not a record. It is an argument — assembled by an
interested party, for one audience, with the unflattering parts left out by
design. That has always been true and it is not a scandal; nobody writes a
neutral account of their own working life. What is new is that the argument is
now often *drafted by a machine*, that the machine reading it is a machine of
the same kind, and that a small number of documents are written not to persuade
the reader but to **attack the reader** — to carry instructions addressed to the
automated analyzer rather than sentences addressed to a person.

This subject is the discipline of reading that document adversarially without
letting adversarial reading turn into a judgment about a human being. It sits on
a knife edge. Read the document credulously and the system rewards whoever
optimizes hardest against it — which, reliably, is not the strongest candidate.
Read it suspiciously and the system starts producing accusations: an accusation
of dishonesty attached to a job application is one of the most damaging
artifacts a hiring process can generate, it is almost never provable from the
document alone, and the person it lands on usually never learns it existed.

The whole standard resolves that tension with one move, repeated in every
technique: **the output of authenticity work is a flag on a document, never a
finding about a person, and never an automated adverse outcome.**

## What the screen is actually looking at

Three different things get confused under one word, and separating them is the
first competence:

- **Persuasion** — a document polished, front-loaded, and phrased to match the
  posting. This is the normal, expected, entirely legitimate state of a career
  document. It is not a finding. A candidate who tailors their document to the
  role is doing what every piece of application advice ever written told them to
  do.
- **Distortion** — claims the document makes that its own internal structure
  cannot support: spans that overlap impossibly, totals that exceed the career
  they are drawn from, a skill list whose density is arithmetically incompatible
  with the tenure behind it. These are *checkable against the document itself*,
  which is what makes them the only honest heuristics in the family.
- **Attack** — content aimed at the system rather than the reader: instructions
  addressed to an automated analyzer, text hidden from the human but visible to
  the extractor, characters chosen so that what is parsed differs from what is
  displayed. This is a security event. It is also, uniquely in this subject, a
  category where the document really did do something adversarial and the record
  can say so plainly — because the artifact, not an inference about intent, is
  the evidence.

Systems fail by collapsing these. Buzzword density is treated as evidence of
lying (it is evidence of nothing but density). A layout artifact is treated as
smuggling. An injection attempt is quietly filtered and the run continues as
though the document were ordinary — which throws away the only genuinely
conclusive signal the subject ever produces.

## Machine-written is not a finding

The most important negative rule in the subject, and the one most likely to be
violated by a system built in the current decade: **that a document appears to
have been drafted with a language model is not an authenticity finding, is not
adverse, and must not be scored.**

The reasons are not squeamishness, they are correctness:

- **The detectors do not work at the accuracy the decision requires.** Text-origin
  classifiers on short, formulaic, heavily-edited documents produce false-positive
  rates that would be unacceptable at any hiring gate, and they misfire
  systematically on non-native writers and on anyone using assistive writing
  tools — which converts a "fraud" signal into a proxy for national origin and
  disability. That is the exact failure mode the fairness work in this domain
  exists to prevent.
- **The behaviour is universal and endorsed.** Drafting help is now recommended
  by career services, bundled into the editors people write in, and often the
  only reason a strong candidate writing in their second language clears a
  keyword filter at all.
- **It is off-target.** The question a hiring process asks is whether the claims
  are true and the person can do the work. How the sentences were composed is
  orthogonal to both. A machine-drafted document describing real work is honest;
  a hand-typed document inventing an employer is not.

The seam matters and is easy to get wrong: detecting *delegated work-samples* —
where the artifact under assessment was supposed to demonstrate the candidate's
own capability — is a different problem, owned by the work-sample assistance
neighbour, and even there the modern answer is usually that tool use is expected
and never penalised, with the assessment redesigned around it. Reading the
career document is not that problem. Here, authorship is simply not the question.

## The cost asymmetry that decides every threshold

Every parameter in this subject is set by one calculation, and it is worth
stating as arithmetic rather than as sentiment:

> A **false positive** costs a reviewer a few seconds of reading a note.
> A **false negative** costs — nothing, because the document was going to be
> read anyway.
> A **document dropped on a positive screen** costs a candidate the job, and
> costs you a candidate you will never know you lost.

That third line is the one that sets policy. Because the screen's downside when
it fires wrongly is small and its downside when it *acts* wrongly is total, the
screen is permitted to be sensitive and forbidden to be decisive. Concretely:
thresholds are tuned toward catching things, never toward precision; the
document continues through the pipeline unchanged whatever the screen says; and
no flag, alone or in combination, may route a candidate to rejection. A machine
may annotate. A person decides, per the domain's rule that no adverse outcome is
solely automated.

The corollary that teams resist: **you do not get to quietly discard a document
you believe is fraudulent.** If the evidence is strong enough to act on, it is
strong enough to be reviewed by a named human who owns the decision and can be
asked to justify it. Silent dropping is the same decision without the
accountability.

## Screens are checks, not scores

Authenticity signals must not be folded into the fit score. A single number that
mixes "how well does this person match the role" with "how suspicious is this
document" is uninterpretable and unappealable: a candidate penalised by it
cannot be told what happened, and a recruiter reading it cannot tell whether a
mediocre number means weak experience or a flagged layout artifact.

Keep them structurally separate:

- the **score** answers fit, computed from evidence only;
- the **screen** produces a small, closed set of typed flags, each naming what
  triggered it and quoting the exact fragment;
- the **presentation** shows them side by side, with the flag in the visual
  grammar of a note and never in the grammar of a measurement.

When suspicion must influence a number, it does so through the honest route: not
by subtracting points, but by *withholding credit for claims the evidence does
not support*, which is a cross-check on the score's own basis and belongs to the
scoring craft. The distinction is the whole difference between "we did not find
proof of this claim" and "we think you are lying".

## Ordering: the screen runs early, the grounding runs late

The pipeline shape this subject requires is not arbitrary — each stage exists
because of what the next one can no longer be trusted to do:

1. **Extraction** — get text out of the document, with its damage recorded. Owned
   by the parsing neighbour; authenticity work consumes its output and its
   damage report, because extraction damage is the number-one source of false
   suspicion.
2. **Sensitive-data and injection screens** — run over raw text, before anything
   interprets it, because both are properties of the bytes and both must be known
   before the text reaches a model.
3. **The deterministic evidence pre-pass** — a mechanical, explainable pass that
   finds what the document literally contains: which required terms appear, how
   often, where. This runs *before* the model on purpose. Its output is the only
   independent reading the system will ever have.
4. **The model** — the interpretive reading, which is fluent, useful, and
   corruptible by the very document it is reading.
5. **Validation and cross-check** — the model's output checked against the schema,
   then against the pre-pass. Divergence between the two readings is the signal
   that something happened between step 3 and step 4.

Invert steps 3 and 4 and you get a system in which the model's reading is the
only reading, self-consistent whatever it says, with nothing to be wrong
against. The pre-pass is cheap, boring, and the reason a compromised run is
detectable at all.

## What the naive readings get wrong

- **Density as dishonesty.** A term repeated many times is a term repeated many
  times. It may indicate stuffing, a genuinely term-heavy specialty, a document
  written for keyword filters by someone advised to do exactly that, or a
  repeated section header. Density earns a note; it never earns a conclusion.
- **Stuffing modelled as absence.** When a required term is repeated abusively,
  the term *is still present*. Treating over-use as "not matched" is factually
  wrong and punishes the candidate twice. Over-use is a sub-state of matched — the
  presence is real, the density is the signal.
- **The screen that drops.** Every incident in this subject's history is
  downstream of a screen that was allowed to act. Filtering is not screening.
- **Filtering an attack instead of recording it.** A stripped injection string
  leaves a run that looks clean and a candidate whose document contained a
  documented manipulation attempt with no record of it. Neutralise *and* record.
- **Trusting the model to resist.** A prompt clause telling the model to treat
  document text as data reduces compliance; it does not eliminate it. Any design
  whose safety rests on the model not being persuaded has no safety property at
  all — which is precisely why the grounding pre-pass, not the prompt, is the
  control.
- **Punishing the artifact of a tool.** Ligatures, hyphenation, invisible layout
  characters and multi-column reflow all produce text that looks tampered with.
  A screen that cannot distinguish a document generator's normal output from
  deliberate smuggling will accuse the innocent far more often than it catches
  the guilty.
- **Letting a flag become permanent.** A flag is bound to one document version
  and one screen version. Re-uploaded content does not inherit it; a
  re-screened document under a new rule set gets a new reading, not a
  retroactive one.

## Neighbours

Extraction, structured claims and their per-claim provenance belong to the
career-reading neighbour; this subject starts from text that already exists and
never re-parses it. The general grammar of refusal, of "could not determine",
and of labelling inference as inference belongs to the labelling-and-refusal
neighbour; authenticity flags obey that grammar rather than restating it.
Delegation detection in work samples — where the assessed artifact was meant to
demonstrate the candidate's own skill, and where the settled answer is to expect
tool use and never penalise it — is a genuinely different problem and belongs to
the assistance-and-fairness neighbour. What is owned here, and nowhere else, is
the act of reading a career document as a possibly adversarial artifact.

## The techniques

- [a-screen-is-not-a-verdict](./techniques/a-screen-is-not-a-verdict.md) — the
  cost asymmetry, the flag-not-finding rule, and why the document is never
  dropped.
- [claim-density-and-stuffing-heuristics](./techniques/claim-density-and-stuffing-heuristics.md)
  — measuring repetition honestly, and modelling over-use as a sub-state of
  presence.
- [implausible-span-and-arithmetic-checks](./techniques/implausible-span-and-arithmetic-checks.md)
  — the checks that read the document against itself, and the overlaps that are
  ordinary life rather than distortion.
- [document-as-data-never-as-instructions](./techniques/document-as-data-never-as-instructions.md)
  — the analyzer's standing clause, and recording a manipulation attempt instead
  of silently declining it.
- [hidden-text-and-smuggling-detection](./techniques/hidden-text-and-smuggling-detection.md)
  — text visible to the parser and not to the human, and the tool artifacts that
  look identical to it.
- [ground-the-model-against-a-deterministic-prepass](./techniques/ground-the-model-against-a-deterministic-prepass.md)
  — the independent reading that makes a compromised interpretation detectable.
