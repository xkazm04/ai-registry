---
layer: application
type: application
subject: guided-tours
technique: tour-path-curriculum
stack: react
status: forged
verified_on: 2026-10-27
verified_against: react@19
---

# A tour whose chapters are the sidebar's groups (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). A DevSecOps control plane with twelve screens in four
navigation groups and an onboarding guide drawn as a layer over the real app (React 19.2,
`package.json:40`). The guide is the
[tour-path-curriculum](../techniques/tour-path-curriculum.md) technique almost clause for
clause, because it was re-pathed after an owner critique of an earlier, legend-style tour.

## One authority for the groups, read three ways

The navigation is declared once. `src/components/shell/sidebar/navItems.ts:46-55` holds
`NAV_GROUPS`, with the order stated as a curriculum: "The sidebar's groups, in the order a
person meets them: bring projects in, watch them, govern what the agents may do and decide
what waits, then improve the projects over time. The guide's chapters are these groups."
Inside a group the order is deliberately not a curriculum — `src/components/shell/sidebar/navItems.ts:42` "A to Z inside a
group: the group says what the screens are for, the order only has to be findable." Each group
carries a one-line purpose (`line`, `src/components/shell/sidebar/navItems.ts:33` "What the group is for, in one line (the
guide's chapter line)").

The guide never types the chapters a second time. `src/app/features/guide/model/steps.ts:66-73`
derives `CHAPTERS` from `NAV_GROUPS.map(...)`, and the path itself is the four chapter files
concatenated in that order (`src/app/features/guide/model/steps.ts:55` "export const STEPS: readonly Step[] = [...START,
...WATCH, ...GOVERN, ...IMPROVE, RECAP];"). The recap reads the same source
(`src/app/features/guide/model/recap.ts:13`), and the invitation names the chapters from
`CHAPTERS` before the tour starts (`src/app/features/guide/components/invite/Invite.tsx:23-27`).

## The test reads the navigation, not a copy

`src/app/features/guide/model/steps.test.ts` is the curriculum gate, importing `NAV_GROUPS`,
`APP_NAV` and `activeNavKey` from the navigation module itself (`src/app/features/guide/model/steps.test.ts:2`):

- chapter order equals group order and no chapter is interleaved — `src/app/features/guide/model/steps.test.ts:6-11`,
  "walks the chapters in the sidebar's group order, each one whole, never interleaved";
- every screen is visited inside its own chapter — `src/app/features/guide/model/steps.test.ts:13-17`, "visits every screen
  in the sidebar, each within its own chapter", matching each step's `href` to its nav entry
  with the same `activeNavKey` the sidebar highlights with;
- the opening is fixed — `src/app/features/guide/model/steps.test.ts:19-22`, "starts with a text size the person can read,
  then brings a project in before any screen that needs one".

## Concept in a situation

Each step declares `concept` as a chip and spends its caption on a situation
(`src/app/features/guide/model/steps.ts:31-32` "The module or idea this step introduces, shown as the caption's chip").
The first step is readability (`src/app/features/guide/model/story/start.ts:6-13`, "First,
make it comfortable to read"), then Projects. Numbers appear only inside a situation: the
Ladder step's caption is "dep-bump.patch is Hands-off because its record cleared the bar: 16
accepted, 94 % merged without edits, 14 clean days" (`src/app/features/guide/model/story/govern.ts:34`).
The README states the grain rule outright (`src/app/features/guide/README.md:14` "Each step
introduces one module or idea, on its screen; numbers appear only as part of a situation.").

## Where the tree sits against the technique

Confirmed: journey order, chapters as nav groups from one authority, concept-per-situation,
the test against the navigation, readability then setup first. A related upward lesson the
technique took: the group order was fixed in the navigation module, not in the tour, so the
sidebar and the tour cannot disagree about the journey. One gap, owned by a sibling technique
rather than this one: step targets are selectors into other features' markup
(`src/app/features/guide/README.md:56-58`, e.g. `section[aria-label="Claims tested by checks"]`) rather than declared
anchor identifiers, so the test that keeps the path whole cannot also keep its anchors whole.
