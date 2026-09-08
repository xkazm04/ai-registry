---
layer: application
type: application
subject: stream-proxy-hop
technique: lifetime-cap-rotation
stack: next
status: forged
verified_on: 2026-09-05
verified_against: next@16
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The cap was answered one layer down, and the rotation had nothing to add

Citations are against `ascent` at `0c7996f2` (2026-09-05, branch `master`).
The tree pins Next.js `^16.3.3` in `package.json`; the streaming route runs on
the `nodejs` runtime. The working tree carried uncommitted changes in four
sibling files under `src/lib/llm/` (`config.ts`, `index.ts`, `text-meter.ts`,
`tracklight.ts`) during the run; the two files the read turns on,
`src/lib/llm/tool-loop.ts` and the route, were clean at HEAD.

The route is `src/app/api/athena/[id]/message/route.ts`: a `POST` that
answers one chat turn as `text/event-stream`. It is an **origin, not a hop** —
there is no upstream socket to re-emit — but it sits under exactly the timer
the technique is about: `export const maxDuration = 300` at line 43, with a
ten-line header comment above it (lines 34-42) that derives the technique's
central claim on its own: *a platform timeout does not raise inside the
stream: it kills the function, so the `catch` that would have sent `error`
never runs and the client sees a socket die mid-answer — the one failure this
file is built to avoid, reachable by clock rather than by bug.* That comment
was added by a commit on 2026-08-28 that also declared the cap, because until
then the route ran on the platform default.

## The seam, and what the technique would have added

The stream body (lines 71-104) has two exits, both reaped in one `finally`:
the client's abort and the turn's own end. There is no third exit — no
deadline timer, no *rotated* event, no resume cursor. Read against the
technique's rotation, every one of its four moves is absent from this file.

Read against the technique's **exclusions**, two of the three match, and the
first of them is the finding.

**The client cannot resume.** `src/features/shared/athena/stream.ts` sends the
message with a `POST` `fetch` and drains `res.body` once; there is no
`EventSource`, no reconnect, no `Last-Event-ID`, and no replay window on the
origin to answer one — the assistant turn is persisted only when it settles
(`src/lib/athena/turn.ts`, the `appendTurn` after the loop), so a reconnect
would find the question and nothing to resume from. A rotation here would be
a terminal event the client reads as "the connection dropped mid-answer",
which is what it reads today from a dead socket, delivered ten seconds
earlier. That is the technique's third exclusion, verbatim.

**The stream is bounded by construction — but not where the route is.** The
route declares nothing about the turn's length. One layer down,
`src/lib/llm/tool-loop.ts:66` declares `ATHENA_TOTAL_BUDGET_MS = 90_000`: one
`AbortController` for the whole loop, combined with the request's signal by
`AbortSignal.any` and threaded through every model call, and its expiry is
handled as a **truncation** (`truncated: true`, tracklight status `timeout`,
the partial text returned) rather than an error, so the route's ordinary path
emits `settled` and `done`. The comment beside the constant reasons the cap
rule out independently of the corpus: *`withLlmTimeout` is strictly per call,
so an N-leg loop built on it alone would be allowed N × `LLM_TIMEOUT_MS` —
four 60s legs is four minutes, well past any serverless function limit.* The
turn's lifetime is therefore ninety seconds of model time plus bounded
database and tool calls under a three-hundred-second cap, and the technique's
second exclusion — a cap generous enough for a slow legitimate run plus a
watchdog on the job — is the shape the tree already has.

## The paired measurement

The claim worth testing was not the rotation (excluded twice) but the
exclusion it lost to: is the turn *actually* bounded by construction, and by
what? The bound the tool loop replaced — per-call ceilings only — is still
expressible through the loop's public `budgetMs` option, so both arms ran the
real `runToolLoop` with no product change. Same inputs through both: a
provider that answers every leg with a tool call after a fixed latency and
honours abort like a real transport, four legs (`ATHENA_MAX_LEGS`), a fake
clock, and the predicate the tree itself uses for its batch routes — lifetime
under `maxDuration` minus `FLEET_FINALIZE_RESERVE_MS` (`src/lib/pool.ts`),
i.e. under 285s.

| per-leg latency | A: per-call ceilings only | B: one 90s cross-leg deadline (HEAD) |
| --- | --- | --- |
| 59s (just inside the 60s default) | 236s, 4 legs, inside the cap | 90s, 1 leg, truncated, inside |
| 75s | **300s — the cap; the kill** | 90s, 1 leg, truncated, inside |
| 120s | **480s**, 4 legs | 90s, 0 legs, truncated, inside |

Arm A's lifetime is `ATHENA_MAX_LEGS × per-call ceiling`, and it crosses the
line once that ceiling passes about 71s. The ceiling is `LLM_TIMEOUT_MS`
(`src/lib/llm/config.ts:68`): read from the environment at call time, floored
at one second, **with no upper bound and nothing coupling it to
`maxDuration`**. Under arm A, then, "bounded by construction" was true at the
default and false at any operator value above 71s — not a bound but an
arithmetic accident of two unrelated knobs. Under arm B it is a constant. The
3.3× margin between the 90s budget and the 300s cap is what makes the route's
header comment, which still describes the kill as reachable by clock, no
longer quite true: the kill is reachable only if the loop budget is raised
toward the cap or a tool call escapes its own timeout.

## Verdict and the condition it bought

`not-better`. The rotation had no seam to improve: the client cannot follow
one, and the alternative the technique names for that case is what the tree
built. Nothing shipped; the route, the loop and the client are unchanged.

What the seam showed that the technique did not say is now in the technique's
second exclusion: **bounded by construction is a sum, not a term**. A stream
made of N sequential calls each under its own timeout is not bounded until a
single cross-call deadline exists, and an env-controlled per-call ceiling is
not a bound. The check that decides between this exclusion and the rotation
is the sum of the per-call ceilings along the longest path against the cap
minus the epilogue — and the first move when that sum is env-controlled is the
one deadline, which this tree had already made.

## The structural fact

The tree carries the technique's *close before the cap, with a margin* rule
in every batch route it has — `fleetDeadlineAt(invokedAt, maxDuration)` on
four cron routes, a soft wall-clock budget in the retention purge, a scan-wide
LLM budget in the assessment — and in none of its two streaming routes. That
is not an omission. The batch routes are fan-outs whose length is the fleet's,
so they need the deadline at the route; the streaming route's length is the
loop's, so the deadline lives in the loop. The seam the technique names (the
route, beside the heartbeat constants) is empty here because the bound is
owned by the component whose length it bounds, which is where the technique's
own *creation names the reaper* law would put it.

Return condition: token streaming (the `delta` frame the client already
reserves a slot for) or a resume path on the client — either makes a turn's
useful length exceed a fixed loop budget, and rotation becomes cheaper than a
longer budget. Until then, re-read only if `ATHENA_TOTAL_BUDGET_MS` moves
toward `maxDuration`.
