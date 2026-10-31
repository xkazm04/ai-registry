---
layer: application
type: application
subject: modal-stack
technique: destructive-confirmation
stack: react
verified_on: 2026-10-31
---

# ConfirmDialog + ConfirmDestructiveModal — proportional friction in this repo

The repo implements the technique's two friction tiers as two shared
primitives, both composed on `BaseModal` (so they inherit stacking, escape
gating, and focus behavior for free), plus a hook that keeps call sites
declarative.

## Tier 1 — lightweight: `ConfirmDialog`

`src/features/shared/components/feedback/ConfirmDialog.tsx` replaces the
OS-native `confirm()`:

- `danger` switches the confirming button to the rose danger treatment
  (`:89-93`) — one danger idiom, reused, so red reads as red reflexively.
- `confirmLabel` / `cancelLabel` let call sites supply the **verb**; the
  defaults are generic `t.common.confirm` / `t.common.cancel` (see
  shortfalls).
- **Confirm-then-fail is handled**: `onConfirm` may return a promise; while
  pending, `busy` disables both buttons, sets `aria-busy`, and the same flag
  makes `handleCancel` a no-op — so escape and backdrop dismissal are inert
  mid-flight (`:38-60`). Double-click, trackpad bounce, and impatient retry
  cannot fire the action twice; if the action throws, the dialog re-enables
  for retry rather than closing optimistically (`:43-54`).
- Light dismissal means "keep": `onClose={handleCancel}` — escape and
  backdrop resolve as the safe choice, never as confirm.

## Tier 2 — heavyweight: `ConfirmDestructiveModal` + `useConfirmDestructive`

`src/features/shared/components/overlays/ConfirmDestructiveModal.tsx`
escalates friction exactly along the technique's ladder:

- **Names the object and consequence**: `title` + `message` + optional
  `details` key-value rows (`:100-109`) putting the blast target on screen by
  name, and a `warningMessage` banner for the permanent-loss statement.
- **Explicit scope acknowledgment**: the `blastRadius?: ReactNode` slot
  (`:21-24`) renders host-provided impact UI (e.g. `BlastRadiusPanelLazy`)
  above the actions — the host owns fetching so the primitive stays
  domain-free.
- **Typed confirmation**: `requireTypedConfirmation` (`:25-29`, `:122-140`)
  gates the destructive button on typing the exact object name —
  recognition converted to recall, reserved by convention for high-impact
  deletions (persona names, credential names).
- **The safe action is the default**: cancel precedes the destructive button
  in source order, and `BaseModal`'s initial-focus rule ("first focusable",
  `BaseModal.tsx:187-196`) therefore lands on cancel — the destructive
  action is never pre-armed. With typing required it is also `disabled`
  until the name matches (`:156`).
- `useConfirmDestructive()` (`:234-264`) owns open/config state so call
  sites write `confirm({ title, message, onConfirm })` and render
  `<ConfirmDestructiveModal {...modal} />` — one door, no scattered
  booleans.

The unsaved-work sibling — `UnsavedChangesModal` +
`useUnsavedGuard` (`src/hooks/utility/interaction/useUnsavedGuard.ts`) —
shows the same resolution discipline from the dismissal technique: three
distinguishable exits (`save` / `discard` / `stay`), all dismissal gestures
resolving to `stay`, and a failed save returning the user to the page
instead of navigating over the wreckage (`:145-161`).

## Where the repo falls short of the standard (kept, not hidden)

- **Default labels are not verbs.** `ConfirmDialog` falls back to
  `Confirm`/`Cancel`; the technique wants the verb on the button
  ("Delete project"). The prop exists; the default should be treated as a
  last resort, and `ConfirmDestructiveModal`'s default (`t.common.delete`)
  is closer to right.
- **Initial focus lands on cancel by accident, not by contract.** It is a
  consequence of source order plus first-focusable — reordering the action
  row would silently pre-arm the destructive button. Nothing encodes "focus
  the safe action" as an intention.
- **No undo tier.** The repo's ladder starts at confirmation; the
  technique's first rung — perform-then-undo for reversible actions — has
  no shared primitive, so reversible flows tend to get a `ConfirmDialog`
  they should not need.
- **Typed input auto-focuses** (`:137`), which is correct here (the field is
  the arming mechanism, not the trigger), but note the enter key in that
  field must not submit while the name mismatches — currently guarded only
  by the button's `disabled`.

## Re-checked 2026-10-31 at personas@61029d7ae0

Every citation above was resolved again, both at the tree of 2026-08-18 and
at this commit. Line anchors in the three moved files are updated in place.
Three behaviours changed under the text, and one shortfall is now partly
answered elsewhere:

- **`ConfirmDialog` now reports a failed action** (changed 2026-10-21). A
  rejected `onConfirm` used to escape the click handler as an unhandled
  rejection while the dialog re-enabled. It now raises a toast through
  `toastCatch` before re-enabling (`ConfirmDialog.tsx:45-48`). The
  confirm-then-fail point above holds, and the failure is now visible.
- **The heavyweight tier was not busy-guarded when this was written.** At the
  2026-08-18 tree `useConfirmDestructive` called `onConfirm` without awaiting
  it and closed at once. Now the modal holds a `busy` flag that disables both
  buttons and disarms Escape and backdrop dismissal (`:176-199`). The hook
  awaits the action before closing (`:251-254`), and a failed delete keeps the
  typed name so the user need not retype it (`:69-76`). The two tiers now
  share the confirm-then-fail discipline the body credits to Tier 1 alone.
- **A failed save no longer closes the unsaved-work modal.** It used to close
  the modal and leave the user on the dirty page with no message. Now the
  modal stays open, keeps the pending navigation and states the failure, with
  Stay and Discard still offered (`useUnsavedGuard.ts:145-161`). "Never
  navigate over the wreckage" holds more strongly than the body says.
- **One primitive now encodes the safe-focus contract.** `ConfirmPopover`
  (`src/features/shared/components/feedback/ConfirmPopover.tsx`, added
  2026-09-24) is an anchored confirm for actions next to their trigger. With
  `tone="danger"` it focuses Cancel on purpose (`:99-106`). The shortfall
  "initial focus lands on cancel by accident" still holds for `ConfirmDialog`
  and `ConfirmDestructiveModal`, which this application describes.

The default-label, undo-tier and typed-input shortfalls are unchanged.
