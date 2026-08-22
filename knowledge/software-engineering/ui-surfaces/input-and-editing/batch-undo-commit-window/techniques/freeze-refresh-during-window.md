---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: freeze-refresh-during-window
status: forged
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [optimistic rows flickering back mid-window, a background refresh fighting local state, a refresh that stayed frozen after an error]
---

# Freezing the refresh while local truth is on screen

A surface that shows live work refreshes itself — on an interval, on window
focus, on a subscription. During a commit window that refresh is a hostile
actor: it fetches the store's truth, which is *correct* and *stale relative to
the operator's decision*, and repaints the rows the operator just cleared.
The operator watches their verdict undo itself. Nothing in the system is
broken; two truths are simply being merged by whichever wrote last.

Reconciling optimistic state against arriving server state per row is the
general solution and it is the wrong one here, because the window is short and
bounded. Suspend the refresh for its duration instead. The complexity budget
belongs to the invariants, not to a merge algorithm that runs for six seconds
and is exercised only by an interleaving nobody can reproduce.

## The suspension lives on the store, not on the caller

Put the flag where the refresh *reads* it, not where the window is armed.
Refresh in a real surface is invoked from more places than the surface knows —
an interval, a focus handler, a manual control, a sibling view sharing the
same collection — and a suspension that works by not calling one of them is a
suspension the others walk straight past. The refresh routine itself checks
the flag as its first act and returns without fetching
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the guard must
observe the thing it guards, which is *the write into the collection*, not
one particular scheduler.

That early return is worth writing loudly. A refresh that silently skipped is
easily mistaken later for a refresh that ran and found nothing changed, and
the two need to be distinguishable when somebody is debugging a stale surface.

## The response already in flight

A flag checked at the start of the refresh stops the refreshes that have not
begun. It does nothing about the one that left half a second before the
operator clicked, and that one lands *inside* the window with a full payload
of pre-verdict rows. The suspension therefore has a second half: when a
response arrives, it is discarded if the collection is suspended, checked at
the moment of application rather than at the moment of request. Systems that
implement only the first half see the flicker at a low rate that scales with
refresh frequency and gets blamed on everything except the mechanism, because
it reproduces only when the operator clicks during a request's flight.

The same reasoning covers a subscription push: the guard sits at the point of
application to the collection, so every route into that collection passes it.

## Release is unconditional, and this is where systems break

The suspension is acquired by arming and must be released by **every** path
out: commit succeeded, commit failed, undo pressed, surface torn down. The
tempting shape — set the flag when arming, clear it at the end of the commit
routine — leaves the flag set whenever the commit throws, and that is the
failure that turns a cosmetic protection into an outage of one surface.

What makes it severe is where the flag lives. It is on the shared collection,
which outlives the surface that set it. A window that ended in an exception
leaves the collection suspended after the surface is gone; the operator
navigates back, the surface mounts, its refresh returns early forever, and the
queue displays whatever was cached the last time refresh was allowed to run.
There is no error on screen and no error in the log — only a surface that
stopped being live, discovered days later by someone acting on a stale row.
An acquired suspension names its reaper at the moment it is acquired
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)); the
release goes in the unconditional part of the teardown, and in a shared
release routine every exit path calls.

Two reinforcements are cheap and worth adding where the surface is important:

- **A watchdog.** The suspension can carry a deadline of its own — the window
  length plus a generous commit allowance — after which it self-clears and
  records that it had to. A protection that can only be released correctly is
  one bug away from permanent; a protection that expires is bounded by
  construction.
- **A visible state.** Where the surface shows "updated N seconds ago", the
  suspension is visible in it for free: a timestamp that stops advancing is a
  frozen refresh a human can notice.

## Ownership, not nesting

With the single-pending-batch invariant holding, exactly one window can own
the suspension, so a boolean suffices and a counter is over-engineering. If a
surface genuinely has two independent reasons to suspend the same collection —
a commit window and a drag in progress — the flag becomes an owner token or a
count, and the release checks ownership before clearing. What must never
happen is two owners of one boolean: the second one's release re-enables
refresh under the first one's still-open window, which reintroduces the
flicker in the hardest-to-reproduce way available.

## What is not frozen

Freeze the *automatic* refresh, not the operator's agency. An explicit refresh
is an explicit request for server truth, and the honest response is to resolve
the window first — commit it, or cancel it — and then fetch. Silently ignoring
a manual refresh teaches the operator the control is broken; honouring it
mid-window shows them their own decision reverting.

Nor is anything else in the interface frozen: selection, navigation, opening a
row, and reading detail all continue. The suspension is scoped to the one
collection whose optimistic rows are on screen, for the one interval they are
optimistic, and no wider.

## Prohibitions

1. No suspension that guards only the scheduler and not the application point.
2. No refresh response applied while the collection is suspended.
3. No release that exists only on the success path.
4. No suspension without a bounded lifetime, whether by teardown or watchdog.
5. No shared boolean with two owners.
6. No manual refresh silently swallowed.
