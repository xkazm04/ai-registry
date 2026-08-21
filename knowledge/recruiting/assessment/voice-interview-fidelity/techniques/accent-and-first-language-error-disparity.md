---
layer: technique
type: technique
subject: voice-interview-fidelity
technique: accent-and-first-language-error-disparity
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-claim-carries-its-sample-and-its-basis, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [a voice interview is offered to a multilingual or multi-accent candidate pool, auditing a speech pipeline for disparate impact, deciding whether a voice channel is fit to carry an assessment]
---

# Measure and remedy recognition error disparity

Speech recognition error is not distributed evenly across speakers. Measure
transcript fidelity **per speaker population**, treat a low-fidelity transcript as
a defective instrument rather than a weak candidate, and provide a non-voice
remedy that costs the candidate nothing to take.

## The concern

The published evidence is consistent and has been for years. Evaluations of
production recognition systems have found error rates roughly **twice as high**
for speakers of some vernacular dialects as for speakers of the majority prestige
dialect, and — more revealing than any average — around an order of magnitude more
*catastrophic* transcripts, where half the words or more are wrong. Studies across
first-language backgrounds report native-speaker error in the low single digits
against accented speech many times higher. Proper nouns and names outside the
training distribution fail at rates far above the running text surrounding them,
and regional dialects within a single country show their own gaps. Newer
foundation models narrowed the averages; they did not close the gap, and the
tail — the catastrophic transcripts — narrowed least.

Now compose that with the fact that scoring damage lives almost entirely in the
entity lexicon, which is exactly where out-of-distribution proper nouns sit. The
result is the fairness statement of the whole subject: **an unmeasured voice
channel systematically damages the evidence of exactly the candidates a fair
process most needs to protect.** No adverse decision was made on accent; the
evidence simply arrived thinner, and a thin record reads as a thin candidate.

This is disparate impact through infrastructure. It leaves no trace in any prompt,
rubric or decision, because the artifact it produces is a fluent transcript in
every case.

## The procedure

1. **Stratify the fidelity measurement.** Compute entity fidelity per population
   on axes the team can hold lawfully and proportionately — the interview language
   the candidate chose, the locale of the interview, declared accommodation needs,
   and any voluntarily provided demographic data held under its own consent. A
   single global figure averages the harm away and is the number that lets a team
   believe the channel is fine.
2. **Publish the strata with their sample sizes.** A per-population figure on nine
   interviews is not a finding
   ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
   Small cells are reported as small, never suppressed and never rounded into the
   aggregate.
3. **Bias the recogniser toward the role's domain lexicon.** Priming recognition
   with the technologies, tools, systems and qualifications a role actually
   involves raises fidelity most for the speakers it was worst for, because those
   are precisely the low-frequency terms the model was guessing at. Treat this as
   a fairness control with a deploy-time artifact and a review cadence, not as a
   tuning nicety.
4. **Set a per-population floor, not just a global one.** A channel that passes in
   aggregate and fails for one population is failing, and the remedy is owed to
   that population now, not after the next model upgrade.
5. **Route below the floor.** A candidate whose transcript falls short gets the
   remedy automatically.

## What the remedy has to look like

- **Offered, not requested.** If the candidate must ask, the burden falls entirely
  on the people already disadvantaged, and asking requires them to diagnose a
  system failure they cannot see. Detect and offer.
- **No reason required, no disclosure required.** A remedy conditional on
  explaining why is a disclosure tax on disability, accent and first language.
- **No cost in standing or in time.** A written path, a re-run, or a conversation
  with a person — and the candidate's position in the process is unaffected while
  it happens.
- **Never framed as a deficiency of the candidate.** The message is "our recording
  of this conversation was not good enough", because that is the truth.

## Decision rules

- **A low-fidelity transcript downgrades the confidence of the assessment, never
  the candidate**
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
  Competencies that could not be assessed are unassessed. They are not low ratings.
- **No rejection may rest on a transcript below the fidelity floor without a human
  who has seen the fidelity figure**
  ([no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)).
  The reviewer needs to be told the record is defective; a fluent transcript will
  not tell them.
- **When a population's fidelity cannot be measured because the data is not held,
  say so and treat the channel as unvalidated for that population** — do not infer
  accent from a name, a location or the audio itself in order to fill the cell.
  Inferring the protected axis to audit fairness on it creates a worse artifact
  than the gap it fills.
- **When a vendor or model changes, the stratified measurement is re-run before
  the change ships.** An upgrade that improves the average while regressing one
  population is a common and invisible outcome.
- **Never require candidates to "speak clearly" as a mitigation.** Instructing
  people to suppress their accent is both ineffective and an explicit demand that
  they perform a prestige dialect to be assessed fairly.

## When not to use it

- **Where no voice channel exists.** The disparity is a property of recognition,
  not of interviewing.
- **As an argument for abandoning voice interviews entirely.** Spoken interviews
  are an accessibility gain for some candidates — including those for whom typing
  is difficult — and removing the channel trades one group's exclusion for
  another's. The obligation is to measure it and to keep a real alternative open
  in both directions.
- **As a substitute for the entity gate.** This technique tells you *whose*
  evidence is being damaged. It does not repair any individual interview.
