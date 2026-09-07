---
subject: model-routing
domain: software-engineering
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# model-routing

Touched by [[2026-09-03-awesome-langchain]]. Gained `failover-path-liveness`. The
paired amendment landed next door in `optional-dependency-degradation`.

## What the gap actually was

An **asymmetry**, not an absence, and the reference that produced it was a thin
abandoned demo whose own failure taxonomy is poorer than the corpus's. Reading it forced
the question: the subject decides *when* to fail over — the horizon that detects, the
floors a substitute must clear, the policy that governs — and every bit of that
describes a mechanism nobody has watched run, because a failover path executes only when
something else is broken.

The corpus already owns fault injection twice: in the test-input subject as a recovery
instrument, and as a *retirement* instrument via withholding. It has never owned it as a
**production liveness** instrument. Exploration is the de facto substitute and fails in
two specific ways — it is defined to suspend when the healthy candidate pool is thin, so
it withdraws exactly during the incident it would have prepared for; and it exercises a
*destination* rather than the transition, entering the detect-attribute-exclude-redraw
chain only at the last step.

## What three projects said

`better` in all three. One declares 90 named fallback sites, lint-enforced so a silent
catch is impossible, all 90 exceptional, against 5 liveness assertions — 5.6%, and its
one env flag touching a safety net *disables* the gate rather than exercising it. One
has three of its last fifteen engine commits fixing substitute paths with no counter
added, so a fourth is invisible today. One had already written the technique's core
claim into a doc comment — both counters stay zero when the fabric is off, because
nothing is being substituted — a two-sighting corroboration; and its failover ladder
turned out to have **zero production callers**, hardened by five commits including a
silent data-corruption fix, on a branch no shipped configuration can take.

## Open

No tree examined can inject a fault: provider endpoints are hard-coded literals with no
base-URL override. That one override is the cheapest instrument in the fleet and would
unblock this technique in two projects at once.
## 2026-08-31 - /intake omniroute

New technique `quality-axis-separation`, registered as consequence 10 in the golden path
(cache-continuity moved to 11). From `github:diegosouzapw/OmniRoute` @ `b7a0c54`.

The gap was a missing *definition* rather than a missing opinion: `candidate-ranking` is
thorough about how to combine terms and silent on what "success" means, so its reliability
estimator is fed by transport outcomes — the one axis on which this subject's central
failure, the mis-route that returns something plausible, is invisible. The technique splits
the operational axis (free, from the request path, and it should include the unusable
successes `failover-horizon` already enumerates) from the semantic axis (null until an
evaluator writes it, never sharing a field or a writer with the operational one), and adds
the evaluator-as-sink rules: typed outcome record separate from the interface's
notification bus, nothing judged synchronously, bounded buffer that drops rather than
backpressures.

Applied to `gravity` as a simulation, verdict `better`, proof `structural-only`. The
structural fact is negative and better than an adopting tree would have given: its routers
are exemplary ladders with **no quality term at all**, so the failure is unreachable — yet
the sink seam already exists as the typed descent trail, correct and feeding nothing, which
is precisely the state in which turning outcomes into a "quality" score looks like an
obvious few-line improvement. The decisive case came from the tree's own history: a
frame-planning step whose first version produced schema-valid, deterministic, semantically
worthless output that single-axis scoring would rate maximal.

## 2026-09-04 - `/intake`, from an external source

Two amendments, both appends to technique files rather than restructures, so V5
did not fire even though a quiet sibling held this subject. Source:
[[2026-09-04-authority-hacker-writing-models]]. **Note for whoever reads this
next:** the board's `check` reported this subject clear while its own `list`
showed the sibling holding it — the second sighting of that contradiction. This
run trusted `list`.

**`effort-calibration` amended: a tie is a property of the instrument.** The
technique's cheapest rule — when quality signals tie, cost decides — carries an
unstated precondition, that the instrument reporting the tie could separate these
candidates on this axis. The second inversion already says model judges favour
their own family; the consequential half is what that disagreement does to the
aggregate. Judges pulling in different directions on a stylistic axis do not
produce a spread, they **cancel**, and cancellation is reported as parity. So the
instrument most likely to be used on prose work is the one most likely to
manufacture the tie that hands the decision to cost.

A forced-choice comparison between unlabelled outputs, judged by the audience the
copy is for, separates candidates a judge panel calls tied — and it is not
reliably ordered by tier. A cheaper model can win a register axis outright, not
"acceptably close for the price". Two record consequences: a tie is written with
the instrument that found it, and where the cheaper tier *wins*, the entry's
reason is quality rather than cost. They select the same model today, which is
why the distinction gets dropped — and a cost-justified entry loses the next
budget review, while a preference-justified one survives it.

Corroborated from a fleet tree rather than from the video: a benchmark product
selects its judge on **spread**, the gap between the score it gives good and bad
answers, on the stated grounds that a narrow-spread judge cannot separate quality
from deflection at any threshold. Its cheapest candidate judge had respectable
error and the worst spread; its dearest failed by passing a factually wrong
answer in the middle of its range.

**`turn-classification` amended: a fourth axis.** Its three recurring axes — who
waits, blast radius, expected output shape — all describe how a call is
*consumed*. The fourth describes what it *produces*: whether the call decides what
the artifact should be (the plan, the audience read, the brief another call will
execute) or renders the surface a person receives. It is the axis that gets left
out because a single capable model doing both hides the seam; the seam appears the
moment the brief exists as text. The two classes want opposite ends of the roster
— the judgment call is short, rare and rewards capability; the rendering call is
long, frequent and rewards whatever produces the register the audience wants,
which measurement does not reliably place at the top tier.

Two guards, both learned from the fleet read: the split is real only when the
intermediate artifact is **explicit** and could be handed to a different executor
(a split asserted over one model's internal phases is a class with no call site),
and it is a product distinction rather than a prompt-engineering one. The
application against a managed project is the sharpest evidence for the axis: that
tree separates structured assessment from free-form text at the *contract* layer,
with the reason in a header comment, and then explicitly keeps one answer for
which provider — so a scoring pass, a background write gate and an interactive
chat turn share one model id and one global reasoning budget.

## Open leads (banked, with return conditions)

- **Baseline-separated hot-path overhead numbers.** The source publishes µs/op for
  scoring-only, scoring+event and scoring+event+export, and retracts its own earlier
  aggregate figure for not separating them. Relevant to `count-carries-predicate` at the
  benchmark layer. Return when a fleet project publishes a hot-path overhead number.

## 2026-08-31 - reference-index run

Touched by [[2026-08-31-voltagent-agent-papers]]. One amendment to
`failover-horizon` and its unusable-success enumeration, whose six listed forms are
**all** detectable by shape - empty, malformed, truncated, schema-violating. The seventh
form is a response that parses, validates, targets an available tool and is wrong, and
no check on the response alone can reach it.

The instrument came from **the baseline column of a paper whose own thesis failed**: its
internal-representation probe lost to its own black-box baselines on every model, and
the winner was agreement across repeated draws, canonicalized on tool name and
arguments - precision 1.0 at useful recall, no model internals, so it works against a
hosted candidate. Its price is the honest part, and is why the rung is usually missing
rather than unnoticed: n draws cost n times the tokens and n times the latency, paid
before the horizon closes.

Two cheaper alternatives were measured and rejected in the same wave: reading the
model's internal state scores worse, and asking the model its own confidence
discriminates barely better than a coin flip on genuinely agentic work while publishing
no bound on the confidently-wrong tail.

**Contention note.** A sibling held this subject for the whole run and was editing the
golden path plus adding a new technique. `failover-horizon.md` was untouched by them
(`git status`), so the amendment landed with zero collision and the golden path's
`techniques:` list was never opened. Subject-level contention is not file-level
contention, and `git status` is the finer instrument.

## 2026-09-02 - `/intake` portkey-gateway (run `intake-portkey-0902`, intake 2.1.1, Opus workers)

`failover-horizon` gained one paragraph on check cadence: input checks are idempotent per request and run once, output checks run per attempt, both on one shared budget (the budget half is storm-control`s). No fleet project admits the force - every project excludes `llm-agent/orchestration` by scope list - so this landing is corpus-only and was sequenced last.

## 2026-09-02 - intake ([[2026-09-02-gemini-3-8-flash]])

`effort-calibration` gained the substitution its re-measure cadence could not
see. The cadence triggers on a roster change "affecting the entry's tier"; a
point release replacing its predecessor **in the same tier, at the same price,
under an unchanged dial** trips none of it, and the entry goes on citing a
measurement taken against a different model.

That matters because **how hard a model reasons is a property of the model as
much as of the setting**, and vendors move it between versions deliberately -
this release note advertises extra reasoning steps and iterative tool calls as
a feature. Three consequences landed: same price per token is not same price
per task (the unit a rate prices is not the unit anyone budgets in); the term
that moves is reasoning tokens, usually billed as output and already dominant -
a fleet tree had measured hidden reasoning at 12.8x the visible answer on a
mid-tier model and 25.1x on a larger one; and the predecessor was explicitly
retained as the efficiency-first option, which makes the version ladder **a
second tier axis rather than an upgrade path**. Taking the newest by default
silently opts every cost-sensitive class into the dearer engine. Added
separately: where the effort parameter defaults to its top setting, an adopter
who sets nothing inherits the most expensive configuration of a model already
described as spending more - two compounding steps, neither a decision anybody
made.

The application is `node--effort-calibration` and it is a refusal, not an
adoption. The tree declined this bump in writing before the run arrived: a
dated live-roster measurement, the newest model excluded on a 503-under-load
property, a floating alias excluded citing this subject's own `model-identity`
rule, and the promotion rule "not by assuming it settled" in the header. It had
also already instrumented the exact term the release note describes, for its
own reasons. `applied: task`, `ab_verdict: unmeasurable`, instrument named -
one live roster pass with the repo's key, which is third-party spend this run
had no standing to authorize.

The subject's open edge: that table has no re-measure *cadence*, only an honest
date. A vendor shipping three releases of one tier in six weeks outruns an
unscheduled manual pass, and nothing in the tree will ask again.

## 2026-09-06 — `/intake` openclaude: the lane where the caller cannot be asked

Landed one amendment to `turn-classification`: **"When there is no call site to
ask"**.

`turn-classification` is a strong technique that rests on one premise it never
states, because in the systems it was forged from the premise always held: **the
caller is code**. Its § "The caller asserts the class" rejects content inference
on three grounds that remain correct (fragile, unauditable, inverts the
dependency), and its rule "an unclassified call fails loudly" locates the fault
at a call site. A single-user interactive client breaks the premise rather than
the rule — one call site, every class of work, and a human caller who will not
annotate a turn. The absence of an asserted class is the *normal* condition
there, so "fails loudly" has nothing to point at.

The amendment states the lane and what makes inference acceptable inside it,
which is deliberately **not** accuracy: abstain toward the expensive tier so the
error is a missed saving rather than a degraded answer, and publish that
direction where the feature is enabled; pin the decision for the whole turn so it
cannot flap across the turn's tool calls (the "one call, one class" rule restated
for a unit the user experiences as a turn); scope a fallback retry to failures a
different tier could plausibly fix; and record that the class was *inferred*, so
the retrospective question the technique cares about stays separable from the
prior one this lane adds — was the class right at all.

**Not applied — and the reason is the finding.** No project in the fleet routes
per turn by inferring from a human's input. `personas` carries the closest seam
and carries it *correctly*: `personaCore` is an explicit tier × effort selection
made by a person in a config panel, which is the caller-asserts contract with a
human in the caller's chair. `tracklight`'s agent asserts a model per action in
`action.toml`. Neither infers. *Return condition:* when a fleet project adds a
model choice made from the user's own input rather than an asserted class — the
first candidate is any command palette or chat surface that grows a cheap tier.

**Noted in passing, against the original technique rather than the amendment,
and not landed:** `tracklight/crates/agent/src/actions.rs:82` defaults an
action's model to a literal model name (`default_model() -> "sonnet"`), and
`ActionSpec.model` is a model string rather than a class. That is exactly the
decision rule "class names survive roster changes; tier assignments do not — if a
roster change forces call-site edits, model knowledge leaked into the callers".
It is a real seam for a *future* apply row on `turn-classification` proper; this
run did not open it because the run's landing was the amendment, and applying a
technique's pre-existing rule is a different row.

The subject's open edge from 2026-09-04 (the tier table has an honest date but no
re-measure cadence) is untouched and still open.

## 2026-09-06 - the first byte commits the verdict ([[2026-09-06-aws-agent-exposure]])

`failover-horizon` gained an amendment, and it is a **bounding of the subject's
own strongest claim** rather than an addition beside it.

The technique already owns the moment the first byte is released - it is where
substitution stops being free - and states two post-horizon options with the
insistence that there is no third: finish on the chosen candidate, or abort with
a stated, honest truncation. The finding is that the same instant does a second
thing the technique never mentions. On a transport that frames its outcome ahead
of its body, the status is committed before the first content byte and cannot be
revised, so the honest abort **presumes a channel that can carry the statement**.
Where the outcome lives in the status alone there is none: aborting is
expressible only as stopping, and stopping is spelled the same as finishing.

The rule is inapplicable rather than false, which is why every other Phase 6 hunt
read this as already-covered. It also bounds the unusable-success enumeration,
whose closing claim is that every form on it is detectable by **shape** and that
only a seventh form (well-formed but wrong) escapes, needing agreement across
repeated draws. A stream of **prose** that ends early escapes both: there is no
structure whose closing bracket is missing, so shape cannot see it; and the
content is *incomplete* rather than wrong, so resampling cannot either - each
draw would have to be complete to serve as the comparison.

The consequence worth carrying is that this form's remedy is the **cheapest** on
the page rather than the dearest, which inverts the technique's usual trade. No
held frame, no extra draw, no scanner - a fixed protocol cost, paid once, before
anyone knows it will be needed. That is precisely why it was missing from a list
organised by what a check can see: nothing can see it, and nothing needs to,
provided the contract was written to say so.

Applied to a consuming project as a **code A/B, verdict better**: a stream
consumer whose reader loop broke on stream end and set no verdict at all, so a
short stream rendered as "running" forever behind a 200. Arm A reached the
completion handler 0 times, arm B once with a failure; a control case carrying
the terminal event returned success in both arms, which is what isolates the
defect from the harness.
