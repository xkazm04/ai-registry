---
layer: application
type: application
subject: structured-output
technique: graded-span-grounding
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A citation verifier that checked the store while the model quoted the prompt

Ascent, an open-source maturity scanner that scores a repository's AI-assisted
engineering practice, read at commit `84226a65` (2026-09-16), the commit that carries
this change. The version witness is the `engines` field, `package.json:7 "24.x"`. Paths
are relative to the repo root, and every quoted anchor was checked with
`scripts/check-anchors.mjs`. Two of the scanner's dimensions are scored from **cited
claims**. The model names a facet and supplies a path and a verbatim quote, and a
deterministic verifier awards points only for a quote it finds. The contract the model
reads says so: `src/lib/scoring/claims.ts:324 "a paraphrased or invented quote is dropped and counted against"`.
This is the technique's admitting case. Nothing fuzzy may award points.

## The seam, chosen to falsify

The technique's source graded alignments and let fuzzy matches through. The seam was
picked because it could refute that: an admission gate where a fuzzy grade would inflate
a score. Two outcomes would have taught something. If the exact gate rejected no faithful
quotes, the graded half of the technique is unearned at an admission gate. If it rejected
some, the question becomes whether fuzzy matching or transport inversion is the right
repair.

## What the tree did before

The verifier matched quotes against raw content with whitespace and case folded,
`src/lib/scoring/claims.ts:464 "const commitText = snap.commits.map((c) => norm(c.message))"`
for history and a raw `norm(content)` for files. The prompt, built elsewhere, showed the
model something different. Each sampled commit is a bulleted line with its newlines
folded,
src/lib/scoring/prompt.ts:426 "neutralize(m.replace(",
and every excerpt goes through a boundary defusal that turns fence runs into two
backticks,
src/lib/llm/untrusted.ts:42 "[boundary marker removed]".
The model was told to quote "a commit subject from the sample", so it copied the line it
was shown.

## A: the verifier at the parent commit; B: the transports inverted

Two instruments, same inputs, both arms.

**Deterministic battery.** The ten repository snapshots the project keeps for its model
benchmark. Faithful copies were built from the rendered prompt, and fabricated near-copies
were built from the same lines.

| Case | A verified | B verified |
| --- | --- | --- |
| commit line copied as rendered, bullet included | 0 / 140 | 140 / 140 |
| commit subject copied without the bullet | 140 / 140 | 140 / 140 |
| guidance-file quote copied across a defused fence | 0 / 7 | 7 / 7 |
| one word swapped (must never verify) | 0 / 137 | 0 / 137 |
| tail of one subject joined to the head of the next (must never verify) | 0 / 130 | 0 / 130 |

Target moved, floor held: faithful copies of the rendered view went from 0 of 147 to 147
of 147, and the 267 fabrications stayed at 0 admitted.

**Model arm.** Eleven claim-producer runs (seven on a small model, four on a mid-size
one) read the real facet contract over the same snapshots rendered the same way, and
returned 13 claims. A verified 10, and B verified 10. One mid-size run quoted
`- [ci] format` for the commit-trail facet. A rejected it as not found. B strips the
bullet and rejects it as too short, because the subject alone is 11 characters against
`src/lib/scoring/claims.ts:258 "export const CLAIM_QUOTE_MIN = 12;"`. So the only live
instance was also under the length floor. The model arm shows the copy behaviour
happens: three of the four commit quotes carried the bullet, all from one run, and the
other two cited the history for facets that may not cite it. It does not show a lost point.

**The fuzzy alternative, run and rejected.** The source's LCS aligner (coverage 0.75,
density 1/3) was run on the rejected quote. Against raw history it located `[ci] format`
correctly. Against the folded history it accepted a span straddling two different
commit subjects, at coverage 0.8 and density 0.36. Three of the four matched tokens were
punctuation. At an admission gate that is a fabricated citation with a passing grade.
That result is where the technique's rules come from: grades locate, only exact admits,
and punctuation does not vote.

## The change

The bullet now has one spelling, shared by the renderer and the verifier:
`src/lib/scoring/claims.ts:269 "COMMIT_LINE_PREFIX"`. The verifier strips it from the
quote, never adds it to the history, and makes the remainder clear the floor alone:
`src/lib/scoring/claims.ts:505 "const subject = quote.startsWith(COMMIT_LINE_PREFIX)"`.
File quotes are tried against the raw content and then against the defused form:
`src/lib/scoring/claims.ts:517 "norm(defuseFences(content)).includes(quote)"`. The
defusal regex is a second copy of the security module's (`src/lib/scoring/claims.ts:273 "const defuseFences"`),
kept because the verifier is deliberately dependency-free. A test pins the copy by running
the security module's output through the verifier. The project gate:
`vitest src/lib/scoring`, 20 files, 437 tests green, with typecheck and lint clean on
the touched files.

## The structural fact

The mismatch was invisible for a reason no review could fix. Each transport had exactly
one home, and it was the wrong home for the other side: the bullet lived only in the
prompt builder, and the defusal only in the untrusted-content module. The verifier's test
suite built snapshots and quotes by hand. It never passed a quote through the renderer,
so no test could state the one property that mattered: a quote copied from the prompt
verifies. The fix therefore also added that test.

## What this realization cannot do

It verifies existence, not interpretation, as its own header says:
`src/lib/scoring/claims.ts:24 "WHAT VERIFICATION DOES AND DOES NOT PROVE."`. It does not
locate, so repeated occurrences and grades other than exact never arise here. The
technique's locating half has no seam in this tree. And the model arm is small. The
battery measures what the verifier does with a faithful copy; how often models make one
rests on four commit quotes from two runs.
