---
layer: application
type: application
subject: role-intake-conversation
technique: session-shape-triage-and-turn-budget
stack: process
status: forged
verified_on: 2026-09-26
---

# Shape triage and turn budget in a two-path intake engine

`pipeline/jobfit/intake.py` realizes the technique as a **deterministic
triage that is also the keyless fallback path**. The shape vocabulary is
closed (`SHAPES = ("power_unit", "story", "app_master")`, `:46`): the two
delivery shapes the standard names, plus a third added on 2026-08-23 for a
different kind of session — defining the owner of an application whose
codebase has already been scanned. Re-read on 2026-09-26 at one pinned commit
of the consumer; the engine has doubled in size since the first reading, and
the triage heuristic itself has not changed.

## The heuristic is the floor, not the model's opinion

`detect_shape` (`:344-363`) reads only the **first two requestor turns**
(`_requestor_turns(turns)[:2]`, `:354`) and matches two marker sets:
`_POWER_UNIT_MARKERS` (`:332-336`) for existing-seat language — *backfill,
replacement, same as, another one, one more, clone, the old jd* — and
`_STORY_MARKERS` (`:337-341`) for hedging and first-hire language — *not
sure, no idea, we think, maybe, kind of, never had, new team, first hire, one
role or two*. The header states the governing rule (`:324-325`):
deterministic; "the LLM may override with its own triage but the heuristic is
the floor and the keyless path."

The fail-safe direction is coded, not incidental: with no marker hit and two
requestor turns on the record, `detect_shape` returns `"story"` (`:361-362`);
before that it returns `None`, and the callers default to `story`
(`:1314`, `:1364`). Over-serving is the chosen error.

The third shape is not triaged at all, and that is the right design:
`app_master` is returned first whenever the caller passes the flag
(`:352-353`), and the caller sets it from the presence of a codebase dossier
(`:1618`). A session type known from context should not be guessed from
phrasing. The seam is timing: the docstring says the flag follows "a scan id
or a dossier", the code checks only the dossier, and the message route says
outright that a session whose scan has not landed "talks like a normal intake
until it does" — so a requestor who answers before the scan finishes is
triaged by markers into a script built for a different conversation.

## Language fragility: the scar, and the same scar reopening

The original lesson is kept verbatim at `:328-331`: the marker group used
tight word boundaries on dictionary forms, "Czech INFLECTS ('posilu',
'náhradu', 'stejného', 'dalšího') and the original tight `\b` group missed
every oblique case, dropping keyless Czech backfills onto the long story
script". The fix stems the markers. The English residual is recorded in
`docs/product/uat-insights/2026-08-10-intake-triptych.md:36`: clinical
backfill idiom — "maternity cover", "handed in her notice" — still routes the
long path.

**On 2026-09-03 the keyless script learned German and French and the triage
did not.** The questions, confirm words and skip words gained both locales;
the marker sets are still English and Czech. Executed at the pin: a German
"Es ist eine Nachbesetzung" and a French "C'est un remplacement" both triage
to `story`, while the Czech "náhradu" and the English "backfill" controls
triage to `power_unit`, and "maternity cover" and "handed in her notice"
still fall through. Every German and French backfill therefore runs the long
script. This is the technique's language-fragility rule observed a second
time in the same engine, by a different route: adding a language to the
script did not add it to the triage, and nothing failed loudly because the
long path still produces a working session.

## Two scripts, one order

`_script_for` (`:1013-1020`) is the turn budget made literal, and it
preserves the standard's ordering rule under both delivery budgets:

- power-unit: `context → title → success → musts → seniority → budget` (six
  slots, the research target of ≤8 turns);
- story: the same spine plus `nices, languages, team, urgency` (ten slots,
  the 15-25 turn path).

The shorter path drops slots; it never reorders them. The comment block above
the script (`:586-595`) states why the order is what it is — context first
(cognitive interview), outcomes before requirements (the 90-day de-spec
device), musts before nices, then the read-back — and the English question
texts implement the register: the opening slot pairs the non-judgment with
the reinstatement anchor in one utterance (`:599`), the seniority slot ships
the disposable contrast ("Neither is fine — say what feels right", `:629`),
and compensation is explicitly skippable (`:653`). The disposal clause did
not survive translation: the Czech, German and French seniority questions say
roughly "an approximate answer is fine" (`:630-632`), which invites a
hedge, not a refusal.

The `app_master` script (`:746-756`) is a separate nine-slot order —
objectives, mandate, forbidden change classes, budget, review owner,
probation, population — with no must-haves, no trade-off slot and no return
to anything parked. It keeps outcomes before constraints, which is the rule
that carries across.

## The budget survives a crash

Slot recovery is **stateless**: `_asked_slots` (`:1023-1033`) reconstructs
what has already been asked by matching a 40-character prefix of each
localized question against the agent's turns, and `deterministic_turn`
(`:1319-1331`) recovers which slot the incoming message answers by scanning
backwards for the last scripted question. Nothing about the budget lives in
memory, so a failed or model-degraded turn re-enters the session at the right
slot rather than restarting or double-asking. Checked across all nineteen
slots in all four locales at the pin: no two prefixes collide and none occurs
inside another scripted string.

## The close is two turns, because it once was one

`deterministic_turn`'s docstring (`:1276-1285`) names the incident: when the
script is exhausted, read back and wait — the close only happens on the
requestor's next message (confirm → close; anything else → captured as their
stated correction, then close); "the old same-turn read-back+close locked
the composer on the invited correction (UAT L1-CONV-2, 3/3 Characters)." The
implementation matches: the exhausted script returns the read-back with
`done: False` (`:1361-1367`), and only the following message closes — a
confirmation ends it, anything else is stored as a correction facet with
`provenance="stated"` and its source turn before the close (`:1296-1317`).

## Deviations, recorded not lowered

- **The model-led paths still accept a one-shot read-back-plus-close.** The
  text path's `coerce` (`:1652`) closes on the model's end token; the voice
  fast path (`:1839`) closes on the token alone. The two-turn close is
  instructed in `_PERSONA_CLOSE` (`:128-134`) and enforced only on the
  deterministic floor. The voice consequence is recorded in the react
  application of expansion-reflection.
- **On the deterministic floor a correction is recorded but not applied.**
  Executed: "make it lead, and Postgres is only nice to have" leaves
  seniority `senior` and Postgres a must, with one correction facet stored.
  The model path now merges a corrected scalar back into the spine
  (`:1375-1403`), including a correction back to a schema default, which it
  used to drop.
- **A fresh brief is a software role before a word is spoken.** The schema
  default is `role_family = "software_engineering"`
  (`pipeline/jobfit/rolebrief.py:113`), reclassified deterministically only
  at the read-back (`:1347-1360`). Since 2026-09-08 the merge stamps
  `inferred` only on a non-default family (`:1440-1441`), so an unclassified
  family at least still reads as defaulted.
- **The keyless path offers cards on the first seniority question.** Since
  2026-09-08 the seniority slot attaches four level cards to its first ask
  (`:1337`, `_scripted_choices` `:1237`). The engine's own rule (`:118`) is
  "never offer cards as the first thing said about a topic", and the golden
  path's is no menu until an open question has stalled. Executed on the
  power-unit persona: the cards arrive with the first seniority question.
- **An unreached slot is still recorded as nothing.** A skip writes no value
  (`:166-168`), and the read-back does not name what was skipped or never
  reached, so "asked, no constraint" and "never asked" are indistinguishable
  in the brief — the rule this technique ends on.
- **A model triage override is accepted without a recorded reason.** Any
  model-returned shape in `SHAPES` replaces the heuristic (`:1646-1651`); the
  research doc's own rule is "never silently". Because `app_master` is now in
  `SHAPES`, a model can also return it for a session with no dossier.

The standard's rules stand in every case; the engine meets them on the
deterministic floor more often than on the model paths.
