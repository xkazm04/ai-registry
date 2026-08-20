---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: industry-preset-checklists
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [designing new-hire checklist templates, adapting onboarding to a regulated or non-office sector, deciding what a shipped default should contain]
---

# Industry preset checklists

A new-hire checklist template is not a to-do list. It is a compressed theory of what
has to be true before this person may legally and safely do this work. Shipping one
generic default encodes exactly one sector's theory — usually the office one — and
silently tells every other sector that their blockers do not exist.

The technique is to ship a small set of **sector presets**, each carrying the steps
that sector's work actually gates on, prefilled and then editable; and to keep them
honest with a set of disciplines that stop a starter from being read as a guarantee.

## The presets worth shipping

Five cover most of the working population, and the value of each is in the items the
office default does *not* contain.

- **General office.** Contract, identity and tax details, equipment, accounts, an
  onboarding buddy, the first-day plan, a team introduction. The baseline everything
  else is a deviation from.
- **Clinical and healthcare.** Primary-source verification of the professional
  licence, credentialing and board-certification checks, background and references,
  immunisation and health records, patient-privacy and patient-safety training. The
  contract is present but is the least interesting item: this list is dominated by
  checks that gate *patient contact*, not employment.
- **Skilled trades, manufacturing and construction.** Safety orientation, issue of
  personal protective equipment, pre-employment screening where the jurisdiction and
  role require it, verification of trade certifications, issue of tools, site and
  shift assignment. This list gates *site access*.
- **Technology and startups.** Offer and employment contract together, intellectual-
  property assignment, non-disclosure and equity or option documents, equipment,
  accounts and repository access, a buddy, a first-week plan with goals. This list
  gates *code and information access*, and its distinguishing item is paperwork
  nobody in an office default thinks about until an acquisition due-diligence.
- **Frontline service, retail and hospitality.** Work-authorisation confirmation,
  uniform and locker issue, station or floor training, role certification where
  required, scheduling and availability, contract. This list gates *the shift*, and
  it must run in days, because that is how fast these roles fill and start.

## What makes a preset item legitimate

An item earns its place only if it satisfies all three:

1. **It gates something.** Work that cannot lawfully or safely begin until the item
   is done. "Send a welcome pack" is nice; it is not a checklist item, it is a
   contact, and it belongs to the cadence.
2. **It is sector-distinguishing.** If every preset carries it, it belongs in the
   shared baseline, not copied five times.
3. **It names a step, not an outcome.** "Verify the licence at primary source" is a
   step someone performs. "Compliant" is a state nobody can tick.

## The discipline that keeps presets honest

**Presets are starters, not compliance guarantees, and the interface must say so
where the preset is chosen.** A clinical preset that lists licence verification and
immunisation records is a good prompt and is not a claim that a given jurisdiction's
requirements are covered — regulated-credential requirements vary by country,
sub-national region, employer type and role, and the sibling
`regulated-credential-gating` owns what verification actually means. A preset that
presents as compliance stops the team from checking, which is a worse outcome than
having shipped no preset at all. [Say only what the record holds](../../_laws.md#say-only-what-the-record-holds).

**Every item is editable after creation, and if it is not, do not say it is.** The
most common drift in this area is a template system whose documentation and interface
copy promise editability that the storage layer never implemented — create-only
templates with a permanent typo in a checklist a hundred hires will read. Either build
the edit and delete paths, guarding edits against runs already in flight, or state
plainly that templates are create-only and offer a duplicate-to-edit path. An
un-editable template is a defensible product decision; an un-editable template
described as editable is a trap for the next maintainer and for the recruiter.

**Ordering is content.** Within a preset the sequence carries the gating logic —
safety orientation before site assignment, licence verification before patient
contact, contract before access provisioning. If the storage treats items as an
unordered set, that theory is lost on the first render.

**A preset is not a stage gate.** Ticking items must never advance the person's
pipeline state or, worse, be able to reverse it. The checklist reports readiness;
the live stage governs whether the checklist may run at all, which is the neighbouring
technique.

## Identity, not display text

Preset and item identity lives in a stable key, never in the label a reader sees. Two
presets share a key only where the item is genuinely the same step — a contract is a
contract — and diverge into distinct keys the moment the sentence differs, because
"order a laptop and equipment" and "issue badge, equipment and system access" are two
steps that must not collapse into one identity for the convenience of a translation
catalog. [Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).
The consequences of that choice for readers in other languages are the subject of the
`language-neutral-template-keys` technique.

## Decision rules

- **When a team's sector is known at workspace creation, preselect its preset and
  still show the others.** Preselection is a default; hiding is a decision the team
  did not make.
- **When a role spans sectors — a clinician who is also a manager, an engineer on a
  regulated site — start from the more restrictive preset and add.** Restrictive
  items are the ones with legal consequences; convenience items are not.
- **When an item's owner is not the people team, record the owner on the item.**
  Safety orientation is run by a site lead, credentialing by a clinical office, repo
  access by an engineer. An unassigned gating item is an unstarted one.
- **When a preset would need a jurisdiction-specific item to be correct, do not add
  it to a shipped preset.** Add a prompt to review against the jurisdiction, and let
  the multi-jurisdiction sibling own the substance.

## When not to use this

- **A single-sector organisation with a mature checklist of its own.** Presets are
  for teams who do not yet know what they are missing; imposing them on a team that
  does is churn.
- **As a source of legal obligations.** They prompt; they do not enumerate.
- **For roles where the gating is per-person rather than per-sector** — executive
  hires, roles with security clearance, anything where the checklist is negotiated.
  Build the run from the person, not from a template.
- **As a substitute for the first-day plan.** A completed checklist means the person
  may start. It does not mean anyone has planned their first day.
