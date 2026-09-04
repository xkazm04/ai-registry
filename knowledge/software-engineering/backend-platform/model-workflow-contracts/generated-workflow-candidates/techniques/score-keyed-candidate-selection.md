---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: score-keyed-candidate-selection
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [deciding which trained candidates to keep or ensemble, choosing between global top-N and per-partition-best, handling a candidate that finished training without a score]
---

# Score-keyed candidate selection

After training there are many candidates and there should be a few. This
technique is the sort: what it sorts on, the two policies it offers, which
one is the default and why, and what happens to a candidate that cannot be
sorted.

## One declared score

Every trained candidate carries a scalar under one **declared key** in its
bookkeeping record, written by the training stage from the validation metric
the recipe names. Selection reads that key and nothing else; it does not
recompute a metric, does not open a log, does not average several. The key
is a member of the same enumeration that names the candidate's identity and
its state, so the selection stage and the training stage agree on the
spelling without either reading the other's code.

The scalar carries its predicate
(`../../../../_laws.md#count-carries-predicate`). A score of a certain value
means nothing until the record beside it says which metric, over which
validation partition, at which checkpoint, and whether higher is better. A
selection stage that sorts on a bare number will, the first time two recipes
report different metrics under the same key, rank a loss against an
accuracy and keep the wrong one. The direction — higher or lower is better —
is declared once with the key, never inferred from the metric's name.

## Two policies, one default

**Global top-N** sorts every candidate by score and keeps the first N. It is
the right policy when the candidates are genuinely different recipes trained
on comparable data and the question is "which recipes work".

**Per-partition-best** groups candidates by the cross-validation partition
they were trained on, sorts within each group, and keeps the best of each.
It is the right policy when the candidates are one or a few recipes each
trained once per partition, because the partitions are the point: an
ensemble of the best model from each partition has seen the whole dataset
across its members, whereas a global top-N over the same candidates returns
the recipe's three luckiest partitions and an ensemble that has seen three
fifths of the data three times.

**The default is per-partition-best.** The common shape of a generated run
is few templates times several partitions, and in that shape global top-N is
the wrong answer more often than the right one. An operator who wants
global top-N — because they generated many recipes on one partition, or
because they are comparing recipes rather than building an ensemble — says
so, and the choice is recorded with the selection result so the ensemble
that follows knows how its members were chosen.

Both policies emit the same shape: an ordered list of candidate identities
with their scores and the policy name. The ensembler downstream consumes the
list and never re-sorts.

## A missing score is an exclusion, not a zero

A candidate whose record has no score — training crashed, the metric was
never computed, the key was misspelled by a recipe author — must not enter
the sort. Sorting it as zero ranks it last under a higher-is-better metric
and *first* under a lower-is-better one
(`../../../../_laws.md#unknown-is-not-a-value`). The rule: the selection
stage partitions candidates into scored and unscored before sorting, sorts
only the scored, and reports the unscored by identity with the reason the
record gives. A run that trained five candidates and selected from three
says so; a run that selected from five with two silent zeros has hidden the
two failures inside a ranking.

## Decision rules

- **Selection sorts on one declared key** written by the training stage;
  metric, partition, checkpoint and direction are recorded beside it.
- **Per-partition-best is the default.** Global top-N is an explicit choice
  and is recorded with the result.
- **The two policies emit one shape**, and the ensembler consumes it without
  re-sorting.
- **Unscored candidates are excluded and named**, never sorted as zero.
- **The number kept is derived from the policy** — one per partition, or N —
  and the result says which predicate produced the count.

## When not to use this

A run with one candidate has nothing to select, and a run whose candidates
are scored on different validation sets by different metrics has nothing to
sort — the scores are not commensurable and the selection stage should
refuse rather than rank them. Commensurability is the training stage's
obligation: one metric, one validation protocol, declared in the template,
so that the scores the selection stage reads mean the same thing.
