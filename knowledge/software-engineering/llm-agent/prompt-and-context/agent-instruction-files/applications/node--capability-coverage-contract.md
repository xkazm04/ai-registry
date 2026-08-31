---
layer: application
type: application
subject: agent-instruction-files
technique: capability-coverage-contract
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node: a skill registry that is sound and 63% incomplete

The `gravitone-gcloud` repo carries both halves the contract needs: a
machine-readable enumeration of agent capabilities (`.personas/skill-registry.json`,
generated, carrying a `skills` list) and the instruction surfaces an agent
reads when it opens the repo (`CLAUDE.md`, `AGENTS.md`). That makes it a
place where the technique's precondition — the runtime can list its own means
— is already satisfied, so the enumerated form of the test is writable today.

## Measurement

Both directions of the contract, run over the tree as it stands:

| direction | result |
|---|---|
| **soundness** — every registered skill exists on disk | 19 of 19 |
| **soundness** — every skill on disk is registered | 19 of 19 |
| **completeness** — every skill named in the instruction surfaces | **7 of 19** |

Twelve are unnamed: `conform`, `consult`, `dojo`, `gauntlet`, `leonardo`,
`motionize`, `onboarding`, `prototype`, `research`, `ship-loop`, `tiger`,
`train-style`.

The split is the technique's whole argument in one table. The direction with
an error attached is perfect. The direction that fails silently is at 37%,
and nothing in the repo reports it, because a periodic reading of an
instruction file cannot notice that it does not mention the thirteenth thing.

## Why this is `better` and not merely a number

An earlier probe of the same repo's other enumeration — the deployment
capability matrix, five flags — found 0 of 5 named in any instruction
surface. That one is a weaker test and is recorded here as such: the matrix
is read by product surfaces at runtime to hide or explain controls, not by an
agent choosing among means, so an unnamed flag there costs nothing. The skill
registry is the opposite: it is precisely a set of means an agent selects
from, and a skill absent from the planning surface is one the agent will not
reach for. Naming the seam correctly is what separates a coverage gap that
matters from a coincidence of vocabulary.

The arms are the two forms the test can take, and the repo's own structure
decides between them. A named-form test would hardcode the twelve; it would
pass on the day it was written and go stale on the twentieth skill. The
enumerated form reads `skills` from the generated registry, and covers a new
skill the moment it is generated. The registry is regenerated as build state,
so the enumerated arm costs one file read and no maintenance.

## The finding the measurement cannot make

**How many of the twelve are deliberate.** A curated subset is legitimate —
some of those skills are plausibly internal, situational, or superseded, and
a planning surface that named all nineteen would be paying the dilution tax
this subject spends most of its length arguing against.

Nothing in the tree declares which. That is not a gap in the measurement; it
is the finding. An undeclared subset and an omission are the same artifact,
and the repo cannot tell them apart either — so the first change the contract
asks for is not a test but a declaration, after which the test has something
true to assert. A coverage contract written before that declaration exists
would report twelve failures, eleven of which might be decisions.

## What this realization cannot do

It measures naming, not reachability. A skill named in `CLAUDE.md` may still
go unused, and one of the twelve may be reached through a path this
measurement does not model — a slash command the harness surfaces directly,
say. The counter-test is the mechanical one the sibling technique names:
attempt the behaviour outside the agent. It was not run here, so this
application shows a coverage gap and does not prove a single unused skill.
