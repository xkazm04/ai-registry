---
layer: technique
type: technique
subject: context-hierarchy
technique: stable-sampling-for-wide-nodes
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [a node has more children than one summary call can read, an unchanged tree produces a different summary on every refresh, a reader of a summary needs to know how much it did not see, deciding which children to summarise before paying for their summaries]
---

# Stable sampling for wide nodes

A node's overview is generated from its children's abstracts, and a node can have more
children than one generation call can read. The overview is then built from a
**sample**, and the properties of that sample decide whether the rest of the hierarchy
behaves — because [digest-gated-upward-refresh](./digest-gated-upward-refresh.md) treats
a changed abstract as a change, and a sample that wanders produces a changed abstract
from an unchanged tree.

## The sample is a function of the child list and nothing else

Three natural choices of sample all fail the same way:

- **The first N children** covers one end of the listing forever. A node whose
  children are dated or alphabetical is summarised from its oldest or its A-through-D
  region, and the overview is wrong about the node's shape in a way no refresh fixes.
- **A random N** covers the node fairly on average and differently every time. Every
  refresh of an unchanged tree produces a different overview, whose lead paragraph is
  a different abstract, whose digest differs from the last one, which reports a change
  to the parent, which refreshes, which samples differently. The hierarchy churns on
  nothing, and every diff in the summary store is noise.
- **A time-keyed sample** — most recently modified N — ties the overview to the edit
  rate rather than the content, and a burst of edits in one corner rewrites the
  node's description of every other corner.

The rule: **the sample is a pure function of the ordered child list.** Same children,
same order, same sample, byte for byte. Two properties are required and they are the
whole specification:

1. **Deterministic** on a stable node — repeated refreshes of an unchanged listing
   choose the same members.
2. **Spanning** — the sample covers positions across the whole listing rather than
   truncating it, so the overview describes the node's range and not its prefix.

Evenly spaced indices over the sorted listing satisfy both with one line of
arithmetic, and preserve the listing's order in the output, which keeps the
generated overview's child list in the same order a consumer sees when browsing.
Hash-keyed selection also satisfies both and is a later refinement, not a requirement;
what it must not do is introduce a seed that varies between runs.

## Take the sample before the expensive work

The naive pipeline generates or reads a summary for every child, then samples the
results to fit the generation prompt. That bounds the *prompt*, and does nothing for
the *cost*: a node with a hundred and sixty-one children summarises a hundred and
sixty-one files to use thirty-two. The sample must be taken from the **listing**,
before any child's summary is generated, so that children outside it are not
summarised merely to be discarded.

One distinction keeps this from silently damaging the leaves. A child's own
processing — parsing, its file summary as an input to its own index entry, its vector
— is owed regardless of whether it made the parent's sample. Sampling reduces only the
work done *for the parent's overview*. A changed file that was not sampled still gets
its own index maintenance; it just does not get described in this round's overview.

## Sample membership is not scheduling state

It is tempting to persist the sample — which children the last overview was built
from — and to make scheduling decisions from it: refresh immediately if a *sampled*
child changed, defer if an unsampled one did. Do not. Persisting membership adds a
set with its own truncation and identity problems, and gives the sample a second job
it was never designed for. The scheduling technique counts changes and compares a
ratio; each refresh re-lists the node and re-samples from the current listing; nothing
records or consults who was in the previous sample. The sample is a transient decision
inside one generation, and the tree stays correct whether or not two consecutive
samples overlap.

## The overview says how much it did not see

An overview built from thirty-two of a hundred and sixty-one children is a claim about
the node, and per [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
the claim travels with what was counted. The summary's own metadata carries three
integers over the node's **direct** children — not its recursive subtree:

- **total** — direct files and directories contributing to the node's semantics at the
  last successful generation;
- **sampled** — how many of them this overview was built from;
- **unsampled** — the remainder, so that sampled plus unsampled equals total by
  construction.

A consumer reading the overview can then weigh it: a fully sampled node's overview is
a description; a node sampled at a fifth is a sketch, and a descent that finds nothing
under a sketched node has not established that nothing is there. The same metadata
carries the pending-change count the scheduling technique maintains, so freshness and
coverage sit together in the one place a reader of the summary will look.

These counters are metadata, not body. They stay out of the embedding whitelist and
out of the summarisation prompt, per
[per-node-summary-tiers](./per-node-summary-tiers.md); a coverage change is not a
content change and must not move the node in vector space. And they name their own
recomputation — they are written by the generation that produced the body, and
regenerated with it — which is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to a number that would otherwise be trusted longer than the body it describes.

## Decision rules

- When a node's direct-child count exceeds the summariser's reading limit, sample;
  when it does not, read every child and record sampled equal to total.
- When choosing the sample, compute it from the ordered listing with no time, random,
  or run-dependent input; verify by refreshing an unchanged node twice and comparing
  the bytes.
- When sequencing a refresh, list, then sample, then summarise the sampled children
  only — never summarise, then sample.
- When a child changed but was not sampled, still complete the child's own index
  maintenance.
- When writing the overview, record total, sampled and unsampled over direct children,
  in metadata, outside the embedded text.

## When not to use it

A tree whose nodes never exceed the reading limit has nothing to sample, and the
counters degenerate to sampled equals total on every node — still worth writing,
because the reader's contract is that the numbers are present, but the selection
logic never runs.

And where the reading limit is the problem — a node so wide that a tenth of its
children cannot tell its story — the answer is not a cleverer sample but a narrower
node. A directory of two thousand undifferentiated files is a flat set wearing a
folder, and the retrieval subject's flat machinery over its leaves will serve it better
than any overview generated from sixty of them. Split it if it has a structure;
search it flat if it does not.
