---
layer: technique
type: technique
subject: hitl-approval
technique: human-performed-steps
status: forged
laws: [failure-not-empty-success, creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [a task contains steps the machine must not perform itself, handing credentials or console work back to a person, deciding between automating a step and scripting it for a human, writing a capability that exists to work around a boundary]
---

# Human-performed steps

The subject's two flows both keep the machine as the actor. Review gates output
after it exists; consent gates action before it happens; in each the human
decides and the machine does. There is a third case, and it is the one that
gets handled worst because it has no gate at all:

**The machine must not perform the step. The human performs it.**

The reasons are ordinary and they are not going away. A console requires
credentials nobody should hand to a process. An account action is bound to a
person's identity and consenting to it *as* them is not delegation, it is
impersonation. A physical action has no digital form. A provider's terms bind
the human, not their tools. In every case the honest boundary is not "ask
permission and then proceed" — it is *the work moves*.

## Instructions are not a handoff

The default output is prose: a numbered list telling the person what to do. It
is the wrong artifact, and the reason is worth being precise about, because
"write clearer instructions" is the wrong fix.

Prose hands the person the *whole* task: they must track which step they are
on, retype values the machine already holds, decide whether a step succeeded,
and remember what they were doing when they come back from a browser tab. Every
one of those is work the machine could have carried, and none of it is the part
that required a human. The human was needed for *authority*, not for
bookkeeping.

The right artifact is an **executable runbook**: a script the person runs that
sequences the work, holds the state, opens what needs opening, prompts for
exactly the values only they can supply, verifies what it can, and stops
cleanly where it must. The human contributes the irreducible part — the
credential, the click, the judgment — and the machine carries everything
around it.

## The runbook is deterministic, and that is a security property

The script the agent *writes* is produced by a model; the script the person
*runs* must not be one. No model call at execution time, no network dependency
for the logic, nothing that reinterprets the steps as it goes.

Two properties follow, and the second is the load-bearing one:

- **It is reviewable before it runs.** A person about to paste a production
  credential can read the entire thing. That review is the only real assurance
  available, and it exists only if the artifact is static.
- **Secrets never reach a model.** The values the human supplies go from their
  keyboard into local files, a keychain, or a secret store, and no part of that
  path passes through inference. A flow that asks the model to accept a
  credential and place it correctly has converted a human-performed step back
  into a machine-performed one, at the exact point where the boundary mattered
  most.

This is also why "the agent could do it with a browser-driving tool" is not an
argument for doing so. Capability is not authority, and the fact that a step
*can* be automated says nothing about whether the resulting action should be
attributable to a person who did not take it.

## Each step is verified where verification is possible

A runbook that only instructs is halfway back to prose. Where a step's success
is machine-checkable — the file exists, the key authenticates, the endpoint
answers — check it, and say which of the three happened: **succeeded**,
**failed**, or **could not be checked**
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The third is a real state and it is the one that gets silently folded into the
first, leaving a person confident about a step nobody confirmed.

Runbooks are interrupted — a page does not load, a permission is missing, a
credential has to be requested from someone else — so they are **resumable**,
picking up at the first unsatisfied step rather than from the beginning. The
resumption logic is the same shape the subject already uses after a decision
([resume-after-decision](./resume-after-decision.md)), with the pause being the
person's own progress rather than a pending verdict.

## Handing back

The runbook ends by returning control to the flow that dispatched it, carrying
what it established: which steps ran, what was verified, what could not be, and
what the machine may now assume. A handoff that ends by telling the person
"you're all set" and leaving the calling flow to guess has broken the loop at
its last step — the machine resumed on an assumption instead of a record.

One vocabulary for that result, shared with the subject's other flows
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
because a downstream consumer should not need to know whether the human
approved something or performed something in order to read what happened.

## A compensating capability names what would retire it

Some of these artifacts exist because of a durable boundary — credentials,
identity, physical action — and will be needed forever. Others exist only
because the surrounding tooling is currently inadequate: the person who holds
the answer is not reachable inside the tool, the two systems do not talk, the
integration is not built yet.

The second kind is a **compensating capability**, and it accumulates. It is
created state and names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) — but the
reaper here is not a schedule, it is a **condition**:

> This exists because *X*. When *X* is no longer true, delete it.

Write that in the artifact itself, at creation, when the author still knows why
they built it. Later readers cannot reconstruct it, and a workaround whose
reason has been forgotten is indistinguishable from a design decision — which
is how a temporary bridge becomes load-bearing infrastructure that nobody dares
remove.

The condition also makes the capability's cost legible while it lives. "We
maintain this because two systems do not talk" is an argument for connecting
them, stated in the one place someone will read while doing the work. Without
it, the workaround silently lowers the pressure that would have fixed the cause.
