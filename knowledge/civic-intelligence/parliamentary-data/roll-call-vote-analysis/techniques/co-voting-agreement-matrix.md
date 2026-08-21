---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: co-voting-agreement-matrix
status: forged
laws: [lead-not-finding, every-cap-ships-its-population]
shared_with: []
use_when: [measuring pairwise voting similarity, feeding bloc discovery or clustering, claiming two legislators vote together]
---

# Co-voting agreement matrix

The agreement matrix is the pairwise substrate of bloc analysis: for every
pair of legislators, how many divisions did both take a position on
(**shared**), and on how many of those did the positions match (**agree**)?
The agreement rate is agree/shared. It is the input to clustering, bloc
naming, "votes most like / least like" panels, and cross-party-alliance
leads — which is exactly why its definitional hygiene matters: every
downstream story is built from these cells.

## The counting rules

- **A pair shares a vote only when both cast a positional ballot.** One
  member positional and the other absent is not a shared observation — not a
  disagreement, not a half-agreement, simply outside the pair's denominator.
  This is the pairwise form of the base rule: non-participation is not a
  position.
- **Voided divisions are excluded**, as everywhere in discipline metrics.
- **The matrix is undirected; store each pair once** under a canonical
  ordering (smaller id first) and accumulate into that one cell. Directed
  double-storage invites the two copies to drift.
- **Resolve ballots to persons before pairing.** Sources key ballots by seat
  or mandate; a member with two mandates in the window becomes two
  half-persons with a spurious mutual agreement unless resolution happens
  first.

## Minimum shared support

An agreement rate over a handful of shared votes is noise: two members who
overlapped for one afternoon can score 100%. A pair's rate is signal only
above a minimum shared-vote floor (fifty is a defensible floor for a
multi-year corpus) — below it, the pair has no published rate. The floor is
a named, imported constant.

Where to apply the floor is a design decision with a right answer: **compute
the full matrix and let each reader apply its own floor at read time** where
storage permits. Pruning at write time bakes one consumer's threshold into
the artifact and silently forecloses others (a bloc-discovery pass may want
a lower floor plus its own significance test; a display panel wants a higher
one). Pruning is a lossy editorial act; when it must happen at write time
for scale, the floor and the discarded-pair count ship with the artifact.

## Cost and scale

The naive computation is quadratic per division over present members —
entirely tractable for a chamber (a few hundred members, a few thousand
divisions) if done sensibly: remap persons to dense indices, accumulate
into flat typed arrays, iterate per-division participant lists sorted so
each unordered pair lands in one cell. Resist the reflex to sample
divisions to save time; a sampled matrix is a different (and
population-capped) claim, and the chamber-scale computation does not need
the discount.

## What an agreement rate may claim

This is where the technique most needs its discipline. The rate is a fact
about ballot coincidence. It is **not**:

- **an alliance.** Two members of opposing parties at 85% agreement mostly
  reflects the consensual share of the agenda — most business passes
  lopsidedly, so baseline pairwise agreement is high across the whole
  chamber. "High" is only meaningful against that baseline, and "allied" is
  a human conclusion, not a matrix cell.
- **ideological proximity.** Spatial proximity claims belong to ideal-point
  models, which come with assumptions and uncertainty estimates; an
  agreement rate is one ingredient of such a model, not a substitute.
- **symmetric evidence of coordination.** Agreement cannot distinguish
  following a shared whip, shared conviction, or shared indifference.

The publishing rule: matrix-derived surfaces present rates with their
denominators ("agreed on 412 of 480 shared votes"), name the corpus, and
route any interpretive claim — bloc labels, "the real coalition", defection
narratives — through the layer that is explicitly marked as interpretation
and reviewed as such. A machine-computed cluster over the matrix is a lead
for that layer, never a published finding on its own.

## When not to use it

- Not for members below the shared-vote floor with everyone (short tenures):
  their row exists but publishes nothing, and the surface says *not
  measured* rather than omitting them silently.
- Not across terms or chambers in one matrix — membership churn makes
  "shared votes" incomparable across the boundary; compute per term and
  compare rates, not raw cells.
- Not as a similarity metric that includes abstention "agreement" (both
  abstained ≠ agreed). If joint non-participation is interesting, it is a
  separate matrix with its own name.
