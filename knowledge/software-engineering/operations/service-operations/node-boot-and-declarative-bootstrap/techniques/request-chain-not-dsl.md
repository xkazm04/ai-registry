---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: request-chain-not-dsl
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [designing the schema of a declarative bootstrap file, a bootstrap step needs a value from an earlier step's response, a stored workflow can be triggered by a request, deciding whether bootstrap requests are audited like external ones]
---

# Request chain, not DSL

A declarative bootstrap or workflow needs a syntax, and the wrong syntax is a new one. This
technique fixes the shape: an ordered list of ordinary requests — the same operation, path
and body an external client would send — plus one mechanism for referencing earlier results,
and the same audit, authentication and authorisation checks every external request passes.
It then closes the one hazard the shape introduces, chains that invoke chains.

## The shape

Each entry in the chain is a request: an operation (create, update, read, delete, list), a
path, a body. Nothing else. There is no per-resource-kind schema, because the resource's own
API schema already exists and a second copy would lag it; there is no template language,
because the values a bootstrap needs are either literals or fields of earlier responses; there
are no conditionals, because a bootstrap that needs a branch is two bootstraps and the branch
belongs in whatever chose the configuration. The rule: **anything the chain can express, a
client with a credential could have done by hand, request for request; and anything a client
can do, the chain can express.** The naive reading — a tidy schema per object kind, which is
"more declarative" — has a failure mode that arrives on the day a resource gains a field:
the API has it, the schema does not, and the bootstrap cannot set it until somebody updates a
second vocabulary that exists only to be a copy of the first.

The one addition is a small set of **value sources**, and the load-bearing one is
**history-keyed references**. A field of a request may, instead of a literal, name a source
and a type — and the source set is decided by the call site, not by the chain author. A
chain read from the configuration file at first start may draw values from the host
environment and from files on disk, because whoever wrote that file already holds the host;
a chain stored through the API and triggered by a request may draw only from its own caller's
input and from the chain's own history, because its author holds an API credential and must
not be able to read the host through a chain. The same shape, two source sets, and the
difference is exactly the trust split the configuration-declared components live under.

A history reference lets a later request's body name a field of an earlier request's
response by the earlier request's position or name in the chain and a path into its
response. Step three creates an authentication role and needs the
accessor that step two's mount returned; it says so by naming step two and the field, not by
re-reading storage and not by a variable that some evaluation order populated. References
point backwards only. A reference to a later step, or to a step that failed, is a
validation error before the chain runs, so the chain's validity is decided before its first
effect.

The same shape serves a *workflow* triggered later — a stored chain that a request or a
schedule invokes — and the only difference is who authenticates it. A bootstrap runs under
the once-only credential; a workflow runs under the credential of whoever invoked it, or
under no credential when it is exposed unauthenticated, which is what the recursion rule
below is about.

## The chain passes the same checks

Every request in the chain enters the node through the same door as an external request
([one-validation-door](../../../../_laws.md#one-validation-door)): it is audited before it
executes and its response is audited before it is consumed; it is authenticated by the
chain's credential; it is authorised by that credential's policy; it is routed by the same
router. The naive reading calls the handlers directly, because the chain is "internal" and
trusted, and its failure mode is a privileged back door with a configuration syntax: an
operation nobody audited configured the authentication method that every later audit trusts.
Per [gate-sees-target](../../../../_laws.md#gate-sees-target) the audit gate must see the
bootstrap requests, because they are the requests most worth seeing.

A consequence for the bootstrap credential: it is a real credential with a real policy, and
the chain can fail on authorisation like any client. That is correct. A chain that needs a
privilege its credential lacks is telling the operator something.

## Unauthenticated chains never recurse; authenticated depth is counted

A workflow invoked by a request can itself contain a request that invokes a workflow. Two
rules close this. **An unauthenticated chain may never invoke another chain.** A chain
exposed without authentication exists so that a client with no credential can trigger a
bounded, operator-approved sequence; if that sequence may invoke another, the bound is gone,
and an anonymous caller can drive the node through an unbounded set of operator-authored
sequences the operator approved one at a time. The refusal is at chain *definition*, not at
invocation: a stored chain marked unauthenticated that contains a request whose path is a
chain trigger is rejected when it is stored.

**An authenticated chain's invocation depth is capped by counting.** Each chain invocation
carries a depth counter it increments before invoking a nested chain; a nested invocation
that would exceed the cap fails with a distinct error naming the chain and the depth. The
counter has a natural home: the identifier of every request the chain generates is prefixed
with the identifier of the request that triggered it, so that the audit trail of a generated
request leads back to the external request that caused it. That lineage *is* the depth
counter — count the chain markers in the identifier — and the authentication state of every
ancestor is readable from the same string, which is how the unauthenticated rule is enforced
without a side table. Two smaller rules ride on the unauthenticated case: a request for a
chain that does not exist, or exists but is not exposed unauthenticated, is refused as
*forbidden* rather than *not found*, so the unauthenticated path is not an oracle for which
chains exist; and the trace output that would expose the chain's intermediate responses is
never available to an unauthenticated caller. The
naive reading detects cycles by remembering the chains already on the stack. Its failure
mode is a chain that invokes itself through a request whose path is computed from a
history reference — not a cycle the stack sees, because each invocation's path differs — or
two chains that alternate through a third. Counting is the only bound that holds without
trusting the operator to write acyclic chains, and the cap is small, because a legitimate
workflow that needs four levels of nesting is a workflow written as a call tree, which the
shape does not support on purpose.

## What the chain refuses to grow into

The shape is stable under pressure to add exactly three things, and each is refused for a
stated reason. Branching: a chain that chooses between alternatives is a program, and the
node is not the place to run operator programs against its own configuration. Loops: a chain
that iterates over a list is doing per-tenant setup at bootstrap, which belongs in a workflow
run after serve, invoked per tenant. Retry: a chain either completes or stops at the failing
step and reports it, with the marker holding the state; retry is a property of the caller,
because a chain that re-runs a step has produced a state nobody declared.

Two escape hatches are admissible, and naming them is what keeps the refusals honest. A
per-request or per-block **skip predicate** — evaluate a boolean, and when it is false do not
send this request — is not branching, because nothing else runs in its place; it lets one
chain serve two deployments that differ by a flag. A per-request **tolerate-failure flag** —
this request may fail without stopping the chain, and its response is then absent from the
history — is not error handling, because nothing is retried or substituted; it exists for
the request that is idempotent-by-refusal, the "create if absent" that returns an error when
the thing exists. A reference to the response of a tolerated request that failed is a
validation error in whatever consumes it, never an empty value. Everything past these two —
an else branch, a loop, a retry count — is the language the shape refuses.

## When not to use this

A node with no API — a batch processor configured entirely from a file — has nothing for a
request chain to reference, and its configuration is just configuration. The technique is for
nodes whose runtime state is API-managed and whose bootstrap must therefore produce API
objects: the chain exists so that the first-start configuration and the day-two configuration
are the same vocabulary.
