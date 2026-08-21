---
layer: technique
type: technique
subject: machine-paced-delivery
technique: pre-authorship-verification
status: forged
stage: solo
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [an agent is about to commit, a round trip through the delivery system is expensive, deciding what belongs in a local gate]
---

# Pre-authorship verification

Run the checks the gate will run, before the change exists, in the loop that is making it. At
machine pace this is not merely a faster feedback loop — it is a different kind of saving,
because the remote round trip costs an agent its working context and frequently a whole
attempt.

## Why the round trip is more expensive than it looks

A person who pushes and waits keeps the change in their head, or reloads it cheaply from
memory when the result arrives. An agent waiting on a remote result either holds a large
context across the wait or reconstructs it afterwards, and reconstruction is where the
diagnosis goes wrong: the agent re-reads the code, forms a fresh and slightly different
picture, and fixes something adjacent to the actual problem. The round trip does not just cost
minutes, it costs *continuity*, and continuity is what made the fix correct.

There is a second, blunter cost: some failures cannot be un-pushed. A credential that reaches
a remote branch has left the machine. That class of check belongs before the push regardless
of any argument about speed.

## The commands come from the repository, never from imagination

This is the rule the whole technique rests on, per
[gate-sees-target](../../../../_laws.md#gate-sees-target). A local gate that runs a command
nobody else runs produces a green result about a check that does not exist. That is worse than
no local gate, because it is trusted.

Discover the commands, in order of authority:

1. **A declared capability manifest**, if the repository has one. It exists to answer exactly
   this question.
2. **The project's own task definitions** — whatever the ecosystem's conventional place for
   named commands is.
3. **The pipeline definition itself.** Whatever the gate runs *is* the gate, by definition.
   When the first two disagree with it, it wins.

**Never invent a command.** A stage with no command in this repository is reported as *not
configured* and skipped, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). A fabricated
command that happens to pass is a false green with a plausible name on it, and it will be
believed.

## Order, and stopping

Run in increasing cost and decreasing breadth, stopping at the first hard failure:
formatting, then static analysis, then type checking, then tests, then build.

Stopping matters more than it appears. Fixes interact — a formatting pass changes what the
linter sees, a lint fix changes what the type checker sees — so a batch of fixes made across
stages from one report is a batch made against stale information. One failure, one fix, rerun
from the top.

The build stage earns its place despite being last and slowest: a project can type-check clean
and still fail to build, because linking, bundling, asset resolution and module-boundary rules
are checked nowhere else.

## Timebox, and say what was proven

A local gate that takes longer than the loop can absorb gets skipped, and a skipped gate is
worth nothing. When the full suite is too slow for the inner loop, run the affected subset —
and then **say so in the verdict**, naming the subset. A verdict that says which subset ran is
a smaller claim honestly stated; a verdict that says "tests passed" after running a tenth of
them is a false one.

The remote gate remains the backstop for what genuinely needs what only it has: a clean
environment, the full tree, a platform the author does not have, a secret the author must not
hold. Deciding which checks sit where is the gate-ladder question, and the shift-left default
is that a check moves as early as it can *while still seeing its target*.

## The verdict

One line per stage and one overall verdict. Not a log dump — the local gate is consumed by
something that then has to act, and the same output contract applies as to any other
verification result: verdict first, first real failure located, bounded detail, and
*not configured* rendered distinctly from *passed*.

## When NOT to run it

- **Between every edit in a rapid loop.** The gate is a pre-push discipline, not a per-keystroke
  one; run it when a coherent unit of work is done.
- **When it cannot see its target.** A check needing the full tree, run against a staged subset,
  reports a result about something that is not what will be merged.
- **As a substitute for the remote gate.** It is a filter that removes most failures before they
  cost a round trip. The backstop stays.

## Decision rules

- Discover commands from the manifest, then the project's task definitions, then the pipeline;
  the pipeline wins ties.
- Never invent a command; an unconfigured stage reports *not configured* and is skipped.
- Order format, lint, typecheck, test, build; stop at the first hard failure and rerun from the
  top after fixing.
- Timebox; when a subset runs, name the subset in the verdict.
- Emit one line per stage and one verdict, with *not configured* visibly distinct from *passed*.
- The remote gate stays as the backstop for clean-environment, full-tree, and secret-holding
  checks.
