---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: own-profile-port-and-password
status: forged
laws: []
shared_with: []
use_when: [configuring the broadcasting-software instance a test run launches, choosing the control port and password for a test instance, deciding between a separate configuration root and a named profile]
---

# Own profile, port and password

The test instance carries an identity of its own on every axis the software uses to tell
setups apart: its own configuration root where possible, otherwise its own profile and scene
collection, and always its own control port and a password generated for this run. Nothing
the instance needs is borrowed from the owner's setup, and nothing it creates is named so it
could be mistaken for the owner's.

## Configuration root first

The broadcasting software reads three kinds of state: global settings (which profile and
scene collection are active, the control-socket settings, window layout), profiles (output,
encoder and streaming service settings) and scene collections (scenes and sources). A
launch mode that points the instance at a configuration directory the harness created
separates all three at once. Prefer it. It turns the owner's files from things to restore
into things never opened, and the byte-exact restore becomes a guard rather than the
mechanism.

When the harness has to run the installed copy against the shared configuration root - the
separate-root mode is unavailable, or the test is about behaviour that depends on the
installed configuration - it names its own profile and scene collection on the command line
at launch, so the instance never opens the owner's, and it accepts that the global settings
file is shared and will be written. That file goes in the restore set and the recovery
manifest before anything starts.

## Names that say whose they are

The profile and scene collection carry a fixed, unmistakable prefix that marks them as the
harness's - visible to the owner in the software's menus if a crash leaves them behind, and
safe to remove by the harness's own recovery because the manifest recorded that the harness
created them. A name the owner might plausibly have chosen ("Test", "Default 2") is a name
the harness can never safely delete.

The harness never edits the owner's profile to add what it needs, and never switches the
global active profile or collection by changing the shared file; it launches into its own.

There are two ways to create that profile, and the choice has a cost either way. Writing a
minimal profile and collection to disk before launch lets the instance start directly into
them, but the harness is then authoring the program's file formats and has to keep up with
them. Creating them through the control socket keeps the formats the program's own, but
the instance has to be running first - and an instance launched without a named profile
opens whichever one is active, which is the owner's; switching away from it then records the
switch in the shared global settings. When creating through the socket, launch into a
throwaway placeholder or a separate configuration root first, never into the owner's
active profile.

## Port and password

The port is chosen per run, from a range away from the software's default, and checked free
immediately before launch. The password is generated per run from a cryptographic source,
long enough that guessing is not a question, held in the harness's memory, and written only
where the instance must read it - in its own configuration or on its launch line - never in a
log, a report, or a file that outlives the run. A password reused across runs becomes a
password somebody pasted into a ticket.

Handing the port and password to the instance as launch options is the cleanest route,
and it has two consequences to plan for. A launch line is readable by other processes of
the same user for as long as the instance runs, which is acceptable for a password that dies
with the run and is not for one that outlives it. And whether the program keeps a value it
was given at launch is a fact about the build, not a given. The control plugin read for this
subject treats launch-line port and password as a session override and saves neither, so
the lane's password stays out of the owner's files (measured 2026-11-03). Another build may
persist them. Search the configuration root for the generated password after a graceful
exit: the password is the cheapest canary there is. The restore set is never empty when
the configuration root is shared, because the program rewrites files in that root on start
and on exit regardless.

Bind the test instance's control socket to loopback where the software allows it. A test
instance reachable from the network is a remote-control door into a program that renders to
the machine's screen and can capture its displays and devices. Where the software cannot,
the per-run password is the only lock on that door, which is one more reason it is long,
generated and never reused. The control plugin read for this subject has no loopback-only
setting and listened on every IPv4 and IPv6 interface when measured on 2026-11-03. A host
firewall rule that admits only loopback to the lane's port is then the second lock. A
report may say "loopback" only after reading the listener's bound address.

## Things the instance must not inherit

The test profile carries **no streaming service settings**: no account connection, no
stream key, no server. Start-streaming on that profile has nowhere to go. It has no
auto-start flags for streaming, recording or a virtual camera, unless a test specifically
needs recording, and then to a directory the harness owns. Capture sources that could pick
up the owner's screen, webcam or microphone are created only by a test that needs them,
and their output never leaves the machine (see the leak scan).

## Decision rules

- **When the separate-root mode is available and the test does not depend on installed
  configuration**, use it; restoring is then a safety net.
- **When the profile or collection name already exists and the manifest does not claim
  it**, do not reuse or overwrite it; choose another name and report the stranger.
- **When a test needs a network-reachable instance**, it needs a dedicated machine, not
  the owner's.

## When not to use it

A test that only parses a scene-collection document, or exercises the tool against a
recorded control-socket transcript, needs no instance at all; do not launch one to make it
feel real.
