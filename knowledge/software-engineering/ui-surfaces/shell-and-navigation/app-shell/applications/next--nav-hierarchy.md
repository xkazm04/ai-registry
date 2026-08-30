---
layer: application
type: application
subject: app-shell
technique: nav-hierarchy
stack: next
status: forged
verified_on: 2026-08-30
verified_against: next@16
---

# NavSectionRail + navDrawerA11y — two levels, no collapse, one element in two roles

Read in a hiring-studio tree (Next.js 16.3.0 / React 19) at commit
`40363b7`, 2026-08-30. Every citation below was resolved against that tree on
that date. Conformance claims are checked against W3C, *Web Content
Accessibility Guidelines (WCAG) 2.2*, W3C Recommendation of 12 December 2024
(`https://www.w3.org/TR/2024/REC-WCAG22-20241212/`) and W3C, *Accessible Rich
Internet Applications (WAI-ARIA) 1.2*, W3C Recommendation of 6 June 2023
(`https://www.w3.org/TR/2023/REC-wai-aria-1.2-20230606/`), both retrieved
2026-08-30.

## Two levels, and the second one is genuinely section-scoped

`app/features/shell/tabs.ts` holds `NAV_GROUPS` (`tabs.ts:158`) — five groups,
2–7 items each, ~21 destinations total. `sectionOf(group)` (`tabs.ts:250`)
derives a group's stable section id from its catalog key, with the operational
first group falling back to a constant, so there is no parallel section list.
`app/features/shell/nav/NavSectionRail.tsx` renders exactly the technique's
shape: a 4.75rem icon rail of the five sections on the left, and a panel to its
right holding *only the selected group's* items (`NavSectionRail.tsx:163-219`).
The file's own header states the reason in the technique's terms: "~20 modules
never stack into one tall column."

The panel's heading is a real `<h2>`, and the list below it is a `<nav>` whose
`aria-label` is the same string (`NavSectionRail.tsx:180-186`) — so the second
level announces which section it belongs to instead of being an unlabelled
second list of links. That is the section-scoping rule made audible, not just
visual.

Level three does not exist, and the tree is explicit that the depth went into
the page instead: the analytics destination's own section switcher
(`app/features/insights/analytics/sections/AnalyticsSectionNav.tsx`) is a
shared segmented control with radiogroup semantics and roving arrow-key focus —
a page-owned control, not a third rail level. Its header calls itself "the tab's
whole navigation now", which is exactly the technique's split: the shell
delivers you to a sub-destination and stops.

## The finding: a nav can browse without moving, and that is a second state

Clicking a rail section **previews** its items without navigating; the panel
snaps back to the group containing the active destination the moment a real
switch happens (`NavSectionRail.tsx:106-116`). That is a second value —
`openSection` — living beside the location, and it reads at first like the
prohibition against a consumer keeping its own copy of "which section is
active". It is not. `openSection` is *preview* state, a distinct thing from the
location, and the code keeps it honest two ways: it resets during render when
the active destination changes (the sanctioned adjust-state-from-a-prior-render
pattern, `:111-114`), and the rail button carries `aria-pressed` rather than
`aria-current` (`NavSectionRail.tsx:147`) — because a previewed section is
pressed, not current. Only the panel row for the actual destination carries
`aria-current="page"` (`NavPanelItem.tsx:79,85`), which matches ARIA 1.2's
"authors SHOULD set the `aria-current` attribute on only one element within a
set of related elements".

The transferable shape: a two-level nav that lets the user *read the map*
without leaving where they are has two values, not one, and the second must
never borrow the first's semantics. Get that wrong and assistive technology
hears two current locations.

## Where the tree diverges from the technique (kept, not hidden)

- **There is no collapse posture at all.** The whole "collapse: the label
  level" contract — icon-only rail, name reveal, posture persistence, restore
  after a responsive floor lifts — is untested here, because the rail is never
  icon-only: every section glyph carries a 13px label under it
  (`NavSectionRail.tsx:154-158`, with a comment explaining the label was moved
  *up* from 11px because the rail is the primary wayfinding surface). The
  technique's memory-test prohibition is satisfied by refusing the trade rather
  than by managing it, and the persistence rule has nothing to persist. The one
  posture that does exist is not a preference: below the 768px breakpoint the
  rail becomes an off-canvas drawer (`Workspace.tsx:52-65`) — a width floor, in
  the technique's sense, and one that WCAG 2.2 SC 1.4.10 Reflow (Level AA)
  makes a conformance obligation rather than a nicety, since the two-column
  frame cannot present at 320 CSS pixels.
- **The rail-footer controls are icon-only and their reveal is the built-in
  hover text.** `NavRailPreferences.tsx:92-109` renders the appearance and
  language triggers as a glyph plus `aria-label` plus `title`. The accessible
  name is correct and programmatically available (SC 4.1.2, Level A). The
  *visible* name reveal is not: the platform's built-in hover text is not
  dismissible without moving the pointer, vanishes when the pointer travels
  toward it, and never appears for a keyboard user — none of the three
  properties SC 1.4.13 Content on Hover or Focus (Level AA) requires of an
  author-supplied reveal. This is the exact case behind the technique's
  correction: a name for the accessibility layer and a reveal for the person
  looking are two obligations, and this tree pays one. The popups themselves
  are done properly — `role="menu"` with `menuitemradio`/`aria-checked`,
  pointerdown-outside dismissal, and Escape restoring focus to the trigger
  (`NavRailPreferences.tsx:70-88`).
- **One element is two navs, and the a11y state is gated on which.** The
  `<aside>` is simultaneously the permanent desktop rail and the off-canvas
  mobile drawer, so `app/features/shell/nav/navDrawerA11y.ts` exists purely to
  keep the four `inert` / focus-trap decisions gated on the breakpoint — get it
  wrong and either the always-visible desktop nav is made inert or the desktop
  page is focus-trapped. It is a pure module with its own unit tests
  (`navDrawerA11y.test.ts`) precisely because the truth table is easy to get
  subtly wrong; the incident that produced it is dated in the header
  (2026-07-09, app-shell-navigation #1). The technique's "no nav entry exists in
  one posture but not the other" holds — it is the same renderer, the same
  `NAV_GROUPS`, the same order in both — which is also what WCAG SC 3.2.3
  Consistent Navigation (Level AA) asks for, and stricter: the standard permits
  a reorder "unless a change is initiated by the user", and this tree never
  reorders.
- **Posture-follows-navigation was learned by incident.** Drawer-close was
  originally wired into the sidebar's tab handler alone, so the attention-badge
  pill and the command palette — separate navigation doors — left the drawer
  parked over freshly loaded content (`navDrawerClose.ts` header, bug-ui-scan
  2026-07-09 #2). The fix models close as *the navigation identity changed*:
  `navKey(pathname, search)` plus `shouldCloseDrawerOnNav(prev, next)`
  (`navDrawerClose.ts:15-25`), driven from one effect in `Workspace.tsx:150-157`.
  This is the source of the technique's posture-reacts-to-the-location rule.
- **SC 2.4.5 Multiple Ways is satisfied, but not by the nav.** The rail reaches
  ~20 destinations in two clicks; anything nested below them is reachable only
  through the command palette or a deep link. The technique says the shell's job
  ends at delivering the user to a sub-destination and is silent on what carries
  the rest — the standard is not, and here the palette is the second way rather
  than an extra.
