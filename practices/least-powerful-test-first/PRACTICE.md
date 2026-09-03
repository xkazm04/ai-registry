---
id: least-powerful-test-first
dimension: D6
applies-when: "The repo has more than one kind of test - unit, integration, end-to-end - and nothing written down says which kind a given change should get, so the choice is made per author and drifts upward."
---

# Least powerful test first

**What it gives you:** a one-sentence rule, plus the prohibitions that make it enforceable in
review, for the question every contributor answers by guessing - *what kind of test does this
change need?*

**Dimension:** D6. **Starter:** [`starter/TEST-GUIDELINES.md`](starter/TEST-GUIDELINES.md).

## The shape

Four parts, in this order, in the contributing guide where a contributor meets them.

1. **The rule, stated once:** *use the least powerful method of testing available to you.*
   Powerful means "reaches further into the real world" - and therefore slower, more
   fragile, and harder to attribute a failure in. The rule says the default direction is
   **down** the ladder, so an under-determined case has an answer rather than a debate.
2. **The ladder, named.** Typically unit, doc or example, integration, end-to-end. Each rung
   is defined by *what it is allowed to touch*, never by which directory it lives in.
3. **The prohibitions, as MUST NOT.** This is the half that gets skipped and the half that
   makes the rule usable. Each rung carries the sentence that says when it is the wrong
   choice - *integration tests MUST NOT be used when a unit test is sufficient*, *end-to-end
   tests MUST NOT be used where an integration test is sufficient*, *unit tests MUST NOT
   contact a live service*. A prohibition is citable in review; a preference is arguable in
   review, and the argument is lost by whoever has less time.
4. **The per-module assignment.** For each module or package, the rung it defaults to and
   the rung it is allowed to reach, in one line each. This is what converts the rule from
   advice into a fact a reviewer can check without judgement.

## Why this shape

Every test tier catches defects the tier below cannot see, and costs an order of magnitude
more to run, to write, and to diagnose. A defect caught in the end-to-end lane is nearly
always a unit test that was never written, paid for at a thousand times the price and
discovered a day later. Without a stated default, authors drift **upward**: the higher tier
is easier to write (fewer decisions about what to isolate), it feels more convincing, and
nobody is ever criticised for testing too much. The drift is invisible per change and
decisive in aggregate - a suite that takes twenty minutes and fails for environmental
reasons twice a week.

The prohibitions matter more than the ladder because the ladder alone is a description and
descriptions do not settle arguments. "This could be a unit test" is an opinion; "integration
tests MUST NOT be used when a unit test is sufficient" is a line to cite, and citing a line
takes ten seconds where arguing takes a thread.

The per-module assignment matters because "sufficient" is the word the prohibitions turn on,
and it is answerable only with knowledge of what a module does. Writing the answer down once
per module removes the judgement from the review, where it was being re-made by whoever
happened to be reading.

## Rules

- The default test command must never need a live dependency. Whatever mechanism separates
  the hermetic lane from the rest - directory, naming convention, an opt-in marker - the
  invariant is that a fresh clone runs the default command and it passes with no network,
  no credentials, and no cluster.
- A test that reaches a live dependency says why, in the same place it is marked. A marker
  with a reason string can be read and re-tested; a bare one cannot.
- The top rung is scoped to what only the real environment can falsify - identity,
  packaging, wiring, startup, deployment configuration - and is kept deliberately trivial.
  If it asserts business logic, that logic has no test at the rung that should own it.
- A defect that escaped to a higher rung is a finding about the lower rung. Record which
  rung caught it; the distribution is the practice's health metric.
- Doc or example code that would contact a live service is compiled but not run.

## How to tell it is working

- The default test command passes on a fresh clone with no external setup. Test this on a
  real fresh clone; it is the single most informative check in the practice.
- Reviews cite the prohibition by name. If nobody ever cites it, it is not being read, and
  the guide is decoration.
- The top rung is small and stays small. Growth there is the drift the rule exists to stop.
- Every live-dependency marker carries a reason. Count them both ways; the numbers should
  be equal.

## Adopting it

1. Write the ladder for the rungs you actually have. Do not invent a rung to be complete.
2. Write one MUST NOT per rung. Keep them short enough to quote.
3. Add the per-module assignment table. This takes an afternoon and is the part that makes
   the rest enforceable.
4. Make the default command hermetic. If it is not today, that is the first change, and it
   is usually one marker per offending test plus a reason string.
5. Look at the top rung and ask, per test, what it proves that the rung below could not.
   Anything without an answer moves down.

## Anti-patterns

- **A ladder with no prohibitions.** It describes the tiers and settles nothing.
- **"Write tests at the appropriate level."** Appropriate is the word the practice exists to
  define, and a guideline that uses it has deferred the entire question.
- **An end-to-end suite that tests logic.** It is slow, it is flaky, and it means the logic
  has no cheap test; the top rung is for the properties that only the real environment can
  falsify.
- **A default command that needs a credential.** Every contributor pays the setup cost
  before their first green run, and some of them never get one.
- **Deleting the assignment table because it goes stale.** A stale table is corrected in one
  line; its absence sends the judgement back into every review.
