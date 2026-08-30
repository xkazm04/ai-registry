---
source: github:laude-institute/headlong
kind: research-model release (agent harness repo; README + design docs + code in one tree)
url: https://github.com/laude-institute/headlong
title: "Headlong - an open source agent microharness"
author: Laude Institute
words: 1882
extracted: 8
accepted: 2
declined: 0
leads: 2
already_covered: 1
untriaged: 3
dispatched: 0
applied: 2
shipped: 0
---

# 2026-08-30 - headlong agent microharness

Class read: **research-model release** in the harness sense - the engine and its
operating docs ship in one tree, so claims were corroborated in-run against a
shallow clone (design docs + implementing code), and 0 of 3 web fetches were
spent. The README behaved as the class predicts (advertisement); the yield sat
in `design/*.md`, which are first-party design documents with paid-for failure
modes recorded as revisions. Expected yield was said before triage: 2-3
techniques/amendments plus catches. Actual: 2 techniques, 1 catch, 2 leads,
3 untriaged. Unattended run - only `real gap` rows advanced.

## Accepted

### 1. Tiered history projection (technique, prompt-assembly)

Source claim: context is a projection of an append-only trajectory; the whole
life stays in context at exponentially decaying resolution; tiers act as an
index for raw retrieval. Corroborated against the tree's `design/tiered_memory.md`
(sealed blocks, provenance stamps, staircase assembly, budget derived from the
model window) and its implementation (`bin/recap --context`, the `_life_context`
helper). Landed as `tiered-history-projection` beside `history-compaction`,
with the boundary stated on both sides: replace-in-place compaction governs the
regime where the message list IS the record; projection governs the regime
where the record is external and the prompt is rebuilt per call. The corpus's
"one compaction away from gone" failure dissolves by construction in the second
regime - an enumeration that denied too much.

Applied to a managed project (simulation, three cases from the tree): verdict
**not-better** there today - histories fit the flat tail, no fetch-by-id
affordance exists, and long-range continuity is already carried by a curated
memory store. The technique gained the adoption-gate decision rule from that
seam.

### 2. Engagement-paced cadence (technique, cost-metering)

Source claim: an always-on loop's thinking rate backs off exponentially when
nobody is talking and resets on a message. Corroborated against
`design/monolith_backoff.md` - a primary with a measured cost model (~60 to ~6
wakes/hour at the default cap) and two recorded paid-for corrections: a
thought-only run must count as an empty wake or a ruminating mind re-fires at
full speed forever (observed on a live identity), and the loop's own outgoing
replies must not count as engagement. Landed as `engagement-paced-cadence` in
cost-metering, owning the stage upstream of every gate: how often a self-driven
loop wakes at all. Reactivity/spontaneity split, exponential descent with
dwell settling at a cap (never sleeping), wake classification by output,
scheduled wakes that free the loop's slot, crash-recorded-as-error-not-rest.

Applied to a managed project (simulation, three cases): verdict **better** -
the tree already emits the exact wake-classification predicate (a declared-
silence completion distinct from a real briefing) and consumes it only for
report-or-absorb, never for pacing; the cheap-probe second lever needs no
cron change.

## Already covered

- **Single shared stream, no per-user walls** ("one agent, one mind, many
  people") - `companion-identity/one-mind-many-mouths` carries the shape at
  higher fidelity. Catch.

## Leads (return conditions attached)

- **Self-improvement by fork-test-merge, no rollback machinery** - the agent
  forks its own harness (optionally its own trajectory), runs, and the change
  merges back only if it worked; the operators report 50+ commits pulled back
  from their agent's fork. First-party, n=1, and strip-clean ("discard the
  copy instead of building undo"). Return when a second independent source
  converges on discard-over-rollback for agent self-modification, or when a
  managed project grows an agent that edits its own harness.
- **Brokered sandbox: the policy authority never present in the sandboxed
  environment** (a host-side policy server; a constrained facade is what gets
  staged into the container). Sits near `security/authorization`'s
  dispatch-chokepoint-gating. Return when a managed project sandboxes agent
  code execution.

## Untriaged (unverified - nobody judged these)

- **Subagents see ancestors' trajectories** (why it was created, what the
  parent tried). Candidate amendment on `fleet-orchestration`
  (brief-carries-the-session states the brief-only side). Anchor: README "Key
  ideas".
- **Persistent agency: external messages land as observations in the thought
  stream; the agent decides if and when to respond.** Candidate near
  `companion-identity`. Anchor: README "Key ideas".
- **Always-on agent costs $1-2/hour at the operators' settings** - dated fact,
  usable as corroboration for a cost-metering application when one needs an
  idle-cost figure. Anchor: README "Get started".

## Declines

None - the unattended rule advanced two rows and recorded the rest untriaged.
