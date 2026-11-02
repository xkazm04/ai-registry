---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: secret-leak-scan-of-outputs
status: forged
laws: []
shared_with: []
use_when: [publishing logs, reports, captures or screenshots from a run that drove the broadcasting software, a test harness handled a control password or read settings that may hold a stream key]
---

# Secret-leak scan of outputs

Every output of a run that drove the broadcasting software - harness logs, the program's
own log, control-socket traces, test reports, inventories, screenshots and recordings - is
scanned for secrets before it leaves the machine. A hit fails the run and holds the output
back. The scan is a gate, not a filter.

## What the run handled

A lane touches more secrets than its authors think. It generated a control password for its
own instance, and that password sits on a launch line, in a settings file, in the handshake
code's memory and in any trace that logs requests too eagerly. It may have read the owner's
global settings, which hold the owner's control password if the owner set one. The program's
own log records loaded settings and plugin messages and occasionally the address of a
browser source with its token. A profile the harness copied may carry a stream key. A
screenshot of the canvas can show whatever the owner's capture sources point at; a
screenshot of a settings dialog shows the fields.

## Procedure

1. **Collect outputs into one place before publication.** Nothing is uploaded from where it
   was written; the publish step reads only from the collection directory, so the scan has
   one door to guard.
2. **Scan for known literals first.** The run knows its own password: search every text
   output for it, and for its common encodings (the encoded form a launch line or a
   configuration file might use). This canary is the most reliable check available,
   because it has no false negatives for the secret most likely to leak.
3. **Scan for shapes.** Stream-key shapes, bearer and access-token shapes, query parameters
   named like keys or tokens in any address, private-key blocks, and the password fields of
   the software's own settings format.
4. **Treat images and recordings as outputs.** A text scan cannot read a screenshot, a
   video or a binary trace archive. The rule there is upstream: the harness captures
   individual sources or a window it created, never a settings dialog and never the whole
   desktop; a capture of a source that could show the owner's screen or camera is kept
   local; and a test recorder that would film or trace a page holding a session token is
   turned off for the run rather than scrubbed after it.
5. **Scan for the owner's secrets too, by location.** The lane's backup of the shared
   settings holds the owner's control password. The scan cannot search for a secret it
   does not know, so the rule is structural: no backup, manifest or copy of the owner's
   configuration may sit anywhere under the collection directory, and the scan fails the
   run if one does.
6. **On a hit, fail and quarantine.** The run is red, the offending file stays on the
   machine, and the report names the file and the rule that matched - never the matched
   text.

## Why not redact

Redacting the hit and publishing the rest is the obvious kindness and the wrong default. A
redactor fixes the form it found; a leak is evidence that some code path writes secrets to
output, and the next path writes them in another form - percent-encoded, split across lines,
inside a structured log field. A red run gets the path fixed. A quiet redaction hides that
the path exists. Where redaction is genuinely needed - a log a person must read to debug - it
happens locally, to a copy, after the run has already been marked failed.

## Decision rules

- **When the scanner itself errors on a file**, the file is unscanned, and an unscanned file
  is not published.
- **When a test needs to assert on a secret** (the password was applied), assert in memory
  and log the boolean.
- **When the program's log is too noisy to scan reliably**, keep it local and publish a
  harness-written summary instead.

## When not to use it

Outputs that never leave the machine and are deleted with the run still benefit from the
canary as a test of the harness's logging, but the gate's failure mode can be a warning there.
