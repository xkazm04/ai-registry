---
layer: application
type: application
subject: model-and-effort-selection
technique: cheapest-sufficient-tier
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: a skill benchmark that picks the cheapest sufficient tier

A benchmark of eight agent skills against three real repositories (a Next.js product, a
Rust workspace, a Python agent platform) measured one run per cell: eight skills × three
repositories × fifteen GPT configurations, with Claude configurations added afterwards.
Configurations were `gpt-5.5` at low/high/xhigh and `gpt-5.6-sol`, `gpt-5.6-terra`,
`gpt-5.6-luna`, `gpt-6-astra` at low/high/max, run through the Codex CLI on a flat-rate
seat; verdicts came from two blind judges, `claude-opus@high` and `codex-gpt-6-astra@high`.

**All numbers below are one run per cell over at most three repositories, measured
2026-09-15/16, and the grid is incomplete** — the max tier was cut off by a seat limit at
40 of 120 GPT cells outstanding. They describe this corpus; they are not a significance
test and they are not a claim about the models in general.

## What the rule selected

The harness computes `best` (highest mean among configurations that hard-passed on every
repository) and `cheapest_enough` (the lowest-effort configuration within 1.0 of best
everywhere). They differ on three of the six skills that produced a recommendation:

| Skill | Best | Cheapest sufficient | Gap |
|---|---|---|---|
| test-before-commit | `codex-gpt-5.6-sol@high` 8.83 | `codex-gpt-6-astra@high` 8.67 | 0.16 |
| scan-sweep | `codex-gpt-5.6-sol@max` 8.00 | `codex-gpt-5.6-sol@low` 7.50 | 0.50 |
| consult | `codex-gpt-5.6-sol@high` 7.67 | `codex-gpt-5.6-terra@low` 7.50 | 0.17 |
| conform | `codex-gpt-5.5@high` 7.67 | `codex-gpt-5.6-terra@high` 7.50 | 0.17 |
| explorer | `codex-gpt-5.6-sol@max` 8.00 | same | — |
| agent-guidance-bootstrap | `codex-gpt-5.6-sol@high` 7.50 | same | — |

The two that pay for the top tier (`explorer`, `agent-guidance-bootstrap`) are the ones
where no cheaper configuration cleared the bar everywhere — the rule did not "prefer
cheap", it found nothing cheaper that qualified.

`scan-sweep` is the clearest case for the rule: `gpt-5.6-sol@low` scored 7.5 against
`@max`'s 8.0 while spending roughly a tenth of the reasoning tokens (e.g. on the Rust
workspace, 2,024 tokens at low against 25,070–33,022 at the top tiers) and finishing in
minutes rather than tens of minutes.

## Where the mechanical bar refused to recommend anything

Two skills produced **no** recommendation, and this is the rule working rather than
failing:

- `tiger`: no configuration hard-passed on all three repositories. On the Next.js product
  every GPT configuration at every tier committed the vault the repository's ignore rules
  exclude (see the tier-inversion application beside this one).
- `ci-gate-check`: no configuration produced keepable, hard-passing output everywhere. On
  the Rust workspace four of five runs at high effort reported "safe to push" while the
  repository's own required secret-scanning job was red; on the Python platform four of
  four low-effort runs reported "do not push" while the gates were green, because the
  skill's stage table runs the dependency-install step last.

Publishing "no default, and here is what each candidate broke" was worth more than naming
the least-bad configuration: both failures turned out to be defects in the skill's wording,
reproduced across families, and both are now fix requests against the skill rather than
procurement advice.

## Cost in the unit that binds

The seat is flat-rate, so the tier's price appears as wall-clock and allowance, not money.
Measured on this corpus: `gpt-6-astra` consistently spent the fewest reasoning tokens
(often 1–5k where the `gpt-5.6` family spent 10–17k at the same tier) and won several
token tie-breaks; the `gpt-5.6` family at the top tier ran 30–47 minutes per run, and one
`gpt-5.6-luna@max` run hit the harness's 60-minute ceiling with 19 commits and was
therefore not counted as a finished run at all. On 2026-09-16 the shared GPT seat hit a
weekly limit with 40 cells outstanding, which is the allowance cost of the top tier
arriving as a schedule slip rather than an invoice.
