---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: funder-fact-taxonomy
status: forged
laws: [provenance-per-field]
shared_with: []
use_when: [deciding which applicant fields a readiness profile must hold, designing the schema for an applicant onboarding form, auditing why applications keep needing facts the profile lacks]
---

# Funder fact taxonomy

The technique is to derive the readiness profile's schema not from what the
application form designer imagines, but from the intersection of what funders
actually ask — and to classify each field by *how it is obtained and how it
fails*, because that classification, not the field's topic, determines the
collection UX, the validation, and the trust machinery each field needs.

## The four classes

1. **Registry facts** — registered name, jurisdiction, legal-form code,
   registry identifier. Property: exactly one authoritative source per
   jurisdiction; verifiable by lookup; a wrong value is disqualifying.
   Consequence: these fields deserve checksum/shape validation at input,
   live verification against the registry, and the strictest anti-guess
   posture in any autofill.
2. **Common-knowledge facts** — headquarters city and region, contact
   details. Property: any staff member knows them; the risk is not
   ignorance but *format drift*. Consequence: accept free text, derive the
   canonical form (a normalized region code) mechanically, and store both.
   Downstream eligibility and geography logic reads only the canonical form.
3. **Document facts** — latest annual revenue as filed, year of
   incorporation, audit status. Property: the true value lives on a specific
   line of a specific filed document the onboarding human rarely has open.
   Consequence: this class is the abandonment cliff of any hand-entry form
   and the highest-value target for automated lookup; and its parser must
   read human notation ("$1.2M", "620k") because the human who does supply
   it will copy it the way documents print it, not the way databases store
   it.
4. **Voice facts** — mission keywords, mission statement. Property: they
   are authored, not looked up; there is no external source of truth.
   Consequence: a lookup step may *propose* them (summarized from the
   organization's own materials, clearly marked as a proposal), but only the
   applicant's confirmation makes them true — and the statement, once
   confirmed, becomes the sole legitimate voice source for any generated
   prose.

## Procedure

1. Collect the questionnaires and attachment lists of the funder families
   you serve; take the intersection first (the canonical set), then the
   high-frequency union (the extended set). The canonical set is small —
   identity, location, financials, mission — and remarkably stable across
   funder families.
2. Assign every field one of the four classes. If a field seems to fit two,
   split it (revenue-as-filed is a document fact; "budget for the proposed
   project" is authored per application and does not belong in the readiness
   profile at all).
3. Declare the required subset explicitly, as data — a list the intake
   pipeline reads to compute what still needs human input. Required means
   "most funders will not accept an application without it", not "we would
   like to have it".
4. For each field, record provenance capacity in the schema itself: value,
   confidence, source. A field that cannot carry its source cannot
   participate honestly in autofill or review.
5. Keep attachments (financial statements, board list, bylaws, annual
   report) as *referenced documents with expiry awareness*, not as fields.
   The profile tracks that they exist and when they age out; it does not
   transcribe them.

## Decision rules

- **When a funder asks for a fact not in the taxonomy, decide whether it is
  organizational or per-application before adding it, because** the
  readiness profile stays useful only if everything in it is true for every
  application; per-application facts (project budget, requested amount)
  belong to the application, not the organization.
- **When two funders ask for "the same" fact in different forms** (revenue
  in local currency vs converted; region as name vs code), **store the
  canonical form once and render per funder, because** storing per-funder
  variants multiplies staleness surfaces.
- **When a field's class is document-fact, budget for lookup latency and
  design a skip path, because** the fields that require fetching filings
  dominate lookup time; a fast mode that fills identity + location + mission
  keywords first, deferring the deep-fetch fields, gets the applicant to
  value before patience runs out.

## When not to use

Do not build the taxonomy for a single-funder tool — if the system serves
exactly one application form, that form's own field list is the schema and
an abstraction layer over it is ceremony. And do not let the taxonomy grow
into a CRM: facts no funder asks for do not earn a place in the readiness
profile, however interesting they are.
