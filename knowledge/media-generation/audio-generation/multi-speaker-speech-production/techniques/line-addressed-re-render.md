---
layer: technique
type: technique
subject: multi-speaker-speech-production
technique: line-addressed-re-render
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [a script revision should re-record only the changed lines, deciding whether a speech engine holds a speaker steady across re-renders, a reviewer approved most of a scene and wants one line changed]
---

# Line-addressed re-render

A multi-speaker script is a list of addressed lines, not a blob of text with
speaker labels. A revision changes some lines; the production re-renders those
and leaves every other clip byte-identical. That is the smallest edit that
answers a note
([edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate)): regenerating
a scene voids every approval given to its unchanged lines, because a sampling
engine returns a different performance each time, and the reviewer has to listen
to it all again. The technique is cheap to state and has one precondition that
is expensive to skip.

## The precondition comes first: does identity hold?

Line-level re-rendering is only safe if a line rendered today and a line
rendered last week, by the same voice on the same engine, sound like the same
person in the same scene. Engines claim this. A published claim of stable
identity is a vendor's own measurement with no stated sample; on the production's
own voices, texts and languages it is n=0. So the technique opens with a check,
run once per (engine generation, voice) before the workflow is adopted, and
again whenever either changes:

1. Pick one line of moderate length that is representative of the cast's hard
   material (a number, a name, an emotional turn), not a greeting.
2. Render it ten times with the production's settings, holding text, voice and
   any determinism control constant. A seed control, where offered, is a best
   effort and not a guarantee; do not count on it to make the ten identical.
3. Put the ten on a listening board, one clip at a time in a matched format,
   with a held-out clip of the same voice as an anchor
   ([listening-board](../../generated-speech-acceptance/techniques/listening-board.md)).
   Ask one question: does any take sound like a different person, a different
   room, a different age?
4. Count identity breaks. Record the count, the number of listeners and the
   engine and voice identifiers in the record.

The verdict is a decision rule, not a feeling:

- **Zero breaks in ten**: line-addressed re-render is adopted for that voice on
  that engine generation. Ten clean takes bound the true break rate only
  loosely (by the rule of three, an upper bound near three in ten at 95%
  confidence), so this is a screen, not a proof; the seam audit stays as the backstop.
- **One or more breaks**: identity does not hold well enough. Fall back to
  re-rendering the whole scene (the smallest span of consecutive lines a single
  scene-level render covers), and reconsider the voice, the settings or the
  engine. A one-in-ten identity break is one line in a forty-line scene per
  revision; that is not a rare event.
- **Not run**: the honest state is unmeasured, not pass
  ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)). A
  workflow adopted without the check is recorded as adopted on the vendor's word.

## The address and what stales a line

Give every line a stable identifier that survives edits to its text and to the
lines around it; an ordinal position is not an identifier, because inserting a
line shifts every following address and every stored render is silently
mis-attached. The identifier belongs to the script; the render is a derived
artifact keyed by everything that determined it:

| Component | Why it belongs in the key |
| --- | --- |
| the line's text | the obvious trigger |
| the voice asset and its generation | a re-cast changes the person |
| the engine generation and its settings | a new generation changes the sound |
| the compiled direction | a changed tag changes the read |
| the lexicon version | a pronunciation change changes the audio |
| the continuity context supplied | different neighbours change the join |

A render whose key no longer matches is **stale**, and the tooling lists stale
lines instead of re-rendering silently. The cache keyed on text and voice alone
is the most common defect here: it serves last year's engine as if it were
today's, and the audio looks fresh.

## Procedure

1. Split the script into addressed lines at speaker turns; one line is one
   speaker's utterance, bounded by the engine's per-call limit (see the
   chunking technique when a single utterance exceeds it).
2. Store render records by address, with the key components above and the
   listening status of the clip.
3. On a revision, diff by address; mark changed lines and lines whose key
   changed for another reason (lexicon, direction, voice) as stale.
4. Re-render stale lines only, passing neighbouring text as continuity context
   so the read fits the line before and after it.
5. Audit each re-rendered line against its unchanged neighbours, at the seam,
   before it replaces the accepted clip. Keep the previous clip until the
   replacement is accepted; a rejected re-render must not destroy the good one.
6. Price the loop by usable lines, not calls
   ([cost-per-usable-output](../../../_laws.md#cost-per-usable-output)): an
   engine that needs three takes per accepted line costs three renders, and
   the identity check's break count predicts that rate.

## When not to use it

- **Identity does not hold** (above): re-render the scene.
- **A note that changes the scene's energy**, such as a rewritten emotional arc
  across ten lines: the unit of the note is the scene, and forcing a per-line
  edit yields a scene of seams. Re-render the scene.
- **A cast change**: a new voice on one speaker re-renders that speaker's lines
  everywhere, and the neighbours' lines are edited against a new partner; treat
  as a scene event for review.
- **A script that will never be revised** (a one-off read): the address
  structure is overhead. Keep it only if the length forces chunking anyway.

The acceptance record for a re-rendered line is the acceptance subject's; this
technique only decides which lines to render and proves the engine lets you.
