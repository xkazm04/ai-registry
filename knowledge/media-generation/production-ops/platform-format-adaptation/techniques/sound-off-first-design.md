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

A silent viewer must receive the whole argument. How many silent viewers there
are is set by the **surface**, not by "the feed". The widely repeated muted
majority, the 69–85% figures, traces to 2016 Facebook feed video. That feed
autoplayed muted, and the figures were three publishers' reports of their own
views. It is not a measurement of the vertical-short platforms. TikTok and Reels
autoplay with sound on. The one figure a platform has published is an attitude
survey pointing the other way: 88% of TikTok users say sound is essential. No
platform publishes a measured muted share for TikTok, Reels or Shorts.

So the technique has two strengths:

- **Where the surface autoplays muted** — a Facebook or LinkedIn feed, a YouTube
  home feed, an embedded player — the silent viewer is the default. Invert the
  audio-first habit: design so the argument arrives silently, and treat narration
  as the upgrade for the viewer who unmutes.
- **Where the surface plays sound** — TikTok, Reels, the Shorts player — audio is
  the delivery layer, and the silent viewer is a minority of unknown size. The
  text layer is still designed rather than transcribed, as insurance: the hook
  still rides as text, and nothing load-bearing may be *only* said. What changes
  is the priority. The audio is no longer an afterthought for "the minority who
  opt in".

A derived clip usually ships to both kinds of surface at once, which is why the
silent pass stays in the procedure for every short.

Working audio-first and captioning afterward fails structurally, not
cosmetically: the hook arrives as speech the muted viewer never hears, the caption
track is a transcript rather than a designed surface, and the beats whose
evidence is verbal simply do not exist for that viewer. A clip that tests well in
an edit bay with speakers on and dies on a muted-autoplay feed is the signature of
this failure.

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
4. **Then build the sound**: narration, music and sound design. On a
   muted-autoplay surface this is the upgrade for the viewer who unmutes. On a
   sound-on surface it is what most viewers actually receive, so it gets the
   same care as the text layer. It is never *required* for the argument.

## Decision rules

- **When the clip is image-led**, this technique is nearly free — labels
  already carry the argument. When it is narration-led, the words must reach
  the screen: the caption layer is load-bearing and budgeted as design work,
  not export work.
- **When measuring locally**, treat the sound-off share as a parameter of the
  *surface* and the audience, not a universal constant. The published figures mix
  platforms, autoplay policies and ad contexts, and the famous one measures a feed
  these clips mostly do not run in. Until measured, carry it per surface as an
  assumed range, marked as assumed — never one number for "short-form".
- **When a template or a brief cites a muted-majority figure**, check which
  surface it measured before letting it set priorities. A 2016 Facebook-feed
  figure can decide a Facebook-feed clip, not a TikTok one.
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
