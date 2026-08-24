---
layer: golden-path
type: golden-path
subject: quality-gates
status: forged
techniques:
  - gate-laddering
  - severity-by-construction
  - blocking-by-input-determinism
  - ratchet-design
  - gate-liveness
  - hook-hygiene
  - false-positive-economics
  - unmeasurable-criteria
  - policy-projection
  - chokepoint-tag-registry
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

In each case the severity label says "enforced" and the construction says
"decorative." The discipline is to reason about severity **by construction,
not by label**: trace the exit-code path from the finding to the merge
decision, and believe only what that path can actually do. Advisory output
is not worthless — it changes behavior through editor feedback at authoring
time, which is real and measurable — but it is a different product from
enforcement, and the failure mode is buying one while believing you own the
other. The full discipline, including how to measure whether a severity
level can ever fail a build, is
[severity-by-construction](./techniques/severity-by-construction.md). The same
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

Before trusting any green result, the question is never "did the check
pass" but "what did the check read."

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
- [hook-hygiene](./techniques/hook-hygiene.md) — never mutate the worktree,
  staged-content scoping, non-interactive discipline, bypass policy, and
  installation as a liveness problem.
- [false-positive-economics](./techniques/false-positive-economics.md) —
  precision as survival, measuring before enforcing, the trust budget, and
  quarantining flaky checks.
- [unmeasurable-criteria](./techniques/unmeasurable-criteria.md) — skip,
  fail-closed, or refuse the verdict; deriving the measured-nothing state;
  making skips visible and counted.
- [policy-projection](./techniques/policy-projection.md) — one enumeration
  rendered into every surface, display caps that are not data caps, and
  the effective policy travelling with the verdict.
- [chokepoint-tag-registry](./techniques/chokepoint-tag-registry.md) — the
  static call-site ↔ tag ↔ registry bijection, negative-space confinement of
  the underlying capability, extending both to any second per-operation
  table, and the two limits that bound what the result may claim.
