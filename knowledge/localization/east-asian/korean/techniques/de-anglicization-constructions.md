---
layer: technique
type: technique
subject: korean
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Korean translations for calqued English structure, refining machine-translated Korean, writing typed findings for translated-smelling strings]
---

# De-anglicization constructions

A Korean string can be lexically perfect and still read translated because
English's *structure* survived: clause order, explicit pronouns, lexical
politeness, passive voice. These are the constructions that separate a
reviewed catalog from raw machine output — and because "reads translated" is
taste until anchored, each construction here carries an identifier a finding
can cite. A refine pass rewrites only what a cited finding flags; these
anchors are what make that gate workable for Korean.

## KO-CALQUE-CLAUSE · fuse English clause chains into connective endings

**Rule.** English coordinates finished clauses ("X happened, so you can't
Y" / "X, but Y"). Korean fuses them: the first clause takes a connective
ending and the sentence continues — `-이므로`/`-어서` (reason), `-지만`
(contrast), `-려면` (purpose/condition), `-면` (condition). Two short
sentences joined by 그래서, 하지만, 또는 그리고 where a single connective
sentence is natural is the definitive calque:

- Calqued: `이것은 시스템 항목입니다. 그래서 삭제할 수 없습니다.`
- Korean: `시스템 항목이므로 삭제할 수 없습니다.`

Sentence-initial conjunctions are not banned — long-form prose uses them —
but in a two-clause UI message the fused form is the default, and a finding
citing KO-CALQUE-CLAUSE should show the fused rewrite.

## KO-CALQUE-PRONOUN · delete what context supplies

**Rule.** English demands a subject and possessives; Korean omits both when
recoverable. Every carried-over 이것은/그것은 ("it/this" as dummy subject),
당신의/귀하의 ("your"), and repeated noun subject is over-specification.
The rewrite is deletion first, restructuring second: `당신의 변경 사항이
저장되었습니다` → `변경 사항이 저장되었습니다`; often further to
`변경 사항 저장됨` in terse chrome. (The 당신 ban itself is
KO-PRONOUN under register-and-honorifics; this anchor covers the broader
over-specification pattern, dummy subjects included.)

## KO-CALQUE-PASSIVE · agentless passives become active or intransitive

**Rule.** English hides agents with the passive ("Your file was deleted");
Korean reaches the same effect with intransitive/processive verbs
(삭제되었습니다 — the `-되다` family) and rarely tolerates the heavy
`-에 의해` agentive passive, which reads like a legal document. Rewrite
`관리자에 의해 삭제되었습니다` → `관리자가 삭제했습니다`; keep `-되다`
forms for genuinely agentless system events (저장되었습니다,
연결되었습니다) — they are native and correct, not calques. The defect is
specifically `-에 의해`, and secondarily the double-passive pileup
(`-되어지다`, always wrong).

## KO-PLEASE · politeness lives in the ending, not in a word

**Rule.** Never translate "please" lexically. `-세요`/`-해 주세요` carries
the full politeness of "Please enter your name"; adding 제발 turns the
request into desperate begging ("제발 저장하세요" reads as pleading with an
unreasonable person), and 부디 is archaic-literary. The audit is a plain
grep: 제발 in a UI catalog is a defect with essentially no false positives.
Related: "sorry" in error messages does not become 죄송합니다 by default —
Korean error convention is calm statement of fact plus next step;
apologizing is a product-voice decision, not a translation of "Oops".

## KO-CALQUE-ORDER · move the placeholder to where Korean wants it

**Rule.** Korean is verb-final and modifier-first; the skeleton's
placeholders must move to the target grammar's positions, and leaving them
in English positions out of caution is the defect (the skeleton law's
corollary — position is not part of the skeleton). "Failed to connect to
{service}" becomes `{service}에 연결하지 못했습니다` — placeholder early,
negated verb last. A Korean sentence that ends in a placeholder or a bare
noun where a verb should be, mirroring English order, is the structural
tell: verb-final is the single strongest surface signal of natural Korean.

## KO-NOMINAL-GLUT · unwind "것" and "-는 것" stacking

**Rule.** English gerunds and that-clauses tempt translators into 것
nominalizations: `저장하는 것이 가능합니다` ("saving is possible") for
`저장할 수 있습니다` ("can save"). One 것 is grammar; two in a sentence is
usually machine output. Prefer `-ㄹ 수 있다` for ability, `-기` for compact
nominalization, direct verb forms elsewhere. Similarly unwind the
`-에 대한/대해` glut ("about/regarding" calqued onto every English "for/
about"): `설정에 대한 변경` → `설정 변경`.

## Applying the anchors without degrading the catalog

These constructions justify a rewrite **only when the finding names the
anchor and the rewrite fixes that construction alone**. "Sounds more
natural to me" without an anchor is the taste-loop that degrades strings —
Korean has enough legitimate stylistic variance (topic vs subject particle
choice, 합쇼체 sentence rhythm) that unanchored refinement oscillates
between two correct forms. When a real defect fits no anchor here, mint the
next KO- identifier rather than fixing it silently: the anchor is what
makes the fix repeatable across the other nineteen thousand strings.

## When not to apply

Literary and marketing surfaces intentionally use rhetoric UI bans —
sentence-initial conjunctions, explicit 여러분 address, exclamations. These
anchors gate *UI catalog* review; applying them to campaign copy flattens
voice that was designed, not calqued.
