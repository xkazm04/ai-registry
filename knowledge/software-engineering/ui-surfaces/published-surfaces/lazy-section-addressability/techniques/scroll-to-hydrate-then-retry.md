---
layer: technique
type: technique
subject: lazy-section-addressability
technique: scroll-to-hydrate-then-retry
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a jump must reach a target inside a section that has not mounted, a fixed delay before scrolling works locally and fails on slow connections, the viewport yanks itself back seconds after the reader scrolled away]
---

# Scroll to hydrate, then retry

Navigation on a page whose sections mount on approach has an inversion in it
that catches everyone once: **the scroll is not the last step, it is the
cause**. Mounting is gated on the section nearing the viewport, so scrolling
to the location is what brings the content into existence. Only afterwards
can a consumer look for the finer target it actually wanted.

This technique is that protocol, and the disciplines that keep it from
becoming a race.

## The protocol

1. **Resolve the address against the wrapper.** This always succeeds, on a
   cold first paint, before any code for the section has arrived. If it does
   not, the address is not in the page's declared vocabulary and the correct
   response is the coverage guard's, not a retry.
2. **Scroll the wrapper into view**, at the page's declared landing offset.
   The reader is now at the right place on a page that may still be empty
   there — which is already a better outcome than every naive implementation
   produces, and it is the outcome the protocol falls back to.
3. **Wait for the finer target on a bounded retry.** Prefer a signal over a
   poll wherever the platform offers one — a mount notification, an
   intersection callback, an observer on the wrapper's subtree — and poll on a
   short interval only as the portable floor. Either way the wait has a
   ceiling measured in seconds, not an open end.
4. **Act on the target once it resolves**: focus it, spotlight it, highlight
   it, re-scroll to it if the section's real geometry moved it.
5. **Re-assert the position.** The reserved height was an estimate and every
   section that mounted above the target changed the page's length. A landing
   that was correct in step 2 is off by the accumulated difference by the time
   step 4 runs, so the final position is asserted against the real element,
   not trusted from before.
6. **On exhaustion, settle and say so.** The wrapper-level landing stands, the
   consumer degrades to whatever it declared, and the exhaustion is recorded.

## Bounded, and the bound is a product decision

The retry budget is chosen against the slowest realistic mount — a cold cache
on a poor connection with the section's unit still in flight — not against the
fastest one anybody has observed. A budget tuned on a warm machine is a budget
that expires precisely for the readers who most needed the jump to work.

Two shapes are wrong in opposite directions. An **unbounded** wait is a
resource with no reaper: the page keeps a timer alive for a target that will
never arrive because its unit failed to load, and something eventually fires
into a page the reader has long since moved on from. A **fixed delay with no
retry** — sleep, then resolve once — is the naive fix and it is strictly worse
than the naive bug, because it converts a deterministic failure into an
intermittent one that will be closed as unreproducible.

State the budget as two numbers, an interval and a ceiling, in one place the
whole page shares. Every consumer that jumps uses the same pair, because a
page where the coaching overlay is more patient than the deep link has two
different cold-load behaviours and nobody will ever notice they are related.

The budget is also negotiable from the other side: sections that begin
mounting when they come *within* a viewport of the reader, rather than when
they touch it, are usually ready by the time a jump arrives. When exhaustions
rise, widening that approach margin is often the better fix than lengthening
the ceiling, because it improves ordinary scrolling too.

## The other direction: the tracker registers late as well

Travelling to a location is only half the address space. The other half is
naming the location the reader is currently in — a scroll tracker, a
breadcrumb, a highlighted entry in the page's own navigation — and it has the
same cold-start problem with a different shape. A tracker that sweeps the page
once when it starts finds only the locations that exist at that instant, and
on a lazily-mounting page that is a minority of them. The dots for everything
below the fold never light up, for the entire session, and nothing reports it.

The protocol is registration rather than retry: sweep once for what is
present, then **watch for arrivals** — a subtree observer on the page, a
mount notification, whatever the platform offers — and register each location
as its content appears. Three disciplines make that affordable:

- **Cap the watch.** An observer waiting for a location that will never
  mount stays attached forever and wakes on every mutation anywhere in the
  application, which is a real and permanent cost on a page that animates.
  The watch stops after a generous ceiling — tens of seconds, not seconds,
  because unlike a jump nobody is waiting on it — and it stops early the
  moment nothing is still pending.
- **Report what never arrived.** The give-up path in development names the
  locations that were declared, waited for, and never appeared. That list is
  the most precise diagnostic this subject produces: it distinguishes an
  address that was never declared from one that was declared and never
  hosted.
- **Track against the content, not the reserved space.** The tracker resolves
  the inner element, because reserved space is not the section. A location
  that has not mounted is simply not the current one, which is the correct
  answer.

## Cancellation is not optional

A retry in flight owns a timer, an observer, or both, and every one of them
names what destroys it
([law: everything created names its reaper](../../../../_laws.md#creation-names-reaper)):

- **The reader scrolls, and the jump is abandoned.** This is the important
  one. An uncancelled retry re-scrolls the viewport seconds after the reader
  deliberately went elsewhere — the single most hated defect in this whole
  area, because it feels like the page fighting the reader rather than like a
  page loading slowly.
- **A newer jump supersedes an older one.** Last request wins; the previous
  retry is cancelled, not left running to compete for the viewport.
- **The consumer goes away** — the overlay closes, the route changes, the
  component unmounts. Every path out cancels.
- **The target resolves.** Success reaps the loop as surely as failure does.

## Exhaustion is a distinct outcome

When the budget runs out, the consumer has landed the reader on the right
section without the finer target. That is a partial success and it must be
spelled differently from a complete one
([law: failure is not empty success](../../../../_laws.md#failure-not-empty-success)).
For a coaching overlay it means entering the declared degradation policy
rather than silently pointing at nothing; for a deep link, the reader sits at
the section while it continues to arrive. For every consumer it means a
recorded event naming the address, the consumer, and the elapsed time — a rise
in exhaustions is how a team learns that a section's unit grew past the
budget, and no other signal will tell them. The tempting failure is the quiet
one: the retry expires, nothing happens, the page looks fine, and a
slow-connection cohort has been losing the finer target for a year.

## Refinements worth having

- **Scroll first, then everything else.** Consumers that need the target
  *before* deciding to scroll invert the protocol and deadlock: they will not
  scroll until the target exists, and the target does not exist until they
  scroll.
- **Motion posture.** The initial jump on a cold load is better instant than
  animated — a smooth scroll through a page that is mounting sections behind
  it lands unpredictably, because the destination moves while the animation
  runs. Animate short in-page moves on a settled page; jump directly on
  arrival. A reader who has asked for reduced motion gets the instant form
  always, and here it is also the more accurate one.
- **Idempotence.** Repeating the same jump while it is already running does
  nothing; it does not stack a second retry loop.
- **The target may be re-created.** Re-resolve from the identifier each
  attempt rather than caching an element reference — a section that mounts,
  re-renders, and replaces its subtree hands back a fresh element under the
  same name.

## When not to use this

- **The target is always present.** A jump between locations that are all in
  the document costs nothing to resolve directly, and routing it through a
  retry loop adds latency and a cancellation surface for no benefit.
- **The wait is for data, not for mounting.** A section that has mounted but
  is still fetching is the section's own loading state to render, not a target
  to poll for. Polling a mounted section's subtree waiting for content to
  appear reimplements a loading state badly.
- **The consumer cannot be cancelled.** If a caller has no lifecycle in which
  cancellation can run — a fire-and-forget handler with no owner — fix that
  first. An uncancellable retry is worse than no retry.

## What this technique refuses

- A fixed delay standing in for a wait.
- An unbounded wait, or a bound nobody can name.
- A retry that survives the reader scrolling away.
- Two consumers on one page with two different budgets.
- Exhaustion that leaves no trace.
- A cached element reference re-used across attempts.
