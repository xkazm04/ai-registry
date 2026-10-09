---
layer: application
type: application
subject: lan-pairing-and-session-continuity
technique: port-preflight-with-reuseaddress
stack: node
status: forged
verified_on: 2026-10-09
verified_against: node@24
applied: simulation
ab_verdict: unmeasurable
---

# Two local node hosts that skip the probe and walk the port

This page shows the technique's alternative branch: no preflight, the real bind as the test,
and a walk to the next free port. Two node programs in the fleet take that shape, written
independently of each other and of the racing host in the kotlin applications.

Neither is a couch game. Both listen on the loopback address for a browser or a tool on the
same machine, not on a room's network. They earn a place here because they show the
condition under which the alternative is right, and that condition is exactly what a couch
host does not meet. Citations resolve against `kp` at `a5eec1bfb` (branch `main`, node
`>=24 <25` in its manifest) and `personas` at `142fdff211` (branch `master`, node 22 in its
version file), read 2026-10-09.

## The installer wizard: bind, walk, print what was bound

The wizard's listener tries its base port and, on a busy port, the next one, up to ten
times:
`scripts/onboard-ui/server.mjs:463 "attempt < 10) return listen(port + 1, attempt + 1);"`.
There is no probe. The `listen` call is the test, and its error event is the branch.

Clients learn the port only from what the wizard prints and opens. The address is built from
the port actually bound, together with a credential minted fresh for this process:
`scripts/onboard-ui/server.mjs:468 "http://127.0.0.1:${port}/?t=${TOKEN}"`
and `scripts/onboard-ui/server.mjs:59 "const TOKEN = randomBytes(24).toString("hex");"`.
The server also reports its own bound port, so that a page never guesses it:
`scripts/onboard-ui/server.mjs:152 "The port this process actually bound (the listener retries on EADDRINUSE)."`.
The protocol document makes that a rule for every client:
`scripts/onboard-ui/PROTOCOL.md:764 "EADDRINUSE"`, followed by "a face must not guess it".

After the cap the process exits with the error on the terminal, at line 465. For a command
someone has just typed and is watching, that is the readable terminal state. A television
app cannot use it, which is why the technique says not to exit.

## The gate daemon: scan a fixed range, publish a handshake

The daemon scans a sixteen-port range and resolves with the port it bound. Busy and
forbidden ports are both treated as "try the next":
`scripts/gate/daemon.mjs:453 "if (e.code === 'EADDRINUSE' || e.code === 'EACCES') resolve(listenScan(port + 1));"`.
Running out of the range is a stated error, not a crash:
`scripts/gate/daemon.mjs:448 "no free port in ${PORT_RANGE[0]}..${PORT_RANGE[1]}"`.

Clients find it through a handshake file that carries the bound port, a fresh token and the
process id:
`scripts/gate/daemon.mjs:498 "const port = await listenScan(PORT_RANGE[0]);"`,
followed by `writeHandshake` at line 499. That file is written to a temporary name and
renamed into place:
`scripts/gate/handshake.mjs:32 "fs.renameSync(tmp, handshakePath());"`.

## Why the walk is right here and wrong for a couch host

Both programs meet the condition in the technique's decision rule:
- clients learn the port only from the host's own advertisement;
- the credential is minted per process;
- nothing a client keeps outlives the process.

A walk therefore costs nothing. The next run advertises a new port and a new credential
together.

The racing host in this subject's kotlin applications fails that condition. A phone keeps
its seat token in browser storage keyed by the page's origin, and the origin includes the
port. A walk at resume would orphan every seat. So the couch host keeps its probe and retry,
and holds one port.

## What the probe would add, measured

On the Windows machine these programs run on, Node 24's `listen` refused a port held by a
live listener (`EADDRINUSE`). It bound a port that carried a host-side wait state from a
connection the server had closed first (measured 2026-10-09, one run per case, with the
wait-state row confirmed by `netstat`). On that machine a probe could only ever repeat what
the real `listen` already reports.

Node exposes no reuse flag on its TCP listener. Its networking library sets the flag on
every TCP bind on Unix-like systems. On Windows it sets neither the reuse nor the exclusive
option, because there the reuse flag would let another process take a port in use. Both
facts come from the library's source, read by this run's research lane on 2026-10-09; they
are not quoted here and were not measured on Linux for Node.

## Evidence grade

- **Read from the code:** both walks and both advertisements.
- **Measured on 2026-10-09 outside either project:** the Windows bind outcomes.
- **Not done:** no run of either program was made with its base port taken. That the wizard
  lands on the next port and prints it is read, not observed. Neither project has a test of
  its walk.
