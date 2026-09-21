---
source: https://www.youtube.com/watch?v=gYtQ1LKSgXY
kind: youtube
url: https://www.youtube.com/watch?v=gYtQ1LKSgXY
title: "A Smart Way to Make Claude and Codex Debate"
author: Leon van Zyl (sponsored by the tool's vendor)
words: 2578
extracted: 9
accepted: 1
declined: 0
leads: 2
already_covered: 1
untriaged: 4
dispatched: 0
applied: 1
shipped: 1
run_id: intake-gYtQ1
siblings: 1
---

# Multi-harness agents that debate - intake 2026-09-14

**Class:** second-hand practitioner review, sponsored: a creator demos someone else's
open-source release (a local control plane that wraps several coding-agent CLIs, with
a web UI, session forking across harnesses, a "debate" agent, an orchestrator agent,
and session policies). **Expected yield said before the table:** that it shipped, a
catch or two, and one lead. A review is a lossy pointer, so the fetch carries the rest.
**Siblings live at claim:** 1 (`intake-4D8Zr`, a different video, no subject held).

**Declared focus from the scorecard** (rig first, never quote an agent's
self-verification, three seeds): all three are render-proof rules and none applies to a
non-render source. The one that generalizes, "never take a claim's rigidity from the
report of the pass that built it", was applied: the corpus absence was established by
opening four files, not from the map.

**Fetches:** 1 of 3 (the vendor's primary on the capability rule, 2025-10-31).

## Triage

Routing: all rows are upper-layer or currency. Rows 1-4 scored under Phase 5; rows 5-6
admitted under the corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Gate the capability conjunction per session, not per call | prompt-safety; mcp-tools/untrusted-result-handling | new-technique | real gap | 3/0/2 | **accept -> landed** |
| 2 | K | catch | S | Cross-provider plan review, consolidated by one agent | fleet-orchestration/heterogeneous-model-panels | none | likely catch | - | catch |
| 3 | K | catch | S | Plan with one model, implement with a cheaper one | model-routing | none | likely catch | 1/2/1 | untriaged |
| 4 | K | catch | S | Orchestrator sizes its sub-agent count to the task | fleet-orchestration/parallel-dispatch | none | likely catch | 1/2/1 | untriaged |
| 5 | K | catch | S | Deny personal data in outbound prompts | security/.../telemetry-pii-redaction (map only) | none | likely catch | 1/2/1 | untriaged |
| 6 | K | catch | S | Inbox of sessions awaiting input | fleet-orchestration/lifecycle-signals (map only) | none | likely catch | 1/2/1 | untriaged |
| 7 | T | lead | S | An open-source local control plane over several agent CLIs shipped | agent-cli-transport, terminal-multiplexing | resets-clock | - | - | lead |
| 8 | X | lead | M | Peer comparison against personas' runtime | fleet peer | - | - | - | lead |
| 9 | - | nothing | S | Windows needs a Linux subsystem; theme settings; daily scheduled brief | - | none | thin | - | dropped |

`auto=1/2/0`, `fp=0`.

## Row 1 - landed: `prompt-safety/session-capability-conjunction`

**Source claim [00:03:47-00:05:29]:** agents are dangerous when they read private data,
read text strangers wrote, and can send data out; per-action permission checks miss it
because each action is allowed; the demo's policy "blocks the step to send data out once
the agent has touched private data and read something from a stranger".

**Corroboration:** the vendor's primary (a platform company's security blog, 2025-10-31)
states the rule as "no more than two of three properties within a session", names a
fresh context window as the reset, and requires human-in-the-loop when all three are
needed. Training-data convergence as well: the three-leg framing predates both.
Highest tier present: the vendor document.

**Corpus read before landing (director-opened, not mapped):**
`mcp-tools/techniques/untrusted-result-handling.md` owns consent on read -> act
transitions and egress boundaries, **two legs** (untrusted -> outbound), and says nothing
about private material or session stickiness. `prompt-safety/prompt-safety.md` "The last
fence is capability" owns acting-door capability and read-side least privilege, both
judged per action. `payoff-removal.md` owns the response-channel side. Concept greps for
taint, exfiltration, and session-scoped egress returned no owner. **Stage:** the missing
stage is the session-level predicate between the read-side and act-side fences. It was
a seam, not a hole.

**What the source got wrong, and what that added:** the video presents the policy as a
per-session toggle the user adds, beside a PII-deny policy of the same kind. It shows
policies as a menu, not as a roster decision. The technique puts design-time roster
cuts first and the runtime gate second, because a gate that fires on every session
trains reflexive approval. The demo's own centrepiece, forking a full transcript into
other agents, is the case the source never connects to its own security segment: **a
fork inherits every leg.** That sentence is the technique's most reusable line, and it
came from the source's blind spot, not its claim.

**Altitude:** technique. Not proposed as a law. It is a first sighting in this ledger,
with convergence from one primary plus training data.

**Apply (Phase 7.5):** personas, `simulation`, verdict `unmeasurable`, application
`rust--session-capability-conjunction`. Seam chosen to falsify: the credential proxy's
existing scope enforcement might already cut the path. It does not. Scope bounds the
destination, not the direction, which became the technique's "destination scope shrinks
C" rule. Structural fact: the runner's only refusal-capable hook judges a request record
with no session identity, credentials enter the CLI environment at spawn, and the tool
roster is undeclared by default, so all three legs are unknowable to the host. Instrument
owed: execution id on the request record, a tool-result leg classifier, and a replayed
injection fixture.

## Catches

- **#2 Debate for review.** The demo's "debate" agent ran two seats from different
  providers in parallel, then one agent consolidated. `heterogeneous-model-panels` already
  says it better: round one is the product, later rounds are consistency machinery, and
  one synthesizer seat for builds. It also names the error the demo makes: the fork hands
  each reviewer the producer's full conversation and reasoning, which "Decorrelate the
  input as well as the seat" forbids.
## Untriaged (nobody verified these)

- **#5** a policy that scans the outbound prompt for personal data and blocks the request
  [00:05:29]. It maps to `telemetry-pii-redaction`, which is emit-side; whether any subject
  owns the prompt-egress door was not opened.
- **#6** an inbox listing sessions that await the operator's input [00:08:01]. It maps to
  `fleet-orchestration/lifecycle-signals`; not opened.

- **#3** plan with the strongest model, implement with a cheaper one [00:11:24]. The
  anchor is the creator's usage-budget preference, n=1. `model-routing` not opened.
- **#4** orchestrator dispatched one sub-agent because the task was small [00:12:15].
  Not opened.

## Leads

- **#7 (currency, lead):** an open-source local control plane over several agent CLIs
  shipped, with cross-harness session forking and a terminal and browser UI kept in sync
  on one session. Return condition: **a repository-class `/intake` over its tree**. It
  is design-shaped (a harness multiplexer, a policy engine, a cross-harness transcript
  format), and the video read none of it.
- **#8 (peer):** personas' `scope.does` names the same class of system. Return condition:
  the repository run above; the peer comparison study is dispatched then, not from a
  sponsored demo.

## Directions

`n/a` - no design record (video source).
