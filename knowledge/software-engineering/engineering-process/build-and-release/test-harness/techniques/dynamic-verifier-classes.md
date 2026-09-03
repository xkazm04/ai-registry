---
layer: technique
type: technique
subject: test-harness
technique: dynamic-verifier-classes
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [adding a runtime correctness checker to a harness, deciding which dynamic verifier a lane should run, a memory or concurrency defect escaped a suite that runs a verifier, a project links foreign code into a checked runtime]
---

# The two classes of dynamic verifier

A dynamic verifier is an instrument that runs the program and reports defects
the program's own assertions cannot state: invalid memory access, use after
release, unsynchronised concurrent access, values that are not legal inhabitants
of their type, leaks. Teams choose between them on the wrong axis — *what does
this one find?* — and end up with a list of overlapping bug classes and no way
to decide.

**The axis that decides is how the verifier observes.** There are two families,
they are separated by where they sit relative to the program's own semantic
representation, and every difference that matters — coverage, blindness, cost,
false-positive profile — follows from that one choice.

## Family one: re-execute the semantic representation

The first family does not run the machine code at all. It interprets the
program's own intermediate representation — the form the compiler produced
after it had resolved every rule the source language declares — and evaluates
each operation against those rules as it goes.

What follows from that position:

- **It knows every rule the language states**, including the ones that have no
  machine-code manifestation. Aliasing discipline, provenance of a reference,
  the legality of a bit pattern as an inhabitant of a type, initialisation
  state: these are properties of the language's model, and a verifier holding
  that model can refuse them precisely. Nothing observing the emitted machine
  code can see them, because the compiler discharged them and emitted code that
  assumes they hold.
- **False positives are rare**, because it is checking declared rules rather
  than inferring intent from instructions.
- **It stops dead at the edge of the representation.** Foreign code compiled
  from another language, system calls, device interaction — none of these exist
  in the representation, and the interpreter cannot execute what it cannot
  interpret. The typical failure is an explicit refusal at the call, which is
  the honest outcome; the dangerous variant is a mocked-out boundary that lets
  the run go green over a program that is not the one that ships.
- **The slowdown is one to two orders of magnitude**, because every operation
  is interpreted rather than executed.

## Family two: observe the emitted machine code

The second family runs the real binary and watches it — either by simulating
the machine that executes it, or by having the compiler insert checks into the
emitted code. Its position gives it the mirror-image properties:

- **It crosses every boundary.** Foreign code, linked libraries, and the
  allocator are all just more machine code; the verifier does not care which
  language produced them. Whole-program leak accounting only exists here.
- **It knows none of the source language's rules.** An aliasing violation that
  the compiler exploited but that produced no invalid access is invisible: the
  emitted instructions are perfectly legal machine code. The verifier can only
  see defects that manifest as bad machine-level behaviour.
- **False positives are occasional rather than rare** — custom allocators,
  hand-written synchronisation, and unusual memory-ordering all produce
  patterns the verifier's heuristics misread.
- **Cost varies by mechanism**: full machine simulation lands in the same order
  of magnitude as interpretation; compiler-inserted checks are a small multiple,
  which is what makes them affordable on a routine lane.

## The finding that decides the harness's shape

The two are usually presented as alternatives with overlapping strengths, and
the presentation hides the load-bearing fact:

> **The boundary that defeats the first family is exactly where the second
> family's findings concentrate.**

The first family stops at the seam where the program leaves its own semantic
representation — the foreign-code call, the system call, the device. That seam
is where the language's guarantees stop applying, which is where hand-managed
memory lives, which is where the defects are. So a project running only the
first family is unverified precisely at its highest-risk region, and it does
not read as a gap: the lane is green, the tests passed, the verifier reported
nothing. It reported nothing about a region it never entered
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

The rule the harness encodes: **a project with a foreign-code boundary runs one
verifier from each family, and the lane configuration says which region each
one certifies.** Not for defence in depth, and not because two are better than
one — because the union of their reach is the program, and neither half of the
union is the program.

## Placing them in the harness

- **Which lane.** Both are cost-tier decisions, not per-test annotations: at
  one to two orders of magnitude, the interpreting family runs over a chosen
  subset (the paths carrying manual memory management) on a scheduled or
  merge-gated lane, never on every save. The cheap compiler-inserted variant of
  the second family can sit on a routine lane.
- **Which population.** Both families verify whatever the driving suite
  executed, and nothing else — see
  [verification-inherits-driver-reach](./verification-inherits-driver-reach.md),
  which is the other half of reading these lanes honestly.
- **Structuring for affordability.** If the code needing the expensive verifier
  can be concentrated behind one build-time boundary, the expensive lane runs
  over a fraction of the tree rather than all of it. That is a build-shape
  decision made for a verification reason, and it is the difference between a
  lane that runs and a lane that is disabled after the first slow week.
- **A rung below both.** There is usually a cheap instrument that enables extra
  runtime checks in the standard library and runs at near-native speed,
  catching a subset of the same defects. It is not a substitute for either
  family — it is the rung that runs on every commit so the expensive lanes
  face fewer surprises.
- **Never composed in one run.** These instruments rewrite or reinterpret the
  artifact, and two rewriters in one build collide; see
  [isolation-lanes](./isolation-lanes.md).

## When not to run the second family

Where the program has **no foreign-code boundary at all** — everything is in
one language, no linked libraries outside it, no direct device interaction —
the second family adds a large cost and an occasional false positive for a
defect class the first family already covers more precisely, in the one
representation that can state the rules being broken. Run the interpreting
family alone, and revisit the day the first foreign dependency lands, because
that day is a change in what the harness can see, not merely a change in what
it builds.

The symmetric case: where the risky code is *entirely* foreign, the first
family has nothing to interpret and its refusal at the boundary is the whole
run. Run the second family alone and do not pretend the first one is covering
anything.
