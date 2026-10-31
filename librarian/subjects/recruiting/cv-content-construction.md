---
domain: recruiting
subject: cv-content-construction
last_touched: 2026-10-31
touched_by: intake
dry_streak: 0
---

# cv-content-construction

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-31 - intake apply: relevance-ordering-and-recency-compression (run intake-apply-rorc-1031)

First application of the technique. The seam was chosen to falsify "kp already holds it".
The budget table, ranking by outcome and one-line compression with dates kept were all
present. The newest-first rule was missing. kp's CV builder kept the roles in the order
they arrived, and its budget read the line position as recency. An oldest-first probe
printed 2009-2012 first with 5 bullets and the current role last (A). After the fix it
prints the current role first, with 5/4/2 bullets (B). The floor held: 162 job-seeker
tests, tsc and the pre-push gate. Verdict `better`, kp e2a1b2e0b on origin main. The
technique gained the decision rule "budget by a role's dates, never by its line". The
dispatching finding ("single stack (process)") is not reduced: this is a fifth `process`
application, and kp is still the only fleet project that declares recruiting.

### 2026-10-22 - intake apply: career-change-framing (run intake-apply-ccf-1022)

First application of the technique. Code A/B on kp: the tailoring pass gathered the
career changer's projects and always printed them after the experience. The first fix
(titles only) was refuted by kp's own pre-push agent review. On the tree's reference CV
the teacher's paid role already holds the data work, and a course was moved above it. The
corrected rule asks for titles first, then evidence strength. Three arms: the teaching-only
changer read 14 lines before its bridge on A and 9 on A' and B. The reference teacher
flipped wrongly on A' and was correct on B. Verdict `better`. The technique gained a
two-question decision rule; the refuted title-only half is named in it.
The scan finding that dispatched this run ("single stack (process)") is
not reduced by it, because this is a second `process` application. No other fleet project
declares the recruiting domain (checked with loadFleet), so a second stack waits for one.

### 2026-09-26 - forged, with its sibling `cv-presentation-and-parseability`

Proposal: `docs/subject-proposal-cv-construction-and-presentation.md`. New category
`candidate-self-presentation` (the bundle root is now at its ten-folder cap). Raised by a
consumer whose CV builder's operator called the boosted output "mediocre"; the bundle had
only the reading side of a CV.

Research: four lanes (content craft; presentation and parsing; market conventions and
law; AI-era and counter-evidence), about 90 searches and fetches, plus a director
spot-check of the three least familiar load-bearing citations (all three held; one
detail corrected - the human checkpoint in the 2026 fabrication study eliminated invented
*identities*, and still left item-level fabrications in 75% of outputs).

## Sources the standard rests on (grade, n, counter)

- Wiles, Munyikwa & Horton, "Algorithmic writing assistance on jobseekers' resumes
  increases hires", NBER w30886 (2023) / Management Science (2025). Randomized field
  experiment, n=480,948 new jobseekers (2021). Non-generative error-highlighting; +8% hired,
  +10% wage, no drop in employer satisfaction; non-native writers gained most. Strong.
  Limit: one platform, new entrants, partial equilibrium.
- Takano, "Mitigating Fabrication in Multi-Stage LLM Pipelines for Hiring", arXiv
  2608.26171 (Jul 2026, rev. Sep 2026). 180 runs, 10 synthetic CVs. Unsupported claims in
  96.7% of unguarded outputs (6.8 each), 50% with prompt guardrails (0.92 each), human
  checkpoint 75% item-level but zero identity fabrications. Weak-moderate (small,
  synthetic, one author); direction consistent with the hallucination literature.
- Cui, Dias & Ye, "Signaling in the Age of AI: Evidence from Cover Letters", arXiv
  2509.25054 (2025). Difference-in-differences on one large platform: after an AI letter
  tool, the alignment-callback correlation fell 51%; the tool itself raised alignment and
  callbacks. Moderate (working paper).
- Galdin & Silbert, "Making Talk Cheap", arXiv 2511.08785 (2025). Post-LLM loss of the
  tailoring premium; structural model predicts a less meritocratic market. Moderate; the
  counterfactual numbers are model output.
- Kristal, Nicks, Gloor & Hauser, Nature Human Behaviour 7:211-218 (2023). Preregistered
  UK audit, n=9,022: years-in-role instead of dates, +8% callbacks without gaps, +15% with.
  Strong within scope (UK, returners' profile).
- Kroft, Lange & Notowidigdo, QJE (2013), ~12,000 CVs: duration dependence of gaps.
  Eriksson & Rooth, AER (2014): only a current spell of 9+ months hurts. Counter: Farber,
  Silverman & von Wachter, AER P&P (2016): no duration effect; interim low-level jobs hurt.
- Neumark, Burn & Button, JPE (2019), 40,000+ applications: age discrimination, strongest
  for older women. Counter on cue removal: Derous & Decoster, Frontiers in Psychology
  (2017), 610 HR professionals - omitting date of birth lowered ratings.
- Leung, American Sociological Review 79 (2014): related, incremental job moves read as
  coherent, unrelated jumps as erratic. The only academic anchor for career-change framing.
- Zell & Krizan, Perspectives on Psychological Science 9 (2014): self-assessed ability vs
  performance r~.29 over 22 meta-analyses. Anchor for the skill-rating rule (Dunning-Kruger
  framing deliberately avoided - contested as partly statistical artefact).
- Wingate, Robie, Powell & Bourdage, IJSA 33 (2025), n=183 co-op students: detail,
  clarity, structure correlate with interviews and placement. Moderate, correlational.
- Piopiunik, Schwerdt, Simon & Woessmann, EER (2020), 579 HR managers: signalled evidence
  (grades, activities, credentials) moves selection.
- Henle, Dineen & Duffy, J. Business & Psychology 34 (2019): fabrication / embellishment /
  omission taxonomy; fabrication predicts lower performance and deviance.
- Recruiter word-preference survey, 2,201 US hiring managers (2013, commercial job board):
  outcome verbs liked, self-descriptors disliked (max 38%). Moderate as stated preference.
- Xu, Li & Jiang, "AI Self-preferencing in Algorithmic Hiring", arXiv 2509.00462:
  model screeners preferred own-family text 67-82%. Moderate (preprint). Not re-fetched.
- Doshi & Hauser, Science Advances (2024): AI-assisted writing individually better,
  collectively more similar. Not a CV study; inference by analogy.

## Claims tested and found weak (kept out of the standard)

"Quantified CVs get N times the callbacks" (no traceable method); "N% of recruiters
distrust functional CVs" (untraceable); XYZ/STAR as validated formulas (practitioner
heuristics); "one page always" (the two-page vendor simulation, 482 reviewers / 7,712
choices, confounds length with detail); "85% of applicants lie" (the source measured the
share of *employers* finding any discrepancy); "tailored CVs get 3x interviews" (vendor
observational data).

## Open leads

- A deterministic `after`-screen for rewrite proposals (new numbers, proper nouns, title
  words, posting terms) is specified in the technique but has no measured false-positive
  rate; the first consumer to build it should report one.
- No study tests career-change CV formats directly; if one appears, it decides whether the
  hybrid rule stays convention or becomes evidence.

## Declines

None.
