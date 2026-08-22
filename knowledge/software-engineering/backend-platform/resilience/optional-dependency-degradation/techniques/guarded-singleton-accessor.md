---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: guarded-singleton-accessor
status: forged
laws:
  - one-validation-door
  - failure-not-empty-success
shared_with: []
use_when: [constructing a client for a hosted dependency, an unconfigured value crashes an unrelated page, deciding between a throwing accessor and a null client]
---

# The guarded singleton accessor

A client for a hosted dependency wants to be constructed once and shared. The
shortest way to write that is a module-level constant built from environment
values, and it is the shape that makes an optional dependency non-optional. The
construction runs while the module graph is being evaluated, so its failure
lands at import time, in whatever module happened to pull the chain — usually a
shared surface with no relationship to the dependency. The result is a blank
page and a stack trace pointing at an import statement, for a feature the
deployment never intended to use.

The fix is small and entirely structural: **the client is obtained from a
function, and the function throws when the dependency is not configured.**

## The shape

- **A factory, not a constant.** Nothing is constructed until something asks.
  Absence therefore costs nothing until the feature that needs it runs, and the
  blast radius of an unconfigured dependency is that feature.
- **Memoise the instance, not the failure.** The first successful construction
  is cached and returned to every subsequent caller — the singleton half of the
  name. A failed construction is not cached as a permanent poison; it simply
  throws again, which is cheap and keeps the code free of a second state.
- **Throw a typed, message-carrying error.** The message names the variables
  that would configure it — this error reaches a server log, not a stranger —
  and its type or code is distinguishable from every other failure the callers
  handle. "Not configured" that arrives as a generic error is indistinguishable
  from the dependency being down, and the two demand different behaviour.
- **One door.** Every consumer obtains the client here. A module that reads the
  environment directly and builds its own client has created a second answer to
  "is this configured", and the two will disagree the day the answer becomes
  conditional ([one-validation-door](../../../../_laws.md#one-validation-door)).
- **A companion predicate, from the same source.** Callers that need to branch
  without exception control flow — a surface deciding whether to render a
  button, a route deciding which tier to write to — get a boolean helper. It
  must derive from the same values in the same module as the accessor. A
  predicate that says yes followed by an accessor that throws is a bug that only
  appears in the deployments nobody tests.

## Why not a no-op client

The alternative that looks friendlier — return a stub whose methods do nothing
and resolve successfully — is the worst option available, and it is chosen
often because it deletes every `try` at the call sites. What it actually does
is convert a configuration fact into silent data loss: writes resolve, reads
return empty, and every caller believes it succeeded. It is
[empty success spelled as success](../../../../_laws.md#failure-not-empty-success),
manufactured deliberately, at the one place in the system that knew the truth.

A stub is defensible in exactly one case: a **telemetry or logging sink** whose
entire contract is fire-and-forget and whose absence is already invisible to
correctness. Even there, the stub is named as a stub and the boot summary says
the sink is inert. Anything that stores, charges, sends or authorises gets a
throw.

Returning `null` is the same mistake with an extra step. Every call site must
then remember to check, the check is invisible to review when it is missing, and
the eventual failure is a null dereference at a random depth rather than a
message naming a variable.

The subtlest member of this family deserves naming on its own, because it is
written by careful people during a migration: **a factory that prefers the
privileged credential and silently substitutes the weaker one when it is
absent.** It looks like graceful degradation and it is a no-op client with extra
steps — every caller receives a working object, every write is issued, and the
store decides whether the write lands, based on grants the caller never asked
about. The rationale is always the same and always true at the time ("existing
deployments keep working during the migration"), and the expiry is always
unstated: the substitution holds only while the old permissive policy is still
in place. If the substitution must exist, it carries the condition under which
it stops being safe, in a comment at the substitution, and the callers that
write anything gate on the privileged credential themselves rather than trusting
the object they were handed. A one-time warning on a process log is not a
mitigation — on an ephemeral runtime, a warning printed once per instance is a
warning nobody reads.

## The catch site is half the technique

A throw is only as good as the code that catches it, and the common failure is
catching too much. A caller that wraps the accessor in a blanket handler and
falls through to the degraded path renders every failure as "not configured" —
including a real outage, an expired credential, and a bug in the constructor.
The operator then reads a boot summary claiming the dependency is unconfigured
while the value sits right there in the environment.

So: catch the *specific* condition. Where the language allows, test the error's
type or code before degrading and rethrow anything else. Where a caller
genuinely cannot distinguish — an early bootstrap path with nothing to rethrow
to — narrow the guarded region to the accessor call alone, so that only
construction is inside the handler and the work that follows is not.

The most valuable catch site in most applications is the one that keeps a
universal surface universal: an authentication or session bootstrap that must
resolve on *every* load. It calls the accessor, catches "not configured", and
falls through to the unauthenticated state — which is the honest answer, since
a deployment with no identity provider has no authenticated users. Without that
catch, the always-available guarantee is broken by the first import.

## Decision rules

- **Never construct a client at module scope from configuration that may be
  absent.** This is the whole defect in one line.
- **The accessor throws; it never returns null and never returns a stub**
  (telemetry sinks excepted, and named as such).
- **Memoise success only.**
- **The predicate and the accessor read the same values from the same place.**
- **A server-only credential's accessor must not be reachable from a client
  bundle.** Keep it in a module the build cannot inline into browser output,
  and make the boundary explicit in the file's own header — a build that
  substitutes environment values at compile time will happily bake a private
  key into a script if the import graph lets it.
- **The error message names the variables; the response to the user does not.**
- **Test the unconfigured path by importing the surface with an empty
  environment.** The assertion is that the page renders, not that the feature
  works.
