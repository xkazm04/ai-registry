---
layer: technique
type: technique
subject: speech-synthesis-script-writing
technique: hesitation-marks-can-silence-a-line
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a line uses ellipses, fillers, stammers or pause tags, a rendered clip has long dead gaps or trailing silence, a clip is much longer than its words, writing a hesitant, nervous or grieving character for a synthetic voice]
---

# Hesitation marks can silence a line

The named concern: every hesitation mark is a request to a speech model for something other than
speech — an ellipsis, a filler word, a stammer written out, a pause tag of a stated length, a run
of dashes. A human reading the line takes it as colour. A model can take it as an instruction to
produce silence, and can over-deliver. The failures are specific and recurring: a long dead gap
where the mark was; a stall before the first word; a trailing silence that pads a two-second
line into an eight-second clip; a change of speed or energy after the pause, as though the model
started a new line; breathing noise or artefacts where it lost its place; and, at the worst, a
clip that is more silence than speech. Marks compound: two ellipses and a pause tag in one line
are far more likely to fail than any one of them, and engine guidance itself warns that too
many pause markers in one input can make the render unstable.

## Hesitant syntax is hesitation too

The naive fix counts only the marks. But a character written as hesitant — fragments, a
repeated word, a question answered by the speaker, a sentence restarted — is a line full of
boundaries, and every boundary is a pause the voice decides the length of. A nervous character
whose voice is also cast or tuned to sound hesitant pays twice: the voice holds each boundary
long, and the text supplies many boundaries. A fourteen-word line of five short sentences with a
single ellipsis can render as more silence than speech on such a voice, with a gap of about a
second at nearly every boundary, while the same voice renders two-sentence lines cleanly. A
rewrite made under a marks-only rule keeps the boundaries. In one project's rewritten script,
hesitation marks fell to at most one per line for the hesitant character. Yet about one line
in five still carried three or more interior boundaries, and the lines that a priced count
flagged were mostly unmarked fragments of five to eight words. The rule that a writer or a
generator is handed has to name boundaries; a rule that names marks gets marks removed. The
hesitation budget therefore counts the line's sentence boundaries and repetitions as well as its
marks, and it is set per voice, because the price of a boundary belongs to the voice.

## Why it happens, in a writer's terms

A model that generates speech step by step decides at each step whether to continue speaking.
A hesitation mark tells it that not speaking is appropriate here, and the model has no sense of
how long a dramatic pause should last relative to the scene; it has only the mark. Pause tags of
a stated length are honoured literally by some generations and are not available at all on
others, and long or repeated breaks are where the approximations fail. Marks at the edge of a
line are the most dangerous, because the model has no following words to pull it back into
speech: a line that begins or ends with an ellipsis invites leading or trailing silence.

## Rules

Spend **at most one hesitation per line**, counting a repeated word or a stammer as one, and
place it inside the line, between words that continue, rather than at its start or end. Prefer
the strongest portable form of the pause: a full stop between two sentences gives a beat that
every engine renders; a dash gives a break; an ellipsis is the last choice. Do not write long
pause tags to create drama inside a line. When the scene needs a real silence, make it a gap
between two lines in the game's timing, where the silence is controlled by the game and not
sampled by the model.

Write hesitation into the word choice rather than into marks and fragments. A character who
hesitates can say less than the line needs, answer a slightly different question, choose a
smaller word, or put the hedge in a single phrase ("I thought he might."); each is a hesitation
the model performs as speech. Fillers ("um", "uh") are spoken by some voices as words and
rendered by others as odd noises; use one only after hearing it on that voice.

## Measure the render, because silence looks delivered

A silent or mostly-silent clip passes every check that only asks whether a file exists, decodes
and has a duration in range. The screen that catches it is a measurement of the clip against
its own text: the share of the clip below a stated silence level, the length of the longest
interior silence, the leading and trailing silence, and the spoken duration against what the
word count predicts at the voice's rate. Each figure carries its basis — the level counted as
silence, the shortest gap counted, whether edges were trimmed first — because a silence share
without its threshold is not comparable across voices or runs
([a number carries its unit and basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
The screen must prove it measured something: a check that reports "no long silences" on an
empty or undecodable clip has examined nothing
([an instrument proves it had input](../../../../_laws.md#an-instrument-proves-it-had-input)).
A clip over the ceiling stays visible as a failed candidate, with its caption and a silent
fallback, rather than being quietly retimed or waived; and a line whose clip nobody has measured
or heard is unheard, not accepted
([unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass)).

The screen routes a clip to a listener, and a listener may keep a clip the screen failed: the
pauses can be the performance. The keep is then recorded *beside* the failure, not in place of
it. The clip ships marked as kept and as failing, and a check refuses any record that loses
either half, so the next screen calibration can see which failures people overruled. Every
other status field written before the listening is updated with the keep. A stale "listening
pending" beside a keep reads as an unheard line, and it has sent a later reader to that
conclusion. A keep given at a review page is a desk verdict. It answers whether the take is
acceptable, not whether it carries at the playback condition.

## Procedure

1. **Count the hesitations** in every line before rendering — marks, repeats, stammers and
   the sentence boundaries a fragmented line adds; more than one deliberate hesitation is
   rewritten.
2. **Move any mark off the line's edges.**
3. **Replace marks and fragments with words** wherever the hesitation can be written.
4. **Render and screen** the clip for silence share, longest gap, edge silence and duration
   against prediction, with the basis stated.
5. **Listen to every flagged clip,** and to every line that kept a hesitation.

## Decision rules

- When a clip has excessive silence, rewrite first: remove the marks, merge the fragments into
  fewer sentences, and re-render; do not change a voice setting, because the text is the likely
  cause and the setting change touches every other line.
- When a pause is load-bearing for the scene, move it out of the line into the game's timing.
- When a trailing ellipsis carries the meaning of a line that trails off, end the line on a weak
  word with a full stop instead, and listen.
- When the same line renders cleanly on one voice and silently on another, record the voice's
  boundary price and write that voice's lines to it, and do not assume a mark is safe for the
  whole cast.
- When a listener keeps a clip the screen failed, record the keep and keep the failure, and
  guard the pair with a check. Do not retime the clip or raise the ceiling to make the record
  agree.
- When a script is gated before rendering, count boundaries beside marks and send the lines the
  boundary count flags to a listener first. Until a render has shown which count predicts
  failure on that voice, neither count passes a line on its own.

## When not to use it

A model or voice that has been heard to render a specific hesitation reliably, across takes, on
the playback condition, may keep it; the rule is about unheard hesitations, not about
hesitation as such.

## Evidence status

That too many pause markers can make a render unstable, and that a newer generation drops the
older generation's pause markup, are statements from one speech vendor's documentation as read
by a game-dialogue research dossier (high confidence there, primary for that vendor). Both were
re-read and confirmed at the source on 2026-10-10. The same pages also say that different
voices handle pauses differently, especially voices trained with filler sounds, which is the
vendor's own version of a boundary price that belongs to the voice. The silence failure is one project's observation: one line, one
take, on one engine generation and one voice, which measured 55.52 percent silence against a 45
percent ceiling with four interior gaps of about a second. The dossier attributes it to
hesitation marks; the measured gaps sit at nearly every sentence boundary of a five-sentence
line with only one ellipsis, which is why this technique counts fragments as well as marks. The
cause has not been traced by a rewrite and re-render, it is not a controlled study, and none of
this has been tested in a played game yet.

A pass on 2026-10-10 found two more things. First, the project's owner listened to the failed
clip on a review page and kept it, with the failure retained in the record. Second, the
project's later script removed marks but kept fragments. Whether counting boundaries screens
better than counting marks is **not measured**. On the fourteen rendered lines both counts flag
the same single failure, so those lines cannot separate them. On the unrendered rewrite the
boundary count flags lines that the marks count passes. That is a forecast, and it is fragile:
across the hesitant voice's observed range of boundary prices it flags anywhere from none to
about one line in six. Most flagged lines are shorter than any line it was calibrated on, and
in a short line one pause is a large share of the clip. Rendering the flagged lines beside the
rest is the test that would settle it.
