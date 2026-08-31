---
layer: technique
type: technique
subject: agent-instruction-files
technique: capability-coverage-contract
status: forged
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [a capability exists in the runtime and no agent has ever reached for it, a new tool or script landed and no instruction file mentions it, deciding what a test over prose should assert, an instruction file points at documents that may not exist, an agent's output is plausible but consistently uses the poorer of two available means]
---

# Capability coverage contract

[instruction-freshness](./instruction-freshness.md) audits the file in one
direction: everything the file *names* must exist. Paths resolve, commands
run, counts re-measure. That direction is the one with an error message
attached — the agent follows the dead path, something fails, somebody notices.

The other direction has no error message at all. **Everything that exists
should be named**, and when it is not, nothing breaks: the capability is
simply never reached for. The agent plans with the subset it was told about,
produces a plausible result by a poorer route, and no transcript line, no exit
code and no failing test marks the moment the better means was skipped. A repo
can run for months using three of its five generators because the instruction
that plans that work names three.

This is [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)
applied to affordances rather than to checks. A capability reachable only if
prose happens to name it is an optional capability, and the default is
unnamed — every new tool starts life invisible.

## Two directions, one contract

State the obligation as a set equality and it becomes testable: for a given
domain, *the capabilities the runtime offers* and *the capabilities the
planning instructions name* are the same set.

- **Soundness** — named implies exists. Fails loudly-ish; owned by the
  freshness audit.
- **Completeness** — exists implies named. Fails silently; owned here.

Completeness is the one that needs a gate rather than a sweep, precisely
because a periodic reading cannot notice an absence. Nobody re-reads a
planning document and thinks *this does not mention the fourth thing*.

## Enumerate from the runtime, never from a list

There are two ways to write the test, they look equally diligent in review,
and only one of them keeps working.

The **named form** hardcodes both halves: a list of instruction files, and a
list of capability tokens each must contain. It passes the day it is written.
It rots on the next addition — a fifth generator lands, nothing adds it to the
test's list, and the test goes on passing while asserting a set that is now a
subset. The failure mode is exact: *the test is green and the coverage it
claims is stale.*

The **enumerated form** derives the expected set from the runtime itself —
iterate the tool registry after discovery, walk the plugin directory, read the
command table — and asserts that every discovered member appears in the
instruction surfaces that plan in its domain. A newly added member is covered
the moment it is discoverable, with nobody remembering anything.

The difference is exactly
[gate-sees-target](../../../../_laws.md#gate-sees-target): the named form
checks a proxy — a list a human maintained, which is the same artifact class
as the drift it is meant to catch — while the enumerated form checks the
target. When a repo contains both forms, and mature ones usually do, the named
tests are the ones to migrate first; they are the ones whose green is least
informative.

Pointers are part of the same contract. Where the instruction layer directs the
agent at other documents — a tool declaring which knowledge files to read
before it is used — every pointer must resolve, and the check iterates the
declaring registry rather than a list of pointer names. A pointer that resolves
to nothing does not raise: it means a mandated reading step is silently
skipped, and any layer that republishes the pointer list to its own callers
propagates the dead name outward.

## Scope the assertion to a domain, not to the whole file

Coverage is not "every file names every capability" — that would be the
dilution tax [line-earning](./line-earning.md) and
[restraint-amplifier-balance](./restraint-amplifier-balance.md) spend the
subject arguing against, and a coverage test written that way is a machine for
bloating instruction files.

The assertion is per capability domain: the instruction surfaces that *plan*
work in a domain must name the full set of means available for it. Choosing
which surfaces plan in which domain is judgment the technique cannot remove,
and it should itself be derived wherever the repo makes that possible — a
declared domain on each planning document beats a list in a test, for the same
reason the enumerated form beats the named one.

A file that deliberately carries a curated subset — the strongest two of five
means, because the other three are traps — is making a real editorial choice,
and it must **declare the curation** where the test can read it. An
undeclared subset is indistinguishable from an omission, and the test cannot
tell the difference either.

## It looks identical to a capability gap, and is not

[capability-before-steering](./capability-before-steering.md) sorts an agent
failure by asking whether the agent *could* have complied, and rules that no
line should be written against a capability the agent does not have. This
technique argues for writing lines that name capabilities. The two meet on the
same observation — *the agent never did the thing* — and resolve it opposite
ways, so the discriminator matters:

- The agent **could not**: the tool is absent, the permission denied, the
  schema cannot express the call. Fix the capability; write nothing.
- The agent **could, and was never told**: the means is installed, permitted
  and reachable, and no document in its planning path names it. Text is not a
  weak fix here — it is the entire mechanism, because discoverability is what
  the instruction layer is *for*.

That subject's own mechanical test separates them cleanly: attempt the
behaviour directly, outside the agent, with exactly the means the agent had.
Fails outside the agent, capability gap. Succeeds outside it while the agent
never reaches for it, coverage gap — and a coverage gap is uniform across
every session, which is the tell that would otherwise be misread as a
capability problem.

## When not to use this

A small, stable capability set that changes twice a year does not need a gate;
the freshness audit will catch it and the test costs more than the drift. And
do not write the coverage test before the capability set has a machine-readable
enumeration — if the runtime cannot list its own means, the test can only take
the named form, which is the form that rots. Build the enumeration first; the
contract is worth having only because it can read one.
