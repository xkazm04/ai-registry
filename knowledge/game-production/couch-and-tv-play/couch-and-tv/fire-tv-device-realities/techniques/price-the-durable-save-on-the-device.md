---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: price-the-durable-save-on-the-device
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a save that must survive power loss runs on the thread that draws frames, slow frames line up with a purchase a race result or a settings change, someone proposes moving a save that holds money or progress to a background thread]
---

# Price the durable save on the device

## The concern

A stick can lose power with no warning to the game: it is unplugged, or its power comes from a
television port that switches off with the set. A save that is meant to survive that has to be
durable, and the careful sequence is well known: encode the state, decode it back to verify it,
write it to a temporary file, flush that file to storage, verify the previous save and keep it as a
backup — setting a corrupt one aside rather than backing it up — and replace the old file by an
atomic rename. Every step is right, and several of them touch storage. A single flush on phone-class
flash is often about a millisecond at the median, but its tail runs tens of times longer, set by
whatever else is writing at that moment; a sequence of reads, writes, a flush and a copy on the
cheapest flash in a stick adds up to tens or hundreds of milliseconds per save, where a desktop drive
absorbs it almost unnoticed. Run on the thread that draws frames, one save is a run of dropped frames,
and the frame that drops is the one where something happened — a race won, a car bought, a setting
changed. A desktop profile shows nothing, because the desktop does not pay the cost.

This technique does not say where the save should run. It says that the cost is measured on the
device and set beside the alternatives before anyone moves it, because the save that costs frames is
usually the one that carries what the player earned or paid for.

## Procedure

1. **Time every step of one save on the device.** Encode, verify, write, flush, backup, rename, each
   timed, per save, over a stated number of saves, in a stated phase of play. The flush and the
   rename are storage costs; the encode and the verify are processor costs; they move with different
   remedies ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
2. **Name the thread, the moment and what waits on the save.** Which thread runs the save, which
   events trigger it — the end of a race, a purchase, a change of setting, a periodic autosave — and
   whether the change it records is applied only once the save has succeeded. A save that gates its
   change, so that a failed write cancels the change and tells the player, is a stronger contract than
   one that records a change already made, and every alternative below has to say what it does to
   that contract. A save at a results screen is covered by a transition; the same save in the middle
   of a race, or inside the simulation step, is not.
3. **Count saves per session.** A sequence that saves on every change of every field pays the flush
   per field; the count decides whether the cost is an occasional hitch or a recurring one.
4. **Lay out the alternatives with what each one risks.** Five are on offer, and none is free.
   - *Keep it synchronous and move the moment.* Save only at a phase boundary where a cue covers the
     stall. Durability is unchanged; the cost is that state changed during play is not durable until
     the boundary.
   - *Write on one serial worker while the transition waits for it.* The render thread hands over a
     copy of the state and keeps presenting the transition until the worker reports the save durable,
     then applies the change. The gate is kept and the frame is spared; the transition lasts as long as
     the save, and a second change to the same state must queue behind the first.
   - *Snapshot on the render thread, write on one serial worker, and carry on.* The render thread
     copies the state cheaply and returns; one worker encodes, writes and flushes in submission order.
     The frame is spared; a window opens between telling the player something happened and the record
     of it being durable, and a write that fails can no longer cancel a change the player has already
     been shown. The window's risk depends on where the data is: still inside the process, a killed
     process loses it; handed to the operating system but not flushed, only a power cut or a system
     crash does. Platform write-behind helpers may also wait for pending writes at the next pause, so
     the cost reappears at a lifecycle boundary rather than vanishing.
   - *Make each save cheaper.* Drop the verify read-back, drop the backup copy, flush once for several
     changes. Each removal is a protection given up — against a corrupt encode, against a torn file,
     against a lost update — though not all of them are equally standard: a widely used platform helper
     for atomic files writes, flushes and renames with no backup copy at all, so the backup is a choice
     to price, not a requirement to assume.
   - *Append a small record per change and compact later.* The per-change cost falls to one short
     write; the price is a new format and recovery code that must replay it correctly.
5. **Put the choice in front of whoever owns the money path.** Where the save holds currency,
   purchases or progress, choosing between a visible hitch and an invisible loss window is a product
   decision. The engineering deliverable is the measured cost, the risk of each alternative and the
   test that would prove the chosen one; the move itself waits for the owner.
6. **Whatever is chosen, test recovery on the device.** Interrupt a save at each step — kill the
   process, cut the power — and assert that the next start loads either the new state or the backup,
   never a torn file and never nothing.

## Decision rules

- **When only a desktop has timed the save, the device cost is unmeasured.** The desktop has priced
  its own storage ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When the save carries what the player paid for, durability outranks the frame.** A dropped frame
  is visible and recoverable; a purchase lost to a power cut is neither, and the player finds out a
  session later.
- **When a save runs during play, its device cost is reported as a frame cost, attributed by name.**
  Otherwise the frames it drops are blamed on rendering and the next optimisation is spent there.
- **When a save moves off the frame, the player is told it happened only after it is durable, or the
  window is stated.** Acknowledging first and persisting later is a decision, not a side effect of a
  refactor.
- **When two saves can be in flight, their order is the order of the changes.** One serial writer;
  never a pool.
- **When a save runs inside the simulation step, time it as a save, not as simulation.** A profile that
  splits the frame by phase charges the storage cost to the simulation and sends the next
  investigation to the wrong code; the save is timed and reported by name wherever it is called from.

## When not to use

When the state is cheap to recompute or loses nothing the player values — a camera preference, a last
menu position — durability is not worth a flush, and a plain write at the next phase boundary is
enough; a write left for the moment the application is paused or closed may not get the time it
needs. When the storage
is fast enough that the measured worst save fits inside the frame's headroom, there is nothing to
decide. And this is not a reason to weaken a save that carries money without measuring it first: an
unmeasured cost is not a cost to remove.

## On fixed-refresh standalone headsets

The rule holds there, with one qualification. The mechanism transfers: such headsets run the same
family of mobile operating system on flash storage, whose own documentation warns that storage access
is usually fast and occasionally dramatically slower, and a fixed refresh turns a stall of a hundred
milliseconds into several frames the platform re-displays instead of new ones. The risk side
transfers and sharpens: a headset that is taken off is paused after its sleep delay, a paused
application is expected to stop simulating and rendering, and a paused process may be killed when
memory runs short, so a write left in flight on a worker meets a suspended or ended process more often
than on a box that runs until its power is cut, and the pause itself is too brief to start a save in.
The qualification is the size: no published storage timing for any headset was found, and none was
taken, so the cost there is unmeasured and the transfer rests on the platform's storage class and its
lifecycle, not on a run.
