---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: grounded-personalisation-never-fabricated
stack: process
status: forged
verified_on: 2026-08-20
---

# Grounding and register in the letter prompts

`pipeline/jobfit/automation.py` composes every candidate-facing letter the
analysis pipeline generates — outreach at `:490`, rejection at `:544`, and a
third variant at `:1138`. All three assemble the same three shared blocks, and
those blocks are this technique in prompt form.

## The transplant test, written into the prompt

`automation.py:270`, `_LETTER_GROUNDING`, is the technique's operative test
stated as an instruction:

> "Ground every claim in the supplied facts: never assert meetings, team
> reactions, benefits, interest, or abilities that are not in them. Anchor the
> message on the STRONGEST candidate-specific hooks available, in this order:
> (1) a stated aspiration that maps to this role or company, (2) a concrete
> experience highlight, (3) the matched skills. Name at least two specific facts
> from THIS candidate's profile — **if the body could be sent to a different
> candidate unchanged, it is wrong**."

Three of the technique's procedure steps are visible in that paragraph: the
enumerated invention categories (step 3), the ranked hooks with aspiration above
inferred skill (step 4), and the transplant test itself (step 6) — here stated to
the generator rather than applied as a review gate, which is the cheaper place to
put it and not a substitute for the review.

## Retrieval before generation — the starvation finding

The block's own comment records why it exists, and it is the technique's step 2
found in the wild: *"the 2026-08-11 bench found the letters starved: outreach saw
a name + three skill strings, rejection not even the match — so no model COULD
personalize, and every judge verdict read 'pasteable onto any candidate'."*

The fix was retrieval, not prompt tuning. `_letter_context` at `automation.py:232`
assembles the shared fact base first — seniority, summary, up to ten skills, three
experience highlights, three aspirations, the job's own facts, and where a match
exists its tier, matched skills and missing must-haves. The outreach prompt then
opens `"Use ONLY these facts:"` and serialises that object
(`automation.py:496`). Facts first, generation second, and the generation's
permitted material is exactly the object that was retrieved.

## Neutral register, from a live misgendering

`automation.py:216`, `_NEUTRAL_STYLE`, is the technique's step 7 with an incident
attached: *"The OO-L2 run caught a live offer letter addressing a woman as
'přesně takového kolegu jsme hledali' — instead of guessing gender, the letters
avoid gendered forms entirely (correct for every candidate, no inference
needed)."*

The block is worth reading as craft because it forbids the two easy escapes as
firmly as it forbids the guess:

- **Neutrality by recasting, never by breaking grammar** — no plural agreement for
  one person, and explicitly *"no slash forms"*, which the technique names as the
  clerical non-solution.
- **Register held to the last sentence** — first-person plural kept consistent for
  the sending team, and formal address consistent throughout, because *"one slip
  into tykání ruins an otherwise formal letter."* That is the technique's step 8
  in a language where the failure is unmissable.
- **One language only** — *"never mix in words or characters from any other
  language or script."*

## One language authority

`automation.py:200` closes the seam the technique's step 8 names. The letter's
language comes from an explicit locale passed in by the caller, which is the
entry's *resolved* communications locale — the candidate's own apply-time choice,
else the workspace default. The comment names the defect this repaired:
*"OO-L1-03's two-language-authorities defect"* — the generated body was guessing
the language from the candidate's document while the deterministic chrome around
it used the recorded preference, so one letter could carry two languages. The
generator is now passed the locale rather than inferring one, and falls back to
the historical guess only for direct command-line use.

## Deviations

- **The grounding is not retained with the message.** The technique's step 10
  asks that the facts supplied to the generation be stored alongside the sent
  message, so a candidate's complaint about a claim can be resolved against the
  record. The context object is built per call and discarded; only the letter
  survives.
- **The transplant test is instruction-only.** It is stated to the model and was
  evaluated by a judge run at bench time; nothing applies it mechanically to an
  individual letter before it is dispatched.
- **Protected-attribute exclusion is enforced on the rejection path, not the
  outreach path.** The rejection letter drops protected-attribute lines whole
  (`app/_lib/comms-dispatch.ts:263`, via `rejection-feedback.ts`); the outreach prompt relies on the fact base
  not containing such attributes rather than on an explicit exclusion.
