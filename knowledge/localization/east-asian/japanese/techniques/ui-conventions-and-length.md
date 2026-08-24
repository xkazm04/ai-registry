---
layer: technique
type: technique
subject: japanese
technique: ui-conventions-and-length
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [fitting Japanese text into constrained UI containers, planning length and layout budgets for a Japanese locale, reviewing Japanese labels for length and abbreviation defects]
---

# UI conventions and length

Japanese inverts the usual localization length problem. Most target languages
expand from English and the craft is compression; Japanese usually *contracts*
by character count — kanji compounds are dense（認証情報, four characters,
replaces the ten-letter "credential"）— and the craft is knowing why that
saving does not convert to pixels, and what Japanese refuses to do when space
runs out anyway.

## JA-WIDTH-BUDGET · budget rendered width, not character count

**Trigger:** sizing any container for Japanese, or judging whether a Japanese
string "fits" from its length.

**Rule:** a full-width CJK glyph renders at roughly twice the width of an
average Latin letter, so a Japanese string half the character count of its
English source is approximately the *same* width on screen. Budget in ems of
rendered text, not in characters, and expect the net effect per string class:
dense-kanji terms come out narrower than English; katakana-heavy strings come
out as wide or wider（コンフィグレーション is longer than "configuration"
on screen）. Two further renderer facts a layout must absorb: CJK text wants
more line-height than Latin at the same size (glyphs fill the em square;
tight Latin leading clips or crowds them), and CJK strokes need a slightly
larger minimum legible size — the smallest caption sizes that work for Latin
are below the floor for kanji.

## JA-LABEL-LENGTH · labels are two to five characters, and they are not sentences

**Trigger:** button, tab, menu, chip, and badge text.

**Rule:** shipped Japanese software converges on 2–5 character labels —
保存, 追加, 完了, 設定, キャンセル — in noun or dictionary-verb form (the
register technique's JA-TAIGENDOME owns the grammar; this rule owns the
budget). Chips and badges hold to roughly one line of 8–10 full-width
characters. When a label will not fit, the fix is upstream: shorten the
*concept* the source expresses, because the Japanese rendering of a given
concept has almost no slack — which is the next rule.

## JA-NO-ABBREV · Japanese does not invent abbreviations to fit

**Trigger:** a truncated kanji compound, a clipped katakana word, or an
ellipsis-truncated label authored to fit a container.

**Rule:** English absorbs invented clippings ("Exec", "Config") as a normal
space-saving register; Japanese does not. A kanji compound is already near
its semantic minimum — truncating 実行 to one character produces a different
word or a typo, not an abbreviation — and clipping katakana is only valid
where the clipped form is *already lexicalized*（アプリ, コンフィグ is
borderline, リポ is not）. When a Japanese string genuinely cannot fit: use
the established clipped loanword if one exists; otherwise report the
container or the source concept as the defect
([the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
— a container sized only for English caps every locale at once). Authored
mid-word truncation with … is a rendering-layer job, never something to bake
into the string.

## Wrapping behavior: freer than English, with different failure modes

Japanese text can legally break between almost any two characters (within the
kinsoku prohibitions the typography technique anchors as JA-KINSOKU), because
there are no word spaces to respect. Consequences a layout engineer must hold:

- **No ragged-right problem, no hyphenation system.** Japanese justifies
  beautifully and wraps anywhere; the "broken mid-word" English failure does
  not exist. Do not carry over hyphenation logic — Japanese has none.
- **The overflow risk is the embedded Latin run.** A URL, an identifier, an
  email address inside Japanese text is the only unbreakable token in the
  string, and it will overflow a narrow container long before any Japanese
  does. Containers holding mixed strings need an overflow policy for exactly
  this case.
- **Line-break opportunity is not phrase-break quality.** A legal break can
  still be an ugly one（splitting a particle from its noun reads fine to a
  renderer and slightly off to a reader）; high-polish surfaces sometimes
  control this with phrase-level non-breaking spans, but that is polish, not
  correctness — never manual line breaks in the string, which become wrong at
  every other width.

## Conventions a Japanese UI expects

Small, settled expectations that make a locale feel native rather than
translated:

- **Dates and times:** the native order is big-endian — 2026年8月24日,
  weekday in parentheses（月）— and the runtime's locale formatter should
  produce it; a translation hard-coding a Western order into a date string is
  a defect *and* a source defect if the source forced it. Both the Gregorian
  form and the era system（令和）exist; software UI overwhelmingly uses
  Gregorian unless the domain (government, legal) requires the era.
- **Ranges and units:** ranges read with ～ or から; units attach directly to
  half-width numerals with no space（3GB, 50%）in dense UI, per the
  typography technique's width rules.
- **Truncation marker:** the renderer's … at overflow is understood; a
  Japanese reader also accepts 全文表示 ("show full text") affordances —
  what reads as broken is truncation mid-placeholder or mid-Latin-token.
- **Input affordances:** any surface echoing user text must handle full-width
  input of "half-width" data (a user typing １２３ into a number field) as an
  input-normalization concern; the catalog string must never assume the echo
  is half-width.

## When not to apply this technique

Marketing and content surfaces run on editorial judgment, not label budgets —
a campaign headline may be a full sentence with punctuation. And do not
enforce the 2–5 character label norm onto strings that are genuinely
sentences relocated into a button by the source design ("I agree to the
terms") — the register rules govern those, and the length finding, if any,
belongs upstream against the source design.
