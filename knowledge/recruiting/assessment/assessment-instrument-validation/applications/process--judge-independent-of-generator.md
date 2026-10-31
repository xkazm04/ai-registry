---
layer: application
type: application
subject: assessment-instrument-validation
technique: judge-independent-of-generator
stack: process
verified_on: 2026-10-31
---

# Measuring the judge seat, and a test that keeps it measured

`pipeline/jobfit/devcase/llm_judge.py` is the shared LLM-as-judge scaffold for the
Dev pipeline's evals. Its module docstring (`:19-32`) records the incident that
created it under the heading `JUDGE ≠ GENERATOR (the invariant this module now
owns)`:

> "Every caller used to hand `run_judge` the very provider that generated those
> artifacts (a bare `ClaudeCliProvider()`), so the gate was self-grading: the same
> engine, the same blind spots, marking its own homework."

The finding is tracked as `tiger finding devcase#1`
(`pipeline/jobfit/tests/test_devcase_judge_independence.py:8`), and the fix has
three parts, in the order the standard requires them.

## 1. A separate seat, and why routing alone is not independence

`resolve_judge_provider` (`:46-57`) resolves the judge through its own use case,
`devcase_judge`, so configuration can pin a different model for the judge than
for the generator — and so the judge's spend lands in the usage ledger a bare
provider bypassed. The docstring then refuses to claim more than it did: "with no
`KP_LLM_CONFIG` it is a MonitoredClaudeCli on the CLI default — same behavior as
the bare provider it replaces, but metered." The standard's warning that a
different prompt or a different route does not create a second grader is written
here as a limitation of the fix itself (`:30-31`): "Routing alone does not make
the judge independent — with no config both seats fall back to the same CLI
default."

Re-checked 2026-10-31 at kp `6edf5d7`: the limitation is fixed by default, and the two
docstrings quoted above now lag the code. The resolver's docstring reads "with no
`KP_LLM_CONFIG` it is the ClaudeCliAdapter on the CLI default" (`:52-53`), but the CLI
judge seat now carries its own default model, `JUDGE_CLI_MODEL = "claude-haiku-4-5"`
(`pipeline/jobfit/llm/capabilities.py:362`, `:398`), while the generator seats still ride
the CLI's own default. An out-of-the-box install therefore reports `independent: True`.
`TestJudgeSeatIsIndependentByDefault` (`test_devcase_judge_independence.py:226-290`) pins
it: the seats differ with no config and under a provider-only wildcard row, no other seat
gained a pinned model, the Anthropic judge default differs from the evaluate seat's, and an
operator who pins both seats to one model is still reported as self-grading.
`TestEvaluationRecordsTheJudgeSeat` (`:292`) pins that the evaluation bundle a reviewer
reads now carries both seat identities, not only the offline harness report.

## 2. Independence is computed per run, from the actual invocation

`provider_identity` (`:60-71`) builds a `provider/model` label off the live
object's attributes, and it makes the dangerous case *visible* rather than
guessing past it: a provider with no pinned model reports `default`, because "two
seats both on the CLI default are the same engine, which is precisely what must
not certify a gate."

`judge_independence` (`:74-87`) compares the two labels and returns
`{generator, judge, independent}`. It fails closed in both the standard's
directions — equal identities are non-independent, and an absent seat is
non-independent, "so nothing may claim it was" judged independently.

The caller wires it to what actually ran, not to intent
(`submission_eval.py:625-635`): the judge seat is resolved separately, and when
it is unavailable the run does not abort — it judges with the generator, writes
to stderr, and records `independent: False`.

## 3. It is printed beside every verdict it conditions

`_report_md` (`:584-594`) prints the seat identities and the flag on every judged
run, and on a non-independent run adds a block quote that tells the reader what
the number is worth:

> "**SELF-GRADING: the judge is the same engine that produced these artifacts**,
> so this quality/fairness reading shares its blind spots and does NOT certify
> the gate."

That is the standard's downgraded verdict rendered differently from a clean one,
rather than a flag buried in a log. The JSON output carries it too, as
`judgeIndependence` (`:639`).

## 4. Strict mode refuses to certify, and a test pins the refusal

`submission_eval.py:658-665`: when `--judge` ran and independence is False,
`--strict` exits non-zero with the two identities printed
(`"judge is not independent of the generator (claude_cli/haiku ==
claude_cli/haiku)"`). The scoping comment is the non-obvious half — the rule
fires "Only enforced when `--judge` actually ran: `--strict` alone certifies the
deterministic fairness/discrimination gates, which need no judge at all,"
otherwise every keyless CI run would fail on a judge it never used.

`test_devcase_judge_independence.py` is the standard's "pin the rule as a
contract in the test suite" done properly. `TestStrictRefusesASelfGradedGate`
(`:154-216`) stubs both seats and a fully-green signal block so that "the ONLY
variable is which model each seat reports", then asserts all three arms:
`test_self_graded_run_fails_strict` (exit 1, `SELF-GRADING` in the report),
`test_independent_run_passes_strict` (exit 0), and
`test_unjudged_strict_run_is_unaffected`. The identity cases above it
(`:76-115`) pin the subtle ones: two unpinned seats are self-grading
(`test_both_unpinned_is_self_grading`), and the same model reached through two
different providers *is* independent — a deliberate, arguable call the standard
would grade as weak independence rather than full.

## The neighbouring refusal: a degraded run cannot certify either

The same strict path counts silent fallbacks. `Row.fallback_reasons`
(`:207-210`, filled at `:252-256`) is populated only when an LLM step actually
*raised* — never on an intentional `--no-llm` run — and `--strict` fails on any
non-zero count
(`:650-651`) with the reason the technique gives for it: "a degraded provider
masquerading as a clean deterministic run". The report banner (`:531-536`) is
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
bound to what it judged. `calibrate.py:56-64` does exactly this for cached cases
— a cached artifact is reusable only when its stored `promptVersions` and model
tag match the current ones — so the pattern exists in the codebase and simply has
not been applied to the judge record.

Re-checked 2026-10-31 at kp `6edf5d7`: largely closed. `instrument_stamp`
(`submission_eval.py:455-476`) now binds every run to the prompt versions in force (case
eval, transfer, followups, commit reflection, tooling signal), the rubric dimensions and a
cast fingerprint, "so a stored report cannot be reused after a rubric/prompt/model change".
It is printed at the head of the report (`:529-530`) and emitted as `instrument` beside
`judgeIndependence` in the JSON (`:639`). The judge's own prompt carries no version and is
not in the stamp.

**Nothing checks the judge against human ratings.** The independent judge is
untested for agreement with a person on the same submissions; `calibrate.py:79-85`
concedes the point for the automated judge ("it's a breadth signal; the real bar
is the higher-vantage judge applied out of band"), which is an honest note rather
than a measurement.
