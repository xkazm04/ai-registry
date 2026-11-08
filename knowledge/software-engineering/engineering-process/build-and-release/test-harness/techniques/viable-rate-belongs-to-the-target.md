---
layer: technique
type: technique
subject: test-harness
technique: viable-rate-belongs-to-the-target
status: forged
shared_with: []
use_when: [deciding whether to adopt a test generator from a pilot's numbers, a generator's success rate was measured on a different language or repository, budgeting reviewer time for generated tests, a vendor or sibling team quotes a viable-test percentage, extending a generator that worked on one part of a repository to another]
applied: blind-ab
ab_verdict: better
laws: [count-carries-predicate, gate-sees-target]
---

# A generator's viable rate belongs to the target

A test generator's headline number is the share of its output that is *viable*: it
builds, it runs in the suite's own harness, it passes against the current code, and it
asserts something. That share is usually quoted as if it described the generator. It
describes the pair. One generation pipeline, run by one organization with one model and
one prompt discipline, has been measured at roughly one viable test in five on one
language ecosystem, two in five on a second and four in five on a third. Nothing about the
generator changed across that spread; the targets did.

So a rate measured anywhere else is not a forecast for here
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)): the
predicate of "80% viable" includes the build system, dependency injection, mocking
surface and runner it was measured against. A pilot on the cheapest corner of a
repository says nothing about its expensive corner, even inside one repository.

## The step

1. **Write down what "viable" means here before any run**: builds under the project's
   own runner, passes, and fails when the code under test is broken (one negative
   control per sample, [negative-control-tests](./negative-control-tests.md)). A test
   that passes and can never fail is not viable, and counting it is how a rate inflates.
2. **Measure per target, not per repository.** Each language, build system and test
   lane with its own harness is a separate target; sample each that the rollout would
   cover. A repository-wide average hides the lane where the rate collapses.
3. **Decide on the local number against a threshold set before the trial.** The
   threshold comes from what a non-viable test costs a reviewer here, not from the
   pilot's figure.
4. **Do not import the explanation either.** Why a target scores low (setup cost,
   isolation, mocking) is a hypothesis to check on the local failures, not a property
   of the language to plan around. Read the rejected outputs and classify them first.

## Boundary

This prices adoption. Whether the viable tests are worth keeping is a separate question
about what they pin ([unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md)).
