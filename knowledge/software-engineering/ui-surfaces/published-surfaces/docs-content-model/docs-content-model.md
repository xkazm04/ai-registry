---
layer: golden-path
type: golden-path
subject: docs-content-model
status: forged
use_when: [standing up a documentation surface as part of the product, a listed topic 404s while navigation and search still advertise it, choosing between files-on-disk and typed records for a docs corpus, drafts reachable in production by direct link]
techniques:
  - catalog-referential-invariants
  - derived-navigation-projection
  - per-topic-freshness-metadata
  - draft-visibility-gating
  - product-location-mapping
---

# Documentation content model

Most documentation surfaces are built as a directory of files. The path is the
address, the folder is the section, the sidebar is a list somebody types out by
hand, and every relationship in the corpus — which topic belongs to which
section, which section is ordered where, which page a "next" arrow points at —
lives in a build convention that nothing can check. That substrate is fine for
a corpus of notes. It is not fine for a documentation surface that is a
**product surface**: a thing users are sent to from inside the application,
that search engines index, that support links into, and whose broken page is a
broken product.

This subject is the other substrate. Documentation is modelled as a **typed,
layered catalog** — a category record, a topic record, a body module — held in
the application's own module graph and subject to its type system and its
build. Relationships become declarations, so they can be asserted; the
projections consumers need become functions over the catalog instead of
hand-maintained lists; and the metadata a documentation surface has always
wanted and never had a home for — when this was last reviewed, which product
area it describes, whether it is ready to be seen — becomes typed fields on a
record instead of prose somebody hoped another human would read.

The bargain is exact and worth stating first: **you buy checkable integrity and
you pay for it in authoring friction.** An author can no longer publish a page
by adding a file. If that price is wrong for your corpus, the honest answer is
the other substrate, not a half-typed compromise carrying the friction without
the invariants.

## Three layers, and why the split is load-bearing

**A category** is the grouping record — a stable id, a title, a position, its
own introductory body. Categories are few, change rarely, and are the unit the
reader navigates by. **A topic record** is the metadata row: a stable id, its
category, a title, a one-line summary, its position, the terms it should be
findable by, whether it is visible, and the honest-metadata fields this subject
exists to give a home to; it carries no prose beyond the summary. **A body
module** is the prose itself, addressed by the topic's id through a map from id
to module, never by a path convention.

The split between record and body is not tidiness; it is the reason the model
is affordable. Metadata is what almost every consumer needs — navigation, the
category listing, the search index, the machine-readable site inventory, the
previous/next pair, the landing page's counts — and prose is what exactly one
consumer needs, the rendered page. Fuse them and every one of those consumers
drags the whole corpus of prose into its bundle to answer a question about
titles. Keep them apart and the heavy half loads once, when somebody actually
reads a page. Splitting them is also what makes the characteristic failure
possible, so the split arrives with its own invariant or not at all.

## The bijection is the whole bargain

Between the topic table and the body map there must be a bijection: every
record resolves to a body, every body is claimed by a record, no id appears
twice, and every topic names a category that exists. Break the first direction
and you get the defining failure of this subject — **an advertised page that
does not exist**. The topic sits in the sidebar, the summary shows in search,
the sitemap lists it, the arrows route through it, and the page is a 404.
Nothing degraded; every consumer is confidently, uniformly wrong. Break the
second and you get its quieter twin: a body nobody can reach, because the
record pointing at it was renamed or removed. It costs nothing at runtime,
which is why it survives for years, and it is the first thing an author trusts
when they go looking for "the page about X" and find two.

Both directions are one assertion, and it lands in two tiers because the model
forces two: the cheap half — ids, uniqueness, the category foreign key — is
evaluated when the catalog is loaded, so every consumer that imports it fails
loudly, while the record↔body half cannot go there at all, since resolving
every body to check the mapping would eagerly pull the whole corpus into every
consumer and undo the split. It goes in a standalone check, which is allowed to
read everything because it renders nothing. The craft that separates a useful
assertion from a decorative one is in its **message**: an error that says a key
is missing states what is absent. An error that says *this topic will 404 while
navigation, search and the machine-readable inventory all keep advertising it*
states what it costs, and the second one gets fixed before the release. That is
[catalog-referential-invariants](./techniques/catalog-referential-invariants.md).

## Everything downstream is a projection

Once the catalog is real data, every derived surface is a function over it and
none of them is a second list. The navigation tree is the catalog grouped by
category and sorted by declared position; the machine-readable site inventory
is the same walk with a different output shape; the previous/next pair is the
same ordering read as a sequence. The landing page's "eleven sections, sixty
topics" is the simplest projection there is — a count — and the one that goes
stale first, because a number typed into a sentence has no relationship to the
thing it counts.

The rule is not "compute it"; everyone agrees with that in the abstract. The
rule is *where* the computation happens and what crosses the boundary. A
projection whose **function** is imported by the reader's browser has imported
the catalog too and saved nothing: the boundary is drawn at the projected
**value**, computed where the catalog already lives and handed across as the
small thing. Draw it wrong and you have the cost of the model with none of its
benefit, invisibly, until somebody measures what shipped
([derived-navigation-projection](./techniques/derived-navigation-projection.md)).

## Visibility is a predicate, not a filter

A catalog that can hold an unfinished topic needs one function answering
whether a record may be seen, driven by a build-time flag, and **every**
consumer must pass through it. The naive implementation filters the sidebar,
because the sidebar is where the author noticed the draft. It ships anyway: in
the site inventory, so a crawler finds it; reachable by direct link, because a
route resolving a single record does not enumerate and nobody counted it as a
consumer; and in the previous/next sequence, so its published neighbour's arrow
walks into a page that should not exist. The consumer missed longest is not
even on this surface — a link authored inside the product, pointing at a topic
by hand, shipping as a button that leads nowhere. One predicate, applied at
every door and enumerated where it is defined, is the only shape that survives
the next consumer somebody adds; and it stays one predicate only if the second,
orthogonal axis a mature catalog grows — *which audience a topic is for* —
keeps its own function. Readiness gates the address, audience gates only the
listing, and fusing them 404s a published page for everyone who arrived by link
([draft-visibility-gating](./techniques/draft-visibility-gating.md)).

## The record is where honest metadata finally has a home

Two facts about a topic have never had anywhere to live in a file-per-page
corpus, and both go on the record.

The first is **freshness**: when a human last reviewed this, which version of
the described thing it was checked against, which parts of the product it
makes claims about. Typed optional fields — and what makes them worth having
is that **absence is given a meaning**. An empty optional field is ambiguous by
construction: "not yet filled in" and "nothing here to fill in" are the same
bytes. Declare which, on the field, in the type — a topic naming no watched
sources is *intentionally conceptual*, not overlooked — because without that
declaration a freshness report folds the unknown into the fresh, and a report
that does that is flattering rather than honest
([per-topic-freshness-metadata](./techniques/per-topic-freshness-metadata.md)).

The second is **location in the product**. Documentation is a standing claim
about a product's shape, and prose claims do not break when the product is
rearranged. Typing the coarse handle — the area or module, from a declared
vocabulary — turns a rename into a type error on the documentation side; and
where the product is a different artifact than its documentation, the map names
the other side's authority explicitly, because a cross-artifact coupling's only
enforcement is a human habit and a habit needs an address
([product-location-mapping](./techniques/product-location-mapping.md)).

## Where this subject's walls sit

Three neighbours border this ground and each seam is a substantive one.

The first is the knowledge-vault subject, which owns documentation as **files
on disk** — records as files, frontmatter as schema, the directory walk as the
query, integrity as a lint over a store other programs mutate. That is the
opposite substrate choice, and the substrate is exactly the seam. When the
corpus is files a human opens in their own editor, the human is a peer writer
who wins ties, the schema is advisory because no engine rejects a malformed
row, and integrity has to be recovered after the fact by walking and linting.
When the corpus is records inside the application's own module graph, the walk
is replaced by a type error, nothing is advisory, and the human stops being a
peer writer — they become a contributor who goes through the build like anyone
else. Pick by who authors and how often.

The second is the docs-synchronization subject, which owns keeping prose in
step with code: the declared coupling between source areas and prose targets,
enforcement at the change boundary, rot scanning, dated corrections, bounded
catch-up. Drift *detection* is theirs entirely — including the harder
cross-artifact case, where a topic declares the sources it describes and a gate
interrogates the other side's history since the review date. This subject does
not own that gate and must not restate it. It owns the **shape of the fields
such a gate reads**: that review date, checked-against version and watched
sources are typed optional fields on the record rather than prose, and what
their absence is declared to mean. Putting a field on a record is a
content-model decision; querying it is a stewardship one.

The third is the search subject, which owns the index over this catalog and
everything after a user types: parsing, ranking, excerpts, truncation honesty.
This subject owns only what the catalog hands it — a topic's searchable terms
as a declared field, and the visibility predicate the indexer must respect. A
search surface that indexes a draft is not a search defect; it is a consumer
that skipped the door.

## The cost, stated plainly, and when to refuse it

Adding a topic means editing a record table, adding a body module, registering
it in the map, and shipping a build. Four consequences follow, and a team that
pretends otherwise adopts this model and then resents it:

- **Authors must be able to change code.** A corpus written mainly by people
  who cannot is the wrong corpus for this model — and do not solve it with an
  editing tool that writes into the record table, which is a content management
  system with none of the safety and all of the build.
- **Documentation deploys with the application.** A typo fix waits for the
  pipeline. If per-page publishing cadence matters, this substrate is wrong.
- **The record table is a merge-conflict funnel.** Every author edits one file.
  Past roughly a hundred topics, shard it by category and keep the shards'
  union as the only public accessor, so the hot file cools without the catalog
  gaining a second authority.
- **The prose does not have to become code.** Bodies can stay authored prose
  the build imports; what is typed is the *record*. The model refuses
  relationships that live only in a path convention — not prose.

## Failure modes this standard exists to prevent

- **The advertised 404** — a topic in navigation, search and the site
  inventory with no body behind it; its quiet twin, **the orphan body**, is
  prose no record claims.
- **The second list** — a hand-maintained navigation array drifting from the
  catalog one forgotten entry at a time; **the typed count** is the same defect
  inside a sentence.
- **The leaked draft** — filtered from the sidebar, present in the inventory,
  reachable by link, and pointed at by its published neighbour's arrow.
- **The dead help link** — a hand-authored reference from inside the product
  into a renamed, recategorized or unpublished topic, which nothing on the
  documentation side can test.
- **The fused axes** — an audience filter routed through the readiness
  predicate, so a published topic 404s for everyone who arrives by link.
- **The undatable article** — nothing records when a human last checked this,
  so every topic is equally trustworthy and equally suspect.
- **The ambiguous blank** — an empty optional field read as coverage, turning
  the model's blind spot into a health claim.
- **The projection that saved nothing** — the derivation function imported by
  the client, dragging the catalog across with it.

## The techniques

- [catalog-referential-invariants](./techniques/catalog-referential-invariants.md) —
  the bijection, the foreign key, id uniqueness; two forced tiers; instrument
  floors; failure text that names the consumers, not the key.
- [derived-navigation-projection](./techniques/derived-navigation-projection.md) —
  navigation, sequences, inventories and counts as functions over the catalog;
  ordering as declared data; the boundary at the projected value.
- [per-topic-freshness-metadata](./techniques/per-topic-freshness-metadata.md) —
  review date, checked-against version and watched sources as typed optional
  fields; absence with a declared meaning; coarse watch sets; backfills that
  must not overwrite earned values.
- [draft-visibility-gating](./techniques/draft-visibility-gating.md) — one
  predicate over the record and a build-time flag; the enumerated consumers,
  inbound links included; sequences over the visible set; readiness and
  audience as separate axes.
- [product-location-mapping](./techniques/product-location-mapping.md) — the
  described feature's location as typed data; coarse handles typed, fine
  handles prose; the other side's authority named where the type cannot reach.
