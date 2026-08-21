---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: entity-fidelity-not-aggregate-error-rate
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [setting the quality gate a spoken transcript must pass before scoring, a transcript passed quality checks and still produced a wrong skill profile, choosing what to measure in a speech pipeline]
---

# Gate on entity fidelity, not on aggregate error rate

The quality gate for a transcript that will be scored is an error rate computed
**only over the terms the assessment depends on**, held to a much tighter budget
than any overall accuracy figure, and paired with a separate check that no domain
term the candidate spoke is missing from the transcript entirely.

## The concern

Aggregate error rate — the fraction of words wrong across the whole transcript —
is the wrong instrument for a hiring pipeline for one reason: it weights every
word equally, and a scorecard does not. Substituting an article costs nothing.
Substituting one technology name for a different real technology costs the entire
skill profile, and moves the aggregate figure by a fraction of a percent in a
conversation of a few thousand words.

The two transcripts that matter look like this:

- Three thousand words, two wrong, both of them named technologies. Aggregate
  error well under one percent — passes any threshold. The candidate is now
  recorded as skilled in things they never mentioned and unskilled in things they
  spent ten minutes on.
- Three thousand words, four hundred wrong, all of them filler, articles, false
  starts and repeated politeness. Aggregate error over thirteen percent — fails
  every threshold. Every scoreable claim survived intact.

An aggregate gate passes the first and fails the second. Scoring damage runs
exactly the other way, so the gate is not merely imprecise; it is anti-correlated
with the thing it is supposed to protect.

## The procedure

1. **Define the lexicon before the interview, not after.** It is the set of terms
   the rubric can look for: technologies, tools, platforms, methodologies,
   certifications and qualifications, employers, systems, and the quantitative
   forms that carry scope — team sizes, durations, percentages, currency amounts.
   The role's own requirement list is the seed; a shared domain vocabulary
   maintained across roles is the durable version.
2. **Compute a restricted error rate.** Align the transcript against a reference
   only over occurrences of lexicon terms. An entity counts as correct only when
   **all** of its constituent words are correct — a two-word framework name with
   one word wrong is a wrong entity, not half a right one.
   Two matching details decide whether the metric works at all. **Match
   morphology, not strings**: in an inflected language a term appears with case
   endings attached, and a matcher that demands the citation form reports every
   correctly-heard term as missing. Match on the stem with a bounded suffix
   allowance, longest term first so a longer name is not swallowed by a shorter
   one it contains. And **exclude short ambiguous terms** from the lexicon
   entirely — one- and two-letter language names collide with ordinary speech and
   turn the gate into noise.
3. **Compute a deletion check separately.** For each lexicon term the candidate
   spoke, ask whether it appears anywhere in the transcript. A term that vanished
   is not a small error; it is a skill the scorecard will rate as absent, which is
   the exact confusion
   [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
   exists to prevent. Deletions and substitutions have different remedies and must
   not be averaged together.
4. **Set two budgets, and make the entity one much tighter.** The aggregate figure
   stays as a coarse channel-health signal — it catches a broken microphone, a
   wrong language, a collapsed connection. The entity budget is the gate on
   scoring. A useful starting posture: an entity budget around a fifth of the
   aggregate one, then tightened by measurement rather than by taste. The
   defensible extreme, and the one worth starting from, is a **zero budget on
   deletions**: any spoken domain term absent from the transcript fails the
   session outright. Deletion is unrecoverable and silent, whereas a substitution
   at least leaves a wrong word a read-back can catch.
5. **Report both figures with the transcript**, and carry them onto anything
   derived from it, because
   [a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
   applies to a rating built on a measured-imperfect record.

## Getting a reference without a transcriptionist

The objection is always the same: a reference transcript requires human
transcription, which nobody will fund. Three practical substitutes, in order of
strength:

- **A held-out labelled set**, transcribed once, of real interviews across the
  accents and first languages the pipeline actually serves. Expensive once, then
  reusable for every model change, every vocabulary change, every vendor
  migration. This is the only way to compare *systems*.
- **The read-back as a live reference on every interview.** The candidate's
  confirmation or correction of a term is ground truth for that term, produced by
  the only person qualified to produce it. Comparing read-back terms against the
  earlier transcript occurrences yields a per-interview entity fidelity signal for
  free.
- **Recogniser confidence over lexicon spans**, as a weak proxy only. Low
  confidence on an entity span is a reason to distrust it; high confidence is not
  evidence of correctness, because a confident substitution is the characteristic
  failure.

## Decision rules

- **When entity fidelity fails the budget, the transcript is not scoreable as
  fact.** It may still be read by a human; it may not silently produce asserted
  skills. Mark the affected terms unconfirmed, or route the interview to a remedy.
- **When a term is present but flagged low-confidence and never confirmed, it is
  reportable as unconfirmed and never as a possessed skill** —
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).
- **When the deletion check fires, prefer the remedy that recovers the term over
  the remedy that discards the interview.** A follow-up question, a written
  addendum or a targeted re-listen is cheaper for everyone than a re-run.
- **When entity fidelity is good but aggregate error is terrible, score the
  interview.** Filler-heavy transcripts are the normal output of a nervous person
  speaking a second language, and discarding them is a fairness failure dressed as
  quality control.
- **Never let the entity lexicon become a scoring lexicon.** It exists to check
  the channel. Rating a candidate on how many lexicon terms they hit is keyword
  matching, and it rewards vocabulary over understanding.

## When not to use it

- **Text-channel interviews**, where the candidate's own keystrokes are the
  record and no recognition step exists.
- **Conversations with no scoreable particulars** — a scheduling call, a logistics
  confirmation. There is no lexicon to protect.
- **As a substitute for the read-back.** Measurement tells you the channel is
  damaging evidence; it does not repair any individual interview. A pipeline with
  excellent entity metrics and no in-conversation verification still ships
  corrupted transcripts, it just knows how often.
