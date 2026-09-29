---
domain: recruiting
subject: presenting-a-score-to-a-recruiter
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# presenting-a-score-to-a-recruiter

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-psc-0929)

The Curator lane dispatched this from the registry's attention scan, on "never swept by
the librarian". Registry HEAD at dispatch was 58adea0f. `check-currency` had no row for it:
the three existing applications were pinned to a date (2026-08-20), not to an expiring
runtime. The demand was the tree: kp had moved about twenty commits through the cited files since
that date, and every `matching.py` line citation was stale by 100 to 330 lines.

Three lanes ran: a web counter-evidence lane (four claims), a blind training-data lane
(six questions), and a read-only re-read of kp at `70dd2319d`, with the engine's own
tests and three probes run against it. One disclosure: the blind lane's third question
described the two band tables, so it is not blind on that finding. Its other five answers
are.

**Counter-evidence: one conditioned, one held as consequence, one confirmed with a limit.**
- **Conditioned: "showing the assumptions at the moment of the click makes the recruiter
  decide rather than confirm".** The counter lane and the blind lane converged. I read both
  abstracts verbatim from arXiv (not through a summary): Bansal et al. 2021 (2006.14779),
  "explanations increased the chance that humans will accept the AI's recommendation,
  regardless of its correctness"; Buçinca et al. 2021 (2102.09692), "Adding explanations to
  the AI decisions does not appear to reduce the overreliance and some studies suggest that
  it might even increase it", with cognitive forcing reducing overreliance (N=199) at the
  price of the lowest subjective ratings, and more benefit for people high in Need for
  Cognition. Abstract level only; neither is a hiring study. Landed as a decision rule in
  the assumptions technique and a paragraph in the golden path.
- **Held as a design consequence, not a finding: the re-weighting surface invites motivated
  tuning.** The blind lane named it unprompted. The counter lane reported the
  constructed-criteria literature (Uhlmann & Cohen 2005) from a search summary only: the PDF
  it fetched was the wrong paper. Landed as a rule (record the committed weights before
  candidates are viewed, log changes) worded without a study attached.
- **Confirmed with a limit: an interval with the reason for its width.** van der Bles et al.
  2020 read as a search summary only (PNAS returned 403). Experiments on public statistics,
  not hiring. No change.
- **Not landed: the EU AI Act.** Article 14(4)(b) names automation bias; the counter lane
  could only reach a transcription (the Publications Office returned RDF metadata, no
  text), and reported the Digital Omnibus as adopted (Regulation (EU) 2026/1744, Annex III
  duties from 2 December 2027) from three secondary pages. This subject cites no
  regulation, so nothing was landed, and neither the wording nor the date was read from
  the official text. Return: when a technique here needs to cite Article 14.

**The tree found what no lane asked (all on kp, all read and run):**
- **A different question needs three decisions, not a caption.** A work-sample transfer
  score had been written into the match-score column with a `?? 0` default; the fix
  (`3fefc55cb`, 2026-08-28) separated storage, the ranking read and the labelled display
  fallback. Blind lane, asked to design it, reached the same three parts and the same
  failures; the question named the three axes, so that is agreement, not discovery. New
  application, and the technique's step 6 now carries the three decisions.
- **Two band families, each locked, disagree.** The fit tier (70/55, mirrored Python to TS
  by test) and the colour tone (75/50, mirrored to a terminal script by a comment) both band
  the match number, side by side on one candidate card in two places. Measured by reading the
  constants out of the source files: 10 of 101 integer scores band differently (50 to 54 and
  70 to 74). Not in the corpus; the technique's rule 6 predicted the failure but its rule 4
  test only binds a family to its copy. New application, rule 6 extended.
- **The gates have detectors, and the detectors were asymmetric.** A language gate that
  failed a list ending in `EN` and passed one beginning with it (`50cf602ab`) and a seniority
  term that missed its feminine form (`da80f915c`) knocked candidates out before any score
  existed. Added to the knockout technique as a symmetry-test rule, in a new application
  together with the as-if list (`BlockedMatch`), the preference flags that are never a bar,
  and the education gate that now needs a measured shortfall.
- **The stale claim.** The first application's open deviation "no rubric version rides with the
  score" is half closed: `pipeline_entries.rubric_version` exists since `0c6993773`
  (2026-09-24), NULL meaning unknown standard, and no surface renders it. It is also the role
  rubric's version, not the matcher's. Recorded in both applications' deviations and as a step
  in the technique.
- **A claim I checked and corrected in my own draft.** I first wrote that `displayScoreOf` has
  no direct test; `pipeline-transfer-score.test.ts` pins it in four assertions. Fixed before
  landing.

**Verified, left alone:** the four-obligation frame, the component-sum invariant (the stale
comment at `format.ts:483` about the pipeline minting its own total is still there, still the
only loose end), the null tier, the axis pinning, the `?? 0` in `factorPoints` (still open).

**Applied** (five rows in `applied.md`):
- **experiment, better:** the two-band enumeration. The fit mirror test passes (9 tests) and
  the consumer enumeration finds 10 of 101.
- **experiment, better:** the language symmetry probe over every ordering. Pre-fix 3 of 16
  cases order-dependent, the tree 0 of 16, and the control (German or French against English)
  stays false.
- **code, better:** kp already ships the three-part split; 28 tests across four files pass.
- **code, better:** kp already ships the as-if list and the preference flags; 35 tests pass.
- **unapplied:** the forcing step. No fleet surface has one, and the instrument would need
  recruiters.

**Applications.** Three re-verified to 2026-09-29 (node@24, react@19) with every moved line
citation corrected, three added. The band deviation is recorded and the tree was not edited:
the choice moves a recruiter-visible threshold, and it is the owner's.

## Impact

- **kp:** 1 context joined (`match-score-shared-types`), state unknown; 0 stale verdicts
  against this subject. No project carries a judged verdict on it, so no `/conform --stale`
  queue gains an entry.
- **Map regenerated for kp only** (`8e275e0ff`, local, not pushed). It was built from local
  main's corpus, the one kp's last map used; the origin corpus differs (local main 19 ahead,
  33 behind), and a map from it would have moved kp's software-engineering digest backwards.
  The eleven other projects were not regenerated: this subject pairs only with kp
  (`fleet-map`: the rest are out of domain).
- **The join missed this pass's seams.** The band deviation lives in the decisions and
  candidate-overview components, which `match-score-shared-types` does not cover.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: two experiments over real constants and a real gate, test suites run against the tree (63 tests, plus 9 in the fit-sync test) |
| Last-pass yield | high: 1 conditioned, 1 consequence, 3 new applications, 3 re-verified, 4 techniques and the golden path widened |
| Dry streak | 0 |
| Clocks | Bansal 2021 and Buçinca 2021 (abstracts, arXiv); kp `70dd2319d`; no expiring runtime |
| Demand | kp only (one context) |

## Banked leads

- **Uhlmann & Cohen 2005 (constructed criteria).** Return: a full-text read; then the slider
  rule may carry the study.
- **Green & Chen 2019; Wilson et al. 2025 ("No Thoughts Just AI", 528 participants).** The
  counter lane could not read the first and saw the second as a page summary. Return: a
  primary read, especially for a hiring-specific over-reliance figure.
- **The band deviation in kp.** Return: when kp next edits `format.ts` tone cutoffs or
  `fit-thresholds.ts`, or grows the enumeration test.
- **The `?? 0` in `factorPoints` and the stale doc comment at `format.ts:483`.** Return: when
  kp next edits either file.
- **EU AI Act Article 14(4)(b) and the Omnibus date.** Return: an official-text read.
