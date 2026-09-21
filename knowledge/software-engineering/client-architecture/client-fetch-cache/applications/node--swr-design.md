---
layer: application
type: application
subject: client-fetch-cache
technique: swr-design
stack: node
status: forged
verified_on: 2026-09-08
applied: code
ab_verdict: better
proof: ab-paired
---

# A request-driven catalog service over an upstream document

A community showcase site renders a catalog it does not own: the entries live
in a Markdown README in a public repository, and the site's one server
function fetches that document, parses it, and serves the result as JSON to a
static client. The tree was opened at commit `9c11be86`; the tree pins `vite` 6.4.2 and `react` 19.2.0 exactly in
`website/package.json`, but declares no engines field, so no runtime version
is witnessed and `verified_against` is deliberately absent. The service is `website/server/catalog.js`;
its tests are `website/tests/catalog.test.js`.

This is stale-while-revalidate on the server side, with the client as the
downstream tier, and the tree makes three of the technique's decisions
legibly.

## Failure is decided at the parser, not at the transport

`parseCatalogMarkdown` walks the document's headings, lists and tables and
tracks a flag, `hasCatalogueStructure`, that flips when it sees a catalog
heading or a table it recognises. Its last lines are the whole of the
[failed-revalidation boundary](../techniques/swr-design.md#what-counts-as-a-failed-revalidation):

```js
// An explicit empty collection is valid (all entries may have been removed).
// A changed, unrecognizable document must never silently wipe the last good data.
if (!works.length && !hasCatalogueStructure) throw new Error('Unrecognized catalogue format');
return works;
```

An empty-but-recognised document returns `[]` and writes through; an
unrecognisable one throws, and the throw lands in the same `catch` as a
transport failure. The test named
`failed fetch or unrecognizable README keeps last successful catalogue, labels
it stale, then recovers` pins both arms in one case.

## The status ladder and where the stamp comes from

`createCatalogService` keeps `lastGood` and, on any failure, serves
`lastGood || fallback`, where `fallback` is a snapshot shipped at build time
under `public/data/catalog-fallback.json`. The status word is three-valued
by construction:

```js
status: lastGood ? 'stale' : fallback ? 'fallback' : 'unavailable',
```

`lastSuccessfulAt` is carried from the previous value, so a cold start that
falls back to the snapshot reports the snapshot's own success time, never
boot time. The test `cold-start failure uses the shipped snapshot with its
original successful timestamp` is the paired proof of that sentence.
`checkedAt` moves on every attempt; `lastSuccessfulAt` moves only on success,
which is the technique's "a failed fetch never stamps freshness" rule with the
two clocks given separate names.

## The downstream tier receives the remaining budget

The response handler computes how much of the origin's five-minute window is
left and hands the CDN exactly that:

```js
const remainingTtl = Math.max(0, Math.floor((nextFetchAt - now()) / 1000));
const cdnCache = catalog.source.stale ? 'no-store' : `public, s-maxage=${remainingTtl}`;
```

A stale or fallback response advises no storage. The comment on the header
says why in one sentence: *a cached origin result must never start a second
five-minute freshness interval.* That rule belongs to the layered-cache
boundary of
[outcome-branched-cache](../../../engineering-assessment/maturity-and-conformance/public-verdict-badge/techniques/outcome-branched-cache.md),
and this tree is the one that stated it plainly enough to write down.

## Proof

`proof: ab-paired`, run in the tree's own harness. Arm A is the service with
the structure check removed (an unrecognisable document parses to `[]` and
writes through); arm B is the tree as it stands. Same input on both arms: a
successful fetch whose body is a rewritten document with no catalog structure,
after one successful load of the real README. Arm A serves zero entries with
`status: fresh`; arm B serves the previous entries with `status: stale` and
`lastSuccessfulAt` unchanged. The measurable is the number of entries shown
after the bad fetch, and the status word beside them.

## What this realization cannot do

The parser's notion of "recognised" is a regular-expression vocabulary of
heading words in two languages. A document that keeps those words and
changes everything else still counts as recognised, so the boundary is only
as sharp as the vocabulary. The service also runs one instance per
serverless invocation: `lastGood` is per process, so a cold instance is a
fallback instance every time, and the `fallback` status will be common in
production rather than rare. Neither is wrong; both are the price of a
structure check that is a heuristic and a cache that is not shared.
