---
source: web:github.com/context-labs/whip
kind: open-source infrastructure engine (engine + operating docs in one tree) - sub-class: comparative-design corpus
url: https://github.com/context-labs/whip
title: "whip - a fast coding-agent harness"
author: context-labs
words: 678 (landing page) / ~15800 (in-tree design docs) / ~10300 (rival teardowns) / 649 files
extracted: 16
accepted: 7
declined: 0
leads: 0
already_covered: 0
untriaged: 9
dispatched: 0
fetches_spent: 0
---

# whip - a coding-agent harness that ships its rivals' teardowns

Part of [[index]].

## The class, and the sub-class this run names

The archetype is the one [[2026-08-27-picomq-durable-streams]] characterised: an
open-source engine whose design documents ship in the same tree as the code implementing
them, so every doc claim is falsifiable in-run at zero fetch cost. That held exactly.
**Zero of three fetches spent - the seventh consecutive zero-fetch run for a source
carrying its own primary material.**

The landing page returned 678 words, which is what a repository landing page returns:
install instructions. Pricing the run off that number would have been the same mistake
picomq's run made and corrected; the actual source is `docs/` (~15,800 words), the tree,
and one thing picomq did not have.

**The sub-class worth naming: the comparative-design corpus.** This tree carries
first-party teardowns of four rival implementations of the same product category, each
cited `file:line` into that rival's source, plus a live probe that drove five competitors
in a PTY and captured their first paint. Its yield property is a stronger version of the
research-model-release class's sibling-instruction property:

> **Every "what we should NOT take, and why" section is a discriminator someone was
> forced to draw.** A release with two contradictory sibling documents hands you one
> boundary for free; a teardown corpus hands you a section of them per rival, already
> argued, already attributed.

Four of this run's six landings came from that half of the tree rather than from the
engine's own docs. The engine documents what the authors built; the teardowns document
what they considered and refused, which is the material a mature corpus is short of.

Second observation, and it is the one that priced the run honestly: **high relevance
predicts a high catch rate, not just a high landing rate.** A coding-agent harness maps
directly onto `llm-agent/runtime-and-io`, this corpus's densest area (8 subjects), so the
expected outcome was several picked rows resolving to already-covered. That is not what
happened - but the reason it did not is specific and worth carrying: every landing came
from an **enumeration, an asymmetry, or a missing producer**, never from a concept the
corpus lacked. The corpus already knew every concept in this source. It had not stated
every boundary.

## Landings

### 1. Run broadcast callbacks outside the registry's own lock (accepted)

**Anchor:** "worker holds `mu` waiting on the UI queue, UI waits on `mu`" - an ABBA
deadlock diagnosed from a goroutine dump, with the regression test that reproduces it.

**Landed:** amendment to `client-architecture/realtime-events/subscription-lifecycle`.

The map's strongest signal: `"broadcast observer deadlock"` returned **one** spurious hit
across 337 subjects. The enumeration hunt then found the seam exactly: the technique's
fan-out section says *"The fan-out loop has one sharp edge"* and gives snapshotting as
the remedy. Snapshotting answers set mutation. It says nothing about lock ownership
during dispatch, and a loop can snapshot correctly while still dispatching under the
lock - which is the deadlock. Amended to two sharp edges, with both required rules
(snapshot under the lock, invoke after releasing; a subscriber whose delivery can park
detaches the hand-off) and the ordering cost the second rule trades away.

The reordering trade is resolved *by this subject's own reconciliation rule* - a surface
that resyncs from the settled record loses nothing to a reordered interim frame - which
is why the amendment belongs here rather than in `concurrency-guards`.

### 2. Join over a durable resource: the signal that cannot fire twice (accepted)

**Anchor:** "the first implementation re-closed on reconnect and panicked"; watchers
carry a generation so a stale drop event cannot fail a fresh connect.

**Landed:** amendment to `backend-platform/work-execution/concurrency-guards/single-flight-primitives`,
plus a `use_when` entry and a decision rule.

`single-flight-primitives` enumerates five second-caller policies. **Join is written for
a computation** - one execution, N waiters, one result, finished. Point it at
*establishment of a durable resource* and the execution recurs, while the natural
broadcast primitive (a one-shot completion signal) is one-shot by construction. The
second landing in a row against this file's enumeration; picomq's run added `merge` as a
sixth policy, this one scopes `join`.

Three rules landed: the signal means "first attempt settled" not "usable"; callers read
live state after it, never the signal; every watcher carries its generation. The closing
distinction is the reusable part - single-flight over a computation guards **work** and
yields a value; over a resource it guards **establishment** and yields state with a
lifetime.

### 3 + 4. History compaction (accepted, merged into one technique)

**Anchors:** "orphan-safe: a tail that begins with a tool-role message walks back to its
owning assistant message"; "a `compacted` guard prevents retry loops"; and, from the
rival teardown corpus, crash recovery that "synthesizes error tool_results for dangling
tool calls from an interrupted turn".

**Landed:** new technique `llm-agent/prompt-and-context/prompt-assembly/history-compaction`,
registered bidirectionally, plus a paragraph in the golden path.

Triaged as two rows and merged on verification, because both are one root: **our
accounting versus their protocol.** The missing-stage hunt found it. The golden path's
layer table has five layers - identity, policy, capability, context, task - and every one
of them is *authored*. A multi-turn tool-using transcript is none of the five: it is the
only part of the prompt that grows as a consequence of the system working correctly, and
nothing owned it. `context-budgeting` is thorough from stage two onward, which is exactly
where a missing stage one hides.

Three invariants, all failing in the same silent direction:

- **Pairing.** "Cut at semantic boundaries" is `context-budgeting`'s rule and it is
  insufficient here, because the boundary is supplied by the protocol rather than by the
  reader: a tail of the last N messages that opens with a result whose call is now gone
  reads perfectly as prose and is rejected as protocol. Cuts are defined over
  call/result groups; the summary may not be inserted between a pair either.
- **Resume.** A third regime `continuation-prompts` does not enumerate - not "session
  preserved", not "session lost", but **carried and structurally broken**: the record is
  intact and missing the half of a pair that will never arrive. Repair with synthesized
  "did not complete" results before assembly, and treat a non-empty repair as the crash
  report it is.
- **Size.** `context-budgeting` reserves "safety margin for counting error", which is a
  hedge against two estimates (an advertised window that is not what the request is
  measured against; a local counter that may not be the provider's). A hedge is not a
  guarantee, so compaction needs a reactive path on the provider's refusal - guarded by a
  once-per-turn flag, without which a misclassified rejection becomes a compact/retry
  loop that shrinks the conversation to nothing and bills a summarization per iteration.

Closing section on the summarizer earns its place from the *economy* the source
documents (route summarization to a cheaper model): the summary is the one place
model-generated text is promoted into a standing layer of every later prompt, so its
errors are not transient.

### 5. The steering channel has more than one producer (accepted)

**Anchor:** "the model can't distinguish a scheduler turn from a human turn except by
prompt content" - one `Wakeup{source, prompt}` channel serving cron, webhooks, inbound
external messages and post-restart notices alike; background subagent reports delivered
as steered messages.

**Landed:** amendment to `llm-agent/runtime-and-io/streaming-output/mid-turn-steering`.

The asymmetry hunt. `mid-turn-steering` models the injection mechanism completely and
models exactly one producer: the human. Its vocabulary is "the user", "the caller", "a
message arrives while the turn is still running" throughout.

**Its sharpest edge inverts for machine producers, and the technique's own justification
is why.** It rules that a steer with no turn in flight must refuse loudly rather than
queue, because "the caller will also submit the message through the normal next-turn path
- its own degrade - and the quiet acceptance now delivers it twice." That reasoning
depends on a property only a human caller has: a second door. Nothing will re-offer a
worker's report or a scheduled wakeup. So for machine sources: start a turn or hold
durably, never refuse; and record the delivery before attempting it, because the gap
between "fact produced" and "turn began" is where a crash eats work with nothing left to
reconcile against.

Provenance obligation added in the other direction - a machine-authored message on the
user's channel is a trust question, and an inbound external message is untrusted input
wearing the user's clothes.

### 6. The consent tuple fails in the narrow direction too (accepted)

**Anchor:** `permission/arity.ts` - a table of command-prefix arities so "allow always"
on `git checkout some-branch` installs a rule for `git checkout`, not the argv; flags
never count. And: "always" is a second screen showing exactly which patterns it installs.

**Landed:** two sections in `llm-agent/orchestration/hitl-approval/consent-gates`, plus a
`use_when` entry.

A seam, not a hole. `consent-gates` already owns "the scope of subsequent is the design
decision" and names three axes (agent, capability, target) - and warns only about the
tuple collapsing too **wide**. The opposite failure is where the capability axis is not
an operation the system defined but a string the agent composed: no capability to key on,
no target to separate, so the grant records the literal action and is worth nothing. The
fatigue trade the gate exists to make never happens, and the human learns to answer
without reading - the exact failure the gate was built to prevent, reached via a gate
that fired correctly every time.

Second section from the asymmetry: the technique discloses all four dimensions of the
*action* and says nothing about disclosing the *grant*, which is the half that outlives
the moment. Landed with the cheapest reason to do it - a human shown the rule about to be
installed is the only available audit of the arity table, because in isolation every
entry in that table looks reasonable.

### 16. Prior-art teardown (accepted, S lane)

**Landed:** `practices/prior-art-teardown/` with a starter (`docs/prior-art/` README +
per-rival template), and a row in the README practices table (4 -> 5).

The source's own machinery, generalized. Five required sections per rival, of which two
are the point: **what we explicitly do NOT take, and why**, and **where they are ahead of
us**. The first is the section nobody writes unprompted and the reason a rejected idea
gets re-argued from zero every six months; the second is what keeps the document from
being advocacy. Plus the `path:line`-against-a-pin discipline that makes a claim about
someone else's system re-checkable when they change it, and the rule that backlog items
borrowed from prior art cite the teardown they came from.

## Untriaged

Reached the table, never picked. Recorded with anchors so a later run does not re-derive
them; **nobody verified any of these** and they carry no judgment.

| # | Title | Anchor / substance | Prior art |
| --- | --- | --- | --- |
| 7 | Grandchildren hang you on the pipe, not the pid | non-interactive path closes output pipes on process exit so a detached grandchild (`sleep 30 &`, nohup) cannot hang the agent waiting on pipe EOF; process-group SIGKILL on exit | `subprocess-lifecycle/termination-and-reaping` |
| 8 | Bound the enrichment wait; cold start is not in it | rival blocks the edit tool up to 5s for diagnostics and can additionally pay a 45s initialize on first touch, with a "LATENCY-CRITICAL" comment on its own early-resolve path; this source caps at 1.5s and warms reads in the background | `subprocess-lifecycle`, `mcp-tools` |
| 9 | Explicit mention reads; ambient context points | a discriminator already drawn: explicit `@file` rewritten into a synthetic read tool-call/result pair (so the model will not re-read it and compaction treats it as a tool result, not a giant user message) vs ambient IDE state injected as a mention-only reminder. This source chose the pointer shape with a stated revisit condition | `prompt-assembly/context-reachability` |
| 10 | No attributable entity -> the guard goes global | `guard-key-design` enumerates identity axes and says entity is "almost always included"; a shell command's side effects are attributable to no path, so it takes a single global guard while per-path writes run parallel | `concurrency-guards/guard-key-design` |
| 11 | Every degradation names itself and its remedy | a rival surfaces `[Skill conflicts] description exceeds 1024 characters (1089)` at first paint; this source silently truncates at 300 and "the user never learns their skill is broken" | `agent-instruction-files` |
| 12 | A probe that can never settle must not gate first paint | a rival harness hangs forever awaiting an OSC 11 answer its terminal never sends - 148 bytes out, no UI, bricked in any non-mainstream terminal | `adaptive-fidelity-tiers/measurement-settle-budget` |
| 13 | The tool schema is a scheduling contract | the shell tool's JSON schema documents the per-path locking behaviour so the model batches independent calls in one turn and serializes same-file ones | `mcp-tools/tool-schema-design` |
| 14 | The tool set changes turn to turn | tools re-registered every model round so installs take effect mid-turn; the operating rule given to the model is "never assume a tool exists because it did earlier" | `mcp-tools` |
| 15 | Rewind the world, fork the history, delete neither | rewind restores the filesystem and **appends** an event saying so; fork deep-copies history with provenance recorded inside the new log; the anti-loop argument is that an agent which rewinds can see what it already tried. Mapped to **nothing** - `time-travel-replay` is about watching a finished run, an unrelated concern. Marked XL at triage | none (real gap) |

Row 15 is the one worth returning to: it is the only candidate in the run with no home
anywhere in the corpus.

## Declines

None. Nine candidates were untriaged, which is not the same thing and must not be read
as one.

## Method notes for the next run of this class

- **Read `docs/learnings/` (or its equivalent) before `docs/`.** In this tree the
  rival-teardown directory outproduced the engine's own architecture docs 4 landings to 2,
  and it is not where the README points.
- **The landing page word count is noise for this class, twice confirmed.** 678 words
  here, 453 for picomq; both trees carried five figures of design material.
- **Expect catches, get boundaries.** The prediction "high relevance means a high catch
  rate" was reasonable and wrong in an instructive way: the corpus held every *concept*
  in this source and was missing *stated boundaries* in five places. When a source lands
  squarely on a dense area, budget the verification for enumerations and asymmetries
  rather than for concept gaps.

## Run conditions

A parallel agent session was live in this checkout throughout (writing to `eval-harness`,
`retrieval`, `mcp-tools`, `job-coordination` and its own source note). Its content was
left untouched; `index.json` and `catalog.json` were deliberately **not** committed by
this run because the regeneration covers that session's un-landed work. See the touch
logs for what this run owns.
