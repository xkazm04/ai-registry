---
layer: technique
type: technique
subject: runner-fleet
technique: capability-typed-queues
status: forged
stage: multi-service
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a job needs a specific platform or toolchain, adding a second kind of runner, a test suite silently skipped what it could not run]
---

# Capability-typed queues

Runners declare what they are. Jobs declare what they need. The delivery system matches them.
Nothing hard-codes a machine.

The indirection sounds like scheduling hygiene and is really about correctness: an unsatisfied
requirement must produce a job that does not run, never a job that runs and quietly does less.

## Declare, request, match

**Runners declare** their properties as data: operating system, architecture, toolchain
versions, hardware capabilities, network position, size class. Declared, not inferred — a
scheduler probing a machine to find out what it is will be wrong the week someone changes the
image.

**Jobs request** capabilities, not machines. `needs: a Linux runner with the pinned toolchain
and container support`, never `run on that pool`. The difference matters when the fleet
changes: requests keep working across a pool rename, a migration, or a capacity split; hard-
coded pool names break, and they break in the configuration of every repository at once.

**The match is exact and total.** Every requested capability is satisfied or the job does not
start.

## The unsatisfiable request must fail loudly

This is the rule the technique exists for. Three behaviours are possible when nothing satisfies
a request, and two of them are wrong:

| behaviour | verdict |
|---|---|
| queue indefinitely, silently | wrong — an invisible stall, diagnosed hours later as "the build is slow" |
| run somewhere close enough | **worst** — a wrong answer delivered as a right one |
| fail immediately, naming the unsatisfied capability | correct |

The second deserves the emphasis. A job needing a capability, landing where it is absent, and
producing a green result is the failure-not-empty-success shape at its most expensive: a suite
that skips what it cannot execute and reports success, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). Nobody is looking
for it because the signal says everything is fine.

The corollary sits inside the job as well as outside it: a job that requires a capability
asserts its presence before doing work. A build requiring a specific toolchain checks the
version it actually got and fails on mismatch rather than proceeding with whatever was there.
The fleet's matching and the job's assertion are two independent checks of one requirement, and
both are cheap.

Queueing with a **bounded** wait is a legitimate middle path where capacity is elastic and a
runner is being acquired — the bound is what separates it from the silent stall. When it
expires, the job fails naming the capability.

## One authority per capability name

The capability vocabulary is a vocabulary, and per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary) it gets one
definition:

- **One place a capability name is defined**, with its meaning. Two names for one property —
  or worse, one name meaning two things on different pools — is the drift machine.
- **One place a version is pinned.** The characteristic smell is a toolchain version repeated
  in every job of every workflow. Eight copies is eight places to update, seven places to
  forget, and a class of failure where most jobs move and one does not. Declare it once and
  reference it.
- **Names describe capability, not history.** A pool called after the team that first needed it
  tells a reader nothing about whether their job can run there, and the name outlives the team.

## Size as a capability, and its cost

Runner size — cores, memory, disk — is a capability like any other, and typing it lets heavy
jobs get big machines while cheap jobs get small ones. Two cautions:

- **Size requests are unverifiable claims** unless something checks them. A job requesting a
  large runner because it once ran out of memory keeps that request forever, long after the
  cause is fixed. Review size requests against measured usage periodically, or the fleet drifts
  upward in cost with no corresponding need.
- **Every distinct size is a separate pool** with its own queue and its own idle capacity. Five
  sizes is five pools, each of which can be simultaneously starved and idle. Fewer types, more
  depth per type; add a type when a measured need exists, not in anticipation.

## When NOT to type

- **One kind of work on one kind of machine.** The declaration layer is overhead with no
  decision behind it. A single pool named plainly is right, and stays right for a long time.
- **As a substitute for fixing an environment difference.** If a job only works on one runner
  and nobody knows why, typing that runner encodes the mystery. Find the difference and declare
  *it*.

## Decision rules

- Runners declare properties as data; jobs request capabilities; nothing names a machine.
- Unsatisfiable requests fail immediately, naming the capability — never queue silently, never
  run somewhere close enough.
- Bounded queueing is allowed where capacity is elastic; the bound is mandatory.
- A job asserts the capabilities it required, inside the job, in addition to the match.
- One definition per capability name; one pin per version; names describe capability, not
  history.
- Treat size as a capability, review size requests against measurement, and keep the number of
  types small.
- Do not type a single-shape fleet, and never type around an unexplained environment difference.
