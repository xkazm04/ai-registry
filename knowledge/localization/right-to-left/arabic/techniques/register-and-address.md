---
layer: technique
type: technique
subject: arabic
technique: register-and-address
status: forged
laws: [one-concept-one-rendering, every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing register and address forms for Arabic UI copy, auditing imperatives and button labels in an ar catalog, deciding a gender-neutrality strategy]
---

# Register and address

Arabic is diglossic: the written standard (MSA) and the spoken dialects are
different linguistic systems, and software lives entirely in the first. On top
of that, Arabic conjugates the second person for gender and number, so "how do
we address the user" is a grammatical commitment made in every imperative, not
a tone-of-voice preference. The rules below are the settled software
conventions; each carries an identifier an audit can cite.

## AR-MSA · Modern Standard Arabic, no dialect

Every UI string is Modern Standard Arabic (فصحى). No dialect vocabulary, no
colloquial constructions, no dialect-marked spellings — regardless of which
market the product primarily serves. Rationale: MSA is the only register every
Arabic-speaking market reads as neutral; any dialect choice marks the product
regionally and reads as informal in the wrong way (slang in a settings screen,
not friendliness). Source: every major published Arabic software style
authority (Microsoft's and Mozilla's Arabic guides both state it as rule one).
The practical hazard is machine output: models trained on web Arabic emit
dialect forms and dialect-flavored phrasing under fluency pressure, so AR-MSA
is the anchor a review pass cites most against raw MT.

**Exception, found by over-applying the rule:** MSA-ness does not mean
maximally classical. Prefer the plain MSA word over the ornate one (a UI says
"أرسل", not archaic epistolary formulas). The register target is a quality
newspaper, not a literary novel.

## AR-IMPER · Masculine-singular imperative as the unmarked default

Direct full-sentence instructions address the user with the masculine-singular
imperative — اختر, أدخل, افتح, الصق — never the feminine (اختاري), dual, or
plural forms, and never switching forms within one product. Rationale: Arabic
has no gender-neutral second person; masculine singular is the standard
unmarked default across professional MSA software copy (it is what every major
OS-level Arabic UI uses), and it is also the shortest conjugation, which
matters in constrained widgets. A product may adopt a deliberately
gender-neutral strategy instead (see below) — that is a house decision to
record — but the default an auditor assumes, absent a recorded house ruling,
is masculine singular, applied with total consistency. A single feminine or
plural imperative in an otherwise masculine-singular catalog is a defect under
[one concept, one rendering](../../../_laws.md#one-concept-one-rendering)
applied to the address system itself.

## AR-MASDAR · Verbal noun on controls, imperative in instructions

Buttons, menu items, and action labels use the **verbal noun (المصدر)**, not
the imperative verb: حفظ (save), حذف (delete), إلغاء (cancel), نسخ (copy),
تعديل (edit) — not احفظ, احذف. Three reasons stack: the masdar carries no
gender at all, so it is the built-in gender-neutral strategy for the surface
where most strings live; it reads as a calm professional label rather than a
command barked at the user; and it is one word, which holds the length budget.
Reserve the imperative (AR-IMPER) for full-sentence instructions, hints, and
empty-state guidance — اختر ملفًا, أدخل المفتاح — where a bare masdar would be
ungrammatical or cryptic.

Corollary on the definite article: **navigation and section labels take الـ**
(الإعدادات, السجل, التقارير) — the Arabic analog of English's bare Title Case
noun — while **action controls drop it** (حفظ, not الحفظ). An article on a
button converts an action into a noun label; a bare noun in a nav rail reads
clipped. The article is therefore a signal of control type, and an audit can
check it mechanically once the string's surface (nav vs action) is known.

## AR-PASSIVE-STATUS · Impersonal forms for system status

Status, toast, and progress copy describes the system's state without
addressing the user as the doer: تم الحفظ (saved), تم النسخ (copied),
جارٍ التحميل… (loading). The تم + masdar pattern for completed actions and
جارٍ + masdar for in-progress ones are the established software idiom; they
are gender-free, agent-free, and short. Do not translate English status copy
("You have successfully saved…") into second-person Arabic — the English
addressivity is a source-voice artifact, not information, and carrying it over
forces a gendered verb where none was needed.

## Choosing a gender-neutrality posture (decision rule)

A product picks exactly one posture and records it where its house rules live:

1. **Default posture** — masculine-singular imperative (AR-IMPER) plus heavy
   masdar/passive coverage (AR-MASDAR, AR-PASSIVE-STATUS). Cheapest, matches
   platform conventions, and in a masdar-heavy UI the explicitly gendered
   surface is small.
2. **Avoidance posture** — rewrite to eliminate second-person verbs entirely
   (masdar, passive, nominal phrasing everywhere). Fully neutral, costs
   naturalness in instructional copy and slows every translator; choose it
   only when the product's audience or policy demands it.
3. **Paired-form posture** (اختر/اختاري or slash-and-diacritic hybrids) — do
   not choose it for UI. It doubles length on the tightest surfaces and no
   major Arabic platform convention supports it; it survives only in marketing
   and direct correspondence where the reader's gender is known.

Whichever posture is chosen, the audit anchor is consistency: the posture is
one recorded decision, and every finding cites the rule, not the reviewer's
taste ([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)).

## When NOT to apply this technique

Transcreated marketing copy addressed to a known individual (an email greeting
a named user) may legitimately inflect for the recipient — that is a data-driven
grammar problem (grammatical gender as a message argument), not a register
decision, and it needs source-format support, not a locale-side workaround.
