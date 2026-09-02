---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: operator-tier-code-loading
status: forged
stage: team
laws: [one-validation-door, failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [deciding which configuration file may name code to load, a broken extension takes the host down, a contributed hook's timeout ends the run as cancelled, choosing whether a load failure is fatal]
---

# Operator-tier code loading

An agent runtime that accepts contributions — hooks into its chain, tools
onto its roster, handlers onto its service — has an extension surface, and
loading an extension into the process is code execution with the process's
privileges. There is no protocol boundary here and no process boundary; the
isolation story the tool protocol offers across a wire is unavailable in the
host's own address space. This technique is the rule set that makes the
surface safe enough to have: which configuration may name code, when a load
failure may be fatal, and how a contributed hook fails without taking the
run or its neighbours with it.

## The general ladder, and why the runtime needs its own rung

Delivery systems solved the shape of this problem first. Their
injected-code-scope-ladder orders the places code can enter a job — machine,
repository, step — by reach, gives each tier one enumerable door, and pushes
code down the ladder until it stops working. That discipline transfers; the
tiers do not. An agent runtime's tiers are not about reach across
repositories. They are about **who can write the configuration**:

| tier | written by | may name code |
| --- | --- | --- |
| **startup configuration** | the operator, with access to the process's host | yes |
| **service-writable configuration** | any authenticated administrator, through the service's own interface | never |

The second tier exists in every runtime with a settings interface: an
administrator enables a tool server, adjusts a threshold, installs a skill.
Those are behaviour changes, and administrators may make them. But the moment
a service-writable file can name an entry point, an authenticated call is a
code-execution path, and every credential the service holds is one
misconfigured account away from a shell. The rule is absolute: **code entry
points come only from the startup tier**, and a key that names code, arriving
through the service-writable tier, is ignored — with a diagnostic, not
silently. Two files are two doors, per
[one-validation-door](../../../../_laws.md#one-validation-door); the door
that names code has exactly one writer, and that writer is not the service.

The test is mechanical: write a code-naming key through the service's
interface and confirm the runtime does not load it. A runtime that passes
this test can be administered remotely; one that fails it cannot.

## Load order is deterministic and load failure is attributed

Extensions load in the order the startup configuration lists them, never in
directory order or map order, because load order is visible — an extension
that registers a hook class or a tool name first wins a collision, and a
collision resolved by filesystem enumeration is resolved differently on the
next machine.

A load failure — an import error, a missing native dependency, a broken
manifest — produces a diagnostic *attributed to the extension*, and then one
of two things happens, decided by the operator in advance:

- **Optional (the default):** the extension is skipped, the diagnostic is
  recorded and surfaced, and the host starts. The runtime that started
  without it is a runtime with a *known* gap, which is the honest state.
- **Required:** the host refuses to start. This is opt-in, per extension,
  because it converts every later failure — a native library removed by an
  image update, a snapshot deleted from disk — into a startup abort that only
  someone with shell access can recover. That is the right cost for an
  extension the deployment cannot function without, and the wrong cost for
  everything else.

The failure-versus-empty distinction of
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
governs the optional path: a runtime that started with three extensions
loaded and one skipped must report *skipped, with reason*, never *three
loaded* — and a health surface that reads "all extensions loaded" while one
is absent is the exact lie the law names.

## Installation is a transaction, and validation precedes execution

Where the runtime installs extensions itself — fetching a package, resolving
dependencies, recording the declaration — the install is one transaction
over three artifacts: the declaration in configuration, the resolved
dependency set, and the snapshot of the installed code. A failure at any
step rolls back all three; a declaration without a snapshot, or a snapshot
without a declaration, is a state the next startup cannot interpret. The
rollback is not blanket, though: when recovery detects that the dependency
files or the configuration were edited concurrently by something else, it
preserves that edit and raises, rather than overwriting an operator's work
with the pre-transaction copy — a restore that destroys a concurrent edit is
deletion wearing repair's clothes.

Two rules protect the transaction's boundary. **Validate before anything
executes**: resolving a package can run its build steps, which is code
execution, so the manifest and declaration are checked for well-formedness
and policy *before* the package installer is invoked. And **the installer
runs with the runtime's environment, not the caller's**: environment
overrides supplied with the install request are discarded, the installer
binary is pinned, and the resolved lock is audited for references that
would not reproduce — a local path, an editable link — because a production
startup must never resolve dependencies from the network or from a
developer's disk. Snapshots, not links.

## Contributed hooks run isolated and fail open

At run time, a contributed hook in the chain is wrapped: a failure inside it
emits a diagnostic attributed to the contributor and the chain **passes
through** — the call proceeds as if the hook had not intervened — without
repeating any side effect a downstream hook already performed. Fail-open is
the correct default for an **observational** hook — one that records,
measures, or annotates and decides nothing — for the same reason optional
load failure is non-fatal: a contributor's bug is the contributor's, and a
run that would otherwise have succeeded should.

It is the wrong default for an **intercepting** hook. A gate that can refuse
a call, a filter that can withhold a tool, an authorizer — a contribution
that *decides* — is a guard, and a guard that fails open is an absent guard
on exactly the calls that made it throw. Such a contribution declares itself
as intercepting, opts out of the fail-open wrapper explicitly, and fails
closed: its failure is a refused call with the failure as the reason. The
runtime does not infer which kind a hook is; the contribution says, and a
hook that says nothing is wrapped as observational and therefore may not
refuse anything.

The wrapper also mirrors the hook's *shape* exactly — every lifecycle hook,
every state contribution, every transform the inner hook implements, and no
others — because a wrapper that implements a hook the inner does not is a
silent pass-through the chain will count as participation, and one that
omits a hook the inner has is a contribution half-installed.

Fail-open has one exception, and the exception is decided by the wrong
criterion in most runtimes. A **cancellation** must propagate, because the
host cancelling a run is not a hook failing. But the exception the host
raises to cancel is the same exception a contributor's own internal timeout
raises — an operation that gave up waiting produces a cancellation from
*inside* the hook. If the wrapper decides by exception class, a
contributor's timeout is read as the host's cancel: the run ends as
cancelled, its successor hooks never run, and a successful turn is reported
as aborted. So the wrapper decides by **origin**, not class: it checks
whether the host's own cancellation signal for this run is set, and only
then propagates. A cancellation that arrives with no host signal behind it
is a contributor failure, diagnosed and passed through like any other.

This is [verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
at the isolation wrapper: the classification *host cancelled this run* is
computed where it is true — the host's signal — and must reach the wrapper
as that fact, not be re-derived from the shape of an exception the
contributor can produce by accident.

## The loaded set is a snapshot, and the recovery tool stands outside it

Two structural rules follow from loading being startup-only. First, **each
run binds one immutable snapshot of the loaded extensions** — resolved once
at the run's start and carried through its hooks, its delegates, and its
agent construction — so that a concurrent replacement of the process-wide
set cannot mix two extension generations inside one run. A run that read the
live set at every hook would observe a different roster mid-turn.

Second, **the tool an operator uses to list, disable, or remove an extension
must not depend on the extension loading.** If the management command
bootstraps the same environment the runtime does, a broken extension breaks
the command that would remove it, and recovery needs shell surgery. The
management path bootstraps without the extension group, then takes over the
controlled sync itself.

And the contract must be closed in both directions: **a registration the
host silently ignores is worse than one it rejects.** Every contribution kind
the public contract accepts is one the current host handles; a new kind is
added to the contract and the host in the same change, never to the contract
first "for later" — because a contributor whose registration succeeds and
does nothing has been told a lie the diagnostics will never surface.

## What the runtime refuses from a contribution

Some contributions are refused outright until the host can authenticate
them: a custom lifespan that would run code before the host's own startup
completes; a mount that would place an entire sub-application under a path;
a long-lived socket route whose authentication the host cannot see. Each is
a capability that bypasses the tier rule by construction — code that runs
where the host's gates have not yet run — and the correct answer is
refusal with a named reason, not a bigger denylist of what such code may do.
The denylist is a substitute for the boundary; the boundary is the
technique.

## Decision rules

- Load code only from the startup configuration tier; ignore, with a
  diagnostic, any code-naming key arriving through the service-writable
  tier. Test it by writing one.
- Load in declared order, never enumerated order.
- Default a load failure to skip-with-attribution; make it fatal only for an
  extension the operator marked required, and make required opt-in.
- Report a skipped extension as skipped, with reason, on every surface that
  reports loaded extensions.
- Install as one transaction over declaration, lock and snapshot; validate
  before the package installer executes; discard caller-supplied
  environment; pin the installer; audit the lock for non-reproducible
  references.
- Wrap observational contributed hooks so a failure is attributed and the
  chain passes through without repeating a downstream side effect; require
  an intercepting contribution to declare itself and fail closed.
- Decide fail-open by the origin of a cancellation — the host's own signal
  for this run — never by the exception's class.
- Bind one immutable extension snapshot per run; keep the management tool
  independent of the extension group; never accept a registration the host
  does not yet handle.
- Refuse lifespans, mounts and socket routes from contributions until the
  host can authenticate them; name the refusal.

## When not to use it

A runtime with no extension surface — every hook written by the team that
owns the host — has one tier and no second writer, and the isolation wrapper
adds latency to hooks whose failures are the team's own to fix. The
technique starts to pay at *team* stage, the day a second party can
contribute code the host did not review, and becomes non-negotiable the day
the service has a remote administrator.
