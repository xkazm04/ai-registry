---
subject: pipeline-dag
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# pipeline-dag

First touch: [[2026-08-22-9]], external reconcile against
`argoproj/argo-workflows` @ `f016ad8` (v4.1.2). Gained `go--conditional-edges`
(uncovered) - second stack; single-stack debt cleared. Join-mode hint refuted
the good way: the engine does not choose any-fire/all-fire - the author writes
the boolean over a closed result vocabulary.

## Open leads (banked, convergence rule applies)

- Two conditional mechanisms in one engine share an evaluator, a language and
  a record format - or the author learns one and is wrong about the other.
- Result-typed dependencies (Failed/Errored/AnySucceeded in the predicate
  vocabulary) subsume error-edge routing without a separate edge kind.
- Skip propagation derived rather than swept: the not-taken phase absent from
  the default expansion gets transitivity for free.
- The absent-output sentinel: resolve to the consumer's declared default,
  else fail terminally - strictly better than skip-or-improvise.
- Every field the engine will later parse is parsed at admission - topology
  validated while predicates are not leaves the highest-cost class un-gated.

## Cross-subject proposals

- Fulfilled-vs-Completed as separate predicates -> node-execution-model's
  status vocabulary, a strong future go application.
- Suspended-node special-casing at shutdown/deadline -> pause-and-gate-nodes
  lead for a future worker.
