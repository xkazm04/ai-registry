---
layer: technique
type: technique
subject: guided-tours
technique: product-performed-effects
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a tour step must show something happening, not just point at it, tempted to rebuild product screens inside the tour, a step where the person should perform the real action]
---

# Product-performed effects

Some steps cannot be taught by pointing. A verdict assembling check by check, a
tab that holds the evidence, a class losing its autonomy — the concept is the
motion, and a still spotlight on the end state teaches only the end state. The
tempting answer is to make the motion in the tour: animate a copy of the
panel, fake the checks landing, rebuild the screen inside the tour's own page
where every frame is under control. That copy is a second product, and it is
the failure the subject exists to prevent — it narrates something that is not
the product, and it rots the first time the real screen changes.

The standard is the inverse. **The tour presses the product's own controls**
and lets the product perform. If the screen has a replay, the tour presses the
replay; if the evidence sits behind a tab, the tour selects the tab. The tour
is a layer over the real application, and the only things it draws itself are
the marks a layer may own — the spotlight, a pointer, a sweep across the
element the step is about.

## Effects are declared, ordered, and run once per entry

Each step declares its effects as data, from a small closed set the tour
engine knows how to perform: select a tab, press a named control, play a
layer-drawn mark. The engine runs them **in declared order**, each one only
when the previous has landed — a replay inside a tab waits until the tab is
selected and its control exists — and **once per entry into the step**. Entry
is keyed by the tour's run and the step, so stepping back into a step sets the
screen up again, while a re-render or a resize inside the step never presses
a control twice.

Each effect resolves its control the way a step resolves its anchor: through a
declared identifier the screen maintains, found only among drawn elements (a
screen kept alive but hidden is in the document and must not be pressed). The
effect fires only when the control is **pressable now** — present, drawn, not
disabled — and otherwise waits on the step's normal tick. That is the
gate-sees-target rule applied to effects
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)): the engine
observes the real control's state, not the elapsed time since navigation, and a
disabled replay is a fact the step waits on rather than a click it fires into.

A pressed control is the **product's** behaviour with the product's own
consequences. Press only controls whose effect is safe to perform for a
viewer: read-only replays, view switches, expansions. A control that writes,
sends or spends is never pressed by the tour; it is a step where the person
acts.

## Steps where the person acts

The strongest step of all is the one where the tour stops performing and the
**person does the real thing**: reads the note, presses the real button, sees
the real consequence. The step declares that it **holds** — autoplay stops
there, a pointer marks where to act, and the caption says what the click will
do and what it will not ("your click stages the exact write; nothing runs until
you press run"). The action the person takes is the product's, through the
product's own door, with its own confirmation and its own record.

Holding is a pacing decision, not a completion rule, and it must not pretend to
be one. Where the product exposes the resulting state, the hold step completes
on it as [action-driven-advancement](./action-driven-advancement.md) requires;
where it does not, the step waits for the person's own next, and the completion
ledger records that the step was moved past, not that the action happened.

When the tour runs on a declared demonstration plane, a write the person
performs there is the plane's simulated write and the caption says so. The
tour never makes the write safe by intercepting it; safety is the plane's
property, not the tour's.

## The layer's own marks are few

What the tour may draw is a short, named list, and every item on it stays
pointer-transparent so the screen underneath remains live: the spotlight that
dims the rest, a ghost pointer where the person acts, and at most one or two
step-specific sweeps that mark a change the product makes but does not
animate. Each mark plays only on the step's own live element (see
[spotlight-continuity](./spotlight-continuity.md)). A mark that starts to carry
content — numbers, labels, a panel — has become a copy of the product and goes
back to the screen that owns it.

## What this technique refuses

- A rebuilt or mocked copy of a product screen inside the tour.
- Faked motion where the product has a control that performs it.
- An effect fired on a timer rather than on the control being pressable.
- An effect that runs again on re-render, or not again on re-entry.
- The tour pressing a control that writes, sends or spends.
- A hold step whose completion record claims an action nobody observed.

## When not to use it

A product with no performable motion — a static settings surface, a form —
needs no effects; spotlight and caption are the whole step. A video or a
recorded walkthrough for people who will not run the product is a different
medium with honest strengths of its own; this technique is for the in-product
tour, where the screen is real and must stay so.
