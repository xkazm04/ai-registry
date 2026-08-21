---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: age-proxy-detection
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [reviewing posting copy for age signals, a posting says digital native or recent graduate, a role's experience line is doing the work of an age filter]
---

# Age proxy detection

The concern: phrases that carry no requirement and communicate an age band.
Age is the protected characteristic most often excluded by accident, because
the excluding phrases are cheerful, common, and usually written by someone who
would never write an age limit. They are also the phrases that regulators and
claimants find first, precisely because they are searchable strings.

## The families

- **The nativity family** — *digital native*, *born with a phone in hand*,
  *grew up online*. States a birth cohort. Whatever competence was intended
  (fluency with a class of tools, learning software without documentation) is
  statable directly and testable; the nativity phrasing is not.
- **The recency family** — *recent graduate*, *fresh out of university*, *new
  grad*, *graduating in the next year*. Excludes career changers, returners
  after a caring break, and anyone who studied earlier — populations that
  correlate with both age and gender, so the phrase costs twice. The
  legitimate underlying constraint is almost always *early-career* or a
  structured programme with an entry level, which is statable without a date.
- **The vitality family** — *young dynamic team*, *energetic*, *youthful*,
  *high-energy culture*, *fits our young team*. Describes the incumbent
  population as a criterion. This one is doubly bad: it signals age, and it
  states that similarity to the existing team is the selection basis.
- **The seniority-ceiling family** — *maximum N years of experience*, *not
  overqualified*, *no more than two prior roles*. An upper bound on experience
  is an age proxy with the arithmetic left as an exercise, and unlike a lower
  bound it almost never has a defensible rationale.
- **The tenure-floor family** — a very high minimum years figure used as a
  proxy for competence. This one belongs mostly to requirement-inflation
  control, which owns the audit of a years-of-experience line; the piece that
  belongs here is that the *advertised* number is the one the reader
  self-selects against, so an inflated figure in the text excludes even when
  the screening rule behind it is lenient.

## Procedure

1. **Match the phrase families in the document's language**, including the
   inflected forms of each — an age proxy in an inflecting language appears in
   several endings and a lint that only knows the citation form finds none of
   them.
2. **Also match the numeric forms**: an upper bound on years of experience, an
   age in years anywhere in the requirement text, a graduation-year window.
   These are structurally detectable and are the highest-severity hits.
3. **Report the underlying competence, not just the ban.** Every finding
   carries the restatement: *digital native* becomes "comfortable adopting new
   tools without formal training"; *recent graduate* becomes "early-career;
   no prior professional experience required"; *young dynamic team* becomes
   the actual team facts (size, how it works, what it is building).
4. **Escalate the numeric hits.** A stated maximum years figure or an age
   figure is not a wording finding — it is a policy problem in the requisition
   and the finding should say so, naming the person who must decide, rather
   than inviting a rewrite that hides the same rule in prose.

## Decision rules

- **When the phrase has a competence behind it, state the competence.** Almost
  every hit in the nativity and vitality families does.
- **When the phrase has an age behind it, the posting does not carry it.** Per
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds),
  an advertisement says what the role actually requires; an age band is not a
  requirement the record holds, and rewriting it into an insinuation is worse
  than stating it, not better.
- **An upper bound on experience is a finding by default.** There are narrow
  legitimate cases — a funded early-career programme whose eligibility is set
  by the funder — and they are handled by an explicit, recorded exemption, not
  by weakening the rule.
- **A lower bound is a requirement question, not an age question.** Route it
  to the requirement discipline rather than duplicating that audit here; this
  technique's interest ends at whether the advertised figure deters readers the
  screening rule would have accepted.
- **The finding is a suggestion about text, not a determination about the
  employer.** Per [inference must look like
  inference](../../../_laws.md#inference-must-look-like-inference), a phrase match
  never renders as "this posting discriminates" — it renders as "this phrase
  is read as an age signal; here is what you probably meant".

## When not to use it

- **Not on programme names or legal text.** A named graduate scheme, an
  apprenticeship statute reference, or a benefits section describing pension
  eligibility will contain age-adjacent words legitimately. Scope the check to
  the descriptive and requirement sections, or accept that the exemption list
  is part of the technique.
- **Not as a rewrite that hides the rule.** If the hiring decision genuinely
  intends an age filter, the remedy is to stop, not to launder the wording.
  A posting that reads clean while the screening rule filters by graduation
  year is a worse position than the honest version, both ethically and
  evidentially.
- **Not as the only age check.** Wording is the cheapest surface. The
  measurable one is the age distribution of applicants against the qualified
  population, which the funnel-metrics discipline owns; a clean lint and a
  skewed pool means the exclusion moved somewhere the text cannot see.
