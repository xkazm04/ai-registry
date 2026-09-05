---
layer: technique
type: technique
subject: agent-instruction-files
technique: context-reset-redelivery
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value]
shared_with: []
use_when: [an agent stopped following a rule that is present and correct in the file, the instruction file was edited during a long session, a harness compacts or clears context mid-session, deciding what a session-start injector must re-read and when]
---

# The delivered copy has its own clock

[instruction-freshness](./instruction-freshness.md) couples the file to the
repository that changes under it. [substrate-coupled-expiry](./substrate-coupled-expiry.md)
couples it to the model that reads it. Both audit **the file**, and both
assume the thing the agent is holding is the file.

It is not. It is a copy, taken once, at a moment. The subject's opening
claim — the harness injects the file at session start — is true and
incomplete in the direction that costs: *session start* is not one event,
and the copy taken at the first one can outlive the file by hours.

So there is a third divergence, and it is invisible to both audits above.
The file resolves every path, re-measures every count, and still names a
live gate; the line has not gone inert against the current model; every
check this subject runs comes back green — and the agent is following text
the repository stopped saying at eleven o'clock. **A perfectly fresh file
and a perfectly stale session are the same afternoon.**

## Reset is not restart

Harnesses in this class expose several distinct ways a session's context
goes away and comes back, and they are not interchangeable:

- a **cold open** — a new process, no prior context;
- a **clear** — the same process, context discarded on purpose;
- a **compaction** — the same process, context summarized to make room,
  usually triggered by the harness rather than by the operator, and
  therefore the one nobody is watching when it happens;
- a **resume** — the same conversation reattached, context deliberately
  preserved.

The first three all need the floor back; the fourth already has it. What
separates them is not whether the agent has the instructions — after a
reset it has *something* — but **where those bytes came from**. An injector
that composes the digest once and replays its own stored output on every
subsequent reset is a cache with no invalidation: it will re-deliver the
morning's file all day, confidently, and nothing in the session says so
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

The failure is silent by construction. The rule is present in the file, so
a reader auditing the repository finds nothing wrong. The rule is present
in the agent's context, so the agent is not unguided and raises no
question. Only the *version* is wrong, and a version is exactly what
neither side can see.

## The rule

**The floor is re-derived from the file on every context-reset event, not
replayed from what was derived at the first one.** Concretely:

- **Enumerate the reset events the harness actually raises**, and treat an
  unenumerated one as unhandled rather than as absent. Which resets a
  harness reports, under what name, and whether it reports them at all in
  its interactive surface as well as its headless one, is per-tool, dated
  data — the same kind of row as any other capability, and it belongs in a
  matrix with its verification date and method, not in an assumption.
- **Re-read on each of them.** The injector opens the file again; it does
  not hold a composed string. The cost is one file read against a context
  window being rebuilt anyway.
- **Distinguish the context-preserving reopen** and stay quiet there.
  Re-injecting into a session that kept its context spends the floor twice
  and, worse, teaches the reader that a duplicate is normal.
- **Separate "the reset fired" from "the floor arrived."** These are two
  facts with two observers, and only the second one matters. The harness
  can report the event, the injector can run and exit clean, and the bytes
  can still not be in the model's context — see
  [the delivery seam](../../../runtime-and-io/agent-cli-transport/techniques/child-observed-posture.md).

## What it costs to skip, and why nobody notices

The expensive version of this failure is not the agent that ignores a new
rule. It is the agent that ignores a **correction**. Corrections are the
half of the loop this subject already argues is under-run — a repo that
only ever adds on failure and never corrects on failure is running half
the loop — and a correction is minted at exactly the moment a long session
is underway, by an operator who just watched the agent get something
wrong, into a file the agent will not re-read. The operator then observes
the agent repeat the mistake and concludes the line does not work, and the
next edit is a stronger, longer, more emphatic version of a line that was
already right. That is how the dilution tax gets paid for nothing:
[line-earning](./line-earning.md)'s admission test cannot defend against a
line that was admitted correctly and never delivered.

The signature to recognize: **an instruction that is obeyed early in a
session and not late**, and the instruction is one the file *changed*. The
first half alone is not enough. Compliance decays with session length on a
file nobody edited — the one file-scale factorial study to date (2026, one
harness, 1,650 sessions) measured about 5.6% lower odds of following a rule
per function generated, with the first omission at a median of the fourth —
so "obeyed early, not late, recovers on restart" is also the signature of
ordinary in-session dilution, and that one *is* a length question. What
separates the two is the version: a stale copy disobeys the rule as it is
now and obeys the rule as it was, and the marker check below tells them
apart in one pass. Neither is an authorship question, and no amount of
rewriting the line will touch either.

## Verify it once, cheaply

The check is a single pass and it does not need a live incident. In a
throwaway workspace, put a unique marker in the file, open a session,
change the marker, force each reset the harness exposes, and ask for the
marker back. The first form proves the injector runs; **only the second
form — after an edit — proves it re-reads**, and a run that skips the edit
passes vacuously on a cached digest.

Where a harness offers no reset event at all on some surface, that surface
is *uncovered*, and the honest record says so rather than inferring it from
the surface that works ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
A floor that cannot be re-delivered on a given surface is a bounded claim
about that surface, and the compensating move is to keep sessions on it
short enough that the file cannot outrun them.
