---
layer: application
type: application
subject: llm-era-work-sample-design
technique: covert-probe-with-a-decision-space
stack: process
---

# Covert probes in the case-design prompt pipeline

The case designer is a prompt pipeline (`pipeline/jobfit/devcase/design.py`)
that emits a `CaseScenario` carrying `coverProbes`, a `midFlightUpdate` and a
seed of starting materials. The thesis is stated in the prompt itself
(`design.py:280-287`), and it is the standard's opening assumption verbatim:

> "ASSUME the candidate's code will be 100% LLM-generated — including the
> commits and any write-up, so NOTHING in the artifact proves authorship. The
> case's real instrument is AMBIGUITY."

## The three probe kinds are the prompt's own list

`design.py:282-284` names them: an underspecified/ambiguous requirement
(rewards clarifying), a legacy/surprising area (rewards reading before
generating), and a verification trap "where naive one-shot generation passes a
shallow check but is subtly wrong". The design rule follows in the same
sentence — "design each so the submission CANNOT avoid encoding a choice" —
which is the standard's *seam* criterion expressed as a generation instruction.

Kind is a closed vocabulary on the model (`models.py:127`:
`ambiguity | legacy_trap | verification_trap | underspecified`), and each kind
has a default `reveals` note (`design.py:89-94`) — "Do they read it before
generating, or break it?" for `legacy_trap`, "Do they add real tests /
validate, or trust one-shot output?" for `verification_trap`.

## `reveals` is mandatory, and the gap where it leaked

`CoverProbe.reveals` is documented as "what makes the probe a probe, so it is
MANDATORY" (`models.py:121-129`). The interesting part is the comment at
`design.py:84-88`: `coerce` and the validator `lifecycle_eval._check_case`
**used to disagree** — coerce kept a probe whose `reveals` the model left empty,
then the validator failed the whole case for it (`lifecycle_eval.py:92-93`).
The fix backfills from the kind-keyed default at `design.py:425` so a probe is
never emitted without a good-versus-naive criterion. A criterion that can be
silently empty is exactly the "unwritten criterion" failure mode the standard
names; here it was caught by two components disagreeing.

## The decision-space contract

`design.py:285-287` requires, per probe, "a 'decisionSpace': the 2-3 DEFENSIBLE
options it admits, each with a different trade-off (not one right answer +
distractors)" — the standard's core distinction, stated as a negative so the
model cannot satisfy it with a key plus decoys. The deterministic fallback
template models the shape it wants (`design.py:352, 359, 366`), e.g. for a
legacy trap: preserve and work around / revise with a safeguard first / replace
outright and accept the risk. Three options, three cost profiles, no strawman.

`decision_space` is best-effort where `reveals` is mandatory
(`design.py:432-435`, `models.py:136-142`): an empty list means "designed before
the decision-space contract" (case-design v4), not "no options exist" — the
absence has its own meaning rather than defaulting to a value. Everything
downstream reads it: the evaluator classifies which path the submission took, and
`mint_followups` anchors an authorship question to that specific choice.

## Calibration, count, and targeted probes

- **2-4 probes**, stated in the prompt (`design.py:281`) alongside a hard
  timebox that scopes to 3-4 focused tasks (`design.py:274-279`).
- **Seniority raises ambiguity, not deliverables** — verbatim at
  `design.py:274-278`: "senior/lead = MORE AMBIGUOUS and judgment-heavy — raise
  the DEPTH and ambiguity, NOT the number of deliverables … never pad a senior
  case with extra sub-deliverables to make it 'harder'." This is the upward
  lesson that made it into the standard's calibration rule.
- **Concrete seams**: "Be concrete — name real files/symbols/materials, avoid
  template phrases like 'per the brief'" (`design.py:279`).
- **Targeted confirmation** (`design.py:299-305`): where the candidate's own
  evidence raised hypotheses, at least one probe is baked to test each — "the
  candidate must NEVER see this". The document raises a hypothesis, the
  exercise tests it; the standard's rule that a hypothesis must not harden into
  a verdict, realized as a probe.

## Non-software roles are first-class

`design.py:258-263` forbids the material's vocabulary from leaking: the
starting materials are "a codebase for software, but a content/campaign library
for marketing, a financial model for finance, a CRM + playbooks for sales, a
design system for design" — and the JSON field is still named `repoSeed` "for
legacy reasons only", with the prompt explicitly instructing the model not to
call it a codebase unless the role is software. An internal field name that
outlived its domain, contained at the producing seam rather than shown to a
candidate.

## The seed materializes the seam

`seed_materializer.py` turns the prose seed into a small concrete file tree —
"a deliberate seam matching the case's probes" (`:52-55`), bounded to 12 files
and 6,000 characters each (`:44-46`) so it stays "small enough to read in
minutes, big enough that the tasks have something real to act on".

The refusal at `:117-119` is the standard's no-fabricated-ground-truth rule in
one comment: the deterministic path plants **no** canaries, because "a template
flaw with no real ground truth would grade candidates against noise", and the
empty list means "canary check not run" rather than "clean". (Canaries
themselves — planted flaws with one checkable answer, as opposed to a probe's
open decision space, `:28-36` — belong to the sibling subject on assistance
detection; the seam is that a canary has a truth value and a probe does not.)
