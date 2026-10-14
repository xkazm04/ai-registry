---
source: https://github.com/Dicklesworthstone/mcp_agent_mail_rust
kind: repository
url: https://github.com/Dicklesworthstone/mcp_agent_mail_rust
title: "Agent mail in Rust: a coordination server for agent swarms (mailboxes, expiring file claims, a commit guard), read with its Python predecessor as design history"
author: Jeffrey Emanuel (first-party practitioner; series DLE, round DLE-002)
commit: 3821104cce477cefb1eccf5592b76da9c45b1582
commit_date: 2026-10-14
evidence_trees: "mcp_agent_mail (Python predecessor) 47b8122e020493a14affcd2920a54faf3a8efc4c"
words: 19,070 landing / about 282,700 in-tree md (Rust) + about 98,400 (Python); about 31,000 read by the design reader, about 12,000 lines of code read across the guard, grant, storage and messaging modules; 0 fetches
extracted: 27 (8 design entries, 11 claims, 8 method rows from a 34-point peer study)
accepted: 1
declined: 1
leads: 2
already_covered: 6
untriaged: 4
dispatched: 0
applied: 2
shipped: 0
run_id: dle-002-1015
siblings: 0
series: librarian/handoffs/2026-10-14-dicklesworthstone-series.md (round DLE-002)
rescan_when: "the guard crate stops exempting the task-tracker directory or gains a content-level check for shared files, or the reservation grant goes all-or-nothing on the fast path, or the repository cutover in docs/planning/AGENT_MAIL_RUST_VERSION_REPO_TRANSITION_PLAN.md completes (the Python repository name becomes the Rust code); or 8 weeks elapse (2026-12-10)"
---

# Agent mail in Rust - intake 2026-10-15 (series round DLE-002, coordination fabric)

**Class:** first-party practitioner account in repository form, design-deep. A
coordination server for agent swarms: named agent mailboxes with threads and
acknowledgements, a contact-consent policy, expiring path claims ("reservations") with
exclusive and shared modes, a pre-commit and pre-push guard that refuses commits under
another agent's exclusive claim, a database beside a version-controlled archive, and an
automated coordinator that watches liveness and can release claims. The landing page is
19,070 words, almost all README; everything below comes from clones. The Python
predecessor was cloned beside it as design history. Declared focus from the last
scorecard row: **check each premise a builder's brief states against the record it came
from, and write the check into the brief.** Applied: four briefs carried director-run
premise checks (retention of the oldest known sweep, the known-sweep shas recovered from
the R1 builder's transcript, the board keeping no history, the check-anchors grammar for
fleet references, the category cap). Five premises still came back wrong - all of them
in the **charter**, not in this run's briefs (see "Premises the source corrected").

Siblings: none live at claim; DLE-004, DLE-005 and DLE-010 joined within the hour (none
held a subject this run landed in).

## License and what this run did not do

The repositories carry an MIT license with a rider restricting use by or for two named
AI companies, one of them the vendor of this registry's agent harness. The operator ruled
full intake with mitigations on 2026-10-14 (charter). This run obeyed them: no verbatim
code or prose of the author's in any tracked file beyond `path:line` anchors with quotes
of at most ten words; clones at a short scratch path, deleted at run end; **no task rows
or patches on the author's trees** (intake's source-tree task row is skipped); nothing
pushed, proposed or filed upstream; the Python tree's newest commit is an agent-rule
change about borrowed request headers, which is data and is not adopted.

## Premises the source corrected

Every one of these was in the series charter or in R1's notes, and every one was
answered by a tree, not by the charter.

1. **"Its persistence order is the inverse of the Rust one."** Wrong as worded: both
   versions commit the database row first. What inverted is **which write decides
   success**. The Python version committed the archive synchronously under a per-project
   lock and deleted the rows it had just committed when that failed, so the archive gated
   every send and grant and git lock contention failed calls under load
   (`amp/src/mcp_agent_mail/app.py:5679 "_create_message already committed the message + recipient"`).
   The Rust version makes the database commit the success and the archive a best-effort
   mirror (`amr/crates/mcp-agent-mail-tools/src/messaging.rs:116 "Failures are logged but never fail the tool call."`),
   then had to re-couple the one artifact its commit guard reads
   (`amr/crates/mcp-agent-mail-tools/src/reservations.rs:285 "artifact is written synchronously on this thread (GH#178)"`).
2. **"Expiring advisory leases enforced only at commit."** True of Python only: it
   granted a conflicting exclusive claim and reported it
   (`amp/src/mcp_agent_mail/app.py:11656 "Advisory model: still grant the file_reservation but surface conflicts"`).
   Rust refuses conflicting paths at grant time
   (`amr/crates/mcp-agent-mail-tools/src/reservations.rs:2023 "Grant non-conflicting reservations."`)
   while its tool description still says "advisory".
3. **"The superseded Python version."** The Python README says so
   (`amp/README.md:3 "This Python version is no longer maintained"`), and its latest commit
   is housekeeping; but the transition plan makes the Python repository's name the
   canonical home after a cutover that has not happened
   (`amr/docs/planning/AGENT_MAIL_RUST_VERSION_REPO_TRANSITION_PLAN.md:53 "Canonical repo after cutover"`).
4. **"personas fleet messaging (no peer mail, no file leases)."** Half right: no file
   claims, deliberately (unattended work always gets its own worktree), and no
   worker-to-worker mail, but there is machine-to-machine persona messaging and a hub
   coordinator every fleet session reports to. Interactive fleet sessions may share one
   working directory with no coordination at all, which is this source's target setting.
5. **"tracklight device relay (leases, fencing)."** The leases are on tasks, not files,
   and each carries a fence every later write must match.

## Design record

Anchor root: the run's clone directory holding `amr` (Rust @ `3821104c`) and `amp`
(Python @ `47b8122e`). Anchors verified with `check-anchors.mjs` by the director (see the
end of this note). Depth-1 clones; no history read beyond in-tree records.

**D1. A grant takes what is free, refuses the rest, and never waits.**
- decision: a claim call grants every requested path no other agent holds in a
  conflicting mode (exclusive conflicts with any holder, shared only with exclusive),
  returns the rest as conflicts, re-checks inside one write transaction, and on a race
  caught there grants nothing.
- forces: a pooled read snapshot can be stale (a pre-check alone admitted two exclusive
  holders); agents die mid-task, so a waiting acquire holds one agent hostage to another.
- buys: no overlapping claims where one is exclusive, under any interleaving.
- rejects: queued acquisition (`amr/README.md:243 "Acquiring a reservation reports conflicts instead of waiting"`).
- where: `amr/crates/mcp-agent-mail-tools/src/reservations.rs:1923 "If request is exclusive, we conflict with ANY existing reservation"`;
  `amr/crates/mcp-agent-mail-tools/src/reservations.rs:2027 "due to a stale WAL read snapshot"`;
  `amr/crates/mcp-agent-mail-db/src/queries.rs:14358 "serialize reservation checks and prevent TOCTOU races"`.
- stage: grant. corpus: **CONTESTED, resolved as a boundary** - `concurrent-vcs`
  (`sub-file-claim-scope`) says acquire a set all or nothing and release before waiting.
  A no-wait grant meets the rule inside one call, but a caller holding a partial grant
  that polls for the rest is hold-and-wait one level up; the README concedes claims do
  not prevent deadlocks and the coordinator exists partly to detect them
  (`amr/README.md:1242 "ATC is the built-in operator that reviews agent liveness, detects reservation"`).

**D2. One shared tree; the claim refused at the commit by a hook.**
- decision: agents share one checkout; claims are declared before editing and enforced
  by an installed hook that reads the derived claim records and refuses a staged path
  under another agent's live exclusive claim. Shared claims and the task-tracker
  directory never block.
- forces: worktrees, in the author's account, slow agents and diverge; an edit-time lock
  cannot bind an agent that edits files directly; the commit is the one step every change
  passes.
- buys: a commit touching another agent's exclusively claimed path is refused.
- rejects: worktrees and hard locks (`amr/README.md:186 "Advisory file reservations instead of hard locks."`).
- where: `amr/crates/mcp-agent-mail-guard/src/lib.rs:2325 "if res.exclusive && !res.agent_name.eq_ignore_ascii_case(self_agent)"`;
  `amr/crates/mcp-agent-mail-guard/src/lib.rs:15 "const DEFAULT_EXEMPT_PATH_PREFIXES"`;
  `amr/crates/mcp-agent-mail-tools/src/reservations.rs:1418 "Expired, released, and shared reservations do not block."`.
- stage: commit. corpus: `concurrent-vcs/physical-isolation` models the regime (R1); the
  guard's mechanism is modelled nowhere. **Landed as `commit-time-claim-guard`.**

**D3. Claim persistence: database first, the hook's record before the reply, healed on
the next access.**
- decision: a claim commits to the database, then writes this claim's record
  synchronously (temp name, sync, rename) before replying; a failed active write is left
  to heal on the next claim call, never queued; records carry a database generation.
- forces: two readers trust opposite stores (other agents' grants read the database, the
  hook reads the archive); flushing the shared write queue to confirm one record stalled
  grants for tens of seconds.
- buys: when a grant returns, the hook can see it; a released claim can never be
  resurrected by a late retry.
- rejects: archive-first writes (`amr/docs/planning/SYNC_STRATEGY.md:17 "The original design aspired to archive-first writes"`).
- where: `amr/crates/mcp-agent-mail-tools/src/reservations.rs:303 "which turned every reservation grant into a"`;
  `amr/crates/mcp-agent-mail-tools/src/reservations.rs:1864 "F1 reconcile-on-read: before granting, heal any"`;
  `amr/crates/mcp-agent-mail-tools/src/reservations.rs:443 "Stamp the DB generation token (br-n8qh6)"`.
- stage: persistence. corpus: `data-access/existence-authority-written-last` models the
  forces; the twist (two reader classes with opposite authorities, so no single order is
  right for both) is untriaged U2.

**D4. A send's delivery is one database transaction; the archive is a counted
best-effort mirror that is also the recovery source.**
- decision: message and recipients commit in one transaction; archive copies follow off
  the request path through a queue, then a journal, then drop-and-count.
- forces: a version-control commit is multi-step and cannot roll back; archive writes
  add a long tail; archive failure must not stop agents talking.
- buys: a send never waits on the archive; every unmaterialized operation is journaled,
  dead-lettered or counted.
- rejects: synchronous archive writes (`amr/docs/planning/SYNC_STRATEGY.md:24 "Blocking on archive would make every tool call 100x slower."`).
- where: `amr/crates/mcp-agent-mail-storage/src/lib.rs:1625 "On backlog overflow (or a journal-write failure) the op is dropped"`;
  `amr/crates/mcp-agent-mail-db/src/reconstruct.rs:1 "database from the Git archive."`.
- stage: persistence. corpus: `audit-logging/best-effort-with-accounting` models the
  forces; using that mirror as the disaster-recovery source is untriaged U3.

**D5. A stale claim is reclaimed on activity evidence, not on silence.**
- decision: before expiry a peer may force-release a claim only when the holder is
  inactive and no mail, file-system change or version-control activity touched the
  claimed paths within a grace window.
- forces: agents vanish, but a quiet agent may be mid-edit.
- where: `amr/crates/mcp-agent-mail-tools/src/reservations.rs:2924 "Reservation still shows recent activity; refusing forced release."`.
- corpus: `fleet-orchestration/evidence-outranks-a-liveness-claim` - **already covered**.

**D6. The automated coordinator observes by default and acts only by opt-in.**
- decision: a built-in coordinator estimates each agent's liveness from its own rhythm,
  detects claim deadlocks and can probe or release; it ships in shadow mode, with
  dry-run, canary and live as opt-ins, replays a changed policy against recorded history
  before it goes live, and scores each decision against what the agent later did.
- forces: a fresh daemon that wrote liveness mail and released claims by default put a
  learner's errors into every agent's inbox (`amr/CHANGELOG.md:2237 "ATC no longer writes liveness-mail by default (GH#264)."`).
- where: `amr/README.md:1255 "observe/decide, emit nothing durable"`;
  `amr/docs/SPEC-atc-core-contract.md:17 "The lifecycle is an 11-state directed automaton"`;
  `amr/docs/ATC_POLICY_SIMULATION.md:3 "read-only dry-run surface for testing a proposed"`.
- corpus: **NONE**. Nearest: `fleet-orchestration` (lifecycle signals detect a silent
  session; nothing acts on sessions on a staged autonomy ladder and scores itself);
  `session-continuation/advisory-guard-fail-mode`. Home-if-new: `llm-agent/orchestration/`,
  **full at 10 subjects**, or `agent-operations/coordination/`. Lead L1.

**D7. No broadcast; explicit recipients, a stored-once project mailbox, consent links.**
- decision: broadcast is refused; a project address stores one message every agent reads
  with its own read state; recipients carry a contact policy, and cross-project mail needs
  an approved link.
- forces: given broadcast, agents overuse it and every unneeded message costs each
  recipient context (`amr/README.md:180 "many agents will overuse broadcast-style messaging"`).
- where: `amr/crates/mcp-agent-mail-tools/src/messaging.rs:1916 "broadcast=true is intentionally unsupported to prevent agent spam."`;
  `amr/crates/mcp-agent-mail-tools/src/messaging.rs:888 "no per-agent rows, signals or archive copies are fanned out"`.
- corpus: **NONE**. Nearest: `agent-operations/coordination/shared-research-record`
  (one record every session reads, which is the broadcast shape this tree refuses, right
  where every session needs the frontier). Home-if-new: `agent-operations/coordination/`.
  Lead L2.

**D8. Every version-control call takes a per-repository in-process mutex, then an OS
lock on a private sentinel.**
- forces: a tool release corrupted repositories when several processes read the index
  while one rewrote it (`amr/docs/GIT_251_FINDINGS.md:20 "The bug corrupts user repos in the process"`).
- rejects: one global mutex (`amr/docs/DESIGN_git_lock.md:242 "Rejected: destroys cross-repo parallelism, which the mailbox"`).
- corpus: `concurrency-guards/cross-process-exclusion` - **already covered**.

### Routing count

| System | Entries | NONE | CONTESTED | Modelled |
| --- | --- | --- | --- | --- |
| Claims + guard | D1, D2, D5 | 0 (D2's mechanism had no technique) | 1 (D1) | D2 concurrent-vcs, D5 fleet-orchestration |
| Persistence | D3, D4 | 0 | 0 | data-access, audit-logging |
| Version-control substrate | D8 | 0 | 0 | concurrency-guards |
| Coordinator | D6 | 1 | 0 | - |
| Messaging | D7 | 1 | 0 | - |

Per system at most one NONE; across systems two share a home-if-new
(`agent-operations/coordination/`). Neither clause reaches three, so **no forge handoff**.
One modelled subject lacked the mechanism (D2), which is a technique, not a subject.

### Where the tree contradicts itself (the operating half)

Eleven, from the design reader; the four that matter for a reader of this corpus:

- **Which store is the truth.** The planning architecture says the archive
  (`amr/docs/planning/PROPOSED_ARCHITECTURE.md:7 "Git-backed archive remains the source of truth"`);
  the consistency contract says the database (`amr/docs/planning/SYNC_STRATEGY.md:8 "**Primary**: SQLite database"`);
  the durability spec still calls the archive authoritative
  (`amr/docs/SPEC-mailbox-durability-states.md:101 "Archive source-of-truth is also corrupted/unreadable"`).
  The code makes the database authoritative for live writes and the archive for recovery.
- **"Always rebuildable" over an archive that drops operations**
  (`amr/docs/planning/SYNC_STRATEGY.md:12 "DB is always rebuildable from archive if corruption occurs"`
  against `amr/crates/mcp-agent-mail-storage/src/lib.rs:1625 "On backlog overflow (or a journal-write failure) the op is dropped"`).
- **"Advisory" over code that refuses** (`amr/README.md:1905 "Advisory, not enforced."`), and
  "exclusive" meaning refuse in claims but inform in build slots
  (`amr/crates/mcp-agent-mail-tools/src/build_slots.rs:352 "Advisory conflicts still return a granted lease"`).
- **The consistency contract's per-tool table is stale against the code** and still calls
  itself the authoritative reference (`amr/docs/planning/SYNC_STRATEGY.md:3 "Authoritative reference for write ordering, crash safety"`).

The rest: the durability spec's seven states against a runtime of four; an incident
closure counting 62 items in its summary and 52 in its table; a design note's mandatory
review left unfilled while its code shipped; a send tool description promising archive
persistence over a best-effort writer; "no worktrees" beside worktree machinery.

## Triage (Phase 5, v2.5 scored)

Expected yield for a design-deep practitioner repository whose subject the corpus already
models (R1 landed the regime): one or two techniques and several catches; the system
itself is not forge-shaped because its subjects exist. Rule per row: upper-layer rows
scored; leads under the corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D2 | K | technique | M | How a commit-time claim guard reads, refuses and fails | concurrent-vcs/physical-isolation (names it, models nothing) | new-technique | real gap | 4/0/2 | **accept** (G: new technique 2, +1 convergence with R1's inventory replay, +1 refutes the precondition's rule as sufficient; R: tree read by the director, claim measured in-run) |
| D1 | K | amendment | S | A no-wait partial grant moves hold-and-wait into the caller | concurrent-vcs/sub-file-claim-scope | corrects-claim | partial | 1/0/1 | untriaged U1 (boundary, single source) |
| D3 | K | amendment | S | Two reader classes, opposite authorities | data-access/existence-authority-written-last | new-technique | partial | 1/0/1 | untriaged U2; its enforcer half absorbed into D2 |
| D4 | K | amendment | S | A best-effort mirror that is also the recovery source | audit-logging/best-effort-with-accounting | corrects-claim | partial | 1/0/1 | untriaged U3 |
| D5 | K | technique | - | Reclaim on activity evidence | fleet-orchestration/evidence-outranks-a-liveness-claim | none | catch | - | already covered |
| D6 | K | subject | XL | An automated coordinator on an autonomy ladder | NONE (category full) | new-subject | real gap | E4 | lead L1 (escalated: XL, and V1 on the natural home) |
| D7 | K | subject | XL | Directed agent mail without broadcast | NONE | new-subject | real gap | E4 | lead L2 (escalated: XL) |
| D8 | K | technique | - | Per-repository lock on a private sentinel | concurrency-guards/cross-process-exclusion | none | catch | - | already covered |
| C1 | K | technique | - | Sync outside the fence, hold it for the rename | concurrency-guards/critical-section-across-a-suspension | none | catch (opened) | - | already covered |
| C2, C5-C8 | K | technique | - | Flush barrier; bracket matcher; unfound storage; shared default; heal needs reads | (D2) | - | - | - | absorbed into D2 |
| C3 | K | currency | - | A tool release corrupts the index under concurrent readers | harness-fault-attribution; D8 | none | catch | - | already covered; this fleet runs an unaffected release (2.43) |
| C4 | K | technique | - | A stale read snapshot let a pre-check miss a conflict | concurrency-guards/preparation-is-the-staleness-window (opened) | none | catch | - | already covered |
| C9 | K | - | - | Coordinator acted by default | (D6) | - | - | - | absorbed into L1 |
| C10 | K | - | - | A write mode kept because it passed, not because it won | - | none | thin | - | declined: nothing survives the strip but an honesty habit the corpus already states |
| C11 | K | technique | - | A failed claim read names the do-not-edit set | concurrent-vcs/sub-file-claim-scope (refusal and failure spelled differently) | none | catch (opened) | - | already covered |
| P8 | S | script | M | His lease rule at the commit, replayed as arm B | scripts/commit-inventory-replay.mjs | - | - | - | **measured: not-better** (Method A/B) |
| P1-P5 | S | script | S | Board fixes from the peer study | scripts/run-board.mjs | - | - | - | backlog (rows below) |
| P6 | S | script | S | A shared claim mode | scripts/run-board.mjs | - | likely thin | - | untriaged U4 (measure refusals first) |
| P7 | S | script | S | `unlock --force` judged on evidence | scripts/run-board.mjs | - | - | - | folded into backlog row P3 |

auto=1/4/2 (escalated D6, D7 as XL; V1 also binds D6's natural home), fp=0.

## Accepted (landed)

- **`concurrent-vcs/commit-time-claim-guard`** (new technique). Its central rule
  inverts the precondition R1 landed: the session's own write inventory gates the commit,
  and a claim complements it, never replaces it. It states what a claim protects in a
  file two sessions both write (arrival order, not content), why every-writer ledgers
  defeat a path guard in both directions, why the lease is checked only for commits from
  the shared tree, the four rules for a hook that reads a derived copy, one matcher for
  grant and guard, the fail directions (default on, unreadable refuses, absent warns,
  truncated refuses, identity checked live, bypass first), and replay before enabling.
  Corroboration: code read in the tree by the director and two workers, plus this
  registry's own replay; no fetch. Golden path: techniques list, the invariant on the
  shared tree, and `physical-isolation`'s discriminator bullet now point at it (an
  append; their sentences stay true).
- Applications: `process--commit-time-claim-guard--ai-registry` (the replay, experiment,
  not-better for the lease rule) and six against the source tree (see Applied).

## Method A/B (the operator's bar)

**P8 - the source's commit-time lease rule, replayed over our history as arm B.** Built on
the unlanded branch `ab/lease-guard-replay` (`c0f626d8`, two files, 27 tests pass) in a
short-path worktree. One run of one parser over 1,425 mapped commits
(2026-09-14..10-14, all project folders):

| arm | refused real | known sweeps (of 4) | unrecorded (of 2) | clean refused |
| --- | --- | --- | --- | --- |
| A, no guard | 0 | 0 | 0 | 0 |
| own inventory (R1's B) | 8 | 3 | 2 | 0.28% |
| declared claims | 3 | 2 | 1 | 0.07% |
| declared, ledgers exempt | 3 | 2 | 1 | 0.07% |
| implied claims (every file reserved at first write) | 218 | 3, incl. the ledger-row sweep | 2 | about 15% |
| implied, ledgers exempt | 40 | 2 | 2 | 2.6% |

Target (4 of 4) and floor (at most 2% clean) were declared before the run. **Verdict:
not-better on every lease arm**; the change is discarded and the branch is kept, named,
for the backlog row. What the reading of every refused row showed: a lease protects a
co-written file by arrival order (the ledger-row sweep was caught only because the victim
wrote first); the exemption the source uses for its tracker removes exactly that catch,
as predicted; lapsed claims see nothing of abandoned work committed "as found"; 154 of 218
implied refusals came from private worktrees; and the implied arm would have cost about
230 refused grants a month, half on ledgers. The builder corrected nothing in the brief's
premises; it overrode one rule (planted replicas get a synthetic holder, reported as by
construction).

Backlog row `dle-m2b-declared-inventory-guard` updated: the lease rule is not its
alternative arm; the content check for shared ledgers remains the direct fix; a narrow
"in-flight holder wrote this ledger first" signal is a hypothesis for that row, untested.

## Applied (Phase 7.5)

| technique | project | mode | verdict | note |
| --- | --- | --- | --- | --- |
| commit-time-claim-guard (lease rule as the guard) | ai-registry | experiment | not-better | the Method A/B above; seam: every mapped commit |
| commit-time-claim-guard (inventory rule, second tree) | personas | experiment | not-better | seam chosen to falsify: interactive fleet sessions may share one working directory with no coordination. The shipped replay over the same window: 2,185 commits in retention, 1,459 mapped; 90 flagged (6.2%, floor 2% failed). Every flagged path classified by whether the commit's added lines carried lines the hinted other writer had written: 2 commits did, both deliberate landings of a sibling's leftover work (one landed files a previous commit's status-derived staging list had dropped, which had broken the build); 23 hinted and located with no foreign lines; 23 hinted with the writer's transcript not located (unknown, not clean); 42 no other writer at all (regenerated maps, scripted deletions, locale files written by scripts). Target (an undeclared sweep refused) had nothing to refuse. What it refuted: "inventory first" holds only with the tree's generators declared; the technique gained that boundary. What a caught outcome would have taught: that shared-directory interactive sessions sweep each other there too |

**A live sweep during the run.** This run's personas apply row was appended to that
tree's `.ai/applied.jsonl` and, before it was committed, a sibling series round's
pathspec commit of the same ledger (`c3cc02dcd0`) carried it beside the sibling's own
row. The content was this run's and correct, so it was not backed out; a punctuation fix
landed on top (`7368e66953`). It is the shared-ledger hunk sweep on a second tree, a day
after the replay window closed with none recorded there, and no path rule would have
refused it: the sibling had written the file too.

## Peer study (the source's coordination fabric against ours)

34 points against the run board, personas and tracklight (scratch study, fleet paths kept
out of this note). Verdict counts: adopt 4, adapt 6, keep ours 17, different forces 7. The
run board is better than the source at: one matcher for claim and check with its broken
cases asserted on every call; reclaim judged on evidence the holder's execution wrote, with
a measured breaker race fixed; single-writer records; sub-file protection for shared
ledgers (lock, re-read, head-plus-rows staging), a class the source exempts entirely; and
replay before enabling, which the source's tree shows no equivalent of. The source is
better at: refusing over-broad claims (it moved from warn to refuse); treating an
unreadable state as a failed check; counting every acting call as liveness; on by default
with only an explicit false disabling it. tracklight has the one mechanism neither has: a
fence on every write.

**Backlog rows added** (each with its A/B in `librarian/harvest/backlog.jsonl`):
`dle-002-board-unreadable-record-fails` (P2), `dle-002-beat-partial-grant` (P4),
`dle-002-evidence-liveness` (P3, with P7), `dle-002-lock-fence` (P5),
`dle-002-refuse-broad-claims` (P1). None was changed in-session: three sibling rounds were
live on the same board, and the series bar requires the paired run.

## Leads

- **L1 - an automated coordinator on an autonomy ladder** (D6). Return condition: a fleet
  project grows an automated actor that acts on live sessions (releases, probes,
  reassigns), or a second independent source ships one with its outcome scoring; and a
  taxonomy decision on `llm-agent/orchestration/` (full) or a home in
  `agent-operations/coordination/`. Escalated to the operator as XL.
- **L2 - directed agent mail without broadcast** (D7). Return condition: a fleet project
  adds worker-to-worker messages (personas routes everything through a hub today), or a
  second source. The discriminator to carry: a shared record every session reads is right
  when every session needs the frontier; directed work, where most messages are
  irrelevant to most agents, refuses broadcast. Escalated as XL.

## Already covered

D5 (`fleet-orchestration/evidence-outranks-a-liveness-claim`), D8
(`concurrency-guards/cross-process-exclusion`), C1
(`concurrency-guards/critical-section-across-a-suspension`, opened), C3 (host contention
in `harness-fault-attribution/clear-the-environment-first`; the mechanism is D8; this
fleet runs version 2.43, outside the affected release), C4
(`concurrency-guards/preparation-is-the-staleness-window`, opened), C11
(`concurrent-vcs/sub-file-claim-scope`, refusal and failure spelled differently, opened).

## Untriaged (nobody verified these; they carry no judgment)

| # | candidate | anchor | home | why not scored through |
| --- | --- | --- | --- | --- |
| U1 | A no-wait partial grant moves hold-and-wait into the caller's retry loop | `amr/README.md:1242 "ATC is the built-in operator that reviews agent liveness, detects reservation"` | concurrent-vcs/sub-file-claim-scope | boundary case, GAIN 1, single source |
| U2 | When two reader classes trust opposite stores, no single write order is right for both; pick per direction which half-state is the safe one | `amr/crates/mcp-agent-mail-tools/src/reservations.rs:331 "authoritative and the archive is best-effort"` | data-access/existence-authority-written-last | boundary case, GAIN 1; the enforcer half landed in D2 |
| U3 | A best-effort mirror used as the recovery source turns its loss budget into a recovery loss | `amr/docs/planning/SYNC_STRATEGY.md:12 "DB is always rebuildable from archive if corruption occurs"` | audit-logging/best-effort-with-accounting | boundary case, GAIN 1, single source |
| U4 | A shared claim mode for the run board | `amr/crates/mcp-agent-mail-tools/src/reservations.rs:1924 "If request is shared, we only conflict with existing EXCLUSIVE"` | scripts/run-board.mjs | worth it only if refusals include reader-writer pairs; count first |

## Directions

None (charter: no Phase 7.6 directions for personas in this series; no other project's
scope was read for direction). `directions=n/a`.

## Corrections and catches about the source class

- **A charter's premises are a brief too.** The declared focus aimed the premise check at
  this run's briefs, and they held; the five wrong premises were in the charter the
  briefs inherited. The persistence-order claim, the most specific one, was wrong in
  mechanism and right that something inverted - the case the corroboration section calls
  a source that located something true while explaining it wrongly, applied to our own
  charter.
- **A rewrite's history is the cheapest A/B a source carries.** The predecessor and the
  rewrite made opposite choices on success authority, grant semantics and guard fail
  direction, and the rewrite's comments name the incidents that moved each one. Read
  side by side, they settled what neither tree's prose did.
- **Docs written for the predecessor survive in the rewrite.** The rewrite's tool
  description still states the predecessor's advisory grant semantics word for word in
  spirit, and its consistency contract still calls itself authoritative over a table the
  code no longer matches. A reader who trusts the description gets the enforcement model
  backwards.

## Anchor check

`check-anchors.mjs` over this note with the run's clone directory as root, by the
director: 45 anchors, 45 held, exit 0. The worker reports behind it held 116 (design),
98 (history), 71 (peer study) and 10 (A/B) quoted anchors, each checked by its worker and
all four re-run by the director (295 of 295 held).
