---
layer: golden-path
type: golden-path
subject: steering-feel-profile-shaping
status: forged
use_when: [a touch or couch controller drives a vehicle and the feel is being tuned, adding a selectable handling feel without forking the simulation, deciding who owns input shaping between a controller client and the simulation core, comparing candidate steering settings]
techniques:
  - deadzone-exponent-remap
  - asymmetric-steer-slew-rise-return
  - throttle-instant-release-progressive-rise
  - brake-never-reverses
  - five-profile-trace-bands
  - baseline-preset-preserved
---

# Steering feel profile shaping

A vehicle game with a touchscreen for a wheel has a feel problem that a physical wheel hides. A wheel has travel, centring torque and a lock-to-lock range the hand already understands; a thumb on glass has a few centimetres of drag, no return force, and a release that is instantaneous and total. Whatever the player's hand does, the handling model downstream receives it as a number between minus one and one, and the felt quality of the whole game is decided by what happens to that number between the glass and the yaw integrator. That interval is the subject: the input-shaping pipeline, and the named bundles of its settings that players are allowed to choose between.

The pipeline is short and its stages are few. A raw axis passes a dead zone and is rescaled, then bent by an exponent. The result is a target; the steering the vehicle actually sees chases that target at a bounded rate, faster back to centre than out of it. A speed-blended authority scales how much yaw the steering may request, and a yaw response constant decides how quickly the vehicle's rotation follows the request. Throttle has its own shape: a ramp on the way up, a cliff on the way down. Brake has a scale and a rule about what it may never do. Every one of these is a number, and a *feel profile* is a named row of them. The craft is not in any single number. It is in keeping the pipeline in one place, keeping the rows comparable, and refusing to judge a row by one figure.

## One pipeline, owned in one place

The first decision is who shapes. A touch client is the only party that knows the glass: where the thumb landed, how far a full deflection should travel in physical units, how wide the pad is. A simulation core is the only party that knows the vehicle, the tick, and what every other source of input (rival controllers, a replay, a test fixture) does. The rule is that the client owns **touch geometry and nothing else** — it converts a gesture to a normalised axis and sends it — and the core owns **every transformation from that axis onward**. The geometry numbers may live in the same row as the shaping numbers, because a profile is one named thing, but the client reads them as layout and the core never sees a pixel.

The reason is not tidiness; it is that shaping done on both sides is shaping done twice on different clocks. A client that applies its own dead zone and a core that applies another produce a combined dead zone nobody chose, and a client that smooths on its own frame cadence puts a delay in the loop that the core's tests cannot see and the tuning table does not list. One owner per quantity means a trace taken against the core is a trace of what a player on any client receives. A profile switch is then a data change applied at a safe boundary rather than a client release.

This is also what makes profiles *selectable*. When shaping is a pure function of a row plus a small amount of state held by the vehicle, switching the row mid-session is an index swap at a frame boundary, with no reset of the race and no second code path. When shaping is smeared across a client and a core, a "profile" is a branch of the product.

## What each stage buys, and what it costs

**The dead zone and exponent** decide the first centimetre of travel. A dead zone swallows tremor and the drift of a resting thumb; rescaling the remainder so that full deflection still reaches full output keeps the curve continuous, with no step at the edge and no lost range at the top. The exponent then trades centre precision against edge speed: a value above one flattens the middle and makes large inputs ramp harder, a value below one strengthens small inputs. Neither is better; they answer different complaints. `deadzone-exponent-remap` fixes the order of operations and the bounds.

**The steering slew** is a rate limit on the chase of the target, and its asymmetry is the point. Turning in slowly forgives a jabbed thumb; returning to centre quickly catches a release. A limit symmetric in both directions either makes release feel like a drag or makes turn-in feel like a snap. `asymmetric-steer-slew-rise-return` states how the direction is chosen, which is less obvious than it looks.

**Throttle** is shaped differently from steering for a safety reason, not an aesthetic one. A progressive rise keeps a launch from being a single finger-tap, but any rule that also delays the *release* turns a lifted thumb into a vehicle that keeps accelerating. The cut must be instant; the rise may be gradual. Engine samples ramp the fall too, only faster than the rise. The cliff is a choice made for inputs that cannot tell a release from a lost finger. `throttle-instant-release-progressive-rise` holds that line.

**Brake** has one rule that matters more than its scale: it never reverses the vehicle. A brake that continues past zero speed into negative speed has silently invented a reverse gear on the same control, and most surprising backward rolls in a casual racer are that. A model that can spin needs the finer form: backward travel from a spin is real momentum, and the brake may stop it but never create it. `brake-never-reverses` makes the exclusion explicit and puts reverse, if the game wants one, on a separate deliberate control.

**Speed-blended authority and yaw response** are the two stages that change the vehicle's character rather than the input's. Authority is a function of speed between a low-speed value and a high-speed value, the standard answer to the fact that the same full lock that parks a car rolls it at speed. Yaw response is the time constant of rotation. They belong in the profile because they are what players describe as "loose" or "planted", and they are the dangerous two: they move the *vehicle*, and their effects do not show up in the input-side stages at all. Vehicle kits ship the first as a maximum-steer-against-speed table, and several racers expose both as separate player options (a speed-sensitive steering reduction and a countersteer assist). That is the right instinct: independent controls that a designer can sweep one at a time.

## Never by one number

Profiles are compared on a small set of measurements taken from a controlled trace: the time to reach most of the steady yaw rate after a step input, the radius of the turn that results, the vehicle's slip angle once the turn is saturated, and the time to settle after release. Any single one misleads, and the reason is structural. Raising authority shortens turn-in and tightens radius, and both read as improvements; but the same change can multiply the saturated slip angle, because a vehicle asked for more rotation than the grip model's restoring term will hold is a vehicle sliding. Two profiles can have indistinguishable radius and turn-in and differ by a factor of two in slip. A comparison that stops at radius declares them equal and ships the one that spins.

So the comparison is a table with its basis written beside it, and the rule is: *transient time and radius and saturated slip, together, and recovery as the fourth*. A profile that wins one column and loses another is a different feel, not a better one; the owner of the game picks, with the table in hand. A second rule guards attribution: when two rows differ in several settings, the table cannot say which setting produced a difference in a column. Naming a cause ("more authority raised the slip") needs a sweep that changes that one setting alone; until then the sentence is a hypothesis. `five-profile-trace-bands` is the procedure, including the part most implementations skip: the acceptance bands are stored beside the profile, so a profile that drifts out of its declared character fails a test instead of a playtest.

## What is measured, simulated and authored

This subject is easy to oversell, so the states are kept apart. The traces are **simulated**: a headless vehicle at pinned speed, driven by scripted step, ramp, sine and hold patterns, isolating the steering response from acceleration. They say how the model behaves under those inputs. They do not say how a human thumb on glass feels, and they are not a lap. The profile values are **authored**: chosen by a designer from the traces and from argument, and where a profile is later preferred by an owner, that preference is a human verdict recorded once, not something the traces derived. Thumb-travel distances are **hypotheses** about effort. Input age over a network link is **measured**, but it is an age, not a latency from touch to photon; optical latency needs a camera and is a different instrument. A page that merges these into "tested feel" has laundered a simulation into a verdict, which is exactly the failure that an unmeasured quantity must never be rendered as a pass.

## Failure modes of the naive reading

- **Shaping on both sides.** A client smoothing and a core smoothing; the loop has a delay nobody listed.
- **One-number tuning.** Radius or turn-in alone. The profile that wins it has an unmeasured slip cost.
- **Symmetric slew.** A single rate for both directions; release drags or turn-in snaps.
- **Delayed release.** Throttle shaped like steering, so lifting off does not cut power at once.
- **Brake into reverse.** Velocity allowed to cross zero; the control now has two jobs.
- **The unlabelled default.** A profile marked as the default with no statement of whether that was measured, authored or only proposed. A proposed default is a proposal.
- **A knob nobody reads.** A profile field that is declared, validated and round-tripped through the data file and consumed by nothing. Every field is read by the pipeline or by the client's layout, and a census says which.
- **A fixture on a path nobody drives.** A trace vehicle built by hand with default parameters takes a handling branch the shipped vehicles do not, so its bands pass while the game's real model drifts. Build the fixture through the game's own vehicle factory and assert the branch. Pinned speed has the same blind spot: on a model that can spin, a full-lock step at a pinned speed measures a spin.
- **Shaping only some drivers.** A pipeline applied to human input and skipped for scripted drivers is two pipelines; it is acceptable only when stated, and a trace of the shaped path then says nothing about the others.

## Boundary with the neighbouring subjects

The response-latency norms in the motion-quality subject say how long after input a movement may take to show a meaningful frame; they are a genre rubric for animation and budget, and nothing about them shapes an axis. This subject owns the shaping that sits *before* the response: how a raw axis becomes a target, what rate it is chased at, and how the resulting feels are compared. When the question is "is the first visible answer within the budget this genre holds", read the norms; when the question is "what should steering do with a thumb at forty per cent", read this one. They share a measurement discipline: a norm describes the genre, a trace describes a model, and neither describes a human.

The runtime-patterns subject owns the choice of structural shape for a behaviour and the discipline of keeping a per-step path free of allocation. This subject takes one hot-path constraint from it and nothing else: shaping runs every step for every human input, so it must not allocate after warm-up. What *form* the pipeline takes (a pure function of a row, with state held by the vehicle) is this subject's own concern; which pattern a generic system should adopt is decided there. The rule for choosing is that if the problem is the numbers on the way from glass to yaw, it is this subject, and if it is the shape of a runtime system, it is the other.
