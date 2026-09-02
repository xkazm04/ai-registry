---
layer: application
type: application
subject: guided-tours
technique: overlay-precedence
stack: node
status: forged
verified_on: 2026-09-02
---

# Overlay precedence in Shepherd — a scoped focus loop, Escape that leaves, and a cutout that stays live

How the framework-agnostic tour engine `shepherd.js` realizes the
[overlay-precedence](../techniques/overlay-precedence.md) technique's conduct
rules: focus, Escape, the dimming shield, and teardown. Read in the
`shepherd-pro/shepherd` monorepo at commit `5d4173d` (2026-09-01), package
`shepherd.js` 15.3.0 (released 2026-08-24 per `CHANGELOG.md`),
`shepherd.js/src/`; citations resolved against that tree on 2026-09-02. This
reconciles an external tree, not the consumer repo the sibling applications
cite, so the pin lives in prose, not `verified_against`. Accessibility
criteria below are cited from WCAG 2.2, W3C Recommendation edition of
12 December 2024.

## Focus: a trap scoped to dialog plus anchor, not to the dialog

The step's popover is a native `<dialog>` element, built open, with
`aria-labelledby` / `aria-describedby` wired to its title and text
(`components/shepherd-element.ts:136-150`).
After positioning, focus is forced onto it — with a 300 ms delay and
`preventScroll` (`utils/floating-ui.ts:100-113`) — so a keyboard or
assistive user learns the step exists, as the technique asks.

What happens to Tab afterwards is the field's compromise the technique now
names. `handleKeyDown` (`shepherd-element.ts:68-108`) intercepts Tab and
cycles focus over two sets: the focusable descendants of the dialog, and the
focusable descendants of the *attached element*, which is itself made
focusable with `tabIndex = 0` and given the same keydown handler
(`shepherd-element.ts:175-200`). The loop runs dialog → anchor → dialog. The
anchored control is reachable — the mouse-only-coaching failure does not
occur — but nothing else on the page is: the path *to* the anchor and any
control beside it are outside the loop. This satisfies the no-keyboard-trap
criterion (SC 2.1.2, level A) on the strength of Escape being a standard
exit, which is why the `exitOnEsc` default matters more here than it looks.

The original `tabindex` of the anchor is recorded before it is overwritten
and restored on hide (`step.ts:643-665,909`), so the tour does not leave a
control focusable that was not before.

## Escape leaves; arrows navigate; both can be turned off

`exitOnEsc` and `keyboardNavigation` default to `true` (`tour.ts:137-142`).
Escape inside the dialog or the anchor calls `step.cancel()` after
`preventDefault` and `stopPropagation` (`shepherd-element.ts:109-115`) —
leave, not advance, exactly as the technique requires when the tour is
topmost. Because the handler is bound on the dialog and the anchor rather
than on the document, an Escape pressed while focus is on a dialog *above*
the tour never reaches the tour: the technique's "escape belongs to the
surface above" holds structurally, not by policy.

One opt-in cuts against the subject's one-gesture rule. `confirmCancel`
(`tour.ts:36-44,224-243`) interposes a `window.confirm` — or an async
predicate — before cancelling. It is off by default; a product that turns it
on has chosen a confirmation chain on the exit gesture, and the technique's
rule is the reason not to.

## The shield: the dim is inert to pointers, the cutout is a hole

With `useModalOverlay`, the overlay is a fixed SVG whose single `path` is the
dim with an even-odd opening cut around the target
(`components/shepherd-modal.ts:53-78,97-174`, `utils/overlay-path.ts`). The
container has `pointer-events: none` and the path `pointer-events: all`
(`components/shepherd-modal.css:6,27-28`), so clicks on the dim are absorbed
by the path and clicks inside the opening fall through to the live control —
the tour option's own doc says the opening exists "so that it can remain
interactive" (`tour.ts:90-95`). The technique's "a hole in the shield, not a
picture of one" is the literal geometry.

Making the anchor inert is a declared step property, as the technique
wants: `canClickTarget: false` adds `shepherd-target-click-disabled`, whose
rule is `pointer-events: none` on the target and its descendants
(`step.ts:89-96,866-876`; `components/shepherd-element.css:94-98`). The
15.3.0 changelog carries a fix making that class survive a custom
`classPrefix` (#3481) — the option is load-bearing enough to have a bug
history.

Two things pass through the shield that the technique would want named:
the overlay blocks `touchmove` on the body while a step is open
(`shepherd-modal.ts:200-225`), which is a scroll lock on touch only, and
nothing in the overlay knows about toasts or other overlays — the tour
appends to `document.body` at `z-index: 9997` (`shepherd-modal.css:14`,
`tour.ts:71-80`) unless the integrator supplies `modalContainer` /
`stepsContainer`. Registering into the product's layering authority is left
to the caller; the engine mints its own number.

## Teardown restores focus unconditionally

`_done()` (`tour.ts:442-470`) runs for both `cancel` and `complete`: it
destroys every step, hides and destroys the modal, clears the active tour,
and finally refocuses `focusedElBeforeOpen` — captured at `start()`
(`tour.ts:426-427`) — if it is still an element. Every exit path in the
engine funnels through this one method, which is the technique's "runnable
from any state" made structural. The focus-not-obscured criterion
(SC 2.4.11, level AA) is met for the anchor by construction — the cutout
tracks it — and for the dialog because the dialog is above the dim; the
scoped trap means focus can never land on a dimmed control at all.

## Where the tree falls short of the standard (kept, not hidden)

- **The trap has no per-step off switch.** A step that asks the user to
  operate something beside the anchor cannot free Tab for that step; the
  loop is unconditional whenever an anchor is attached.
- **The engine mints its own layer number** (9997 for the overlay,
  `shepherd-modal.css:14`; 9999 for the step, `shepherd-element.css:16`)
  rather than registering with a product-level scale; unrelated dialogs
  and critical alerts are not detected, so the technique's pause-on-modal
  conduct is the integrator's to build from `hide()` / `show()`.
- **Focus is forced on a fixed 300 ms timer**, not on positioning
  completion; a slow layout can have focus arrive before the dialog is where
  the user will look.
- **Escape uses `keyCode`** (`shepherd-element.ts:70,109`), a deprecated
  property; functional today, but the kind of thing a future runtime removes.
