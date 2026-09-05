---
name: flake-register
description: "Quarantine an intermittently failing test as tracked debt - owner, cause, expiry - instead of deleting it or leaving it to rot. Use before muting or skipping any test, and on a schedule to review the register."
category: testing
memory: project
version: 0.2.1
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

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/flake-register/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - flake-register` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/flake-register` in a consuming repo is a symlink to `<registry>/skills/flake-register` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/flake-register` and `git -C <registry> commit -m "skill(flake-register): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/flake-register/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/flake-register` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
