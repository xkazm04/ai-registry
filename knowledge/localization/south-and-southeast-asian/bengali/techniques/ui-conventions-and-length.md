---
layer: technique
type: technique
subject: bengali
technique: ui-conventions-and-length
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [budgeting width and line-height for Bengali UI text, shortening Bengali strings for buttons and narrow columns, reviewing wrapped or clipped Bengali layouts]
---

# UI conventions and length

Bengali's space problem is misdiagnosed when measured in characters. A worked
~9,000-pair catalog put Bengali at roughly **8% longer than English by raw
character count** — mild, by localization standards — yet Bengali UIs clip and
wrap more than that number predicts, because the script spends its ink in two
dimensions. Conjuncts fuse consonants into wide compound glyphs; vowel signs and
the ref stack *above* the headline and descend *below* the base. Per rendered
glyph, Bengali runs visually wider than Latin at the same nominal size, and
taller in both directions.

## BN-LENGTH · budget width beyond the ratio, and height explicitly

**Rule.** Treat the measured character-count ratio as a floor, not the budget.
For surfaces that cannot reflow — buttons, tabs, chips, table headers, badges —
assume Bengali needs meaningfully more horizontal room than an 8% ratio
suggests, and verify with rendered pixels, not code-point counts. Vertically:
Bengali needs line-height headroom for stacked matras and descenders; a
line-height tuned tight on Latin text clips ূ, ৃ and conjunct depth. A clipped
matra is a rendering defect to report against the layout, not something to
translate around by hunting for matra-free synonyms.

Two structural facts feed every width estimate. The classifier adds a syllable
to every counted noun (BN-CLASSIFIER) — mandatory grammar, never droppable for
space. And the formal -উন imperative is itself compact: the register costs no
width, so register is never the right thing to sacrifice.

## BN-BUTTON · shortest correct formal verb, nothing else

**Rule.** A button is the shortest verb phrase that is correct in the আপনি
register: সংরক্ষণ করুন or the established bare noun form, not a fuller
sentence-like phrase; মুছুন, not a paraphrase of "delete the selected item".
Do not append objects the surrounding UI already names. A button that wraps is
a bug — either the string has excess words to cut, or the layout owes the
script room (BN-LENGTH decides which; count the words first). No terminal
punctuation, no daṛi, on button labels or other fragments.

**The compression order** when a string must shrink, safest first: drop
restatable objects the screen already shows; choose the borrowed noun over the
native paraphrase (below); recast light-verb compounds to their shortest
settled form. Never: drop the classifier, drop the formal ending, or abbreviate
a Bengali word mid-token — Bengali has no productive UI-abbreviation
convention, and an invented truncation is gibberish, not shorthand.

## BN-NARROW · on width-constrained surfaces, the borrowed word wins

**Rule.** When a native phrase and a transliterated loanword are both viable
renderings, pick the loanword for width-constrained surfaces — tab labels,
chips, table headers, badges, counters — and reserve the fuller native phrasing
for body copy and help text, where wrapping is expected and cheap. The borrowed
word is usually shorter *and* it matches the loanword policy's dominant bucket,
so this rule almost never conflicts with the termbase; where the termbase has
settled a native rendering (BN-LOAN bucket 4), that rendering stands on every
surface — the termbase outranks the width preference, and the layout absorbs
the cost.

**Trigger.** A narrow-surface string using a multi-word native paraphrase where
the termbase holds a settled short loanword; or the inverse "improvement" — a
reviewer replacing a settled compact loanword with a literary native phrase for
elegance, which is a register regression *and* a width regression at once.

## BN-WRAP · Bengali wraps at spaces — protect what must not split

**Rule.** Bengali breaks lines at word boundaries (spaces and after daṛi), like
Latin and unlike CJK — ordinary text needs no break hints. What must never
split: the numeral/placeholder + classifier token (১০টি is one word — keep it
unbroken, with a no-break space before a following counted noun where the
layout tends to orphan the number); a Latin token from its hyphen-attached
Bengali suffix (API-এর breaking after the hyphen strands এর as a nonsense
line-opener); and code, versions and URLs, which stay unbroken per the general
convention. Shaping is the renderer's job — never insert manual breaks, ZWSP,
or (worse) ZWNJ inside a Bengali word to steer wrapping; a string needing that
is a layout defect.

**Trigger.** A line break landing inside a number+classifier token or between
a hyphenated Latin+suffix pair in rendered review; any zero-width character
inside a Bengali word that BN-ZWJ does not account for.

## When not to over-apply

Length discipline governs constrained surfaces. Body copy, help text,
confirmations and empty-state prose should be written for clarity at natural
length — compressing them to button register makes a product read terse and
under-translated, and Bengali's formal register tolerates fuller sentences
well. And no length rule ever outranks grammar: a string that fits by dropping
its classifier or its verb ending has not been shortened, it has been broken —
a finding under this technique must cite space *and* preserve every anchor the
grammar techniques own.
