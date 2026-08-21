---
layer: application
type: application
subject: rejection-with-dignity
technique: name-the-decisive-reason-from-the-record
stack: process
status: forged
---

# The rejection-letter prompt (`rejection-v3`)

`draft_rejection` in `pipeline/jobfit/automation.py:538-596` is the technique
written as a prompt contract. Its version stamp `REJECTION_PROMPT_VERSION =
"rejection-v3"` (`:45`) is documented at `:38-43` as the change that made "the
rejection name the actual decisive gap + evidence-checked feedback".

## The reason clause

The prompt (`:541-563`) opens by constraining the fact base — "Use ONLY these
facts" followed by `_letter_context(candidate, job, m)` as JSON — then states
the resolution rule:

> The body must name the ACTUAL decisive reason, kindly and concretely — drawn
> from missingMustHaves or the match tier, never a generic 'we proceeded with
> other candidates' alone.

That is steps 2 and 3 of the resolution order, with the explicit refusal of the
generic line as a *substitute*. The strong-profile case is spelled out in the
next sentence, including why:

> When missingMustHaves is empty and the tier is strong, do NOT invent a skill
> gap (a claimed gap the candidate's own highlights disprove is the worst
> possible letter): the honest reason is that another candidate matched this
> role's specific needs even more closely — say that gracefully.

Then one real strength, "so the message reads as considered, not templated".

## The evidence check and the empty output

The feedback rules (`:554-557`) carry the sibling contradiction technique
literally: the feedback "must survive a check against the candidate's own
evidence"; "never advise adding something their profile already shows (check
experienceHighlights and skills first)"; "never presuppose work they do not
have"; and — the fill-the-slot cure — "Leave feedback an empty string rather
than write generic advice."

`_LETTER_GROUNDING` (`:270-277`), shared with the outreach and offer letters,
supplies the anti-invention floor and the starvation test: "never assert
meetings, team reactions, benefits, interest, or abilities that are not in
them", and "if the body could be sent to a different candidate unchanged, it is
wrong." `_letter_context` (`:232-247`) exists because of a measured incident —
a 2026-08-11 bench "found the letters starved: outreach saw a name + three skill
strings, rejection not even the match — so no model COULD personalize, and every
judge verdict read 'pasteable onto any candidate'."

## Stage honesty and neutral register

The same prompt forbids the phantom interaction (`:558-560`): "Never imply an
interview, call, or meeting took place unless the stage they reached says so —
a screening-stage rejection thanks them for their application, nothing more."

`_NEUTRAL_STYLE` (`:216-229`) is the register rule, and its comment records the
incident that produced it: an offer letter addressing a woman as *"přesně
takového kolegu jsme hledali"*. The directive requires neutrality "by RECASTING,
never by breaking grammar: no plural agreement for one person …, no slash forms
('věnoval/a')", plus consistent first-person-plural sender, consistent formal
register "to the last sentence — one slip into tykání ruins an otherwise formal
letter", and no mixed-script output. `_letter_lang` (`:199-214`) closes the
one-letter-two-language-authorities defect (`OO-L1-03`) by taking the entry's
**resolved comms locale** from the calling layer so the model body provably
matches the deterministic chrome around it, falling back to the CV-language
guess only for direct command-line use.

## Deviations

- **The deterministic fallback invents.** `deterministic()` (`:564-582`) sets
  `fb = f"Strengthening {', '.join(missing[:2])}" if missing else "Adding more
  hands-on project depth"`. The else-branch is exactly the fill-the-slot defect
  the prompt above it forbids: with nothing recorded as missing, the fallback
  letter still ships a generic development suggestion — the one output the
  standard says must be empty. The strong-profile case is the case where this
  fires, so the letter most likely to carry an invented gap is the one sent to
  the strongest rejected candidate. The rule the prompt states is the standard;
  the fallback falls short of it.
- **No post-generation contradiction check.** The evidence check is an
  instruction to the model, not a step in the pipeline; there is no code path
  that re-tests the produced feedback string against `skills` and
  `experienceHighlights` before dispatch. The standard wants the check enforced,
  not requested.
- **No recorded-vs-derived provenance label.** The deterministic template path
  labels its reason source (`feedback:recorded_gaps` vs
  `feedback:unmet_requirements` in the dispatch audit detail); this drafted
  letter records only `promptVersion`, so a later reader cannot tell whether the
  reason came from a recruiter's own criteria or from the matcher.
