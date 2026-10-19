---
layer: technique
type: technique
subject: ad-concept-development
technique: llm-seat-assignment
status: forged
laws: [cost-per-usable-output]
shared_with: []
use_when: [planning where a language model sits in an ad or short-film pipeline, a team expects a stronger model to fix creatively generic output, writing per-shot prompts for image or video engines from a script]
---

# LLM seat assignment

## The concern

Teams that make generated spots tend to treat the language model as the creative
director: describe the product, ask for an ad, then ask for the prompts. The makers
whose generated spots drew the widest praise in 2025-26 describe something narrower
in their own production write-ups:
- A human writes the jokes or the story, often with a writer and a director as
  separate people.
- A model turns the script into a shot list, and each shot into a prompt in the
  target engine's dialect.
- When a shot fails, the maker describes the failure to the model and has it revise
  the prompt.

One maker states it plainly: the most valuable skill is comedy writing, and brands
still pay for taste. A search in 2026 found no maker-primary account crediting a
language model as the creative director of widely praised work.

The research on ideation explains why this division works. Model output converges,
within a model and across vendors, and model judges miss individual taste (see
[divergence-against-the-median](./divergence-against-the-median.md)). The model is
strong where the median is the goal and weak where the job is to leave the median.
So the assignment follows the job, not the model's capability.

## The seats

1. **Generator, under procedure.** Volume ideation for premises, settings, characters
   and jokes, always run with the divergence procedure. It supplies options and never
   the decision.
2. **Translator.** This is the strongest seat.
   - Script to beat sheet, beat sheet to shot list, shot list to per-engine prompts in
     each engine's dialect.
   - Requests stay small. One maker reports quality dropping above about five prompts
     per request.
   - Each prompt must stand alone. Restate the setting, the character and the tone in
     every one, because the engine has no memory of the last.
   - Constrain the translator against rewording locked text (identity, style), not
     "toward consistency". A faithful paraphrase is a fresh sample.
3. **Reviser.** Given the prompt, the output and a one-line description of what
   failed, the model revises the prompt. The human sees the failure and the model
   rewrites. This loop is where most of a translator's value is earned.
4. **Critic.** An adversarial pass on a concept, a shot list or a cut: list its
   clichés, name the existing work it resembles, and say where each second fails to
   earn its place. Critique is reliable at *finding* familiarity. That differs from
   judging which candidate is best.
5. **Variety enforcer.** Rewrite a shot list so that no two consecutive shots share
   framing, camera height or scale, and justify each change. Consistency-heavy
   pipelines collapse to one framing, and the model breaks the pattern well when told
   to.

**The concept and taste seat stays human.** Choosing the premise, approving the
look, and selecting takes in the edit all require someone to prefer one thing over
an average of things.

## Procedure

1. Map the pipeline stages: brief, concept, script, look, shot list, prompts,
   generation, selection, edit, sound and finish. Mark each stage with its seat.
2. Give the model a **project document** before any request. Include the locked
   concept sentence, the style rules, the engine dialect notes and example prompts
   that worked. A standing document is how the translator stays consistent across
   sessions.
3. Budget selection as work. Kept-to-generated ratios reported by makers range from
   one in a few to one in dozens per shot, and higher figures circulate from single
   sources. Plan generation volume and review time against usable output, not
   against renders.
4. Keep a failure log per shot (prompt, output, failure line, revision). It feeds
   the reviser seat and is the evidence when a shot is abandoned.

## Decision rules

- When a team asks which model to use for ideas, the answer is the procedure. Model
  choice moves fluency and dialect fidelity, not distinctiveness.
- When the model's shot list is accepted unedited, check it for framing monotony
  before generation. It defaults to the medium eye-level shot.
- When the model proposes the look in words, have it produce reference boards
  instead, or have a human choose from images. Look decisions made in prose land on
  the default look.

## When not to use

- Solo exploratory work where the maker *wants* the model to lead a draft as a
  sketching partner. Fine, provided the draft is not confused with a concept.
- Pipelines with no generation stage (live action), where only the generator and
  critic seats apply.

## Failure modes

- **Creative director by default.** "Write me an ad for X" is the first request,
  so the median premise becomes the brief.
- **Batch translation.** Thirty prompts in one request, each referring to the last.
  Quality drops and the prompts stop standing alone.
- **Critic as judge.** The critic's list of resemblances is turned into a ranking,
  and the least familiar candidate loses because the model can't see its value.
