---
source: batch
kind: harvest-batch (5 sources, one domain, AUTO mode, mined serially by the orchestrator; no miners dispatched)
domain: software-engineering (llm-agent queue section) -> llm-agent/orchestration/hitl-approval (+ fleet-orchestration)
mined_on: 2026-10-14
queue_rows: [SEA-048, SEA-049, SEA-050, SEA-051, SEA-054]
parked_same_pass: []
harvest_skill: 0.5.2
fetches: 10 (SEA-048 1, SEA-049 2 incl. the vendor docs page as corroboration, SEA-050 3, SEA-051 2, SEA-054 2)
extracted: 31
accepted: 0
specs_banked: 4 (specs.md section 7)
already_covered: 5
declined: 0
leads: 10
untriaged: 8
dispatched: 0
applied: 0
shipped: 0
run_id: hv-hitl-1014-n144
siblings: unknown (worktree branch cur/n144; run board not consulted)
---

# Approval design, measured: four specs banked, nothing landed (auto mode)

**Needle named at admission:** `hitl-approval` is a 34-point subject, so these are not rescues.
They were admitted because the subject's fatigue section and its autonomy dial carry no
measurement of how people actually use approval, and because five queued pri-1/2 rows aim at
exactly that: a classifier standing in for the prompt, the circuit breaker on repeated denials,
and where confirmation points go. **Expected yield said before mining:** first-party posts and
two papers aimed at a mature subject: catches and leads, with specs for the genuinely new
mechanisms. That is what arrived. Auto mode lands no content, so nothing in `knowledge/` changed.

Prior art read at body level before triage: `hitl-approval.md` (the gate-fatigue section and
the clock section), `techniques/consent-gates.md` (autonomy dial),
`techniques/fail-closed-profile-for-headless.md` (classifier three-valued, denial is a tool
result), `fleet-orchestration/techniques/soft-budget-under-the-hard-cap.md`.

## SEA-048 - measuring agent autonomy (first-party telemetry, 2026-02-18)

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | Oversight means being positioned to intervene, not approving every action | "effective oversight doesn't require approving every action but being in a position to intervene when it matters" | **already covered** (`hitl-approval` fatigue section: tier by consequence, exempt reversible acts) |
| 2 | The agent asks for clarification more than humans interrupt it; about twice as often on the most complex tasks as on minimal ones | "Claude Code pauses for clarification more often than humans interrupt it" | **lead**. The source caveats that it may ask unnecessarily. |
| 3 | Full auto-approve share rises from about 20% (under 50 sessions) to over 40% (by 750 sessions) | "roughly 20% of the time" ... "over 40%" | **lead**. Default is manual, so part of the shift is users changing settings. |
| 4 | Interrupt share of turns rises from about 5% (10 sessions) to about 9% | Figure 3 text | **lead** (with 3: approve-each gives way to monitor-and-interrupt). |
| 5 | Internal: success on hardest tasks doubled while interventions per session fell from 5.4 to 3.3 | "5.4 to 3.3" | **untriaged** (internal, no method detail) |
| 6 | API: 80% of tool calls under at least one safeguard, 73% with a human in the loop, 0.8% irreversible; all stated as upper bounds | summary section | **untriaged** |
| 7 | p99.9 turn duration roughly doubled, under 25 to over 45 minutes | Oct 2025 - Jan 2026 | **untriaged** (an autonomy trend, not a gate design) |

Class: first-party telemetry of one vendor's own users; risk scores are model-generated; coding-heavy.
Return condition for rows 3-4: a second population (another product), or a gate of ours that records
approval share by user tenure.

## SEA-049 - Claude Code auto mode (first-party engineering post, 2026-03-25)

Corroboration attempted: the same vendor's current permission-mode documentation. It restates the
thresholds and the stripped classifier input, which makes it the same author's second surface, not an
independent source. Corroboration from an independent implementation is owed before any landing.

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | 93% of permission prompts were approved, which motivated a classifier | "approve 93% of permission prompts" | **already covered** (`hitl-approval`: a gate whose approvals run near 100% measures nothing). The number is a lead. |
| 2 | Two-stage classifier in front of the prompt: a single-token filter tuned to over-block (8.5% false positive on 10,000 real calls), then reasoning only on what it flags (0.4%) | post: "Stage 1 ... 8.5% FPR"; "lowers FPR to 0.4%" | **banked as spec 7a** |
| 3 | The classifier is shown user messages and tool calls only; assistant text and tool results are stripped, so hostile content in a file cannot steer it | post; docs: "Tool results are stripped from those requests" | **banked as spec 7a** |
| 4 | Honest miss rates: 17% of real overeager actions (n=52) and 5.7% of synthetic exfiltration (n=1,000) pass the full pipeline; the post attributes it to the classifier misjudging whether earlier approval covers the action | table in the post | **lead** (n=52). Carried into 7a as the caveat it must state. |
| 5 | A denial returns to the agent as a tool result with an instruction to treat the boundary in good faith and find a safer path | post | **already covered** (`fail-closed-profile-for-headless`: "Denial is a tool result the model reads") |
| 6 | Repeated-denial circuit breaker: 3 in a row or 20 total pauses automation and hands the next action to the human; not configurable; the total persists for the session and resets only when its own limit trips; a denial caused by a separate safety check refusing the classifier's request is not counted | post; docs "Repeated-block thresholds" | **banked as spec 7b** |
| 7 | Headless disagreement between two dated surfaces: the post says the process terminates; the current docs say the action does not run and the agent keeps working | post vs docs "Claude Code doesn't stop the run" | **lead** (a currency fact about one product; 7b states the current form and its date) |
| 8 | Four-way threat model for an over-reaching agent: overeager, honest mistake, prompt injection, misaligned | post | **untriaged** |

Return conditions: rows 4 and 7 return when a second vendor documents a classifier gate with numbers,
or when the docs page changes.

## SEA-050 - Levels of Autonomy for AI Agents (conceptual paper, 2025-06, v2 2025-07-28)

An essay with no experiment. The five roles are operator, collaborator, consultant, approver, observer.
Approver: approval conditions set in advance, the agent interrupts only for failures, missing
credentials or consequential actions. Observer: activity log and an emergency off-switch only.

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | Autonomy level is a design decision separate from capability | abstract | **already covered** (`consent-gates`: the autonomy dial with enumerated positions) |
| 2 | Five user roles as the axis of the dial, each with its control surface | section on levels | **lead**; the dial's positions in the corpus are action classes, not user roles. Unmeasured. |
| 3 | An approver-level agent that needs only a simple approval to earn revenue may carry risk close to an observer-level one | autonomy-certificate discussion | **lead**; raises rubber-stamping and tests nothing |
| 4 | Third-party "autonomy certificates" capping an agent's level | proposal | **untriaged** |
| 5 | Example-system placements (all June 2025, from public demos) | table 1 | **untriaged** |

Fetch note: the PDF came back as a byte stream; the HTML version was read. Return condition for rows 2-3:
an evaluation of any role-keyed control design.

## SEA-051 - When Should Users Check? (CHI '26, arXiv 2510.05307, v1 2025-10-06)

Read: the abstract page and the first 100,000 of 176,861 characters of the HTML (model definition,
study design, results). **Not read:** the remainder (discussion, appendices).

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | Confirmation, diagnosis, correction, redo as the observed monitoring loop; formative study n=8, trials entering diagnosis 87.5%, correction 82.5% | formative-study section | **lead** (feeds 7c) |
| 2 | Place confirmation points by expected user time: a dynamic program over per-step success probability, confirm time, diagnose time and redo time | model section | **banked as spec 7c** |
| 3 | Verification study, n=48 within-subjects, three tasks (8, 12 and 16 steps): intermediate confirmation 13.54% faster (264.70 s to 228.86 s); by error position about 29% faster for early errors, about 2% for mid, 4.5% slower for late; 81% (39 of 48) preferred it | results | **banked as spec 7c**, with the late-error reversal as the load-bearing caveat |
| 4 | Time breakdown: confirmation time rose, diagnosis fell 17% and redo fell 22% | results | **lead** |
| 5 | Per-step success probability treated as a Beta-Bernoulli estimate that updates online | model section | **untriaged** (named in the text, estimation not read) |

Caveat for 7c: lab tasks with fixed error probabilities, one paper, one venue.

## SEA-054 - Budget-Aware Tool Use (COLM 2026, arXiv 2511.17006, v2 2026-08-17)

Read: abstract and the first 100,000 of 144,432 characters of the HTML. **Not read:** the final 44,432.

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | Raising a tool-call budget alone does not improve results because agents do not see the budget; showing them the remaining budget does | abstract | **banked as spec 7d** |
| 2 | Mechanism: a policy paragraph on the first iteration, then after every tool response a status block of used and remaining calls per tool plus a short reminder | method | **banked as spec 7d** |
| 3 | Measured: at a budget of 10 the tracker matches the plain loop at 100 on BrowseComp (12.8% vs 12.6%) with 31.3% lower cost; a coding benchmark's resolve rate goes 36.8% to 55.4% at budget 50 (one model) | results | **banked as spec 7d**, with n and model named |
| 4 | Unified cost = token cost + sum of tool calls times price per call | cost metric | **already covered** (`cost-metering` prices tokens and calls into one total) |
| 5 | BATS planning and self-verification modules (SUCCESS / CONTINUE / PIVOT) | method | **lead** (a research agent design; ablated on one model) |
| 6 | A trained deep-research baseline cited from another source beats BATS on one benchmark | main table | **untriaged** |

## Leads and untriaged, in one place

Leads: SEA-048 rows 2-4; SEA-049 rows 4 and 7; SEA-050 rows 2-3; SEA-051 rows 1 and 4; SEA-054 row 5.
Untriaged (nobody verified, not declined): SEA-048 rows 5-7; SEA-049 row 8; SEA-050 rows 4-5;
SEA-051 row 5; SEA-054 row 6; and the unread tails of SEA-051 and SEA-054.

## What auto mode did not do

No technique, amendment or application was written. Specs 7a-7d are in
[`harvest/specs.md`](../harvest/specs.md) section 7; the landing session re-verifies the corpus at body
level first and owes an A/B evaluation per landing. Queue rows flipped to `mined`.
