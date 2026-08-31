---
layer: golden-path
type: golden-path
subject: quality-gates
status: forged
techniques:
  - gate-laddering
  - severity-by-construction
  - vacuous-by-evaluation
  - blocking-by-input-determinism
  - ratchet-design
  - gate-liveness
  - hook-hygiene
  - false-positive-economics
  - unmeasurable-criteria
  - policy-projection
  - chokepoint-tag-registry
  - enforcement-binding
  - prose-rule-drift
  - oracle-frozen-during-repair
  - operation-assertion-gates
  - fabrication-economics
  - advancement-evidence-fields
  - item-liveness
  - excess-indicts-the-instrument
---

# Quality gates & ratchets

A quality standard exists in exactly one of two forms: as prose someone must
remember, or as a mechanism that can refuse. Only the second form survives
contact with deadlines, staff turnover, and the two-hundredth pull request.
The domain of quality gates is the engineering of refusal: which checks run,
where in the pipeline they run, what severity they carry, how metrics that
cannot yet be zeroed are prevented from getting worse, and — the part most
teams never do — how the gates themselves are verified to be alive. A team's
real quality bar is not what its documents say; it is the precise set of
states its machinery will refuse to let through. Everything softer is
aspiration.

## A gate exists only if it can fail

The foundational test for any check: **name the input that makes it block.**
If no input can make the pipeline stop, the check is not a gate — it is
output. This sounds trivial and is violated constantly, because severity is
usually *configured* in one place and *neutralized* in another:

- a rule set to advisory level, in a pipeline whose runner exits clean at
  any advisory count;
- a threshold flag set beyond any count the codebase could plausibly
  produce — strictness in review, unfireable in fact;
- a check that prints findings to a log nobody's exit code depends on.

A fourth case passes all three of those inspections and is still unfireable:
the rule is blocking, the exit code depends on it, the engine reads the real
target — and the evaluation layer beneath the rule *derives* the condition the
rule tests, so no input can violate it. That one is not visible in the
exit-code path at all, and it is
[vacuous-by-evaluation](./techniques/vacuous-by-evaluation.md).

In each case the severity label says "enforced" and the construction says
"decorative." The discipline is to reason about severity **by construction,
not by label**: trace the exit-code path from the finding to the merge
decision, and believe only what that path can actually do. Advisory output
is not worthless — it changes behavior through editor feedback at authoring
time, which is real and measurable — but it is a different product from
enforcement, and the failure mode is buying one while believing you own the
other. The full discipline, including how to measure whether a severity
level can ever fail a build, is
[severity-by-construction](./techniques/severity-by-construction.md). The
stage before this one — a rule that was written down and never mechanised at
all, whose violations are indistinguishable from compliance because the
forbidden action simply succeeds — is
[prose-rule-drift](./techniques/prose-rule-drift.md). The same
lesson was measured independently in
[swallowed-error-prevention](../../../backend-platform/resilience/error-handling/techniques/swallowed-error-prevention.md):
a rule that only warns, at gates that ignore warnings, enforces nothing at
either commit or merge — by construction.

## Whether a check may block turns on its input, not on its findings

Severity by construction says what a label can actually do. The prior
question is what label the check has *earned*, and the usual answer grades
the findings — security is serious, style is cosmetic. The durable axis is
the input: **a gate may block when its verdict is a function of the tree it
is gating**, and must not when the same commit can be refused next month by
something nobody here changed. A published advisory landing overnight
against a transitive dependency walls the next unrelated change with a
finding that is entirely true and in no way attributable to its author —
the one class of correct refusal that still spends the team's trust. This
also separates the two advisory statuses that wear the same label: a lint
gate held back by the repository's own backlog is advisory *on a schedule*
and must carry the promotion trigger that ends it, while a gate reading an
external feed is advisory *permanently*, and its trigger is to split the
invocation so the deterministic half blocks. Writing that trigger next to
the gate is what keeps a non-blocking gate from becoming an optional guard
by attrition ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).
The axis, the split, the clock an externally-fed gate needs, and the
boundary against ratchets are
[blocking-by-input-determinism](./techniques/blocking-by-input-determinism.md).

## When the input is fine and the instrument is not, change the instrument

The axis above assumes the verdict is computed reliably and asks only where
its input lives. Gates that *measure* rather than read — elapsed time,
throughput, a sampled resource count — break that assumption from a third
direction: re-run against the same commit they return a different answer,
and neither the tree nor any external feed moved. The machine did. Such a
gate is deterministic in its subject and nondeterministic in its apparatus,
and both honest configurations fail it: block, and the threshold has to sit
above the regressions worth catching; stay advisory, and no work inside the
repository can ever discharge the trigger.

The move is to stop grading the measurement and restate the standard as
something the source text either contains or does not — *this loop must not
call these operations* rather than *this loop must finish in this long*. That
input is deterministic, so the ordinary rule lets it block, and the
measurement moves to a non-gating scheduled lane comparing against the
previous release's own artifact rather than a guessed number. The cost is
real and must be written down: the assertion holds the architecture that
produces the performance, not the performance. The translation, the scanner
normalisation that lets a rule be documented in the file it governs, and the
instrument assertions such a scanner needs are
[operation-assertion-gates](./techniques/operation-assertion-gates.md).

## Gates are laddered by cost

A single monolithic "run everything" gate fails in both directions: too slow
at commit time and people bypass it; only at merge time and feedback arrives
hours after the mistake was cheap to fix. The senior structure is a
**ladder** — the same standards enforced at multiple rungs, with each rung's
scope sized to its latency budget:

- **Editor** — instant, advisory, per-keystroke. Catches most defects before
  they are ever committed, enforces nothing.
- **Commit** — seconds. Scoped to the files being committed. Fast static
  checks only.
- **Push** — tens of seconds to a minute. Type-level and contract-level
  checks over the affected surface.
- **Merge pipeline** — minutes. Everything, over everything, on a machine
  nobody's local state can pollute.

Two invariants make the ladder sound. First, **the binding rung is the last
one**: every local rung can be bypassed (and must be bypassable — see
[hook-hygiene](./techniques/hook-hygiene.md)), so the merge pipeline is the
only rung whose green means anything, and every check on a lower rung must
also exist there. A check that runs *only* locally is a courtesy, not a
gate. Second, **scoping is a loan against the backstop**: a commit-stage
check that examines only changed files is deliberately trading completeness
for latency, and the trade is safe only because the full-scope run exists
upstream. Scoped rungs without a full-scope backstop accumulate blind spots
in exactly the files nobody has touched recently.

Both invariants hold for defects whose cost is *rework*. They break for
defects whose cost is **irreversible at push time**: a credential that
reaches a remote host has leaked, and a refusal that arrives afterward
records the incident rather than preventing it. For that class the local
rung is not a latency optimization over the binding rung — it is the only
layer that can prevent rather than report, and the remote rung's honest
job is detection and revocation. The general form is that **control
placement is a per-control design decision**, not a default: for each
standard, name the layer that actually holds it, and keep the remote layer
to the genuine hard passes — the checks that need a clean room, the full
tree, or credentials that must not exist on a developer's machine. This
matters most where the author is an agent working in a loop, because a
remote round-trip costs an entire cycle and a pre-push checklist the agent
self-runs costs seconds; the same check wired into both layers, from one
script, means the remote run confirms what already ran rather than
discovering it. Rung design, control placement, what belongs where, and
the bypass economics are
[gate-laddering](./techniques/gate-laddering.md).

## The merge decision is bound to the gates by a separate mechanism

Everything above concerns the gate. The ladder has one more rung, and it
belongs to a different system: the hosting platform decides which of the
pipeline's verdicts the merge action may proceed without, from a
configuration that usually does not live in the repository. A pipeline
whose every check is precise and blocking by construction enforces
nothing if that binding is missing — and no pipeline run will ever say
so, because from the pipeline's side everything worked.

Two properties of the join do most of the damage. It is made by **name**,
so a check renamed, split, or moved satisfies a requirement that now
matches nothing, and a requirement matched by nothing reads as absent
rather than failing
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
And "did not run" resolves to a *definite* verdict whose direction
depends on where the skip was written: condition the whole pipeline
definition and it reports nothing, blocking the merge forever; condition
the unit inside it and the same intent reports success, satisfying the
requirement with a check that did no work
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
second is fail-open, silent, and the standard remedy for the first.

The real quality bar is therefore neither the rule count nor the
pipeline: it is the *intersection* of what the pipeline emits and what
the merge decision requires, which is an inventory question in exactly
the sense below — a check present in the pipeline and absent from the
requirement list is blocking by construction and advisory by
configuration, and nothing changed to notice. The name join, the skip
asymmetry, reading the binding back as a gated artifact, and proving the
refusal reaches the merge decision rather than only the run log, are
[enforcement-binding](./techniques/enforcement-binding.md).

## The gate must see its target

A gate observes some artifact and renders a verdict about some other thing —
the commit, the release, the codebase. The two are rarely identical, and
every gap between them is a place the gate passes while the target fails
([gate-sees-target](../../../_laws.md#gate-sees-target)). The recurring gaps:

- **Working tree vs. commit content.** A commit-stage check that reads the
  working tree is checking files as they sit on disk, not as they will be
  committed — partially staged files diverge exactly there.
- **Diff-shaped gates are blind to absence.** A gate built as "fail if this
  tracked artifact changed unexpectedly" cannot see a *new* artifact that
  was never tracked, or a stale artifact whose source vanished. Nothing
  changed; nothing fails; the drift is invisible by construction. Absence
  requires an inventory gate — "enumerate what should exist and compare" —
  not a diff gate.
- **Stale intermediates.** A gate that reads a generated index, a cached
  catalog, or yesterday's build output verifies the intermediate, and passes
  precisely when the intermediate has drifted from the source — the one
  condition it existed to catch.
- **Source the compiler removed.** Where the language excises code by
  build configuration, every static instrument the project owns — types,
  lints, dead-code detection — runs over a tree the excluded branch was
  deleted from before any of them looked. The whole local rung reports clean
  on a configuration it never analyzed, and says nothing about which one.
  Restoring that coverage is
  [gate-laddering](./techniques/gate-laddering.md)'s cross-configuration check.

Before trusting any green result, the question is never "did the check
pass" but "what did the check read."

## The gate must not be writable by what it gates

Seeing the target is half of the law; the other half is that the gate is
not *also* an artifact the gated party can edit. The case where this
breaks is the repair task: an author — increasingly a machine — is told
to make a failing check pass, and holds write access to the check. "Make
it pass" now has two solutions, the cheaper one is to soften the check,
and a green result does not say which was taken. The discipline is a
**freeze**: for the duration of a repair, everything a verdict can be
turned by — tests, fixtures, snapshots, skip and quarantine directives,
thresholds, the gate's own configuration — is read-only to the fixer,
enforced by the layer that acts before the write lands rather than by an
instruction. The ordering matters as much as the freeze: a check committed
red *before* the fix, and unwritable during it, is proof the defect is
gone; a check authored in the same change as the fix is fitted to the fix.
When the check itself is wrong, that is a separate, human-owned task, not
an exception inside the repair. The oracle set, the red-first ordering,
the mechanical form and its weaker fallbacks, and the release valve are
[oracle-frozen-during-repair](./techniques/oracle-frozen-during-repair.md).

## What a gate does with a condition it cannot evaluate

Producing an honest input — distinguishing "unmeasurable" from "measured
zero," refusing to render a rate off four data points — is the neighbouring
discipline of
[measurement honesty](../../../engineering-assessment/measurement-method/measurement-honesty/measurement-honesty.md), and
this subject assumes it rather than restating it. What follows is the half
that belongs to enforcement: given an honestly-marked unmeasurable input,
what the refusal machinery is permitted to do with it.

Some condition in every real policy will meet a value that is missing: the
access the gate was granted could not read the setting, the sample never
reached the floor a rate needs, the scorer produced nothing for that
dimension. A gate has three honest resolutions — skip the condition, fail
closed on it, or refuse to return a verdict at all — and the choice is not
a matter of taste. It turns on whether the absence describes the
**subject's world** or the **gate's own vision**. Absence that is a fact
about the subject (too little of the activity for a rate to exist) is not
evidence of a violation, and gating on it inverts the policy: it fails a
subject for not doing enough of the thing the policy wanted governed,
which rewards not doing it at all. That condition must reach the verdict
as an announced SKIP. Absence that is a hole in the gate's instrument — an
unscored dimension, a non-finite value — must never read as compliance,
and the naive comparison is the trap, because a missing value tested
against a floor evaluates to "not below it" and sails through the exact
bar that existed to enforce it. And when *nothing* could be measured, the
assessment's renormalized zero is not a measurement; certifying or
condemning on it is treating an ingestion failure as a verdict, so the
gate refuses the assessment rather than judging the subject. The skip must
be visible on every surface and counted, because a condition skipped for
most of the population has become advisory by data starvation. The
resolutions, the derivation of the "measured nothing" state, and the case
where skipping is itself the vulnerability are
[unmeasurable-criteria](./techniques/unmeasurable-criteria.md).

## One policy, many surfaces

A policy is enforced in one place and *described* in several: the summary
attached to a change under review, the pass-rate view, the parameters of
the invocation that runs the gate, the configuration snippet a team copies
into their own pipeline. Each is a projection, each is read as
authoritative, and each is usually written by hand-walking the policy in
its own renderer — so every projection ends up a *subset* of what is
enforced, and the error runs one way: **surfaces understate what will
block you.** A review footer that omits a floor sends the author to fix
the wrong thing; a rollup evaluating fewer conditions than the gate
advertises subjects as passing that the gate refuses. The structure is one
ordered enumeration of the active policy that carries every projection of
every condition, with renderers reduced to maps over it. The sharpest
instance of the class is a **display cap consumed as a data cap**: a list
truncated for layout, fed into a copyable enforcement artifact, has been
measured shipping a gate that covered eight of twenty failing subjects
directly beneath a tile reading twenty. Any projection that is itself an
enforcement artifact derives from the full population, never from a view
model. The enumeration structure, the inexpressible-condition rule, and
carrying the effective policy alongside the verdict are
[policy-projection](./techniques/policy-projection.md).

## Ratchets: monotonic improvement as a gate

Most quality metrics in a living codebase cannot be zeroed today — hundreds
of legacy violations, a bundle that grew for two years, a warning class with
deep roots. The wrong responses are the common ones: block on zero (instant
bypass culture) or track it on a dashboard (numbers that only ever go up).
The senior structure is the **ratchet**: record the current value as an
explicit, committed baseline, and gate on direction — the metric may fall,
never rise.

A correct ratchet fails in **both** directions. Fail on rise, obviously.
But also fail — or at minimum refuse silence — when the measured value drops
below the baseline without a baseline update, because an unexplained
improvement has two explanations and the likelier one is that **the
measurement broke**. A counter that walked zero files reports zero
violations; celebrating that number buries the instrument failure inside
good news ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
Improvements are welcomed by re-baselining as a deliberate, reviewed diff —
the baseline file is the metric's audit log. Baseline mechanics, bucketing,
and the endgame (a ratchet that reaches zero graduates into a hard ban) are
[ratchet-design](./techniques/ratchet-design.md).

## A gate that cannot prove it ran has not run

The most dangerous gate state is not red; it is **false green** — the
checker that exited clean because it checked nothing. A missing tool, a
path assumption that holds on one machine only, a glob that matched zero
files, an early chain-step that aborted before the real check: all of these
produce the same observable as success unless the gate is built to refuse
that equivalence. The standing rule: **assert the instrument before the
result**. Zero files walked, zero rules loaded, a scanner binary absent —
these are fatal errors with their own exit path, never a green report
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). And
liveness is verified from the outside, too: a gate is proven alive by
feeding it a known-bad input and watching it fail — once at birth, and
again whenever anyone claims it works. A gate that has never been seen
red is unverified machinery. Portability, instrument assertion, chain
ordering, and seeded-failure verification are
[gate-liveness](./techniques/gate-liveness.md).

Every signal in that list is a *deficiency* signal — the number is too small
because the instrument did too little. A gate fails in the other direction too,
and it looks nothing like a broken one: pointed at the wrong scope it runs
perfectly and reports a mountain of findings about ground it was never meant to
stand on. An implausibly *large* population is evidence about the scope
declaration before it is evidence about the codebase, and the reading where that
matters is the founding one, because the baseline frozen from it is the number a
ratchet then defends forever. The plausibility test, the distribution
discriminator, and where to print a self-accusation are
[excess-indicts-the-instrument](./techniques/excess-indicts-the-instrument.md).

## False positives are how gates die

Gates do not usually die by being deleted in anger. They die by a quieter
sequence: the gate fires on content that is actually correct; the author,
knowing they are right, bypasses it; bypassing becomes ambient habit;
eventually the gate blocks something real, gets bypassed by reflex, and the
defect ships — at which point the gate is deleted for having "never worked."
**Precision is a survival property.** Before a detector earns blocking
severity it is driven over the full population it will judge, and its
precision measured against ground truth; a detector that flags correct code
is a debt against the team's trust budget, and the budget is shared across
*all* gates — one crying wolf teaches people to bypass the whole ladder.
When a live gate misfires, the fix is narrowing the detector, never deleting
the gate ([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair)) —
unless measurement shows the detector never matched the standard at all, in
which case it was not a gate for that standard and pretending otherwise is
the harm. The economics, the measurement method, and the quarantine
protocol for flaky checks are
[false-positive-economics](./techniques/false-positive-economics.md).

## False compliance is how rules die

The mirror failure kills the *rule* while leaving the gate healthy, so nothing
in the report ever shows it. When a requirement's satisfaction cannot be
verified — an alternative description, a rationale, a justification for an
exception — the gate can decide *present or absent* perfectly and *meaningful*
not at all, and an author with nothing true to write is offered exactly two
moves: stay blocked, or write something shaped like an answer. The second is
always cheaper, and it is overwhelming when the author is a program filling the
field across a whole tree. The gate is not fooled; **the gate is the cause**,
and no improvement to the detector helps, because the distinction is not in the
data. The corrective is a third value — an explicit token meaning *no value was
obtainable here*, which leaves the artifact non-conforming, is counted outside
the verdict, and produces no finding, because a token that still turns the
report red buys the author nothing against the lie that turns it green. The
economics, the conflated-token failure that is the usual starting state, and the
rule that a contract must name its own undecidable clauses are
[fabrication-economics](./techniques/fabrication-economics.md).

## Hooks are guests in someone else's working tree

The commit and push rungs run inside the author's workspace, possibly
alongside other in-flight work, and their discipline is a subject of its
own: **hooks observe, never mutate** — an auto-fixing hook silently commits
content the author never saw and diverges staged from unstaged state;
hooks are non-interactive and time-bounded; hooks scope to what is being
committed, not to whatever else is in the tree; and hook *installation* is
itself a liveness problem, because a hook that was never installed reports
nothing and looks identical to a hook that passed. The full protocol is
[hook-hygiene](./techniques/hook-hygiene.md).

## Gating a convention: making "everything goes through the wrapper" checkable

A large family of standards is stated as routing: all metered calls go
through this client, all writes go through this door, all addresses come
from this composer. Each is a convention until something proves it, and the
proof is unusually cheap — a static bijection between the wrapper's call
sites, an inline identifier at each, and a registry row per identifier,
checked in all three directions. What the bijection cannot see is the call
that never touched the wrapper at all, so it is completed by a
negative-space rule confining the underlying capability to the wrapper's own
modules. Together they turn the convention into an invariant that a commit
hook can refuse — and both halves carry limits strong enough that quoting
the result without them overstates it. The construction, the extension to
any second per-operation table, and the two disclaimers are
[chokepoint-tag-registry](./techniques/chokepoint-tag-registry.md).

## When the item outlives the verdict

Everything above takes the gate's natural lifespan: a checker runs against
a commit, returns a verdict, and the verdict's job ends at the merge
decision. A different shape appears wherever items advance through
**stages** over months or years — a change walking a design review, a
component climbing a readiness ladder, a proposal crossing a standards
body. There the verdict is the transient half and the item is the durable
one, and two questions arise that one-shot machinery never has to answer.

The first is what the item's own record shows for an obligation. The field
that carries it belongs to the stage that binds it — minted where the
obligation becomes live, retired once permanently discharged, so the schema
is the ladder rather than a uniform grid — and its non-satisfied side needs
a closed vocabulary, because a blank merges "not yet," "done but
unrecorded" and "nobody looked" into one unreadable cell. Four states
(satisfied, in progress, absent with a pointer to why, and an explicitly
rendered unknown) are the floor. The payoff is measured wherever one board
tracks two obligations under two conventions: the field with explicit
markers produces a countable, attributable backlog and the field with
blanks produces a 55% hole nobody can act on — and the obligation with the
readable field is the one that gets discharged, though neither blocks
anything. This also supplies the resolution
[unmeasurable-criteria](./techniques/unmeasurable-criteria.md) cannot,
because a skip disappears with the run: **advance the item and write the
hole into the row**, which is the honest move for a gate whose verdict is a
judgment some authority can override, and the only thing that keeps the
override on the record. The schema rule, the vocabulary, the fourth
resolution and the sharp limit — this reports, it does not refuse — are
[advancement-evidence-fields](./techniques/advancement-evidence-fields.md).

The second question is the mirror of gate liveness. A gate green for a year
is unverified machinery; an *item* in flight for a year whose owner has
stopped speaking is unverified work, and it fails the same way — the
default reading is the reassuring one and nothing emits a signal when it
stops being true. Ownership is the one entrance criterion that decays
continuously after admission, so checking it once makes it a birth
certificate; in a decade-long public pipeline, owner departure is the
single largest named cause of terminated work, and a third of the in-flight
board had been silent for two years or more while being counted as active.
The correction is cheap because the data is already there — last-touched is
computable from the activity trail the pipeline keeps anyway — and it ends
in a scheduled sweep that asks the owner question rather than reopening the
merits, resolves silence to a terminal state, and records a rationale and a
successor so the reaping stays information
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). The
clock, the derivation, the liveness predicate a published count must carry,
and the reaper's mechanics are
[item-liveness](./techniques/item-liveness.md).

## Domain gates ride the same ladder

Everything above is domain-agnostic scaffolding, and its test is that
domain-specific gates compose onto it without new machinery: a completeness
gate for translation catalogs
([completeness-gates](../../../client-architecture/i18n/techniques/completeness-gates.md)) is a
commit-rung inventory gate with a merge backstop; a token-enforcement rule
for a design system
([token-enforcement](../../../ui-surfaces/feedback-and-style/design-tokens/techniques/token-enforcement.md)) is a
severity-by-construction decision plus a fix-as-you-touch ratchet; a
swallowed-error census is a ratchet whose counter must assert its
instrument. When a new standard arrives, the questions are always the same
four: which rung, what severity by construction, ratchet or hard ban, and
how will we know the gate is alive next year.

One neighbour is close enough to name: scoring a codebase against a
published contract and reporting the result is *assessment*, and its craft
— what a conformance percentage may claim, how a checker treats what it
merely observed — belongs to
[conformance-checking](../../../engineering-assessment/maturity-and-conformance/conformance-checking/conformance-checking.md). A
checker is frequently *deployed* as a gate, at which point everything here
applies to it; the two subjects meet exactly at the moment an assessment
is asked to refuse something.

## The techniques

- [gate-laddering](./techniques/gate-laddering.md) — cost tiers by pipeline
  stage, scope-vs-latency trades, the binding rung, and the full-suite
  backstop.
- [severity-by-construction](./techniques/severity-by-construction.md) —
  tracing what a severity level can actually fail; advisory feedback vs
  enforcement; escalation paths for new rules.
- [blocking-by-input-determinism](./techniques/blocking-by-input-determinism.md)
  — grading blocking status by whether the input moves with the tree,
  debt-shaped vs input-shaped advisory, splitting a bundled invocation, and
  the written promotion trigger.
- [ratchet-design](./techniques/ratchet-design.md) — committed baselines,
  fail-on-rise and fail-on-silent-drop, reviewed re-baselining, and
  graduating to a ban.
- [gate-liveness](./techniques/gate-liveness.md) — instrument assertion,
  portability, chain-abort ordering, and proving a gate red before
  trusting it green.
- [excess-indicts-the-instrument](./techniques/excess-indicts-the-instrument.md)
  — implausible finding volume as a scope-declaration signal, the distribution
  discriminator, root-sensitive versus locally-derived findings, and printing
  the suspicion above the findings.
- [hook-hygiene](./techniques/hook-hygiene.md) — never mutate the worktree,
  staged-content scoping, non-interactive discipline, bypass policy, and
  installation as a liveness problem.
- [oracle-frozen-during-repair](./techniques/oracle-frozen-during-repair.md)
  — what counts as the oracle, red-first ordering as proof of defect, the
  mechanical freeze and its weaker fallbacks, verdict from the toolchain,
  and the separate task for a check that is itself wrong.
- [false-positive-economics](./techniques/false-positive-economics.md) —
  precision as survival, measuring before enforcing, the trust budget, and
  quarantining flaky checks.
- [fabrication-economics](./techniques/fabrication-economics.md) — the
  requirement a machine cannot verify and an author cannot satisfy, the
  declared-inability token and why the gate must go silent on it, and naming
  a contract's own undecidable clauses.
- [unmeasurable-criteria](./techniques/unmeasurable-criteria.md) — skip,
  fail-closed, or refuse the verdict; deriving the measured-nothing state;
  making skips visible and counted.
- [policy-projection](./techniques/policy-projection.md) — one enumeration
  rendered into every surface, display caps that are not data caps, and
  the effective policy travelling with the verdict.
- [enforcement-binding](./techniques/enforcement-binding.md) — the name
  join between pipeline and merge decision, the fail-open/fail-closed
  skip asymmetry, enumerating required against emitted, and proving the
  refusal at the merge decision itself.
- [chokepoint-tag-registry](./techniques/chokepoint-tag-registry.md) — the
  static call-site ↔ tag ↔ registry bijection, negative-space confinement of
  the underlying capability, extending both to any second per-operation
  table, and the two limits that bound what the result may claim.
- [operation-assertion-gates](./techniques/operation-assertion-gates.md) —
  restating a cost standard as an assertion over source text, scoped
  denylists with their replacements attached, normalising comments and
  literals out before matching, testing the scanner itself, and the timing
  lane's demotion to scheduled evidence.
- [advancement-evidence-fields](./techniques/advancement-evidence-fields.md)
  — the field minted at the stage its obligation binds, the closed
  vocabulary its non-satisfied side needs, advancing an item with the hole
  written into the row, and the limit that this reports rather than
  refuses.
- [item-liveness](./techniques/item-liveness.md) — ownership as the
  entrance criterion that decays, deriving last-touched from the trail
  already kept, the liveness predicate a published active count carries,
  and a scheduled reaper that records a rationale and a successor.
