---
layer: technique
type: technique
subject: korean
technique: spacing-and-typography
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [reviewing Korean punctuation and spacing in a catalog, deciding how Latin terms embed in Korean strings, settling full-width versus half-width punctuation questions]
---

# Spacing and typography

Korean's writing mechanics contradict both mental models a localizer might
import. Against the Japanese/Chinese model: Korean **has word spacing**
(띄어쓰기) and uses **half-width Latin punctuation**. Against the European
model: particles attach with no space, counters attach to numerals,
compounds close up, and there is no letter case anywhere in the native
script. Each contradiction is a defect class with an anchor.

## KO-SPACING · words are spaced; particles and endings are not

**Rule.** Separate words take a space, per standard orthography (한글 맞춤법):
Korean is not run together like Japanese. But **particles (조사) attach to
their host with no space** — 파일을, 설정에서, 계정으로 — and verb endings
attach to their stem. **Dependent nouns (의존명사) are spaced**: 할 수
있습니다, 저장한 지 5분. The classic over-correction is spacing a particle
off an English word or placeholder ("Slack 이 연결됨") — the particle glues
directly to Latin text and placeholders exactly as to Hangul: `{name}이(가)
연결되었습니다`.

## KO-COMPOUND · established compounds close up; ad-hoc phrases stay spaced

**Rule.** A compound that names one lexicalized concept is written solid
(비밀번호, 로그인, 환경설정 as a settings label); a free modifier-plus-noun
phrase keeps its space (새 파일, 최근 항목). Official orthography permits
both forms for many technical compounds — the authority genuinely
underdetermines this — so the operative rule is **consistency by termbase**:
decide each recurring compound's form once, record it, and audit against the
record, not against a native speaker's ear of the day. Screen-width pressure
legitimately biases labels toward the closed form.

## KO-PUNCT · half-width punctuation; no CJK full-width forms

**Rule.** Korean uses ordinary half-width `.` `,` `?` `!` `(` `)` `:` with a
space after (not before) exactly as in English. Full-width CJK punctuation —
`。` `、` `（）` `：` — is **not Korean orthography** and any occurrence is a
defect, usually introduced by pan-CJK tooling defaults or a translator
alternating between Korean and Japanese. This rule earns explicit statement
because generic "CJK typography" guidance keeps re-asserting full-width
forms; for ko it is simply wrong.

Terminal punctuation follows string class: full sentences end in a period
(or nothing in terse status lines — pick one convention per surface and hold
it); **labels, buttons, and headers take no terminal punctuation at all**;
error messages end calm and declarative — no exclamation marks, no
apology-interjections. Question marks appear only on genuine questions
(confirmation dialogs: "삭제할까요?").

## KO-ELLIPSIS · the single glyph, one convention per catalog

**Rule.** Use the ellipsis character `…`, not three periods, for truncation
and in-progress markers ("불러오는 중…"). Korean tradition also knows the
double-glyph form `……` from print typography; UI convention has settled on
the single `…`. A catalog inherited with mixed `...`/`…` is legacy drift to
converge, not a convention to preserve — normalize to `…` in every touched
string and record the ruling.

## KO-QUOTES · one quote style, recorded, not "more Korean" on instinct

**Rule.** Korean print tradition offers corner brackets (「」/『』 — largely a
Japanese-influenced newspaper convention now receding) and standard
orthography sanctions ordinary double quotes; modern UI overwhelmingly uses
straight double quotes `"…"` including around interpolated names
(`"{query}"와 일치하는 항목이 없습니다`). The defect pattern is a reviewer
"koreanizing" an internally consistent catalog by introducing corner
brackets or curly quotes mid-stream. The style authority is a hypothesis:
count what the catalog does, record the winner, enforce that.

## KO-LATIN · embedded Latin keeps its exact casing and gets no marks

**Rule.** Brand names, protocol names, and technical identifiers embed in
Korean sentences in Latin script with their **original casing untouched** —
no lowercasing to blend in, no quote marks to set them off, no translation
into Hangul unless the termbase says the term transliterates
(see terminology-and-loanwords). Hangul has no case, so English casing rules
(sentence case, title case) have no Korean analogue — the entire casing
discipline of a Korean catalog is about these embedded Latin islands, which
makes it cheap to audit: every Latin token in the catalog should match its
termbase or source-string form byte-for-byte.

## KO-WIDTH · budget by rendered width, not character count

**Rule.** Korean strings usually run shorter than English in characters (no
articles, stem-form labels) but each syllable block renders roughly 1.5–1.8×
a Latin character's width, so the pixel win is smaller than the character
count suggests. When a label overflows a fixed slot, shorten by dropping the
particle, then the verb ending, before touching the noun — the noun carries
the meaning. Korean has no hyphenation, translators do not insert manual breaks,
and no string may rely on a specific wrap point.

**Line-wrap behaviour is a layout setting, and the default is the opposite of
what 띄어쓰기 suggests.** The character standard classes Hangul syllables so that
breaking *between* two syllable blocks is permitted by default — the default is
syllable-break, supporting Korean text that does not use space-based wrapping —
and **space-only wrapping is the opt-in**, reached by tailoring Hangul to the
alphabetic class. So a Korean UI catalog, which is ragged-margin text and wants
its spaces honoured, is only wrapping correctly if the layout opted in; a product
that never made the choice is running the mode that ignores word spacing
entirely. This is a decision to record, not a default to trust — the same demand
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)
makes of any published rule, and the standard itself asks only that a tailoring
be disclosed.

## KO-DASH · one dash convention, the real glyph

> **Trigger** — the source uses an em dash (or ASCII `--` standing in for
> one) and the Korean target flattens it to ASCII or renders it
> inconsistently across sibling strings of the same pattern.
> **Rule** — normalize to the real em dash — and hold one convention
> catalog-wide, the same discipline the ellipsis rule applies to `…`.
> **Provenance** — harvested 2026-08 from a cross-locale review wave that
> surfaced both a `--`→— flattening and a source-side split on the
> identical sentence pattern; the Korean counterpart to ZH-DASH.

## When not to apply

Long-form prose surfaces (documentation, release notes) may legitimately
adopt print conventions — `……`, corner brackets for titles of works — under
their own recorded ruling. These anchors govern UI catalogs, where the
audit is mechanical and the string population is large.
