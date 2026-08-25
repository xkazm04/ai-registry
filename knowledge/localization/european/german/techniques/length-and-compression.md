---
layer: technique
type: technique
subject: german
technique: length-and-compression
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [German strings overflow a control, budgeting layout for German expansion, shortening a label without losing meaning]
---

# Length and compression

German is the longest of the major European UI locales: plan on **20–35%
expansion over English** for running text, worse for short labels (a
three-word English label can double), and the expansion arrives in the worst
possible shape — single unbreakable compound tokens that overflow rather than
wrap. Length is therefore not a polish concern in German; it is a first-class
translation constraint with its own decision hierarchy, and "it didn't fit" is
a finding class, not an excuse.

Where the expansion comes from, so the compression levers make sense:
compounding fuses phrases into long tokens; case and gender agreement add
endings; the formal address form lengthens verbs ("Speichern Sie" vs "Save");
and German resists the clipped telegraphic style English UI leans on — a
too-clipped German label reads broken, not punchy.

## The compression hierarchy

Work the levers in order; each preserves more meaning than the next.

1. **Choose the shortest correct term, not the most literal one.** *Planung*
   over *Terminplanung* on a pill; an established short synonym over the
   dictionary-faithful long one. A recorded shortening of a canonical term
   (*Prüfung* for *Überprüfung* in tab strips and count badges) is legitimate
   when the termbase records it as a width-scoped variant of the same concept
   — not a second term.
2. **Drop articles and possessives in labels** where English also drops them:
   *Beschreibung*, not *Die Beschreibung*; *Modell*, not *Das Modell*. German
   labels tolerate article-dropping; German sentences do not.
3. **Prefer the compound over the prepositional phrase in tight containers**
   (*Zugangsdaten-Tresor* beats *Tresor für Zugangsdaten* in a header) — and
   the reverse in body copy, where the prepositional form reads better and
   the width is free.
4. **Let the loanword be a length decision.** Where the termbase permits an
   English loan, the loan is usually far shorter than the German coinage
   (*Trigger* vs *Auslösemechanismus*). This lever belongs to
   terminology-and-loanwords — the point here is that width pressure is a
   legitimate input to that per-term ruling.
5. **Recast the sentence.** Passive to active, clause to phrase, two short
   sentences instead of one long one. German often compresses better by
   restructuring than by word substitution.

## DE-FIT · Shorten the label, never the meaning; never truncate silently

> **Trigger** — a faithful German translation that does not fit its control.
> **Rule** — exhaust the compression hierarchy; if the string still does not
> fit, **flag it** (a length finding naming the key and the budget) rather
> than truncating, abbreviating below recognisability, or quietly dropping a
> meaning-bearing word. A silently truncated German string reads as a typo.
> Ad-hoc abbreviation is not a lever: German has established abbreviations
> (*Nr.*, *z. B.*, *ggf.*) and invented ones read as errors.
> **Rule, second half** — a persistent misfit is usually a **source defect**:
> an English label sized to its own length with no expansion room caps every
> long locale at once, and the durable fix is a shorter source string or a
> wider control, decided by the source's owner
> ([the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)).
> **Source** — vendor localization guides for German uniformly instruct
> shortening over truncation; the source-defect escalation is fleet craft.
> **Exception** — hard single-character or icon-adjacent budgets (a column of
> two-letter day abbreviations) may use the established German abbreviation
> set even where it is opaque; established, not invented, is the line.

## Layout-facing decision rules

- **Budget containers for +35% over English**, and test with the real longest
  German strings, not with padded lorem — the tail of the length distribution
  is compounds, and compounds do not behave like padded text.
- **Compounds do not wrap.** A container that handles fifty characters of
  wrapping prose can be broken by a twenty-five character compound. Where
  wrapping long compounds is unavoidable, soft hyphens (U+00AD) at morpheme
  boundaries are the clean tool — inserted deliberately, never by an
  automatic hyphenator running on unreviewed boundaries.
- **The tightest surfaces get the first review pass.** Chips, badges, tabs,
  table headers, pills: audit these for overflow before auditing prose for
  style, because a clipped label is a functional defect and a clumsy sentence
  is not.
- **Sibling strings share one width budget.** A set of parallel labels (tab
  strips, status chips, stepper phases) is compressed as a set — one long
  member forces the compression of all, or the set reads inconsistent.

## When not to use this

Do not compress body copy that has room — the levers above trade nuance for
width, and spending that trade where width is free degrades the translation
for nothing. Do not let a width-scoped shortening drift into being a second
term for the concept (the shortening is legitimate only while the termbase
records it as the same concept). And never compress by dropping the formal
address or noun capitals — register and orthography outrank fit, all the way
to the point where the correct response is a flagged misfit, not compromised
German.
