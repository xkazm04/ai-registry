---
layer: technique
type: technique
subject: copy-quality-gates
technique: anchored-model-review
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [a model reviews or repairs copy that a mechanical gate has already passed, a review loop keeps rewriting strings that were fine, deciding how far a model reviewer's verdict may be trusted]
stage: solo
---

# Anchored model review

The judgment layer of a copy gate — is this native, is the collocation right, is
the register right for this surface, is the claim specific — is the part no
script decides, and a model is a cheap first reader for it. It is also the part
where a pipeline most easily degrades copy that was already right. A model asked
"is this good copy?" answers with confident taste; asked again, it answers with
different taste; allowed to repair, it rewrites until each run reports progress
and the text has drifted away from the reviewed original. The whole technique is
constraining the model so its output is a finding, not an opinion.

It pays for a single-owner product as much as for a team: an agent writer with
no human reviewer beside it is exactly the case where an unanchored review loop
does the most damage unobserved.

## Procedure

1. **Build the checklist per surface.** One binary question per rule identifier
   in scope for the unit's surface class ("Does a button start with a verb
   naming the outcome?" for the English subject's EN-BUTTON). Checklists of
   yes/no questions raised agreement with human judgment over direct scoring
   (46.4% to 52.2% exact agreement in Cook et al. 2024; the same direction in
   Lee et al. 2024).
2. **Give the reviewer the rendered unit, its surface class, its neighbours on
   the page, and the contract excerpt** — register line, exemplars, termbase rows
   for terms present. Never the writer's identity or its prompt.
3. **Require one output shape**: rule identifier, span quoted verbatim, minimal
   replacement, one-line reason.
4. **Filter mechanically before anyone reads the output.** Drop any finding
   whose identifier is not in the rule set, whose span does not occur verbatim in
   the unit, whose replacement changes the message skeleton, or whose replacement
   swaps a flagged word for its synonym without removing the empty claim
   (EN-SYNONYM-SWAP). These are not edge cases; they are the common output of an
   unconstrained reviewer.
5. **Isolate the reviewer from the writer.** A fresh context at minimum, a
   different model family where available. Self-preference grows with a model's
   ability to recognize its own output (Panickssery et al. 2024).
6. **Sample three runs and keep findings reported by at least two.** Output is not
   deterministic even at temperature zero, and single-run findings are where
   over-correction lives. For any pairwise comparison, run both orders; position
   bias is measured and large (Wang et al. 2024).
7. **Repair once, on flagged spans only**, then re-run the review on the repaired
   unit. It must find nothing new.
8. **Log every finding with the human verdict** where one is given; that ledger
   calibrates the rule and the reviewer together.

## Measuring the reviewer

- **Edit rate on a known-clean gold set.** A set of reviewed, approved strings
  per surface. The reviewer's target is near-zero findings on it; every finding
  there is a false positive with a price.
- **Idempotence.** Re-running on its own repaired output finds nothing. A reviewer
  that always finds something is measuring its instructions, not the copy.
- **Recall on seeded defects**, per rule, so a rule the reviewer never fires on
  is known to be unguarded rather than assumed clean.

## Decision rules

- **When a string flips A to B and back across runs, freeze it and escalate to a
  human**, because the reviewer has no stable view and further passes only move
  the text.
- **When a real defect has no rule to cite, propose a rule, do not fix the
  string** — minting the anchor lets one ruling pay for every later review, and
  an anchorless fix is taste acting.
- **When the reviewer and the writer are the same model in one context, treat the
  review as absent**, because self-correction without external feedback can
  degrade output (Huang et al. 2024) and self-bias grows across refinement
  rounds (Xu et al. 2024).
- **When a verdict concerns one string on a money page, it advises and a human
  decides**, because model judges track human judgment in aggregate and weakly
  per segment (Kocmi & Federmann 2023; Liu et al. 2023 reported correlations
  around 0.5).
- **When the question is whether text sounds generated, do not ask it**; judges
  asked for that verdict agree with humans at roughly chance (Shaib et al. 2025).
  Ask for the named property instead.

## When not to use it

- **On decidable defects.** A model consulted about placeholder parity or a
  forbidden variant spends budget producing a probability where the mechanical
  layer returns a verdict.
- **As a rewrite pass.** "Improve this copy" has no anchor and no stopping rule,
  and under [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
  it is a regression generator on reviewed copy.
- **As the fidelity check on translated strings.** Meaning against the source is
  bilingual revision; a monolingual judgment of fluency hides omissions.
