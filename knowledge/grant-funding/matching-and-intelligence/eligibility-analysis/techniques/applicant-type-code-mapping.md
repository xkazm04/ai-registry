---
layer: technique
type: technique
subject: eligibility-analysis
technique: applicant-type-code-mapping
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [normalizing who-can-apply data from heterogeneous sources, matching a non-nonprofit applicant against a code-based regime, an applicant category was silently misrouted]
---

# Applicant-type code mapping

Opportunity sources encode "who can apply" in incompatible dialects: a
federal-style clearinghouse publishes enumerated numeric category codes, its
own detail endpoint publishes a free-text eligibility description, curated
listings borrow the numeric codes, and other jurisdictions describe the
audience in prose — sometimes in another language. The technique collapses
all of these into one small canonical applicant-type vocabulary at ingest, so
the eligibility gate compares like with like regardless of source.

## The canonical vocabulary

Keep it small — on the order of eight types, not eighty: nonprofit,
government/municipal, education, small business, for-profit, individual,
tribal/indigenous, and an explicit *open-to-all*. The vocabulary is the schema
key that takes a matching product beyond its founding segment: a school
district, a municipality or a small business can only be matched to
opportunities *for them* if the corpus names their audience as a first-class
value rather than scoring everyone against the nonprofit set.

Two design rules for the vocabulary itself:

- **"Open to all" is a value, not an absence.** Unrestricted codes and
  "others" codes map to it explicitly, and the jurisdiction model appends the
  open codes to *every* entity type's eligible set — an unrestricted
  opportunity must pass for everyone without per-type special cases.
- **An empty result is unset, not a default.** When no code and no text rule
  matches, return the empty set and leave the field absent. Unknown codes are
  ignored, never guessed into the dominant class; the gate downstream renders
  an empty audience as *unknown*, which routes a human, not a rejection.

## Procedure

1. **Code table.** Map each source's enumerated codes to canonical types in a
   single explicit table (state governments → government; independent school
   districts → education; charitable-status and non-charitable nonprofits →
   nonprofit; unrestricted → open-to-all). Normalize code formatting before
   lookup — sources disagree about zero-padding, and `"5"` and `"05"` must
   hit the same row.
2. **Guard the input field.** Ingest pipelines carry many code-shaped fields
   (programme numbers, assistance-listing identifiers). The mapper must
   ignore anything not in its table rather than coerce it, or an identifier
   field passed by mistake fabricates an audience.
3. **Free-text rules as a fallback tier.** For prose descriptions, run an
   order-independent set of keyword rules where every matching rule
   contributes its type (a description naming both nonprofits and
   municipalities yields both). Include the jurisdiction's own legal-form
   vocabulary in the patterns — the local words for association, foundation,
   municipality — because prose in a legal-form regime names forms, not
   categories, and an English-only ruleset returns empty for the entire
   market.
4. **Applicant side: entity type → code set.** The applicant declares one
   entity type; the jurisdiction model maps it to the codes it may apply
   under (a university to the higher-education codes plus the open codes; a
   city to the government codes plus the open codes). The gate is then set
   intersection between the opportunity's codes and the applicant's codes.

## Decision rules

- **When code and free-text disagree, prefer the codes, because** they are
  the structured, funder-authored channel; keep the text-derived types as
  additive hints, never as an override that removes a coded audience.
- **When a source invents its own enumeration, write a second table — do not
  overload the first, because** collisions between numbering schemes are
  silent and permanent once merged.
- **When a new applicant segment matters commercially, add it to the
  vocabulary rather than aliasing it, because** aliasing (tribal → nonprofit)
  erases exactly the distinction some funders gate on.

## When not to use

In a pure legal-form regime — no funder-side codes exist at all — this
technique has nothing to map on the opportunity side; eligibility runs
through the legal-form model instead. The free-text parser still earns its
keep there as an audience *hint* extractor, but its output feeds display and
ranking, not the hard gate.
