---
layer: application
type: application
subject: extension-trust-boundary
technique: re-entrant-registration-across-processes
stack: python
status: forged
verified_on: 2026-10-31
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# A plugin host whose workers are re-executed, and the one failure that was not per group

Read against `github:xkazm04/gravitone-gcloud`, a branch from an audio hackathon
(`hackathon/audio-steer-1028/e3`, head `adc4cf84`) that has not been published.
So this document describes the code and cites no file or line. The tree pins no
interpreter version. `python@3.12` is the one that ran both arms (3.12.1, with the
host library at 0.9.26, unpinned in the tree's requirements), on Windows.

The seam is an instrument atlas builder. It measures every sampled instrument
under a set of roots in a process pool. When asked, it also hosts a third-party
VST3 synthesizer and measures each of that plugin's presets as an instrument. It
also loads one more plugin, only to check that it answers a note with sound. That
gives the fleet its first host that loads third-party extension code inside
worker processes. Three earlier attempts to apply this technique (2026-10-14,
10-22, 10-23) found none.

## What the tree already does, and why it had no choice

The pool's only start method on this platform is `spawn`, so every worker
re-executes the program. The tree never loads the plugin in the parent. It sends
the plugin's **path** across the process boundary, and each worker loads the
plugin itself, once per partition of the presets. That is the technique's
decision rule (load in every process), reached without a registry because the
contribution is a native handle, not a name.

An experiment on the same inputs (three presets, two workers) priced the rule and
its alternative:

| arm | what crosses the boundary | result |
| --- | --- | --- |
| single process | nothing | 3 entries, plugin load 3.36 s |
| A, the tree | the path; each worker loads | 3 entries, **identical** to single process; load 4.06 s and 4.00 s per worker |
| B, load in parent and inherit | the loaded plugin object | `TypeError: cannot pickle 'VST3Plugin'`, at submit |

Two readings. First, the technique's "cheap" clause is real here and the tree
respects it: a load costs about four seconds per process, and the builder caps
the plugin partitions at five whatever the worker count. Second, a boundary the
technique does not state. For a registry of *names* filled by side effects at
import, the inherit design fails **silently**: a re-executed worker sees an empty
registry. For a native handle it fails **loudly**, at the moment of submission. A
host whose extensions are handles cannot fall into the silent version of this
failure. It can only fall into the one below.

## The finding: failure policy by accident, inside one group

The technique asks for a failure policy chosen per group. If the group skips
failures, the output must name the extension that failed, and nothing in the
builder may confuse "none" with "failed". The tree handled three of the four
plugin failures that way:

- A preset that throws while being applied or rendered becomes an entry with
  the error in words.
- A preset that renders differently every time becomes an entry in words.
- A plugin that renders silence becomes an entry in words.
- A plugin that **would not load** raised out of the pool. The builder lost
  every result, sampled instruments included. One optional plugin, a group
  whose contribution is a few catalogue rows, took down the whole atlas.

That fourth case is reachable without a missing file. The host class parses the
plugin's saved state and raises its own carefully worded error when "this build of
the plugin saves its state differently". So a synth update would have produced a
sentence written for an operator, then thrown it away together with the atlas it
was meant to annotate.

**The change** (branch `intake/atlas-host-load-in-words`, commit `99001db5`, 17
lines): both load sites catch the load failure and return one entry naming the
plugin, in the same shape as the silent case. In the preset path only partition 0
reports it, so N workers that fail the same way say it once.

**Paired proof**, same calls through the before tree and the after tree, each in a
fresh process:

| case | before | after |
| --- | --- | --- |
| control: every plugin loads | 3 entries | 3 entries, byte-identical |
| the sound-check plugin cannot load | raised, 0 entries | 4 entries: the 3 presets unchanged, plus 1 naming the plugin |
| the host plugin cannot load | raised, 0 entries | 1 entry naming the plugin |

Target: entries that survive one plugin that cannot load (0 before, 4 and 1
after), with the failure named. Floor: the control build is byte-identical. Verdict
`better`.

## What this realization cannot do

- **A crash is not an exception.** A native plugin that segfaults in a worker
  breaks the whole pool, and every pending result goes with it, sampled
  instruments included. Catching in the worker cannot see that. The fix belongs in
  the builder: run the plugin jobs in a separate pool from the sample jobs. That
  is the technique's grouping rule applied to blast radius, and it is not built.
- **The preset path still loads per partition, not per process.** Each partition
  is one submitted job, so one load per job. With five partitions and more than
  five workers, one process can run two jobs and pay two loads. That is bounded
  by the cap and it was not measured.
- **The branch is unmerged.** The change rides on a hackathon branch whose fate
  the owner has not decided. It ships when that branch does, or it gets
  cherry-picked.
