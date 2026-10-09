---
layer: application
type: application
subject: live-defect-debugging
technique: evidence-gated-fix
stack: node
status: forged
verified_on: 2026-10-09
verified_against: node@22
---

# The gate is a paragraph: "NEVER fix without runtime evidence first"

What this realization cannot do: stop a fix that has no evidence behind it. The entire
gate is prose in a skill file read by a model. No code in the package checks that a
hypothesis id exists, that a probe fired, that a verdict was written, or that the cited
lines are real; the server stores whatever JSON arrives. The gate holds only to the
extent the model obeys the paragraph. The evidence is one tree (n=1), and nothing here
measures how often the gate holds.

Tree read: the `debug-agent` package at commit `295af90bcfc16ba3578e6be91ed1c552261bb257`.
Version witness: the CI pin, `.github/workflows/test.yml:24 "node-version: 22"`, over a
declared floor of `packages/debug-agent/package.json:60 "node": ">=18"`. Source read, not a run.

## The gate and its stated reason

The skill opens by stating the premise that the technique rests on:
`packages/debug-agent/skill/SKILL.md:14 "Traditional AI agents jump to fixes claiming 100% confidence"` and, on the next
line, the diagnosis, `packages/debug-agent/skill/SKILL.md:15 "They guess based on code alone."` The rule is then
stated as a hard constraint,
`packages/debug-agent/skill/SKILL.md:34 "NEVER fix without runtime evidence first"`, with its sibling
`packages/debug-agent/skill/SKILL.md:35 "ALWAYS rely on runtime information + code (never code alone)"`.

That second line is the one the technique sharpens. It allows code *plus* runtime
information and forbids code alone, and says nothing about where a pure read of a
constant or a type falls. The skill has no discriminator; every hypothesis is to go
through a log. The technique's line between observing an artifact and simulating its
execution is an addition, and a cheaper one: a hypothesis settled by reading a declared
value does not need a round trip.

## Confidence is named and not accepted

`packages/debug-agent/skill/SKILL.md:27 "Fix only with 100% confidence"` could read as a
self-assessed bar; the clause that follows ties it to "log proof". It is worth noting
what the phrase does not do: it does not define confidence, and a model that reports
100% after reading code has satisfied the words and not the intent. The technique's
position is that stated confidence is admitted as nothing, so the gate's content must be
the proof, not the number.

## The closed verdict

The analysis step uses the three-state set with citation:
`packages/debug-agent/skill/SKILL.md:26 "evaluate each hypothesis (CONFIRMED/REJECTED/INCONCLUSIVE)"`
`with cited log line evidence` on the same line. Inconclusive is a first-class
outcome, consistent with the technique. The rule for a round that rejects everything is
`packages/debug-agent/skill/SKILL.md:198 "If all hypotheses are rejected, you MUST generate more"`.

Not present: a rule for the case where two hypotheses are both confirmed, and no
requirement that exactly one be. The skill's "100% confidence" is the only brake on a
fix chosen from a tie. The empty-evidence case is handled as a reproduction question,
`packages/debug-agent/skill/SKILL.md:168 "the reproduction may have failed"`, rather than as a verdict.

## Iteration is priced in

The cost model the technique argues for is stated outright:
`packages/debug-agent/skill/SKILL.md:37 "Fixes often fail; iteration is expected and preferred."` and, after it,
that taking longer with more data yields more precise fixes. Placing this beside the hard
constraints is what keeps the gate from being skipped under pressure to be right the
first time.

## Verification on the same instrument

Success is claimed only against a second run read with the same probes:
`packages/debug-agent/skill/SKILL.md:192 "do not claim success without log proof"`,
and probes are held until then. The fix itself is bounded by a ban on the
workaround class the technique excludes:
`packages/debug-agent/skill/SKILL.md:190 "Using `setTimeout`, `sleep`, or artificial delays as a"` fix.
The size rule is `packages/debug-agent/skill/SKILL.md:200 "Make fixes precise, targeted, and as small as possible"`.

## Rejected edits are reverted

The companion rule is in the reminders:
`packages/debug-agent/skill/SKILL.md:199 "Remove code changes from rejected hypotheses"`, explained in the
same sentence run: do not let defensive guards or speculative fixes accumulate. The loop
also places the revert first when a verification fails, at
`packages/debug-agent/skill/SKILL.md:29 "FIRST remove any code changes from rejected hypotheses"`, ahead of
generating new hypotheses, matching the ordering the revert technique requires.

## What the tree does not test

The package has a test directory for the server, the lock and the installer, and none of
it exercises the loop's rules (the two files that mention the skill concern installing it). There is no fixture of a model following or violating the gate, so the claim
that the loop works rests on the argument above and on the practitioner who wrote it.
Treat the numbers (three to five hypotheses, ten probes) as that practitioner's
defaults.
