---
layer: application
type: application
subject: pipeline-dag
technique: conditional-edges
stack: go
verified_on: 2026-08-22
---

# Conditional edges in Argo Workflows (Go)

How the Kubernetes-native DAG engine realizes conditional branching. Citations
are against `argoproj/argo-workflows` at commit `f016ad8` (2026-08-21), release
`v4.1.2`. This reconciles against an external tree, not the consumer repo the
sibling applications cite, so the pin lives here in prose rather than in
`verified_against`, whose contract is a stack runtime version.

Argo has **two** conditional mechanisms and they differ, which is most of what
this document has to say: `when` is a per-task guard evaluated after parameter
substitution; `depends` is a boolean expression over upstream *results*, and it
is the join semantics.

## 1. Unevaluable is not false — on both mechanisms

The technique's central rule holds twice, without hedging. A `depends`
expression that fails to compile or run does not resolve to not-fired:
`evaluateDependsLogic` wraps the failure with the expression text
(`workflow/controller/dag.go:1022-1025`) and the caller writes the node
**`NodeError`** with that message as its reason (`dag.go:585-590`). A `when`
that fails to parse, fails to evaluate, or yields a non-boolean returns an
error rather than a falsy value (`workflow/controller/steps.go:388-393,
408-418`), and the DAG path likewise marks `NodeError` (`dag.go:654-658`).
Neither fail-closed-as-false nor fail-open-as-true is on offer.

## 2. Three outcomes, carried by the phase vocabulary

Argo spends a distinct node phase on branch-not-taken: `NodeOmitted` — "Node
was omitted because its `depends` condition was not met"
(`pkg/apis/workflow/v1alpha1/workflow_types.go:96-97`) — alongside
`NodeSkipped` for a false `when` and `NodeError` for unevaluable: three
*persisted phases*, not log lines. `Fulfilled` counts skipped and omitted as
settled without counting them as completed (`workflow_types.go:2672-2676`),
which lets a join over a not-taken branch resolve rather than dangle, and the
workflow-phase map sends both to `WorkflowSucceeded`
(`workflow/controller/operator.go:451,454`) — skipped is not failed, and the
engine says so in the type system.

## 3. The join mode is the expression, and it is explicit

`depends` is a boolean expression over `<task>.<Result>` terms from a closed
vocabulary — `Succeeded | Failed | Errored | Skipped | Omitted | Daemoned |
AnySucceeded | AllFailed` (`workflow/common/ancestry.go:22-31`). Any-fire
versus all-fire is written by the author (`A.Succeeded || B.Failed` versus
`&&`), never defaulted by the engine: the hint that Argo picks a join mode is
refuted — it makes the author pick.

Evaluation reads only persisted upstream node phases, one `TaskResults` struct
per dependency (`dag.go:1009-1018`), and happens exactly once at readiness — if
the node already exists, `evaluateDependsLogic` short-circuits to (execute,
proceed) = (true, true) (`dag.go:972-975`). Pure read, verdict, no writes.
`AnySucceeded`/`AllFailed` quantify over a task group's children
(`dag.go:994-1007`), giving fan-out joins a real quantifier.

Legacy `dependencies: [A, B]` is sugar: each entry expands to
`(A.Succeeded || A.Skipped || A.Daemoned)`, joined with `&&`
(`ancestry.go:110-137`). Note what is *absent* — `Omitted`: a task depending on
an omitted task evaluates false and is itself omitted, so **skip propagation is
transitive by construction**. The technique's named hazard, a descendant of a
gated-off branch running on a fallback input, is designed against: pure
references to a skipped or omitted producer's absent output are rewritten to a
sentinel *before* substitution (`workflow/controller/scope.go:92-106`), so the
consumer's declared input default applies, or the node "fails terminally rather
than leaving the workflow stuck" (`scope.go:108-116`).

## 4. Validation at the door is partial — a recorded deviation

`ValidateTaskResults` rejects an unknown task result at admission
(`ancestry.go:90-108`, called from `workflow/validate/validate.go:1491`),
undefined dependencies are named (`validate.go:1496-1501`), and cycles are
reported with their members printed (`validate.go:1510`, `verifyNoCycles` at
`:1625-1650`) — the closed-vocabulary half of the one-validation-door law.

The expression half is missing. Nothing in the validator compiles either
predicate: no `expr.Compile`, no `govaluate` call anywhere under
`workflow/validate/`. A syntactically broken `depends`, or a `when` with an
invalid token, passes admission and surfaces mid-run as a `NodeError` on a node
that may already have side-effect-producing siblings in flight — loud rather
than silent, but at maximum cost, which is what the door exists to prevent. The
standard stays; the deviation is the finding.

## 5. Two dialects, and predicates as spliced strings

`when` is evaluated by `github.com/Knetic/govaluate` (`steps.go:14,388`);
`depends` is compiled and run by `github.com/expr-lang/expr`
(`util/expr/argoexpr/eval.go:9-23`). One evaluator per condition *kind*, but
two expression languages for control flow in one engine: learn one field's
semantics and you have learned the other's wrong. Predicates are also
not data — a `when` is a string `{{...}}`-substituted before it is parsed
(`dag.go:787-808`), so upstream output text is spliced into the expression's
source, and `shouldExecute` rewrites every `VARIABLE` token into a `STRING`
(`steps.go:395-406`), which is why type mismatches usually become string
comparisons instead of the unevaluable verdict. Missing variables at
substitution time requeue rather than resolve (`dag.go:794-799`); the sentinel
above ends that wait.

## 6. The branch record is asymmetric

A false `when` persists `when '<substituted expression>' evaluated false` as
the node's message (`dag.go:660`) — the predicate as actually evaluated,
operands included, satisfying count-carries-predicate. A not-fired `depends`
persists the constant `"omitted: depends condition not met"` (`dag.go:597`):
no expression, no per-dependency results, nothing about what the join saw. That
data exists in `evalScope` one frame earlier and is discarded, so "why was this
omitted" means re-deriving every upstream phase by hand — while the unevaluable
path is *more* informative (`dag.go:1024` embeds the expanded logic).

Not present by scope: an explicit else/default edge kind — mutual exclusivity
is the author's obligation, written as negated predicates; and any preview
surface, so "one evaluator, shared with preview" has no second consumer here.

## Reconciliation summary

Confirmed: unevaluable resolves to an error phase on both mechanisms, never to
a verdict; branch-not-taken persisted distinct from skipped and from failed;
author-chosen join semantics over a closed result vocabulary; pure evaluation
from persisted phases, once, at readiness; transitive skip propagation; no
improvised fallback input. Deviations: neither predicate is parse-validated at
admission; two expression dialects for control flow; `when` predicates are
spliced strings with variables coerced to strings; the not-fired `depends`
record carries no operands.
