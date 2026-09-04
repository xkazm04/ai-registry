---
layer: golden-path
type: golden-path
subject: untrusted-extension-host
status: forged
use_when: [an administrator wants to install third-party code from the product's own admin interface, deciding which extension capabilities may run inside the host process and which must be isolated, designing the privilege declaration an extension ships and the consent it is granted against, an extension's callback failure must be told apart from its deliberate refusal]
techniques:
  - two-tier-extension-format
  - isolation-tier-independent-extension-api
  - pluggable-isolation-runner
  - canonicalizable-privilege-declaration
  - grant-change-consent
  - declared-schema-extension-storage
  - per-callback-failure-policy
  - capability-subtraction-sandbox
  - safe-mode-registration
  - host-api-import-budget
---

# Untrusted extension hosting

A product that lets an administrator install third-party code from its own
interface has taken on the job most hosts correctly refuse: executing code
nobody on the team reviewed, at the invitation of a principal who is not the
operator, in a process that holds every credential the product owns. This
subject is the mechanism set that makes that job survivable — the tiering of
what may run where, the isolation primitive and its honest limits, the
privilege the extension declares and the consent it is granted against, the
persistence it is given without handing it the schema, and the rules that keep
a foreign callback's failure from being read as the host's own verdict.

The subject begins the moment a bundle is present on this host and about to
run, and it ends when the bundle ran or was refused. Everything upstream of
that moment — who published the bundle, what identity signed it, what
moderation label it carries, whether the bytes on disk are the bytes that were
published — belongs to the sibling subject `decentralized-artifact-distribution`,
and this subject consumes that verdict rather than recomputing it.

## The rule this subject inverts, and the price of inverting it

The corpus's standing position on hosts that load contributed code is
[operator-tier-code-loading](../../../llm-agent/runtime-and-io/agent-runtime-assembly/techniques/operator-tier-code-loading.md):
configuration written by the operator, with access to the process's host, may
name code; configuration written by any authenticated administrator through the
service's own interface may never name code. That rule is correct and it is
absolute — *for a host with no isolation primitive*. It is written for exactly
that case and says so: there is no protocol boundary in the host's own address
space, so an entry point named through the service is an authenticated call
that becomes code execution with the process's privileges.

This subject is the other case. A host that **has** an isolation primitive —
an execution context with no ambient reach into the host's memory, filesystem,
network or credentials, and with enforceable resource ceilings — can let an
administrator install third-party code from a UI, because what the
administrator installed does not run with the process's privileges. The
inversion is not free and it is not general. It holds only while all of the
following hold, and every one of them is a mechanism this subject owns:

- The default installation path targets an isolated tier, and the tier that
  runs in the host's own address space is reachable only through a materially
  heavier ceremony that the service's interface cannot perform on its own.
- The isolated tier's reach is entirely brokered: it holds no handles, only
  requests, and every request is checked against a declared grant.
- The grant is declared by the extension in a form a human consented to and a
  machine can diff, and a change that widens it stops the update until a human
  consents again.
- The isolation primitive's *actual* enforcement is published, including the
  ceilings it cannot enforce on this deployment, so nobody reads "isolated" as
  a guarantee the runner does not make.
- When the isolation primitive is absent, the isolated tier does not run, and
  the operator is told it is not running.

Drop any one and the rule reverts: the honest posture for a host that cannot
satisfy these is the neighbour's absolute rule, not a weakened version of this
one. A host that ships an opt-in sandbox and an opt-out that is one
configuration row away has satisfied none of them, because a deployed fleet
converges on the default and the default is off
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

## Where this stops, and the neighbours start

Four neighbours border this ground closely enough that a whole technique can be
drafted onto the wrong one.

[Supply-chain](../../code-provenance/supply-chain/supply-chain.md) owns code that arrives through a
**package manager at build time**: dependency resolution and its policy gates,
lockfile freshness, archive-extraction safety, and the manifest-scoping
discipline that keeps a declared permission set honest against actual use. This
subject owns code that arrives through the **product's own admin interface at
run time**. The discriminating question for a reader who holds both is:
*who installs this code, and when — a developer editing a committed manifest
that passes your build and your review, or an administrator clicking a button
in your running product?* If the former, the neighbour; if the latter, here.
The scoping craft in `permission-manifest-scoping` is not restated here and
still applies to the declaration an extension ships; what is added is that the
declaration's reader is not a reviewer but a consent dialog and an automated
diff, which changes what the format has to be.

[Authorization](../../identity-and-access/authorization/authorization.md) owns who may perform an
operation: scope design, privilege tiers, the dispatch chokepoint, the failure
direction. This subject owns what a **non-human principal that the operator
merely tolerated** was granted, and how that grant is enforced at the broker.
The seam is that the neighbour designs the capability vocabulary and this
subject binds a specific untrusted installation to a subset of it; a rule that
would still be true if the principal were a human administrator belongs there.

[Sidecar-provisioning](../../../llm-agent/runtime-and-io/sidecar-provisioning/sidecar-provisioning.md)
owns artifacts the application does not ship, fetched after install, and the
process boundary that keeps two native runtimes from colliding. Its subject is
the acquisition and verification of a binary **the operator wants**; this
subject is the containment of code **the operator merely tolerated**. Its
`split-trust-by-registration-path` is the closest single document in the corpus
and its two doors — the operator's configuration file and the host's API — are
the same two doors here; what it does not have, and what this subject exists
for, is a tier in which the API's door is *safe by construction* rather than
safe by the caller's standing.

[Error-handling](../../../backend-platform/resilience/error-handling/error-handling.md)
owns the failure taxonomy, the doors that convert failures, and the structured
propagation that keeps a verdict typed across a boundary. That craft is cited,
not restated. What belongs here is the part that only exists because the code
on the far side of the callback boundary is foreign: who gets to declare that a
callback's failure is fatal, what a timeout is allowed to bound, and why a
crash and a deliberate refusal must not arrive as the same signal.

Two things this subject deliberately does not absorb. Sandbox escape as an
exploit class is not here — this subject owns the design of the boundary and
the guarantees it publishes, not vulnerability research against a particular
isolate. And capability design in general is the authorization neighbour's.

## The split is by where the code runs, not by what it does

The first design decision is the tiering, and the naive version of it sorts
extensions by what they are for — a "themes" tier, an "integrations" tier, an
"analytics" tier. That taxonomy is useless at run time, because it says nothing
about privilege. The split that works is by **where the code executes**: a
sandboxed tier whose code runs in an isolate with brokered reach, and a
host-tier whose code runs in the host's own address space with the host's
privileges. Everything a capability needs follows from that one fact, and
[two-tier-extension-format](./techniques/two-tier-extension-format.md) owns the
decision rule for which capabilities genuinely cannot cross an isolate boundary
— along with the counter-force that makes the tiering hold: the low-privilege
tier must also be the tier with the *shorter* install ceremony, or convenience
routes every author to the dangerous one.

The tiers must not, however, be two products. Same hook names, same context
object, same capability vocabulary; the format changes isolation and resource
limits and nothing else. That invariant is what makes moving an extension
between tiers a configuration change rather than a rewrite, and it is what lets
a host with no isolation runner degrade by *skipping* the sandboxed set instead
of failing to start —
[isolation-tier-independent-extension-api](./techniques/isolation-tier-independent-extension-api.md),
which also states the honest cost of that degradation: a silent skip is empty
success, and the operator must be told the extensions are not running. The
operator's own skip - a boot that registers every extension and runs none, so
the disable control stays reachable when an extension breaks the host - is
[safe-mode-registration](./techniques/safe-mode-registration.md).

The isolation primitive itself is an injected dependency, because it is the one
part of the design that is a property of the deployment platform rather than of
the product. The enforcement surface above it — the broker, the manifest, the
capability set — is emphatically **not** injected, because a second platform
that had to reimplement the broker would reimplement the policy with it.
[Pluggable-isolation-runner](./techniques/pluggable-isolation-runner.md) owns
that seam and the asymmetry it creates: two runners implementing one interface
do not enforce the same ceilings, and the host that advertises one word for
both has published a guarantee it cannot make on one of them. A host with no
isolation primitive at all - an embedded scripting runtime in its own process -
still has one honest containment, reach without ceilings, and
[capability-subtraction-sandbox](./techniques/capability-subtraction-sandbox.md)
owns it.

## Privilege is declared in a form built for consent and for diffing

An extension's privilege is not a runtime negotiation. It is a static
declaration shipped with the bundle, presented to a human before installation,
and enforced at the broker on every call. Two properties the declaration must
have are in tension, and resolving that tension is the whole of
[canonicalizable-privilege-declaration](./techniques/canonicalizable-privilege-declaration.md):
the enforcement path wants flat, cheap, hashable tokens, and the consent path
wants structure — a category, an operation, and an open constraint object that
can say *which* hosts, *which* collections, *which* paths. The resolution is
that the structured form is the authority and the flat set is re-derived from
it at every parse site, never the reverse, and that the structured form has a
canonical spelling — sorted, deduplicated, implication-closed — so that two
declarations of the same privilege are the same bytes and can be hashed,
signed, and compared.

Comparison is the other half, and it is where hosts lose. An update ships a new
declaration; something must decide whether the update widened what the
administrator consented to. That decision is not a set difference, because
escalation polarity is **not uniform across change kinds** — removing an
operation narrows, removing a *constraint* widens — and it is not a job for an
instrument that exists in the codebase but is not wired to the path an operator
actually updates through.
[Grant-change-consent](./techniques/grant-change-consent.md) owns the diff, its
polarity rules, the re-consent gate it drives, and the wiring rule that keeps
the whole thing from being decoration.

## Persistence without handing over the schema

An extension that cannot store anything is a formatter. An extension that can
issue schema changes is an administrator of your database. The resolution that
works is a declared schema: collections and their indexes are declared in the
bundle's manifest, the host creates them inside a namespace bound to the
extension's identity, and the query surface refuses any filter or ordering on a
field the manifest did not declare an index for.
[Declared-schema-extension-storage](./techniques/declared-schema-extension-storage.md)
owns it, including the decision rule that gives the design its teeth — the
performant query set should be exactly the declared index set, *enforced rather
than documented*, so that removing an index fails queries loudly instead of
degrading them into scans nobody notices until the table is large.

The convention this replaces is the prefixed table name, where the extension
runs its own migrations against a shared database and agrees, by convention, to
touch only names beginning with its own. It costs an injection surface, an
extension-authored migration path with the host's credentials behind it, and a
population of orphaned tables that survive every uninstall because nothing ever
named their reaper ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).

## A callback from foreign code is not the host's own error path

Extensions participate by registering callbacks at named points, and a host
with one global policy for all of them has chosen wrong for most. The two
naive policies fail symmetrically: if every callback is implicitly fatal, one
buggy extension can refuse every save in the product; if none is, an extension
installed *to* validate or veto an operation is a guard that silently stopped
guarding the first time it threw.

The resolution is per-registration and it has three parts, all owned by
[per-callback-failure-policy](./techniques/per-callback-failure-policy.md).
Each registration declares whether its own failure is fatal to the operation
that triggered it, and the default is the correctness-safe side rather than the
uptime-safe side. A timeout bounds the **wait, not the work** — the host stops
waiting; it cannot stop foreign code that is already running, and a design that
pretends otherwise leaks executions. And a callback that wants to *refuse* an
operation returns a structured rejection with a bounded reason, because "this
code threw" and "this extension deliberately declined this save" are different
verdicts that must arrive at the caller as different values
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).

## The budget the host spends before the extension starts

The tier boundary determines the API and the API determines what an author can
write — and there is one more step, easy to miss because it looks like the
author's problem. The host requires the extension to import the host's own
interface: a base class to subclass, a result type to return. Resolving that
import is host code, and under a wall-clock execution limit it is charged to
the extension. A published client that pulls in a settings layer, a transport
client and a large class registry can consume a substantial fraction of a
single-digit-second limit before the extension's first line runs, and the
symptom — *the extension timed out* — points every diagnosis at the author.
[host-api-import-budget](./techniques/host-api-import-budget.md) owns the
measurement, the honest statement of the limit as a total with the host's share
named, and the dependency-free substitution under the documented import path —
including the second resolution route a naive stub leaves shut.

## The admin surface is an old pattern under a new force

Extensions want to render configuration screens, and a host that lets sandboxed
code emit markup into its admin interface has undone its own isolation at the
one place the operator's session cookie is sitting. The answer is the pattern
the corpus already owns:
[schema-driven-ui](../../../ui-surfaces/input-and-editing/schema-driven-ui/schema-driven-ui.md)
— a description is data, a renderer realizes it from a closed vocabulary of
blessed components, the vocabulary has no raw-markup kind and no style
pass-through, and validation happens at one door. None of that machinery is
restated here and none of it should be reimplemented.

What this subject adds is only the **force**. That subject names its triggers as
flexibility and travel: the composer is not the author of the code, the surface
is configurable, the same description renders in several hosts. Here the
trigger is a trust boundary, and the difference is that the closed vocabulary
stops being a design convenience and becomes the security control — which
changes two things about how it is run. First, the renderer's rejection of an
unknown node kind cannot be a repair that renders a fallback; for a
configuration screen that grants privileges, an unrenderable description is a
refusal the administrator sees, not a partial screen they act on. Second, the
description is emitted by the isolated tier and must cross the broker like any
other request, which means the vocabulary is versioned as part of the extension
API and is subject to the same tier-independence rule as every other hook: the
host tier does not get a richer vocabulary because it *could* have one. That is
the whole of the addition, and it is a paragraph rather than a technique.

## What the naive reading gets wrong

The naive host reads "we have a sandbox" as the end of the design. It is the
beginning: an isolate with no ambient reach is a machine that can compute and
nothing else, and every useful extension is useful precisely through the
brokered calls that leave it. The security of the system is the security of the
broker and the declaration it checks against, not of the isolate.

The second naive reading is that the privilege declaration is documentation. It
is documentation *and* it is the enforcement input *and* it is the consent
record *and* it is the diff subject on every update — four consumers, one
authority, and a host that lets any of the four read a hand-maintained second
copy has built a race with a delay fuse
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

The third is that the tiers can be sorted out later. They cannot: the tier
boundary determines the API, the API determines what an author can write, and a
host that ships a permissive tier first and an isolated tier second discovers
that its whole extension population depends on capabilities the isolated tier
does not have. Ship the isolated tier first and let the host tier be the
exception that has to argue for itself.
