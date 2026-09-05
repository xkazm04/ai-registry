---
layer: application
type: application
subject: self-healing
technique: declared-verdict-over-inferred-wreckage
stack: go
verified_on: 2026-09-04
verified_against: go@1.24.4
applied: code
ab_verdict: better
---

# A degraded-mode entry gated on a marker, not a stack trace (Go, embedded appliance)

This is the tree the technique was read out of: the firmware of a KVM-over-IP
appliance — a device that presents itself to a host computer as a keyboard,
mouse and display, and to its owner as a web page. The version witness is the
`go` directive in `go.mod` (1.24.4); the UI half declares Node `^22.21.1` in its
`engines` field.

Two properties of the deployment shape every decision below, and neither is
optional for the design to make sense. The device sits in somebody's rack with
**no console** — the only way in is the software that just crashed. And the
component under supervision is **mandatory**: a native process that owns video
capture and the hardware display. There is no lane to dead-letter it into and
nothing useful to serve without it.

## The shape

A supervisor spawns the native process and replaces it on unexpected exit, up to
a capped number of attempts. When the cap is reached, the supervising process
writes a constant into its crash log and exits. On the next boot, a classifier
reads the previous incarnation's log and decides whether to enter a reduced
mode — one that serves the web UI, states the failure, and does not attempt the
video path.

The whole mechanism is about forty lines across three packages, and every one of
its choices is a refusal.

## The classifier refuses to infer

The classifier matches **one string**: the constant the supervisor emits at
exhaustion. It does not parse the trace, and it does not look for the component's
name. The test file is where the design is actually stated, and its cases are
mostly negatives:

- the marker present in a realistic tail → the verdict, active;
- an empty log → unknown, diagnostic only;
- a panic whose trace names the native package, with **no marker** → unknown,
  diagnostic only;
- a crash in the network-monitor package → unknown, diagnostic only.

The third case is the whole technique in one fixture. A device that dropped into
its reduced mode because a stack trace mentioned the video subsystem would be
harder to diagnose than one that simply crashed, because the reduced mode looks
deliberate. That case is also the one a future "improvement" would delete, which
is the argument for writing it first.

The marker constant lives in the supervisor package and is imported by both the
writer and the classifier — one author for the vocabulary, no second spelling to
drift.

## The channel's four disciplines, all present

The crossing is a file, and the reader treats it as a channel rather than as
data — this is the tree that
[consume-once-mode-handoff](../techniques/consume-once-mode-handoff.md) was
generalised from:

- **Consumed once.** The log is unlinked as part of being read, before the
  verdict is acted on. Without this the reduced mode outlives its cause forever,
  because nothing else ever deletes that path.
- **Authenticated by shape.** The path is required to be a **symlink**; a regular
  file there is logged and ignored. A well-known path under the device's writable
  data directory is reachable by anything on the box, and the shape check costs
  one `lstat` and removes accidental activation by a stray copy or a support
  script's output.
- **Bounded read.** Only the final 50 KB of the log is read, with a comment
  naming the reason. The channel is an append-only log on a device that has just
  crashed; reading it whole is an allocation failure in the one code path that
  must not have one.
- **An out-of-band door.** Two of them, in fact: an environment variable and a
  sentinel file, either of which forces the mode. Both are checked *before* the
  log, and the mode records **which trigger admitted it** — an operator's request
  and an exhausted recovery loop are different facts, and collapsing them would
  destroy the only question worth asking afterwards.

The sentinel file is itself removed on read, so the operator's door is one-shot
too.

## The one asymmetry worth naming

The reader is strict by design, which makes the writer's obligation absolute: a
recovery loop that exhausts without emitting its marker produces a device that
crash-loops forever behind a correct classifier. Nothing in the type system spans
the process death, so the guarantee rests on the constant having exactly one
writer and one reader — which is checkable by grep, and is the review step this
design needs that a compiler cannot supply.

## What this realization cannot do

It classifies a **single** failure mode. The classifier's verdict set has two
members, and everything that is not the native exhaustion marker is `unknown`.
That is the right starting point — an unknown lane that resolves to *come up
normally* is the safe default — but it means the mechanism does not yet
distinguish, say, a storage failure from a network-stack failure, and a second
supervised component would need its own marker rather than a general scheme.

It also says nothing about what the reduced mode should *contain*. The tree
decides that elsewhere, and the decision is not visible from the classifier.
