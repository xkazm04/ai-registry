---
domain: recruiting
subject: evidence-provenance-weighting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# evidence-provenance-weighting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ep-0929)

The Curator lane dispatched this from the registry's attention scan. There was no
subject note and no earlier pass: the subject had stood at revision 1 since the bundle
joined on 2026-08-21, and `check-currency` reported no row for it. The event was
measured in the tree. Seventy kp commits had touched the files the three applications
cite since they were verified on 2026-08-20, including one that rewrote the display
mapping an application describes.

Four lanes: web counter-evidence (eight claims), primary texts (six targets), a blind
training-data lane on ten claims, and a re-read of kp at `6b07c0f95`.

**Counter-evidence: nothing refuted outright; seven conditioned, one confirmed.**
- **The ladder ranks fakeability, not validity.** All three lanes. Sackett, Zhang,
  Berry & Lievens 2022 was read from the full text: work samples .33, structured
  interviews .42, years of experience .07. Van Iddekinge et al. 2019 gives .06. 29
  CFR 1607.14(C)(6) was matched on eCFR. The professional rung is now earned by
  described work, not tenure.
- **The observed rung needs attestation.** Counter and blind lanes. FBI IC3
  I-072325-4-PSA (2025) was matched verbatim, and it is the same PSA dp-dn-0929 cited.
  The interviewing.io experiment found a 73% pass rate with verbatim AI answers, and
  no interviewer raised cheating. A mint records its performer and its permitted
  tools.
- **Open source counts when attributable, and rung access is measured.** Counter lane:
  Checkmarx 2022, and Trinkenreich et al. 2021 (9.8% women). Blind lane: the 2017
  GitHub survey. We found no study measuring selection rates from OSS-weighted
  screening, so the access point lands as a measurement duty, not as a finding.
- **Certificates split.** Counter lane: Tamblyn et al., JAMA 2007. Blind lane: exam
  heterogeneity, licences as facts.
- **Unknown origin is not an unmapped category, and the floored share is a metric.**
  Counter lane: JobResQA 2026. Blind lane: flag for re-extraction and monitor by
  group. The simulation below supplied the case.
- **Ordinary-word skill names need the alias table at any length.** Blind lane, then a
  probe on kp.
- **"Cannot validate against old outcomes" is the naive check.** Counter lane:
  Lakkaraju et al. 2017 on contraction, and Li, Raymond & Bergman on exploration.
  Blind lane: an exploration slice. Primary lane: the selective-labels definition,
  from the full paper.
- **Confirmed: self-assertion at the floor.** Mabe & West 1982 (r = .29), Schmidt,
  Bourdage, Lukacik & Dunlop 2022 (1,893 applicants inflate harder-to-verify items),
  Becker & Colquitt 1992, and Harold, McFarland & Weekley 2006 (verifiable items keep
  their validity with applicants). All abstracts were rebuilt verbatim from OpenAlex.

**Not landed, as single-lane, unverified or unsourced:**
- Anderson, Warner & Spencer 1984 (bogus tasks). Neither lane could get the abstract,
  and the widely repeated "45%" figure is unverified.
- Hough 1984 (accomplishment record). No verbatim text.
- McDaniel, Schmidt & Hunter 1988's .45 for behavioural consistency. Sackett 2022
  excludes it as unauditable.
- The vendor cheating rates (Fabric 2026: 38.5% flagged, 48% technical).
- The résumé-lying surveys.
- The Highhouse 2022 dilution non-replication. We saw the title only.
- The blind lane's "recency should move the score, not only the record".
- The counter lane's "cap an unverified top-rung item in consolidation". It is covered
  by the attestation precondition, which stops the item reaching the top rung.

**The tree found what no lane asked.**
- **The segmented default was live.** kp's CV path minted "professional" for an
  experienced candidate's unplaced claims and "self_declared" for a student's, and it
  stored the result in the profile the scorer reads. The fix two months earlier had
  moved the scoring default and three call sites. This minting site predates it. The
  standard named the failure; it had not said the default must reach minting sites.
- **Five real rungs rendered as "unknown".** A 2026-09-17 fix for one fallthrough
  sent everything unnamed to "unknown". Its test used an invented slug.
- **The interview mint credits every must-have** on a construct average, with no
  per-skill answer.

**Convergence.** No new technique. Every flip landed as a condition, a section or a
step inside an existing technique. The monitoring procedures already have homes:
selection-rate testing in adverse-impact-and-proxy-neutrality, and the visible queue
in cv-parsing-and-career-reading. So the access and floored-share duties cross-refer
in prose instead of forking a technique.

**Applied** (ten rows in `applied.md`):
- **code, better:** kp `1ad9aa2df`, local and not pushed. The CV path now uses the
  shared floor. Red first, 3 of 5; after the fix, 5 of 5.
- **code, better:** kp `8ea9ae1a4`, local. Every emitted rung keeps its badge. Red on
  5 of 10 rungs, then 0; tsc clean.
- **simulation, not-better:** the floor against an unmapped category. The status quo
  was right on 2 of 3 cases and the floor on 1 of 3, and the technique gained its
  condition. The first run was a tie produced by an LRU cache, caught by the
  paired-tie rule.
- **simulation, better:** the ordinary-word alias gate. It blocked 4 of 4 false
  top-rung credits and cost one real mention.
- **unapplied:** attestation, professional-by-content, the certificate split,
  attributable open source with rung access, the floored-share metric, and
  contraction.

**Applications.** All three were re-verified to 2026-09-29. The React one was checked
against react@19, and its "seven display keys collapse into academic" deviation was
superseded by the regression and the fix. Line citations were moved to HEAD. One claim
was corrected: "`live_case.py` is the only path to observed" is true of the module, but
it holds two mints, and the second one credits every must-have.

## Impact

- **kp:** 2 contexts joined (`devcase-eval`, `results-detail-tabs`), both probable,
  both state unknown; 0 stale verdicts. No project carries a judged verdict on this
  subject.
- **The join missed the seams this pass fixed.** Neither the CV path
  (`pipeline/jobfit/pipeline.py`) nor the shared match types are joined, and kp's own
  commit hook reported the pipeline file as an "unmapped path, routed" to this subject.
  That is a lead for the map's grounding; it is not fixed here. It is the same miss
  dp-dn-0929 recorded.
- **Maps regenerated fleet-wide.** Twelve projects committed locally on their active
  branches, none pushed. gigs has no context map. kp's map carries the subject at
  revision 2.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: two code A/Bs with red-first tests on the real modules, two simulations |
| Last-pass yield | high: 7 conditioned, 1 confirmed, 2 code fixes, 1 not-better, 1 application claim corrected |
| Dry streak | 0 |
| Clocks | validity figures as of Sackett 2022; FBI PSA 2025; JobResQA 2026 (preprint). No vendor figure landed |
| Demand | kp only (joined through two contexts, the matcher unjoined) |

## Banked leads

- **kp's interview mint** credits every must-have on a construct average. Return: when
  kp enumerates per-skill answers (Gate 5).
- **kp's stored v2Profiles** carry defaulted "professional" claims that cannot be told
  from stated ones. Return: when kp recomputes stored profiles.
- **kp's unknown rung** sits at 0.6. Return: when kp queues "other" items or re-weights
  the rung.
- **kp's GitHub import** emits repositories as personal projects, not open source.
  Return: when kp can attribute a contribution.
- **The map join** above. Return: the next `/straighten` or manifest pass over kp.
- **The single-lane and unverified items** above. Return: a second independent source,
  or the Anderson 1984 PDF.
- **`test_pipeline_stages_sync`** fails at kp HEAD, from the baseline commit
  `5ef013f51`, unrelated to this pass. Return: kp's own gate pass.
