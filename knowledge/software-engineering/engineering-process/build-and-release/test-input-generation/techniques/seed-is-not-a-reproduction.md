---
layer: technique
type: technique
subject: test-input-generation
technique: seed-is-not-a-reproduction
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [recording a failing randomized case for later, a regression seed that no longer reproduces, deciding what a randomized suite persists when it fails]
---

# A seed is not a reproduction

A randomized run is identified by a seed, and the seed is wonderfully cheap: a
single integer, pasteable into a chat message, small enough to put in a commit
message or an issue title. That cheapness is why teams persist seeds and
believe they have persisted failures. They have not. **A seed identifies a run
only relative to the generator that consumed it**, and the generator is code
that changes.

## The four terms

A seed reproduces a specific input only when four things are held constant:
the **seed**, the **algorithm** that consumes it, the **generator's version**,
and the **parameter set**. Drop any one and the guarantee is void — the number
is the same and it now names something else entirely.

Three of those terms are usually stable across a debugging session, which is
why the seed feels sufficient. The third is the one that moves: **the generator
version is, in practice, the commit.** Any edit to a strategy — adding a field
to the generated structure, widening a range, reordering two draws, changing
how many bytes a sub-generator consumes — re-points every previously recorded
seed at a different input. Nothing about the edit looks like it touches
recorded history.

## Why the failure is silent, and why it is worse than losing the case

Replay a stale seed and the suite does not error. It generates *some* input,
runs it, and passes. The regression entry is still in the file, still green,
still counted as coverage for the defect it was created for — while exercising
an input nobody chose, related to the original only by an integer.

That is a gate reading a different target than the one it claims
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and it reports the
comfortable answer
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
a test that no longer covers its defect is spelled exactly like a test that
covers it and passes. Losing the case outright would be better, because an
absent test is visible and a lying one is not.

The trap has a cruel timing property worth stating on its own: **the edit most
likely to invalidate a recorded seed is the fix for the defect the seed
recorded.** Widening a generator so it can produce the case that broke you is
the standard repair, and it re-points the very entry that was supposed to keep
that case covered.

## The rule: persist the derived input, not the number that produced it

The seed is a convenience for *sharing a run in progress*. The persisted
artifact for a *failure* is the generated input itself, serialized.

- **On failure, write the structured input** — the composition, the operation
  sequence, the configuration and the record it was applied to — in a format
  that can be deserialized and executed directly, bypassing the generator
  entirely. It survives every generator change because it no longer depends on
  one.
- **Keep the seed beside it** as provenance, not as the reproduction. It is
  what lets someone re-run the original generator at the original commit if
  they need to understand how the case was reached.
- **Record the generator version with both.** When a persisted input stops
  deserializing because the input *type* changed, that is a loud failure and
  the correct one — a schema change genuinely invalidates the case, and you
  want to be told.

## Three lanes, and they are not interchangeable

The suites that get this right run the same code through three distinct
sources of input, and are explicit about which is which:

1. **Fresh randomness** — the exploratory lane. Its job is to find new cases;
   its schedule is long and its failures are new information.
2. **Persisted inputs** — the regression lane. Deterministic, fast, no
   generator involved, and every entry is a case that once broke the system.
   This is the lane that must never be seed-backed.
3. **Hand-written cases** — the lane for the defects a human reasoned to,
   boundaries nobody's generator reaches, and cases that document intent.

A suite with only lanes 1 and 3 keeps re-finding the same defects. A suite that
believes lane 2 is seed-backed has a regression lane that quietly stops being
one.

## Shrinking, and what the seed is genuinely good for

There is one place the seed's structure earns its keep. When the generator
consumes a finite budget of entropy, the **length** of that budget is a decent
proxy for the complexity of the structure it produces — fewer bytes, fewer
elements, shallower nesting. Shrinking can therefore be approximated cheaply by
re-running with smaller budgets rather than by writing a bespoke shrinker per
type. It is a coarse minimisation and it is nearly free, which is the right
trade for most suites. The minimal case it finds is then persisted as an input,
per the rule above.

## When not to use it

- **Where the generator is genuinely frozen and versioned**, and a recorded
  seed carries that version, the seed is a sufficient reproduction — the four
  terms are all pinned. This is rare in a test suite and normal in a shipped
  content generator, which is the boundary below.
- **Where the derived input is enormous.** Persist a locator plus the seed and
  version, accept the risk knowingly, and say so in the entry rather than
  discovering it later.
- **For sharing a run mid-investigation**, the seed remains the right currency.
  The rule is about what survives a merge, not about what goes in a message.

## The neighbouring rule in a different domain

The same four-term dependence is load-bearing in procedural content generation,
where this corpus states it from the other side — as a contract to publish to
whoever is handed the seed, since exposing a seed to a user is a promise about
reproduction. The **discriminator** is what each domain does when a term moves:

- Content generation **keeps the seed and accepts the drift.** The seed is the
  artifact's identity, regeneration under a new version producing new output is
  tolerable, and the obligation is to *state* that limit honestly.
- A test suite **cannot accept the drift**, because the recorded case exists
  precisely to survive the change that fixes it. Here the seed is provenance
  and the derived input is the artifact.

Same rule, opposite remedy, decided by whether the recorded thing is an
identity or a piece of evidence. Reaching the same four terms from two
unrelated domains is what makes them worth trusting.
