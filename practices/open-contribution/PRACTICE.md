---
id: open-contribution
dimension: D5
applies-when: "The repo is an open-source product run by one maintainer plus agents, and it accepts outside contributions without a CONTRIBUTING.md, issue and PR templates, or protection on the files a bad merge would make expensive."
---

# Open contribution

**What it gives you:** contribution channels sized to the truth of the project - one
maintainer, many agents, a local-first product - so outside help arrives reviewable
instead of arriving as more work, and the invariants that make the product trustworthy
survive every merge.

**Dimension:** D5. **Starters:**
[`starter/.github/ISSUE_TEMPLATE/bug_report.md`](starter/.github/ISSUE_TEMPLATE/bug_report.md),
[`starter/.github/ISSUE_TEMPLATE/feature_request.md`](starter/.github/ISSUE_TEMPLATE/feature_request.md),
[`starter/.github/PULL_REQUEST_TEMPLATE.md`](starter/.github/PULL_REQUEST_TEMPLATE.md),
[`starter/CODEOWNERS`](starter/CODEOWNERS),
[`starter/CODE_OF_CONDUCT.md`](starter/CODE_OF_CONDUCT.md).

## The shape

A conformant repo enforces these seven rules, through its templates, its `CONTRIBUTING.md`
and its review practice. This is the *shape* - no repo's actual content travels with it.

1. **Issues carry their context.** A bug report states the deploy mode (local dev,
   self-hosted, or cloud), attaches the doctor or capability-matrix output, and includes a
   reproduction. A feature request states the job to be done, never the solution. The
   maintainer publishes an honest triage cadence - for example "maintained by one person
   plus agents; triaged weekly" - because an honest SLA beats a fast one.
2. **Pull requests are one focused change.** The repo's verification gate is green locally
   before pushing; `CONTRIBUTING.md` lists the exact commands. Tests are mandatory for
   auth, billing, tenancy, rate limits, and any change to an LLM chokepoint. Commits are
   pathspec-scoped - never `git add -A`. Docs change in the same PR as the code they
   describe, and copy changes carry full locale parity wherever the repo is localized.
3. **Local-first invariants are review criteria, not aspirations.** Never make a provider
   mandatory. Never remove a deterministic fallback. Never add a feature that only makes
   sense hosted. Nothing phones home by default. If the hosted version is ever better than
   the repository, that is a bug.
4. **AI-assisted contributions are welcome, and owned.** This is an AI-native project.
   But you own what you submit: you ran the gate yourself and you can explain every line
   of the diff. Substantially agent-generated PRs say so in the description. Drive-by bulk
   agent PRs - mass refactors, dependency churn, style-only sweeps - are closed without
   review.
5. **Licensing is explained, not just declared.** Keep the repo's existing model - a CLA
   permitting relicensing, or DCO plus a license grant - and say plainly why it exists:
   the hosted version funds the free one.
6. **The law files are protected.** `CODEOWNERS` covers plans and billing, tenancy, the
   LLM chokepoint, `.claude/`, `CLAUDE.md` / `AGENTS.md`, and the CI workflows. Anyone can
   touch them; merging requires the owner.
7. **Good first issues are curated, not labeled.** Fill the label from already-triaged
   backlogs - scan-sweep and UAT drains - where findings arrive sized and verified. That
   is a ready-made contributor funnel; an uncurated label is a support queue.

## Why this shape

A solo-maintained project dies of review debt before it dies of anything else. Every rule
above moves work from the maintainer's queue to the contributor's checklist: the deploy
mode and the doctor output are the two questions triage would have asked anyway, the local
gate is the CI run that would have failed anyway, and the focused-change rule is the review
that would have stalled anyway. The invariants in rule 3 live in the review checklist
because that is the only place they are enforceable - a principle in a manifesto loses to a
convenient PR; a review criterion does not. Rule 4 exists because agents made contributions
cheap to produce and exactly as expensive as ever to review; the filter is ownership, not
authorship. And rule 7 is where a solo project quietly stops being solo: a triaged backlog
already contains the sized, verified work a first-time contributor needs.

## Rules

- The gate runs before the push, not after the review comment.
- An invariant violation (rule 3) is a requested change, never a nit.
- The triage cadence printed in the templates matches reality; when reality changes, the
  templates change in the same commit.
- Templates ask only for what triage actually uses. Every field earns its place, or goes.
- The law-file list in `CODEOWNERS` is short enough to recite. Protection that covers
  everything protects nothing - it just makes the owner the bottleneck.

## How to tell it is working

- Issues arrive triageable: mode, doctor output and reproduction present without a
  follow-up question.
- PRs pass CI on the first run more often than not, because the gate ran locally first.
- A hosted-only feature has been declined in review, and the decline cited an invariant,
  not taste.
- The good-first-issue label has produced a second-time contributor.
- No law file has ever merged without the owner, and nobody was blocked from proposing a
  change to one.

## Adopting it

1. Copy `starter/.github/`, `starter/CODEOWNERS` and `starter/CODE_OF_CONDUCT.md` into the
   repo. Fill every `<...>` and `TODO:`; the code of conduct needs only the contact.
2. Write the exact gate commands into `CONTRIBUTING.md` - the PR template points at it,
   so a stale command list breaks every PR that follows it.
3. Set the triage cadence to what you actually do, not what sounds welcoming.
4. Name the law files in `CODEOWNERS` and require owner review on them in the branch
   protection rules.
5. Seed the good-first-issue label from the most recent triaged backlog drain.

## Anti-patterns

- A fast SLA you cannot keep. "Triaged weekly" kept is worth more than "we respond in 24
  hours" broken - the second one costs trust precisely when a contributor is deciding
  whether to stay.
- Closing agent PRs because they are agent PRs. The filter is ownership: gate run, diff
  explained. An owned agent PR is a contribution; an unowned human PR is not.
- Solution-shaped feature requests accepted as written. The job to be done is the durable
  requirement; the proposed solution is one guess at it.
- Templates as interrogation. Ten required fields filter out exactly the casual first
  report you wanted; three fields that triage really uses do not.
- A CLA with no explanation. Contributors assume the worst about relicensing rights unless
  told plainly what funds what.
- Enforcing the invariants only on outside PRs. The maintainer's own hosted-convenience
  shortcut is the precedent every future PR will cite.
