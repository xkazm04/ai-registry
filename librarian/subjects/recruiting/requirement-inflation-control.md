---
domain: recruiting
subject: requirement-inflation-control
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# requirement-inflation-control

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ric-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". That was true: the subject was at revision 1, from 2026-08-21, with no
note, no `applied.md` row and applications last verified 2026-08-20. `check-currency`
reported no row for it, so no clock had expired; the pass was driven by the missing
sweep and by two same-day siblings (`inclusive-job-advertising`,
`hiring-need-as-structured-brief`) that had already conditioned claims this subject
repeats.

Lanes that ran, and one that did not:
- a web counter-evidence lane on six claims (the degree gap, the paper reset, the
  self-selection asymmetry, the must-have ceiling, machine-drafted inflation, experience
  floors);
- two primary reads: the 2024 hiring analysis from its PDF text and the Coffman,
  Collis and Kulkarni working paper from its PDF text (the search summaries alone were
  not trusted for either);
- a re-read of kp, at `c35a63321` and confirmed unchanged on the cited files at
  `4dd303bdd`, for every line citation in the three applications.
- **No blind training-data lane ran.** Convergence on the folklore claim therefore rests
  on the sibling note's blind lane for the same figure (the anecdote traced to an
  unnamed HP executive), not on a lane of this pass.

**Corrected (claims that carried no basis or a stale one):**
- **"The direction of the self-selection effect is well attested in surveys."** Direct
  tests find a small gap only among marginally qualified readers (BIT 2022, online
  experiment over ten thousand: about 52 percent of listed qualifications for men, about
  56 for women, no gap among the well qualified). The stronger result is about
  ambiguity: in a field experiment, 6 percent of qualified women applied under a vague
  description against 22 percent of qualified men, and 29 percent applied when the
  qualifying score was stated and invited (men did not move; read from the working
  paper, which also reports a pre-registered replication where both sexes responded).
  Neither varies the count. The golden path and the cap technique now say so and point
  to the advertising subject, which holds the fuller account and the field result on
  cutting optional items.
- **"Past roughly six the list stops discriminating; quality visibly falls off."** No
  study located puts a number on it; practitioner guidance clusters at six to eight and
  cites nothing. The technique now calls the mechanism plausible and the numbers
  conventions. The multiplication argument was left as the firm reason.
- **"Follow-up work found the change in hiring a small fraction of the change in
  postings; the requirement moved into the rubric, query and interviewer's bar."** The
  measured part is real and now has its sample: about 11,000 roles, 3.6 percent dropped
  the line, +3.5 points of non-degree hires in those roles, 0.14 points net (one in 700),
  and a 37/45/18 split of leaders, name-only and backsliders (read from the PDF). *Where*
  the filter went is the authors' inference (a degree stays a comparative heuristic, plus
  an incentive to revert), never observed; the technique now says so and adds the
  re-measurement a year on to the completion criteria.
- **The 67/16 supervisor gap, undated.** It is a 2017 figure; the postings side later
  loosened (46 percent of middle-skill occupations, 2017 to 2019). The 33 percent
  supervisor figure for 2020 was seen only in a secondary citation and was not written
  into the corpus.
- **The machine source.** Stated as a mechanism, not a rate: no study of how often
  drafting models inflate requirement lists turned up.

**Verified, left alone:** the four-question proxy audit and the incumbent test, the
have-to-do reframe, the ninety-day horizon (no source contradicts it, and OPM's "only
competencies expected on the first day" line, seen in the sibling's lane, agrees), the
forced top three, outcomes-before-requirements, and the never-promote-an-unstated-tool
five clauses.

**Added, as a condition and not a technique:** in a two-axis grading a fallback is
judged on the cell, per consumer, not on the axis. kp's own coercer keeps a `must_have`
kind fallback deliberately while falling hardness to `learnable`, which is safe only
while every consumer that gates does so on the cell. It points to the structured-brief
technique for the grid.

**Convergence.** No new technique was earned: every flip is a condition inside an
existing technique or the golden path.

**The tree found what no lane asked.** kp's keyless `design_role` fallback sliced the
merged must-have list at six, so eight stated confirmed dealbreakers came back as six,
silently, weight-ordered, while the model path's prompt forbids exactly that. It had
been there since 2026-08-07 and the first verification missed it. It is the cap acting
as a truncation, the failure the technique names, and it is now fixed and measured.

**Applied** (four rows in `applied.md`):
- **code, better:** kp `006bf7a0a`, local, not pushed. One need at 3, 6 and 8 stated
  rows through the real function: 8 stated returned 6 before and 8 after; 3 and 6
  unchanged. New test red first; 278 devcase tests green.
- **unapplied:** the degree-outcome measurement (kp records no hire outcome by
  education), the cell fallback (the sourcing consumer was not traced), and the pool
  rationale (kp's lint copy, banked by the sibling).

**Applications.** All three re-verified to 2026-09-29 at kp `4dd303bdd` (node@24 on the
node one); every line citation moved, the lint's `Math.max` of prose and structured
counts is now described, and the parsed-ad path's fail-toward-the-gate defaults are
recorded as an observed deviation. A fourth application, for the cap technique, holds
the A/B.

## Impact

- **kp:** the subject joins no context in kp's committed registry map (0 occurrences
  of the slug), so 0 stale verdicts and no queue for `/conform --stale`. `fleet-map.md`
  lists it under kp by scope, which is a different index. No other project joins it.
- **No map was rebuilt.** A clean-worktree build of kp's map from this landing dropped
  151 pairs and two carried verdicts against the map a sibling committed at 17:10Z
  (built from a shared tree with more content), so it was not committed and kp's own
  file was restored. Recruiting's bundle digest in kp's map lags until the next fleet
  rebuild; it changes nothing about a pair for this subject.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3 for the cap (a code A/B with a red-first test on the real function), L2 for the degree and applicant claims (primary text read), L1 for the machine source |
| Last-pass yield | medium: 5 corrections, 1 condition, 1 code fix with an A/B, 3 applications re-cited |
| Dry streak | 0 |
| Clocks | none expired at 2026-09-29; the degree-reset literature is the one that moves, re-check by 2027-03 |
| Demand | kp only, by scope; no context join |

## Banked leads

- **No blind lane ran.** Return: the next pass, before any further claim here is called
  converged.
- **The 2022 degree-reset report's production-supervisor figure.** Seen only in a
  secondary citation. Return: a read of the report PDF.
- **Indeed's experience-floor data.** Share of tech postings asking five or more years
  rose from 37 to 42 percent (Q2 2022 to Q2 2025) while the no-experience share rose
  economy-wide; not written in, because the subject makes no claim about posting rates
  for experience. Return: if the tenure variants gain a market-rate claim.
- **kp's parsed-ad requirement defaults and the publish route.** Return: the trace in the
  third `applied.md` row.
- **kp's lint copy and comment.** Banked by the advertising subject; the same seam.
