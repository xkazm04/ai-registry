---
subject: model-routing
domain: software-engineering
last_touched: 2026-09-04
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
