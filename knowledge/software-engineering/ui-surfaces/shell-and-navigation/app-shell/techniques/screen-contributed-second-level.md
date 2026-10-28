---
layer: technique
type: technique
subject: app-shell
technique: screen-contributed-second-level
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [a screen needs its own filters or lists in the shell's sidebar, the sidebar shows a hidden screen's sections, two nav levels on one sliding track lose focus, a flat nav has grown past what a person can scan]
---

# Screen-contributed second level

A dense product reaches a point where its screens want the sidebar too: a
screen's filters, its saved lists, its sub-sections, all of which deserve the
whole column more than the app menu does while that screen is in front.
[nav-hierarchy](./nav-hierarchy.md) decides whether a second level earns its
place and what it may hold. This technique owns the mechanism by which the
**screen contributes** that level to a shell it does not own, and the two
properties that make the mechanism safe: the level's presence is derived from
which screen is shown, and the hidden half of the track is genuinely absent
for the keyboard and for assistive technology.

## The screen contributes; the shell hosts

The shell owns a **slot** — a region in its sidebar — and nothing else about the
second level. Each screen that has sections renders them into that slot (a
portal or the platform's equivalent) as part of its own render tree, so the
sections are the screen's code, read the screen's state, and disappear when the
screen does. The shell never imports a screen's sections and never keeps a
table of which screens have them; a screen added next quarter brings its own.

The screen also **registers** that it has sections, through a side effect that
runs while the screen is shown and returns its own unregistration — the
creation names its reaper
([_laws: creation-names-reaper_](../../../../_laws.md#creation-names-reaper)).
That choice matters in a shell that keeps visited screens alive but hidden to
make returns warm ([lazy-section-loading](./lazy-section-loading.md)): a hidden
screen keeps its tree but has its effects cleaned up, so it unregisters by
itself and its portal is hidden with it. A registration made in render, or a
flag set by the screen and cleared by the shell on navigation, is exactly the
state that survives when it should not: the sidebar keeps showing the sections
of a screen nobody is looking at.

Count registrations rather than holding a boolean. During a transition two
screens can be mounted at once, and the later unregistration of the outgoing
screen must not erase the incoming one's.

## The level is derived, the choice is stored

Two facts decide what the sidebar shows, and only one of them is state. The
person's **choice** — the menu, or the screen's sections — is stored. Whether the
screen in front **has** sections is derived from the registration count. The
level drawn is a derivation of both: the chosen level when the screen has
sections, the menu otherwise. A screen that opens with sections may set the
choice to its sections as it registers, which is what a person expects on
arrival; but leaving it must not need an effect that resets the level, because
the derivation already returns the menu the moment nothing is registered. An
effect that watches the route to set the level is a second, racing copy of the
location ([navigation-model](./navigation-model.md)).

## One track, and the hidden pane is inert

Draw the two levels side by side on one track that slides, rather than
swapping content in place: the slide tells the person which way they went and
how to come back. The pane that is off the track is removed from interaction,
not merely moved out of sight — mark it **inert**, so it leaves the focus order,
the pointer and the accessibility tree together. A pane translated off-screen
but still focusable is a sidebar a keyboard user can tab into blind, and one
hidden only with an aria attribute is still clickable and still in the tab
order.

The second level's head is a **way back** ("‹ Menu") and the screen's name as a
title, both derived from the current location, never passed in by the screen.
The menu's entry for the screen in front marks that it has sections (a chevron),
and activating it while already current goes down to them rather than
re-navigating.

## Focus follows the person

Moving between levels moves focus to where the person now is. Going **back**
puts focus on the menu entry of the screen they came from — the current-page
entry — so the next arrow or tab continues from the place they mean. Going
**down** puts focus on the way back, the first control of the new level. Defer
the focus move until the pane is no longer inert (the next frame is enough), and
suppress the scroll a focus call would cause on a sliding track. Without this,
focus is left on an element that just became inert, and the browser drops it to
the document body.

## The menu is one authority, ordered by the journey

The level-one menu, the command palette, any guided tour and any recap read
**one navigation declaration**
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
When the flat list outgrows a glance — roughly ten entries — group it, and order
the groups by **the order a person meets the product** (bring things in, watch
them, govern them, improve them), each group with a one-line purpose. Inside a
group, order alphabetically: the group already says what the screens are for,
so the order inside only has to be findable. Labels that collide inside the
menu ("Set up" beside "Setup") are a navigation defect; rename by purpose, so
each label says what the screen is for, not what step of a process it once was.

## The prohibitions, collected

1. No shell-side table of which screens have sections.
2. No registration without its own unregistration, and no registration in render.
3. No effect that resets the level on navigation; the level is derived.
4. No off-track pane that remains focusable or in the accessibility tree.
5. No level change that leaves focus on an element that just went inert.
6. No second list of screens for the palette, the tour or the recap.

## When not to use it

A product whose screens need no column of their own keeps one level, and
[nav-hierarchy](./nav-hierarchy.md)'s section-scoped sub-nav covers peer
destinations inside a section without any contribution mechanism. A layout
whose screens each own their full frame (every navigation replaces the
document) has no persistent sidebar to contribute to; there the screen renders
its own column.
