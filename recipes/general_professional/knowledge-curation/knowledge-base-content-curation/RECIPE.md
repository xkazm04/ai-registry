---
name: knowledge-base-content-curation
version: 0.3.0
status: seed
domain: general_professional
path: general_professional/knowledge-curation
---

# Knowledge base content curation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Content saved without judgment turns a knowledge base into a pile, and the
damage is not the volume. It is that a page admitted without checking what it disagrees
with leaves two answers to the same question, which costs a reader more trust than the
gap it filled, and that a rejection nobody wrote down gets re-argued every time the same
source comes round again.

**Input.** One or more pieces of content arriving as a submitted address or from a feed
sweep, the identity the intake keyed each on, the controlled vocabulary, and the pages
already there that this one might answer over or connect to.

**Core action.** Decide whether this answers a question the base does not already
answer, find what it contradicts before anything is written rather than after somebody
has stopped trusting the base, and write the verdict down either way.

**Output.** A page carrying a layered summary, tags drawn from the controlled
vocabulary, real cross-references and the date its claim was last checked, or a recorded
rejection against the source's identity so the same item is never weighed twice.

## Activities

1. Fetch the submitted or swept content *(observe)*
2. Ask what question this would answer and whether the base already answers it
*(decide)*
3. Find what it contradicts among the pages already there *(decide)*
4. Write the summary in layers, to the depth a later reader needs *(act)*
5. Tag against the controlled vocabulary, extending it only when nothing fits *(act)*
6. Find the cross-references that make the page reachable by navigation rather than only
by search *(act)*
7. Create the page once, keyed on the source's identity, and read the destination back
*(deliver)*
8. Record the verdict either way, so a rejected source is not weighed again *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Everything admitted answers a question somebody will ask, and everything refused is on
the record.**

- A page is created only when it answers a question the base does not already answer,
  and that question is stated on the page.
- A rejection is recorded against the source's identity with its reason, so the same
  item is not weighed again on the next sweep.
- Near-duplicate content is caught before a page exists, rather than found by an audit
  months later.
- Content copied in wholesale, without passing this judgment first, is treated as a
  defect to undo rather than as a fast path, because afterwards a page that skipped
  admission is indistinguishable from one that earned it.
- A create that appears to have failed does not produce a second page: the write is
  keyed on the identity the intake supplied and the destination is read back before the
  work is called done.
- A page a curator later merges away or deletes is read as an answer to the admission
  test rather than as housekeeping, and is recorded against the question that page was
  created to answer, so the base stops admitting pages on a question it already answers
  in different wording.

**A new page does not disagree with the pages already there without somebody saying
so.**

- Content that disagrees with an existing page is reconciled at admission: one of them
  is corrected, or both are marked as disagreeing with the reason recorded.
- A contradiction that cannot be reconciled is escalated rather than published quietly,
  because a base holding two answers spends more trust than one holding none.
- Every page carries the date its claim was last checked, separately from the date the
  page was written, since a reader deciding whether to believe it needs the first and is
  usually shown the second.

**The tags keep meaning something, and a page can be reached by walking rather than only
by searching.**

- A tag is added to the controlled vocabulary only when nothing existing fits, never as
  a by-product of writing a page.
- A plural, a spelling variant or a synonym of an existing tag is not a new tag, because
  those are what turn a vocabulary into a long tail of terms used exactly once.
- Every page either carries a real cross-reference or is deliberately marked standalone,
  so a page nothing links to is a decision rather than an accident.

## Guidance

Ask what question this page would answer and whether the base already answers it,
because interesting is not the test. Then find what it contradicts: a base with two
answers loses a reader faster than a base with none, and reconciling later means hearing
about it from somebody who already stopped looking. Extend the vocabulary only when
nothing fits, never for a plural or a synonym. Record a rejection, since an unwritten no
gets re-argued forever.

## Where this is worth adopting

- A research habit that has been saving links for a year, where everything is in there,
  the same article is in there three times, and nobody has opened it since month four.
- A team whose base is consulted less every month for a reason nobody has named, which
  is that two pages give different answers about the same policy and the people who
  found out told each other rather than fixing it.
- A curator working from a feed sweep, where the same source keeps arriving and being
  weighed and rejected again, because the refusal was a decision somebody made in their
  head and the pipeline has no memory of it.
- A base whose tag list has grown past the point of usefulness, where the fix is not a
  cleanup but an admission rule that stops adding a synonym of a tag that already exists
  every time a page is written.
- Somebody writing for a reader who is not themselves, who has to decide how deep the
  summary goes and currently decides it by how interesting they found the source, which
  is the wrong question and produces pages nobody can use.

## Connector types

`knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[notion](examples/notion.md) for `knowledge_base`.

## Recommended trigger

`event`. The work begins when content arrives, whether a person submitted an address or
an intake sweep produced new items, and it has nothing to do until then. Self-paced
would be wrong because the work cannot choose its own moment when the input is somebody
else's submission, and a clock would only decide how long a submission waits.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which taxonomy dimensions matter and how strictly the controlled vocabulary is held,
  because the whole difference between a useful set of tags and a long tail of one-use
  terms is this one decision.
- What a later reader will be looking for, because it is the only thing that sets the
  depth the summary is written to, and the curator's own interest is the wrong proxy for
  it.
- Which knowledge base and which space, because curation writes and a wrong destination
  is expensive to unwind.
- How long a claim in this subject stays true, because that sets how often a checked
  date has to be renewed and it is measured in weeks for some material and years for
  others.
- Who to escalate an unreconcilable contradiction to, because the alternative is
  publishing it quietly, and that is the outcome this work exists to prevent.

## Dependencies

None.
