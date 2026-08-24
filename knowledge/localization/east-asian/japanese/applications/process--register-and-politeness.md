---
layer: application
type: application
subject: japanese
technique: register-and-politeness
stack: process
status: forged
verified_on: 2026-08-24
---

# Register and politeness — as worked in the Personas ja catalog

How one real 19k-key consumer-of-record — the Personas app, 14 locales,
~14,500 shipped lines of Japanese in `src/i18n/locales/ja.json` — realizes the
register technique, verified 2026-08-24 against
`C:\Users\kazda\kiro\personas\docs\i18n\style-ja.md`.

## JA-DESU-MASU, enforced by count rather than decree

The style guide's register section does exactly what
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)
demands: before stating the rule, it counted. A full-text scan of `ja.json`
found **zero** casual `だ。` sentence endings across ~14,500 lines, and the
guide records that count in the rule's own justification — "this is not a
stylistic suggestion, it is the established contract." An auditor citing
JA-DESU-MASU against this catalog is therefore citing a rule with measured,
not asserted, authority: any だ・である ending that appears in a future pass
is a deviation from a verified-clean corpus.

The guide also bans the imperative command forms (〜しろ, 〜してくれ)
directed at the user in the same breath — the JA-NO-IMPERATIVE half of the
technique — and the shipped corpus honors it.

## JA-TAIGENDOME, with a real label inventory behind it

The guide states the label rule concretely: `保存` not `保存します`, `閉じる`
not `閉じてください`, `キャンセル` — and backs it with the observation that
none of the ~40 shipped button labels carry a polite ending. The scoping
matches the technique exactly: です・ます is reserved for "anywhere a full
sentence is being written (descriptions, hints, errors, toasts, confirmation
dialogs)", while control labels use bare dictionary-form verbs or nouns. The
guide's phrasing of *why* — "a label is not a sentence; pasting a です・ます
ending onto a two-character button reads as bureaucratic" — is the
craft-teaching version of JA-TAIGENDOME, discovered independently in
production rather than copied from a vendor guide.

## Process shape worth copying

Three moves in this repo's guide generalize to any Japanese catalog:

1. **Count before ruling.** Every register rule in `style-ja.md` cites an
   occurrence count from the live catalog (zero だ。; ~40 clean labels), so
   the next translator verifies instead of re-litigating.
2. **Rules travel as wrong→right pairs.** The guide's Pitfalls section stores
   each shipped defect as a literal wrong string and its fix, keyed to the
   actual catalog key (e.g. `monitor.subtitle`) — an audit-ready format that
   maps one-to-one onto typed findings.
3. **Register rules and length rules cross-reference.** The label rule
   appears in both the register section and the length-discipline section of
   the same file, each pointing at the other — mirroring how JA-TAIGENDOME
   (grammar) and JA-LABEL-LENGTH (budget) split the same surface in this
   subject.

What stays in the repo and out of the bundle: the product's own register
temperature (a professional developer tool, flat declarative です・ます), its
termbase, and its do-not-translate list — all product voice, all correctly
downstairs.
