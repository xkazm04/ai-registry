---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: per-subsystem-check-sets
status: forged
laws: [law-and-check-share-one-source, structural-proof-is-never-sufficient]
shared_with: []
use_when: [building a review checklist for a subsystem you own, a review keeps finding only generic issues, an existing checklist has stopped producing findings]
---

# Per-subsystem check sets

## The concern

Generic review finds generic defects. What actually goes wrong in a subsystem is specific to
that subsystem and does not transfer: an inventory layer fails at stack bounds, slot keys and
null definitions; a save layer fails at synchronous writes, missing migration paths and state
that was never captured; an interface layer fails by polling values that already broadcast
their own changes. A reviewer who arrives with only general principles will find general
things, and the defect that ships is the one everybody in that subsystem's history has
already shipped once.

A check set is that subsystem's accumulated memory of its own failures, written down. The
transplantable craft is the **shape of an entry**, not any particular list.

## The shape of an entry

Each entry is a **confirmable claim about how this subsystem is usually wrong**, phrased so a
reviewer can confirm or refute it against the code and can tell which they did.

- It names a specific thing, at a specific place, in a specific state. "Hit detection
  deduplicates per swing, keyed on the attacking instance and cleared on activation" is an
  entry. "Combat should be correct" is not.
- It is stated as the *expected* condition, so the finding is its negation and needs no
  interpretation. A reviewer confirming an entry produces no finding; refuting it produces one
  with the fix already written.
- It carries its rationale when the rationale is non-obvious, because an entry nobody
  understands gets waived. "Prefer the sweeping trace over the line trace *because a thin
  weapon at speed tunnels through a target between frames*" survives contact with a reviewer
  who disagrees; the same entry without the clause does not.
- It is falsifiable by reading, not by feeling. If confirming an entry requires taste, it
  belongs in a craft rubric — a different instrument, graded differently — not in a check set.

Entries are grouped by which pass may evaluate them: structural entries in the structure pass,
correctness entries in the quality pass, cost entries in the performance pass. An entry whose
group is wrong is an entitlement violation waiting to happen.

## Building one for a subsystem you own

1. **Harvest from incidents.** Walk the subsystem's bug history, post-mortems, and the
   comments in its own code that begin "this was wrong for two weeks because". Every entry
   should be traceable to something that actually cost the team time. A check set built from
   imagination is a style guide.
2. **Harvest from repeated review comments.** Anything a senior engineer has typed into a
   review of this subsystem three times is an entry; that is what "usually wrong" means.
3. **Phrase each as the expected condition** in the shape above, and place it in a pass.
4. **Name the platform-level traps separately.** Failures that come from the engine rather
   than from this subsystem belong to the shared trap corpus; the check set references the
   corpus rather than copying it, so a corpus fix propagates instead of drifting.
5. **State each threshold once.** Where an entry carries a number — an update interval, a
   budget, a count — the number lives in the canonical statement of that rule and the entry
   reads it from there. Two copies of a threshold in prose and in a checker drift silently and
   the drift is undetectable from either side.

## The maintenance obligation

**A check set nobody prunes becomes a ritual.** This is the failure mode that kills check
sets, and it is slow enough to be invisible: entries accumulate, most stop firing, reviewers
learn the list is mostly noise, and they skim it — including the four entries that still
matter. The list keeps growing and its yield goes to zero while its length says the opposite.

The discipline:

- **Track per-entry fire rate.** How many of the last N reviews did this entry produce a
  finding in, and how many of those findings were acted on?
- **When an entry has not fired in a year, retire it** — unless the reason it stopped firing
  is that the team now gets it right *because the entry taught them*, which is a real and
  common case. Distinguish the two by asking whether the code would still be correct if the
  entry were deleted tomorrow.
- **When an entry fires constantly and is always waived, it is wrong.** Either the standard
  moved and the entry did not, or it was never a real rule. Fix it or delete it; a
  permanently-waived entry trains reviewers to waive.
- **When the subsystem is rewritten, the check set is rewritten with it.** Entries about a
  structure that no longer exists are the worst kind of noise — they are confidently
  refutable and produce findings about nothing.

## Decision rules

- **When two subsystems share an entry, promote it** to the cross-cutting set rather than
  copying it. Copies drift.
- **When an entry cannot be confirmed by reading code, move it.** It is a rubric criterion, a
  runtime observation, or a design rule — all of which have their own instruments.
- **When a review's findings are all from the generic set and none from the subsystem set,
  suspect the set, not the code.** A subsystem-specific list that never fires has usually
  gone stale rather than been outgrown.

## When not to use it

- **Not for a subsystem nobody has shipped yet.** With no incident history the set would be
  invented, and an invented set carries all the maintenance cost with none of the yield. Start
  with the generic passes and the trap corpus; let the first real incidents seed the set.
- **Not as a completeness claim.** Passing every entry means the known failures are absent, and
  nothing more. It is a floor with rungs above it.
- **Not as a substitute for the end-to-end trace.** Check sets are per-file and per-concept;
  the defects that live in the seams between components are invisible to them by construction.
