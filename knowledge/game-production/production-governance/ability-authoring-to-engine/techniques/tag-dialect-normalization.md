---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: tag-dialect-normalization
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [an identifier exists in two syntaxes across a boundary, comparisons across a code/data seam return nothing, adopting generated output into a data store]
---

# Tag dialect normalization

## The concern

Some identifiers exist in two syntactic forms because two sides of a boundary have
different rules about what a name may contain. The code side needs something the language
will accept as a symbol; the data side wants a hierarchical string a human can read and a
matcher can prefix-match. So the same identifier is written one way in source and another
way in data, and both spellings are correct.

The failure is not that the two forms exist — that is usually unavoidable. The failure is
that a comparison happens between one of each. Same identifier, two spellings, and equality
says no. This never throws. It produces a *clean report about the wrong set*: an audit that
matches nothing and confidently lists every identifier as a problem, a lookup that silently
falls through to a default, a filter that returns empty and renders as "none found". Every
symptom of this bug looks like a correct answer to a different question.

Generalise it before you fix it: **whenever an identifier exists in two syntaxes across a
boundary, comparisons must happen in exactly one of them, normalised at the boundary.** The
tag case is the common instance; the shape covers case-folded keys, path separators,
locale codes, database columns versus object fields, and every wire format that renames
things on the way past.

## The procedure

**1. Declare one dialect canonical, and say why.** Pick the form used by the system that
does the most comparing — usually the data side, since that is where matching, storage and
reporting live. Write the choice down where people will meet it. An undocumented canonical
form is rediscovered wrongly by the next person.

**2. Write exactly one mapper module, in both directions.** One function to canonical, one
back to the foreign form for code that must emit a real symbol. Both pure, both with no
dependency on the rest of the system so they run on either side of the seam and are
trivially testable. The moment a second conversion appears inline somewhere, the two
conventions begin to diverge and the divergence is untraceable.

**3. Make the normaliser idempotent and tolerant of mixed input.** Running it on
already-canonical input must return it unchanged. This is what lets you apply it
defensively at every boundary without knowing which side an identifier arrived from — and
in a real system, a list will contain both spellings, because part of it came from a parser
and part from a generator. A normaliser that corrupts already-clean input forces callers to
track provenance, and callers will get that wrong.

**4. Normalise at the boundary, not at the comparison.** Convert on ingest — as data enters
your store, as generated output is adopted, as a parse result is recorded. Interior code
then compares plainly and is not required to remember the rule. Normalising at every
comparison site means every future comparison site is a new chance to forget.

**5. Prefer a declared pair over a convention when one exists.** The convention (swap one
separator for the other) is an inference. Where the system *declares* both spellings
together — a source declaration that names the symbol and the string in one place, parsed
into a table — that table is the authority and the convention is the fallback for when no
table is at hand. Conventions have exceptions; abbreviations, legacy names and renames are
exactly where the mapping is not mechanical, and exactly where the bug will be.

**6. Convert at the generation seam specifically.** When a generator emits identifiers in
one dialect and everything downstream speaks the other, the adopt step is the boundary.
Skipping it produces the most demoralising version of this bug: correct-looking rows that
match nothing, indistinguishable from a real hygiene failure, and usually diagnosed as one.

## Decision rules

- **When two identifiers arrive from different sides, both pass through the normaliser
  before comparison — no exceptions for the one you are sure about.**
- **When a parsed declaration table is available, it outranks the convention.** Fall back to
  the convention only where no declaration was parsed, and say in the output which path was
  used.
- **When the mapping is not a pure function of the string, stop.** If canonicalising needs
  context — a namespace, a version, a lookup — it is a resolution step, not a normalisation,
  and it belongs in a resolver with a failure mode, not in a string helper that cannot fail.
- **When a foreign-dialect value must be stored, store the canonical form and derive the
  other on the way out.** Storing both is two authorities for one quantity; they will
  disagree after the first rename.
- **When a comparison across this seam returns zero matches, suspect the dialect before the
  data.** Empty is the signature symptom, and it is far more often a normalisation bug than
  a real absence.

## When not to use it

- **When only one form ever exists.** Adding a normaliser for a hypothetical second dialect
  is dead code that will be applied inconsistently once the situation is real.
- **When the two forms are not the same identifier.** Sometimes what looks like a spelling
  difference is a genuine namespace difference and collapsing them merges two things. Check
  that the mapping is a bijection over the live set before making one form canonical.
- **When the foreign form is lossy.** If converting loses information you cannot recover —
  a separator that is legal inside a segment, say — normalising destroys data. Fix the
  encoding instead of mapping over it.
