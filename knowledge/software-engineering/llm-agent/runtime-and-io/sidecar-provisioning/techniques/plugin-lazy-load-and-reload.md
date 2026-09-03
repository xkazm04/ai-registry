---
layer: technique
type: technique
subject: sidecar-provisioning
technique: plugin-lazy-load-and-reload
status: forged
laws: [failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [a host mounts many instances of out-of-process plugins, deciding when a plugin process is spawned and when it is shared, a plugin process died under a live request, a plugin upgrade changed what a mounted instance can do]
---

# Plugin lazy load and reload

A sidecar that exists to extend the host — a plugin, dispensed by a
catalog and mounted many times over — differs from a sidecar that exists
to hold one engine in one place. The host must answer questions *about*
it long before it needs it to *do* anything, it will be mounted dozens of
times with small differences in configuration, and it will die under
load on someone else's machine. This technique owns the three answers
that follow: dispense in **metadata mode** first and load fully on the
first real request; on a **shutdown error** from the process, restart it
and re-verify its shape before serving again; and share one process
between mounts only when the **whole runner configuration** is identical.
[process-isolation](./process-isolation.md) decided that the plugin runs
out of process and designed the seam; this technique decides when a
process behind that seam exists and when two seams may share one.

## Metadata mode: answer the cheap questions without a running plugin

When the host mounts a plugin it needs the plugin's *shape* — what kind
of component it is, which of its paths are special (unauthenticated,
local-only, root-protected) — before it can route a single request.
Booting the plugin fully to learn this has a cost the host pays at every
mount, and a host with hundreds of mounts pays it hundreds of times at
startup, serially, on the one path where nothing is yet serving. It also
puts the mount at the mercy of the plugin's own initialization: a plugin
whose backing service is unreachable at boot would block or fail the
mount of everything behind it.

The rule: **when the host mounts a plugin, dispense it in metadata mode —
a run that returns only the type and the special-path lists and never
initializes the plugin's real state — and defer the full load to the
first request that needs it.** The metadata run answers the routing
questions, is cheap enough to run per mount at startup, and cannot fail
for reasons that belong to the plugin's backing service. The plugin
process itself is spawned lazily, on the first request, behind a lock so
that concurrent first requests produce one process rather than a race of
spawns — the same in-flight guard
[atomic-downloads](./atomic-downloads.md) holds around a transfer, held
here around a spawn. A metadata-mode result and a fully-loaded result are
different states and the host records which one it holds; a metadata
answer standing in for a loaded plugin is the empty-success shape
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
forbids, because it looks mounted and serves nothing.

The naive reading loads everything at boot because "then it is ready".
The failure mode is a host that cannot start when any plugin cannot, and
a startup time that grows with the mount count rather than with what is
actually used.

## Reload on shutdown error, then re-verify the shape

An out-of-process plugin dies: a crash in its native code, a resource
limit, an operator killing a stray process, a reload that replaced its
binary. The host observes this as a specific error class from the
transport — the process is gone, not the request refused — and it must
not surface that as the request's failure, because the fix is entirely
the host's to apply.

The rule: **when a request fails with the shutdown class, restart the
plugin process and re-run the metadata check before retrying: the type
and the special-path lists must equal what the mount was routed with; if
they differ, refuse to serve rather than serve the wrong shape.** The
re-check earns its place because the binary behind the mount can change
between the death and the restart — an upgrade that changed the plugin's
type, or moved a path from unauthenticated to authenticated. Serving a
request routed under the old special-path lists through a plugin that
declares new ones is a policy bypass with a legitimate-looking log line;
the shape check is the handshake
[process-isolation](./process-isolation.md) requires, run again at the
only moment it can silently go stale. Whether the retry happens once or
not at all after the reload is the host's declared policy, not the
request's luck. And the reload is guarded by a generation marker: every
request in flight when the process died sees the same shutdown error,
and only the first to take the lock restarts the process — the others
observe that the generation moved and retry against the new one. Without
the marker, N concurrent failures produce N restarts of a process that
was healthy after the first.

The naive reading treats the process as a black box that either answers
or errors, and a crashed plugin becomes a stream of failed requests until
someone restarts the host. The stricter naive reading restarts but skips
the re-check, and is correct exactly until the first upgrade.

Two constraints on the plugin's own side make the reload honest. The
plugin must never bring the host down: a panic inside the plugin process
terminates the plugin, and the host sees an exited process — the
containment [process-isolation](./process-isolation.md) bought is only
real if the host's transport layer treats that exit as an event and not
as a fatal condition. And the handshake that gates the connection — a
protocol version and a shared magic value the plugin must present — is a
**user-experience feature, not a security boundary**: it turns "I ran the
wrong binary" into a message that names the mistake, and it does nothing
against a binary that presents the right values on purpose. Trust in the
binary is decided elsewhere
([split-trust-by-registration-path](./split-trust-by-registration-path.md));
a host that counts the handshake as its trust check has no trust check.

## The multiplexing key is the full configuration

A host that mounts the same plugin ten times should not run ten
processes when one would do — a process per mount multiplies memory,
file descriptors, and connection pools against the backing service by
the mount count. Multiplexing lets a single process serve many mounts,
each addressed by an identifier the host stamps on every call. The
question is which mounts may share.

The rule: **key the shared process on the whole runner configuration —
binary identity, version, arguments, environment, digest — and let two
mounts share a process only when every field is equal; anything looser
shares a process between plugins that are not the same plugin.** Two
mounts named identically but pinned to different versions, or handed
different environments, are different runners, and a key built from the
name alone collapses them into whichever one spawned first. The identity
of a shared process is its configuration, not its label
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)),
and the reference count that keeps the process alive counts mounts that
hold that exact key; the last one to unmount is its reaper. A plugin that
does not declare itself multiplexable is not shared at all — sharing is
opt-in on the plugin's side, because a plugin written with process-global
state will serve one mount's state to another.

The naive reading keys on the plugin name because that is what the
operator sees. The failure mode is an upgrade of one mount that silently
upgrades every mount sharing the name, or a mount whose environment
carries a credential that another mount's process now holds.

## When this does not apply

A sidecar with one consumer and one configuration — the archetypal
inference engine — gains nothing from metadata mode or multiplexing, and
its restart policy is the ordinary one
[subprocess-lifecycle](../../subprocess-lifecycle/subprocess-lifecycle.md)
already owns. The restart mechanics themselves — the spawn door, the
termination ladder, the orphan sweep, how long a dead process's slot is
held — stay in that subject at every scale; this technique owns only what
the host must re-establish about the plugin before it serves through it
again, and which key decides that two mounts hold the same process.
