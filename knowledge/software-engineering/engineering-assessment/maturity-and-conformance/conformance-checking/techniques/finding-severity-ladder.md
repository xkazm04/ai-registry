---
layer: technique
type: technique
subject: conformance-checking
technique: finding-severity-ladder
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [assigning severities to conformance findings, deciding what deserves to stop a run, handling checks whose tooling is unavailable]
---

# The finding severity ladder

## The concern

An assessment emits a heterogeneous pile of observations, and the reader
needs to know, per observation, *what it obliges them to do*. Severity is
that obligation, encoded. Assigned casually, it produces one of two
degenerate reports: everything is a failure (the owner reads none of it), or
everything is a warning (the owner acts on none of it). The technique is
the construction of a small, closed, principled severity vocabulary and the
rules that assign each finding to exactly one rung.

## The rungs

Four states carry almost every real standard. Keep the set closed and
defined in one place, so renderers, exit codes and downstream policies all
derive from the same vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

**Hard failure — stop the run.** Reserved for findings whose harm is
already irreversible when observed. The archetype is a credential committed
to history: by the time the check trips, the secret is public and rotation
is mandatory; nothing later in the run matters more than saying so. A hard
failure short-circuits: it is reported alone, loudly, without a percentage
next to it, because rendering it as "94% conformant" invites deferral of the
one thing that cannot be deferred.

**Failure — the contract is not met.** The clause is unsatisfied and the
project is non-conformant. Recoverable, actionable, countable. This is
where the bulk of a standard lives.

**Warning — a real gap the owner may defer.** The clause is met in letter
but weakly, or a soft expectation is unmet: a document exists but has not
been touched in a year, coverage is below the recommended band, a claim is
proven but the proof is old. Warnings must be *few*. A standard whose
warning count routinely exceeds its failure count has miscalibrated: either
promote the warnings that matter or delete the ones that do not.

**Unable to check — the instrument was absent.** The tool is not installed,
the command needs a network the run does not have, the platform differs.
This is the rung teams forget, and forgetting it is the expensive mistake
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Report nothing rather than false-failing: emit the state, name what was
missing, and *exclude the check from both the numerator and the denominator*
of any ratio, which is precisely why ratios are only comparable between runs
of the same shape ([pass-ratio-comparability](./pass-ratio-comparability.md)).

A fifth state, **not applicable**, is worth separating from *unable to
check* when the standard has optional families: a project with no data layer
does not fail the data-layer clauses and did not fail to check them — the
clauses do not apply. Same denominator treatment, different meaning to the
reader, and conflating them hides whether your checker is under-equipped or
the project is simply smaller.

## Decision rules

- **Severity is a function of consequence, not of the author's irritation.**
  Ask: if this is never fixed, what breaks, for whom, and can it be undone?
  Irreversible and already-realized harm → hard failure. Contract breach →
  failure. Degradation with slack → warning.
- **Exactly one hard failure class, ideally.** If your standard has five,
  none of them mean anything. Each candidate must survive the question
  "would a reasonable owner accept a report that continued past this?"
- **Never promote a check to failure before its precision is measured.** New
  checks enter as warnings, run over the real population, and graduate only
  after their misfire rate is known. Published guidance on enforcement
  tooling lands in the same place from experience: a detector above roughly
  one-in-five wrong is doing net harm, and the observation mode that precedes
  enforcement exists precisely to find that out cheaply.
- **Unable-to-check must be visible in the summary, not only in the
  detail.** A run that could execute only half its checks and prints a
  confident summary line has lied by omission. The count of unchecked
  clauses belongs next to the counts of failures and warnings.
- **Exit codes are a projection of the ladder, not a second vocabulary.**
  Define one mapping (typically: hard failure and failure → non-zero;
  warning and unable-to-check → zero) and let every consumer read the
  structured output for anything finer. Two independently maintained
  severity notions is the drift bug you will find a year later.

## Procedure

1. Write the closed vocabulary in one definition, with a one-sentence
   meaning per rung and the exit-code projection beside it.
2. For each clause, assign a rung and record the *consequence sentence* that
   justifies it. Review those sentences as a set; miscalibration is obvious
   in a list and invisible per-check.
3. Implement unable-to-check as a first-class return from every check, not
   as an exception that some caller happens to catch.
4. Render grouped by severity, with hard failures short-circuiting and the
   unchecked count always printed.
5. Re-review severities whenever the standard versions. A clause that has
   been a warning for four versions is either ready to be a failure or ready
   to be deleted.

## When not to use it

- **Do not add rungs for taste.** "Info", "nit", "suggestion" and "notice"
  collapse in practice into "ignored"; if a finding has no obligation
  attached, it belongs in documentation, not in an assessment.
- **Do not use the ladder to encode confidence.** A finding you are unsure
  about is a precision problem to fix
  ([checker-false-positive-discipline](./checker-false-positive-discipline.md)),
  not a warning to hedge with.
