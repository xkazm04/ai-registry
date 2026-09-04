---
layer: application
type: application
subject: client-state
technique: effect-identity-and-latched-callbacks
stack: react
status: forged
verified_on: 2026-09-01
verified_against: react@19
---

# Effect identity and latched callbacks — the fleet map's 90-second poll

*Verified against the project tree at `7ed00bb9` (a Next.js 16 / React
19.2.4 dashboard, `react@19.2.4`, `next@^16.3.3`).*

`src/components/launch/useFleetData.ts` is the technique in its positive
form: a ~90s poll over an organization fleet whose dependency list has
been pared down to the one value that identifies the session, with every
callback and every accumulator held in refs. It is worth reading as an
application because the file also *states the reasoning in place*, which
is the half that keeps a latch alive through later edits.

## The session and its identity

The hook takes five arguments (`useFleetData.ts:101-106`): the
installations to poll, a `setConstellations` state setter, and three refs
(`scanCtrl`, `scanGen`, `recentScan`) owned by the caller
(`src/components/launch/FleetMap.tsx:144`). Only the first is an address.
The poll effect's dependency list is exactly `[installations]`
(`useFleetData.ts:230`), and `installations` arrives as a prop from a
server component (`src/app/launch/page.tsx:61,72`), so it is stable for
the lifetime of the view — the session is born once and holds.

The suppression that makes this legal names the reason at the site
(`useFleetData.ts:229`):

```
// eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable; matches FleetMap's original [installations] dep
```

The three refs and the setter are all read inside the effect body and all
deliberately absent from the list. Had they been listed as the linter
asks, each write into `setConstellations` (`useFleetData.ts:191-203`)
would re-render `FleetMap`, and any of those five arguments re-created on
that render would have restarted the poll — on a surface whose entire job
is to write state every tick.

## The accumulators that would have died

Everything the poll accumulates lives in refs or in the effect closure,
and the file says why:

- **The backoff schedule** is a ref-held map of consecutive failures per
  org (`useFleetData.ts:108-110`), commented "*A ref (not state) so
  recording a failure never re-renders the map, and so the schedule
  survives the effect re-running*" — both halves of the technique in one
  sentence. `noteFailure` (`:159-162`) increments `fails` and stamps
  `nextAt`; the gate at `:176-177` skips an org until its penalty elapses;
  a healthy pull deletes the entry (`:187`).
- **The delay curve** doubles from one poll interval to a cap
  (`backoffDelayMs`, `:79-82`, over `POLL_INTERVAL_MS = 90_000`,
  `src/components/launch/FleetMap.constants.ts:11`). Had the effect
  restarted per tick, `fails` would have been reborn at 0 every time and
  the curve would never have left its first step: a failing organization
  would be re-asked every 90 seconds forever, which is the exact cost the
  backoff exists to remove.
- **The pacing mark** `lastStartedAt` (`:148`) is effect-local rather than
  ref-held, and is the one accumulator that does die with the session. It
  bounds the focus-triggered re-pull (`onVisible`, `:215-222`) so
  alt-tabbing does not fan out a full fleet round per focus. Because
  `installations` is stable, the session in practice never restarts and
  the distinction does not bite — but it is the residual exposure here: if
  `installations` ever became a per-render array, the poll would keep its
  backoff and lose its pacing, and the symptom (a fan-out per focus) would
  look nothing like a dependency problem.

## The guards that survive a restart, and the ones that do not

The poll also carries write-site guards, and they divide along exactly the
line the technique draws. `cancelled` (`:141`, set in the teardown at
`:225`) is per-session and correct as such: it exists to silence *this*
session's late completions. `scanGen` is a ref *owned by the caller*
(`FleetMap.tsx:144`), snapshotted before the round-trip and re-checked at
commit time (`:190`) so a manual scan starting mid-flight is not clobbered
— an attempt-token sequence that must outlive any one session, which is
why it is a caller-held ref and not effect-local state. That is the
[async-race-guards](../techniques/async-race-guards.md) half: this file's
dependency discipline decides how often the poll is born, the generation
check decides which of its responses may write, and removing either one
reintroduces a different defect.

## What transfers

Two habits from this file are the portable part. First, the *comment on
the ref* — saying it is a ref so that recording a failure does not
re-render — is what stops a later reader from "fixing" the backoff map
into state and silently reinstating the restart loop. Second, the
suppression comment names the session ("refs are stable"), so the
narrower-than-linted dependency list reads as a decision rather than as an
oversight; an unexplained suppression on a long-lived effect is
indistinguishable from a bug and gets deleted.
