---
layer: technique
type: technique
subject: test-harness
technique: mutation-lane-with-a-triaged-baseline
status: forged
laws: [count-carries-predicate, failure-not-empty-success, gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [code runs under test but nothing checks what it does, deciding whether to add mutation testing and where it belongs in a pipeline, a mutation run is too long to run per change, a sharded run loses the same shards twice, a surviving mutant must be sorted into a missing assertion or an equivalent change, a mutation tool version bump changes the missed count]
---

# A mutation lane with a triaged baseline

[unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md) says a test
that never reaches a decision cannot pin it. Coverage cannot see the neighbouring
case, where a test reaches the decision and asserts nothing that depends on it.
Mutation testing can: it injects one small defect at a time (a flipped comparison, a
function body replaced by a default, a deleted match arm), reruns the suite, and
reports the mutants nothing noticed. A surviving mutant is one of exactly two
things: an assertion that cannot fail for the reason it states, or a change that is
not observable. Telling them apart takes a person, and that fact shapes everything
about where the lane sits.

It is also the reach probe of that technique run by a machine: "mutate what the test
claims" needs someone to pick the claim, and a mutation run picks all of them. The
survivor to read first is the one inside a function that already has a test *named
for* it, because that is the overstated name of the same technique caught in the
act: a rule's own test was answered by a stored row before the rule was consulted, so
the rule's branch could be deleted with the named test green.

> **Mutation score is a means, not a target.** The signal is narrower than coverage:
> code that runs under test while nothing checks what it does. A lane that optimises
> the percentage trains the suite to kill mutants, not to pin behaviour.

## Where it lives: a scheduled report, not a gate

A mutation run is one rebuild and one suite execution per mutant, roughly a thousand
mutants for a mid-sized module set, and each survivor needs a human decision. That
makes it unfit for the per-change gate and right for a weekly lane with three rules:

- **Survivors never turn the run red.** They are a report on the run summary. What
  does turn it red is anything that means the report did not run: a build that
  fails, an unmutated baseline whose own tests fail, a configuration error. A report
  that silently did not run is the failure this lane exists to catch
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **Scope is declared and narrow.** Mutate the modules where a silent failure costs
  most: compaction and truncation arithmetic, the loop's dispatch, pricing math,
  signing. Leave out wire-format code that mock-boundary tests already pin
  byte for byte, and opt-in code whose mapping a separate audit already diffs.
  Write the reason beside each exclusion.
- **Pin the tool's version.** Mutant generation changes between releases. Bump it
  deliberately, after re-running the baseline locally, so that an unexplained jump
  in the missed count means the tests changed, not the tool.

## Make it affordable before making it frequent

The cost is the build, not the tests. In one measured lane each mutant cost about
205 seconds to build and 26 to test, because the caching action that restores
dependencies also disables incremental compilation for the whole job, so every
mutant relinked every test binary from scratch. Turning incremental builds back on
for the mutation step alone took a mutant to roughly 11 to 33 seconds of build, so
a mutant went from about 230 seconds in total to under a minute, and with the
shard count doubled the full 928-mutant run finished in 30 minutes. Other levers, in order of
what they bought: a test profile at a middle optimisation level with no debug info
(the long replays dominate an unoptimised run), tests only with doctests and
examples skipped (recompiling every doctest cost about three minutes per mutant),
and a timeout derived as a multiple of the unmutated test time so a mutant that
turns a loop bound into an endless loop times out rather than hanging the shard.

Where a full run still takes most of a day, **take the baseline as a sample, and
sample the way that spreads across modules**: every tenth mutant by index (a
round-robin shard), not the first tenth, so each module is represented in
proportion to its size. A sample is a baseline with its predicate stated
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): say it
is a sample, which shard, of how many, at which commit.

## A lane that loses the same shards twice is reporting a defect, not an outage

The first two dispatched runs of that lane lost four of eight shards to "the runner
has received a shutdown signal", with no error from the tool. The first reading was
infrastructure, so about twenty gigabytes of disk were freed. The second run lost
**the same four shards** with plenty of disk. That repetition was the diagnosis: a
fault that follows the shards is a fault in the work, not in the host.

The work was a handful of mutants in one function that advanced a cursor by one and
pushed a result on every step. Changing any of its increments to a decrement or a
multiply makes it revisit an element forever, pushing each time. The test process
grows until the runner is shut down for memory, before the tool's own timeout can
fire. Round-robin sharding had placed those eight mutants in four different shards,
so half the run vanished from eight mutants.

Three lessons transfer:

- **A mutant that does not terminate and allocates can kill the host before the
  timeout.** Exclude such mutants by pattern with the reason written down; they are
  detected, not missed, because any test that reaches the function hangs on them.
- **Log the host's state in the lane's first step**, so a runner that dies mid-run
  leaves evidence. Without it, the dead shards had nothing to inspect.
- **Treat repeated loss of the same units as content.** If a retry loses the same
  shards, stop investigating the host.

## Triage into four bins, and record the survivors against what they mean

Sort every non-detected mutant:

1. **A real test gap**, with the missing assertion named. One baseline's gaps
   included a throttle whose interval was never set by any test, an adapted ratio
   that the loop could silently discard because only the function computing it was
   tested, a queue of steering messages that a mutant could replace with a second,
   already-drained poll, and a model-preset constant that nothing pinned.
2. **A boundary case**, real but low priority: a comparison that differs only at
   one exact value.
3. **Equivalent or acceptable**, with the reason: a mutated guard that only gates a
   log line, an arithmetic change whose result is identical at the one input that
   reaches it, a default that equals the explicit value. Do not reopen these unless
   the code around them changes. Note which are equivalent *only because a default
   has its current value*; they stop being equivalent the day it changes.
4. **Unviable**: the mutant does not compile, usually because the type has no
   default. Unviable says nothing about the tests and stays out of the detection
   rate.

Keep the triage in a document next to the lane, not in the tool's exclusion list.
Survivors are matched by file, line and column, which drift with every edit, so an
exclusion list keyed that way goes stale at the first change and then excludes
nothing or the wrong thing. Future runs are triaged by what *changed* against the
document, and the known survivors are not argued twice. Report the detection rate
per module as well as in total; in one lane it ranged from 65% for the loop and the
compaction state machine to 100% for the code that resolves price layers.

## Decision rules

- Run mutation on a schedule as a non-blocking report; make a failed build, a
  failing unmutated baseline or a bad configuration fail the run.
- Declare scope by where silent failure is costly, and write the reason for each
  exclusion.
- Pin the tool version; re-baseline before bumping.
- Fix the build cost first (incremental builds, a middle profile, no doctests,
  a derived timeout); then shard round-robin.
- When the baseline is a sample, say which sample.
- Exclude non-terminating allocating mutants by pattern and say why; log host state
  first; read a repeated shard loss as content.
- Triage into gap, boundary, equivalent and unviable; keep it in a document, not
  in line-keyed exclusions; report detection per module.
