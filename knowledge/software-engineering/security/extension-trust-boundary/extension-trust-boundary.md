---
layer: golden-path
type: golden-path
subject: extension-trust-boundary
status: forged
use_when: [designing an extension contract for a service that runs as many processes, choosing what an extension mechanism loads by default, letting operator-supplied code attach externally reachable surface, writing down a hazard the host cannot yet check]
techniques:
  - re-entrant-registration-across-processes
  - invert-the-default-for-exposed-surface
  - two-phase-attach-then-initialize
  - unenforced-collision-is-a-documented-capability
---

# The extension trust boundary

An extension is code the operator **decided** to run inside the service. It was
not pulled in by a resolver chasing a version range and it is not running in a
sandbox. It executes in the host's own processes, with the host's memory, the
host's credentials, the host's network identity and the host's file
descriptors. Anyone who can install one could already have replaced the host
binary; that is the honest statement of the threat model, and every contract
below follows from it.

So the boundary is not *how do we contain this code*. Containment is not on
offer and a design that pretends otherwise ships a sandbox-shaped comment over
an unsandboxed call. The boundary is:

> The operator's grant is total. What must be defended is the operator's
> **knowledge** of what they granted — and what the host owes code it has
> already agreed to run.

That reframing decides everything. It means the host's obligations are a
*contract* (when does your code run, where, how many times, against what
lifecycle) and its security work is *disclosure* (what did loading this thing
just make possible, and how would you notice it happening). Three questions
carry the whole subject:

1. **Where does it load?** — the host is a process graph, not a process.
2. **What loads without being asked?** — the default, per group, not per
   mechanism.
3. **What can it now reach, shadow, or expose?** — capabilities, disclosed
   whether or not a check exists for them.

## The host is a process graph, so the contract is re-entrancy

The naive design loads extensions once, at startup, in the process that parses
the configuration. It fails the first time a worker process is created, because
the thing the extension registered — a model architecture, a scheduler policy,
a serialization codec, a transport — is looked up in a **per-process** registry,
and the process doing the lookup is not the process that did the registering.
Under a start method that inherits memory the bug hides for a release; under
one that re-executes the program it is immediate; under a process created
minutes after startup it is immediate everywhere.

Two corrections are available and only one of them is cheap. A **per-process
manifest** — a declaration of which extensions load in which roles — is
precise, and it pushes the host's process topology into the head of every
extension author, permanently, including through the release where the topology
changes. **Loading in every process** is coarse, costs a repeated import, and
asks the author for exactly one thing they can actually guarantee:

> Registration is idempotent. It will be called once per process, in processes
> you did not create and cannot enumerate, and calling it again must be
> harmless.

Take the coarse one. The consequences are worth stating because authors trip on
all three: the entry function is on the startup path of every process, so it
must not download, connect, or import a heavy runtime eagerly; global state set
during registration is per-process state and can never be a channel between
processes; and a registration failure happens once per process, so the host
must decide — per group, deliberately — whether it aborts the process or is
logged and skipped.

The rule has one exception and it is not a compromise. A group whose
contribution **is** a surface rather than a name loads only in the process that
owns that surface, because loading it twice means two of it. So a host with
tiers ends up with two loading loci, and the consequence lands on extension
authors as a distribution rule: **a capability that spans tiers ships as two
registrations in one package, under two groups, loaded independently, and
neither implies the other.**
[re-entrant-registration-across-processes](./techniques/re-entrant-registration-across-processes.md)
is the contract in full, including what to do about the one thing that must
happen exactly once for the whole deployment.

## One discovery mechanism, several groups, unequal blast radius

Most systems discover extensions the same way for everything: the packaging
system's advertisement table, with a named group per extension kind. The
mechanism is uniform, which invites a uniform policy — *load everything
discovered, unless an operator narrows the set with an allowlist*. For most
groups that policy is right. A registered model architecture, codec or
scheduler policy is **inert until something asks for it by name**; loading it
adds a dictionary entry, and the worst plausible outcome of loading one you
did not need is a wrong answer inside your own process, reachable only by
someone who could already run code there.

One group is not like that. The group whose members attach **externally
reachable request handlers** is not registering an option — it is *publishing*.
The moment its member loads, an unauthenticated stranger with the address of
the service can send bytes to code the operator never named. Loading and
exposure are the same event, and there is no later step at which somebody asks
for it by name.

So that group **inverts the default**: nothing loads unless an operator names
it, and an unset allowlist means *none*, not *all*. The generalizable rule, and
the best decision in this subject:

> A default belongs to a **group's blast radius**, not to the discovery
> mechanism that happens to serve every group. A uniform default across groups
> of unequal exposure is a bug that looks like consistency.

The asymmetry has to be spelled out where the option is configured, not only in
a design note, because a reader who has learned one group's convention will
assume the other's. Unset must be a *distinguishable* state from
empty-and-deliberate for the inert groups, and for the exposed group it must
resolve to nothing at all — an absent setting is not a request for everything
installed. The other half of the inversion is that **installing is not
enabling**: presence on the machine makes a member discoverable, naming it in
the allowlist makes it run, and keeping those two facts separate is what lets
an operator audit "what is installed here" independently of "what is live
here".

And then the trap the two-registrations rule sets, which is the single most
valuable thing to write down about a mixed-default mechanism: **allowlisting
the exposed half does not restrict the in-process half.** A package shipping
both registrations gets the strict default on one and the permissive default on
the other, so an operator who reviewed the named extension and enabled it has
reviewed one of two things that will run — the other loaded because it was
installed. Whoever approves an enablement approves both registrations, and the
mechanism says so at the point of enablement, because nothing about naming one
of them hints at the existence of the other.
[invert-the-default-for-exposed-surface](./techniques/invert-the-default-for-exposed-surface.md)
carries the classification procedure and the rules for spelling each default.

## The surface exists before its backend does

An extension that attaches request handlers has a sequencing problem that
in-process extensions do not. The handler surface is assembled while the
application object is being built, and it is effectively frozen once serving
starts. The thing the handlers actually need — the client for the engine, the
worker pool, the store — does not exist yet at that moment, and on at least one
legitimate deployment shape it **never** exists: a front-end-only instance that
routes to backends elsewhere, a control-plane process, a health-only mode.

A single initialization hook forces a false choice between attaching too late
and requiring a backend that is not there. Split it:

- **Attach.** Structural, runs while the surface is being built, given the
  application object and configuration only. It must be total — it may not fail
  because a backend is missing, because at this point one is always missing.
- **Initialize.** Runs later, given the live client, and may **never run at
  all**. Everything the handlers need from the backend is captured here.

The rule that makes this safe: a handler that can be reached between the two
phases must answer with an explicit not-ready outcome rather than dereference
a field that is still empty. And the backend-less deployment is a case the
extension **answers for** — either it declares up front which server
capabilities it requires, so the host declines to load it where they are
absent, or it accepts being loaded and degrades. What it may not do is assume
the case away, because the host will not warn it. Prefer the declaration: an
eligibility requirement the loader can evaluate keeps the decision out of the
handler, where it would otherwise be one forgotten check away from a crash.

The phases also fail in the direction nobody designs for. They communicate
through shared state, and there are host entry points that construct that state
without ever running phase one — a batch runner, a test harness, a secondary
launcher. Phase two therefore runs against state where phase one left nothing,
and it must treat that as a legitimate state and do nothing, not as a broken
invariant. The complement is what makes it detectable: phase one **records its
outcome even when it loaded nothing**, so "ran and found none" and "never ran"
are different observations rather than the same absent field.
[two-phase-attach-then-initialize](./techniques/two-phase-attach-then-initialize.md)
carries the protocol, including the shutdown phase that both other phases owe.

## A hazard with no check is a capability, and capabilities are disclosed

Here is the honesty case, and it is worth as much as the inversion.

Handler paths are not checked for collision. Registration order decides, and
the last registration wins. An enabled extension can therefore claim a path the
host itself serves and **silently shadow it** — no error, no warning, no log
line, and callers of the shadowed path get different behaviour with nothing to
attribute it to. There is no check. Writing one was deferred.

Three responses are available:

1. Say nothing until the check ships. The reader concludes it cannot happen.
2. Promise the check. A plan is not a property, and the document now describes
   a system that does not exist.
3. **Write the capability down.** Name it as something an operator-named
   extension *has*: it can shadow any path, including the host's own, and the
   resolution rule is last-registration-wins.

Take the third. The rule generalizes past this one hazard:

> An unmitigated hazard is documented as a **capability the trusted party
> holds** — not omitted until the check ships, and not described as mitigated
> by a convention.

What makes such a disclosure real rather than a disclaimer is that it comes
with two things attached. An **observation**: the operator is told to inspect
the live surface after startup and compare it against what was expected, which
is an answer obtained from the running system rather than from the
configuration that was supposed to produce it. And a **convention** for the
author: publish under a distinct prefix so accidental collisions become
vanishingly unlikely — stated as what it is, a way to avoid an accident, never
as a control against a decision.
[unenforced-collision-is-a-documented-capability](./techniques/unenforced-collision-is-a-documented-capability.md)
gives the procedure for turning any uncheckable hazard into a disclosure.

### The pairing that catches extension authors out

Disclosure has a second item on the same surface, and the two are the same
hazard seen from opposite sides. Where a host authenticates its request
surface, that authentication is very often scoped to a **path prefix**, not to
the server. Everything under the prefix is checked; everything outside it is
not, and the set outside is larger than anyone remembers — health, metrics,
introspection, and any new surface somebody attached.

A prefix-scoped boundary has a second effect that surprises people who did not
build it: it makes protection a property of the **address**, not of the
capability. The same underlying function reached under a covered prefix is
authenticated and reached under an alias outside it is not, and hosts
accumulate aliases — a compatibility path for one platform, a shorter spelling,
an operational control added beside the health check. So the honest disclosure
is not "authentication covers this prefix"; it is an **enumeration of both
sets**, each entry with what it can do and what makes it present, including the
aliases that reach protected capability by an unprotected road. Enumerating the
covered set alone tells a reader nothing about the size of the other one.

An extension author who assumes the host's authentication covers their handlers
is wrong by default. Worse, the two conventions pull against each other: the
collision advice says take a distinct prefix of your own, and a distinct prefix
is precisely how a handler lands **outside** the authenticated one. So the
extension contract must state the coverage boundary explicitly, and every
extension either attaches under the covered prefix, authenticates its own
handlers, or records in its own documentation that its surface is deliberately
open. The host's job here is not to fix the author's choice — it is to make
the choice visible, since an author who never learns the prefix rule will make
it silently and in the unsafe direction.

## Failure modes of the naive reading

- **"Extensions are untrusted, so sandbox them."** They run in your address
  space with your credentials. Designing for containment you do not have
  produces controls that read as security and are not. Design for a *trusted
  but fallible* party.
- **"The allowlist is the security control."** It bounds *what gets loaded*.
  It says nothing about what a named member does once loaded, and treating it
  as an access control leads directly to allowlisting something and then
  reasoning as if it were still constrained.
- **"Load once at startup."** Correct for exactly one process, and the host is
  not one process.
- **"One default for one mechanism is cleaner."** It is more symmetrical and it
  is wrong; symmetry across unequal exposure is the bug.
- **"Documenting a hazard instead of fixing it is a cop-out."** Documenting
  *instead of* a cheap available fix is. Documenting while no check exists is
  the only state that does not mislead — and the disclosure is what makes the
  eventual check a compatible change rather than a surprise.
- **"Our authentication covers the whole server."** Check where it is mounted
  before repeating that sentence.

## Where this subject ends and its neighbours begin

**Supply chain** ([supply-chain](../supply-chain/supply-chain.md)) owns the
provenance of code that crosses into the tree because a resolver put it there:
is this artifact what it claims to be, was it tampered with, what does its
transitive set drag in, and does the machine have any business holding it. It
answers *should this code exist here at all*. This subject begins one step
later and one step down, at the point where the answer is yes and the operator
has deliberately named a package to be executed inside the service: what the
host must guarantee to code it has already agreed to run, and what that code
can reach once it runs. The discriminating question is whose decision is under
examination. If it is the decision to trust the artifact, that is supply
chain. If the trust decision is settled and the question is what the host owes
the artifact — and what the artifact now silently holds — it is here.

There is also a neighbouring body of work, in the runtime literature rather
than the security one, on loaded code inside a process serving **several
mutually distrusting principals**: caches keyed by name that outlive a
principal switch, a registry rebuilt per principal while the runtime's own
module table is not, extensions from two installers colliding under one name.
That is an *isolation* problem, and its unit of analysis is the principal. This
subject has exactly one principal — the operator, whose grant is total — and
its unit of analysis is the *process graph* and the *disclosure*. The
discriminating question: are the parties who install extensions mutually
distrusting? If yes, you need isolation machinery and this subject will not
give it to you. If there is one operator and the question is what their single
grant implies, you are in the right place.

## What is not this subject

- **Sandboxing and in-process privilege reduction.** Separate processes,
  capability-restricted interpreters, and syscall filters are a different
  design that changes the threat model rather than describing it.
- **Authenticating and authorizing the service's own callers.** The surface an
  extension attaches to inherits whatever the host's request-side controls
  already do; this subject only insists that the *coverage boundary* be stated
  and that the extension know which side of it it is on.
- **Versioning and compatibility of the extension interface.** Deprecation
  windows and interface stability are real obligations of a host with
  extensions, and they are a compatibility subject, not a trust one.
- **Distribution and installation mechanics.** How the operator gets the
  package onto the machine is upstream of every question here.

## The techniques

- [re-entrant-registration-across-processes](./techniques/re-entrant-registration-across-processes.md)
  — the entry-function contract for a host that is a process graph: idempotent,
  cheap, called in processes the author cannot enumerate, with a stated rule
  for the work that must happen exactly once.
- [invert-the-default-for-exposed-surface](./techniques/invert-the-default-for-exposed-surface.md)
  — classify each extension group by blast radius, assign the default per
  group, and make the unset case resolve to nothing for the group whose loading
  *is* exposure.
- [two-phase-attach-then-initialize](./techniques/two-phase-attach-then-initialize.md)
  — attach structure while the surface is being built, capture the backend when
  it exists, answer explicitly in between, and name the teardown both phases
  owe.
- [unenforced-collision-is-a-documented-capability](./techniques/unenforced-collision-is-a-documented-capability.md)
  — the procedure for a hazard with no check: name who holds it, state the
  resolution rule, give the operator an observation and the author a
  convention, and record that the check is absent.
