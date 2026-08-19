---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: civic-entity-ontology
status: forged
laws: [one-definition-one-import, incident-anchored-doctrine]
shared_with: []
use_when: [choosing node and edge types for a civic graph, adding a relationship kind mid-project, keying entities to registries]
---

# Civic entity ontology

The concern: decide what the graph is allowed to contain — which kinds of thing
are nodes, which kinds of assertion are edges, how each is identified — and keep
that decision enforceable while it grows. An ontology that lives only in
documentation is a suggestion; an ontology that lives in three places is a
future contradiction. The standard is one machine-enforced definition, one
human-facing catalog, and a deliberate amendment ritual between them.

## Small and closed beats large and open

Mature investigative-graph practice converges on a compact vocabulary — tens of
entity types, not hundreds — because every type is a promise: a promise that
writers can populate it, validators can check it, and views can render it. Start
from the civic core and add only under pressure:

- **Actors** — person, party or faction, institution or organ (chamber,
  committee, ministry), and analytical groupings (a voting bloc, a theme) when
  the analysis mints them.
- **Economic entities** — company, public contract, subsidy or grant.
- **Normative entities** — bill, enacted law, official notice or filing.

Edges are typed by the *assertion they make*, not by the tables they join:
membership and affiliation, sponsorship and rapporteurship, ownership and
supply, amendment and citation, and the sensitive person-to-firm tie. A
relation whose semantics you cannot state in one sentence ("src supplies goods
under dst", "src holds a registered stake in dst, dated") is not ready to
exist. Where an assertion is inherently temporal — a stake, a role, a mandate —
the edge carries validity dates as first-class properties; investigative
ontologies treat time-bounded relationships as the norm, not an annotation.

## Identity comes from registries

Each node kind declares its id scheme once, and the scheme embeds the issuing
namespace: `person:<roster-id>`, `company:<register-number>`,
`contract:<registry-id>`, `law:<official-citation>`. Three rules:

- **The registry key is the node id.** Names, however cleaned, are display
  strings. Two sources meet at a node only by resolving to the same registry
  identifier; a source that offers no identifier produces a lead, not a node.
- **One entity, one node.** When the same real-world entity carries ids in two
  registries, pick one as canonical at ontology level and store the other as a
  property — do not let two writers mint two nodes and hope a later pass merges
  them. Re-pointing edges after the fact is expensive and error-prone; it is a
  cleanup pass with its own audit trail, not a routine.
- **An id that stops resolving is an annotation, not a deletion.** A firm
  dissolved or merged out of the register keeps its node, gains an explicit
  extinction annotation (what was checked, when, what it merged into), and is
  barred from being presented as registry-verified. Its edges are history.

## One definition, imported everywhere

The enforceable form of the ontology is a closed enum set — the node kinds and
edge relations as constants — defined in exactly one module and imported by
every writer, every validation gate, and every view. The gate rejects any
proposal using a kind or relation outside the set, which makes the ontology a
physical constraint rather than a convention. Per
[one-definition-one-import](../../_laws.md#one-definition-one-import), a second
copy of the list — in a validator, in a prompt, in a chart legend — will drift,
and in this domain drift means a category of claim silently escaping its checks.

Beside the enum lives the **catalog**: a living document with one row per kind
and per relation — id scheme, population count and the pass that populated it,
derivation method, and honest caveats ("this relation undercounts omnibus
amendments; the corrected census is held pending a dependency"). The enum
enforces; the catalog explains; the two are kept in sync by review, and the
catalog is where a reader goes to disagree with the method.

## Growth is amendment, not accretion

New kinds arrive when a new source or a new question demands them. The ritual:

1. State the assertion the new relation makes, its endpoint kinds, its id
   scheme (for a node) or its property contract (for an edge).
2. Amend the single definition, annotating the amendment with which pass or
   batch introduced it and why — per
   [incident-anchored-doctrine](../../_laws.md#incident-anchored-doctrine), a
   vocabulary entry that remembers its origin resists being repurposed for a
   subtly different assertion later.
3. Add the catalog row in the same change, caveats included.
4. Only then write data.

Resist two temptations symmetrically. Do not overload an existing relation
because adding one is ceremony — "sponsors" and "did the analytical work on"
are different assertions, and a reader who cannot tell them apart has been
misled. And do not mint a relation per data source — if two registries assert
the same thing, they populate the same relation and differ in provenance.

## When not to reach for ontology

Not every attribute is a node. A quantity computed *about* an entity (a
discipline rate, a contribution score) is a node property with provenance, not
an edge to a synthetic "score" entity. Reify into a node only what has identity
of its own — something two independent sources could refer to. An ontology
inflated with reified metrics doubles its surface and halves its checkability.
