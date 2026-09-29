---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: knockout-reason-categorised-at-birth
stack: process
status: forged
verified_on: 2026-09-29
---

# The knocked-out match: gate first, score in a separate list, preferences never a bar

The first application of this technique here read `ko_filter` as it stood on 2026-08-20.
It has since grown three things the technique had asked for in prose and this engine now
does in structure. (kp at `70dd2319d`; `match_blocked`, eligibility and matcher tests run on
this tree: 35 passed.)

## The number under a knockout lives in its own list

The technique says a numeric score under a knockout is "suppressed or explicitly
subordinated". `match(include_blocked=True)` (`matching.py:1355`) does the second by
construction. Every job the gate removed comes back as a `BlockedMatch`
(`matching.py:339`): the gate's own `ko_keys` and `ko_details` in `ko_filter`'s order, and
a `result` scored as if the gate were lifted. The docstring states the rule: "The as-if
total is information for the seeker, never a rank: a blocked job is not in `matches` and
never counts toward `returned`."

The subordination is a separate list, not a flag on the ranked one. A flag can be dropped
by a sort or a `filter`; a job that is not in `matches` cannot be ranked by anything that
reads `matches`. It is the same move as the transfer score's separate read path (see the
node application on this subject), applied to a gate instead of a second question.
The default is off, `blocked` is absent from the dump, and a test pins that the payload
without the flag is unchanged (`test_match_blocked.py`, "the dump is unchanged"). The
recruiter path never sees it.

## A preference is not a bar

`088d62616` (2026-09-16) added seeker-side flags for salary, location, seniority, language
and work mode (`eligibility: EligibilityFlag[]`, `matching.py`, computed after `total` and
tier are fixed). The commit message states the rule and the tests pin it: preferences change
what the card says and nothing the engine scores; `test_totals_identical_with_and_without_
preferences` and `test_ranking_order_unchanged_by_preferences` hold it. Its honesty rules
are the technique's phantom rule extended to the new channel: a posting with no stated pay,
or a band `normalize_job` stamped from the market anchor and recorded in
`defaulted_fields`, is `unknown` and never "under"; a different currency is "not
comparable", never converted; the only arithmetic is month to year at x12, said in the
detail string.

## An unknown is a widened band, not a bar

`0f7ce4993` (2026-09-23): the candidate level `university` is minted from a school name
with no degree title, and the education gate used to treat it as below a bachelor floor.
`ko_filter` now appends an education reason only when `education_gate` returns `below`, a
measured shortfall; a named school with no stated degree is `uncertain`, widens the
confidence band by the same 4 points as an unknown level with driver `eduDegreeUnstated`,
and is named in the assumption list (`matching.py:1290-1296`, next to `eduUnknown`). The commit
records the case that motivated it: an English CV writing "Charles University, 2012-2017"
was knocked out of every bachelor-plus role while the same CV in Czech, classified
unknown, passed. The gate is job-aware: a role whose floor is "any degree" or none is fully
measured and gets no wider band.

This is the technique's "uncertain knockout is not a knockout" rule, found in the wild as a
defect in the classifier that feeds the gate.

## The detector under the gate: two defects a score distribution cannot show

A knockout removes a candidate **before a score exists**, so a defect in what detects the
bar cannot be seen in any score histogram. Two were fixed in this engine, both in the
week after the first application on this subject:

- `50cf602ab` (2026-08-20). The language gate matched aliases by substring, and some
  aliases carry a trailing space as a word boundary (`"en "`), unsatisfiable at the end of
  the string. A candidate whose language list *ended* in the code (`"Czech, EN"`) failed
  an English requirement and was hard-knocked-out before scoring, while the same two entries in the other
  order passed. `_has_language` (`matching.py`) now pads the blob on both ends.
- `da80f915c` (2026-08-22). Czech inflects for gender, and a feminine form that changes the
  stem never matched the masculine surface. "Zkušený samostatný specialista" resolved to
  senior and passed a senior role; the identical CV as "Zkušená samostatná specialistka"
  resolved to junior and was knocked out ("seniority gap (junior candidate vs senior
  role)"). The fix derives feminine variants from a closed ending table for detection paths
  only, changes no weight, threshold or band, and `taxonomy_check.scan_gender_gaps` now
  gates the omission mechanically (55 masculine-only surfaces covered).

The lesson the technique should carry: a gate needs a **symmetry test on its detector**,
not only a category on its output. Feed the gate two inputs that differ only in an order or
an inflection or a name, and require the same verdict. The perturbation method for names
and proxies is in the fairness bundle (recruiting/adverse-impact-and-proxy-neutrality); the
point here is that the gates are where it pays most, because a wrong bar is unrecoverable
by the recruiter and invisible in the ranking.

## Deviations still open

- The category vocabulary is five keys (`language`, `seniority`, `early_career`,
  `education`, `work_mode`, `matching.py:336`). The technique's examples that are legal
  bars (work authorization, a required licence) are not modelled here, so those bars reach
  the recruiter as absent skills or prose.
- The as-if score is offered on the seeker scan (`include_blocked`). Without the flag the
  payload is byte-identical to before, so on the recruiter path a knocked-out job's number is
  simply not computed: the technique's "ineligible, assessed N on the remaining dimensions"
  line has no producer there.
