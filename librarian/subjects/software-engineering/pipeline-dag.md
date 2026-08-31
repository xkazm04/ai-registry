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

## Applied to the technique layer

- 2026-08-23-1: **a second mechanism shares the vocabulary** (one-mechanism family) applied to `conditional-edges` ([[2026-08-23-1]]).

## 2026-08-31 - intake, arXiv 2604.11378

Gained `valid-but-degraded-plans` (technique) + `next--valid-but-degraded-plans`
(application, `experiment` / `better`) from [[2026-08-31-agent-loops-structured-graphs]].
Second stack for the subject beyond go/rust.

**Found by the enumeration hunt on `graph-validation`.** That technique states
its own coverage as a binary — provable at the door, or a named run-time check —
and calls the space between them the category that must not exist. The pick
demonstrates a third class neither half reaches: the graph is valid, every check
passes, *the run succeeds*, and the plan was still wrong. The discriminator is
whether a defect changes the **result** or only the **price**; the price-only
class is invisible by construction, because nothing separates a correct cheap
run from a correct expensive one without a second run to compare.

**The subject's standing assumption is now named:** every document here is
written for a graph *the user authored* ("the user drew fifty edges"), where
this class is nearly harmless. It stops being harmless when a planner emits the
graph per task. Worth carrying into future work on this subject - the
authored-graph assumption is load-bearing in more places than the one paragraph
that was amended.

Note the adjacency to the banked lead above ("topology validated while
predicates are not leaves the highest-cost class un-gated"): that lead is still
in the *correctness* class and remains open. This landing is the class no
admission gate can reach at all, so it does not close it.

## Open leads (added this run)

- The inert-edge rule generalises past graphs: any ratio over a declared set
  whose members have unequal ability to fail is capped. Candidate for
  convergence with a measurement subject if a second sighting appears.
