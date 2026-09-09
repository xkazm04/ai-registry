---
layer: technique
type: technique
subject: search-term-mining
technique: never-mine-demo-data
status: forged
laws: [provenance-is-binary-and-labelled, a-gate-before-money-and-copy]
shared_with: []
use_when: [a connector can fall back to sample data, a search-term sync runs on a degraded fetch, a demonstration tenant shows negative-keyword recommendations]
---

# Never mine demo data

A negative keyword is a permanent change to a real account. Search-term mining run over
sample, demonstration, fixture or degraded-fallback data produces recommendations
whose subject does not exist, and in a product where a recommendation is one approval
click from a live write, a fabricated query becomes a real criterion. The rule is
that a degraded or illustrative read **mines nothing**, and that the refusal is
structural rather than a label.

## Why a label is not enough

Illustrative data is legitimate on a demonstration surface, labelled as such, and the
bundle's provenance law allows exactly that. But a labelled recommendation is still a
recommendation: it has a row, a button and an amount, and an operator who has approved
twenty real ones will approve the twenty-first without reading the badge. Worse, a
degraded fetch is not a demonstration; it is a real tenant whose connector fell back
silently, whose operator believes the numbers are theirs. The only reliable defence is
that no mining input exists to recommend from.

## The two halves of the rule

1. **Skip the step, do not label it.** When the campaign fetch that feeds mining is
   degraded - the connector answered with sample data, or with a fallback after
   failure - the search-term step is not run. Not run with a flag, not run and
   discarded: not run. The same condition that suppresses money verdicts and alerting
   on that tenant suppresses mining, because all three are writes or near-writes on
   numbers that are not the account's.
2. **The sample source answers with nothing.** The demonstration provider's
   search-term method returns an empty list by design, and the store refuses to
   overwrite stored real terms with an empty result. So even if the skip were
   bypassed - a refactor, a flag misread - the sample source cannot replace a tenant's
   last good real rows with fabricated ones, and the recommender reads the real rows
   or none.

The two halves fail independently and cover each other. The skip protects the store
from being written; the empty answer protects it from being written *wrongly* if the
skip fails.

## What "degraded" means here

Any of: the provider returned sample data because the account is not connected; the
live fetch failed and a fallback supplied rows; the tenant is a demonstration tenant;
the rows are stamped as sample by the sync. The distinction between "not connected"
and "connected but failed" matters for the operator's message and not at all for
mining: both mine nothing. A partial live read (some campaigns real, some absent) is
mined only over the real rows, and the recommendation says the read was partial.

## The demonstration surface

A demonstration tenant may still *show* what a mining recommendation looks like. It
does so from a static, clearly illustrative fixture rendered by the surface, with no
apply action wired, and with the illustrative label beside every row rather than in a
footer. It never runs the recommender, never writes the store, and never shows a
"realized impact" for a move that was never applied. A demonstration that has a
working approve button is not a demonstration.

## Decision rules

- When the fetch that feeds mining is degraded, skip the mining step, because a
  labelled recommendation on fabricated queries is one click from a permanent write.
- When the source is a sample provider, return an empty term list, because an empty
  result cannot overwrite real stored rows.
- When the store receives an empty list, keep the last good rows, because "no terms
  this sync" and "no terms exist" are different and the first must not erase the
  second.
- When a demonstration surface shows term moves, render them from a static fixture
  with no apply path, because a demonstration with a working button is a live tool
  on fake data.
- When a read is partial, mine the real part and say it was partial, because the
  visible tail of a real account is still real.

## When NOT to use

- The rule does not forbid **testing** the recommender on fixtures; a property test
  over random rows is exactly how the invariant is pinned. It forbids fixtures
  reaching the store or the approval surface of a tenant.
- It does not forbid **showing** illustrative recommendations; it forbids them being
  applicable.
- It does not apply to **read-only analysis** a person performs on an export they
  know is a sample; the rule is about a system that can write.
