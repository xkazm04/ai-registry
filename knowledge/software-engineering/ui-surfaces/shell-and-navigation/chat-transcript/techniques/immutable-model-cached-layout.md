---
layer: technique
type: technique
subject: chat-transcript
technique: immutable-model-cached-layout
status: forged
laws:
  - derivation-names-recomputation
  - identity-survives-reuse
shared_with: []
use_when: [the same message renders in several panes at different widths, paint cost grows with the length of the history rather than the height of the viewport, a theme or width change forces every row to be rebuilt, an extension or a late event wants to edit a message that is already on screen]
---

# Immutable model, cached layout

A transcript row is built once and drawn many times: in one pane now, in a
second pane at a different width, in a popup that shows one author's recent
rows, again after a theme change, again after every scroll. The parent
standard already says the settled prefix is inert and the paint window is
bounded; this technique states the structure that makes those two rules
cheap to keep: **the message is frozen once built, and every view that
shows it keeps its own layout, derived from the message and keyed by
everything the layout depends on.**

## The model is a frozen sequence of typed elements

A built message is a sequence of typed elements - text runs, inline images,
badges, links, timestamps, mentions - each carrying its own data and none
carrying geometry. The builder produces it, the channel accepts it, and at
the accept door a one-way bit flips: from here on the object is immutable.
Everything downstream holds it through a read-only handle, and a handle may
be held by any number of channels and views at once, because sharing a
value that cannot change is free.

Freezing is what makes the rest possible. A layout cache is only valid if
the thing it was derived from cannot drift underneath it; the moment a
message can be edited in place, every view that cached a layout of it is
wrong without knowing it, and the bug surfaces as a row whose pixels
disagree with its selection text. So a message that must change - a
deletion, a moderation mark, a retracted edit, an extension's rewrite - is
not edited. It is cloned into a fresh unfrozen model, altered, and swapped
in through a replace door that announces the replacement, keeping the
original's identity per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse): the
same id, a new value, and every view learns of it through the same signal
that told it about the original.

One class of field tempts every implementation to cheat: status bits that
change after the fact, such as "deleted", "highlighted", "read". Marking
them mutable on an otherwise frozen model is the confession every mature
codebase of this shape carries, usually with a comment admitting the
renderer is not told. Treat it as a known hole with a rule: a mutable bit
on a frozen model must either be read only at paint time (so a repaint is
enough) or be paired with an explicit invalidation to every view; a bit
that layout depends on goes through replace.

## Each view owns a layout, keyed by what it depends on

Layout is a derived value and, per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation),
it names its own recomputation: a view holds, per message it shows, a layout
object that caches two things at two costs - the laid-out element tree
(wrapped lines, element rectangles, hit-test geometry) and, optionally, a
rasterised buffer of the finished row. The cache key is every input the
layout read: the column width, the element-visibility flags the view is
configured with, the display scale, and a **layout generation** - a counter
that the application bumps when something global changed (theme, font,
spacing) that the layout cannot enumerate cheaply.

The layout pass is lazy and windowed: on each layout the view walks only the
rows from the scroll position to the bottom of the viewport, asks each
layout "are your inputs still what you cached?", and re-lays-out only those
that say no. A row scrolled out of view is never touched; a row scrolled
into view pays once. This is why paint cost tracks viewport height and not
history length, and it is the mechanism behind the parent standard's
"settled prefix is inert".

## Two levels of invalidation, neither touching the model

Invalidation has two levels because its causes have two costs:

- **Buffer invalid** - the layout is still right, the pixels are stale:
  selection changed, a highlight arrived, a colour changed, an animated
  element ticked. Repaint from the retained element tree; no wrapping, no
  measuring.
- **Layout invalid** - an input in the key changed: width, flags, scale, or
  the generation moved. Re-lay-out, which implies repaint.

Both are expressed as **a version the layout compares against on its next
visit**, never as a call that edits the model and never as an eager sweep
over every row. A global change bumps the generation; a per-view change
sets a per-view "buffers stale" flag consumed on the next layout of the
visible window; a per-row request sets a flag on that one layout. The model
does not know any of this happened, which is the point: N views can
invalidate at N different times over one shared message with no
coordination.

## The decision rule

When one message can be shown in more than one place, or at more than one
width over its life, or by a renderer that must keep frame rate over a
history of thousands of rows: freeze the model at the accept door, give each
view a layout cache keyed by every input the layout reads, invalidate by
version, and change a message by replacing it. When none of those hold - one
view, one width, a short list, a toolkit that lays out for you - the
technique collapses to its residue: never mutate a row in place, and memoise
the row component on the message's identity.

## Boundaries

- **The streaming tail is the stated exception.** The
  [turn-model](./turn-model.md) keeps a streaming turn and its settled form
  as one element, and while it streams that element is mutable by design;
  its stability rules belong to
  [markdown-and-code-rendering](./markdown-and-code-rendering.md). This
  technique starts at settlement: the freeze is the settle event, and a
  pre-settlement row is a live element with a cache that is expected to be
  rebuilt on each flush.
- **A layout-managed toolkit inverts the second half.** Where the platform
  owns wrapping and painting (a browser, a declarative UI framework), do not
  build a second layout cache beside it; keep the frozen model, the replace
  door and the version-keyed invalidation, and let the platform's own
  reconciliation be the cache.
- **A layout cache is per view, not per message.** Sharing one layout across
  two panes "because they are the same width today" recreates the drift the
  freeze removed, one resize later.
- **Freezing is not permission to leak.** An immutable model shared by many
  views is retained until the last view lets go; the channel's bounded
  buffer (see [virtual-filtered-channel](./virtual-filtered-channel.md))
  is what bounds memory, not the freeze.

## How to test for the property

- Render one message in two views at different widths; resize one. The
  other view's layout object is untouched (count re-layouts per view; the
  unresized view reports zero).
- Attempt to edit a message after the accept door. In a debug build it is
  refused or asserted; in release the edit is invisible to every view until
  replaced, which the test treats as a failure of the caller, not the model.
- Bump the generation and lay out. Only rows inside the viewport re-lay-out;
  rows above and below report their last layout time unchanged.
- Invalidate buffers on a theme change. Zero rows re-wrap; only visible rows
  repaint.
- Plot paint time against history length at a fixed viewport. The curve is
  flat; a slope means something is walking the whole list.

This is also the standard structure in native text-rendering stacks and
immediate-mode UI libraries that separate a document model from a per-window
layout tree; the rule was reached there for the same two reasons - shared
documents and bounded paint - without any one product in view.
