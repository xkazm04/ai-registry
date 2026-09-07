---
layer: technique
type: technique
subject: retrieval
technique: relevance-floors
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [deciding whether to return nothing over weak hits, recalibrating floors after an embedder swap, telling honest empty apart from engine failure]
---

# Relevance floors

Nearest-neighbor retrieval answers a different question than the one asked.
Asked "what is relevant?", it answers "what is *nearest*?" — and nearest is
defined even when nothing is close. Point it at a corpus of cooking notes,
query it about compiler internals, and it returns k results, ranked,
confident, useless. Lexical lanes fail more honestly (no term overlap, no
results) but have their own version: one incidental term match dressing an
irrelevant document as an answer. The floor is the stage that converts
"nearest" back into "relevant": a threshold below which the honest output is
fewer results, or none.

## Least-bad k is a lie with compounding interest

Returning the best k available regardless of quality feels harmless — the
consumer can judge, surely. But presence in the slice **is** the judgment;
that is what retrieval is for. A human reads the top result as "the system's
best answer", not "the system's nearest miss". An agent packing context
treats every injected chunk as evidence and reasons on it — irrelevant
recall does not merely waste budget, it actively steers generation wrong,
and the error compounds downstream where its origin is no longer visible.
An empty slice, by contrast, tells the exact truth: *the corpus does not
speak to this query*. Systems that never return empty have chosen to never
say that — which means every slice they return carries less information.

## Floors are per-lane, per-model, and calibrated

A floor is a threshold in a lane's own score space, and score spaces don't
transfer:

- **Per-lane** — a vector-distance cutoff says nothing about lexical scores;
  each lane thresholds in its own units, *before* fusion (a fused blend of
  one strong signal and one garbage signal launders the garbage).
- **Per-model** — distance distributions are a property of the embedding
  geometry. Swap the embedder and yesterday's floor is silently too strict
  or too loose; the floor is calibration state owed a revisit on every model
  change, one more entry in the
  [embedding-lifecycle](./embedding-lifecycle.md) reindex checklist.
- **Calibrated, not felt** — set floors from a labeled query set (the
  [retrieval-evaluation](./retrieval-evaluation.md) machinery): the operating
  point where relevant results overwhelmingly pass and irrelevant ones
  overwhelmingly don't, chosen for the consumer's cost asymmetry. A
  context-packing consumer tolerates a false empty far better than injected
  noise (floor high); an exploring human tolerates weak candidates better
  than a dead end (floor low, weak tail labeled). One knob, two different
  right answers.

A useful refinement between hard-pass and hard-fail: a **gray band**. Results
above the confident floor pass; results in the band pass only with degraded
standing ("weak match" — provenance the consumer can discount); results below
fail. This keeps the honesty of the floor without the brittleness of a
single cliff.

## A substitute path is a different score space than the lane it stands in for

"Per-lane" is the right unit for a floor and it is not fine enough, because a
lane is not one implementation. Most lexical lanes carry a fallback for the
case where the real index is absent or throws — a substring scan over the
stored text — and most vector lanes carry one for a missing embedder. That
fallback answers the same question through different machinery, and the scores
it emits are on a scale nobody calibrated.

The failure is specific and it is not the floor filtering too much. It is that
a substitute lane usually has **no relevance measurement to report**, so it
manufactures one from a proxy: in one memory store the fallback scores every
hit as `min(0.95, 0.72 + query_length * 0.02)`. That number is monotone in the
length of the *query* and carries no information about the match at all, and it
is emitted into the same field the real index writes a term-frequency score
into. Every hit therefore lands at or above 0.76.

What makes that costly is where such numbers are read. Downstream thresholds
were calibrated against the real lane's distribution, and they cannot tell a
measured score from a manufactured one — so the fabricated value inherits every
protection the system grants its most trustworthy signal. In the same store,
0.75 is the bar above which a lexical hit is treated as a strong exact match:
it sets a floor under the fused score, and it grants the hit the maximum
preservation floor against the reranker, on the reasoning that a cross-encoder
is unreliable on symbolic queries. Both protections exist for a good reason and
both are correct for the real index. On any deployment where the index is
missing, "strong exact lexical hit" silently degrades to "the query string
appears somewhere in the text", and *every* such row gets the strongest
guarantee the ranking chain can issue.

This is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
lane boundary. The substitute knows it did not measure relevance; the number it
writes says it did.

Three rules, and the first is the one that costs nothing:

- **A fallback emits scores in its own space, or emits none — and "none" must
  be the identity of whatever combines them.** Where the substitute genuinely
  cannot rank — a substring scan cannot — the honest output is an unscored
  candidate set with the absence marked. But "unscored" only helps if the
  combining step treats it as *no information* rather than as a low number, and
  a weighted sum does the latter by default: a missing term contributes zero,
  which is indistinguishable from a measured zero and silently demotes the row.

  The shape that gets this right composes the optional signal multiplicatively
  around one, not additively around zero. One store blends a semantic term into
  a value ranking as `value × (1 + weight × similarity)` and states the property
  as load-bearing: a memory that is un-embedded, off-topic, or below the
  distance floor scores *exactly* its value score, so a partially embedded
  corpus ranks precisely as the value-only path would. The absence is the
  multiplicative identity, so the degraded lane cannot move the order in either
  direction — where a weighted sum would have quietly punished every row the
  embedder had not reached yet. Rank fusion absorbs the same problem cleanly by
  discarding scores entirely; between them, those are the two safe answers, and
  an additive blend over an optional lane is the unsafe one.
- **Thresholds name the path they were calibrated on.** A constant tuned
  against a term-frequency distribution is not a property of "the lexical
  lane", it is a property of the lexical *index*. State it where the constant
  lives, so the substitute's author sees that the number they are about to
  clear was never about them.
- **Test the floor on the degraded path, not only the healthy one.** The
  degraded-slice label from
  [the three spellings](#empty-has-three-spellings) below travels to the
  consumer; the thresholds run upstream of the consumer and never read it.
  Labeling is therefore necessary and not sufficient — a fixture with the index
  removed, asserting what the floors admit, is what actually covers this.

The general shape, worth recognizing outside retrieval: when a degraded path
writes into a field the healthy path also writes, every check on that field
silently changes meaning, and the check that was protecting the strongest
signal becomes the one amplifying the weakest.

## Empty has three spellings

The zero-and-low-result regime is where retrieval tells the truth or doesn't,
and the [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
law names the discipline. Three outcomes that must not share a spelling:

- **Honest empty** — every lane ran, nothing cleared its floor. The correct
  answer is nothing, delivered as nothing, distinguishable from error.
- **Degraded slice** — a lane could not run (embedder absent, index
  rebuilding) and the others carried the query. Real results, weaker
  warrant: the slice must say which lanes it came from, or the consumer
  prices lexical-only output as full-hybrid output. This is the labeled
  fallback mode [embedding-lifecycle](./embedding-lifecycle.md) requires when
  the embedder is missing — a fallback lane is a *substitute answering
  path*, and an unlabeled substitute is an impersonation.
- **Failure** — the engine itself errored. Never presentable as an empty:
  "nothing matched" invites the consumer to conclude the corpus lacks the
  answer, which is precisely the wrong lesson when the truth is "nothing
  was searched".

The gate that distinguishes them must see its target, per
[gate-sees-target](../../../../_laws.md#gate-sees-target): the degraded-mode label
derives from *which lanes actually executed on this query*, not from a config
flag saying which lanes are enabled. A flag-derived label passes exactly when
a lane silently failed — the case the label exists for.

## The floor is a contract, not a courtesy

Downstream stages are entitled to assume flooring happened: fusion assumes
per-lane candidates are genuine, [budgets](./ranking-budgets.md) assume every
admitted item earned admission, consumers assume presence means relevance.
That makes the floor part of each lane's output contract — enforced where
the lane emits candidates, at one door, not re-checked defensively at every
stage after. A system where downstream stages each re-floor "just in case"
has admitted it doesn't know where the contract lives.
