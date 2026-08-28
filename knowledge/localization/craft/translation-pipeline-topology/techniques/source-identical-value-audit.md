---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: source-identical-value-audit
status: forged
laws: [coverage-is-counted-not-claimed, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding how to prove a committed catalog was actually translated, key parity is green and translatedness is still unknown, wiring a gate that rejects untranslated values, an untranslated-value check fires on a locale that is fully translated, choosing a catalog format for a product that will ship many locales, comparing coverage across locales with different scripts]
---

# The source-identical value audit

Key parity asserts that a key **exists** in every locale; it never asserts that
its value was **translated**. Serving-time fallback then hides the difference —
a missing or untranslated string renders as source-language text that looks,
to every reader and every reviewer, exactly like a shipped translation. So
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
has to be discharged against the values, and the only signal a plain catalog
offers is a comparison: **does this locale's value equal the source locale's
value?**

That signal is cheap, mechanical and genuinely load-bearing. It is also
misread more often than any other number in a localization pipeline, because
its floor is not zero — and the floor is per-locale.

## First ask whether the format already knows

Translatedness is a property a catalog format may or may not be able to store,
and that capability decides whether this technique is needed at all.

- **Formats that record state.** A translation-interchange standard such as
  XLIFF carries a per-segment state attribute, and the long-standing message
  catalog convention encodes the same thing structurally: an empty target
  means untranslated, and a separate flag means *translated but not to be
  trusted yet*. Where state is recorded, read it. It distinguishes
  "never translated" from "translated, needs review" — a distinction value
  comparison can never recover.
- **Object catalogs.** A key-to-string tree has nowhere to put state. A key is
  present with a string value, or it is absent; "present but untranslated" is
  not representable. Comparison is the only instrument available, which is why
  this technique exists.

The trap is specific to the second case and worth naming before it is built:
when a **structural type contract** requires every locale to satisfy the source
locale's exact shape, absence becomes illegal. A contributor adding a key
cannot leave the target empty — the build fails — so the only legal move is to
copy the source value across. The gate that guarantees key parity therefore
*manufactures* the ambiguity, at scale, as documented policy. Nothing is wrong
with the type contract; what is wrong is treating its green build as a coverage
claim. Choose the format knowing the trade: a format with no state field
converts "not yet translated" into "indistinguishable from translated."

## The floor is four enumerable classes, not noise

Compare every leaf value against the source locale's value for the same key.
Equality is the candidate signal. What comes back is never zero, and the
residue sorts into four classes — the first three locale-independent, the
fourth not:

1. **Proper nouns.** Product, company, platform and integration names. Identical
   in every locale, and correctly so.
2. **Pure-skeleton strings.** Values consisting entirely of placeholders,
   punctuation, digits and universal units. Nothing in them is translatable, and
   [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
   makes identity the *required* outcome, not a tolerated one.
3. **Initialisms and symbols** carried untranslated by the target's own
   technical register.
4. **Adopted loanwords** — a term the target language genuinely renders with the
   source spelling.

Classes 1–3 are the same set in every language. Class 4 is where the instrument
becomes locale-specific, and it is the entire reason a single global threshold
fails.

## Class 4 is set by script, and it is a terminology ruling

The size of class 4 is a function of two properties of the target — its script,
and its technical register's borrowing policy — and of **nothing about
translation quality**.

- **Non-Latin target script: near-conclusive.** A genuinely adopted loanword is
  *transliterated* into the native script, so it stops being byte-identical.
  Identity therefore really does mean untranslated, and the allowlist stays
  small — classes 1–3 and little else.
- **Latin target script: noisy by construction.** A borrowed term keeps its
  source spelling, so a fully correct catalog is legitimately identical at those
  keys. The check still works, but only against an allowlist that carries the
  target's borrowed technical register.

Measured on one thirteen-locale catalog whose locales were all fully
translated: identity ran **1.8% of leaves for non-Latin-script targets and up
to 7.7% for a Latin-script target** — a fourfold spread with no difference in
translatedness behind it. A single threshold applied to that catalog reports
the spread backwards, ranking the best-covered locales as the worst.

The ownership consequence matters more than the number. Every class-4 entry is
a **termbase ruling** — *this term keeps its source spelling in this language* —
and that ruling belongs to the language's own terminology and loanword craft,
where it can be argued about on the merits. An allowlist maintained by whoever
happened to be unblocking the gate is a place where terminology decisions get
made silently, by someone optimizing for a green build. Where the allowlist and
the termbase disagree, the termbase is right and the allowlist is stale.

## Enumerate the floor; never threshold it

The exception must be a committed **per-key allowlist**, living where review can
argue with it — not a percentage budget.

- A threshold is satisfied by the wrong keys. "Under 3% identical" passes a
  locale that translated the brand names and skipped the error messages.
- The classes above are stable and enumerable. A list of them is reviewable
  line by line; a percentage is reviewable by nobody.
- A list makes the exception *visible as an exception*. This is the mirror image
  of the hand-authored exception contract: that one enumerates what a human
  vouched for, this one enumerates what is allowed to look like nobody did.

## Bootstrap by counting, before the gate exists

[The authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis)
applies exactly here: the allowlist is a rule about a catalog, so it is counted
against that catalog before it is enforced against it.

1. **Run the comparison across every locale with no gate attached.** The output
   is a measurement, not a findings list.
2. **Take the intersection** — the keys identical in *every* locale. That set is
   classes 1–3 almost by construction, because no single language's borrowing
   policy can put a key there. Measured on the thirteen-locale catalog above,
   the intersection was **25 keys, and every one was legitimate**: product and
   platform names, integration names, initialisms, and pure-skeleton values.
   Seed the allowlist from it and review it once, cheaply.
3. **Rule the per-locale residue.** What sits above the intersection for a given
   locale is class 4 plus real untranslated values. Take each entry to that
   language's termbase; the ones that survive are terminology rulings and are
   recorded as such.
4. **Only then turn the gate on.** Enforcing first produces a wall of findings
   that whoever is unblocking CI resolves by adding entries wholesale — which is
   precisely how an allowlist stops being a reviewed artifact.

## Failure modes

- **A threshold instead of a list.** Converts a reviewable claim into an
  unreviewable budget, and misranks locales by script.
- **The gate as accidental terminology authority.** Class-4 entries added under
  build pressure, never seen by anyone who knows the language.
- **Bootstrapping the floor from one locale.** A floor derived from a single
  Latin-script locale over-allows every other locale into silence; derived from
  a single non-Latin one it under-allows and buries the reviewer in false
  findings.
- **Reading the signal in the other direction.** A value that *differs* from
  source is not thereby translated — unreviewed machine output, a paraphrase
  left in the source language, and a stale translation all differ. This check
  has exactly one honest reading: identity is evidence of untranslatedness,
  difference is evidence of nothing.
- **Running it where state is stored.** Re-deriving translatedness by comparison
  when the format already records it is strictly worse than reading the record,
  and it silently collapses "untranslated" into the same bucket as "translated,
  pending review."
