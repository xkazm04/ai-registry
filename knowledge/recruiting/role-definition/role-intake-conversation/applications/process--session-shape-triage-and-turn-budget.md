---
layer: application
type: application
subject: role-intake-conversation
technique: session-shape-triage-and-turn-budget
stack: process
status: forged
verified_on: 2026-08-20
---

# Shape triage and turn budget in a two-path intake engine

`pipeline/jobfit/intake.py` realizes the technique as a **deterministic
triage that is also the keyless fallback path**. The shape vocabulary is
closed to exactly the two delivery shapes the standard names
(`SHAPES = ("power_unit", "story")`, `:46`), and the whole engine — model-led
or scripted — routes off it.

## The heuristic is the floor, not the model's opinion

`detect_shape` (`:268-279`) reads only the **first two requestor turns**
(`_requestor_turns(turns)[:2]`) and matches two marker sets:
`_POWER_UNIT_MARKERS` (`:256-261`) for existing-seat language — *backfill,
replacement, same as, another one, one more, clone, the old jd* — and
`_STORY_MARKERS` (`:262-266`) for hedging and first-hire language — *not
sure, no idea, we think, maybe, kind of, never had, new team, first hire, one
role or two*. The header states the governing rule in one line (`:248-250`):
deterministic, "the LLM may override with its own triage but the heuristic is
the floor and the keyless path."

The fail-safe direction is coded, not incidental: with no marker hit and two
requestor turns on the record, `detect_shape` returns `"story"` (`:277-278`);
before that it returns `None`, and the caller defaults to `story` at every
render (`:560`, `:598`). Over-serving is the chosen error.

**The language-fragility lesson is a shipped scar.** `:252-255` carries it
verbatim: the original marker group used tight word boundaries on dictionary
forms, "Czech INFLECTS ('posilu', 'náhradu', 'stejného', 'dalšího') and the
original tight `\b` group missed every oblique case, dropping keyless Czech
backfills onto the long story script (UAT 2026-08-07-intake, L1-EVA-2 — the
L1 agent executed the regex to prove it)." The fix stems the markers
(`\w*` suffixes). The residual is recorded honestly in
`docs/product/uat-insights/2026-08-10-intake-triptych.md:31`: English
clinical-backfill idiom — "maternity cover", "handed in her notice" — still
routes the long path. Marker-based triage is a per-idiom, per-language
maintenance surface, exactly as the technique warns.

## Two scripts, one order

`_script_for` (`:452-456`) is the turn budget made literal, and it preserves
the standard's ordering rule under both budgets:

- power-unit: `context → title → success → musts → seniority → budget` (six
  slots, the research target of ≤8 turns);
- story: the same spine plus `nices, languages, team, urgency` (ten slots,
  the 15-25 turn path).

The shorter path drops slots; it never reorders them. The comment block above
the script (`:281-292`) states why the order is what it is — "context first
(cognitive interview), outcomes before requirements (the 90-day de-spec
device), musts before nices, then the read-back" — and the question texts
implement the register: the opening slot pairs the non-judgment with the
reinstatement anchor in one utterance ("no wrong answers here; vague is fine,
that's what this session is for. Think about the last month: where did the
team feel the missing person most?", `:295`), the seniority slot ships the
disposable contrast ("Neither is fine — say what feels right", `:315`), and
compensation is explicitly skippable ("Totally fine to skip this one",
`:331`).

## The budget survives a crash

Slot recovery is **stateless**: `_asked_slots` (`:457-468`) reconstructs what
has already been asked by matching a 40-character prefix of each localized
question against the agent's turns, and `deterministic_turn` (`:563-576`)
recovers which slot the incoming message answers by scanning backwards for
the last scripted question. Nothing about the budget lives in memory, so a
failed or model-degraded turn re-enters the session at the right slot rather
than restarting or double-asking — and slots asked out of order after a shape
flip still resolve.

## The close is two turns, because it once was one

`deterministic_turn`'s docstring (`:530-537`) names the incident: "when the
script is exhausted, READ BACK and WAIT — the close only happens on the
requestor's next message (confirm → close; anything else → captured as their
stated correction, then close). The old same-turn read-back+close locked the
composer on the invited correction (UAT L1-CONV-2, 3/3 Characters)." The
implementation matches: the exhausted script returns the read-back with
`done: False` (`:598`), and only the following message closes — a
confirmation ends it, anything else is stored as a `Correction` facet with
`provenance="stated"` and its source turn before the close (`:543-561`).

**Deviations, recorded not lowered.** Three, all documented in the triptych:
the model-led path still *accepts* a one-shot read-back-plus-close in
`coerce` (`:772`) — the two-turn close is instructed in `_PERSONA_CLOSE`
(`:97-102`) and enforced only on the deterministic floor. On that floor the
correction is recorded but not *applied*: it never reaches `brief.seniority`
or the must-haves. And the fresh brief initialises a software role family
before a word is spoken, with deterministic reclassification only at the
read-back (`:589-594`, comment citing L1-HRBP-2, "a clinical intake must not
promote as software") — a default that flatters one family until the session
is nearly over. The standard's rule stands in all three cases.
