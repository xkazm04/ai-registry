---
layer: application
type: application
subject: llm-forensic-gating
technique: prose-register-gates
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Register gating of army prose on a Czech-first civic site (Node)

Politicas renders analyst-army prose verbatim to readers on `/poslanec` and
`/zakony`, and gates its register with three composed deterministic modules —
each rule grown from a measured leak, each running at both persist and render
time from one definition.

## The jargon gates

`lib/analysis/public-copy.ts:27-65` is the effort case's `PIPELINE_JARGON`
list: raw prop identifiers, internal case references, gate-rule citations,
batch/sample self-references (including the superlative-scoped form "nejvíce
ze svého vzorku", found in 8/16 batch-008 proposals after the plain rule
missed all of them). Its header carries the incident: the leak grew
monotonically 5 → 18 → 84 → 140 → 199 field-instances and reached 136 of 207
live person nodes before the gate landed. Q-effort-15 records the fork
lesson: the persist gate carried a LOCAL copy of the API-mechanics rule that
render-time `publicCopyOrNull()` lacked — an enforcement gap fixed by making
the gate script import this array (`public-copy.ts:55-65`).

`LAW_PIPELINE_JARGON` (`lib/analysis/law-verdict.ts:110-155`) is the law
case's list, module-scoped "so the SAME rule runs at persist time
(validateLawVerdict) and at render time (getLawData.ts withholds on it) — a
gate that exists in one place only is a gate the other surface silently
lacks." Its evolution is the whack-a-mole-to-structural arc: three batches of
token classes (urns in prose, cache paths, batch ids), then batch-017's
structural rules — Czech prose never contains ASCII camelCase, snake_case, or
prop-value shapes — with `CAMEL_ALLOW` (`:162-163`) as a verified allowlist
(e-government names like eSbírka, unit symbols like kWh/mSv), "grown by
allowlisting a VERIFIED name, never by loosening the rule." The ambiguity
carve-outs are hand-measured: „dávka" is a social benefit AND a batch id in
the same verdicts, so only the id-shaped form (`dávk\p{L}*\s+0\d{2}`) is
gated, and a unit/currency suffix legitimizes the rest
(`law-verdict.ts:120-127, 193-201`). Two Unicode lessons are encoded, not
narrated: ASCII `\w`/`\b` cannot match Czech letters (re-learned on
„dávce"/„Dávkový"), and the camelCase rule carries `g` because a first-match
`continue` on an allowlisted hit voided the whole rule for the rest of the
sentence (`lawJargonIssues`, `:166-186`).

## The language gate

`lib/analysis/language-gate.ts:1-35` opens with the technique's thesis: "an
English sentence can be perfectly true, perfectly cited and perfectly gated
against fabrication" — and batch 009 measured 27/27 gated verdicts rendering
English to Czech readers. The classifier is deterministic stopword frequency
over two disjoint lists (ambiguous homographs `a/to/on/by/do/i/no/so` score
for neither side, because the English originals are dense with Czech legal
tokens a diacritics test would call Czech), with a stricter presence rule
under 16 tokens and ties resolving against rendering. The 2026-08-12
precision incident is preserved in the list itself: "evidence" is an ordinary
Czech word, and including it flipped 14/211 genuinely Czech reviewer notes to
withheld — removed, kept as doctrine in the comment.

## Both doors, non-destructive withholding

`lib/analysis/public-copy.ts:1-27` and `language-gate.ts:14-27` document the
same two-door pattern: persist-time hard-reject (no new violation enters the
graph) plus render-time withholding via `czechCopyOrNull` /
`publicCopyOrNull` (the backlog already in the graph never reaches a reader).
Withholding is deliberately non-destructive — the English/jargon original
stays in the graph as ground truth, and the reader sees the honest
placeholder `CZECH_WITHHELD_CZ` ("Česká verze tohoto textu se připravuje…")
instead of a silent gap or a machine translation.

## Upward lesson: compose with carve-outs, never verbatim

`lawJargonIssues` composes the effort case's shared list but skips two rules
with documented scope limits (`law-verdict.ts:187-203`): the sample-scoped
self-reference rule wrongly withholds legal prose where „v této skupině"
denotes a statutory group of insured persons (verdict-257), and the
„dávka <digit>" batch-id rule matches radiation doses and benefit amounts.
Rule sets transplant between surfaces only with a per-rule audit against the
destination corpus.
