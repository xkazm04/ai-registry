---
layer: application
type: application
subject: earned-autonomy-tiers
technique: effective-tier-is-the-lowest-bound
stack: node
status: forged
verified_on: 2026-10-27
---

# One standing function for the gate, the shadow and the screen

The `afterlife` project (https://github.com/xkazm04/afterlife, mirrored at
https://gitlab.com/gitlab-ai-hackathon/transcend-october-2026/35338952/showcase), read at main,
commit 009c7893, gates every agent merge request through a model-free engine whose tier decision
is computed by one function. This application traces
[effective-tier-is-the-lowest-bound](../techniques/effective-tier-is-the-lowest-bound.md) through
its policy files and that function, and notes the shadow and the promotion trial that read it.

## The bounds, as policy

Each class names its holder role, its proof class and its ceiling in one line, for instance
`policy/trust-policy.yml:20 "code-fix.patch:   { agent: patcher,  proof: exploit-test,    ceiling: supervised }"`;
the gate's own configuration is capped low
(`policy/trust-policy.yml:27 "ci-config.change: { agent: maturity, proof: score-delta,     ceiling: assisted }"`)
and one class is off the ladder
(`policy/trust-policy.yml:26 "report.submit:    { agent: cra,                              ceiling: human_only }"`).
The lease sits only on the rung that removes a person:
`policy/trust-policy.yml:7 "grant_ttl_days: 14           # optional lease on a hands-off grant; lapses to supervised unless re-confirmed"`.
The standing itself lives in a separate file the agents cannot edit:
`policy/tier-state.yml:1 "Written by the tripwire (down)"`.

## The minimum, computed once

`engine/decide/standing.ts:2 "the lower of the tier-state record and the class ceiling"` states the
rule, and `engine/decide/standing.ts:46 "const tier = lower(record.tier, ceiling);"` applies it,
with the lease as the further bound at
`engine/decide/standing.ts:48 "return { tier: leaseLapsed ? 'supervised' : tier, leaseLapsed };"` — one
rung, not the bottom, as the technique prescribes. An unparseable lease counts as lapsed:
`engine/decide/standing.ts:37 "A lease that is set has lapsed when it is past, and also when it is not a readable time"`.
The engine documentation repeats it for operators: `engine/README.md:117 "The gate fails closed."`.

**Upward lesson: no record is not the bottom rung.** The draft sent a pair with no record to
assisted. The source refuses instead —
`engine/decide/standing.ts:62 "an unlisted class is not trusted"` — and enrols agents at an explicit
start tier (`policy/trust-policy.yml:5 "start_tier: assisted"`). The technique now treats the bottom
rung as a standing that enrolment grants.

**Upward lesson: ambiguity about the holder refuses.**
`engine/decide/standing.ts:4 "It fails closed: several holders with none named for the role is a refusal, never a guess."`
Lookups use own keys only, because the agent and class ids arrive from the merge request:
`engine/decide/standing.ts:19 "never reaches Object.prototype"`.

## The same function behind the shadow and the trial

The shadow raises one record in a copy and calls the real gate again
(`engine/decide/shadow.ts:3 "a copy of tier-state in which that record is raised, and calls gate() again"`),
skips any rung over the ceiling
(`engine/decide/shadow.ts:24 "if (!next || TIER_ORDER.indexOf(next) > TIER_ORDER.indexOf(st.ceiling)) return null;"`)
and is stamped on the decision record without ever applying
(`engine/README.md:129 "and never applies it."`). The promotion helper reads the same
standing and states one rule for the screen and the poller:
`src/lib/promotion/promotion.ts:3 "so they can never disagree"`. The promotion bar counts only
outputs the gate decided:
`policy/trust-policy.yml:10 "every accepted output counted was decided by belay-apply's gate"`.

**Deviation.** The bar is written as raw counts
(`policy/trust-policy.yml:11 "supervised_to_hands_off: { accepted: 15, no_edit_ratio: 0.90, clean_days: 14, human_key: true, gated: all }"`)
with one threshold for every class, where
[recomputable-promotion-trial](../techniques/recomputable-promotion-trial.md) asks for a stated
bound and a per-class threshold sized to the class's escape cost. Fifteen clean outputs bound the
failure rate at roughly one in five; the policy labels its numbers honestly
(`policy/trust-policy.yml:2 "Thresholds are policy numbers, not measurements."`) but does not state
that implication.
