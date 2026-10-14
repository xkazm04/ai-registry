---
layer: application
type: application
subject: answer-engine-visibility
technique: answer-block-under-question-heading
stack: prompt-pipeline
status: forged
verified_on: 2026-10-14
refresh_by: 2027-01-14
verified_against: prompt-pipeline@2026.10.14
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Prompt pipeline: an article-drafting prompt that never asked for the answer first

An advertising workspace drafts publishable articles from an approved brief. Its drafting
prompt told the model to open with a lead paragraph, give every outline section a heading
and one or two short paragraphs, and attach a questions-and-answers list. Nothing in it said
what the first paragraph under a question-shaped heading should be, or what an answer in the
list should look like, or what to do when the brief supplies no figure. The page structure
was right; the extractable zone was left to chance.

## What was tested

Seam chosen to falsify "the prompt already produces liftable blocks": three Czech briefs (a
nut shop, a painting firm, a running-shoe shop), each carrying question-shaped headings,
run through the real system prompt and then through the same prompt plus three rules: open
a question-shaped section with a forty-to-sixty-word block that names its subject in the
first sentence and carries no pronoun pointing outside it; put a number, price or period in
the block only if the brief supplies it; write list answers as complete sentences that
answer directly. Two repetitions per brief per arm, one model, same inputs.

## What came back

| Measure | Before | After |
| --- | --- | --- |
| Opener under a question-shaped heading is a 30-65 word block with no leading pronoun | 10 of 14 | 14 of 14 |
| List answers that are complete sentences of 25-65 words with no leading pronoun | 6 of 12 | 12 of 12 |
| Figures in the output that the brief never contained | 20 | 0 |
| Structure intact (one callout, one call to action, every outline section, at least two answers) | 6 of 6 | 6 of 6 |

The figures row is the finding the technique's own "when not to use" section predicts and
this tree confirmed: the before arm produced durations and lifespans nobody supplied (a
shoe "lasts 600-800" of something, a storage period in months). The answer-first rule is the
lever that tempts a generator to fabricate, and the rule that pairs it with "only if the
brief supplies it" removed all twenty without costing a single structural check.

## Limits

n is twelve generations on constructed briefs, one model that is not the one this app serves
in production, one reading of "liftable" (length and subject-first, not an actual engine's
pick-up). The prompt contract is gated by a fingerprint and a reason ledger in the project,
so the change landed with its reason recorded. The return condition is a live measure: whether
published drafts are quoted by answer engines more often than before.
