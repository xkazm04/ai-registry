---
layer: golden-path
type: golden-path
subject: civic-knowledge-graphs
status: forged
use_when: [modeling officials, firms, contracts and laws as a graph, answering "how is A connected to B" from public data, designing provenance for a derived civic dataset, adding a new relationship kind to an accountability graph]
techniques:
  - civic-entity-ontology
  - per-claim-provenance-stamping
  - pass-based-incremental-enrichment
  - destructive-rebuild-guard
  - evidence-path-finding
  - forensic-view-filtering
---

# Civic knowledge graphs

A civic knowledge graph models the actors of public life — officials, parties,
institutions, firms, contracts, bills, laws — as typed nodes, and the assertions
that connect them as typed edges, so that the question "how is A connected to B"
can be answered *checkably*: with a path whose every hop names its source, its
derivation, and its review status. The word doing the work is **checkably**. Any
graph library can return a path; only a graph whose every claim carries its own
provenance can return a path a reader is entitled to repeat in public.

That last clause is what separates this subject from generic graph engineering.
The nodes are real people and real firms; an edge is an allegation the moment it
renders. A wrong join in a product-recommendation graph mis-sells a gadget; a
wrong join here attaches a public contract to the wrong person. The entire
discipline follows from taking that asymmetry seriously: the graph is not a
search index over public data, it is a **ledger of claims**, and every design
decision — the ontology, the write path, the traversal, the display — is a
decision about what the system is willing to assert.

## Things, not strings

The naive reading builds the graph by indexing documents and linking mentions.
It fails on contact with reality, because public-data text is a swamp of
homonyms: common surnames shared by thousands, firm names that differ by a
legal-form suffix, transliteration and abbreviation variants. The principal
reading — well established in investigative-graph practice — is that the graph
holds **entities, not mentions**: a node exists only under a durable identity,
and the identity comes from the registries, not from the text. A person is keyed
by their identifier in the primary roster that seats them; a firm by its
company-register number; a contract by the registry's contract id; a statute by
its official citation. Name similarity is never an edge. Where a source offers
only a name, the match it suggests is a *lead* for a human, and it enters the
graph — if at all — flagged as unverified, not as a fact wearing a fact's
clothes.

The corollary is the **identifier-join contract**: an edge between two entity
spaces (a firm and its contracts, a person and a firm) is legitimate only when
both endpoints resolve through registry identifiers. A record whose counterpart
cannot be resolved is *surfaced as unresolvable and counted* — a dangling
contract is a visible gap in coverage, never a silently invented supplier node
and never a silently dropped row.

## Two kinds of truth in one store

Every claim in the graph is produced by one of two methods, and the method is
part of the claim:

- **Deterministic** — computed by reviewable code from raw registry rows: a
  co-membership, an agreement rate, a sponsorship. Recomputable, exact, and the
  only method allowed to author a number.
- **Proposed** — suggested by an automated analyst (typically a language model
  reading the deterministic layer), admitted only through a validation gate
  that checks the proposal's shape *and its references*: every endpoint it
  names must be an entity that exists, every identifier it cites in prose must
  resolve. A proposal that mentions a person who is not in the store is not a
  creative insight; it is a fabricated politician, and the gate exists to make
  that physically unstorable.

Even a gated proposal is still a machine result — a lead. The graph therefore
carries a third axis on its most sensitive edges: **review state**. An
automated match stays pending until a named human confirms it; confirmation and
rejection are decisions with an audit trail of their own, written through one
append-only door. The store thus distinguishes, per claim, *how it was made*
(deterministic vs proposed), *from what* (the source reference), and *who
stands behind it* (machine so far, or a human reviewer). Collapsing any two of
these axes into one flag is where civic graphs quietly become libel engines.

## The graph is grown, not designed once

No upfront ontology survives contact with the source material. New relationship
kinds are *discovered* — a new register becomes available, an investigation
needs a role the schema cannot express — and the ontology must grow to admit
them without destabilizing what exists. The workable posture is a **small,
closed, versioned vocabulary** of node kinds and edge relations, held in exactly
one machine-enforced definition that every writer, validator and view imports,
paired with a living catalog that records, for each kind: its id scheme, which
pass introduced it, how it is derived, and its honest caveats. Growth happens by
deliberate amendment of that one definition — each addition annotated with why
and when — never by a writer inventing a relation inline.

Growth in *content* is likewise incremental: the graph accretes through
numbered enrichment passes, each stamping what it wrote, each merging its
contribution into what earlier passes established rather than replacing it. And
because many independent writers now share one store, the most dangerous
operation in the system is the innocent-looking rebuild: a writer that owns
three edge relations and wipes the whole store destroys every other pass's work
and cannot restore it. Rebuilds are therefore guarded by comparing what the
store *holds* against what the run *emits* — computed, not hardcoded, so a kind
added next month is protected the day it lands.

## Answering "how is A connected to B"

Connection queries are the graph's public face and its easiest way to lie.
Three structural traps:

- **Dense statistical relations are matrices, not networks.** A pairwise
  similarity relation (co-voting, co-attendance) at high coverage approaches
  the complete graph; any path through it is two hops long and says nothing.
  Such relations are analytical products to *display*, and must be excluded
  from evidential traversal.
- **Hub nodes connect everyone.** Every member relates to their party and to
  the large chambers; paths routed through the biggest institutions prove only
  that both endpoints are in public life. Traversal must price hubs — passing
  *through* a high-degree node costs more than passing through a specific one —
  while never penalizing a hub that is itself an endpoint of the question.
- **Ranking is an editorial act, so it must be a printed rule.** Among
  equally short paths, which one leads? The tie-break order (fewer unverified
  hops first, then stronger documented value, then a deterministic final key)
  is part of the answer and is shown to the reader, and the result is
  independent of input ordering — determinism as a property, not a promise.

The result of a path query is itself a claim, so it inherits the claim
discipline: each hop shows its relation, its review state, and its source; the
enumeration states whether it was capped; and "no path within the limit" is an
honest answer, distinct from "no path".

## Show less by default, never less than asked

The reading surface defaults to the human-verified layer: unverified machine
matches are hidden from the ambient landscape, and the display *says how many
it hid* — a suppressed count is disclosure; a silent one is deception. But the
filter has a hard exception: when the reader explicitly requests a derived
answer — a computed path, a curated trail — every hop of that answer renders,
pending ones visibly marked, because a requested answer with omitted steps is a
lie. And any count describing an entity's record is computed from the
unfiltered store: the tooltip tells the truth about the record, not about the
current view.

## Failure modes this standard exists to prevent

- **The mention graph** — string-matched entities, name-similarity edges;
  homonyms convert an innocent namesake into a suspect.
- **The confident lead** — machine matches rendered indistinguishably from
  human-verified facts; the graph's strongest claims and weakest guesses in the
  same ink.
- **The everything-path** — traversal over dense relations and unpriced hubs;
  every A connects to every B in two meaningless steps.
- **The last writer wins** — a pass replacing node properties wholesale,
  deleting every other pass's enrichment without an error.
- **The routine wipe** — a rebuild documented as maintenance that destroys the
  accreted majority of the graph it cannot regenerate.
- **The unaccountable verdict** — review decisions overwriting each other with
  no audit trail, or a rejected match re-surfacing forever because rejection
  was not a terminal state.

## The techniques

- [civic-entity-ontology](techniques/civic-entity-ontology.md) — the closed,
  versioned vocabulary of node kinds and edge relations, its id schemes, and
  how it grows.
- [per-claim-provenance-stamping](techniques/per-claim-provenance-stamping.md)
  — method, pass, source reference and review state on every node and edge.
- [pass-based-incremental-enrichment](techniques/pass-based-incremental-enrichment.md)
  — numbered passes, read-merge property writes, and the stale-prop honest
  limit.
- [destructive-rebuild-guard](techniques/destructive-rebuild-guard.md) —
  refusing a reset that would destroy claims the run cannot re-emit, computed
  from the store, overridable only explicitly.
- [evidence-path-finding](techniques/evidence-path-finding.md) — shortest
  documented connection under excluded relations, hub pricing, and a printed
  tie-break rule.
- [forensic-view-filtering](techniques/forensic-view-filtering.md) —
  verified-by-default display, counted suppression, and the requested-answer
  exception.
