---
layer: technique
type: technique
subject: guided-tours
technique: tour-path-curriculum
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [ordering the steps of a whole-product tour, a tour that reads like a column legend, keeping a tour's chapters in step with the navigation]
---

# Tour path curriculum

A whole-product tour is a curriculum before it is a sequence of spotlights: it
decides what a newcomer learns, in what order, and what they will be able to
find again when the tour is gone. The two defaults teams reach for both fail.
The **module order** — screen by screen as the code is organised, or as the
navigation happens to list them — teaches an inventory, not a product. The
**depth order** — every column of the first screen, then every column of the
next — teaches a legend, and the first critique it draws is always the same:
it is about details and the demo's particular numbers, not about what the
product is for. This technique fixes three things: the order of the path, the
grain of a step, and the gate that keeps the path honest as the product moves.

## The path follows the person, not the code

Order the path **as a person meets the product**: the first thing they must do
before anything else is meaningful, then what they watch once it runs, then
what they govern or decide, then how they improve it over time. That order is a
story with causes — each chapter is the reason the next one exists — and a
story is what a newcomer can retell. Module order has no causes in it; a
newcomer finishes it knowing twelve names and not why any of them exists.

Two steps belong before the story starts, and both are practical rather than
narrative. **Readability first**: when the product's default text size is
small for a first-time reader, the opening step points at the size control,
because every caption after it is read at that size. **Setup before need**: no
step shows a screen that presupposes an object — a project, an account, a
connection — before an earlier step has shown where that object is brought in.
A tour that opens on a populated dashboard has skipped the one act the person
must perform alone tomorrow.

## The chapters are the navigation's groups

When the navigation is grouped, the tour's chapters **are** those groups, in
the navigation's order, each whole and never interleaved. The tour then teaches
two things at once: what each screen is for, and where it lives — the person
leaves knowing that decisions are under the governing group because that is
the chapter in which they met them. A tour whose chapters are its own invention
teaches a second map of the product that the navigation contradicts the moment
the tour closes.

This makes the navigation's group order a curriculum decision, and the two
must be made together. If the order a person meets the product is not the order
the navigation lists its groups, one of them is wrong — usually the
navigation, which was ordered alphabetically or by when each group was built.
Fix the navigation; do not let the tour paper over it with a private order.

The chapters are read from the **one navigation authority** — the same
declaration the sidebar, the command palette and any recap read — never typed a
second time in the tour's content
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
The invitation that offers the tour names the chapters from the same source, so
the path is legible before the first step.

## One concept, shown in a situation

The unit of a step is **one concept shown in a situation**, not one screen and
not one column. A concept is an idea the person will need to act — that a
verdict is derived from checks, that autonomy is earned per class, that one
colour means "yours to decide". A situation is a real moment on the screen in
which the concept is visible: this change, merged without a click, because its
record cleared the bar. The caption names the concept once (a chip is enough)
and spends its sentence on the situation.

Numbers appear **only as part of the situation**. "Its record cleared the bar:
sixteen accepted, fourteen clean days" is a situation; "this column shows the
accepted count" is a legend. A step whose caption would read the same on any
row is describing the column, and should either find its situation or be cut.
The grain test is retelling: a newcomer who finished the tour should be able to
say each chapter's ideas back in a sentence each, without naming a field.

Short wins. Completion falls steeply with length, and a tour the person opened
themselves is finished far more often than one that started on them, so keep
the path to what fits in a couple of minutes and spend the length on chapters,
not on more steps per screen. A screen with three concepts is three steps only
if each is a situation the person will meet; otherwise it is one step and two
cuts.

## The path is tested against the navigation

The curriculum rules are mechanical enough to gate, and they drift silently
when they are not — a screen is added to the navigation and no chapter visits
it, or a step is moved and lands in another group's chapter. A small test reads
the navigation authority and the path and asserts:

- **Chapter order equals group order**, each chapter contiguous: the sequence
  of chapters with consecutive repeats removed equals the group list.
- **Every navigable screen is visited, inside its own group's chapter.** A
  screen the tour never visits is a screen the curriculum forgot; a screen
  visited from another chapter teaches the wrong address.
- **The opening is fixed**: readability first, then the step that brings the
  first object in.

The test reads the same declaration the sidebar renders
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)); a test over
a copied list of screens passes exactly when the copy and the navigation
disagree.

## When not to use it

A contextual hint — one step, on one screen, at the moment a feature first
becomes relevant — has no curriculum and needs none; this technique is for the
whole-product path. A product with a flat, ungrouped navigation still orders by
the person's journey, but has no groups to borrow chapters from; there the
chapters are the journey's phases and the gate checks only coverage and the
opening. And a tour that teaches one workflow end to end follows that workflow's
own steps, which belong to the workflow, not to the navigation.
