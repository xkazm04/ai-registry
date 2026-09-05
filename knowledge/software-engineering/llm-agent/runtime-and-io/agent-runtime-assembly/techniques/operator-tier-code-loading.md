---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: operator-tier-code-loading
status: forged
stage: team
laws: [one-validation-door, failure-not-empty-success, verdict-survives-boundary, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding which configuration file may name code to load, a broken extension takes the host down, a contributed hook's timeout ends the run as cancelled, choosing whether a load failure is fatal, deciding whether a sandbox lets administrators install code through the product]
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
| **service-writable, isolated** | any authenticated administrator, through the service's own interface | only when all four conditions below hold |

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

## The third row: the second row's justification is a precondition

Read the second row's justification again — *there is no protocol boundary
here and no process boundary; the isolation story the tool protocol offers
across a wire is unavailable in the host's own address space*. That is not a
universal truth about administrators; it is a statement about a particular
host, and it can be false. A host that has acquired an isolation primitive —
a runtime that executes contributed code in a container of its own with the
host's memory, time and syscall ceilings applied to it — has the boundary the
second row says is missing. Where the precondition fails, the rule inverts:
an administrator MAY install code through the product's own interface, and a
runtime that still refuses is paying the second row's cost without owning the
second row's problem.

The inversion is conditional on four things, and their value is that they are
**joint**. Each one, alone, is a control that the other three's absence
defeats; a host that implements three of them has not implemented
three-quarters of this rule, it has implemented none of it. State them as one
gate:

1. **An isolation primitive exists and the contributed code actually runs
   inside it**, with the host's resource ceilings applied to that instance
   rather than to the host as a whole. Without this the other three are
   paperwork: a declaration, a consent screen and an upgrade gate describe
   what code intends to do while the code runs with the host's own
   privileges and can do anything.
2. **The privileges are declared in a manifest that is the same artifact the
   runtime enforces against.** One declaration, read by both the install
   surface and the sandbox — never a document describing the intent beside a
   separately maintained switch that grants it
   ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
   Without this the two copies drift the day someone adds a privilege, and
   they drift in the direction that grants more than the screen showed: the
   consent an administrator gave stops describing what the code can do, and
   nothing reports the divergence.
3. **The administrator sees those privileges and consents at install time.**
   Enforcement without disclosure produces a correctly sandboxed extension
   nobody chose to trust; the sandbox then bounds the blast radius without
   ever having asked whether the blast was wanted. Consent is what converts
   a technical ceiling into an accountable decision, and it is the step that
   makes a later incident attributable to a person rather than to a default.
4. **A privilege *increase* on update is a separate, explicit gate**, not a
   line item inside the update. Without it the whole chain is a one-time
   formality: an extension is installed at a modest privilege set, consented
   to, and then raises itself on the next version through a path the
   administrator experiences as routine maintenance. The gate fires on the
   *delta*, and only upward — an update that narrows its privileges needs no
   ceremony, and requiring it teaches administrators to click through the
   one that matters.

State the residual honestly, because it is the part a product page will
leave out. **The isolation primitive's guarantees are the ceiling on all
four.** Everything above is a claim about what the contributed code cannot
reach, and that claim is exactly as strong as the container enforcing it. A
host whose runner bounds wall time and nothing else is making a materially
weaker promise than one whose runner bounds CPU and memory: the first can be
saturated by a contribution that spends the whole budget computing rather
than waiting, and it cannot say otherwise. The difference is not an
implementation detail to be discovered by an operator under load — it is part
of the tier rule, so the host publishes which ceilings its runner actually
enforces, in the same place it tells an administrator that installing code is
permitted here.

What this section states is the *tier rule* and nothing more: when the second
row's prohibition lifts, and what must hold together for it to lift. The
mechanisms behind each condition — how the sandbox is built, how a manifest is
verified, how privileges are represented and revoked — belong to the subject
that owns hosting third-party extensions, and a runtime adopting the third row
takes them from there rather than reinventing them at the assembly layer.

## The fourth row: when the agent writes the configuration

The three rows above are ordered by **who can write the configuration**, and
every writer in them is a person: an operator with host access, an
administrator with a login. A runtime that lets the agent it runs extend its
own tool roster adds a fourth writer, and that writer is not a person who
happens to be automated — it is a different kind of principal, and the
difference lands on exactly one of the four conditions.

| tier | written by | may name code |
| --- | --- | --- |
| **agent-writable configuration** | the model, through a tool call, at its own discretion | see below — the third row's inversion is **unavailable** |

Read condition 3 again: *the administrator sees those privileges and consents
at install time*. For this tier there is no administrator at install time,
and that is not an oversight to be patched with a confirmation dialog — it is
the tier's entire purpose. A runtime grants the agent an extension surface
precisely so that capability can be added without a human in the loop; a
consent step at install time removes the property the tier was built to have.
The condition is not unmet, it is **structurally unavailable**.

Because the four conditions are joint, that settles it. A host cannot take
the third row's inversion on an agent-writable tier by satisfying the other
three, for the same reason the third row already gives: three of four is not
three-quarters of this rule, it is none of it. So the agent-writable tier has
two honest resolutions and no third:

- **Deny code entry, and extend through data.** The agent's durable
  contributions are declarative — a schema, an instruction document, a
  procedure the runtime interprets — and none of them is an entry point. New
  *code* capability goes down the ladder to the startup tier, where a human
  performs the build. This is row 2's rule applied to a non-human writer, and
  it is the resolution that keeps the guarantee intact.
- **Move consent in time, and say what that costs.** Where the surface must
  load code, consent becomes *review-time* rather than install-time, and it
  is a strictly weaker guarantee that may only be claimed when three things
  hold together: every installation appends to a record the operator actually
  reads, that record names the privileges rather than the fact of an install,
  and the contributed code cannot take an irreversible action before the
  review window closes. Without the third, review is an audit of damage
  already done — and
  [an audit record of an unrecoverable action is not a substitute for being
  able to undo it](../../../../_laws.md#record-precedes-effect).

**The isolation that counts is the one wrapping the contributed code, not the
one wrapping the agent.** This is the specific way a runtime talks itself into
row 3 without owning it: the agent's shell runs in a sandbox, the product page
says the system is sandboxed, and the tool module the agent just wrote is
imported into the host's own process with the host's privileges. Two different
boundaries, one word. Condition 1 asks about the second one.

The mechanical test transfers unchanged, with the writer swapped: have the
agent install a code-naming extension through its own tool surface, and see
what the runtime does. A runtime that loads it has granted a model the
operator tier — and, unlike a misconfigured administrator account, this
writer's whole design is to keep writing.

## Load order is deterministic and load failure is attributed

Extensions load in the order the startup configuration lists them, never in
directory order or map order, because load order is visible — an extension
that registers a hook class or a tool name first wins a collision, and a
collision resolved by filesystem enumeration is resolved differently on the
next machine.

A load failure — an import error, a missing native dependency, a broken
manifest — produces a diagnostic *attributed to the extension*, and then one
of two things happens, decided by the operator in advance:

- **Optional:** the extension is skipped, the diagnostic is
  recorded and surfaced, and the host starts. The runtime that started
  without it is a runtime with a *known* gap, which is the honest state.
- **Required:** the host refuses to start. This converts every later
  failure — a native library removed by an image update, a snapshot deleted
  from disk — into a startup abort that only someone with shell access can
  recover. That is the right cost for an extension the deployment cannot
  function without, and the wrong cost for everything else.

Which one is the default is decided by the **same declaration that decides
the run-time fail direction below**, not by a global setting. An
observational contribution — one that records, measures or annotates —
defaults to optional: the run that starts without it is a run with a gap in
its telemetry. An **intercepting** contribution defaults to required, for
the reason the run-time rule gives: a guard that fails to load is an absent
guard on every call for the whole process lifetime, and a host that starts
without it has silently dropped a control the operator installed. The
operator may downgrade an intercepting contribution to optional explicitly,
per extension, and the downgrade is recorded beside the declaration so the
gap is a decision rather than a default. Deriving both fail directions from
one declaration is what keeps them from disagreeing about the same
contribution — a hook that fails closed at run time and open at load time
has two policies and the weaker one wins on the day that matters. The
field's admission-control systems land on the same default: a policy
webhook that cannot be reached fails the request unless its configuration
says otherwise, and the exception is written per webhook, in the same object
that declares what it checks.

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

Fail-open has one exception, and the exception is easy to decide by the
wrong criterion. A **cancellation** must propagate, because the host
cancelling a run is not a hook failing. But in a runtime whose timeouts are
implemented *as* cancellations — the common shape in cooperative async
runtimes — the exception the host raises to cancel is the same exception a
contributor's own internal timeout raises: an operation that gave up waiting
produces a cancellation from *inside* the hook. If the wrapper decides by
exception class, a contributor's timeout is read as the host's cancel: the
run ends as cancelled, its successor hooks never run, and a successful turn
is reported as aborted. So the wrapper decides by **origin**, not class: it
checks whether the host's own cancellation signal for this run is set, and
only then propagates. A cancellation that arrives with no host signal behind
it is a contributor failure, diagnosed and passed through like any other.

The premise is a property of the runtime, not a law, and the correction
scales with it. A runtime with **scoped cancellation** — a timeout context
that owns the cancellation it issued and converts it into a timeout error at
its own boundary, or a cancellation token the callee can compare against the
host's — has already distinguished the two origins before the wrapper sees
anything: the contributor's timeout leaves the contributor as a timeout, and
only the host's cancellation arrives as a cancellation. That is the origin
rule enforced by the runtime instead of the wrapper, and the wrapper should
lean on it rather than reimplementing it. The wrapper's own check is still
correct there and still cheap; what it must never do is *reintroduce* the
class-based read on top of a runtime that has a scoped primitive, by
catching the translated timeout and re-raising it as a cancellation. Where
the runtime counts cancellation requests rather than classifying exceptions,
consume the count the way the runtime's own structured constructs do, or the
host's later cancellation is swallowed by the contributor's earlier one.

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
- Lift that prohibition only when all four third-row conditions hold
  together — real isolation with the host's ceilings, one manifest that is
  both the disclosure and the enforcement input, consent at install, and a
  separate gate on any upward privilege change — and publish which resource
  ceilings the runner actually enforces, because they are the ceiling on the
  whole arrangement.
- Load in declared order, never enumerated order.
- Derive the load-failure default from the contribution's declared kind:
  observational skips with attribution; intercepting is required unless the
  operator downgrades it explicitly, per extension, with the downgrade
  recorded beside the declaration. One declaration decides both the
  load-time and the run-time fail direction.
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
  for this run — never by the exception's class. Where the runtime scopes
  cancellation itself, use its translated timeout and its request count
  rather than re-deriving origin from exception shape.
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
