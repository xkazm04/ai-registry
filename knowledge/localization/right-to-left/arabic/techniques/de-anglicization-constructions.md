---
layer: technique
type: technique
subject: arabic
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Arabic strings that read translated, fixing calqued word order, deciding sentence structure for Arabic instructional copy]
---

# De-anglicization constructions

A grammatically correct Arabic string can still be an English sentence wearing
Arabic words. The constructions below are where that happens: each names the
English pattern, the Arabic structure that replaces it, and the decision rule
— so a finding cites a rule, not a reviewer's ear
([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)),
and so a refine pass rewrites only flagged constructions rather than
"improving" whole strings
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

## AR-VSO · Lead with the verb, or with the natural existential frame

English declaratives front-load the subject; the Arabic **verbal sentence**
front-loads the verb, and MT's most reliable tell is preserved
English noun-first order. The naive calque of "Unsaved changes will be lost":

- Calqued: التغييرات غير المحفوظة سوف تُفقد — grammatical, stiff, English-shaped.
- Natural: لديك تغييرات غير محفوظة ستُفقد إذا غادرت — lead with لديك ("you
  have"), Arabic's idiomatic frame for introducing an existing state, then the
  consequence.

Decision rules:

- Event/action statements → verb first: فشل التحميل (loading failed), اكتمل
  النسخ, تعذّر الاتصال — not التحميل فشل.
- Existing-state warnings → the لديك / هناك / توجد existential frame, then the
  consequence clause.
- Nominal sentences (subject + predicate, no verb) are correct Arabic and the
  right choice for definitions and status labels — الخدمة متوقفة (the service
  is stopped). The technique is not "always VSO"; it is "never keep English
  order out of caution." A reviewer flags noun-first only where a verb
  *exists* and English order pushed it back.

## AR-IDAFA · The construct chain replaces the of-stack

English chains possession with "of" or noun-stacks ("the server connection
settings page"); Arabic has the **iḍāfa** (إضافة) construct: nouns chained
directly, only the final member taking the definite article — صفحة إعدادات
اتصال الخادم. Rules that keep it right:

- **One الـ, at the end.** الصفحة إعدادات… (article on a non-final member) is
  the classic broken construct; if the whole chain is definite, only the last
  noun carries الـ.
- **Nothing intrudes.** An adjective cannot sit inside the chain; it follows
  the whole construct and agrees with the noun it modifies.
- **Cap the chain at ~3 links.** English can stack five nouns; a five-member
  iḍāfa is grammatical and unreadable. Break long stacks with a preposition —
  إعدادات الاتصال بالخادم ("settings of connecting to the server") — or recast.
- The stacked-مِن calque ("settings **of** the connection **of** the server"
  rendered with مِن at each joint) is the tell of literal translation; مِن is
  partitive/ablative, not English "of."

## AR-PASSIVE · Choose the right agentlessness, don't copy English passives

English UI leans on the passive to avoid naming an agent ("Your file has been
deleted"). Arabic has three agentless devices, and choosing among them is the
craft:

1. **تم + masdar** — تم حذف الملف ("deletion of the file completed") — the
   established software idiom for completed system actions; neutral, short,
   gender-free. Default for toasts and results.
2. **The internal passive** (المبني للمجهول) — حُذف الملف — more classical,
   correct, slightly formal; good in running prose and logs. In undiacritized
   UI text the passive verb can be visually identical to the active (حذف), so
   prefer تم + masdar where ambiguity could mislead, or add the one vowel mark
   (حُذف) per AR-TASHKIL's minimal-marks rule.
3. **جارٍ + masdar** for in-progress states — جارٍ الحفظ… — never a calqued
   progressive.

Anti-rule, found by over-application: do not passive-ize *user* instructions.
"يجب أن يتم اختيار ملف" ("it must be that choosing of a file occurs") is
bureaucratic filler produced by translators over-extending تم; an instruction
addresses the user directly (اختر ملفًا) per the register technique. تم is for
what the system did, not what the user should do.

## Smaller calques worth naming

- **Please-copying**: English "Please" before every request has no
  obligatory Arabic mirror; يُرجى + masdar (يُرجى المحاولة لاحقًا) is the
  natural politeness frame for full sentences, and repeating رجاءً everywhere
  reads as begging. Buttons and short prompts carry no politeness particle.
- **You-can-ism**: "You can export…" → Arabic drops the ability frame:
  يمكنك تصدير… is fine once; a catalog where every sentence opens with يمكنك
  is a calque pattern — state what the feature does (صدّر البيانات من…).
- **Pronoun over-copying**: Arabic conjugation encodes the subject; an
  explicit أنت mirroring English "you" is emphatic, not neutral.

## When NOT to apply

These are review anchors, not a rewriting license: a string flagged by none of
them is left alone, even when the reviewer would phrase it differently. And in
tight surfaces (buttons, table cells) the fragment conventions of the register
technique outrank sentence-structure rules — a status cell says مكتمل, and no
sentence-order rule applies to a one-word string.
