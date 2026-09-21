---
layer: technique
type: technique
subject: agent-memory
technique: loss-site-inventory
status: forged
laws: [failure-not-empty-success, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a store is read by more than one path and each path takes its own number, a window of the newest items and a rollup of the oldest are both shown to the agent, a careful degradation step has a cruder fallback behind it, deciding where an omission notice is owed, the agent repeats advice or re-asks something that is stored but was not shown to it]
applied: code
ab_verdict: better
---

# Loss-site inventory

The corpus already requires a notice where content is cut on purpose. A recall result
reports what it selected, what it considered and what the budget was
([recall-injection](./recall-injection.md)). The bottom rung of a degradation ladder is a
notice, not silence. A clamp leaves a mark inside the fence. Every one of those rules is
attached to a **mechanism somebody designed as a cut**, and that is where they get
implemented: at the one site the author was thinking about loss.

Stored content also fails to reach the reader at places nobody designed as cuts. Those
places carry no notice, and the tell is that the same codebase marks loss well somewhere
else. The first design question is not "how should the truncation be marked". It is
**"where can stored content fail to reach the reader?"** That question gets answered by
walking every path from the store to the reader, not by searching the code for the word
*truncate*.

## The sites nobody designs

- **The second door.** One store, several read paths, each with its own number: the
  agent's recall takes twenty, the listing tool the agent can call takes fifty, the
  operator's view takes everything. Each reader treats what it got as the store. The
  operator sees rows the agent never saw, so "it forgot X" cannot be reproduced from the
  operator's side.
- **The seam between two views.** A window shows the newest *N* items in full. A rollup
  covers whatever a retention cap *M* pushed out. Items *N+1* through *M* are in neither
  view, and a rollup headed "older items" tells the reader the two views are continuous.
  Measured on a real read path with a window of 3 and a cap of 12, over histories sized to
  its own output limits: every store state holding more than three records hid up to nine
  of them from the agent (204 of 240 swept states). Nothing said so. No cap fired.
- **The cap on the assembled whole.** Each section is honest, and then the assembled
  block goes through a character cap that removes whatever comes last. The layout puts the
  freshest items first on purpose, so what gets cut is the rollup, the long-term part of
  the memory. On the same path, the rollup was entirely missing from the payload in 38 of
  96 states where it existed. The only trace was a trailing ellipsis that did not say what
  it replaced.
- **The fallback behind the fallback.** Compaction fails, so the uncompacted history is
  returned. The hard budget enforcer then drops the oldest messages with no marker and no
  record. The careful path had its notices. The last resort was written as code that should
  never run, and it runs exactly when the system is under the most pressure.
- **The skipped item.** A read error is filtered out as if the item were absent. The
  window then shows two records and says nothing about the third. When every item fails,
  the block is left out entirely, which tells the model its memory is empty
  ([durable-store-failure-posture](./durable-store-failure-posture.md) owns what the write
  path owes at that point).

## The rule

> **Every site where stored content can fail to reach the reader writes a notice into the
> reader's own channel. The notice says what kind of content is missing, how much of it,
> and why: a cap, a window, an unreadable item, or a fallback.**

The notice goes in-band because the reader who needs it is the model, which is about to
reason over the gap. A log line informs only the operator. A count with no kind ("40
omitted") tells the reader *that* something is missing. A kind with a count ("9 older
reviews stored but not shown, and not in the rollup below") tells it *what* is missing,
which is the part it can act on
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Notices have to survive the next cut

A notice written at an inner site sits inside the block that an outer cap will cut
later. If the cap removes the notice, that loss is unmarked too. Two placement rules
handle this, and both were learned at a real seam:

- **A notice follows the content it qualifies. It never comes before it.** An arm that put
  its notice before the recent records spent their budget on the notice and cut the
  freshest record sooner.
- **The outer cut carries forward any notice it removes**, after its own notice, which
  names the reviews, the partial item and the rollup entries it dropped.

## A degraded record carries its reason

When a fallback *produces* something, such as a default selection after an exception or a
failed diagram rendered as plain text, the reason goes into the produced record's own
metadata or body. A log line at the time does not count. Every later reader then gets the
fact that it degraded and why, including readers that were not running when it happened.
The same rule also covers the notice's opposite: a notice that claims a loss that did not
happen is a false record, so the test checks both directions.

## What it costs

In the measured seam the notices added at most 311 characters to a 4,000-character block.
On the measured histories they pushed 5 rollup entries past the cap, out of 2,064 losses
counted, and each of the 5 was named. Where nothing was missing, the payload stayed
byte-identical.

## When not to use it

- Content the reader gets back on its own, such as a cache eviction followed by a
  transparent refetch, is not a loss and needs no notice.
- A deliberate forgetting that
  [decay-and-forgetting](./decay-and-forgetting.md) governed is not "stored but not
  shown". The record is gone, and provenance is that technique's concern.
- A notice the reader cannot act on still has to be written when the gap could mislead
  the reader. Leave it out only when the gap cannot mislead.

## Decision rules

- Inventory loss sites by walking each read path from store to reader. List the doors,
  the window and rollup seam, every cap on an assembled block, every fallback, and every
  skipped read.
- At each site, write a notice in the reader's channel that names kind, count and cause.
- Place a notice after the content it qualifies. The outermost cut carries forward the
  notices it removes.
- Write a fallback's reason into the record it produced.
- Test with a store seeded past every boundary: the window, the retention cap, the
  character cap, one unreadable item and all items unreadable. For each state, assert that
  every stored item missing from the payload is covered by a notice with the right count,
  and that no notice claims a loss that did not happen. A test that covers only the
  designed cut passes on a store that has this defect.
