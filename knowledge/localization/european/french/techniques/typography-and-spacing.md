---
layer: technique
type: technique
subject: french
technique: typography-and-spacing
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [sweeping a French catalog for punctuation and spacing defects, choosing the non-breaking space policy for a French locale, reviewing quotes dashes and apostrophes in French strings]
---

# Typography and spacing

French punctuation is codified to the character. That makes this the highest-
yield technique in the subject: most of its rules are mechanically checkable,
mechanically fixable, and their violations arrive in bulk when copy passes
through an English pipeline. Run this layer first — it clears the noise before
any construction or terminology review, and its sweeps are the safest kind
because a fix never touches meaning.

## FR-APOS · Curly apostrophe, always

> **Rule** — use **’** (U+2019). The straight `'` is a typewriter artifact and
> the single most visible tell of English-pipeline copy.
> **Source** — Microsoft French style guide §4.1.14 (apostrophe): curly in
> general, straight only where a technical constraint requires it.
> **Exception** — code, identifiers and technical literals keep whatever the
> syntax demands.

A real-world catalog measured at the moment this rule was adopted held straight
apostrophes in roughly a quarter of its keys and not one curly — total
non-compliance, invisible to every non-French reviewer. The fix is a sweep, but
time it deliberately: converting a catalog that is 87% straight one namespace
at a time produces a mixed catalog, which is worse than a consistently wrong
one. One decision, one complete pass.

## FR-SPACE · Non-breaking space before two-part punctuation and inside guillemets

> **Rule** — French sets a space **before** `;` `:` `!` `?` and **inside**
> `« »`, and that space must not break the line — a lone `?` opening a line is
> the failure this rule exists to prevent. Use a non-breaking character, never
> a plain space and never nothing.
> **Source** — Microsoft French style guide §4.1.14; the Imprimerie nationale's
> traditional rules, which distinguish a *fine* (narrow) space before `; ! ?`
> from a word space before `:`.
> **Exception** — the character choice is a house decision. U+202F (narrow
> no-break) is the typographically finer choice and renders reliably in modern
> UI stacks; U+00A0 (no-break space) is the pragmatic default with the widest
> font support. Both are correct French; a **mix** is not. Pick one, record it,
> normalize — an audited catalog was found running three-way (some U+202F, some
> plain breaking space, none U+00A0), which is two defects, not a compromise.

The insidious variant is the plain space: visually identical to the correct
character in most editors, wrong at line-break time. Audits must check the code
point, not the rendering.

## FR-UNIT · Non-breaking space between number and unit or symbol

> **Rule** — a number and its unit or symbol are bound by a non-breaking space:
> *42 %*, *3 h*, *10 €*, *45 min*. The percent sign is the high-frequency case
> in product UI and is where the gap concentrates, because English sets `42%`
> closed up.
> **Source** — Imprimerie nationale convention, universal in French
> typography; use the same character (U+202F or U+00A0) the FR-SPACE house
> decision picked.
> **Exception** — none for prose and stat surfaces. Dense data tables may
> record a deliberate exemption, but record it — this rule was minted precisely
> because a catalog carried the punctuation spacing rule and had nothing
> citable for units, so unit findings kept dying as taste.

That minting is the pattern
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)
prescribes: a real defect with no rule gets the rule written, and the next
thousand strings are auditable.

## FR-DASH · The em dash is not French punctuation

> **Rule** — replace **—** in prose with a period, a comma pair, a colon, or
> parentheses. Where the emphasis is worth keeping, the **en dash –** is the
> French device — and even it is a stylistic minority; the guide calls it more
> fluid and casual than a colon. The en dash survives uncontested only in
> number ranges (*3–5 jours*).
> **Source** — Microsoft French style guide §4.1.14 (dashes).
> **Exception** — a house may ban dash-as-punctuation outright, converting even
> en dashes to recasts; that is a legitimate tightening. The mechanical
> half-step (— → –) is safe to sweep; choosing between comma, colon and
> parentheses for each site is judgment and deserves a human pass.

A catalog carrying nearly the same em-dash count as its English source has been
copied, not localized — the count itself is the audit.

## FR-SEMICOLON · Don't

> **Rule** — no semicolons in UI prose. Two short sentences read better, and
> the semicolon drags the mandatory pre-punctuation space with it besides.
> **Source** — Microsoft French style guide §4.1.14, stated flatly.
> **Exception** — enumerations in legal text keep their semicolons; that is
> genre, not UI prose.

## FR-ELLIPSIS · The glyph, not three periods

> **Rule** — use **…** (U+2026), never `...`. *Chargement…*, *Recherche…*
> **Source** — standard French typesetting; shared with good English
> typography, but French catalogs inherit the three-period form from source
> strings at scale, so it is worth its own anchor.
> **Exception** — none. When touching a string that carries `...`, fix it; a
> catalog-wide conversion is a separate, recorded sweep — per
> [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched),
> spot fixes ride existing edits, bulk fixes are their own gated pass.

## Secondary conventions worth checking

- **Guillemets** `« »` are the quotation marks; English `" "` and typographic
  `“ ”` are both wrong in French prose. Inner space per FR-SPACE.
- **Accented capitals stay accented**: *État*, *Épreuve*, *À propos*. A
  pipeline that uppercases by stripping accents ships misspellings.
- **Capitalization after a colon** is lowercase in running prose; inside
  guillemets, a quoted sentence-start may capitalize — a fine point worth one
  recorded house ruling rather than per-string debate.

## When not to apply this

Do not impose France-French spacing on Canadian French, which sets no space
before `; ! ?` (only before `:`) — the rule set is per-locale-variant. Do not
"correct" surfaces where the two-part punctuation never occurs (diagram node
labels, bare nouns); absence of the pattern is not a defect, and a later pass
must not add spacing where there is nothing to space.
