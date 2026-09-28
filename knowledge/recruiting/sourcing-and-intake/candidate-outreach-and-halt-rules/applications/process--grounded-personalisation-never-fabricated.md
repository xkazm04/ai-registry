---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: grounded-personalisation-never-fabricated
stack: process
status: forged
verified_on: 2026-09-28
---

# Grounding and register in the letter prompts

Re-read at kp `0c9a742d3` on 2026-09-28. The module has roughly doubled since the
first reading (2026-08-20), so every line number moved; the grounding blocks are
unchanged in wording, and one deviation has been closed.

`pipeline/jobfit/automation.py` composes the candidate-facing letters the
analysis pipeline generates. The shared grounding block is assembled into the
outreach prompt (`draft_outreach`, `:1212`), the rejection (`draft_rejection`,
`:1265`) and the offer (`draft_offer`, `:2739`); the shared style block reaches
those three and the interview letter (`draft_interview_letter`, `:2053`). Those
blocks are this technique in prompt form.

## The transplant test, written into the prompt

`automation.py:903`, `_LETTER_GROUNDING`, is the technique's operative test
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

`_letter_context` (`automation.py:841`) records why it exists, and it is the
technique's step 2 found in the wild: *"The 2026-08-11 bench found the letters
starved: outreach saw a name + three skill strings, rejection not even the match
— so no model COULD personalize, and every judge verdict read "pasteable onto
any candidate"."*

The fix was retrieval, not prompt tuning. The function assembles the shared fact
base first — seniority, summary, up to ten skills, three experience highlights,
three aspirations, the job's own facts, and where a match exists its tier,
matched skills and missing must-haves — and now caps every candidate-authored
string by length as well as count, because each one is free prose copied out of a
CV. The outreach prompt opens *"Use ONLY these facts:"* and serialises that object.
Facts first, generation second, and the generation's permitted material is
exactly the object that was retrieved.

## Neutral register, from a live misgendering

`automation.py:730`, `_NEUTRAL_STYLE`, is the technique's step 7 with an incident
attached (`:726`): *"The OO-L2 run caught a live offer letter addressing a woman as
'přesně takového kolegu jsme hledali' — instead of guessing gender, the letters
avoid gendered forms entirely (correct for every candidate, no inference
needed)."*

The block forbids the two easy escapes as firmly as it forbids the guess:

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

`automation.py:713`, `_letter_lang`, closes the seam the technique's step 8 names.
The letter's language comes from an explicit locale passed in by the caller, the
entry's *resolved* communications locale, so the letter *"provably matches the
deterministic chrome comms-dispatch wraps it in (OO-L1-03's two-language-authorities
defect)."* The generator is passed the locale rather than inferring one, and
falls back to the historical guess only for direct command-line use.

## A protected characteristic discards the draft, on the outreach path too

The first reading recorded that protected-attribute exclusion ran on the
rejection path and not on outreach. It now runs on both. `_letter_is_safe`
(`automation.py:426`) discards a model-drafted letter whole when it names a
protected characteristic, and `draft_outreach` calls it (`:1252`) with the reason
stated in place: this letter *"goes to a stranger who never applied, so it is the
least recoverable of the three."* Discarding rather than redacting is the
technique's own decision rule — when a generated message and its grounding
disagree, discard the message — applied to a vocabulary instead of a fact check.

## Deviations

- **The grounding is not retained with the message.** Step 10 asks that the facts
  supplied to the generation be stored alongside the sent message, so a complaint
  about a claim can be resolved against the record. The draft carries its prompt
  version (`OUTREACH_PROMPT_VERSION`), not the context object, which is built per
  call and discarded.
- **The transplant test is still instruction-only on outreach.** A mechanical
  refusal exists for the interview letter (`letter_problem`, `:2026`: empty, too
  long, protected language, stray numbers, pipeline machinery, the candidate's own
  words quoted back), but nothing applies the strip-the-name test to an individual
  outreach letter before dispatch.
- **The outreach prompt has no source sentence.** For a person who never applied,
  the one compulsory piece of personalisation is where their details came from
  (the-first-touch-carries-the-notice). The fact base holds no acquisition source
  for the model to state, and the deterministic fallback opens with *"your
  background in … caught our eye"*.
