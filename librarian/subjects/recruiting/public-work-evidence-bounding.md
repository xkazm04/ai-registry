---
subject: public-work-evidence-bounding
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# public-work-evidence-bounding

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 58adea0f.

## 2026-09-29 - the applications were a month behind a rewritten reader

**Depth rung:** L2 for the applications. The first pass of this run rewrote them and was interrupted before committing; its line citations mixed kp's committed tree with sibling WIP (`describeCapsHit`, and every `github-evidence.ts` and `skills.ts` line, existed only in the dirty tree or nowhere). Re-resolved here against kp commit 70dd2319d, which has no change to any cited file since 2afb2b38c; the `cut`/`describeCapsHit` sentence was dropped because that code is uncommitted. L0 for the golden path and techniques: no web lane, no blind lane, no counter-evidence lane. Their claims are design and fairness rules, not measured figures, and none was tested here.

The three applications carried `verified_on: 2026-08-20`. kp had since moved the transport into one non-throwing `githubRead`, added the skill ledger, stopped caching degraded runs, and grown a second consumer (the job seeker's own account). Every line citation in `client.ts`, `analysis.ts` and `skills.ts` was off, and one recorded deviation was closed.

**Corrected in the applications:**
- absent-signal: transport and its seven outcome kinds; the `undeterminedSkills` hand-off; the ledger's `couldNotDetermine` verdict; degraded runs no longer cached (`isTransientlyDegraded`), which closes the "stays degraded until a human presses retry" deviation; the taxonomy grew from 10 to 28 buckets and moved to `skill-ledger.ts`; `retryAfterSec` reaches the panel.
- verify-identity: line numbers; the seeker read re-checks `owner.login`, drops forks and private rows, and takes the same person gate; erasure nulls `github_handle` and `github_json`. Still open and re-verified: no ownership signal on a hand-typed handle, the normalised form replaces the raw input, no collision check.
- corroborate: the ledger is the three buckets plus the coverage-loss state, with `reviewDisagrees` as a partial contradiction signal.

**Found by reading the tree, not in the corpus:**
- **The freeze drops the coverage flag.** `buildGithubEvidenceSummary` copies the review's three lists and not `partial`, the limitations or the ledger verdicts. The screening, prep and scorecard prompt block then prints a partial read's `unverifiedClaims` as "CV claims NOT verified by public repos", where the panel says could-not-determine. Not fixed in kp: the summary type crosses TS and Python and kp's tree carries sibling WIP.
- **Forbidden is folded into throttled.** Every 403 is `throttled`, so an access-policy refusal renders as a retry prompt. It never becomes an absence, which is the property that matters.

**Verified, left alone:** the golden path and all six techniques. No technique text changed, so nothing new was earned and no flipped rule is owed. The technique's step 7 ("does not freeze a degraded read as authoritative") is now realised in kp for the cache and not for the frozen summary.

**Not evaluated:** any web lane for the golden path's fairness claims (industries that forbid publishing, availability tracking free time); a training-data-only lane. Return condition: a consumer deviation, or the frozen-summary fix landing in kp and its application row being re-read.

## Impact
See the result file; map figures were read from a dry run at the landing commit.
