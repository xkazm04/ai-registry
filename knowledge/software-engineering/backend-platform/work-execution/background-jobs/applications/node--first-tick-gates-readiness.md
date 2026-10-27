---
layer: application
type: application
subject: background-jobs
technique: first-tick-gates-readiness
stack: node
status: forged
verified_on: 2026-10-27
---

# A poller whose first cycle is the start, in a Next.js DevSecOps console (Node)

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) runs one GitLab poller per server process. The poller fills a
local index that every page reads, so its first cycle is the data's existence, not a
refresh of it. The runtime is `src/server/data/live/runtime.ts`, started from the server's
instrumentation hook through `src/server/data/boot.ts` and read by pages through
`src/server/data/select.ts`. It realises first-tick-gates-readiness and, beside it,
failed-start-kept-and-retried-at-cadence and problem-set-change-logging.

## 1. The first cycle runs inside the start, and its throw fails it

`create` builds the runtime, then `await rt.refresh(); started = true;` (`src/server/data/live/runtime.ts:96-98`)
and only afterwards `rt.scheduler = startScheduler(rt.refresh, pollIntervalMs(), onError);`
(`:104`) — no timer exists for a start that could not complete one cycle. Inside the cycle
the handler knows which side of the start it is on (`:79-82`): "The first cycle's throw (a
live config the poller refuses) fails the start, which the pages name and retry: an index
no cycle read must not serve as if it were real. Later, a cycle that throws still leaves the
index readable." followed by `if (!started) throw e;` and `onError(e);`.

A failed start releases only what it opened itself: "The seeded index is this start's own
and the retry opens another; the real one is a singleton and stays open." (`:100-101`),
the technique's step 5. Readiness is a synchronous read: `readyRuntime` is documented "The
runtime once it has finished starting, synchronously: pages call this, never the promise."
(`:49-50`). The host hook does not crash on a failed start: "Not rethrown: a register()
that rejects stops the server from preparing, and the pages are what name a failed start
and retry it" (`src/server/data/boot.ts:16`).

## 2. The failure is kept, named, and retried no faster than the cadence

`StartFailure` is "A live start that threw: what it said and when. Kept until a start
succeeds." (`src/server/data/live/runtime.ts:43-47`). `startRuntime` shares the start in flight
(`holder[STARTING] ??= create(...)`, `:118`), clears the in-flight slot and records the
failure on rejection (`:123-126`), and deletes the failure only on success (`:120`).
`notReady` in `src/server/data/select.ts:18-28` distinguishes the three not-ready states — no start yet
("the first poll has not finished", `:21`), and a failed start named with its cause and the
retry policy (`:27`) — and begins at most one retry, not awaited, once an interval has passed:
`if (!startInFlight() && Date.now() - failed.at >= pollIntervalMs())` (`:22`). A recovered
start logs one line "after a failed start" (`:25`). A restart clears every slot and stops the
old scheduler first (`src/server/data/live/runtime.ts:140-147`).

## 3. Problem-set change logging

`src/server/data/live/cycleLog.ts:3-4`: "The runtime logs one `afterlife:` line when that set differs from the
last cycle's, so a standing problem is named once, when it starts and when it clears, not
every poll interval." `cycleProblems` (`:9-19`) collects the group error, warnings, a policy
the screens cannot show, and each project's error and issues, deduplicated in order;
`cycleLine` (`:22-32`) returns null when nothing changed and otherwise ``${added.length}
new``, ``${cleared.length} cleared`` and ``(${next.length} standing)``. The previous set is a
closure variable of the runtime (`said`, `src/server/data/live/runtime.ts:68`), so a new process treats every
problem as new.

## 4. The cadence's two clamps

`src/server/poller/scheduler.ts:11-12`: "setTimeout runs a longer delay after 1 ms, which
would turn "poll rarely" into "poll back to back"." with `const MAX_TIMER_MS = 2 ** 31 - 1;`.
The interval is clamped where it is parsed — "never below 5 (the rate limit is spike S7),
never past the longest timer" (`:14-17`) — and again where the timer is armed,
`Math.min(intervalMs, MAX_TIMER_MS)` (`:27`), which is adaptive-cadence's rule of the two
platform bounds, clamped twice.

## 5. The test lesson

`src/server/data/__tests__/runtime.test.ts:31-43` is the settle rule from
failed-start-kept-and-retried-at-cadence, learned the hard way: a page's retry start "can
outlast a test under load. Let it settle (and its log line land) before the next test, or it
logs into that test and leaves a runtime behind." `settle` awaits the in-flight start,
swallowing its rejection (`:33-36`); `afterEach` calls it before `reset()` (`:39-43`); and
waits on a retry use "A retry start takes a full first poll: wait for it as long as a slow
machine needs, not vitest's default second." with `const SLOW = { timeout: 10_000 };`
(`:37-38`). A 1 s default wait timed out under full-suite load, and the leftover start broke
the next test as well.

## Deviations recorded

- **The retry is demand-driven, and the messages say it is timed.** `src/server/data/boot.ts:17` logs "the
  start is retried every ${pollIntervalMs() / 1000}s" and `src/server/data/select.ts:27` says "It is retried
  every ...s", but the only retry path is `notReady` (`src/server/data/select.ts:22-25`), which runs when a
  page reads. With no reader the start is never retried. The demand-driven choice is
  defensible; the message is the defect.
- **One problem string carries a varying count.** `src/server/poller/mrFacts/facts.ts:106`
  pushes `${r.budget.skipped} agent-MR reads (size or pipeline) left for the next poll`,
  whose number moves cycle to cycle while the condition stands, so the change log reports it
  cleared and new on every change of count — the volatile-detail case the technique's step 4
  keeps out of a problem's identity.
