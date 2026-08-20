---
layer: application
type: application
subject: knowledge-registry
technique: deterministic-seeding
stack: node
---

# Seeding a registry into somebody else's repository, twice

A fleet-management service (`C:\Users\kazda\kiro\ascent`) creates registries it
does not own: it opens one draft pull request that seeds the layout into a
customer repository, and a human merging that request is the act of adoption.
Because the request stays open while people ask what it is for, the seeding is
re-run against it. This is the technique implemented almost in full, with the
determinism written down as a contract rather than left as a property.

## Determinism as a stated contract

`src/lib/registry/layout.ts:4-8` says it in the file header, ahead of any code:

> DETERMINISTIC BY CONTRACT: `buildScaffoldFiles` is a pure function of the org
> slug. No timestamps, no uuids, no environment reads — so re-running the
> scaffold produces byte-identical content, which is what makes `openDraftPr`'s
> branch/file reuse an idempotent re-seed instead of a churning diff.

`buildScaffoldFiles` (`layout.ts:115-136`) takes `orgSlug` and nothing else. Its
seven entries are each a pure template of the slug. The pull request is cut on a
fixed branch, `REGISTRY_SCAFFOLD_BRANCH` (`layout.ts:21-22`), commented "stable,
so a re-run updates the same PR".

The generated index is the case where determinism was at risk, and it is handled
the way the technique prescribes: `CATALOG` (`layout.ts:92-104`) seeds the
catalog **empty rather than absent**, and `generatedAt` is typed `string | null`
and seeded `null` (`src/lib/registry/catalog.ts:52-53`, `:83-87` — "a timestamp
would make every re-run a diff"). Present-and-null, not omitted: consumers can
parse the shape before anything has been generated.

## Spine first, and two meanings for a collision

`buildScaffoldFiles` returns files in commit order with `.ascent/registry.yaml`
first (`layout.ts:117-128`), and `layout.ts:108-114` states that the order is
load-bearing. `openScaffoldPr` (`src/lib/registry/scaffold.ts:85-113`) reads the
two collisions apart on exactly that index:

```ts
const collision = err instanceof AppApiError && err.status === 409;
if (collision && i === 0) return { kind: "already-installed", ... };
if (collision) { skipped.push(f.path); continue; }
```

The typed result (`scaffold.ts:32-46`) keeps `committed` and `skipped` as
separate lists and `already-installed` as its own variant, so a caller can never
confuse "you already have this" with "we skipped a file". The header comment
(`scaffold.ts:8-15`) gives the reason the second half is not cautious-by-refusal:
"Refusing the whole PR over one such file would make the install unreachable for
exactly the repos most likely to want it."

## The adoption control ships in the seed

`CODEOWNERS` is seeded (`layout.ts:82-90`) with a placeholder team per lane, and
its first line is the governance sentence itself: "Merging a change here IS the
act of adopting it, so review is the whole control." The pull request body
repeats it as step one of "before merging" (`scaffold.ts:58-61`). Nothing is
silent about review, which is the failure the technique names — silence reads as
"no review needed" to the next person.

Outward-facing switches default off. The seeded declaration carries
`telemetry: "off"` (`layout.ts:124`, and again in the catalog seed at
`layout.ts:100-102`): "A fresh registry reports NOTHING until its owner opts in."
The seed also carries nothing private by construction — `layout.ts:6-8` states it
as a property of the function, "NO secrets and NO proprietary content: everything
here is public-safe boilerplate the customer owns the moment the PR merges".

## One kind of artifact per proposal

`src/lib/registry/migrate.ts:1-9` exports hosted content as one draft request per
artifact type, on `migrationBranch(type)` (`:20`), stable per type so re-running
one type updates its request. The stated reason is reviewability, not throughput:

> a single PR moving an org's whole knowledge base is unreviewable, and this
> content only becomes real when a human reads it.

And the source is not mutated by *opening* one: `migrate.ts:8-9` — a row flips to
`origin = "registry"` only when the indexer has actually seen the file, so an
abandoned proposal leaves nothing pointing at a place the item does not exist.

## Where the round trip is thinner than the contract

`layout.ts:10-13` claims the seeded declaration and catalog match the reference
registry "key-for-key", enforced by both sides going through
`serializeRegistryYaml` and `buildCatalog`. That covers the shape emitted by the
generator; it does not compare the emitted bytes against the reference
registry's committed copy, so a hand-edit to the reference would still drift away
silently. The generate-parse-compare round trip is the missing check.
