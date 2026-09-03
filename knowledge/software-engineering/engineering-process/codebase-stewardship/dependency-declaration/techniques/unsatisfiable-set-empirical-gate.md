---
layer: technique
type: technique
subject: dependency-declaration
technique: unsatisfiable-set-empirical-gate
status: forged
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [no version set satisfies every declared constraint, installing with resolution disabled at more than one site, a dependency-consistency check is permanently red while the product is green]
---

# The unsatisfiable set and its empirical gate

Sometimes the declared constraint set has no solution. Not "the resolver is
slow", not "the resolver picked badly" — genuinely no assignment exists.
One library caps a shared numeric runtime below a version a second library
requires; a third demands a major version of a shared framework above a cap
the first imposes; the caps are all sincere, all published by people who
never tested against each other, and several of them are stale by a year.
The graph the resolver would build **does not exist**.

The reflex at that point is to loosen pins until the solver goes quiet.
That is the worst available move: it destroys the only record of what the
upstream authors actually claimed, it converts a hard constraint into a
soft opinion nobody will ever re-examine, and it produces a green resolve
that proves nothing, because the thing that was verified is a set of
declarations somebody just edited to be satisfiable.

The honest move is different, and it has four parts that only work
together:

1. **Disable resolution and install the exact set.** Install each
   conflicting component with the resolver's transitive expansion turned
   off, at a pinned version, in a deliberate order. You are asserting that
   you know the working set; say so rather than pretending a solver found
   it.
2. **Record the override at every install site.** Beside each such
   install, in the file that performs it, name the specific upstream
   constraint being overridden and why the override is safe.
3. **Replace the resolver's verdict with an end-to-end run of the built
   artifact.** The resolver was the acceptance evidence; it has been
   removed, so something must take its place, and the only honest
   replacement is the product running.
4. **State up front that the consistency check is expected to fail** — and
   that a *green* consistency check is the alarm.

## Why this is the third answer, not a relaxation of the second

The golden path's scalability question offers enumeration and progressive
resolution, and [progressive-resolution](./progressive-resolution.md) holds
the choice between them. Both presuppose that a consistent graph exists and
argue about *when* to compute it — up front and diffable, or on traversal
and composable. This case sits past both: there is no consistent graph to
compute at either time. Enumeration cannot enumerate a set with no
solution, and progressive resolution walks straight into the same conflict
the moment the second edge is followed. What replaces the graph is a
human-chosen set plus empirical evidence that the set works.

That is a materially weaker guarantee, and the technique's whole
discipline exists to keep it from being a *silent* one.

## The comment at the install site is the mechanism

The bypass is invisible by construction: the install succeeds, the build
is green, and the flag that turned resolution off reads as an
optimisation to anyone who does not already know. An unrecorded bypass is
an absent guard, and it degrades to unguarded by default the first time
somebody simplifies the command
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

[verification-scope](../../../../security/code-provenance/supply-chain/techniques/verification-scope.md)
already owns two things this technique needs and does not restate: the
real scope of a skip-resolution flag — *what the flag actually turns off,
per stage of the command that runs* — and the rule that the honest comment
belongs **at the install site, not in a document**. Cite it and follow it.
The specific content this technique adds to that comment is the **named
conflict**: not "installed without dependency resolution", but which
upstream declaration is being overridden, against what, and what evidence
says the override holds.

Three install sites repeating the same bypass — a developer task runner, a
release pipeline, a container build — is exactly the drift hazard
[variant-config-parity](../../../build-and-release/packaging/techniques/variant-config-parity.md)
names. Every one of them must carry the override and its comment; a fourth
site added later without either is how the bypass becomes folklore. Where
the sites can share one declared list rather than three hand-copied
command sequences, they should; where they cannot, the parity gate is what
notices.

## It is a policy exception, so it carries an exception's fields

An overridden constraint is not a nameless state of the world. It is a
recorded exception, and
[dependency-policy-gates](../../../../security/code-provenance/supply-chain/techniques/dependency-policy-gates.md)
already specifies the shape: an identifier, a rationale, and a review-by
date the gate itself enforces. Apply that shape here. Each bypass also
needs a **falsifiable removal condition** in the sense of
[fallback-retirement-condition](../../../../backend-platform/resilience/optional-dependency-degradation/techniques/fallback-retirement-condition.md):
the observable event — an upstream release lifting the cap, a component
dropped, a runtime generation retired — after which this bypass must go.
Without it, every override is permanent, and the set of them only grows.

## The gate: the artifact runs, the checker stays red

The acceptance statement is written down in advance and it is deliberately
strange:

> The dependency-consistency check **fails**. The end-to-end matrix against
> the **built artifact** **passes**. Both of those are the expected result,
> and either one inverting is a finding.

Two halves, and both are load-bearing.

**The artifact, not the environment.** The resolver's model was always a
proxy; with resolution disabled it is not even a proxy, it is a model of a
graph nobody built. The target is the program a user runs — for a
transformed or frozen distributable, that means exercising the *packaged*
binary across the platform matrix, not the development environment that
produced it
([gate-sees-target](../../../../_laws.md#gate-sees-target)). This is the same
target discipline
[installed-tree-acceptance](../../../build-and-release/packaging/techniques/installed-tree-acceptance.md)
and
[release-verification](../../../build-and-release/release-pipeline/techniques/release-verification.md)
apply to their own artifacts, borrowed here because the usual evidence
has been given up.

**A green checker is an alarm.** This is the counter-intuitive half and
the reason the expectation is declared up front. If the consistency check
one day reports clean, the most likely explanation is not that upstream
reconciled — it is that the bypass silently stopped happening: the flag
was dropped in a refactor, a site was rewritten, a cache is answering
instead of the real environment. A check whose failure is expected and
whose success is unexamined has become a check that cannot report anything
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
So pin the expectation: the check runs, its output is compared against the
declared expectation, and *either* direction of surprise opens a review.

## Decision rules

- **Prove unsatisfiability before invoking this.** State the specific
  mutually exclusive constraints. "The resolver is taking forever" and
  "the resolver picked a version I dislike" are different problems with
  different answers, and this technique applied to either is just an
  unpinned build with extra ceremony.
- **Never relax a published upstream pin to make a solve succeed.** The
  pin is evidence. Override it visibly; do not edit it away.
- **Install with resolution disabled, never with constraints deleted.**
  Version numbers stay exact at every bypassed site.
- **One comment per site, naming the conflict.** Not the flag, not a
  pointer to a document — the conflict.
- **Every bypass gets a review-by date and a removal condition.**
- **Declare the expected verdict of the consistency check**, and treat
  both an unexpected pass and an unexpected extra failure as findings.
- **When not to use this:** when a solution exists but is inconvenient;
  when the conflicting component is optional and can be degraded away
  instead; and when the product cannot be exercised end to end — with no
  empirical gate to substitute, disabling resolution buys nothing but
  silence.

## The entry test: name the pair

The first decision rule says prove unsatisfiability before invoking this, and
the proof has a fixed shape short enough to leave no excuse: **name the two
constraints and the two packages, with versions, that cannot both be
satisfied.** If you cannot write that pair down, the set is satisfiable and
this technique does not apply. "The resolver is slow", "the lockfile is
annoying" and "we pin loosely" are none of them unsatisfiability; they are
complaints about a graph that exists. Tested against a real repository whose
consistency gate is green and whose declared constraints, when read, contained
no two mutually exclusive published upper and lower bounds: the bypass would
have removed a working guarantee and replaced it with the materially weaker one
above, for no gain.

A bypass adopted without that named pair is not this technique. It is an
unrecorded exception of exactly the kind the exception fields above exist to
prevent — an identifier, a rationale and a review-by date hung on a conflict
nobody can state.
