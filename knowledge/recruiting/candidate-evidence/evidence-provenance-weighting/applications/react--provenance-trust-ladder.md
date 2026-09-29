---
layer: application
type: application
subject: evidence-provenance-weighting
technique: provenance-trust-ladder
stack: react
verified_on: 2026-09-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The ladder on the recruiter's screen (TypeScript / React)

The scoring ladder is Python (`pipeline/jobfit/taxonomy.py:632`). The ladder a
recruiter *sees* is `provLabel` in `app/features/shared/matchTypes.ts:220`, the
canonical provenance-to-badge mapping. Every decision surface calls it:
`DecisionsAnalysisParts.tsx:83`, `GroupEvalComparisonCells.tsx:122`,
`MatchCardSkillChips.tsx:79` and `CandidatePreviewModal.tsx:125`. `JobsTypes.ts:169`
records that it was deliberately moved there so there is one mapping, not
hand-maintained copies.

## The top rung must never fall through, and neither may the others

`provLabel` is an ordered `if` chain. The comment on its first branch states the
standard's display rule as a defect class:

> `observed` is the highest-trust provenance the pipeline can mint (a passed live case
> or case-grounded interview) — it gets the strongest visual stamp, and must never fall
> through to the generic "academic" bucket.

**A fix for one fallthrough created five more (found and fixed 2026-09-29).** On
2026-08-20 the chain ended in a bare `return` of the `academic` bucket. So `unknown`
painted as academic, while the five study and project rungs collapsed downward into
academic, which the standard permits. Commit `4feb5d6c6` (2026-09-17) stopped the
unknown case by returning `unknown` for anything the chain did not name. But the
pipeline never emits `"academic"`. It emits `thesis`, `academic_project`,
`personal_project`, `coursework` and `extracurricular`, and every one of those now fell
to the `unknown` badge. The recruiter surfaces showed a recorded basis as "we don't
know". That is a false statement about the record even though it errs downward.

The commit's test used one invented slug, `"nope"`, so it passed. All four locale
catalogs already carried a label for each of the five rungs; only the mapping dropped
them.

A new test loops the generated `PROVENANCE` vocabulary (`app/_lib/taxonomy.generated.ts`,
emitted from `UI_PROVENANCE`) plus `observed`. It was red on 5 of 10 rungs. The fix
(kp `8ea9ae1a4`, committed locally, not pushed) gives each study and project rung its
own key under the academic tone. The test is green, and `tsc --noEmit` exits 0 over
the whole program with the widened `ProvenanceKey`. The mapping is still a chain
rather than an exhaustive switch. What holds it now is a test built on the ladder's
own vocabulary, which is the standard's rule.

## Text is not baked into the badge

`provLabel` returns only `{ key, tone }`. The display string is resolved at the render
site through `useEnumLabel("provenance", key)` against the `enums.provenance.*`
catalog. The mapping is module-level precisely so it cannot call the hook itself. A
key with no catalog entry falls back to `labelize(slug)`. That is how the `unknown`
badge rendered as "Unknown" with no catalog entry of its own.

## The fallback every consumer already spelled

Each call site reads `prov[s] ?? "self_declared"`: the floor, never a stronger tier.
That agreement is what made the display fix on the Python side cheap. `matching.py:1222`
emits `matched_skill_provenance` as `candidate.skill_provenance.get(s, "self_declared")`.
Its comment records why it is deliberately *not* `provenance_default`. A skill the
candidate merely listed used to come back tagged with the joint-highest tier, and "which
the recruiter surfaces then rendered as a confident PROFESSIONAL badge: an affirmative
claim of verification that was never performed."

Two disciplines from that fix are worth transplanting.
- **The display channel and the scoring channel are separate.** The comment at
  `matching.py:1218` says "SCORING IS UNAFFECTED and must stay that way", so display
  honesty shipped with zero score movement. The score-moving decision shipped later,
  as its own change.
- **When two layers disagree about a fallback, the honest layer wins.** The fix moved
  the producer down to the consumers' floor, not the consumers up to the producer's
  tier.

## The three buckets reach the surface intact

`matchTypes.ts` carries `unprovenSkills`, `unprovenSkillStrength` and
`unprovenSkillReason` as a set. The reason "tells a near-miss specialist ('adjacency')
from an unsubstantiated claim ('provenance' | 'both')", with the source's inner
double quotes shown as single quotes. `MatchResultView` is a `Pick`
onto the canonical `MatchResult`, so an added field propagates to every decision
surface. The three unproven fields are optional, so an older stored analysis without
them renders as absent rather than as a zero.
