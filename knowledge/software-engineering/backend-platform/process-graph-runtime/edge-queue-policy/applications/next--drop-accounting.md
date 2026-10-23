---
layer: application
type: application
subject: edge-queue-policy
technique: drop-accounting
stack: next
status: forged
verified_on: 2026-10-22
verified_against: next@16.4.2
applied: code
ab_verdict: better
proof: ab-paired
---

# Drop accounting on a browser-to-server observation channel, in a hiring app

**Witness:** the tree's `package.json` pins `next` at 16.4.2 under `node >=24`. The
change was made on a worktree of the project's published default branch, and the
project's own unit runner and a type check over the touched files read it there. kp
(`github:xkazm04/kp`, commit `d59a1cb45`) runs AI voice interviews. A live call's
browser sends the server what only the browser can see: the candidate left the tab,
came back after N ms, took M ms before answering. Those observations travel on a
bounded queue in `app/_components/voice/director-channel.ts`. It is not a channel
between two processes in a graph, but it is an edge with a declared policy that runs
for a whole call, so this application tests the technique on the closest real shape.

## What the tree did

The queue held `MAX_QUEUED_EVENTS = 60` while the director was unreachable and dropped
the oldest past that. The comment says why: "they are telemetry, and an unbounded queue
on a 45-minute call is not". The policy is right. The edge just counted nothing, at two
discard sites:

- **evicted-ordinary**, the cap during an outage. Nothing counted or logged it.
- **flushed**, `close()`. Observations still queued when the call ended, and any that
  arrived after it, were dropped without a trace. Nobody had listed this site. The
  reconciliation found it.

The consumer that needs the difference is the recruiter's evidence view.
`summarizeFocus` already prints the departures it cannot measure, and a return with no
departure carries the comment "or the departure row was lost. It still happened."
That consumer was left guessing at a drop the queue knew about and never said.

## The pair

Same module, same inputs, one harness. Arm A was the published file and arm B the
change. The measurable is the reconciliation residual, *sent - acknowledged - counted
drops*. Acknowledged is read where the director answered, never where the browser sent.

| Scenario | A: acknowledged / residual | B: acknowledged / evicted / flushed / residual |
| --- | --- | --- |
| 100 observations in an outage, then the director returns | 60 / **40** | 60 / 40 / 0 / **0** |
| 5 observations queued, then the call ends | 0 / **5** | 0 / 0 / 5 / **0** |

**Floor:** the delivered set did not change. It was the same 60, the newest, starting at
#40, in order. The channel suite passed 16 of 16: the 15 earlier tests plus the new
reconciliation test. The new test fails on arm A, and a type check over the touched
files was clean, with a planted error reported as a positive control. B logs one
warning when an outage starts evicting and no line per drop.

The test that first drafted the reconciliation got its own `delivered` wrong. It summed
the events in every request posted, including requests posted into the outage, and
came up one short. This is the send-side count the technique warns against, written by
the run applying it.

## What the tree confirms

**A test named for a policy did not assert it.** The suite's "observations are bounded
and sent in order, oldest dropped first" filled the queue into an unreachable director
and then only awaited idle. The order it was named for was never read. The behaviour
turned out to be correct: the strengthened test passes on arm A. The gate was still
reading a proxy, and the counter is what made the claim cheap to check.

**The third drop site is on the server, and the browser cannot see it.** Past
`MAX_INTERVIEW_EVENTS_PER_SESSION = 4000` the exchange still answers `ok` and stores
nothing. The browser counts those observations as acknowledged. From the browser side
the edge looks healthy in exactly the case where it is not. The technique's rule
(count at the drop site, never at the send site) puts that counter in the server
exchange, and the tree does not carry one.

## What this realization cannot do

The count stays in the browser. The channel exposes `droppedEvents`, and nothing yet
carries it onto the director request or into the stored session. The recruiter's focus
summary therefore still cannot tell "never left the tab" from "the departure was
dropped in an outage". Closing that gap means a wire field and a stored row, which is
the project's next change, not this one.

## Anchors (commit `d59a1cb45`)

- `package.json:121` "next": "16.4.2"
- `app/_components/voice/director-channel.ts:46` "telemetry, and an unbounded queue on a 45-minute call is not"
- `app/_components/voice/director-channel.ts:226` "dropped.evicted += events.length - MAX_QUEUED_EVENTS"
- `app/_components/voice/director-channel.ts:259` "dropped.flushed += events.length"
- `app/_components/voice/director-channel.test.ts:256` "no residual: every drop path counted"
- `app/_lib/voice/director-step.ts:151` "canStore: () => listed.length < MAX_INTERVIEW_EVENTS_PER_SESSION"
- `app/features/hiring/schedule/scheduleInterviewEvidence.ts:147` "or the departure row was lost. It still happened."
