---
source: https://github.com/Dicklesworthstone/coding_agent_session_search
kind: repository
url: https://github.com/Dicklesworthstone/coding_agent_session_search
title: "Coding agent session search - one practitioner's cross-harness archive and search over agent session history, read against its own audits"
author: Jeffrey Emanuel (first-party practitioner; the same agent-fleet stack as series round R1)
commit: 7fc01958d36727875d7b41752b5216c2cbb2bce9
commit_date: 2026-10-14
evidence_trees: "franken_agent_detection 6b337ba434b72c65c6c5a748b7ec47885f840ac0 (the connector crate, pinned by the source's Cargo.toml line 167; plain MIT, no rider)"
words: 242 landing / about 380,000 in-tree markdown over 4,164 files plus about 703,000 lines of Rust and 87,000 in the connector crate; about 60,000 words and several thousand lines of code read by four design readers; 1 fetch (the harness's own retention and hook documentation)
extracted: 31 (24 design entries, 4 claim rows, 3 method rows)
accepted: 9 (8 folded into one forged subject, 1 technique) + 3 method changes landed on measured A/B
declined: 0
leads: 4
already_covered: 10
untriaged: 4
currency: 1
dispatched: 1
applied: 6 (+1 unapplied with a return condition)
shipped: 3 (registry tooling merges f5fccfc5, 80b78ce5, e3ad2550; personas ledger rows 822f4b7aa4, 72e5b26a81; nothing pushed)
run_id: dle-004-1015
siblings: 1 at claim (dle-002-1015); 3 within the hour (dle-r5-1015, dle-r10-1015)
series: librarian/handoffs/2026-10-14-dicklesworthstone-series.md (round DLE-004)
rescan_when: "the source lands its published-generation rollover (GH458 beyond section 5) so semantic serving reads the sealed generation, or the 256-file pre-parse capture deferral is removed or made parse-independent, or redaction gains a measured recall or false-positive number, or the connector crate changes its Claude Code or Codex parser contract; or 8 weeks elapse (2026-12-10)"
---

# Coding agent session search - intake 2026-10-15 (series round DLE-004)

**Class:** first-party practitioner account in repository form, read as a **system**.
The landing page is 242 words (ingest exit 3, thin, expected for a repository).
Everything below comes from two clones: the source (`coding_agent_session_search`, called
`cass` in its own tree, pinned `7fc01958`) and its connector crate
(`franken_agent_detection`, pinned at the exact revision the source's manifest names,
`6b337ba4`). The source is an archive and search engine over the session transcripts of
about thirty agent harnesses: one normalized conversation schema, a raw mirror of the
harness files, a SQLite archive of record, lexical and semantic indexes derived from it,
redaction at ingest, and a budgeted robot surface for agent callers. Its `docs/planning/`
holds the author's own reality checks, which price his choices and are better evidence
than his README.

Declared focus from the last scorecard row (R1): **check every premise a brief states
against the record before dispatching a builder.** Done for every dispatch in this run;
three premises were corrected before dispatch (see the end of this note). tdbmem's older
focus (open the neighbour of every likely catch before banking it) was also applied, and
it overturned one reader's NONE.

## License and what this run did not do

The source carries "MIT License (with OpenAI/Anthropic Rider)". The connector crate is
plain MIT. The operator ruled full intake with mitigations on 2026-10-14, and this run
obeyed them: no verbatim code or prose of the author's in any tracked file (anchors only,
quotes of at most ten words); clones at `C:/t/dle-004-1015` and `C:/t/dle-004-1015-fad`,
deleted at run end; **no task rows or patches on the author's clones** (intake's
source-tree task row was skipped); nothing pushed, proposed or filed upstream; agent
instructions inside the source were read as data.

## Siblings

One live sibling at claim (DLE-002, holding `concurrent-vcs` and `concurrency-guards`),
then DLE-005 (`agent-memory`) and DLE-010. Two candidates whose home is
`concurrency-guards` were deferred under V5 rather than written beside DLE-002's work.
The session-derived lessons decision was routed to DLE-005, which is studying the
author's memory system the same afternoon.

## What was swept

Four Opus design readers, one per system, each reading code and docs in its slice and
returning a design record with verified anchors (all `check-anchors.mjs` clean against the
clones: reader A 82 anchors held across both trees, B 109, C 81 quoted plus 16
existence-only, D 94 under `--strict`):

- **A, ingest:** the connector crate's lingua-franca types, the Claude Code and Codex
  connectors, token extraction, the raw mirror and its retention, conversation identity,
  message addressing, remote sources.
- **B, store and index:** the archive of record, lexical generations and their publication,
  semantic manifests, quarantine and cleanup, the search service.
- **C, agent surface:** robot mode, the budget envelope, answer packs, transcript paging,
  error codes, the shipped agent skill.
- **D, audits and measurement:** the 35,000-word reality check, the indexing benchmark
  ledger, the search-quality gate and bake-off, redaction, lessons and incident mining.

## Design record

Anchor root `C:/t`; every anchor's first segment names the clone (`dle-004-1015` = the
source, `dle-004-1015-fad` = the connector crate). Depth-1 clones: no git history was read.

### Ingest (system 1)

**E1. Capture the source bytes before parsing them.**
- decision: each connector publishes a pre-parse inventory; the indexer copies those files
  into a raw mirror before any parser runs, and every parsed conversation records its capture.
- forces: harnesses delete their own stores on their own clock and change format under the
  tool; a parser bug that yields nothing leaves nothing to re-parse once upstream deletes.
- buys: a session any run has seen can be re-derived by a later parser after deletion.
- rejects: keeping only the database (an operator opt-out whose cost the tree states).
- where: `dle-004-1015-fad/src/connectors/mod.rs:117 "intentionally file-oriented and pre-parse"`;
  `dle-004-1015/src/raw_mirror.rs:43 "lost is the copy that survives a provider deleting"`.
- **contradicted by its own code:** above 256 primary files per connector the early capture
  is deferred to the per-conversation path, so a file that parses to nothing is never
  captured: `dle-004-1015/src/indexer/mod.rs:120 "PREPARSE_PRIMARY_SOURCE_CAPTURE_LIMIT: usize = 256"`;
  `dle-004-1015/src/indexer/mod.rs:33785 "deferring large primary source raw-mirror capture"`
  (opened by the director).
- stage: between discovery and scan. corpus: **NONE** (nearest `disk-truth-db-index`: there
  the system owns the files).

**E2. Retire a snapshot only after proving a newer one contains it.**
- decision: automatic retention retires an older capture only when a newer capture of the
  same source verifiably holds every one of its bytes as a prefix; at the byte cap new
  capture pauses and nothing is evicted.
- forces: append-only transcripts make recaptures mostly duplicates; a rewrite leaves bytes
  nothing else holds; after upstream deletion the mirror may be the only copy.
- where: `dle-004-1015/src/raw_mirror/retention.rs:2 "only a checksum-verified prefix of a retained same-source"`;
  `dle-004-1015/docs/raw-mirror-retention.md:80 "bound on *new capture admission*"`.
- audit: the retention tests ran through a test-only path that bypassed the budget, and the
  default cap (8 GiB) is below the owner's own measured mirror (12 GB).
- corpus: **NONE** (nearest `retention-and-pruning`, `bounded-revision-history`: own entities).

**E3. Incremental ingest invalidated by parser changes and by in-flight writes.**
- decision: a source is certified complete only after every conversation from it is
  delivered and its stat fingerprint held during the parse; a build hash of the parser
  source is part of the skip key; files written within 120 s are deferred.
- forces: a writer with no lock or descriptor was parsed mid-write and quarantined for good
  (a data-loss release reversed in the next one).
- where: `dle-004-1015-fad/src/connectors/claude_code.rs:720 "Never emit or certify an incompletely read source"`;
  `dle-004-1015/build.rs:493 "cass-source-ingest-contract-v1"`.
- corpus: PARTIAL - `codebase-scanning/incremental-scanning` models the ruleset-version key;
  not the in-flight writer.

**E4. Per-harness usage extraction with a three-state provenance.** Reported, estimated, or
deliberately suppressed because counted elsewhere. corpus: **catch** -
`per-provider-usage-extractors` + `refuse-to-derive` (which would decline the estimate;
the source labels it instead). Source-tree application written.

**E5. Conversation identity is root-relative and never merges on a native id.**
- where: `dle-004-1015/src/storage/sqlite.rs:4493 "UNIQUE(source_id, agent_id, external_id)"`;
  `dle-004-1015/docs/codex-layout-migration.md:4 "native UUID alone is not permission to merge conversations"`.
- forces: two scan roots for one file produced duplicates; two machines share relative paths.
- corpus: PARTIAL (`deterministic-span-derived-ids`: no root drift, no relocation).

**E6. Other machines are pulled additively, parsed by the same readers, origin-stamped.**
- where: `dle-004-1015/src/sources/sync.rs:854 "remotes/{source_name}/mirror/"`;
  `dle-004-1015/src/indexer/mod.rs:111 "Provenance is part of the key because two configured sources"`.
- corpus: **NONE** (nearest `two-doors-one-pipeline`).

### Store and index (system 2)

**E7. The archive is the record; every index is derived.**
`dle-004-1015/docs/planning/RECOVERY_RUNBOOK.md:16 "SQLite is the archive of record"`.
corpus: PARTIAL - `full-text-indexing` models the derived half; nothing models the store
becoming the sole copy once upstream prunes. Folded into the new subject's golden path.

**E8. Lexical publication by directory swap with the prior tree parked under a fixed name.**
`dle-004-1015/src/indexer/mod.rs:24717 "atomic renameat2(RENAME_EXCHANGE). After the syscall"`.
corpus: PARTIAL - `concurrency-guards/atomic-file-publish` (held by DLE-002: V5, deferred).

**E9. A generation is certified only by a fresh reader serving exactly the counted docs.**
`dle-004-1015/src/indexer/mod.rs:9516 "the previous `if let Some(observed)` shape verified nothing"`.
corpus: **catch** - `full-text-indexing`, `chunking-and-indexing`. Application written.

**E10. Sealed semantic generations selected by an epoch compare-and-swap pointer.**
`dle-004-1015/src/search/semantic_manifest.rs:1452 "closes the A -> B -> A ABA hole"`.
Designed and **not serving**: the loader refuses semantics whenever the pointer exists
(`dle-004-1015/src/search/model_manager.rs:324 "context: SemanticProgressiveUnavailableReason::OwnerBackedReaderRequired"`).
corpus: NONE (nearest `embedding-lifecycle`). Lead, not a landing.

**E11. Destructive cleanup bound to an approval fingerprint of the observed inventory.**
`dle-004-1015/docs/LEXICAL_QUARANTINE_RETENTION.md:80 "and compares its approval before any quarantine"`.
corpus: modelled cross-domain (`preview-then-approve-the-signed-set`); the software-engineering
neighbour `dry-run-preview` lacks the binding. Untriaged amendment.

**E12. A retained reader is guarded by file identity, not a size and mtime receipt.**
`dle-004-1015/docs/LEXICAL_ADMISSION.md:23 "same-length rewrites with restored mtime evade it"`.
corpus: NONE; home `concurrency-guards` (V5, deferred).

### Agent surface (system 3)

**E13. Search output: projection mask, chars/4 budget, cursor advanced by emitted hits.**
`dle-004-1015/src/lib.rs:36333 "cursor offset advances by emitted hits after token-budget clamping"`.
corpus: **catch** - `ranking-budgets`, `bounded-enumeration`.

**E14. Packs admitted on the measured encoded output, redacted before truncation.**
`dle-004-1015/src/search/pack_planner.rs:993 "Redact before truncation: cutting a credential first can hide"`.
corpus: **catch** - `ranking-budgets` (non-additive cost). Application written.

**E15. One wall-clock budget envelope: shed named sections, name the recovery probe.**
`dle-004-1015/src/robot_budget_envelope.rs:34 "NEAR_LIMIT_FRACTION: f64 = 0.8"`;
`dle-004-1015/src/robot_budget_envelope.rs:88 "Re-reading the live clock can otherwise make"`.
Violates our law where it matters most:
`dle-004-1015/docs/ROBOT_MODE.md:20 "an expired search or pack exits 0 with"`.
corpus: PARTIAL -> **real gap** after the promoting read (`output-budget-signal`,
`bounded-projection-of-external-work`, `soft-budget-under-the-hard-cap` model neighbouring
forces, none a tool response that sheds and names its recovery). **Landed:**
`mcp-tools/budgeted-partial-response`.

**E16. Follow-ups address a message in a declared coordinate space, never a file line.**
`dle-004-1015/docs/reference/message-addressing.md:4 "not a physical JSONL"`;
`dle-004-1015/src/followup_coordinates.rs:159 "NOT arithmetic on sparse idxs"`.
The shipped agent skill still teaches the refuted form:
`dle-004-1015/SKILL.md:42 "using its exact source_path and line_number"`.
corpus: **NONE** (nearest `elision-to-a-refetch-pointer`). Folded into the new subject.

**E17. Transcript paging: content-bounded pages, stateless identity-bound cursor.**
`dle-004-1015/docs/CANONICAL_TRANSCRIPT_PAGING.md:35 "Every page returns at most"`; its
tests never ran (`dle-004-1015/docs/CANONICAL_TRANSCRIPT_PAGING.md:96 "tests have not run in the editing environment"`).
corpus: **catch** - `bounded-enumeration` + `declare-the-inconsistency`; the split oversize
unit is the one addition. It is the peer for our ledger reader (method A/B M3).

**E18. Lenient argv: about two dozen correction layers recover likely agent mistakes.**
`dle-004-1015/README.md:949 "aggressively normalizes input to maximize acceptance when intent is clear"`.
corpus: **catch, against the source** - `fluent-syntax-bounded-grammar` argues the
opposite and the tree's own record supports it (a reused field meant two things for years).
Application written as a counter-example.

### Measurement (system 4)

**E19. Search-quality gate split from a manual bake-off.** The gate's qrels are single
invented tokens: `dle-004-1015/tests/fixtures/search_quality/qrels.json:2 "is a single distinctive token from the corpus"`.
corpus: **catch** - `retrieval-evaluation`, which says why that cannot see ranking. Application written.

**E20. Query semantics checked by a set-algebra reference through the real binary.**
`dle-004-1015/tests/search_metamorphic.rs:6 "small set-algebra reference computes: OR is union"`.
Reader D called it NONE ("no registry file mentions metamorphic testing"). **Director
overturned it:** `test-input-generation/model-based-oracle` models exactly this rung (a
reference model on generated inputs, plus the normalise-then-round-trip invariant the
echoed query structure satisfies). Catch; application written.

**E21. Ingest optimizations kept only on end-to-end wall clock after an equivalence proof.**
corpus: **catch** - `perf-regression-gating/equivalence-before-the-saving`; the source
lacks the sibling `noise-floor-before-the-threshold` (1.9-3.6% wins kept on 1-3 runs on a
shared host, no unchanged-vs-unchanged run), and its own later audit says so.

**E22. A metric outcome is a tagged state, never a bare zero.** corpus: **catch** -
`a-dash-means-not-measured-never-zero` and the law `unknown-is-not-a-value`.

**E23. Redaction at ingest with precise rules; entropy only before export; raw copy verbatim.**
`dle-004-1015/src/indexer/redact_secrets.rs:8 "well-known prefix patterns rather than high-entropy heuristics"`;
`dle-004-1015/src/indexer/redact_secrets.rs:366 "not disk-at-rest secrecy"`. Speed measured
(10 vs 261-284 MiB/s), **recall never measured**. corpus: PARTIAL
(`telemetry-pii-redaction/denylist-plus-pattern-pass`: the two-pass structure, not the
precision/recall split by stage). Folded into the new subject; the personas seam that
argued the opposite was used as the falsifier.

**E24. Lessons come from repository evidence, not from session transcripts.**
`dle-004-1015/src/lessons_extraction.rs:2 "commit summaries, closed bead reasons, and proof-run records"`,
against the module header's claim. corpus: NONE (nearest `agent-memory/consolidation`).
Routed to DLE-005 as a lead.

### Routing count

- **Per system, NONE:** ingest 3 (E1, E2, E6), store 2 (E10, E12), agent surface 1 (E16),
  measurement 1 after the director's correction (E24; E20 was a catch). Whole tree 7.
- **Shared home-if-new:** E1, E2, E5, E6 and E16 all name one new subject, and E3, E7 and
  E23 fold into it as partials. Five sharing one home clears the XL trigger mechanically.
- **Decision:** the ingest system clears three with no home, and the cluster clears five:
  **a scoped forge of one subject, not the repository.** Home, after reading the bundle's
  boundary contract (the operator side "receiving traffic you did not emit, on clocks you
  do not own"): `llm-observability/telemetry-and-data/agent-session-archive`. Spec:
  [`../handoffs/2026-10-15-agent-session-archive.md`](../handoffs/2026-10-15-agent-session-archive.md).
  Store (2) and measurement (1) stay in intake as techniques or leads; agent surface
  produced one technique (E15) beside the folded E16.
- E4 escalation (XL): covered by the charter's standing rule that a forge handoff runs in
  the same session; executed in a short-path worktree.

## Triage (Phase 5, v2.5 scored)

Expected yield, said before the table: a system read as design, so a high routing count
against a corpus that owns retrieval, search and redaction well, most store and
agent-surface decisions resolving to catches, and the one genuinely unowned force (a third
party deleting the records) concentrating in ingest. Corroboration from code read in the
trees and from our own machine; one fetch, for the harness's retention documentation.

Rows E1-E3, E5-E7, E16 and E23 were not scored one by one: the XL trigger folded them into
the subject spec (E4 escalation, executed under the charter's standing rule).

| # | lane | shape | eff | title | prior art | impact | read | G/R/C | decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XL | K | subject | XL | Agent session archive (E1, E2, E3, E5, E6, E7, E16, E23) | none owns a third-party deletion clock | new-subject | real gap | 4/1/XL | escalated (E4) -> forged in session |
| E15 | K | technique | M | Budgeted partial response with a recovery probe | output-budget-signal, soft-budget-under-the-hard-cap (neighbouring forces) | new-technique | real gap after promoting read | 3/0/2 | accept (director opened the source lines; convergence with our masked-exit record) |
| E4a | K | amendment | S | A suppressed usage state for rows counted elsewhere | per-provider-usage-extractors | new-technique | partial | 1/1/1 | untriaged (G-R 0) |
| E8 | K | amendment | S | Directory swap with the prior generation parked by name | concurrency-guards/atomic-file-publish | corrects-claim | partial | - | untriaged (V5: DLE-002 holds concurrency-guards) |
| E11 | K | amendment | S | Cleanup bound to an approval fingerprint of the observed inventory | dry-run-preview (sw-eng); preview-then-approve-the-signed-set (recruiting) | corrects-claim | partial | 2/1/1 | untriaged (G-R 1; cross-domain convergence, reader report not re-checked) |
| E12 | K | technique | M | Retained reader guarded by file identity | none (no inode or ctime treatment in sw-eng) | new-technique | real gap | - | untriaged (V5: home is concurrency-guards) |
| E10 | K | technique | M | Sealed generations behind an epoch compare-and-swap pointer | embedding-lifecycle | new-technique | partial | 2/3/2 | lead (designed, refused by its own loader) |
| E24 | K | technique | M | Lessons from repository evidence before transcripts | agent-memory/consolidation | new-technique | partial | - | lead, routed to DLE-005 |

Currency (C1) and leads (C2, C3) were admitted under the corroboration table, not the score.
`auto=1/4/1`, `fp=0`.

## Accepted (landed)

- **Subject** `llm-observability/telemetry-and-data/agent-session-archive` (forged on branch
  `forge/agent-session-archive` `46c506d4`, merged `22a28642`): golden path and six
  techniques, `capture-before-parse`, `prefix-proof-retirement`,
  `root-relative-session-identity`, `declared-message-coordinates`,
  `queryable-surface-redaction`, `ingest-disposition-accounting`; seven source-tree
  applications, 105 anchors. The forge worker overrode the spec three times, all accepted:
  it merged `additive-cross-machine-pull` into capture and identity (a standalone technique
  would only restate both), fixed the spec's link depth to `_laws.md`, and filed the
  connector-crate citations as a separate witness application. It kept redaction in this
  subject on the neighbour's own picking rule. The director corrected one sentence of
  `queryable-surface-redaction` that claimed more than the experiment showed.
- **Technique** `software-engineering/llm-agent/runtime-and-io/mcp-tools/budgeted-partial-response`
  (`15f2ddd6`), with seven source-tree applications for the catches (171 anchors): the new
  technique, `retrieval-evaluation` (counter-example), `model-based-oracle`,
  `full-text-indexing`, `ranking-budgets`, `fluent-syntax-bounded-grammar` (the tree
  supports it), `per-provider-usage-extractors`.

## Applied (Phase 7.5)

| technique | project | mode | verdict | what the seam returned |
| --- | --- | --- | --- | --- |
| ingest-disposition-accounting | ai-registry | code | better | discovery read 2,024 of 10,762 transcripts; every folder read now, 1,383 -> 1,440 fleet sessions, 0 of 2,014 attributions lost; the builder's first rule made 3 false registry attributions and was replaced by a cwd vote |
| prefix-proof-retirement | ai-registry | experiment | better | archive 23.8% of raw for the same 7 days, 5,007/5,007 verified, 50/50 restores exact; cross-file dedupe 0.00%, so the gain is prefix plus compression |
| capture-before-parse | ai-registry | experiment | unmeasurable | 1,773 of 3,705 remembered sessions already lost their bytes; target moves only once the mirror is wired (instrument: restore the rolled-off sessions 30 days after wiring) |
| declared-message-coordinates | ai-registry | code | unmeasurable | row-identity cursors in the ledger reader; tested, not A/B-measured (instrument: replay written line citations against the ledger then and now) |
| queryable-surface-redaction | personas | experiment | **not-better** | chosen to falsify: 0 of 5,383 rendered windows carry a credential; 66 of 5,385 transcripts do, in tool blocks the seam skips; the technique gained its scope condition |
| budgeted-partial-response | personas | experiment | unmeasurable | chosen to falsify: 4 of 4 transcripts above the 64 MiB fold cap undercount tokens by 11-66% per call with no partial flag; fix filed as the project's next change |
| root-relative-session-identity | - | - | unapplied | the registry's cache already keys by store-relative path; no second machine exists to pull (return: when history from another machine is pulled) |

## Method A/B (the operator's bar for our own tooling)

Three practices, each built on a named branch in a short-path worktree and measured against
a declared target and floor before landing. All three landed; nothing was wired into a hook
or a settings file.

**M1 - discover by record, not by folder** (`ab/session-discovery` `38b1a8dc`, merged
`f5fccfc5`). See the applied row. Target 1,383 -> 1,440 in-window fleet sessions; floor 0
lost, 0 re-attributed, warm time +0.39 s inside a declared 2 s. Premise corrected by the
builder: the registry's short-path worktrees do not hide registry sessions (their work is
in subagent folders of sessions already counted), so the registry's own count stayed 487.

**M2 - a transcript mirror against raising the harness's retention** (`ab/transcript-mirror`
`0329f789`, merged `e3ad2550`). Arm A keeps 245 GB a year raw and fills this disk in about
six months; arm B keeps 58 GB at the measured rate and pauses at a budget. Floor exact.
Proposed wiring for the operator: capture `--since 2d` from a session-end hook plus a daily
backstop, retire weekly, raise a notice on exit 3 (paused at budget).

**M3 - a budgeted ledger reader** (`ab/ledger-read` `f15a86df`, merged `80b78ce5`). Twelve
questions taken from the skills' own ledger reads: 61,854 bytes (arm A, today's commands)
-> 42,969 (arm B), 30.5% fewer, 12/12 complete in both arms. The floor fails at a 1,000-token
budget and holds at 2,000 and 4,000. Disclosed by the builder: a stronger arm A (awk column
projection) was not tested, so 30.5% is an upper bound on what projection buys.

## Peer study (the source against our three readers)

Our peers: `scripts/process-sessions.mjs`, the two replay instruments, and the personas
transcript readers (`cli_session_awareness`, the fleet transcript reader, the Codex usage
reader). The director's own read, not a dispatched Phase 7.6 study (the charter rules no
directions for personas).

| # | point | ours | source | verdict |
| --- | --- | --- | --- | --- |
| 1 | discovery scope | folder filter, 19% of transcripts | whole store, workspace from the record | adapt (M1, landed) |
| 2 | bytes past the harness's deletion | none; structure-only cache | content-addressed raw mirror | adapt (M2, landed, not wired) |
| 3 | an account of what was not read | "N sessions" | disposition per source | adapt (M1) |
| 4 | session identity | store-relative path (registry); native session id (personas) | root-relative path plus origin machine | keep ours (one machine) |
| 5 | formats | one harness in the registry; two unrelated readers in personas | about thirty connectors, one schema | different forces |
| 6 | in-flight files | personas folds by offset as the file grows | defer files written within 120 s | keep ours (personas is better for live reads) |
| 7 | redaction | personas none, argued from consent | precise rules at ingest, verbatim raw copy | keep ours at that seam, measured (not-better); the reason is scope, not consent |
| 8 | truncate vs redact order | personas truncates first | redact before truncate | moot at the measured scope; matters if the cut grows |
| 9 | budgeted reads for agents | none over our ledgers | envelope, packs, paging | adapt (M3, landed) |
| 10 | partial results | personas' fold cap returns partial silently | named sections plus a recovery probe | adapt (filed for personas) |
| 11 | citing a transcript | session id plus prose | declared message coordinate | lead (no consumer cites lines yet) |
| 12 | search over history | none | lexical plus semantic | different forces (we replay, we do not search) |
| 13 | privacy of what is derived | structure-only, no text kept | lessons from repo evidence, incidents as counts | keep ours (stronger) |
| 14 | the cache as the record | 1,773 sessions exist only in one gitignored file | archive of record, cleanup with a never-delete list | adapt: name `.process-sessions.local.json` as evidence (a `git clean -x` would erase it) |
| 15 | several machines | per-device caches; directions ledger not portable | additive pull, origin in the key | lead |

## Leads

- **E10 sealed generations behind an epoch CAS pointer.** Return when the source's GH458
  rollover serves from the sealed generation, or a fleet project faces a re-embed it cannot
  pause for.
- **E24 lessons from repository evidence before transcripts.** Routed to DLE-005 (live this
  afternoon on the author's memory system). Return when that round reports.
- **C2 chars/4 as the token unit.** Every budget in the source uses it, and no measurement
  against a real tokenizer exists for JSON or code. Return when a budgeted reader of ours
  needs a real token number.
- **C3 redaction recall.** The source measured speed only, and this run measured exposure at
  one consumer. Nobody has a labelled recall set. Return when the mirror is wired: the mirror
  is where the 66 files' credentials would sit.

## Currency

- **C1 (primary, fetched 2026-10-15):** the harness keeps transcripts 30 days by default; the
  minimum is 1, 0 fails validation, nothing disables cleanup; a session-end hook receives the
  transcript path and may archive it. Landed in the subject's golden path without names and
  in this note with them.

## Already covered (catches)

E4 (usage provenance; amendment part untriaged), E9 count-certified publication, E13 search
budget and emitted-hits cursor, E14 measured pack admission, E17 transcript paging, E18
lenient argv (the corpus holds against the source), E19 the quality gate, E20 the set-algebra
oracle (`model-based-oracle`; the reader's NONE overturned), E21 equivalence before the
saving, E22 tagged metric outcomes, and C4: the shipped agent skill teaches the line-number
form its own reference forbids (evidence for `instruction-freshness`, used in the
fluent-syntax application).

## Untriaged (nobody verified these; they carry no judgment)

| # | candidate | anchor | why not now |
| --- | --- | --- | --- |
| E4a | a suppressed usage state | `dle-004-1015-fad/src/connectors/token_extraction.rs:13 "Deliberately no usage and no estimate"` | amendment, G-R 0 |
| E8 | directory swap with a parked prior | `dle-004-1015/src/indexer/mod.rs:25166 "restored the prior published lexical index from an interrupted"` | V5, concurrency-guards held by DLE-002 |
| E11 | cleanup bound to the observed inventory | `dle-004-1015/docs/SEMANTIC_ARTIFACT_RECOVERY.md:64 "changed plan rejects the whole request before any deletion"` | G-R 1 |
| E12 | retained reader guarded by file identity | `dle-004-1015/docs/SEARCH_SERVICE.md:210 "also checks ctime, which catches same-size writes"` | V5 |

## Directions

None: the charter rules no Phase 7.6 directions for personas in this series
(`directions=n/a`, `gate=n/a`).

## Corrections and catches about the source class

- **A practitioner's own audits outrank his architecture docs again.** The capture-before-parse
  contract is broken by a 256-file threshold; the sealed semantic generation is refused by
  its own loader; retention tests bypassed the budget; transcript paging's tests never ran;
  redaction was measured for speed only; the quality gate is plumbing. Every one of these
  sits beside a well-argued design document. The design read has to open the code under
  each claim.
- **Premises corrected before dispatch (declared focus):** the fleet-folder coverage was
  measured (19%) before the discovery brief was written; the retention default was
  confirmed from the harness's documentation; the ledger formats, personas' render path
  and its 8-turn callers were opened before their briefs.
- **Premises corrected after dispatch:** the discovery builder found the worktree premise
  wrong; the director overturned reader D's NONE on the oracle by opening the neighbour
  (tdbmem focus); the mirror builder's "uncommitted test" was already committed; the
  application writer used a crate version as the stack witness and was corrected to the
  toolchain pin; a Bash heredoc dropped a backslash from the director's own probe, and a
  zero-match sanity check caught it before any count was used.
- **The fleet originated a finding too.** The personas fold cap's comment sizes it against a
  6.3 MB maximum; four live transcripts now exceed 64 MiB.
