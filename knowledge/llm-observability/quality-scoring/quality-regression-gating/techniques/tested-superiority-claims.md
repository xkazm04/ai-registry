---
layer: technique
type: technique
subject: quality-regression-gating
technique: tested-superiority-claims
status: forged
laws: [statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [a leaderboard prints a winner, a report claims one model beats another, a rendering layer displays stored comparison results]
---

# Tested superiority claims

Every comparison surface eventually prints the sentence people actually
read: "Best: X". The naive implementation is an argmax over means — and an
argmax is not a claim about models, it is a fact about a sample. Two
targets 0.01 apart with wide overlapping intervals will still produce a
bold winner, and every reader downstream now believes something no test
supports: model choices get made, budgets get moved, a vendor gets
switched, on the strength of a coin flip formatted as a conclusion. The
discipline is that **superiority is tested, never asserted** — and that
every rendering layer between the test and the reader is forbidden from
strengthening the sentence.

## Procedure

1. **Test the top against the runner-up, paired.** The winner line is a
   claim that X beats Y, so it gets the same machinery as any other claim:
   per-case deltas between X and Y on the same cases, a two-sided test on
   the deltas (paired-per-case-testing).
2. **Count the family the argmax hid.** Selecting "the top pair" *after*
   seeing the means implicitly chose among all `m·(m−1)/2` pairs — the
   selection is data-dependent, so the whole family pays the correction.
   Testing only the observed top pair at the uncorrected level is the
   classic selection-inference error: the pair was picked because it
   looked extreme, which is exactly when an uncorrected test flatters it.
3. **Print the sentence the evidence supports, and no more.**
   - Separation survives the corrected test → "Best: X — significantly
     ahead of Y", with the p-value and the correction named inline.
   - It does not → "Highest mean: X — no significant difference from the
     runner-up." This is a fact about the sample, honestly labelled as
     one, and it is the *common* case at eval-suite sample sizes.
4. **Carry the claim, not the data, to the render layer.** The tested
   claim (or its absence) is stored with the run. Any consumer rendering
   a stored table later — a CLI, a dashboard, a chat surface — prints the
   stored claim or the explicit degradation "highest mean, not tested for
   significance". The render layer **never re-derives statistics**: it
   only refuses to print a stronger sentence than the claim it was
   handed. Re-derivation at render time forks the definition of "best"
   and guarantees the forks disagree eventually.

## Decision rules

- **When no comparable pairing exists** between the top two (different
  case sets), there is no superiority claim to make — say "not
  comparable", never fall back to the bare means.
- **When the tested claim is absent from stored data** (legacy runs,
  external imports), the honest render is "not tested", not a freshly
  computed verdict — a consumer computing statistics it cannot source
  from per-case evidence is asserting, not testing.
- **When the audience pushes back** ("just tell me which is best"), the
  answer "no significant difference — they are interchangeable at this
  sample size, pick on cost" *is* the actionable finding. Ties are
  information; a tool that cannot say "tie" will manufacture winners.
- **When ranking many candidates** rather than crowning one, present the
  interval per candidate and cluster the statistically indistinguishable
  ones, instead of running all-pairs tests whose corrected power at
  typical sample sizes rounds to zero.

## When not to use it

- Purely descriptive dashboards that show score trajectories without a
  winner sentence need no superiority test — the discipline attaches to
  *claims*, not to charts. The moment a label says "best", "beats",
  "ahead", or an ordering is presented as a conclusion, it attaches.
- Do not use the superiority test as the deploy gate. The gate's question
  is "did this target regress against its own history?" — a different
  claim, with a different family, answered by the regression verdict. A
  target can lose the leaderboard and still pass its gate, and both
  statements can be true at once.
