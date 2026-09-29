---
source: youtube:doR2RhsneRA
kind: youtube
url: https://www.youtube.com/watch?v=doR2RhsneRA
title: This Is What $2,175 of Opus 5.5 Tokens Can Do...
author: Stefan 3D AI
words: 3456
extracted: 13
accepted: 1
declined: 0
leads: 1
already_covered: 6
untriaged: 3
dispatched: 0
applied: 1
shipped: 1
run_id: in-dor2-0929
siblings: 0
fetches: 0
rescan_when: not a repository source
---

# The first character was copied twelve times before anyone looked

**Class:** practitioner build-walkthrough (sponsored). A creator hands a coding
agent a packaged spec, reference images and their own asset workflows, lets it run
unattended for about 36 hours (roughly 30 of active work, with one host crash and a
resume), and then plays the result on camera for the first time. The tour half is
the gameplay demo. The operating half is what happened during the run: a
screenshot journal the agent kept, casual mid-run prompts from a second machine,
the crash, and the token accounting. Expected yield per the class: catches and
proper nouns from the tour, and at most one finding from the operating half. The
fetch budget was not needed (0 of 3), because the one landing is corroborated by
code read in a fleet tree and by training-data convergence (first-article
inspection, canary release).

Declared focus from the scorecard (when the owed change rewrites instructions, ship
behaviour pins first) did not apply. The one landing appends, and the project change
is code with its own tests.

## What the proudest segment was hiding

The demo's best segment is the character select: six races, two genders, a
customisation screen. It also carries the run's one real finding, spoken without
noticing it. The held-item defect ("holds the sword almost right" [00:11:15], "this
staff is not inside the head", "the hands and holding items probably the weak spot"
[00:12:07]) appears on every race and class. The run built one character first
("when he did first character he started to approach another race" [00:06:15]), so
whatever was wrong with the first instance was copied into the next eleven before
any perceptual judgment existed. The agent's own verification did not see it: it
played, but "it always went here to test" [00:13:24], at one mob camp near spawn.

## Triage (v2.5 score; siblings live: 0)

| # | Title | Prior art | Read | G/R/C | Rule | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Review a fan-out point when it decides, not at run end | game-production/craft-judgment/unattended-build-loop (verifier-coverage-review-agenda; run-end only) | real gap | 3/1/2 | score | **accepted: technique `review-at-the-fan-out-point`** |
| 2 | Keep a screenshot journal of milestones for the reviewer [00:03:43] | same | partial | - | - | folded into #1 (the intermittently-watched decision rule) |
| 3 | Operator steers mid-run with casual prompts [00:05:50] | same | partial | - | - | folded into #1 (prompts about a first instance are the request made by hand, late) |
| 4 | Resume after a host crash, nothing lost [00:07:05] | unattended-build-loop/rollback-to-last-green ("the ledger must survive a restart") | likely catch | - | - | already covered |
| 5 | Grey-box first, then iterate by playing [00:04:35] | wiring-contract-doctrine/no-gray-box-rule ("grey boxes are the correct output of a blockout") | likely catch | - | - | already covered: the apparent contradiction is the rule's own stated boundary |
| 6 | The self-play tester always tests at one spot [00:13:24] | craft-judgment/playtest-signal-to-defect (a machine "plays the same route in the same order until somebody changes the route") | likely catch | - | - | already covered, and it converges with the source |
| 7 | Generated characters fail at held items [00:12:07] | generated-asset-world-scale/reference-skeleton-size-check; image-to-3d-input-gating/part-cut-planning | likely catch | - | - | already covered |
| 8 | About ten agents at once vs "rewinding forces a concurrency of one" [00:05:00] | rollback-to-last-green decision rules (isolated trees; throughput When-NOT) | likely catch | - | - | already covered: a denial checked for over-reach, and it holds |
| 9 | 7.85B tokens, ~99% cache reads [00:07:30] | software-engineering cost-metering/unit-classes-are-open | likely catch | - | - | already covered (token classes are reported apart) |
| 10 | One flat-rate weekly allowance absorbed ~$2.2k API-equivalent in ~30h at ~10 parallel agents; one model family burns allowance slower [00:05:25, 00:07:55] | agent-operations model-and-effort-selection ("cost in the unit that binds") | thin | - | corroboration table | **lead** |
| 11 | The agent built a debug surface (god mode, teleport, time control) [00:14:14] | branching-narrative-graph-validation/reachability (debug jumps are entries) | thin | 1/2/2 | score | untriaged |
| 12 | A packaged spec, reference board and method skills front-loaded before an unattended run [00:00:50] | production-prompt-architecture; judgeable-spec-authoring | likely catch | 1/2/2 | score | untriaged (not opened) |
| 13 | Code-built geometry is below the bar; spend on generated models and images [00:08:20] | generative-provider-auditing/pin-a-model-per-asset-class | thin | 1/2/1 | score | untriaged (n=1 opinion, sponsored segment) |

Admission: `auto=1/3/0`, `fp=0`. Row 1 was scored at GAIN 3 (new technique 2, plus 1
for convergence between the source and the first-article tradition) and RISK 1 (tree
opened, so 0; appended, so 0; home contested with production-work-prioritization's
vertical slice, so +1). Row 10 was admitted under the corroboration table, where a
lead needs no score.

## The landing, and what the seam changed about it

The first draft was the first-article rule: stop the line until the first instance
is judged. The fleet seam was chosen to falsify that, and it did. PoF's harness
releases dependents through `isDependencyResolved` on a completion status that
records no rung, and prints its coverage agenda only at run end. Replaying its four
recorded runs:

- **A (as built):** 104 dependent sessions (about 9 hours) launched on three fan-out
  points that no perceptual gate had judged.
- **Strict hold:** 9 of 85 areas complete, because the gate never returns. This is the
  required gate by another name.
- **Bounded hold:** 85 of 85 complete.

So the technique landed as a request at the fan-out point, a bounded hold priced by
whether anyone reads the run mid-flight, and a root-first agenda that groups items
rather than deduplicating them. The request half shipped in PoF (`72a8a95b`, not
pushed): through the product helper, 0 to 4 requests over the recorded runs,
precision 3 of 4, 301 to 310 tests green. The false positive is a data-schema root.
The tree has no per-item rung, which is the technique's step-1 caveat measured.

## Lead

- **Allowance economics of a long parallel run.** One practitioner's flat-rate weekly
  allowance absorbed roughly 7.85B tokens (about 99% cache reads, about $2.2k at API
  rates) in about 30 hours at about ten concurrent agents. The creator also says one
  model family spends the allowance markedly slower than another. This is n=1,
  self-reported and sponsored. Return condition: when a fleet run records its own
  allowance burn by token class and concurrency, write it beside
  model-and-effort-selection's "cost in the unit that binds".

## Untriaged (nobody verified these; anchors kept so a later run need not re-derive them)

- #11 debug surface as a self-verification affordance [00:14:14, 00:15:04, 00:19:43]
- #12 front-loaded spec, reference board and packaged method skills [00:00:25-00:02:33]
- #13 code-built geometry below the bar; asset spend concentrates on 3D models and images [00:08:20-00:08:45]

## Directions

n/a. The source has no design record, so no direction pass ran.
