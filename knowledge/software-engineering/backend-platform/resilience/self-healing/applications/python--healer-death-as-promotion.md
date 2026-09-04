---
layer: application
type: application
subject: self-healing
technique: healer-death-as-promotion
stack: python
verified_on: 2026-09-04
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# A terminal verdict nobody could read (Python, FastAPI, Helm)

A GPU-backed speech service supervises a fixed pool of worker threads, each
holding a loaded model. A worker that dies unexpectedly is replaced up to a
capped number of times; past the cap the engine stops replacing it, marks itself
failed, and logs at CRITICAL. Two separate docstrings state the intent in almost
the words this subject uses — the give-up is deliberate and visible *"so the
process supervisor replaces the replica instead of the engine hiding a
deterministic crash loop behind an endless respawn."*

The engine's half of that is done well, and it is worth saying so before the
defect, because the defect is not in the part that looks hard. The verdict is
computed from live worker threads rather than a one-time startup flag; the health
body spells three distinct not-ready states — `loading`, `draining`,
`unavailable` — and only the third means *replace me*. That is exactly the typed
verdict [declared-verdict-over-inferred-wreckage](../techniques/declared-verdict-over-inferred-wreckage.md)
asks for, produced correctly, at the right layer.

## The structural fact: the verdict had no reader

The promotion was addressed to a receiver — "the process supervisor" — and the
deployment that defines that supervisor's behaviour could not observe it.

- The **readiness probe** does an HTTP GET on the health path. Kubernetes
  branches on the *status code*, and all three not-ready states answer 503. A
  failed readiness check removes the pod from the Service endpoints; it never
  restarts anything.
- The **liveness probe** — the only probe that can replace a pod — was a TCP
  connect to the serving port. The give-up path deliberately leaves the process
  alive with the port bound, so this probe passes forever.

The two together produce a state nobody designed: a replica that spends its
restart budget leaves the load balancer's rotation and is **never replaced**,
holding a GPU and a loaded model, until a human notices. Nothing in the codebase
is wrong on its own; the defect lives in the seam between a service that
publishes a verdict and a chart that consumes a status code.

This is the shape worth generalising from, and it is why the technique puts the
audience in the rule rather than in a footnote: **a promotion whose receiver
cannot branch on it has not been made.** The service's own comment asserting the
outcome ("which is what lets the process supervisor replace it") is the tell — an
outcome claimed by the layer that cannot deliver it.

## The enforcement had inverted itself

The chart is guarded by a policy gate with a must-fail fixture per rule, and one
of those rules is `probes-distinct`: readiness and liveness must not read one
endpoint, because *"a restarter and a router ask different questions."* The
diagnosis is right and the prescription had drifted — the rule's remediation
string told the operator to *"point liveness at tcpSocket 8080"*, which is the
defect, written into the gate as the fix.

That is a sharper instance of the same failure than the chart itself: the guard
existed, engaged, passed, and recommended the broken configuration. A rule can be
correct about the distinction it enforces and silent about whether either side
can see anything.

## What changed, and the paired measurement

The verdict got its own channel: a liveness path that returns 200 while starting,
loading, draining or ready, and 503 **only** on the terminal give-up. Readiness
keeps the health path; the two remain distinct, so the existing policy is
satisfied rather than circumvented. A new policy asserts the liveness path
positively, with its own must-fail fixture, so a revert fails the gate instead of
being recommended by it.

The measurable is the one the technique implies — *how many engine states does
the liveness probe replace, and how many of those are wrong* — run over the same
five states on the same instrument:

| Engine state | TCP socket probe | Terminal-verdict path | Naive: readiness path |
|---|---|---|---|
| terminal give-up | passes (never replaced) | **fails** | fails |
| model loading | passes | passes | **fails** |
| draining | passes | passes | **fails** |
| pre-engine startup | passes | passes | fails |
| ready | passes | passes | passes |

Correct replacements move **0/1 → 1/1**; false replacements stay at **0**. The
third column is not hypothetical padding — it is the obvious fix, it is what
"point liveness at the health endpoint" would have produced, and it kills pods
during model load. Measuring it is what makes the separate path a decision rather
than a preference.

Gate: the service suite passes with six new cases, and the chart gate passes with
fourteen policies where it had thirteen. One of the six new cases asserts the
negative that motivates the whole change — that all three not-ready states share
one status code — so the reason survives in the suite rather than in this
paragraph.

## What this realization cannot do

It carries the verdict across the *probe* boundary, not across the process
boundary. When the supervisor does replace the pod, the successor starts with no
memory that its predecessor gave up: the failed flag and the per-slot restart
generation are both in-memory. A deterministically broken model therefore
re-spends the full restart budget in every new pod, and the orchestrator's
crash-loop backoff paces that repetition without ever converting it into a
verdict — a rate limit is not a classification. Closing that would need the
on-disk, consume-once channel
[consume-once-mode-handoff](../techniques/consume-once-mode-handoff.md)
describes, and this tree has no such channel today.

The tree also has no cluster in reach, so the pod-replacement behaviour itself is
argued from the probe semantics rather than observed. What was measured is what
the probes answer in each engine state; that the orchestrator restarts on a
failed liveness probe is taken from its contract, not from a run.
