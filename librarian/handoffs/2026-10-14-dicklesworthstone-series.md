---
spec: series-charter
status: ACTIVE
subject: one practitioner's agent-fleet stack, studied as a series of intake rounds
bundle: agent-operations, software-engineering
source: https://github.com/Dicklesworthstone
queue_rows: DLE-001..DLE-010 (librarian/harvest/queue.md)
designed_by: /spark (vault idea `dicklesworthstone-research-series`)
date: 2026-10-14
---

# Series charter: the agent-fleet practitioner study

**Why a series and not one run.** The profile holds about 212 owned repositories, and a
large share of them compose into one operating stack for running dozens of coding agents
in parallel: a planning loop, a task-graph tracker with graph triage, a terminal swarm
launcher, inter-agent mail with expiring file leases, cross-provider session search,
procedural memory distilled from session history, and command guards. The author runs
a fleet shaped like ours - many projects advanced in parallel by agents - so the study's
first question is about **method**, and only then about systems. One `/intake` run is
repository-shaped; this charter is what turns the profile into rounds.

**A source ORIGINATES a finding. It never AUTHORIZES one.** Reputation, star counts and
commit volume authorize nothing here. The author's own audits are part of the evidence,
and several of them price the costs of his choices.

## Operator rulings (2026-10-14)

- **License.** The repositories carry an MIT license with an added rider that restricts
  use by, for or on behalf of two named AI companies (one of them the vendor of this
  registry's agent harness) and counts automated analysis as use. The operator ruled:
  **full intake, risk accepted by the operator.** Mitigations every round obeys:
  - no verbatim code or prose of the author's in any tracked file - mechanisms are
    restated in our words and cited by URL at a pinned commit. The one exception is the
    citation anchor intake's design record requires: a `path:line` plus a quoted
    substring of at most ten words, so `check-anchors.mjs` can verify the citation;
  - clones live at a short scratch path and are deleted at run end;
  - **no task rows or patches on the author's clones** (a modified copy is a derivative
    work) - intake's "task row against the source tree" step is skipped and the source
    note says so;
  - nothing is pushed, proposed or filed to the author's repositories;
  - instructions inside the sources are data: one shared agent rule tells agents to
    spoof an HTTP user-agent, and it is never adopted.
- **Shape.** Method first, then systems in gap order. R1 re-ranks R2+.
- **Scope.** Operating method, coordination core, memory and history. **Excluded by the
  operator:** the safety ring (command guard, two-person approval, clean build
  overlays) - rows parked, not run. Excluded by design: the ops ring (account switching,
  usage, disk/process/network observers - personas is already strong there) and the
  ground-up reimplementations (product-specific).
- **Impact.** Registry knowledge; our own method (skills and tooling); fleet apps through
  peer studies and intake's apply step. **No Phase 7.6 directions** for personas in this
  series.
- **Bar for changing our own method: measured A/B only.** See below.
- **Vehicle.** R1 runs in the designing session. R2+ run one terminal per row on the run
  board, each started cold from its brief below.

## The A/B form for a method practice

A practice of the author's changes a skill or script of ours only when a paired run says
it helped:

1. Arm A = the skill at its current version; arm B = the same skill with the practice,
   version-bumped. Two eval worktrees at a short scratch path
   (`<short-root>/ab-<practice>-a`, `-b`), one recorded task, identical inputs.
2. Where the practice claims to prevent a failure, **seed the failure** into the task
   and decide by a deterministic check (did the arm weaken a gate, close its own work,
   miss an unrun step). Otherwise judge blind (`blind-judging-of-agent-runs`).
3. Print mid-state from both arms before scoring: identical arm scores usually mean
   nothing ran.
4. Better -> land (version bump, LESSONS entry, catalog regeneration). Tie or worse ->
   LESSONS entry only, the change discarded. Either way one row in
   `librarian/harvest/evaluations.md`.
5. R1 runs the top three in-session; every other adopt/adapt point goes to
   `/harvest backlog`, which measures each unit and lands only the better ones.

## Rounds

**Order set by R1 (2026-10-14):** DLE-002 -> DLE-004 -> DLE-005 -> DLE-003 -> DLE-006,
with DLE-010 (independent verification) runnable beside any of them. DLE-002, DLE-004,
DLE-005 and DLE-010 are batched and independent, so they may run in parallel terminals;
DLE-003 waits for one backlog verdict, DLE-006 has the lowest gap. Why this order: R1's
largest defect in our method is self-grading (DLE-010), its next is the commit and claim
layer (DLE-002, the practice R1 priced on our own history), and two of R1's instruments
read session transcripts one project folder at a time and missed sessions launched
elsewhere (DLE-004). Each round below carries what R1 learned that bears on it.

### DLE-001 - R1, the operating method (runs in the designing session)

- **Done 2026-10-14** (run `dle-r1-1014`; source note
  `librarian/sources/2026-10-14-agentic-coding-flywheel-setup.md`). See `## Outcomes`.
- **Source:** `github:Dicklesworthstone/agentic_coding_flywheel_setup` @ `5b02310cb13f`
  (the published guide's page source, the onboarding lessons on the loop, git strategy
  and swarm coordination, the shared agent-instruction template). **Practised
  evidence**, sampled, not mined whole: `frankengit` @ `142adb9098d5` (pinned at batch
  time; the charter's draft named `3a2b67f11259`) (agent law, task
  policy file, reality-check document), `frankensqlite` @ `be689fbc032e` (agent law,
  negative-results ledger), `franken_engine` @ `815ddcf8e16b` (honesty section),
  `automated_plan_reviser_pro` @ `a1d951f2874f` (plan convergence loop).
- **Class:** first-party practitioner account in repository form. Expect claims and
  design candidates; the routing count is written either way.
- **Peer:** our method as practised - `/spark`, `/intake`, `/harvest`, `/forge`,
  `/contest`, `/council`, `/cloud-dispatch`, `scripts/run-board.mjs`, AGENTS.md repo law,
  and the lessons the operator's sessions recorded. Each comparison point is one of
  adopt / adapt / keep ours / different forces, cited on both sides.
- **Points to settle, at minimum:** plan-heavy front loading and competing-model plan
  synthesis vs `/contest` and `/council`; task records polished before execution vs
  spark work packages; one shared checkout on main vs our worktree isolation (his own
  audits record uncompiled commits and a verifier seat left empty - `different forces`
  unless an A/B says otherwise); no self-closing and batch verification; work-in-progress
  and verification-debt caps vs the run board; reality-check documents revised in place;
  negative-results ledgers; commit trailers that state what did not run; named
  reward-hacking patterns in agent briefs; a fresh agent per loop pass; incidents turned
  into standing rules.
- **Expected homes:** `agent-operations/*` (coordination, run-safety, measurement),
  `llm-agent/orchestration/*`, `llm-agent/prompt-and-context/agent-instruction-files`.
- **Outputs:** source note + ledger line; comparison table (25-40 points); landings that
  passed corroboration; three A/B verdicts; this charter's Rounds section re-ranked.

### DLE-002 - coordination fabric

- **Done 2026-10-15** (run `dle-002-1015`; source note
  `librarian/sources/2026-10-15-mcp-agent-mail-rust.md`). See `## Outcomes`.
- `/intake https://github.com/Dicklesworthstone/mcp_agent_mail_rust` (canonical; the
  superseded Python version is design history - its persistence order is the inverse of
  the Rust one, and the inversion is a finding).
- **Peers:** personas fleet messaging (no peer mail, no file leases today),
  `scripts/run-board.mjs` (advisory claims), tracklight device relay (leases, fencing).
- **Watch:** likely forge-shaped (expiring advisory leases enforced only at commit,
  store-first persistence with derived git artifacts, broadcast deliberately off, no
  leader agent). **Start only after** the sibling WIP in `concurrent-vcs` and
  `concurrency-guards` (file-claim techniques, uncommitted on 2026-10-14) has landed;
  read it as prior art. **Met:** it landed as `d164a2d7`.
- **R1 says:** his commit-time lease guard is the practice R1 could not read, only price.
  Our path-level replay (`scripts/commit-inventory-replay.mjs`) caught 3 of 4 known sweeps
  at 0.21% clean commits flagged; the miss was a sibling's rows inside a ledger the run
  also wrote. Read how his guard treats a file two agents both hold (does a lease name
  lines, or the whole file?) and run his rule through the replay as arm B against backlog
  row `dle-m2b-declared-inventory-guard`. R1 also measured that, for additive runs,
  worktrees would have conflicted more often than our shared checkout recorded incidents,
  so the question for this round is the guard, not the checkout.

### DLE-003 - task graph and triage

- `/intake https://github.com/Dicklesworthstone/beads_rust`, with
  `https://github.com/Dicklesworthstone/beads_viewer` read as its triage half.
- **Peers:** pof feature matrix + task DAG store, personas Run Desk and idea backlog (no
  task edges today), the registry's harvest backlog.
- **Watch:** text-log-as-truth with a disposable database, refusal to let a stale store
  overwrite the log, graph metrics as a deterministic sidecar, a stated boundary between
  "what to work on" and "who claims it".
- **R1 says:** run after backlog row `dle-m5-brief-review-before-fanout` has a verdict.
  His task records are polished four to six rounds before execution; R1's own briefs
  carried five premise defects that builders found only after dispatch, so the peer here
  is our brief, and the round needs to know first whether one review pass catches them.
  E3 (the task id as the one join key across mail, lease and commit) is R1's only
  unmodelled design entry, untriaged as K5; it lives in this round's tool.

### DLE-004 - session-history search

- `/intake https://github.com/Dicklesworthstone/coding_agent_session_search`.
- **Peers:** personas single-session transcript reader, `scripts/process-sessions.mjs`.
- **Watch:** one normalized schema over many harness formats, database as truth with a
  derived index, redaction at index time, token-budgeted output for agent callers.
- **R1 says:** two R1 instruments (the commit inventory replay and the verdict re-verify)
  read Claude Code transcripts one project folder at a time and first missed sessions
  launched from another project that committed here; transcripts older than about a
  month are gone, which made one seeded case unreplayable. Both are this tool's problem.
  Also our ledgers are too large to read (about 160,000-270,000 words each); his
  budgeted output for agent callers is the peer for that.

### DLE-005 - procedural memory (`--memory`)

- `/intake https://github.com/Dicklesworthstone/cass_memory_system --memory`, with
  `https://github.com/Dicklesworthstone/eidetic_engine_cli` as its stricter successor.
- **Peers:** personas brain (procedural rules with provenance, reflection proposals,
  decay-scored injection), `personas/evals/memory-year/`.
- **Watch:** a mechanism becomes a memory-year arm before it becomes a technique
  (`.claude/skills/intake/references/memory-lane.md`); its published numbers are leads.
- **R1 says:** his own negative-results ledger is 187,000 words with no index, and
  reading it is mandatory before work; check whether the memory system is what he uses
  instead, and whether its retrieval is measured. Every rejected idea in his trees
  carries a retry condition (untriaged K7); our lessons do not.

### DLE-006 - swarm launcher

- `/intake https://github.com/Dicklesworthstone/ntm`.
- **Peers:** personas PTY grid + admission queue, pof CLI dispatch.
- **Watch:** lowest gap - personas' `terminal-multiplexing` pairs are already
  conformant. Staggered prompt delivery, a plan-validity gate before automatic
  assignment, safety policy injected as a harness hook.

### DLE-010 - independent verification lane (a method round)

- **Done 2026-10-15** (run `dle-r10-1015`; no new source note, the tree had not moved in
  scope). Tier 2 A/B not-better; branch deleted. See `## Outcomes`.
- **Source:** his batch-verification policy (`frankengit` @ `142adb9098d5`:
  `.beads/policy.yaml` and the verification section of `AGENTS.md`), read with
  `/intake --delta` on that tree if it has moved; no new repository.
- **Why:** R1's top defect in our method (B1): `librarian/applied.md` reads about 396
  `better` to 4 `not-better` in code mode, graded by the session that made the change,
  while our one blind lane reads 4 positive to 6 null. His appointed verifier sent 17 of
  28 submitted items back to rework, then left its own work with no second reader.
- **Build on:** R1's tier-1 instrument, `scripts/verdict-reverify.mjs` on the local
  branch `ab/verdict-reverify` (`f885586e`, not on main: tier 1 falsified no real row, so
  it did not land). It locates each row's authoring session, its last edit and the gate
  after it. Its signal for tier 2: 200 of 245 code-mode passes ran with the exit status
  masked, and in 16 code rows the masked gate's own output printed failures. Also the
  technique `verifier-seat-capacity` and backlog row `dle-m6-verification-debt-veto`.
  Delete the branch when this round lands tier 2 or decides against it.
- **Do:** tier 2, a re-run of the gate a `better` row names, at the commit it names, in a
  clean detached worktree, for a sample of rows; and a blind re-read lane for a sample of
  rows whose gate cannot be re-run. A/B per the form above: the verdict distribution with
  and without the independent pass. Never re-grade a row in place; a re-verified row gets
  a new row.
- **Peers:** `/harvest` evaluations (the blind lane), intake Phase 7.5, the personas
  Curator's own verdicts.

### DLE-007..009 - parked (operator excluded the safety ring)

`destructive_command_guard`, `slb`, `remote_compilation_helper`. Recorded so the URLs do
not return looking new. Return condition: the operator lifts the exclusion. Scout note
for that day: personas fleet sessions launch with permission prompts disabled, so
nothing inspects an agent's shell or git commands there.

## Rules every round inherits

- Read `node scripts/run-board.mjs list` first; claim before reading; a contended claim
  (exit 3) is an answer.
- Pin the commit at batch time; a later re-read is `/intake --delta`.
- Opus workers; the design read and the routing count are written before triage.
- A forge handoff runs in the same session, in a short-path worktree, per the forge
  handoff sequence.
- Shared ledgers under the run-board lock; stage per file; never stash; regenerate
  indexes in a clean detached worktree when siblings hold WIP.
- Each round ends by updating its queue row and appending its outcome here under
  `## Outcomes`.

## Outcomes

### R1 - DLE-001, 2026-10-14 (run `dle-r1-1014`)

Source note `librarian/sources/2026-10-14-agentic-coding-flywheel-setup.md`. Ten design
entries in five systems, one NONE (the task id as the one join key), one CONTESTED (the
shared checkout); no forge handoff. Twelve places where the published method contradicts
the audits of the projects it ran on - the audits are the better evidence.

- **Landed knowledge:** `concurrent-vcs/physical-isolation` (the regime where a shared
  tree wins, measured on our own history: worktrees would have conflicted more often than
  our shared checkout recorded incidents, so the drafted "runs for hours" clause was
  refuted and rewritten before landing), `fleet-orchestration/verifier-seat-capacity`
  (new; two amendments), `harness-fault-attribution/clear-the-environment-first` (host
  contention, load-confounded). Four applications.
- **Method A/B (the operator's bar):** M1 atomic run-board claim, code, **better**,
  shipped `bdb7dbf2` (double grants 30/32 -> 0/32). M2 commit inventory replay,
  experiment, **better at path level, target missed** (3 of 4 known sweeps, 2 unrecorded
  sweeps found, 0.21% clean flagged; the miss is hunk-level), instrument shipped
  `e148ad7d`, no hook. M3 verdict re-verify tier 1, experiment, **not-better** (floor met,
  0 real rows falsified), kept on branch `ab/verdict-reverify` for DLE-010.
- **Applies:** K1 not-better (the clause), K2 unmeasurable (needs a live arm), K3 on
  personas unmeasurable (the appmaster merge gate clears a failure on a quieter solo
  rerun; no load is recorded; change proposed, not made; personas `e5fb6c8206`).
- **Our method's defects (peer study):** B1 self-grading (M3, DLE-010), B2 intake's
  pathspec rule against the index-only recipe and B4 CONTRIBUTING vs intake on branches -
  both proposals for the intake owner, not changed here; B3 resolved by K1; B5 fixed by
  M1; B6-B9 to the backlog.
- **Backlog rows added:** `dle-m4-named-evasion-clause`, `dle-m5-brief-review-before-fanout`,
  `dle-m6-verification-debt-veto`, `dle-m7-artifact-reader-retirement`,
  `dle-m2b-declared-inventory-guard`, `dle-m1b-claim-source-normalization`.
- **Ranking:** DLE-002 -> DLE-004 -> DLE-005 -> DLE-003 -> DLE-006, plus DLE-010.
- **What R1 got wrong about itself:** five premise defects in its own briefs, found by
  builders after dispatch (see `dle-m5`); applications were written for the three landings
  only; the source-tree task row was skipped under the license.

### R5 - DLE-005, 2026-10-15 (run `dle-r5-1015`, memory lane)

Source note `librarian/sources/2026-10-15-cass-memory-system.md`. Two trees by one author:
`cass_memory_system` @ `12d20332` and its stricter successor `eidetic_engine_cli` @
`1679e0fa` (procedural-memory core only). Nineteen design entries; routing count cm 1 /
ee 3 NONE, all at one stage (outcome feedback) of `agent-memory`, so a technique and not a
forge. Siblings live: `dle-002-1015`, `dle-004-1015`, later `dle-r10-1015`.

- **Landed knowledge:** new technique `agent-memory/exposure-is-not-credit` - a run's
  verdict copied onto every delivered item is signed per run and unsigned per item;
  guards on blame do not repair the unit; credit flows only through a contrast, a
  deliberate use or a propensity weight; blame through use misfires where the item was
  right and the read or the grade was wrong; silence is neutral; offline tuning on shown
  items learns its own teacher. Amendments to `memory-value-model`, the golden path and
  `decay-and-forgetting` (a value-keyed bar also bars the negation). Two applications.
  Registry `e0bf45d0` (content), `5f38f4fc` (index, rules, catalog, built in a clean
  worktree; gate --all 25/25).
- **Memory lane, priced on the ladder:** model-free, over the recorded per-probe contexts
  of the service arm in both read modes. The source's attribution rule tracked delivery
  0.82/0.81 and carrying an answer 0.06/0.05; 25 of 36 and 23 of 33 proven items never
  carried one. Symmetric blame was worse. Use credit raised top-25 precision 0.36 -> 0.92
  (0.32 -> 0.96) and failed the declared floor, so the apply row is **not-better**; a post
  hoc variant without blame through use held it and is the next test. Instrument personas
  `d9343ca762`; row and harness backlog `c3cc02dcd0`.
- **The harness cannot rank a feedback-driven memory:** task outcomes are drawn at
  generation. So interval-bound trust transitions (the successor's posterior) and
  inverting a harmful rule into a warning are leads, with a closed-loop world as their
  return condition.
- **Peer study (personas brain):** 34 points, 1 adopt / 6 adapt / 20 keep ours / 7
  different forces, no proposals; personas `bc24fccb89`. The adopt: the always-on rule
  lane must report a failed query instead of silently dropping every conduct rule.
- **The charter's questions:** neither tree replaces or indexes his negative-results
  ledger, and neither measures retrieval on it; the successor keeps its own negative
  results unindexed too. Retry conditions: none in the first tree; 6 of 18 sampled
  decisions in the successor, plus a calendar deadline on deferrals. Banked as backlog
  row `dle-k7-retry-condition-on-rejections`.
- **What this round got wrong about itself:** the instrument's floor was written after a
  first look; two of its own sentences were wrong until the rows were read; the personas
  ledger commit swept one `dle-002-1015` row (intact, history not rewritten).

### DLE-002, 2026-10-15 (run `dle-002-1015`)

Source note `librarian/sources/2026-10-15-mcp-agent-mail-rust.md` (Rust @ `3821104c`, its
Python predecessor @ `47b8122e` read as design history). Eight design entries in five
systems: two NONE (an automated coordinator on an autonomy ladder; directed agent mail
with no broadcast), one CONTESTED (a no-wait partial grant against all-or-nothing
acquisition, resolved as a boundary); no forge handoff.

- **R1's question answered.** A lease names whole paths or globs, never lines. A file two
  agents both write has either one exclusive holder or any number of shared ones, and
  shared claims never block a commit. So the guard catches a co-written file only by
  arrival order: the first writer holds it and its commit passes carrying the second
  writer's lines. His exemption for the shared task tracker sits exactly where our
  hunk-level sweeps live.
- **His rule through the replay (arm B for `dle-m2b`): not-better on every arm.** 1,425
  mapped commits, branch `ab/lease-guard-replay` (`c0f626d8`, unlanded). Declared claims
  2/4 known sweeps at 0.07% clean; implied claims (every file reserved at first write)
  3/4, including the ledger-row sweep, at about 15% clean and about 230 refused grants a
  month; ledgers exempt removed that catch, as predicted; no lease arm saw abandoned work
  committed "as found". The inventory reference: 3/4 at 0.28%. `dle-m2b` updated: the
  content check for shared ledgers remains the direct fix.
- **Landed knowledge:** `concurrent-vcs/commit-time-claim-guard` (new; the inventory
  gates, a claim complements). Seven applications: the registry replay and six against the
  source tree (concurrent-vcs x2, data-access, audit-logging, fleet-orchestration,
  concurrency-guards). Commits `711e06d5`, `c46b252b` (index).
- **Applies:** ai-registry experiment not-better (the lease rule); personas experiment
  not-better as a falsifier (the inventory rule flagged 6.2%, nearly all unmodelled
  generators; the technique gained "the inventory is per tree"). During the run a sibling
  round's pathspec commit of personas' apply ledger carried this run's uncommitted row
  (`c3cc02dcd0`; fix on top `7368e66953`): the shared-ledger hunk sweep, live, on a second
  tree.
- **Premises the trees corrected (all in this charter):** the persistence order is not
  inverted (both versions write the database first; what inverted is which write decides
  success, and the guard reads the derived copy, which forced its re-coupling); "enforced
  only at commit" holds for the predecessor only (the rewrite refuses at grant); the
  predecessor is labelled superseded, but its repository name is the planned canonical
  home; personas has no worker-to-worker mail and no file leases, but has a hub every
  session reports to and machine-to-machine persona messaging; tracklight leases tasks,
  not files, with a fence on every write.
- **Backlog rows added (peer study, 34 points):** `dle-002-board-unreadable-record-fails`,
  `dle-002-beat-partial-grant`, `dle-002-evidence-liveness`, `dle-002-lock-fence`,
  `dle-002-refuse-broad-claims`. None changed in-session: three sibling rounds were on the
  same board and the bar is a paired run.
- **Leads:** L1 the automated coordinator (`llm-agent/orchestration/` is full), L2
  directed agent mail; both XL, escalated to the operator.
- **What this round got wrong about itself:** the declared focus checked this run's brief
  premises and they held, while the five wrong premises came from the charter the briefs
  inherited; the personas apply row was left uncommitted for a few minutes in a tree three
  sibling rounds were writing, which is how it was swept.

### DLE-010, 2026-10-15 (run `dle-r10-1015`, method round)

No new source note: the policy was read as R1's practised evidence, cited at the pin
`frankengit` @ `142adb9098d5`. The tree had moved three commits (to `b14667fa`), all
product code; `.beads/policy.yaml` and `AGENTS.md` are byte-identical, so `/intake --delta`
had nothing in scope and was not run. Clone deleted.

- **His policy, in our words, against ours.** Only a central verifier closes work, and a
  close must pass through a pending-verification state (`.beads/policy.yaml:2` "Only the
  batch-verify orchestrator closes work") - **keep ours, measured**: tier 2 below found no
  false self-grade, and his own verifier's 17-of-28 rework rate prices a seat we would have
  to staff. A pass claim must name the revision it was observed at (`AGENTS.md:340` "MUST
  name the commit SHA it was observed") - **adapt**: 386 of 665 `better` rows name a sha,
  tier 2 needs it, and one named a pre-rebase sha; backlog row `dle-010-row-names-landed-sha`.
  Evidence-bearing commands never silence stderr (`AGENTS.md:379` "Never silence stderr") -
  **keep ours, measured**: 200 of 245 code passes were status-masked, and in the re-runnable
  sample masking hid no breakage. Verifier independence is graded by dimension
  (`AGENTS.md:185` "Verifier independence is classified across workspace") - **adopt as a
  reading**: tier 2 is independent in workspace and context with the producer's oracle; the
  blind lane is independent in context, model family and oracle. The debt cap
  (`.beads/policy.yaml:41` "hard: 36") stays with `dle-m6-verification-debt-veto`.
- **Method A/B, tier 2: not-better.** Built on R1's tier 1 in a worktree of
  `ab/verdict-reverify`: `scripts/verdict-rerun.mjs` re-runs the gate a row relied on, alone
  and unmasked, in a clean detached worktree at the row's commit (hooks off, fresh install,
  the parent re-run on a failure), and writes scrubbed packets for a blind re-read where no
  gate re-runs. Tier 1 on today's ledger reproduced R1 exactly. Pre-registered sample of 25
  real rows + 4 planted: seeds 3/3, control reproduced; 18 real rows re-ran, 16 reproduced
  their pass, 2 were red before the change with identical failure sets at the parent, 0
  were broken by their change. Blind lane (one Claude, one GPT reader; 8 rows + 4 recorded
  not-better decoys): 8/8 supported by both, decoys 3 refused and 1 split. 0 of 26
  independent checks falsified a verdict. Rows: `librarian/applied.md`,
  `librarian/harvest/evaluations.md` (impact-null 2 of 2). Branch deleted; tier 2 was
  `213f02f6`.
- **What the independent pass found instead.** Tier 1 credited the wrong gate in 4 of 25:
  two arm probes the session never committed (one row says so itself), two broad suites
  already red. One row cites a pre-rebase sha; the change is on origin with the same
  patch-id. A gate run under a parent `node --test` exits 0 on a red suite - the planted
  end-to-end test caught that in the instrument before any real row ran. 7 of 25 rows could
  not be re-run at all (scratch inputs deleted, probes uncommitted, an unexpanded variable,
  live cloud credentials).
- **Answer to R1's B1.** The 396:4 producer grades against the blind lane's 4:6 are not
  explained by false self-grades in these samples (tier 1 plus tier 2, 95% upper bound about
  11.5% here). The likelier reading is selection - what reaches a code-mode A/B is small and
  checkable - and the harvest lane measuring a different question (a landing's impact on a
  fresh task). The verifier seat stays an occupancy problem (`dle-m6`), not a grading one.
- **What this round got wrong about itself.** Two classification rules were written after
  reading results (probe-not-in-commit; a credential signal replacing an "API key" match
  that hit test names), and the pre-registration's literal "reproduced-fail" would have
  counted the two already-red rows and called tier 2 better. Both disclosed in the rows.
