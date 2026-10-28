---
layer: application
type: application
subject: ci-execution-trust
technique: measure-apply-split
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@22
---

# A measure/apply split that had to leave the pipeline

Project `afterlife` (https://github.com/xkazm04/afterlife), read at `main` commit `009c7893`.
Agents open merge requests on target projects; each target's pipeline runs the agent's code and
tests and produces evidence; something then has to post the proof note, set labels, approve or
auto-merge, and append to a ledger. That is the measure/apply split, and this tree shows why a
split inside one pipeline was not enough once the measured party could edit the pipeline.

## The finding that moved the applier out

The first design held the bot token in the target project and applied from a target job. The
README records why that was withdrawn:
`gitlab/apply/README.md:10 "could be read by every job of an agent MR pipeline"`,
including any `.gitlab-ci.yml` the agent edits on its branch. The remedy was a separate project
that holds every write token and makes every write:
`gitlab/apply/README.md:5 "No write token enters a target"`, with target pipelines producing
evidence with `CI_JOB_TOKEN` and nothing else (`gitlab/apply/README.md:6-7`). This is the step
the subject's [per-call-write-token-handout](../techniques/per-call-write-token-handout.md)
generalises.

## The producing side holds nothing; the applying side executes nothing from the change

The README's invariant table is the split stated as testable promises
(`gitlab/apply/README.md:25-37`):

- the producing side holds no write token, and a test enforces it over the target example and
  every component (`gitlab/apply/README.md:29 "No target job can read a write token"`);
- the applier runs only its own CI config from its protected branch and never checks out,
  includes or runs a target's code
  (`gitlab/apply/README.md:30 "Never checks out, includes or runs a target's code or CI config"`);
- the applier trusts no computed result: it re-derives the Proof Block from raw evidence with its
  own pinned engine (`gitlab/apply/README.md:31 "Trusts nothing a target pipeline computed"`);
- a failed read stops that MR's writes, and a missing token degrades to report-only
  (`gitlab/apply/README.md:36 "Fails closed"`).

## The application is bound to the measured revision

The technique's "binding the application to the measured revision" is a single flag on each
write. The gate's approve and merge both pin the head the sweep read:
`gitlab/components/scripts/decide/apply-gate.mjs:94 "glab(['mr', 'approve', mr, '-R', repo, '--sha', sha]);"`
and `gitlab/components/scripts/decide/apply-gate.mjs:95 "'--auto-merge', '--sha', sha"`. A push
after the sweep read the head is therefore never approved or merged on the old head's evidence,
which the README spells out for the hands-off case (`gitlab/apply/README.md:206 "push after the sweep read the head is never merged"`).

## Inside the writer, one token per call

The writer holds four tokens — bot, policy, ledger, dispatch — and spawns a child script per
write. The orchestrator strips all four, under both their current and pre-rename names, from
every child it spawns
(`gitlab/apply/lib.mjs:117 "A child inherits none of them: its call hands it the one it writes with (F71)."`,
`gitlab/apply/lib.mjs:133 "filter(([k]) => !TOKENS.includes(k.toUpperCase()))"`), and each
writing call adds back its own (`gitlab/apply/lib.mjs:124 "export function tokens(...keys)"`).
On the child's side, a script told which token to write with dies before any read when that
token is unset, so the read token never writes in its place
(`gitlab/components/scripts/lib/repo-write.mjs:19 "is not set (named by --write-token-var): nothing committed"`);
the README records both closures (`gitlab/apply/README.md:162-168`, findings F88 and F71). The
fallback the technique warns about is still present for a person running a script by hand
without the flag (`gitlab/components/scripts/lib/repo-write.mjs:12 "Without the flag: AFTERLIFE_BOT_TOKEN when set"`),
which is the deliberate exception, not the sweep's path.

## Deviation

The applier's own workflow admits `web` and `trigger` pipeline sources
(`gitlab/apply/.gitlab-ci.yml:13 "schedule|push|web|trigger"`), both of which can carry pipeline
variables. The repository relies on the project setting that refuses pipeline variables and on
reading no value from them (`gitlab/apply/README.md:33 "Takes no value from pipeline variables"`),
and flags as unverified whether that setting also covers the triggers API. The technique's
stricter reading is to admit only the sources the applier needs — a schedule — so that the
safety does not rest on a setting whose reach is undocumented.
