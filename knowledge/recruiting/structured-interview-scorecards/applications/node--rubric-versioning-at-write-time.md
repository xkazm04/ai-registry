---
layer: application
type: application
subject: structured-interview-scorecards
technique: rubric-versioning-at-write-time
stack: node
---

# Stamping the scale in a two-runtime rubric module

`app/_lib/interview-rubric.ts` is the shared rubric module: one JSON source
(`pipeline/jobfit/interview-rubrics.json`) read by the TypeScript app and by the
Python scorer in `pipeline/jobfit/automation.py`. Versioning is built on top of
that single source, and the reason it can be is stated at `interview-rubric.ts:1`
— "'Both read the JSON' is enforced, not just asserted: `interview-rubric.test.ts`
pins these exports to the JSON, and `test_interview_rubrics.py` pins the Python
scorer to the same file — so TS == JSON == Python fails CI on drift."

## The version identity

`rubricVersionHash` (`interview-rubric.ts:198`) hashes a **resolved** rubric slice
— the output of `rubricForArchetype`, base competencies plus any appended
industry axes — so the stamp describes the exact scale that candidate was scored
on, not the whole catalogue.

It covers `competency + description + anchors`, deliberately: "a reworded anchor
advances the version, not just an added/removed axis" — the standard's rule that
the instrument is the text, not the label.

The serialization choice is the cross-runtime discipline made concrete: a
delimiter-joined canonical string using `␟` between fields and `␞` between
competencies, hashed with 64-bit FNV-1a, "chosen so the TS and Python stamps are
byte-identical WITHOUT depending on cross-language JSON canonicalization or a
crypto lib" (this module is client-bundled through `HumanScorecardPanel`, so it
must stay free of `node:crypto`). `automation.rubric_version_hash` mirrors it, and
both are pinned to the same literal in their own language's tests.

## The two-part stamp

The hash is the compact identity; the competency **key list** stored beside it is
the re-evaluation shape. `flagOffRubricRatingsWithKeys` uses the second:

```ts
const known = storedKeys && storedKeys.length
  ? new Set(storedKeys.map((k) => k.toLowerCase()))
  : rubricCompetencyKeys(currentRubric);
```

When the scorecard carries the keys it was scored against, off-rubric is judged
against *that* historical scale, "so a since-revised `interview-rubrics.json`
can't retroactively mark a once-valid axis off-rubric." A legacy row with no
stored keys falls back to the current rubric and behaves exactly as the
unversioned path always did — the migration is additive, and old semantics are
not silently changed either.

## Off-rubric is stated, never blanked

`flagOffRubricRatings` keeps unknown competencies and marks them: "Unknown
competencies are KEPT, never rejected: a scorecard outlives rubric revisions by
design." The recruiter grid does the same at the row level —
`mergeRubricRows` (`app/features/library/jobs/jobsCompareCohorts.ts`) renders the
current rubric's axes first, then appends every competency a candidate was
actually scored on that the rubric no longer contains, flagged `offRubric`, "instead
of letting the exact-name join silently blank them to '—'"
(`interview-simulation-comparison #2`).

The neighbouring fix in the same file is the whole-scale version of the same bug:
`isUnrecognizedCohort` detects a `scoringModel` that maps to no rubric "so the grid
can SAY so instead of rendering a name+verdict header above an empty, ratingless
body — indistinguishable from a genuinely un-scored candidate at the hire-decision
surface" (`#1`).

## Comparability and honest backfill

`jobsCompareCohorts.ts:20` states the comparability rule directly: "Candidates are
comparable WITHIN a cohort, not across — an experienced hire's track-record axes
and a student's potential constructs are different rubrics." `buildCohorts` groups
by `scoringModel` and pairs each group with its own rubric; nothing pools across
them.

`app/_lib/db/interviews.ts:9` handles the pre-versioning rows the way the standard
requires — by what could have existed, not by re-derivation from the profile:
"Older (pre-v3) scorecards predate the early-career rubric, so a missing value is
correctly 'experienced'." The same boundary coerces a malformed verdict:
`coerceInterviewRecommendation` sends anything unrecognised to `hold`, "so the
compare grid only ever receives a legal verdict or a clean null" — a value the
instrument cannot account for is not a result the instrument produced.

## Gaps against the standard

The stamp is written and honoured, but there is no *retrieval* of superseded
anchor text: the hash identifies a version, and only the current JSON is
available, so an old scorecard's own anchor paragraphs cannot be re-read. And
nothing announces a cut point to downstream consumers, so a step change at a
rubric boundary in an aggregate would read as a change in candidate quality.
