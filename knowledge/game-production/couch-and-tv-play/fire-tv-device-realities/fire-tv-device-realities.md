---
layer: golden-path
type: golden-path
subject: fire-tv-device-realities
status: forged
use_when: [a game is about to run on a streaming stick for the first time, a build is green and an emulator is happy but nobody has put it on the real device, a launch command returned success and nothing is on the screen, a game that listens on a network port must survive on a locked-down TV platform]
techniques:
  - wake-before-launch
  - abi-inspect-the-apk
  - keep-screen-on-flag
  - unhandled-bind-failure-kills-process
  - dhcp-scan-for-device
  - server-socket-portability-hedge
---

# Streaming-stick device realities

A game aimed at a living-room TV is judged on a device that is not the developer's
machine, not a phone and not an emulator. The streaming stick is a low-memory, thermally
constrained, vendor-modified box that spends most of its life asleep, is reached over a
network whose addresses it does not control, and is held by a remote with no keyboard.
Almost everything that can go wrong with it goes wrong silently and early, before the first
frame of the game has had a chance to be wrong. This subject is the short list of those
silent failures: the conditions of the real device that an emulator, a green build and a
successful install never show, each with the check that makes it visible.

The list is not a complete account of the platform. It is the set of facts that each cost a
team a session of confident debugging in the wrong place, which is the only qualification
that matters. A fact earns its place when the symptom points away from the cause: a game
that "does not start" when the display was merely asleep, a library that "will not load"
when the silicon was never the problem, a server that "stops working" when the box was
handed a new address.

## Success is reported by the wrong party

The common root is that the party reporting success is not the party that can see the
result. A launch command reports that the activity manager accepted an intent, not that a
picture reached a screen. An install reports that a package was unpacked, not that its
native code can be loaded by this userland. A server reports that it is listening, if it
reports anything, in a process that the platform may already have ended. A debug-bridge
connection reports a transport to an address, and the address may now belong to a different
device or to nothing. Each of these is a reasonable answer to a narrower question than the
one the developer is asking, and the gap between the two questions is the subject.

This is why the evidence has to come from the device and from the layer that matters:
the display state asked of the power service, the architecture list read out of the
package, the process asked whether it is still alive, the network asked who answers on the
port. The principle is the one the bundle's laws state in general form - a structural pass is
necessary and never sufficient - applied to a platform where the structural pass is
especially cheap and especially misleading.

## The six realities

**The display is asleep when the game launches.** A stick that has been idle goes to a
sleeping display, and starting a program in that state succeeds in every sense the tooling
can observe while the screen stays dark. A tester then watches a black picture, assumes the
game is broken, and starts reading logs for a crash that did not happen. The remedy is
procedural: wake the display and confirm it woke before the launch, every time, as part of
the launch rather than as a manual step. `wake-before-launch` develops it, including why
the confirmation matters more than the wake.

**Silicon width is not userland width.** A processor that can execute 64-bit code can be
running an operating system whose application layer is 32-bit only, and the stick is the
standard example: the marketing name, the chip's datasheet and the actual loadable
architecture are three different facts. A package built with only the architecture the
developer assumed installs cleanly and then fails at the first native-library load, with an
error that reads as a missing file. The remedy is to ship every plausible architecture and,
more importantly, to read the architecture list out of the produced package rather than out
of the build configuration that was meant to produce it. `abi-inspect-the-apk`.

**Unattended play meets the screensaver.** A game driven by a script, a recording session or a
tester who has stepped away shows no input to the platform, and the platform does what it
is built to do: it dims, then starts the ambient screensaver, then sleeps the display. The
game is running perfectly behind it. The window-level keep-awake flag prevents this, but it
is a statement about the game's own window, not a setting of the box, and the way it is
used decides whether it is a fix or a policy violation. `keep-screen-on-flag`.

**A bind failure ends the process.** A game that hosts a server - a phone-as-controller
bridge, a lobby, a telemetry port - binds a socket when it starts. On a real device the
bind can fail: the port is held by a previous instance that has not finished dying, the
platform denies the permission, the interface is not up yet. A failure raised on a worker
thread and not caught there is an uncaught exception, and the runtime's default response to
an uncaught exception on any thread is to take the whole process down. The game vanishes
back to the launcher with no message, as though it had never opened. The server is a
convenience; losing the game over it is a design error. `unhandled-bind-failure-kills-process`.

**The device's address is not its identity.** A stick is given its network address by a
lease. The lease expires, the router reboots, the device sleeps long enough to lose it, and
the address a script remembered now points at a different device or at nothing. A
connection that worked yesterday and refuses today is then diagnosed as a broken tool when
the only change is a number. The remedy is to find the device by what answers rather than by
what was remembered. `dhcp-scan-for-device`.

**The platform may forbid the thing the game is built on.** A new generation of the
platform may replace the general-purpose runtime with a restricted one, and a restriction
that matters to a game with a hosted server is whether a program may listen on a socket at
all. When the answer is not documented, it is an open fact, and a design that depends on it
is a design with an undisclosed risk. The remedy is a hedge: move the listening end
somewhere the platform cannot restrict, and make the device a client. 
`server-socket-portability-hedge`.

## What the real device actually tells you

These checks are cheap, and the discipline is only that they are made against the device and
recorded as made. A launch procedure that wakes the display, installs, reads back what
architecture the installed package carries, starts the game, waits, and asks whether the
process is still alive has stated six facts and can say so. One that skips a step has not
discovered a failure; it has an unmeasured fact, and under the bundle's first law that
renders as not measured, never as a pass.

The honest scoping matters as much as the checks. A stick that fits one tester's shelf is
one device of one memory size and one thermal history. A finding established on it is a
finding about it, with its model and its reported memory attached. Whether a particular
trap bites a sibling model, an older revision or a newer platform generation is a separate,
unmeasured question, and the right way to carry it is as a named assumption, not as a
generalisation. This subject states most of the traps as properties of a class of device and
every number as a property of a unit.

## Boundary

The corpus of engine pitfalls owns the routing of hard-won folklore about a large
third-party system to the task that needs it; this subject is a body of such folklore for one
class of target, and its six entries are the kind of content that corpus would carry, not a
competing way of carrying it. When the question is how an incident becomes a routed, scoped,
provenanced entry, that corpus answers it; when the question is what a streaming stick does
to a game that built and installed, this subject does. The integration-safety subject owns
the rules for a tool that is a guest inside someone else's live creative application, and it
is mostly specific to an editor on a workstation; the seam is the shared habit of judging a
run by what the process said and not by the status of the command that started it, which
appears there as a log-marker protocol and here as asking the device directly. Do not read
its refusal-to-kill rules into a device that has no human session to protect. The sibling on
on-device verification owns the harness that installs, drives, captures and gives a verdict;
this subject owns the device conditions that make such a harness lie or make the game die
before the harness has anything to judge. When the question is how to build and trust the
loop, read the sibling; when the loop reports black pictures, a missing library or a refused
connection, read here first.

## What the naive reading gets wrong

- **Treating the emulator as the device.** The emulator has a wide userland, an unlimited
  display and no lease expiry. It is a good place to find logic errors and a bad place to
  find any of these six.
- **Reading the successful launch as a running game.** The launch reports acceptance. The
  screen, the process and the render are three further facts.
- **Trusting the build configuration for the architecture.** The package is the artifact;
  the configuration is an intention. Read the artifact.
- **Fixing the screensaver in the box's settings.** That changes the device for every
  application and every future session; the flag changes one window, for as long as it is
  open.
- **Protecting the process from the server by hoping the bind works.** A hosted server that
  can end the game is a dependency, whatever it is called.
- **Hardcoding the address.** An address is a cached answer with no expiry date.
- **Calling an undocumented platform capability "probably fine".** An unknown that the whole
  control scheme depends on is a risk to be hedged and scheduled for a measurement, not an
  assumption.
