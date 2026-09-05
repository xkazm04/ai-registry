---
layer: technique
type: technique
subject: markdown-vault
technique: link-graph-extraction
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [features disagree about which links are broken, deciding when a cached graph must be rebuilt, two dashboards report different orphan counts]
---

# Link graph extraction

Inline references between notes — the double-bracket link a human types
while writing — are the vault's relational layer. Extracting them into an
explicit structure (edges, a backlink index, per-note degree) turns prose
into a graph the application can navigate, rank, and audit. The technique is
one part parsing and three parts discipline about what the parsed result
*is*: a derived view of a store other programs mutate.

## One extractor, one resolution semantics

A raw link carries decorations: an alias (display text that differs from
the target), a section fragment (a pointer into the target's headings), an
embed marker. Extraction and normalization — pull the payload, strip alias
then section, trim, case-fold — look trivial, which is exactly why every
feature that needs links grows its own copy, and the copies drift.

The drift is not cosmetic. Link resolution is a **vocabulary** in the
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
sense: the linter's definition of "resolves", the navigation's definition,
and the graph view's definition must be the same definition, or the system
disagrees with itself about which links are broken — the integrity report
flags a link the navigation happily follows, and trust in both dies. One
shared extractor and one shared normalizer, consumed by every feature, is
the structural fix; when consumers genuinely need different slices (per-line
extraction for line-number reporting, whole-body extraction for a target
set), they share the core scan and differ only in how they feed it.

## Locate by structure, decompose by pattern

Where the extractor gets its candidates is a design decision, not an
implementation detail, and the cheap answer is wrong. Scanning raw text for the
link syntax finds every link — and also every link-shaped string inside a fenced
code block, an inline code span, or a commented-out region. Those are not edges.
A store whose notes document the link syntax, or quote a broken link while
discussing it, generates broken-reference findings its author cannot clear
without editing correct prose, and a linter that cries wolf on prose is a linter
people switch off.

The structural fix is to **locate links by parsing the document and decompose
them by pattern**: walk the parsed structure and take only the nodes the format
itself classifies as links, then apply the alias/section/target decomposition to
text already certified as a link. This deletes the false-positive class instead
of chasing it with exclusion patterns, and it is where the two approaches stop
being equivalent-but-different — an exclusion list bolted onto a scanner grows
one entry per syntax anyone writes about, forever.

Coverage is the other half. A store carries more than one way to point at a
note: a wiki-style reference, the format's own inline link, an embed, a
reference-style link resolved through a definition elsewhere in the document, a
pointer at a heading or a block inside a target. Some conventions also treat
links written in a record's metadata block as real edges rather than as fields.
Every syntax the extractor does not read is an edge missing from the graph, so
**which syntaxes count as edges is part of the predicate** every number below
carries — and it belongs in the count's declaration, not buried in the
extractor.

## Identifiers are path suffixes

Resolution follows the human's authoring convention, and that convention is
almost never "the basename". A writer types the shortest thing that is
unambiguous — a bare title when only one note has it, a folder-qualified
fragment when two do. The general model is therefore a **path suffix**: an
identifier matches any note whose path ends with it, and a bare title is the
one-segment case, not the scheme. The index that supports this is a suffix
index, and it has an inverse the basename model cannot express — given a note,
compute the *shortest suffix that identifies it uniquely*. That inverse is the
text a link-writing affordance should insert, and the text a rename must rewrite
referring links to; its absence is a good sign the resolution model was never
made explicit.

Two rules ride along and are worth declaring rather than discovering: a link
naming a directory resolves to that directory's index note under a stated
precedence when several candidates qualify; and a store with more than one root
resolves a root-relative identifier against those roots in a stated order.

**Normalization is a pipeline, not a case-fold.** Comparing an identifier to a
path takes three steps, and the first is the one everyone omits — canonical
Unicode normalization, because filesystems and editors disagree about whether an
accented character is one code point or two, and a byte comparison of two
visually identical strings then fails. Then case folding: the locale-independent
operation, not the locale-sensitive lowercase that the convenient string method
usually gives you and that remaps certain letters under a user's regional
settings. Then whitespace and separator collapse. A resolver that case-folds and
stops works on the corpus its author tested and fails on the one their colleague
types in another language.

**Ambiguity is data; collapse it last.** Duplicate identifiers across folders are
not an edge case, and "the resolver picks a deterministic winner" describes only
the final step. The lookup should *return the candidate set*, narrow it by the
sharper rules available — exact case before folded case, nearer path before
farther — and order it deterministically; only the single-answer entry point
takes the head. Everything below then gets what it needs: a link-writing
affordance offers both candidates, an integrity pass reports the ambiguity as
its own finding instead of silently resolving it, and no consumer re-derives a
candidate set the resolver already computed and threw away.

## Edges are data in both directions

- **Outgoing links** are cheap: they are literally in the note.
- **Backlinks** — "what points here" — are the inverted index, and they are
  the graph's navigational payoff: the reader standing on a note sees every
  place that cites it, which is how a vault is browsed *against* the grain
  of authorship.
- **Degree is structure.** A note with many outgoing links is functioning as
  a table of contents — a hub worth surfacing as an entry point. A note with
  no incoming links is unreachable *by link navigation* — the orphan signal the
  integrity lint consumes, and only that; the graph is not the only way a store
  is navigated.
- **An unresolved target is a node, not a flagged edge.** A link whose target
  does not exist points at a note somebody intended to write. The weak form
  keeps the edge and marks it broken. The strong form mints the *target* as a
  node in its own namespace, with its own backlinks, participating in the graph
  — which is what lets "three notes are waiting on this page that does not
  exist" be a query rather than a report, and lets the missing note be reaped
  the moment its last referrer stops pointing at it. Same data, two consumers,
  one predicate each: the lint reads a broken reference, the authoring surface
  reads an invitation with a backlink count attached.

## The graph is a derivation, and it says so

The extracted graph is a cached computation over files a human edits in
another program. Per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation),
it must name how it is rebuilt — a fresh walk and re-extraction — and be
honest about staleness in between. Two invalidation mechanisms, layered on
purpose:

- **Event-driven:** a filesystem watcher drops the cache the moment a note
  changes. Precise, but only alive while the watcher runs.
- **Time-bounded:** a short TTL caps how stale the cache can be when changes
  happened while nobody was watching.

Neither alone is sufficient — the watcher misses edits made while the
application was closed; the TTL alone makes every read a coin-flip on
freshness. Together they bound staleness from both sides. And the cache is
an *optimization* of the walk, never a second authority: any consumer that
cannot tolerate the staleness bound recomputes.

## Maintaining the graph in place has a fan-out a rebuild hides

Drop-and-rebuild is one strategy; applying each change as a diff is the other,
and it is not the same computation with better constants. Resolution is a
many-to-one function that **cannot be cheaply inverted**, and every incremental
case turns on that:

- A note **appears**, and it may satisfy an identifier that previously resolved
  nowhere. Every note that pointed at that missing target now resolves
  somewhere else — so adding one note invalidates the outgoing links of notes
  that never mentioned it by path. Those referrers are findable only because
  the unresolved target was kept as a node with backlinks; without that, the
  only correct answer is to re-resolve the whole store.
- A note **disappears**, and the mirror case holds: its former backlinks are
  exactly the set of sources that must be re-resolved, and they now point at a
  target that has to be re-minted as missing.
- A note **changes**, and only its outgoing links move. How *others* resolve to
  it is unaffected, because it existed before and after — the one case where
  the cheap local update is also the correct one.
- A **rename** is the composition of the first two, which is why it is the case
  where hand-written incremental logic is usually first observed to be wrong.

Two obligations follow. First, the incremental path needs an **equivalence
test** against a full rebuild over the same mutation sequence — that is the only
check that catches a missed fan-out, because a missed fan-out produces a graph
that is merely slightly wrong and never throws. Second, and against the general
advice: **a consumer that applies diffs must not debounce.** Debouncing
coalesces a burst into one notification, which is exactly right for a consumer
whose response is to recompute from scratch and exactly wrong for one whose
response is to apply a delta — the events it drops *were* the deltas. Debounce
belongs to recompute consumers; diff consumers take every event and pay for it
with a fast handler.

## Counts over the graph carry their predicate

Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate):
"orphan count" is not one number. Counting notes with zero incoming edges
gives one figure; counting them after exempting deliberate entry points
(indexes, top-level overview notes) gives another. Both are legitimate —
for different consumers — but a dashboard stat and an integrity report that
compute "orphans" with different exemption policies, without saying so, will
eventually be compared to each other, and the discrepancy will be read as a
bug in whichever surface the reader trusts less. Every count that leaves the
graph names its predicate and its exemptions.
