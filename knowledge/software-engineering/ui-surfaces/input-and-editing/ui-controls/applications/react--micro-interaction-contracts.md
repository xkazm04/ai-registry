---
layer: application
type: application
subject: ui-controls
technique: micro-interaction-contracts
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# React application — micro-interaction contracts

How this repo's shared primitives implement the small-control contracts, and
the seams where the contracts are still open.

## Copy affordance — the strongest contract in the tree

Three layers, each with one job:

- `src/hooks/utility/interaction/useCopyToClipboard.ts:11-19` — `copyText()`
  is the declared ONE place `navigator.clipboard.writeText` lives; failure
  posts a breadcrumb via `silentCatch` and resolves `false`, never throws.
- The hook (`useCopyToClipboard.ts:27-53`) adds the timed feedback window
  (default 2000ms), restarts cleanly on re-press (`clearTimeout` before
  re-arm, line 45), and clears the timer on unmount so a fast
  unmount-after-copy cannot set state on a dead component.
- `src/features/shared/components/buttons/CopyButton.tsx` renders the
  receipt — icon morph, emerald flash, label swap — and enforces
  **no success theater**: an empty string gets no flash
  (`CopyButton.tsx:62-66`, comment: "claiming success is theater"), and the
  hook already suppresses the flash when the write itself failed
  (`useCopyToClipboard.ts:42-43`). It also supports a managed mode
  (`copied`/`onCopy` props, `CopyButton.tsx:51-53`) for async copy flows
  where the text is fetched first.

Adoption is near-total: outside the canonical door, production code contains
exactly one raw `writeText` (`src/features/plugins/fleet/fleetTerminalManager.ts`),
plus one e2e test. Census rule `unverified-clipboard-write` watches the
signature. Contract gaps, measured: the copied state is *visual + tooltip*
only — no live-region announcement of "copied" for screen readers (the
`sr-only` obligation sits in the accessibility subject's announcer, which
`CopyButton` does not call); and `CopyButton.tsx:76` sets a native `title=`
attribute as fallback alongside the shared `Tooltip` wrap — the exact
signature census rule `native-title-tooltip` exists to catch, living inside
the primitive that is supposed to retire it.

Re-checked 2026-10-31 at personas@22260d77: the native `title=` is gone.
`CopyButton.tsx:76-78` is now a comment ("No native `title`: the shared
Tooltip below already shows this text") and the icon-only form is named by
`aria-label` (`:79`). That half of the gap is closed; the missing
live-region announcement still holds.

## Tooltip — timing from the token ladder

`src/features/shared/components/display/Tooltip.tsx`:

- Open delay defaults to `MOTION.delay.tooltip.default`
  (`Tooltip.tsx:213`; ladder defined in `src/lib/utils/designTokens.ts:75-86`
  with `fast` 150ms for dense surfaces) — the "timing constants come from
  the motion vocabulary" clause, literally.
- `aria-describedby` links trigger to tip via a stable `useId`
  (`Tooltip.tsx:226,310`), `role="tooltip"` at 342, Escape dismisses without
  moving focus (`Tooltip.tsx:327`), and placement flips then clamps to the
  viewport (`resolvePlacement`/`clampToViewport`, lines 78-113).
- The `triggerFocusable` seam (`Tooltip.tsx:22-29`) exists for inert
  children: a disabled button cannot take hover or focus, so the wrapper
  becomes the focusable, `aria-disabled` carrier. `Button`'s
  `disabledReason` prop rides exactly this seam (`Button.tsx:278-295`) —
  the disabled-control-explains-itself contract, minted once.

Open seams: no "warm mode" (moving between adjacent triggers re-pays the
full delay each time), and Escape-dismiss is wired only on the
`triggerFocusable` branch — a focused enabled trigger showing a tooltip has
no keyboard dismiss.

Re-checked 2026-10-31 at personas@22260d77: the Escape seam is closed.
`Tooltip.tsx:311-327` now wires `onKeyDown` Escape on the trigger wrapper for
every tooltip, not only `triggerFocusable` ones (React events bubble through
the `display:contents` span); the stated residue is a hover-opened tip with
focus elsewhere, dismissed by moving the pointer. No warm mode still holds.

## Toggle — switch semantics minted once

`src/features/shared/components/forms/AccessibleToggle.tsx` is 65 lines and
carries the whole contract: `role="switch"` + `aria-checked` + `aria-label`
(lines 44-46), Enter/Space activation (31-39), and an `sr-only`
enabled/disabled state echo (line 62). It is deliberately a *switch* — the
checkbox-in-a-form case is a different control owned by the form field
primitives. Consumers supply `checked`/`onChange` (controlled-only, chosen
deliberately); the visual thumb travel is internal.

## Stepper — bounds at every door, two event tiers

`src/features/shared/components/forms/NumberStepper.tsx` implements the
contract almost clause for clause:

- clamp + step-precision rounding at one door (`clamp`, lines 71-80),
  applied to buttons, arrow keys, and typed commits alike;
- **draft vs commit split** — `onChange` fires live, `onCommit` fires once
  per settled interaction and only if the value changed
  (`NumberStepper.tsx:17,93-105`), so expensive consequences (IPC) never
  bind to keystrokes — this repo is where the technique's "two event
  tiers" clause was learned;
- hold-to-repeat with acceleration (`NumberStepper.tsx:124-160`), release
  settles the commit;
- `allowEmpty`/`value: null` models the cleared-field draft state
  (`NumberStepper.tsx:8,23`) instead of coercing mid-edit.

## Tab strip — identity keys, roving arrows, dangling wiring

`src/features/shared/components/layout/PanelTabBar.tsx` and
`layout/SegmentedTabs.tsx` both key tabs by `id: T extends string` (never
index), render `role="tablist"`/`role="tab"`/`aria-selected`, and rove with
ArrowLeft/Right/Home/End skipping disabled tabs (`PanelTabBar.tsx:51-70`) —
the roving was added when its absence was measured ("every tab sat in the
Tab order and arrow keys did nothing", comment at lines 46-50). Selection is
manual-activation (arrow moves focus, click/Enter selects) — the right
default for panels that fetch.

Re-checked 2026-10-31 at personas@22260d77: neither strip is
manual-activation at HEAD. `PanelTabBar.tsx:66` calls `onTabChange` on every
arrow/Home/End move, and `SegmentedTabs.tsx:48-77` (`focusEnabled` /
`focusEdge`) does the same — arrows select as they move (automatic
activation). The roving and disabled-skip hold; the manual-activation
description above no longer matches the code.

The open defect is the tab↔panel wiring: `aria-controls` renders only when
callers pass `idPrefix` (`PanelTabBar.tsx:85-86`), and deferred fix #33
measured **21 of 21 tab strips with dangling or absent `aria-controls`**
(registered under the accessibility subject's anchor, `w10-accessibility`).
Census rule `tabstrip-with-no-declared-panel` now watches the signature. An
optional wiring prop is the contract's weak form — the strips promise
relationships the call sites never mint.
