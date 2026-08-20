---
layer: technique
type: technique
subject: unattended-build-loop
technique: unreachable-success-preflight
status: forged
laws: [unmeasured-is-not-a-pass, a-budget-shapes-the-output]
shared_with: []
use_when: [launching an autonomous run against a target rate, configuring required checks for an automated loop, diagnosing a run that burned its budget with no progress]
---

# Unreachable-success preflight

Before spawning anything, assert that the configured success condition *can* be
satisfied. A loop whose stop condition is pinned at zero by configuration will
still run every iteration it is allowed and terminate at its spend cap, and the
resulting failure looks like a capacity problem when it is a configuration
problem.

## The mechanism it catches

The counting basis and the check configuration interact. When the stop condition
counts only externally-verified passes, an item only counts if every required
check passed for it. A required check that can never verify therefore pins the
verified rate at zero permanently — no amount of correct work moves it. The loop
does what it was told: iterate until the target is met or the iteration limit is
reached. It grinds every iteration into the budget, produces a great deal of
plausible work, and stops with nothing explaining why.

The cost of the check that prevents this is one function call at launch.

## The procedure

1. **Run the preflight only when it can be conclusive.** Under a self-reported
   counting basis the condition is trivially reachable and the check returns
   reachable without inspecting anything.
2. **Enumerate the required checks** and evaluate each statically for
   *can-never-verify*: no command configured; an environment-dependent check
   whose environment is absent; a target that does not resolve.
3. **Exclude checks whose verifiability is only determined at runtime.** Checks
   that depend on a capture, a boot or an external service can fail for
   environmental reasons at any moment and must never be judged unreachable
   statically — a false positive here trains operators to ignore the warning.
4. **Return a structured result**: reachable or not, the list of blocking check
   names, and a reason string.
5. **Warn loudly; do not block.** Emit an operator-visible warning and a
   non-fatal error event carrying the blocking names. A run's side effects can
   legitimately be wanted without a reachable stop condition — someone may want
   the work done and not care about the rate.
6. **Surface it in every launch surface identically.** A warning that appears in
   one entry point and is swallowed in another is a warning that does not exist,
   because operators use the entry point that is quiet.

## What the message must contain

A preflight warning that says "success may be unreachable" is nearly useless.
Four elements make it actionable, and all four are cheap to include:

- **The specific blocking checks, by name.** Not a count, not a category.
- **Why each blocks** — no command configured, or a required environment
  variable absent.
- **The consequence in the operator's units**: the rate will stay at zero, every
  permitted iteration will run, and the run will stop at the spend cap.
- **The concrete remedies, all of them.** Configure the missing command or
  environment; drop the check's required flag; or switch the counting basis to
  the self-reported one. Listing all three matters because they have different
  costs and only the operator knows which is affordable today.

## Decision rules

- **When the preflight says unreachable, warn and proceed.** Blocking would be
  defensible and is the wrong default: it converts a diagnostic into an outage
  for runs whose value is the work, not the score.
- **When a check's verifiability is runtime-determined, leave it out of the
  static analysis.** Prefer a false negative here over a false positive; the
  loop's honest-unverifiable handling catches the runtime case anyway.
- **When the preflight passes, do not treat that as a guarantee.** It proves the
  condition is not *statically* impossible. Environments still disappear
  mid-run.
- **Re-run the preflight on resume, not only on a fresh start.** Configuration
  and environment both drift between a pause and a resume, and a resumed run
  inherits the original run's iteration budget.

## The general form

Any long-running automated process with a stop condition should assert, before
consuming resources, that its stop condition is satisfiable under the current
configuration. Three questions cover most cases: does the thing that decides
success exist, can this environment execute it, and is the target attainable
under the chosen counting rule? When any answer is no, say which one, say what it
will cost, and say how to fix it.

## When NOT to use this

- **When the loop has no target-based stop condition** — a fixed number of
  iterations, or a queue drained to empty. There is nothing to be unreachable.
- **When determining reachability requires running the checks.** The preflight
  must be cheap; a preflight that costs a fraction of the run is a first
  iteration with extra steps, and it will be disabled.
- **When the operator has already been told this run.** Repeating the same
  advisory every iteration converts a signal into noise, and the next real
  warning is scrolled past.
