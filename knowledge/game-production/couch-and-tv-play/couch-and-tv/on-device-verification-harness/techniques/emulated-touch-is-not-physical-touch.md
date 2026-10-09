---
layer: technique
type: technique
subject: on-device-verification-harness
technique: emulated-touch-is-not-physical-touch
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass, no-gate-self-certifies]
shared_with: []
use_when: [a controller page is exercised by a scripted browser with synthetic touch, a report says a touch layout was verified, an injected key or pointer event is offered as proof that real hands can play]
---

# Emulated touch is not physical touch

The named concern: a harness that injects input, synthetic touch points into an automation
browser, key events into a window callback, scripted messages over a socket, is verifying the
software path that consumes those events. It is not verifying that a person can hold, press,
slide and release with a thumb. The two are separate rungs and the harness must say which one
it reached, always.

## What an injected event proves

It proves that the page or the game responds to the event it was given: that a pointer-down on
the control reaches the handler, that a hold is reported as a hold, that a release neutralises
the control, that two simultaneous contacts are tracked independently, that layout changes
reset the controls, that a stale or out-of-order frame is rejected. These are real, useful
findings, repeatable and cheap, and they are structural-plus-behavioural evidence about the
software.

## What it cannot prove

**Contact geometry and ergonomics.** A synthetic point has no contact area, no pressure, no
palm, no roll of the thumb. Whether a target is reachable with the held hand, whether two
thumbs collide on a small screen, whether the surface is slippery, none of that is in the
event.

**Event semantics of the real stack.** The automation layer follows its own rules, and its
rules are not the platform's. In one such stack, ending a touch with a non-empty list ends the
listed contacts; an author who sends the remaining contacts instead of the released one
produces a false "button stuck" finding. The inverse also happens: the real touch stack
cancels contacts on gestures the emulation never produces, such as a system edge swipe, a
palm rejection, or a multi-touch gesture recognised by the operating system.

**Timing.** The emulation has the controller's browser timers and a scripted cadence. A real
phone adds its touch sampling rate, its power-saving behaviour and its radio's wake pattern.
A latency figure from synthetic clients is the software's contribution only.

**Everything the person does around the controller.** Holding the phone, switching apps,
notification pull-down, a locked screen, a call. These are the lifecycle paths that
actually end sessions.

The same limit holds for injected keys on a desktop build: a callback invoked by the
harness proves the callback, not that a physical keyboard or a remote control reaches it
through the platform's input chain.

## The labelling rule

Every result produced with synthetic input carries, in the same field as the verdict, the
statement that the input was emulated, the tool that emulated it, and the device model it ran
on, and a line that no human played. A verdict for touch layout, comfort or feel is
**unmeasured** until a person has used a real device, and it renders as unmeasured, never as
a pass built from the emulation's pass. Where a human gate exists, such as an owner exercising
the game, the harness's result is its precondition and not its substitute.

## Procedure

1. Write the claim at the rung the evidence reaches: "the controller page tracks two
   independent contacts under emulated touch with the stated viewport".
2. Include the emulation parameters: viewport, touch support flag, device scale, which
   browser, and the model of the display device the page talked to.
3. Verify the emulation's own semantics once, against the tool's documentation, for every
   release and cancel call used. Write the correct usage into the harness's helper, so each
   check uses the helper.
4. Keep the human checklist beside the report: the exercises that need a person, their
   expected observations, and an unmeasured status until done.
5. Where the physical path matters and the harness cannot reach it, list the path and the
   reason, never leave it silent.

## Decision rules

- **When a test needs two thumbs, use two independent contexts or one multi-point script, and
  say which.** Their failure modes differ.
- **When a finding appears only under emulation and not on a real device, suspect the
  emulation first.** Check the call semantics before changing the game.
- **When a feature would be hidden by the emulation, such as a gesture, list it as outside
  the evidence.** Silence reads as coverage.
- **When a verdict feeds a gate, the gate's required rung is stated in the request.** A request
  for "felt" cannot be satisfied by "injected".
- **When automation is also the only way a script can run unattended, accept it and keep the
  label.** The label is cheap and it is what makes the evidence honest.

## When not to use it

Do not discard emulated touch. For logic, regression and lifecycle it is the right and often
the only unattended instrument. The rule is about what the evidence is called, not about
whether to collect it.

## Evidence status

Measured on one device with scripted clients: emulated touch in a headless browser at a
phone-sized viewport drove two seats through a career flow and a lifecycle drill; the release
semantics were misread once and corrected. A desktop build was driven by injected callbacks.
Neither a physical phone nor a human hand touched the controller. Reach, comfort and feel are
unmeasured.
