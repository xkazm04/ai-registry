---
layer: technique
type: technique
subject: agent-instruction-files
technique: capability-before-steering
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [an agent keeps failing the same way and the instruction file keeps growing, deciding whether an observed failure should produce a new line at all, a rule has been restated three times and still is not followed, triaging which of a batch of agent failures are worth writing text about, an automated loop is proposing instruction-file edits from failed runs]
---

# Capability before steering

[line-earning](./line-earning.md) asks two questions of a candidate line:
is the content unreachable, and does its removal change behavior. Both are
questions about the *line*. Neither asks the question that comes before
them and disqualifies more candidates than either: **could the agent have
complied if it had wanted to?**

A failure has two very different causes wearing one appearance. The agent
did not do the thing because it *would* not — it had the means and chose
otherwise, was not told, was told ambiguously, or was told and outweighed
it. Or the agent did not do the thing because it *could* not — the tool
was absent, the permission was denied, the command was not installed, the
schema made the correct call unexpressible, the file was outside the span
it could read. Only the first kind is a steering problem. The second is a
capability problem, and no sentence fixes it.

## The sort, and why it precedes the others

[enforcement-demotion](./enforcement-demotion.md) sorts a rule by asking
whether a program could decide compliance: yes demotes it to a gate, no
keeps it in prose. That sort is complete for rules and silently assumes
its subject — both branches presuppose an agent that *can* perform the
behavior and differ only on how reliably it is made to. Ask the capability
question first:

1. **Could the agent have done it?** If no, the fix is a capability
   change — grant the tool, widen the permission, install the dependency,
   correct the schema, add the missing surface — and **no line is written
   at all**. Steering text about an unreachable behavior is not a weak fix;
   it is a negative one, for two reasons given below.
2. **Could a program decide compliance?** The existing demotion sort, run
   only on what survives step 1.
3. **Is the line unreachable and behavior-changing?** The existing
   admission test, run only on what survives step 2.

The ordering is the technique, and it is the same funnel discipline the
evaluation subject applies to a red case — assign the most upstream owner
that explains the failure, because a downstream fix applied to an upstream
cause improves nothing and looks like work.

## Why the wrong branch is worse than doing nothing

Writing steering text against a capability gap costs twice.

**It cannot succeed, and it hides that it cannot.** A capability gap and a
compliance gap must be spelled differently or the diagnosis is worthless
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The line is added, the failure recurs, and the recurrence reads as
non-compliance — so the next iteration sharpens the wording, adds emphasis,
promotes it to a heading. Each round produces more confident text about a
thing that remains impossible. This is the observable signature: a rule
restated with escalating force across several revisions is nearly always a
capability gap being treated as a steering gap.

**It taxes every other line.** Compliance falls with instruction density —
measured on dense instruction lists, undetected at file scale in the one
factorial study to date, and treated by this subject as a bound rather than
a per-line rate. A line that cannot work still charges that tax, so the file pays
for it in the adherence of the rules that *could* have worked. A steering
patch aimed at a capability gap therefore makes the agent worse at
everything else it was correctly told, which is the only kind of
instruction-file edit that is strictly negative.

## Telling them apart

The distinction is cheap to check and almost never checked, because the
transcript reads the same either way — the agent explains itself
plausibly in both cases, and its account of *why* it did not do the thing
is not evidence.

The reliable test is mechanical: **attempt the behavior directly, outside
the agent, with exactly the means the agent had.** Run the command with
the tools and permissions the session was granted. If it fails there, the
agent was never able to comply and the transcript's reasoning was
narration. Asking the agent whether it could have is not a substitute —
that reads a proxy rather than the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and a model
will readily accept blame for an impossibility.

Two tells short-circuit the check in practice. A failure that is **uniform
across every session** is not a steering failure; genuine steering failures
are probabilistic, because the file is advisory and dilution is statistical,
so a rule that is followed 70% of the time is a steering problem and a rule
followed 0% of the time is usually not. Uniformity has two causes, though,
and only the mechanical test separates them: the agent *could not* (this
technique), or the agent could and no planning surface ever named the means
([capability-coverage-contract](./capability-coverage-contract.md)) —
succeeds outside the agent, never reached for inside it. And a failure that **persists at
the top of a fresh, minimal file** — where dilution is near zero and the
instruction is the only thing present — has excluded steering by
construction.

## For automated loops, this is the first gate

An optimization loop that proposes instruction edits from failed runs will
generate steering patches for capability gaps by default, because text is
the cheapest patch to write and the failure descriptions do not distinguish
the two causes. The loop must therefore classify before it patches, and
schedule the classes rather than interleaving them: **capability changes
land first, and steering is written only against failures that survive
them.** The ordering is not a preference. A steering patch written while a
capability gap is still open is measured against a run that could not have
succeeded, so its evaluation is uninformative, and the loop will retain a
line that never did anything on evidence that could not have shown it —
after which the line is indistinguishable from an earned one and outlives
every review.
