# cloud(261006-bfe02a): upstream delta deer-flow 08b27ae..53df22b

Run id: `intake-deer-flow-1006-v3`. Method: `/intake --delta`, following
`docs/upstream-brief.md` (intake 2.15.0). This was a cloud session in a fresh
clone with no fleet. Branch: `claude/cloud-261006-bfe02a`, created from `main`
at `a26bd81` as the landing contract requires. The session harness had also
named a development branch, `claude/deer-flow-delta-rescan-hdyroi`. The
landing contract says it overrides the brief, so that branch was not used and
nothing was pushed to it.

## Outcome in one paragraph

The prediction held. Citation repairs dominate. All 7 applications that cite
this tree were re-opened at `53df22bd` and re-pinned. One claim was withdrawn,
because it was wrong at the old pin as well. One figure was corrected. Three
quotations were retired after upstream compressed its module guides. One
amendment landed from a Fixed-list reversal. Two field incidents (#6354,
#6307) show the completion-claim technique's "fall back to the meta status
when the exit marker is missing" producing false passes. The tree fixed each
rewriter and kept the fallback. The amendment fixes it at the checker. The
custody clause fired in substance. It is escalated (taxonomy change plus an
XL row), not forged. No subject landed. No fleet apply ran (cloud).

## Delta

- `08b27aef..53df22bd` - 2029 files, +331,398 / -14,997, 34 days, 740 commits.
  Markdown alone: 124 files, +27,562 / -1,209.
- `main` had not moved from `53df22bd` when fetched; that sha was read.
- **Pin selection, proposed fix (not edited):** `upstream-check.mjs` reported
  `a5ec7f28`, the oldest of the three pins. In `loadRepos()`
  (`scripts/upstream-check.mjs:310-323`), notes for one repo are merged with
  `rec.minedOn >= prev.minedOn ? [rec, prev] : [prev, rec]`. All three
  deer-flow notes share the filename date `2026-09-02`, so a tie goes to
  whichever note `readdir` returns last. `2026-09-02-deer-flow.md` sorts after
  both `-v2*` names, because `.` (0x2e) sorts after `-` (0x2d). The kept
  note's pin then wins, because a pin is only borrowed from the dropped note
  when the kept one has none.
  Proposed fix: on equal `minedOn`, prefer the note whose frontmatter names
  the other in `prior_notes` / `prior_note` / `prior_scan`. Failing that,
  prefer the note whose `run_id` or slug carries the higher `-vN`. A
  self-test row should go with it: three same-day notes must select the one
  that cites the other two. The new note's date (`mined_on: 2026-10-06`)
  makes the next sweep correct regardless.

## Expected yield (said before Phase 5) vs actual

| | predicted | actual |
| --- | --- | --- |
| citation repairs | 7 applications re-pinned; at least 1 citation rewritten; 0-1 withdrawn | 7/7 re-pinned; 3 quotations rewritten or retired; **1 claim withdrawn**; 1 figure corrected |
| amendments | 1-2 from Fixed-list reversals; the rest untriaged by the +2 threshold | 1 landed; 11 rows untriaged |
| custody clause | fires; escalated rather than forged | fired in substance; escalated (E2 + E4) |
| subjects | 0 | 0 |

The surprise was where the withdrawal came from. Upstream did not move under
it. A forge worker's claim at `08b27aef` was wrong at that commit too, and a
reader asking a different question found it.

## citations_reopened: 7 / 7 / 1

Counted per application, as checked / re-pinned / withdrawn. 112 anchors were
mapped old -> new with a line-level diff and content compared. 101 were
byte-identical at a new line number. Every claim held except the one
withdrawn.

- `knowledge/software-engineering/llm-agent/orchestration/fleet-orchestration/applications/python--completion-claim-verification.md`:
  re-pinned. Figure corrected: about 1,500 words, never 4,800. Added the
  fallback section with #6354/#6307 and the judge layer's continued absence.
- `knowledge/software-engineering/llm-agent/runtime-and-io/agent-runtime-assembly/applications/python--operator-tier-code-loading.md`:
  re-pinned, 32 anchors. **Withdrawn:** "the service-writable model has no
  such field ... the key cannot be expressed there". `ExtensionsConfig.middlewares`
  names code from the API-writable `extensions_config.json` at both commits.
  It is now recorded as a deviation.
- `knowledge/software-engineering/llm-agent/runtime-and-io/agent-runtime-assembly/applications/python--semantic-hook-placement.md`:
  re-pinned, 32 anchors; 3 quotations rewritten.
- `knowledge/software-engineering/llm-agent/runtime-and-io/agent-runtime-assembly/applications/python--checkpoint-mode-custody.md`:
  re-pinned, 27 anchors. Lineage text moved to `THREAD_LIFECYCLE.md`. The
  deviation still holds. Added the metadata-only door and the retention
  contract.
- `knowledge/software-engineering/backend-platform/data-layer/data-access/applications/python--layering-rules.md`:
  re-pinned, 3 anchors.
- `knowledge/software-engineering/backend-platform/work-execution/job-coordination/applications/python--lease-renewal.md`:
  re-pinned, 7 anchors. The scheduler claim was re-cited from a guide line to
  the code (`recover_expired_launch_claims`).
- `knowledge/llm-observability/telemetry-and-data/llm-call-telemetry-model/applications/python--server-owned-fields.md`:
  re-pinned, 7 anchors. Three quotations are now marked as `08b27aef`-only.

## rescan_when clauses, decided

| clause | verdict |
| --- | --- |
| released 2.1.0 changelog section | **fired** (2026-09-24, tag `v2.1.0`); Fixed lists swept; 6 receipt/acceptance field corrections |
| judge layer lands | did not fire (guide still defers to "the PR5 judge") |
| second source on persistent-shell provenance | did not fire (a delta of one tree cannot fire it) |
| 8 weeks (2026-10-28) | not yet |
| third custody decision (memory/skills/channels/config guides) | **fired in substance, outside the named guides**: retention (#5255, draft contract), fork clears out-of-checkpoint archive refs, lineage-bound agent binding |

The new note's `rescan_when`: a released 2.2.0 section; or the retention
contract leaves draft or gains a production trigger; or the PR5 judge lands;
or 8 weeks elapse (2026-12-01).

## Landings

- `knowledge/software-engineering/llm-agent/orchestration/fleet-orchestration/techniques/completion-claim-verification.md`:
  amendment "That fallback may refuse a pass; it may never grant one", plus
  one decision rule. Scored GAIN 2 / RISK 0 / COST 1 as an append. The
  alternative reading treats it as a rewrite (3/2) and would bank it
  untriaged; that reading is recorded in the source note for the operator.
- The seven applications above (currency and corrections).
- `librarian/sources/2026-10-06-deer-flow-v3.md` (new source note, delta
  frontmatter, mandatory `rescan_when`).
- `librarian/subjects/software-engineering/{fleet-orchestration,agent-runtime-assembly,data-access,job-coordination}.md`
  and `librarian/subjects/llm-observability/llm-call-telemetry-model.md`
  (appended sections).
- `librarian/runs/intake-deer-flow-1006-v3/result.json` (written through
  `scripts/lib/run-result.mjs`; `pr: null`, because the commit cannot name its
  own PR).
- Regenerated: `knowledge/software-engineering/index.json`,
  `knowledge/llm-observability/index.json`, `catalog.json`.
  `build-knowledge-rules.mjs` reported every rule file current, so it
  produced no diff.

## Declines and untriaged

**Declines: 0.** Nothing was ruled against. Rows below the threshold are
untriaged with anchors in the source note, not declined:

- release follows the work when the body outlives its caller (concurrency-guards; 1/0/1)
- a partial view's full-file token authorizes a patch, never an overwrite; a no-content read stamps nothing (write-freshness-gate; 1/0/1)
- keep renewing until the durable terminal write is attempted (lease-renewal; 1/1/1)
- model-visible artifact handles that survive compaction (D9; 2/1/2, promotion read owed)
- archive-at-compaction with citable ids (prompt-assembly; 2/3/1; memory-lane rule: re-run as an arm before citing its numbers)
- config-unavailable is not authorization-disabled; operator code in the browser; remove every encoding of a dropped tool call; per-claim fencing tokens; reserve before the side effect; tombstone an ambiguous create (each GAIN <= 1)

**Escalated (operator):** the conversation-state custody subject (E2: moving
`checkpoint-mode-custody` is a corpus-wide link rewrite; E4: XL). The proposed
shape is in the source note under "Escalated". It is held until the retention
contract leaves draft.

## Open questions for the operator

1. Should row 1 be read as an append (landed) or a rewrite (untriaged)? The
   wording keeps the standing sentence intact so either reading can stand.
2. Should the custody split be dispatched now, or held until the retention
   contract ships? The rescan condition holds it by default.
3. intake SKILL.md Phase 9 says "A `--delta` re-scan of the same source
   updates the original note rather than opening a second one", while
   `docs/upstream-brief.md` and this dispatch say to write a new `-vN` note.
   This run followed the brief and the dispatch. Which one should win?

## Gate

`node scripts/gate.mjs --lane knowledge` (exit 1) - tail:

```
  knowledge/game-production/systems-canon/realtime-combat-semantics/applications/process--start-protection-window.md:13: C:\Users\...

check-public-paths: 36 machine home path(s) in 8466 published file(s).
Write a repo-relative path (`<project>/src/x.ts`) or a placeholder (`<vault>`). Absolute roots belong in .machine.local.json.

gate FAILED at scripts/check-public-paths.mjs - exit 1 (VIOLATIONS)
2 step(s) passed before it; 5 not run.
```

All 36 violations are under `knowledge/game-production/`. None names a file
this run touched. The 2 steps that passed first are `check-bundles.mjs` and
`check-public-paths.mjs --self-test`. The remaining steps were run one by one:

| step | exit | tail |
| --- | --- | --- |
| `node scripts/build-index.mjs --check` | 0 | index is current |
| `node scripts/build-knowledge-rules.mjs --check` | 0 | rules are current |
| `node scripts/review-coverage.mjs` | 0 | 513 subjects; 393 pending, 71 reviewed, 49 stale, 0 invalid (identical on the base commit) |
| `node scripts/check-hash-stability.mjs` | 0 | generated output is checkout-stable |
| `node scripts/build-catalog.mjs --check` | 0 | catalog.json is fresh - 11 bundle(s) indexed |

`node scripts/check-anchors.mjs librarian/sources/2026-10-06-deer-flow-v3.md --root <53df22bd clone>`
gave 35 anchors: 1 held, 19 unquoted, 0 moved, 0 absent, and 15 missing-file.
Every missing-file is a shortened path (`subagents/AGENTS.md:50`), the same
convention the prior notes use, and the instrument cannot resolve it. Each of
those anchors was opened by hand. The full skill gate (`gate.mjs --all`) was
not run: this run touched no skills, recipes or other lanes.

## Ledger rows

These are for the Director to append after merge. They are verbatim and
were not appended here.

`librarian/sources/index.md`:

```
| 2026-10-06 | `github:bytedance/deer-flow` @ `53df22bd` (v3 delta of `08b27aef`) | **vendor repository**, delta re-scan in a cloud dispatch; 740 commits, CHANGELOG 14k -> 72k words with a released 2.1.0. **Re-scan when** a released 2.2.0 section appears; or the checkpoint-retention contract leaves draft or gains a production trigger; or the PR5 judge lands; or 2026-12-01 | ~528,000 in-tree md; ~60,000 read | 17 | 1 | 4 | 3 | [[2026-10-06-deer-flow-v3]] - **citations re-opened 7/7/1, one amendment, custody split escalated.** 112 anchors mapped old->new; 101 byte-identical. Withdrawn: operator-tier-code-loading's "the service-writable model has no such field" - `extensions.middlewares` names code from the API-writable file at both pins. Corrected: the verifier paragraph is ~1,500 words, never 4,800. Amendment to `completion-claim-verification`: a lost exit marker is UNVERIFIED, never the success flag - the tree's Fixed list paid twice (#6354 output budget, #6307 audit warning) for falling back to a meta status that says success for any returned text, fixed each rewriter and kept the fallback. Custody clause fired in substance (retention #5255, fork clears out-of-checkpoint refs, lineage-bound agent binding); escalated E2+E4. The dispatcher read the oldest of three same-day pins; fix proposed. 0 fetches; 0 siblings (cloud). 12 untriaged, 4 leads. |
```

`librarian/applied.md`:

```
| 2026-10-06 | completion-claim-verification (amendment: a lost exit marker is UNVERIFIED, never the success flag) | fleet-orchestration | - | - | unapplied | Cloud dispatch: no fleet checkout. Seam to test: any fleet checker that reads a command's exit from transcript or tool text and falls back to a tool success flag when the marker is absent (personas' bridge was the 2026-09-02 simulation seam). Return: the next local apply run over fleet-orchestration. |
```

`.claude/skills/intake/SCORECARD.md`:

```
| 2.15.0 | 2026-10-06 | `github:bytedance/deer-flow` --delta `08b27aef..53df22bd` (cloud dispatch 261006-bfe02a, run `intake-deer-flow-1006-v3`); declared focus (apply-only runs) did not apply to a source delta, said so | 1 (4 reader workers over ~60k words of ~528k) | 17 rows + 3 delta design entries | 112 anchors re-opened; 1 row verified for landing | 1 amendment + 7 applications re-pinned (1 claim withdrawn, 1 figure corrected) | 0 rows: unapplied - cloud session, no fleet (handoff written) | 0 | apply and ship zero by dispatch (no fleet); auto=1/11/1, fp=0; prediction held (repairs dominate, 1 amendment, custody escalated, 0 subjects) | 0/0/1/7-repinned/0; routing count 1; no handoff |
```

`librarian/upstream.md`: re-run `node scripts/upstream-check.mjs --ledger`
after merge. It was not run here.

## Handoff

For a local session with the fleet:

1. **Apply `completion-claim-verification` (amendment).**
   - Technique:
     `knowledge/software-engineering/llm-agent/orchestration/fleet-orchestration/techniques/completion-claim-verification.md`.
   - Projects `librarian/fleet-map.md` joins to `fleet-orchestration`:
     `personas` (Fleet & Orchestration, Automation & Pipelines, Design &
     Build Studio), `goat` (Platform Infrastructure) and `pumper` (Content &
     Research Apps).
   - Seam: wherever a fleet checker derives a command's exit from captured
     text or a tool result. The 2026-09-02 personas simulation found the
     verifying half absent at its bridge, so first check whether one exists
     now.
   - Test: remove the marker by a post-execution rewrite (truncate, append a
     warning) on a failed command whose output prints a passing count. The
     verdict must be UNVERIFIED, not pass.
   - Expected reachable mode: **simulation** in personas (code only if a
     verifier has landed since). In pumper, read whether its job-status path
     falls back to a success flag; if so, mode is **code**.
2. **No golden-path rule flipped.** No other technique landed, so there is
   nothing more to apply.
3. **Phase 7.6 direction pass, Phase 7.7 decision gate, Phase 8 cross-repo
   lane and Phase 6b render proof:** not run, because there are no sibling
   checkouts. No render-bound candidate existed.
4. **Run board** (claim, beat, lock, check, release): skipped, because this
   was a single writer in a fresh clone.
5. **Shared ledger appends:** skipped; the rows are above.
6. **Unread areas of the delta**, for a later pass:
   - the README;
   - the frontend;
   - about 560 Fixed bullets that matched no keyword;
   - the Added, Changed, Security, Performance and Internal sections of
     2.1.0 and Unreleased (including the `json-valid` acceptance leaf,
     #5947);
   - the projects-MVP specs and plan;
   - `docs/plans/2026-09-23-reasoning-capability-contract.md`;
   - the MCP artifact-handle plan beyond its first sections (D9's promotion
     read);
   - the community sandbox guides;
   - the task-continuity experiment's scripts and result JSON;
   - `backend/docs/blob-storage.md`;
   - `backend/tests/AGENTS.md`;
   - the authorization implementation notes beyond a keyword pass.
7. **Custody split:** if the operator says go, dispatch one forge worker on
   the shape in the source note's "Escalated" section, with the move done
   through `scripts/apply-taxonomy.mjs`.

## Proposed lessons

These were not written to the intake skill or its LESSONS.

1. **A citation re-open finds pre-existing errors, not only drift.** One of
   the seven applications carried a claim that was false at the pin it cited.
   Re-reading with a reversal question ("what would make this wrong now?")
   exposed it where the forge reconciliation's confirmation question had not.
   Rule 3 should say a re-open is also a second review, and should count
   pre-existing withdrawals apart from drift withdrawals.
2. **Three pins sharing one date break the dispatcher.** When a run writes
   several notes for one repository on one day, give each a `mined_on` time or
   a `prior_notes` chain the de-duplication can order by. Otherwise
   `upstream-check` falls back to directory order.
3. **The +2 gate decides delta amendments by how the edit is phrased.** A
   boundary case written as an append scores 2/0. The same fact written as a
   correction of the sentence it qualifies scores 3/2. Both readings were
   honest here. A delta run should state both readings in its note, as this
   one did, until the method picks one.
4. **Compressed module guides retire reasons before rules.** Seven
   rationales disappeared from one guide while every rule survived. Quote the
   reason with its commit in an application, because the application may
   become the only place the reason still exists.
5. **Line-level remapping is the cheap instrument for rule 3.** A difflib map
   of `old:line -> new:line` plus a content compare resolved 112 anchors in
   seconds. It produced the same verdicts as `check-anchors.mjs`, without
   needing quoted anchors. Worth porting as a `--remap <old-root>` mode for
   the anchor checker.
