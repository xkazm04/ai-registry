---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: statute-relevance-mapping
status: forged
laws: [one-definition-one-import, provenance-or-nothing]
shared_with: []
use_when:
  - deciding which legislative decisions are relevant to an entity's public money
  - a join needs a decision-to-interest relevance test that survives publication
  - tempted to infer topical relevance case by case or with a model
---

# Statute-relevance mapping

The weakest link in any decision-versus-interest join is the relevance
claim: *this* decision matters to *that* interest. Left to case-by-case
judgment — an analyst's, or worse a model's — the relevance net stretches
exactly when a story is tempting, and every candidate it produces inherits
an unfalsifiable step. The technique replaces judgment with a **fixed,
published table**: each channel through which an entity receives public
money maps to the small set of statutes that govern that channel, and a
decision is relevant to a tie if and only if it amends a statute in the
tie's channels' rows. Nothing else is relevant, by construction.

## The table

The channels are the ones the money layer already measures, and each maps
to the framework laws of that channel — for example:

- **Public contracts** → the procurement statute and the contract-publication
  statute.
- **Subsidies** → the budgetary-rules statute through which grants flow.
- **Political donations** → the party-financing statute.

Rows are statute references with human-readable labels; the *why* (which
channel triggered the row) travels with every emitted statute so a reviewer
sees not just "relevant" but "relevant because this entity holds public
contracts". A tie whose entity shows activity on a channel picks up that
channel's rows; a tie whose entity has no public-money channel at all gets
an empty set and generates no candidates — an entity that takes no public
money has no channel for this conflict shape, whatever else may be true of
it.

Three properties are load-bearing:

- **One definition, imported everywhere.** The table is a single declared
  constant; the join, the review surfaces, and the published methodology
  all read the same rows, per
  [one-definition-one-import](../../_laws.md#one-definition-one-import). A
  restated copy in a rendering layer is a future divergence between what
  the method says and what the method does.
- **Versioned as part of the join rule.** Any change to the table — a row
  added, a condition tightened — bumps a declared rule version that is
  stamped on every candidate set, so two candidate lists derived under
  different tables can never be mistaken for each other, per
  [provenance-or-nothing](../../_laws.md#provenance-or-nothing).
- **Rendered literally on the public surface.** The table itself, not a
  paraphrase, appears in the published methodology block. The reader who
  disputes a candidate should find themselves disputing a row of the table
  — a productive argument — rather than the data.

## What the table deliberately does not claim

The table asserts channel governance, not substantive impact. A decision
amending the procurement statute is *relevant* to every tie whose entity
holds public contracts; whether the specific amendment helps, harms or
ignores that specific entity is precisely the question reserved for human
review. Stating this scope honestly is what lets the table stay small: it
does not need to model what each amendment does, only which channel's
rulebook it touches. The narrowness is a feature twice over — it keeps the
core defensible, and it keeps the candidate volume within human review
capacity.

The complementary honesty is about what the table misses. Sector-specific
statutes (an energy law that decides a supplier's market), tax provisions,
zoning — all can matter enormously to a tied entity and none are in the
core table. That incompleteness is stated in the methodology: the join
finds conflicts on the public-money channels it declares, and silence about
a tie means "no candidate under this table", never "no conflict".

## Decision rules

- **When a new channel enters the money layer** (say, asset sales or
  concessions), it enters the table as a new row set in the same change,
  with a rule-version bump — the table and the money layer's channel
  vocabulary move in lockstep.
- **When tempted to add a statute because of one hot case, refuse**, and
  add it only if it governs the channel for the whole population; a row
  added for one person is a targeted net, and the symmetry of the method is
  worth more than the story.
- **When a decision amends several relevant statutes for the same tie**,
  emit one candidate carrying all matched rows, not one candidate per row —
  the unit of review is the decision-tie pair, and row multiplicity is
  detail within it.
- **When channel activity is measured as zero, emit no rows for that
  channel** — but remember the coverage discipline: a channel never
  ingested is "not measured", not zero, and must not silently read as "no
  relevance".

## When not to use it

The fixed table suits framework-law joins over legislative decisions. It is
the wrong tool for *executive* conflict shapes — an official awarding a
specific contract to a tied firm needs no statute mapping, because the
decision and the interest meet directly in one transaction. It is also not
a substitute for full-text legislative analysis when a specific case is
already under human investigation; at that point the reviewer reads the
amendment itself, and the table's job — bounding machine-generated
insinuation — is done.
