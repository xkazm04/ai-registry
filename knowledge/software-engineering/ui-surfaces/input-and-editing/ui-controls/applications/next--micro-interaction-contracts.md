---
layer: application
type: application
subject: ui-controls
technique: micro-interaction-contracts
stack: next
status: forged
verified_on: 2026-09-01
verified_against: next@16
---

# One flag for two modalities (kp, Next 16 / React 19)

A survey of every hover-or-focus reveal in the `kp` recruiting app, at HEAD
`c6a63199`. The subject is the tooltip contract's state shape: the app has
three reveals that share **one** open flag between pointer and keyboard, and
one reveal that gets the OR right by never holding React state at all. The
correct-by-state shape — separate `hovered` and `focused` booleans OR'd for
the reveal — does not appear anywhere in the tree; `isHovered`/`isFocused`
return no hits outside prose.

## The shared-flag shape, three times

**Skill chip evidence tooltip** — `app/_components/results/job-fit/SkillChips.tsx`.
One `open` boolean carries both modalities:

```
57:  const [open, setOpen] = useState(false);
59:  const showTip = Boolean(evidenceSnippet) && open;
93:      onMouseEnter={() => setOpen(true)}
94:      onMouseLeave={() => setOpen(false)}
100:        onClick={() => setOpen((prev) => !prev)}
104:        onBlur={() => setOpen(false)}
```

The keyboard path opens via click/Enter (line 100) rather than focus, and is
torn down by `onBlur` (104) — but the pointer's `onMouseLeave` (94) writes the
same flag. A keyboard user who opened the evidence with Enter loses it the
instant the mouse crosses the chip on its way elsewhere. The comments at
lines 61-63 and 84-88 show the author reasoning explicitly about the two input
modes and still landing on one flag, which is the point: the defect is a state
*shape*, not an oversight about which modalities to serve.

**Salary gauge scrub readout** — `app/_components/results/salary/SalaryGauge.tsx`.
`hover` doubles as the pointer position and the keyboard readout:

```
152:        onMouseLeave={() => setHover(null)}
154:        onFocus={() => { if (!degenerate && !hover) scrubTo(midpoint); }}
157:        onBlur={() => setHover(null)}
```

The readout guard is `hover ? … : null` (120-126), so a `mouseleave` while the
slider still holds keyboard focus wipes the readout *and* reverts
`aria-valuenow`/`aria-valuetext` (147-148) — the announcement a keyboard user
is steering by disappears because a pointer moved.

**Feature-card preview** — `app/landing/spark/sections/FeatureGrid.tsx`. The
shared flag is lifted into the parent as `preview: PreviewKey | null` (46-50)
and both modalities write it; both `onHoverEnd` (77-79) and `onBlur` (82-84)
close it, guarded only by `pinned`. An unpinned card holding focus loses its
preview on pointer-out.

## The one that gets it right — and does it in CSS

`app/features/hiring/pipeline/PipelineCandidateRow.tsx:267` reveals a row
action with no state at all:

```
opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100
```

Three independent conditions, each raising opacity on its own, none able to
lower another — the OR expressed as three additive rules rather than one
mutable boolean. It also picks up the third modality (`pointer-coarse:`) that
a two-flag React implementation would still have missed. Where the reveal is
purely presentational, this is the cheaper correct answer: CSS has no shared
flag to desynchronize. State is only required when the tip's *content* must be
computed or announced, which is exactly the three cases above.

## Hover-only reveals — the same contract, failed earlier

Two places never wire the focus half at all:
`app/features/shell/simulation/SimControlDockOrb.tsx:53` reveals the orb's
label on `group-hover:` alone (mitigated to a visual-only gap by an
`aria-label` at 60-62), and
`app/features/library/jds/intake/JdsIntakeBriefPanel.tsx:51` gates its hint on
`group-open:`/`group-hover:`, so a keyboard user tabbing to the `<summary>`
sees nothing until they expand it.

## What the tree does not have

No `disabledReason` seam exists anywhere in `kp` — the disabled-control-explains-itself
contract is unimplemented here, so the wrapper that would inherit the two-flag
rule has not been built yet. Adjacent handler pairs that look like the pattern
and are not: `NavSectionRail.tsx:145-146` and `NavPanelItem.tsx:91-92`
(`onMouseEnter` + `onFocus` both firing an idempotent prefetch — set-only, no
clear), and `landing/spark/market/CzMap.tsx:82-83` (both activate, neither
deactivates). Set-only pairs are immune to the defect by construction; the
collision needs a clear-on-leave.
