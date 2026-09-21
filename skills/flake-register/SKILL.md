---
name: flake-register
description: "Quarantine an intermittently failing test as tracked debt - owner, cause, expiry - instead of deleting it or leaving it to rot. Use before muting or skipping any test, and on a schedule to review the register."
category: testing
memory: project
version: 0.4.0
tags: flaky, quarantine, register, debt, review
argument-hint: "[test-id | review]"
---

# Flake register

Deleting a flaky test converts a report into silence at exactly the place visibility
existed. Leaving it red trains everyone to ignore red. Muting it without a record is
deletion with extra steps and a slower fuse.

The register is the third option: the test is quarantined, and the quarantine is an entry
with an owner, a suspected cause, and an expiry. Debt, not amnesty.

## When to use

- Before muting or skipping any test, for any reason.
- When a failure did not reproduce locally and looks intermittent.
- On a schedule - the review pass is half of this skill and the half that gets skipped.

## Before you quarantine: is it actually flaky

Three things fail intermittently and only one of them is a flaky test.

- **The test is flaky.** Ordering dependence, shared state between tests, a time or
  timezone assumption, a real sleep, an unawaited async operation.
- **The harness is flaky.** A port collision between parallel workers, a fixture rebuilt
  when it should have been copied, a resource not cleaned up by the previous run.
- **The product is flaky.** A genuine race, a retry that is not idempotent, an ordering
  assumption in real code.

The third is a product defect that a test caught. **Escalate it, do not quarantine it.**
Quarantining a real race is the most expensive mistake in this area: the defect stays, and
the one thing that would have caught it in future is now muted.

Evidence beats impression. Before quarantining, look at run history for this test:
how often did the outcome change on the same code, over how many runs? Two failures in a
week is not a pattern, and a test that fails every time is broken, not flaky.

## Choose the form

| form | behaviour | use when |
| --- | --- | --- |
| muted | still runs, result recorded, does not block | almost always |
| skipped | does not run at all | destructive, hangs, or costs real money on failure |

**Default to muted.** A muted test keeps producing the history that will eventually
diagnose it. A skipped test produces nothing and is indistinguishable from a deleted one
within a month. Choosing `skipped` requires a recorded reason.

## The entry

One entry per test, in a register file the repo keeps under version control - a single
markdown or data file, not scattered comments in test sources.

```
- test: auth/session.spec.ts > refreshes an expired token
  form: muted
  owner: <a person, never a team>
  entered: 2026-08-21
  expires: 2026-09-21
  cause: suspected - test. Shared token fixture not reset between workers.
  evidence: 6 outcome changes in 40 runs on main, 2026-08-07..2026-08-21
```

Every field is required and each one is doing work:

- **owner** - a named person. An unowned entry is never reviewed.
- **expires** - what makes this debt. Default 30 days. On expiry it is escalated, never
  silently extended.
- **cause** - which of the three, marked as suspected until confirmed. Forces the
  is-it-the-product question to be asked at entry rather than never.
- **evidence** - the count with its window and its branch. "It's flaky" is not evidence;
  "6 outcome changes in 40 runs on main over 14 days" is.

## The review pass

Run this on a cadence. It is the half that decides whether the register is a process or a
graveyard.

For each entry:

1. **Expired?** Escalate to the owner. Do not extend without a new expiry date and a
   reason recorded on the entry.
2. **Cause confirmed as product?** Move it out of the register into the normal defect
   track, today.
3. **Stable for a full window?** Release it: unmute, and record what the cause turned out
   to be. **One green run is not a window** - releasing on a single pass is how the same
   test enters the register three times a year.
4. **Fixed?** Remove the entry and record the cause.

Then report the two numbers that matter:

```
register: 7 entries (was 5 four weeks ago, trending up)
oldest:   auth/session.spec.ts, 94 days
expired:  2 entries past expiry, owners notified
ceiling:  7 of 10
```

**Age of the oldest entry is more diagnostic than size.** Forty entries none older than a
fortnight is a working process. Six entries with one at fourteen months is a broken one.

## The ceiling

Set a maximum register size for the repo and treat breaching it as a stop-the-line event
for that suite. Without a ceiling the register absorbs every hard problem and the suite
quietly stops certifying anything, while still being green.

## Rules

- Never delete a flaky test. Quarantine it or fix it.
- Never quarantine as part of making a build green. That is a build-fixing shortcut and it
  needs a human decision, separately, on its own merits.
- Never quarantine a suspected product race. Escalate.
- Every entry has an owner, an expiry, a suspected cause, and counted evidence.
- Prefer muted; `skipped` needs a recorded reason.
- Release only after a stable window, and record what the cause turned out to be.
- Retries record the original failure. A retry that hides it destroys the only signal this
  skill runs on.

## Related

- `ci-triage` - where a non-reproducing intermittent failure arrives from.
- `test-before-commit` - the loop that keeps new tests from joining the register.
- Knowledge: `test-harness` (flake-lifecycle, isolation-lanes, long-lane-certification),
  `machine-paced-delivery` (proposal-not-push).

---

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill flake-register --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"flake-register","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
