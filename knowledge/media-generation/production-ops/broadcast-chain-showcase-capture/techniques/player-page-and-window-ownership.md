---
layer: technique
type: technique
subject: broadcast-chain-showcase-capture
technique: player-page-and-window-ownership
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [recording the streaming platform's player in a film, a dialog or another application's window appears in a capture, choosing which page of the platform to record, the broadcasting software opens a window when the stream starts]
---

# The player page and window ownership

Every window inside a recording region is owned by the capture for the length of the take:
found by identity, raised, sized, pinned, re-pinned, and checked uncovered. The platform is
recorded from its minimal player-only page, never from the channel page.

The demo-film grab already stages the system under test's own windows. A chain film adds
windows the team did not build and does not control: the platform's page, the broadcasting
software, and whatever else is running on the machine the stream is sent from. Those are
the windows that ruin chain takes, and they ruin them at the worst moment, because they
react to the same state changes the film is about.

## The player page

A streaming platform's channel page is designed around the video, not for it: chat,
recommendation rails, banners, a follow prompt, an autoplay preview of another channel.
Every one of those moves and competes with the evidence, and the chat column carries real
viewers' words that a showcase has no consent to publish. Platforms publish a page that
shows the player alone, for embedding; record that, muted, with autoplay requested in its
address, in a browser window of its own sized to the recording.

- **Wait for playback, not for the page.** The page loads long before the stream plays.
  Check that the player's video element is playing with data buffered, and refuse the take
  with a named cause after a bounded wait, because a player showing an offline slate
  records perfectly and proves nothing.
- **Hide what the minimal page still shows** with a declared stylesheet tweak, and list the
  tweak in the film's boundary: the platform's own page, with named elements hidden.
- **Settle sign-in and consent in a capture profile**, before any take, never on camera.

## The windows

1. **Give every recorded window an identity that cannot collide.** A browser window's
   title belongs to whatever page is loaded and changes when the page wants; set a unique
   title from the driver and re-assert it on an interval, so the window can be found by it
   all take long.
2. **Find each window by that identity, not by position or process order**, and fail if it
   matches nothing.
3. **Raise, size and pin it, and re-pin every beat.** Topmost is a flag other applications
   also set; a window pinned once at the start is not on top after the next application
   asserts itself. Re-assert at the start of each beat, and restore every window's place
   when the take ends, success or not.
4. **Expect the broadcasting software to open a window when it goes live.** Starting a
   stream opens dialogs and information panels in the software, and its main window then
   comes forward over whatever region it overlaps. Go live before the probe, dismiss what
   it opened, and keep its main window out of every recorded region, because its preview
   pane shows the same markers and overlays the platform recording expects to see and can
   pass for the player in an automated check.
5. **Expect everything else.** Notifications, chat clients, terminals and other
   applications that pin themselves on top will cross a region. Quiet what can be quieted,
   and check the region on the probe frame and again at each end marker.
6. **Keep recorded regions off one another.** Lay the windows out so no recorded region
   overlaps another window the take raises; overlapping regions mean the stacking order
   decides the picture, and the stacking order is not yours.

## Decision rules

- When a recorded window has a minimal page or mode, record that, because every element
  the capture does not need is an element that can move.
- When the broadcasting software must stay open, park it on a part of the desktop no
  region covers, because it is the window most likely to come forward during a take.
- When a window cannot be held above another application's top-layer surface, move the
  region rather than trusting the stacking order.
- When anything covered a region during the take, the take is a diagnostic, not a film,
  however clean its logs are.

## When not to use it

A recording the broadcasting software makes of its own program output has no desktop
windows over it, which is why that output is the cleanest of the three pictures; this
technique governs the recordings taken from the screen. A film that does not show the
platform at all needs only the demo film's stage discipline.
