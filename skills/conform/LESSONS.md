# Lessons - conform

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-23 - ascent (the first run)

- **Selecting the work found a defect in the map before any code was read, and that is the
  order paying off.** The candidate list showed `test-harness` as a top match on 33 of 52
  contexts. It is a matcher artifact - every context's file list carries `*.test.ts`, so
  `test` is rare among SUBJECTS (high IDF) and near-universal among CONTEXTS, and IDF over
  one side of a join cannot see the other. Fixed in the generator by weighting both sides;
  the most-matched subject fell from 63% of contexts to 15%. **Look at the map before
  spending the expensive pass on it** - the cheap step is the one that protects the costly one.
- **A deliberately doubtful pair was the most valuable of the five.** `cicd-monitoring` was
  dispatched against a "Provider Integrations" context precisely because the strong score
  looked wrong. It came back `not-applicable` with the subject's own boundary statement
  quoted, the failing precondition named, and the subject that SHOULD govern identified
  (`connector-catalog`) with a technique-by-technique mapping. Brief at least one doubtful
  pair per run and say in the brief that refusing it is a first-class answer; a reader told
  only to find deviations will find them.
- **Lexical matching misses silently, and the miss is invisible without a reader.**
  `connector-catalog` - the correct subject - scored ZERO on that context and appeared
  nowhere in the map, while five wrong subjects ranked strong. The repo says
  provider/integration; the subject says connector/catalog/adapter. Word overlap cannot see
  a concept under a different name. Applied in 1.1.0: a corrected pairing is written back
  with `source: "conform"` and the generator carries it forward, so the map LEARNS what the
  matcher cannot compute.
- **"Strong" was relative to the leader, so a context nothing matched well reported five
  strong subjects.** The confidence band now also requires the context's own leader to reach
  the project median. Strong pairs in that project fell from a flat wall to 31 of 179 - a
  set worth prioritising rather than a label on everything.
- **A technique-shaped resonance is not a subject match.** The context genuinely realizes
  `provider-capability-honesty` (declared capabilities, absent capability = absent
  affordance, an honest "not reported" instead of a fabricated zero) - but that technique
  lives inside a subject whose precondition (watching something you do not own, over time)
  the context fails. Route by the golden path's stated precondition, not by vocabulary.
