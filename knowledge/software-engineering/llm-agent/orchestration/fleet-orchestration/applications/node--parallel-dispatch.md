---
layer: application
type: application
subject: fleet-orchestration
technique: parallel-dispatch
stack: node
status: forged
verified_on: 2026-09-17
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node — the ceiling that could not fire, and the total beside it

The version witness is the runtime the repository pins for itself
(`package.json`, `"engines": { "node": ">=24.0.0 <25.0.0" }`), not a version a
dispatch guessed. Citations are against the public tree
[xkazm04/kp](https://github.com/xkazm04/kp) at `73672577`, read on the
`verified_on` date; the change measured below is `05a9cb7f` on `backlog/c27`.

## The door, and what it counts

A recruiting platform forks a child interpreter for every request that needs
its scoring engine. After a burst starved the server, one process-wide
admission semaphore was put in front of every fork
(`app/_lib/python-runner.ts:160-222`): it admits `KP_PYTHON_MAX_CONCURRENT`
(default 4), queues the overflow for a bounded wait, and then refuses it with
a typed `503 ENGINE_BUSY` rather than holding a socket whose client has gone
(`app/_lib/python-runner.ts:123-132` states the reasoning). It is the
technique's slot scheduler almost exactly: one door, a cap that is fleet
policy rather than a courtesy, and a slot released on settle, which its test
pins ("slots are released on settle, so the ceiling is not leaked away one
spawn at a time", `app/_lib/python-runner-concurrency.test.ts:69-73`).

And the tree names the amendment's distinction against itself without
noticing. The defect the semaphore was built for is written down as a *total*
— "Every request that needed the engine forked its own CPython with **nothing
bounding the total**" (`app/_lib/python-runner-concurrency.test.ts:5-7`) — and
what was built is a stock cap. For the burst that motivated it the two
coincide, because the arrivals are simultaneous. For a caller that arrives one
at a time they do not coincide at all.

That release is what makes it a stock bound, and the tree contains the case
that shows the difference. The scheduled policy pass runs a pre-policy
scoring sweep (`app/_lib/automation-pass.ts`, `scoreUnscoredEntries`): it
reads the entries nobody has scored yet, groups them by job, and walks the
groups in a **sequential** loop, one paid fork per group, awaited. A
sequential loop never holds more than one slot. The ceiling is therefore
unreachable by this caller at any setting, including 1 — and the number of
groups is read out of the database at run time (distinct jobs with unscored
entries, across every tenant), not enumerated in code. What one pass could
spend was bounded by nothing.

## The seam was chosen to falsify, and what it refuted

The seam that would have shown the technique working is the burst door, where
the cap already does its job. This one was chosen because it could kill the
amendment two ways: the sweep's total might turn out to be bounded already
(by a spend ceiling, a rate window, or a fixed list in code), which would make
the second number ceremony; or the deferred tail might be unrecoverable, which
would make a total cap a way of *dropping* work where the concurrency cap only
delays it.

Neither held, and the second one nearly did. The tail is recoverable here only
because an admitted group's score is persisted and the next pass re-derives its
list from what is still unscored — so deferral advances. That is a condition,
not a property of total caps, and it is now the amendment's load-bearing
sentence. A sibling case in the same fleet did the refuting on the other side:
a long-running responder crate bounds its paid child runs with an in-flight
dedup, a per-project cooldown, a rolling-hour spawn cap and a concurrency
semaphore, and has no run to key a total on at all — a rate is the right
second number there, which is why the amendment states when the total is not
owed.

## A and B

Arm A is the sweep as it stood: a `for` loop over the job groups, one fork
each. Arm B adds a per-pass total, derived from the ceiling rather than typed
beside it (`scoringSpawnBudget()` = ceiling x 8 rounds, overridable by
`KP_AUTOMATION_SCORING_SPAWNS_MAX`, floored at 1 and falling back to the
derivation on an unparseable override), checked at the same door, with the
overflow deferred to the next scheduled pass and recorded — a warning naming
the budget and its derivation, plus `summary.scoringDeferred` on the persisted
run row.

Read from the project's own unit gate, over a 12-group pass at a budget of 4:

| | arm A | arm B |
| --- | --- | --- |
| paid forks issued by one pass | 12 | 4 |
| groups deferred, counted | 0 (none; the concept did not exist) | 8 |
| ceiling breaches observed | 0 | 0 |
| passes to score all 12 groups | 1 | 3, each taking its own four |

The floor held: the same twelve groups are scored, once each; a budget above
the work admits all twelve and defers none; a group that resolves no candidate
issues no fork and does not consume the allowance; and the existing admission
suite, the policy-pass parity suite and the scheduler tenancy suite stay green
(43 passing across the five files, 51 across the wider automation set), with
`tsc --noEmit` clean.

Two assertions are there to keep the instrument honest rather than to describe
the change. At a budget of 100 the observed number must be 12 and not 100, or
the counter is reporting its own limit. And a work list re-derived *unchanged*
must starve: three passes at a budget of 4 reach four groups and never the
twelfth. That test fails if deferral is ever made safe by construction, which
it is not.
