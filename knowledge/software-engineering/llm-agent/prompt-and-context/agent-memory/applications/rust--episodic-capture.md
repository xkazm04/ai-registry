---
layer: application
type: application
subject: agent-memory
technique: episodic-capture
stack: rust
verified_on: 2026-08-26
verified_against: rust@1.97
---

# Bounding the distillation batch in the companion brain (Rust)

The subject's claim that the distiller's *batch shape* is the second half of
its ceiling was written against two independent implementations. This is the
one that can be read, and it is the stronger of the two, because it goes past
what the standard asked for.

## Two caps, and the one that shares the budget

`src-tauri/src/companion/brain/sleep_cycle/limits.rs` holds every bound the
nightly cycle obeys in one file, and the pair the technique cares about sits
four lines apart:

- `MAX_CHARS_IN = 30_000` (`:61`) — the batch cap, total episode characters
  fed to the compress pass.
- `MAX_EPISODE_CHARS = 2_000` (`:64`) — the per-item cap, and its comment
  states the mechanism the technique argues for, in the codebase's own words:
  *"so one pasted wall of text cannot eat the whole character budget and starve
  the other 119 episodes of a hearing."*

Alongside them, `MAX_EPISODES_IN = 120` (`:53`) bounds count as well as volume,
and `EPISODE_FETCH_LIMIT = MAX_EPISODES_IN * 4` (`:59`) deliberately over-reads
the window so the character cap has short episodes to fall back on when the
newest ones are long — with the comment noting that this limit must never
double as the honest denominator, which is counted separately.

Nobody coordinated this with the vendor documentation that occasioned the
amendment. Two systems, same two-cap shape, same stated reason. That is what
the technique means by weak evidence for the number and strong evidence for the
shape.

## What the tree does that the standard did not ask for

`bound_input` (`sleep_cycle/phases.rs:131-172`) packs the batch, and two
properties of it are better than the obligation the technique originally
carried. Both were folded back into the technique after reading this code.

**It reports what it crowded out.** The packer counts `dropped` against
`total_available` and `excerpted` separately, sets a `truncated` flag, and
builds a note that goes to the distilling model itself (`:157-164`): *"Input
was capped: N of M episodes in the window were left unread and K long bodies
were excerpted."* The amendment as first drafted claimed a batch's output never
names what it crowded out. That is only true of a packer nobody instrumented —
this one is the counter-example, and the claim was corrected to say so.

**Overflow defers rather than drops.** The note's last clause is the design
decision: *"The unread ones are the NEWEST ones, and they are what the next
cycle starts on — deferred, not lost."* `consumed_through` (`:153`) records the
boundary the pass actually stopped at, and the next cycle resumes from it. The
cap therefore bounds *the pass*, not *the history* — a crowded batch costs a
night of latency instead of a permanent hole in the record. Because the packer
defers, it can afford a per-item cap as aggressive as 2,000 characters without
that strictness ever destroying evidence. The technique now carries this as its
own rule; it came from here, not from the source that started the run.

## The trigger the caps sit under

Worth reading alongside, because it decides how often the caps bind at all:
admission is on accumulated pressure (`PRESSURE_THRESHOLD_CHARS = 40_000`,
`:20`) rather than a clock, with a staleness release valve (`:38`), a floor
below which a cycle never admits (`:44`), and a minimum interval between
completed cycles (`:30`). The pressure threshold's comment derives 40,000 from
a 790-message export — heavy days ran 48k–100k conversation characters, light
days 1.5k–11k — so cadence is shaped by usage. This is the generous-capture /
strict-consolidation split the technique names, with the strictness expressed
as *when the expensive pass runs* rather than as *what gets recorded*.

## What this realization cannot do

The instrument reports items **admitted against eligible**, which catches the
crowded batch. It does not report **claims per event**, which is the other
number the technique asks for and the one that catches a weakening distiller.
Those are different diseases with the same symptom, and this tree can currently
diagnose only one of them: a model swap that halved extraction yield would
leave `dropped`, `excerpted` and `truncated` all looking healthy. Anyone
copying the packing discipline from here should not read it as covering the
distiller-strength half.

The per-item cap is also applied by character count via a plain excerpt
(`:141-144`) with an `…[excerpted]` marker — it truncates the *evidence* handed
to the distiller, not a stored memory, so the technique's "never truncate an
item" rule (which governs recall) is not in tension with it. The raw episode is
untouched in the archive; only the copy in this pass's prompt is cut.
