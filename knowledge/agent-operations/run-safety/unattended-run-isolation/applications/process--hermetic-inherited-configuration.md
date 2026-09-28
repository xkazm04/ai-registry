---
layer: application
type: application
subject: unattended-run-isolation
technique: hermetic-inherited-configuration
stack: process
status: forged
verified_on: 2026-09-27
applied: code
ab_verdict: better
---

# Process: a benchmark's "no tools" call loaded 25 tools and three hooks

Measured 2026-09-27 on a memory benchmark that drives its consumer and judge through an
agent CLI in headless mode. Its own description says every call runs with a replaced system
prompt, no session persistence and **no tools**, from an empty temporary directory "so no
project instruction file leaks into the system prompt". The argv said nothing about tools
or settings.

## What one call actually loaded

The instrument was the CLI's initialization record, captured from its streaming output
with hook events included. It came from one call on the judge's model at low effort, with a
7-word prompt and a 5-word system prompt:

| | as the harness called it | isolated |
| --- | --- | --- |
| built-in tools | 25 | 0 |
| skills | 30 | 0 |
| plugins from user settings | 1 | 0 |
| user hooks fired | 3 (session start, prompt submit, stop) | 0 |
| input tokens | 23,296 | 497 |

The directory did what it was meant to: no project file loaded. Everything user-level
loaded anyway. Two effects:

- **Inward.** Every consumer and judge call read about 22,800 tokens of tool definitions
  and skill listings the benchmark never declared.
- **Outward.** The operator's hooks, installed so a desktop app can follow their own
  sessions, fired on every call. The prompt-submit hook posted each prompt, including the
  memory context under test, to that app's local endpoint. The app dropped them, because
  the directory matched none of its sessions. That was a property of the receiver, not of
  the harness.

## The fix

- **One isolation profile in the argv builder.** It lists no built-in tools, loads no
  settings sources, connects only tool servers named on the command line (none), and
  disables skills. Every call goes through that builder.
- **The profile is in the cache key.** The cache is content-addressed by model, system
  prompt and prompt, and re-runs, re-judges and resumed rungs are free because of it.
  Without the profile in the key, the first run after the fix would have replayed the
  old configuration's replies as isolated results.
- **A check with its own positive control.** It makes two real calls, isolated and without
  the flags. It fails if the isolated call loads anything, and it calls a pass
  uninformative if the control loads nothing either. On the first run the control loaded
  tools, skills, a plugin and hooks, and the isolated call loaded none.
- **A backlog entry on what the earlier numbers mean.** Arms within a round shared the
  leaky configuration, so their pairing holds. An absolute score compared across the fix
  does not.

The CLI's fully hermetic mode was not usable here. It reads no subscription credentials,
and this benchmark runs on a subscription. The layers were cut by their own flags instead.

## An earlier case of the same shape

Found 2026-09-19 in the same fleet. A pre-push hook exports the repository path to its
children. Test suites that create scratch repositories inherited it, and when the push ran
from a linked worktree that path was absolute. The fixtures' version-control commands acted
on the real repository whatever their directory:

- one checkout was set bare;
- a fixture commit was pushed;
- another repository's identity was overwritten, and for weeks its genuine commits carried
  the fixture's author name.

The fix was to drop the version-control variables from the test runner's environment.
Every other test suite that creates repositories was left unexamined.
