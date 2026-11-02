---
layer: technique
type: technique
subject: broadcast-software-control
technique: verify-absence-not-acknowledgement
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [reporting that a tool's overlays or sources were removed, writing the end-of-stream or abort cleanup, a removal request answered success but the source is still on air]
---

# Verify absence, not acknowledgement

When a tool removes objects from the streamer's broadcasting software, the result it reports
is what it observed by reading the software back afterwards - not the status codes the
removal requests returned. "Cleared" means every owned identity was looked for and not
found. Anything less is "unverified", and says which identity and why.

## Why the status is not enough

The control socket's success status means the request was accepted and ran without error.
It is a statement about the request, not about the canvas. Several ordinary situations
separate the two:

- **Removing a placement is not removing the source.** The source survives in every other
  scene that uses it; a tool that placed its overlay in two scenes and removed one placement
  still has an overlay on air in the other.
- **Removing a source may not remove its placements yet.** The protocol documents input
  removal as taking every placement with it immediately. In practice the program can mark the
  input removed and prune its placements only when each scene next renders, and an off-air
  scene may not render until the streamer cuts to it - at which point the "removed" overlay
  appears on stream. Conversely, detaching the last placement can release the input on its
  own, so the input removal that follows answers "not found".
- **Events are not a complete record.** The software announces placement removals, but not
  when the scene that held them was removed; a tool that keeps its view current by listening
  to events misses exactly that case.
- **"Not found" on a removal** usually means the object was already gone, which is the
  outcome wanted - but only when the request was addressed by an identity the tool owns, and
  only on the cleanup path. A "not found" on a request addressed by name proves nothing about
  the object the tool meant, and outside cleanup it is a rejection like any other.
- **Success is two fields, not one.** A response is a success only when its result flag is
  true *and* its status code is the success code; either alone is a rejection.
- **"Not ready, retry"** arrives while the software switches scene collections or shuts
  down, and the object may or may not be removed when it settles.
- **A request that timed out** has an unknown outcome.

## The procedure

1. **Detach placements first, by identity.** For each scene where the ledger records a
   placement, remove the placement whose item identifier matches *and* whose source identity
   matches the ledger's. An item number alone can be reused by the software for a different
   object after the original is gone; the pair cannot.
2. **Remove the input by identity.** Never by name.
3. **Read the inventory back**: the input list, and the item list of every scene the tool
   placed into. Do not rely on events received in the meantime. Poll on a short interval
   within a bounded window of a few seconds, because the program's own lists can update a
   beat after the acknowledgement.
4. **Classify each owned identity**: absent (verified), present (removal failed - say which
   step), or unknown (a read failed or timed out). Only the first may be counted as cleared.
5. **Report the aggregate honestly.** All absent: cleared. Any present or unknown: not
   cleared, with the list. The count of removed objects includes only those observed present
   before the removal; an object that was already gone is retired from the ledger but adds
   nothing. The streamer goes live on the word "cleared".
6. **Update the ledger from the observation**, not from the requests: an entry is retired
   when its absence was seen, and persisted after each retirement so an interrupted cleanup
   resumes where it stopped.
7. **Scenes last.** Only after the tool's inputs are gone does it consider the scenes it
   created, and it removes one only when a read shows it empty. The emptiness read and the
   removal are separate requests, so a source the streamer adds in between can still be
   caught; say so where the streamer is told cleanup is running.

## Decision rules

- **When the read-back itself fails**, the result is unverified, not cleared and not failed.
  Retry the read, never the removal.
- **When an owned object is present after a successful removal**, do not loop on the remove.
  Report it, keep the entry, and let the next pass - or the streamer - resolve it.
- **When the cleanup runs on an abort path** (the tool is crashing, the streamer hit an
  emergency stop), the same verification runs with a short budget, and an exhausted budget
  produces "unverified" on screen rather than a silent exit.
- **When removing from a scene the streamer owns**, verify only the tool's placements are
  gone; the scene itself staying is the correct outcome.
- **When a placement matches by item number but not by source identity**, leave it. The
  streamer may have deleted the tool's source and placed one of their own that received the
  same name and the same item number; only the pair authorises removal.
- **When writing the test double for the software**, make it retain placements after an
  input removal until they are explicitly detached. A fake that deletes everything
  synchronously is kinder than the real program and passes exactly the cleanup this
  technique exists to forbid.
- **Never switch the program scene to force a render.** Cutting to an off-air scene so the
  program prunes it would put the tool's half-removed objects on stream; explicit detachment
  removes the dependency on rendering altogether.

## When not to use it

A removal the tool does not report to anyone and that nothing downstream depends on - a
temporary probe source deleted a second after it was made, inside a session that verifies the
full inventory at the end anyway - can skip its own read-back. The rule binds at every point
where a person or another step will act on the claim that something is gone.
