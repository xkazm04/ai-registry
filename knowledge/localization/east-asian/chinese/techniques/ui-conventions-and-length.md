---
layer: technique
type: technique
subject: chinese
technique: ui-conventions-and-length
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [writing or reviewing zh control labels and microcopy, setting length budgets for Chinese UI slots, checking casing of Latin islands in zh strings]
---

# UI conventions and length

Chinese inverts the length problem every European localizer knows: strings
*shrink* — a 15-character English label routinely lands at 4–5 Han characters
— so the discipline is not fitting into slots but resisting two opposite
temptations: padding strings back out because the room exists, and
compressing so hard the label stops parsing. The conventions below are what
give Chinese UI its characteristic terseness on purpose rather than by
accident.

## ZH-BUTTON · control labels are 2–4 character bare verbs

**Trigger:** a button, menu item, or action label.
**Rule:** verb-first, 2–4 characters, no particles, no pronoun, no trailing
punctuation: 保存 · 取消 · 删除 · 重试 · 编辑 · 复制 · 导出. Two-character
verb compounds are the native shape of a Chinese action label; a button
reading 请保存您的更改 has imported an English sentence into a control. The
请-prefix belongs to sentences, not controls (see the register rules).
Destructive confirmations widen to verb+object for safety — 删除项目 over a
bare 删除 in the confirming position — which is the recorded exception, not
a license for padding.

## ZH-LENGTH · budget by glyph width, then resist over-compression

**Trigger:** setting or checking length budgets for zh slots.
**Rule:** each Han glyph renders at roughly 1.5–1.75× a Latin letter's width,
so budgets are counted in characters, small: nav/sidebar labels ≤ 6, buttons
and tabs ≤ 4, single-line toasts/chips ≤ 12 is a workable default set —
derived from a real 14-locale catalog and generous for most strings, because
Chinese density leaves room to spare.
The two failure directions:
- **Padding:** translators refill the saved space with particles and
  politeness (的, 了, 请, restored pronouns). The audit heuristic: if the
  Chinese string is *longer* than half the English character count, read it
  suspiciously.
- **Over-compression:** four-character compounds forged from rare morphemes
  or clipped beyond recognition (智绘 for "smart drawing tool") read as
  brand-speak, not labels. A label must parse on first sight for a user who
  has never seen it; when the idiomatic form needs 5–6 characters, widen the
  slot or shorten the *concept*, don't invent an unparseable compound.
**Compression order when over budget:** drop particles → drop the modifier
noun the context already shows → choose a shorter synonym from the termbase —
never abbreviate by dropping interior characters of a settled term.

## ZH-NO-CASE · nothing to capitalize, and Latin islands keep their case

**Trigger:** source strings in Title Case, ALL CAPS, or carrying cased
identifiers.
**Rule:** Chinese has no letter case; Title Case and ALL-CAPS emphasis have
no rendering and must not be imitated (no bolding, no quote glyphs, no
spacing tricks standing in for caps). A Title Case source label becomes a
plain Chinese compound. The residual rule governs Latin islands: brand
names, acronyms, and code identifiers keep their source casing byte-exact
inside the Chinese sentence — never lowercased, uppercased, or
half-translated.

## ZH-LINEBREAK · the layout breaks lines, the string does not

**Trigger:** a long zh string destined for a narrow container, or a reviewer
tempted to insert manual breaks/spaces.
**Rule:** Chinese has no inter-word spaces; lines may break between almost
any two Han characters, subject to the prohibition rules (避头尾: no closing
punctuation ，。、！？ at a line head, no opening punctuation （“「 at a line
end) — W3C clreq is the citable authority. Consequences for the catalog:
never insert spaces or newlines into a Chinese string to steer wrapping
(they render as visible gaps, and the string reflows differently in every
container); and consequences for the layout: a line-breaking engine that
only breaks at spaces will treat a Chinese paragraph as one unbreakable run
— that is an engineering defect to file, not something to fix with
zero-width characters in the translation.
**Punctuation-and-slot interaction:** terminal 。 is conventionally dropped
from single-sentence labels, toasts, and list items (Chinese UI convention
matches the English one here), kept in multi-sentence body copy.

## When not to use this technique

Documentation, marketing prose, and legal text are not microcopy: fuller
sentences, kept pronouns, and terminal punctuation are correct there, and
applying the 2–4 character discipline to them produces telegraphic Chinese.
And do not enforce the length budgets against a slot whose real pixel width
you have not confirmed — the budgets are defaults for typical slot classes,
and the anchor a finding cites should be the *product's* recorded budget
once one exists.
