---
layer: application
type: application
subject: serving-process-topology
technique: probe-the-runtime-not-the-config
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Choosing a start method by probe, with the rejections written down

Citations are to `vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. The material is
`docs/design/multiprocessing.md`, which is the most complete published example of
this technique known to this subject — not because the policy is elaborate, but
because the document argues its rejected alternatives at the same altitude as the
one it chose.

## The three strategies and their exact failures

`multiprocessing.md:21-48` lays out the platform's options with the trade-off the
technique generalizes:

- `fork` — "the fastest method, but is incompatible with dependencies that use
  threads"; on macOS it may crash the process outright.
- `spawn` — "more compatible with dependencies, but can be problematic when vLLM
  is used as a library. If the consuming code does not use a `__main__` guard
  ... the code will be inadvertently re-executed when vLLM spawns a new process.
  This can lead to infinite recursion."
- `forkserver` — the attractive middle option, and the document kills it in three
  lines: the server process "is created as a spawned new process, which will
  re-execute code not protected by a `__main__` guard".

`multiprocessing.md:50-58` supplies the detectable half: several dependencies
document a requirement or preference for `spawn` once device contexts or shared
device tensors are in play, and "known issues exist when using `fork` after
initializing these dependencies".

## The policy, as three ordered rules

`multiprocessing.md:104-115` states it as a list:

> - Default to `fork`.
> - Use `spawn` when we know we control the main process (`vllm` was executed).
> - If we detect `cuda` was previously initialized, force `spawn` and emit a
>   warning. We know `fork` will break, so this is the best we can do.

The middle rule is the one the expert draft of this technique lacked, and it is
the upward lesson this document contributed: because the runtime can tell that
*its own* command-line entry point started the process, the entire population of
packaged deployments is safe for the compatible strategy at no risk, and only
embedding callers are left in the ambiguous case. The escape hatch is
`VLLM_WORKER_MULTIPROC_METHOD` (`multiprocessing.md:60-62`), honoured ahead of
the probe.

## The residual failure is named, and the warning names both fixes

The document does not claim the policy closed the hole:

> The case that is known to still break in this scenario is code using vLLM as a
> library that initializes `cuda` before calling vLLM. The warning we emit should
> instruct users to either add a `__main__` guard or to disable multiprocessing.

Two remedies, one of which does not require editing the calling program. The
document then prints both messages the user will actually see
(`multiprocessing.md:119-152`): the runtime's own warning, which names the
observation that forced the choice and links the troubleshooting page, followed
by the platform's `RuntimeError`, which explains the mechanism well and says
nothing about why *this* program hit it. The pairing is the technique's point —
the platform explains the machinery, the runtime explains the cause.

## The rejections, which are the highest-value part

`multiprocessing.md:154-179` records three, each with its reason:

- **Detect a `__main__` guard.** Investigated, with the prior art cited (a
  library author asking the same question publicly). Finding: it is possible to
  tell whether this is the original process or a spawned one, but "it does not
  appear to be straight forward to detect whether a `__main__` guard is present".
  Discarded as impractical — and the investigation is recorded so it is not
  repeated.
- **Use `forkserver`.** "At first it appears that `forkserver` is a nice
  solution." Rejected because the helper is itself spawned.
- **Force `spawn` all the time.** Rejected in the sentence that states the
  principle plainly: "This would unfortunately break existing code and make vLLM
  harder to use ... Instead of pushing this on our users, we will retain the
  complexity to do our best to make things work."

`multiprocessing.md:181-191` adds a "Future Work" section naming a custom manager
process as the shape that would dissolve the dilemma, which is how a best-effort
policy should be labelled.

## Where this tree falls short of the standard

- **Rule 3's probe is single-fact.** It observes one accelerator vendor's context
  initialization. The technique asks for the observation set to include the
  thread-holding dependencies the same document names at lines 50-58, and for the
  case where an observation *cannot be taken* to fall to the safe strategy rather
  than to the cheap one.
- **The document's own line anchors have decayed.** Its note at line 11 states
  the source references are to the code as of December 2024, and several of the
  linked line ranges no longer resolve. The policy prose survived; the pointers
  did not, which is the argument for keeping the policy at the technique layer
  and the pointers here.
