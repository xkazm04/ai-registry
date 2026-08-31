---
layer: technique
type: technique
subject: agent-memory
technique: recall-injection
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [splitting a recall budget across tiers, an oversized memory blocks everything behind it, the agent re-asks things it already knows, a recalled experience steers a capable agent wrong, the agent answers plausibly where the honest answer is unknown]
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

## The budget is a ceiling, not a target

Ranking plus greedy packing has one property nobody chooses: it cannot leave
the budget unspent. The list is walked to the end, so the marginal item is
admitted whenever it fits, and this technique already states the reason that is
wrong — marginal recall goes negative well before the budget is technically
full. The rule is written and the machinery cannot act on it.

What closes the gap is an **admission barrier applied before the cut**, not a
better ordering. Measured on one instrument, reordering alone reproduced the
unranked baseline to three decimal places at identical token cost, while
admitting only items that clear a positive-contribution bar improved the answer
*and* spent a quarter of the tokens. Ranking decides sequence; only a barrier
decides membership, and membership is where the loss was.

State the budget as the ceiling it is. A recall that returns three items
against a ten-item budget has not underperformed.

## Items are substitutes only where the task does not compose

Both packing rules above — prefer fewer and stronger, skip an oversized item
rather than stopping — are correct where recalled items are **substitutes**:
each independently supports the answer, so dropping the ninth costs the ninth's
marginal value and nothing else.

Where the task composes across items they are **complements**, and the same
rules become a cliff. Measured on multi-step questions, dropping a single
required item took accuracy from roughly four-fifths to roughly half, with the
surviving items providing no partial compensation — the consumer could not
reason its way across the missing link. A budget that fits four of five jointly
required items does not score four-fifths of the way; it fails, while returning
a full-looking result.

The discriminating question is cheap and belongs at the call site: **does the
answer need these items together, or any one of them?** Where the answer is
"together", skip-don't-stop is the wrong policy — a set that cannot be
completed within the budget should report that it could not, which is the
`considered` count doing the job it was already given, rather than deliver a
confident partial.

## The result says what it did not show

A recall result carries three numbers, not one: what was selected, what was
eligible and considered, and what the budget was. Three numbers is the
debuggability answer, and it is the floor rather than the ceiling: a count of
the remainder tells a consumer *that* something was left, while the **shape** of
the remainder tells it what. A consumer that can see the store held nine other
groups and it has looked at one knows where to go back to; a consumer handed
"considered: 40" knows only that it is incomplete, and its only recovery is to
ask again the same way. Where the store's organization is something the
consumer can survey, report the shape; where it is not, report the count and
accept that recovery will be blind. A caller handed only the
selection will present it — to a human or to the agent's own reasoning — as
though it were everything the store held on the topic. Reporting the
considered count alongside the selection is
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) applied to
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

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
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

## Labeled is not applied

Labeling makes recalled material doubtable; nothing about it makes the
material *used well*. Between "in view" and "acted on correctly" sits a
judgment injection cannot perform: does this remembered item actually apply
to the present situation, and what does it translate to here? Skipping that
judgment is not neutral. Where it has been measured, replaying raw past
experience into a capable consumer's context scored *below* running with no
memory at all: a near-match to the current situation reads as a match, and
steers confidently wrong. Two disciplines follow:

- **Recall proposes; a distinct check disposes.** Before a recalled
  procedure or past experience drives action, the consumer states whether it
  applies to the current state and what it means there -- and rejects it,
  falling back to fresh reasoning, when it does not. The rejection path is a
  designed outcome with its own exit, not a failure of recall.
- **Memory's value floats on the gap between the consumer and the task.**
  A consumer that already solves the task from what is in front of it gains
  nothing from injected experience and pays the distraction surface anyway;
  the same bank moves results where the consumer is far from its ceiling.
  This is an observed pattern, not a law -- so budget recall against the
  measured gap in the deployment at hand, not against the store's size or
  the architecture's ambitions.

## Eager recall buys over-answering

A recall path that almost always surfaces *something* has changed the
consumer's default from "I don't know" to "here is my best guess" -- without
anyone deciding that. Measured head-to-head, sparse curated stores beat
eager ranked recall exactly and only on the questions whose right answer is
that nothing was ever said: not by judging better, but by having less
plausible material to be tempted with. And the over-answering tracked how
eagerly recall surfaced material, not how much context was injected -- so
trimming the slice does not fix it. Sparse memory gets abstention for free;
eager memory must build it back deliberately: relevance floors on the
retrieval side, the considered/selected counts on the injected slice so
"nothing strong was found" is a sayable state, and a consumer instructed
that a plausible recalled fragment is not evidence the question was ever
answered. The eval closes the loop: include should-abstain questions and
score them in the same denominator as everything else, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
-- leave them out and the suite structurally rewards never saying "I don't
know", which is the exact bias eager recall already has.

## Empty is not broken — and the difference must be visible

Recall has two zero-item outcomes with opposite meanings, and the system
must spell them differently, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):

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
[decay-and-forgetting](./decay-and-forgetting.md) track lived relevance
instead of creation-time guesses — without it, decay is a countdown timer;
with it, decay is attention.

The feedback has one contract, and it is the whole reason the signal is worth
anything: **only items that actually reached the agent may be counted.** The
tempting implementation counts at the query — one increment per candidate
scanned, or one per recall call — because that is where the code already is.
Do that and the usage term stops measuring usefulness and starts measuring
*how often the store was asked*: every item drifts upward together, the
ranking's relative order is unchanged, and the
[memory-value-model](./memory-value-model.md) is now scoring its own retrieval
behavior rather than the items. The failure is invisible in every dashboard,
because the counts look busy and healthy.

So the increment happens on the selected set, after packing, at the boundary
where material crosses into context — and it is the *caller's* duty, stated
explicitly, because the scoring core is pure and cannot perform it. Counting
items that were merely considered is the same defect one step less obvious.
