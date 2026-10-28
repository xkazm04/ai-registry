---
layer: application
type: application
subject: app-shell
technique: screen-contributed-second-level
stack: react
status: forged
verified_on: 2026-10-27
verified_against: react@19
---

# A two-level sidebar on one sliding track (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893. A desktop-
styled web app (React 19.2, `package.json:40`, on a framework whose cache keeps a visited route
mounted in `<Activity mode="hidden">`) whose twelve screens had outgrown a flat sidebar. The
shell moved to four groups and a second level that each screen fills with its own sections —
[screen-contributed-second-level](../techniques/screen-contributed-second-level.md).

## The slot, the count, and the derived level

`src/components/shell/frame/AppFrame.tsx:17-31` is the whole host. The sidebar hands back a
slot element (`setSlot`, passed as `slotRef`); registrations are counted, not flagged
(`src/components/shell/frame/AppFrame.tsx:20-21` "How many shown windows have sections in the slot (a route kept hidden in
<Activity> unregisters with its effects)"); `registerNested` raises the count, opens the level
on arrival and returns its own decrement (`src/components/shell/frame/AppFrame.tsx:23-27`, "a screen with sections of its
own opens on them"). The level drawn is a derivation, `src/components/shell/frame/AppFrame.tsx:28-29`:

```ts
const nested = nestedCount > 0;
const level = nested ? chosen : 1;
```

Each screen's `Window` contributes (`src/components/shell/Window.tsx:96-102`): "The screen's
sections join the frame's sidebar and leave with the screen; a hidden route's portal is hidden
with it. While shown they are the sidebar's second level: registering brings the sidebar there
(an effect, so a route hidden in <Activity> lets go of it)." The effect is
`useEffect(() => (hasSections ? registerNested() : undefined), ...)` and the sections reach the
slot through `createPortal(<div>{p.sidebar}</div>, frame.slot)`. The two-screens-at-once case
is tested (`src/components/shell/frame/AppFrame.test.tsx:74` "two screens mounted at once (a
route kept hidden in <Activity>)").

## One track, inert halves, focus that follows

`src/components/shell/sidebar/Sidebar.tsx:51-63` draws both levels on one track with
`data-level={level}`, each pane `inert={level !== 1}` / `inert={level !== 2}`; the stylesheet's
own header says "the level out of view is inert"
(`src/components/shell/sidebar/levels/levels.module.css:1-2`) and reduced motion drops the
slide (`src/components/shell/sidebar/levels/levels.module.css:94-97`). Focus moves on the next frame, without scrolling the track:
back puts it on the current menu entry (`src/components/shell/sidebar/Sidebar.tsx:28-32`, "focus follows the person to the
menu, onto the screen they came from", querying `[aria-current="page"]`), down puts it on the
way back (`src/components/shell/sidebar/Sidebar.tsx:33-36`). The head is "‹ Menu" plus a title derived from the path with the
same `navEntryFor` the menu uses (`src/components/shell/sidebar/levels/NestedHead.tsx:13-42`).

## One authority, journey-ordered

`src/components/shell/sidebar/navItems.ts:46-55` declares `NAV_GROUPS` "in the order a person
meets them", alphabetical inside each (`src/components/shell/sidebar/navItems.ts:42`). The palette reads `ALL_NAV`
(`src/components/palette/model/items.ts:42`), the guide's chapters and recap read `NAV_GROUPS`
(`src/app/features/guide/model/steps.ts:67`, `src/app/features/guide/model/recap.ts:13`), and
`src/components/shell/sidebar/navItems.ts:63` says it plainly: "the one list the palette, the door menu and the loading title
read". The label collision was fixed by purpose: the `start` screen is labelled "Projects"
beside "Setup" (`src/components/shell/sidebar/navItems.ts:24-25`).

## Where the tree sits against the technique

Confirmed on every clause. One soft spot worth naming: `registerNested` sets `chosen` to 2 from
inside the registration (an effect-driven state write), which the technique allows for
arrival; the departure path needs no effect, as the technique requires, because the derivation
returns level 1 the moment the count is zero.
