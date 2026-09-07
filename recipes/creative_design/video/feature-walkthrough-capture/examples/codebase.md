# The registered local codebase as the `development` grounding source

What was learned mapping this recipe onto a checkout the agent can read. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**The code holds the preconditions, and the preconditions are what a guessed walkthrough
gets wrong.** A route behind a guard, a feature behind a flag, a panel that only renders
with at least one saved item: each of them turns a plausible click path into a recording of
an empty state. Read the flow for what has to be true before it can be reached, and make
that the state the recipe puts the app into, rather than discovering it when the capture
comes back showing a redirect.

**Staleness becomes computable here and nowhere else.** Record which files the path went
through alongside the build, and a later change to any of them marks the walkthrough
suspect without anybody having to watch it. That is the difference between a library that
decays silently and one that tells you which items to look at. Without this connector the
only staleness signal is a person noticing that a screen looks wrong.

**Test identifiers are the stable handles, and the code is where they live.** Driving by
visible text breaks on the first copy change and, in a translated app, breaks per locale.
Where the project already carries identifiers for testing, the walkthrough should use the
same ones, which also means a walkthrough that breaks is telling you something real rather
than something cosmetic.

**Seed and fixture data usually already exists.** Somebody wrote it for the test suite. Using
it rather than the developer's own working data is the cheapest route to a capture with
nothing in frame that should not leave the machine.

## What transfers to any project source

- The preconditions of a flow are in the implementation, not in a description of it.
- Record what the walkthrough depended on, so staleness can be derived instead of noticed.
- Drive by stable handles rather than by displayed text.
- Existing fixtures are usually the right recording state and cost nothing to adopt.
