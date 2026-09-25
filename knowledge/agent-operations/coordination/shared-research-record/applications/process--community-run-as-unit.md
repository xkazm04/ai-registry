---
layer: application
type: application
subject: shared-research-record
technique: community-run-as-unit
stack: process
status: draft
verified_on: 2026-09-24
---

# Process: one twelve-day community run, read as a case

Witness: arXiv:2609.18094v2 (2026-09-18), "Agora: Git as Shared Memory for Collective
AutoResearch". It reports one community run on a shared, git-backed contribution record,
from the setup commit on 2026-04-26 to the analysis cutoff on 2026-05-08 (11 days
19 hours of server time). All numbers below are the paper's own, recomputed by its
authors from the exported record (§4.8). This document reads them as **n = 1 community
run**, which is what they are, and the paper itself says so: "Measuring the effect on
discovery per unit of compute requires a matched comparison" (Abstract).

## The community

Thirteen worker accounts, each a headless coding-agent session given a one-line prompt
and a two-page brief, relaunched on a free credential whenever a session ended (§4.2).
Two agent harnesses and two model families (Claude Code with Claude Opus 4.7, and Codex
with GPT-5.5): five accounts on A100 nodes from 2026-04-27, eight on H100 nodes from
2026-04-28. No task assignment, no planner, no role, no named method. The task was to
initialise a frozen 119.6M-parameter attention and state-space hybrid from 141 donor
models without training data or gradient updates, scored in bits per byte on a
200-text development evaluator (§4.1).

## What the record carries (§3.2, §3.3)

- **Typed contributions** with weights applied to a direct parent only when the child
  comes from another account: setup, result, insight, hypothesis and report at +5;
  verification at +20 / +10 / −20 for confirmed / partial / failed; endorsement and
  work-in-progress at 0, "visible, but excluded from fitness" (Table 2). This is
  [typed-contribution-vocabulary](../techniques/typed-contribution-vocabulary.md) and
  [independent-reuse-evidence](../techniques/independent-reuse-evidence.md) as built,
  including the replaceable verdict: "the newest verdict replaces the old one's effect on
  the score, and both commits stay in the history" (§3.2).
- **Slotted frontier**: an upper-confidence ranking with a near-duplicate penalty, whose
  exploration constant "grows when the metric distribution is tightly bunched near its
  best", served as exploit / explore-known / explore-novel (§3.3, Eq. 3). Clustering needs
  at least 50% embedding coverage, uses a 0.90 cosine threshold, and caps analysis at the
  5,000 most recent contributions.

## Descriptive facts the run supports

- **Volume.** 1,703 contributions (1,699 from the 13 workers): 1,124 scored results,
  284 insights, 203 hypotheses, 165 verifications, one report; 233 results set a new best;
  about 170 contributions a day once all workers ran (§4.3).
- **Reuse crossed participants.** The best contribution's ancestry is 145 commits from 15
  of the 17 accounts in the graph; 115 of its 144 parent edges cross account boundaries
  (§4.5).
- **Verification was used.** 165 verifications over 95 distinct targets, each naming its
  target, each by a non-author; 40 of the winner's 144 scored ancestors were
  independently reproduced (§4.5).
- **Failures were published.** 53 contributions explicitly tagged as negative results,
  later cited when choosing directions (§4.5).
- **Pre-registration emerged unprompted.** From 2026-04-28, more than 400 descriptions
  declare a prediction band before the result, a habit the brief did not prescribe
  (§4.3).
- **Exploitation was fast and front-loaded.** The first 18 scored contributions account
  for about 98% of the total reduction (3.39 to about 1.93 bpb). The remaining 1,106
  found the next 0.03 (§4.5, §4.6).
- **Rediscovery was parallel.** Of 696 pairs of different accounts posting identical
  scores, 63% landed within an hour of each other and 80% within six (§4.6, Figure 5).
  A work-in-progress tag existed throughout. It did not see the collisions, because the
  sessions shared an idea and not a claimed location.

## What the run cannot show

- **An effect of the diversity views.** On 2026-05-02, when more than a third of all
  activity sat in one semantic cluster and the leader had stalled, the authors deployed
  clustering, diversity summaries and the diversity-aware ranking. The first state-space
  edit followed at 2026-05-03 00:13 UTC, scoring 1.9028 (§4.7). That is one uncontrolled
  intervention in one run. The community had been at 1.9043 since 2026-05-01. The
  milestones after the views move in steps of 1.5e-3, 3.3e-3 and 5e-4 (Table 4), against
  a 1.3e-3 cross-hardware spread. Nothing records what the same workers would have tried
  next without the views.
- **Behaviour change from tag counts.** "Explicit negative-result and explore-novel tags
  appear only after the May 2 deployment" (Figure 2). The deployment introduced that
  vocabulary, so their appearance counts the new vocabulary, not a change in what
  workers did.
- **Independent corroboration from 165 confirmations.** None of the 165 verifications
  reports a failure. Same-hardware reproductions are bit-identical, and cross-hardware
  ones differ by up to 1.3e-3 bpb (§4.5), so the channel confirms that the evaluator
  re-computes the same number. It re-runs the same 200 texts, and so says nothing about
  generality. The 13 accounts also drew on two model families, so cross-account reuse is
  not cross-family corroboration.
- **Leader changes finer than the instrument.** "The last recorded improvement of
  9 × 10⁻⁶ is below cross-hardware variation" (§4.5). The last milestone step on the
  winner's ancestry, 1.8995 to 1.8990, is also below the 1.3e-3 cross-hardware spread
  (Table 4). Under
  [resolution-bounded-leaders](../techniques/resolution-bounded-leaders.md) these are ties.
  "Every component was selected on the same 200-text development evaluator" (§4.5), and
  no held-out score is reported.
- **Anything statistical over commits.** The authors state it directly: "The primary
  analysis unit is the entire community run. Commit-level observations are useful
  diagnostics but are not independent samples" (Appendix C).

## The comparison the authors propose

Appendix C, Table 5 specifies four arms matched on agents, models, compute, evaluator and
wall clock: isolated (brief only), flat log, central planner, and the record with its
views and explicit slots. It is the design this technique prescribes, stated by the
authors of the one run available. As of 2026-09-24 the paper reports no such
comparison.
