---
layer: technique
type: technique
subject: production-prompt-architecture
technique: platform-shell-conventions-in-the-baseline
status: draft
laws: [unmeasured-is-not-a-pass, law-and-check-share-one-source]
shared_with: []
use_when: [an automated producer builds a whole playable program rather than one artifact inside it, a generated game cannot be quit paused or resumed the way its platform expects, a stand-in build on one platform substitutes for a target on another, deciding what the standing baseline of a game-producing prompt must carry that no task will ever ask for]
---

# Platform shell conventions in the baseline

Every program that runs on a platform owes that platform a handful of behaviours nobody
designs: leave when the player asks to leave, stop when focus goes elsewhere, come back
without losing anything, survive being closed mid-action. Call them the **shell
conventions**. They are not features of the game, so no task describes them - and an
automated producer builds what it was described. When the producer authors a whole
playable program, the standing baseline of its prompt must name the shell conventions of
the platform the build will actually run on, and the build is checked against that list.

## The obligation

The wiring section answers "is this artifact reachable from the running system". The shell
conventions answer the question one level up: "does the running system behave like a
program on this platform". Neither is in any task, for the same reason - a person
describing what they want describes the content, not the frame around it. A producer told
to make a corridor shooter with drones and a generator makes exactly that, and the result
can be played and cannot be left except by forcing the host to switch away from it. Nothing
failed. Nobody asked.

The failure is invisible to every reviewer who watches the content. It surfaces the first
time a person tries to stop, which is never during a demo and always during a real
session.

## Named conventions get built; unnamed ones do not

The useful observation is not that producers forget conventions. It is that the split is
clean. In one agent-built tree the standing rules named three shell behaviours - pause on
focus loss, nothing lost on close, recentre the view - and all three were built, each with
scripted tests. The fourth, a way for the player to quit from inside the program, was named
nowhere, and it was not built: the key a desktop player would reach for paused instead, and
the only exit was an operating-system chord. The rules the producer was shown decided
exactly which conventions existed.

That is the argument for putting them in the baseline rather than in a reviewer's memory:
the baseline is the only part of the prompt every task carries
([`acceptance criteria appended, not replaced`](./acceptance-criteria-appended-not-replaced.md)),
and a convention that rides on the baseline cannot be dropped by a task that never thought
about it.

## The inventory is per platform, and a stand-in inherits the host's duties

The list is not universal. Who owns each convention differs by platform:

| Convention | Head-worn or console target | Desktop window |
| --- | --- | --- |
| Quit | the platform's system menu owns it; an in-program quit is optional | the program owns it, or nobody does |
| Pause on focus loss | required: the device comes off, the system menu opens | required: the window loses focus |
| Nothing lost on close | required: the platform may close the program at any time | required |
| Resume without punishing the pause | required | required |
| Recentre or reset view | required where the view is tracked | a key binding |

The trap is the **stand-in build**: a program developed on a desktop for a headset or
console target. Its prompts are written for the target, where the system menu owns quit,
so the desktop build - the one the team actually plays every day - inherits a duty that
no rule assigns. Name the conventions of **every platform a build ships to, including the
stand-in**, and say which ones the target platform discharges for you.

## The check reads the build, not the prompt

A convention listed in the baseline is a claim about the prompt. Whether the build honours
it is a separate fact, and it is read from the build: the input map for the quit and pause
bindings, the lifecycle hooks for focus and close, a scripted run that removes focus mid-
action and resumes. A convention with no check is
[`unmeasured`](../../../_laws.md#unmeasured-is-not-a-pass), and the list and the check
come from one source ([`the law and the check share one
source`](../../../_laws.md#law-and-check-share-one-source)) so a convention added to the
baseline is also added to the audit.

## Decision rules

- **When the producer authors one artifact inside an existing program**, the shell is
  already there; this technique does not apply - use the wiring section.
- **When the producer authors the program itself**, or every scene and input path of it,
  the baseline carries the shell inventory for each platform the build runs on.
- **When the target platform owns a convention**, record that it is discharged, and
  check the stand-in build for it anyway.
- **When the person describing the program is not an engineer**, assume no task will ever
  name a shell convention, and treat the inventory as mandatory rather than advisory.
- **Keep the inventory short.** Five to eight items. It sits in the baseline of every
  prompt, so it pays the baseline's budget; platform certification lists are the source to
  draw from, not the text to paste.

## When not to use this

- Tools, editors and pipelines that are not a playable program a person enters and leaves.
- A build whose shell is supplied entirely by a host - an embedded mini-game inside a
  program that already owns quit, pause and save - beyond checking that the host's events
  reach it.
