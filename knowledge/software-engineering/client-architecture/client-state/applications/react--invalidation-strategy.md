---
layer: application
type: application
subject: client-state
technique: invalidation-strategy
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# Invalidation strategy — the invalidation nobody was subscribed to

*Verified against the project tree at `62aa5b09` (a Next.js / React 19
marketing-and-tools site; `react@19.2.7`).*

The smallest possible cache, with the technique's strongest freshness
mechanism wired correctly, and a banner that still showed the wrong number
for the whole visit. The defect is not in the cache and not in the
invalidation call; it is in the assumption that clearing an entry is the
same as telling its readers.

## The seam

`src/components/ai/useAiStatus.ts` module-caches one preflight request —
provider mode plus the caller's remaining daily budget — so that "however
many panels/hooks subscribe, a page load costs exactly one status request"
(`:3-8`). `cached` and `inflight` are module-scope (`:11-12`); the fetch
joins an in-flight promise and clears `inflight` on both a non-2xx and a
network failure (`:21-37`), with the comment at `:24-27` recording the
earlier bug where a resolved-null promise was left in the slot and no
later mount ever retried — the settle-time cleanup the dedup technique
asks for, learned the hard way.

Write-through from the client's own mutation is present and precise: every
successful generation calls `invalidateAiStatus()` at `useAiTool.ts:231`,
with the reason written beside it ("a generation just spent budget — bust
the shared status cache"). That is rung one of the technique's hierarchy,
done right.

## What clearing did not do

The first version of `invalidateAiStatus` set `cached = null; inflight =
null` and returned. Every reader — `useAiStatus` (`:59-73`) — fetches once
in a mount effect and never again. The assistant keeps all of its tool
panels and the one budget banner mounted across tab switches (`:48-50`), so
after the cache was cleared, "the next subscriber" was the next page
**navigation**. The remaining count sat at the page-load snapshot until the
user's next run returned a rate-limit error the banner existed to
forestall.

Nothing in the technique's hierarchy was violated. The cache learned it was
wrong at exactly the right moment; the readers had no channel through which
to learn it. A store's readers are subscribed; a module cache's readers are
whoever happens to call it next, and in a long-lived shell that is nobody.

## The fix, as shipped

`:13-16` adds a `subscribers` set of every mounted reader; `useAiStatus`
registers on mount and removes on unmount (`:64-70`), with an `alive` latch
so an unmounted reader's late delivery is inert (`:61-66`).
`invalidateAiStatus` (`:45-56`) now clears the cache **and** — if anyone is
subscribed — refetches once and pushes the fresh payload to every reader;
with no subscribers it stays a plain clear (`:53`), so the module does not
issue a request nobody will render. The comment at `:48-52` records the
lesson in the code: "Clearing the cache alone was not enough."

The registry keeps the population honest — it holds only mounted readers,
each entry's reaper is the unmount cleanup that registered it — and the
push is the join of the deduplicated fetch, so N mounted panels still cost
one request per invalidation.

## What this cannot do or prove

- **It covers one mutation source.** The budget is also spent by other
  sessions and by the day rolling over; there is no event from the
  authority and no refetch floor, so a second tab's generations leave this
  tab's banner stale until its own next run. The tree has rung one and
  nothing below it.
- **It is a push, not a patch.** The fresh value comes from a refetch, so
  the technique's patch-versus-invalidate question does not arise here; a
  payload-carrying event would reopen it.
- **The verdict is by reading, not by measurement.** The failure was
  observed in use and the fix reasoned from the mount lifecycle; no test
  pins that a mounted reader receives the pushed value, so the next
  refactor of the hook can reintroduce the mount-only read without a
  suite noticing.
