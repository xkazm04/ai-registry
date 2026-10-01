---
layer: golden-path
type: golden-path
subject: two-thumb-touch-layout-design
status: forged
use_when: [putting a real-time game with steer, go, brake, fire, a secondary weapon, a swap and a handbrake onto a phone held in landscape, offering the player several control layouts to choose between, a held control sticks or fires after a menu opens, adding a left-handed mode]
techniques:
  - relative-anchor-steering
  - pointer-capture-per-control
  - cruise-fire-drives-throttle
  - pad-vertical-throttle-neutral-start
  - handedness-mirror
  - neutralise-on-sheet-open-or-layout-change
---

# Two-thumb touch layout design

A phone held in landscape has two thumbs, a glass surface that cannot be felt, and nothing
under either thumb to say where the controls are. A racing or vehicle-combat game wants
more simultaneous demands than that: steer, go, brake, fire, a secondary weapon that is
dropped rather than aimed, a swap between weapons, and a handbrake for drifting. That is
three continuous quantities and four or five momentary ones competing for two contact
points, and on a console they would sit under ten fingers and two triggers. This subject is
the craft of fitting that demand onto two thumbs honestly: which control is analogue and
which is a hold, which one the left thumb owns and which the right, what happens when a
thumb slides off its target, and what the screen does at the moments the thumbs are not
where the player thinks they are.

It is not the wire. How a controller's state reaches the game, how often, how stale input
is cut, how the host and the phone agree on a layout name: that belongs to the input
protocol. This subject owns the *geometry and the ownership rules on the glass*, and it
produces a small number of values the protocol then carries.

## The surface has no edges, so ownership is the design

A physical button has edges the thumb finds without looking. A touch target has none. The
thumb lands, drifts, rolls and leaves, and a control defined only by "the finger is
currently inside my rectangle" will lose the finger in the middle of a corner. Everything in
this subject follows from one reframing: **a touch belongs to the control it began on, for
its whole life.** The touch is claimed at first contact, and what happens afterwards, inside
or outside the rectangle, is that control's business and nobody else's. Without that rule
the layout is a hit-testing problem solved afresh on every move event; with it, the layout
is a small table of independent owners, each holding at most one touch.

Two failure modes sit on either side of it. A touch that *leaves* its control while the
control stays held is a stuck input: the car accelerates into a wall after the thumb has
gone. A touch that *drags onto* a neighbour and fires it is a phantom input: the player
steers hard, the thumb creeps toward the weapon column, and a mine is dropped that nobody
asked for. Both come from letting geometry, rather than ownership, decide who is pressed.
The second is the more expensive because it is deniable; the player believes they did
nothing, and the game agrees with them for a long time.

A related failure is the platform taking a touch away. A system gesture, a notification
shade, an incoming call or a scroll recogniser can cancel an active touch outright. A
control must release on cancellation exactly as on lift, and must also release when it
loses its claim for any reason, because the alternative is a hold with no finger.

## Steering is a relationship, not a place

The left thumb steers, and the principal choice is what the steering value is measured
against. An **absolute** pad maps the thumb's position inside a fixed rectangle to a
steering value: the middle is straight, the edges are full lock. It is learnable and honest,
and it has one serious flaw on glass: the thumb must land near the centre every time, and
when it lands a little off, the car turns on first contact before the player has decided
anything. A **relative** pad takes the first contact point as straight ahead and measures
travel from there. It never snaps, it forgives where the thumb lands, and it tolerates a
thumb that drifts across a long session. Its cost is that straight ahead is wherever the
player last touched, so the pad must anchor at every new contact and zero at every lift; the
player re-centres by lifting, a gesture they already make.

The travel that maps to full lock is a physical distance in the thumb's own units, not a
fraction of whatever pad size the layout happened to use: the same thumb on a larger phone
should not need a longer stroke. And it is one authored value consumed once, downstream,
with dead zone, response curve and slew applied in a single place, never re-derived on the
glass ([one-authority-per-quantity](../../_laws.md#one-authority-per-quantity)).

## Three layouts, because the real question is which thumb gives up what

Eight controls on two thumbs cannot all be primary. The question is which thumb pays, and
there is no objective answer, only a trade the owner can feel. Three families recur.

In the **classic** family the left thumb steers and the right thumb holds go plus separate
fire, secondary and swap. It is familiar and every control is explicit, but the right thumb
must leave go to do anything else, so attacks happen while coasting, which is a style, not
a fault.

In the **cruise** family firing also drives. Go and fire are the two most frequent holds and
they fight for the same thumb; letting the fire hold also supply throttle collapses two
holds into one. It is not an automatic throttle: letting go of fire stops both, and brake
overrides. The cost is that a player who wants to shoot while stationary, or to fire while
braking into a corner, meets a conflict resolved by rule, and the rule has to be one the
player can learn in a sentence.

In the **split** family the throttle moves onto the steering pad as its vertical axis, which
frees the other thumb for weapons and brake. One thumb carries two quantities, which is a
real gain and a real risk: a thumb at rest on the pad can produce acceleration by accident.
The mitigation is that a fresh touch starts at zero throttle, so the player must make an
upward drag on purpose to accelerate.

These are **alternatives given to the owner as experiments**, and that wording is the
design. Nothing about thumb reach, fatigue or comfort is known until a hand has held a
phone through a race; a layout chosen by argument is a layout chosen by whoever argued best.
A selectable layout carries a stable name that appears in settings and in any telemetry, so
that a complaint can be tied to the arrangement that produced it. The honest status of every
layout until it has been used is *authored*, and where a simulated client has driven it, it
is *simulated*. Neither is comfort.

## Handedness is a mirror, not a fourth layout

A left-handed player wants the continuous control under the dominant thumb, not a different
control scheme. Mirroring swaps the two columns and nothing else: every control keeps its
semantics, its ownership and its size. It is a presentation flag layered over every layout,
not a layout, which is why it composes with all three and does not triple the behaviour test
matrix. The failure is mirroring only the visual order and leaving a gesture's direction
semantics behind. Mirror the columns, never the axes: a pad that moves to the other edge
still means left is left.

## Moments when every held input must die

A thumb can be on a pedal at the instant a menu opens, the layout changes, the car is
destroyed, the link drops or the window loses focus. In every such moment the game and the
phone disagree about what is held, and the safe default is that nothing is. Every held
quantity returns to neutral: steering centred, throttle off, brake off, fire off, handbrake
off. Every ownership slot is also forgotten, so a lift that arrives later cannot toggle a
control the player already abandoned. This is an event list, not a heuristic: opening any
sheet over the controls, changing layout, changing handedness, a wrecked car, a pairing or
connection change. A new event that places a surface over the controls adds itself to the
list or it leaks a held input.

One browser fact deserves its own sentence because it fails silently: the browser applies
the *intersection* of touch policies up the tree. A driving surface that disables browser
panning on its root cannot be partly re-enabled on a scrollable sheet child; the sheet
scrolls only if the policy is changed on the ancestors while the sheet is open, and restored
when it closes. A sheet that cannot be scrolled on a short landscape screen is a sheet whose
close button may be unreachable, and the player is then stuck in a menu with the controls
neutralised.

## Failure modes of the naive reading

- **"It is a joystick plus buttons."** A virtual joystick copies a device that has a stick
  and edges. The glass has neither, and the copy keeps the snap on first contact and the
  lost finger on a drift.
- **Hit-testing on every move.** The control under the finger is not the control the finger
  began on, and the player pays for the difference.
- **One layout, defended.** Comfort claims are guesses until measured on the physical phone,
  by the person who plays; a single layout turns a guess into a policy.
- **Mirroring as a skin.** A left-handed mode that changes only positions has changed the
  look and left the semantics half-mirrored.
- **Neutralising on some events and not others.** The list of events is the safety property;
  the one omitted event is the one the player finds.
- **Counting a simulated touch as a felt one.** An emulated multi-touch client proves the
  ownership rules and the reachability of each target. It proves nothing about thumb reach,
  fatigue or accidental contact, and a report must keep the two apart
  ([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)).

## The path, in order

1. **Fix the control inventory** and say which quantities are continuous and which are holds.
2. **Give every control one owner** that claims a touch at first contact and releases it on
   lift, cancellation or loss of claim.
3. **Make steering relative**, with travel in physical units, anchored per contact and
   zeroed per lift.
4. **Author the layouts as data**, each with a stable name, and state for each claim whether
   it is authored, simulated or measured.
5. **Layer handedness over all of them** as a mirror of columns.
6. **Enumerate the neutralising events** and wire each to one routine that clears values and
   ownership together.
7. **Hand the choice to the owner** as an experiment, with names in settings and telemetry.

## Where this subject stops

Its sibling, the input protocol, owns the path from the glass to the game: the shape of a
message, its rate, how a stale controller is cut, why absolute states rather than events
stop repeats from stepping a counter, how a layout name is announced. This subject owns
what those values mean on the glass and how they are produced. The picker: when the
question is "why did the car keep driving after the thumb lifted" and the answer is a
missing timeout on the receiving side, it is the protocol; when the answer is a touch
nobody released, it is here. The two share a duty to clear everything on a layout change,
and the glass is where the clear starts.

Learning-curve design owns whether the player was taught what a control does. This subject
supplies the thing being taught and constrains it: a layout with go on the steering pad is
an unlearnable gesture until something teaches the upward drag, and a layout that lets the
player discover that fire also drives has hidden a rule. When a player never uses the
handbrake, ask there whether it was taught; when a player cannot reach it with the thumb
that owns it, ask here.
