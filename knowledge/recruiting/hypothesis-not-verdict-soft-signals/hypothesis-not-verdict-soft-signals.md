---
layer: golden-path
type: golden-path
subject: hypothesis-not-verdict-soft-signals
status: forged
use_when: [a career document suggests a risk or a strength that is not a skill, designing a behavioural flag on a screening surface, deciding what a soft reading may do to a candidate's ranking, turning a reading of a career into an interview question]
techniques:
  - antipattern-and-hidden-strength-pairing
  - a-confirmation-probe-per-signal
  - benign-alternative-stated-alongside-the-risk
  - claim-versus-evidence-overclaim-detection
  - signal-source-trust-ordering
  - what-to-confirm-checklist-not-a-dossier
---

# Hypothesis, not verdict: soft signals

Somewhere in every screening system there is a reader — human or machine — who
notices something in a career document that is not a skill. Four roles in five
years. A page of superlatives with no numbers under them. A title that jumped two
levels at a company nobody can look up. A person who has been at the same desk for
eleven years. Every one of those observations is real, and every one of them is
about to be misused.

This subject is the discipline of reading behavioural risk and hidden strength off
a career document in a way that produces **a question for the interview** rather
than **a reason for the pile**. It rests on one claim that the rest of the craft
unpacks: a document supports hypotheses about a person and almost never verdicts.
The document was written to persuade, months ago, by someone optimising for a
different reader, under conventions that vary by country, industry and generation.
What it can tell you reliably is its own *shape*. What it cannot tell you is who
wrote it.

The naive reading of soft signals is that they are a second scoring axis: skills
give a number, "soft factors" give a modifier, and the two combine into a better
ranking. That design is wrong at the root, and it fails in a specific direction —
it converts the reader's inability to see a person into a penalty applied to that
person. A soft signal that subtracts points is a verdict wearing a modifier's
costume. Soft signals do not score. They **route**: to a probe, to a work sample,
to a specific minute of a specific interview.

## The evidence ladder, and where a document sits on it

Three grades of knowledge about a candidate, and they are never interchangeable:

- **A document yields hypotheses.** Someone's account of their own past, unaudited.
- **A conversation yields evidence.** They answered a question you chose, live,
  and you saw how they answered it.
- **A demonstration yields proof.** They did the thing, under conditions you set.

Everything in this subject lives on the first rung and exists to move a specific
question up to the second or third. That is the whole mechanism, and it is
[inference-must-look-like-inference](../_laws.md#inference-must-look-like-inference)
applied to the softest, most seductive category of reading a system can perform.
The sibling subject on inference labelling owns the general grammar of guess versus
measurement across the whole hiring system; this subject owns the narrower and
harder job of turning one particular class of guess into one particular question.

## The line this subject must not cross

A soft signal about the **shape of a career** is legitimate to surface as a
question. An inference about a person's **temperament, motivation, loyalty,
character or attitude** is not, and it is not made legitimate by putting the word
"hypothesis" in front of it. Laundering a character judgment through a confidence
score is the single most damaging thing a system in this space can do, because it
gives an unfounded reading the paperwork of a founded one.

Legitimate, because they are countable facts about the document:

- average tenure across the last several roles, and the number of roles behind it;
- the ratio of claimed capabilities to described outcomes;
- whether stated achievements carry any quantity, scope or artifact at all;
- whether the seniority claimed is matched by the scope described;
- how recently a named capability last appears in a described role.

Illegitimate, in every rendering, at every confidence:

- flight risk, loyalty, commitment, drive, ambition, coachability, culture fit;
- inferred reasons for any transition;
- inferred personality, work ethic, temperament, maturity, "red flags" about the
  person as opposed to observations about the record;
- anything read off a name, a school, a photograph, an address, a date of birth or
  a gap — and gaps deserve their own paragraph below.

The operational test has three parts, and a signal must pass all three. **State
it as a fact about the document without using an adjective about the person** — if
you cannot, delete it. **Name the single question that would settle it** — if none
exists, it is not a hypothesis, it is an opinion. **Read it back as the candidate
would** — if they would recognise it as a claim about their record you can discuss,
it survives; if they would recognise it as a claim about who they are, it does not.

### Career gaps are the trap, and they are not an antipattern

A break in employment correlates with pregnancy, illness, disability, caregiving,
military service, immigration status and incarceration. It is the highest-risk
"signal" in this whole subject because it proxies for protected characteristics
almost perfectly and carries almost no information about capability. A system may
note that a named capability has not appeared in a described role for some years —
that is a recency-of-practice question with an honest probe. A system may not
render a break as a risk, an antipattern, a deduction, or a thing to be explained.
The difference is not presentational. One asks about the work; the other asks the
candidate to account for their life.

## A signal is a five-part record or it is not a signal

Anything this subject emits carries, structurally and not as prose decoration:

1. **The observation, with its number.** "Average tenure of 1.4 years across four
   roles", not "short tenures". The number is what makes it discussable, and it is
   [a-claim-carries-its-sample-and-its-basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)
   in its smallest form — four roles is a different claim from twelve.
2. **The source — how it was inferred.** Which of the trust tiers below produced
   it, and by what route. A reader who cannot tell a counted fact from a model's
   impression will price them the same.
3. **A confidence that means something.** Deterministic readings of countable
   document structure sit high; a reading of intent sits so low it should not have
   been emitted at all. A confidence attached to a claim the system had no business
   making does not rescue it.
4. **A needs-confirmation flag.** Most signals are unconfirmed by construction.
   The flag is what stops a downstream surface treating the signal as settled, and
   it must be a field, not a tone of voice.
5. **The probe.** The question, in askable words, that would resolve it. A signal
   with no probe is a signal with no purpose; see the technique on a confirmation
   probe per signal, which treats the missing probe as a deletion rule.

## Symmetry is a structural requirement, not a kindness

Run any detector over a career document and it will find things to worry about,
because that is what detectors are built to do. Run only those detectors and the
surface you produce is a risk dossier — a list of everything questionable about a
person, with nothing on the other side of the ledger, handed to someone with
thirty seconds. The reader does not experience that as balanced input. They
experience it as a case against the candidate, and they were the only human in the
loop.

The fix is structural: every detector that can fire adverse must have a paired
detector that can fire favourable over the same underlying property, and the
surface must render both in one place with equal weight. Long tenure is stability
*and* possible narrowness. Many short roles are instability *and* breadth of
context. High claim density is overclaiming *and* range. The pairing is not
editorial balance; it is the honest admission that the underlying observation is
genuinely two-sided, which is exactly why it is a hypothesis. The technique on
antipattern-and-hidden-strength pairing carries the procedure, and the one on
stating the benign alternative alongside the risk carries the sentence-level rule
that makes a single signal survive being read alone.

## Trust ordering, and why the deterministic layer comes first

Not all soft signals are equally knowable, and a surface that mixes them without
ordering them is misleading even when every item on it is true. The ordering that
holds up:

- **Behavioural** — what the person actually did inside your own process. Response
  latency, a withdrawn application, a rescheduled interview, work submitted. This
  is observation, not inference, and it outranks everything below it.
- **Document-structural** — countable properties of the document. Tenure
  arithmetic, claim counts, presence or absence of quantities. Deterministic,
  cheap, testable, and reproducible from the same input years later.
- **Document-hypothesis** — a reading of what the document's shape suggests.
  Honest, weak, and the natural home of most of this subject.
- **Model-emitted** — a language model's own risk impressions. Useful as a wide
  net over things no rule anticipated, and the least trustworthy tier there is: it
  cannot show its arithmetic, it varies run to run, and it is fluent enough to make
  a guess sound like a finding.

Build the deterministic tiers first and let the model's flags fold in **beneath**
them, clearly labelled as the lower-trust tier they are. That order is not a
performance preference. A deterministic detector can be pinned by a test, argued
with, and reproduced in an audit; a model flag can only be believed or not. When
the model is unavailable the deterministic layer still produces the checklist, and
the surface degrades honestly rather than blocking a candidate's progress.

## What a soft signal may and may not cause

- **It may cause a question.** That is the entire licensed effect.
- **It may cause a work sample to be chosen over another** — a targeted test is
  the strongest possible response to a hypothesis, and the cheapest way to stop
  arguing about a document.
- **It may cause a hold**, because holding is the direction uncertainty is allowed
  to resolve in.
- **It may not subtract from a score.** A soft reading that moves a rank has
  become a verdict, and it has done so without the candidate ever being asked.
- **It may not, alone or in aggregate, reject.** Accumulating five weak
  hypotheses does not produce one strong conclusion; it produces five unanswered
  questions, and the honest response to five unanswered questions is an interview.
  [no-adverse-outcome-is-solely-automated](../_laws.md#no-adverse-outcome-is-solely-automated)
  is the floor here, and this subject sits well above it: no adverse *routing*
  either.
- **It may not be shown to a candidate as feedback.** A rejection reason drawn
  from an unconfirmed hypothesis about their career shape is a claim nobody made
  and nobody verified.

## The failure modes worth naming

- **The dossier.** A page about the person rather than a checklist for the panel.
  Diagnostic: does the artifact read as *what to confirm* or as *what we think of
  them*? The technique on the what-to-confirm checklist exists for this one.
- **Confidence laundering.** A character inference emitted at confidence 0.4 with a
  needs-confirmation flag. The machinery of honesty applied to a claim that should
  never have been made — the labelling does not fix it, deletion does.
- **The double count.** The same observation appearing once as a score penalty and
  again as a flag. The reader sees two facts. There is one.
- **The rhetorical probe.** A "question" phrased so that only one answer clears it
  — "why so many job changes?" is an accusation with a question mark. The probe
  must be answerable well in more than one way, or it is a verdict being read
  aloud.
- **The stale hypothesis.** A signal generated against an older document, or an
  older rubric, still sitting on the panel's checklist after the interview already
  answered it. A signal is bound to the document version it was read from, and a
  confirmed or refuted signal must visibly leave the open list.
- **The unfalsifiable strength.** Symmetry done badly — vague praise that no probe
  could ever check — is as useless as vague risk, and it inflates the surface with
  things the interviewer cannot act on.

## Where this subject ends

It ends at the moment the question is asked. What happens then — how the answer is
scored, on what scale, by whom, and how independent scoring is protected before a
debrief — belongs to the structured-interview-scorecards subject, and this one must
not grow a scoring vocabulary of its own.

It also stops short of adversarial reading. Deciding whether a document is
*honest* — fabricated employers, impossible timelines, generated text — is the
authenticity-screening subject's job, and the difference matters: that subject asks
"is this true?", this one starts from "assume it is true, and ask what its shape
suggests we confirm". Overclaim detection sits exactly on that seam and stays on
this side of it: noticing that a document asserts far more than it evidences is a
statement about the balance of the document, not an accusation of dishonesty.

The general grammar of labelling a machine's guess — evidence budgets, refusals,
what silence means, how a degraded run is declared — belongs to the
inference-labelling subject, and this subject inherits it rather than restating it.
And where a reading contradicts something the candidate asserted about themselves,
the archetype-routing subject holds the pattern worth copying: a contradiction
**lowers confidence** in the inference; it does not override the person's own claim
about their own career.
