---
layer: technique
type: technique
subject: public-money-attribution
technique: attribution-perimeter
status: forged
laws: [non-partisan-symmetry, lead-not-finding]
shared_with: []
use_when:
  - deciding whose relationships enter the tie table at all
  - a figure's meaning depends on whether relatives, nominees, or ownership chains count
  - comparing money figures produced under different inclusion rules
---

# Attribution perimeter

Every rule downstream — the dedup, the split, the floor wording, the claim —
operates on a tie table it did not choose. The perimeter is the rule that
chose it: whose relationships are in scope (the official alone, or also
household members and close associates), which relationship kinds count
(registered roles and holdings, or also de facto control), how deep ownership
is traced (direct holdings only, or chains through intermediate entities), and
whether any minimum stake gates inclusion. The perimeter is part of the
metric's definition, not an ingest detail: two products with identical
arithmetic and different perimeters publish different numbers under the same
words, and neither can be checked against the other.

## The field's uncomfortable fact: direct ties are a floor

The international disclosure standards this domain leans on are built around
one observation: control is exercised *directly or indirectly*, and the
indirect forms are the evasive ones. Holdings are parked with relatives and
nominees precisely because registers key on the official's own name; stakes
are split below disclosure thresholds precisely because thresholds exist;
control travels through chains of intermediate entities precisely because
single-hop reads stop at the first hop. So a tie table built from the
official's own registered relationships is not a neutral default — it is the
perimeter easiest to satisfy and easiest to evade. The arithmetic over it is
still honest, but only as a *floor of the reachable surface*, and the copy
inherits that: a narrow perimeter is one more reason a figure says "at least",
independent of any ingest cap.

## Decision rules

- **Declare the perimeter once, apply it to the whole population.** A
  perimeter widened for one official — their spouse's firms pulled in because
  the story is hot — is a shortlist by another name
  ([non-partisan-symmetry](../../../_laws.md#non-partisan-symmetry)). Relatives
  are in for everyone or in for no one.
- **A perimeter change is a method change.** Adding household members, tracing
  chains one level deeper, lowering a stake threshold — each redefines every
  figure in the product. It happens as a versioned, disclosed migration that
  re-mints the claims, never as a quiet per-case widening.
- **Any stake threshold excludes real control below it.** If inclusion is
  gated on an ownership fraction, that fraction is a published part of the
  method, and the figure's copy must be defensible against "they held one
  point less than your cutoff". Where the register supports it, prefer
  recording all holdings and thresholding at render, so the cutoff is a
  disclosed view rather than an ingest loss.
- **Indirect-control candidates are leads, never silent members.** A
  name-match against a relative, a nominee pattern, a chain traced through an
  intermediate entity — these enter the attributable bucket only after human
  verification records the connection; until then they live in the review
  queue ([lead-not-finding](../../../_laws.md#lead-not-finding)). The perimeter
  says what the pipeline *looks at*, not what it may *assert*.
- **Say what the perimeter is where the number renders.** "Firms tied to this
  official" must be expandable to the actual rule — registered roles and
  direct holdings, say — because the reader's natural reading is wider than
  almost any implementable perimeter.

## When not to use it

The perimeter governs the published arithmetic; it does not bound
investigation. Reporters and reviewers follow leads wherever they go —
including relationships far outside the declared perimeter — and the review
queue may hold candidates the perimeter excludes from every figure. Nor is
perimeter-widening a remedy for a weak story: pulling in ever-more-distant
associates until a number appears is the editorial act the symmetry law
exists to prevent. The technique's output is a stated, uniform, versioned
rule — not a bigger number.
