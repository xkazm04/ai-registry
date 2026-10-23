---
layer: application
type: application
subject: conditional-service-composition
technique: intent-and-environment-in-one-namespace
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Intent and environment in one namespace — an encoder probe that read "could not determine" as "absent"

*Verified against `gravitone` at `8b7edd15` (and its parent, read with `git show`).
Runtime witness: `@types/node ^24.19.2` in the package manifest, and a Node 24 toolchain
resolved locally. The tree is a Next.js 16 server; no compose file is involved.*

The [compose applications](./docker-compose--requirement-closure-before-selection.md) of this
subject all exercise the *namespace* half of the technique and none exercises the *probe*
half: no fleet compose file declares a device or capability. This application takes the
probe half to a tree that has no composition layer at all, which is the point. A process
that may run an accelerated encoder or a software one has the same three-outcome problem
the technique states, with the token set collapsed to one boolean.

## The seam

An ad renderer asks `h264_nvenc` first and falls back to `libx264` when the GPU encode
throws. The decision lives at `lib/adRender.ts:550` (`let encoder = nvencUnavailable ? "libx264" : "h264_nvenc"`),
and the observation is a process-wide latch, `nvencUnavailable`, declared at `lib/adRender.ts:469`.

Before the change the latch was set inside the `catch` for **any** failure of the NVENC
attempt. That is the technique's failure exactly, one step removed from a probe tool:
the attempt cannot tell *the capability is absent* from *the attempt failed for a reason
unrelated to the capability*. A corrupt shot or a full disk fails the GPU encode too, and the
code recorded "no GPU" for the life of the process. Every later render then asked the
software encoder first, at a fraction of the throughput, with one warning line in a log and
nothing else.

## What A and B were

- **A** — the shipped code: `nvencUnavailable = true` before the retry.
- **B** — the same assignment moved to *after* the `libx264` retry returns. The retry is the
  discriminator: a failure the software encoder shares is evidence about the input, not
  about NVENC, so the throw skips the latch. A failure only NVENC has is the capability's
  own, and the latch is set as before.

The "try it and fall back" shape has no separate probe step, so the third outcome cannot be
returned by a probe; it has to be **read off the retry**. That is a boundary the technique
did not state: where the probe is the real operation with a fallback behind it, *could not
determine* is "the fallback failed too".

## Measurement

Harness: `tests/next-server/ad-render-encoder-latch.test.ts`, which injects a fake `ffmpeg`
that records which encoder each call asked for and fails by predicate.

| | A (before) | B (after) |
| --- | --- | --- |
| **Target** — failure both encoders share, then a healthy render: encoder asked first on the healthy render | `libx264` (latched off by the bad input), caught 1 of 1 | `h264_nvenc` |
| **Floor** — NVENC-only failure: render completes on `libx264`, next render asks `libx264` first | holds, 1 of 1 | holds, 1 of 1 |

The project's suite (254 files, 2181 tests), `tsc` and `eslint` stayed green. The seam was
chosen to falsify: the question was whether the retry already made the latch correct. It did
not, and the target arm caught it.

Verdict `better`: the target moved with the floor held (a real GPU failure still falls back
and still latches). The change is committed in the project, unpushed at the time of writing.

## What this realization cannot do

- It does not surface *could not determine* anywhere. It only declines to record a
  false *absent*. The technique asks for the third outcome to report itself at startup
  volume; here it is the existing warn line, which is the same volume as before.
- The latch is still a one-way, process-lifetime boolean. A transient NVENC failure that
  the software encoder survives (a session limit reached under load) is indistinguishable
  from a missing device and is latched off for good. Distinguishing those needs the
  encoder's own error class, which this tree does not parse.
- There is no token namespace, so the technique's central rule (a quantifier ranges over
  requests, never observations) is not exercised. The structural fact the tree does offer
  is the negative one: the only observation in the process is a module-level
  boolean, and nothing declares what kind of token it is.
- Whether NVENC is an *optimisation* or a *requirement* is a choice the code makes by
  falling back. Here it is declared an optimisation, which is why proceeding was right.

## Return condition

A second tree with a try-and-fall-back probe, before the technique is amended to state the
retry-as-discriminator rule. One tree is a boundary case seen once; the compose trees
cannot confirm it.
