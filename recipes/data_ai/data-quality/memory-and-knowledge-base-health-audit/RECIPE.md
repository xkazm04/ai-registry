---
name: memory-and-knowledge-base-health-audit
version: 0.3.0
status: seed
domain: data_ai
path: data_ai/data-quality
---

# Memory and knowledge base health audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The layers an agent remembers through decay quietly: notes go stale, documents
orphan from what they described, articles start disagreeing with each other, and an
author leaves without anybody inheriting what they wrote. Nothing fails, so nothing
surfaces, and trust in the whole system erodes instead. The obvious audit makes this
worse by reporting age, because an old document is not a wrong one.

**Input.** Whichever memory layers are configured, what each carries about when it was
last touched and when it was last confirmed, whatever is known about how it is actually
being used, and the totals from previous passes.

**Core action.** Find drift, staleness, orphaning, lost ownership and contradiction,
rank the findings on what the evidence actually supports rather than on age alone, and
hand every one to a person with a recommended action, never mutating a layer.

**Output.** A capped, ranked set of findings queued for a human decision, each carrying
why it is a finding rather than only how old it is, and totals that let the next pass
say whether this is getting better.

## Activities

1. Decide which memory layers are configured and in scope for this pass *(decide)*
2. Scan each layer for staleness, orphaning, lost ownership and contradiction
*(observe)*
3. Read what usage says, since content people reach for and are failed by is stronger
evidence than a date *(observe)*
4. Rank findings on what the evidence supports, capping rather than flooding the queue
*(decide)*
5. Attach a recommended action to each finding *(act)*
6. Queue every finding for a human decision, mutating nothing *(deliver)*
7. Keep the totals so the next pass can say whether it is getting better *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Stale, contradictory, orphaned or unowned content across the memory layers is caught
and queued for a human decision rather than left to accumulate silently.**

- Every configured layer is audited and every finding reaches a person with a severity
  and a recommended action
- Findings are capped sensibly per category with the suppressed count disclosed, not
  silently truncated
- A document nothing links to any more, or whose author has left with nobody inheriting
  it, is a finding in its own right rather than something that waits to become old
  enough
- A deeper cross article contradiction pass runs at the scope the adopter wants, without
  needing a second charter to get it

**A finding says why the content is a problem, not only how long it has sat there.**

- Where the only evidence is a date, the finding is reported as untouched rather than as
  wrong
- Where usage is available, content people reach for and are failed by ranks above
  content that is merely old and unread
- A recorded correction outranks every other finding, because unlike staleness or
  orphaning it arrives with its root already known: somebody was told the wrong thing
  and said so, and the content that produced it is named rather than inferred
- The staleness bar is applied per family of content, since a permissions note and a
  design retrospective do not decay at the same rate and one number across both
  mis-ranks everything
- A last confirmed date, where the layer keeps one, is preferred to a last edited date,
  because an edit can be a typo fix
- A reviewer who reads the content a recorded correction pointed at and finds nothing
  wrong with it has said that correction did not come from stored content at all, and
  that is kept against the correction rather than counted as one more finding nobody
  acted on, because this ranking puts that class above every other on the strength of a
  root it assumed

**The audit never changes a memory layer on its own.**

- Merge, archive, recompile and reduce importance are all decided by a person
- A layer that is not configured is skipped and noted rather than failing the pass

**Each pass is worth more than the one before it, because it knows what the last one
did.**

- The totals are kept so a later pass can say whether the corpus is improving
- A first pass says it is establishing a baseline rather than reporting a trend
- The share of findings a person acted on is carried forward, so the ranking is tuned by
  what the team actually did rather than by how the list feels

## Guidance

Catch drift before it erodes trust, and let a person decide what to do about it; this
work never mutates memory. Age is the weakest evidence available. A document nothing
links to, whose author has left, or that people keep reaching for and being failed by,
is a better finding than one that is simply old. Apply the staleness bar per family,
because a permissions note and a retrospective do not decay alike. Skip an unconfigured
layer quietly and note it.

## Where this is worth adopting

- A team whose agent has answered from a knowledge base for a year, where nobody has
  read the oldest third of it since it was written and nobody knows whether that
  matters.
- A company after a round of departures, where a quarter of the documentation has an
  author who no longer works there and none of it has been inherited by anybody.
- A first audit of a five year old vault, which will surface hundreds of findings, where
  the cap on how many reach a person is the only thing standing between the audit and
  being switched off after one run.
- An assistant whose users have quietly learned which questions it gets wrong and
  stopped asking them, so the failures now appear nowhere except in what nobody asks any
  more.
- An operator who ran this audit two months ago and fixed part of it, who needs to know
  whether the corpus is better or whether the same findings simply aged back into view.

## Connector types

`knowledge_base`, `source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[obsidian](examples/obsidian.md) for `knowledge_base`.

## Recommended trigger

`self_paced`. Staleness accrues continuously and no external clock announces it. Act
when enough content has changed or aged to be worth a pass, and take the deeper scope
when the corpus has grown enough to warrant it. A weekly slot audits an unchanged corpus
and misses a week of heavy writing.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which memory layers this adopter actually has, since a vault, a vector store and a
  persona memory each fail differently
- What counts as stale for each family of content here, because a reference note and a
  working note age at completely different rates and a single threshold across both is
  the most common way this audit becomes noise
- How many findings a person is willing to triage in one sitting, which is what the cap
  is really protecting, and who those people are, since a corpus owned by one reviewer
  is a corpus that will not be reviewed
- How deep a pass the adopter wants, since the contradiction scan costs materially more
  than the rest
- Whether anything here records what content is used for and what it failed to answer,
  because that is the strongest available evidence and most corpora do not keep it

## Dependencies

None.
