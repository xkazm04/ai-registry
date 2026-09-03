---
layer: application
type: application
subject: eval-harness
technique: monitor-inside-the-loop
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The grader that had been hardened but never shown a case it should fail

A long-horizon memory evaluation replays a synthetic year of events through
several retrieval strategies and scores each one's answers on a ladder of rungs.
The witness for the stack is the compiled bytecode the package ships beside its
sources (`memory_year/__pycache__/*.cpython-312.pyc`), which pins the
interpreter this was read against.

## The seam

Every rung score in that harness is a grader's verdict. The grader is
`evals/memory-year/memory_year/judge.py`, and it is in two halves: a
deterministic one (`contains_value`, `is_abstention`, `strip_article`) and a
model call for form checks (`judge.py:113-114`, a strict YES/NO rubric prompt).

The harness is unusually disciplined about self-measurement — it ships a
`checks/` package whose first member, `clock_purity`, replays a scenario at two
base dates to prove recall does not read the wall clock, and whose docstring
states the principle exactly: *the part of the system that decides what the
agent knows is then the part with no tests.*

The grader is the part that decides whether the agent was **right**, and it had
no such check. It had been hardened — the project's own findings note records
that "judge article-stripping and a deterministic fix-phrase check for
adaptation probes were needed before the model judge was trusted." That
hardening was done by inspection. Inspection is how a reviewer becomes trusted
without ever being shown a case it should fail, which is the precondition this
technique says cannot be read out of the reviewer's own output.

## A and B

Same predicates, same inputs, one instrument added.

- **A — the repository as found.** No calibration set anywhere under `evals/`;
  no test file exercises the grader. Grader recall: unmeasured, and reported as
  nothing at all.
- **B — fifteen planted cases** whose correct verdict is known by construction,
  run through the project's real predicates, imported unmodified. Nine for
  `contains_value` (four that genuinely state the gold value, five that do not:
  a superseded value, an expired one, an absent one, a distractor, a removal), six
  for `is_abstention`.

**11/15 graded as constructed. Four misgrades, every one a false positive, all in
`contains_value`:**

| gold value | answer | graded |
| --- | --- | --- |
| `Postgres 16` | "We run Postgres 14 in production." | contains |
| `Postgres 16` | "We migrated off Postgres years ago." | contains |
| `Kubernetes` | "We considered Kubernetes but chose Nomad." | contains |
| `Redis 7` | "Redis was removed in the last refactor." | contains |

The mechanism is a documented convenience: when the gold value is multi-word,
`contains_value` falls back to substring-matching its head token if that token is
four characters or longer, so any answer mentioning `postgres` anywhere satisfies
`Postgres 16`.

## Why the direction is the finding

Zero false negatives and four false positives is not a wash. A false positive
here marks a **wrong answer correct**, so it inflates every rung that uses the
predicate, and the inflation is invisible in the ladder because the ladder is
the grader's own output.

Worse, the four cases are not adversarial constructions — they are the
superseded, expired, absent and distractor probes, which is precisely the class
of question a *memory* evaluation exists to ask. The grader is least reliable
exactly where the suite's claim lives. Nobody designed that; it fell out of a
head-token fallback added to tolerate version suffixes, and it is the negative
structural fact the technique predicts: a reviewer's unmeasured recall
concentrates its errors somewhere, and that somewhere is not random.

## What shipped

`memory_year/checks/judge_calibration.py`, in the package's own idiom
(`py -m memory_year.checks.judge_calibration`), model-free and offline so it
runs in CI in under a second. It asserts its own suite before reporting — a case
list with no negatives cannot detect over-matching and exits 2 rather than
passing
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

It lands **red**, naming the four cases, and the predicate was deliberately left
alone: narrowing `contains_value` changes grading behaviour across every cached
score in the harness, which is the eval owner's call and not the instrument's.
The check states that in its failure output — *fix the predicate or narrow the
gold value; do not delete the case.*

## What this realization cannot do

It measures the deterministic half only. The model grader at `judge.py:113-114`
is the half whose recall the technique most wants measured, and planting cases
for it costs a key and a budget, so its error rate remains exactly as unmeasured
as it was — named here as a return condition rather than reported as a clean
result.

Nor does catching four constructed cases establish recall against novel ones.
The check is one-way, as this class of control always is: failing it is
decisive, passing it says only that these shortcuts are absent.
