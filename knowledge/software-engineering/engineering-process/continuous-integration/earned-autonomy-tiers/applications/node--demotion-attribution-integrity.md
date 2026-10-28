---
layer: application
type: application
subject: earned-autonomy-tiers
technique: demotion-attribution-integrity
stack: node
status: forged
verified_on: 2026-10-27
---

# A tripwire that reads the gate's ledger and refuses a rival's revert

The `afterlife` project (https://github.com/xkazm04/afterlife, mirrored at
https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/35338952/showcase), read at main,
commit 009c7893, is an agentic DevSecOps control plane in which several agents (a patcher, a
pipeline medic, a guardrail reviewer and others) hold standing per action class on a three-rung
ladder with quarantine and human-only beside it. Its tripwire is a model-free sweep over a target
project's merge requests and default-branch commits. The application shows how it answers "whose
standing does this event lower?" and where its answer departs from
[demotion-attribution-integrity](../techniques/demotion-attribution-integrity.md).

## The class comes from the gate, not the trailer

Agent commits carry a class trailer, and the trailer is editable after merge. The write-plane
documentation states the rule and the incident that forced it:
`gitlab/apply/README.md:96 "The class an event demotes is the one the gate"` and
`gitlab/apply/README.md:98 "after the merge (F64); only an MR the engine never gated falls back to the trailer"`.
The class is read from the bot's own hash-chained ledger lines for that merge request, which is the
technique's rule and an instance of the law
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate).

**Deviation.** The fallback for a merge request the engine never gated is the trailer. The
technique's standard is that such an event is unattributed and surfaced, because the trailer is
the claimant's own choice of which standing to lose. The standard stays; the gap is recorded.

## A revert carried by another agent demotes nobody

The detector's revert rule was the upward lesson for this technique — the draft had attributed a
carried revert to the agent whose work it undid:
`gitlab/components/scripts/lib/detect.mjs:47 "so a revert another agent's MR carried demotes nobody (F75)"`,
`gitlab/components/scripts/lib/detect.mjs:48 "A person's revert and the agent's own still count."`,
enforced at `gitlab/components/scripts/lib/detect.mjs:58 "if (carrier && carrier.author.username !== mr.author.username) {"`.
The revert body naming the reverted commit is text the carrier wrote, so a rival agent could
otherwise fabricate a revert to demote a competitor.

## The scan is complete or it goes red

`gitlab/components/scripts/lib/detect.mjs:35 "A first page alone let an agent push its own blocked or reopened MR out of the"`
records the incident (an agent opening enough merge requests to push its own reopened one off the
first page), and
`gitlab/components/scripts/lib/detect.mjs:40 "refusing to guess"` throws when the lookback exceeds
the page cap, so the sweep fails rather than processing a prefix.

## The demotion itself

`engine/decide/tripwire.ts:1 "The tripwire: restricting is free, so it needs no human."` The tier
only falls through `src/schemas/tier.ts:49 "export function demote(current: Tier, trigger: DemotionTrigger, policy: TrustPolicy): Tier {"`,
with the schedule in policy (`policy/trust-policy.yml:13 "one_step_on: [revert, reopened_finding, post_merge_proof_fail, default_branch_red_1h]"`,
`policy/trust-policy.yml:14 "quarantine_on: [guardrail_high, budget_breach_x2]"`); each demotion sets a
cooldown (`engine/decide/tripwire.ts:49 "policy.cooldown_days * 86_400_000"`) and commits with
`engine/decide/tripwire.ts:66 "Demoted by the model-free tripwire. Promotion needs a person."`.
The sweep is idempotent by event key and conditional on the state version it read:
`gitlab/apply/README.md:99 "it never lands over a newer"`.

**Deviation, accepted with a reason.** The demotion lands at the next scheduled sweep rather than
inline (`gitlab/apply/README.md:100 "Run the schedule often (every 10 minutes)."`), because the
token that writes the standing lives in a separate project no target pipeline can reach.
[asymmetric-promotion-and-demotion](../techniques/asymmetric-promotion-and-demotion.md) now names
this as the one legitimate reason for a scheduled tripwire, with the window stated as a policy
number.
