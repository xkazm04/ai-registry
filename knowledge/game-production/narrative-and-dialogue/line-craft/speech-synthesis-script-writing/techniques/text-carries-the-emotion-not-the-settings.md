---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: text-carries-the-emotion-not-the-settings
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a synthetic line must sound angry, frightened, grieving, nervous or warm, choosing voice stability or style settings for a cast, a voice is erratic or slow across lines]
---

# Text carries the emotion, not the settings

The named concern: speech engines offer settings that seem made for emotion — a control for how
stable or variable the delivery is, a control for how strongly the voice exaggerates its style,
a speed control. They are global: a setting applies to every word of every line spoken with it,
while an emotion belongs to one line in one moment. Using a setting to make one line angry buys
that anger for every line, and buys more than anger. Lower stability produces livelier takes and
also unpredictable ones — misplaced stress, sudden changes of energy, longer and less even
pauses and, at the extreme, unstable output. Higher style exaggeration amplifies the manner of
the voice's source recordings, not the feeling of the scene, and engine guidance recommends
leaving it at zero. Extreme speed values degrade quality. The rule is to keep settings at a
neutral, stable baseline set once per voice, and to put the emotion in the words.

## One owner per quantity

The voice's baseline belongs to the voice: one stable set of settings per cast member, chosen at
casting and held across the script. The emotion of a line belongs to the line. When both the
settings and the text try to own a line's feeling, they compound rather than cooperate, and the
result is unpredictable; when settings change per line, the voice becomes a different instrument
in every line and the cast stops sounding like the same people
([one authority per quantity](../../../../_laws.md#one-authority-per-quantity)).

The commonest form of the double owner is a character trait pursued twice. A nervous character
is given a looser, less stable voice setting to sound nervous, and is also written in fragments
and hedges to sound nervous. Each alone might work; together, the loose voice holds every one
of the fragments' many boundaries long, and the line fills with silence. Choose one owner: a
stable baseline and a nervous line, or a deliberately looser baseline and plain sentences.
Picking the text keeps the trait portable to the next engine.

Settings are also generation-specific: one generation exposes a continuous stability control and
a speed range, the next replaces stability with a few presets and drops speed. A script whose
feeling depended on a setting loses it at the upgrade; a script whose feeling is in the words
keeps it.

## How words carry emotion

A model trained on human speech performs an emotion when the line is shaped like that emotion,
because that is how emotional speech is shaped in its training. The writer's levers are the
sentence and the word.

**Anger** is short sentences, imperatives, no softeners, hard stops: "Out. Before I change my
mind." **Fear** is a question asked of nobody, a smaller vocabulary, the one practical detail:
"Where is he? He was right behind me." **Grief** is plain words and the detail instead of the
feeling: "He left the keys on the hook. Like he'd be back." **Warmth** is the name used, a
contraction, a small private detail: "You did good, kid. Told you the left was loose."
**Menace** is calm: complete sentences, no exclamation, a polite word in the wrong place:
"Take your time. I'll wait by the car." Each spends at most one hesitation, because the shapes
that signal emotion to a reader — the stammer, the trailing dots — are the ones a model renders
as dead air.

What does not work is a label. A line that announces its feeling ("I'm furious!") is performed
as a statement about anger, not as anger. A stage direction written into the text ("angrily:"),
or an adverb on a speech verb in context text, is either spoken aloud or ignored. And an
exclamation mark on every line does not make a voice angry; it makes it loud.

## Procedure

1. **Cast each voice at a neutral, stable baseline,** with style exaggeration off, and record
   the settings as part of the cast; a baseline that departs from the engine's advice carries a
   written reason.
2. **Cast for range:** a character who must whisper or shout gets a voice whose source has that
   range, rather than settings or tags that push a voice past it.
3. **Write the line's emotion as a shape:** sentence length, mood of the verb, softeners kept or
   cut, what is named and what is withheld.
4. **Render with the baseline** and listen for the emotion.
5. **If it is not there, rewrite the shape,** not the settings.
6. **Keep a small set of reference lines per voice** at its baseline, so a later change can be
   heard against them.

## Decision rules

- When a line needs more feeling, change its words and shape, because the settings would change
  every line.
- When a voice is erratic or slow across many lines — stress jumping, pauses long and uneven —
  suspect the baseline before the text, and bring it back towards the stable, unexaggerated
  setting as a voice-level decision.
- When a scene needs a sustained register unlike the voice's baseline (a whispered scene, a
  shouted race radio), treat it as a second deliberate baseline for that context, chosen once
  and recorded, not as a per-line adjustment.
- When settings were chosen to deliver a feeling, record that the delivery is unmeasured until
  someone listens; a setting chosen for an effect is a hope about the effect
  ([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- When an emotion cannot be written into the line, the line is usually wrong for the moment; the
  fix is upstream, in the dialogue, not in the engine.

## When not to use it

Engines that take a natural-language performance instruction per line, and perform it reliably
on the production's voice, shift some of this weight to the instruction; even then, the line
should still carry the emotion on its own, because the instruction is generation-specific and
the text is not.

## Evidence status

The setting advice — style exaggeration recommended at zero, extreme speed values degrading
quality, speed absent and stability reduced to presets on the newer generation — comes from one
speech vendor's documentation as read by a game-dialogue research dossier (high confidence for
the documentation rows, medium for the preset names, which came from secondary guides); this
document did not re-read the pages. The double-owner lesson is an upward lesson from one
project's voice setup, whose two voices run style above zero and whose nervous voice combines a
looser stability setting with fragmented lines, and whose project notes say the settings do not
prove the delivery was achieved; its most fragmented line failed a silence ceiling. That is an
observation on one take per line, not a controlled study, the emotional examples are
practitioner craft, and none of this has been tested in a played game yet.
