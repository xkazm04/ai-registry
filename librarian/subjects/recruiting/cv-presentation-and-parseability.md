---
domain: recruiting
subject: cv-presentation-and-parseability
last_touched: 2026-09-26
touched_by: forge
dry_streak: 0
---

# cv-presentation-and-parseability

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - forged, with its sibling `cv-content-construction`

Proposal: `docs/subject-proposal-cv-construction-and-presentation.md`. The organising
rule - *reading order is content* - is the writing-side mirror of the career-reading
subject's text-extraction damage catalogue.

## Sources the standard rests on (grade, n, counter)

- Job-board eye-tracking study, 2012: 30 recruiters, 10 weeks, ~6 s first-pass decision,
  ~80% of fixation on name, current and previous title/employer, their dates, education.
  Unpublished method, commercial, ends in an advert for the publisher's rewriting
  service. 2018 update: 7.4 s, no n published; "columns hurt" asserted without comparison.
  Weak as a number, moderate as a pattern.
- Pina et al., Machine Learning & Knowledge Extraction 5(3):38 (2023): eye-tracking
  predicts advancing (AUC 0.767); time on experience and education among top predictors.
  Moderate; n not retrieved.
- Osanami Törngren et al., Frontiers in Sociology (2024), 40 recruiters: ~14.4 s dwell,
  gaze time not correlated with rating. Moderate.
- Arnulf, Tegner & Larssen, EJWOP 19(2) (2010), 90 raters: same content ranked lower in a
  creative layout. Moderate; one vacancy, one country, 2010 designs.
- Levitt, Lindner & Huh, International Leadership Journal 11(3) (2019), 200 real résumés:
  relevant, recent, continuous experience predicts interviews; formatting not coded.
- Applicant-tracking vendor support documentation (undated, retrieved 2026): tables,
  headers/footers, columns, text boxes, graphics, letter-spaced text listed as parse-failure
  causes; failure = manual entry, not rejection. Strong as a primary vendor statement.
- Parser vendor engineering blog (c. 2023): ML column detection raised well-rendered column
  CVs from 62% to 90% (~700 CVs; 12,000+ for regression). Strong that columns degrade
  parsing even in a top parser; ~10% still bad.
- Two-column extractor test (vendor that sells two-column templates, Aug-Sep 2026): 357
  runs, 7 open-source extractors, 17 templates; words ~99.5% recovered, structure dropped
  60%->35% on one extractor; a narrow sidebar lost the name. Moderate (conflict of interest,
  no commercial ATS tested).
- "75% rejected by ATS": traced to a 2012 sales claim by a vendor that closed in 2013.
  Myth. Counter-anchor for real automated filtering: HBS/Accenture "Hidden Workers" (2021) -
  criteria filters (gaps, credentials), not format.
- W3C WCAG technique PDF3 (reading order in tagged PDF); UK National Careers Service
  (11 pt or larger). Arditi & Cho, Vision Research (2005): no serif/sans legibility
  difference. Dyson & Haselgrove (2001): ~55 cpl better comprehension than 100 on screen.
- Lippens, Vermeiren & Baert, European Economic Review 151 (2023): 169 field experiments;
  callback ratios appearance 0.63, age 0.69, marital status 0.88, disability 0.59.
- Ruffle & Shtudiner, Management Science (2015), 5,312 CVs; López Bóo, Rossi & Urzúa,
  Economics Letters (2013), 2,540 CVs; Weichselbaumer, ILR Review (2020), 1,474
  applications (headscarf 4.2% vs 18.8%).
- Behaghel, Crépon & Le Barbanchon, AEJ: Applied (2015): anonymous CVs widened the
  minority gap in volunteering firms. Krause et al., IZA Research Report 44 (2012): the
  German anonymised-application pilot broadly equalised invitations (8,550 applications,
  not randomised).
- Legal anchors: EEOC pre-employment inquiry guidance; ADEA; UK Equality Act 2010 s.60 and
  Acas guidance (updated 30 Jun 2026); German AGG §§ 1, 11, 15, 22; Czech Labour Code
  § 30(2), § 316(4) and Act 198/2009; French Code du travail L1221-6, L1132-1; GDPR
  Art. 5(1)(c) and Recital 51 (a photo is not biometric data unless processed for unique
  identification; the inference extension to special categories is arguable, not settled).
- European CV standard format (editor since 2020): only name mandatory; photo, date of
  birth, gender optional; the official page still suggests a photo.

## Claims tested and found weak (kept out of the standard)

Precise seconds-per-CV figures; "ATS rejects two-column / PDF / creative CVs" (degrades,
does not reject); "DOCX always parses better" (no vendor documentation); font
"psychology" surveys; file-naming rules as a ranking factor; "most German employers
expect a photo" (the quoted recruiter figure is n=297 from 2016/17; the popular 37% figure
was applicants, not recruiters); "recruiters dislike the European standard format"
(career-blog only).

## Open leads

- No peer-reviewed benchmark of multi-column parsing across commercial systems exists; a
  consumer that builds the round-trip test could publish one on its own templates.
- Czech and German recruiter expectations on photos lack any representative survey.

## Declines

None.
