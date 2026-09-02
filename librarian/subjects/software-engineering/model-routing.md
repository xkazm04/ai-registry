---
subject: model-routing
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# model-routing

First touch by the librarian's notes: [[2026-08-25-19-claude-code-mistakes]] - /intake run 10. The subject predates the notes (forged 2026-08-18, reconciled against a public gateway as `process--candidate-ranking`).

## State

10 techniques, 4 applications (process, rust). Golden path carries the routing stance in ten numbered consequences.

## 2026-08-25 - /intake run 10

- New technique `cache-continuity`: the incumbent model's cached prefix as a routing term; break-even derived from the vendor's published multipliers (write 1.25x, read 0.1x). Registered as consequence 10 in the golden path.
- `process--candidate-ranking` amended: the sticky-session pin now has a sourced *cost* rationale beside the note that its quality rationale is unsourced.
- New application `rust--cache-continuity`: a companion tree that is cache-safe by construction (one prompt family per tier, conversation pinned on resume) for a quality reason its authors recorded - convergence noted.

## Open leads (banked, with return conditions)

- **Turn warmth as a routing input.** No tree in the fleet reads time-since-last-turn before routing. Return when a consumer's ledger shows write-cost spikes on idle-resumed conversations.

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
