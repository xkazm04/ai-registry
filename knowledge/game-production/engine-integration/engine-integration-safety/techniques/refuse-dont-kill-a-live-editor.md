---
layer: technique
type: technique
subject: engine-integration-safety
technique: refuse-dont-kill-a-live-editor
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a precondition blocks an automated run, a tool wants to close or restart something to proceed, writing the refusal path of a driver]
---

# Refuse, don't kill a live editor

The concern: what an automated tool does when the workspace it wants is already occupied
by a human. The answer is that it stops and says so, in enough detail that the human can
resolve it in one move — and that it never resolves the situation itself by ending someone
else's session.

The temptation is strong precisely because clearing the way *works*. The run proceeds. The
build goes green. The damage is invisible from inside the tool, which is why this rule has
to be a rule and not a judgement call: the tool cannot see what was unsaved, so it cannot
weigh the cost of what it is about to destroy.

## Procedure

**1. Probe read-only, before anything is launched.** Enumerate the blockers with a
listing operation that has no write capability at all — a process listing, a lock-file
read, a status query. If the listing utility itself is unavailable (wrong platform, tool
absent), report *probe unavailable* in the run record and continue; an undetectable blocker
must not become a silent excuse to proceed quietly, but it must not permanently block a
platform where the probe does not exist either.

**2. Keep the probe's argument shape incapable of destruction.** Where the platform's
listing and killing tools are close cousins, the argument builder for the probe is the only
place in the subsystem allowed to name a target by class, and it names it to *read*. Make
that a testable property: a unit test asserts that no command this subsystem issues names
a class where a destructive verb is involved. A law that only lives in a comment drifts;
a law with a test attached does not.

**3. Return a named refusal, not an error.** The result type carries a distinct
`refused-precondition` outcome alongside pass, fail and unknown. Nothing downstream may
read it as a verdict about the work, because no work ran.

**4. Write the message for the person who has to fix it.** Four parts, in order: what was
found, with the identifying detail needed to locate it; why it blocks (the application is
not re-entrant on one workspace); why the tool will not clear it (it did not start that
session and will not end it); what the human can do — close it and re-run, wait, or
override.

**5. Classify each guard as overridable or not, and say which.** An overridable guard is
one where an informed human may legitimately want the risky outcome; expose the override at
the point of decision with its consequence written next to it, not buried in documentation.
A non-overridable guard is one that encodes a fact about machine state inside your own
process — a held lease, an in-flight run of your own — where stepping over it is not a
risk the human is accepting but a race they cannot win. Do not offer an override for those.

**6. Record the refusal in the same place a result would go.** A refusal that vanishes
from the run history teaches nobody. It should appear as a run that happened and concluded
without measuring anything.

## Decision rules

- If the blocker is a process, session or file you did not create, refuse. No exceptions
  for "it looks idle", "it's probably a leftover", or "the user asked for the run".
- If you can only identify the blocker by class, you may report it and refuse; you may
  never act on it. Identification by class is not identification.
- If the blocker is a resource you yourself hold or your own subsystem holds, refuse and
  make it non-overridable — a human cannot consent their way out of a data race.
- If a probe cannot run, record *unknown*, proceed, and expect the downstream launch to
  fail honestly. Do not let an absent probe read as *clear*.
- If a human overrides and the run then fails obscurely, that is a correct outcome: the
  consequence was stated, the human chose it, and their own session survived either way.
- If the same refusal fires repeatedly for the same operator, that is a product signal —
  queue the work behind the blocker instead of refusing it, which is the lease technique's
  job. It is never a signal to start killing.

## When not to use this

**Processes you spawned yourself** are not covered by this technique at all; ending them is
the teardown technique's job and is not merely permitted but required.

**Genuinely disposable, ephemeral environments** — a fresh container, a scratch VM, a
throwaway workspace with no interactive user and nothing unsaved — do not need the refusal
posture, and forcing it there just adds friction. The test is not "is it a server"; it is
"could a human lose unsaved work, or could a concurrent run be misdiagnosed, if I clear
this?" Where either answer is yes, refuse.

**A supervised recovery tool whose entire purpose is to clear stuck state** is a legitimate
exception, on two conditions: it is invoked explicitly by a human for that purpose, and it
is not reachable from any automated path. The failure mode this technique prevents is
cleanup happening as an incidental side effect of doing something else.
