---
layer: technique
type: technique
subject: production-prompt-architecture
technique: fixed-section-order
status: forged
laws: [law-and-check-share-one-source]
shared_with: []
use_when: [defining the skeleton every production prompt must follow, prompts for adjacent tasks have diverged in structure, you cannot tell which prompt change caused a quality change]
---

# Fixed section order

A production prompt is assembled from a closed, ordered set of named sections. The order is
part of the contract, not a formatting preference. This technique defines the set, argues
the order from function, and states what a section must and must not contain.

## The set

Each section answers one question and answers it in one place:

| Section | Answers | Required |
| --- | --- | --- |
| Environment and project context | what am I working inside, at what version, with what already present | yes |
| Standing craft bar | what dimensions will this be judged on, in every task of this kind | no |
| Domain framing | what role am I playing for this class of work | no |
| Task | what am I being asked to produce | yes |
| Specification | the typed payload of the specific thing being produced | no |
| Wiring requirements | how the result must attach to the running system | no |
| Domain constraints and pitfalls | what has gone wrong here before | no |
| Output shape | in what form must I return it | no |
| Acceptance criteria | what does done mean for this task | no |

Two are required and assembly **fails loudly** when either is absent — a prompt with no
context or no task is not a degraded prompt, it is a bug that will be answered anyway.
Everything else is conditional on having something concrete to say.

## Why this order

- **Context first** because every instruction after it is read inside the frame it sets. A
  constraint stated before the reader knows the environment is read as a general principle;
  after, it is read as a rule about this project.
- **The standing bar early**, immediately after context, so the producer is playing the role
  it will be graded in from the first token rather than discovering the bar at the end.
- **Task before constraints** because a constraint is only interpretable against a task. The
  same pitfall list read before the task is trivia; read after it, three items are relevant
  and the producer can tell which.
- **Output shape and acceptance last**, closest to generation, because they describe the
  shape of what is about to be written and that is what the producer holds in working
  attention as it starts.

## Decision rules

- **When a section has nothing concrete to say, omit it — do not emit boilerplate.** A
  wiring section with no known wiring, rendered as four generic instructions, appears on
  every prompt and teaches the producer that sections are skimmable. The cost of that
  training is paid on the prompts where the section *did* have content.
- **When a new kind of content appears twice, it becomes a section in the assembler** — with
  a name, a position and a rule for when it renders. It never becomes a paragraph appended
  inside an existing section, because that is how sections stop meaning anything.
- **When two drive paths produce the same kind of prompt** (an interactive surface and an
  unattended one), they share one assembler. Two assemblers for one prompt shape drift, and
  the drift is invisible until output quality differs between paths for reasons nobody can
  name. This is [`law and check share one source`](../../_laws.md#law-and-check-share-one-source)
  applied to the prompt itself: the thing that instructs and the thing that instructs
  elsewhere are one statement.
- **When you need a variant, parameterise the section, do not fork the assembler.**
- **Order is never conditional.** A section that sometimes appears before the task and
  sometimes after destroys the property the order exists for.

## What the order buys you

Three capabilities, none of which survive an ad-hoc prompt:

1. **Auditability.** A canonical set with canonical positions is something a checker can
   assert against a finished string.
2. **Readable diffs.** Two revisions of a prompt diff section against section, so a review
   can ask "why did the constraints section grow" rather than reading 400 lines of text.
3. **Attributable measurement.** When output quality moves after a prompt change, a fixed
   skeleton lets the change be attributed to one section. Without it, the only available
   description is "the prompt was edited", and no revision can ever be evaluated.

## When not to use this

- **Exploratory and one-shot prompts.** A scratch investigation does not need the skeleton
  and forcing it wastes the assembler's budget. Keep these outside the production path
  deliberately, rather than letting them accumulate there unnoticed.
- **Prompts with no target project.** When output is not going to be integrated anywhere —
  a summary, a classification, a question — most of the skeleton has nothing to say and the
  discipline that matters is a different one.
- **Very short single-turn prompts** where the whole content is one instruction. A skeleton
  around three words is ceremony; the honest form is to say so, not to render eight empty
  headings.
