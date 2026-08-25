---
layer: technique
type: technique
subject: korean
technique: particles-and-interpolation
status: forged
laws: [format-skeleton-is-inviolable, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [translating strings with interpolated placeholders into Korean, auditing particle correctness around placeholders, designing source strings that will interpolate names in Korean]
---

# Particles and interpolation

Korean case particles inflect on the **final sound of the preceding word**:
one form after a consonant-final syllable, another after a vowel-final one.
For static text a native speaker gets this right without thinking. For a
`{placeholder}` the final sound is unknowable at translation time — the value
might be 계정 (consonant-final), 메모 (vowel-final), an English word, or a
number — so every particle attached to a placeholder is a coin-flip defect
unless one of three sanctioned strategies is applied. This is the highest-
frequency *grammar* defect class in Korean catalogs, and unlike register
drift it is visible to every user on every render.

## The alternation table

| Function | After consonant | After vowel | Dual form |
|---|---|---|---|
| topic | 은 | 는 | 은(는) |
| subject | 이 | 가 | 이(가) |
| object | 을 | 를 | 을(를) |
| and/with | 과 | 와 | 과(와) |
| direction/means | 으로 | 로 | (으)로 |

(으)로 has the extra wrinkle that ㄹ-final words take 로, not 으로 — a detail
that matters for static text but is subsumed by the dual form for
placeholders. The vocative and a few minor particles alternate too but
rarely reach UI strings.

## KO-PARTICLE-DUAL · the parenthesized dual form is the default

**Rule.** When a particle must attach to a placeholder, write **both forms,
consonant-form first, vowel-form parenthesized, glued directly to the
placeholder with no space**: `{name}을(를) 삭제할까요?`,
`{label}이(가) 추가되었습니다`, `{target}(으)로 이동`. This is the
established Korean software convention; users parse it without noticing.
Never pick a single form ("`{name}를`") — it renders wrong for roughly half
of realistic values, and the wrongness reads as illiteracy, not as a
technical limitation. Never space the particle off the placeholder: the
skeleton stays byte-identical and the particle stays glued.

Order is fixed by convention — consonant form outside, vowel form in
parentheses: 을(를), never 를(을). Consistency here is auditable by grep.

## KO-PARTICLE-AVOID · rephrasing beats the dual form when it is free

**Rule.** The dual form is correct but visually noisy; when a natural
rephrasing eliminates the particle at no cost to meaning, prefer it:

- **Quote the placeholder**: a quoted name takes the sentence's frame
  differently — `"{query}"와 일치하는 항목이 없습니다` still needs 와, but
  `"{name}" 삭제` (label form) needs nothing.
- **Colon or label framing**: `삭제할 항목: {name}` instead of
  `{name}을(를) 삭제합니다`.
- **Reorder so a Korean noun precedes the particle**:
  `{count}개 항목을 삭제할까요?` hangs the particle on 항목, whose final
  sound is known — the placeholder moves to where no particle touches it.
- **Particle-neutral constructions**: topic-drop, noun-form endings, or the
  bare juxtaposition natural to terse UI (`{name} 연결됨`).

Decision rule: in tight chrome (toasts, list rows, badges), rephrase; in
full sentences (dialogs, errors) where the placeholder is grammatically
central, use the dual form. Do not contort a sentence into unnaturalness
just to dodge one dual form — an over-applied avoidance pass produces
telegram-style Korean that a reviewer then rightly reverts to the dual form.

## KO-PARTICLE-RUNTIME · runtime particle selection is a stack decision, not a translation

**Rule.** Libraries exist that pick the correct particle at runtime by
inspecting the interpolated value's final Unicode syllable (the arithmetic
is deterministic for Hangul: syllable codepoint composition reveals the
final consonant). Where the product's stack provides such a mechanism, it
beats both strategies above — but adopting it is a format-contract change
owned by the source catalog, not something one locale's translator invents
inside a value. Until the contract provides it, translators use
KO-PARTICLE-DUAL/AVOID; a translator hand-rolling per-string particle logic
in message syntax creates an unmaintainable third convention. Note the
mechanism's real limits: it misfires on values that render in Latin script
(the final-sound of "3" or an English word follows its *Korean reading*,
which no algorithm reliably knows — 3(삼) is consonant-final, "A"(에이) is
vowel-final), so even runtime selection keeps the dual form for
Latin-prone placeholders.

## Source-side lessons to push upstream

Particle pain is often a **source defect**: a source string interpolating a
bare name into sentence-central position forces every particle strategy to
its worst case, while the same meaning framed as label-plus-value
("Deleted: {name}") localizes cleanly into dozens of languages, Korean
included. Report the pattern upstream rather than absorbing the cost
per-string — the source locale is the source of truth, and it is also the
cheapest place to fix interpolation grammar for every locale at once.

## When not to apply

Static text: a particle after a known Korean word just takes its correct
single form — dual forms after non-placeholder words are themselves defects
("항목을(를)" is wrong; 항목 is consonant-final, 을 is simply correct).
The dual form is a placeholder-uncertainty device, nothing more.
