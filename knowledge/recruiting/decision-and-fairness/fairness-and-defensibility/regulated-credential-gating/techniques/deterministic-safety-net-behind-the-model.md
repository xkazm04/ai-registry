---
layer: technique
type: technique
subject: regulated-credential-gating
technique: deterministic-safety-net-behind-the-model
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, say-only-what-the-record-holds, every-decision-names-its-actor]
shared_with: []
use_when: [a language model is extracting credentials that feed a hard gate, designing what happens to a legal check when a model run degrades, deciding what binds when narrative and gate disagree]
---

# Deterministic safety net behind the model

A generative pass is the right extractor for credentials buried in career prose and the
wrong holder of a legal gate. The technique is to use it for the first job and forbid it
the second: **the model produces structured facts; a deterministic pass over those facts
produces the gate.**

## Why the model cannot be the gate

Three properties, none of them fixable by prompting harder:

- **Non-determinism.** The same profile against the same requisition can produce a
  credential mention on one run and not on the next. A legal precondition whose
  enforcement varies run to run is not a precondition.
- **Silence is ambiguous.** When the output does not mention a licence, that is
  indistinguishable from a finding of absence, from a truncation, from an attention
  failure on a long document, and from a schema field the model simply skipped. A gate
  built on "did it say so" cannot tell those apart, and three of the four are bugs.
- **Fluent fabrication.** A model is exactly as fluent producing an identifier as
  copying one. A completed licence number is worse than a blank: it looks like the thing
  a downstream verifier trusts, and it fails at the register in a way that reads as
  candidate fraud
  ([say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds)).

## Procedure

1. **Constrain the extraction to first-class fields.** Credentials come back as typed
   records — kind, issuer, jurisdiction, identifier, dates — not as sentences inside a
   rationale. A free-text credential mention forces every downstream reader to re-parse
   prose, and they will each do it differently.
2. **Instruct the extraction against invention explicitly**, at the field that invites
   it. "Capture the identifier only where it is stated; leave it empty otherwise" earns
   its place in the prompt because the failure it prevents is the most damaging one in
   the subject.
3. **Run a second pass with no model in it.** Take the requisition's required-credential
   set and the candidate's structured records and recompute: required-and-not-evidenced,
   required-and-expired, required-and-wrong-jurisdiction, required-and-undetermined. This
   pass is pure, testable, and re-runnable over historical results.
4. **Let the deterministic pass bind.** Where the narrative says "strong fit" and the
   gate says a precondition is unevidenced, the gate wins and the verdict is capped. The
   model's opinion is not deleted — it is displayed under a capped conclusion.
5. **Also state the rule inside the prompt.** Belt and braces are correct here, not
   redundant: the prompt-level instruction improves the narrative the recruiter reads,
   and the deterministic pass guarantees the outcome. Neither substitutes for the other,
   and the common mistake is to have only the first.
6. **Log disagreements.** A persistent divergence between the narrative's assessment and
   the gate is a defect report about the prompt, and it is the only channel through which
   you will ever receive one.
7. **Pin the gate with tests over the requisition text**, not only over the structured
   inputs: a licence requirement stated in the requisition must be detected, and flagged
   when absent or expired. That assertion is the contract; without it, a prompt edit or a
   catalog change can disarm the gate with every test still green.

## Decision rules

- **When the model output is missing, malformed, truncated or schema-invalid, the gate
  does not clear.** Absence of a credential record is not evidence the credential is
  absent, and it is certainly not evidence it is present.
- **When the model is unavailable, continue deterministically.** The gate is not a model
  feature; the pipeline proceeds with provenance truthfully downgraded and the verdict on
  hold, rather than blocking a candidate's process on an outage
  ([a candidate's process never stalls on your constraints](../../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the model returns an identifier not present in the source, drop it.** Where the
  source text is available, checking the identifier's literal presence is a cheap and
  decisive validation.
- **When the gate overrides a narrative conclusion, record that it did**, with the rule
  and the actor, so the file explains itself later
  ([every consequential decision names its actor](../../../../_laws.md#every-decision-names-its-actor)).
- **When a new caller reaches the result without going through the analysis pass**, it
  must still see the capped verdict — which means the cap is applied to the stored
  record, not composed at render time by one surface.

## When not to use this

- **Do not use it to second-guess soft assessments.** A deterministic override on a
  capability judgment just replaces a model's rubric with a hand-written one, badly. The
  net exists because the underlying fact is binary and externally defined; nothing else
  in the pipeline has that shape.
- **Do not use it as a reason to skip verification.** A deterministic pass over
  self-asserted data is still a pass over self-asserted data. It makes the gate reliable,
  not the claim true.
- **Do not build it as a post-hoc filter on rendered text.** Regex over a narrative
  paragraph to catch a missing licence is the same fragility one layer later. The net
  runs on structured records or it is not a net.
