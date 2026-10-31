---
layer: technique
type: technique
subject: kept-alive-screen-host
technique: hidden-but-alive-screens
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [a hidden screen still polls or answers hotkeys, returning to a screen loses its scroll and selection, a long run dies when the person glances at another screen]
---

# Hidden-but-alive screens

The host keeps every screen the person has visited mounted, up to a bound,
and shows exactly one. The others are hidden by a boundary that keeps their
state and their document nodes and tears down their effects. Returning to a
screen is a mode change on that boundary. The selection, scroll, typed filter
and expanded rows are all where they were, and the screen re-reads its data
quietly behind them.

## The kept set is a bounded LRU

Keep visited screens in most-recently-shown order. Showing a screen moves it
to the front. Past the cap, the least recently shown screen is unmounted, its
data entry is dropped, and its in-flight read is aborted. The eviction is the
reaper for everything the screen created, so that eviction names its own
clean-up ([law: creation names reaper](../../../../_laws.md#creation-names-reaper)).
Choose the cap from what a person actually cycles between in a working
session, a handful to about ten screens in a dense product, and not from how
much memory might be spare. An evicted screen comes back as a first visit. That
is acceptable precisely because the frame paints on the click and the data
streams in, so a cold return costs dashes for a moment, not a blank.

Leaving a screen aborts that screen's in-flight read. A hidden screen does not
keep receiving lines for a view nobody sees, and its return starts a fresh
quiet read anyway.

## Hidden means stopped, and the primitive decides that

The property that makes keeping alive affordable is that a hidden screen's
effects stop. Its hotkeys unbind, its polls stop, and its registrations into
shared chrome (a sidebar's second level, a toolbar slot, a command palette's
section) are withdrawn. Reach for a boundary primitive that does this: it
hides the subtree, runs every effect cleanup on hide, re-runs the effects on
show, and renders hidden updates at low priority. A style toggle that only
sets `display: none` is not that primitive. It leaves every effect running,
and the hidden screen is still binding keys and polling under the visible one.

Design screens so that the effect lifecycle *is* their registration
lifecycle. A screen that contributes sections to the shell registers them in
an effect, so hiding it withdraws them with no explicit "on leave" code. A
screen's portal into shared chrome is hidden with the screen. A hotkey hook
built on an effect stops with the screen. Code that registers imperatively
and outside an effect is the code that leaks across a hide.

The boundary needs an element to hide. Where a hidden subtree renders no
element of its own (a route page that draws nothing, a fragment), wrap it in a
layout-neutral container. Otherwise the hide falls through to whatever element
is nearest, and that can be the visible screen's own frame. A hidden subtree
that renders only text draws nothing at all, because there is no element to
hide.

## Work that must outlive a visit does not hang off a view effect

The corollary is the lesson teams learn by incident. Because hiding runs every
effect cleanup, any work started from a screen and cleaned up in an effect
dies the moment the person looks elsewhere. A one-minute proposal run, an
upload, or a probe sequence the person started and then left to check another
screen is aborted by its own cleanup. Two rules follow:

- **Never abort long work on effect cleanup.** The work's handle lives in a
  ref or a store, and it is cancelled by the person (a reset, a new pick) or
  by an explicit end of its owner, not by a hide.
- **Timers count from a stored start.** An elapsed display that counts from
  "when this effect mounted" restarts on every return. Store the start time
  with the work and derive elapsed time from it.

Work whose result another screen or the shell needs (a badge, a background
job, a session-wide subscription) belongs in a shell-hosted service. Kept
screens are bounded and can be evicted. A run held in a screen's own state
survives a hide but not an eviction, so the screen-held form is acceptable
only when losing the run on eviction is stated and the fetch is aborted then.

## Decide per showing, not per mount

Logic that should run "when the person opens this screen" (collect on open,
pick a default, mark something seen) must be keyed to a *showing* and to that
showing's own fresh read, not to mount. The kept copy is already mounted, and
its effects re-run on show with the data it held when it was hidden. A collect
decided on that stale data repeats what the last visit already did. Decide
once per activation, after the activation's own read lands.

The same applies to baselines. A "what changed since you last looked" view
takes its first baseline from the first *read* data, never from the empty
unread state, or it marks everything as changed.

## What does not belong to effects

Some side effects belong to the nodes and survive a hide: media playing, a
document-level attribute or stylesheet the screen set, an element id that a
document query finds twice. Audit these per screen. Hiding covers effects, not
the document. Where a node's side effect must stop on hide, give it an effect
whose cleanup stops it (pause the media), and make that a layout effect so the
cleanup runs when the screen is hidden and is not deferred behind a transition. Entrance motion is the reverse case: an entrance tied to mount
plays once, and a kept screen shown again must not replay it, because the
person has already seen it arrive.

## When not to use it

A screen that holds sensitive transient input which must not survive leaving
(a secret field, a payment step) should reset on hide or opt out of keeping. A
product with very few screens and cheap data gains little and pays in memory.
Use restore-from-state there.
