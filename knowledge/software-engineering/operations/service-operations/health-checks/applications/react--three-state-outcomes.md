---
layer: application
type: application
subject: health-checks
technique: three-state-outcomes
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Three-state outcomes — adding the fourth verdict to a React health surface

*Verified against the project tree at `bf2a1e249`.*

The [three-state-outcomes](../techniques/three-state-outcomes.md) technique is
about the answer "I couldn't find out". This surface is a per-agent health
check in a desktop client: it exercises a persona's configuration through an
IPC call, classifies what comes back into issues, scores them, and rolls the
scores into a digest with error/warning/info counts.

## The seam

`src/features/agents/sub_health/useHealthCheck.ts:406`. After the main probe
returns, the hook fetches config warnings through a second IPC call. That call
can fail on its own — the door is unreachable, the backend errored — and the
code handles it deliberately and visibly: it routes the error to Sentry and
pushes an issue onto the result so the user knows the score does not include
config-warning coverage. The comment above it says exactly that, and it is the
right instinct.

The issue it pushes has `severity: 'info'`. `computeHealthScore`
(`useHealthCheck.ts:75`) charges info 2 points. `aggregateDigest`
(`src/stores/slices/agents/healthCheckSlice.ts:175`) files it under
`infoCount`, inside `totalIssues`. So a failure of the *prober's own second
call* is rendered as a small deficiency of the *persona*, and a fleet checked
while that door was down scores a little worse across the board with no way for
anyone reading the digest to tell why. That is the unverifiable→failed collapse
in miniature: not a red board, a slow drift of the numbers.

## A and B

- **A** — the unrunnable sub-check is an `info` issue: −2 to the persona's
  score, +1 to `infoCount`, inside `totalIssues`.
- **B** — a fourth member on `DryRunIssue.severity`: `undetermined`. It is
  never scored (`computeHealthScore` penalises only the first three), it is
  counted in its own `undeterminedCount` bucket on the digest, and that bucket
  sits outside `totalIssues`. The config-warnings failure routes to it.

Four files, about thirty lines: the union and the digest field
(`sub_health/types.ts`), the severity validator and the push site
(`useHealthCheck.ts`), the aggregation (`healthCheckSlice.ts`), and one test.

## What was read, and what it said

- `vitest run src/features/agents/sub_health/useHealthCheck.test.ts`: 23 passed,
  including a new case pinning the difference —
  `computeHealthScore([issue('undetermined'), issue('undetermined')])` is
  `maxScore`/`healthy`, where the existing per-severity test pins an `info`
  issue at −2. That two-point gap per unrunnable sub-check per persona is the
  whole measured effect, and it is what the digest was silently charging.
- `tsc --noEmit`: clean **before and after**.

That second reading is the interesting one, and it is a negative result about
the method rather than about the code.

## The structural fact: the compiler could not enumerate the surfaces

The reason to model three-state outcomes as a closed sum, the technique says,
is so every consumer derives from one authoritative definition — "a consumer
that hand-copies the vocabulary is a blank badge waiting for the fourth
member." The expectation going in was that adding the fourth member would make
the typechecker list the consumers that had to decide something. It listed
none.

Nothing in this subtree switches exhaustively on `severity`. The renderers
compare; the scorer filters with three `===` predicates, so an unknown member
scores zero by accident rather than by decision; and `aggregateDigest` counted
its third bucket with an `else` tail:

```ts
if (issue.severity === 'error') totalErrors++;
else if (issue.severity === 'warning') totalWarnings++;
else totalInfos++;              // ← the fourth verdict lands here, silently
```

That `else` is the retrofit trap the technique describes, in its purest form:
the new state would have been counted as `info` in every rollup, with no
compiler signal, in a codebase whose type for the vocabulary had just been
widened correctly. The type change is necessary and does nothing on its own.
What actually moved the behaviour was rewriting the tail as an explicit branch
and writing an assertion; the union member is documentation until then.

## What this realization cannot do or prove

- **One producer, not a policy.** Exactly one site now mints `undetermined` —
  the config-warnings failure. The main probe still cannot say it: an IPC
  rejection or a missing `design_context` sets `phase: 'error'` and returns
  null, so "the check did not run" is still expressed as an absent result
  rather than as a verdict about the target. Neither IPC call carries a
  deadline, so the most common real unverifiable — the probe that never
  answers — has no path into this state at all.
- **No render semantics.** The technique requires unverifiable to render as its
  own visual state, never green, never red, never hidden. Nothing here renders
  it: the health-panel UI was deleted in 2026-08 (`types.ts:26`), so the digest
  has counts and no surface. This change makes the number honest; it does not
  make anyone see it.
- **No retry semantics.** Unverifiable is supposed to retry on the *obstacle's*
  schedule. The scheduler still evaluates a weekly cadence once per app launch;
  nothing re-checks when the door comes back.
- **The now/ever split is absent.** Every `undetermined` here is
  cannot-probe-now. Nothing in the model can say cannot-probe-ever, and no
  staleness rule distinguishes them.
- **It proves nothing about how often this fires.** The two-point charge is
  measured per issue; whether the config-warnings door fails once a year or
  once an hour is not knowable from the tree, and no metric in it counts.
