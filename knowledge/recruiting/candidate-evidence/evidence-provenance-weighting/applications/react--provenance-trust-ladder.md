---
layer: application
type: application
subject: evidence-provenance-weighting
technique: provenance-trust-ladder
stack: react
verified_on: 2026-08-20
---

# The ladder on the recruiter's screen (TypeScript / React)

The scoring ladder is Python (`pipeline/jobfit/taxonomy.py:447`); the ladder a recruiter
*sees* is `provLabel` in `app/features/shared/matchTypes.ts:190`, the canonical
provenance→badge mapping every decision surface calls —
`JobsRecruiterCandidatesCard.tsx:138`, `GroupEvalComparisonCells.tsx:114`,
`DecisionsAnalysisParts.tsx:82`, `MatchCardSkillChips.tsx:39`. `JobsTypes.ts:154` records
that it was deliberately moved here so there is one mapping rather than hand-maintained
copies.

## The top rung must never fall through

`provLabel` is an ordered `if` chain over seven display keys, ending in a bare `return`
for the `academic` bucket — a catch-all. The comment on the first branch
(`matchTypes.ts:190`) is the standard's display rule stated as a defect class:

> `observed` is the highest-trust provenance the pipeline can mint (a passed live case
> or case-grounded interview) — it gets the strongest visual stamp, and must never fall
> through to the generic "academic" bucket.

That ordering is the whole guard: because the fallthrough silently *demotes*, a rung
added to the Python ladder but not to this chain loses its badge without any error. The
standard's rule — an unmapped tier is a defect, not a default — is enforced here by
convention and a comment, not by an exhaustive check.

**Deviation.** The display ladder is coarser than the scoring ladder: seven display keys
against twelve weights, with `thesis`, `academic_project`, `personal_project`,
`extracurricular`, `coursework` and `unknown` all collapsing into `academic`. Collapsing
*downward* for display is the compromise the standard permits — but `unknown` landing in
a mid-ladder academic bucket rather than at the floor is not, and a personal project
rendering identically to coursework loses a real 0.2 of discount from the reader's view.
The standard stays: display may coarsen, but never upward, and unknown belongs at the
floor.

## Text is not baked into the badge

`provLabel` returns only `{ key, tone }`; the display string is resolved at the render
site through `useEnumLabel("provenance", key)` against the `enums.provenance.*` catalog.
The mapping is module-level precisely so it cannot call the hook itself. This is the
bundle-level rule that meaning does not live in a label, realized at the display layer:
the badge carries a stable key and a tone, and the words are localized downstream — so a
translated interface cannot silently change which evidence tier a chip asserts.

## The fallback every consumer already spelled

Each call site reads `prov[s] ?? "self_declared"` — the floor, never a stronger tier.
That agreement is what made the display fix on the Python side cheap: `matching.py:889`
emits `matched_skill_provenance` as
`{s: candidate.skill_provenance.get(s, "self_declared") for s in matched}`, and its
comment records why it is deliberately *not* `provenance_default`:

> provenance_default is "professional" for every BAU candidate, so falling back to it
> here tagged a skill the candidate merely LISTED with the joint-highest trust tier,
> which the recruiter surfaces then rendered as a confident PROFESSIONAL badge: an
> affirmative claim of verification that was never performed.

`pipeline/jobfit/tests/test_matched_provenance_honesty.py:1` pins it and states the
distinction the standard borrows: "That is not an omission; it is an affirmative claim
of verification the system never performed." The chosen fallback was the one the UI
already used, so "Python now agrees with the UI instead of contradicting it, and no new
locale key is needed."

Two disciplines from that fix are worth transplanting. The display channel and the
scoring channel are **separate**: `matching.py:889` warns that scoring reads
`candidate.skill_provenance` + `provenance_default` directly and "SCORING IS UNAFFECTED
and must stay that way", so display honesty shipped with zero score movement and the
score-moving decision shipped later as its own change with its own re-baseline. And when
two layers disagree about a fallback, the honest layer wins — the fix moved the producer
down to the consumers' floor, not the consumers up to the producer's tier.

## The three buckets reach the surface intact

`matchTypes.ts:75-79` carries `unprovenSkills`, `unprovenSkillStrength` and
`unprovenSkillReason` as a set, with the comment that the reason "tells a near-miss
specialist (`adjacency`) from an unsubstantiated claim (`provenance` | `both`)" — the
seam with skill adjacency, kept as one shared vocabulary
(`matching.py:357` defines the same three on the Python side). `MatchResultView`
(`:90-108`) is a `Pick` onto the canonical `MatchResult` so an added field propagates to
every decision surface instead of drifting across copies, and the three unproven fields
are additive and optional: an older stored analysis without them "renders exactly as
before (absent = no chrome)" — the unmeasured state rendering as absent rather than as a
zero.
