---
layer: technique
type: technique
subject: keyboard-shortcuts
technique: shortcut-collision-rules
status: forged
laws: []
shared_with: []
use_when: [choosing the key for a new shortcut, a shortcut does nothing while a table or list has focus, a shortcut fires while the user is typing]
---

# Shortcut collision rules

Every key a shortcut might take already has an owner. The user typing owns
printable keys in a field; a focused composite with type-ahead owns printable
keys while it has focus; the browser, the operating system and the screen
reader own their reserved chords; a focused button owns Space and Enter. A
shortcut is chosen around those owners, and the choice is made at
declaration time, where it is cheap, rather than discovered in a bug report.

## The owners, in the order they win

1. **Typing targets.** Text inputs, text areas, editable content, selects,
   and anything with a textbox or combobox role. While focus is in one, no
   unmodified printable key and no Space reaches the shortcut layer. Most
   modified chords do not either: Control or Command plus a letter is editing
   (select all, undo, copy) inside a field. Only chords explicitly declared
   as "live in fields" — the palette summon, a save — pass through.
2. **Focused controls.** Space and Enter on a focused button, link, checkbox
   or menu item activate that control. A play/pause on Space is a screen key
   that must yield whenever an activatable control has focus, or the user who
   tabbed to "Delete" and pressed Space has just paused a video.
3. **Type-ahead composites.** A listbox, tree, menu or table that jumps to the
   member starting with the typed character takes every printable key with no
   modifier while it has focus. A bare-letter application shortcut is
   swallowed there — it simply does nothing — and the failure is invisible
   because the type-ahead looked like it worked. When the product does carve
   a key out of type-ahead (the slash that summons search, say), the carve-out
   is a collision rule and belongs beside the declarations, not as a literal
   inside the composite's own predicate, where the next person to rebind
   search will not find it.
4. **Platform reservations.** The browser's chords (new tab, address bar,
   find, reload, history), the operating system's (switch application, lock,
   input-source switch), and the screen reader's own modifier and its
   commands. A shortcut that collides with assistive technology is
   unreachable by exactly the users who most need keys. Treat this list as a
   denylist checked at declaration.

## The character-key criterion

The accessibility guidelines' character-key criterion applies to any
shortcut made only of a letter (upper or lower case, so Shift plus a letter
is still in scope), digit, punctuation or symbol: it must be
possible to turn it off, to remap it to include a non-printing key such as
Control or Alt, or
it must be live only while its component has focus. The reason is speech
input: a user dictating "delete draft" into a field that lost focus sends a
stream of letters, each of which can fire a command. A bare-letter shortcut
scoped to a focused component (the region's own keys) meets the criterion by
scope; a global bare letter needs an off switch or a remap, and in practice
is better not shipped.

## The default that survives

An application-wide or overlay-wide accelerator uses a **modified chord**,
heard in the capture phase when an overlay owns it. Shift plus a letter is
the lightest chord, but it is not a non-printing one: it produces a capital
letter, so fields own it (the typing guard suppresses it), a type-ahead
predicate that takes any single character takes it too, and the
character-key criterion still applies. It survives a focused composite only
when it is heard in capture, above the composite, and it still needs the off
switch, remap or focus scope the criterion asks for. The primary
platform modifier plus a letter is the strongest, and the most crowded —
check it against the browser's list first. Alt plus a letter is
layout-dangerous: on many layouts it produces a character, and on some it
opens the application menu.

Decision rules:

- **When the key must work while a table or list has focus, it carries a
  non-printing modifier or is heard in capture**, because type-ahead takes
  every printable key, a Shift-produced capital included.
- **When the key must work inside a field, it uses the primary modifier and
  is declared field-live**, and it must not be an editing chord.
- **When the key is a single printable character, scope it to a focused
  component** or provide the off switch and remap the criterion requires.
- **When two actions want one chord in one scope, the declaration rejects
  it.** The same chord in two different scopes is fine — the dispatch order
  decides — but only if the inner scope's meaning is the one a user expects
  while there.
- **Mnemonics are a tiebreaker, not a right.** "G for go" loses to every
  owner above it.

## Platform grammar

Spell the primary modifier once and render it per platform; a shortcut
reference that shows Control on a platform whose users press Command teaches
the wrong key. Match the platform's conventions for the actions that have
them (the palette, find, save, undo) rather than inventing a house chord —
the user's hands already know the platform's.

## When not to use it

Inside a widget's own keyboard model — arrows in a grid, letters in its
type-ahead — the widget is the owner and these rules do not apply; that
model is the accessibility subject's. The rules govern accelerators that
live above widgets.
