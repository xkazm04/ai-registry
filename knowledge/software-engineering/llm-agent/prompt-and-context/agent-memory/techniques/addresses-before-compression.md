---
layer: technique
type: technique
subject: agent-memory
technique: addresses-before-compression
status: forged
laws: [gate-sees-target, limits-are-derived]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [deciding whether to run a pass that merges redundant items into one, a store has grown past the size somebody set as the compaction trigger, pricing a compaction pass as a read-cost saving, a distillation pass measured no accuracy gain and nobody can say why, choosing between one merged item and the family it replaces]
---

# Addresses before compression

A pass that merges families of redundant items is bought as a saving: fewer
items, fewer words, fewer recall seats, the same knowledge. Measured against a
probe set with answers verified outside the store, on a store of about sixty
items, it saved no words, bought no accuracy, and cost accuracy as soon as the
reader was put on a budget. None of that is a fact about sixty. It is a fact
about what the pass spends, which is **addresses**, and the size of the store
does not tell you how many it has to spend.

## A merge that loses no fact does not shrink the store

The saving is assumed, not measured, and it is usually not there. Ten duplicate
families — twenty-eight items a deterministic prefilter grouped as saying one
thing each — were merged by a reasoner under one binding rule: lose no
checkable particular. Every command, flag, path, name, number and failure
symptom had to survive, and where two members disagreed, both readings had to
survive.

Result: **twenty-eight items became ten, and the word count went up seven per
cent** (6,895 to 7,376). Item count fell sixty-four per cent and nothing was
saved. Two of the ten families compressed at all, by six and eight per cent; the
other eight grew, by up to twenty-four. Restricting to families of three or more
— the size below which compaction is conventionally held not to pay — does not
rescue it: those six families grew 4.1 per cent between them. The minimum family
size is a rule about when a *summary* is worth writing, not evidence that writing
it saves words.

That is not a bad pass; it is what a family of real duplicates is made of. The
redundancy a prefilter detects lives in the *framing* — the same lesson told
four times with four different incidents attached — and in the *item count*.
The facts are nearly disjoint, because each member was written precisely when
the previous one failed to cover a case. Merging concatenates the facts and
deduplicates the prose around them, and the prose was never the bulk.

So the read-cost saving exists only if the pass is allowed to drop facts. Run
the same ten families again under a hard budget — the merged item may be at most
forty per cent of its inputs — and the words do come out. They come out with
answers attached: the length-budgeted merge scored at or below the no-loss merge
in **every** condition measured, worst under the tightest read budget, and it
was the only arm whose score moved across replicates of one cell. Paying for
compression in facts is the expensive way to buy it.

## What the merge spends is addresses

Merging *N* items into one retires *N-1* entries from every surface that lists
items: the always-loaded index, the table of contents, the browse view, the
shortlist a retriever ranks. Those entries are the store's addresses, and
accuracy lives on them far more than it lives in the bodies they point to.

The decomposition, one store, one probe set of twenty-two questions, one reader,
deterministic scoring against a key frozen before any arm ran:

| what the reader was given | words | score |
| --- | --- | --- |
| the index alone, no bodies | 1,628 | 20.0 / 22 |
| the bodies alone, no index, whole store | 24,335 | 22.0 / 22 |
| index + whole store, unmerged | 26,150 | 22.0 / 22 |
| index + whole store, merged | 25,969 | 22.0 / 22 |
| **the merged store's index alone** | **1,020** | **12.7 / 22** |

The index was six per cent of the store's words and carried nine-tenths of its
accuracy: 12.3 points per thousand words read, against 4.9 for the next-best
condition that also scored 20 or better, and 0.8 for the whole store. And the
merge — which never touched the index on purpose, only as a consequence of the
items it retired — took that surface from 20.0 to 12.7, across three replicates
a side whose ranges do not overlap (20-20 against 12-13).

One scope condition, because it bounds the top row of that table and every
whole-store row below it: at full read both stores scored the maximum. A
saturated cell cannot show a gain, only a loss, so the whole-store null is a
ceiling result and the informative comparisons are all the budgeted and
decomposed ones. The same null has been reported at year scale on a store no
reader could hold, which is the non-saturated form of the same observation.

Under a read budget the consequence is visible in the score, not just in the
mechanism. Same retriever, same word cap, same questions:

| read budget | unmerged | merged (no loss) | merged (length-budgeted) |
| --- | --- | --- | --- |
| whole store | 22.0 | 22.0 | 21.0 |
| a quarter of the store | 21.7 | 19.7 | 17.0 |
| a tenth of the store | 20.0 | 16.0 | 15.0 |

The unmerged store degrades gently as the budget closes (22.0, 21.7, 20.0). The
merged store falls off a cliff (22.0, 19.7, 16.0), because a budget spends
itself on addresses first and the merge left it fewer to spend.

## The same merge pays once the addressing layer is gone

This is the result that fixes the rule, because it is a sign flip on one
variable. Withhold the index and give the reader only what the retriever
selected under a quarter-store budget:

| read budget, index withheld | unmerged | merged |
| --- | --- | --- |
| a quarter of the store | 13.7 | **17.3** |

Three and a half points **to** the merge — the gain the whole intuition predicts,
and it shows up only here. Same store, same merge, same questions, same
retriever, same cap; the only difference is whether an addressing surface
survived the pass. With the surface, merging cost 2.0 points at that budget.
Without it, merging bought 3.6. Three replicates a side, ranges 13-14 against
17-18 and 21-22 against 19-20: both gaps sit outside the spread, and they point
opposite ways.

A merge is therefore not an improvement or a regression on its own. It is a trade
of **addresses for density**, and the sign of the trade is set by whether the
reader had addresses to lose.

## So the trigger is not a size

An accumulated-pressure trigger — enough new material since the last pass — is
the right trigger for *when the pass has work to do*. It is not an argument that
the pass pays, and a store-size threshold ("consolidate past N items", "past N
sessions") is a proxy standing in for the question nobody asked, per
[gate-sees-target](../../../../_laws.md#gate-sees-target). Any such number is a
fact about one protocol: the reader, the read budget, the probe set and the
addressing layer that produced it. It does not travel, and re-deriving it in a
new deployment is not tuning — it is the only way it means anything, per
[limits-are-derived](../../../../_laws.md#limits-are-derived).

Two properties decide, and neither is a count:

- **Does the store have a surface the reader consults before the items, and will
  the pass rewrite it?** If yes, price the rewrite first. Merging a family whose
  members each hold an index line spends those lines, and a merged line that
  reads "consolidated from four items" is not a pointer — it is a hole with a
  label. A pass that must merge can keep the addresses: emit one item and keep
  every retired member's entry pointing into it, at the section the member
  became. The index is cheap; that is the whole finding.
- **Do the store's facts change?** A merging pass's measured product is
  *currency*, not accuracy — it holds fewer stale answers when the world moves
  under the store — plus the item-count economy. Where nothing reverses, there is
  no currency to buy, and the pass has nothing left to sell. A year-scale replay
  of a far larger store reached the same place from the other side: verbatim
  storage that never ran a distiller outscored every distilling arm on raw
  accuracy, while two of the three distilling arms held three and four stale
  answers against verbatim's sixteen, at half the read cost or less. **The trade
  is detail against currency, not accuracy against cost**, and a store whose
  facts are maintained in place has already taken the currency side without
  paying for a pass.

## Coverage is not accuracy, and here it pointed the wrong way

The cheapest way to be wrong about this is to measure the pass with a
consumer-free coverage instrument — is the answer present in what the reader was
given — and stop there. Under the quarter-store budget, the merged store's
retrieved bodies carried **eleven** of fourteen answer keys against the unmerged
store's **eight**, and the merged store still scored lower. The merge genuinely
improved retrieval coverage of the bodies, and lost anyway, because the unmerged
store's index was answering the rest and the merged store's index no longer
could.

Report both or neither. A coverage gain with an accuracy loss beside it is the
finding; a coverage gain alone is a claim the score does not support.

## What would falsify this

- A merge that leaves the addressing surface intact — every retired member keeps
  an entry pointing into the survivor — and still costs accuracy under a read
  budget. That would move the cost from addresses to density and this technique
  names the wrong mechanism.
- A store with no addressing surface at all, where a merge fails to pay under a
  read budget tight enough to bind. The sign flip above is the load-bearing
  observation; one contrary instance retires the rule.
- A merge that shrinks a family of real duplicates materially without dropping a
  checkable particular. Then the read-cost saving is real after all and the
  pass is worth running for it alone.
