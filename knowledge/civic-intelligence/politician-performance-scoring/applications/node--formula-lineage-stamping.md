---
layer: application
type: application
subject: politician-performance-scoring
technique: formula-lineage-stamping
stack: node
status: forged
verified_on: 2026-08-19
---

# Node — formula lineage stamping in a graph-backed contribution index

A civic accountability product computes a 0–100 contribution index for all 207
members of a national lower chamber and materializes the scores onto person
nodes in a knowledge graph. The formula and its lineage machinery live in one
pure module, `lib/analysis/contribution.ts`.

## The reference and its contract

The lineage reference is a named exported constant
(`CONTRIBUTION_FORMULA_REF = "contribution-committee-dedupe"`,
`lib/analysis/contribution.ts:60`), defined directly beneath the formula it
names. Its doc comment (`contribution.ts:39-59`) states the three-clause
contract verbatim:

1. any edit that changes what `computeContribution` returns MUST change the ref;
2. a changed ref is not "applied" until a recompute has re-stamped every person
   node (`scripts/data-analysis/kg-contribution-recompute.ts --commit`);
3. until then the store carries the OLD ref, `formulaMatch` is false, and every
   surface that prints a score says so — the ranking is **stale, not
   wrong-in-silence**.

The founding incident is recorded at the definition site: a six-day divergence
(2026-07-29 → 2026-08-04) in which a committee-dedupe correction landed in the
formula while every person node still carried pass-11 scores — the public
leaderboard served the pre-correction ranking, and nothing in a 1,346-test
suite could see it, because the formula arm is fixture-fed and the store arm
was literal-seeded with no edge between them. The ref is that edge.

## The write guard

`guardContributionWrite` (`contribution.ts:109-146`) is the write-end
enforcement. Given the nodes a writer is about to overwrite, the ref it would
stamp, and a `supersede` flag, it returns an allow/refuse verdict:

- `storedFormulaRef` (`contribution.ts:95-100`) reads
  `contribution_provenance.ref` off each node's props, returning null for
  absent or malformed provenance.
- Nodes with **no** ref are collected as `unstamped` and never block — the doc
  comment states the reasoning: an unstamped node "carries no claim to
  contradict, so writing a ref onto it is an improvement, not a regression".
- Any node stamped with a **different** ref is a conflict; the write is refused
  with a message that names both refs, sample node ids, the recompute script
  that resolves the conflict correctly, and the exact `--supersede` flag for
  the human override (`contribution.ts:136-145`).

The comparison is equality, not ordering, and the comment block at
`contribution.ts:62-75` explains why: a differing stored ref means the data was
authored by a formula this build does not implement *in either direction*
(older, or newer from another branch), and the graph-wide `pass` counter cannot
substitute for version ordering because any unrelated enrichment advances it.

## Read-side consumption

Read surfaces compare the stored ref against the module's constant to derive
`formulaMatch`, and the methodology page renders every number by importing it
from the formula module rather than restating it — its header comment
(`features/civicscore/MetodikaPage.tsx:12-17`) states the page rule: no
literals, so a change to a weight, cap, or the ref itself must flow through the
page. The same file also bans invented history (`MetodikaPage.tsx:19-21`): the
graph carries only the current `{pass, ref}` per node, so only that is printed
— whether the stored stamp matches what the code declares today, nothing about
the path between them.

## What transplants

The pattern needs only: one exported reference constant co-located with the
pure scorer, a provenance object stamped by every writer, an equality guard
with an explicit named override at the write end, and a match check on every
read surface. Nothing depends on the graph store — any database where scores
are materialized apart from the code that computes them has the same two-arm
divergence and accepts the same edge.
