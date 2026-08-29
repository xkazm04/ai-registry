---
layer: application
type: application
subject: german
technique: capitalization-and-compounds
stack: spec
source: unicode/ucd@17.0.0
status: forged
verified_on: 2026-08-29
---

# DE-CASE and DE-ESZETT against the Unicode case mappings (UCD 17.0.0)

## The pin

Publisher: Unicode, Inc.; Unicode **17.0.0**. Data files retrieved **2026-08-29** from
`https://www.unicode.org/Public/17.0.0/ucd/<file>` (byte-identical to the `latest/` copies,
verified with `cmp`); sha256 prefixes and header dates: `UnicodeData.txt` `2e1efc1dcb59c575`
(no header), `SpecialCasing.txt` `efc25faf19de21b9` (2025-07-31), `CaseFolding.txt`
`ff8d8fefbf123574` (2025-07-30), `DerivedCoreProperties.txt` `24c7fed1195c482f`
(2025-07-30). Normative prose: the 17.0.0 core specification, **§3.13 Default Case
Algorithms** (§3.13.1 definitions, §3.13.2 rules R1–R3, §3.13.3 default case folding) and
**§4.2 Case** (Table 4-3), under `https://www.unicode.org/versions/Unicode17.0.0/core-spec/`
(`chapter-3/`, `chapter-4/`), same date. Artifacts and harness in `C:/tmp/rec/w-german/`.

**The rows it all rests on.** `UnicodeData.txt:224` — `00DF;LATIN SMALL LETTER SHARP S;Ll;…`
with the uppercase, lowercase and titlecase fields all **empty**: ß's *simple* mappings are
identity.
`SpecialCasing.txt:69`, in the file's **Unconditional mappings** section, gives the full
mappings `00DF; 00DF; 0053 0073; 0053 0053` — full lowercase ß, full titlecase `Ss`, full
uppercase **`SS`**. `UnicodeData.txt:7061` — `1E9E;LATIN CAPITAL LETTER SHARP S;Lu;…`,
simple lowercase `00DF`, and **no** `SpecialCasing.txt` row at all. `CaseFolding.txt:121`
folds ß with status `F` to `0073 0073`; `:734`/`:735` fold ẞ with `F` to `0073 0073` and
with `S` to `00DF`.

## Confirmed and sharpened — uppercasing German is lossy and irreversible

DE-ESZETT's "in all-caps contexts" advice sits on an operation the standard defines as
length-changing and one-way. Executed over the technique's named strings plus a realistic
German UI catalog, using only the parsed tables above: **n = 68 distinct strings
(23 named by the technique, 45 UI sample). 20 change length under toUppercase; the same 20
fail the uppercase→lowercase round trip — 4/23 of the technique's strings and 16/45 (35.6%)
of the UI sample.** `Straße → STRASSE → strasse`; `Fußzeile bearbeiten → FUSSZEILE
BEARBEITEN → fusszeile bearbeiten`. Every failure is a ß, and §4.2 Table 4-3 names the
language: the single-character mappings "are insufficient for languages such as German".
Three pairs collide under toUppercase — `{Straße, STRASSE}`, `{Maße, Masse}`, `{schließen,
Schließen}`. All-caps German is a projection that discards a lexical distinction.

## Refuted — "apply uppercasing in the presentation layer" is not the safe half

DE-ESZETT recommends presentation-layer uppercasing over stored shouting case, right after
saying ẞ is the preferred all-caps variant. The presentation layer is exactly where the
*default* mappings run, and they never produce ẞ. **Executed: of the 67 sample strings
containing no U+1E9E, 0 produce a U+1E9E under toUppercase, toLowercase, toTitlecase, full
folding or simple folding.** Nothing in the UCD maps ß to ẞ in any direction; the arrow
runs only ẞ→ß (`UnicodeData.txt:7061`). Core spec §3.13 says so in as many words:
"Uppercasing of U+00DF … to U+1E9E" appears in its list of case **tailorings** *not*
covered by `SpecialCasing.txt`, beside Dutch IJ and Greek accent removal, with CLDR the
preferred mechanism for specifying them. Nor is there a German lane to it:
`SpecialCasing.txt`'s condition lists name exactly three languages — `lt`, `tr`, `az`
(plus the context condition `Final_Sigma`); `de` appears nowhere in the file.
**The ß→SS mapping is unconditional and language-independent — a `de` tag changes nothing
about it.** So `STRAẞE` needs a tailoring the product supplies, and the layer the technique
steers work toward is the one that silently emits `STRASSE`. Invert the advice: do not
uppercase German in the presentation layer unless a tailoring is wired and tested.

## Sharpened — no single caseless key serves German

Full folding maps both ß and ẞ to `ss`; simple folding maps ẞ to ß, ß to itself. Over n=68:

| key | `Straße` = `STRASSE`? | `Straße` = `STRAẞE`? | `Maße` = `Masse`? | colliding keys |
| --- | --- | --- | --- | --- |
| full case folding (§3.13.3) | yes | yes | **yes** | 3 |
| simple case folding | **no** | yes | no | 2 |

The default folding a case-insensitive search or a dedup key reaches for merges a German
minimal pair; the folding that keeps the pair apart misses `Straße`/`STRASSE`. A termbase
lookup, a dedup key and a search index cannot all be right — the choice is per surface, and
DE-ESZETT does not ask for it to be recorded.

## Sharpened — the simple-mapping trap produces mixed case, not wrong case

Code that uppercases per code point from `UnicodeData.txt` alone (any per-character
`toupper`) leaves ß untouched: **20/68 sample strings differ between simple and full
uppercase, every one yielding an artifact like `STRAßE`, `GROß`, `MAßE`.** The derived
properties make this a contradiction rather than a shortfall: `DerivedCoreProperties.txt`
lists U+00DF under `Changes_When_Uppercased`, `Changes_When_Titlecased` and
`Changes_When_Casefolded` — all derived from the *full* mappings — while its simple
mappings are identity. A guard asking "does this change when uppercased?" and then applying
a simple mapping gets `yes` and changes nothing.

## Sharpened — default titlecasing damages both of the technique's casing rules

R3 titlecases the first cased character after each word boundary and lowercases the rest
(boundaries approximated here by maximal alphabetic/Mn/Nd runs — UAX #29 was not pinned;
the approximation is declared and agrees with it on this hyphen-and-space sample).
`KI-gestützt → Ki-Gestützt` destroys the abbreviation joint DE-HYPHEN calls legitimate;
`Persona auswählen → Persona Auswählen` is exactly the English Title Case DE-CASE forbids.

## Not conformance-testable — DE-CASE's noun rule

§4.2 opens by defining case as "a normative property of characters". The standard assigns
`General_Category` Lu/Ll/Lt and the derived `Uppercase`/`Lowercase`/`Cased` properties to
code points; it has no notion of part of speech. A case-based audit can decide only whether
a letter is Lu/Lt — for `Skill Bibliothek` it sees capitals at `S` and `B` and cannot tell
that the space between them is the defect. DE-CASE's own semantic trap ("capitalization
alone can never tell you whether a word is a brand or an ordinary noun") is that limit from
the other side, and it belongs to the standard, not the implementation.

## What this is, honestly

The case mappings are property data. The 17.0.0 UCD listing carries `NormalizationTest.txt`,
`BidiTest.txt`, `BidiCharacterTest.txt` and four segmentation tests under `auxiliary/` —
and **no test file for case conversion or case folding**. So nothing here is a conformance
run and no suite passed: this is property classification plus an implementation of §3.13.2
R1–R3 and §3.13.3 over the pinned tables, validated against the files themselves (40,575
`UnicodeData.txt` rows; 103 unconditional + 16 conditional `SpecialCasing.txt` entries;
1,481/104/31 `CaseFolding.txt` C/F/S rows; 27 special entries confirmed to override a simple
uppercase map per §3.13.1; `fold(X) == fold(lower(X))` across U+0041–U+017F, U+0130 the sole
exception). No runtime case function is used in any mapping path — the interpreter's tables
are Unicode 15.0.0, two versions behind the pin, compared only as a side check.

## Fates

- **DE-ESZETT, ß→SS is not fold-to-ss-in-de**: confirmed, and shown to be *unconditional*.
- **DE-ESZETT, ẞ in all-caps**: confirmed as a character; **refuted as reachable** — it is
  a named tailoring, and the technique's presentation-layer advice lands on the default.
- **DE-CASE, noun capitalization as a mechanical signal**: not conformance-testable.
- **DE-HYPHEN / DE-COUPLING compound rules**: passed over — the mappings say nothing about
  compound formation; only the titlecase interaction above is in scope.
