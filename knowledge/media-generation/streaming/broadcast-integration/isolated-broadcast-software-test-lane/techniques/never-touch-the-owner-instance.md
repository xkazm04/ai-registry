---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: never-touch-the-owner-instance
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a test needs the real broadcasting software on a machine where the streamer also runs it, deciding what a harness does when the owner's instance is already running, tearing down the instance a test run launched]
---

# Never touch the owner instance

The harness launches its own instance of the broadcasting software, talks only to that
instance, and stops only that instance. The owner's running instance - and the owner's
instance that is not running yet but will be tonight - is outside the harness's reach by
construction, not by care.

## The three doors to close

**Connection.** The harness never connects to an address and port it did not choose for an
instance it did not start. The default control port is the owner's; so is any port read from
the owner's settings. A harness that "finds" the software by probing the usual port will
find the streamer's live session the first time it runs on their machine. Before launching,
the harness checks that the port it picked is free; if something already listens there,
that is somebody else's instance, and the harness picks another port or stops - it never
connects "to see whose it is", because the handshake itself, with a wrong password, is an
event the owner's instance logs and may show.

**Identity.** The harness knows its own instance by two facts: the process it spawned (it
holds the handle, not a name looked up later) and a handshake on its own port that succeeds
with the password it generated for this run. A peer that answers the port but refuses that
password is not the harness's instance, whatever its process is called. An instance found by
process name is never the harness's, because the owner's has the same name.

**Termination.** The harness stops the process it spawned, by that handle, and waits for it to
exit. It never kills processes by name, never "cleans up stray instances", never closes a
window it did not open. A hung instance of its own is terminated hard only after a graceful
stop had its chance, because a hard kill skips the program's write-back - which is sometimes
exactly what the harness wants and sometimes a corrupt file; the restore in the recovery
manifest covers both.

**The code under test.** The tool being tested has its own ways to reach the software: a
remembered endpoint, a credential in the operating system's secret store, a switch that
turns on its live integration. The harness starts the tool with all of those removed - live
switches stripped from the child's environment, the secret store not consulted, the
endpoint and password handed in for this run only - so the tool cannot find the owner's
instance even if a test or a bug tells it to look. A harness that isolates its own
connection and lets the tool keep its production one has isolated the wrong process.

## When the owner's instance is running

Some builds of the software warn or refuse when a second copy starts, and some share state
between copies - a single-instance lock, a shared global configuration, a shared plugin
cache, a virtual camera only one copy can hold. The harness detects the owner's instance
before launching and decides by rule:

- **If a second copy can run with a separate configuration root**, run it; the owner's
  instance is unaffected.
- **If a second copy would share configuration with the owner's running instance**, do not
  launch. A running instance writes its in-memory settings back on exit, so the owner closing
  their software during or after the test overwrites whatever the harness restored, or the
  harness's restore overwrites a change the owner just made. Two writers, one file, no lock.
- **If the owner's instance is not running and configuration is shared**, the harness may run
  only with the full restore discipline, and it re-checks before each write that the owner has
  not started the software in the meantime.

In every refusal the result is **skipped**, with the reason, never passed. A lane whose real
tests silently skipped for a week because the streamer left the software open has reported
green on nothing.

## Never ask the owner to get out of the way

A harness that closes the owner's software, or prompts them to, has moved its problem onto the
person it exists to protect - and an overnight run has nobody to ask. It does not suppress the
software's own "another instance is running" or "the program did not shut down properly"
dialogs on the owner's instance either; those belong to the owner. Suppressing them on the
harness's own instance, through the launch options the software provides, is legitimate and
usually necessary for an unattended run: a safe-mode prompt after an unclean exit or a
first-run configuration wizard on a fresh profile will sit in the instance's window with
nobody to click it, while the control socket accepts connections and answers "not ready".
The instance is ready when a real request succeeds, not when its port opens.

## Decision rules

- **When a port is in use**, it is not yours; choose another or stop.
- **When an instance is identified by name**, it is not yours.
- **When the harness cannot prove the instance it is about to stop is the one it started**,
  it does not stop it; it reports a leaked instance instead. This bites hardest in crash
  recovery, where all a later run has is a process identifier written down by a run that
  died: the operating system reuses identifiers, and after a reboot that number may belong to
  the owner's instance.
- **When the platform account is connected in the instance the harness reached**, stop at
  once: that is an owner's instance, or a configuration the harness must never have.

## When not to use it

On a dedicated test machine or a disposable virtual machine where no owner's setup exists,
the separation is free and the checks are cheap insurance rather than load-bearing; keep them,
because the same harness will one day run on a laptop.
