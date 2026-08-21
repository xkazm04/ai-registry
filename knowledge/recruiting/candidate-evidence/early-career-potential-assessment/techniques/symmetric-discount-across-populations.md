---
layer: technique
type: technique
subject: early-career-potential-assessment
technique: symmetric-discount-across-populations
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, a-predictor-cannot-grade-its-own-labels]
shared_with: []
use_when: [reviewing any scoring penalty that is conditional on candidate type, auditing a rubric for adverse impact, adding an evidence requirement to a match score]
---

# Symmetric discount across populations

The rule this technique enforces is one line:

**Any penalty for weak or missing evidence applies identically to every population, or
it does not exist.**

It is short because it has to survive being quoted in a design review, and it exists
because the violation is invisible from inside. Each half of the violation looks like
good judgment. Only the composition is indefensible, and nobody reviews the composition.

## The incident shape

A team adds a discount for unevidenced claims: a skill asserted with nothing behind it
scores lower than one backed by an artifact or a demonstration. Correct — that is
provenance weighting doing its job.

Later, someone notices that experienced candidates carry long histories where
evidencing every single claim is impractical, and their scores are suffering. They
waive the discount for that population. In isolation, also reasonable.

Composed, the system now penalises the same unevidenced claim for the person least able
to evidence anything and forgives it for the person most able to. The discount has
become a tax scoped to students, career changers and returners — populations whose
evidence is thin for structural reasons, not deceptive ones. And it is worse than a
plain filter, because it is disguised as rigour: the penalty's stated rationale
("unevidenced claims are worth less") is one everybody agrees with, so nobody re-reads
where it applies.

Every conditional penalty has this shape available to it. Staleness decay waived for
seniors. A confidence floor applied only to unclear files. A "must show progression"
heuristic that only fires when a history exists to be non-progressive. Each begins as a
correction and ends as a population-scoped adverse rule.

## The procedure — the symmetry audit

Run this over every penalty, multiplier below one, floor, and conditional branch in the
scoring path. It takes an afternoon and it is the highest-yield fairness review
available in a match engine.

1. **Enumerate every adverse adjustment.** Anything that lowers a score or blocks a
   route. Include ones expressed as *not applying* a bonus — a bonus that only one
   population can earn is a discount on everyone else.
2. **For each, write down the populations it can fire for.** Not the populations it was
   *designed* for — the ones the code path can actually reach, given how candidates are
   routed.
3. **If the set is not "all", ask the reversing question:** would we accept this penalty
   applied to our most senior candidates? If yes, extend it to them. If no, it was never
   a fairness rule; delete it.
4. **Choose the repair direction by asking whether the rule is a default or a penalty.**
   This is the distinction that decides which way symmetry gets restored, and it is
   easy to get backwards:
   - A **default** is what you assume when the record says nothing. Levelling a default
     *down* — everyone's unrecorded claims are treated as unevidenced, senior and
     graduate alike — is legitimate and often correct, because a conservative default
     is honesty about absence rather than punishment, and any candidate can escape it
     by supplying a record. The escape hatch is what makes it fair: per-item recorded
     provenance always overrides the default, for everyone.
   - A **penalty** subtracts from what the record *does* say. It cannot be levelled
     down onto a population that could not have avoided it; where it cannot apply
     universally, drop it, per
     [uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
     Reach the intended effect through the readiness rubric's *missing input* path
     instead: an unevidenced claim contributes nothing, which is already a real cost,
     rather than contributing negatively.
5. **Record the audit and its date.** Symmetry decays. Every new special case for a
   struggling population re-introduces it, usually with a sympathetic motive.

The correction to the incident above is the first case: the fix was not to waive the
discount for everybody, it was to give *everybody* the conservative default — one honest
baseline, with recorded evidence overriding it per claim. That resolution is stricter on
the previously exempt population and unchanged for the previously penalised one, which
is exactly the shape a genuine symmetry repair usually has. If your repair only ever
makes scores go up, check whether you repaired the asymmetry or just relocated it.

## Decision rules

- **A missing input costs its contribution; it never costs extra.** Not-measured means
  the dimension does not add, not that it subtracts
  ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
  Double-counting absence — once by omission, again by penalty — is the arithmetic form
  of this whole failure.
- **A rule scoped by archetype is a rule under suspicion.** Different *weights* per
  population are legitimate (a rubric may value different things for different careers);
  different *penalties* per population are almost never legitimate, because a penalty
  encodes a suspicion, and suspicion aimed at one population is what discrimination is.
- **When a penalty was added to fix a specific bad candidate, delete it.** Rules written
  from one file generalize to a population by accident. Handle the individual through
  review.
- **When measuring whether the asymmetry mattered, do not use your own outcomes as
  proof it did not.** If the discount rejected people, they are absent from your hire
  data, and the score looks vindicated
  ([a-predictor-cannot-grade-its-own-labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels)).
  Compare selection rates across populations at the score's own gate, not downstream
  performance among the survivors.
- **Symmetry is not sameness.** Two populations may be scored on different dimensions
  and still be treated symmetrically, provided each dimension can reach full range and
  no population carries an adverse adjustment the other escapes.

## When not to use it

- **Not as an argument against population-specific rubrics.** Renaming and reweighting
  dimensions per archetype is this bundle's normal practice and is not what this
  technique forbids. The line is between *what is measured* (may differ) and *what is
  punished* (may not).
- **Not against statutory gates.** A legally required credential is not a discount
  scoped to a population; it is a requirement of the role, and it applies to everyone
  who lacks the credential regardless of career stage.
- **Not as a reason to skip provenance weighting entirely.** The answer to an asymmetric
  discount is a symmetric one — or a missing-input path — never the abandonment of
  evidence grading.
