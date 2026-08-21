---
layer: technique
type: technique
subject: regulated-credential-gating
technique: credential-cue-catalog-per-role-family
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [building or extending the list of credentials the system treats as regulated, matching a requisition line to a known licence, adding a new profession or jurisdiction to a hiring pipeline]
---

# Credential cue catalog per role family

The catalog is the artifact that decides which credentials are regulated. Every gate in
this subject reads from it: the precondition classification, the expiry scoping, the
required-but-missing check. That makes it a **safety artifact with an owner**, not a
convenience list somebody grows by pattern-matching on support tickets.

It is organised **by role family**, because that is how the underlying regimes are
organised and because a flat list of abbreviations across all professions collides
almost immediately — the same three or four letters mean a clinical registration in one
field and an internal grade in another.

## What a catalog entry holds

Each entry names one credential in one regime, and carries at minimum:

- **Canonical name and role family** — the profession whose practice the credential
  permits: clinical care, financial-services registration, site safety, professional
  engineering, accountancy, legal admission, commercial driving, medical specialty
  practice, and so on for whichever families the organisation actually hires into.
- **Regulated or not.** The single flag that turns on precondition treatment and expiry
  enforcement. Most entries in a mature catalog are *not* regulated — the catalog is
  also how the system recognises ordinary certifications, so it can capture them
  without gating them.
- **Cues** — the surface forms that indicate this credential in prose: the full name,
  the common abbreviation, and the phrasings a requisition uses to demand it. Cues are
  matched against both sides: candidate documents and requisition text.
- **Issuing body and jurisdiction scope** — which authority grants it and where it is
  valid, plus whether reciprocity or endorsement arrangements exist.
- **Whether it expires**, and the typical renewal cycle, so an undated instance of a
  credential that always carries an expiry is recognisably incomplete rather than
  silently treated as perpetual.
- **Where it can be verified** — the register or authority a human should query. An
  entry that cannot say where verification happens is teaching the system to gate on
  something nobody can confirm.

## Procedure

1. **Seed by role family, not by frequency.** Take the families the organisation hires
   into and enumerate each family's practice-permitting credentials completely, rather
   than adding entries as they are encountered. A partial family is worse than an absent
   one: it produces a gate that fires for some licensed professions and silently passes
   for others, which reads to operators as "the check works".
2. **Write cues for the ways people actually write.** Abbreviations with and without
   punctuation, the credential appended to a name, the expanded title, the regulator's
   own phrasing, and the requisition idioms ("must hold current …", "… registration
   required"). Include the plural and the possessive.
3. **Make matching conservative.** A short abbreviation that is also a common word, an
   initialism, or another field's grade must require corroborating context — a nearby
   date, an issuer, a number, or a role-family match with the requisition — before it
   counts as a hit. A false positive here fabricates a credential the candidate never
   claimed, which is the [say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds)
   failure at its most consequential.
4. **Scope every entry to its jurisdiction explicitly**, even when the organisation
   currently hires in only one. Entries written without scope are the ones that break
   silently the day a second country is added, and they break in the direction of
   passing an invalid credential.
5. **Review changes like policy, not like data.** Adding a regulated entry creates a new
   class of automated blocking. Adding it wrongly excludes people. Give the file a named
   owner, require the regime to be cited in the change, and keep a test that pins the
   regulated subset so an unreviewed flag flip fails loudly.

## Decision rules

- **When a credential's abbreviation is ambiguous across families, require the role
  family to agree** before treating a candidate mention as that credential. Letters are
  a label; [meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label).
- **When a credential is unknown to the catalog, capture it as an ordinary
  certification** — recorded, shown, ungated. Never infer regulated status from
  requisition emphasis or from the presence of an expiry date.
- **When the requisition names a credential the catalog does not contain and the role
  family suggests a regime**, raise it for catalog review rather than gating on it in
  place. One requisition's ad-hoc gate is how an unowned rule enters the system.
- **When two entries share cues, the more specific wins**, and the overlap is recorded
  in both entries so the next editor sees it.
- **When an entry's verification route is unknown, do not mark it regulated yet.** A
  gate whose failure a human cannot resolve leaves the candidate stuck.

## When not to use this

- **Do not use the catalog as a skills taxonomy.** It answers "is this a permission to
  practise", not "what can this person do". Skill normalisation and adjacency are a
  different neighbour's job, and merging the two pulls ordinary certifications into the
  gating path.
- **Do not use it to encode seniority or grade.** Chartered, fellow, associate and
  similar grades within one body are frequently *not* separate practice permissions;
  treating a grade as its own regulated entry gates on prestige.
- **Do not extend it by scraping.** Every entry costs a review because every entry can
  block a person. A catalog that grows faster than it is reviewed has stopped being a
  safety artifact.
