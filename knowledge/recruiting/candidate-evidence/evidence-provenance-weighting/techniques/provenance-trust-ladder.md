---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: provenance-trust-ladder
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [defining evidence tiers, scoring a skill claim, reviewing why a candidate ranks where they do]
---

# Provenance trust ladder

The ladder is the enumerated, ordered set of bases on which a person can be said to
hold a skill, each carrying a multiplier applied to that skill's contribution to a
score. It exists so that the sentence "this candidate has this skill" stops being a
boolean and becomes a claim with a stated basis, per [a claim carries its sample and
its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis).

## Building the ladder

Rank bases by **how hard the claim would be to make falsely**, not by prestige,
duration, or pay. That single criterion produces a defensible order:

| Rung | Basis | Why it sits there |
| --- | --- | --- |
| Top | Observed — the system watched the work happen, and can say who did it | Falsifying it requires doing the work, but only when the performer is attested |
| Top | Professional — described work in a named role | Falsifiable, but a reference call resolves it. Earned by what the role shows was done, not by how long it lasted |
| High | Proctored, identity-verified performance exam | Observed work, observed by a third party |
| High | Contributed open work attributable to the person; structured placement | The artifact is inspectable, or a third party attests the placement |
| Mid | Substantial academic work of real scope | Supervised, dated, and bounded — real but narrow |
| Mid | Personal project | Real artifact, unsupervised scope, unknown depth |
| Low | Attendance-based certificate; extracurricular | Attests exposure, not capability |
| Low | Coursework | Attests a syllabus, not a person |
| Floor | Self-asserted — a skills list, a header, a checkbox | Costs nothing to make |
| Floor | Unknown origin | See [default-provenance-fails-safe](./default-provenance-fails-safe.md) |

Two rungs deserve explicit treatment because teams get them backwards. Contributed
open work sits *high* — often level with paid work — because its artifact is
inspectable in a way most employment is not. And attendance certificates sit *low*
despite their formality: a certificate is a receipt, and receipts attest transactions,
not skill. A ladder that rewards certificates above shipped artifacts has ranked
paperwork. The exception is an exam: a proctored, identity-verified performance
exam is not a receipt, and it sits with the high rungs. A licence the role legally
requires is not a rung at all. It is a fact to verify.

## Verifiability, not validity

The ordering criterion is the one the selection literature supports. Verifiable
biodata items keep their validity when real applicants answer them, while
non-verifiable ones lose it (Harold, McFarland & Weekley 2006). Applicants rate
themselves higher on harder-to-verify skills (Schmidt, Bourdage, Lukacik & Dunlop
2022). Self-evaluations of ability correlate .29 with measured performance (Mabe &
West 1982). That is the evidence for putting the floor where it is.

It is not evidence that the ladder ranks predictors. In the revised estimates of
Sackett, Zhang, Berry & Lievens (2022), work samples sit at .33, structured interviews
at .42, and years of job experience at .07; Van Iddekinge et al. (2019) found .06 for
pre-hire experience. Two consequences:
- **The professional rung is earned by content, not tenure.** The Uniform Guidelines'
  test for an experience requirement is "the resemblance between the specific
  behaviors, products, knowledges, skills, or abilities in the experience ... and
  ... required on the job" (29 CFR 1607.14(C)(6)). A role that describes the work
  earns the rung. A title with a date range and nothing else is a claim the document
  makes. Duration is a multiplicity signal, and a weak one.
- **A rung's weight is not its validity.** Never report a rung's multiplier as a
  measure of how well that basis predicts performance.

## Access is measured, not assumed

A rung that is sound as evidence can still be out of reach for some groups. Open
source is the clearest case: women were about 9.8% of contributors in Trinkenreich et
al. (2021). Unpaid placements are another. The ladder's structure already keeps the
absence of a rung from counting against anyone, since a missing basis is no claim,
not a discounted one. It cannot keep the *presence* of a high rung from being
unevenly available. Report the share of claims on each rung by group, and treat a
gap as a selection-rate question for the adverse-impact practice. Re-weighting a rung
until the distribution looks better is the tuning the re-baselining technique
forbids.

## Decision rules

- **When a rung's discount is challenged, defend the order, not the number.** The
  multipliers are tuning parameters with no ground truth. The ordering is the actual
  claim and it is what you can argue in a review. Never present a
  provenance-weighted score as an accuracy measurement.
- **When two rungs are hard to separate, collapse them.** A ladder with nine rungs and
  three real distinctions invites false precision. Rungs must be distinguishable by a
  human reading a document, or the extractor will assign them by coin flip.
- **When a rung would encode something other than evidential strength, delete it.**
  Employer size, institution tier, contract type, country of study, and career shape
  are not provenance. Encoding them here launders a preference into an evidence model
  and will surface later as a selection-rate gap nobody can explain.
- **When adding a rung, state what a claim on it can and cannot support.** A rung
  without a written meaning drifts within one quarter.
- **Assign at extraction, never after.** Provenance is a property of the span the
  claim came from. Reconstructed later from a finished skill list, it is a guess
  dressed as a fact, and it guesses worst on the documents that most needed it.

## The ladder must survive display

A ladder used only inside the score is half-implemented. The rung reaches the
recruiter's screen as a label, and per [inference must look like
inference](../../../_laws.md#inference-must-look-like-inference) it must be visually
distinguishable from a measurement: a claimed skill and a demonstrated one may not
share a checkmark. Two rules govern the surface:

- The top rung never falls through to a generic bucket. Wherever tiers are mapped to
  display categories, an unmapped tier is a defect, not a default — collapsing
  "observed" into "other evidence" throws away the one rung the system paid to earn.
  The same holds for every rung the pipeline emits. Fixing one fallthrough by
  sending everything unnamed to "unknown" turns a thesis into "we don't know", which
  is a false statement about the record even though it errs downward. Pin the mapping
  with a test that loops the ladder's own vocabulary. A test built on one invented
  slug passes while half the real rungs fall through.
- The label is honest downward, never upward. When display provenance is missing,
  render the floor. Rendering a strong tier for an unestablished claim asserts a
  verification that never happened.

## Two populations of rungs

The rungs split by who may assign them, and the split must be explicit in the data,
not in a convention:

- **Machine-only rungs.** The observed tier is minted by a live process and may never
  be picked by a candidate or typed by a recruiter. The unknown rung, if the ladder
  has one, is a scoring fallback and is likewise not a choice anybody makes.
- **Selectable rungs.** Everything else is a curated subset, ordered weakest to
  strongest, that a person can assert about themselves.

Publish the selectable subset from the same definition the weights live in, so a rung
offered in an interface always has a weight and a rung with a weight never leaks into
a picker it does not belong in. A hand-maintained second list is how "observed"
eventually appears in a self-service dropdown.

## The multiplier is capped at full credit

The top rung's weight does not exceed full match credit. Letting it exceed means one
demonstrated skill can outweigh the requirement it satisfies, and the score stops
being a fit measure. The top rung's advantage over the next one is realized in two
other places instead:

- **Confidence.** An observed skill narrows the confidence band around the result;
  the same score with demonstrated evidence behind it is a *firmer* score.
- **Consolidation.** It outranks every weaker basis for the same skill, which is where
  it does the most work for a candidate whose other evidence is thin.

If two rungs share the top weight, consolidation must break the tie by **rank**, not
by weight, or the ordinal ladder is silently a two-element one at the top.

## Ordinal, not arithmetic

The rungs are an order with weights, and the weights multiply a single skill's
contribution. They are not scores to be averaged across a candidate, subtracted from
each other, or summed into an "evidence score" for a person. Averaging tiers is how a
padded skills list dilutes real work; see
[strongest-provenance-wins-consolidation](./strongest-provenance-wins-consolidation.md)
for the correct resolution when one skill carries several bases.

## When not to use this

- **When no origin information exists anywhere in the intake.** A ladder over an
  intake that never captures a basis assigns every claim the floor, which is correct
  but useless. Fix the extraction first; a ladder with one populated rung is theater.
- **For non-skill attributes.** Location, availability, authorization, and compensation
  expectations are facts to verify or ask about, not evidence tiers. Running them
  through a strength discount produces a fractional truth value about a binary fact.
- **As a candidate-level quality score.** The ladder types claims. A single number per
  person built by aggregating rungs re-collapses exactly the distinction the ladder
  was built to create.
