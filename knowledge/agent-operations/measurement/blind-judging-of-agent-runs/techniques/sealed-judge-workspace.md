---
layer: technique
type: technique
subject: blind-judging-of-agent-runs
technique: sealed-judge-workspace
status: draft
laws: [the-judge-never-grades-its-own-family, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [the judge is an agent with a shell or file tools, staging the material a judge seat reads, running several judge seats at once, a judge cites something the packet did not contain]
---

# Sealed judge workspace

The concern: once the judge is itself an agent - a command-line seat with a shell, reading a
directory of entries rather than a prompt - its packet is no longer the text it was handed.
It is everything it can reach. "Do not open the key" and "never leave this directory" are
requests, and a seat running without approvals has no reason to treat them as walls. The
blinding, the independence of the panel and the facts-only discipline all fail at once,
silently, the first time a judge lists its parent directory.

The general finding is older than judging. Agents told not to use a shortcut they can reach
use it anyway at nearly the same rate; agents that cannot reach it stop. Coding benchmarks
learned it when agents read the fix out of a repository's future history, and the repair was
structural - remove the history - not a stronger prompt.

**Blinding an agent judge is a property of its filesystem, not of its instructions. Stage
each seat a workspace that holds only its brief and the redacted entries, keep everything
that would unblind or anchor it out of reach, and treat a verdict that cites anything else
as contaminated.**

## What must be out of reach

- **The unblinding key** - the letter-to-producer map, the collection manifest, any
  unblinded gallery the host reads. One directory up is not out of reach; it is one command.
- **The other seats.** Their briefs name their models, and their verdicts, once written, are
  the strongest anchor a judge can find. Seats run concurrently, so the fastest judge's
  verdict sits beside the slowest judge's working directory for most of the run. A panel
  whose members can read each other is one judge with extra steps.
- **The host's own assessment** - screenshots, notes, a visual pass, a draft ranking. A judge
  that finds them grades the host's reading, not the work.
- **The producer's working trees and logs**, which carry every identity token the scrub
  removed from the copy.
- **The entry's own version history.** A copied repository brings its commit authors,
  trailers, branch names and reflog with it. Stage the tree and the diff, not the history.

## What must stay in reach

Everything the judge legitimately needs. The seal withholds the key, the peers and the host,
not evidence: judges given more of the run agree with human reviewers more often, and hiding
material an agent needs degrades the work it does. A thinned packet is a different failure
wearing the same caution.

## How to stage it

1. **Copy, never link.** The seat's workspace is a fresh directory holding the scrubbed
   entries and its own brief. A symlink or junction back into the arena is the arena.
2. **One opaque root per seat.** Do not nest every seat under one shared staging folder, and
   do not name the folders after the judge or the contest - a directory listing is itself a
   packet.
3. **Run from outside the arena's ancestry** where the platform allows, and prefer the
   engine's own read sandbox over a prompt line when one exists. Where every seat must run
   unsandboxed, say so: the key is then out of the way, not out of reach.
4. **Harvest the verdict, then delete the workspace.** A kept workspace is a verdict
   available to the next panel.

## Verification

- **Probe from the seat's working directory, not from the harness.** List what the seat can
  read one and two levels up and search for the key's filename and the other seats' verdict
  names. Carry a known positive - the seat's own brief - so an empty result is a result.
- **Grep every verdict for things the packet did not contain**: another seat's id, a host
  artefact's filename, a producer token. A hit is a harness defect, and the verdict is
  re-run on a sealed workspace, not edited.
- **Re-probe after any change to staging, the engine command, or the sandbox flags.** The
  seal is only as strong as the last seat launch that tested it.

## Decision rules

- **A leaked verdict is withheld, not averaged.** It measured something other than the work,
  under the same column heading - the same reasoning as a half-panel.
- **Independence is collected, never reconstructed.** Every seat scores before any score is
  visible to any other; discussion or reconciliation comes after the independent verdicts are
  on the record, and both are kept.
- **Sealing does not replace scrubbing, and scrubbing does not replace cross-family seats.**
  The seal stops the judge finding the producer; the scrub stops the entries naming it; the
  panel's mix handles the style neither can remove.
