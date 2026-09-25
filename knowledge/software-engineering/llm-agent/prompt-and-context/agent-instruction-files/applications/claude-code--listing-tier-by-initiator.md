---
layer: application
type: application
subject: agent-instruction-files
technique: listing-tier-by-initiator
stack: claude-code
verified_on: 2026-09-24
verified_against: claude-code@2.1.281
applied: code
ab_verdict: better
proof: ab-paired
---

# Listing tiers across a twelve-repository fleet (Claude Code)

The version witness is the CLI's own `--version` output on the machine that
ran every arm below. The harness facts were resolved the same day against
its skills documentation (code.claude.com/docs/en/skills), which names the
tiers as the four values of the `skillOverrides` setting - `on`,
`name-only`, `user-invocable-only`, `off` - beside the older frontmatter
switches `disable-model-invocation` and `user-invocable`.

## The mechanism, probed before it was trusted

A throwaway repository carried four identical skills whose body replies with
a marker token: one plain, one with `disable-model-invocation: true`, one set
to `user-invocable-only` and one to `name-only` in the project's settings.
Headless sessions, one per arm:

| state | name listed | description listed | "Run the X skill." (prose) | `/X` (typed) |
| --- | --- | --- | --- | --- |
| plain | yes | yes | ran | ran |
| `disable-model-invocation: true` | no | no | "no skill named X" | ran |
| `user-invocable-only` | no | no | "no skill named X" | ran |
| `name-only` | yes | no | ran | ran |

The same `name-only` entry written to `.claude/settings.local.json` instead
of `.claude/settings.json` was honoured identically, which is what lets the
tier live beside the other machine state (the skill links) rather than in a
tracked file.

## Who starts the fleet's skills

A replay of 13,649 transcript files (1.98 M lines) on the machine separated
typed starts (`<command-name>` in a user turn) from model-side starts (a
`Skill` tool call). The initiator skills this fleet links - orchestrators,
loops, review and design workflows - were started by the operator in the
large majority of cases, and **none of their model-side starts was a
selection on resemblance**. Each was one of:

- the operator naming the skill in prose ("Lets run the spark skill",
  "Adopt skill /architect from registry ... and run"), or a start command
  inside pasted text, which the harness does not parse as a command;
- one skill dispatching another by name (the intake method dispatching a
  forge worker; a deepen run handing off to reconcile);
- a product engine prompting the model to perform a workflow (17 starts of
  one onboarding skill, all from one application's installer wizard);
- a sub-agent working a backlog row that named the skill.

That is the technique's falsifier firing: every one of those paths survives
`name-only` and fails under `disable-model-invocation` or
`user-invocable-only`. By contrast the model-side starts of the bundled API
reference and design-guidance skills (12 and 14) were resemblance-driven, and
those entries stay listed.

## The declaration and the install

The lane's `SKILL.md` carries an optional `listing:` key; absent means
`name-only`. Nine lane skills declare `listing: on` - the CI gate and triage
skills, test-before-commit, flake-register, the copy and localization skills,
the registry consult, the image generator, and the onboarding skill a
product engine drives. `scripts/link-registry.mjs` writes each declared
skill's tier into the consumer's `.claude/settings.local.json` (preserving
every other key), and `--check` reports drift. One consumer tracks that file
in git; the installer refuses to write it and reports the repository instead.

## The paired measurement

The measurable is the context of a session's first request (input + cache
write + cache read tokens) for the prompt "Reply with exactly OK.", headless,
one model, in a real consumer with 21 linked skills. Two runs per arm; every
arm returned the identical number twice, so the noise floor is zero at this
resolution.

| arm | first-request context |
| --- | --- |
| A - as installed, every description listed | 56,282 |
| all 21 linked skills `name-only` (settings passed per run) | 52,638 |
| B - shipped tiers (nine ambient skills stay `on`) | 53,866 |

The shipped tiers cut 2,416 tokens (4.3%) from every session start and
every sub-agent start in that repository, with nothing made unreachable. The
floor declared beside the target held: in B, a session asked about four
skills reported the two initiators as listed by name without a description
and the two ambient skills with their descriptions, as intended.

A second arm priced the harness's own and platform-supplied entries in an
empty repository: listing all 30 of them `name-only` moved the first request
from 25,316 to 20,039 tokens. Those are user-scope, and several are
resemblance-driven and must stay listed. Nine that are only ever started by name
were set to `name-only` in the user's settings the same day. A user-scope and a
project-local `skillOverrides` object merge per key rather than replacing each
other: in the same 21-skill consumer both scopes' entries applied together, and
the first request fell a further 811 tokens, to 53,055.

## What this application cannot say

It measures cost, not value, and it does not replace the held-out trial for
removal. A skill whose resemblance-driven starts are rare may have none in
five weeks of transcripts and still be the one that should fire next month;
the nine `on` declarations are a judgement from each description's stated
trigger, not a measurement. The replay's classification of "named" was read
by hand from the preceding text, not computed.
