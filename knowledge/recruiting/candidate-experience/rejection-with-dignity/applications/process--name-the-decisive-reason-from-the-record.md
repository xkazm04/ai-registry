---
layer: application
type: application
subject: rejection-with-dignity
technique: name-the-decisive-reason-from-the-record
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The rejection-letter prompt (`rejection-v5`)

`draft_rejection` in `pipeline/jobfit/automation.py:1276-1414` is the technique
written as a prompt contract. Its version stamp `REJECTION_PROMPT_VERSION =
"rejection-v5"` (`:113`) is documented at `:105-111`: v4 and v5 changed the
prompt bytes because the letters that follow an interview now receive the
interview's own record.

**This application first described `rejection-v3` (2026-08-20), and v3 was the
prompt that shipped the defects the standard warns about.** The reading quoted
v3's strong-profile clause approvingly ("the honest reason is that another
candidate matched this role's specific needs even more closely"). On 2026-09-05
a live run showed what that clause did (`39a6371fa`): an interview-stage
candidate was told the decisive reason was a gap that "had been on her CV the day
she was invited in", a second variant invented "the decision was close" (which
the old prompt had in fact instructed), and interview-stage and screening-stage
letters "named the same reason; only the greeting differed". The standard's own
strong-profile sentence shared the defect, and has been corrected upstream.

## The reason clause: branched on the evidence that exists

The single unbranched "name the ACTUAL decisive reason" is gone. The reason rule
(`:1294-1316`) is chosen by what the record holds, with a comment stating the
principle: "A prompt may only demand a reason the facts can support."

- **An interview was recorded** (`weak` non-empty): the decisive reason "MUST
  come from `interview.weakestCompetencies`", "Naming a CV gap instead is a lie
  the candidate can check: it was on their CV the day you invited them in."
  Never quote them back, never mention ratings, scores, a scorecard or the rubric.
- **No interview, a recorded skill gap** (`missing`): the reason is
  `match.missingMustHaves`, "and nothing beyond it".
- **Neither**: "THERE IS NO DECISIVE REASON IN THESE FACTS … so DO NOT ASSERT
  ONE. … do not say the decision was close, and do not say another candidate
  matched more closely: nothing here records that either. State simply and warmly
  that you are not taking their application forward for this role, and stop."

That last branch is the corrected strong-profile rule: the comparative sentence is
withheld unless the record holds a comparison, and this pipeline records none at
the screening stage.

## The evidence check is now enforced for the interview case

The feedback rules (`:1326-1331`) still carry the contradiction technique as
instruction: the feedback "must survive a check against the candidate's own
evidence", "never advise adding something their profile already shows",
"Leave feedback an empty string rather than write generic advice". What changed
is that the interview reason has a code path behind it. The schema asks for
`decisiveCompetency` ("EXACTLY one of interview.weakestCompetencies, verbatim"),
and `coerce` (`:1379-1411`) runs `_match_competency` over it; when `weak` is
non-empty and the field names none, "the whole draft is discarded rather than
patched" and the deterministic template ships, reported as `deterministic`. The
commit message gives the reason the check sits on a field and not on the body:
"the body itself is not scanned, because rubric labels are English and letters
are drafted in four locales, so a containment check would discard every
non-English draft."

The other half of the check is `_letter_is_safe` (`:437-`, called at `:1386`):
a draft that names a protected characteristic is discarded whole, for the reason
in its docstring: "a letter whose stated reason has been cut is no longer the
letter the model wrote".

## The starved fact base and the empty output

`_LETTER_GROUNDING` (`:914-`), shared with the outreach and offer letters,
supplies the anti-invention floor and the starvation test: "never assert
meetings, team reactions, benefits, interest, or abilities that are not in them",
and "if the body could be sent to a different candidate unchanged, it is wrong."
`_letter_context` (`:852-`) exists because of a measured incident, a 2026-08-11
bench "found the letters starved: outreach saw a name + three skill strings,
rejection not even the match". It now also carries the `interview` key, "present
ONLY when one actually happened. Its absence is load-bearing: the prompts below
stop asking for a decisive reason when this key is missing".

`interview_evidence` (`:765-`) is the candidate-safe projection of the scorecard:
competency names and bands only, no summary, no verbatim quotes, no rubric
metadata, and a "not assessed" 3 excluded because it cannot be a decisive reason
(`WEAK_RATING_MAX = 2`, `:761`).

## Stage honesty and neutral register

The same prompt forbids the phantom interaction: "Never imply an interview, call,
or meeting took place unless the stage they reached says so — a screening-stage
rejection thanks them for their application, nothing more." `_NEUTRAL_STYLE`
(`:741-`) is the register rule, and its comment records the incident that produced
it: an offer letter addressing a woman as *"přesně takového kolegu jsme hledali"*.
The directive requires neutrality "by RECASTING, never by breaking grammar: no
plural agreement for one person …, no slash forms ('věnoval/a')". `_letter_lang`
(`:724-`) takes the entry's resolved comms locale from the calling layer so the
model body provably matches the deterministic chrome around it.

## Deviations

Re-checked 2026-09-29. Two of the three recorded on 2026-08-20 are closed, one is
narrowed.

- **Closed: the deterministic fallback no longer invents.** `deterministic()`
  (`:1349-`) now sets `fb = f"Strengthening {', '.join(missing[:2])}" if missing
  else ""`; the "Adding more hands-on project depth" branch is gone, with a
  comment that names the reason ("Inventing development advice here would land on
  the STRONG candidate — the one closest to the bar"). An empty `feedback` drops
  the suggestion sentence from the body entirely.
- **Narrowed: a post-generation check exists, for the interview reason only.**
  The contradiction check on feedback text ("does the advice restate something the
  profile shows") is still an instruction to the model with no code behind it.
  The reason check is a structured field, and `decisiveCompetency` is `None` on
  the template and the no-interview path, so the recorded-gap reason
  (`match.missingMustHaves`) is still asked for, not verified.
- **Still open: no recorded-vs-derived provenance label.** The deterministic
  template path labels its reason source in the audit detail
  (`feedback:recorded_gaps` vs `feedback:unmet_requirements`); this drafted letter
  records `promptVersion` and, now, `decisiveCompetency`, but not whether the reason
  came from a recruiter's checklist or the matcher.
- **New: the drafted path and the deterministic path are two letters.** The
  unsolicited rejection dispatched by `dispatchRejection` is the deterministic
  template with recorded lines and never calls this function; `draft_rejection`
  serves the recruiter-review path: the result is stored and surfaced as a
  `rejection_drafted` event (`automation-run.ts:151`), not sent by the dispatcher. A reader of the standard should not assume the prompt above is what
  a candidate receives on the automated route.
