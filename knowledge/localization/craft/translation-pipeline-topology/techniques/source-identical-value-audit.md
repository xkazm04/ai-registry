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

## The floor is five enumerable classes, not noise

Compare every leaf value against the source locale's value for the same key.
Equality is the candidate signal. What comes back is never zero, and the residue
sorts into five classes:

1. **Proper nouns.** Product, company, platform and integration names. Identical
   in every locale, and correctly so.
2. **Pure-skeleton strings.** Values consisting entirely of placeholders,
   punctuation, digits and universal units. Nothing in them is translatable, and
   [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
   makes identity the *required* outcome, not a tolerated one.
3. **Initialisms and symbols** carried untranslated by the target's own
   technical register.
4. **Cognates** — the target's own native word, identical to the source word by
   shared ancestry rather than by any act of borrowing.
5. **Adopted loanwords** — the target took the source language's word into its
   technical register, having a native alternative available.

Two cuts run across those five, and confusing them is the expensive mistake:

- **Locale-independent (1–3) versus locale-specific (4–5).** The first three are
  the same set in every language; the last two are properties of one language
  pair.
- **Fact (1–4) versus decision (5).** Only class 5 is a *ruling* anybody made.
  Classes 1–4 are things that are simply true, and sending them to a reviewer to
  be adjudicated wastes the review and invites a "fix" to a correct string.

**The termbase owns class 5 and only class 5.**

## What actually drives the count: vocabulary stock, then borrowing policy

The size of the locale-specific residue is a function of how much vocabulary the
two languages already share and how freely the target's technical register
borrows — and of **nothing about translation quality**. Script matters, but
downstream of both: it decides whether a borrowing survives as byte-identical
text at all.

- **Non-Latin target script: near-conclusive.** A cognate is not written in the
  source's alphabet and a genuinely adopted loanword is *transliterated*, so
  neither can be byte-identical. Identity therefore really does mean
  untranslated, and the allowlist stays small — classes 1–3 and little else.
- **Latin target script: noisy by construction**, and unevenly so. A cognate or
  a borrowing keeps its spelling, so a fully correct catalog is legitimately
  identical at those keys. How many depends on the language pair, not on the
  translator.

Measured on one thirteen-locale catalog whose locales were all fully translated:
identity ran **27–29 of 1,506 leaves for the seven non-Latin-script targets and
43–116 for the six Latin-script ones**, the two groups separating perfectly. A
single threshold applied to that catalog reports the spread backwards, ranking
the best-covered locales as the worst.

The spread *within* Latin script is the more instructive half, because it is
almost entirely class 4. The highest-scoring locale ran nearly three times the
lowest, and the difference is shared vocabulary: a target that shares a large
Latin- and Romance-derived stock with the source is identical at *Menu*,
*Total*, *Agent*, *Incident*, *Urgent*, *Configuration*, *Performance*,
*Volume*, *Source*, *Distribution* — every one of them the ordinary native word,
none of them borrowed from the source language, several of them words the source
borrowed in the other direction centuries ago. A Latin-script target with little
shared stock produces a residue of loanwords and skeleton only, and scores near
the non-Latin floor.

So the reviewer's question on each residue entry is not "is this translated?" but
**"is this a fact or a ruling?"** — and only the answers in class 5 go to the
language's terminology and loanword craft, where a borrowing can be argued about
on the merits against the native alternative it displaced. An allowlist
maintained by whoever happened to be unblocking the gate is where class-5
decisions get made silently by someone optimizing for a green build; an
allowlist that sends class-4 cognates to a termbase wastes a reviewer's attention
and eventually gets one of them "corrected" into a worse word. Where allowlist
and termbase disagree about a class-5 entry, the termbase is right and the
allowlist is stale.

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
   classes 1–3 almost by construction, because no single language pair's shared
   vocabulary or borrowing policy can put a key there. Measured on the
   thirteen-locale catalog above, the intersection was **25 keys, and every one
   was legitimate**: product and platform names, integration names, initialisms,
   and pure-skeleton values. Seed the allowlist from it and review it once,
   cheaply.
3. **Sort the per-locale residue before ruling any of it.** What sits above the
   intersection for a given locale is classes 4 and 5 plus real untranslated
   values. Separate cognate from borrowing *first* — a native speaker does this
   fast, and it is the step that keeps the termbase from filling with words
   nobody chose. Only class 5 goes to that language's terminology craft to be
   recorded as a ruling; class 4 goes straight into the allowlist with a note
   saying why, so the next reviewer does not re-litigate it.
4. **Only then turn the gate on.** Enforcing first produces a wall of findings
   that whoever is unblocking CI resolves by adding entries wholesale — which is
   precisely how an allowlist stops being a reviewed artifact.

## Failure modes

- **A threshold instead of a list.** Converts a reviewable claim into an
  unreviewable budget, and misranks locales by script.
- **The gate as accidental terminology authority.** Class-5 entries added under
  build pressure, never seen by anyone who knows the language.
- **Ruling the cognates.** Routing class 4 to the termbase as though it were a
  borrowing decision. There is no decision there to make, the review budget is
  spent for nothing, and sooner or later a reviewer looking for something to do
  replaces the ordinary native word with a worse synonym to make it stop
  matching.
- **Bootstrapping the floor from one locale.** A floor derived from a single
  Latin-script locale over-allows every other locale into silence; derived from
  a single non-Latin one it under-allows and buries the reviewer in false
  findings. Deriving it from a locale that shares heavy vocabulary stock with
  the source is the worst case of all.
- **Reading the signal in the other direction.** A value that *differs* from
  source is not thereby translated — unreviewed machine output, a paraphrase
  left in the source language, and a stale translation all differ. This check
  has exactly one honest reading: identity is evidence of untranslatedness,
  difference is evidence of nothing.
- **Running it where state is stored.** Re-deriving translatedness by comparison
  when the format already records it is strictly worse than reading the record,
  and it silently collapses "untranslated" into the same bucket as "translated,
  pending review."
