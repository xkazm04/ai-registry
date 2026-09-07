---
layer: technique
type: technique
subject: retrieval
technique: second-pass-rescoring
status: forged
laws:
  - unknown-is-not-a-value
  - gate-sees-target
  - count-carries-predicate
shared_with: []
use_when: [a cross-encoder or model reranks an already-fused candidate pool, one lane's answers disappeared after a reranker shipped, deciding what a second-pass scorer may do to rows whose evidence it cannot read, bounding how many candidates an expensive scorer sees, a trimmer runs after a reranker, a ranking change looks safe because the suite went byte-identical]
---

# Second-pass rescoring

Fusion produces one order out of several lanes. A second pass may then re-score
that order with a model that sees more than the lanes did — a cross-encoder
reading query and passage together, an LLM asked to rank. It is the last stage
before the budget cut, it is usually bought for precision, and it arrives after
every decision this subject's other techniques describe has already been made.

That is the whole difficulty. **The second pass re-decides what the lanes
decided, using a different and narrower kind of evidence than the pool
contains.** A fused pool is heterogeneous by construction — that is the point of
[hybrid-lane-fusion](./hybrid-lane-fusion.md) — and a rescorer that reads one
modality is not a better judge of the pool, it is a specialist given
jurisdiction over cases outside its competence.

## The blind class, and why tuning cannot reach it

A cross-encoder scores query text against candidate text. Several lanes produce
rows whose relevance is not in their text at all:

- a [relationship-proximity-lane](./relationship-proximity-lane.md) row is an
  answer *because of an edge*. The page reached by "who funded this" need not
  contain the query's words; the relation is the evidence, and it lives in the
  graph, not in the passage.
- a [structural-centrality-lane](./structural-centrality-lane.md) row ranks by
  the corpus's own link structure, which no passage states.
- an alias or exact-identifier hit matches on a key the body may never repeat.

For these rows the rescorer does not return a wrong score. It returns a score
computed from the only signal it has, and that signal is absent — so the number
is *unknown* wearing the costume of a definite low value, which is precisely the
laundering [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
names. The consequence is not a small ranking loss. One measured relational
fixture of 39 graph-relationship questions went from hit@1 21/39 and hit@3 27/39
with the rescorer off, to **3/39 and 5/39** with it on — a near-total collapse of
one lane — while the 11 non-relational questions in the same fixture moved by
nothing in either direction.

Two obvious repairs both fail. **Tuning the rescorer** cannot work, because the
signal it would need to weigh is not in the row it is given. **Excluding the
blind class from the pass** discards the rescorer's real gains on the rows it
*can* read, and re-opens the question of how the two sets interleave.

## The rule: admit the verdict only in the direction it can be trusted

The resolution is to stop treating the rescorer as an authority over the pool and
start treating it as one more opinion with a known blind spot — then admit that
opinion **only where being wrong is impossible**.

For every row of a blind class, take the better of its two positions:

```
claim = min(fused_rank, rescored_rank)
```

A row the rescorer independently promoted keeps the promotion; a row the
rescorer buried keeps its fused position. **A scorer blind to a class of
evidence may promote a member of that class, and may never bury one.** The
asymmetry is the whole mechanism, and it is honest in both directions: the
rescorer sometimes *does* have something to say about an edge-derived row whose
text happens to be relevant, and that verdict is kept, because it can only help.

Three details make the rule safe to operate:

- **It is a permutation, never a re-injection.** Rows are re-ordered; none is
  added and none is removed. Recovering rows the pass dropped is a recall
  concern and belongs to whatever mechanism owns recall — keeping the two
  separate is what makes "the pin changed the order and nothing else" a claim a
  reader can check.
- **Bound it, and say what the bound costs.** Re-pinning is capped at a small
  number of rows. The cap matters because the pass now *trusts the lane*: a lane
  with a false-positive rate had it showing at tail positions, and pinning
  converts that same rate into page-one errors. The multiplier is the price of
  the fix and belongs beside it.
- **Ties resolve to the fused order.** The premise is that the rescorer cannot
  judge these rows, so its opinion re-orders them among equals only when it is
  strictly decisive — never as a general tiebreak.

## The window is a shortlist, not a truncation

A rescorer is expensive per row, so it sees the top *N* of a larger pool. That
bound is correct and necessary. What it must not do is *delete* the tail: rows
below *N* keep their prior fused order and follow the rescored block.

The distinction is the difference between a spend cap and a recall cap. A pass
that rescores 25 of a 50-row pool and returns 50 has bought precision at the top
for a bounded price. The same pass returning 25 has silently halved recall for
every consumer asking for more than it kept — and the receipt will not show it,
because the questions that needed row 30 were already being missed.

## Detect the no-op by identity, not by a flag

A rescorer fails open: no credential, a timeout, a provider error, a pool too
small to reorder. On each of those paths the right behaviour is to return the
input untouched — and the *right way to signal it* is to return the input array
itself, so a caller can test reference identity.

A parallel `rerankerEnabled` boolean answers a different question ("was it
configured") than the one downstream stages need ("did anything happen"), and the
two drift apart on exactly the failure paths that matter. Stages that only make
sense after a real rescoring — the promotion rule above, a trimmer — should fire
on "the array changed", never on "the feature is on".

## What runs after inherits the blindness

A trimmer placed after the rescorer cuts on the rescorer's scores, which means
it inherits every blind spot described above. Rows admitted by the promotion rule
carry low rescoring scores *by construction* — that is why they were promoted —
so a naive trim removes them first.

Two exemptions are needed, and the second is the one that gets forgotten:

1. Promoted and structurally-injected rows survive the trim.
2. They are also excluded from the trim's **own threshold computation**. A cut
   that finds the largest gap in a score sequence will find it right below the
   protected rows if those rows are left in the sequence — so the rows you just
   protected define the cliff that removes their neighbours. The check must run
   over the population it is actually deciding about, per
   [gate-sees-target](../../../../_laws.md#gate-sees-target).

## Measuring the stage at all

This stage's characteristic damage is invisible to the metric most retrieval
suites lead with. A trimmer that keeps the single best result and drops the rest
leaves any-one-hit recall almost untouched — one measured run held it above 99.4%
throughout — while all-of-set recall, which requires every piece of evidence a
multi-part question needs, fell from 449/470 to 379/470. Report the aggregation
rule with the number
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
gate on the strict form; the lenient figure is a diagnostic.

The same discipline applies to the suites used to *clear* a change here. A
corroborating suite whose corpus cannot contain the signal under test will return
a byte-identical result, and that null is blindness rather than confirmation — a
chat-transcript corpus carries no link structure and no typed edges, so it cannot
detect either a centrality-prior change or an edge-lane regression. Before
reading a null as safety, confirm the suite could have expressed the failure.
