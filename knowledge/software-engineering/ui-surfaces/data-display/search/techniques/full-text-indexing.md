---
layer: technique
type: technique
subject: search
technique: full-text-indexing
status: forged
laws: [derivation-names-recomputation, gate-sees-target, creation-names-reaper]
shared_with: []
use_when: [deciding whether a corpus needs indexing, choosing what the tokenizer throws away, matches resolving to deleted rows, a text index that benchmarked fast but is slow on ranked, phrase or common-word queries]
---

# Full-text indexing

An index trades write-time work and storage for query-time speed. That trade
is the whole subject: everything else in this technique is either deciding
whether the trade is worth making, deciding what the tokenizer throws away
(because an index is also a *lossy summary*, and what it discards can never be
matched), or keeping the derived artifact honest against the source of truth
it summarizes.

## Index or scan

A linear scan — walk the rows, substring-match each — is not a failure of
sophistication; below certain thresholds it is the correct engineering. The
decision has five inputs:

- **Corpus size.** A scan's query cost grows with the corpus; an index's
  query cost grows roughly with the result set. Personal-tool corpora in the
  thousands of short records scan in well under the perception budget;
  archives in the hundreds of thousands of documents do not.
- **Query frequency.** As-you-type search multiplies query volume by the
  length of every query typed. A scan that is fine for a submit-button search
  can saturate under per-keystroke issuance.
- **Match semantics.** A scan gives substring matching and nothing else. The
  moment the product needs word-boundary matching, multi-term queries with
  independent term positions, relevance ranking, or phrase search, the index
  is buying capability, not just speed.
- **The scope the query cannot escape.** Most application search runs inside a
  mandatory predicate — a tenant, an owner, a workspace — that no user can
  widen. The corpus the decision is about is that *partition*, not the whole
  collection: a million-row store searched only ever inside one account of two
  thousand is a two-thousand-row scan, and the structure that makes it so is
  the ordinary equality index on the scope column, not a text index at all.
  Size the decision on the partition, and record which index is bounding the
  scan — because the day the partition stops bounding it (a cross-tenant
  administrative view, a global search box, a report that spans accounts) the
  engine choice has silently changed underneath a query nobody edited.
- **Portability of the capability.** Text indexing is the least portable thing
  most stores offer: its syntax, its analyzers and its operator classes differ
  where plain predicates do not. Where a schema is deliberately written to run
  on more than one store — or to survive a migration to one — adopting a text
  index is a portability decision before it is a performance one, and the scan
  may be the only engine both ends agree on. Say which reason applies where the
  decision is recorded: a scan chosen for portability and a scan chosen out of
  neglect are the same code and age completely differently.

The honest failure mode runs in both directions: indexing a corpus of two
hundred names is complexity with no payer, and scanning a million-row archive
is a latency cliff scheduled for the customer who succeeds hardest.

## The index is only as fast as what the query makes it visit

"An index's query cost grows roughly with the result set" is true only when
*result set* means everything the engine must touch, and the common query
shapes make that set far larger than what the user sees:

- **A ranked page visits every match.** The best ten of a hundred thousand
  matches cost scoring and ordering a hundred thousand, unless the index can
  bound scores and stop early — a property of the index structure, not of
  having one. Over 200,000 documents on one embedded engine, ranking roughly
  halved the index's advantage over a scan at every match fraction: 21× when
  counting a query that matched 2% of the corpus, 9× when ranking it.
- **A phrase visits its words' conjunction.** Positions are checked after the
  postings narrow to documents holding every word, so a phrase of two common
  words costs what their conjunction costs, however rarely they sit adjacent.
  In the same measurement a phrase matching 1.4% of the corpus ran no faster
  than the scan, because its two words co-occurred in half of it.
- **A disjunction of common terms visits nearly everything.** One frequent
  term puts the union near the whole corpus, and there the index buys nothing:
  about 1× once a quarter of the corpus matched, with the planner falling back
  to the scan on its own.
- **An exact count can visit every match too.** Unless the engine answers from
  per-term counts or from its own structure alone, counting pays the same visit
  — and any per-row visibility check — that returning the rows would.

So index-or-scan is not decided once for "text search". It is decided per
**result contract** — a ranked page, an exhaustive set, an exact count — and
per query shape, at the match fractions the product's real queries reach. A
benchmark over rare single terms measures the best end of the curve: the same
engine and corpus that showed 150–234× at zero matches showed 1× at a quarter
matched, and a vendor measurement at 150 million documents put an index
without score pruning at under one ranked query a second, with a p99 near five
minutes and disjunctions exhausting memory. Before committing a large corpus
to an engine, time a sample of the real query mix — the common-word, phrase
and ranked shapes included — at the real corpus size, on both arms, and check
that both arms return the same rows. Where ranked search over common terms is
the product, what is needed is an index that prunes by score bound or counts
from its own structure: a capability decision like the others above, not a
tuning one.

## Tokenization: the decisions that cannot be unmade at query time

An index stores tokens, and only tokens can be matched. Every tokenizer
decision is therefore a *product* decision about what users can find:

- **Word splitting.** Whitespace and punctuation boundaries are the easy
  part; the hard cases are identifiers — compound technical names, dotted
  paths, hyphenated terms — where users expect to search by fragment. If the
  corpus is code-adjacent, decide explicitly whether internal humps and
  separators produce sub-tokens.
- **Case and diacritic folding.** Almost always yes for both: users do not
  reproduce capitalization or accents when searching. Folding at index time
  requires the identical folding at query time — the two sides of the match
  must pass through the same normalization, or the index quietly stops
  matching classes of input.
- **Stemming.** Conflating inflections (run/running/ran) raises recall and
  costs precision, and its worth is corpus-dependent: high for prose,
  negative for identifiers and codes where "runner" and "run" are different
  things. If stemming is on, excerpt highlighting must be stem-aware or the
  marks will not line up with the matched words.
- **Prefix support.** As-you-type search matches half-typed words, which
  requires prefix-capable indexing (or an explicit prefix rung in the query
  ladder). Retrofitting prefix support usually means reindexing — decide
  before the corpus is large.

Because these choices are baked into the stored tokens, **changing any of them
means rebuilding the index**. That is the segue to maintenance.

## The index is a derivation — name its recomputation

An index is a stored derived value, and the derivation-names-recomputation law
applies with full force: there must be a documented, invokable path that
rebuilds the index from the source of truth, and it must be cheap enough to
actually run. The rebuild is not an emergency procedure — it is the arbiter
every drift dispute appeals to, the migration path every tokenizer change
requires, and the recovery path for every corruption. An index without a
rebuild path is a cache with no eviction story wearing a database's clothes.

Ongoing maintenance picks one of three postures:

- **Synchronous with the write.** Every insert, update, and delete on the
  source updates the index in the same transaction. Zero staleness; write
  cost on every mutation; the strongly preferred posture when source and
  index live in the same store, because the transaction boundary makes drift
  structurally impossible rather than operationally unlikely.
- **Asynchronous queue.** Mutations enqueue index work applied with a lag.
  Buys write throughput; costs staleness the surface must disclose (a created
  record that isn't findable yet is a bug report waiting to be typed), and
  requires the queue itself to be drainable, monitorable, and idempotent.
- **Periodic rebuild.** The index is recomputed wholesale on a schedule.
  Simplest to reason about, staleest in steady state; appropriate for
  slow-moving corpora and for indexes that are advisory rather than
  authoritative.

The postures compose: the strongest arrangement seen in practice is
synchronous maintenance *plus* a cheap startup reconciliation — count the
source, count the index, and invoke the rebuild only when they disagree. The
synchronous path keeps steady state exact; the reconciliation catches the
histories the triggers never saw (rows written before the index existed,
maintenance hooks dropped by a migration) — and the comparison is *not equal*,
not *less than*, because an index carrying entries for deleted rows is the
same drift wearing the other sign.

## The index is a proxy — searching it is not searching the data

The gate-sees-target law names the standing risk: a query answered from the
index is answered from a *proxy*, and it is correct exactly as long as the
proxy tracks the target. Design consequences:

- **Deletions must reach the index.** A tombstoned or hard-deleted source row
  whose tokens linger produces ghost results — matches that resolve to
  nothing. Whatever creates index entries names what removes them
  (creation-names-reaper); "the index only ever grows" is a leak with a
  search box in front of it.
- **Join back to the source for presentation.** Store the searchable text in
  the index but treat the source row as authoritative for everything shown —
  titles, statuses, permissions. An index that answers presentation questions
  is a second authority for vocabularies it doesn't own.
- **Verify reachability, not just presence.** Access control evaluated at
  index time is stale the moment permissions change; evaluate visibility
  against current rules when results are served, or accept and document the
  disclosure risk.
- **Measure the index through its own storage.** Index designs that store
  only tokens and answer non-search reads by delegating to the source table
  have a trap: counting the index through its query interface counts the
  *source*, so a drift check built that way compares the source against
  itself and can never fire. A health check on a derived artifact must read
  the artifact's own storage — the gate must see its target, not a view that
  silently answers from the thing being checked against.

## Scope is part of the schema

Decide — and record — which fields of which entities are indexed, with what
weight. This is the "what was searched" contract the parent surface must be
able to state. Adding a field to the index later is a rebuild; more
importantly, it is a *change in what "no results" means*, which is a
user-facing semantic shift, not an internal optimization.
