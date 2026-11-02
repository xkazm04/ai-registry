---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: self-ending-test-fire
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [adding a test button for a reactive visual or alert, a test that passed while the on-stream overlay was not wired, a test effect that stayed lit or overwrote the live state]
---

# Self-ending test fire

Every reactive visual needs a test button. Streamers press it while setting up and again
mid-stream when they suspect the visual stopped responding. The test exists to answer one
question — **does a contribution reaching the tool reach the overlay the audience sees?** —
and it is only useful if it answers that, leaves the real state untouched, and then gets out
of the way on its own.

## Fire through the authority, not the screen

The test is handled by the same authority that routes live contributions to visuals, and it
is pushed down the same channel to the same overlay page the broadcasting software renders.
A test that animates the tool's own preview proves the preview. It passes on a stream where
the overlay is not connected, and the streamer finds out when the first real gift does
nothing — the case the test existed to catch. The failure is easy to build by accident: a
settings screen with a lovely local preview grows a "test" button that drives the preview,
and from then on everyone, including whoever films the product, believes the stream was
tested.

Keep a local preview for tuning, because it is fast and safe, but label it as a preview of
the response shape and give it a different name from the test fire.

## A separate session, not a fake contribution

The test does not inject a fake contribution into the live total. It runs as its **own
session** for that one visual: a synthetic burst, in the visual's unit, starting from an
empty total and cooling on the visual's own curve and half-life. While it runs, the overlay
shows the session's intensity in place of the live one; when it ends, the overlay returns to
the live value. Meanwhile the live total keeps accruing real contributions underneath, so
the next real reading is exactly what it would have been without the test.

That separation buys three properties a fake contribution cannot:

- **No live write.** Nothing reaches the live total, the retained contributions, the feed
  of real events or the dedupe keys. A test can never become a phantom gift.
- **Repeatable.** Every test starts empty, so the same button shows the same response, and
  successive tests at rising amounts show the curve climbing.
- **Clean hand-back.** The end of the test restores the live value instead of leaving a sum
  of real and fake to cool.

The cost is that the test shows a burst from rest, not on top of the current mood. Say so
next to the button.

## Mark it where it is seen

The overlay labels the test on the stream — a simulated badge inside the overlay — so a test
fired while live is not mistaken by viewers for a real contribution, and a clip carries the
label. The label is part of the state pushed to the page, and a change of provenance is a
change: when the test ends and the live value happens to equal the test's last value, the
page must still receive the switch, or it keeps saying "simulated" over a real reading.

## End itself

The session ends without anyone pressing anything, by whichever comes first:

- **At its floor** — the first observation within a small tolerance of the curve's resting
  intensity;
- **At a short hold** for a visual that never cools, since its test would otherwise never
  fall — tens of seconds;
- **At a hard ceiling** for every test — minutes, not hours.

Fix those numbers as behaviour and show them beside the button; they are a promise to the
streamer, not a setting. An ended session never reactivates, even if the host clock is
later rewound. A real contribution to the same visual, a saved change to the visual, or a
purge ends it early; real contributions to other visuals, and the live decay, leave it
running.

## Report what was proved

The tool can know that the test was accepted and pushed; it can know whether an overlay
page is connected; it cannot know, without looking at the program output, that the
broadcasting software composited the page. Report each as what it is. "Pushed; one overlay
connected" is not "visible on stream", and "no overlay connected" is a failure the streamer
must see before going live.

## Decision rules

- **When adding a test button**, route it through the live authority to the overlay, never
  only to a preview.
- **When the test fires**, run it as an isolated session for that visual, label it on the
  overlay, write nothing live, and let it end on its own within a stated time.
- **When the test ends**, push the live value and the provenance switch, even if the value
  is unchanged.
- **When the tool cannot see the program output**, the strongest claim is that the overlay
  received the state; never report that it aired.

## When not to use it

A visual drawn directly into the video by the tool, with no separate overlay page, has one
path and a simpler test. Even there, the test still ends itself and still writes nothing
live.
