---
layer: technique
type: technique
subject: bengali
technique: bengali-script-and-numerals
status: forged
laws: [the-authority-is-a-hypothesis, format-skeleton-is-inviolable]
shared_with: []
use_when: [auditing Bengali punctuation and digit script, reviewing loanword spellings for conjunct or nukta drift, debugging broken ligatures in transliterated words]
---

# Bengali script and numerals

Bengali script (Bangla lipi) is a left-to-right abugida: consonants carry an
inherent vowel, other vowels attach as signs (matras) above, below, before or
after the base, and consonant clusters fuse into conjuncts. None of that needs a
localizer's intervention — fonts and shaping engines do it — but it creates a
short list of places where the *encoding* of a string can be wrong while the
rendered text looks plausible, and those are exactly what an audit must check.

## BN-DARI · sentence-ender is ।, not the Latin period

**Rule.** A Bengali sentence ends in the daṛi (danda) **।** U+0964. The Latin
period is reserved for abbreviations, decimals, and text inside code, URLs and
addresses. Bengali has no native question or exclamation mark: reuse the Latin
**?**, and avoid **!** in UI copy altogether — the formal imperative ending
already supplies a button's urgency, and calm error copy needs no exclamation.

**Source.** Microsoft's Bangla style guides and Mozilla's bn-BD guide; a mature
catalog showed over a thousand daṛi uses as the settled pattern.

**Trigger.** A Latin `.` at end of a Bengali sentence; any `!` in UI copy.
Fragments (labels, menu items) take no terminal punctuation at all — do not
"complete" them with a daṛi.

## BN-DIGITS · Bengali digits for quantities, Latin for identifiers

**Rule.** A number that is a *quantity in prose* — counts, durations,
percentages, money amounts written into a sentence — uses Bengali digits ০-৯
(২৪ ঘণ্টা, ৫০%). A number that is an *identifier* stays Latin: ports, IPs,
version strings, cipher names, aspect ratios, and anything a placeholder will
inject at runtime (the runtime's own formatter decides that script — never
hardcode either script into a value destined for a placeholder). Digit grouping
follows the South Asian lakh/crore pattern (১০,০০,০০০), which locale-aware
formatters produce for bn.

**Never mix scripts on one token**: a Latin digit glued to a Bengali classifier
(1টি) is a visible bug, observed shipped, not a pattern.

**Source and the disagreement.** The authorities genuinely split here: Mozilla's
bn-BD guide says numbers stay untranslated (Latin), while Bengali print
convention, the encoding standards and worked software catalogs use Bengali
digits in prose — a reconciled consumer catalog applies Bengali digits
consistently, down to ৫০% and $০.০১. Per
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis),
the catalog's counted, coherent convention wins; this rule records the settled
software answer *and* the disagreement, so no later review re-litigates it. A
product may rule the other way — all-Latin digits — but only catalog-wide and
recorded.

## BN-NUKTA · ড়, ঢ়, য় are letters, and each has two encodings

**Rule.** The three nukta-class letters — ড় (ṛa), ঢ় (ṛha), য় (ẏa) — are
distinct letters, not optional decorations of ড, ঢ, য. Two defect modes:

- **Wrong letter.** Loanwords and native words that need য় or ড় written with
  bare য or ড (or vice versa). দাঁড়ান with ড is a different, wrong word; the
  glide in transliterations of English "-yo-", "-ia-" sequences is য়, not য.
- **Split encoding.** Each has a precomposed code point (U+09DC/09DD/09DF) *and*
  a base + nukta (U+09BC) sequence — and the precomposed forms are Unicode
  composition exclusions, so NFC normalizes to the *decomposed* sequence. A
  catalog whose tooling does not normalize can ship the same word in two
  encodings that render identically and match nothing: terminology checks,
  deduplication and grep all silently miss. Pick NFC at every write path and
  audit boundary.

**A fourth split encoding that normalization does NOT repair: khanda ta.** ৎ has
a modern single code point and an older spelling as *ta + virama + zero-width
joiner*, and unlike the three nukta letters it carries **no canonical
decomposition** — so the two spellings are unequal under every normalization
form, NFC included. The same silent failure follows (two encodings, identical
rendering, zero matches), and it is live: khanda ta sits in the locale's main
exemplar set, not in a legacy corner. Normalization is necessary here and not
sufficient; this one needs a literal check for the joiner sequence.

**Normalize with NFC, never NFKC.** The compatibility forms collapse distinctions
this bundle depends on — NFKC rewrites the ellipsis … into three ASCII periods,
undoing BN-ELLIPSIS at the very write path this rule tells you to normalize at.

**Trigger.** Any string failing an NFC-idempotence check; **plus an explicit
search for the joiner spelling of khanda ta, which that check cannot see**;
termbase terms that occur zero times in a catalog known to contain them (the
classic symptom of split encoding).

## BN-ZWJ · the র‍্য cluster in loanwords needs a joiner

**Rule.** English loanwords with an initial "r + ya" cluster — ram, rank, wrap,
rapid — transliterate with **র + ZWJ (U+200D) + ্ + য** (র‍্যাম, র‍্যাঙ্ক, র‍্যাপ):
the ZWJ forces the visible ্য form after র instead of the repha ligature, which
would render the word unreadable. This is Bengali's one genuinely load-bearing
invisible character. ZWNJ (U+200C) has no established role in Bengali UI text —
its presence is almost always paste debris to strip.

**Trigger.** Mechanical: any occurrence of র followed directly by ্য inside a
transliterated loanword is a candidate for a missing ZWJ; copy the joiner
pattern from the termbase's canonical spelling rather than re-deriving it.

## BN-LATINSUFFIX · hyphen between a Latin token and a Bengali suffix

**Rule.** When a Bengali case ending or postposition attaches to a Latin-script
token — a brand name, an acronym, a placeholder — insert a hyphen: API-এর জন্য,
{name}-কে, {seconds}s-এ. Never bare concatenation (script collision, shaping
risk) and never a space (detaches the suffix into a nonsense word). The
placeholder case is where this touches
[the format skeleton](../../../_laws.md#format-skeleton-is-inviolable): the
suffix and hyphen sit *outside* the braces; the placeholder name itself is
untouchable.

**Trigger.** A Bengali suffix morpheme (এর, কে, টি, তে, এ…) directly adjacent to
a Latin character or closing brace with neither hyphen nor space.

## BN-ELLIPSIS · one glyph, not three periods

**Rule.** Progressive/truncation ellipsis is the single glyph **…** (U+2026),
never `...`. A real catalog audited for this subject shipped both variants in a
2:1 ratio — drift, not policy — and the cheapest time to hold the line is at
string-write time, because a mixed catalog invites every new string to copy its
nearest neighbor. Straight ASCII double quotes are the settled quote convention
(Bengali has no native quotation glyph); curly quotes are noise to normalize.

## What this technique does not cover

Which digits or spellings a specific term uses is the termbase's row; classifier
morphology is classifiers-and-quantity; line-breaking and vertical metrics are
ui-conventions-and-length. Bengali is LTR — no bidi controls ever apply, and any
RLM/LRM found in a bn string is imported debris.
