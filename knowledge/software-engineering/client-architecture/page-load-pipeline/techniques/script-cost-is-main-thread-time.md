---
layer: technique
type: technique
subject: page-load-pipeline
technique: script-cost-is-main-thread-time
status: forged
laws: [limits-are-derived]
shared_with: []
use_when: [a page looks ready but ignores the first taps or keystrokes, deciding whether a heavy module belongs in a route's first load, splitting a bundle or deferring a below-the-fold section, the served markup hides the headline or page until an entrance animation runs]
---

# Script cost is main-thread time

Shipped script is paid for four times. It is **downloaded**, which is the part a
byte count sees. It is **parsed and compiled**, which scales with its size and
happens largely on the main thread. It is **executed**, which runs module
bodies and builds the application's first state. And on a server-rendered page
it then **re-attaches behaviour** to markup that is already on screen, walking a
tree the size of the page to connect handlers and state. Every stage but the
first competes with the reader for the one thread that handles input.

That is why a page can look finished and not respond. The server-rendered markup
painted early; the tap lands while the main thread is busy compiling and
attaching; the tap waits. The reader sees a button that does nothing, taps
again, and the responsiveness metric records the worst of those waits. Bytes
predict this badly: a small, dense module can execute for longer than a large
one of static data, and the same bundle costs several times as much on a
low-end phone as on the developer's laptop.

## Measure it where it hurts

- **Main-thread time, not bytes, is the claim.** Bytes are a pre-merge proxy
  (see [field-measured-load-budget](./field-measured-load-budget.md)); the
  property is how long the main thread is unavailable during load and on first
  interaction.
- **On a weak device.** Profile on, or throttled to, the device class at the
  low end of real traffic. A profile on a fast workstation tells you the
  ordering of costs and nothing about their size.
- **As tasks.** Any task over fifty milliseconds is a long task: input that
  arrives during it waits for it to end. The threshold is derived from the
  responsiveness target — an interaction must be answered within a couple of
  hundred milliseconds end to end, and a single task that consumes a quarter of
  that before the handler even starts leaves the rest of the pipeline too little
  ([limits-are-derived](../../../_laws.md#limits-are-derived)).

## Ship less

- **Split by route.** Each route's first load carries its own code and the
  shared floor, not its siblings'. The shared floor is the number to watch,
  because every route pays it.
- **Split by interaction.** Code that runs only after a click — an editor, a
  dialog, a chart's export — loads on the interaction or on intent, not with the
  page.
- **Render on the server what needs no behaviour.** Parts of the page that are
  static once rendered should ship markup and no script. A component model that
  lets a subtree render only on the server removes its code from the first load
  entirely; one that ships every component's code to re-attach behaviour to
  static text pays for nothing.
- **Defer below-the-fold sections**, loading their code as the reader approaches
  them, so the first load carries the first screen. The shell's
  [lazy-section-loading](../../../ui-surfaces/shell-and-navigation/app-shell/techniques/lazy-section-loading.md)
  owns the split mechanics and the placeholder contract; the rule here is only
  that what the first render needs is never deferred.
- **Ship less to weak devices** where the product has optional richness, through
  [adaptive-fidelity-tiers](../../../ui-surfaces/feedback-and-style/adaptive-fidelity-tiers/adaptive-fidelity-tiers.md)
  rather than a device guess.

A split is not free. It adds a request, a moment where the content is absent,
and a placeholder that must reserve the loaded content's space
([layout-stability-by-reservation](./layout-stability-by-reservation.md)). A
module light enough that its split costs more in placeholder and pop-in than it
saves in first-load time stays in the first load. The candidates are the heavy
dependencies — a charting library and its geometry dependencies, a media player
runtime, an editor — that power one below-the-fold section and would otherwise
ride every visit.

## Yield what must run

Work that must run at load — initializing state, attaching behaviour to a large
tree, processing a list — is broken into tasks that yield to the main thread
between chunks, so input can be handled between them. Yield on a time budget,
not after every unit of work, because each yield has overhead; and yield
regardless of whether input is currently pending, because checking for pending
input first proved unreliable. Prefer a yielding primitive that resumes the
continuation ahead of unrelated queued tasks, falling back to a zero-delay timer
where it is absent. Where the framework can attach behaviour to parts of the
page progressively, in priority order, let it: the region the reader is
interacting with should become responsive first.

## The cheapest way to make the first render wait: hide it

Everything above prices script by the work it does. There is a way for script to
delay the page that costs no main-thread time at all: **the served markup starts the
page invisible, and only script can reveal it.** An entrance animation library that
renders on the server writes its opening values into the document: zero opacity, an
offset transform, on the wrapper around the headline, or around the whole route.
The first render paints nothing the reader can see. The largest-paint metric agrees
with the reader: an element at zero opacity is not a candidate. So the page's
largest paint happens after the script downloads, compiles, executes and hydrates,
plus the animation's delay. On a weak device, that is the whole script budget
added to the page's most important number. The page looks like it loads quickly
on a fast machine, because hydration there is quick.

This is not a rare mistake. In one fleet audit, five of five server-rendered web
applications did it on their landing headline, and one did it on every route,
through a page-transition wrapper around the main content. None of them had
decided to. It is the entrance library's default when the component is rendered on
the server.

The rule is the motion subject's start-state placement rule, and the page-load
reason makes it mandatory rather than stylistic:
[content-bearing-degradation](../../../ui-surfaces/feedback-and-style/motion/techniques/content-bearing-degradation.md)
says **what is served is the settled state**, and the hidden start state is armed on
the client after mount, or not at all. For the first screen, prefer not at all.
An entrance that delays the largest paint to add a flourish has spent the page's
most expensive number on decoration.

How to see it without a lab: fetch the served document and search it for inline
zero opacity on any ancestor of the headline. Treat a count above zero as a defect.
A reduced-motion accommodation does not repair this. It changes what the
preference-setting reader sees after script runs, and changes nothing about what
every reader sees before it.

## Decision rules

- When a heavy module powers one below-the-fold section, move it out of the
  route's first load; when a module is light, leave it, because the split's
  placeholder and request cost more than it saves.
- Keep the shared first-load floor under its own budget, separate from per-route
  budgets, because every route pays it.
- Render static subtrees on the server with no client code; ship behaviour only
  where there is behaviour.
- Break any load-time work that can exceed fifty milliseconds into
  time-budgeted chunks that yield unconditionally.
- Judge every change on main-thread time on a weak device; use bytes only as the
  proxy that gates merges.

## When not to use this

- **Long-lived authenticated tools** whose first load is paid once per day: the
  first-load budget matters less than per-interaction cost after load, which is
  this technique's yielding half and the motion system's frame discipline.
- **Content that must work without script.** Deferring script there is not an
  optimization question; the content is rendered on the server by rule.

## How to test for the property

- Profile a cold load of each key route under a low-end device profile and
  record total long-task time between first paint and quiet; regressions are
  measured against that, not against bytes alone.
- Tap the primary control as soon as it paints, on the weak profile, and record
  the delay before its handler runs.
- Assert that no module above a chosen weight appears in the first load of a
  route whose first screen does not use it.
