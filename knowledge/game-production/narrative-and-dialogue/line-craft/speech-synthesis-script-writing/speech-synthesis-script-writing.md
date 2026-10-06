---
layer: golden-path
type: golden-path
subject: speech-synthesis-script-writing
status: forged
use_when: [writing dialogue or barks that a synthetic voice will perform, a generated line came back flat, rushed, garbled or silent, deciding whether to fix a bad render by editing the line or by changing voice settings, adopting a newer speech-model generation under an existing script]
techniques:
  - length-and-breath-budget
  - punctuation-as-direction
  - hesitation-marks-can-silence-a-line
  - tags-depend-on-the-model-generation
  - text-carries-the-emotion-not-the-settings
  - change-the-text-before-the-settings
---

# Speech synthesis script writing

A line written for a synthetic voice has two readers. The first is the player, who hears it
once or forty times from a sofa, over engine noise, through television speakers. The second is
the speech model, which reads it before the player does and decides, from nothing but the
characters on the line, where the breath falls, which word carries the stress, whether the
sentence rises or falls, how fast it goes and how much feeling it has. A human actor brings a
reading to a script and argues with a bad line. A speech model brings no reading of its own; it
performs the text it is given, defects included, and a line that a director would have fixed in
the booth with one note arrives as a confident, fluent, wrong take.

This subject owns the writing of the line for that second reader: the words, the length, the
punctuation and the sentence shape that a speech engine performs well, and the order in which a
writer reaches for the levers when a render comes back wrong. It is a craft of the script, not of
the engine. Its central claim is that **the text is the most reliable control a writer has over
a synthetic performance** — more portable than markup, more local than voice settings, and the
only control that survives a change of engine — and that most bad renders are fixed by rewriting
the line, not by turning a dial.

## The line is a performance instruction, and every character counts

On the page, punctuation and line length are matters of style. For a speech model they are the
performance. A full stop is a falling pitch and a pause; a comma is a shorter one; a question
mark is usually a rise; a dash is a break; an ellipsis is an instruction whose meaning differs
between models and, on some, is an invitation to stop talking. Length is not neutral either. A
long sentence gives the model room to drift — stress lands on the wrong word, the pitch flattens
into a recitation, the speed creeps — and a line of one or two words gives it too little context
to choose a delivery at all, so it guesses, and the guess varies from take to take. Between the
two sits a working range, roughly a breath: one short sentence, or two very short ones, carrying
one idea ([length-and-breath-budget](./techniques/length-and-breath-budget.md)). Spoken length
is not words divided by a rate: every sentence boundary is a pause, and its length is set by the
voice, so the budget is learned per voice from its first renders.

The writer's first move is therefore to treat punctuation as direction rather than as grammar.
The sentence boundary is the strongest control there is: a thought split into two sentences is
two intonation units with a reset between them, and a word isolated in a short sentence is
stressed by its isolation. Commas place the small pauses; a dash makes an interruption; a
question mark asks for a rise and should be checked, because a question that the speaker does
not really ask may render with a rise that turns menace into uncertainty
([punctuation-as-direction](./techniques/punctuation-as-direction.md)).

## Silence is a failure mode, not a pause

The naive reading of hesitation marks is that they make speech sound human: an ellipsis for a
trailing thought, a filler for doubt, a long pause tag for drama. On a speech model each of them
is a request for non-speech, and a model asked for non-speech can over-deliver. A line stacked
with ellipses, fillers and pause markers can render with long dead gaps, a stall before the
first word, a trailing silence that pads the clip to several times its spoken length, a sudden
change of speed after the pause, or audible artefacts where the model lost its place. The worst
case is a clip that is more silence than speech and still has a duration in range, so it looks
delivered. Hesitation is not only the marks. A character written as hesitant — fragments, a
repeated word, a question the speaker answers — is a line full of sentence boundaries, and each
boundary is a pause whose length the voice decides; on a voice cast or tuned to sound hesitant,
a short line of five fragments can render as more silence than speech. The rule is to spend at
most one hesitation per line, counting fragments and repeats as well as marks, to place it
inside the line rather than at its edges, and to measure the render's silence against its
length with the basis stated, because a clip that is mostly silence passes every check that
only asks whether a file exists
([hesitation-marks-can-silence-a-line](./techniques/hesitation-marks-can-silence-a-line.md)).

## Markup is a dialect of one model generation

Many engines accept direction inside the text: a bracketed delivery word, a bracketed sound, a
pause of a stated length, a phonetic spelling. Which of these a model honours is decided by its
generation, not by the script. A tag that one generation performs, the next may ignore, read
aloud as words, or treat as an instruction it was never trained to follow well; a markup form
that the older generation honoured literally may be unsupported on the newer one; a style field
that one generation reads may be absent on another. A tag the engine does not consume looks, on
the page, exactly like one it does
([tags-depend-on-the-model-generation](./techniques/tags-depend-on-the-model-generation.md)).
The writer's rule follows: lean on a tag only after hearing that this generation honours it on
this voice, prefer the version of the direction that is written in words and punctuation, and
treat every change of model generation as a fresh audition of every tagged line. A tag also has
to suit the voice: asked to shout, a soft voice may read the tag aloud instead, so range is
something a character is cast for, not tagged into. When a generator drafts the lines, its
brief names the engine generation and the rules of this subject, so that drafts arrive
speakable instead of being repaired after rendering.

## Let the words carry the feeling

Voice engines expose settings — how stable or variable the delivery is, how strongly the voice
exaggerates its style, how fast it speaks. They are tempting because they are one control for
the whole performance, and that is the problem: a setting applies to every word of every line
the voice speaks, while emotion belongs to one line and one moment. Pushing variability up to
get an angry line also buys unpredictable takes, odd stresses and, at the extreme, instability
on the calm lines the same voice must speak next; pushing style exaggeration up amplifies the
voice's source manner everywhere, not the feeling of the scene. The settings stay at a neutral,
stable baseline per voice, and the emotion is written into the line: the word chosen, the
length of the sentences, the clipped command against the long trailing clause, the name used
or withheld. A model trained on human speech performs anger when the line is shaped like anger,
and the shape stays with that one line instead of spreading to every other line the voice speaks
([text-carries-the-emotion-not-the-settings](./techniques/text-carries-the-emotion-not-the-settings.md)).
The failure to watch for is the trait pursued twice: a nervous character given a looser voice
setting to sound nervous and also written in fragments to sound nervous. The two do not add up
to more nervousness; they compound into silence, because the loose voice holds each of the
fragments' many pauses long. One owner per feeling, and the text is the owner that survives the
next engine.

## When a render is wrong, edit the line first

A render that comes back wrong has three possible causes: the sample, the text, or the
settings. The order of investigation is cheapest-and-most-local first. Take a second render of
the same text; a fault that does not repeat was the sample, and the better take is kept. A
fault that repeats belongs to the text, and the fix is an edit: shorten the line, move the
stressed word to the end of a short sentence, replace the ellipsis with a full stop, remove the
tag, spell the number. Only when several honest rewrites fail is a setting touched, and then the
change is made per voice, deliberately, and every line already approved in that voice is put
back on the list to be heard again, because a setting change re-performs all of them
([change-the-text-before-the-settings](./techniques/change-the-text-before-the-settings.md)).
The naive order — turn the dial until this line sounds right — fixes one line and silently
changes forty others. And while a failed line waits for its rewrite it stays visible as a
failure, with its caption and a silent fallback, rather than being trimmed or waived until its
number passes.

## Testing a line means listening to it

No text check can say how a line will sound. A line can pass a length budget, a banned-phrase
list and a spelling check and still render rushed, flat, mis-stressed or silent. The test of a
line written for a synthetic voice is to render it and listen, at the playback condition the
player will have: the television's speakers at sofa distance, with the game's sound under it,
and, for a line that repeats, more than once. A cheap mechanical screen catches the gross
failures before a person spends attention — a clip whose duration is far from what its word
count predicts, a clip with long internal or edge silences — but the screen routes a line to a
listener; it does not pass one. A line nobody has listened to is unheard, not approved.

## What the naive reading gets wrong

The **page-perfect line** reads beautifully and renders as a breathless recitation, because
its three clauses were one sentence. The **dramatic pause** is three ellipses and a pause tag,
and renders as a clip that is two seconds of speech and six of nothing. The **portable tag** is
a bracketed delivery that the previous generation performed and the current one reads aloud.
The **dial fix** turns variability up to make one line angry and makes the voice unreliable on
every calm line after it. The **label** writes the emotion as a stage direction instead of as a
sentence shape, and gets either a spoken stage direction or nothing. The **desk approval**
judges the line as text, or listens on headphones at a desk, and passes lines the sofa will
never hear clearly. And the **settings-first retry** spends an afternoon on sliders that a
one-word edit would have saved.

## What this subject knows, and how

The engine behaviours stated here — which marks and tags a generation honours, that too many
pause markers destabilise a render, that very short inputs vary, that style exaggeration is best
left at zero — come from one speech vendor's documentation as read by a game-dialogue research
dossier, and from one project's observed failure: a line for a nervous character that rendered
with more silence than speech. Neither is a controlled study. The craft built on them — words
before tags, text before settings, one hesitation per line — is practitioner judgement, and it
is held as a standard to be checked by listening, not as a measured result. None of it has yet
been tested in a played game.

## Boundaries

**Against generated-speech-acceptance (in the media-generation bundle).** That subject judges a
finished clip: whether it says its text, whether it is the requested voice, whether the signal
is clean, and how a listening board records a verdict. This subject writes the line so that the
clip has a chance to pass. The rule for picking: if the question is "does this clip pass", it is
the neighbour's; if it is "what words and punctuation do I hand the engine so that it will", it
is this one. The listening that this subject asks of a writer is an audition of the line while
it is still being written, not an acceptance verdict, and does not replace one.

**Against multi-speaker-speech-production (in the media-generation bundle).** That subject owns
the line as a unit of production: its address, the chunk seams of a long script, the voice
asset bound to an engine generation, the lexicon of names, and the compilation of a neutral
direction vocabulary into each engine's markup dialect. This subject owns the words inside the
line and the writer's choice of whether a piece of direction lives in those words or in a tag
at all. When the line's words do not change and the question is how it is rendered, re-rendered
or kept current across engines, it is the neighbour's; when the fix is to rewrite the line, it
is this one. The neighbour's degradation order for an unsupported tag ends in punctuation and
sentence shape; that end state is what this subject teaches a writer to write first.

**Against the siblings in this bundle.** What a bark or a card says, and the one-breath budget
set by the listener's attention, belong to short-form-cards-and-barks; this subject adds the
budget set by the engine's behaviour and the shapes that make a synthetic voice perform the
line. How a cast sounds distinct belongs to subtext-and-voice-differentiation; this subject
makes that distinction survive a voice that cannot act. Which lines are baked and which spoken
at runtime, the line catalogue and the re-cast gate on a model upgrade belong to
game-dialogue-voice-pipeline.
