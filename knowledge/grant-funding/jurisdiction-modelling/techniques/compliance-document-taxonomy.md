---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: compliance-document-taxonomy
status: forged
laws: [clean-is-not-ready, honest-null-over-forced-guess]
shared_with: []
use_when: [building or extending a required-attachments checklist across markets, a new market demands document classes the founding market never produced, a completeness check passed while a locally mandatory certificate was missing]
---

# Compliance document taxonomy

Grant applications attach proof: proof the organization exists, proof of its
governing rules, proof it owes no public debts, proof of its finances, sworn
statements of integrity. Which proofs, under what names, from which issuing
authorities — all of that is local administrative law. The technique keeps a
**shared taxonomy of document classes** with per-class recognition rules,
while each jurisdiction profile selects the subset its applications
conventionally demand. Checklist logic stays generic; the document set stays
local; and a new market extends the taxonomy instead of forking the checker.

## Classes, not translations

The defining insight: markets differ in document *classes*, not just labels.
Several recurring families a multi-market taxonomy ends up holding:

- **Existence and form**: a registry extract or certificate of incorporation
  — the universal class, though the issuing register differs everywhere.
- **Charitable or tax status**: a determination letter or charity-register
  entry — exists only where status is granted rather than inferred from
  legal form.
- **Governance**: statutes / articles / trust deed; a board or trustee
  roster.
- **Financial**: budget; annual accounts; audited financials; a mandatory
  annual report where filing one is a statutory duty.
- **Public-debt clearance**: a certificate that the organization owes
  nothing to the tax authority, social-security administration, and public
  insurers — in some markets one certificate per agency, and known under
  several official names ("clearance", "compliance", "good standing"). A
  single-market model born elsewhere would never invent this class.
- **Sworn declarations**: a declaration of honour or statutory declaration
  attesting integrity, non-exclusion, absence of conflicts.
- **Programme identity**: registration in the funder's own participant
  system, with its identifier and legal-entity forms.
- **Sector policies**: safeguarding or equivalent policies that some markets
  make a de facto funding precondition.

Each class gets a stable key; each profile lists keys, never labels.

## Recognition rules per class

For each class, the taxonomy stores how the demand and the document manifest:

1. **A demand needle** — patterns that recognize the requirement inside a
   funder's call text, written in the language the market's funders write
   in. English-only needles return nothing for an entire non-English market.
2. **A filename hint** — patterns that recognize a matching upload. Write
   these **diacritic-insensitively**: users name files in stripped ASCII at
   least as often as in correct orthography, and a hint that demands the
   diacritics misses half the real uploads. Where a class has official
   synonyms, the needle carries all of them.
3. **A human label** in the market's language — the checklist is read by the
   applicant, and a translated class name for a document that only exists
   locally is often meaningless.

Run the check as: filter the taxonomy to the profile's keys, detect which
demands the call text actually makes, match uploads against hints, and
report per class — required, demanded-by-this-call, satisfied, missing.

## Decision rules

- **When a new market's document has no existing class, add a class — never
  shoehorn it into the nearest founding-market class, because** the
  shoehorned class's recognition rules will not fire on the local names and
  the checklist will show satisfied-by-nothing or demand the wrong artifact.
- **When a class exists in two markets under different issuing authorities,
  keep one class with per-market labels and needles, because** the
  applicant-facing meaning ("prove you owe no public debts") is the stable
  identity; the authority is detail.
- **When call text matches no needle for a profile-required class, report
  the class as "not demanded by this call" rather than dropping it,
  because** conventional requirements bind even when a lazy call text omits
  them, and the applicant deserves to see the distinction.
- **When an upload matches no hint, list it as unmatched rather than
  force-assigning the best class, because** a mis-filed document marked
  satisfied is a completeness lie — the check must distinguish "satisfied"
  from "we could not tell", or its clean report certifies nothing.

## When not to use

Funder-specific one-off attachments (a particular funder's bespoke form)
belong to funder intelligence or to the individual call record, not to the
jurisdiction taxonomy — the taxonomy holds classes that recur across a
market's funders. And do not use filename hints as the *sole* satisfaction
evidence for high-stakes submissions; they are a screening layer, and the
final pre-submission review still opens the files.
