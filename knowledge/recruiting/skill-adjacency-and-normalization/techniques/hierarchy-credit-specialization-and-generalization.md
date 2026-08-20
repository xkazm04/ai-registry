---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: hierarchy-credit-specialization-and-generalization
status: forged
laws: [inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [assigning partial credit for a related skill, setting or changing taxonomy credit constants, explaining why a near-miss scored as it did]
---

# Hierarchy credit: specialization and generalization

When a requirement's canonical term and a candidate's canonical term are not the
same but stand in a parent/child relation, the match is partial and the credit
depends entirely on *which way* the relation runs. The technique is to encode
that asymmetry as two separate, separately-commented constants, and to have the
walk report the direction alongside the number.

## The two directions

- **Specialization — the candidate holds a child of the requirement.** The
  requirement names a broad discipline; the record names a narrow, demanding
  instance of it. Someone who did the hard specific thing did the general thing
  in the course of doing it. Credit is high — close to an exact match, and
  deliberately not equal to one, because the specialization may have been narrow
  enough that the breadth the requirement implies was never exercised. A value
  around nine tenths of an exact match expresses this: almost everything, with a
  visible residue.

- **Generalization — the candidate holds a parent of the requirement.** The
  requirement names a specific instance; the record names the broad discipline
  it belongs to. Nothing about holding the parent demonstrates the child. What
  it demonstrates is *transferability*: the vocabulary, the surrounding
  workflow, and the mental model are in place, so the specific instance is
  learnable quickly. That is genuinely worth something and it is worth roughly
  half an exact match — a value in the middle of the interval, chosen so that
  a candidate with a parent match sorts above one with nothing and below one
  with the real thing.

The asymmetry is the whole technique. A single "relatedness" number, or a
symmetric distance metric, cannot express it and will be tuned in the flattering
direction — because when a recall complaint arrives, the fix that makes it go
away is to raise the number, and raising a symmetric number raises the
generalization side too.

## Decision rules

- **When the walk finds a relation, record the direction with the credit.** The
  score alone is not enough for the downstream reason vocabulary, the
  explanation surface, or a later debugging session. A number without a
  direction is unauditable.
- **When both directions could apply** (a term reachable as both an ancestor and
  a descendant through different paths — which the authoring lint should have
  prevented), take the *lower* credit. Uncertainty about the graph resolves
  against the claim, not toward it.
- **When several of a candidate's terms relate to one requirement**, take the
  strongest single relation rather than summing. Summing is how three cousins
  become a possession. The requirement is one thing; it is addressed once.
- **When the relation is more than one step**, decay it. A grandparent or
  grandchild is not the same evidence as a parent or child. Multiply per step,
  or — the simpler and usually better rule — stop the walk at one step for
  reporting purposes and let anything further fall to
  [sibling-adjacency-below-the-match-threshold](sibling-adjacency-below-the-match-threshold.md)
  or to zero.
- **Credit never upgrades provenance.** A specialization match at nine tenths of
  an exact match is still a claim resting on whatever basis the record gave it.
  The two dimensions multiply through the score independently and are reported
  independently.

## Why the numbers must be named, commented and pinned

These constants are the most edit-tempting values in a matching system: a single
character raises recall and makes a complaint disappear. So:

- **Name them.** A literal inside the walk function is invisible to anyone
  scanning for tuning surfaces.
- **Comment the invariant, not the value.** "Specialization is higher than
  generalization because doing the specific thing exercised the general one,
  while the reverse is only a claim about learnability" survives a re-tune;
  "0.9 felt right" does not.
- **Pin the ordering in a test**, not just the values. The contract worth
  defending is `exact > specialization > generalization > sibling > unrelated`,
  and `sibling < the reporting threshold`. Values may move within that ordering;
  the ordering may not move without someone deliberately deleting an assertion.

## Graded credit is only available where parent links exist

The constants are worthless in a family whose terms have no parents. A term with
no edges can only ever score exactly-or-zero, so in a sparsely-linked family the
whole graded ladder silently disappears and matching reverts to string equality
— while the well-linked families next to it get the full benefit. The effect is
invisible in any global metric and it inverts in the worst possible direction:
the families a team builds *first* tend to be flat lists of tools authored fast,
while the families added later, deliberately, get modelled hierarchically. A
near-miss specialist in the founding domain then scores worse than an equivalent
near-miss in a domain the product barely serves.

So measure **parent-link density per family** — what share of a family's terms
carry at least one parent edge — alongside term count, and pin it. A family in
the single digits is not a hierarchy; it is a list with a schema. Treat a large
gap between families as a defect even when every family clears its own floor,
because the gap is where candidates are being ranked by how well their domain
happens to be modelled.

## Rendering partial credit honestly

A partial match must never be shown in the grammar reserved for a verified one —
[inference must look like inference](../../_laws.md#inference-must-look-like-inference).
Two rules cover it:

- **Show what actually matched.** If the requirement was the specific instance
  and the record held the broad discipline, the surface says so, in those words.
  A recruiter can act on that: it converts directly into an interview probe.
- **Never rename the candidate's term to the requirement's.** The overwhelmingly
  common display bug is to render the requirement's label next to a tick, so the
  screen asserts a capability the record never named. Render the *candidate's*
  term and the relation, or render nothing.
- **Carry the per-requirement strength all the way to the surface.** Where a
  threshold sits below the generalization tier — a common and defensible choice,
  since a demonstrated foundation is worth reporting — "addressed" then includes
  hits that are only partial, and the *only* thing separating a foundation-level
  hit from an exact one is the strength number. If that number stops at the
  scoring layer, the interface has flattened the whole ladder back into a tick.
  A tier above the threshold that is still below an exact match makes carrying
  strength mandatory, not a nicety.

## When not to use this

- **Do not run a hierarchy walk on a term the taxonomy does not model.** There
  is no hierarchy to walk, and inventing one is fabrication; see
  [unmodelled-term-graceful-fallback](unmodelled-term-graceful-fallback.md).
- **Do not apply hierarchy credit to a hard, statutory or safety requirement.**
  A licence, a clearance, a regulated credential or a legally-required
  certification is binary. "Adjacent to a licence" is not a state that exists,
  and a system that scores it as nine tenths held will eventually advance
  someone who cannot legally do the job. Hard requirements take an exact-match
  gate with no partial credit path at all.
- **Do not use hierarchy credit to compensate for a thin taxonomy.** If most
  matches in a family arrive by generalization, the family is under-modelled;
  the fix is terms, not a higher constant.
