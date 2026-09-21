---
source: operator-dispatch
kind: vendor release log, read as an operator dispatch (no URL; the operator framed the question and the changelog was fetched as its primary)
url: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
title: "Claude Code release log 2.1.198 -> 2.1.263 (2026-07-01 .. 2026-09-06), read for what a single-owner autonomous fleet should change"
author: Anthropic (changelog); framing by the operator
words: 34,743 in the 66-version window (6,362-line changelog, lines 1-1721); 3 reader workers, one slice each
extracted: 60 rows from three readers, consolidated to 16
accepted: 3
declined: 0
leads: 2
already_covered: 7
untriaged: 4
dispatched: 0
applied: 3
shipped: 1
run_id: intake-cc-releases-0908
siblings: 0 at start, 0 at Phase 7
skill_version: 2.7.0
fetches: 2 of 3 (the changelog via curl; the permissions reference page). The npm registry's version-date map was a third HTTP call, not a corroboration fetch.
rescan_when: a release changes the default terminal git action of unattended sessions again, or ships a documented statement on whether deny rules apply under bypass mode (undocumented today, witnessed true at 2.1.263); or 8 weeks elapse (2026-11-03)
---

# The harness rewrote three lines nobody had written

**Class and expected yield, said before the table.** An operator dispatch over a
vendor release log. The class table has no row for a changelog, so the nearest was
used: vendor release announcement — reliable for *that things shipped*, with prose
the strip test's problem. Expected yield: mostly catches against a corpus that
already models instruction files, hooks and gates in depth (three of the four
mapped homes have 14-22 techniques), one or two currency signals, and at most one
mechanism. The declared focus from the scorecard was read at Phase 1: *when the
source's mechanism is a decision over tool calls, replay it over the recorded
transcripts before scoring it.* That focus decided the run's largest measurement.

**How the source was read.** The changelog carries no dates. The npm registry's
per-version publish times bounded the window to 2.1.198 (2026-07-01) through
2.1.263 (2026-09-06), 66 versions. Three reader workers took one slice each and
returned 60 rows in the candidate shape with a strip column; the director
consolidated them against the map. Bug-fix lines were kept only where the fix
revealed a mechanism, which turned out to be where most of the yield was.

## The operator's doctrine, checked against the corpus first

The dispatch stated a doctrine: guards belong in the harness (hooks, instruction
file) and the local pre-commit/pre-push rungs; pipelines deploy and deliver;
blocking the pipeline is the last resort; there is one owner, so team-aware
ceremony can go. Read against the corpus this is **already covered, with one
sentence the doctrine should keep**:

- `quality-gates/gate-laddering` says local rungs move the moment of discovery,
  not refusal, and the binding rung is the last one. `deployment-contract/
  deploy-gate-coupling` (stage solo) supplies the single-owner form: the pipeline
  binds by *deploying*, resolution two moves the gate ahead of the push, and the
  fleet standard applied on 2026-08-27 (verify script + pre-push hook per repo) is
  exactly that. The doctrine is the corpus's own solo stage.
- The sentence to keep: the remote rung still exists **as detection**, because the
  one clone without hooks is the owner's second machine, and because
  gate-laddering's "irreversible defects invert the rule" section makes the local
  secret scan the *whole* control and the remote one its liveness check.
- The window's own evidence runs the doctrine's way: readers independently named
  "the harness is the guard layer" as a cross-row mechanism in all three slices
  (deny-over-allow, fail-closed parsing, hook verdicts honoured through failure
  paths, execution-affecting settings pushed out of repo scope).

Not landed as content. Recorded here so the next run does not re-derive it. The
fleet's CI inventory (kp 8 workflows, systedo-case 11, personas 7, most of them
validation rather than delivery) is a **direction candidate**, not a coverage
change, and is filed under "Directions not proposed" below.

## Triage (v2.5 scored gate)

Vetoes: V1 clear (all rows land in existing subjects; no category touched). V2
satisfied for every content row by the primary fetched in-run. V4 fired on none —
every accepted row's strip column carried a rule. V5: no siblings live.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Harness defaults are lines the file never wrote (push-on-finish 2.1.206/221, write interlock per model 2.1.228, review skills stop self-triggering 2.1.215/218) | `agent-instruction-files` (sibling-floor-ownership, rewrite-behavior-pinning, capability-coverage-contract) | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | amendment | S | When the author is an agent, the gate bypass is denied at the harness (2.1.229) | `quality-gates/hook-hygiene` "Bypass is a feature" | corrects-claim (inverts *who* may bypass) | real gap | 2/0/1 | **accept** |
| 3 | K | application | M | Repository-linked skill catalog is still the floor: 193 loaded / 28 invoked (replay) | `agent-instruction-files/sibling-floor-ownership` | fills-stack-gap | catch + measurement | 1/0/2 | **accept** (dated-fact layer; the replay is the declared focus executed) |
| 4 | K | currency | S | Reset-event enumeration moved four times (fork source, /cd rescoping, DirectoryAdded, resume staleness payload) | `context-reset-redelivery` claude-code application | resets-clock | catch | 1/0/1 | landed as currency (clock moved 2.1.252 -> 2.1.263) |
| 5 | K | technique | M | Path-bound deny rules protect one tool's door; the shell reaches the same bytes (2.1.257/259/260 extend-then-revert) | `agent-cli-transport/permission-stance-enforcement` | fills-stack-gap | partial | 1/0/2 | untriaged — promoting question below |
| 6 | K | amendment | S | A guard's infrastructure failure must not be encoded as a decider's verdict (timeout misreported as user rejection, 2.1.210) | `session-continuation/advisory-guard-fail-mode` | none | catch | 1/0/1 | catch — the file already routes a timeout to pass-with-diagnostic; attribution is `unattended-mode`'s "different deciders" |
| 7 | K | amendment | S | Unattended: ask resolves to deny (`--permission-prompts none`, 2.1.259); questions no longer auto-continue (2.1.200) | `hitl-approval/unattended-mode` | none | catch | — | catch ("through the gate, not around it") |
| 8 | K | practice | S | Permission floor must live in a scope the repository cannot edit (2.1.257 bypass ignored in project settings; 2.1.248 `--restricted` ignores settings files) | `agent-runtime-assembly/operator-tier-code-loading` | none | likely catch | — | catch |
| 9 | K | amendment | S | Delegation bounded on three axes plus spend (2.1.212/217/219/224) | `fleet-orchestration/parallel-dispatch`; memory | none | catch | — | catch + currency for the registry's own director skills |
| 10 | K | technique | M | Authority travels by channel, not content: notifications stamped "no human input" (2.1.205/210) | `fleet-orchestration/completion-claim-verification`, `hitl-approval` | none | likely catch | — | catch |
| 11 | T | practice | S | Lifecycle hooks run from a cwd the hook does not own; resolve from the project-root variable (2.1.239) | `quality-gates/hook-hygiene` | none | partial | 1/0/1 | untriaged — but the live instance in kp was fixed in the same commit as row 2's apply |
| 12 | T | practice | S | Instruction-file bloat linter; derivable content is the cut (2.1.206) | `agent-instruction-files` golden path (machine-generated overviews hurt) | none | catch | — | catch |
| 13 | K | currency | S | Fork-context skills run in the background by default (2.1.218) | skills lane | none | — | no fleet skill declares `context: fork` (grep over 13 trees) — nothing to move |
| 14 | M | currency | S | Worktree isolation accepts plain shell (2.1.257); EnterWorktree outside `.claude/worktrees/` now confirms (2.1.203) | memory: worktree-isolation-refuses-computed-shell, forge-handoff-worktree-sequence | resets-clock | — | memory annotated, not verified — return condition below |
| 15 | K | lead | S | Todo/task tools retired on current models (2.1.233) | — | none | — | lead: fleet harness surfaces grep clean (hits were docs and worktree copies) |
| 16 | K | lead | S | Concurrent sessions clobbered the global config file until 2.1.259 | `agent-memory/durable-store-failure-posture`? | none | thin | — | lead |

`auto=3/2/0`, `fp=0`. Rows 5 and 11 were rejected by the score alone (GAIN 1);
both promoting questions were executed (below) and neither promoted.

**Row 5's promoting question:** does `permission-stance-enforcement` already state
that a path deny is a per-tool guard? Its layer three says "a bare shell grant is a
write grant with extra steps" — the *allow* side of the same fact. The deny side is
not stated. It stays untriaged rather than landing because the corpus's form of it
would be a boundary sentence in a technique that has no application for this stack
at all; writing the application first is the cheaper move and is the return
condition.

**Row 11's promoting question:** does hook-hygiene's "non-interactive, deterministic,
bounded" section cover cwd? No — it covers prompts, time and network. A one-line
boundary would fit, but the instance was fixed in-tree and the technique is about
commit-path hooks, where cwd *is* owned; the harness-lifecycle case belongs with
row 2's amendment if a second run finds a second instance.

## Landed

- **`agent-instruction-files/inherited-default-ownership`** (technique). The third
  blind spot of the per-line funnel, beside the absent diff (an install) and the
  total diff (a rewrite): the diff that happens in the harness's release log.
  Three defaults changed in sixty days with no repository change; the technique
  sorts inherited defaults by direction — permissive ones pin below the model
  (deny rule, blocking hook), restrictive ones pin by owning the step — and adds
  the harness version as a freshness coupling beside the repo and the model.
- **`quality-gates/hook-hygiene`** (amendment: "When the author is an agent, the
  bypass is not the author's to take"). Inverts *who* may bypass, keeps every
  clause for the person, and names the harness's deny layer as the place, with
  the repository's own skip variable as the same shape.
- **`agent-instruction-files/applications/claude-code--sibling-floor-ownership`**
  (application, `experiment` / `unmeasurable`, instrument named). The replay.
- **`claude-code--context-reset-redelivery`** currency: `verified_on` and
  `verified_against` moved to 2026-09-08 / 2.1.263 with the four new events.

## Applied (Phase 7.5) — three rows, two A/B-paired, one structural

All arms ran headless on 2.1.263 in throwaway repositories with local bare
remotes, under bypass mode, same prompt per pair, n=1 per arm. Chosen to
falsify: each pair's control could have matched its treatment, which would have
meant the default was not what the changelog said in this lane.

| technique | project | mode | A | B | read | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| inherited-default-ownership | kp | experiment -> code | no instruction line: agent committed **and pushed** to origin | one line "commit; never push; owner pushes after reading the log": agent committed, did not push, said why | bare remote's commit count (1->2 vs 2->2) | **better**; the line shipped to kp's canonical guidance |
| hook-hygiene (amendment) | kp | experiment -> code | bypass mode, no deny: `git commit --no-verify` ran (`[main 4fd113b] probe`) | bypass mode + `deny: Bash(*--no-verify*)`: refused twice, "Permission to use Bash ... has been denied" | local log (1->2 vs 1->1) | **better**; four deny rules shipped to kp's project settings, in-tree dry-run probe recorded in `.ai/applied.jsonl` |
| sibling-floor-ownership | fleet (12 trees) | experiment | — | — | 1,792 transcripts, 39,739 tool calls: 193 loaded, 28 invoked | **unmeasurable** until the held-out trial (catalog emptied vs present, one task per repo, scored on the repo's gate) |

**A fact the primary does not state, now witnessed:** the permissions reference
says deny rules are evaluated first in every scope and that hook decisions
cannot bypass them; it does not say whether they apply under bypass mode. Arm B
of the second pair says they do, at 2.1.263. That is a dated fact and lives in
the applied row and the memory note, not in an upper layer.

## Directions not proposed

- **CI as delivery only.** kp (8 workflows), systedo-case (11) and personas (7)
  carry validation lanes the doctrine says should be local rungs. Reducing them
  is a change to what verification means, which `proposal-not-push` puts off the
  autonomous path, and it is a direction rather than coverage. Candidate for the
  owner's next fleet-map pass; the measurable is the count of workflow jobs that
  are neither a deploy nor a scheduled drill.
- **User-scope deny rules.** One `permissions.deny` block in the user's own
  settings would cover all twelve repositories at once, which is the
  single-owner move. It edits the operator's home configuration, not a project
  tree; recommended in the report, not shipped.

## Leads

- **Retired task tools (2.1.233).** Return: a fleet skill or hook is found to
  reference them, or a project builds control flow on a scaffolding tool.
- **Concurrent-session config clobbering (fixed 2.1.259).** Return: a project
  writes shared config from parallel agents and needs merge-on-write; then it is
  an instance for `agent-memory/durable-store-failure-posture` or a sibling.
- **Memory row 14.** Return: the next worktree-isolated run tries a plain shell
  loop; if accepted, retire the "computed shell refused" memory and record the
  confirm prompt for out-of-tree worktrees.

## Board and siblings

No sibling was live at claim or at Phase 7. Locks taken: `index` once (regenerate
+ gates), `ledger` once, `commit` once. Scratch deleted by run id.
