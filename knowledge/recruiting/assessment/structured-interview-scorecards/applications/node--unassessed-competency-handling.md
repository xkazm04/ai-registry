---
layer: application
type: application
subject: structured-interview-scorecards
technique: unassessed-competency-handling
stack: node
verified_on: 2026-09-29
verified_against: node@24
---

# A sentinel 3 on the AI path, an omitted rating on the human one, and a ledger that arbitrates

The corpus carried no application for this technique; the code that answers it sits beside
the other three, so this one is written from the tree at kp `60aab8088` (2026-09-29).

## The two paths store absence differently

The machine-drafted scorecard stores an untouched axis as a real 3. `NOT_ASSESSED_RATING = 3`
(`app/_lib/interview-scorecard.ts:68`), and its comment states the cost: "NOT-ASSESSED IS
ON THE SCALE — 3 of 5, mid-band, indistinguishable from an observed middling score to
anything that reads `rating` alone." It is the compromise the technique names, kept honest by
`isNotAssessedRating` (`:80`), the read-side guard every rendering and ranking surface calls:
the rating equals 3 *and* the evidence is placeholder. Requiring both halves is deliberate, and
the comment explains it: a human's blank-note 3 is "a deliberate, observed rating".

The human path never stores the placeholder. A rating that is not a finite number is dropped
(`app/api/interview-prep/scorecard/route.ts:127`, "an unrated competency is simply omitted"),
which is the technique's preferred arrangement: nothing is stored that could take part in
arithmetic. The two paths sit in one codebase and one of them needs a guard the other does not.

The collision the technique warns about is present in the data. `ratingAnchors`
(`pipeline/jobfit/interview-rubrics.json:2-8`) names the bar, and the bar is 3: "Meets the
bar". The sentinel is the level that meets it, so anything reading `rating` without the guard
sees a competency that cleared. The scorer's seal step shows the team knew the shape of the
risk: `sealableRubricDimensions` (`interview-scorecard.ts:118`) drops a not-assessed axis
before a scorecard's dimensions are sealed as the decision's inputs, because sealing it
"would tell a candidate they scored mid on a competency the interview never once asked about".

## The director's record arbitrates coverage

The larger change since the first pass is where the coverage flag comes from. The compare grid
used to trust the model's own "Not assessed" sentinel. `axisCoverage`
(`app/_lib/interview-axis-coverage.ts:48`, commit `80581c128`, 2026-09-23) reads instead what
the interview director recorded: each agenda block names its rubric competency, and the event
ledger says which blocks were begun and which were covered on a quote verified against the
candidate's own turns. It emits four states per axis (`AXIS_COVERAGE_STATES`, `:27`): `covered`,
`asked`, `not_reached`, `not_planned`.

Three details are the technique's own rules, met:

- **Unknown is not an all-missing map.** `axisCoverage` returns `null` for an undirected session
  ("the lab, an undirected provider, a human-only row") and its comment says why: "never an
  all-`not_reached` map, which would accuse a call that simply was not directed."
- **Owed questions are unknown until the call closes.** `mustAsksUnasked` is `null` when no
  accepted end is on record (`:37`, `:94`), because those rows are written only there; a dropped
  call "concluded nothing — unknown, not 0". `mustAsksOwed` renders a chip only for a positive
  count.
- **The disagreements get their own flags.** `cellFlag` (`jobsCompareCohorts.ts`) raises
  `rated_not_reached` (a real rating on an axis no attempt began, "absence of evidence dressed as
  a score") and `sentinel_but_covered` (the model wrote not-assessed on an axis the director
  accepted as covered). `csvRating` (`:110`) lets the ledger outrank the model: "an AI number on
  an axis no attempt ever began is blanked exactly like the sentinel … a spreadsheet cannot carry
  the flag, so it must not carry the number."

This is one deployment's arrangement and one incident's worth of evidence (the acceptance count
in the commit is 8 of 8 on its own challenge, from 0). What carries to other systems is the
source of the flag, an independent record of what happened, not the four names.

## Where it falls short

- **The sentinel is still stored.** The AI path continues to write a 3 and rely on the guard
  rather than omit the rating as the human path does, so the guard has to be right at every
  reader, forever. The seal step, the grid and the CSV each carry their own copy of the rule.
- **The demotion is missing on the failure path.** A quote that fails the grounding check keeps
  its rating with placeholder evidence beside it (see the evidence application), so a 4 can ride
  as a live rating that no guard recognises, because the guard needs the rating to equal 3.
- **The human path has no coverage flag per axis.** The coverage stamp records role-family
  coverage (`rubricCoverage`), not which of the rubric's axes the interviewer never rated;
  an omitted rating is visible only as a missing row.
