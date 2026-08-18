---
kind: summary
confidence: 0.6
namespace: engineering
source: half-year-review
---

# 2026 H1: what the delivery guardrails actually changed

A rollup of the first half of 2026. Confidence is medium: the direction is clear, the
attribution of any single number to any single change is not, since three changes landed in the
same quarter.

## What was put in place

- Required pull-request checks on the default branch, after a two-week grace period
  (`memory/episodic/2026-06-required-checks-decision.md`).
- A pre-push local gate, so the same checks run before the push rather than after it
  (skill `ci-gate-check`).
- Root agent-guidance files across the service repos (practice `agent-guidance`, D1).

## What moved

- Merged pull requests with a failing check at merge time: from roughly one in four to
  effectively none. This one is a direct consequence and is not in doubt.
- Time from "CI is red" to "CI is green" dropped noticeably, mostly because the pre-push gate
  catches the failure while the author still has the change in their head.
- Review comments asking "how do I run this" fell away in the repos that adopted agent guidance.
  Reported rather than measured, hence the medium confidence on this rollup.

## What did not move

- Overall lead time. The guardrails removed rework, they did not remove queueing, and queueing
  is where the time goes. Anyone proposing more gates as a lead-time fix should read this line
  first.
- Flaky tests. Making the checks blocking exposed them but did not fix them; the cleanup was
  scheduled and then deferred twice. Carry it into H2 as its own item, not as a rollout tail.

## What to try next

- Build time on the largest repo, so `build` can join the required set.
- Dependency and secret scanning as blocking checks everywhere, not only in the repos that opted
  in (practice `supply-chain-security`, D9).

## Consolidates

- `memory/episodic/2026-06-required-checks-decision.md`
- `memory/procedural/rolling-back-a-bad-release.md`
- `memory/semantic/service-naming-and-ownership.md` (ownership is what made the rollout
  addressable: every failing repo had exactly one team to talk to)
