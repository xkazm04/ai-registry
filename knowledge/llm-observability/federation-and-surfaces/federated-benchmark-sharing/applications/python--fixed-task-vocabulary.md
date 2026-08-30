---
layer: application
type: application
subject: federated-benchmark-sharing
technique: fixed-task-vocabulary
stack: python
status: forged
verified_on: 2026-08-30
verified_against: python@3.12
source: mlcommons/inference
---

# Python: MLPerf Inference's per-round benchmark vocabulary

MLPerf Inference inverts this subject's privacy assumption: many organizations
submit into one published table and every contributor is **named on the row**.
It runs a fixed vocabulary anyway — the clean test of what the closure buys once
fingerprinting is off the table. Read at `mlcommons/inference` @
`b66003e10e2db4b8c36a448b0545ec90fcc6e9e9` (2026-08-20), round **v6.1**
(repo-root `README.md:20`; no `VERSION` file — the round lives in the checker's
tables). Checker paths below are relative to `tools/submission/submission_checker/`.

## The vocabulary, and how it is versioned

`MODEL_CONFIG` (`constants.py:1`) is keyed by round — v6.1, v6.0, v5.0, v5.1 —
and each round redeclares the **whole** vocabulary, not a diff: v6.1's `models`
is a 21-name list opening at `constants.py:3`. "Version the vocabulary with the
schema" holds structurally, and the round key is itself closed: `--version` takes
`choices=list(MODEL_CONFIG.keys())` (`main.py:38-40`), so an unknown round dies
in argparse before a file is read — though its `default="v5.1"` (`main.py:39`)
lags the current round by two. The other enums are small and closed too:
`VALID_DIVISIONS` (3, `constants.py:1392`), `VALID_AVAILABILITIES` (3,
`constants.py:1393`), `SCENARIO_MAPPING` (5, `constants.py:1539-1545`), and one
result field per scenario per round (`constants.py:1573-1579`) — the aggregate
the table publishes is named by the vocabulary, not by the submitter.

## How an unknown name is treated: three different answers

The technique asks one contract — *any input returns a member*. MLPerf gives
three answers, by axis. **Scenario: rejected, with a message** — `check_scenarios`
(`loader.py:245-249`) diffs submitted scenario directories against the round's
required/optional sets; leftovers return as `unknown`, and `scenarios_check` logs
them and returns False (`checks/performance_check.py:125-131`).

**Division: silently skipped** — `if division not in VALID_DIVISIONS: continue`
(`loader.py:281-283`): a directory named anything else is not rejected, it is
*invisible*. No log line, no count; a whole submitter tree can vanish from the
summary with no evidence it existed.

**Benchmark: neither** — `get_mlperf_model` (`configuration/configuration.py:80-109`) tries
the official list, the round's alias table, a submitter-supplied mapping, then
four hardcoded substring guesses, and falls through to
`self.base["model_mapping"].get(model, model)` (`configuration/configuration.py:108`),
returning the unrecognized string itself. Total, but not closing: its range is
not the vocabulary — the contract breaks at exactly the line the technique says
to unit-test.

## The sharpest finding: the closed division rejects by crashing

Because a non-member comes back, `get_required` finds it absent and returns
`None` (`configuration/configuration.py:111-115`), which `check_scenarios` passes into
`lower_list` (`loader.py:249`) — a comprehension over its argument
(`utils.py:118-119`). An unknown benchmark name under `closed/` raises
`TypeError: 'NoneType' object is not iterable` out of `Loader.load()`, which
`main()` does not guard (`main.py:172-176`). The run aborts; rows already walked
are lost. A code defect, not a technique defect — and it fires on a *legitimate*
name: the v6.1 alias table still maps `"ssd-resnet34": "retinanet"` and
`"llama3_1-405b": "llama3.1-405b"` (`constants.py:232-239`) onto targets the
round removed, and repo-root `README.md:47` says outright that `llama3.1-405b` is "not
part of the v6.1 model list". A submitter using a documented historical alias
gets a stack trace, not a vocabulary error. The alias table is versioned per
round in form only — its targets are never re-checked against that round's
`models`.

## Both labels ship, side by side

The technique says the contributor never sends a raw name. The CSV carries
**two** columns: `row["Model"]` is the raw submitter directory name,
`row["MlperfModel"]` the classified one (`results.py:83-85`) — and since the
fallthrough is identity, the two are equal whenever classification failed, so a
reader cannot tell "mapped to X" from "not in the vocabulary". Grouping by
`MlperfModel` then yields singleton per-submitter groups that look like members.
Per-contributor extensibility, which the technique says to resist hardest, is
granted but fenced to one division: `model_mapping.json` loads only when
`division == "open"` (`loader.py:290-294`), and the scenario checks run only for
closed/network (`loader.py:336-338`) — open is a deliberate free-text channel.

## Findings against the technique

1. **The closure buys comparability, not privacy.** The technique's "when not to
   use it" caveat (signed, attributed contributions may carry a richer
   vocabulary) is confirmed in the strongest form — MLPerf keeps the closure
   anyway, for the merge. Its *rationale* is narrower in scope than its rule.
2. **The identity-fallthrough classifier is the defect the technique predicts.**
   Proposal: state the contract as `range ⊆ vocabulary`, not "returns something
   for any input" — MLPerf's function is total in type only.
3. **Which field is the fingerprint inverts with the trust model.** MLPerf
   pseudonymizes the *system* name, not the task name: `generate_private_id`
   hashes it to `adjective-noun-hex` (`utils.py:360-365`) over 64 × 64 × 2^16 =
   268,435,456 values, cached to `privateid.json` (`loader.py:325-327`) — a
   pseudonym, not a coarsening, so still a perfect cross-round join key.
   Unreleased hardware is the secret in a named federation; the task label is
   public by design.
4. **Raw artefacts are required here, not forbidden.** `mlperf_log_accuracy.json`
   is in `REQUIRED_ACC_FILES` (`constants.py:1404-1409`), merely capped at
   `MAX_ACCURACY_LOG_SIZE = 10 * 1024` (`constants.py:1492`, enforced at
   `checks/accuracy_check.py:249`) — a direct contrast with the sibling technique
   `aggregate-only-digests`, same cause: named contributors are audited.

## Executed evidence

Python 3.12.1, harness importing the checker's tables directly (`Config("v6.1")`,
`Loader.check_scenarios`, `Loader.load()`) over synthetic trees; full `main.py`
needs real loadgen logs and could not run end-to-end on stubs.

- `get_mlperf_model`: `"resnet50" -> "resnet"`; `"ssd-resnet34" -> "retinanet"`;
  `"claims-triage-v3" -> "claims-triage-v3"`; `"" -> ""`;
  `"../../etc/passwd" -> "../../etc/passwd"`. n = 7 inputs, all accepted.
- `main.py --version v7.0` → `error: argument --version: invalid choice: 'v7.0'`.
- `check_scenarios("llama3.1-8b", …, ["Batch"])` → `unknown=['batch'], ok=False`.
- `check_scenarios("claims-triage-v3"|"ssd-resnet34", …, ["Offline"])` → both
  `TypeError: 'NoneType' object is not iterable`.
- `Loader.load()` over `closed/` + `internal/`: yielded only the `closed` row;
  `internal` produced no output of any kind. Adding
  `closed/TestOrg/results/SysA/claims-triage-v3/` made the same walk raise the
  `TypeError` before yielding *anything* — the valid `llama3.1-8b` row was lost
  because `claims-triage-v3` sorts first. The same name under `open/` instead:
  yielded normally, `check_scenarios=True` (vacuous — the check was skipped).
- Negative claim, grep-scoped: `grep -rn "VALID_SCENARIOS" submission_checker/`
  → no matches (exit 1). No global scenario list exists; validity is only ever
  relative to a `(round, model, system_type)` triple.
