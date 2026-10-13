---
layer: application
type: application
subject: legislative-change-tracking
technique: amendment-instruction-grammar
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# Instruction grammar versus quoted instructions (Node)

The politicas law loop encodes the technique in `scripts/case-loops/law/collision-core.ts`:
`CLAUSE_START` (`:115`), `instructionFormsFor` (`:132`), `instructionRole` (`:197`) and
`amendsParagraph` (`:213`). Witness: a local checkout at commit `cce005b`, run on Node 24
through the project's unit runner. This note tests the one precondition the technique
states and the grammar does not implement: a quoted instruction can imitate an operative one.

## The probe

The seam was chosen to falsify. The question was whether clause anchors alone keep a
quoted instruction out of the amended set. Six constructed clauses were run through
`amendsParagraph(text, "8")` and `instructionRole`, the genuine edit as the control.

| Clause shape | Verdict for § 8 |
| --- | --- |
| genuine "V § 8 se slova … zrušují" at a line start | amends (correct) |
| the phrase mid-sentence inside a quote | cites (correct) |
| the phrase opening a quote on the instruction's own line | cites (correct) |
| a quote wrapped so the phrase opens a physical line | **amends** (wrong) |
| a quoted new paragraph whose second line opens with the phrase | **amends** (wrong) |
| the phrase after a sentence break inside a quote | **amends** (wrong) |

Three of the five quoted shapes were credited as amendments. Both `\n` and `\.\s+`
are valid clause openers, and neither can tell a quote's interior from the bill's own
clause stream. The grammar holds no quote state. Its own comments already record the
same hole once, for the odstavec reader, which "read 'uvedené v § 30 odst. 3' inside quoted
text", so the gap is known and was patched per form, not at the clause level.

## What this does not establish

The clauses are constructed, not drawn from prints. The 141-print cache
(`.data/law-collision-cache`) is absent from this checkout, so how often real bills quote an
operative formula, and whether any collision backlog pair rests on one, was not counted.
The probe shows the grammar admits the shape; it does not show the corpus contains it.
Nothing was changed in the project: no behavioural measurable existed to pair a fix.

## Verdict and return condition

`unmeasurable`. Instrument that would settle it: the rebuilt print cache, then a count
of operative-slice matches that sit inside a balanced quote span, hand-read both ways as
the technique's step 4 requires. Target: credited pairs that sit inside a quote. Floor: the
3166-pair census the project already reproduces. Until then the extraction-preconditions
section is a confirmed structural gap, not a measured error rate.
