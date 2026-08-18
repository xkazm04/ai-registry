---
kind: episodic
confidence: 1.0
namespace: engineering
source: decision-record
---

# 2026-06-11: pull-request checks became required, with a two-week grace period

## What happened

Lint, typecheck, test and secret-scan were made **required** checks on the default branch of
every service repo. Until then they ran on every pull request but did not block merge.

The trigger was a measurement, not an argument: over the previous quarter, 23 percent of merged
pull requests had at least one failing check at merge time, and the two longest incidents of the
quarter each traced back to one of those merges.

## The decision

- Four checks required on the default branch: `lint`, `typecheck`, `test`, `secret-scan`.
- A two-week grace period first, during which the checks were advisory and a weekly list of
  repos with failing checks went to owning teams. The grace period existed to separate "this
  repo is broken" from "this repo has never run these checks", and it moved 14 repos to green
  before enforcement, without anyone being blocked.
- Bypass is possible for repo admins, logged, and reviewed monthly. Bypasses that recur are
  treated as a broken check, not as a habit to police.
- Build was deliberately left out of the required set: at the time it took over 20 minutes on
  the largest repo and would have made the gate the slowest part of the day. Revisit once build
  times are under 5 minutes.

## What we learned

- The grace period was the reason this landed without a fight. Enforcing immediately would have
  blocked teams on failures they had never been shown.
- Flaky tests surfaced the moment the check began to block, and not one hour earlier. Budget for
  a flaky-test cleanup as part of the rollout, not as a follow-up nobody schedules.
- "Advisory check" turned out to mean "ignored check". The 23 percent figure did not improve at
  all during the advisory period; it went to near zero the day the checks became required.

## Related

- `memory/summary/2026-h1-delivery-guardrails.md`
- Practice `ci-gates` (D3)
