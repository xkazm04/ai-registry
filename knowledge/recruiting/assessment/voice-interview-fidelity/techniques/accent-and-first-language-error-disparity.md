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

The published evidence is consistent on direction and looser on size than it is
usually quoted. The 2020 evaluation of five commercial systems found error
**twice as high** for Black speakers as for white speakers (0.35 against 0.19)
and about ten times the share of *catastrophic* transcripts, where half the words
or more are wrong (more than a fifth of snippets against under two percent). A
2024 controlled-prompt evaluation of an open model family found the ratio still 2.4
to 2.8 times across two model sizes, and 1.2 times for a model trained on a
different speech mix. The gap therefore tracks the training data, and scale alone
narrows it slowly. Whether the *tail* has narrowed is not shown: no recent
measurement of catastrophic-transcript rates was found, so treat any claim about
the tail, in either direction, as unmeasured. Non-native speech is uneven, not
uniformly many times worse: a 2025 five-system comparison on read speech from 24
speakers found error concentrated in particular first languages, the widest
about twenty times a US-English control, while on 22 spontaneous recordings the
first-language differences were not significant. Proper nouns and names outside
the training distribution are commonly reported as the weakest region, and
regional dialects within a single country show their own gaps; no figure isolating
either was checked here. No independent Czech measurement on spontaneous or
accented speech was found, only vendor-page figures on read benchmarks, so a
pipeline serving Czech candidates measures its own.

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
3. **Bias the recogniser toward the role's domain lexicon, and measure both
   sides.** Priming recognition with the technologies, tools, systems and
   qualifications a role actually involves supplies the low-frequency terms the
   model was guessing at. That it helps the speakers served worst *most* is a
   hypothesis: no study reporting biasing gains by accent group was found, and
   gains plausibly track how well the base model already decodes the audio, which
   would put the largest gains where the least is needed. Biasing also has a
   documented cost, a boosted term transcribed where it was not said. Give the
   list a deploy-time artifact, a review cadence, a null-audio control before it
   grows (phantom-terms-and-silence-insertions), and the stratified before-and-after
   that shows whether it moved the gap.
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
