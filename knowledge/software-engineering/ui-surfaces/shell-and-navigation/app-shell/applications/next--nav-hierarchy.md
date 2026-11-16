---
layer: application
type: application
subject: app-shell
technique: nav-hierarchy
stack: next
status: forged
verified_on: 2026-11-16
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

## 2026-11-16 re-read, at `808eb83c` (Next.js 16.4.5), public clone, read-only

Re-checked on main at `808eb83c` (2026-11-10). The 08-30 anchors above are kept, and
the current ones are given here.

**Still true.**
- Two levels, and the panel holds only the selected group (`NavSectionRail.tsx:206-276`).
- The heading and the `<nav>` share one label (`:224-230`).
- `aria-current="page"` is on the destination row only (`NavPanelItem.tsx:137,143`).
- The 13px rail labels are still there, with their comment (`:197-201`).
- There is no collapse posture.
- The drawer floor below 768 px is now at `Workspace.tsx:85-101`.
- The truth table in `navDrawerA11y.ts` is unchanged.
- The drawer still closes on location change (`Workspace.tsx:221-234`, `navDrawerClose.ts:15,23`).
- The footer reveal still uses the built-in hover text (`NavRailPreferences.tsx:97-98`,
  file unchanged since `95ab738f`).
- The palette is still the second way (`WorkspaceNavDrawer.tsx:95,155`).

**Correction: preview is no longer `aria-pressed`.** In the baseline sweep `bbb2f56c`
(2026-09-08), whose message gives no reason, the rail buttons became `role="tab"` with
`aria-selected`. They now sit in a vertical `tablist` (`NavSectionRail.tsx:191-192,212`).
- The finding above still holds in substance. The previewed section borrows selection,
  never `aria-current`, so assistive technology still hears one current location.
- The tab contract is only half paid, measured against the WAI-ARIA Authoring Practices
  tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, read 2026-11-16):
  - no tab carries `aria-controls`;
  - the panel is a labelled `<nav>`, not a `tabpanel`;
  - nothing handles arrow keys, and every tab is its own tab stop (there is no
    `onKeyDown` in the file).
- So a screen reader announces "tab, selected, 1 of 5" for a widget that behaves like
  a row of toggle buttons.
- Either the keyboard contract is owed, or the `aria-pressed` it replaced was the
  more honest role.
- The pattern page does not address tabs used for navigation, and nor does this note.
  The rail previews; it does not navigate.

**New: the preview now survives a reload** (`5652a028`, 2026-09-22). The visible
section is written to `sessionStorage` (`kp.nav.section`, `:45,124-137,186`) and
restored on mount. A real switch still resets it during render (`:138-141`), so it
stays preview state. It is now preview state with a lifetime longer than the document,
which the technique's two-values reading allows, because nothing current is borrowed.

**New: locked rows** (`b3c6f729`, 2026-09-23). Rows the viewer lacks a capability for
stay in place as lock doors, with the same order in every posture (`NavPanelItem.tsx:96-133`).
The reason, "you need <capability>", appears only in `title`. That is the same
built-in hover text this application already faults for the footer controls. The
locked-door panel the row opens names the capability properly.
This belongs to `entitlement-gating`, which still has no application. It is banked
in the subject note.
