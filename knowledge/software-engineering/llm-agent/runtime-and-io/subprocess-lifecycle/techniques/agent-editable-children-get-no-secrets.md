---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: agent-editable-children-get-no-secrets
status: forged
laws: [one-validation-door, absent-guard-is-loud, claimant-does-not-adjudicate]
shared_with: [agent-cli-transport]
use_when: [an editing agent and the gates that check its work run on the same machine, deciding which children may inherit a registry token or a model key, a test command runs scripts the agent just rewrote]
---

# Agent-editable children get no secrets

A host that runs an editing agent also runs the programs that judge and prepare
the agent's work: a setup step that installs dependencies, the gates that build
and test, the version-control tool that commits, and the shell commands the
agent itself issues. Each of those children executes code that lives in the
workspace, and the agent can rewrite the workspace. The rule that follows is
short: **whoever can author the code a child runs holds everything that child
holds.** A gate that inherits a token hands the token to the agent, with one
edit of a test script as the price.

The spawn contract already says the environment is constructed, never
inherited. This technique adds the question that decides *what* goes into it:
not "does this child need the secret", but "who wrote the code this child is
about to execute". The answer sorts every child into one of two tiers.

## The two tiers

**The agent tier** is the agent process itself. Its binary is fixed, but its
behaviour is steered by a model that reads untrusted text. It receives exactly
the credentials it needs to reach its model, and nothing else: no forge
token, no registry token, no cloud key, no database string.

**The child tier** is every process whose code the agent can edit on this run:
setup, gates, linters with plugin configs, package managers with install
scripts, test runners, and the version-control tool, whose hooks live in the
working tree. These children receive **no secret at all**, including the
agent's own model key, because the agent could otherwise move that key into
a script and read it back through a gate's output.

The agent's own shell commands sit in the child tier, and the host cannot wrap
them, because the agent runtime spawns them, not the host. So the host
configures the runtime to strip its credentials again from every process it
starts, and then checks that the strip held (see the verification below). Some
runtimes respond to that setting by forcing a stricter permission mode. The
stance the run needs then has to be stated as explicit rules. A mode flag
alone will not carry it.

## Pass-through is named, child-tier only, and recorded

Some children genuinely need a credential: a setup step that installs from a
private registry. The operator then names each variable explicitly, and the
named variables reach **the child tier only, never the agent**. This is a
risk the operator accepts per name, and the record should say so. It is
narrower than leaving the variable in the ambient environment, because the
secret is not in the agent's own environment, where a single "print the
environment" tool call would surface it. It is not closed: a child that
runs agent-edited code can still be made to leak what it was handed.

The pass-through is safe in one case, which the design should aim for: the
child reads its code from a place the agent cannot write on this run. A setup
script taken only from the protected default branch, run before the agent's
first edit, is host-authored for the run, whatever its file extension. So the
editability test is temporal and positional: **editable by the agent, on this
run, before this child reads it.** Configuration that a change can modify, and
that the next run executes with secrets, fails the test.

Two failure shapes to refuse:

- **The convenience bridge.** "The agent needs the registry token to run the
  install itself." Then the install runs as a host step before the agent
  starts, or the agent runs without the private dependency. The token does
  not go to the agent.
- **The inherited blanket.** A wildcard pass-through ("everything starting with
  the vendor prefix") re-creates ambient inheritance under a new name. The
  pass-through list holds exact names.

## The scrub itself

An allowlist is the standard: the child gets the platform variables it needs
and nothing else. A host that runs a developer's real toolchains often cannot
enumerate them (search paths, toolchain homes, proxy settings, version
managers). In that case it falls back to a denylist, and the denylist has to
be wider than teams first write it:

- **By name shape**, on word boundaries: tokens, secrets, passwords, keys,
  auth material, cookies, DSNs, connection strings.
- **By value shape**, whatever the name: a URL that carries a password is a
  credential even when the variable is called something harmless.
- **Sockets and agents are credentials.** A variable that points at a running
  key agent grants the key's use without the key.
- **The host's own process state** also comes out: loader hooks, script-runner
  context, interpreter options. These are not secrets, but a child that
  inherits them runs under the host's configuration, not its own.

Record a denylist scrub as the weaker class wherever the stance is reported.
It fails open on a credential whose name and value both look innocent.

## What scrubbing does not close

The environment is one channel. Credential files in the user's home
directory, an authenticated command-line tool's stored session, the network,
and a cloud metadata endpoint are others, and a child in the child tier can
reach all of them unless something below the process stops it. The honest
document states which of these the host leaves open. The real closures are an
operating-system sandbox around the child tier, or running the host as a
dedicated user who holds nothing but the agent's own key. Shell allow rules do
not close them: a rule that permits the test runner permits whatever the agent
wrote into the test script.

## Verification

Plant a canary secret in the host's environment, under a name and under an
innocent name with a secret-shaped value. Run a gate whose script prints its
environment, and have the agent run a shell command that does the same.
Assert the canary is absent from both outputs, and that a named pass-through
appears in the gate's output and not the agent's. Run it again whenever the
agent runtime is upgraded, because the re-strip of the agent's own children is
the runtime's feature, not the host's. The agent's account of what it can see
proves nothing. Only the printout counts
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)).

## Where it attaches

The tier is chosen at the one spawn door
([one-validation-door](../../../../_laws.md#one-validation-door)). The safe tier
is the door's default, and the agent tier is the exception a caller must name.
A spawn site that forgets to choose then gets no secrets, which is the safe
direction ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## When not to use it

A child that runs host-authored, immutable code (a pinned binary with fixed
arguments, reading no configuration from the workspace) is not agent-editable.
It takes credentials injected individually under the ordinary spawn contract.
Check the claim before relying on it. Many tools that look fixed read
configuration, plugins or hooks from the directory they run in.
