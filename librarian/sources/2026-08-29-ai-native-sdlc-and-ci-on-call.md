---
source: web:claude.com/blog (batch of 2, one publisher, two authors)
kind: batch - first-party practitioner account (CI on-call) + vendor doctrine document (SDLC playbook)
url: https://claude.com/blog/ai-ci-cd-on-call, https://claude.com/blog/the-ai-native-sdlc-playbook
title: "Claude on call: first responder for CI/CD failures" + "The AI-Native SDLC playbook"
author: two vendor staff (a CI engineer; an applied-AI author)
words: 2401 + 11649
extracted: 15
accepted: 5
declined: 0
leads: 1
already_covered: 3
untriaged: 7
dispatched: 0
fetches_spent: 0
---

# A first-party on-call account and a vendor SDLC playbook, mined as one batch

Part of [[index]].

## The class, and the expected yield

Two sources from one publisher, two authors, so within-batch convergence counts as
two voices for the one claim both make (tiered response to a breached metric) and
for nothing else. **Post A** is a first-party practitioner account: the engineer who
built the on-call agent, n=1, with measured numbers (median 14 minutes to a first
evidence-grounded report). **Post B** is vendor doctrine: an applied-AI team's stage-by-
stage playbook, no measurements, every paragraph carrying product names. The strip
test deletes most of B and about half of A.

Expected yield stated before triage: A, one or two techniques and a dated fact; B,
mostly catches against a 150-subject bundle with a few amendments. Actual: one
technique, four amendments, one lead, three catches, **0 of 3 fetches** — corpus-
internal corroboration held for every landing, which is the eighth consecutive zero-
fetch run for a source carrying its own material.

## Landed

**`oracle-frozen-during-repair`** (new technique, `quality-gates`, the #2 attention
point on the worklist and never swept). B's Test stage says an agent fixing code must
not be able to weaken the check on that code, and states the ordering: reproduce as a
failing test, commit it, only then fix with test edits blocked. Nothing in
`quality-gates` or `test-harness` owned the in-task half of this; the merge-gate half
already existed as `proposal-not-push`'s reserved classes (test deletion, skipping,
gate configuration). The technique states the same rule at the earlier stage, names
the oracle set (wider than test files: fixtures, snapshots, skip directives,
thresholds, gate config), makes red-first ordering the proof of defect, and gives the
release valve as a separate human-owned task. Corroboration: `gate-sees-target`,
`ci-execution-trust`'s "a control enforced by the party it constrains is not a
control", and training-data convergence (test-fitting is a documented coding-agent
failure mode). Golden path gained a section and the techniques list gained a row.

**`eval-economics` amendment** — the golden set's trigger set includes the agent's
*configuration*: instruction files, skills, subagent definitions, hooks, permission
rules, model pin. The corpus priced tiered cadence carefully and named "every change
to the pieces that shape model behavior" without saying those pieces include files
nobody unit-tests. Plus the reverse direction: an incident enters the suite as a
scenario. `use_when` gained the trigger case.

**`self-healing` golden path amendment — two ladders.** The subject's epistemic
ladder keys aggression on diagnostic confidence. B's control-band table keys it on
signal magnitude (1σ log / 2σ diagnose / 3σ propose). Those are different ladders,
and the source conflates them: a 3σ breach with an unclassified signature still lands
on the bottom row. Magnitude buys invocation and urgency; confidence buys aggression;
they compose by minimum. A's "alerting is deterministic, escalation is deterministic
and agentic" is the same split from the other side, and the amendment states the
detection ladder is deterministic by design because the thing that decides whether
the healer is called must not be the healer. **A source implementing a good idea
badly, again the higher-yield pick.**

**`failure-diagnosis` decision rule** — diagnose from the measured, not from the
configured. A's lessons-log entry ("config tells you what could go wrong; metrics
tell you what did") is n=1 and a first-party correction the author paid for; the
rule is a restatement of "a diagnosis names its evidence" at the stage before it.

**`gate-laddering` amendment** — an asking control is placed differently from a
deciding one: mid-loop asks put a human on the critical path of every parallel
session; asks concentrate at stage boundaries where they are one pause per change
and batchable. `hitl-approval` owned batching and `human-gate-capacity` owned the
fixed-rate server; the *placement* rule sat between them and the placement matrix
was the home.

## Already covered (catches)

- **Skill is advisory, hook is the deterministic layer** (B, Skills §Governance) —
  `enforcement-demotion` says it with a measured 38% instruction-violation rate.
- **Build collapses, human-speed stages become the constraint; add sessions only
  while review keeps up** (B intro, Parallel-sessions play) — `human-gate-capacity`
  and `verification-throughput-as-constraint` model it with four measures.
- **Tool-level deny does not stop shell egress; the sandbox closes it** (B managed-
  settings example) — `permission-stance-enforcement` names the three enforcement
  classes (OS / application-level / synthesized) and `control-plane-execution-
  boundary` owns which side a control sits on. The worked settings block itself is
  product-keyed and application-grade only; no tree was opened, so nothing written.

## Lead

- **Law candidate: when authorship becomes cheap, verification becomes the product
  and the human-speed stages are the constraint.** Sighted 2026-08-27 (dialogue of
  two practitioners, landed as `human-gate-capacity`) and now in B as a vendor's
  framing thesis. Two sightings, both in `software-engineering`. Return condition:
  a third independent sighting in a *different bundle* — the law is provider-
  portable only if it shows up where the authors are not coding agents.

## Untriaged (extracted, reached the table, nobody verified them)

| # | Title | Anchor | Nearest home | Why not picked |
| --- | --- | --- | --- | --- |
| 2 | Tune a new service's alert rules from its first days of data | A §Detection | `alerting/rule-authoring-validation` (derived thresholds) | likely catch |
| 3 | Lessons log read first; promote repeats into the skill | A §Triage lessons.md | `agent-memory/procedure-promotion` | converged 08-26 already |
| 5 | Broadcast incident weather to one public channel to stop inbound pings | A §Verification ci-weather | `alerting/periodic-digest`, `outbound-notifications` | likely catch; the "format is taste, not plumbing" line is the only new part |
| 6 | Median 14 min to first evidence-grounded report; 8x code per quarter with a named human owner per PR | A §Triage, closing | `machine-paced-delivery` | dated fact, n=1, no tree opened |
| 8 | Every stage commits an artifact the next stage reads; the commit chain is the audit trail | B intro | `audit-logging`, `hitl-approval/decision-records` | doctrine; home contested |
| 13 | One source of truth per artifact beside a legacy tracker (repo / legacy / linkage-minimum) | B Sidebar | `docs-sync`, `remediation-roadmaps/sandbox-to-tracker-commit` | partial; needs a tree |
| 15 | Verifier in a fresh context vs the in-task feedback loop | B Test intro | `eval-harness` | likely catch (`no-gate-self-certifies` neighbourhood) |

## Declines

None — nothing was verified and rejected.
