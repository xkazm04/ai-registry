---
layer: technique
type: technique
subject: evidence-provenance-weighting
technique: unproven-versus-missing-distinction
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [designing match output buckets, deciding what a knockout filter keys on, explaining a gap to a recruiter or candidate]
---

# Unproven is not missing

A skill the candidate weakly claims and a skill the record never mentions are
different facts, and a matcher that emits two buckets has to force one of them into
the wrong one. This technique defines the third bucket, the boundary rules that keep
it from becoming a hidden filter, and the reason taxonomy that makes it actionable.

## Three buckets, and what moves a claim between them

- **Matched** — the requirement is present in the record with sufficient evidential
  standing.
- **Unproven** — the requirement is present in the record, but the basis is weak: the
  claim is self-asserted, its origin is unknown, or the match itself was to a
  neighbouring skill rather than the named one.
- **Missing** — nothing in the record speaks to this requirement at all.

The load-bearing rule: **evidence strength moves claims between matched and unproven,
and never into missing.** Membership in *missing* is decided solely by whether the
record mentions the thing. A discount that can push a claim into missing is not a
discount; it is a hard filter wearing a multiplier, and it fires invisibly, because
nothing in the output says "excluded for thin evidence."

Concretely: a self-asserted claim that names the required skill *exactly* is unproven,
not missing — the exactness is real information, and the weakness is separately
recorded. Collapsing it to missing throws away a true statement about the person in
order to express a doubt the unproven bucket already expresses.

## Knockouts key on missing only

Wherever the pipeline has a knockout — a must-have requirement whose absence removes
someone from a list — it reads the *missing* bucket and nothing else. This keeps two
guarantees separable:

- **Evidence strength is advisory.** It reorders, it annotates, it directs an
  interview. It does not eliminate. [Uncertainty resolves toward the
  candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate).
- **Elimination is about facts, not confidence.** "This person's file does not mention
  the licence the role legally requires" is a knockout a human can defend. "This
  person mentioned it but we were not convinced" is a hiring judgment, and per [no
  adverse outcome is solely
  automated](../../_laws.md#no-adverse-outcome-is-solely-automated) it belongs to a
  person, not a threshold.

If a team genuinely wants weak evidence to be disqualifying for one requirement, that
is a policy the requirement declares explicitly and a human enforces at a gate — never
an emergent property of where the buckets were drawn.

## The reason taxonomy

An unproven verdict without a reason is a shrug. Each unproven claim carries which of
two independent conditions produced it — and the fact that both can hold at once:

| Reason | Meaning | What the interviewer should do |
| --- | --- | --- |
| Adjacency | The match was to a related or parent skill, not the named one | Probe transfer: how far does the neighbouring experience carry? |
| Provenance | The named skill matched, but only on a weak basis | Probe depth: ask for a concrete instance of the work |
| Both | Weakly-based evidence for a merely neighbouring skill | The weakest state; treat as close to missing without being missing |

The classifier that assigns the reason must **mirror the scorer's own resolution
path** — the same normalization, the same hierarchy lookup, the same fallbacks, in the
same order. A reason computed by a second, simpler procedure will eventually disagree
with the score that produced it, and a surface that says "unproven because the
evidence is weak" next to a score that fell short for an entirely different cause is
worse than no reason at all. One resolution, two readers.

An unproven claim also keeps its **strength number** alongside its bucket, because a
near-miss at the top of the unproven range and a bare assertion at the bottom warrant
different amounts of a recruiter's attention. The bucket routes; the number ranks
within the route.

The adjacency half of this taxonomy — hierarchies, sibling credit, normalization
across languages and spellings — belongs to the sibling practice of skill adjacency;
this technique owns the provenance half and the shared reason field. Keep them
independent: an adjacency system that quietly downgrades provenance, or a provenance
discount that manufactures an adjacency reason, makes the field unreadable and makes
both practices untunable.

## Rendering the three states

- The buckets are named in the output, not inferred from a number. A reader must be
  able to see *unproven* without deriving it from a score between two thresholds.
- Unproven renders with its reason and its probe, not as a warning icon. The purpose
  of the bucket is to convert a doubt into a question someone asks.
- Counts stay honest: "matched 7 of 10" must not silently include the unproven ones,
  and a summary that merges the two buckets to look better has re-created the failure
  this technique exists to prevent. [Absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence) applies to the
  headline number as much as to the store behind it.

## When not to use this

- **When the requirement is a verifiable fact rather than a capability.** Work
  authorization, a registration number, a licence — these are true, false, or not yet
  checked. A three-state evidence model over a binary fact produces "unproven work
  authorization", which is not a thing.
- **When the surface has no room for a reason.** A compact list that can show only two
  states should show *matched* and *not matched*, with unproven folded into
  not-matched for display only, while the underlying record keeps three. Folding
  upward — showing unproven as matched — is never the compromise.
- **When there is no human downstream.** The unproven bucket's whole value is that a
  person acts on it. In a fully automated path there is nobody to probe, which is the
  signal that the path should not be fully automated.
