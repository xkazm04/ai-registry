---
layer: application
type: application
subject: assessment-instrument-validation
technique: judge-independent-of-generator
stack: process
---

# Measuring the judge seat, and a test that keeps it measured

`pipeline/jobfit/devcase/llm_judge.py` is the shared LLM-as-judge scaffold for the
Dev pipeline's evals. Its module docstring (`:20-33`) records the incident that
created it under the heading `JUDGE ≠ GENERATOR (the invariant this module now
owns)`:

> "Every caller used to hand `run_judge` the very provider that generated those
> artifacts (a bare `ClaudeCliProvider()`), so the gate was self-grading: the same
> engine, the same blind spots, marking its own homework."

The finding is tracked as `tiger finding devcase#1`
(`pipeline/jobfit/tests/test_devcase_judge_independence.py:13`), and the fix has
three parts, in the order the standard requires them.

## 1. A separate seat, and why routing alone is not independence

`resolve_judge_provider` (`:46-58`) resolves the judge through its own use case,
`devcase_judge`, so configuration can pin a different model for the judge than
for the generator — and so the judge's spend lands in the usage ledger a bare
provider bypassed. The docstring then refuses to claim more than it did: "with no
`KP_LLM_CONFIG` it is a MonitoredClaudeCli on the CLI default — same behavior as
the bare provider it replaces, but metered." The standard's warning that a
different prompt or a different route does not create a second grader is written
here as a limitation of the fix itself (`:31-33`): "Routing alone does not make
the judge independent — with no config both seats fall back to the same CLI
default."

## 2. Independence is computed per run, from the actual invocation

`provider_identity` (`:60-72`) builds a `provider/model` label off the live
object's attributes, and it makes the dangerous case *visible* rather than
guessing past it: a provider with no pinned model reports `default`, because "two
seats both on the CLI default are the same engine, which is precisely what must
not certify a gate."

`judge_independence` (`:74-89`) compares the two labels and returns
`{generator, judge, independent}`. It fails closed in both the standard's
directions — equal identities are non-independent, and an absent seat is
non-independent, "so nothing may claim it was" judged independently.

The caller wires it to what actually ran, not to intent
(`submission_eval.py:489-497`): the judge seat is resolved separately, and when
it is unavailable the run does not abort — it judges with the generator, writes
to stderr, and records `independent: False`.

## 3. It is printed beside every verdict it conditions

`_report_md` (`:451-461`) prints the seat identities and the flag on every judged
run, and on a non-independent run adds a block quote that tells the reader what
the number is worth:

> "**SELF-GRADING: the judge is the same engine that produced these artifacts**,
> so this quality/fairness reading shares its blind spots and does NOT certify
> the gate."

That is the standard's downgraded verdict rendered differently from a clean one,
rather than a flag buried in a log. The JSON output carries it too, as
`judgeIndependence` (`:503`).

## 4. Strict mode refuses to certify, and a test pins the refusal

`submission_eval.py:522-529`: when `--judge` ran and independence is False,
`--strict` exits non-zero with the two identities printed
(`"judge is not independent of the generator (claude_cli/haiku ==
claude_cli/haiku)"`). The scoping comment is the non-obvious half — the rule
fires "Only enforced when `--judge` actually ran: `--strict` alone certifies the
deterministic fairness/discrimination gates, which need no judge at all,"
otherwise every keyless CI run would fail on a judge it never used.

`test_devcase_judge_independence.py` is the standard's "pin the rule as a
contract in the test suite" done properly. `TestStrictRefusesASelfGradedGate`
(`:120-184`) stubs both seats and a fully-green signal block so that "the ONLY
variable is which model each seat reports", then asserts all three arms:
`test_self_graded_run_fails_strict` (exit 1, `SELF-GRADING` in the report),
`test_independent_run_passes_strict` (exit 0), and
`test_unjudged_strict_run_is_unaffected`. The identity cases below it
(`:42-79`) pin the subtle ones: two unpinned seats are self-grading
(`test_both_unpinned_is_self_grading`), and the same model reached through two
different providers *is* independent — a deliberate, arguable call the standard
would grade as weak independence rather than full.

## The neighbouring refusal: a degraded run cannot certify either

The same strict path counts silent fallbacks. `Row.fallback_reasons`
(`:184-189`, filled at `:222-226`) is populated only when an LLM step actually
*raised* — never on an intentional `--no-llm` run — and `--strict` fails on any
non-zero count
(`:513-514`) with the reason the technique gives for it: "a degraded provider
masquerading as a clean deterministic run". The report banner (`:405-409`) is
blunter: "the reliability and gates below reflect the DETERMINISTIC baseline, not
the LLM path being certified. Treat as NOT green." Without this, an all-fallback
run reads as 100% reliable, because the deterministic templates pass every
structural validator.

## Deviations

**Independence is binary, not a spectrum.** The flag is a string inequality
(`gen_id != judge_id`), so a generator and judge from the same family and
generation — two checkpoints of one vendor's line — report `independent: True`
with nothing marking the reading as weak. The standard asks for the position on
the spectrum to be reported; the repo reports only same-or-not.

**Independence is not stamped with the rubric version.** The run prints the two
seats but not the prompt versions in force, so an independence result cannot be
bound to what it judged. `calibrate.py:60-64` does exactly this for cached cases
— a cached artifact is reusable only when its stored `promptVersions` and model
tag match the current ones — so the pattern exists in the codebase and simply has
not been applied to the judge record.

**Nothing checks the judge against human ratings.** The independent judge is
untested for agreement with a person on the same submissions; `calibrate.py:79-85`
concedes the point for the automated judge ("it's a breadth signal; the real bar
is the higher-vantage judge applied out of band"), which is an honest note rather
than a measurement.
