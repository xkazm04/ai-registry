---
layer: technique
type: technique
subject: docs-content-model
technique: catalog-referential-invariants
status: forged
laws: [gate-sees-target, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [splitting topic metadata from topic prose, a listed page 404s in production, writing the check that guards a docs catalog]
---

# Catalog referential invariants

Splitting a documentation catalog into a metadata table and a body map is what
makes the model affordable, and it is also what makes a page able to be
advertised without existing. The invariants are the other half of that trade,
and they are not optional decoration on it — a catalog with the split and
without the assertions is strictly worse than the directory of files it
replaced, because the directory could not lie about which pages it had.

## The four assertions

State them as a bijection plus a foreign key plus uniqueness, because that is
what they are:

1. **Every topic record resolves to a body.** The missing direction. Its
   symptom is an advertised page that 404s.
2. **Every body is claimed by a record.** The orphan direction. Its symptom is
   unreachable prose and, later, a second copy of a page nobody knew existed.
3. **Every topic's category exists.** The foreign key. Its symptom is a topic
   that vanishes from navigation — grouping by an unknown key drops the row —
   while remaining live at its own address, which reads to the author as "the
   sidebar is broken."
4. **No id appears twice**, in either table. Ids address bodies, form URLs,
   key the search index and anchor inbound product links, so they are minted
   once and carried
   ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
   A duplicate is not a validation nicety; it is two pages sharing an address,
   and whichever one loses is deleted from the product without being deleted.

Categories get the same treatment as topics: a category with no introductory
body is the same defect one layer up, and it is more visible, because the
section landing page is where readers arrive.

## Two enforcement tiers, and the split is forced

**At load.** The catalog module asserts on evaluation and throws. This is the
tier that cannot be routed around: every consumer that imports the catalog
pays for the assertion, so the failure appears in the build, in the test run
and in the local server on the first render, without anyone having remembered
to wire a check. Keep this tier cheap — identity and the category foreign key,
no filesystem, no network — because it runs everywhere the catalog is
imported.

**As a standalone check.** A script the gate runs, which walks the same
registries the application walks and reports **every** break in one pass.

The ergonomic argument for the second tier is real — the load-time throw stops
at the first failure, and an author who renamed a category wants all fourteen
orphaned topics in one list, not fourteen consecutive builds — but it is not
the load-bearing one. The load-bearing one is that **the bijection cannot be
asserted at load at all.** The bodies are behind lazy loading; that is the
entire point of separating them from the records. An assertion that resolves
every body module to check the mapping has eagerly imported the whole corpus
into every consumer that touches the catalog, which is precisely the cost the
split exists to avoid. So the tiers divide by what is cheaply reachable: the
eager side (ids, categories, uniqueness) throws at load, and the record↔body
bijection — the assertion that matters most — can only live in a pass that is
allowed to read everything because it renders nothing.

Where you can, make an assertion unnecessary instead of running it. A body map
*derived* from the category table, rather than written by hand, means a
category cannot exist without a body module being wired for it — the missing
module becomes a resolution failure at the derivation instead of a finding in
a report. Prefer that shape wherever the toolchain can still see through it;
keep the assertion for the cases it cannot.

The standalone check reads the real registries — the same modules the pages
import — and not a build manifest, a routing table or a rendered output
listing ([gate-sees-target](../../../../_laws.md#gate-sees-target)). Every
proxy for the catalog is a thing that was correct when the catalog was
correct, which is not the state the check exists to detect.

## The check must fail when it cannot run

An integrity checker that finds nothing and an integrity checker that read
nothing produce the same output unless you make them different
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The failure shapes are specific and all of them have happened: the parser that
extracts record ids silently matches zero entries after a formatting change;
the module map is imported from a moved location and resolves to an empty
object; a glob picks up no files. Each yields a clean, fast, green run over
nothing.

So assert the instrument before reporting the result: a floor on the number of
categories, a floor on the number of topics, a floor on the number of body
keys, each failing loudly if the walk came back below it. The floors do not
need to be tight — anything above zero and below the current count catches the
whole class — and they must be checked *before* the integrity comparison, so
the message says "read nothing," not "everything is fine."

## Write the failure message for the reviewer, not the parser

This is the part teams skip and the part that decides whether the check works
socially. Compare:

> `missing content for topic "webhook-retries"`

against

> `topic "webhook-retries" is listed in the catalog with no body module: the
> page would 404 while its metadata, the sidebar and search all keep
> advertising it`

The first states an absence and invites a triage conversation about whether it
matters. The second states a consequence and ends one. A referential check
fires rarely, usually during a rename, usually to someone who did not write
the check and has no context for what a "body module" is — the message is the
entire user interface of the mechanism, and its job is to name the consumers
that will keep pointing at the dead page.

The orphan direction needs the same care with the opposite emphasis, because
its consequence is not user-visible: say that the body is unreachable, name
the id it was registered under, and say which of the two repairs is intended —
restore the record or delete the body. An orphan message that only reports the
mismatch gets resolved by deleting whichever side is easier to delete.

## Where this stops

These invariants are structural: they assert that the graph closes. They say
nothing about whether a body is any good, whether a summary matches its prose,
or whether the topic is still true — the last of which is
[per-topic-freshness-metadata](./per-topic-freshness-metadata.md)'s fields and
a stewardship gate's question, not this check's. Do not let the referential
check grow content heuristics: it is the one check in the surface that is
completely deterministic and never wrong, and that property is worth more than
the extra findings.

Nor does it validate ordering, visibility or navigation shape. A projection
over a catalog that satisfies these four assertions cannot dangle; that is
precisely why the projections are allowed to be simple
([derived-navigation-projection](./derived-navigation-projection.md)).
