---
layer: application
type: application
subject: candidate-self-scheduling
technique: adjustments-asked-at-the-booking-step
stack: spec
status: forged
verified_on: 2026-09-28
refresh_by: 2027-03-28
source: US/29-CFR-1630+US-EEOC/RA-guidance-2002+UK/EqA-2010+UK-ACAS+US-JAN+W3C/WCAG-2.2
---

# The adjustment ask as the texts write it

**Pin.** Retrieved 2026-09-28. United States: 29 CFR 1630.2(o) from the eCFR
renderer (current as of 2026-09-01), and the EEOC's *Enforcement Guidance:
Reasonable Accommodation and Undue Hardship under the ADA* (issued 2002-10-17)
from `eeoc.gov`. United Kingdom: Equality Act 2010 s.20, s.60 and Schedule 8
paragraphs 5 and 20 from `legislation.gov.uk`, and two ACAS guidance pages
(`acas.org.uk/recruitment/interviewing-job-applicants` and
`acas.org.uk/reasonable-adjustments/asking-for-reasonable-adjustments`). The Job
Accommodation Network's employer guide to the hiring process (`askjan.org`).
WCAG 2.2 and its Understanding document for SC 2.2.1 (`w3.org`). Every quotation
below was matched against the fetched text after drafting. The clock is six
months because US guidance on applicants moved in 2025 (the EEOC's guidance on
software tools and applicants was withdrawn), and a second withdrawal would
change what this page may say about the US.

## Rule by rule

**The process is in scope, not only the job.** Confirmed in both jurisdictions.
29 CFR 1630.2(o)(1)(i) defines reasonable accommodation to include
"Modifications or adjustments to a job application process that enable a
qualified applicant with a disability to be considered for the position". The
UK duty to make adjustments reaches applicants through Schedule 8 paragraph 5:
the table names "A person who is, or has notified A that the person may be, an
applicant for the employment."

**Asking is lawful when it is about the process.** Confirmed. The EEOC guidance
(Q12): "An employer may tell applicants what the hiring process involves (e.g.,
an interview, timed written test, or job demonstration), and may ask applicants
whether they will need a reasonable accommodation for this process." The same
answer forbids the wider question before an offer: an employer "generally may
not ask an applicant whether s/he needs a reasonable accommodation for the job".
The UK's pre-offer health-question ban (s.60(1)) carries an exception in
s.60(6)(a) for a question "necessary for the purpose of ... establishing whether
a duty to make reasonable adjustments is or will be imposed on A in relation to
B in connection with a requirement to undergo an assessment". The technique's
"when not to use this" (process, not job) is this line.

**In the UK, asking is the expected practice, and not asking has a cost.**
ACAS: "By law you must ask anyone coming to an interview to tell you if they
need reasonable adjustments so they can attend." That is guidance from the
conciliation service, not statute text. The statutory mechanism behind it is
knowledge. Schedule 8 paragraph 20(1)(a) relieves an employer of the duty only
if it "does not know, and could not reasonably be expected to know ... that an
interested disabled person is or may be an applicant". An employer that never
asks has a weaker claim to "could not reasonably be expected to know". ACAS
also: "Job applicants can ask for reasonable adjustments for any part of the
recruitment process."

**In the US, asking is permitted and recommended, not required.** The EEOC's
applicant page puts the burden on the applicant to raise it. JAN's employer
guide recommends "accommodation statements and contact information on all
online postings, application forms, career websites, phone screen scripts, and
interview letters", adding that "Providing multiple contact methods (e.g., text,
phone, email)" makes requests easier. The technique rests the ask on the
candidate rather than on the stricter regime for this reason. The procedure's
"several routes" step is JAN's sentence.

**Telling the candidate what the round involves comes first.** Confirmed as
the EEOC's own order: tell applicants what the process involves, then ask. JAN
also advises giving information about how the interview will be conducted in
advance.

**A 7-day link needs no extend control; a hold timer does.** WCAG 2.2 SC 2.2.1
(Level A) exempts "The time limit is longer than 20 hours." The Understanding
document counts "the expiration of a window of opportunity for a user to react
to a request for input" as a time limit, and chose 20 hours "because it is
longer than a full waking day". A booking link measured in days passes. A slot
hold of minutes, or a session timeout inside the booking page, is a time limit
under 20 hours and needs turn-off, adjust or extend. This is why the technique
stops the invitation's clock while an adjustment is being arranged. The
accessibility standard does not require that for the link. The candidate's
process does.

## What no text says

No text read here names the booking step as *the* place to ask. The placement
is the technique's argument (the slot's shape is fixed there), converged
between a training-data lane that reached it unprompted and the guidance that
puts the ask in "interview letters" and at "anyone coming to an interview". The
routing rule (the request goes to someone outside the assessing panel) is
practice, not law, in both jurisdictions.
