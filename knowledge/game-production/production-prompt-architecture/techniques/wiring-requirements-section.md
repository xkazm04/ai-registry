---
layer: technique
type: technique
subject: production-prompt-architecture
technique: wiring-requirements-section
status: forged
laws: [compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [assembling a prompt whose output must run inside an existing system, generated artifacts compile but nothing happens at runtime, deciding what the output schema of a production prompt must require]
---

# The wiring requirements section

Every production prompt carries a section stating how the artifact it produces must attach
to the running system. The doctrine of what a wiring contract *is* — its four fields, what
makes a claim substantive, how it is checked — is owned elsewhere as a contract in its own
right. This technique owns only its **place in the prompt skeleton**: that the section
exists, where it sits, what it must render, and what it demands back in the output.

## The obligation

A producer told what to build builds that and stops. It has satisfied the instruction it was
given, and the instruction did not mention being reachable. What comes back compiles, loads,
validates — and is never granted, never triggered, never referenced by anything running.
This is [`compiling is not wiring`](../../_laws.md#compiling-is-not-wiring), and the only
reliable cure at authoring time is to put the demand in the prompt, before generation, in
its own section.

## What the section renders

Four sub-prompts, one per field the artifact must declare, plus an explicit refusal of the
weak stopping point:

- **Granting or registration** — how the artifact enters the system's registry of live
  things.
- **Activation** — what triggers it at runtime.
- **Dependencies** — what companion artifacts it needs, with any dependency that **cannot be
  authored by this producer flagged as such**. A producer that cannot create a thing and is
  not told to flag it will describe creating it, and the description will read as done.
- **Verification** — one observable check that proves the wiring works: a log line, an
  on-screen value, an assertion. Named concretely, at a stated level of evidence.

The section states, in words, that the bar is not "it compiles". That sentence does work:
without it, "verification" is answered with "the build succeeds"
([`structural proof is never sufficient`](../../_laws.md#structural-proof-is-never-sufficient)).

Where per-artifact wiring is already known — because someone authored it upstream — render
it as a table of concrete rows rather than as prose, and render an undeclared field as an
explicit gap addressed to the producer ("undeclared — name it") rather than as a blank. A
blank is invisible; a gap phrased as an instruction gets filled.

## The reciprocal output field

The section is only half the mechanism. It must be paired with a **required field in the
output schema** in which the producer restates the four points for each artifact it
produced. Without that field, adherence is unobservable: the instruction was given, and
whether it was followed can only be established by reading the generated artifact and
inferring. With it, a downstream checker reads a structured claim, and a self-reported claim
that is present, specific and checkable is a far better input to a verdict than silence —
while remaining, as always, a claim rather than the verdict.

## Decision rules

- **Render the section only when there is something concrete to say.** Generic wiring
  boilerplate on every prompt — including prompts producing artifacts that wire to nothing —
  trains the producer to skip the section, and it will still be skipping it on the prompt
  where the table had six rows. When no per-artifact hints and no known dependencies exist,
  omit the section.
- **When the artifact class is known to have editor- or tool-authored dependencies that no
  code generator can create**, list them by name in the section. This is the single highest-
  value content it can carry, because it is the failure the producer cannot detect itself.
- **Position it after the task and the specification, before the acceptance criteria.**
  Wiring is a property of the thing being built, so it must follow the description of what
  is being built and precede the statement of when it is done.
- **One renderer, shared by every drive path.** The interactive path and the unattended path
  must emit the identical section; two renderers is two contracts.

## When not to use this

- **Artifacts with no runtime attachment** — a document, a data table consumed by an
  existing loader, an analysis. Rendering wiring demands here produces invented wiring
  claims, which are worse than none because they are specific.
- **Repair tasks on already-wired artifacts**, where the wiring exists and is not in scope.
  State the existing wiring in the project-state section instead, as a constraint to
  preserve.
- **As a substitute for the wiring check.** The section makes the producer declare; it does
  not make the declaration true. A pipeline that renders the section and never verifies the
  claims has bought a better-written failure.
