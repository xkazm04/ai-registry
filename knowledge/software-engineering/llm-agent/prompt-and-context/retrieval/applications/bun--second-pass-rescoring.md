---
layer: application
type: application
subject: retrieval
technique: second-pass-rescoring
stack: bun
status: forged
verified_on: 2026-09-07
verified_against: bun@1.3.13
---

# A reranker that collapsed one lane to a seventh of its hit rate, and the promote-only rule that gave it back (gbrain)

The realization is the search pipeline of gbrain, a personal/company "brain" — a
markdown-backed store with a hybrid retrieval path over an embedded or hosted
Postgres. `verified_against` names the runtime the tree itself witnesses: CI pins
`bun-version: 1.3.13` (`.github/workflows/e2e.yml:52`), above the `engines.bun
>=1.3.10` floor in `package.json`. The tree is read at `2efaaf8f`, version
`0.48.4.0`.

It is worth reading because the second-pass stage here is not a design sketch: it
shipped enabled by default, destroyed a lane, and the receipts that found it are
committed beside the fix.

## The failure, measured

The `balanced` mode runs a cross-encoder over the fused pool. The pool's fourth
list is a relational arm: rows reached by a typed edge, where the answer page need
not contain a single word of the query — an investor page answers "who funded this"
because of the edge, not because of its prose.

On a 39-question graph-relationship fixture, paired with the reranker off and on:
**hit@1 21/39 → 3/39, hit@3 27/39 → 5/39**, with zero movement on the 11
non-relational questions in the same fixture (`CHANGELOG.md:141-147`). The lane was
not degraded; it was removed from page one. An existing mechanism that kept exactly
one relational row on the first page was in place throughout and was not enough.

This is the technique's central claim in its sharpest available form: the scorer was
not misconfigured and was not weak. It returned a low number for rows whose evidence
it structurally cannot read.

## The promote-only admission, in code

`src/core/search/relational-rerank-pin.ts` implements the rule the technique
states. Each relational row's claim is `Math.min(fused, i)` (`:174`) — the better of
its rank among relational rows in the pre-rerank fused pool and its position in the
reranked pool. The contract block at `:28-50` says why in the tree's own words: the
premise is that the cross-encoder cannot judge edge-derived rows, so its opinion may
promote such a row past fused-lower rows only when strictly decisive, and never
re-order the fused evidence among equals. Ties fall back to fused order.

Three properties the technique asks for are present and are load-bearing here:

- **Permutation, not re-injection.** No row is added or removed (`:28-50`); recovering
  rows the pass dropped is left to a separate evidence-slot mechanism. This is what
  makes the change auditable as a reordering.
- **The bound carries its cost.** The pin is capped (3 in every bundle,
  `CHANGELOG.md:200-204`), and the module names the price at `:58-64`: because the
  pin trusts the arm, a false-positive relational row moves from a tail position to
  page one. One of the four listed mitigations is filed in the backlog rather than
  shipped — the tree states the multiplier instead of hiding it.
- **The no-op is detected by identity.** The pin fires on `reranked !== deduped`
  (`src/core/search/hybrid.ts:2327-2330`), not on a "reranker enabled" flag, because
  the reranker returns its *input array* on every skip path — no key, timeout,
  auth failure. A boolean would have fired the pin on precisely those paths.

## Where the trimmer inherits the blindness

The autocut stage cuts at the largest normalized score cliff after the rescoring.
Pinned rows carry low rescoring scores by construction, so they are both preserved
through the cut *and* excluded from the cliff computation
(`src/core/search/autocut.ts:193-199, 218-224`) — the second exemption the technique
names as the one that gets forgotten.

The stage's own measurement is the technique's metric argument, made against this
tree: with the cut on, any-one-hit recall stayed above 99.4% while strict
all-of-set recall fell **449/470 → 379/470**, and no floor in the swept range came
within two questions of "off" on either seeded half (`CHANGELOG.md:70-78, 157-163`).
The knob was not retuned; it was turned off. A trimmer that keeps the best session
and drops the rest is invisible to the lenient metric by construction.

## What this realization cannot do

Two limits worth carrying, both stated by the tree rather than found against it.

**Its headline benchmark cannot see either mechanism.** `docs/eval-bench.md:436-441`
records that on the published long-conversation corpus the relational pin never fires
and the metadata gate changes no top-5 result, because chat transcripts carry no
backlinks and no typed edges. The corroborating suites go byte-identical — and that
null is blindness, not confirmation. The pin's real receipt is the 39-question
fixture above, and it lives in a different suite.

**The gate's collateral is measured on the split it was localized on.** The related
`metadata_boost_gate` — post-fusion popularity, recency and adjacency boosts held
back until a lexical arm has voted — reports 73 of 105 localized gaps fixed with zero
collateral, on the tuning split, with a held-out confirmation over ten concepts
(`src/core/search/metadata-boost-gate.ts:5-19`). What it does not have is a
population where the suppressed boost was *right*, because the suites that could
contain such a population are the ones the paragraph above says are blind here.

One structural fact the tree did not set out to prove. The gate stamps its decision
on every query *including when it is configured off* (`metadata-boost-gate.ts:45-51`),
so an operator can count the affected population before flipping the knob. Nothing
required that; it falls out of treating the knob as a measurement before treating it
as a fix, and it is the cheapest thing in this pipeline to copy.
