---
layer: technique
type: technique
subject: submission-filing
technique: standard-materials-checklist
status: forged
laws: [provenance-per-field, never-fabricate-a-figure]
shared_with: []
use_when: [showing required documents when no per-funder data exists, captioning generic guidance honestly, deciding when verified knowledge displaces the generic floor]
---

# Standard materials checklist

Most funders in a given class demand largely the same core materials, and an
applicant staring at an empty "what do I need?" panel is worse served than one
shown the well-known standard set. The technique is the disciplined version of
that observation: maintain one generic checklist for the funder class, present
it as *typical materials to confirm*, and treat it as a floor that verified
per-funder knowledge displaces — never as per-funder truth.

The whole technique lives or dies on the caption. The list itself is easy;
what distinguishes the craft version from the impersonating version is that
every rendering states the knowledge grade: "typical materials — confirm the
exact list against the funder's guidelines." Drop the caption and the same
pixels become a fabrication: the system now claims to know this funder's
requirements when it knows only the genre's.

## The standard nonprofit set

For a nonprofit applying to institutional funders, the recurring core is:

- the completed application form or narrative,
- a project budget with budget narrative,
- the tax-exemption determination letter,
- the most recent annual information return,
- the board of directors list,
- the most recent organizational financial statements.

Keep the set short and genuinely generic. Every item added "because some
funders want it" dilutes the list's honesty — a checklist half-full of
sometimes-items trains the user to ignore it. Items that vary by funder
(letters of support, audited vs unaudited financials, cost-share evidence,
logic models) belong in per-funder knowledge, not the floor.

## Procedure

1. **Define the set once, as a constant, per funder class.** Different genres
   have different floors — a federal program, a community foundation, and an
   arts panel do not share one list. If the system serves multiple genres,
   the floor is selected by the funder's genre, conservatively detected.
2. **Bind the caption to the list.** The caption is not UI copy layered on at
   render time; it travels with the checklist as data, so no surface can show
   the list without its epistemic label.
3. **Tag the source on every rendering.** The guidance object carries an
   explicit source discriminator — generic vs verified — and the caption
   switches with it. When crowd or funder-published knowledge is trusted, the
   caption changes to name its ground ("reported by N organizations that
   filed here"); the user can always tell which claim they are reading.
4. **Displace, do not merge.** When a trusted per-funder list exists, show
   it *instead of* the generic floor, not a union of both. A merged list
   re-smuggles unverified items in under a verified caption.

## Decision rules

- **When no per-funder data exists, show the generic floor with its caption,
  because** an empty panel pushes the user to guess, and the standard set
  plus "confirm against the funder" is strictly better information than
  nothing.
- **When the per-funder profile exists but is below the trust floor, still
  show the generic list, because** a low-sample crowd list is one org's
  experience wearing a checklist costume — the generic floor is at least
  honestly generic.
- **When the funder's own published requirements are ingested, they beat
  both, because** the funder is the only authoritative source; crowd and
  generic knowledge exist to approximate exactly this document when it is
  absent.
- **When tempted to personalize the generic list from prose inference
  ("their site mentions audits"), do not, because** an inferred item rendered
  in the checklist inherits the checklist's apparent authority — route the
  inference to a suggestion surface with its own confidence, or drop it.

## When not to use this

Do not use the generic checklist as a *compliance* input. It exists to help
an applicant gather materials, not to certify a package complete — a
completeness check keyed on the generic floor would pass packages missing
funder-specific mandatory items, which is a "clean but not checked" verdict.
Compliance checks run only against requirements with an authoritative source.
