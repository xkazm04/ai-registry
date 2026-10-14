---
spec: xl-subject
status: DISPATCHED
subject: llm-observability/telemetry-and-data/agent-session-archive
bundle: llm-observability
category: telemetry-and-data (4 of 10 child dirs before this subject; taxonomy.json is the authority)
source: https://github.com/Dicklesworthstone/coding_agent_session_search @ 7fc01958d367 (connector crate franken_agent_detection @ 6b337ba434b7)
run_id: dle-004-1015
series: librarian/handoffs/2026-10-14-dicklesworthstone-series.md (round DLE-004)
date: 2026-10-15
---

# XL spec: agent session archive

## Why this is a subject and not five techniques

The design read of the source (run `dle-004-1015`, source note
`librarian/sources/2026-10-15-coding-agent-session-search.md`) produced seven ingest-side
decisions. Four of them are `corpus: NONE` and a fifth is partial, and all five name the
same home if new. Under intake v2's mechanical XL trigger that is a subject by
construction. The director re-checked the NONE claims with concept queries
(`research-map --deep`, uncapped) and opened the three nearest owners:

- `software-engineering/.../tracing` (`trace-capture`, "Retention names its reaper") reaps
  records the system itself emitted.
- `software-engineering/.../versioning-snapshots/techniques/retention-and-pruning.md`
  thins the system's own entity versions. Its "do the arithmetic before the engineering"
  rule agrees with this spec's measurement and should be echoed in prose.
- `llm-observability/telemetry-and-data/multi-provider-event-normalization` normalizes
  wire events in flight. It keeps raw provider strings, never raw bytes, and has no
  at-rest source that can vanish.

None of them models the force that defines this subject: **a third party writes the
records, owns their format, and deletes them on its own clock.** The bundle's boundary
contract already names that force as its own ("receiving traffic you did not emit, on
clocks you do not own, from SDK versions you cannot pin"), which is why the home is
`llm-observability` and not the builder-side `software-engineering/llm-agent`.

## A tree anyone in this registry can open: our own machine

Measured 2026-10-15 by the director:

- The local agent harness keeps transcripts for its default of 30 days, then deletes
  them. The documented minimum is 1 day and no value disables cleanup. This machine never
  set the retention setting.
- The transcript store held **17.1 GB in 16,525 files**. The last 7 days alone wrote
  **4.8 GB**, so keeping everything raw grows at roughly 250 GB a year.
- The registry's structure-only process cache remembers **3,705 sessions; 1,773 of them
  (48%) have transcripts that are already deleted**. Their structure survived, but no
  replay instrument can read their commands any more. Series round R1 lost one seeded
  replay case to exactly this.
- Three registry scripts each implement transcript discovery with a different folder
  rule (fleet folders only; an opt-in all-folders prefilter; project plus worktree
  folders). Sessions launched from another folder were missed until R1 added a flag.

## Placement

- Path: `knowledge/llm-observability/telemetry-and-data/agent-session-archive/`
  (`agent-session-archive.md`, `techniques/`, `applications/`). Same depth as its four
  siblings; link depth to `_laws.md` is `../../../_laws.md` from the golden path and
  `../../../../_laws.md` from a technique (copy the pattern from
  `multi-provider-event-normalization`).
- Append `"agent-session-archive"` to the `telemetry-and-data` subjects list in
  `knowledge/llm-observability/taxonomy.json`. Append, never reorder.

## Proposed techniques (each carries a decision rule)

1. **`capture-before-parse`.** Inventory what will be read, and copy the bytes before any
   parser runs. Whether a source is kept must never depend on whether today's parser
   understood it. The source realizes this as a contract and then breaks it: above 256
   primary files per connector, early capture is deferred to a per-conversation path, so a
   file that parses to nothing is never captured. That is the boundary case to write: a
   capture that scales by skipping is a capture that fails on the format change it
   exists for. Throttle by rate, never by condition on the parse.
2. **`prefix-proof-retirement`.** Automatic retention may retire an older capture only
   when a newer capture of the same source provably contains every byte of it (append-only
   sources). When the byte budget is hit, admission of new captures pauses and nothing is
   evicted. Age, size and keep-N eviction stay explicit operator commands. Include the
   arithmetic: append-heavy transcripts make most recaptures duplicates (chunked,
   content-addressed storage), and a rewrite or truncation leaves bytes nothing else holds.
3. **`root-relative-session-identity`.** Identity is (origin machine, harness, path
   relative to the harness's own store root), canonicalized at one chokepoint. Never merge
   on a native session id or a file name. A store relocation is honoured only with a byte
   or metadata proof. Two scan roots for one file produced duplicates in the source; two
   machines sharing relative paths forced the machine into the key.
4. **`additive-cross-machine-pull`.** History from another machine is pulled into its own
   namespace by a transfer that never deletes locally, parsed by the same readers, and
   stamped with its origin; a rewritten workspace path keeps its original in metadata. An
   empty or misconfigured remote must not erase local copies.
5. **`declared-message-coordinates`.** An archived message is cited in a declared
   coordinate space (conversation identity plus stored message index), never as a line
   of the source file: normalization drops records, so the two spaces diverge. An
   ambiguous or missing lookup fails; it never substitutes a neighbour or re-parses the
   live file. State the coordinate's lifetime: stable within one archive generation, not
   across a full rebuild that reallocates ids.
6. **`queryable-surface-redaction`.** Redact where content becomes queryable and
   re-served (the index, search output, packs, export), not where it rests. Put only
   high-precision credential-shape rules on the irreversible ingest stage, because a false
   positive there destroys searchable content permanently. Put noisy, recall-oriented
   scanners (entropy, allow and deny lists) on the reversible pre-share stage. Declare the
   verbatim raw copy as sensitive at rest. The discriminator to state: a one-shot,
   consented read of a live session into a prompt is a different custody than a durable
   index re-served to every later caller; one fleet project argued the first and declined
   to redact. Also state the source's measured gap: redaction speed was measured and
   recall was never measured, so a team adopting this must build the labelled set.
7. **`ingest-disposition-accounting`.** Every discovered source ends with a disposition
   (indexed, partial, deferred while still being written, quarantined, excluded,
   unsupported), and a test asserts that the inventory covers every path the parser read.
   "Found N sessions" with no inventory is silence. Two mechanisms belong here: defer
   files modified within a short window and hold the watermark (a writer with no lock or
   open descriptor was parsed mid-write and quarantined for good, a data-loss incident in
   the source), and put a hash of the parser's own source into the skip-ledger key, so a
   parser fix re-reads old files.

The golden path also states, in prose rather than as a technique: **once upstream prunes,
the archive is the record, not a cache.** Every index over it is a derived projection
with a named rebuild path, and cleanup has a written list of what it may never delete.

## Boundaries the subject must NOT absorb

- Usage extraction per harness: `multi-provider-event-normalization/per-provider-usage-extractors`
  owns it. Name it in prose; the archive feeds it.
- Ranking, hybrid lanes, retrieval evaluation: `software-engineering/.../retrieval`.
- Budgeted output to agent callers, paging and cursors: `retrieval/ranking-budgets` and
  `software-engineering/backend-platform/data-layer/bounded-enumeration` (cross-bundle:
  prose only).
- Distilling sessions into durable memory or lessons: `agent-memory`, and a sibling round
  (DLE-005) is studying exactly that this afternoon.
- Publishing index generations (atomic swap, sealed generations): store-side concurrency,
  not archive ingest.
- First-party trace emission: `tracing`.

## Open questions the drafter decides (and argues)

- Is `queryable-surface-redaction` this subject's technique, or an amendment to
  `software-engineering/security/data-and-transport/telemetry-pii-redaction`? The
  director leans here, because the force is amplification by an archive's own index. Decide and
  say why.
- Is "the archive is the record" a technique or golden-path prose?
- Seven techniques is the proposal, not a floor. Merge, split or drop with reasons.

## Corroboration and evidence

- Primary for the retention force: the harness's own documentation of its transcript
  cleanup period and of a session-end hook that receives the transcript path (fetched
  2026-10-15 by the director; the URLs go in the source note, not in an upper layer).
- The design mechanisms are corroborated by code read in a tree (the source clone at
  `C:/t/dle-004-1015` and `C:/t/dle-004-1015-fad`), and by our own machine's numbers above.
- Reader reports with verified anchors (all `check-anchors.mjs` clean against the clones)
  are in the director's scratch directory; the worker brief names the paths.

## License mitigation (operator ruling 2026-10-14, binding on the worker)

No verbatim code or prose of the source's author in any file. Mechanisms are restated.
Source-tree applications cite `path:line "quote"` with a quote of at most ten words that
is a substring of that line. No patches or task rows against the source's clone.

## Overrides recorded

(filled in by the director after review)
