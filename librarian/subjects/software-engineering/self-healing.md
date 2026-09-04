---
subject: self-healing
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# self-healing

First touch: [[2026-08-22-4]], external reconcile against
`argoproj/argo-rollouts` @ `9f8d111` (VERSION 1.2.0). Gained
`go--auto-rollback` — second stack; single-stack debt cleared. Hint confirmed.

## Open leads (banked, convergence rule applies)

- **Fail closed when the gate itself breaks** — a dying measurement pipeline is
  abort-worthy, not pass-worthy. SECOND SIGHTING already exists (a webhook
  gateway aborting the create on a dedup lock/lookup error, same wave): first
  candidate for the next technique cycle.
- The minimum-volume floor is an API obligation on the framework, not advice to
  the threshold author — the deviation here is "the only place to put the rule
  is the user's query string".
- Measurement-count floors are not event-count floors — passing the letter of a
  threshold rule while missing its intent.
- Cancel the in-flight experiment when the verdict lands — matters wherever the
  gate costs money per probe.

## Cross-subject proposals

- retry/promote/abort/undo as a first-class operator verb set →
  health-checks/remediation-affordances.
- Three-surface loudness (event + notification + phase) → alerting.
- Warm-capacity retention for the failed attempt (abortScaleDownDelaySeconds) →
  retry-backoff's cost model.

## Applied to the technique layer

- 2026-08-22-6: **a broken gate is a verdict, not a gap** (fail-closed family) applied to `auto-rollback` ([[2026-08-22-6]]).

## 2026-08-29 - intake, two ladders

[[2026-08-29-ai-native-sdlc-and-ci-on-call]]: golden path gained a paragraph under
"The epistemic ladder" - detection is tiered by signal magnitude and is
deterministic by design; healing is tiered by diagnostic confidence; they compose by
minimum. The source's control-band table mapped 3σ straight to "propose", which is
the drift the ladder section already warned about arriving through a different door.
`failure-diagnosis` gained a decision rule: diagnose from the measured, not the
configured (first-party lessons-log entry, n=1, restates "a diagnosis names its
evidence" one stage earlier).

## 2026-09-04 — `/intake` over an appliance firmware (jetkvm)

+3 techniques, +2 applications (`go`, `python`). The subject gained the
configuration all five of its commitments quietly assumed away: **the healer that
cannot outlive the thing it is healing.** Every promotion trigger in
`incident-promotion` — recurrence, futility, rollback, severity, budget trips —
is evaluated by a live healer, and when the healed component is mandatory the
exhaustion of its allowance terminates the healer with it. `retry-backoff`'s
stated destination for an exhausted ladder (dead-letter, operator queue) has
nothing to route into, and the receiver that is guaranteed to exist is the next
incarnation of the process.

`healer-death-as-promotion` (write the promotion before the exit; the audience is
the successor, not an operator), `declared-verdict-over-inferred-wreckage` (match
a declared marker, never reconstruct from the stack trace — the source's
classifier test asserts that a crash naming the component *without* the marker is
diagnostic only), `consume-once-mode-handoff` (a file is not a message: unlink on
read, authenticate by shape, bound the read, keep an out-of-band door).

**Neither prior-art map found this subject.** Twenty mapped terms across a
concern-phrased and a forces-phrased pass; `self-healing` shares a slug with none
of them. It was found by reading the `resilience` category listing in
`taxonomy.json`. That is what moved the run from "new subject" to "technique
triple in an existing subject" and is the run's most reusable lesson.

Applied `code` on a fleet speech service and shipped: its worker-pool give-up was
computed correctly and spelled distinctly in the health body, and the deployment's
liveness probe was a TCP connect that could not observe it — so an exhausted
replica was never replaced. 0/1 → 1/1 correct replacements, 0 false. The gap the
fix does *not* close is banked in the application: the verdict still does not
survive the pod restart, so a deterministically broken model re-spends the full
budget in every new pod.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

Gained `fork-to-outlive-the-healed` + `rust--fork-to-outlive-the-healed`.

**The finding is an interrogation of this subject's own premise.** `healer-death-as-promotion` takes as given that a mandatory component's healer cannot outlive it, and prescribes writing the verdict before the exit. For a large class of system that premise is a *consequence of executing the work in the healer's process*, not a property of the problem: re-express the work as a child process and the shared fate dissolves. The two techniques are now a pair and reference each other - fork when the work is expressible as an invocation, obey the older rule when it is not.

**Tested and rejected at the fleet seam it looked designed for** (see the applied ledger). The disqualifier is sharper than the first draft's "state larger than its invocation": it is *live shared accounting the work mutates as it runs*. A spend counter decremented in one address space satisfies record-precedes-effect for free; across a process boundary it must be re-earned with a write-ahead ledger, and until that exists the fork makes the accounting less trustworthy while making the classification more trustworthy.

**Open lead (return condition, not banked as a technique):** the external tree classifies by exit code alone after forking - the fork bought a surviving handler and no knowledge. A second sighting of a forking supervisor that *does* carry a declared verdict across the boundary would make that pairing a rule rather than an observation.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Amendment to `declared-verdict-over-inferred-wreckage`: inferring from an
absence is the same defect with the polarity flipped.** The variant that looks
like it obeys the rule instruments the *planned* path - a clean shutdown writes a
marker, every start writes a start record, and a start with no marker above it is
read as an unplanned death. Nothing is parsed and a constant is imported, so it
has the shape of a declared verdict. It is still inference, and the flip is worse
in one specific way: **a declared marker has exactly one author and an absence has
none.** The verdict is carried by every path that did not write - a marker
discarded by a staleness rule, consumed by another reader, written after the step
that failed, absent from an older build, or an operator restarting by hand. The
tell is a disjunction in the system's own description ("a crash *or* a manual
restart"), which is the unknown lane wearing a verdict's clothes. The correction
keeps the goal: **instrument the start, not the shutdown** - the starting process
records *why* it is starting, and a start with no reason is written down as
unknown.

**Apply: `simulation`, `better`, against a real seam.** The fleet peer states the
pattern outright in a comment - "absence of the marker IS the crash signal" -
citing a registry technique, and gates one recovery sweep on it. Three real cases:
a first-ever launch is classified as a crash; an OS-initiated termination writes
no marker and is classified as a crash though it is not one; and the tree's own
comment records that **four sibling sweeps still "declare blind"** because
widening an absence-signal "would only make their wrong verdicts rarer, not
righter" - the amendment's prediction in the author's own words. Falsifier stated:
if those four stay blind under the corrected policy the blocker is row
classification, not the signal - and the tree says it is, so the win is precision
on the gated sweep rather than the unblock.
