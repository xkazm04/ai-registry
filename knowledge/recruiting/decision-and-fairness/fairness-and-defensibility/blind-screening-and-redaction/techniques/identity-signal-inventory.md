---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: identity-signal-inventory
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [defining what a redactor removes, auditing an existing mask for gaps, choosing a per-role masking level]
---

# Identity signal inventory

A redactor without a written inventory is a pile of patterns that grew by
incident. The inventory is the artifact that makes masking reviewable: an
explicit, versioned list of the categories of content that bind a hiring
document to a person, each with a stated tier, a stated default, and a stated
reason. It is written once, argued over in the open, and then implemented —
never the other way round.

The inventory is also the thing that gets *tested*. Categories in it are
contracts: a test suite asserts that each named category is removed and that
each named preserved class survives. A category that exists only in a regular
expression and not in the inventory will be silently deleted by the next person
who finds it noisy.

## Build it in three tiers

Tier by **directness of binding**, because that is what determines whether the
default is negotiable.

**Tier 1 — direct identifiers.** Personal and family names. Contact details:
address, telephone, electronic mail. Personal links and handles: a
professional-network profile, a code-hosting account, a personal site, a social
handle. Photographs. National or tax identifiers. Signature blocks. Default:
always masked, no per-role discretion, no aggressiveness setting. A team that
can turn off name masking does not have blind screening.

**Tier 2 — protected-attribute markers.** Gendered terms and pronouns in every
language the corpus contains. Age and birth-year markers, including phrasings
like "born in", explicit ages, and date-of-birth fields. Nationality and
citizenship statements. Marital and family status. Military service status.
Religious and political affiliation. Health and disability statements. Default:
masked. These almost never carry capability, so removal is nearly free — which
is exactly why they are the tier most often forgotten rather than most often
argued about.

Tier 1 also contains the entries no pattern can reach — a photograph, a
signature image, the visual styling of the page. These are masked by **channel
substitution**: send extracted, masked text instead of the original artifact.
Record them in the inventory anyway, with "removed by not sending the original"
as the mechanism, because an inventory that lists only pattern-matched
categories will lose them the first time someone adds a convenient path that
uploads the file.

**Tier 3 — correlates.** Institution and school names. Neighbourhood or region
of residence. Hobbies and association memberships. Graduation years. The
language the document is written in. Photographic or stylistic cues. Default:
**a per-role decision made in advance by a named owner**, not a global maximum.
This is the tier where masking starts consuming the substance the assessment
needs, and where a blanket "mask everything" is itself a fairness failure.

## Decision rules

- **When a token binds to a person, mask it. When it carries capability,
  preserve it. When it does both, split it.** An institution name and a
  qualification level are one span in the document and two facts; mask the name
  and keep the level and field. A graduation year and a study duration are the
  same arithmetic seen twice; keep the duration, drop the year.
- **When a category is in tier 2, do not make it configurable.** Configurability
  here produces a mask whose meaning varies per requisition, which destroys the
  procedural claim the whole subject rests on.
- **When a pattern for one category collides with ordinary vocabulary, do not
  widen the pattern — narrow the category and document the exclusion.** In
  several languages the pronouns that reveal gender are homographs of common
  words, and a redactor that masks them all mutilates ordinary sentences. The
  right response is a written, reasoned exclusion in the inventory, reviewed as
  a known gap, not a silent one. [Meaning does not live in a
  label](../../../../_laws.md#meaning-does-not-live-in-a-label): the token's surface
  form does not settle what it is doing in the sentence, so the inventory must
  say which reading it is claiming.
- **When a candidate volunteers a tier-2 attribute in a substantive sentence,
  mask the attribute and keep the sentence.** "Led the women-in-engineering
  mentoring group, thirty mentees over two years" is leadership evidence with
  an attribute marker inside it. Deleting the whole line destroys the evidence;
  masking the marker keeps it.
- **When the inventory adds a category, add its preservation counterpart in the
  same change.** Every removal has an adjacent thing it must not take with it,
  and the pair is what the test pins.

## The inventory's second job: the manifest

The inventory is also the vocabulary of the per-document **redaction manifest** —
what was actually masked in *this* document, by category, with counts. The
manifest is what makes the disclosure to the assessor specific rather than
generic, and what lets an auditor later confirm the run was actually blind. A
category not in the inventory cannot appear in a manifest, so an unnamed
removal is an unauditable one.

Counts matter, not just presence. Zero name matches in a document that visibly
belongs to a person is a redactor failure, not a clean document, and the
manifest is where that becomes visible.

**Carry the name-found signal as its own explicit field, even though it is
derivable.** Whether a personal name was actually located and masked is the one
fact the whole procedural claim rests on, and every derivation of it — "is the
detected name non-empty", "is the name category present in the list" — is a
step a caller can forget to take. An explicit flag makes the fail-open case
impossible to miss by omission, and the mild redundancy is the cheapest
insurance in the subject. When it is false, the pipeline may still proceed, but
it may not say the document was redacted.

## Where absence bites

A masked span must be typed, not deleted. This is
[absence of evidence is not
evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence) applied to a
document: a hole reads as *the candidate did not have this*, which is a claim
nobody made. A placeholder that says "an employer name stood here" preserves the
distinction between a masked fact and a missing one, and the inventory is where
each category's placeholder is specified alongside its pattern.

## When not to use this

Do not build an inventory to justify masking everything; if the outcome is a
maximum mask, you have written a deletion policy, not an inventory. Do not
extend it into stored-record redaction — deep-redacting retained verbatim
material is a retention concern with a different lifecycle and a different
owner. And do not treat the inventory as evidence of neutrality: it describes
what a reader could not see, not whether identity would have changed the score.
That question is answered by perturbing a document, not by masking one.
