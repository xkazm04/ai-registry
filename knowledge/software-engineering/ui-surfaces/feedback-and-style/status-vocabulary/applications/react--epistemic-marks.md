---
layer: application
type: application
subject: status-vocabulary
technique: epistemic-marks
stack: react
status: forged
verified_on: 2026-10-27
verified_against: react@19
---

# Honesty chips beside status chips, and the one amber (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (React 19.2,
`package.json:40`). The product shows real, seeded and simulated values on the same screens, so
it keeps an epistemic mark family apart from its status tones and reserves one hue for decisions
that wait for a person. This application covers
[epistemic-marks](../techniques/epistemic-marks.md) and, because the two decisions were made in
the same token block, [reserved-attention-hue](../techniques/reserved-attention-hue.md) beside it.

## The family, as its own component

`src/components/status/chip/HonestyChip.tsx:4` closes the family: `type HonestyKind = 'seeded' |
'simulated' | 'unknown' | 'stale'`, each with a fixed meaning sentence as its tooltip
(`src/components/status/chip/HonestyChip.tsx:7-12`: "Seeded fault: planted on purpose for the demo", "Simulated: nothing
real ran", "Unknown: never treated as zero or absent", "Stale: last known value"). The marks are
lines, not hues (`src/components/status/chip/HonestyChip.tsx:15` "seeded and simulated and unknown are dashed; stale is
hatched and shows its age"; the stylesheet's `.seeded`/`.simulated`/`.unknown` use `1px dashed`
and `.stale` a `--hatch` background, `src/components/status/chip/HonestyChip.module.css`).
The status chip says the family is not one of its tones
(`src/components/status/chip/Chip.tsx:16-19` "The dashed honesty marks (seeded, simulated,
stale) are HonestyChip, not a tone of this."). Marks attach to the value: Vitals' last-collect
cell is an unknown chip only for a project never collected
(`src/app/features/vitals/VitalsListScreen.tsx:70`, `<HonestyChip key="c" kind="unknown"
meaning="Nothing collected yet">never</HonestyChip>`).

## The reserved hue

The token block states the reservation in place: `src/styles/tokens.css:42` `--needs-you:
#fbbf24; /* the one loud colour: only what waits for a person */`, with its own ink on the next
line. The lifecycle rule is the Needs-you desk's (`src/app/features/needs-you/README.md:17`
"Amber is only on rows that wait for a person: a staged, sent or decided row is not."), derived
from the row's state, not the list
(`src/app/features/needs-you/components/live/desk/LiveTable.tsx:25-27`, `waits` is false once a
row is decided, sent or in the outbox order), and pinned by a test that counts the token in the
rendered table (`src/app/features/needs-you/components/live/desk/LiveDesk.test.tsx:75`, "is amber
only on rows that wait for a person: not on a decided one, a staged one or one sent").

## Where the tree sits against the techniques

Three deviations, recorded with the standard unchanged:

- **A second unknown.** `src/components/status/chip/Chip.tsx:14` keeps an `'unknown'` tone ("dashed: never zero, never
  absent") beside HonestyChip's `unknown`, and the wave chip uses it for "git not asked yet"
  (`src/app/features/runs/components/WaveState.tsx:9`). Two definitions of one mark, in two
  components, that agree today by hand.
- **Stale sits in the reserved band.** `--stale: #d4a24c` (`src/styles/tokens.css:41`) is a darker amber
  directly above the reserved `#fbbf24`; at a glance a stale chip and a decision chip share a
  hue. The hatching separates them by shape, not by hue.
- **The stale role carries other meanings.** The status chip's `lag` tone is `--stale`
  (`Chip.module.css` `.lag { --cc: var(--stale); }`) and is used for an over-budget lane
  (`src/app/features/runs/components/WaveState.tsx:7` `budget: 'lag'`) and a checklist finding
  (`src/app/features/start/components/stack/ChecklistLine.tsx:8` `finding: 'lag'`), so the stale
  colour no longer means only "last known value".
