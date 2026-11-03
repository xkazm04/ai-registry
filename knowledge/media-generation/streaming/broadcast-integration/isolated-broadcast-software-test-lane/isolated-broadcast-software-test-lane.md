---
layer: golden-path
type: golden-path
subject: isolated-broadcast-software-test-lane
status: forged
use_when: [writing automated tests that need the real broadcasting software running, running an unattended or overnight test lane on a streamer's own machine, deciding what a test harness may write in the broadcasting software's configuration, publishing logs, screenshots or reports from a run that drove the broadcasting software]
techniques:
  - never-touch-the-owner-instance
  - own-profile-port-and-password
  - byte-exact-config-restore
  - crash-recovery-manifest
  - metadata-only-inventory
  - secret-leak-scan-of-outputs
---

# Isolated broadcast-software test lane

A tool that drives a streamer's broadcasting software can be tested against a fake for a
long way, and then not at all. The fake answers in the order it was written to answer; the
real program renders scenes lazily, prunes placements late, changes its mind about what is
ready while a scene collection loads, and writes its own configuration back to disk when it
exits. The only way to know a cleanup really cleans, an overlay really renders and a
reconnect really reconciles is to run the real program. On the machines where these tools
are built, that program is almost always also **the streamer's own** - the one their scenes
live in, the one holding their account connection, the one they go live from tonight.

An **isolated test lane** is the discipline of running the real broadcasting software for
automated tests **beside** the owner's setup and never through it. The principal
practitioner's core belief is that **the owner's instance and its configuration are not a
fixture; they are the thing the lane exists to protect**, and a lane that leaves them
byte-for-byte as it found them - across success, failure and a killed process - is the
only kind a streamer can let run unattended. Every other property of the lane follows
from that one: it brings its own instance, its own profile, its own port and password;
it records the bytes of anything shared before it writes; it leaves a written trail a
later run can use to repair a crash; it proves the owner's setup unchanged by looking at
shapes, not secrets; and nothing it publishes carries a credential.

The naive design treats the installed program as a test dependency like a database
container. It connects to whatever is listening on the default control port, creates a
scene, runs the suite and deletes what it made. Each step is a breach. The default port is
the owner's instance, so the suite runs against the streamer's real scene collection. The
deletion trusts the tool under test - the very code whose correctness is in question - to
remove only what it created. The program writes its settings on exit, so a suite that
changed the active profile leaves the streamer opening tomorrow into a profile they never
chose. And the logs the suite uploads to its continuous-integration run carry the control
password it read from the owner's configuration to get in. None of these failures shows
up as a red test; they show up the next time the streamer goes live.

## Two instances, one machine, no shared door

The lane runs its own instance of the software (never-touch-the-owner-instance). It never
connects to an instance it did not launch, never stops a process it did not start, and
identifies its own instance by the handle it holds on the process it spawned and by a
handshake with credentials only that process knows - never by "whatever answers on the
port". When the owner's instance is running and the software cannot safely run a second
copy beside it, the lane does not ask the owner to close it and does not close it for
them: it records **skipped**, with the reason, and a skipped run is never counted as a
passed one ([_laws: unmeasured-is-not-pass_](../../../_laws.md#unmeasured-is-not-pass)).

The strongest isolation is a separate configuration root: the software started in a mode
where it reads and writes its settings beside a directory the lane created, so the owner's
profiles, scene collections and global settings are not on the instance's path at all.
Where that mode is not available, or the lane needs the installed build exactly as the
streamer runs it, the second instance shares the owner's configuration root, and the lane
has to pay for that with everything below: its own named profile and scene collection, a
port and password of its own, and a byte-exact restore of every shared file it touches
(own-profile-port-and-password). The cheaper option is the safer one; take it whenever the
test does not depend on the shared files.

## The program writes back, so restore after it exits

Configuration a running instance has loaded is not the configuration on disk. The program
holds its global settings, its profile and its scene collection in memory and writes them
back when the user changes something and again when it exits. A lane that restores the
owner's files while its instance is still running restores them for a moment; the instance
then exits and overwrites them with its own view (byte-exact-config-restore).

The program also writes shared files the lane never asked it to. Its control-socket plugin
re-serialises its own settings file every time the program starts, before the lane has sent
a single request. On exit the program writes its global settings, its user settings and the
scene collection it loaded, rotating a backup of that collection. A lane that "wrote
nothing" has still rewritten the owner's files. What it has not written, in the build read
for this subject, is the control port and password it passed at launch. The plugin applies
launch-line values to the session only and keeps them out of what it saves, and has done so
since it first accepted them (source and a measured run, 2026-11-03). The cheap check is
to search the configuration root for the generated password after a graceful exit; do not
assume either answer. Crash markers vary by build. One build writes a per-session marker
into the shared root and reads it at the next start to offer safe mode, so a hard-killed
instance leaves the owner a prompt; the same build writes none for an instance launched as
an additional copy. The restore set is therefore what the program is observed to write, in
the build the lane runs - not what the test means to change, and not what an older build
wrote.

So the order is fixed: record the bytes of every shared file before the first write, run,
stop the instance and **wait for the process to be gone**, then put the recorded bytes
back and check them by hash, and remove the markers that appeared during the run - only
those, found by comparing the marker set before and after. "Restore" means the same bytes, not an equivalent document -
a settings file re-serialised through a parser loses comments, ordering, encoding and the
keys the parser did not know, and the streamer's next launch reads something the lane never
tested. A file that did not exist before the run is deleted after it, because "absent" is a
state the owner had.

The backup is itself a secret. The owner's global settings hold the owner's own control
password, so the copy the lane takes is a copy of that password: it lives outside every
directory the lane publishes from, and it is deleted the moment the restore is verified. On a
failed restore it is kept, because it is the only way back - and that is exactly the case in
which a lane that stored it beside its reports has shipped it.

## A crash is the normal case for a lane that runs at night

A lane that restores in a `finally` block restores on every path but the ones that matter:
the machine sleeps, the runner is killed at a timeout, the power goes, the program hangs and
is terminated hard. So before its first mutation the lane writes a **recovery manifest** to
disk - which files it will touch, where their original bytes are kept, their hashes, the
process it launched - and removes it only after the restore has been verified
(crash-recovery-manifest). Every lane start reads the manifest first. A manifest left behind
means a previous run did not finish; the new run completes that restore, verifies it, and
only then begins its own work. A run that cannot complete the previous restore stops and
reports, because stacking a second run's snapshot on top of a half-restored state records
the damage as the baseline.

## Prove the owner's setup unchanged without reading it

A lane that claims it changed nothing should show it: an inventory of the owner's setup
taken before and after, compared (metadata-only-inventory). The trap is what goes into that
inventory. The owner's scene collection holds source settings, and source settings hold a
browser source's address with its token, a capture device's identifier, sometimes a key
pasted into a text field; the profile holds the streaming service settings, and those can
hold the stream key. An inventory that copies them into a test report has moved the owner's
secrets into an artifact that is uploaded, archived and attached to bug reports.

So the inventory records **shape, not content**: which profiles and scene collections
exist, each file's size and modification time, read from the directory without opening a
single file. A write the lane caused changes a size or a modification time; nothing in that
record says what the streamer keeps inside. The lane's own reserved profile and collection
are left out of both sides, so its own coming and going is not mistaken for a change.
The comparison is the evidence the lane offers, and a lane that skipped the inventory reports that it did not check, not that nothing changed.

## Nothing the lane publishes may carry a key

A test lane is an output factory: logs from the harness and from the program, control
traffic captures, screenshots of the canvas, recordings, failure reports, inventories. The
lane generated a control password for its own instance and may have handled others along
the way, and the program's own log can echo settings it loaded. Before any output leaves
the machine, the lane scans it for the secrets it knows it handled - the literal password
it generated is the best canary there is - and for the shapes of the ones it might have
met (secret-leak-scan-of-outputs). A hit fails the run and quarantines the output; it is
not redacted quietly and shipped, because the next leak will be in a form the redactor
did not anticipate and the scan is the only signal that one occurred. The scan is the
second line; the first is not recording what cannot be scanned. Screenshots of the
software's settings dialogs are not taken at all, the lane captures sources rather than the
desktop, and a test recorder that would film or trace a session token is switched off
rather than trusted to be scrubbed afterwards.

## What a lane proves, and what it cannot

A lane proves the tool against a real instance of the software, in a clean configuration
the lane created. It does not prove the tool against the streamer's scenes, plugins,
capture devices, graphics load or account connection, and it has no streaming platform on
the other side: an instance with a connected account and a live output is precisely what
the lane must never be. Its report says that plainly ("real program, isolated profile, no
platform, no owner scenes") and lists what remains unproven, because a green lane read as
"the stream will work" has been read past what it measured
([_laws: output-never-outruns-evidence_](../../../_laws.md#output-never-outruns-evidence)).

## Where this subject stops

[Broadcast software control](../broadcast-software-control/broadcast-software-control.md)
is the nearest neighbour and the mirror image. It governs a tool talking to the streamer's
real, live instance in production - claiming only what it created, proving removals,
holding the control password as a key to the stream. This subject governs the harness that
tests that tool against an instance it launched and will throw away, and its craft is
keeping the two instances apart. The rule a reader uses: if the instance is one the
streamer goes live from, read control; if it is one a harness started and will stop, read
this - and the harness still never trusts the tool under test to clean up the owner's setup,
because that tool is what is being tested.

[Streamer dress rehearsal](../../trust-and-evaluation/streamer-dress-rehearsal/streamer-dress-rehearsal.md)
is run by the streamer, on purpose, against their own scenes and their own instance, with
a generated chat and no platform session; it exercises the streamer's setup. This lane is
unattended and exercises none of it. When a person is watching the broadcast picture to
see the whole chain fire, it is a rehearsal; when a machine is running assertions at night
and the person must not notice it happened, it is this lane.

[Simulated audience testing](../../trust-and-evaluation/simulated-audience-testing/simulated-audience-testing.md)
builds a synthetic room to score a generated host. It shares the word "test" and nothing
else: the lane has no audience, no judge and no verdict about behaviour, only assertions
about what the tool did to a real program and proof that it did nothing to the owner's.
