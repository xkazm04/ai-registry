---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: draft-live-and-closed-as-distinct-states
stack: process
status: forged
verified_on: 2026-09-29
refresh_by: 2027-03-29
---

# Hold states, time-to-fill clocks, ghost-posting figures and retention law, as read on 2026-09-29

The technique changed on this date in five places. This page holds the product names,
survey names and legal citations those changes rest on, with how each was read, so the
upper layers can stay free of them. `refresh_by` is six months out: the ghost-posting
law is moving (one state bill pending, one province in force), and the federal
contractor regulations are mid-rescission.

**How to read the quality marks.** *Text* means the source's own words were read on this
machine. *Summary* means a fetch tool summarised the page or search results were read,
so figures and quotes are unverified against the page. *Lane* means a research lane
reported reading it and the claim was not re-read.

## Hold as a state

| Product | Reading | Quality |
| --- | --- | --- |
| Workday | "Freezing temporarily puts a job requisition on hold." Candidates in it can still be moved along the process but not into Ready for Hire. If a frozen requisition remains posted, candidates can continue to apply; unposting can be added as a step of the freeze process. | Summary (page updated 2026-07-10) |
| Oracle Fusion | *Suspend* moves the requisition to "Open - Suspended". It needs a dedicated privilege. While suspended a user cannot create an offer or close the requisition; resuming does not send it for a second round of approvals. | Summary (no version shown) |
| SmartRecruiters | The Jobs API status filter accepts `ON_HOLD` beside `CREATED`, `SOURCING`, `INTERVIEW`, `OFFER`, `FILLED` and `CANCELLED`. | Search summary of the API reference |
| Workable | On Hold is a status for temporarily paused requisitions (for example a hiring freeze) and hold time is excluded from time to fill; Canceled means closed without a hire. | Lane, URL not retained |
| Greenhouse, Ashby | Three statuses only: Draft, Open, Closed (Greenhouse also shows Open with approval pending). One lane reported a Greenhouse "On Hold" status from a help-centre sentence; the second lane, reading the status pages, did not find one. Treat as unresolved. | Summary |

The reading that follows: the golden path's "three states, the rest are reasons"
survives in two products and fails in four. What survives everywhere is the test (a
state earns its place by its permission set), which is what the technique now says.

## Time-to-fill clocks

Greenhouse computes time to hire from the open date of each *opening*, and Workable
excludes hold time (Summary and Lane). Two guides attribute "starts at requisition
approval" to SHRM and to ISO 30414; neither standard was opened (Summary, secondary),
and two other sources say the start varies between approval and posting. The
technique therefore tells the reader to name the clock rather than asserting one.

## Ghost-posting figures

- **A recruiting platform's own data, second quarter of 2024:** 18 to 22 percent of
  posted jobs classed as ghost jobs each quarter; about 70 percent of 7,500-plus client
  employers posted at least one, and about 15 percent did so regularly, with half of
  those clients' jobs going unfilled (Greenhouse, *State of Job Hunting* report,
  published 10 December 2024). The definition is unpublished. Summary.
- **A survey of hiring managers, published 18 June 2024:** 1,641 recruited, 649
  completed; the panel was managers aged 25 or over in firms of ten or more with
  household income of $75,000 or more. 40 percent of firms had posted a fake listing
  within a year and 3 in 10 had one active. Reasons given: appear open to outside
  talent 67 percent, appear to be growing 66, relieve workload 63, replaceable
  employees 62, keep résumés on file 59. Active duration: 6 percent under a week to 9
  percent a year or more. Some search summaries misquoted the percentages; these are
  the page's own figures as summarised. Summary.
- **Hires per posting** fell from 0.75 in 2018 to below 0.5 in 2023 (Revelio Labs,
  published 31 October 2023, updated June 2026); the authors say a falling ratio "can
  have many reasons". A JOLTS openings-versus-hires gap of 28 to 32 percent (a
  résumé-site report, 7 November 2025) is a stock-versus-flow comparison and weak
  evidence. Summary.
- **No study located** separates accidental (forgotten) requisitions from deliberate
  ones, and no peer-reviewed or central-bank work on ghost jobs turned up.

## Vacancy disclosure

- **Ontario.** Employment Standards Act, 2000, s. 8.5(1) (Text, read from
  `ontario.ca/laws/statute/00e41`): every employer that advertises a publicly
  advertised job posting shall include in it "a statement disclosing whether the posting
  is for an existing vacancy or not", in force 1 January 2026. The exemption for
  postings restricted to existing employees and the exclusion of employers under 25 are
  in O. Reg. 476/24 (Lane; the regulation page could not be retrieved here).
- **New York S8877.** Reported passed by both houses on 2 June 2026, for employers of
  100 or more; its text is said to require a bold statement that the posting is not for
  a current vacancy and removal within two weeks of a position being filled. Not
  reported signed at the last check. New Jersey S2136 and California AB1251 are
  proposals. No federal statute; no UK, EU or Australian statute located (Lane).

## Retention

- **29 CFR 1602.14** (Text, eCFR version dated 2026-09-01): any personnel or employment
  record made or kept by an employer, including application forms and other records
  having to do with hiring, "shall be preserved by the employer for a period of one year
  from the date of the making of the record or the personnel action involved, whichever
  occurs later", and until final disposition once a charge is filed. "Requisition" is
  not in the text.
- **41 CFR 60-1.12(a)** (Text, same version): not less than two years, or one year for a
  contractor with fewer than 150 employees or a contract under $150,000; the listed
  records include "job advertisements and postings, applications, resumes". A Federal
  Register final rule dated 2026-08-21 is reported to rescind Parts 60-1, 60-2 and 60-3
  effective 2026-10-26 (Summary; the PDF would not extract). 41 CFR 60-3.4 asks for
  applicant-flow data by group, not a requisition file.
- **GDPR** (Lane, from the EU Publications Office's consolidated text): Art. 5(1)(e),
  identifiable data "for no longer than is necessary"; Art. 17(3)(e) lets a controller
  refuse erasure for the establishment, exercise or defence of legal claims.
- **Regulator practice on a rejected candidate** (Summary throughout): about six months
  in Germany (the general-equality-law claim window), about six months in the UK (the
  Equality Act claim window), up to two years from last contact for a pool in France,
  six months to a year as typical employer practice in the Czech Republic where no
  general rule was found. Check the national authority before adopting a default.
