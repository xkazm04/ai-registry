---
layer: application
type: application
subject: kept-alive-screen-host
technique: hidden-but-alive-screens
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
---

# Ten screens under Activity, and the run that must not die on a hide

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893`
(`main`), read on the `verified_on` date. `react` is pinned at 19.2.4 in
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
