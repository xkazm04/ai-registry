---
layer: application
type: application
subject: kept-alive-screen-host
technique: hidden-but-alive-screens
stack: react
status: forged
verified_on: 2026-11-16
verified_against: react@19
---

# Ten screens under Activity, and the run that must not die on a hide

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893`
(`main`), first read on 2026-10-27 and re-read on the `verified_on` date. `react` is pinned at 19.2.4 in
`package.json`. One client host keeps every visited screen of a DevSecOps
console mounted, hides all but one with `<Activity>`, and lets the hide's
effect cleanup withdraw everything a screen registered.

## The kept set and its reaper

`src/components/shell/host/ScreenHost.tsx:85` `<Activity key={d.key}
mode={d.key === active?.key ? 'visible' : 'hidden'}>` wraps every kept screen.
The bound is `src/components/shell/host/model/entry.ts:87-88`, "past it the
least recently shown screen unmounts (its state and its read go)", with
`VISITED_CAP = 10`, and `visit` (`:82-85`) is the pure LRU step. The eviction
reaps what the screen created. `src/components/shell/host/hooks/store.ts:154-157`
aborts the evicted key's read and deletes its entry and location, and `:158`
aborts the previous screen's read on every leave, so a hidden screen receives
no lines.

## Hidden means stopped, by construction

`src/components/shell/Window.tsx:81` "An effect: a screen hidden by
<Activity> has its effects cleaned up, so its hotkeys stop with it." The
second-level sidebar registration is an effect for the same reason, at `:96-101`:
"registering brings the sidebar there (an effect, so a route hidden in
<Activity> lets go of it)", with `useEffect(() => (hasSections ?
registerNested() : undefined), …)`. The feature doc gives the general rule at
`docs/features/screen-host.md:168-170`: "A hidden screen's portal is hidden
with it, and its effects (hotkeys, polls) are cleaned up. Do not rely on
effects in a screen that is not showing." The element requirement is the
upward lesson recorded at `:171-172`: "Without it, hiding the page's Activity
hid the host screen's own window (the page renders no element of its own)."

## Work that outlives a visit

`docs/features/screen-host.md:219-221` "a screen whose work outlives a visit
(…) must not abort it on effect cleanup, and timers should count from a
stored start." The realisation is
`src/app/features/start/hooks/useStack.ts:5-7`: "The screen host keeps /start
mounted (hidden) when the person leaves it, and a hidden screen's effects are
cleaned up: so leaving never aborts a run (a proposal takes about a minute),
and the clock counts from the stored start, not from the last showing." The
run's handle is a ref (`:42`), cancelled only by a new pick, a re-run or a
reset (`:46`, `:98`).

Per-showing decisions appear in the vitals screen: the doc's `:277-278` says
collect on open "is decided once per activation, on that showing's own fresh
read (…), so a kept copy never starts a collect". The baseline rule appears
in the fleet screen at `:270-271`: "takes the first *read* fleet as a first
visit's baseline, never the empty unread one (that would mark every project
as moved)."

## Deviation

The one-minute run lives in the screen's own state, so it survives a hide
but not an eviction. After ten other screens, `/start` unmounts, and the
run's result lands on an unmounted hook. Nothing in `useStack` aborts the
in-flight request on unmount, so the run has no reaper on that path. The
standard stays: either move the run into a shell-hosted service, or abort it
on unmount and say in the screen that leaving it for long ends the run.

## 2026-11-16 re-read

Re-read on 2026-11-16 through a public clone. `main` is still `009c7893` (no
commits since the first read), and every anchor above resolves to the quoted
text, including the deviation: `useStack.ts` still has no unmount abort. Its
only effect (`:77-81`) is the elapsed-seconds interval. Three findings from
this round were not in the first read.

- **The hide has no gap here, and that is by construction.** The host's
  store is module state read through `useSyncExternalStore`, "so a click swaps
  the screen in the same task" (`src/components/shell/host/hooks/store.ts:3-5`).
  An urgent switch runs the hidden screen's passive cleanups right after the
  commit. The hotkey hook is a passive effect on a document `keydown` listener
  (`src/lib/keyboard/useHotkeys.ts:38-45`), and the tree does use React's
  `<ViewTransition>` (`src/components/shell/frame/Motion.tsx:9-23`). The
  window's right column is animated on a navigation, but `default="none"` and
  urgent host switches do not start a transition. The amended technique's
  layout-phase rule therefore changes nothing today. It would matter if host
  switches were moved into a transition so that they animate.
- **Two kept sets, one owner of screens.** `next.config.ts:9` sets
  `cacheComponents: true`, so the framework also keeps recently visited route
  pages under its own hidden boundary. The host sits in the layout above them,
  and on a claimed route the page is a thin shell that draws nothing
  (`ScreenHost.tsx:99-103`). Real screens are therefore held once, by the host,
  under `VISITED_CAP`. Unclaimed routes (`pending.tsx:10-11`, `ready: false`)
  are the router's to keep.
- **The host owns the title, not the announcement or focus.** It sets the
  document title from the active screen in an effect and as a React `<title>`
  (`ScreenHost.tsx:69-72,95`). Nothing under `src/components/shell/host`
  moves focus or writes a live region on a switch (`git grep` for `focus`,
  `aria-live` and `announc` finds none). Its pushes copy the framework's
  history state (`hooks/navigation.ts:3-5,48`), and the framework's route
  announcer is keyed to its own router tree. Whether that announcer speaks on
  a host switch was not run and is unknown. On a return to a kept screen, focus
  is not put back where the person left it. This was read, not run, with no
  screen-reader session.
