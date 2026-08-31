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

## 1.1.0 - 2026-08-23 - twelve pairs across five repos (the second wave)

- **Eight of eleven deviations were at a boundary the technique never mentions.** The
  mechanism a technique asks for was present, well built and incident-commented in nearly
  every case; it stopped at the edge of the module that owned it - a wire projection that
  keeps the prose and drops the codes, an export seam that drops the caveats, an error
  branch that falls back to the default bar, a process split that turns redrive into
  duplication. kp named the corollary: **the extraction boundary, not the claim's
  importance, predicts which numbers are honest.** ascent showed the purest form - one
  sensor refusing to derive a confident false negative from a failed read, its neighbour
  in the same pipeline spelling the identical failure as an empty success. When a pattern
  recurs under eight techniques in four bundles, the finding is about the corpus's shape,
  not about the repos. Recorded as a forge lead in [[2026-08-23-6]].
- **Brief the doubt, but require the premise to be TESTED, not honored.** Both pairs
  briefed as probably-not-applicable came back governed, and in both cases the test was
  the finding: one reader traced a dispatch proxy to prove the surface was not a mock
  before judging it, the other read the golden path's object definition and the bundle's
  transplant-clean clause to establish that taxonomy location is not a boundary. A
  `not-applicable` on either would have silently retired a live surface. The 1.1.0 rule
  ("say in the brief that refusing is a first-class answer") is right and incomplete: the
  flag is a hypothesis handed to the reader, and the brief must ask for it to be falsified
  either way.
- **A conformance finding can overstate its reach, and that is the same defect class as an
  instrument bug.** One reader reported that defect codes "reach no route or component";
  they reach two. Verified before recording and narrowed to the lane it is true of. An
  overstated finding cannot be falsified by the next reader - it just gets re-found as a
  contradiction, exactly like a miscounted coverage gap.
- Judging a bundle against the repo it was forged FROM works, but only with the brief
  saying so: both `recruiting` and `game-production` returned deviations against their own
  origin repo, because a technique describing what a repo used to do is not conformance.

- **The wave's own verdicts are a backtest, and they refuted the fix every worker
  proposed.** After the 2026-08-31 wave the fleet held 287 labelled pairs. A
  `not-applicable` IS the matcher's error and `conformant`/`deviation` are both its
  successes, so the set grades matcher changes directly. Ten workers had independently
  proposed down-weighting the polysemous tokens (`vault`, `eval`, the bare `matrix` that
  scored 324). Measured, every variant traded about ONE real governance pair for ONE bad
  pair — a scaffolding stoplist, a path-weight cut, an ambiguity penalty, all three
  together, and dropping lexical-only outright (which cost a sixth of everything the
  matcher correctly found). The tokens are polysemous *and* they are how the right pairs
  are found. What worked instead was the verdicts themselves: "this subject already has
  >= 2 not-applicable verdicts in this project, and more not-applicable than governed"
  predicts the next one at 69% precision / 57% recall — better than 2:1 where every token
  fix was 1:1. **A skill that accumulates judgments eventually holds the data to grade its
  own instrument; reach for that before reaching for a heuristic.**
- **A ranking hint must never become a verdict.** `priorNotApplicable` ships as a
  deprioritization, not a filter: the pair is still emitted and still judgeable, and a
  `conformant` verdict weakens the prior that produced it. The failure mode to guard is a
  reader writing an unread `not-applicable` *because the map suggested one* — that poisons
  the exact tally the next run trusts, and unlike a dropped pair it looks like evidence.
- **Priming a worker toward a pattern will get you the pattern.** Three briefs in the
  2026-08-31 wave suggested that N contexts failing one subject "probably share one root
  cause — one fix, not N." All three came back split: four `fleet-orchestration` contexts
  had four different answers, the `settings` triple was two not-applicable plus one
  conformant, and `browser-credential-boundary` turned out not to apply because that repo
  routes all data through a server-only client. Every one of those refusals was correct
  and the tidier answer would have been wrong. State the hypothesis, ask for it to be
  falsified, and say plainly that splitting it is a first-class result.
