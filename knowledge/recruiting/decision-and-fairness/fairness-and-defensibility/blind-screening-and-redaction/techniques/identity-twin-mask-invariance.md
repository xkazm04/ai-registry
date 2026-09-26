---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: identity-twin-mask-invariance
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [testing a redactor before trusting its blind claim, a masking fix was made for one candidate's name, choosing names for a redactor test suite]
---

# Identity-twin mask invariance

A redactor is supposed to remove who the candidate is. Its own errors are allowed
to exist; they are not allowed to depend on who the candidate is. That second
property is the one nobody tests, and it is the one that turns a fairness control
into a fairness defect: a mask that works for one name and fails for another is
an unequal instrument wearing the label of an equalising one.

The test is cheap and exact. Take one document body. Vary only the identity: the
name, the gendered forms the language inflects, the contact handle. Redact every
twin. **Every twin must come back as byte-identical text.** Any difference is, by
construction, a difference the mask made because of the person.

## Why the errors follow the identity

The failures cluster where a name collides with the vocabulary around it, and
which names collide is a fact about languages and cultures, not about chance:

- **A name that is also a word the document uses.** A given name that is also a
  month abbreviation takes the candidate's employment dates with it. A given name
  or surname that is also a programming language or a skill takes the skills
  line. A surname that is also an employer, an award or a financial term takes
  those spans. The candidate whose name is uncommon in the redactor's language
  never loses anything.
- **A name that looks like a role.** A headline test that rejects any line
  carrying one skill term will reject a person whose surname is that term. That
  candidate's name is then never detected, so they get a partial blind run
  while an otherwise identical twin gets a full one.
- **A language that inflects for gender.** An age or birth-year pattern written
  for the masculine form misses the feminine one. The man's birth year is masked
  and the woman's reaches the assessor, under a word that also discloses her
  gender.

Each of these was found in a real redactor, one incident at a time, and each fix
closed one case. The twin test is what closes the class. Masking recall that
varies by name origin is also documented for general-purpose name detectors,
so a stronger extractor does not remove the need for it.

## The procedure

1. **Hold the body fixed and write the twins deliberately.** Include a baseline
   name that collides with nothing, and then names chosen for collisions in each
   language the corpus contains: given names that are months, words, skills or
   places; surnames that are employers, trades or terms of art; every gendered
   inflection of the age, title and participle forms. A twin set of common names
   from one culture tests nothing.
2. **Put the colliding vocabulary in the body.** The collision only shows when
   the document also contains the date, skill, employer or compound the name
   shares a spelling with. The body is written *for* the twin set.
3. **Assert identical output, and assert detection.** Text equality across
   twins, plus `name found` true for every twin. The second assertion catches the
   under-masking direction, where a name is never detected and so leaves nothing
   to differ in the masked spans.
4. **Prove the test can fail.** Run it against the redactor before the fix and
   watch it go red. An invariance test that has never failed is a
   round-tripping test.
5. **Pin the non-vacuous direction next to every exemption.** When the fix keeps
   a vocabulary token (the skill, the date), add the case where the same token
   is a person reference, after a salutation or an honorific, and assert it is
   still masked.

## Decision rules

- **When a collision can be decided by the vocabulary the scoring side already
  uses, decide it there.** A token the scorer reads as a skill is a skill in the
  body. A glued-hyphen compound is a term, not a person. One vocabulary keeps the
  redactor and the assessment from disagreeing about what a word is.
- **When a collision cannot be decided by shape, state it.** A surname that is
  also an employer cannot be told from a self-named firm without knowing the
  candidate's history. The policy picks a side, masks it as identity, and the
  twin that loses its employer is recorded as a known gap in the suite, marked as
  expected to fail, not deleted from the twin set. A gap written down is craft.
  One that disappears from the test is the failure.
- **When a fix is made for one candidate's name, add that name to the twin set in
  the same change.** A defect found by a candidate is a twin the suite lacked.
- **When the twin set grows, re-run the preservation contracts.** Every
  exemption that keeps a vocabulary token is a place a name can now ride
  through.

## What it measures, and what it does not

The twin test proves the *mask* does not depend on the person. It says nothing
about whether the *score* does: an assessor handed two identical masked texts
will score them identically, but it can still recover identity from what the
mask was never meant to remove. Proving the score is invariant is a separate
test, done by perturbing the assessor's input, and a sibling subject owns it.
Both are needed, and neither substitutes for the other.

The masked span must also stay typed, per
[absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence):
the harm in every collision above is a capability span replaced by a
placeholder, which then reads as a capability the candidate did not list.
[Meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label)
is why the collision exists at all. The same spelling is a person in the header
and a language in the skills line, and only the context says which.

## When not to use this

Skip it where identity arrives in structured fields the redactor never has to
find in prose. There is no collision without free text. And do not read a green
twin suite as proof the mask is complete: it proves the mask is *equal*.
Completeness is the inventory's job and the manifest's count.
