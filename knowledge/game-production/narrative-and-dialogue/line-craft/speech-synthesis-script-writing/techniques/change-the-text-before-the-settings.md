---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: change-the-text-before-the-settings
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a rendered line comes back wrong and must be fixed, deciding whether to re-roll, rewrite or retune, a settings change is proposed to fix one line]
---

# Change the text before the settings

The named concern: when a synthetic line comes back wrong — flat, rushed, mis-stressed, garbled,
silent, too much or too little feeling — the writer has three levers, and they differ in cost
and reach. A **re-roll** renders the same text again; it costs one render and touches only this
line. A **text edit** changes the words, punctuation or length; it costs a rewrite and touches
only this line. A **settings change** alters the voice's stability, style or speed; it costs
nothing to type and touches every line that voice speaks. The naive order is the reverse of the
right one: the slider is closest to hand, so it is tried first, and the line that sounds right
afterwards has been bought with forty other lines that now sound different and have not been
heard.

## The order

**First, a second take of the same text,** to separate the sample from the text. Speech models
sample; one take can be bad by chance, and engine guidance itself recommends generating a few
takes and choosing. A fault that disappears on a second take was the sample: keep the good take.
A fault that repeats across two or three takes is a property of the text or the voice, and
further re-rolls are a slot machine. Where each render is paid for, the takes are budgeted
up front per line class rather than spent until something sounds right.

**Second, the text.** A repeating fault is diagnosed against the text first, because the text is
where most faults live: the line is too long (split it once), too fragmented (merge it), its
stress is on the wrong word (move the word to the end of a short sentence), it has hesitation
marks (remove them), it has a tag (remove it and write the direction into the words), it has a
number, a name or an abbreviation (spell it as spoken), its question rises where it should fall
(make it a statement). Each edit is local, portable to the next engine, and leaves every other
line untouched. Try several honest rewrites before concluding that the text is not the cause.

**Third, and only then, the settings,** treated as a decision about the voice and not about the
line. A settings change is made per voice, recorded, and followed by re-hearing every line
already approved in that voice, because each of those approvals was given to a render the
change has replaced
([a verdict is bound to its content](../../../../_laws.md#a-verdict-is-bound-to-its-content)). A
line approved under the old settings and never heard under the new ones is unheard, not approved
([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)). The exception is a
fault that appears across most of a voice's lines whatever their text: that is the baseline
speaking, and it goes straight to a voice-level review.

## A failed line stays visible while it waits

A line that fails its screen and has not yet been rewritten is kept as a visible failed
candidate, with its caption and a silent fallback so the game still works, and its measured
failure attached. It is not retimed, trimmed or waived to make the number pass, because a line
edited in the audio to meet a ceiling has had its fault hidden rather than fixed, and the next
reader takes it for a pass.

## Keep a record of the fix

Each fix records which lever was used and what changed: the take kept, the edit made and why,
the settings changed and which lines were re-heard. The record turns individual fixes into the
writer's working knowledge of the voice and the model — that this voice holds every full stop
for most of a second, that this generation renders a trailing ellipsis as silence, that this
question shape always rises — and that knowledge goes into the next brief, which is cheaper than
fixing after rendering.

## Procedure

1. **Name the fault** in one phrase: rushed, flat, wrong stress, silent gap, spoken tag, wrong
   emotion, mispronounced word.
2. **Re-roll up to twice.** If a take is good, keep it and stop.
3. **Diagnose against the text** using the fault: length, fragmentation, punctuation,
   hesitation, tag, number or name, shape of the emotion.
4. **Edit and re-render,** one change at a time so the change that fixed it is known.
5. **Escalate to settings only after several honest rewrites fail,** or when the fault spans
   the voice's lines, and then for the voice as a whole, with every approved line in that voice
   re-heard.
6. **Record the fault, the lever and the result.**

## Decision rules

- When a fault does not repeat on a second take, it was the sample; keep the good take and do
  not edit the text.
- When a fault repeats on one line, edit the text before touching anything that affects other
  lines.
- When a mispronunciation repeats, fix it in the line by spelling, or in the production's
  pronunciation lexicon if the word recurs, never by a voice setting.
- When a settings change is the only fix, it is a voice-level decision with a re-hearing cost
  that is stated before it is made.
- When the wording of a line is locked (a captioned line, a line already translated, a line in
  approved story text), any edit goes back through the owner of that wording, and the caption
  follows the new audio word for word.

## When not to use it

At casting, before any line is approved, settings are being chosen, not changed, and exploring
them freely is the job. A voice that is unstable on every line, whatever the text, has a casting
or settings problem, and rewriting lines one by one is the wrong lever.

## Evidence status

Generating a few takes and choosing is one speech vendor's documented advice as read by a
game-dialogue research dossier, which also states the rule to cut hesitation marks first after
a silence failure; neither the vendor pages nor a rewrite of the failing line was tested for
this document. The visible-failure rule is confirmed by one project's handling of its silent
line: kept as a visible failed candidate with caption and silent fallback, no threshold waiver,
hidden retime or paid retry. The ordering of the three levers is practitioner judgement from
their cost and reach, not a measured comparison; nothing here is a controlled study, and none of
it has been tested in a played game yet.
