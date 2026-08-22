---
layer: application
type: application
subject: adaptive-fidelity-tiers
technique: asymmetric-tier-transitions
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# React application — asymmetric tier transitions

`src/contexts/QualityContext.tsx` is the whole producer side of this
subject in one file: the constants, the sampler, the transition rules, the
settle deadline and the idle deferral. It is worth reading as a compact
reference implementation, and worth reading for the four places it stops
short of the standard.

## The constants and their derivations

`QualityContext.tsx:18-28` declares six values, each above its own comment:

```
const WINDOW_SIZE = 120;              // "~2 s at 60 fps"
const DOWNGRADE_MS = 20;              // "above this → drop a tier"
const UPGRADE_MS = 17;                // "below this → eligible to upgrade"
const UPGRADE_PASSES_REQUIRED = 3;    // "prevents oscillation"
const SETTLE_TIMEOUT_MS = 15_000;     // "save overhead once tier is stable"
const IDLE_FALLBACK_MS = 2_000;       // "if requestIdleCallback is unavailable"
```

The window is fixed in **sample count**, not wall-clock, exactly as the
technique requires — the doc comment translates it to a duration at a
nominal refresh rate rather than defining it as one. The statistic is a
p90 (`percentile90`, `:30-33`), so the decision is about the tail rather
than the mean. `WINDOW_SIZE`, `UPGRADE_PASSES_REQUIRED`, `SETTLE_TIMEOUT_MS`
and `IDLE_FALLBACK_MS` each carry the reasoning that produced them.

**Deviation:** `DOWNGRADE_MS` and `UPGRADE_MS` carry their statistic and
their direction but not their derivation — why 20 and why 17. It matters
here more than it usually would, because 17 sits within a millisecond of
the nominal 60 Hz interval (16.67 ms). A healthy device on a standard 60 Hz
panel produces a p90 that lands on the wrong side of that threshold
routinely, so the upgrade condition at `:99` is closer to "this device is
beating 60 Hz" than to "this device is fine", and the ladder ratchets down
more readily than it climbs. The 3 ms dead band between the two thresholds
is correctly present; what is undocumented is whether it was sized against
the actual cost difference between adjacent tiers or picked.

## The three branches

`evaluate()` (`:83-112`) is the technique's transition rule almost
line-for-line:

- **Downgrade on one bad window** (`:91-98`) — `p90 > DOWNGRADE_MS` moves a
  tier immediately, with no counter and no run requirement, and zeroes
  `upgradePassesRef` on the way past (`:93`).
- **Upgrade on a run** (`:99-107`) — `p90 < UPGRADE_MS` increments
  `upgradePassesRef`; only at `UPGRADE_PASSES_REQUIRED` does the tier move,
  and the counter is zeroed on promotion so the next rung needs a fresh
  run.
- **The dead band resets the counter** (`:108-111`) — the `else` branch,
  reached when p90 falls between the two thresholds, carries the comment
  "In the dead zone — reset upgrade counter to prevent false upgrades". This
  is the branch that is usually missing: without it, a device alternating
  good and neutral windows accumulates three passes across five windows and
  promotes into a tier it cannot hold.

**Deviation:** the downgrade cannot skip rungs. `:94` computes the next
tier as `current === "high" ? "medium" : "low"`, so a catastrophic window —
one many multiples over budget — steps down exactly one rung, and reaching
the floor from the top costs two bad windows. On the device this exists to
protect, that is two visible stutters where the evidence justified one.

## Idle deferral, with both reapers named

`:114-137` is the deferral. The comment states the reason in the technique's
own terms — "Defer measurement until the browser is idle so we don't compete
with critical rendering (LCP, FID) during initial page load" — and the
implementation requests an idle callback *and* arms a 2-second timer
(`:131-137`), with `startMeasuring` (`:119-129`) cancelling whichever did
not win. Where no idle scheduler exists, the timer is the whole mechanism
(`:135-137`) rather than a reason to sample immediately.

The cleanup at `:139-143` cancels the idle handle, the fallback timer and
the animation frame — three creations, three reapers, in the one place the
surface can tear down.

## The settle budget

`:75-78` compares `now - startTime` against `SETTLE_TIMEOUT_MS` and, past
it, sets `settledRef` and returns **without scheduling another frame**. That
is a real stop rather than a flag on a still-running loop, which is the
distinction the technique insists on. `startTime` is captured on the first
tick (`:56`), not at mount, so the fifteen seconds are measured from the
first sample.

Three shortfalls against the standard:

1. **No stability stop.** The deadline is the only exit. A device that
   settles after three seconds still pays twelve more seconds of per-frame
   sampling, sorting a 120-element buffer every two seconds, for an answer
   that has stopped changing.
2. **An unsettled tier is not resolved downward.** At the deadline the tier
   freezes wherever the last window left it, so a device flapping on the
   boundary can settle permanently into the richer tier it could not hold.
3. **No re-arm and no visibility guard.** `settledRef` is never cleared, so
   the probe is over for the session with no event-shaped re-entry; and
   because the frame clock stops in a background tab, the first frame after
   a return contributes one enormous interval to the open window. The p90
   over 120 samples absorbs a single outlier, which is why this has not
   surfaced — it is mitigated by the statistic, not prevented.

## The starting tier

`:14`, `:37` and `:39` all start at `"high"`, so the first transition on a
slow device is a **removal** — effects the user has already seen being
taken away during load — which is the loss `probe-deferral-to-idle` is
written to avoid. The same constant appears in the context's default value
(`:13-16`), which means a consumer rendered outside the provider is
indistinguishable from one on a device the probe measured and approved.

## The preference short-circuit

`:47-51` is the technique's placement rule met exactly: the effect's first
three statements return before any scheduling, so under a reduced-motion
preference there is no idle request, no timer, no frame subscription and no
buffer. The effect's dependency array is `[framerReduced]` (`:144`), so a
preference turning on mid-session runs the cleanup — a genuine teardown,
not a suppressed loop.

One narrow gap: `settledRef` survives the effect re-run, so a preference
that goes off, on, and off again after the probe has already settled cannot
restart it — `tick` returns at `:57` and never re-schedules.
