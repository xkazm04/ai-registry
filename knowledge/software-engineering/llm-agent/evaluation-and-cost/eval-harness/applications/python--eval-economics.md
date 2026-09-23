---
layer: application
type: application
subject: eval-harness
technique: eval-economics
stack: python
status: forged
verified_on: 2026-09-23
verified_against: python@3.12
---

# A live intake sweep that learned durability after its first kill (kp)

kp is a hiring product. Its intake agent interviews a requestor about a role and turns
the dialog into a job brief. The sweep evaluated here
(`pipeline/jobfit/eval/intake_eval.py`) drives that agent through the real HTTP API,
with a second model playing the requestor, one scenario per job description. A scenario
is called a "role", and it is graded by `check_dialog`. `verified_against` is the Python
3.12 that every CI workflow pins (`.github/workflows/ci.yml:45`). Read at `aaf1876e`.

## The cost profile that made the section necessary

The repository's own guide states it: one role is about eight minutes of provider calls
live, "so 50 serial roles is most of a day" (`docs/development/testing-and-evaluation.md:445`).
Before `6b7a82b65` (2026-09-08) the sweep was serial and wrote its record at the end, so
a killed sweep left an empty dump directory and every finished dialog was lost. The
commit added concurrency and incremental dumps together.

## Durable per cell

- `_write_run_json` (`intake_eval.py:364`) rewrites `run.json` after every role, through
  a temp file and `os.replace` (`:381`). Its docstring gives both reasons: a killed sweep
  used to lose hours of live dialog, and "a torn rewrite is worse than no file", because
  the resume path would discard it and lose the same hours a different way.
- The guard test is at the seam, not on the final file.
  `test_run_json_is_written_after_each_role_not_at_the_end`
  (`pipeline/jobfit/tests/test_intake_eval.py:559`) reads the record from inside each
  role's server call and asserts that role 1 saw no file and every later role saw all
  earlier rows already persisted. The at-the-end form fails it.
- `--resume` (`intake_eval.py:683`) skips roles recorded as complete, and the report is
  composed from all rows, restored ones included (`test_resume_skips_recorded_roles`,
  `:486`, and `test_resume_after_a_kill_finishes_the_remaining_roles`, `:593`). A run
  passes only if every role is present and the wall budget did not stop it.

## Concurrency without reordering

`--workers N` (`:694`) runs roles on a thread pool (`:564`), each worker with its own
HTTP client and persona provider. Every finished role is recorded under a lock and
persisted before the next one starts. Rows are stored by the role's declared index and
reported in that order, not in completion order. `--wall-minutes` stops new roles from
starting after the budget and lets running ones finish. In-process mode stays serial on
purpose, because there the agent's engine runs inside the harness process.

## Where it departs from the technique

**The resume key is the scenario name alone.** `_load_previous` (`intake_eval.py:315`)
restores every row marked complete, matched by name, and checks nothing about the
build, the server or the provider that produced it. A sweep resumed after a change to
the agent's prompt reports old-prompt and new-prompt dialogs in one table, under one
pass count. The run record already carries `mode`, `cap` and `workers`. None of them is
compared on resume.
