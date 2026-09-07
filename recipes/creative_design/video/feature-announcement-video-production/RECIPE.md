---
name: feature-announcement-video-production
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/video
---

# Feature announcement video production

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Shipped features go unannounced because a short video costs a script, a voice
and a render, and getting any one of them wrong late means redoing all three. The
version that does get made is usually too long for its slot and gets rescued by speeding
up the voice, and it arrives in a feed that plays it muted, where the whole claim was in
the voiceover.

**Input.** A description of the feature, who it benefits, where the finished video will
be watched and at what aspect ratio, and the accumulated record of which tone, style and
pacing the adopter has approved before.

**Core action.** Settle the script and visual strategy together, inside the word budget
the target length allows and against the destination's shape, get them approved before
anything is synthesized or rendered, then keep rework scoped to the stage that was
actually wrong.

**Output.** A short finished announcement video that works with the sound off, carrying
captions checked against the script, whose script and final render each passed a real
human decision.

## Activities

1. Read the feature description, the destination it is for, and past approved taste
*(observe)*
2. Settle the script and the visual strategy together, inside the word budget the target
length allows *(decide)*
3. Get the script and the strategy approved before anything is spent *(deliver)*
4. Produce the voiceover to the approved script *(act)*
5. Compose the render with captions and on screen text that carry the claim without
sound *(act)*
6. Present the render for the second decision, shown as it will appear in its
destination *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A shipped feature gets an announcement, and every expensive step is preceded by a
decision rather than followed by one.**

- The script is approved before any synthesis or render spends anything.
- A rejection routes back to the stage it affects and the other stages' output is kept,
  so a wrong voiceover costs a voiceover.
- Which stage was rejected and why is recorded, so a tone rejection that has now
  happened three times is visible as one problem with the taste record rather than three
  unlucky drafts.
- A render that was requested and has not come back is visible as still running with an
  expected end, rather than as either a failure or a success.

**The video does its job for a viewer who never turns the sound on, and for one who
cannot.**

- Whatever the voiceover claims is also carried on screen, because a feed plays muted by
  default and the claim is the thing that has to survive that.
- Captions are present for the spoken audio and are checked against the approved script
  rather than trusted, and they identify the speaker where more than one voice is used.
- Nothing that matters is placed where the destination's own interface will cover it.

**The video is the length it was meant to be, and it got there by cutting rather than by
hurrying.**

- The target length is converted into a word budget and the script is cut to it before
  it goes for approval.
- A script that does not fit is shortened by dropping a point, never by raising the
  speaking rate, because a faster voiceover is the same script failing quietly.
- The aspect ratio and the destination are settled before the script, since they decide
  how much can be said on screen at all.

## Guidance

A thirty second video is about seventy five words. Write to that before the approval,
because the alternative is discovering it at the render and rescuing it by speeding up
the voice. Assume the sound is off: most feed video plays muted, so whatever the
voiceover claims has to be on screen too, and the captions need checking rather than
trusting. Know the destination before the script, since the aspect ratio decides how
much can be said on screen at all.

## Where this is worth adopting

- A team shipping every two weeks whose only announcement is a changelog entry, read by
  the people who already knew because they wrote it.
- A founder who made one announcement video, lost a day to it, and has not made a second
  one since, so the feature after that shipped in silence.
- A product marketer whose videos come back rejected on tone every single time, where
  the feedback is real and nothing in the pipeline is accumulating it.
- A team publishing into a vertical feed whose videos are composed at sixteen by nine,
  arriving letterboxed with the one line that mattered sitting behind the platform's own
  buttons.
- A product whose announcement videos get plenty of views and almost no watch time,
  because the argument was in a voiceover nobody heard and nothing on screen said it.

## Connector types

`voice_generation`, `video_generation`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[elevenlabs](examples/elevenlabs.md) for `voice_generation`,
[higgsfield](examples/higgsfield.md) for `video_generation`.

## Recommended trigger

`self_paced`. The work becomes worth doing when a feature has shipped without an
announcement. There is no release event this recipe can reliably listen to, and a
calendar would produce videos for weeks with nothing to announce. Deciding that a
shipped thing does not warrant a video is a legitimate outcome of a run.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter's product sounds like when it announces something, since tone is the
  dimension rejections cluster on and it cannot be read out of a feature description.
- Who the announcement is for, because the same feature is pitched differently to people
  already using the product and to people who have never seen it.
- Where the finished video is going, since a destination's length limit, aspect ratio
  and safe areas decide the script before the script is written.
- How narrow the video generation options actually are in the adopter's catalog, because
  this category is thin and an adoption that assumes a choice may find it has one
  connector and its constraints.
- Whether the announcement needs to show the real product, since generated motion
  cannot, and a feature that has to be seen working needs a capture rather than a
  render.

## Dependencies

- ffmpeg, where the composition step joins the voiceover, the visuals and the captions
  locally rather than at the connector
