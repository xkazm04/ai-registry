# The local desktop browser as the `browser_automation` capture surface

What was learned mapping this recipe onto a browser driven on the same machine as the app.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**This connector type also resolves to remote browsers, and they cannot see a local app.**
Hosted scraping and rendering services bind to the same type and are perfectly good
connectors for other work, but an instance running on this machine is not reachable from
them. The failure is not an obvious one: the run succeeds against a public page and produces
a walkthrough of something that is not the adopter's build. Prefer the local surface here
and verify at adoption that what got bound can reach the running instance.

**A recording captures the machine, not only the app.** Notifications, other windows, a
bookmarks bar, an autofilled account name in the corner: all of it lands in the artifact. A
clean profile, notifications silenced and a window sized to the planned viewport is a
precondition of the capture rather than a nicety, and it is far cheaper than reviewing
frames afterwards.

**Waits have to be on the app's own signals, never on a clock.** A fixed pause is either too
short, which captures a spinner, or too long, which produces a slow and unwatchable result.
Wait for the state the step is about to be visible, then hold deliberately for the viewer.
Those are two different pauses with two different reasons and it is worth keeping them
separate in the plan: one is correctness and one is pacing.

**Device pixel ratio is not the viewport.** A capture on a high density display produces an
artifact at twice the nominal size, which changes both the file weight and how the interface
text reads once it is scaled into an embed. Decide the delivery size first and derive the
capture settings from it.

## What transfers to any capture surface

- Where a connector type spans local and remote drivers, verify the bound one can reach
  what you intend to record. A success against the wrong target looks identical.
- The recording surface is the whole screen or window, so preparing it is part of the work.
- Separate the wait that makes the capture correct from the pause that makes it watchable.
