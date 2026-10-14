---
source: github:AgriciDaniel/claude-seo
kind: repository
url: https://github.com/AgriciDaniel/claude-seo
title: "An SEO skill suite for a coding agent: one technique, one application, three catches, two leads"
author: AgriciDaniel and contributors
words: 33057
extracted: 9
accepted: 1
declined: 0
leads: 2
already_covered: 5
untriaged: 1
dispatched: 0
applied: 1
shipped: 0
run_id: seo-0ctl14
siblings: 1
rescan_when: a release adds a scored rule to the templated-metadata or site-reputation scanner; or 8 weeks elapse (2026-12-09)
---

# claude-seo @ 4b99de2f: the marketing bundle already owned most of it

**Class:** practitioner build-walkthrough in repository form (vendor-neutral skill suite,
26 sub-skills, 60 scripts). Expected yield said before triage: catches, plus a small
number of instrument-shaped techniques. Domain constrained to marketing. Clone at
`4b99de2f7de7e7d5247042e5fb5b4ea9368ef734`, depth 1. Live siblings at start: 1 (a
harvest batch holding software-engineering subjects, no overlap). Fetches: 2 of 3.
Memory lane: not applicable.

**Swept, in order:** CLAUDE.md and the CHANGELOG (33,057 words across the docs read as
a whole; README 5,196 of them, read last); `skills/seo/references/quality-gates.md` and
the validate/act framework; the instruments `metadata_template.py`, `parasite_risk.py`,
`content_verify.py`, `content_quality.py`, `drift_compare.py`; the drift comparison rules;
the SERP page-type taxonomy; the 2.4.1 CHANGELOG "why" paragraphs. Not swept: the
extensions, the 61 test files, the seo-flow prompt library, the backlink and Google API
scripts.

**Design record / routing count:** not written as a record. The tree's decisions are
audit-skill design (severity ladders, advisory scanners), and the marketing corpus
models the forces of each; NONE count 0 (with 1 near miss, below). Stayed in intake.

## Triage

| # | Candidate | Prior art | Read | G/R/C | Decision |
|---|-----------|-----------|------|-------|----------|
| 1 | Unique descriptions can share one shape; measure it site-wide with a count floor and a share | on-page-and-metadata-craft (no technique at this stage) | real gap | 2/0/2 | **accepted**, technique + application |
| 2 | Section-level third-party-content risk scanner | none (0 hits for site reputation) | real gap, contested home | 2/2/2 (risk 0 + 1 contested home + 1 for the primary contradicting the tool) | untriaged lead |
| 3 | Location-page count thresholds (warn at 30, stop at 50, 60% unique) | local-page-doorway-prevention | catch | - | already covered, and the corpus says why these numbers are folklore (a spinner setting, no primary) |
| 4 | Claim extraction and citation-gap detection | civic claim-verification; marketing never-invent-proof | catch | - | already covered |
| 5 | SERP page-type mismatch severities | search-intent-classification | catch | - | already covered |
| 6 | Primary-source update ledger with an `unverified[]` partition so audits do not encode unconfirmed claims | competitor-facts-sourced-and-dated; provenance law | partial: ledger as instrument, not covered | 1/1/1 | untriaged |
| 7 | Drift rules by blast radius (17 rules, 3 severities) | diff-comparison (software); no marketing home | partial | - | lead |
| 8 | E-E-A-T scorecard weights 20/25/25/30 | none | the tool itself labels it an internal model with no published weights | - | already covered by label-convention-as-convention |
| 9 | Agent-readiness (llms.txt, robots content signals) | answer-engine-visibility application mentions it | catch; the repo records the engine ignores llms.txt | - | already covered |

## Leads

1. **Site reputation abuse is tested at the section, and the tool's signals are the
   exempt ones.** The scanner (`scripts/parasite_risk.py`) counts sponsored bylines,
   "Buy now" calls, affiliate parameters (including `utm_source=`) and a topical
   divergence between subfolders, and calls the subfolder the unit. The engine's spam
   policy (fetched 2026-10-14) defines the abuse as content published "mainly because of
   that host's already-established ranking signals", and lists as NOT inconsistent
   advertorial or native content that "shares material directly with readers", affiliate
   links, and third-party ad units. So topical divergence and non-integration are the
   test, and sponsorship and affiliate markers are not; a scanner scoring them
   over-flags exactly what the policy exempts, and a UTM parameter is not an affiliate
   signal at all. The section-as-unit and the region-dated enforcement are right.
   Return condition: a second independent source on the policy, or a home (a subject
   on engine spam policies beyond local pages; `local-page-doorway-prevention` owns the
   neighbouring two and its stated scope is service-by-area pages). Score was
   GAIN 2, RISK 0 plus 1 for the contested home = 1, and the source contradicting its own policy gains no points; 2-1 < 2, so untriaged by the gate.
2. **Page-state drift with severity by blast radius.** Rules 1-8 critical (schema
   removed, canonical changed or dropped, noindex added, H1 or title gone, status to
   error), 9-14 warning, with thresholds (H1 similarity below 0.5, a 20 percent worse
   vital, a 10-point score drop). A baseline-and-compare monitor has no marketing home.
   Return condition: a connected project keeps a page baseline, or a second source.

## Contradictions worth keeping

- The repo's own CHANGELOG removed "a fabricated 'December 2025 watershed / 71-67-52%
  drops' claim" from its content guidance and labelled third-party figures as such: a
  field example of the never-invent-proof law failing in a skill and being repaired.
- The suite's location thresholds are the kind of number the doorway subject's golden
  path already calls a leak; the primary says no percentage exists.

## Landed

- Technique `on-page-and-metadata-craft/metadata-shape-uniformity-site-wide`, golden
  path list and one paragraph, application `node--metadata-shape-uniformity-site-wide`
  (anchors 3 of 3 held). Corroboration: primary fetched in-run (the engine's snippet
  guidance: identical or similar descriptions are not helpful) plus the tool's code
  opened. The tool disclaims any ranking claim; the technique carries that label.
- Apply: systedo-case, experiment, `unmeasurable` (one recorded brief; return condition
  is a stored batch of at least ten generated briefs). Seam chosen to falsify the closer
  check; it returned a language boundary (English closer list, Czech tree).
- Hazard seen: a sibling's regeneration baked this run's uncommitted technique into
  `HEAD`'s index before this commit; committing the content makes it consistent.
