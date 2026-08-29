---
layer: technique
type: technique
subject: indonesian
technique: quantity-and-plurality
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [translating counted or plural strings into Indonesian, deciding whether to reduplicate a noun, reviewing message-format plural blocks for the id locale]
---

# Quantity and plurality

Indonesian nouns do not inflect for number. Plurality is expressed — when it is
expressed at all — by an explicit quantity word, by reduplication (kata ulang),
or by context alone. The craft is knowing which of the three a string wants,
and the audit value is that two of the three errors are mechanically findable.

## ID-CLDR-OTHER · one plural category, one branch

CLDR assigns Indonesian (`id`) a single plural category: `other`. Every count
maps to it — there is no `one`, no `few`, nothing. Consequences:

- A plural block in the target needs exactly one **catch-all** branch — and the
  catch-all's spelling depends on which generation of message format the stack
  speaks. The older plural syntax names it `other` and refuses a message that
  omits it; the current message-format standard requires instead a variant whose
  keys are all `*`, and treats `other` there as an ordinary literal key. A block
  written with `other` alone **does not build** under the newer standard. So
  "one branch, `other`" describes one generation rather than stating a rule;
  write the catch-all the format in front of you actually mandates.
- Copying the source's `one` branch into an Indonesian value is dead weight, and
  removing it is a translation-cost decision, not a correctness one — no error
  class covers a branch whose category the locale's rules can never select, and
  such a branch is simply inert. The direction of risk is the opposite of the
  intuition: *dropping* a branch the source carried changes the set of syntax
  keywords, which is what a strict skeleton comparator flags
  ([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).
  Keeping it is the conservative move; delete it to save translator attention,
  not to fix a defect.
- Translating `one` and `other` *differently* — gluing an English singular/plural
  distinction back in by hand — invents a grammatical contrast the locale does
  not have. **Exact-value keys are not that**: an exact key such as `=1` outranks
  rule keywords and works in a one-category locale, so a genuine "you have one
  item" wording stays available without inventing a category.
- The noun beside a count placeholder stays in its base form at every value of
  the count: `{count} berkas` serves 1 and 1,000 alike.
- The plural *syntax* that does appear — keywords, braces, placeholder names —
  is skeleton and stays byte-identical
  ([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable));
  what collapses to one branch is the content, never the syntax the format
  system requires.

Source: CLDR language plural rules, `id` — single-category for ordinals as well
as cardinals. Check that rather than infer it: the cardinal and ordinal rules are
independent files, and sharing a cardinal ruleset predicts nothing about ordinals.
Lao sits in the very same 35-locale cardinal group as Indonesian and carries a
two-category ordinal rule.

## ID-NO-REDUP-QUANT · a numeral or quantifier blocks reduplication

The classic error, and the one to teach every reviewer first: reduplication and
explicit quantity are mutually exclusive. `dua buku`, never `dua buku-buku`.
The block is triggered by any quantity word, not only numerals:

- numerals: `dua`, `tiga`, `100` …
- quantifiers: `beberapa` (several), `banyak` (many), `semua`/`seluruh` (all),
  `setiap` (each), `sejumlah` (a number of)
- the human-plural marker `para` (`para pengguna`, never `para pengguna-pengguna`)
- a `{count}` placeholder — it *is* a numeral, even though the translator
  never sees its value. `{count} persona aktif`, never
  `{count} persona-persona aktif`. This is the variant machine translation
  actually produces, because the English source noun is visibly plural and the
  model pluralizes the Indonesian noun to match.

The audit for this rule is a grep: quantity word or placeholder followed by a
reduplicated noun is a defect with no false positives worth worrying about.

## ID-REDUP-SCOPE · when reduplication is right — and when to leave it out

Reduplication is the correct plural exactly when plurality is load-bearing AND
no quantity word carries it: `Berkas-berkas berikut akan dihapus` ("the
following files will be deleted" — the user must understand there are several).
Even then, prefer restructuring on narrow surfaces: `Berkas berikut akan
dihapus` above a list of three files is complete, because the list is the
quantity expression.

Do not reduplicate when:

- context already signals plurality (a list, a table, a count elsewhere in the
  same string or screen);
- the noun is generic/collective — Indonesian bare nouns are number-neutral,
  so `Kelola koneksi` covers "manage connections" with nothing added;
- the string is a label, tab, or heading — English plural section titles
  ("Settings", "Notifications") become bare singular-form nouns
  (`Pengaturan`, `Notifikasi`), never reduplicated forms.

Also keep reduplication's other senses out of counted copy: reduplication can
mean variety or intensity (`warna-warni`), iteration (`berulang-ulang`), or
resemblance — a reviewer who only knows "reduplication = plural" will misjudge
those as errors. They are not plural marks and this rule does not govern them.

## ID-CLASSIFIER-DROP · classifiers are formal-prose furniture, not UI

Indonesian has measure words — `buah` (things), `orang` (people), `ekor`
(animals): `dua buah buku`, `tiga orang pengguna`. In UI copy they are almost
always droppable and usually should be dropped: `dua buku`, `3 pengguna` are
fully grammatical, shorter, and match how counted placeholder strings read.
Keep a classifier only where the bare numeral+noun becomes ambiguous or where
the register of long-form prose genuinely wants it. Never build a classifier
into a `{count}` string (`{count} buah berkas`) — it adds length to every
rendering to serve a formality no dialog needs.

## Decision procedure for a counted source string

1. Does the target have a quantity word or `{count}`? → base-form noun, no
   reduplication (ID-NO-REDUP-QUANT), single `other` branch (ID-CLDR-OTHER).
2. No quantity expression, plurality load-bearing? → reduplicate, or
   restructure so a list/quantifier carries it (ID-REDUP-SCOPE).
3. No quantity expression, plurality incidental? → bare noun; Indonesian's
   number-neutrality is a feature, not a gap to fill.
