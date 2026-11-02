---
layer: golden-path
type: golden-path
subject: contribution-reactive-visuals
status: forged
use_when: [building an on-stream visual that reacts to viewer contributions such as cheers, subscriptions or channel points, choosing how much giving lights a visual and how fast it cools, giving a streamer tuning controls and a test button for a reactive visual, checking that paid contributions cannot reach votes, draws or moderation]
techniques:
  - piecewise-intensity-curve
  - decay-before-interpolation
  - presets-with-consequence-lines
  - one-unit-per-source-with-dedupe
  - self-ending-test-fire
  - money-changes-looks-never-outcomes
---

# Contribution-reactive visuals

A human streamer's audience pays in several currencies at once. Some of them are money —
cheers bought with platform currency, subscriptions, gifted subscriptions, charity
donations — and some are not: channel points earned by watching, a hype-train level. A
contribution-reactive visual is **an on-stream element whose look is driven by that
flow**: a lantern that brightens, a frame that glows, an altar that blazes as the room
gives, then cools when it stops. It is the alert box taken one step further, from a
one-shot animation per event to a continuous state the whole room can watch build.

The subject holds one sentence above every design choice:

> **Contributions fill a total, the total cools on a clock, a curve the streamer chose
> turns it into intensity, and intensity moves only the picture.** Each of those four
> steps is designed, each is tested, and no contribution of any size reaches an outcome.

The naive build is a counter wired to an animation: add the amount, scale the effect,
show it. Every part of that fails live. The counter never cools, so the visual describes
the whole stream's history rather than the room's mood and sits at full blaze by the
second hour. The scale is linear, so one large gift pins the effect and every ordinary
contribution after it is invisible. Cheers and subscriptions are added into one number at
an exchange rate somebody guessed. A reconnect replays the last events and the visual
flares twice. The test button animates the settings screen while the overlay on stream
is not wired at all. And because the dial is a conveniently live number, the next feature
that wants a "hype" signal — a vote multiplier, a giveaway bonus, a softer moderation rule
for supporters — reads it, and money buys outcomes without anyone deciding that it should.

## One total, in one unit, counted once

Contributions arrive as differently shaped events: a cheer in the platform's smallest paid
unit, a subscription as a count, a gift bundle as a count, a channel-point redemption in
points, a charity donation in a currency's minor units. A visual accumulates **one native
unit** and refuses to mix them. Bits plus subscriptions is not a quantity, and an exchange
rate between them is an opinion dressed as arithmetic; two currencies' minor units summed
without partitioning are worse. Within one unit, sources may carry positive integer
weights — a gifted subscription can count more than a self-bought one — and the weights are
visible. A streamer who wants both cheers and subscriptions to light the stream gets two
visuals, or two layers, each honest about what it counts.

Each contribution moves the total once. Platforms deliver at least once, reconnects
replay, and the same contribution is often reported by two overlapping subscription topics
whose delivery identifiers differ. So the deduplication key is the **underlying
contribution's identity**, supplied by the adapter that knows how the topics overlap —
never the delivery's event identifier, never a viewer and an amount — and keys are kept for
the whole accounting session, because a replay can arrive late. That is
[one-unit-per-source-with-dedupe](./techniques/one-unit-per-source-with-dedupe.md).

## Cool the total, then read the curve

A reactive visual describes *now*, so the total cools: on a stated half-life, computed from
elapsed time on a monotonic clock the host supplies, never from wall time and never from a
tick count. The order of operations is the subject's most frequent bug and its cleanest
rule. On every contribution and every snapshot, the stored total is **decayed to the
present first**, the new amount is added, and only then is the total read through the
curve. Decaying the intensity instead of the total bypasses the curve's shape, so a burst
on a concave curve fades on a different shape from the one it rose on; adding before
decaying stacks a new gift on a peak the room left minutes ago. The tool owns the clock and
the page owns none: the overlay draws the intensity it is sent and never runs a decay of
its own, because a page that keeps cooling after its feed dropped is a frozen overlay that
happens to move. That is [decay-before-interpolation](./techniques/decay-before-interpolation.md).

## Intensity is a curve, the look is a binding

The curve maps the cooled total to an intensity between zero and one through a short list
of control points with straight segments between them: a point where the visual first
lights, a steep early stretch where ordinary giving is visible, a shallower stretch where
more is bigger by less, and a top point past which it is at full blaze. Control-point
totals strictly increase; intensities rise with them; the result is clamped. Concave is
the shape for the same reason vote weight is concave: a reaction proportional to spend
turns the stream into an auction for the visual. The total keeps accumulating past the top
point, so a saturated visual cools down through full blaze rather than snapping off it, and
the designer decides that on purpose. That is
[piecewise-intensity-curve](./techniques/piecewise-intensity-curve.md).

Intensity then drives the look through a separate, linear **binding** per visual property —
opacity from a resting value to full, scale from slightly small to slightly large. The
resting value is not zero: a visual that vanishes at rest reads as broken on stream and
gives the streamer nothing to place. Keep the two apart. The curve is the economics, the
binding is the art, and a designer who changes the glow should never move how much giving
it takes. A visual that swells is fitted to its envelope at its largest state, not its
current one, so growing with intensity never re-fits the overlay and pumps the zoom.

## The streamer chooses a feeling, and sees what it will do

The curve, the half-life and the source weights are numbers whose interaction no streamer
should simulate in their head. The controls are **presets** — a gentle, a balanced and an
eager curve; a cooling that is a flash, a glow or a slow build — each carrying a
**consequence line** computed by running the preset over representative generated nights:
"peaks 74%, lit 12 minutes", "sits at full blaze for 8 minutes", "stays dark". A curve that
pins for most of a gift wave or never lights on a quiet night is visible before it airs,
and the tool can offer the one point move that fixes it. The lines are computed from the
same rules the live engine uses; a hand-written line drifts the first time a number moves.
That is [presets-with-consequence-lines](./techniques/presets-with-consequence-lines.md).

## A test fire travels the real path, then hands the stream back

The test answers one question: **does a contribution reaching the tool reach the overlay
the audience sees?** A test that animates the tool's own preview proves the preview, and
the streamer discovers on air that nothing was wired. So the test enters the same
authority that routes live contributions, is pushed to that one visual's overlay, is
labelled as simulated on the overlay itself, and never writes a live total, a retained
contribution or a feed row. It runs as its own session from an empty total, cooling on the
visual's own curve, and **ends itself** — at its floor, at a short hold for a visual that
never cools, and at a hard ceiling for every test — returning the overlay to the live
value and clearing the label. A real contribution to that visual, a saved change or a
purge ends it early. That is [self-ending-test-fire](./techniques/self-ending-test-fire.md).

## Money changes looks, never outcomes

A contribution's only legitimate effect is visual. It never adds a vote or weight, a
giveaway entry or odds, a moderation exemption, or priority in the streamer's queue. Policy
does not hold that line, because the line is crossed by convenience rather than intent. The
separation is structural: the intake, its totals and its curves live in a unit that cannot
reach the vote, draw, moderation or engine code, and that those cannot reach; a build-time
test walks the full dependency graph in both directions and fails on any edge; and the
overlay receives an intensity that has already lost every viewer and amount. That is
[money-changes-looks-never-outcomes](./techniques/money-changes-looks-never-outcomes.md).

## The failure modes of the naive reading

**The counter that never cools.** Invisible early, saturated late. Decay the total toward
rest on a half-life the streamer chose.

**Linear in spend.** One large gift owns the visual. Concave above the first steep stretch,
capped at a designed full blaze.

**The guessed exchange rate.** Bits and subscriptions summed at a rate nobody can defend,
or two currencies summed at all. One native unit per total.

**Dedupe by delivery.** Two overlapping topics report one cheer with two event ids; the
visual flares twice. Key on the contribution's own identity.

**Decay the picture.** Cooling the intensity, or letting the page cool on its own timer,
gives a fade that disagrees with the curve and with the tool after a reload.

**The vanishing rest state.** A binding that maps zero intensity to invisible makes an idle
visual indistinguishable from a broken source.

**Knobs without consequences.** A half-life in seconds is a setting nobody can set.

**The local test.** The settings screen glows, the stream shows nothing, and the first real
gift is the real test.

**The test that stays lit.** A test with no end leaves the stream claiming a room that is
not giving.

**The convenient hype number.** A later feature reads the dial, and a vote or a draw starts
to follow the money.

## Measuring it

Measure on the replayed night and on the rendered stream, not on the settings screen. Per
visual and per representative night: the minutes at full blaze, the minutes lit, the peak,
and the minute it first lights — a visual pinned through most of a wave has a curve too
steep or a cooling too slow, one that never lights is too shallow. On the intake: duplicates
dropped, split by replay and by overlapping topic, since a sudden zero usually means the
identity key changed shape. On the stream: time from intake to the change on the program
output, measured in the rendered picture, because the tool's handoff timestamp says nothing
about whether the broadcasting software drew it — a figure measured in a headless browser is
that browser's figure, and the live one stays unclaimed until it is measured. Every test
fire's end, observed. The dependency check's result per build, as a pass or a fail.

## Boundaries

**Against [gift as in-world tribute](../../live-show/audience-steering-economies/techniques/gift-as-in-world-tribute.md)**,
in audience steering economies, which governs how a *host* acknowledges a gift — in voice,
in character, by name, scaled and capped — and what a gift may buy inside a show's menu.
This subject owns the ambient picture the room's giving drives, and it is stricter: it buys
nothing on any menu, only the look, and it names nobody. The rule: if the question is what
someone *says or does* because of a gift, it is tribute; if it is how a picture element
responds to the flow of giving, it is here. Both use a concave, capped response, and neither
lets the size of a gift reach an outcome.

**Against [overlay composition and safe area](../../broadcast-integration/overlay-composition-and-safe-area/overlay-composition-and-safe-area.md)**,
which places every overlay on the canvas, fits its size and checks that it reads over a real
stream: composition owns where the visual sits and whether its resting and full-blaze states
both read over black, white and busy footage. This subject owns what makes it brighter or
dimmer, and hands composition one fact it needs — the envelope at the visual's largest
state. A visual whose curve is right and which sits under the player's controls has failed
there; one that reads perfectly and pins on the first gift has failed here.

**Against [on-stream overlay delivery](../../broadcast-integration/on-stream-overlay-delivery/on-stream-overlay-delivery.md)**,
which serves the overlay page from a read-only origin with aggregate-only, whole-picture
snapshots and clears it when the feed drops: delivery owns how the intensity reaches the
page, what else may ride with it, and what the page shows when nothing arrives. This
subject owns how the intensity is computed and hands delivery a number and a provenance
flag that are already aggregate. The rule: the unit, the curve, the cooling and the test
session are here; the bytes, the origin and the blank-on-disconnect are there. A provenance
change is a change — a live value equal to the simulated one it replaces still has to reach
the page, or the label lies.
