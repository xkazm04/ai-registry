---
layer: technique
type: technique
subject: platform-format-adaptation
technique: sound-off-first-design
status: forged
laws: [checkability-routes-the-pixel, unmeasured-is-not-pass]
shared_with: []
use_when: [designing captions or on-screen text for a vertical short, reviewing a clip whose argument lives in the narration, planning the text layer of a format template, diagnosing a short that holds viewers with sound on and loses them in the feed]
---

# Sound-off-first design

The feed's default viewing condition is silence. Published measurements of
sound-off viewing disagree on the exact share — the credible range is wide,
roughly two-thirds to the mid-eighties percent — but they agree on the shape:
**a large majority of short-form views begin muted**, and sound is turned on
only after the clip has already earned attention. The technique is to invert
the audio-first habit: design the clip so that a silent viewer receives the
whole argument, and treat narration as an enhancement layer for the minority
who opt in.

Working audio-first and captioning afterward fails structurally, not
cosmetically: the hook arrives as speech the viewer never hears, the caption
track is a transcript rather than a designed surface, and the beats whose
evidence is verbal simply do not exist for most of the audience. A clip that
tests well in an edit bay with speakers on and dies in the feed is the
signature of this failure.

## The text layer is designed, not transcribed

- **The hook rides as text at second zero.** Whatever the narration does, the
  opening sentence must be *readable* in the first frames — inside the safe
  band, clear of the occluded top strip, bottom block, and right-edge control
  column. A hook that exists only in audio is a hook most viewers never got.
- **Captions are typography with a layout contract**: a fixed position in the
  safe band, a line length short enough to read at feed pace, styled per the
  format template — not burned-in defaults from a transcription tool, and
  never placed where platform chrome sits over them.
- **Captions are checkable text, so they are drawn.** A viewer reads them
  word-for-word; a generated glyph or a model-rendered caption is an unusable
  one. Deterministic rendering, composited over the frame.
- **On-screen labels beat spoken connectives.** Where a beat's function is
  evidence or comparison, the label on the image carries it silently; the
  narration may say more, but nothing load-bearing may be *only* said.

## Procedure

1. **Run the silent pass first.** Watch the cut muted, cold. Write down every
   beat whose argument did not arrive. Each is either re-staged visually,
   given a text carrier, or cut — "the narration explains it" is not a fix.
2. **Verify the hook as a frame, not a sound**: freeze the first half-second;
   the opening claim must be legible in the safe band.
3. **Audit caption placement against the occlusion map** of the format
   template — top strip, bottom block, right-edge column — at the canvas the
   platform actually renders, not the editor's full frame.
4. **Then add sound as an upgrade**: narration, music, and sound design for
   the viewer who unmutes — rewarding, never required.

## Decision rules

- **When the clip is image-led**, this technique is nearly free — labels
  already carry the argument. When it is narration-led, the words must reach
  the screen: the caption layer is load-bearing and budgeted as design work,
  not export work.
- **When measuring locally**, treat the sound-off share as a parameter of your
  audience and format, not a universal constant — published figures spread by
  double digits and mix platforms, autoplay policies, and ad contexts. Until
  measured, carry it as an assumed range, marked as assumed.
- **When a music-driven or performance format is the container** — where the
  audio *is* the content and the platform culture is sound-on — the inversion
  does not apply; declare the exception in the template rather than silently
  exempting clips one by one.

## When not to use

Long-form, deliberate-choice viewing (a viewer who clicked a title and put in
earbuds) does not need the inversion; captioning there is accessibility and
comprehension support, not the primary delivery layer. And do not let the
silent pass become a mandate to caption every syllable — a wall of text
competing with the evidence fails the same viewer from the other side. The
test is the argument arriving silently, not the transcript being complete.
