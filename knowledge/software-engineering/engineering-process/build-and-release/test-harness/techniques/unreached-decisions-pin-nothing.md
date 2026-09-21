---
layer: technique
type: technique
subject: test-harness
technique: unreached-decisions-pin-nothing
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate]
shared_with: []
applied: code
ab_verdict: better
use_when: [a test forces a dependency to fail so the fallback answers, a suite asserts a value a cache or a default could also have produced, a test file claims to pin a decision the run never executes, deciding whether a green suite covers the argument that crosses a process boundary, a fixture is named the way the resolver's default would name it, a mutated payload is rejected by an outer check before it reaches the parser]
---

# An unreached decision pins nothing

A test is written against a decision: which locale the engine is asked for, which
resolver answered, which of two artifacts was loaded, which branch produced the
number. Then the file arranges an environment in which that decision cannot run —
a poisoned dependency so nothing is spawned, a seeded cache so nothing is
computed, a search path on which an older copy of the artifact is found first, an
outer validity check ahead of the mutated input — and asserts the value anyway.

The assertion passes, because **something else answered with a value of the same
shape**: the cache's stamp, the default, the previous build, the container gate's
rejection. Nothing in the report distinguishes *the decision was made correctly*
from *the decision was never made*
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)), and
the file's own comment — usually a careful paragraph naming the defect it closes —
is what a later reader trusts instead of the evidence.

This is not the instrument being broken. The runner works, the suite is red on
ordinary mistakes, the assertion is sharp. The input never arrived
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The reach probe: mutate what the test claims, not what it reaches

[negative-control-tests](./negative-control-tests.md) proves a test can fail by
breaking the thing under test and watching the assertion fire. That procedure is
sound and it is blind here, for one reason: the mutation is chosen from the code
the test *reaches*, so it lands on whatever producer answered, goes red, and
certifies the reachable half. The wrong copy of the artifact fails exactly as
convincingly as the right one.

The probe for this class is chosen from the other side:

> **Take the sentence the test file says it pins. Mutate the code that sentence
> names — not the code the test touches — and run the file unchanged. A green run
> is the finding.**

Three mutations, cheap and ordered:

- **Re-introduce the original defect** the file says it closes. Green means the
  file is documentation.
- **Change the value only at the crossing** — the argument as it is handed to the
  other process, the flag as it is written into the request, the path as it is
  passed to the loader — leaving every in-process derivation correct. This is the
  mutation that survives, because the derivation is what the reachable assertion
  reads.
- **Delete the decision entirely** and let the far side take its own default. A
  suite that stays green here has been measuring the far side's default all along.

Report the outcome as a count with its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): *three
mutations of the decision, one caught*, never *the suite is green*.

## Repair, in preference order

**1. Make the decision reachable.** Lift it out of the unreachable region into a
pure unit the test can call — the function that builds the argument list, the
function that picks the branch, the function that resolves the name — and assert
its output directly. The decision is then covered by an ordinary test at full
strength, and what remains unreachable is only the *wiring*: that the unreachable
site calls this unit with these arguments.

Pin the wiring explicitly rather than hoping. Where the site itself cannot be
executed in the lane, a structural assertion over the calling code is the honest
interim — and it is weaker than it looks, because it pins the text and not the
behaviour, so it belongs beside a comment saying so and inherits the drift
problem that [prose-rule-drift](../../../standards-and-gates/quality-gates/techniques/prose-rule-drift.md)
describes. Prefer a lane that can execute the site once over a permanent text
match.

**2. Make the answer name its producer.** Where the value can be produced by more
than one path, the value alone is not evidence; the answer carries a
discriminator and the test asserts the discriminator beside it. Four shapes, all
cheap:

- **A branch tag in the result.** The payload says which branch composed it — the
  model's verdict or the deterministic template, the authoritative source or the
  degraded one. A consumer usually needs this anyway, to render honestly.
- **The identity of the artifact that answered.** The loaded build's version, the
  resolved file, the binary's own stamp, asserted once at the start of the lane.
  A loader that refuses when the identity disagrees converts the whole class into
  a startup failure.
- **The attempt's own record.** Where the far side cannot run, the attempt is
  still observable: what was about to be sent, recorded in process at the call
  site, read by the test after the expected failure. A rejection that names what
  was attempted is a witness; one that names only the failure is not.
- **A fire count published with the verdict.** Over a suite or an evaluation, the
  number of cases in which the mechanism actually engaged is a precondition on the
  result's meaning: a corpus that carries no instance of the feature under test
  returns *blindness*, not confirmation, and a report that says "no difference"
  over zero engagements has measured its own inputs.

**3. Choose a fixture the other producer cannot answer.** The cheapest repair
where a default or a fallback is what shadows the decision: pick an input whose
correct answer differs from the one the fallback would give. A fixture named the
way the resolver's default names things is answered by the default whether or not
resolution works; rename it to something no default reaches, and the value alone
discriminates again. Symmetrically, a mutated input that an outer validity check
rejects never reaches the code being exercised, so the mutation has to be carried
*inside* a valid envelope — the wrapping is what makes the input arrive at all
(the pipeline case is
[stage-ordered-fuzz-targets](../../test-input-generation/techniques/stage-ordered-fuzz-targets.md)).

## Deliberate unreachability is a good tool, with one obligation

Forcing a dependency to fail is often exactly right: a poisoned dependency is the
sharpest available **witness of non-reach**. "A cache hit returns cleanly while a
miss throws" proves the cache gated the expensive path, and no positive assertion
proves it as well. Keep the idiom.

The obligation is that the file say which decisions it therefore cannot cover, and
that those decisions be somebody's. The expensive failure is two suites either
side of a boundary, each pinning its own half correctly — the far side proving it
honours the argument it is given, the near side proving the value it derives —
with the *handing over* of that argument covered by neither, and both files
reading as thorough. Name the crossing in one of the two files, with the lane that
covers it or the reason there is none.

## Boundaries

- [out-of-graph-artifacts](./out-of-graph-artifacts.md) is the population
  question: the artifact no gated root reaches. Here the artifact is in the graph
  and a test is running against it; what did not arrive is the *input*.
- [verification-inherits-driver-reach](./verification-inherits-driver-reach.md)
  is the reach of an observing instrument over a suite that ran. Here the
  question is whether a single named decision ran at all.
- [gate-liveness](../../../standards-and-gates/quality-gates/techniques/gate-liveness.md)
  asks whether the instrument worked; a seeded failure settles it. That probe
  passes here, on the producer that answered, which is why this class needs its
  own.
- [vacuous-by-evaluation](../../../standards-and-gates/quality-gates/techniques/vacuous-by-evaluation.md)
  is the case where the layer under the check supplies the condition the check
  asserts. The predicate there is unfalsifiable by construction; here it is
  falsifiable and was evaluated against the wrong producer.

## Decision rules

- **A file's claim about what it pins is a hypothesis.** Settle it by mutating the
  decision it names, not the code it reaches.
- **Where two producers can yield the value, assert the producer.** A value with
  no producer named is one observation of two possible worlds.
- **A deliberately unreachable region is declared, with its uncovered decisions
  listed**, in the file that made it unreachable.
- **Lift an unreachable decision into a reachable unit** before settling for a
  structural assertion over the calling code; a text match is an interim, and it
  says so in its own message.
- **Publish engagement beside the verdict.** No-difference over a population the
  mechanism never fired on is blindness, and is reported as blindness.
- **A mutation must arrive.** Wrap it in whatever envelope the outer checks
  demand, or the outer check is what was tested.

## When not to use it

- **Where only one producer exists.** A value that nothing else in the system
  could have produced needs no discriminator, and adding one is ceremony.
- **Where the decision is genuinely covered on the far side and the crossing is
  typed.** A compiler-checked call across a module boundary does not need a
  behavioural pin; an argument marshalled into strings for another process does.
- **Where making the decision reachable would build a second implementation of
  it.** A parallel test-only path answers a question about itself; prefer a lane
  that can execute the real site, however rarely, and say what the fast lane
  cannot see.
