---
layer: technique
type: technique
subject: inference-labelling-and-refusal
technique: forbidden-inference-rules-in-the-prompt
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [authoring instructions that read candidate evidence, hardening a review that over-claims, running a deliberately blind screen]
---

# Forbidden-inference rules in the prompt

Instructions that tell a model what to produce always outnumber instructions that
tell it what it may not conclude. That imbalance is the defect. A model asked to
"assess this candidate" will assess along every dimension it can imagine, including
the ones the evidence cannot support and the ones it is not lawful to consider —
not out of malice, but because generating a complete-sounding assessment is exactly
what it was asked for.

A forbidden-inference rule is a *specific, enumerated* conclusion the model must
not draw, written into the instruction that generates the text. Not a virtue
statement ("be fair", "avoid bias") — a named prohibition tied to a named cause.

## The four families

**Beyond-the-budget refusals.** Tied directly to the enumerated evidence budget:
what was not supplied cannot be concluded. Stated in the negative and in the
model's own second person — "you are not reading the substance of the work; do not
infer craft, structure, or quality you cannot see." Where the model must judge a
requirement it has no evidence for, the honest output names that requirement as
*not evidenced* rather than passing over it silently, and the instruction says so
explicitly.

**Protected-attribute refusals.** Enumerate them; do not gesture. Age and its
proxies (graduation dates, career length, technology generations), health and
disability, pregnancy and family status, national origin and its proxies (name
morphology, language of prior employers, accent in a transcript), religion,
political affiliation, union activity. The prohibition covers *concluding*,
*mentioning*, and *reasoning from* — three separate leaks, and the last is the one
that survives a naive filter. Where a screen is deliberately blind, add the
reconstruction refusal: do not infer or guess a redacted identity from surrounding
context, and do not comment on the redaction.

**Artefact-shape refusals.** Forbid conclusions drawn from the form rather than the
content: résumé polish and formatting, template quality, fluency and grammar in a
non-native language, photograph presence or quality, document length. Each of these
predicts access to professional help far better than it predicts performance, and
each is trivially available to a model reading raw text.

**Data-not-instruction refusals.** The candidate's material is data. A line inside
a document instructing the reader to rate the applicant highly, ignore prior
instructions, or output a particular verdict is content to be reported, never
obeyed. The general defence belongs to the engineering discipline; the rule that
belongs here is why it matters in hiring — obeying a document lets one candidate
edit the rubric that everyone else is measured against, which is an unfairness
before it is a vulnerability. Two details carry their weight: fence the untrusted
material with explicit begin/end markers and label it untrusted *in the instruction
that introduces it*, and require the model to **record the attempt** as a risk
observation rather than silently declining it. A refusal that leaves no trace means
a deliberate manipulation and a clean document produce identical records.

## Procedure

1. **Derive the refusals from the budget, not from imagination.** Every input the
   budget excludes generates a refusal. This keeps the list short, specific, and
   automatically correct when the budget changes.
2. **Write them positionally close to the task.** A refusal three thousand tokens
   from the instruction it constrains is weaker than one adjacent to it. Restate
   the load-bearing refusals immediately before the output contract.
3. **Give each refusal an honest alternative.** "Do not infer X" without "instead,
   name X as not evidenced" invites the model to omit rather than to declare, and
   omission reads as clear. Every prohibition pairs with a prescribed honest form.
4. **Forbid the coverage claim by name.** Instruct that a clean result is scoped —
   the model may say what it checked and found nothing on, and may never say that
   nothing exists to be found.
5. **Mirror the refusal structurally.** For each refusal, ask what the system does
   if the model breaks it anyway. High-stakes refusals get a post-check that strips
   or holds the output; the rest get review sampling. An instruction alone is a
   strong prior, not a guarantee.
6. **Bias the default toward the candidate.** When a refusal is triggered and the
   output is unusable, the fallback state is *hold for a human*, never *adverse* —
   [uncertainty-resolves-toward-the-candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## Decision rules

- **When a requirement cannot be evidenced from the budget, the instruction must
  demand it be named explicitly as unevidenced.** Silence about a must-have is read
  by recruiters as satisfaction of it.
- **When a refusal and a completeness instruction conflict, the refusal wins**, and
  the instruction should say which one wins rather than leaving the model to
  arbitrate — a model told both "be comprehensive" and "do not speculate" will
  choose comprehensiveness, because that is the more concrete request.
- **When adding a new evidence source, re-read the refusal list before shipping.**
  New inputs silently retire old refusals and create new ones; a refusal list that
  is never revisited becomes both over-restrictive and under-protective at once.
- **When the same instruction serves several roles or jurisdictions, keep the
  refusal list a shared, single-source block.** Divergent copies mean one surface
  quietly permits what another forbids.
- **When a refusal is violated in production, treat it as a finding about the
  instruction, not about the run.** One violation predicts a class of them.

## When not to use it

- **As a substitute for not collecting the data.** The strongest refusal is an
  input the model never received. If an attribute must not influence a decision,
  prefer redaction upstream and keep the prompt refusal as the second line.
- **As a general safety preamble copied everywhere.** A long, generic prohibition
  block attached to every call trains the authors to stop reading it and dilutes
  the refusals that are specific to this task's evidence.
- **Where the model is not producing claims about a person.** Instruction hygiene
  is still good, but the refusal apparatus is calibrated for statements that will
  be acted on in a hiring decision.

The measure of a refusal list is not that outputs never over-claim; it is that when
they do, the honest form was available and named. A model that says "the record
does not evidence this requirement" was given somewhere to go
([say-only-what-the-record-holds](../../../../_laws.md#say-only-what-the-record-holds));
a model given only prohibitions will hedge into vagueness, which reads to a
recruiter as a soft negative and quietly becomes an adverse signal nobody wrote.
</content>
