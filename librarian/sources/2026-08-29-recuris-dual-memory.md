---
source: youtube:F1XqqVNBa4o
kind: single-paper explainer (paper aggregator class, n=1 paper) by a research-news channel
url: https://www.youtube.com/watch?v=F1XqqVNBa4o
title: "Dual-Memory Optimization for Self-Improving AI Agents"
author: Discover AI (channel); paper: arXiv 2608.24876, eight authors across four universities
words: 5886
extracted: 8
accepted: 2
declined: 0
leads: 1
already_covered: 3
untriaged: 2
dispatched: 0
fetches_spent: 2
---

# A single-paper explainer, mined as a paper-aggregator source

Part of [[index]].

## The class, and the expected yield

One paper relayed second-hand by a channel. The class rule held exactly: the video
is authoritative for *that* the paper exists and where its numbers are; the fetch of
the primary was the extraction, not corroboration. Expected yield said before the
table: one amendment, one lead, several catches. Actual: two amendments (same root),
one lead, three catches, two untriaged. Unattended run, picks by registry impact.

The channel's framing ("goldfish brain", "cured") is marketing; the paper's ablation
is the substance, and it is the thing the video never mentions. **Read the ablation
table of any explained paper before its headline numbers.**

## Candidates

### 1. Verify the working-state rewrite against the environment - ACCEPTED (amendment)

Claim [00:26:47]: state changes are proposed, checked against external evidence, and
only supported changes committed; a goal is done only when the observation says so.
Strip: survives entirely. Prior art: `agent-memory/working-memory` says the state is
"rewritten, not appended" **by judgment** and never names who checks the judgment -
a missing stage, the shape every mature-corpus finding takes. Corroboration: primary
fetched (checker "evaluates the tool or environment result rather than the model's
own claim"; ablation +23.9 for a verified working state vs +2.0 for a skill store),
plus cross-bundle convergence with `game-production#no-gate-self-certifies` and
`localization#coverage-is-counted-not-claimed` (named, not linked). Landed as a
"Propose, check, commit" section anchored on `gate-sees-target`.

### 2. Select skills by current task state, not by history - ACCEPTED (amendment)

Claim [00:23:46]. Prior art: `procedure-promotion` "Selection is the scaling failure"
already caps and scopes the live pool "by declared domain". The paper's ablation says
the scope key matters: history-keyed retrieval is within noise, state-keyed retrieval
carries the gain. One paragraph added; same root as #1, so the two count as one finding.

### 3. Structured trace that attributes a failure to one memory component - ALREADY COVERED (partial)

Claim [00:17:19]. `self-healing/failure-diagnosis` owns "capture context at failure
time" and "a diagnosis names its evidence"; `procedure-promotion` owns invocation
accounting. What the paper adds is the *taxonomy of owners* (skills / state schema /
invocation policy / checkers) - see untriaged #7.

### 4. Patch one component behind a deterministic held-out gate - ALREADY COVERED

Claim [00:31:55]. `quality-gates/oracle-frozen-during-repair` (landed 2026-08-29 by
a parallel session) and `procedure-promotion` "One promotion door" + re-promotion as
a new version. The paper's fixed meta-agent, fixed gate and frozen tools are an
instance of the freeze rule: a second sighting from a research design, recorded for
that technique's convergence ledger, not re-written.

### 5. A workflow description is not a capability - ALREADY COVERED

Author's own critique [00:33:13]. `procedure-promotion` "actions, not facts" carries
the measured form (procedural anchoring 65.7% vs knowledge injection 4.5%) and
`model-routing/capability-floors` owns the floor. Correct, and already said better.

### 6. Headline numbers - LEAD (dated fact)

+13 to +23 points across ten models; up to 80% reduction in six failure modes;
Terminal-Bench 2.1 over 2.0. Cited into #1 as the ablation only. Return condition:
when a second independent harness reproduces the verified-state ablation, or a
connected project implements a checker set - then `working-memory` gets an
application and the numbers get a second voice.

### 7. Four-component decomposition of harness memory (skills, state schema, invocation policy, checkers) - UNTRIAGED

Strip survives; effort L. The interesting claim is that retrieval policy and checkers
are *data the loop may edit*, not code. Nobody verified it against the corpus's
three-layer (working/episodic/consolidated) axis, which cuts by lifetime, not by
control function. Anchor [00:21:38].

### 8. The diagnoser is fixed, so the loop is not "self"-improving - UNTRIAGED

Doctrine, strip survives. Anchor [00:13:25]. Possibly a boundary statement for
`oracle-frozen-during-repair`; nobody looked.

## Declines

None - unattended run; nothing was picked and rejected.
