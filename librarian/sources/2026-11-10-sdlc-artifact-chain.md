---
source: youtube:6CaQ9ZFuuKI
kind: second-hand practitioner review (a relay of a vendor doctrine document already mined 2026-08-29)
url: https://www.youtube.com/watch?v=6CaQ9ZFuuKI
urls:
  - https://www.youtube.com/watch?v=6CaQ9ZFuuKI
  - https://claude.com/blog/the-ai-native-sdlc-playbook
title: "AI-native SDLC guide, /shift batch of 1 video from 1 channel"
author: "a tutorial channel, first sighting in this ledger"
words: 4569
extracted: 12
accepted: 0
declined: 0
leads: 1
already_covered: 7
untriaged: 4
dispatched: 0
applied: 0
shipped: 0
run_id: shift-sdlc-artifact-chain
siblings: 2
fetches: 1
---

# A relay of the SDLC playbook keeps the templates and drops the gates

Part of [[index]]. Plan `plan-20261109-152922`, cluster `sdlc-artifact-chain`, board run
`shift-sdlc-artifact-chain`, one video, one voice. The question: what is the artifact chain
from requirements to agent tasks (intent, spec, plan), and **what verifies each stage?**
Phase 7.7: gate=skipped. No GPU, no download, no render.

**Expected yield, stated first:** a second-hand review of a vendor doctrine document whose
primary was mined on 2026-08-29 ([[2026-08-29-ai-native-sdlc-and-ci-on-call]]). Catches,
maybe one boundary, no subject. That held: 0 accepted, 7 catches, 1 lead, 4 untriaged (the miner counted 8 and 3; its own table has 7 catches and rows 1, 5, 11 and 12 untriaged).

## The class, and what the relay lost

A sponsor-heavy guided tour of the vendor's playbook (about 2 of 21 minutes are a community
pitch and a certificate ad). The video calls the playbook a "14-lesson course"; the fetched
primary is one document and carries no such structure, so the plan's "fetch the course
lessons" had no target. The narrator's own half (mine past human PR comments into the review
instructions, layer tests bottom-up, treat competing skill kits as interchangeable) is advice
with no measurement, n=0.

**The relay's defect is the finding about this source.** The video passes on all three
templates intact: intent (problem, outcome, affected users and systems, constraints, open
questions), spec (why vs what), plan (files that change, order, risks, proof). It **drops
every inter-stage check the primary states**. One fetch of the primary recovered them:

| Stage artifact | Accepted by (primary) | Checked against upstream? (primary) | Survived the relay? |
| --- | --- | --- | --- |
| intent | the product owner approves the agent-written intent | origin | approval: no |
| spec | a human always makes this call | yes: are the intent's open questions answered or carried forward? | **no** |
| plan | nothing is implemented without an accepted plan; implementable from the plan alone | yes: review checks the eventual diff against it; a hook keeps plan and code in sync | **no** (only the template's proof line) |
| test | the agent's own loop: test, lint and build green before done | no | **yes** |
| deploy / review | findings never approve alone; a code owner approves; a hook blocks prod without release authorization | yes: compliance pass against spec and plan | partly (hooks yes, traceability no) |
| maintain | deterministic detection, confidence gate, PR into the review gate | findings re-enter as a new intent | yes |

**Source-class lesson: a second-hand review of a doctrine document transmits its artifact
shapes and loses its acceptance rules.** For this class the fetch is the extraction, and here
it was the only part that answered the cluster's question.

**Not a second sighting of 08-29 untriaged row #8** (every stage commits an artifact the next
stage reads; home contested): a relay of the same primary is one observation, not two. Row
#8 keeps its standing there; this note does not edit it.

## What landed

Nothing in `knowledge/`. This note and its ledger lines, one lead, four untriaged rows. No
skill and no project was touched. Nothing higher was earned: the only external authority
for the chain is vendor prose already banked on 08-29, and this registry's own `/spark`
already enforces two of the three hops (below).

## Triage

Admission bar +3. Scored rows: 1 only (the rest are catches, a lead admitted under the
corroboration table, or untriaged without a read). `auto=0/1/0 fp=0` (the miner wrote 0/3/0, counting unscored rows): no miner accept, so
none could die at the lander's read.

| # | Candidate | Anchor | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Name the check at each artifact hop (intent → spec → plan) | [00:03:51]-[00:06:48] | `plan-review` (gate payload before authorship; owns no intent→spec hop); `hitl-approval/fixed-policy-amendable-plan` (build hop); `prompt-assembly/task-envelope`; `quality-gates` | partial | 2/2/2 | **untriaged**, `reconsider?` = 08-29 row #8; home contested three ways |
| 2 | Plan carries its own proof section | [00:06:23]-[00:07:14] | `task-envelope` § "The three parts" (Done and Check) | likely catch | - | catch |
| 3 | Do not report done until test, lint and build are green | [00:10:12]-[00:10:38] | `machine-paced-delivery/pre-authorship-verification`; `quality-gates/oracle-frozen-during-repair` | catch | - | catch |
| 4 | Interview the requester branch by branch before intent | [00:02:07]-[00:02:33] | `skills/spark` Phase 3 waves with a completeness gate | catch | - | catch |
| 5 | Intent may live in the tracker, not the repo | [00:02:59] | still 08-29 untriaged row #13; `docs-sync` | partial | - | **untriaged** (no tree opened) |
| 6 | Re-run 20-50 real past tasks as evals on a model or rule change, in CI | [00:14:28]-[00:15:44] | `eval-economics` (08-29 amendment: trigger set includes instruction files, skills, hooks, model pin) | catch | - | catch |
| 7 | Review-instructions file built from past human PR comments | [00:16:35]-[00:17:00] | `plan-review/silent-decision-surfacing`; `agent-instruction-files` | partial | - | **lead** (corroboration table) |
| 8 | Hooks block prod data, credentials and protected files | [00:17:00]-[00:17:50] | `enforcement-demotion`; `quality-gates` § the gate must not be writable by what it gates | catch | - | catch |
| 9 | Pre-deploy log triage, post-deploy watch and roll back | [00:18:15]-[00:19:32] | `self-healing` two-ladder amendment; `failure-diagnosis` | catch | - | catch |
| 10 | Production signals re-enter as a new intent | [00:19:57]-[00:20:24] | `self-healing` (findings enter the review gate as a PR) | catch | - | catch |
| 11 | Test layers bottom-up: function, component, end-to-end | [00:12:20]-[00:13:38] | `test-harness` neighbourhood, not opened | likely catch | - | **untriaged** (not opened, so not filed as a catch) |
| 12 | Intent is why, spec is what | [00:04:16]-[00:04:41] | none in software-engineering; nearest is cross-bundle (spec authoring in game production), not linkable | thin | - | **untriaged** (doctrine without a check) |

Not extracted: the sponsor segments; named third-party skill kits, test frameworks and
monitoring products (fail the strip test, and "use what you already have" carries no
comparison); PR-review severity tagging (product-keyed, already in the 08-29 primary; its
"skip generated files" line is a catch against `quality-gates` § false positives, not
opened).

## Row 1: the promoting question, executed

*Does any corpus file or registry skill own the check at the intent → spec hop, so that the
upstream artifact's open questions are dispositioned (answered, carried forward, dropped with
a reason) and something verifies that?*

- `plan-review` operates "before authorship begins" and owns what the person reads when a run
  stops at a plan. It does not describe the hop from a requirements artifact to a design
  artifact. `decision-sized-slicing` sits before the plan, not between intent and spec.
- `hitl-approval/fixed-policy-amendable-plan` owns the build hop from the executor's side.
- **This registry's own `skills/spark/SKILL.md` (v1.7.2) already implements two of the
  primary's three hops**, re-read by the lander: spec → plan ("Never dispatch a package whose
  design depends on a question still open") and plan → diff ("Director reviews every diff
  against acceptance criteria"). It keeps the intent near-verbatim and a design-decision log.
  **What it has no rule for is the disposition of the intent's open items in the brief**: the
  Phase 4 brief has `Non-goals` and `Risks` but no open-questions block, and the Phase 3
  completeness gate checks a perspective list, not the spark's own unresolved items.

Not promoted. The rule is right and the registry already practises most of it in one skill.
As corpus knowledge it is a three-way contested home whose only external authority is vendor
prose (+1 contested, +2 prose-only), so +3 is out of reach.

## Lead

- **Seed the review-instructions file from the team's own past review comments**
  ([00:16:35]). The narrator's advice, unmeasured. It is the review-side twin of
  `silent-decision-surfacing`'s route into the standing instruction file: a recurring human
  objection becomes a standing rule, so the agent reviewer stops re-deriving it.
  **Return condition:** an opened tree where review comments on agent PRs can be counted, or
  a second independent source. **Instrument:** the share of human review comments on agent PRs
  whose pattern already appears in the review file, before and after one seeding pass; a
  falling share of new-pattern comments means the file absorbed the recurring ones.
  **Named seam for row 1, not acted on in this landing:** `skills/spark/SKILL.md` Phase 4
  brief. The change would be an open-questions block, each line taken from the spark and the
  design-decision log and marked `answered -> <decision>` / `carried -> <package>` /
  `dropped -> <reason>`, so Phase 5's "never dispatch a package whose design depends on a
  question still open" has a list to check instead of the Director's memory. **Before/after
  count:** across one repo's shipped sparks, builder reports that return questions instead of
  guessing plus Director bounces caused by an unresolved design question, per work package,
  on the last N sparks before the change and the next N after. A skill edit needs a version
  bump and a `LESSONS.md` row against the version used. Weaker alternates: the "reviewable
  development tranche" table in `docs/skill-selection.md` (pairs Acceptance with Validation,
  no field for what the tranche inherited and left open; measured by a read, not a number),
  or a wired project's `/spark` vault (same count).

## Untriaged

Rows 1, 5, 11 and 12 above, with their anchors. Row 1 stays tied to 08-29 row #8 and row 5
to 08-29 row #13; a later run that picks either up should read both notes as one observation.

## Superseded?

No. The video holds nothing beyond the 08-29 primary, and the course it names does not exist
at the primary's URL.
