---
layer: technique
type: technique
subject: agent-session-archive
technique: root-relative-session-identity
status: forged
laws: []
shared_with: []
use_when: [choosing the unique key for archived sessions, the archive shows the same session twice or two sessions as one, a harness moved its transcript layout, merging session history from several machines]
---

# Root-relative session identity

An archived session is identified by three things: the **origin** machine it
was captured from, the **harness** that wrote it, and the source's **path
relative to the harness's own store root**. That key is computed at one
chokepoint that every ingest path calls. Sessions are never merged on a native
session id or a file name, and a move of the harness's store is honoured only
with a proof.

## Why the obvious keys fail

Each obvious key has a field failure behind it.

- **The path the scanner saw.** A watcher that roots a file at the harness's
  store and a full rebuild that roots it one directory higher produce two
  different keys for one file. Whichever path runs second inserts a duplicate,
  and the duplicates accumulate as fast as the watcher fires.
- **The native session id.** Harnesses reuse ids across workspaces, regenerate
  them on fork, and keep them when they reorganise their own layout, so the
  same id names two different sessions in one case and one session under two
  roots in another. A native id is a claim the harness makes for its own
  purposes; it was never a promise to an archive.
- **The file name.** Two projects with identically named session files
  collide, and one history silently absorbs the other.
- **Any key without the origin.** Two machines running the same harness share
  relative paths by construction. Without the machine in the key, pulling a
  second machine's history merges every coincident path into the first's.

Duplicates are the visible half of identity failure, and they are the cheaper
half: a duplicate inflates counts and is found by the first person who looks.
A false merge is quiet. Two sessions under one key means one of them has
overwritten or interleaved with the other, and no later query can separate
them.

## Construction

1. **Root at the harness's store, not at the scan.** Strip the harness's own
   store root from the path, whatever directory the scan was started from.
   Where a harness has several store roots (a default location, a redirected
   one, a desktop variant), each is a declared root, and the relative path is
   taken against the root that contains the file.
2. **One function, every door.** Watcher, rebuild, remote pull and manual
   import all call the same canonicalisation, applied after parsing and before
   the store. Two implementations of "the same" rule produce two keys on the
   first input they disagree about, and the disagreement is found as
   duplicates months later.
3. **Origin in the key, from the capture.** A remote machine's sessions arrive
   in their own namespace and carry their origin from capture onward. When a
   remote workspace path is rewritten to a local equivalent so filters work
   across machines, the original value is kept in metadata; the rewrite serves
   display and filtering, never identity.
4. **Fold the workspace in where the harness's own id is workspace-local.** If
   a harness names sessions uniquely only within a project, the project is part
   of the relative path or is folded into the id deterministically, so two
   projects can never collide.
5. **Enforce it in the schema.** The store's uniqueness constraint is the full
   key. A constraint narrower than the key, such as harness plus relative path
   without the origin, turns the first second machine into a merge.

## A move needs a proof

Harnesses reorganise their stores: flat folders become dated ones, a project
directory is renamed, a user restores from backup into a new location. The
same session now has a new relative path, and the archive must choose between
a duplicate and a merge. Choose the duplicate by default. It is visible and
reversible; a wrong merge is neither. Honour a move only through an explicit
migration that proves continuity: the same origin and harness, native metadata
that agrees, and the old capture's bytes as a verified prefix of the new
file's. Record the proof as a durable receipt before the old identity is
delivered under the new path, so a retry after a partial ingest stays safe.
Conflicting metadata, a divergent history, a missing capture or an ambiguous
owner are errors to investigate, never permission to merge.

## Identity is not the row id

The archive's internal row ids are allocation, not identity. A full rebuild
reallocates them, and a store that reuses freed ids hands an old id to a new
message. Anything that must survive a rebuild, from a citation to a derived
embedding, binds to the natural key above, never to the row id; see
[declared-message-coordinates](./declared-message-coordinates.md).

The sibling technique
[deterministic-span-derived-ids](../../multi-provider-event-normalization/techniques/deterministic-span-derived-ids.md)
makes redelivery idempotent by deriving identity from the sender's own ids. It
assumes those ids are stable. Here they are not, because the sender's storage
moves under the archive, which is why identity is derived from where the bytes
live relative to the sender's root and not from what the sender calls them.

## When not to use it

An archive of one harness on one machine, whose layout has never moved, can
key on the absolute path and lose little. It stops being enough on the first
second machine, the first layout change, or the first restored backup, and
re-keying a populated archive is a migration; choose the full key at the start
if any of those is plausible. Native ids remain useful as a hint for
detecting a candidate move, which the proof then confirms or refuses.
