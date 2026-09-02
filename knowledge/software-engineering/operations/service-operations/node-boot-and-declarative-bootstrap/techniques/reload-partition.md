---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: reload-partition
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [deciding whether a configuration key is reloadable, an operator sent a reload signal and the change did not take effect, log rotation depends on a reload that also re-parses configuration, a reload reported success while the node kept an old value]
---

# Reload partition

A running node's configuration keys divide into two sets, and the division is a property of
what each value is *held by* at runtime, not of how important it is. This technique declares
the partition once, makes a reload apply exactly the reloadable set, makes it report the rest
honestly, and separates the reload functions that must always run from the ones that need a
parsed file.

## The partition rule

**A key is reloadable when its new value can replace the old without invalidating any state
currently in flight.** A certificate and key pair is reloadable: a live listener can swap the
chain it presents so that established connections keep the handshake they negotiated and new
connections get the new one, and nothing that was true a moment ago becomes false. A log
level is reloadable: the logger reads it per call. A file sink is reloadable: closing and
reopening a rotated file loses nothing that a buffered write has not already lost. A rate
limit, a timeout default, a list of allowed origins — reloadable, because a request in
flight either finishes under the old value or the new one and both are legal.

**A key is restart-only when something holds it.** A storage path or address is held by an
open handle and, in a clustered node, by peers that connected to it. A cluster listener bind
is held by a socket and by the quorum that knows it. A seal configuration is held by a
decrypted keyring — changing which mechanism unwraps the root key is a migration, not a
reload. A plugin directory is held by every running plugin process that was found there.
The test is mechanical: if applying the new value requires closing, releasing or re-deriving
something that other components currently reference, the value is restart-only, and
"reloading" it is a restart with a misleading name.

The naive reading treats the file as the unit: re-read everything, apply what the code can
apply, keep the rest. Its failure mode is the reload that succeeds and changes nothing the
operator wanted — the log line says *configuration reloaded*, the storage address in the
file is new, and the node is still talking to the old store, because nothing closed the
handle. The operator now believes a value the node does not run on.

## The partition is declared once

The set of reloadable keys is a closed vocabulary with one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)): each key's
definition carries its class, the reload handler derives its behaviour from the class, and
the documentation is generated from the same table. Two lists — one in the reload code, one
in the operator guide — diverge at the key added last. The rule: **when a key is added, its
reload class is chosen at definition, and choosing it is the review.**

A reload then does three things and reports each separately. It applies every reloadable key
whose value changed and names them. It lists every restart-only key whose value changed and
reports them as *ignored — restart required*, never as applied and never silently. And it
reports every reloadable key whose application failed — a certificate file that does not
exist, a log level that is not a member of the enum — as a failure of that key, leaving the
old value in force. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) a reload that
changed nothing and a reload that could not read the file are different outcomes and print
differently; "reloaded" with no list of what changed is the empty success this law forbids.

## A bad file still runs the safe functions

The reload signal carries two unrelated duties in most deployments: apply a changed
configuration, and reopen file sinks after rotation. The second is sent by a rotation hook at
an hour when nobody has touched the configuration file, and it must not fail because the
file happens to be mid-edit or was left syntactically broken by the last change. The rule:
**a reload whose configuration fails to parse logs the parse error, keeps the running
configuration, and still runs every reload function that does not need the new file** —
sink reopening first among them. The reload functions are therefore split at registration:
those that take the parsed configuration as input, and those that take nothing. The naive
reading, "abort the reload on a parse error", leaves the node writing to a rotated-away
file descriptor — the audit sink appears to work and its output goes to a file nothing will
ever read.

A reload is bracketed for the supervisor the way a start is: the node announces *reloading*
to whatever process manager watches it before the first function runs and *ready* after the
last, so that a reload that hangs on a slow sink reopen is observable as a reload in
progress rather than as a node that is silently both old and new.

The same split answers a subtler case: a reloadable key whose *new* value fails validation.
The key keeps its old value, the failure is reported against that key, and every other
reloadable key that validated is still applied. Reload is per key, not all-or-nothing,
because all-or-nothing means one typo in a rate limit blocks a certificate rotation that is
about to expire.

## Values with a held copy

Some reloadable-looking keys are secretly held. A static key read from the environment and
used to construct the sealing boundary is not re-read on reload, because the boundary is
constructed once and holds it; the honest classification is restart-only, and the
documentation says so, even though "it is just an environment variable" makes it look
reloadable. A cluster's own advertised address is held by every peer. The decision rule when
a key is ambiguous: **classify by what holds it, not by where it is read from**, and when in
doubt choose restart-only, because the cost of an unnecessary restart is a restart and the
cost of an unhonoured reload is a node running on a configuration nobody can see.

## When not to use this

A process that restarts in under a second with no in-flight state has no reload problem: the
partition is "everything is restart-only" and a reload signal is a restart. The technique
earns its place when a restart has a cost that a reload avoids — an unseal ceremony, a
cluster re-join, a warm cache, established client connections — because that is when
operators will send the signal and believe what it says.
