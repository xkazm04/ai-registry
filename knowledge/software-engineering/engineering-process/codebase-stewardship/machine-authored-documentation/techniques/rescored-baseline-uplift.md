---
layer: technique
type: technique
subject: machine-authored-documentation
technique: rescored-baseline-uplift
status: forged
laws: [count-carries-predicate, gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [claiming a generator improved after a fix, the acceptance criteria changed while the fix was being built, comparing a new benchmark run against a published number, a targeted fix improved its own case and the aggregate did not move]
---

# Re-score the baseline before claiming an uplift

The sequence is universal and it is wrong at exactly one step. A generator has
a known weakness. Someone builds a fix. The suite is re-run. The number is
better. The fix ships, and the improvement is published.

The missing step: the old candidates were scored by the **old verifier**, and
the verifier changed. It nearly always changes, for an honest reason — building
the fix is what taught the team what the acceptance criterion should have said.
Somebody discovers mid-work that a recoverable state was passing without a real
transition back to the active state, tightens the check, and now the two
numbers being compared were produced by two different graders.

The comparison then measures the grader's movement and the generator's movement
summed, and the sum has no interpretation. It can show an uplift from a
generator that got worse under a grader that got looser. It can show a
regression from a generator that got better under a grader that got stricter.
Nothing about the direction is recoverable from the two numbers alone.

## The correction is arithmetic, and it is cheap

**Freeze the candidates, not the scores.** The artifacts each run produced are
the durable evidence; the scores are a function applied to them. Keep every
frozen candidate, every transcript, the commit and the package digest — then,
when the verifier changes, re-score the *baseline* under the current verifier
and compare like with like.

The cost is one re-run of a deterministic function over files already on disk.
The benefit is the only version of the comparison that means anything. And the
prerequisite is that the receipt recorded which verifier scored it, which is
why that field belongs in
[packaged-surface-evaluation](./packaged-surface-evaluation.md)'s receipt
rather than being reconstructed from a changelog later.

**In the field record this technique is written from, that arithmetic reversed
a shipped conclusion.** A first complete matrix — five cases, three models,
fifteen frozen first attempts — was reported at 10 of 15 first-pass usable. A
subsequent fix produced a post-fix matrix, and the natural comparison would
have shown movement. Re-scored under the corrected verifier, the original
matrix scored 8 of 15 and the post-fix matrix scored 8 of 15: **the single
sample did not demonstrate an uplift at all.** A third run, targeting the
weakest case with a quality-first configuration and no latency cutoff, scored
8 of 15 again. Three runs, one number, and the only reason anyone knows that is
that the candidates were frozen and re-scorable.

## A flat aggregate is a finding, not a null result

The instinct on seeing 8, 8, 8 is to conclude the work did nothing. The
decomposition says otherwise, and the decomposition is where the value is:

- The targeted case moved from 0 of 3 to 1 of 3.
- A neighbouring case moved from 2 of 3 to 3 of 3.
- Two other cases regressed by the same total.

That is not "no change". It is a **redistribution**, and it says something
specific and actionable: the fix worked on what it aimed at and cost something
elsewhere, so the next question is what the regressing cases have in common
rather than whether to keep the fix. An aggregate reported alone would have
concluded the opposite of each half.

So the rule has a second clause: **report the per-case decomposition beside the
aggregate, always.** A single number over a small matrix is a count without its
predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
and small matrices are the norm here because every cell costs a full generation
plus a human review.

## Related corrections that ride the same discipline

Three more places where a score moves for a reason that is not the generator,
all closed by the same freeze-and-re-score reflex:

- **Vocabulary calibration.** Widening the accepted-label table after seeing
  the candidates is scoring twice and keeping the better score — unless every
  arm, including the baseline, is re-scored under the widened table. Calibrate
  after the freeze, then re-score everything.
- **A targeted mechanical fix is not an uplift.** A bounded automatic repair
  that turns one frozen candidate from a failure into a reviewed pass is a real
  improvement to that candidate and evidence about exactly one cell. It is
  reported as such.
- **Operational metrics are not quality metrics.** Runtime duration is recorded
  context. Folding it into a usability score makes both uninterpretable, and
  makes a slower-but-correct configuration look worse than a faster wrong one.

## What may be claimed

- With one frozen matrix re-scored under one verifier: **the distribution of
  first-pass outcomes for these configurations on these cases at this commit.**
  A fixed diagnostic sample.
- Not a leaderboard. Five cases and three configurations is a diagnostic, and
  publishing it as a ranking invites a comparison the sample cannot support.
- Not a latency claim, unless latency was controlled.
- Not authenticity of an external transcript — the harness verifies artifacts,
  not provenance of the runs that produced them. Retain the raw prompts,
  candidates, commit and reviewer evidence alongside any published claim, and
  say that the retention is what backs it.

## Decision rules

- **When the verifier is stable across the comparison**, this technique reduces
  to ordinary paired regression testing and the observability-side discipline
  for that is the better tool. The discriminator is whether the grader moved.
- **When the baseline's candidates were not kept**, there is no uplift claim
  available — only a new baseline. Say that, start the freeze habit, and do not
  reconstruct the old number from memory.
- **When a verifier change is contested**, keep both scorings and publish both.
  Two numbered graders with a stated difference is a decision anyone can audit;
  one number from an unnamed grader is not.
- **When the matrix is incomplete**, it is not evidence-eligible. Do not report
  a partial matrix's aggregate — the missing cells are not neutral.

## When not to use this

Not for a generator whose acceptance criteria are genuinely frozen by an
external standard, where the grader cannot move. There the baseline number
stays valid and re-scoring is wasted work — but confirm the criteria are frozen
rather than assuming it, because a verifier that changed without a version bump
is the case this technique exists for.
