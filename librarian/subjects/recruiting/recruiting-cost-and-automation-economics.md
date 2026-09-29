---
domain: recruiting
subject: recruiting-cost-and-automation-economics
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# recruiting-cost-and-automation-economics

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-rcae-0929)

Dispatched on "never swept by the librarian" at registry HEAD 58adea0f. The primary
checkout was 33 commits behind origin, so the work ran in a detached worktree of origin/main
(32caa851). Three lanes ran: the three applications re-resolved against kp's committed tree
(0c6c9e39c; the working tree carries another session's edits and was not read), a
counter-evidence lane over seven claims, and a blind training-data lane that never saw the
file. Depth stays L2: the standards' own text is paywalled (read from catalogue descriptions
and one secondary summary), several primary PDFs returned 403, and the SHRM 2025 release,
METR's two posts, the Danish NBER abstract, the ECB changeover page and the CAP code page
were the primary pages actually read.

**Landed (status stays `forged`; no new technique, nothing self-promoted):**
- **The 42-hour anchor is unsourced** (golden path, baseline technique, uncapped
  application). "About 23 h of screening and 13 h of sourcing per hire" appears on vendor
  pages with no study, is attributed variously to a consultancy (per hire) and a
  professional body (per week), and the 13 is elsewhere "per week per role". The 42 h
  default and its two components are now labelled an unsourced default. Not refuted as a
  number, only untraceable; no measured recruiter-hours-per-hire study was found.
- **Cost per hire has two standards the subject did not name.** ANSI/SHRM 06001.2012 (the
  application file said "06-0010"; the number is 06001): hire = accepted and started,
  interviewer and hiring-manager time inside the numerator, onboarding out. ISO/TS
  30407:2017: internal, comparable and hire-cost-ratio forms. SHRM 2025 benchmark
  ($5,475 non-executive, $35,879 executive; 2,371 members, unweighted) is an average of
  self-reports. A SHRM 2026 report with medians ($1,300 / $15,000, 4,657 respondents) was
  seen only in a search summary and is banked, not cited.
- **The measured record on AI time savings** now sits in the golden path with its n and its
  limits: METR 2025 (16 developers, 246 tasks, 19% slower, forecast 24% faster, believed 20%
  faster; the 2026 update calls its own newer data weak because tasks were withheld), the
  Danish NBER study (null on earnings and recorded hours, effects above 2% ruled out). No
  recruiter-time measurement of an assistant exists in what was found; the one randomized
  recruiting field study models recruiter hours (about 160 to 82) and its authors are the
  vendor's.
- **An hours-saved figure is gross** (golden path): the tool's own cost must be netted on one
  basis, and across currencies the never-sum rule means side by side, not one ROI. Derived
  from the existing rule; the blind lane reached it independently.
- **Techniques conditioned:** falling review time is a signal not a saving (automation-bias
  reviews, a 694-recruiter survey the authors themselves hedge); a discarded draft is cost
  beyond zero; a withdrawn currency keeps its stored label (Bulgaria, 2026-01-01 at 1.95583,
  euro sole tender from 2026-02-01); the minor-unit exponent belongs to the currency; a
  claim needs its basis (FTC 1984 substantiation policy and the 2024 sweep, UK CAP 3.7);
  an overlap rule for per-kind minutes.
- **Three applications re-pinned to kp 0c6c9e39c, `verified_on` 2026-09-29,
  `verified_against` node@24 / sql@3.** Every analytics.ts, channels.ts, EconomicsBoard and
  metric-pack line had moved; `automation-roi.ts` itself is unchanged since 2026-08-18. Text
  drift: the `:76` type comment gained a clause; the override sentence now lives at
  `automation-roi.ts:42-44`; the README passage is at `docs/features/analytics/README.md:445-452`.

**New facts read in the tree:**
- The mixed-basis incident is now a recorded reproduction (44-day time-to-hire in a 30-day
  window, 6 closed and 1 in cohort, ROI 100% against an honest 31%). Six times 31% is about
  186%, which only a cap turns into 100 - our arithmetic, flagged as such in the file.
- The manual-hours override is now end to end: row, call site, and a settings input on the
  panel (`AnalyticsAutomationPanel.tsx:178-184`).
- A third withhold-not-divide case: the role-scoped analytics tab withholds `channelSpend`,
  `costPerHire` and `computeCostPerHire` by name with a reason.
- Demo rows are excluded by a title-marker predicate (structural at the query, not at the
  row) and the size of the silence is now printed (`excludedSim`).

**Deviations recorded against the techniques (in the applications):**
- `auto_rejected` (5 min, "reviewing + writing a considered pass") is produced by the
  screen-wave *bulk* reject, so a one-gesture approval is booked as an item-by-item pass.
- Six event kinds added since 2026-08-20 all earn zero (the unknown-kind rule holding by
  control flow); whether `scored`, `matched` and `auto_rejected` overlap on one candidate was
  not resolved from the tree.
- The leadership readout shows cost per hire with "all time" and no as-of date, while the
  board and the metric pack date it. Spend is still CZK only, still no per-period spend, and
  the >100% breach is still not routed.

**Confirmed, untouched:** the confidence ladder, the counterfactual framing, the exclusion
list as the credible half, refusing a mislabelled per-decision cost, date-the-oldest-input,
the unbounded ratio, cost-per-hire as a denominator problem, and "hours saved is capacity not
cash" (the blind lane reached the last independently).

**Banked leads (single lane each, so not landed):**
- Recent periods read cheap because invoices post late, so the latest cohort is provisional
  (blind lane only). Return when a second lane or a cost-per-hire dataset shows the lag.
- The cost an AI interview shifts onto candidates (the one vendor-affiliated experiment
  reports 75% non-completion) as a term in the saving. Return when an independent study
  reports completion.
- ISO/TS 30421 (recruitment and turnover metrics) and 30427 (cost-metrics cluster) exist and
  were not read; return if the subject grows a turnover-cost edge.
- Whether an eye-tracking CV-screening study exists with a stated sample (the 2018 Ladders
  release states none; the 30-recruiter sample belongs to the 2012 study).

**Not evaluated:** the SHRM 2026 medians report; the standards' own text; the
`unknown`-currency handling in any consumer beyond kp; the emitters of the six new event
kinds. No consumer applies `never-sum-two-currencies` or `an-organisation-owned-manual-baseline`
as an application of its own (the baseline technique is covered inside the uncapped
application; the currency technique inside the dating one) - a fourth and fifth application
remain unwritten.

**Applied:** no new technique and no flipped golden-path rule, so no `applied.md` row is owed;
every change is a condition, a label or a citation.

**Impact:** none. A dry run of `build-registry-map.mjs` wrote nothing, and a grep of the
committed fleet maps (gigs has none) finds no pair for this subject (positive control: the same query
finds `recruiting-funnel-metrics` five times in kp's map). kp applies the subject in code, which
its map cannot see: the matcher pairs no context with it. That is a matcher lead, not a stale
verdict, so there is no `/conform --stale` queue entry. Map writes were skipped because a real
run would carry only unrelated churn into five projects, one of which (kp) holds unpushed
sibling work.

### 2026-09-29 - `/deepen`, second pass (dp-rce-0929)

Dispatched on "never swept by the librarian" at registry HEAD 069f130b. That finding was
stale: the primary checkout was 73 commits behind origin/main and 47 ahead, and origin already
carried the first pass (bdf71ef6) landed the same day. The pass therefore ran in a detached
worktree of origin/main (096d3d60) and landed only what the first pass had not. Lanes: the
three applications re-read against kp at f63450548 (committed tree; the working tree carries
another session's edits and was not read), a counter-evidence web lane over seven claims, and
a blind training-data lane. Depth stays L2.

**Convergence, stated as a result:** the web and blind lanes independently re-found what the
first pass landed (the METR belief-versus-measurement gap, the SHRM 2025 averages, the
unsourced 42-hour anchor, gross versus net). Those were verified and left untouched; the
uncapped-ratio technique also already absorbs the blind lane's opposite view (clamp the
display, keep the value), so it stands unchanged.

**Landed (status stays `forged`; no new technique):**
- Golden path: the gross-versus-net paragraph gains its materiality condition, computed per
  action kind (`minutes x rate / 60` against the recorded price of the inference behind one
  action).
- `node--per-action-manual-minute-estimates`: a three-case simulation on kp's own function
  (`applied: simulation`, `ab_verdict: not-better`: cost is 0.4-4% of the gross saving at
  recorded prices, so netting does not change kp's headline; the $5 boundary probe is the
  falsifier), and two deviations: the ROI panel prints the baseline with no default-or-set
  mark and no source for the 42 hours, and its headline converts hours to currency.
- `node--an-uncapped-ratio-as-a-denominator-alarm`: the breach has no display state; a 317%
  fixture would print as "about 317% of the ~42 h a hire takes by hand".
- NEW `react--date-every-derived-money-figure` (react@19): the blended cost per hire is dated
  in the compute panel and undated in the automation panel's leadership tile and CSV, because
  the automation panel's props carry the value and not the date. This is the subject's second
  stack.

**Banked leads (return conditions):**
- Realized versus theoretical hours (a holdout or volume-normalised pre/post as the way
  to measure a saving where a before exists; blind lane only). Return when a second lane or a
  customer with a measured baseline supplies the design.
- FTC substantiation of AI savings claims and the EU AI Act Annex III date move (2 Dec 2027,
  via the Digital Omnibus): law-firm commentary and search summaries only, not read at the
  source. Return with the primary texts.
- Cost per hire as a mean only (the standard's own definition) versus median plus segments
  (blind lane): not verified at the standard's text, which stays paywalled.

**Not evaluated:** the standards' own text; the SHRM 2026 medians; kp's working tree; any
consumer beyond kp.

**Applied:** one row in `librarian/applied.md` (simulation, `not-better`, kp).

**Impact:** none. A grep of the committed kp registry map finds no pair for this subject
(the matcher pairs no context with it, as the first pass found); no `/conform --stale` queue
entry. The map generators were not run: a real run would rewrite every fleet map with
unrelated churn, and kp holds unpushed sibling work.
