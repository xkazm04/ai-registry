---
subject: modal-stack
domain: software-engineering
last_touched: 2026-10-31
touched_by: external-reconcile
dry_streak: 0
---

# modal-stack

First touch: [[2026-08-23-2]], external reconcile against
`floating-ui/floating-ui` @ `0eb8c98` (core/dom 1.8.0). Gained
`node--anchored-positioning` (uncovered); single-stack debt cleared. Hint
confirmed; two sub-claims sharpened (middleware order is documentation-only;
autoUpdate deliberately omits exactly one mover, compositor transforms).
Executed evidence: a harness proved the 51-fire reset ceiling and the
bare-reset double-apply (x=30 vs x=20).

## Open leads (banked, convergence rule applies)

- When the arrow cannot point at the anchor after clamping, the OVERLAY
  yields - stronger than "align to the anchor".
- Any pipeline that replays its stages states whether the replay re-derives
  the base; coordinate mutators are not idempotent otherwise.
- "Declared boundary" splits into real-clipping-ancestors vs viewport - two
  policies, not one knob.
- The recomputation schedule gains a fifth mover: visual-viewport change
  (pinch-zoom, mobile keyboard).
- Deviation lead: a silent iteration ceiling that ships a WRONG position
  rather than an error (the 50-reset exit sets no flag).
- The ResizeObserver-vs-size() feedback loop and its
  unobserve-reobserve-next-frame fix - a general resize-derivation hazard.

## Cross-subject proposals

- Transformed-ancestor detection/compensation in the platform layer ->
  layering-and-precedence's context trap.
- useDismiss (outside-click territory incl. the anchor, escape routing) ->
  a future dismissal-semantics application from the same repo's react pkg.

## 2026-09-02 - leads placed by [[2026-09-02-1]]

- **Third-party overlays arrive with their own number.** Two tour engines mint
  their own z-index and cannot register into a product layering authority; the
  product wraps them via container options. A named condition for
  layering-and-precedence. From [[guided-tours]].
- Popover placement/collision (flip, shift, clipping to scroll parents) belongs
  to anchored-positioning, not to the tour subject. Recorded so it is not
  re-proposed there.

## Architecture review - 2026-10-31

First architecture review, against `e4622e121`. The golden path and five of six
techniques hold against the WAI-ARIA dialog pattern. Two techniques owe a web-platform
qualification: the browser top layer sits outside any number scale, and a native
modal dialog makes its document inert by itself. The Floating UI pin re-reads clean
for `computePosition.ts`. The consumer's `ConfirmDialog` changed on 2026-10-29, so
both react applications are reverify. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/modal-stack",
  "date": "2026-10-31",
  "baseline": "e4622e121",
  "digest": "sha256-b2:7848e4396b8a86da",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full (golden path, six techniques, three applications). Four primary sources opened this run and quoted; the consumer tree was read, not executed. Not evaluated: Floating UI files other than computePosition.ts at the pin, the consumer's census rule counts, any runtime. No verification date refreshed.",
  "counterexamples": [
    "A web dialog opened with showModal() renders in the browser's top layer, so no authored layer value on page content outranks it; 'no number escapes the scope' is true of numbers, not of the platform's top layer.",
    "A native modal dialog makes the rest of its document inert without application code, but leaves a parent page interactive when it lives in an embedded frame.",
    "Floating UI's autoUpdate tracks an anchor scrolled out of view unless the consumer adds the hide middleware: tracking without a dismiss policy is the reachable unpicked third state.",
    "A registry whose entries carry only a numeric id still gates Escape correctly while a backdrop click ungated on topmost can close a buried modal when paint order and stack order diverge."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      "result": "Read 2026-10-31. aria-modal only when both 'Application code prevents all users from interacting in any way with content outside of it' and 'Visual styling obscures the content outside of it'; initial focus generally 'the first focusable element', with the 'least destructive action' for hard-to-reverse steps; focus returns to 'the element that invoked the dialog' unless it no longer exists; 'Escape: Closes the dialog'; Tab wraps last-to-first. Supports focus-and-scroll-containment, dismissal-semantics and destructive-confirmation as written."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Glossary/Top_layer",
      "result": "Read 2026-10-31. The top layer 'sits on top of all other layers displayed in a web document'; it holds modal <dialog> via showModal(), popovers via showPopover(), fullscreen elements and an open customizable <select> picker. Refutes the unqualified 'no number, however large, escapes' as a description of the web platform: the top layer is an ordering system outside the number scale."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal",
      "result": "Read 2026-10-31. 'Elements inside the same document as the dialog, except the dialog and its descendants, become inert (as if the inert attribute is specified). Only the containing document becomes blocked; if the dialog is rendered inside an iframe, the rest of the page remains interactive.'"
    },
    {
      "url": "https://github.com/floating-ui/floating-ui/blob/0eb8c98/packages/core/src/computePosition.ts",
      "result": "Read pinned file 2026-10-31. MAX_RESET_COUNT = 50 at :11; rects and base coords at :37-38; middleware fold :44-76; reset gate :78, re-derivation only under typeof reset === 'object' at :81-94, i = -1 at :96. The application's computePosition citations hold. Other files at the pin were not reopened."
    },
    {
      "source": "Consumer tree at 22260d77 (2026-10-31), read-only",
      "result": "BaseModal.tsx still carries Z_INDEX_BASE = 50 / Z_INDEX_PORTAL_BASE = 10000 at :8-9, isTopmost ?? true at :157, the topmost Escape gate at :200 and an ungated onClick={onClose} at :283; initial focus is first-focusable at :187-196. ConfirmDialog.tsx changed 2026-10-29: it is now 100 lines (the application says 50) and a rejected onConfirm now toasts before re-enabling; its cited line ranges have shifted. Nothing was executed."
    }
  ],
  "documents": {
    "modal-stack.md": {
      "disposition": "keep",
      "reason": "The two-axis model, when-to-use-a-modal criteria, one owned stack, dismissal by investment, stack-aware containment and the layer policy are consistent with the techniques and with the APG dialog pattern. The layering paragraph defers the platform top-layer caveat to its technique, which is the right home."
    },
    "techniques/stack-ownership.md": {
      "disposition": "keep",
      "reason": "One door, identity-addressed entries, top-owns-input, render-as-fold, the registry variant with its stated cost, cascade-or-refuse for non-top closes, and the navigation and owner-death reapers are coherent and match what the react application measures. Depth-past-two is a stated heuristic, not a claimed law."
    },
    "techniques/dismissal-semantics.md": {
      "disposition": "keep",
      "reason": "Escape addresses the top only (APG: 'Escape: Closes the dialog'); territory includes anchor and stacked children; judge on press; arm the outside listener after the opening press; cancel/dismiss/complete distinct; the dirty-only guard as a stack citizen. No primary source contradicts it."
    },
    "techniques/focus-and-scroll-containment.md": {
      "disposition": "clarify",
      "reason": "Enter/cycle/return and the aria-modal both-halves rule match the APG text read this run. Owed: state that on the web a showModal() dialog gets background inertness from the platform (as if inert were set), and that the block stops at the document boundary, so a modal inside an embedded frame leaves the parent page interactive (MDN showModal)."
    },
    "techniques/anchored-positioning.md": {
      "disposition": "keep",
      "reason": "Position as derivation, measure-not-assume, flip/shift/resize, atomic commit, the named recomputation schedule and the track-or-dismiss fork are confirmed by the Floating UI application. Banked leads (visual-viewport mover, overlay-yields arrow rule, silent reset ceiling) are applications-level observations and need no technique change."
    },
    "techniques/layering-and-precedence.md": {
      "disposition": "clarify",
      "reason": "Bands, names-not-numbers, stack-orders-within-band, backdrops per entry and the stacking-scope trap are sound. Owed: 'no number, however large, escapes it' needs the web platform's top layer stated as the exception the number scale cannot reach (showModal dialogs, shown popovers, fullscreen elements; MDN Top layer), and that a product mixing top-layer and number-ranked overlays runs two ordering systems."
    },
    "techniques/destructive-confirmation.md": {
      "disposition": "keep",
      "reason": "Confirm vs undo by reversibility and blast radius, object and consequence named, verb labels, count with predicate, safe default focus (APG: 'least destructive action' for hard-to-reverse steps), light dismissal means keep, honest failure in place, proportional friction. Consistent."
    },
    "applications/node--anchored-positioning.md": {
      "disposition": "keep",
      "reason": "The pinned computePosition.ts was re-read this run and its cited lines (:11, :37-38, :44-76, :78-97, :81, :93) hold. The other cited files at 0eb8c98 were not reopened, so verified_on stays 2026-08-23."
    },
    "applications/react--stack-ownership.md": {
      "disposition": "reverify",
      "reason": "BaseModal citations spot-checked against the consumer tree today and still hold (two z bases :8-9, provider fallback :157, Escape gate :200, ungated backdrop :283). But ConfirmDialog is now 100 lines, not '50 lines with zero overlay code', and the 129/20 census counts were not re-run. Needs a fresh census sweep and a line-anchor pass."
    },
    "applications/react--destructive-confirmation.md": {
      "disposition": "reverify",
      "reason": "ConfirmDialog changed 2026-10-29: cited ranges (:37-55, :44-49, :84-88) have shifted, and a rejected onConfirm now raises a toast before re-enabling, which strengthens the confirm-then-fail point but is not what the text says. BaseModal first-focusable at :187-196 still holds. ConfirmDestructiveModal and useUnsavedGuard anchors were not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items above, from the MDN pages opened this run. The
applications were not edited and keep `reverify`, now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/modal-stack",
  "date": "2026-10-31",
  "baseline": "e4622e121",
  "digest": "sha256-b2:e9e7c33a5593a682",
  "disposition": "reverify",
  "coverage": "All 10 documents decided. The two clarify items from the record above were applied and the edited sections re-read; the other eight documents are byte-unchanged and keep their dispositions. The two react applications keep reverify for the drift recorded above, which is now the overall disposition. No verification date refreshed.",
  "counterexamples": [
    "A web dialog opened with showModal() renders in the browser's top layer, so no authored layer value on page content outranks it; 'no number escapes the scope' is true of numbers, not of the platform's top layer.",
    "A native modal dialog makes the rest of its document inert without application code, but leaves a parent page interactive when it lives in an embedded frame.",
    "Floating UI's autoUpdate tracks an anchor scrolled out of view unless the consumer adds the hide middleware: tracking without a dismiss policy is the reachable unpicked third state.",
    "A registry whose entries carry only a numeric id still gates Escape correctly while a backdrop click ungated on topmost can close a buried modal when paint order and stack order diverge."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      "result": "Read 2026-10-31. aria-modal only when both 'Application code prevents all users from interacting in any way with content outside of it' and 'Visual styling obscures the content outside of it'; initial focus generally 'the first focusable element', with the 'least destructive action' for hard-to-reverse steps; focus returns to 'the element that invoked the dialog' unless it no longer exists; 'Escape: Closes the dialog'; Tab wraps last-to-first. Supports focus-and-scroll-containment, dismissal-semantics and destructive-confirmation as written."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Glossary/Top_layer",
      "result": "Read 2026-10-31. The top layer 'sits on top of all other layers displayed in a web document'; it holds modal <dialog> via showModal(), popovers via showPopover(), fullscreen elements and an open customizable <select> picker. Refutes the unqualified 'no number, however large, escapes' as a description of the web platform: the top layer is an ordering system outside the number scale."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal",
      "result": "Read 2026-10-31. 'Elements inside the same document as the dialog, except the dialog and its descendants, become inert (as if the inert attribute is specified). Only the containing document becomes blocked; if the dialog is rendered inside an iframe, the rest of the page remains interactive.'"
    },
    {
      "url": "https://github.com/floating-ui/floating-ui/blob/0eb8c98/packages/core/src/computePosition.ts",
      "result": "Read pinned file 2026-10-31. MAX_RESET_COUNT = 50 at :11; rects and base coords at :37-38; middleware fold :44-76; reset gate :78, re-derivation only under typeof reset === 'object' at :81-94, i = -1 at :96. The application's computePosition citations hold. Other files at the pin were not reopened."
    },
    {
      "source": "Consumer tree at 22260d77 (2026-10-31), read-only",
      "result": "BaseModal.tsx still carries Z_INDEX_BASE = 50 / Z_INDEX_PORTAL_BASE = 10000 at :8-9, isTopmost ?? true at :157, the topmost Escape gate at :200 and an ungated onClick={onClose} at :283; initial focus is first-focusable at :187-196. ConfirmDialog.tsx changed 2026-10-29: it is now 100 lines (the application says 50) and a rejected onConfirm now toasts before re-enabling; its cited line ranges have shifted. Nothing was executed."
    }
  ],
  "documents": {
    "modal-stack.md": {
      "disposition": "keep",
      "reason": "The two-axis model, when-to-use-a-modal criteria, one owned stack, dismissal by investment, stack-aware containment and the layer policy are consistent with the techniques and with the APG dialog pattern. The layering paragraph defers the platform top-layer caveat to its technique, which is the right home."
    },
    "techniques/stack-ownership.md": {
      "disposition": "keep",
      "reason": "One door, identity-addressed entries, top-owns-input, render-as-fold, the registry variant with its stated cost, cascade-or-refuse for non-top closes, and the navigation and owner-death reapers are coherent and match what the react application measures. Depth-past-two is a stated heuristic, not a claimed law."
    },
    "techniques/dismissal-semantics.md": {
      "disposition": "keep",
      "reason": "Escape addresses the top only (APG: 'Escape: Closes the dialog'); territory includes anchor and stacked children; judge on press; arm the outside listener after the opening press; cancel/dismiss/complete distinct; the dirty-only guard as a stack citizen. No primary source contradicts it."
    },
    "techniques/focus-and-scroll-containment.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a paragraph after the assistive-claim rule stating that a showModal() dialog makes the rest of its document inert as if the inert attribute were set, and that the block stops at the document boundary (MDN showModal)."
    },
    "techniques/anchored-positioning.md": {
      "disposition": "keep",
      "reason": "Position as derivation, measure-not-assume, flip/shift/resize, atomic commit, the named recomputation schedule and the track-or-dismiss fork are confirmed by the Floating UI application. Banked leads (visual-viewport mover, overlay-yields arrow rule, silent reset ceiling) are applications-level observations and need no technique change."
    },
    "techniques/layering-and-precedence.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the context-trap section now names the browser top layer (showModal dialogs, shown popovers, fullscreen elements) as the escape authored numbers cannot reach, a structural root rather than a band, and asks a product mixing top-layer and number-ranked overlays to say which families live in which (MDN Top layer)."
    },
    "techniques/destructive-confirmation.md": {
      "disposition": "keep",
      "reason": "Confirm vs undo by reversibility and blast radius, object and consequence named, verb labels, count with predicate, safe default focus (APG: 'least destructive action' for hard-to-reverse steps), light dismissal means keep, honest failure in place, proportional friction. Consistent."
    },
    "applications/node--anchored-positioning.md": {
      "disposition": "keep",
      "reason": "The pinned computePosition.ts was re-read this run and its cited lines (:11, :37-38, :44-76, :78-97, :81, :93) hold. The other cited files at 0eb8c98 were not reopened, so verified_on stays 2026-08-23."
    },
    "applications/react--stack-ownership.md": {
      "disposition": "reverify",
      "reason": "BaseModal citations spot-checked against the consumer tree today and still hold (two z bases :8-9, provider fallback :157, Escape gate :200, ungated backdrop :283). But ConfirmDialog is now 100 lines, not '50 lines with zero overlay code', and the 129/20 census counts were not re-run. Needs a fresh census sweep and a line-anchor pass."
    },
    "applications/react--destructive-confirmation.md": {
      "disposition": "reverify",
      "reason": "ConfirmDialog changed 2026-10-29: cited ranges (:37-55, :44-49, :84-88) have shifted, and a rejected onConfirm now raises a toast before re-enabling, which strengthens the confirm-then-fail point but is not what the text says. BaseModal first-focusable at :187-196 still holds. ConfirmDestructiveModal and useUnsavedGuard anchors were not reopened."
    }
  }
}
```
