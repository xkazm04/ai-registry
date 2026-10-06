---
layer: technique
type: technique
subject: conditional-service-composition
technique: requirement-closure-before-selection
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [an operator requests a service and it is silently absent from the resolved topology, a fragment's identifier names a handle only because the service cannot run without it, the engine refuses a request that reads as complete because a dependency was not requested, an integration fragment does not activate for a service that arrived as a dependency, deciding whether the composition layer should add what a requested service needs or refuse the request]
stage: multi-service
---

# Requirement closure before selection

A fragment's identifier answers one question: **when does this material apply?**
It does not answer a second, which looks the same and is not: **what must also be
running for this service to work at all?** The first is a *participation
condition* — an integration that exists exactly when two services are both
present. The second is a *requirement* — a dashboard that cannot start without the
database it reads. This technique keeps them apart: requirements are declared on
the requiring handle, in the handle vocabulary, and **the active set is closed
under them before any fragment is tested for selection**.

## The failure the conjunction rule invites

The conjunction rule makes it tempting to express a requirement as a condition.
The dashboard needs the database, so give the dashboard's fragment the identifier
`database+dashboard`, and it will only ever be selected when the database is there
— which reads as exactly the guarantee wanted.

It is the guarantee inverted. Measured against a real three-service topology (an
API, a database and a dashboard over it; full run in the
[application](../applications/docker-compose--requirement-closure-before-selection.md)),
every request was assembled and handed to the real engine's resolver:

| design | requests (of 8) where a requested service is silently absent | requests refused |
|---|---|---|
| requirement written as a condition in the identifier | 2 | 0 |
| requirement left to the engine's own dependency check | 0 | 2 |
| active set closed under declared requirements, then selected | 0 | 0 |

The first design exits clean. An operator who asked for the dashboard gets a
topology with no dashboard in it and no message — the request named a handle that
no fragment carries alone, so nothing activated, and *nothing activated* is what a
correct empty selection also looks like
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The second design is at least loud: the engine refuses a topology in which one
service hard-references another that was never defined. The third is the only one
that serves the request.

So a fragment identifier carries participation conditions only. If a service
cannot run without another, that is a property of the service's **handle**, and it
is declared once, where handles are declared.

## Close, then select — and what the closure may add

The closure is a fixpoint: for every handle in the active set, add every handle it
requires, and repeat until nothing is added. Three rules keep it from becoming the
thing it replaces.

**It is transitive, every time.** A closure that adds a required handle without
then closing over *that* handle's requirements has forced something on without
checking that it can stand. Configuration languages with a forcing operator document
this hazard in their own reference: forcing a symbol "without visiting the
dependencies" produces configurations that are illegal and that nothing flags. The
fixpoint is the whole fix — a closure that stops after one step is the forcing
operator again.

**It adds requests, never observations.** A requirement may name another service; it
may not conjure a capability. If a service requires an accelerator, the closure
does not add the accelerator token — the token is a measurement, and only a probe
may put it in the set
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value); this is
the same asymmetry
[intent-and-environment-in-one-namespace](./intent-and-environment-in-one-namespace.md)
draws for wildcards, and closure is a quantifier over requirements in exactly that
sense). A requirement on an observation that is absent is **checked, not forced**:
the request is refused, naming the service and the capability it lacks.

**Implied handles are full members, and are reported as implied.** Once closure
adds the database, every integration conditioned on the database participates —
the API that was requested alongside the dashboard is wired to the database the
dashboard pulled in. That is the point: in the measured topology, leaving the API
on its standalone store while a dashboard reads an empty database is the silent
failure closure exists to prevent. But it is a decision the operator did not type,
so the resolved-order dump
([specificity-ordered-layering](./specificity-ordered-layering.md)) prints the
active set in two columns, *requested* and *implied by*, and an implied handle
names the requirement that brought it.

The closure never changes the merge order — order is still derived from fragment
identifiers — and it never schedules anything. Requirement and startup order are
separate relations; an init system that pulls a unit in by requirement documents in
its own reference that this "does not influence the order in which services are
started", and the composition layer is in the same position. What starts first is
the engine's.

## Close, or refuse — never drop

Closing is not the only honest design. An engine may decline to widen a request and
instead refuse it, naming the dependency that was not requested — which is what the
second row of the table does, and what one widely deployed engine's specification
chooses on purpose: a reference to a service the active selection excludes does
"not automatically enable" it, and the engine returns an error instead. That is a legitimate
policy where adding a service has a cost the operator should consent to — a port
taken, a licence, a large image pulled.

What is not legitimate is the third outcome, and it has more than one door:

- the requirement written into the requiring fragment's identifier (the measured
  silent drop above);
- an *optional* dependency — one the engine is told it may do without — standing
  in for a real one. Where the dependency is defined but excluded from the run, the
  engine resolves the unmet requirement by deleting the reference rather than by
  refusing, and the dashboard resolves alone, against no database, with a clean
  exit and no warning;
- a closure that adds a handle and then lets that handle's own fragments fail to
  select, so the implied service is in the set and in no document.

Each turns a requirement nobody met into an artifact that looks complete.

## One declaration, and the gate that keeps it one

The requirement now exists in two places: in the handle vocabulary, where closure
reads it, and in the fragments themselves, where a service hard-references another
for the engine. Two copies of one fact drift
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the drift is exactly the refusal case: a fragment gains a hard reference that
the vocabulary never declared.

So the reachability gate that
[conjunction-activated-fragments](./conjunction-activated-fragments.md) already runs
gains one assertion. For every handle, close it alone, select the fragments, and
assert that every hard reference those fragments make to another service resolves
inside the selection. A reference that does not is either an undeclared requirement
or a mis-scoped fragment, and the build fails on it. Run against the closed set of
each single handle, this is linear in the handle count, not in the combinations —
and like the reachability pass it needs a known-bad fixture, an undeclared
requirement, so its silence means something.

## Decision rules

- A fragment identifier states when material applies. What a service needs in order
  to run is a requirement on its handle, declared once in the handle vocabulary.
- Close the active set under requirements before selection, as a transitive
  fixpoint. Selection then sees the closed set, and implied handles activate their
  integrations like any other.
- Closure adds request-kind handles only. A requirement on an observation is
  checked; if the observation is absent, the request is refused by name.
- The dump distinguishes requested from implied handles and names the requirement
  behind each implied one.
- Refusing a request whose requirements were not asked for is an acceptable policy.
  Silently emitting a topology without the requested service, or without its
  requirement, is not — whatever mechanism produces it.
- A build gate closes each handle alone and fails on any hard reference that falls
  outside its own selection.

## When not to use this

- **No service requires another.** If every service runs alone and the only
  cross-service material is genuine integration, there is nothing to close, and a
  requirement field nobody fills is ceremony.
- **Adding a service needs consent.** Where pulling in a dependency costs something
  the operator must agree to, refuse with the missing handle named instead of
  closing — but still declare the requirement on the handle, so the refusal can name
  it.
- **The requirement is soft.** A service that works better beside another but runs
  without it has a preference, not a requirement. Model it as an integration
  fragment conditioned on both, which participates when both happen to be present
  and is absent, correctly, otherwise.
