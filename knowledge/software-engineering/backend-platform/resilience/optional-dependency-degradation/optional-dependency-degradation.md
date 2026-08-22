---
layer: golden-path
type: golden-path
subject: optional-dependency-degradation
status: forged
use_when: [starting a repository that must clone and run with no credentials, deciding what an unset configuration value should do, a deployment silently ran in fallback mode for a week, hardening a store's permissions and a fallback stops writing]
techniques:
  - absent-degrades-malformed-fails-fast
  - per-variable-blast-radius
  - guarded-singleton-accessor
  - probe-the-grant-not-the-config
  - capability-honest-refusal
  - degradation-coupled-to-hardening
---

# Optional dependency degradation

Most applications acquire their external dependencies one at a time and never
revisit the acquisition. A hosted database arrives in week two, an error tracker
in week five, an object store in week nine, and each arrives the same way: a
value is read from the environment at module load, a client is constructed from
it, and the code below assumes the client exists. Nothing declares that
assumption, so nothing notices when it stops holding. The bill arrives later, in
a shape every team recognises — a new hire who cannot run the application until
someone finds them four credentials, a preview deployment that boots into a
stack trace, an automated environment that cannot exercise a single page because
page one imports a client that throws.

This subject holds the opposite design rule, stated as a property of the
repository rather than an aspiration about its behaviour: **every external
dependency is optional. The application boots with zero configuration, and each
dependency-backed feature degrades to a named fallback.** Not "handles
failures gracefully" — *boots*, with an empty environment, and every surface
either works or refuses honestly. That property is testable in one command, by
anyone, on any machine, which is what separates it from the intention that
usually stands in for it.

What it buys is cloneability. A person or an agent who has just obtained the
repository can run it, see it, change it and verify the change before anyone
grants them anything: onboarding stops being a credential handshake, preview
environments stop being privileged, and "graceful degradation" becomes a
per-feature claim someone can falsify by unsetting one value and looking.

## The asymmetry is the whole subject

One rule carries the rest, and it is an asymmetry between two conditions that
naive code treats identically:

> **An absent configuration value degrades. A malformed configuration value
> fails fast at boot, naming the offending value.**

The two look the same to a `try/parse/fallback` block and mean opposite things
about operator intent. **Absent** is a decision: this deployment does not have
this dependency, a supported and tested posture the code has a planned answer
for. **Malformed** is an accident: somebody intended to wire the dependency up
and got the value wrong — a truncated key, a host with no scheme, a placeholder
copied out of the template and never replaced, a value pasted with a trailing
newline. Their intent was to *have* the dependency, and degrading silently gives
them a deployment that looks configured, reports healthy, serves traffic, and
quietly does none of the thing they configured.

The failure mode of collapsing the two is specific and expensive enough to be
worth naming outright: **the week in fallback mode.** A value is mistyped in a
production environment, the boot succeeds, the surfaces render, the writes go
to an in-memory store that empties on every restart, and the discovery event is
a customer asking where their data went. Every step of that week was permitted
by a single `catch` that treated "cannot parse this" as "not configured".

So the branch is taken on presence, not on validity. If the value is absent,
take the fallback and continue. If the value is present, it must be *right*: the
boot validates its shape and refuses to start when it is wrong, with a message
that names the variable, states the shape expected, and shows enough of the
value received to identify the mistake without printing the secret. A process
that cannot start is a loud, cheap, immediate failure that reaches the person
who just deployed. A first request that fails is a failure discovered by a user.

There is a third state, and pretending it is one of the first two is the subtler
version of the same error: a value that is **present, well-formed, and
ineffective** — a key for the wrong project, a credential whose grants were
revoked, a bucket that no longer exists. Shape validation cannot see it and
boot is the wrong time to ask. That state belongs to a probe against the real
dependency, and its rule is that a capability check must test the credential
that performs the operation rather than the value that proves configuration.

## A fallback is named, or it does not exist

"Degrades gracefully" is unfalsifiable. **"When this value is unset, uploads go
to a local temporary directory and are lost on restart"** is falsifiable, and
the difference between the two sentences is the whole practice. Every optional
dependency carries a *named* fallback with a stated consequence, and the
consequence is stated in the direction the operator cares about — what stops
being true, not what the code does instead.

Fallbacks come in a small number of shapes, roughly in order of preference:

- **A minted value.** The rung above every fallback: when the launcher can
  *create* the dependency — a random secret, a derived connection string — it
  does so, writing the generated value into the operator's own configuration
  file and **never overwriting a value the operator set**. A minted secret is
  not a degrade at all: the capability runs whole, and the operator inherits
  a real value they can rotate. Generation is for what randomness or
  derivation can supply; everything below this rung is for what it cannot (an
  external account, a running daemon). One sibling rule rides with it: when a
  missing dependency is expensive but locally buildable — an image, a corpus
  — the launcher *offers* the one-time build at the point of need, with
  declining still yielding a running system minus that capability, and the
  offer naming the standalone command for later.
- **A weaker substrate.** The data is still the user's data; it lives somewhere
  less durable — process memory, a local file, the browser. The consequence is
  a durability statement, and it is always stated as a loss ("cleared on
  restart", "not shared between instances").
- **A local sink.** Telemetry that would go to a hosted collector goes to the
  process log instead. Nothing is lost that was not already ephemeral.
- **A hidden affordance.** The surface that would link to the missing
  dependency renders nothing rather than a broken link. The smallest version —
  an unset value resolving to an empty string that consumers test before
  rendering — costs one line and removes a whole class of half-configured page.
- **An honest refusal.** The surface stays reachable, states that this
  deployment does not have the capability, and says so in a shape a client can
  branch on. This is the right fallback whenever the alternative is to fabricate.
- **A closed door.** The absence disables the surface entirely. When a value is
  the thing that authenticates an endpoint, its absence must make the endpoint
  unreachable rather than unauthenticated — the degradation and the security
  posture are the same decision, and open-by-default is never it.

The ordering is not arbitrary. **A lossy fallback that is never silent beats a
durable-looking path that eats writes** — a local store that empties on restart
is a bounded, documented loss; a hosted store that accepts the call and rejects
the row is an unbounded, invisible one.

What is never a fallback: inventing data. A read that could not reach its store
returns a refusal, never an empty collection; a write that could not land
returns a failure, never a created identifier. An empty result and a failed
lookup are different facts and must be spelled differently
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
neighbouring temptation — shipping a fabricated dataset so the surface has
something to show — is a legitimate product decision and a different subject
entirely; see the boundary below.

## The environment template is the blast-radius document

Every repository has a file listing its configuration variables, and in most
repositories that file is a list of names with no information content — the
reader learns that a variable exists and nothing about what happens without it.
Promote it. Per variable, four facts: **which surfaces it powers, what breaks
without it, what the application does instead, and the companion setup step**
that the value alone does not accomplish.

That last one is the fact nobody writes down and everybody needs. A credential
is rarely sufficient by itself: a bucket has to exist, a policy has to be
applied, a redirect address has to be registered, a host has to be added to the
content-security directive that the browser enforces. A value pasted without its
companion step produces a deployment that is configured and still broken, and
the debugging trail leads through the wrong layer every time.

This lives in the template rather than a separate document because the template
is the file people actually copy. A setup guide beside it is a second copy of
one vocabulary that will drift
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
and it drifts in the direction that hurts: the template gets a new variable
during a feature, the guide does not, and the guide is what the new hire reads.
The per-variable contract, the placeholder
convention that lets the boot validator reject an uncopied example, and the
degraded-mode test that keeps each blast-radius line true are
[per-variable-blast-radius](./techniques/per-variable-blast-radius.md).

## Where the question gets asked decides how much it can break

"Is this dependency configured?" is answered at one of three times, and the
choice is consequential.

**At module load** is the default and the worst. A client constructed at module
scope from environment values throws while the module graph is being evaluated,
so the failure lands wherever the import chain happens to reach — typically a
shared surface with no relationship to the dependency, producing a blank page
and a stack trace pointing at an import statement. The blast radius of an
unconfigured optional dependency should be the feature it backs; module-scope
construction makes it the whole application.

**At boot, deliberately** is where *malformed* belongs, and only malformed. A
startup pass reads every present value, checks its shape, and refuses to start
on the first bad one. It skips values that are absent, and it is skippable as a
whole in a declared offline or mock mode where absence is the intended
configuration — skipping a validator in a named mode is honest; loosening the
validator for everyone so the mode passes is not.

**At first use** is where *absence* belongs: one guarded accessor per
dependency, memoising the client and throwing a typed error when the
configuration is not there, so "not configured" becomes a catchable condition at
the call site that knows what to do about it — and every call site obtains the
client through that one door rather than reading environment values itself
([one-validation-door](../../../_laws.md#one-validation-door)). The catching
half matters as much as the throwing half: a caller that catches everything
renders a real outage as "not configured", the same lie pointed the other way.
Shape, memoisation, the companion predicate that must answer from the same
source, and the discipline of the catch site are
[guarded-singleton-accessor](./techniques/guarded-singleton-accessor.md).

## Configuration is not permission

The single most expensive mistake in this subject is a capability check that
asks the wrong question. A route decides which storage tier to write to by
testing whether the store is configured — a public address and a public key are
present, therefore writes will work. That predicate is true on a fresh project
where the anonymous role can write anything, and it stays true afterwards,
including on the day someone hardens the store and the anonymous role's grants
are removed. The check keeps passing; every write fails.

The rule: **a capability check tests the credential that can perform the
operation being gated.** If there are two credentials — a public pair for reads
and a privileged one that carries the write grant — then the presence of the
public pair is not evidence about the write, and a helper whose name suggests
otherwise is a trap for the next caller. Name the predicate after the question
it answers, gate on the granting credential, and where the grant cannot be
known without asking, attempt the operation and classify its failure rather
than asserting capability from configuration
([gate-sees-target](../../../_laws.md#gate-sees-target)). This is
[probe-the-grant-not-the-config](./techniques/probe-the-grant-not-the-config.md),
and the environment truth table it produces — for each combination of which
values are present, which tier receives the write — is worth writing out
explicitly at the decision point, because it is the artifact that makes the
degradation reviewable.

## Refusal is a first-class response, not an error

A surface backed by an unconfigured dependency has to answer somehow, and three
of the four available answers are wrong. A generic server error claims a bug,
which invites retries, pages an operator, and pollutes the error rate with a
deployment's intended configuration. A not-found claims the resource does not
exist, which is false. A success with an empty payload is a fabrication. The
remaining answer is the correct one: a **distinct, retry-shaped status with a
stable machine code**.

The code is a contract and the message is copy. Codes come from a closed union,
travel to clients, land in dashboards and get branched on; **never reword a
code**, and never mint a second code for a condition that already has one
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
Two more rules follow. A permanently unconfigured capability and a temporarily
unreachable one may share a status but must not share a code, because one of
them is worth retrying and the other is worth telling the operator about. And
the refusal must not leak its own fix into a public response body: the variable
name belongs in the boot log and the server log, never in the message a
stranger receives. Statuses, codes, partial-success reporting, and the surface's
duty to hide an affordance it knows is unavailable are
[capability-honest-refusal](./techniques/capability-honest-refusal.md).

## Degradation and hardening move together

Every degradation path is written against a permission posture that existed on
the day it was written, and permission postures change: an anonymous role is
locked down, row policies are turned on, a bucket's default becomes deny, a key
is rotated to a narrower scope. Each of those changes can remove the grants a
fallback quietly depended on — and the fallback does not announce it. The
client still constructs, the request is still issued, the store rejects it, and
if the write path reports success anyway, the deployment has entered a **silent
data-loss mode** whose own configuration document still describes the old
behaviour.

So the coupling is stated as a rule with a place to enforce it: a change that
narrows grants enumerates the degradation paths that relied on those grants and
updates the template in the same change. That enumeration is only possible
because the blast-radius document exists, which is the strongest argument for
keeping it. When a fallback loses its grants, the fallback is *removed* and the
surface switches to honest refusal — a write path that cannot write is worse
than no write path, because it is indistinguishable from one that works. And
the degraded-mode test runs against the hardened policy, never against a
permissive development project, or it passes exactly when it should fail. This
is [degradation-coupled-to-hardening](./techniques/degradation-coupled-to-hardening.md).

## What this subject owns, and what the neighbours own

The seam with [error-handling](../error-handling/error-handling.md) is the one
readers get wrong most often, and the rule that separates them is a question
about the dependency's existence. That subject owns the shape of a failure once
you have one — the taxonomy it is classified into, the door it reaches, the
copy the user sees. This subject owns whether the dependency was ever there,
which is decided at a different time (module load, boot, first use) and has a
different consequence (a different code path runs, and the product does
something else on purpose). If the dependency is configured and the call
failed, that is error handling. If the dependency was never wired up for this
deployment, that is here — and when this subject's refusal needs a code and a
message, it takes their shape from the error taxonomy rather than inventing a
private one.

[health-checks](../../../operations/service-operations/health-checks/health-checks.md)
owns *reporting* a dependency's state: does it work, right now, and what should
the operator do about a red. This subject owns *running without it*. What keeps
them apart is that here an absent dependency is not a problem — it is a
supported, documented, deliberately tested posture, and rendering it as a red
light trains operators to ignore red lights. They meet at one point: a
capability observation made here feeds the health record rather than being
re-derived, while the verdict vocabulary and the remediation discipline stay
theirs.

[plan-entitlements](../../../operations/service-operations/plan-entitlements/plan-entitlements.md)
also short-circuits capability gates, but on a different axis: what this
deployment *sells*, not what infrastructure it *has*. A tenant refused a
feature because their plan does not include it is entitlement; a whole
deployment refusing because there is no object store behind it is this subject.
The test is what would change the answer — money, or a credential. A related
seam belongs to the `demo-data-plane` subject, and the line is about whose data
is on the screen: a missing dependency whose feature falls back to a weaker
store is degradation, because the data is still the user's and only the
substrate got worse; a fabricated dataset shipped deliberately so a surface has
something to demonstrate is a demo data plane, because the substrate is fine
and the data is invented. Degradation never fabricates; the demo plane never
pretends to be storage.

## What this subject refuses

- **A required credential with no stated reason.** Every variable that must be
  present is a barrier to cloning the repository; the required set is ideally
  empty, and where it is not, the boot says which one and why.
- **Malformed treated as absent.** The costliest collapse in the subject, and
  the reason the week in fallback mode happens at all.
- **A client constructed at module scope.** The blast radius of an unconfigured
  feature must be that feature.
- **A fallback with no stated consequence.** "Degrades gracefully" is not a
  claim anyone can check; "writes go to memory and are lost on restart" is.
- **A capability gate that reads configuration instead of the grant.** It passes
  on the day it stops being true.
- **A no-op client returned in place of a throw** — and its better-dressed
  cousin, a factory that silently substitutes a weaker credential when the
  privileged one is absent. Both convert a configuration fact into data loss.
- **Fabricated success.** A generic server error for a working-as-designed
  refusal, an empty list where the truth is "we could not look", a zeroed
  failure count, an invented identifier.
- **A hardening change that does not touch the environment template.** Either no
  fallback depended on those grants — and the change says so — or the document
  is now wrong.

## The techniques

- [absent-degrades-malformed-fails-fast](./techniques/absent-degrades-malformed-fails-fast.md)
  — the asymmetry as a procedure: branch on presence, validate shape at boot,
  reject placeholders, and the one mode where the validator is skipped rather
  than loosened.
- [per-variable-blast-radius](./techniques/per-variable-blast-radius.md) — the
  four facts each variable records, the template as the single authority, and
  the degraded-mode test that keeps each line falsifiable.
- [guarded-singleton-accessor](./techniques/guarded-singleton-accessor.md) —
  one throwing factory per dependency, memoised, with a companion predicate
  from the same source and a catch site that catches only this.
- [probe-the-grant-not-the-config](./techniques/probe-the-grant-not-the-config.md)
  — gating on the credential that carries the operation's grant, the
  environment truth table, and why the naive predicate survives until the store
  is hardened.
- [capability-honest-refusal](./techniques/capability-honest-refusal.md) — the
  distinct status, the closed code union, permanent versus temporary
  unavailability, partial-success reporting, and hiding an affordance that
  cannot work.
- [degradation-coupled-to-hardening](./techniques/degradation-coupled-to-hardening.md)
  — enumerating the degradation paths a grant change breaks, removing a
  fallback that lost its grants, and testing degraded mode against the hardened
  policy.
