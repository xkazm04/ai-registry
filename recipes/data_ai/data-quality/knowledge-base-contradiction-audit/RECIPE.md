---
name: knowledge-base-contradiction-audit
version: 0.3.0
status: seed
domain: data_ai
path: data_ai/data-quality
---

# Knowledge base contradiction audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Two articles covering the same ground and saying different things are both
individually healthy: neither is stale, neither is orphaned, and a per document audit
cannot see the problem at all. Whoever reads one of them gets a confident wrong answer,
and the only person who would have caught it is the one who happened to read the other.

**Input.** The compiled articles across the audited layers, whatever each one carries
about its own currency, and the history of contradiction pairs already surfaced.

**Core action.** Find the pairs that genuinely disagree rather than the pairs that
merely look alike, say where in both bodies the disagreement is, and gather the evidence
bearing on which one is current so a person can decide quickly. Deciding which is right
is never this work's to make.

**Output.** Contradiction pairs with the disagreeing passages quoted from both sides and
the currency evidence attached, queued for a human decision, and a history showing which
pairs keep coming back.

## Activities

1. Gather the compiled articles across the audited layers *(observe)*
2. Find candidate pairs covering the same ground, by subject rather than by similar
wording *(decide)*
3. Compare bodies for genuine disagreement, setting aside one scoped to a different
audience, region or version *(decide)*
4. Quote the disagreeing passages and gather what each side carries about its own
currency *(act)*
5. Rank pairs by how confidently they disagree, paging the scan when the corpus is large
*(act)*
6. Queue every pair for a human decision, never resolving a contradiction alone
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Cross article contradictions are caught, not just per article staleness and orphan
issues.**

- Pairs covering the same ground are checked for genuine disagreement and surfaced as
  findings, which no per document check can produce
- Candidate pairing is done on what an article is about rather than on how alike its
  text is, because a plainly stated contradiction is near-identical text and a
  similarity filter discards exactly the pairs worth reading
- A disagreement that is scoped, to a different audience, region, product version or
  effective date, is set aside rather than reported as a contradiction
- A borderline disagreement is surfaced as needing review rather than judged
- A pair that keeps recurring across passes is visible as recurring

**A person deciding which of two articles is current has the evidence in front of them
and does not go and find it.**

- Every pair arrives with the disagreeing passages quoted from both sides, so nobody
  re-reads two articles to locate the sentence
- Whatever each side carries about its own currency is attached: when it was last
  reviewed rather than last edited, who owns it, whether either is marked as the
  canonical version, and what supersedes what
- Where none of that evidence exists, the pair says so, because the newer one winning is
  a guess and a last edited date tells you a document is old rather than wrong

**A large corpus does not make the pass unaffordable or cause it to be skipped.**

- The scan is paged across passes and reports deltas rather than spending the whole
  budget in one run
- What was not reached this pass is disclosed rather than implied complete
- A pass that found no genuine contradiction says so, rather than promoting the closest
  near-duplicate it happened to find
- The share of surfaced pairs a person acted on is carried forward, since a pair nobody
  acted on cost a reader's attention whether or not it was correct
- A pair nobody acted on says which of two things it was, a pairing that found no real
  disagreement or a real one this team has chosen to live with, since the share acted on
  pools them and the second kind teaches the pairing to narrow while the pair itself
  comes back every pass and is counted as recurring

## Guidance

The hard part is not finding the pairs, it is deciding which one is current, and that is
not yours to decide. Pair on subject rather than on wording, since a plainly stated
contradiction is near-identical text. What ranks two disagreeing articles is the
reference structure between them: which cites, answers or supersedes which, and what
else in the corpus leans on each. A document nothing points at is not load bearing,
however recent. Hand over the disagreeing sentences with that lineage, and when neither
exists, say so.

## Where this is worth adopting

- A support knowledge base written by four people over three years, where two articles
  answer the same refund question differently and agents use whichever they find first.
- An engineering handbook whose onboarding page and runbook disagree about what may be
  deployed on a Friday, and both were edited within the month, so recency decides
  nothing.
- A company that has just merged two teams' documentation, where every process now
  exists twice and nobody yet has the authority to say which version won.
- A policy corpus with real effective dates, where the apparently contradictory version
  is simply the one that applied last year, and an audit blind to that reports the same
  false pair every pass.
- A corpus large enough that a full pairwise comparison costs more than the team will
  spend, so the real choice is between a partial scan that says what it missed and no
  scan at all.

## Connector types

`knowledge_base`, `source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[obsidian](examples/obsidian.md) for `knowledge_base`.

## Recommended trigger

`self_paced`. Contradictions appear when articles are written or edited, not on the
first of a month. Act when enough has been written to be worth comparing, and when the
previous pass left part of the corpus unreached.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What makes two articles worth comparing here, since pairing on subject needs to know
  what this corpus organises itself by, and pairing too loosely invents contradictions
  while pairing too strictly finds none
- Which article families genuinely should agree, because some corpora keep deliberately
  divergent versions per region, per audience or per product version
- What this corpus records about currency, since a review date, an owner, a canonical
  marker or an effective date is what makes the human decision fast and their absence is
  itself worth reporting
- How much of the corpus one pass may cover, which is a budget decision the adopter owns
- Where the disagreement is likely to have started, because the change usually lands in
  chat, a ticket or a commit before it reaches the article, and the person deciding
  usually knows where to look

## Dependencies

None.
