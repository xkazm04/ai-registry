---
layer: application
type: application
subject: korean
technique: particles-and-interpolation
stack: process
status: forged
verified_on: 2026-08-24
---

# Process: dual-form particles in the Personas ko catalog

How a real 14-locale consumer product (Personas, `C:\Users\kazda\kiro\personas`)
realizes KO-PARTICLE-DUAL and KO-PARTICLE-AVOID across a ~19k-key catalog, as
codified in its per-locale style guide `docs/i18n/style-ko.md` and shipped in
`ko.json` (~14,500 lines at the time the guide was calibrated).

## The recorded convention

The style guide's typography section states the rule exactly as this
subject's KO-PARTICLE-DUAL does — both forms together, attached directly
with no space — and lists the shipped inventory: `을(를)`, `이(가)`,
`은(는)`, `과(와)`, `(으)로`. Shipped examples it cites:

- `"{name}을(를) 삭제할까요?"` — object particle on a deletable entity name.
- `"{label}이(가) 제안함"` — subject particle on an arbitrary label.
- `"{persona}을(를) {group}(으)로 이동했습니다"` — two placeholders, two
  dual forms in one string, including the (으)로 direction case.
- `"확인하려면 {name}을(를) 입력하세요"` — type-to-confirm dialog.

The guide's Pitfall #1 documents the failure mode with a concrete
counterexample: `"{name}가 연결되었습니다"` breaks the moment the
integration name resolves to a consonant-final value ("Slack" → 슬랙 needs
이). The single-form version is exactly wrong "roughly half the time" — the
guide's phrasing, matching this subject's coin-flip framing.

## Avoidance in practice

The same catalog shows KO-PARTICLE-AVOID working where the dual form would
be noisy: quoted-placeholder framing (`"\"{query}\"와 일치하는 항목이
없습니다"` — the quote marks come from the recorded quotes convention,
straight double quotes, curly appearing only 3 times in 14,500+ lines), and
particle attachment directly to Latin text without spacing or case change
(`Slack이(가)`, `{label}은(는)` — the casing section's rule). The guide
also records the length-pressure interaction: when a label overflows, the
particle is the first thing dropped, before the verb ending, before the
noun — which doubles as a particle-avoidance move in terse chrome.

## What generalized upward and what stayed downstairs

Upward into this subject: the dual-form inventory and ordering convention,
the no-space attachment to Latin/placeholder hosts, the reorder trick
(hang the particle on a known Korean noun instead of the placeholder), and
the audit framing that single-form-on-placeholder is a mechanical,
greppable defect class. Stayed in the repo: the product's specific
placeholder names, the termbase that decides what 슬랙-like values can
appear in `{name}`, and the house quotes ruling — a different product may
legitimately quote differently, but its particle alternation table is the
same table.

## Verification

Verified 2026-08-24 against the personas tree: `docs/i18n/style-ko.md`
sections "Typography & punctuation" (placeholder-particle rule with the
five dual forms), "Casing" (particle-to-Latin attachment), and "Pitfalls"
#1 (the wrong/right pair quoted above).
