---
layer: application
type: application
subject: async-ui-states
technique: empty-state-design
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16.3.3
applied: code
proof: structural-with-partial-pin
---

# Next.js — the request that is not made

The technique's entitlement rule says an empty state is earned by a response.
This tree is the case where it is earned by a **fact the server already
holds**, and where the surface therefore issues no request at all. The
interesting part is not the saving; it is what the skip does to the failure
state next door.

## The chain, and the decision to ask

A job-seeker feed cannot produce rows until four things are true in order: a
profile exists, a source is enabled, a scan has run, and something survived
the fit filter. The module that owns those decisions says so in its own
header — `app/features/jobseeker/feedModel.ts:4` "CHAIN-AWARE EMPTY STATES. An
empty feed has four different causes and each one has a different next step"
— and resolves them first-missing-link-first, `feedModel.ts:30-38`, over a
closed vocabulary of six, `feedModel.ts:27`
"`no_profile`, `no_sources`, `no_scan`, `below_min`, `nothing_live`, `ok`".

The second decision is the one this application exists for, and it is a
separate pure function beside the first:

```ts
// feedModel.ts:47
export function shouldFetchRows(chain: Pick<FeedChainFacts, "hasProfile" | "enabledSources">): boolean {
  return chain.hasProfile && chain.enabledSources > 0;
}
```

Its comment is the technique's argument in the tree's own words —
`feedModel.ts:42-46`: "A broken chain is not a failed read: with no profile,
or with no enabled source, the page ALREADY knows what it will show … Fetching
anyway spends a request whose only possible outcomes are an empty page the
reader must not be shown as 'empty' and a failure the reader must not be shown
at all."

Both halves are decided where the facts already are. The server page composes
the chain from its own reads — `app/me/jobs/page.tsx:36-42`, with
`hasProfile: profile !== null` and `enabledSources` counted from the source
rows — and hands it down as a prop, so the client never issues a request to
find out whether to issue a request. Note what rides along with it:
`page.tsx:31-33` "`countries` rides with the chain (not a client fetch): the
`no_sources` state offers one click that enables EURES for the seeker's OWN
markets, and the button has to be able to NAME them before it is pressed."
The empty state's *action* needs a fact too, and it is cheaper to carry it
than to fetch it from inside a state that exists because fetching is pointless.

## What the skip buys, at the render site

The client evaluates the predicate once, `JobsFeed.tsx:198`, under a comment
that states the consequence rather than the mechanism — `JobsFeed.tsx:196`
"A broken chain is answered from the server's own facts: no request is made,
so a failed read can never be painted as an empty feed" — and the load effect
returns before touching the request machinery, `JobsFeed.tsx:201`
"if (!fetchRows) return;".

Three branches then partition the content region, and they are mutually
exclusive by construction rather than by ordering luck:

- `JobsFeed.tsx:382` "!fetchRows || (rows !== null && rows.length === 0 && !loadError)" — the
  chain-aware empty state. Its first disjunct is the entitlement-without-a-request
  case; its second is the ordinary settled-empty case, and that one explicitly
  excludes a failure.
- `JobsFeed.tsx:379` — the failure notice, rendered from `loadError`, which
  only a request that ran can set.
- `JobsFeed.tsx:390` "rows === null && loadError ? null" — with nothing held
  and a failure showing, the region renders *nothing* rather than a second
  opinion. The failure notice above is the whole answer.

The failure rendering is the technique's neighbour done properly:
`FailureNotice.tsx:44` carries `role="alert"`, `FailureNotice.tsx:54-58` is a
retry that reissues the same request with its own busy state
(`disabled={retrying}`, `aria-busy`), and the caller owns it because
`FailureNotice.tsx:18` "only the caller knows which request failed" — here
`JobsFeed.tsx:207-210`, re-running the same query from the first page and
keeping the reader's filters and scroll.

`aria-busy` on the region is scoped the same way: `JobsFeed.tsx:307`
"aria-busy={fetchRows && rows === null ? true : undefined}" — a broken chain
is not busy, because nothing is in flight and nothing will be.

## The cause axis is on the element, not only in the copy

`FeedEmptyState.tsx:29` puts the cause on the rendered node —
`data-empty-state={state}` — and says why: `FeedEmptyState.tsx:24-25` "it is
the hook the keyless e2e spec reads to assert WHICH link of the chain is being
named." The component takes `state`, `title`, `body` and a `cta` slot, so the
cause is a required input rather than an inference from whatever sentence a
call site passed. That is the design-posture clause about shared primitives,
satisfied by making the cause a parameter of the primitive.

## What is pinned, and what is not

Pinned in the tree, and re-run here:

- `feedModel.test.ts:32-37` walks the predicate's four chain combinations, and
  `feedModel.test.ts:42-46` pins the pair that matters, under a name that is
  the rule — `feedModel.test.ts:42` "an intact chain with no rows is
  `nothing_live`, which a failure must not borrow" — with the reason spelled
  out above it at `feedModel.test.ts:39-41`.
- `e2e/jobseeker-keyless.spec.ts:28-36` opens the feed on a fresh install and
  asserts `data-empty-state` is `no_profile`, that the state's link points at
  the profile page, and that the scan button is absent —
  `spec.ts:35` "toHaveCount(0)". That is the first-missing-link rule observed
  end to end without a key.

Not pinned, and stated because the distinction is the point: **no standing
assertion counts requests.** The originating session reported a browser-driven
observation of zero row requests on a broken chain; the tree carries the
guarantee structurally (`JobsFeed.tsx:201`) and pins the *rendering*, not the
request count. The assertion that would close the gap is small and absent — a
route-level request counter around the two chains, asserting zero on the
broken one and exactly one on the intact one — and the spec is
`spec.ts:3-11` "DECLARED, NOT YET ENROLLED", run by hand rather than in the
deterministic-spec step, so even the rendering pin does not gate a merge.

## What this realization cannot say

It is one surface. The same chain feeds two sibling pages
(`feedModel.ts:1-2` names `/me/jobs`, `/me/jobs/[id]` and `/me/scans`) and
nothing here checks that they skip on the same facts. And the skip's value is
argued, not measured: the claim that it prevents a class of confusion rests on
the branch structure above, not on a defect that was observed and then
removed. The honest summary is that the tree makes the failed/empty confusion
*unreachable* rather than *fixed* — which is the stronger property and the
weaker evidence.
