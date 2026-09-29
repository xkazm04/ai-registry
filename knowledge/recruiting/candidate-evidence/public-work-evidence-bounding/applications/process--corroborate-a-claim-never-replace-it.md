---
layer: application
type: application
subject: public-work-evidence-bounding
technique: corroborate-a-claim-never-replace-it
stack: process
status: forged
verified_on: 2026-09-29
---

# The three-bucket evidence block, from prompt to downstream task (prompt pipeline)

The corroboration structure in this repo exists twice: once as the output
contract of the review prompt, and once as the shape of the block that review
contributes to every later candidate-facing task. Both are three buckets, and
they are the same three.

## The output contract forces the split

`app/_lib/github/code-review.ts:237-242` fixes the shape before the model
writes anything:

```
{"summary": "...", "confirmed_skills": ["skill evidenced by the signals"],
 "unverified_claims": ["jd skill not visible in the repo signals"],
 "hidden_strengths": ["skill in the signals but not in jd"]}
```

The three keys are the technique's three buckets: corroborated, not reached,
and the strength nobody asked for. Because the split lives in the schema rather
than in a request for careful phrasing, the model cannot merge them into one
fluent narrative — the anti-pattern the technique names — and a downstream
consumer can treat them differently without parsing prose.

The instruction block around it does the bounding work the buckets depend on:

> "You are NOT reading the source code. You only receive lightweight public
> signals…" … "Be conservative: do not infer code quality, architecture, or
> implementation details you cannot see. Treat a skill as evidenced only when
> the visible signals directly support it." … "name any MUST-HAVE
> job-description skills that are NOT evidenced by the signals explicitly —
> never imply full coverage (e.g. do not say 'matches N of N must-haves') when
> a required skill is unproven."

Two details are worth copying. The rule for the `confirmed_skills` bucket is a
*positive* evidence test ("only when the visible signals directly support it"),
so the default for anything unseen is the neutral middle bucket rather than the
confirmed one. And the summary — the only free-text field, and the one a
recruiter actually reads — carries an explicit prohibition on the coverage
claim, because that is the sentence that would undo the split.

## The block keeps its labels all the way downstream

`pipeline/jobfit/automation.py:913-945` (`github_evidence_block`) renders that structure as the "Public
repo evidence" block prepended to the screen, prep and scorecard prompts. The
bucket labels are re-stated in full at every use:

```python
lines.append(f"- Evidenced skills (public repo signals support these): {confirmed}")
lines.append(f"- CV claims NOT verified by public repos: {unverified}")
lines.append(f"- Hidden strengths (visible in repos, absent from the CV): {hidden}")
```

Three properties of this rendering match the technique:

- **The middle label says *not verified by public repos*, not *unverified*.**
  The qualifier names the source rather than the claim, which is what stops the
  bucket from reading as doubt about the candidate.
- **Empty buckets emit nothing.** Each `if` guards its line, so an absent
  bucket is silence rather than an empty heading — no whitespace downgrade.
- **Evidence-less entries are byte-identical to their pre-feature form**: the
  function returns `""` when there is no usable summary, "keeping every prompt
  byte-identical to its pre-GH7 bytes for evidence-less entries." A candidate
  with no public work is not a candidate with a conspicuous empty section; they
  are a candidate the prompt never mentions it for. That is the optionality
  rule realized at the prompt layer.
- **The block is attributed and dated** — the header line carries the username
  and `analyzedAt`, so a later reader knows which profile, read when.

The surrounding grounding rule for candidate-facing letters
(`automation.py:904`) is the same discipline in the other direction:
"Ground every claim in the supplied facts: never assert meetings, team
reactions, benefits, interest, or abilities that are not in them."

## Role dependence is modelled, but only in the candidate profile

`pipeline/jobfit/models.py:27-33` still gives publications and patents a first-class
type — "the primary signal for scientific/research hires that otherwise has
nowhere to live" — alongside `Credential` for licence-gated roles, and
`CandidateProfile.links` (`:52-53`) for "portfolio/repo/profile links". The
comment states the standard's weighting rule directly: what counts as primary
evidence is a property of the role's own dependence, not of the pipeline.

## The panel now holds the buckets as a ledger, not as three lists

Since the last read, the deep-dive panel no longer hands the recruiter five
independent skill lists from two engines. `app/_lib/github/skill-ledger.ts`
(`fa2c4296b`, 2026-09-23) joins the label comparison and the review on the
canonical skill and emits one row per skill with one of four verdicts —
`corroborated`, `notReached`, `couldNotDetermine`, `unclaimed` (`:136`) — the
technique's three buckets plus the coverage-loss state. Its header names the
neutrality rule: `notReached` is "NEUTRAL: never 'unverified', never 'missing'".
A corroborated row names the repositories that carried it, and where the review
calls a label-matched skill unverified the row stays corroborated and carries
`reviewDisagrees` (`:23-27`): the two engines' statements differ, "which is for a
human to look at, not a verdict". That is a partial answer to the missing
contradiction bucket recorded here before, on the panel only.

## Deviations

- **The freeze loses the coverage flag, so the prompt block can misname a
  skill.** `buildGithubEvidenceSummary` (`app/_lib/github-summary.ts:58-85`) copies
  the review's three lists and drops `codeReview.partial`, the limitations and the
  ledger's verdicts. `github_evidence_block` then prints the review's
  `unverifiedClaims` under "CV claims NOT verified by public repos"
  (`automation.py:940`). On a complete read that label is accurate; on a partial
  one the panel calls the same skill *could not determine* and the screening,
  prep and scorecard prompts call it not verified. A degraded run can still be
  added to the pipeline, because only its cache write is refused. The fix is one
  field on the summary type and one line in the block; it is not made here.
- **The weighting is declared, not applied.** Publications, credentials and
  links are extracted and carried, but the public-repo evidence block is
  weighted identically regardless of role: nothing makes a portfolio primary
  for a design role or publications primary for a research one at scoring time.
- **The buckets are prompt input, not a preserved artifact structure.** Once
  the block is folded into a screening prompt, downstream text can blend the
  three; nothing re-checks that the screening output kept them apart. The
  ledger's four verdicts stop at the panel and do not reach the frozen summary.
- **The seeker side does what the recruiter side does not.**
  `pipeline/jobfit/github_evidence_cli.py` derives seeker evidence with
  provenance fixed to `personal_project` (weight 0.7, never `professional`),
  "Evidence, never verdicts", and a `corroborates` flag that only says a claim the
  seeker already made is backed. Nothing there says a skill is missing. It is the
  standard's substitution rule realised in a data contract, and the recruiter
  block has no equivalent of the provenance field.
