---
layer: application
type: application
subject: judge-contract-design
technique: bias-counterbalancing-instructions
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: the LightTrack judge prompt contract

LightTrack's prompt templates (`crates/engine/src/prompts.rs`) are a
worked example of the two-layer discipline — every documented judge bias
countered once in prompt text and once in structure — and of the mixed-
rubric narration rules the prompts must uphold.

## The pairwise contract (`prompts.rs:195-226`)

The pairwise prompt carries the full instruction set in one block:
content-only framing ("decide which answer is better on the MERIT OF ITS
CONTENT"), anti-verbosity with the asymmetry stated ("do NOT prefer an
answer merely for being longer or more verbose"), anti-provenance
("ignore … which system produced an answer"), the anti-position clause
("The A/B ordering is arbitrary and must not influence you"), and the tie
outlet ("If they are equally good (or equally bad), answer \"Tie\"") —
with the doc comment (`prompts.rs:192-194`) recording the structural half:
*the caller counterbalances A/B*, i.e. the instruction is paired with
order-swapping outside the prompt, so residual position bias is measured,
not merely discouraged.

## The rubric contract (`prompts.rs:246-271`)

The single-case rubric prompt states "Penalize unnecessary length; do not
reward verbosity. Judge only the output's quality for the input …; ignore
which model produced it" — and then narrates dimensions *with anchors*
(`narrate_dims`, `prompts.rs:329-339`), which is itself a verbosity
counterbalance: anchored observable levels give length nothing to attach
to. Only LLM-kind dimensions are narrated; the `dim_props` filter
(`prompts.rs:138-157`) builds the response schema from the same filtered
list, with the doc comment naming the reason a mechanical check never
reaches the judge: asking would "both waste tokens and let its opinion
double-count against the mechanical verdict" (`prompts.rs:122-124`,
`243-245`). Prompt and schema share one filter so they cannot drift into
asking for different shapes.

## The batched contract (`prompts.rs:281-326`)

Batching adds the fourth bias — cross-case comparison — and the template
counters it at CRITICAL emphasis (`prompts.rs:310-313`): cases "are
unrelated and must be scored INDEPENDENTLY … A case must receive the same
score it would receive if it were the only case here. The order of the
cases is arbitrary and carries no meaning." The structural pair is
documented at `prompts.rs:283-291`: the caller *rotates case order between
samples* so any residual position effect surfaces as cross-sample
disagreement — a quantity the aggregation already measures
(`crates/engine/src/judge.rs:404-410`) — instead of hiding as a constant.
Verdicts are matched by an echoed `case_id`, never by position
(`prompts.rs:159-190`), so a dropped or reordered case fails *that* case
rather than shifting every later score onto the wrong candidate.

## The honesty rules the prompts feed (`docs/BENCHMARK_FRAMEWORK.md:104-153`)

The framework doc states the contract rules the templates implement:
pass = weighted overall ≥ threshold AND no gating dimension below its
floor (`:107`); mechanical kinds run locally at zero tokens through the
same weighting pipeline (`:109-114`); "Not narrated, not double-counted"
(`:141-142`); "Agreement is an LLM-only statement" — folding deterministic
dimensions in "would drag every rubric toward 1.0 and hide the judge's
real instability" (`:143-146`); mechanical reasoning is auditable
("numeric: expected `42`, got `41.6`, tolerance 0.1 → fail", `:147-148`);
operator errors are loud, "never a candidate silently scored 0"
(`:149-150`); and an all-deterministic rubric makes no provider call:
`samples = 0`, `cost_usd = null`, `scored_by = "deterministic"`
(`:151-152`). The aggregation in `judge.rs:286-433` closes the loop:
per-sample overalls over judged dimensions only, floors read off
per-dimension `floor_hit`, agreement over the samples that parsed, and a
zero-parse run surfaced as an error with the raw output rather than a
confident 0.0 (`judge.rs:353-362`).

## Upward lesson

The template treats the tie outlet as part of anti-position hygiene — a
judge denied "Tie" must break equal cases with a bias — and versions the
instruction text with the engine, not per call site, so a reworded clause
is a contract change rather than silent drift.
