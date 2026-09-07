# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**This is the one recipe in the family that needs write access, and that changes the
binding's risk.** Its siblings read and propose. This one authors files and runs a
command, so the credential it resolves to can change the tree. Decide at adoption whether
tests land directly or arrive as a proposal, and bind accordingly, because a read only
binding turns the proving step into a claim and the proving step is the whole point.

**The connector supplies the checkout, never the runner.** Dependencies may be
uninstalled, a lockfile may not match, a native toolchain may be absent. A pass that
cannot run the suite has produced unvalidated test files, which is worse than producing
nothing, and it must record them as unvalidated rather than counting them.

**A checkout cannot tell you what actually runs.** The strongest signal for choosing the
next area is which code executes under real use, and this binding has none of it. The
honest substitute is change history relative to file size, which the checkout does have.
Say which of the two the selection was made from, because they disagree most on exactly
the code that is rarely executed and heavily edited.

**Running the suite in a checkout other people are also using is destructive.** A test run
can rewrite snapshots, seed a database, or leave build artefacts that a later pass reads
as source. Give the pass its own working copy or accept that its first observation is of
its own leftovers.

**The proving step needs a way to break the code temporarily.** In a checkout that is
straightforward and reversible, and it is also the step most likely to be skipped because
it is the only one that requires editing code you were not asked to change. Restore it
before delivering, and never deliver a pass whose proving step failed to restore.

## What transfers to any source_control connector

- Establish whether the binding can run the project's tests before promising anything
  about coverage, and record unrun tests as unrun.
- The selection signal degrades to change history whenever runtime usage is unavailable,
  and the record should name which one it used.
- Anything that writes needs its own working copy, or its later observations are of
  itself.
