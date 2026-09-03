---
layer: application
type: application
subject: accessibility
technique: hidden-but-mounted-inertness
stack: react
status: forged
verified_on: 2026-09-01
verified_against: react@19
---

# Three mounted-but-hidden subtrees, and the channel each one had to close by hand

*Verified against the project tree at `a57f272c` (Ascent, React 19.2.4 /
Next 16, Tailwind class-based hiding, framer-motion for the animated
cases).*

This repo has no unmount-on-hide convention: panels, drawers, and grid
cells stay mounted for state, for transitions, and in one case
deliberately to be found by a bot. Every instance therefore lands
somewhere on the technique's ladder, and all three of the mechanisms it
names appear — including the one case where a visual-only hide is
correct and the other channel is closed by hand.

## Rung 3: a fade that closes both channels explicitly

`src/components/about/FleetGrid.tsx` renders forty maturity cells; a
segment filter dims the off-slice ones rather than removing them, so the
grid's shape stays stable across filters. The hide is
animated opacity — `animate={inView ? { opacity: dim ? 0.1 : 0.92 ... }}`
(`FleetGrid.tsx:91`) — the technique's visual-only class, and the exact
mechanism that cannot close the accessibility channel because the
transition needs the subtree painted.

Both other channels are closed from the *same* condition, `dim`
(`FleetGrid.tsx:71`):

| Line | Attribute | Channel closed |
|---|---|---|
| `FleetGrid.tsx:82` | `disabled={dim}` | activation |
| `FleetGrid.tsx:83` | `tabIndex={dim ? -1 : undefined}` | tab stop |
| `FleetGrid.tsx:84` | `aria-hidden={dim || undefined}` | accessibility tree |

The in-file comment states the technique's reason unprompted: take them
"out of the keyboard tab order and the accessibility tree so focus + SR
announcements match the visible slice ... instead of reporting all 40
maturity values" (`FleetGrid.tsx:79-81`). That last clause is the
duplicate-content failure mode measured — thirty-odd cells the count
strip says are not there.

Note what this instance is *not*: it does not use the single
both-channels attribute. It reaches the same end state with three
attributes because the cells are individual controls rather than a
subtree with a root — and the technique's warning applies exactly here,
that three expressions on one condition are three chances to drift. The
`aria-hidden`-without-`tabIndex` half of this pairing is the "silent tab
stop" failure; this file avoids it only because both lines were written
together.

## Rung 3 done with the one attribute: the coaching drawer

`src/components/onboarding/tour/TourChecklist.tsx` keeps the guided-setup
drawer permanently mounted and hides it by translating it off-screen
(`translate-x-full`, `TourChecklist.tsx:187-189`) so it can slide. The
subtree root carries `inert={!open}` (`TourChecklist.tsx:211`) — the
technique's preferred form: one condition, one node, focus and tree and
activation closed together, boundary at the outermost node of the hidden
subtree, with the pull-tab button deliberately placed *outside* the inert
aside (`TourChecklist.tsx:191-198`) so it stays operable.

The file also records the *pointer* channel being closed separately and
for a different reason. The fixed wrapper takes `pointer-events-none`
(`TourChecklist.tsx:185`) because a transparent box pinned over the
dashboard "still captures clicks" — the technique's dead-band case; the
comment ends "the panel is only translated off-screen, so `inert` already
handles focus; this handles the mouse" (`TourChecklist.tsx:179`). Three
channels, three mechanisms, named individually. That is the strongest
evidence in this repo that the channels are genuinely separate: the team
found each one from a distinct bug report.

## Rung 2, sixteen lines below in the same file

The conversational panel inside the drawer is latched — once mounted it
never unmounts — and is hidden with `hidden`
(`TourChecklist.tsx:227`), i.e. `display: none`. Nothing else is done to
it, and nothing else is needed: this is the technique's rung 2, the hide
that closes both channels by itself. Two subtrees in one component,
hidden two ways, correctly.

## The forced visual-only hide, closed by hand

`src/components/pricing/PlanEnquiryFields.tsx:149-158` is a honeypot
field, and its comment states the constraint the technique's ladder does
not anticipate: off-screen "rather than `display:none` (some bots skip
hidden inputs)". The mechanism is dictated by an anti-abuse requirement,
so rung 2 is unavailable — and the field carries `tabIndex={-1}` and
`aria-hidden="true"` on the same element. Correct, and a useful shape:
when something outside accessibility forces the visual-only mechanism,
the both-channels rule is still payable, just manually.

## Open findings

- **No gate sees the target.** `FleetGrid.dom.test.tsx` exists and
  asserts the pinned-cell behaviour around `disabled`; nothing in it (or
  in `TourChecklist.dom.test.tsx`) walks the tab order or reads the
  computed tree for the hidden subtrees. The `dim` and `!open` fixes are
  held by review, not by a check — the technique's `gate-sees-target`
  clause, unpaid. Cheapest payment here: assert zero focusable
  descendants under the inert aside while collapsed, and that a dimmed
  cell is absent from an accessible-name query.
- **`disabled:opacity-0` on a live control.**
  `src/components/report/RoadmapSandboxParts.tsx:63` fades the per-row
  reset button to invisible when there is nothing to reset. `disabled`
  closes focus and activation, but the button remains a named node —
  it carries an explicit reset label at
  `RoadmapSandboxParts.tsx:62` — so a reader's element list carries one
  invisible reset control per row. Rung 2 (`hidden` when nothing has
  changed) is the whole fix; the fade is not transitioned, so nothing is
  lost.
- **Deliberate inverse, not a defect.** `src/components/deck/DeckNav.tsx:61`
  fades a section label in on hover and focus. Visual-only hiding is the
  *right* mechanism there — the anchor is named independently
  (`aria-label` at `DeckNav.tsx:60`) and the faded span is redundant
  content that costs the tree nothing. Worth writing down so a sweep for
  `opacity-0` does not "fix" it into a rung-2 hide.
