---
layer: golden-path
type: golden-path
subject: codebase-scanning
status: forged
techniques:
  - sensor-pipeline
  - rule-precision-discipline
  - finding-lifecycle
  - llm-assisted-scanning
  - incremental-scanning
  - dead-code-detection
  - ingestion-budget
  - evidence-scoping
  - verify-after-generate
  - precision-trades-have-a-direction
---

# Codebase scanning & triage

A codebase accumulates defects faster than any human reads it. Conventions
drift, error paths go silent, dead modules calcify, documentation describes a
system that no longer exists — and none of it announces itself, because the
build stays green and the tests stay passing. Scanning is the discipline of
**going looking**: programmatic and model-assisted detection of what is wrong,
turned into deduplicated, verified, prioritized work items a human can act on.
It is the difference between a codebase whose health is *believed* and one
whose health is *measured*.

The subject's boundaries are worth drawing before its walls. A scanner
**discovers**; it does not enforce. Enforcement — a check that blocks a change
at a boundary, with the near-perfect precision that blocking demands — belongs
to quality-gates, and the relationship between the two is a graduation
pipeline: a rule is typically born in a scanner, where it runs advisory and
its precision can be measured against the live population at zero cost of
false blocks, and only a rule with *proven* precision earns promotion to a
gate. Shipping an unmeasured rule directly into a gate inverts this and pays
for the calibration in developer trust. At the other end, the scanner's
responsibility terminates where the operator's inbox begins: verified findings
land in a [triage queue](../../../operations/service-operations/triage-queues/triage-queues.md), whose adapter
contract, ordering policy, and verdict write-back are that subject's walls,
not this one's. The scanner's obligations to the queue are exactly two —
deliver items that pass the actionable predicate, and carry enough evidence
that the operator can judge without an expedition.

## The four load-bearing walls

### 1. The sensor pipeline: gather tolerantly, emit purely

A scan is not one program; it is a pipeline with distinct stages, and the
stage boundaries are where its reliability lives. **Gathering** reads the
world — the file tree, the dependency graph, the runtime's own records — and
must be *tolerant*: every sensor is optional, every sensor failure is
isolated so one crashing collector cannot take down the sweep, and every
sensor that did not run is **reported as skipped, never as silently empty**.
**Emission** turns the gathered snapshot into findings and must be *pure*:
rules are functions from snapshot to findings, with no reads of their own —
which makes them deterministic, testable against fixtures, and cheap to
re-run. Downstream, findings are deduplicated against what is already known,
ordered by expected value, **capped with disclosed truncation** — "top N of
M" is honest; a silently clipped list is a lie about the backlog — and
persisted with stable identity so the next sweep converses with this one
instead of shouting over it. The stage discipline is
[sensor-pipeline](./techniques/sensor-pipeline.md).

### 2. Precision is the survival property

A scanner that cries wolf gets ignored, and an ignored scanner gets deleted —
usually within a quarter, taking its genuinely true findings with it. Recall
failures are invisible and forgiven; precision failures are experienced
personally by every developer the scanner wastes, and they compound into a
reputation the tool never recovers from. The operational consequences are
strict. **Never write a detection rule from principle without reading the
population it will match first** — this is not advice but a measured failure
class: rules written in an hour from what *ought* to be true, against code
never inspected, have measured **zero percent precision** on contact with the
actual population. **Hand-verify a sample of every rule's matches before the
rule ships**, and record the measured precision next to the rule. **Refuse
rules that match nothing at birth** — a zero-match rule is either untested or
broken, and both are disqualifying, because a rule that silently matches
nothing will silently continue to match nothing after the defect it was meant
to catch arrives. The full discipline, including cross-checking any count
that travels with a second independent implementation, is
[rule-precision-discipline](./techniques/rule-precision-discipline.md).

That asymmetry is also a standing liability, and it comes due the moment a
scanner is made *faster*. Speed in static analysis is an information source
discarded, and every discarded source moves the error in a knowable direction:
losing the ability to **see** a reference produces false positives, which users
report for free; losing the ability to **distinguish** references produces false
negatives, which nobody reports, because no one has ever filed a bug about a
finding that was not made. Recall being invisible is the reason it needs a
deliberate instrument rather than the reason to forgive it — and the only
instrument that measures it is a differential against the slower implementation,
run while both still exist. The two directions, the hand-written scope checklist
a discarded resolution layer leaves behind, and where to publish each loss are
[precision-trades-have-a-direction](./techniques/precision-trades-have-a-direction.md).

### 3. A finding is a claim, and claims carry evidence

The unit a scanner produces is not "something is wrong somewhere" — it is a
falsifiable claim: *this rule, at this location, matched this content, and
here is why that is a defect*. Location down to the line, plus the matched
content itself, quoted. The evidence requirement is what makes everything
downstream possible: verification can re-check the claim against the current
tree, deduplication can key on something stable, the operator can judge from
the queue without opening an investigation, and a false positive can be
diagnosed as *rule defect* versus *stale world* versus *misread context*. A
finding without quoted evidence is an opinion with a timestamp, and it
poisons the pipeline twice — it cannot be verified, and it teaches operators
that findings in general cannot be trusted.

That requirement is written for a sensor that matches text, and half a mature
roster is not. A sensor reading an **aggregate** — a spend concentration, an
error rate, an interval since last use, a proportion crossing a floor — has
no line to quote, and forcing one on it produces a citation pointing at the
least informative place the number happened to touch. Its evidence is the
other shape the laws already demand: the measured value, the predicate it was
measured under, the threshold it crossed, and the window
([count-carries-predicate](../../../_laws.md#count-carries-predicate)).
Verification splits along the same seam. A located finding is re-checked by
re-reading its location; a measured one is re-checked by **re-running the
measurement** — the stronger of the two verifiers, because it distinguishes
resolved from merely moved, and it cannot go stale against a tree that was
refactored underneath the claim.

### 4. Verification is a separate pass from detection

**A finding is not a defect until something independent has re-checked it.**
Detection optimizes for coverage and runs cheap heuristics at scale;
verification optimizes for truth and runs once per candidate. Keeping them as
separate passes is structural, not procedural: the verifier re-reads the
claimed location in the *current* tree, confirms the quoted evidence still
exists, and confirms the rule's reasoning survives the surrounding context —
and only then does the candidate become a work item. The same machinery runs
*after* remediation, where it has exactly three honest verdicts: **cleared**
(the defect is gone), **regressed** (it came back), or **persisted** (the fix
did not fix). A pipeline that files findings without verification exports its
false positives to the operator's queue; a pipeline that never re-checks
after fixes cannot distinguish progress from churn. The lifecycle from
candidate through verdict is [finding-lifecycle](./techniques/finding-lifecycle.md).

## Coverage honesty: the scan reports on itself

Every scan result is implicitly a claim about what was looked at, and that
claim must be explicit. A sweep that ran nine of twelve sensors reports nine
of twelve, with the three skips named and reasoned. A scan that examined only
what changed since the last run is labeled **incremental** and never presents
itself as a statement about the whole population — the incremental/full
distinction, the staleness decay of unrefreshed findings, and the scheduled
full-scan re-anchor are [incremental-scanning](./techniques/incremental-scanning.md).
And the most seductive dishonesty of all: **zero findings and a scan that
could not run must be spelled differently.** A green report whose instrument
was broken is the most expensive lie in automation, and the scanner's own
health — did the sensors load, did the rules parse, did the population get
enumerated — is asserted before any result is reported.

## Two extensions of the sensor roster

Two families of sensor earn their own techniques because each defeats the
naive version of the pipeline in its own way.

**Model-assisted scanning** extends detection past what mechanical pattern
matching can express — intent mismatches, misleading names, comments that
describe code that no longer exists. But a language model inside a scanning
pipeline is a *sensor with an unreliable narrator*: its findings are
candidates, never verdicts; its output must arrive over a strict
machine-parseable protocol with malformed lines counted rather than silently
dropped; and its rulebook must be *adapted from* the one declared ruleset
rather than improvised per run, or every scan grades against a different
standard. The containment discipline is
[llm-assisted-scanning](./techniques/llm-assisted-scanning.md).

**Dead-code detection** is the family where the evidence is an *absence* —
nothing references this — and absence is precisely what diff-shaped and
reference-counting instruments are structurally blind to. Generated artifacts
whose generator adds but never removes, declarations kept alive only by
other dead declarations, registries that retain names whose implementations
are gone: each produces no diff and no local signal, and is found only by an
inventory of what *should* exist reconciled against what does. The
reachability analysis, the shadow-declaration defeat, and the protocol for
actually deleting are [dead-code-detection](./techniques/dead-code-detection.md).

## The scan's own output can be wrong on a green run

Everything above treats the scan as the instrument and the codebase as the
target. Turn it around: a scan that writes a durable artifact — a context map,
an inventory, a taxonomy other tooling reads at task start — has made that
artifact a target in its own right, and the model that produced it can finish
cleanly and still emit a corrupt one. Duplicated entities, a prune that took
the wrong side, a parent left unset because the model chose a create where an
update belonged: none of it is malformed, so nothing downstream trips over it,
and every consumer reads it as truth until someone looks. The consuming side
therefore owes the artifact a **post-generation audit** over a small fixed set
of invariants, a repair protocol that names the tool which would destroy the
correct copy, and — when the generator cannot be reached at all — a dated
owed-work journal that the next session drains rather than a hand-written
substitute. That protocol is
[verify-after-generate](./techniques/verify-after-generate.md).

It sits deliberately close to three neighbours and overlaps none of them.
Generator failure isolation, in the build-and-release subject, is the
*runner's* contract for generators that hang, crash, or exit zero having
touched nothing — its whole premise is a generator that did not produce, where
this technique's premise is one that produced and lied; and generated-file
hygiene is the artifact's self-declaration, which redirects a human's edit but
asserts nothing about whether the contents are right. This subject's own
[llm-assisted-scanning](./techniques/llm-assisted-scanning.md) is the same
unreliable narrator seen from the producer's seat — how a scanner contains a
model it is calling — while this technique is the seat of the repository being
scanned, which has no access to the scanner's internals and only the artifact
to go on. And the drift journal is not a catch-up marker: a marker anchors a
batch repair against accumulated, unenforced drift and records what a full
pass covered, whereas the journal is a per-session queue of specific
regenerations owed, drained and cleared by the next session that finds the
generator alive. The rule for picking: if you own the generator, the codegen
subject's techniques are yours; if you merely consume its artifact and read it
as truth, this one is.

## Scanning a codebase you do not control

Everything above assumes the scanner may read its target freely and calibrate
its rules against a population it has seen. A scanner pointed at *arbitrary
foreign codebases* — projects it has never opened, over a metered remote
interface, on demand — loses both assumptions at once, and two disciplines
that are optional at home become load-bearing.

The first is that **gathering stops being free and becomes an allocation
decision.** The corpus the scan can afford is a small fraction of the tree, so
the picker that chooses which files enter the snapshot determines what every
downstream rule is even capable of seeing. Its hardest rule is the one nobody
writes down until a detector goes quiet: a detector whose correctness requires
*complete* coverage of some file class cannot share a general cap with
high-volume classes, because it will be starved exactly on the largest targets
— the ones it matters most for — and give back an unearned clean bill. The
allocation craft, the per-consumer byte caps, the deliberate seam where
ingestion fetches more than any single consumer can hold, and the rule that
coverage confidence must measure the *fetch's* success rather than the
target's size, are [ingestion-budget](./techniques/ingestion-budget.md).

The second is that **precision must be bought by scoping rather than by
calibration.** The population-first order of operations is unavailable when
the next target is unlike every target used to tune the rule; what remains is
control over where a rule may look and what counts as evidence. Shrink the
haystack instead of the needle; recognize that demonstration trees testify
about samples and not about the project; refuse to credit a practice from a
filename; score evidence of *use* rather than presence, because a scanner
whose results people care about turns its presence checks into forms to fill
in; and emulate a document's structure rather than approximating it with line
adjacency. The catalogue, each entry stated with the defective rule it
replaces, is [evidence-scoping](./techniques/evidence-scoping.md).

Both disciplines share one premise worth stating alone: **the full listing is
cheap and the contents are not.** Read the whole tree structure even when
almost no file contents can be afforded — it costs one request, and it is what
lets a sample describe itself honestly, because a subset is only reportable as
a subset when its denominator is known.

## The economics: findings are spent from the operator's budget

The scanner's output competes for the same finite attention every other
producer draws on, and the [triage subject](../../../operations/service-operations/triage-queues/triage-queues.md)
prices it: every item that turns out to need nothing debits trust, and enough
of them buys mechanical dismissal of everything the scanner will ever say.
This is why precision discipline and the verification pass sit *upstream* of
the queue rather than being the operator's problem — the scanner that
delegates its false-positive filtering to the human has converted its
cheapest resource (compute re-checking claims) into spending its scarcest
(operator willingness to read). Impact-per-effort ordering and disclosed
truncation are the same economics applied to volume: fifty verified findings
delivered as an undifferentiated wall are triaged worse than fifteen
delivered ranked, with "thirty-five more withheld" printed underneath.

## What this subject deliberately excludes

- **Enforcement.** Blocking a change at a boundary is quality-gates; this
  subject feeds it calibrated rules but never blocks anything itself.
- **The inbox.** Ordering policy, verdict write-back, focus modes, and bulk
  actions on the operator surface belong to
  [triage-queues](../../../operations/service-operations/triage-queues/triage-queues.md); the scanner's contract
  ends at delivering verified, evidence-bearing, deduplicated items.
- **Runtime health.** Detecting defects by observing the *running* system —
  crashes, latency, error rates — is
  [observability-telemetry](../../../backend-platform/platform-observability/observability-telemetry/observability-telemetry.md);
  scanning reads the code at rest.
- **Remediation itself.** The scanner proposes and verifies; what fixes the
  finding is ordinary engineering, subject to whatever review the change
  class demands.

## The techniques

- [sensor-pipeline](./techniques/sensor-pipeline.md) — tolerant gather, pure
  emission, per-sensor isolation and skip reporting, dedup, disclosed caps,
  persistence.
- [rule-precision-discipline](./techniques/rule-precision-discipline.md) —
  population-first rule writing, hand-verified precision samples, positive
  controls, zero-match refusal, independent cross-checks for counts.
- [precision-trades-have-a-direction](./techniques/precision-trades-have-a-direction.md)
  — what a speed refactor discards and which way the error moves, the scope
  checklist a lost resolution layer becomes, the differential as the only recall
  instrument, and announcing each loss where its cost lands.
- [finding-lifecycle](./techniques/finding-lifecycle.md) — stable finding
  identity and dedup keys, impact-per-effort ordering, verify-then-file,
  post-fix cleared/regressed/persisted verdicts, recorded suppression.
- [llm-assisted-scanning](./techniques/llm-assisted-scanning.md) — the model
  as unreliable sensor: adapted rulesets, protocol-line streaming, candidates
  never verdicts, evidence quoted against the actual target.
- [incremental-scanning](./techniques/incremental-scanning.md) — change-driven
  re-scan, honest incremental/full labeling, staleness decay, the dependency
  closure trap, full-scan cadence.
- [dead-code-detection](./techniques/dead-code-detection.md) — reachability
  over refcounts, the shadow-declaration defeat, generator-never-deletes
  orphans, deletion as a verified protocol.
- [verify-after-generate](./techniques/verify-after-generate.md) — the
  consumer's audit of an artifact a model generator succeeded at writing:
  invariant checks bought by incidents, a repair protocol that names its
  anti-remedy, and an offline drift journal the next session drains.
