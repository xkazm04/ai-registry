---
layer: technique
type: technique
subject: agent-browser-control
technique: effect-classed-commands
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [deciding which browser commands are safe to retry after a timeout, a documented command flag does not exist in the binary, an agent has to be told what commands are available, choosing which commands a restricted caller may run]
---

# Effect-classed commands

Every command the agent can issue against the browser is declared, once, in a
registry that says what kind of effect it has. Three classes cover the
surface. A **read** does not mutate the page and is safe to retry — text,
links, form state, console output, cookies. A **write** mutates page state and
is not idempotent — navigate, click, fill, press, upload. A **meta** command
operates on the daemon rather than on the page — tabs, status, stop, restart,
snapshot, screenshot. The classification is the vocabulary every other part
of the system derives from: the dispatcher, the help text, the remote
allowlist, the retry policy, and the prose that teaches the agent.

## Dispatch by class, or the class is fiction

The naive version of this is a comment. A handler is annotated "read-only",
another "mutating", and a year later a command that was a read has grown an
option that writes to disk and the comment still says read. Nothing consumed
the classification, so nothing noticed it drift.

The rule: **the server dispatches by class.** The registry's three sets are
the routing table — membership in the read set sends a command to the read
handler, and so on — and a command in no set is an unknown command. A command
added to the wrong set is therefore routed to the wrong handler and fails in
the first test that exercises it, which is the only thing that keeps the
classification true over time. The registry is the one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
handlers, documentation generators and validators import it and never keep a
private copy of the list.

Arguments can change a command's class, and the dispatch must look at them.
A read whose output is redirected to a local file has become a local write;
the effect is decided by command *and* arguments, and any gate that grants or
denies by class evaluates both. A gate that classifies by command name alone
is reading a proxy ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## What the classes buy

**Retry policy.** After a timeout against a live daemon, a read can be reissued
without thought; a write cannot, because the click may have landed. The agent
should not have to reason about this per command, and it does not if the error
path can consult the class — "read; safe to retry" versus "write; snapshot
first to see whether it took effect". The read-after-write freshness rule —
that a write against something the agent read earlier needs proof the picture
is current — is owned by
[write-freshness-gate](../../mcp-tools/techniques/write-freshness-gate.md) and
is cited from here, not restated; this technique supplies the classification
that rule keys on.

**Scoping.** A restricted caller — a remote paired agent, a view-only client —
is granted a subset of commands, and the natural subset is drawn along class
lines with named exceptions: the browser-driving reads and writes, none of the
meta commands that configure the daemon or read local credentials. Declaring
the subset as a set over the same registry means the allowlist and the
dispatcher cannot disagree about what a command is called.

**Self-discovery.** The agent should never have to be told the command list by
a human. A `help` command returns the registry — grouped, with usage — so an
agent on a build it has never seen can discover what exists. An unknown
command returns the closest match by edit distance and, where the command
exists in a newer build than the one running, says so; a typo of a real
command and a command from the future are different mistakes with different
remedies.

**Content classification rides alongside.** A fourth, orthogonal set marks
the commands whose output is page content — attacker-authored text that must
be fenced before it reaches the model — and a subset of those whose output
derives from the live document and can carry hidden-element payloads. Those
sets are consumed by the egress door, which is
[prompt-safety](../../../prompt-and-context/prompt-safety/prompt-safety.md)'s
technique territory; the registry's only job is to be the one place the sets
are declared.

## The prose is validated against the registry

The agent learns the commands from prose — a skill document, a tool
description, a manual — and prose drifts from code faster than anything else
in the system. A documented flag that the binary no longer accepts, a command
the manual omits because it was added last week: the agent hits an error it
did not cause and cannot diagnose.

Two mechanisms close this. The command reference and the flag tables in the
prose are **generated from the registry** at build time, so a command that
exists in code appears in the manual and one that does not cannot. And the
hand-written parts of the prose — examples, workflows — are **parsed and
validated against the registry in the cheapest test tier**, the one that runs
on every test invocation with no external dependency: every command mentioned
must be in the registry, every flag mentioned must be in the flag table. The
expensive tiers — running a real agent against the prose, scoring it with a
model — are gated behind an explicit opt-in, because the static tier catches
the large majority of drift for free and judgment calls are the only thing
worth paying for.

## Decision rules

- One registry declares every command in exactly one of read, write, meta; the
  union is the command set and nothing else is a command.
- Dispatch by set membership; a private list anywhere else is a defect.
- Evaluate class over command and arguments; an output-redirecting argument
  promotes a read to a write.
- Draw restricted-caller allowlists as sets over the same registry.
- `help` returns the registry; unknown commands get the nearest match and an
  upgrade hint when the name exists in a newer build.
- Generate the command reference from the registry; validate hand-written
  examples against it in the free test tier.

## The boundary

[tool-schema-design](../../mcp-tools/techniques/tool-schema-design.md) and
[server-composition](../../mcp-tools/techniques/server-composition.md) own
the shape of a tool contract and the single dispatch door for a protocol
server. This technique is what those become when the surface is a plain
command set rather than a schema-described tool list: the effect class stands
in for the protocol's annotations, the registry for the tool catalog, and the
free-tier validation for the schema check a protocol would perform on the
wire. Where a browser surface *is* a protocol server, read those and keep the
three classes.

## When not to use this

A surface with three commands does not need a registry; a comment will hold.
The technique pays from the point where more than one consumer — a dispatcher,
a manual, an allowlist — needs the same list, because that is the point at
which two hand-maintained copies start to drift.
