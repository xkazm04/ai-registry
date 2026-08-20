---
layer: application
type: application
subject: conformance-checking
technique: pass-ratio-comparability
stack: process
status: forged
verified_on: 2026-08-20
---

# "Score semantics (read before comparing scores)" as a shipped spec section

The strongest realization of this technique in Ascent is not code — it is a
section of prose the standard ships to every adopting repository.
`src/lib/standard/spec.ts:128-144` builds `.ai/SPEC.md`, and gives the
score its own heading, titled with an instruction: **"Score semantics (read
before comparing scores)"**.

## What the section says

> The score is a **weighted pass ratio over the findings the run happened to
> emit**, not a fixed rubric: `score = round(100 × Σ weight / findings)`
> with weights `pass = 1`, `warn = 0.5`, `fail = 0`. Because the denominator
> is the emitted finding list, the score is only comparable **between runs
> with the same shape**.

It then enumerates the shape variables, each of which is a real way the
denominator moves:

- `--run` adds one pass/fail finding *per capability*, so the same repo
  scores differently with and without it. The spec's instruction is to
  "pick one mode for CI and keep it" — the comparability rule expressed as
  an operational commitment rather than a caveat.
- Repos with no hooks or CI skip the per-control wiring findings entirely.
- A missing manifest is a *single* finding (score 0), while one fail among
  many passes scores high — the non-monotonicity at the bottom of the range,
  stated in the spec rather than discovered by a reader.

And the publication rule, in one line: "Treat `fails` / `warns` as the
headline numbers for trends; the percentage is a display heuristic."

## Why shipping it as prose is the right move

The generator repeats the same caution twice more — in the doctor's usage
banner (`doctor.ts:16`, "only compare scores from same-shaped runs") and at
the scoring line itself (`doctor.ts` just below the checks, where the weight
table is defined). Three copies, deliberately: the caution has to be
visible wherever the number is, because a caution that lives only in
documentation is a caution nobody reads at the moment they are comparing two
percentages.

The same section also documents the execution budget ("`--run` executes each
capability with a 180-second timeout, so a legitimately slower command is
reported as FAIL") — a denominator-relevant fact, since a timeout converts a
pass into a fail rather than into an unable-to-check.

## The deviation worth naming

The reference runner scores `warn = 0.5` over *all* emitted findings, and
does not maintain an explicit unable-to-check bucket: the two places where
the checker correctly declines to judge — version-control history absent for
the never-commit scan, history absent for a freshness comparison — emit **no
finding at all**. That is the right verdict (no false failure) but it makes
the exclusion invisible in the summary: the reader cannot see how many
clauses went unchecked, only that the percentage is what it is. The
standard here is the stricter one: emit the unchecked clause as its own
outcome, exclude it from both halves of the ratio, and print the count
beside `fails` and `warns` — the shape of a run should be legible from its
summary line, not reconstructed from what is missing.

The spec also closes with the portability clause that makes the whole
arrangement honest: "A reimplementation in another language is conformant if
it performs checks 1-6 against this spec. The check *contract* is
language-neutral." A score is only defensible when a second implementation
could produce it.
