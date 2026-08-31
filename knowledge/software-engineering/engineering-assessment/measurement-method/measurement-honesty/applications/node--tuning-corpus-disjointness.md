---
layer: application
type: application
subject: measurement-honesty
technique: tuning-corpus-disjointness
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A sanitiser graded by the list it is made of

A desktop application embeds untrusted text into model prompts — imported
workflow definitions, template variable values — and passes all of it through a
shared sanitiser first. The sanitiser is a list of thirteen regular expressions
covering role-override lines, section delimiters, structural tags, four
override phrases, zero-width codepoints, escape sequences and non-BMP
characters. An eval in the repository's own test runner replays a fixture
corpus of recorded attack payloads through the real sanitiser and asserts the
security property. It is deterministic, needs no model, and it is the only
thing standing behind the claim that the guard works.

It scores 9 out of 9, and it has scored 9 out of 9 since it was written.

## The two artifacts came from one authoring act

The fixture corpus holds nine payloads. The pattern list holds thirteen
families. **Every fixture label is the name of a pattern family** —
`role-override`, `ignore-previous`, `disregard-prior`, `section-delimiter`,
`xml-role-tag`, `heading-override`, `bypass-safety`, `you-are-now`,
`zero-width`. The corpus is a transcription of the artifact it grades, one
payload per rule, and nothing in the tree records that.

The assertions are a transcription of the same list. The eval does not ask
whether the payload was neutralised; it asks whether five specific structures
are absent from the output — and those five structures are five of the thirteen
patterns, restated. So the question the eval poses was built from the same
enumeration as the thing it questions.

The module's header already contains the argument against its own corpus. It
states that structural patterns are used *rather than* a blocklist of specific
phrases, "which are trivially bypassed via synonyms, word-splitting, homoglyphs,
and encoding tricks". Five of the thirteen patterns are exactly such a phrase
blocklist, and every fixture exercises them in their canonical phrasing. The
tree names the bypass class and then does not test it.

## Both arms, same instrument

Arm A is the shipped fixture corpus. Arm B is eleven payloads in the same shape
classes, phrased in the ways the module's own header names — a synonym for the
banned verb, a spacing variant of the delimiter, a differently-named structural
tag, a rephrasing of the override sentence, a zero-width codepoint outside the
listed set. Both arms run the sanitiser's real pattern array and the eval's real
predicate, copied verbatim, with no product code changed.

| | arm A (shipped corpus) | arm B (same classes, unlisted phrasings) |
|---|---|---|
| scored "neutralised" by the eval's predicate | 9/9 | **11/11** |
| actually modified by the sanitiser | 8/9 | **2/11** |

Arm B is the finding, and it is sharper than a failing score would have been.
The eval does not report arm B as a miss — it reports a **perfect score on nine
payloads the sanitiser never touched**, because a predicate built from the
pattern list cannot notice an input the pattern list ignores. A score of 11/11
and a pass-through rate of 9/11 are the same run.

## What the tree's shape says about the standard

The negative result is the useful one here, and the tree produced it without
being built to. The eval already carries one contamination defence, and it is
the right one: `expect(INJECTION_PATTERNS.length).toBeGreaterThanOrEqual(10)`,
with the comment "a truncated blocklist is a silent regression". Somebody
understood that an instrument can pass by being empty and guarded against it.

That guard is a vacuity check on the *artifact*. The gap is that no equivalent
guard exists on the *corpus* or on the *predicate*, and those are where the
fitting actually happened. A team can hold the instrument-assertion discipline
completely and still ship a self-graded eval, because the two failures look
nothing alike from inside: one is an artifact that shrank, the other is a
question that was never able to be answered no.

## What this realisation cannot do

The measurement is a comparison of two payload sets under one sanitiser, at
n=9 and n=11. It says the eval's score is uninformative about unlisted
phrasings; it does not say how exposed the application is, because that depends
on what the downstream model does with an unsanitised override line, which no
deterministic check here can see. The honest reading is that the number
currently published by this eval carries no information about the class of
attack its own source file names as the dangerous one.

It also cannot say the patterns are wrong. Structural isolation is the correct
primary defence and the structural half of the list does its job — arm A's
section-delimiter, tag and zero-width payloads are genuinely removed. What is
unsupported is the *score*, not the design.

## The change this argues for, not made here

The repair is small and belongs to the project's owners: add payloads whose
phrasing is not in the pattern list, and add the predicate that can fail on
them — that the sanitiser altered its input at all. Two numbers then travel
together, the neutralised rate and the untouched rate, and the second one is the
one that moves when the list falls behind. The tree was not modified for this
application; the arms were run against copies of its real code.
