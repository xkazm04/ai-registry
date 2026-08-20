---
layer: technique
type: technique
subject: agent-memory
technique: recall-injection
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
---

# Recall injection

Recall is where memory earns or forfeits everything upstream: the retrieval
of stored items back into the agent's working context at invocation time.
The budget it spends — space inside the agent's finite attention — is the
scarcest resource in the whole system, and it is paid on *every call*,
which makes recall the only stage whose waste is multiplied by usage. The
design question is never "what could be relevant?" (almost everything,
weakly); it is "what earns a seat at this price?".

## Three tiers, budgeted separately

Recall candidates are not one ranked pool. They arrive through three tiers
with different selection logic, and the budget is split across tiers *by
design*, not won by whichever scores loudest:

- **Always-include** — identity, standing rules, top-grade operator
  preferences. Not retrieved; *constitutionally present* on every call. This
  tier is a tax on every invocation forever, which is precisely why it must
  be small and jealously guarded: every item promoted into it should have
  survived an argument about why it cannot live in the relevance tier.
  Bloat here is the most expensive bloat in the system.
- **Relevance-matched** — items selected against the *current task and
  query*: similarity of content, overlap of entities and scope, match of
  procedure to the action being attempted. The workhorse tier, and the only
  one that justifies a large store — it is what makes ten thousand dormant
  beliefs cost nothing on calls that touch none of them.
- **Recency** — the short bridge of latest episodes and freshest facts that
  gives the agent continuity with its immediate past regardless of topical
  match. Small and honest: recency is a weak proxy for relevance, useful
  mainly because "what just happened" is disproportionately likely to
  matter and disproportionately cheap to select.

Separate budgets are the point. A single merged ranking lets a flood of
mediocre relevance matches crowd out the recency bridge, or lets recency
noise dilute strong matches; per-tier allocations make the trade-off a
decision instead of an accident. Within the relevance tier, rank by a blend
of match strength, item confidence, and freshness — and prefer **fewer,
stronger items over more, weaker ones**: past a modest count, each addition
degrades attention on all the others, so marginal recall is negative well
before the budget is technically full.

## Packing: whole items, skip don't stop

Once candidates are ranked, they must be fitted into the budget, and the
fitting has two rules that are easy to get wrong and expensive to get wrong.

**Never truncate an item.** Half a memory is worse than no memory, because it
reads to the consuming model as a *complete* one: a clipped conditional
("…unless the scope is public") does not read as incomplete, it reads as an
unconditional claim, and the truncation has inverted the meaning of a stored
belief. Truncation is the one context-saving move that manufactures false
beliefs out of true ones.

**An oversized item is skipped, not a stop condition.** Greedy packing walks
the ranked list to the end: when the item ranked third is too large for the
remaining budget, the item ranked ninth still lands. Stopping at the first
item that does not fit throws away everything behind one fat memory — and fat
memories are exactly the ones a store accumulates. This is a knapsack
approximation and it is not optimal; it is deterministic and explainable,
which matters more here than optimality, because "why was this recalled and
that not?" is a question operators genuinely ask.

The pattern generalizes: if an item is too large to ever fit a reasonable
budget, that is a *capture* defect surfacing at read time. Fix it upstream by
splitting the item, not by teaching the packer to cut.

## The result says what it did not show

A recall result carries three numbers, not one: what was selected, what was
eligible and considered, and what the budget was. A caller handed only the
selection will present it — to a human or to the agent's own reasoning — as
though it were everything the store held on the topic. Reporting the
considered count alongside the selection is
[count-carries-predicate](../../_laws.md#count-carries-predicate) applied to
recall: "these six, from forty-one eligible, under a budget of N" instructs
very differently from six bare items.

Keeping the *omitted* items ranked and available (not returned into context,
but inspectable) is what makes the budget debuggable. The complaint "it forgot
X" is answered in one step: X scored here, and lost to these.

## Injected memory is labeled, not smuggled

How recalled material enters the context is as consequential as what is
selected. Memory injected as bare statements is indistinguishable from
fresh, certain ground truth — which it is not. Every injected item carries
its standing: that it *is* recalled memory, its kind (fact, preference,
procedure), its age or last confirmation, and its confidence grade. "You
believe, from several confirmations, most recently last week: …" and "the
deadline is the 14th" instruct the consumer very differently — the first
invites verification when stakes are high; the second forecloses it.

This is [count-carries-predicate](../../_laws.md#count-carries-predicate)
applied to belief: an asserted item without its predicate — who concluded
it, from what, how firmly, as of when — *will* be reused downstream as
load-bearing certain truth, because stripped context is always read at
maximum strength. The labeling is also what keeps a wrong memory
survivable: an agent that knows it is consulting memory can doubt it; an
agent fed memory as world-state cannot.

Stakes scale the discipline: a recalled preference shaping a report's tone
can ride on its label, while a recalled credential procedure about to drive
an irreversible action deserves verification against the live system first.
Memory proposes; for destructive acts, the present confirms.

## Empty is not broken — and the difference must be visible

Recall has two zero-item outcomes with opposite meanings, and the system
must spell them differently, per
[failure-not-empty-success](../../_laws.md#failure-not-empty-success):

- **Empty recall** — retrieval ran, nothing qualified. Correct and common:
  a novel topic has no history. The agent proceeds, knowing it looked.
- **Failed recall** — the store was unreachable, the query errored, the
  pass timed out. The agent is now operating *without its memory*, which
  is a degraded mode the agent (and, for a persistent failure, the human)
  should know about — not a silent coincidence of an empty result.

An agent that cannot tell these apart treats amnesia as novelty: it
confidently re-derives, re-asks, and re-decides things it knows, and the
humans around it experience random personality loss. The distinction costs
one status signal on the recall path and repays it the first time the
store is down.

## The loop closes: recall feeds retention

Every recall is evidence about what matters. Items injected *and used* —
cited, acted on, confirmed — refresh their last-use recency and reinforce
their importance; items repeatedly injected and ignored are telling the
relevance ranking something too. This usage signal flowing back into the
importance score is what makes
[decay-and-forgetting](decay-and-forgetting.md) track lived relevance
instead of creation-time guesses — without it, decay is a countdown timer;
with it, decay is attention.

The feedback has one contract, and it is the whole reason the signal is worth
anything: **only items that actually reached the agent may be counted.** The
tempting implementation counts at the query — one increment per candidate
scanned, or one per recall call — because that is where the code already is.
Do that and the usage term stops measuring usefulness and starts measuring
*how often the store was asked*: every item drifts upward together, the
ranking's relative order is unchanged, and the
[memory-value-model](memory-value-model.md) is now scoring its own retrieval
behavior rather than the items. The failure is invisible in every dashboard,
because the counts look busy and healthy.

So the increment happens on the selected set, after packing, at the boundary
where material crosses into context — and it is the *caller's* duty, stated
explicitly, because the scoring core is pure and cannot perform it. Counting
items that were merely considered is the same defect one step less obvious.
