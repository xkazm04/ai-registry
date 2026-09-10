---
subject: german
domain: localization
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# german

First touch. External-reconcile wave 2, class B. The wave's only non-CLDR counterpart.

**Pin.** Unicode **17.0.0** UCD — `UnicodeData.txt`, `SpecialCasing.txt`,
`CaseFolding.txt`, `DerivedCoreProperties.txt` (all verified byte-identical to `latest/`),
plus core spec §3.13 and §4.2. File: `spec--capitalization-and-compounds.md`.
**Fate: confirmed on ß→SS, refuted on ẞ, not conformance-testable on the noun rule.**

## Sightings

- **ß→SS is unconditional and language-independent.** `SpecialCasing.txt:69` puts it in
  the *Unconditional* section; the file's only language-conditional entries are `lt`,
  `tr` and `az`, and **`de` appears nowhere in it. A German language tag changes
  nothing.** Verified by the director.
- **ẞ is refuted as reachable.** U+1E9E is a real character but **no default operation
  produces it** — it appears nowhere in `SpecialCasing.txt`, and `UnicodeData.txt` gives
  it a lowercase map to ß while ß has no simple uppercase map at all. The arrow runs one
  way. Core spec §3.13 lists "Uppercasing of U+00DF … to U+1E9E" among the case
  **tailorings** *not* covered by the file, beside Dutch IJ and Greek accent removal.
  Verified by the director.
- **The sharpest finding inverts the technique's own advice.** DE-ESZETT recommends
  applying uppercasing in the presentation layer, one sentence after naming ẞ the
  preferred all-caps variant. But the presentation layer is exactly where the *default*
  mappings run, and they produce `STRASSE`, never `STRAẞE`: of 67 sample strings
  containing no U+1E9E, **0** produce one under uppercase, lowercase, titlecase, full
  folding or simple folding. The correct advice is the inverse — do not uppercase German
  there unless a tailoring is wired and tested.
- **Uppercasing German is lossy and irreversible.** n = 68 strings; **20 change length
  under uppercase and the same 20 fail the upper→lower round trip** (4/23 of the
  technique's own strings, 16/45 of a realistic UI sample). Three pairs collide:
  `{Straße, STRASSE}`, `{Maße, Masse}`, `{schließen, Schließen}`.
- **No single caseless key serves German.** Full folding matches `Straße`/`STRASSE` but
  **merges `Maße`/`Masse`**; simple folding keeps that pair apart but misses
  `Straße`/`STRASSE`. A termbase lookup, a dedup key and a search index cannot all be
  right, and the technique never asks for the choice to be recorded.
- **A derived-property contradiction.** `DerivedCoreProperties.txt` lists U+00DF under
  `Changes_When_Uppercased` (derived from the *full* mappings) while its *simple* mapping
  is identity — so a guard asking "does this change?" gets `yes` and then changes nothing.
  20/68 strings differ between simple and full uppercase, each yielding `STRAßE`-shaped
  mixed-case artifacts.
- **Default titlecasing breaks two of the technique's rules at once**: `KI-gestützt →
  Ki-Gestützt`, `Persona auswählen → Persona Auswählen`.

## Honesty note carried into the document

The UCD ships **no case-conversion or case-folding conformance test** — grep-scoped
against the 17.0.0 `ucd/` listing, which carries normalization, bidi and segmentation
tests and nothing for casing. This is property classification plus an implementation of
§3.13.2 R1–R3, not a conformance run, and the application says so.

**2026-08-29 (cycle) - LANDED.** DE-ESZETT lost its presentation-layer recommendation
and gained the inversion: the default mapping is SS, it is unconditional, no language
tag reaches it, and the capital form needs a tailoring the product wires itself. Added
the lossy-projection paragraph and the simple-vs-full mixed-case trap. New rule
`DE-CASELESS`. DE-CASE gained the titlecase prohibition and the limit of a case-based
audit. Original record below stands.

## Technique-edit candidates (banked for the cycle)

1. **DE-ESZETT: replace the presentation-layer sentence** — it reads as mitigation and is
   the failure mode.
2. DE-ESZETT gains a **caseless-key clause**: which folding a search, termbase or dedup
   key uses must be chosen per surface and written down.
3. DE-CASE gains a **titlecase prohibition**.
4. DE-CASE's noun rule states its limit — a case-based audit reads a character property;
   "every noun is capitalized" is not derivable from it.

## Cross-subject proposals

- The **simple-vs-full folding** disagreement is not German-specific (Greek final sigma,
  Turkish dotted I, the ligature entries). A folding-choice family at a second sighting.
- **`translation-pipeline-topology/source-identical-value-audit`**: an identity comparison
  over a `de` catalog that normalizes case will silently equate `Maße` and `Masse` under
  default folding. Worth a lead in that subject's note.
- **Turkish is absent from the bundle**, and `SpecialCasing.txt`'s `tr`/`az` conditional
  mappings are the sharpest language-sensitive casing data the standard ships — the
  counterpart is already pinned if a Turkish subject is ever forged.

## Could not verify

The technique's claim that the 2024 revision of the official German rule set makes
`STRAẞE` the preferred variant, and the 2017 officialization — an orthography-council
fact outside the Unicode pin, not asserted in the application. Whether CLDR ships a `de`
case tailoring mapping ß→ẞ: the core spec names CLDR as the preferred mechanism for such
tailorings but does not assert one exists. **That is the obvious next fetch** and would
close the loop.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/german",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:4064dd5efac82fec",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 5 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Speichern is a register-neutral infinitive label; Stelle beschreiben is infinitive but Stelle alone can also be a noun, while Speichere is an imperative.",
    "STRASSE remains permitted; preserving Straße in storage makes a lossy display projection manageable.",
    "Die API and die APIs show that an abbreviation can participate in German noun grammar."
  ],
  "sources": [
    {
      "path": "knowledge/localization/european/german",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.rechtschreibrat.com/DOX/RfdR_Amtliches-Regelwerk_2024.pdf",
      "scope": "Official 2024 rule search excerpt confirms SS remains allowed alongside capital sharp s."
    },
    {
      "url": "https://www.duden.de/sprachwissen/rechtschreibregeln/Gro%C3%9F-%20und%20Kleinschreibung",
      "scope": "Primary Duden rule example uses inward guillemets in German."
    }
  ],
  "documents": {
    "german.md": {
      "disposition": "reverify",
      "reason": "Golden path overstates obligatory Sie, identical English/German plural behavior including visible 1.0, no ordinal branching, unbreakable compounds and no bidi/shaping. Wrong prepositions can change meaning, and an anchor does not prove a defect. Regional vocabulary and formatting need a market contract."
    },
    "techniques/capitalization-and-compounds.md": {
      "disposition": "clarify",
      "reason": "Repaired mandatory ban on default uppercase despite permitted SS, folding distinctions treated as unique, colon phrase lowercasing and hyphen-count diagnosis. Preserve original text and select comparison semantics explicitly."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Nominal style and repeated stems are candidates, not proof of error; Wir can invent agency and Belegbare Nachweise is not necessarily tautological. Collocation recasts must preserve technical confidence-interval meaning. House anchor IDs do not establish universal grammar."
    },
    "techniques/length-and-compression.md": {
      "disposition": "clarify",
      "reason": "Repaired universal expansion budget, no compound wrapping, automatic hyphenator ban and required compression of every sibling. Measure real layout and preserve meaning."
    },
    "techniques/register-and-address.md": {
      "disposition": "clarify",
      "reason": "Repaired B2B mandates Sie, infinitive example actually imperative, universal drift distribution and missing gender policy forbids any correction. Scope address and voice decisions to actual audiences/surfaces."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "clarify",
      "reason": "Repaired acronyms cannot take articles/plurals, all loan gender uniquely fixed, English -ies never accepted and frequency overrides approved terminology. Distinguish lexical loans from literal identifiers."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "Repaired guillemets excluded outside Switzerland, automatic punctuation sweeps, precomposed-only umlauts and no mixed-direction/font concerns. Keep regional/house conventions explicit."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "reverify",
      "reason": "Historical kp counts and cited rule IDs are retained, not independently rerun. More hyphens than English or similar dash counts do not prove a calque. Partial correction is not inherently worse than error; published absolute checkout paths remain cleanup work."
    },
    "applications/process--register-and-address.md": {
      "disposition": "reverify",
      "reason": "Historical Personas/kp register policies retained, not reread in consumers. These examples support recorded policy, not all professional products choosing Sie. Missing gender ruling need not block unrelated grammar fixes. Absolute fleet roots remain cleanup work."
    },
    "applications/spec--capitalization-and-compounds.md": {
      "disposition": "reverify",
      "reason": "Historical Unicode harness not rerun. The shown mappings support default SS and loss of distinction, but SS is permitted orthography and display transformation can preserve original storage. Simple/full mapping mismatch is defined behavior, not a contradiction. Case-fold choice can legitimately be shared across surfaces."
    }
  }
}
```

## 2026-09-10 — re-review after the compression revert

Read all ten owned documents at their restored bytes. Primary sources fetched and read
this session: CLDR `release-48-2` `common/supplemental/plurals.xml` and
`ordinals.xml`. The 2024 Amtliches Regelwerk was pursued and only partially resolved
(below). Nothing was executed — the UCD case-mapping harness recorded in the spec
application was not re-run, and no case function was called.

**Retraction of the 2026-09-10 external-reconcile record below.** It describes the
compressed documents, which were reverted; its digest no longer matches. Its
per-document verdicts are withdrawn. Two of its lines also do not survive a read of
the restored text: *display transformation can preserve original storage* is precisely
what the spec application refutes (the presentation layer is where the default ß→SS
mapping runs, and DE-ESZETT now says so in bold), and *case-fold choice can
legitimately be shared across surfaces* is not in conflict with DE-CASELESS, which
asks for the choice to be **recorded**, not to differ.

**Finding 1 — the golden path's plural boundary says the opposite of what CLDR says.**
`german.md` reads: *German's CLDR cardinal categories are one / other — the same two
as English, with the same boundary (exactly 1, including 1.0 contexts by the same rule
English uses)*. `plurals.xml` puts `de` in the block
`ast de en et fi fy gl ia ie io ji lij nl sc sv sw ur yi` whose `one` rule is
**`i = 1 and v = 0`**. A value rendered as *1,0* has `v = 1` and selects `other`, in
German exactly as in English. *Including 1.0 contexts* reads as asserting that 1.0 is
in `one`, which is false; at best the parenthetical is ambiguous. This matters more
here than it would in another bundle, because the sibling Czech subject spends an
entire spec application establishing that the visible-fraction operand is the whole
game, and a reader moving between the two gets contradictory instincts. The rest of
the paragraph — that the branch *set* matches English one-to-one and that the trap is
copied branch bodies — is right and worth keeping.

**Finding 2 — the rule about asymmetric quote pairs is violated by its own heading.**
`typography-and-spacing.md` line 43 reads `## DE-QUOTES · German quotes are
„low-high"` — the closer is ASCII U+0022, not U+201C (verified by code-point
inspection; the body's *„Beispiel“* on line 47 uses the correct pair). The rule's own
text names this exact defect: *the recurring defect is asymmetric pairs from
copy-paste — a correct „ opener closed with a straight " — which survives visual
review because one glyph looks right*. One character, and the document currently
demonstrates the failure it teaches.

**Finding 3 — the 2024 ẞ claim is substantially right and its citation is not
verified in primary form.** DE-ESZETT says the capital ẞ *is the preferred variant
since the 2024 revision of the official rule set (STRAẞE preferred, STRASSE still
permitted)*. Secondary sources agree that §25 E3 was inverted in the 2024 Regelwerk,
now reading *Bei Schreibung mit Großbuchstaben ist neben der Verwendung des
Großbuchstabens ẞ auch die Schreibung SS möglich* against the 2016/2018 *schreibt man
SS. Daneben ist auch die Verwendung des Großbuchstabens ẞ möglich*. That inverts the
order of mention and leaves both permitted. It does not contain the word *preferred*.
The Rat's own change-overview PDF would settle it and I could not extract its text.
The safe restatement is what the rule text does: ẞ is now named first, SS remains
permitted.

**Verified and left alone.** `de` ordinals are a single `other` category, so *no
ordinal branching is ever needed* is exact. DE-CASELESS, the inverted
presentation-layer advice, the simple-mapping trap and the lossy-projection framing
are all present and all match the spec application that produced them.

**Not resolved.** DIN 5008 (behind DE-NBSP, including the space before %) is a paid
standard and was not read. The vendor style guide cited by DE-CALQUE-PREP, DE-FORMAL,
DE-DASH and DE-LOANWORD was not retrieved; several rules honestly mark themselves
*house-style class rule* where no authority backs them, which is the right disclosure.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/german",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:900b0980558b6c24",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at restored bytes; the DE-QUOTES heading checked by code point, not by eye. CLDR release-48-2 plurals.xml and ordinals.xml fetched and read this session; the 2024 Amtliches Regelwerk pursued and resolved only through secondary reporting. No software executed: the UCD case-mapping implementation, its 68-string round-trip and collision runs and the titlecase probe were not re-run, and no runtime case function was called. The two process applications are 2026-08-24 field records of two repos and were assessed as records. DIN 5008 and the vendor style guide were not retrieved.",
  "counterexamples": [
    "A German price or measure formatted with two fraction digits renders 1,00, which CLDR routes to other; a reader following the golden path's including 1.0 contexts writes that string into the one branch and it never renders.",
    "DE-NBSP mandates U+00A0 between number and unit, but real amounts are formatted at runtime by locale machinery that supplies its own separator - the rule never says what happens at the seam where a hardcoded NBSP meets a formatter-emitted one.",
    "DE-CASELESS requires a per-surface folding choice and gives no rule for the common case where one surface feeds another, so a termbase lookup and the search index built from it inherit two different keys with no stated owner.",
    "DE-GENDER's finding shape is no ruling exists, which an auditor can file but a translator finishing a batch today cannot act on; the technique offers a ranked fallback chain only as a parenthesis."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/plurals.xml",
      "result": "Established that de shares a block with en whose one rule is i = 1 and v = 0, so a value with a visible fraction digit selects other in both languages. This refutes the golden path's parenthetical as written and confirms the branch-set-matches-English claim it sits inside."
    },
    {
      "url": "https://raw.githubusercontent.com/unicode-org/cldr/release-48-2/common/supplemental/ordinals.xml",
      "result": "Established that de is in the other-only ordinal block, confirming that no ordinal branching is needed. It says nothing about the digit-plus-period rendering, which is a formatting convention the file does not carry."
    },
    {
      "url": "https://de.wikipedia.org/wiki/Gro%C3%9Fes_%C3%9F",
      "result": "Reported that the 2024 Regelwerk inverted the order of mention in the all-caps rule so that the capital sharp s is named first and SS remains possible. It is a secondary source: it did not give the primary rule text, and it does not establish the word preferred. The Rat's own change-overview PDF was fetched and its text could not be extracted."
    }
  ],
  "documents": {
    "german.md": {
      "disposition": "clarify",
      "reason": "Its plural parenthetical - exactly 1, including 1.0 contexts - reads as putting a visible-fraction value in the one category, which CLDR's i = 1 and v = 0 rule excludes. The surrounding claims about matching branch structure and copied branch bodies are correct and should survive the fix."
    },
    "techniques/typography-and-spacing.md": {
      "disposition": "clarify",
      "reason": "DE-QUOTES's own heading closes a low opening quote with ASCII U+0022, which is the asymmetric-pair defect the rule's body names two lines later. One-character fix. Everything else - dash default with its recorded-ruling exception, ellipsis, NBSP with the degree and narrow-space exceptions, DE-UMLAUT - is sound; DIN 5008 remains unread."
    },
    "techniques/capitalization-and-compounds.md": {
      "disposition": "reverify",
      "reason": "The Unicode half is strong and matches its spec application - unconditional SS mapping, no German language lane, the inverted presentation-layer advice, DE-CASELESS, the simple-mapping trap, the titlecase damage. The orthography half rests on one claim I could not confirm in primary form: that the 2024 revision makes the capital sharp s preferred. Secondary reporting supports an inversion of the order of mention, not the word preferred. Read the 2024 Regelwerk paragraph 25 E3 and either cite it or restate the rule as named-first and both-permitted."
    },
    "techniques/register-and-address.md": {
      "disposition": "keep",
      "reason": "The address contract, the two independent formality axes, the anthropomorphism bound and DE-GENDER's honest position - no authority to cite, therefore the anchor is the recorded house decision - are each stated with their limits and their over-application exceptions."
    },
    "techniques/de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Four anchors, each with an exception found by over-applying it, and two of them explicitly marked house-style class rules where the vendor guide defers rather than pretending an authority exists. The pass ordering derives severity from the rule cited rather than the reviewer."
    },
    "techniques/length-and-compression.md": {
      "disposition": "keep",
      "reason": "A five-lever hierarchy ordered by meaning preserved, DE-FIT's flag-do-not-truncate rule with its source-defect escalation, and the compounds-do-not-wrap consequence. The 20 to 35 percent figure is presented as a budget, not a measurement."
    },
    "techniques/terminology-and-loanwords.md": {
      "disposition": "keep",
      "reason": "DE-LOANWORD's four grammar obligations with the noun-loans-are-cheap-verb-loans-are-expensive corollary, the near-synonym drift pairs, and the count-before-ruling border heuristic. The frozen-identifier exception correctly separates quoted foreign material from loanwords."
    },
    "applications/process--de-anglicization-constructions.md": {
      "disposition": "keep",
      "reason": "Dated 2026-08-24 record of where the DE anchors were minted, with the dash and hyphen counts that made them findings and the explicit leaving-unanchored-strings-alone discipline. Not re-verified against kp."
    },
    "applications/process--register-and-address.md": {
      "disposition": "keep",
      "reason": "Two catalogs, the same predicted drift in different conversational surfaces, and the inclusive-form audit that correctly produced a ruling request rather than edits. Historical, not re-run."
    },
    "applications/spec--capitalization-and-compounds.md": {
      "disposition": "keep",
      "reason": "Pins the UCD rows the whole argument rests on, refutes the presentation-layer advice with a counted run, and states plainly that no case-conversion conformance file exists so nothing here is a conformance pass. It is the record that makes DE-ESZETT's Unicode half trustworthy; it is silent on the orthography claim, which is why that one is reverify above."
    }
  }
}
```
