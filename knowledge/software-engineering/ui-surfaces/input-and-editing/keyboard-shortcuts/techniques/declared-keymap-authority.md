---
layer: technique
type: technique
subject: keyboard-shortcuts
technique: declared-keymap-authority
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [adding a shortcut to a screen, writing or auditing the keyboard reference page, a chord changed and the help still shows the old one]
---

# Declared keymap authority

A screen's shortcuts are a closed vocabulary with many readers: the handler
that runs each action, the reference page that lists them, the hint beside a
button, the announced shortcut on the control, the palette row that runs the
same action by name. When each reader restates the keys, the copies drift the
first time someone changes a chord and finds only one of them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
This technique makes one declaration per screen the authority and every
reader a derivation of it.

## The declaration

Each screen (and each overlay, and the shell's global layer) owns one table of
entries. An entry carries:

```
id      — stable action id, unique in its table ("replay.toggle", "nav.next")
keys    — one or more chords, in a canonical written form ("Shift+G", "Mod+K")
label   — the human phrase the reference page and hints show ("Play or pause")
scope   — the layer it lives in (global, screen, overlay, region)
when    — optional: the condition under which it is live (a row is selected)
```

The canonical form names modifiers in a fixed order and spells the
platform-relative primary modifier once (`Mod` — the command key on one
platform family, Control on the others), so the declaration is written once
and formatted per platform at render time. The table is plain data: no
handlers in it, nothing that needs a component to be mounted to read it.
That is what lets the reference page, a test, and the palette read it without
rendering the screen.

## Handlers bind by id

A screen's key hook receives the table and a map from id to handler, and
looks the key up in the table — it never contains a key literal of its own.
Two properties follow. A chord change is a one-line edit in the declaration
that the handler, the hint and the page all follow. And an entry without a
handler, or a handler without an entry, is a structural mismatch a check can
find, instead of a silent dead key or an undocumented one.

When a declaration has more than one chord (an arrow and its letter
alternative), the reference page shows both and the handler is one; when two
actions want one chord in one scope, the declaration is where the collision
is visible and rejected, before any code runs.

## Every reader derives

- **The reference page** is a render of the tables, grouped by screen and
  layer, in the declaration's order. It never holds its own list.
- **Hints and tooltips** on the control the shortcut accelerates read the
  entry by id and format its chord for the current platform.
- **The announced shortcut** — the accessibility attribute that tells an
  assistive technology the control has a shortcut — is filled from the same
  entry, in the attribute's own syntax (modifiers first, the key last,
  modifier names as the event model spells them), naming the keys the user
  presses rather than the character they produce ("Shift+2", not "@"), so a
  character-matched entry such as "?" is announced as the keys that type it
  on the user's layout. It announces; it does not
  bind. A shortcut that is announced but not bound, or bound but not
  announced, is the same drift in a channel nobody looks at.
- **The command palette** runs the same action ids by name and shows the
  declared chord as its hint, so a user who finds an action by typing learns
  its key.

## User remapping is a layer over the declarations

When users may rebind keys, the declarations stay the defaults and a per-user
override table maps id to chord. Dispatch reads the merged view; the
reference page shows the effective chord and marks the overridden ones. The
override is validated against the same collision rules as the defaults at the
moment it is saved, because a remap that steals a chord from another action
in the same scope is a collision the user cannot diagnose.

## The inventory test

The authority makes a ground-truth test possible, and the test is the reason
the authority holds over time:

1. Every declared id in every table has a bound handler on its screen.
2. Every key hook found in the source binds a table that exists.
3. Every screen that registers a key hook has a section on the reference page.
4. No two entries in one scope share a chord after platform normalization.

The third check should count hooks from the source itself rather than from a
list somebody maintains, because the list is a second copy and would drift
with the code it is meant to check
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A test that
walks the source for key-hook call sites catches the screen whose author
added keys and never added a row.

The reference page itself usually imports its tables one by one, and that
import list is the copy the derivation left behind: the rows cannot drift
from a table, but a table nobody imported has no rows at all. Close it the
same way — walk the source for every place a table is *declared* (not every
hook, since a table may be bound by a component rather than a named hook),
load each, and assert every entry of every table appears on the page. Two
guards keep that walk honest. Assert the walk found something, because a
walk whose pattern stopped matching finds zero tables and passes every
"nothing is missing" assertion
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
And pin derived ranges to their real source: when a table declares the
digits that pick one of N items and the page renders them as one cap
("1-5"), the test reads N from the thing being counted, so adding a sixth
item turns it red instead of leaving a page that says five.

## When not to use it

A one-screen tool with two shortcuts does not need tables and a page; it
needs the two shortcuts written down next to the controls. The authority
earns its cost once there is more than one screen, more than one reader, or
anyone who will change a chord after the author has left.
