---
status: EXECUTED (2026-10-14, icoach-1014; worker overrides: conflict rule, thresholds, earned-secret as tie-break, technique 6 argued down)
source: librarian/sources/2026-10-14-interview-coach-skill.md
run_id: icoach-1014
bundle: recruiting
category: candidate-self-presentation
subject: interview-story-portfolio
resolved_path: knowledge/recruiting/candidate-self-presentation/interview-story-portfolio/
category_count: 2 subjects now, 3 after (cap 10, V1 clear). The category is flat (no subcategories), so a subject directly under it is legal. taxonomy.json entry is APPENDED to the category's subjects list, not reordered.
---

# Spec: interview-story-portfolio

## Why this is XL and why it is proposed rather than written

Seven candidates from one practitioner repository (a candidate-side interview-coaching
skill, n=1) share one home-if-new and none has a home today. The recruiting bundle's
candidate-self-presentation category holds two subjects, both about the CV document;
nothing in the bundle models the spoken half of self-presentation: a finite set of
experiences allocated across questions that are only predicted. A grep for the story
vocabulary (storybank, STAR, earned secret) over the bundle hits three unrelated
technique files. Three or more candidates with one home-if-new fires the XL trigger
mechanically. The evidence is one author's account, which is why every technique below
must be argued from first principles and from the neighbouring subjects, not from the
tool; the tool is the occasion, never the authority.

## The subject's job (the golden path opening must say this and name boundaries)

A candidate will be asked questions they can only partly predict, and they own a finite
set of true experiences. The subject owns the step between "I have experiences" and "I
walk in with an allocation": how a set of experiences is matched to likely questions, how
conflicts for the best experience are resolved, how reuse across a search is bounded, what
the candidate says when no experience fits, what makes an experience distinctive rather
than generic, and how a candidate's own practice scoring is (and is not) checked against
real outcomes.

It must NOT absorb: how a CV is written, ordered or tailored (cv-content-construction
owns that and this subject starts after the CV exists); how a CV is laid out or parsed
(cv-presentation-and-parseability); how an employer designs an interview round, a kit or a
rubric (assessment/* subjects own the interviewer's side; this subject is the mirror image
and must say so in prose, once, without importing their techniques); employer-side score
calibration (decision-and-fairness/selection-score-calibration owns the hiring-side
version and this subject's calibration technique is the candidate-coach version with a
different sample and different confounds); inventing experience (the bundle's law
say-only-what-the-record-holds governs and applies to a candidate as much as to a
recruiter's tool). Say where each boundary sits in the golden path, in prose, with no
cross-bundle links.

## Proposed techniques (decision rule each must carry)

1. `fit-tiers-with-a-secondary-skill-cap` - Grade every story-question match on a closed
   four-state scale (strong fit, workable, stretch, gap) and order the factors that decide
   it: competency match first, story strength second, company/role alignment third,
   freshness fourth, variety as a portfolio constraint rather than a per-question one. A
   match through a secondary skill is workable at best, never strong, because the
   competency is not the centrepiece of the story. A strength-5 story with a secondary
   match can still beat a strength-3 story with a primary match; say where that stops.
   Open question for the drafter: why four tiers and not a score; the answer is about what
   action each tier triggers (use, bridge, stretch-with-framing, handle the gap).
2. `portfolio-assignment-before-per-question-pick` - Map the whole set of predicted
   questions against the whole set of stories as one matrix, find questions whose best
   option is the same story, assign it to the question where its fit is highest (ties go
   to the harder question or the one with fewer alternatives), cascade the loser to its
   next-best, and flag every downgrade out loud with bridging guidance. A story is reused
   only when no alternative exists, with the reason stated and a different angle for each
   use. Boundary: this is an assignment problem solved by hand; the technique is the order
   of operations and the visible downgrade, not an algorithm.
3. `freshness-and-overuse-across-a-search` - Use is counted across the whole search, not
   one interview. A story used in an earlier round at the same employer drops a tier unless
   the interviewer asks to go deeper on it; three uses is a rotate-if-you-can warning and
   five is a prioritise-alternatives warning because people in a network may have heard
   it. Open question for the drafter: the thresholds 3 and 5 are the source's, with no
   measurement behind them; decide whether the technique states the thresholds or the
   shape, and say which.
4. `gap-response-chosen-by-story-strength` - When no story fits, the response is picked by
   the strongest available evidence, not by temperament: a usable story needs no gap
   handling; a thin story is a springboard to the underlying principle; a very thin story
   is worse than an honest reframe; adjacent experience is bridged to; no experience at all
   gets a stated approach plus what would be learned first; a known development area
   becomes a growth narrative. Hard rules: never fabricate, never stop at "I haven't done
   that", never cover a personal gap with "we". This is the bundle's say-only-what-the-
   record-holds seen from a candidate chair.
5. `earned-secret-needs-proof` - A claimed insight that makes an answer distinctive must be
   non-obvious, learned from direct experience, defensible if challenged, and backed by a
   specific story, number or artifact; generic advice, borrowed wisdom, obvious
   observations and unevidenced predictions do not qualify. Give the five extraction
   questions as prompts but argue the test, not the prompts. Boundary and caution: a
   distinctive take must not be manufactured; the source's "spiky point of view" advice is
   deliberately NOT absorbed (see Out of scope).
6. `practice-score-needs-outcomes-before-it-is-trusted` - Practice scoring is a predictor
   whose accuracy is unknown until real outcomes exist, and the source's own rule
   (declare a coach calibrated after three outcomes, then move the scoring by half a point
   on interviewer feedback) is the wrong scale: three outcomes cannot calibrate anything,
   outcomes are confounded by role fit, competition and a rejection that arrives with no
   reason, and the outcome is only weakly the score. The technique states the minimum
   evidence before any claim of calibration, treats external feedback as stronger than
   internal scoring only when it names a specific behaviour, and reports "cannot tell yet"
   as a first-class state. It must cite the bundle's laws on sample and basis. Boundary:
   employer-side selection-score-calibration owns reliability bins and proper scoring;
   this is the candidate-coach version with n of a handful. This is the corrected-source
   technique: the source located a real gap and gave a rule for filling it that over-claims.
7. `one-treatment-per-root-cause` - When the same underlying cause (for example avoiding
   conflict in every story) depresses several scoring dimensions in two or more sessions,
   it graduates from per-answer observation to a tracked root cause with ONE intervention,
   not one drill per dimension; progress is judged by all affected dimensions moving
   together, and it resolves only after sustained movement over several sessions. Open
   question for the drafter: whether this belongs here or is a general coaching technique;
   argue it from the neighbouring performance-root-cause material in other bundles, and
   keep it here only if the candidate-side framing changes the rule.

## Out of scope (recorded so a later run does not re-derive it)

- Spiky point of view as a technique: the source says to find "a principled stance some
  would disagree with"; the risk is manufactured contrarianism, which conflicts with
  say-only-what-the-record-holds. Lead, not a technique.
- Job-description decoding with confidence labels and a recruiter verification question
  for every low-confidence reading: the bundle's hypothesis-not-verdict-soft-signals
  already carries benign alternative and confirmation probe; catch.
- Temporal decay tiers for interview intelligence (3 / 6 / 12 months): thresholds without
  measurement; untriaged.

## Applications

Source-tree applications are owed (the source's clone is an opened tree, stack `process`
since it is a prompt-only skill with no runtime): at least three, one each for
`portfolio-assignment-before-per-question-pick`, `gap-response-chosen-by-story-strength`
and `practice-score-needs-outcomes-before-it-is-trusted`, citing the source's reference
documents by `path:line "quote"` anchors verified with
`node scripts/check-anchors.mjs <doc> --root <clone>`. `verified_against` names what the
tree witnesses (a version file, a release note); if it witnesses none, say so and omit the
field. Each opens by saying what the realization CANNOT do: every rule is enforced by
prose to a model, nothing checks that a mapping was produced, that a downgrade was
flagged, or that a calibration claim had three outcomes behind it.

## Open questions the drafter decides

- Is portfolio assignment one technique or two (the matrix and the conflict resolution)?
- Where does a secondary-skill match end and a stretch begin?
- Is the "challenge always ends in one fix" rule (a critique with no actionable change is
  unkind) a technique, a paragraph in the golden path, or nothing? The source states it as
  a design principle; decide.
- Should the golden path carry a short section on the mirror-image employer-side
  technique (question-kit-grounded-in-named-evidence-gaps)? Prose only; no link.

## Instances that exist in a tree you can open

C:/Users/kazda/AppData/Local/Temp/claude/C--Users-kazda-kiro-ai-registry/095256c8-c1a0-4f07-89b7-88e543d3fa8b/scratchpad/icoach-1014
(read-only clone, commit 634a8dd8): references/story-mapping-engine.md (fit scoring,
portfolio protocol, earned-secret-aware selection), references/cross-cutting.md (the gap
patterns and the pattern-by-strength table), references/calibration-engine.md (drift
protocol, root-cause lifecycle, the three-outcome threshold), references/differentiation.md
(earned-secret test and the spiky guardrails), references/challenge-protocol.md (the
challenge-without-resolution principle).
