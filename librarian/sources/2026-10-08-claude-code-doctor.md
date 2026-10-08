---
source: operator-dispatch:claude-code-doctor
kind: operator dispatch - a vendor instrument exercised first-party (the harness's own `/doctor` checkup and `claude doctor` CLI, run against 12 fleet trees plus two planted-fault controls)
url: https://code.claude.com/docs/en/skills
title: Claude Code /doctor - how it works, what it is worth, where it belongs in our process
author: Anthropic (instrument); operator (framing)
words: 12 full /doctor reports (~70k chars) + 12 headless reports + 2 control runs; docs read by a worker (skills, commands, cli-reference, hooks, changelog)
extracted: 14
accepted: 1
declined: 0
leads: 4
already_covered: 3
untriaged: 6
applied: 1
shipped: 1
dispatched: 0
run_id: intake-doctor-1008
siblings: 0
rescan_when: a harness release changes the /doctor check list, adds machine-readable output to `claude doctor`, or changes how hook `if` filters split wrapped commands; or 8 weeks elapse (2026-12-03)
---

# Claude Code /doctor: an instrument that originates, never authorizes

Intake 2.15.0, operator dispatch 2026-10-08. A source originates a finding. It never
authorizes one - and this source is an LLM pass whose output reads like a measurement,
which makes the sentence matter more than usual. 0 siblings at claim; one (a repository
run) arrived later and held nothing this run touched.

**Declared focus applied** (classify a `ship 0`): not needed - ship is 1.

**Expected yield, said before triage:** an operator dispatch over a vendor tool yields
currency, leads and a process answer, rarely corpus content. That is what it yielded.

## What the instrument is (two surfaces, read and exercised)

| | `claude doctor` (CLI) | `/doctor` (in-session, a bundled skill since 2.1.205) |
| --- | --- | --- |
| Runs | headless, seconds, no model | an agent session; works headless as `claude -p "/doctor" --permission-mode plan` (Git Bash needs `MSYS_NO_PATHCONV=1` or the slash becomes a path) |
| Reads | install, auto-update, settings files of the cwd, `.mcp.json` | all of that + transcripts (`~/.claude/projects`), the harness's own usage counters, CLAUDE.md/rules/skills on disk |
| Checks | schema only: malformed JSON, permission-rule syntax, hook shape, MCP schema | + unused skills/plugins/MCP vs their resident tokens, slow/timed-out hooks, CLAUDE.md derivable/duplicate content and lazy-load moves, broken skill frontmatter, permission posture (proposes auto mode), frequently-denied commands |
| Output | prose, **exit 0 even with "Invalid settings"** | prose plan + a plan file in `~/.claude/plans/`; asks before changing anything |

**Planted-fault controls** (scratch repo): the CLI caught malformed JSON, an unclosed
`Bash(npm run *` rule, a hook given as a string, an MCP entry without `url`. It **missed**
an unknown key, an unknown tool name `NotATool(x)`, an allow made unreachable by a
blanket `deny: Bash`, an MCP command that does not exist, and a ~320 KB CLAUDE.md; and
malformed JSON **masked** every other error in that file. `/doctor` in plan mode caught
every one of those. The two are a ladder: a cheap mechanical tier and an expensive
judgment tier, not alternatives.

## The fleet sweep

Headless CLI over all 12 projects (`loadFleet()`, machine Fox): 12/12 "No installation
issues found"; 10 of 12 carry a settings file it could validate, so the clean result is
a result. Full `/doctor` in plan mode, 12 in parallel, read-only (12 plan files deleted
afterwards). Every project shares the user-scope findings; the project-specific half:

| project | headline (verified marked V, refuted R, unchecked -) |
| --- | --- |
| personas | `.claude/CLAUDE.md` 56,237 chars, over the harness's ~40k warning (V); `Bash(node -e ' *)` in the local allow list (V); 4 skills without frontmatter (-) |
| goat | `.claude/settings.local.json` is **tracked** with 25 allow rules (V); CLAUDE.md cites a deleted `dragHandlers.ts` (V) and contradicts its own ESLint section (-) |
| gravitone | three skills' unquoted `: ` in `description:` "load with a substitute description" (**R** - planted probe: the harness loaded the unquoted description verbatim; kp's and politicas' runs said the same file loads fine) |
| LightTrack | `.claude/CLAUDE.md` still the npm template for a Rust workspace (already self-recorded as KNOWN STALE in its manifest) |
| personas-web | registry half-linked: manifest declares 12 shared skills, 2 linked, no rules dir (V) |
| grant / goat | loose `.md` files in `.claude/skills/` that never load (21.5 KB in grant) (-) |
| ascent, pumper, politicas, kp | CLAUDE.md content derivable from `package.json`/`just --list`/a JSON map - trim proposals (-) |
| all 12 | the personas cargo-guard hook "timed out ~27 s, blocks every Bash call" (**overclaim**, see row 1) |

## Triage

Rules: rows 1-2 scored under Phase 5; currency and leads admitted under the
corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | X | application | M | Filter the cargo guard's spawn with `if`, covering wrappers | session-continuation/advisory-guard-fail-mode | fills-stack-gap | 2/0/2 | real gap | **accept -> applied, shipped** |
| 2 | K | amendment | S | A host-side spawn filter is a second accept grammar; it must over-approximate the guard | advisory-guard-fail-mode ("unlisted syntax passes") | new-technique? | 1/0/1 | partial | untriaged (GAIN 1 cannot clear +2) |
| 3 | K | catch | - | Registry `.claude/rules/ai-registry-*` always loaded, ~3.1-3.3k tokens (9 of 12 reports) | agent-instruction-files/applications/claude-code--single-source-topology | none | - | likely catch | already covered - by design, per `build-knowledge-rules.mjs` header |
| 4 | T | catch | - | Headless doctor exits 0 with findings; cannot gate on exit code | law `failure-not-empty-success`; quality-gates/gate-liveness | none | - | likely catch | already covered |
| 5 | K | catch | - | CLAUDE.md lines derivable from the tree should go | agent-instruction-files/line-earning, instruction-freshness | none | - | likely catch | already covered - /doctor is a line-earning executor |
| 6 | M | lead | S | Harness skill counters are per machine; "unused" verdicts are machine-local | - | - | - | real gap | lead |
| 7 | T | lead | S | `/doctor` disagrees with itself across runs | - | - | - | real gap | lead |
| 8 | X | lead | S | Registry skills `consult`/`conform` 0 invocations here while project files mandate `/consult` | agent-instruction-files/capability-before-steering | - | - | partial | lead |
| 9 | K | lead | M | Measure the always-on registry rules' benefit, not only their cost | agent-instruction-files/enforcement-demotion | - | - | partial | lead |
| 10 | X | coverage | S | Re-link personas-web (`link-registry.mjs --project personas-web`) | - | - | - | real gap | untriaged - rewrites a checked-in `.gitignore` block and adds ~10 skills to a listing doctor calls over budget; operator call |
| 11 | X | coverage | S | personas: drop `Bash(node -e ' *)` and five one-off allows | - | - | - | real gap | untriaged - gitignored local file, operator's own grants |
| 12 | X | coverage | S | goat: untrack `settings.local.json`; fix stale CLAUDE.md citations | instruction-freshness | - | - | real gap | untriaged - owner decision (tracked on purpose?) |
| 13 | K | currency | S | personas instruction floor regrew: `.claude/CLAUDE.md` alone 56 KB vs the 67.9 KB whole-floor figure recorded 2026-08-24 | claude-code--single-source-topology | resets-clock | - | partial | untriaged - re-measuring the full floor across 6 projects is its own run |
| 14 | X | coverage | S | User scope: 2 skills never invoked, 4 connectors never authorized, 3,297 stale `idea-*` counters in `~/.claude.json` | - | - | - | thin | untriaged - user-level, machine-local evidence (row 6) |

`auto=1/1/0`, `fp=0`.

### Row 1 - the seam, and the falsifier that paid

Every report repeated "the PreToolUse cargo guard timed out ~27 s and blocks every
Bash call". Transcripts: the harness logs a hook's duration only on timeout; exactly
**2** such events in 30 days, both on commands that were **not cargo** (a `git diff …
npm run census:check` chain, an `npx vitest` run) - a stall before the guard's own
grammar ran. Denominator: **19,122** Bash calls, **112** heavy cargo. Re-timed idle:
~0.3 s per non-cargo spawn. So the claim was an overclaim in severity, and right about
the waste.

The reports' fix was "narrow the matcher to cargo". Run through the real harness
(logging hook, three arms, 13 commands built from the history's own cargo shapes):
`if: Bash(cargo *)` alone **missed `timeout 30 cargo`**, and a third of this project's
heavy cargo calls are timeout-wrapped. The seam was chosen to falsify the instrument's
advice, and it did. Shipped: two `if` entries (`Bash(cargo *)`, `Bash(timeout *)`),
9/9 cargo shapes still guarded (floor), non-cargo spawns projected 19,122 -> ~810
(target). personas `faae46313c` on `master`, not pushed; the operator's checkout is on
`readme-boost`, so the change is live once master is. Proof `ab-paired`; application
`session-continuation/applications/claude-code--advisory-guard-fail-mode.md`.

Master had moved under the reports: the hook's timeout is 900 s there (the guard now
queues instead of refusing), so the stall the reports describe would today hold a
plain Bash call up to fifteen minutes. The reports read the active branch's 20 s.

### Row 2 - promoting question (executed)

*Does the corpus already say the filter in front of a guard is part of its grammar?*
Read `advisory-guard-fail-mode.md` §"Anything that blocks is a total function": it
assumes the guard sees every message; nothing covers a host-owned pre-filter. Real
gap, but a boundary case of the file's own rule (GAIN 1). Untriaged with that anchor.
A second sighting - another hook, another harness - promotes it.

## Leads

- **Row 6 - counters are per machine.** `~/.claude.json` `skillUsage` on this
  (secondary) machine reads 0 for `librarian`, `forge`, `hygiene` - skills the
  operator demonstrably runs, on the primary. Every "remove, never used" verdict
  /doctor gives is machine-local. Return: when counters from both machines can be
  merged (or `/librarian skills` reads the run logs instead).
- **Row 7 - the instrument is not deterministic.** Same machine, same files, 12 runs:
  `rust-analyzer-lsp` judged "remove" in 4 and "keep" in 8; the unquoted-colon header
  judged broken once and fine twice (refuted by probe); the hook stall reported as
  20 s and as 27 s. Return: when a second sweep on the same day gives a measured
  agreement rate.
- **Row 8 - mandated, never invoked.** `consult` has no usage record on this machine
  although several projects' instruction files direct agents to it; pumper's
  `.ai/consults.jsonl` nonetheless shows consult activity, so something invokes it
  outside the counter. Return: when the primary machine's counter is read.
- **Row 9 - the always-on rules are priced, not valued.** 9 of 12 reports proposed
  `paths:` scoping for the registry rules; the generator's header argues recall fails
  without them. Neither side has a measurement. Return: an A/B of rule-on vs rule-off
  on `consult`/slug citations per session, the way `enforcement-demotion` measured
  its reminder.

## Where it belongs in our process (the answer the dispatch asked for)

1. **`/hygiene` Phase 1 - the CLI, every sweep.** `claude doctor` per project, grep
   the `Invalid settings` block (never the exit code). Seconds, no model, read-only.
   Also run it after `link-registry.mjs` writes settings into a project - that tool
   is the fleet's biggest settings writer.
2. **A weekly or post-upgrade `/doctor` sweep - the judgment tier, as an intake
   source.** `claude -p "/doctor" --permission-mode plan` in parallel per project;
   save the reports; route findings through verification exactly as this run did.
   Of this run's checked headline claims: 5 verified, 1 refuted, 1 overclaimed, and
   the one recommendation that was shipped had to be corrected by A/B first.
3. **Never "clean up everything" fleet-wide from it.** Its removal verdicts rest on
   per-machine counters, and its 12/12 recommendation to default to auto mode is a
   permission-doctrine change for the operator, not a cleanup.
4. **Its CLAUDE.md proposals are `line-earning` candidates**, and its listing-budget
   warnings are `sibling-floor-ownership` evidence: they belong in the
   instruction-file work the registry already describes, not in a new lane.
