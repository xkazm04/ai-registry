---
layer: golden-path
type: golden-path
subject: voice-interview-fidelity
status: forged
use_when: [an interview is conducted over a spoken channel, deciding what quality gate a transcript must pass before it is scored, a scorecard cites a technology the candidate does not recognise, judging whether fluency accent or pace may enter an assessment, a transcript is too long to pass to a synthesis step whole]
techniques:
  - entity-fidelity-not-aggregate-error-rate
  - closing-read-back-as-the-authoritative-record
  - accent-and-first-language-error-disparity
  - never-infer-from-how-a-person-sounds
  - transcript-sampling-that-keeps-the-conclusion
  - language-choice-and-per-turn-drift-detection
---

# Voice interview fidelity

A spoken interview does not produce evidence. It produces audio, and then a
machine produces a *guess* at what the audio said, and it is the guess — never
the audio — that is stored, sampled, summarised, scored, quoted back to a hiring
manager, and eventually defended if the decision is challenged. Everything this
subject is about follows from that one substitution. The candidate answered; a
recogniser answered on their behalf; and no downstream reader will ever be able
to tell the two apart, because the transcript arrives looking exactly as
confident as a transcript of a text chat.

This is not a transcription-quality problem in the way teams first frame it. It
is an **evidence-integrity** problem, and it has two halves that need entirely
different remedies:

- The channel **damages** the record — silently, unevenly, and worst on exactly
  the words a scorecard depends on.
- The channel **offers** a new and illegitimate signal — how the person sounds —
  which is available to every model in the pipeline and must be refused.

A team that solves only the first ships an accurate transcript of an unfair
assessment. A team that solves only the second scores a fabricated skill set with
excellent manners.

## The damage is not proportional to the error rate

The instinct is to gate on transcription accuracy: measure an overall error rate,
set a threshold, discard or flag anything above it. This gate is the wrong shape,
and its wrongness is the central lesson of the subject.

Consider a forty-minute conversation of some three thousand words in which two
words are wrong — two technology names, each substituted for a different, real,
plausible technology. The aggregate error rate is well under one percent, so any
quality threshold passes it, and the candidate is now on record as experienced in
two things they have never touched and as never having mentioned the two things
they actually named. The scorecard that follows is internally consistent,
well-evidenced, quotable, and about a person who does not exist. Meanwhile a
transcript with fifteen percent error concentrated in filler, articles, false
starts and repeated politeness is, for scoring purposes, nearly undamaged.
Aggregate error rate calls the first an easy pass and the second a hard fail.
Scoring damage runs the other way round.

The principle: **measure error where the conclusion lives.** A transcript's
fitness for a hiring decision is a function of how faithfully it preserves the
terms the rubric will look for — technologies, tools, systems, employers,
qualifications, quantities, scopes and time spans — and is close to independent
of everything else. So the gate is a *restricted* error rate over that lexicon,
with a much tighter budget than the aggregate one, plus a separate check that no
domain term the candidate spoke has simply vanished, because a missing skill is
scored as an absent skill and
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
is exactly the confusion a dropped word creates. See
entity-fidelity-not-aggregate-error-rate.

Two properties of this failure make it more dangerous than it first looks. The
substitution is **plausible** — recognisers do not produce nonsense, they produce
the nearest thing in their vocabulary, so the wrong term is a real technology in
the right family and no reader's eyebrow goes up. And the mishearing gets
**corroborated**: a responsive interviewer echoes terms back, so the corrupted
form appears a second and third time in the interviewer's own turns, and any
downstream heuristic that trusts repetition now has three occurrences agreeing.
The error does not merely survive review. It accumulates support.

## The only reliable repair happens while the candidate is still there

Once the call ends, there is no one left who knows what was actually said. The
audio may be retained, but nothing in a normal pipeline re-listens to it, and no
reviewer can distinguish a plausible substitution from a true statement. So the
repair must happen inside the conversation: near the end, the interviewer states
back the concrete particulars it believes it heard and asks the candidate to
correct them.

The conversational form of that turn — where it sits, how it invites correction
rather than agreement, why it lists particulars and never judgments — belongs to
the interviewer brief, and this subject does not restate it. What belongs *here*
is the downstream half, which is where read-backs usually fail: the read-back
must be **authoritative**. Every consumer of the transcript has to be told that a
confirmation or correction in the closing turns overrides earlier occurrences of
the same term, including more numerous earlier occurrences, because the
mishearing is precisely the form that got repeated. A read-back that is merely
present in the transcript and not privileged by the consumer is outvoted by
frequency, which is why teams conclude read-backs do not work.

Three states have to survive into the record, not two — **confirmed**,
**corrected** (keeping both the heard form and the meant form, since the heard
form is what every earlier turn contains), and **unconfirmed**, which is
reportable as unconfirmed and never asserted as a skill. And when no read-back
happened at all, the field is empty — never reconstructed, never inferred from
the transcript, because a reconstructed read-back is a fabricated confirmation and
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
forbids it outright. See closing-read-back-as-the-authoritative-record.

## Whose evidence gets damaged is not random

Here is the fairness core of the subject, and the reason an unmeasured voice
channel is not a neutral piece of infrastructure.

Recognition error is not evenly distributed across speakers. Published
evaluations of production speech systems have repeatedly found error rates
roughly twice as high for speakers of some vernacular dialects as for speakers of
the majority prestige dialect — and, more revealing than the averages, an order
of magnitude more *catastrophic* transcripts, where half the words or more are
wrong. Non-native speakers fare comparably or worse: studies across first-language
backgrounds routinely report native-speaker error in the low single digits and
accented speech many times that. Proper nouns and names outside the training
distribution are butchered at rates far above the running text around them —
which lands the disparity directly on the entity lexicon this subject just
identified as the only part that matters for scoring.

Compose those two facts and the consequence is not subtle: **the candidates whose
speech the recogniser handles worst are the candidates whose skill evidence is
most likely to be corrupted or deleted, and they are disproportionately the
candidates a fair process most needs to protect.** The voice channel is a
selection mechanism that nobody designed, nobody validated, and nobody sees,
because its output is a fluent transcript in every case.

The doctrine that follows is unpopular because it costs work:

- **Fidelity is measured per population, not in aggregate**, on whatever axes the
  team can hold lawfully and ethically — self-reported interview language,
  interview locale, self-declared accommodation needs. A single global entity
  error rate averages the harm away.
- **Where fidelity is poor, uncertainty resolves toward the candidate**
  ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
  A low-fidelity transcript is a defective instrument, not a weak performance. It
  downgrades the *confidence of the assessment*; it never downgrades the person.
- **A degraded voice interview must have a non-voice remedy that costs the
  candidate nothing** — a written path, a re-run, a human conversation — offered
  without requiring the candidate to disclose a reason or diagnose the failure.
  Making the remedy conditional on a request converts a system defect into a
  disclosure burden borne only by the affected group, and it stalls a candidate's
  process on the team's own constraints
  ([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **Recognition vocabulary biasing toward the role's domain lexicon is a fairness
  control, not a nicety.** Priming the recogniser with the technologies, tools and
  qualifications a role actually involves lifts fidelity most for the speakers it
  was worst for, because it supplies exactly the low-frequency terms the model was
  guessing at.

See accent-and-first-language-error-disparity.

## What a machine may never conclude from how someone sounds

The second half of the subject is the signal that must be refused.

A voice channel exposes fluency, accent, pace, pitch, volume, hesitation,
filled pauses, silence length and vocabulary range. All of it is trivially
available to any model with the audio or a rich transcript, and all of it
correlates with things that have nothing to do with job performance: first
language, region, class, age, neurotype, disability, hearing, illness, a bad
connection, the time of day, and how frightened the person is.

The evidence base for inferring competence, personality or "fit" from vocal
manner is the weakest of any signal in modern hiring. Attempts to predict traits
from voice and video have repeatedly failed external validity checks — the
inferences move when the input is perturbed in ways the underlying trait cannot
have moved — and the most visible vendors in that space withdrew their
expression-analysis components under sustained methodological criticism rather
than defend them. Treat the whole family as unvalidated, and treat any claim of
validation as requiring evidence that the inference is stable across accent,
first language and disability before it is even worth reading.

The operational rule is a flat prohibition, and it must be written into every
prompt that touches an interview and every rubric that consumes one:

> Nothing about *how* a person spoke may enter an assessment. Only *what* they
> said may.

No penalty for grammatical error, non-standard usage or a heavy accent; no credit
for polish; no inference of confidence, nervousness, honesty or "presence" from
pace, pauses or filler; no reading of silence as ignorance. And the affirmative
counterpart, which matters more than the bans because it changes ratings: **"I don't know" is a good answer.** A
candidate who declines to bluff has demonstrated calibrated self-assessment,
which is a real and rare competency; a rubric that rewards the confident wrong
answer over the honest gap has inverted its own construct.

Two edges are genuinely hard and deserve stating rather than hiding. First, if
communication is a bona fide requirement of the role, it is assessed as a scored
competency with its own behavioural anchors about being *understood* — not
smuggled in as a global impression of how the person sounded. Second,
transcription of a specific, verifiable claim is legitimate ("the candidate said
they led a team of eight"); interpretation of the delivery of that claim is not
("they said it hesitantly, suggesting exaggeration"). The line is not fuzzy in
practice: content versus delivery. See never-infer-from-how-a-person-sounds.

## The transcript is long, the budget is finite, and the conclusion is at the end

A full spoken interview overruns almost every synthesis budget, so something must
truncate it. The naive truncation — take the first N thousand characters — is the
single most destructive line of code in a voice pipeline, and it is almost always
written by someone who never read a transcript to the end.

Interviews are back-loaded. The closing turns hold the read-back, the
corrections, the strongest self-assessment, the candidate's own questions, and
whatever the interviewer surfaced last because it mattered most. A front slice
deletes exactly the material the rest of this subject spent its effort creating —
it deletes the read-back, which means the authoritative record of the entity
lexicon is discarded and the corrupted earlier occurrences are all that reach the
scorecard.

The correct shape is **head plus tail**: keep the opening, which establishes
context and the candidate's own framing, keep a larger tail, and mark the elision
in-band with a visible marker so the consuming model knows material is missing
rather than inferring a suspiciously abrupt conversation. Never drop the final
turns; if the budget is desperate, cut the middle harder. And whatever is
sampled, the derived artifact must carry the fact that it was sampled, because
[a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
applies to a scorecard built on two-thirds of a conversation exactly as it
applies to a statistic. See transcript-sampling-that-keeps-the-conclusion.

## Language is the candidate's choice, and drift is a defect

Where a role or a market is multilingual, the interview's language is a fidelity
concern before it is a courtesy. A recogniser configured for one language and fed
another produces not errors but *hallucinated fluent text* — plausible sentences
that were never spoken — which is the worst failure mode available, because it
passes every readability check.

Three rules hold. The candidate's language choice is established early and then
respected for the rest of the conversation; the interviewer does not switch
because a candidate borrowed a loanword or a technology name, since technical
vocabulary is very often English inside an otherwise non-English answer. Drift is
detected **per turn**, and a turn carrying strong markers of both languages
scores as indeterminate rather than as a violation — a bilingual greeting, a
code-switched technology name, a polite thank-you in the interviewer's language
must not raise a false flag against the candidate. And drift is only meaningful
*after* the candidate has established a language, so the opening turns are exempt.

Note who the finding is about: a drift flag is a defect report on the
*interviewer*, never a mark against the candidate. Code-switching is normal
bilingual behaviour and is not a scoreable event.

The most common root cause is worth naming because it survives review: the
candidate's language is captured correctly at the front door and then never
forwarded into the *speech* configuration, so the recogniser and the voice
runtime hold an account-level default while only the interviewer's instruction
text argues for the candidate's choice. Over a spoken channel the instruction
loses more often than it wins. Language is configuration first and instruction
second, and no test that exercises only the written path can see the failure. See
language-choice-and-per-turn-drift-detection.

## What counts as an interview at all

A last piece of hygiene that prevents a whole class of unfair record-keeping. A
call that connected is not an interview. Before anything is stored as a completed
assessment, two conditions must both hold: the candidate actually spoke — a
substantive amount, not a greeting — and the conversation was long enough to
cover something. A two-second connection failure must never become a "fully
interviewed" record, because that record is later read as a candidate who was
given their chance. Equally, a brief technical blip during a genuinely
substantive conversation must not throw away a real interview and force the
candidate to repeat it. The test is what the candidate contributed, not whether
the session terminated cleanly.

## Seams with neighbouring subjects

This subject is bounded on three sides and the boundaries are worth stating
plainly, because all three neighbours look like they should own parts of it.

**The interviewer brief** owns the conversation's rules — one question per turn,
narrowing rather than repeating, the ban on praise and verdicts, and the *wording
and placement* of the closing read-back as a conversational move. This subject
owns what happens to the read-back afterwards: that it is privileged over earlier
mentions, that its three outcomes are carried distinctly, that it is never
fabricated when it did not happen. The brief also owns the discipline that
internal instructions be recognisably internal; the mechanism that keeps them off
the candidate's device on a live-speech channel is a fidelity concern and lives
here.

**The scorecard instrument** owns what is scored, at what levels, on what
evidence, and the requirement that a rating cite near-verbatim evidence. This
subject supplies the constraint that makes that requirement safe: a near-verbatim
quote from a spoken interview may be a near-verbatim quote of a mishearing, so
the entity terms inside evidence must be resolved against the read-back before
they are asserted, and a competency that could not be assessed because the
channel failed is unassessed — never a low rating. One consequence lands squarely
here: whatever placeholder marks an unassessed axis must be recognisable to every
consumer by a single shared contract, because a quote field is rendered to humans
as the candidate's own words, and a boilerplate placeholder shown in that slot is
a sentence the candidate never said.

**Proving the interviewer is safe** — the evaluation harness, the regression
suite, the pass criteria for a brief change — belongs to conversational
assessment validation. This subject defines the *fidelity metrics* that such a
harness should be measuring; it does not own the harness, the fixtures, or the
release gate.

Outside the bundle entirely: model routing, streaming, cost, caching and general
telemetry for the speech and language services are ordinary engineering practice.
What stays here is the hiring half — what the recognition step does to a person's
evidence, and what no model may conclude from the sound of their voice.

## The test

Take any completed voice interview and ask three questions. Which terms in this
scorecard did the candidate actually say, and how do you know? If this candidate
had spoken with a different accent, would this record look different? And if the
answer to the second is yes, what did the process do about it?

A pipeline that cannot answer the first question is scoring a transcription. A
pipeline that has never asked the second is running an unvalidated assessment on
the axis it is least entitled to.
