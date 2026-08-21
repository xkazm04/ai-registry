---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: name-versus-role-headline-disambiguation
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [writing or reviewing a name masker, a masked document lost its top line, tuning capitalised-token heuristics]
---

# Name versus role headline disambiguation

The top of a hiring document contains, in some order, a person's name and a
statement of what they do. Both are short, both are capitalised, both sit in the
same visual position, and a naive masker treats position as proof and removes
whichever comes first. When it guesses wrong it deletes the single most
informative line on the page — the line that tells the assessment what kind of
practitioner this is — and replaces it with a placeholder that reads as a
person. The document then scores as an unclassifiable candidate.

This is the sharpest instance of the general problem: capitalised tokens are
ambiguous, and the ambiguity cannot be resolved by shape.

## Why shape fails

Every heuristic reachable from the surface form is wrong somewhere:

- **Position.** Many documents lead with a role headline and put the name in a
  footer, a signature, or a header image.
- **Capitalisation.** Role headlines are title-cased as often as names are.
- **Token count.** Two capitalised words fits both a name and a role.
- **A name list.** Names are an open set across languages, and many personal
  names are also ordinary occupational or common nouns. A list large enough to
  catch real names is large enough to eat the vocabulary of the document.

[Meaning does not live in a
label](../../_laws.md#meaning-does-not-live-in-a-label) is the law under this
whole technique: what a token *is* cannot be read off how it is written. The
disambiguation has to come from vocabulary and context, and where it cannot, the
default must be chosen on which error is survivable.

## The procedure

1. **Test the candidate span against role vocabulary first.** A span containing
   an occupational noun, a seniority modifier or a skill term is a role
   headline, not a name, regardless of its position. Do not build a bespoke
   stop-list for this: **reuse the same role and seniority vocabulary the
   scoring side already uses.** One vocabulary means the redactor's notion of
   "this looks like a role" cannot drift away from the assessment's, and every
   term added for scoring improves the mask for free. A private list starts
   correct and rots.
2. **Test against structural markers.** A span adjacent to contact details, or
   preceding an obvious contact block, leans name. A span followed by a summary
   paragraph or a skills list leans headline.
3. **Apply the connector rule.** Role headlines commonly contain a separator or
   a joining word — a role at an organisation, a role and another role, a
   pipe or dash between function and specialism. Personal names rarely do.
4. **Where the evidence conflicts, prefer preserving the headline.** A leaked
   name that survives one line is a serious but bounded failure that other layers
   can catch — the document body still carries the identifiers that matter, and
   the manifest will show a zero name count on a document that plainly belongs to
   someone. A destroyed headline is silent and unrecoverable. Choose the loud
   error.
5. **Mask names found anywhere else in the document with full aggression.** The
   caution in this technique is scoped to the headline slot only. In the body, a
   name is a name.

## Decision rules for the neighbouring hard cases

- **When a name shares its line with a role, split on the separators that
  actually separate.** Punctuation separators and a *spaced* hyphen delimit a
  name from a same-line headline; a *glued* hyphen does not, because it is
  inside hyphenated personal names. Getting this backwards either misses the
  name entirely or cuts one in half, and both failures are silent.
- **When a token is a bare two-letter abbreviation, leave it.** Two-letter
  uppercase tokens are overwhelmingly country codes, organisational
  abbreviations, degree markers, product prefixes and unit symbols; the fraction
  that are initials are already covered by the full-name rule elsewhere in the
  document. One honorific abbreviation in particular collides with a common
  degree abbreviation, a widespread software-vendor prefix, and a unit of time —
  masking the bare token strikes qualifications, skills and performance numbers
  on every page, to catch a signal that is almost never identifying on its own.
- **Mask a gendered honorific only in its gender-revealing usage — prefixing a
  capitalised name — and never as a bare token.** This is the general move
  worth taking from the case: the decision is about the token's *usage*, not its
  spelling, so use whatever cheap context distinguishes them. Case is often
  enough on its own: a title-cased honorific and an all-caps initialism are
  different words wearing the same letters, and matching the honorific
  case-sensitively while matching a language's lowercase titles
  case-insensitively resolves the collision without any classifier at all. Mask
  the title; leave the following name to the name pass.
- **When a pronoun that reveals gender is a homograph of a common word in the
  document's language, exclude it from masking and record the exclusion.** This
  is a real and frequent collision in several widely-used languages — the
  masking pattern would strike ordinary sentences on every page. The correct
  outcome is a documented, reviewed gap in the inventory, not a redactor that
  mutilates prose. A silent exclusion is the failure; a stated one is craft.
- **When an organisation name is also a personal name, mask it as an
  organisation.** The category of the placeholder is part of the meaning, per
  [absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence): typing it
  wrongly tells the assessor a person stood where a company stood.
- **When the document is in a language the vocabulary lists do not cover,
  escalate rather than degrade.** A masker running with the wrong language's
  vocabulary has both halves of its judgment wrong at once, and the honest
  response is refusal, not a guess.

## What this technique is not

It is not a general named-entity problem to be solved by throwing a stronger
extractor at it. A stronger extractor makes the same class of error less often
and just as silently, and it introduces a new one: an extractor good enough to
find names is good enough to *infer* attributes, which is a capability a blind
pipeline must not exercise. The value here is in the stated defaults and the
recorded exclusions — the decisions someone can argue with — not in the
accuracy of the classifier.

## When not to use this

Skip it entirely where documents arrive through a structured intake that already
separates identity fields from content: the headline slot problem exists because
a free-form document flattens both into text. Where the fields are separate, do
not re-derive the distinction from prose — use the structure, and keep this
technique for the free-form path.
