---
layer: technique
type: technique
subject: agent-instruction-files
technique: host-contract-compilation
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [one set of skills must run under more than one coding harness, a harness rejects a frontmatter field or a description length another accepts, a skill step invokes a second model that some hosts cannot reach, per-host copies of a skill have started to disagree, adding a new harness means editing the generator]
---

# Host-contract compilation

[single-source-topology](./single-source-topology.md) settles the case where
harnesses read differently *named* files: one canonical file, bridges around
it, and — where a harness can neither import nor link — a generated copy that
is byte-identical to the source. That escape hatch assumes the only thing a
host changes is the file's location. Harnesses differ in more than that. One
accepts a dozen frontmatter fields and another exactly two, with a hard length
limit on the description. One names its shell tool one way and another
another. One can invoke a second model for a second opinion and another *is*
that model and cannot invoke itself. One installs skills under a dotted
directory and another under an env-resolved root. A skill written once and
copied unchanged is wrong on every host but the one it was written for, and
the moment the copies are edited by hand the fork this subject exists to
prevent has begun.

So a skill authored once is **compiled** per host, and the rule that keeps the
compilation honest is where the differences live: **in a declarative contract
per host, never in the generator.** Everything that reads hosts — the
generator, the installer, the health check, the uninstaller, the worktree
copier — reads the same contract, and none of them carries per-host code.
Adding a host is adding one file whose defaults are derived from the host's
name; a fully default host is two fields.

## What the contract carries

The contract is the complete list of ways a host may differ, each an
enumerable field:

- **Paths.** Where the compiled skill installs globally and per repository,
  and whether paths are literal or env-resolved.
- **Frontmatter transform.** An allowlist or denylist of fields, a description
  length limit *and what happens at the limit* (error, truncate, warn),
  fields to inject host-wide, fields to rename, fields added conditionally on
  the source's own values.
- **Content rewrites.** Literal, ordered, replace-all: paths first, then tool
  vocabulary ("the shell tool" on one host is "the exec tool" on another). The
  common case derives its rewrite list mechanically from the resolved paths; a
  host whose rewrites are not derivable replaces the list wholesale, and the
  two options are mutually exclusive by construction so nobody appends to a
  list that was meant to be replaced.
- **Suppressed sections.** Named generator sections that render empty on this
  host. Suppression is *capability-driven*: a section that shells out to a
  second model is suppressed on the host that is that model and on every
  runtime that cannot invoke one; a section that reads a memory store is
  suppressed where no store exists. The generator validates every suppressed
  name against its registry of section names, so a misspelled suppression is
  an error rather than a section that quietly renders on the wrong host.
- **Install strategy and runtime assets.** Which shared assets are linked
  into the host's root, by explicit list, never by glob.
- **Host-specific behaviour.** The co-author trailer the host's commits carry;
  which learnings mode applies; and the **boundary instruction** below.

The generator, given the contract, is a pure function from source plus host
to output. That purity is what makes the next two sections checkable.

## Goldens per host, and prose validated per render

A compiled artifact drifts in two directions: the generator changes, or the
source changes, and either can break a host nobody tested. Two gates cover
both, and both are free-tier:

1. **A committed golden per host** for the most complex skill, diffed on every
   change. Freshness is regeneration plus a clean diff, which is
   [gate-sees-target](../../../../_laws.md#gate-sees-target) applied to the
   artifact the host will actually load rather than to the source nobody
   loads.
2. **Prose validated against the command registry per host render.** Every
   command a compiled skill tells the agent to run is parsed out and checked
   against the registry that implements it; a documented flag that does not
   exist cannot ship. The render for validation goes to a temporary directory
   — never in place — because an in-place render inside a test mutates the
   tree other tests are reading.

Both gates read the *compiled* output. A test over the source template proves
the template; only a test over each host's render proves the host.

## The boundary instruction is a host property

When a compiled skill causes host A to invoke model B — for a second opinion,
an adversarial pass, a review — B is now reading a repository that contains
A's skill files: shell scripts and prompt templates written for a different
system. Left alone, B reads them, follows them, and wastes its budget or
worse. The contract for A carries the text that tells B what not to read,
and it is injected into every cross-model invocation the skill compiles on
that host. This is the cross-model prompt-injection seam, and it is a
property of the *host pair*, which is why it lives in the contract and not in
any one skill.

## The decision rule

**Compile when hosts differ in accepted fields, tool vocabulary or
capabilities. Link or import when they differ only in file name.** The second
case is [single-source-topology](./single-source-topology.md) and needs no
generator; the first case cannot be solved by topology, because a link cannot
drop a field or rename a tool. The rejected alternative — per-host branches
inside the generator — is where every multi-host skill set starts, and the
tell that it has gone wrong is the sentence "adding a host means editing the
generator". The contract's identity is the host, not its copies
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse));
one authority per host is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to the harness vocabulary itself.

## What compilation cannot do

It cannot make a capability exist. A suppressed section is an honest omission
— the host that cannot invoke a second model gets a skill without the second
opinion, and the skill must still read correctly with the section gone, which
the per-host golden checks. And a host with no install arm at all gets the
**instruction-only tier**: a committed, budget-capped digest of the rules the
user hand-copies into their own instruction file. Delivery there is print
plus a user-performed copy, never a write into the user's file — a generator
that overwrites an instruction file it does not own has crossed the line
[machine-owned-regions](./machine-owned-regions.md) draws.

## Boundary

[agent-cli-transport](../../../runtime-and-io/agent-cli-transport/agent-cli-transport.md)
owns how a program *drives* a harness — flags, auth, output normalization.
This technique owns how a skill is *shaped for* a harness. A registry that
publishes skills to consumers by link (one host, many repositories) applies
[single-source-topology](./single-source-topology.md) and needs this technique
on the day a second host appears.
