---
layer: application
type: application
subject: fleet-orchestration
technique: absent-status-passthrough
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.96
applied: simulation
ab_verdict: better
---

# Rust — where absence is representable, and where it is not

How the Personas fleet backend stands against
[absent-status-passthrough](../techniques/absent-status-passthrough.md).
*Verified against the project tree at `dd9517376`.*

The interesting result here is not a defect. It is that the tree obeys the
technique at its single most dangerous gate and cannot express it anywhere
else — and the reason it obeys is not that anyone decided to.

## The structural fact: the discipline is on loan from `Option`

`FleetSessionState` has eight members — `Spawning`, `Running`,
`AwaitingInput`, `Idle`, `Stale`, `Finished`, `Hibernated`, `Exited` — and
every one of them is a definite claim about what a session is doing. There is
no member meaning *no producer has told us*. By the technique's vocabulary
requirement, this fleet cannot say "not stated".

And yet the auto-kill gate is correct. `fleet_kill_state_is_closable` takes
`Option<FleetSessionState>` and matches only on `Some(Finished | Idle | Stale
| Hibernated)`; its doc comment ends *"`None` (unknown id) fails closed."*
That is exactly the passthrough, at the gate where getting it wrong destroys
a working session.

But the `Option` is not a modelled unknown. It is the return type of a map
lookup — the absence of a *row*, not the absence of a *state*. The gate is
protected because the fleet happens to ask its question in a shape that
forces the caller to handle a missing answer, and every gate that reads
`session.state` off an already-resolved row gets no such protection. The
honest reading: **this tree has the technique's discipline exactly where
Rust's type system imposed it, and nowhere it would have had to be chosen.**

Nobody designed that boundary, which is what makes it evidence.

## The A/B, as a simulation over three real cases

Policy A is the tree as it stands. Policy B adds an `Unknown` member to the
state vocabulary and routes every non-observing layer through it.

**Case 1 — the auto-kill gate (`fleet_kill_state_is_closable`).** A caller
asks whether a session may be auto-closed and the registry has no row for the
id. *Under A:* `None` fails closed; not closable. *Under B:* identical.
**No change.** This is the case that already conforms, and it is the one
worth stating first, because a technique that only ever reports gaps is not
being tested.

**Case 2 — light sleep (`doze`).** The doze path re-validates under the lock
and frees the process of a session parked in `Stale` or `AwaitingInput`,
deliberately without changing the displayed state. Its guard is a `matches!`
against a *non-optional* `session.state`. *Under A:* a state that reached the
row without a producer having reported it — a rehydrated tombstone restored
as `Stale`, a seeded initial value — satisfies the guard, and doze frees the
process of a session that may be live. *Under B:* `Unknown` is not in the
`matches!` arm, doze declines, and the session keeps its process until
something actually reports. **B is safer, and the diff is one arm.**

**Case 3 — the process scan (`fleet_detect_processes`).** The scan walks the
process table, marks each hit `tracked` against the registry's known PIDs,
and returns `Ok(out)`. The only error path is the blocking task itself
panicking. *Under A:* a process table that came back empty or partial — a
refresh that raced, a permissions failure — is indistinguishable from a
machine with no sessions running, and every tracked PID silently reads as
absent. The companion doc for `memory_bytes_for` states the same two-valued
assumption in its own words: *"PIDs that no longer exist are simply absent
from the map."* There is no third answer available to either. *Under B:* the
scan distinguishes *scanned and not found* from *could not scan*, and the
latter retains.

**Verdict: better**, on cases 2 and 3, with case 1 unchanged.

## What bounds the finding

The blast radius is smaller than it looks, and saying so is part of the
result. `fleet_detect_processes` is registered as a command consumed by an
operator-facing orphan list; it is not wired into an automatic reaper. And
the staleness ticker that *does* reap works from `last_activity_ms`, not from
a process probe at all — so this fleet's tier two is time-based, and the
probe's two-valued answer never reaches a reaping decision today. Case 3 is a
latent hazard that becomes live the moment the probe is promoted into the
sweep, which is the natural next step for it.

## What this realization cannot do

Nothing in this tree can measure the defect. A state that was never reported
is unrepresentable, so no gate, test, or assertion can distinguish "the
producer said `Stale`" from "something wrote `Stale` because it needed a
value" — the two are the same byte. That is why the mode here is simulation
rather than experiment, and it is not a shortcoming of the run: **the missing
vocabulary member is simultaneously the defect and the reason the defect is
invisible.**

The instrument that would make it measurable is the same change the technique
prescribes: once `Unknown` exists, a counter on transitions *out of* it
measures how often a layer was about to invent a value, and that number is
readable before any gate is changed. Adding the member is therefore both the
fix and the meter, which is the cheapest form this kind of adoption can take.
