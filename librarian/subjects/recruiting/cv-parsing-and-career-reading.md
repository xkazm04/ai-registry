---
domain: recruiting
subject: cv-parsing-and-career-reading
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# cv-parsing-and-career-reading

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-cv-0929)

Dispatched by the Curator lane from the registry's attention scan. There was no
subject note and no earlier pass; the subject had stood at revision 1 since it
was forged on 2026-08-21. No clock had expired (`check-currency` reported no
row for it). The event was measured in the tree: 132 kp commits had touched
the files the three applications cite since they were verified on 2026-08-20.

Four lanes: web counter-evidence (nine claims), primary texts and empirical
studies (six questions), a blind training-data lane, and a re-read of kp at
`bc82cb703`.

**Counter-evidence: one number removed, six conditioned, two confirmed.**
- Removed: "a few percent of intake in most systems" (the degraded rate). No
  trustworthy measurement exists; the technique now says to measure per slice.
- Conditioned: "deterministic first, model second". What the ordering protects
  is finding before judging, and checks the model cannot author. OmniDocBench
  Table 5: all eight systems read complex multi-column pages in worse order than
  single-column ones, and layout-aware pipelines did best. olmOCR: the page
  image alone "was prone to models completing unfinished sentences". So a page
  reader may read first if anchored by the text layer. Verification never runs
  against the model's own transcription.
- Conditioned: "total experience is the union of intervals". The union is the
  calendar ceiling. OPM prorates part-time work ("20 hours per week for a
  12-month period ... 6 months") and caps concurrent credit at "1 year of
  experience for any 12-month period". 2013/55/EU reads "full-time or
  equivalent part-time pursuit". OPM also credits unpaid work like paid.
- Conditioned: "midpoint for year-only ranges". Carry bounds, and test a
  threshold on the bound that favours the candidate. Imputation practice
  (ADaM, via admiral) flags every imputed date and imputes adverse-event starts
  "as the earliest date of all possible dates".
- Conditioned: "everything is optional and nothing is defaulted". Every key is
  present, nullable or with a status, and null must be reachable. Strict modes
  require every property ("emulate an optional parameter by using a union type
  with null").
- Conditioned: span verification and the grounding gate. Zhang et al. 2026
  (about 200K real resumes): "approximately 1% of resumes contain hidden
  prompt injections ... more than 90% of injected prompts do not use explicit
  instructions". A check run on invisible text confirms nothing.
- Conditioned: the injection fence. Hines et al. 2024: delimiters "reduce ASR
  by about half", while datamarking takes it "from approximately 50% to below
  3%". The authors "do not recommend" delimiting alone.
- Confirmed: gap length must not feed a score. The EEOC 2022 technical
  assistance gives the gap chatbot as a disability screen-out (the text
  extracted from the archived PDF).
- Confirmed, one condition noted: "present" resolves against the document's
  own date.

**Primary texts, all re-matched by this session with curl and pypdf.** The
quotations above were matched against raw fetched text or PDF extraction, not
fetch summaries. The sources were: OPM (the qualification-policies page), the
Publications Office's CELEX resources for 32013L0055 and 32016R0679, arXiv
abstract and HTML pages, the Azure structured-outputs page, the admiral
vignette, and the EEOC PDF. One sentence was drafted on a lane's word and cut
before the commit: that the widely repeated ATS rejection figures "trace to
sales material". It was not re-verified here.

**Convergence.** No new technique. Evidence-by-pointer (the model returns line
ranges into an indexed text, and the pipeline slices the quote) reached the
counter and primary lanes, but both may rest on one paper (arXiv 2510.09722).
The blind lane kept verbatim quotes plus offsets. It was folded into nothing
and banked below. Three corrections converged across independent lanes:
load-weighting (primary, counter, blind), bounds (counter, blind), and
required-with-status (counter, blind).

**The tree lane's finding that became the pass's code row.** kp's `a5b961444`
records that guessing a code page by "more Czech letters" misread French. That
commit is about decoding. A harness on kp's `repair_text_encoding` found the
same bias inside this technique's own recommended election:
- one table key has five preimages (Ł Ń ň Ő Ř) and was mapped to Ř;
- in kp's own Czech copy it was right 50 of 232 times;
- "Plzeň" came back "PlzeŘ" and "Łódź" came back "ŘódĹş";
- clean German, Romanian and Hungarian text was untouched.

The technique gains two conditions: a key with several preimages is
invention, and a home-language score resolves ambiguity toward home.

**Landed** (e9e89361):
- the golden path, four conditions;
- `text-extraction-damage-and-repair` (the election conditions; the reading
  step);
- `structured-extraction-contract-with-refusals` (the schema half, the fence,
  verification against text the model did not write and visible text only,
  completeness reconciliation);
- `tenure-and-date-range-reading` (bounds, load);
- `degraded-intake-as-a-visible-queue` (the number removed, the proof split,
  the GDPR Art. 16 channel).

All three applications were rewritten against kp HEAD.

**kp, measured against the first reading** (tree lane, spot-checked by this
session line by line):
- About half the citations had moved.
- Two differs-bullets were stale. Reading order is now repaired where a gutter
  proves it (`f6570eaee`, which cites this technique by name; 4 of 35 local
  PDFs repaired). Degraded entries are held out of the automated sweep, and
  unattended rejection is retired.
- The merge moved into one filing core with a proof split. It became a
  condition upward.
- The dedupe key stopped embedding the email in clear.
- The CV fence now neutralises markers the document contains.
- New deviations: no schema is sent (mime only); a truncated reply is salvaged
  without being marked degraded; skills are verified against the model's
  transcription; accent-insensitivity is claimed in a docstring and absent in
  code ("Řízení projektů" is withheld against "rizeni projektu", measured); and
  unrecognised provenance defaults to "professional" for experienced
  candidates.

**Applied** (6 rows in [[applied]] and 6 in kp's `.ai/applied.jsonl`, kp
`004f0b475`):
- code, better: the ambiguous table entry is removed (kp `0235e7a33`, local),
  pinned by a one-preimage test that fails on the old table;
- experiment, not-better: bounds moved 0 of 18 employment decisions on seed
  histories, so the technique gained the at-the-threshold condition;
- simulation, better: the contract conditions on 3 of 3 paths. The experiment
  arm tied because seed transcription equals the text layer 66/66;
- simulation, better: the proof split on 1 of 3 paths, with its cost named;
- unapplied: load-weighting (no record states a load);
- unapplied: visible-text checks (the authenticity subject's seam).

## Impact

The map was regenerated at registry e9e89361 and committed locally in all
twelve mapped projects: ascent e1fae29e, athena-everywhere 7cda669, goat
aed27ef, gravitone 338dd08, kp 490eda281, personas-web 24908da (on its active
branch `revamp/stage-fit`), personas 6f8b7a4e3, pof 391fd261, politicas
f013953, pumper 6337c97, systedo-case 818a8b34, tracklight 99cb48a. None was
pushed: kp main is 13 ahead of origin, 10 of those another session's.

kp has **2 contexts** on this subject, `cv-extraction` and
`tests-cv-extraction` (probable), both state `unknown`, so there are **0 stale
verdicts**. No other project joins it.

## Open leads

- **cv-authenticity-screening: cite the production measurement.** Zhang et
  al. 2026 (arXiv 2605.28999, about 200K real resumes, about 1% hidden
  injection, more than 90% data only, detection falling from about 1.2% to
  0.67%) is not cited anywhere in the corpus. Its hidden-text technique is
  the owner. Return: that subject's next pass.
- **Evidence by pointer.** The model returns line ranges into an indexed
  linearisation of the text layer, and the pipeline slices the quote.
  Paraphrase becomes impossible, and the check reduces to relevance. Return:
  a second independent source, or a kp A/B at the span-verification seam.
- **Accent folding in span verification (kp).** The seam is exact:
  `taxonomy.normalize_text` is shared, so an accent-folded comparison key
  belongs in the verifier only. Measure withheld-then-confirmed claims on
  diacritic-free CVs. Return: when the ats module is next changed.
- **Unknown provenance lands high (kp).** `pipeline.py:755` defaults an
  unrecognised claim to "professional" for experienced candidates. The
  provenance technique says floor. Return: with the provenance-weighting
  subject's next pass, which owns the ladder.
- **"Present" from the processing clock (kp).** The regex fallback documents
  and tests clock resolution as a feature, and the keyless draft does the
  same. Both already accept an `as_of`, and the callers pass none. Return: a
  code row the next time either builder is touched.
- **The regex fallback counts education ranges as experience (kp).** Found by
  the bounds experiment (the single tier change). Return: with the item above.
- **Stated years parser (kp).** It takes the upper bound of a range ("5 to 8
  years" gives 8, pinned by a test), counts "před 5 lety" ("5 years ago") as a
  capture, and reads no months or "since". The keyless draft lets a stated
  figure beat computed tenure. Each is a deviation from
  `multilingual-experience-quantity-parsing`. Return: that technique's first
  application.
- **Extractor version (kp).** A new instance: the job-seeker CV table reuses a
  cached draft by content hash, with no reader version in the key. Return:
  the first extractor change that should re-run old records.
- **AI Act classification of a pure extractor.** The draft Commission
  guidelines (19 May 2026, para 253) treat converting formats and classifying
  degrees "without applying evaluative weight" as a possible preparatory task
  under Art. 6(3)(d). The NYC rule excludes tools that "convert a resume from
  a PDF". This came from the primary lane and was not re-matched by this
  session. Return: the multi-jurisdiction subject's next pass (it also still
  carries the stale 2 August 2026 Annex III date banked by dp-csh-0928).
- **Presentation-invariance regression.** Gate parser changes on the flip rate
  of downstream decisions across layout variants (arXiv 2609.16517, per-axis
  layout flip 0.472, called directional by its authors). This came from one
  lane and was not re-matched. Return: a second source, or a kp harness.
- **Job-blind extraction.** The blind lane only: an extractor that sees the
  job description biases what it drops. kp's analysis call carries the JD.
  Return: a second lane or a measurement.

## Declines

- **A new technique for evidence-by-pointer.** Declined for convergence. Two
  web lanes may share one paper, and the blind lane did not reach it. It is
  banked.
- **A new technique for load-weighted crediting.** Converged three ways, but
  it is a condition on the tenure technique, not a separate method. It was
  placed there.
- **Visible-text reconciliation as this subject's technique.** It belongs to
  `cv-authenticity-screening` (hidden-text-and-smuggling-detection). This
  subject carries only the consequence for its own checks.
- **The primary lane's "reorder when a measured gain proves it" as a
  correction.** The technique already says to repair where you can prove it.
  The geometric and measured forms of proof were added as a clarification,
  not a flip.
- **Re-processing obligations under the AI Act.** The primary lane found no
  text requiring re-running prior outputs, and the technique's obligation
  stands on accuracy grounds. It was not strengthened on an unverified legal
  reading.

## Source classes (this pass)

- **Regulator and standards text** (OPM, EU directives, GDPR, EEOC): every
  accepted legal claim came from here, matched verbatim.
- **arXiv abstracts and HTML full text**: rich and checkable, but fetch
  summaries misreport numbers. The primary lane's 2510.09722 "40-point gain"
  is the paper's own error (4 points).
- **Vendor documentation** (structured-output modes): authoritative for API
  behaviour. The origin vendor's page redirected without the section, and the
  Azure documentation of the same mode was the one matched.
- **Blogs and listicles on ATS parse rates**: declined. No method behind any
  number.
- **The fleet tree**: the highest-yield lane again. Two conditions upward (the
  proof split, the election bias) came from reading real code.
