---
source: github:dullage/flatnotes
kind: repository
class: vendor repository / practitioner build-walkthrough in repo form
url: https://github.com/dullage/flatnotes
title: "flatnotes — a self-hosted, database-less note taking web app over a flat folder of markdown files"
author: dullage
commit: 7f5b773c9cb37cc84978079ed4790e7de38d3970
commit_date: 2026-08-29
app_version: 5.5.5
words: 784 landing / 917 in-tree markdown / 3672 LOC server+client
extracted: 8
accepted: 2
declined: 0
untriaged: 2
already_covered: 4
leads: 1
applied: 2
shipped: 2
dispatched: 0
run_id: intake-flatnotes-0906
siblings: 1
rescan_when: "`server/notes/file_system/file_system.py:200-202` changes the code-block exclusion on either the extract or the strip pass (a producer for the projection hole would close or confirm the first landing), or `main.py` moves the READ_ONLY route-registration blocks at :87/:227 to a request-time dependency (which would refute the second landing's central claim about this tree); or 12 weeks elapse (2026-11-29)"
---

# flatnotes — the projection hole and the route that is never built

**Class prediction, stated before extraction.** A repository, so Phase 2b binds
and the ingest is a trigger rather than an extraction. The landing page is 784
words. Expected yield for a small practitioner codebase: one or two mechanisms
from the instrument and the types, most candidates already covered, no subject.
That held exactly — 8 candidates, 2 accepted, both mechanisms, no forge handoff.

**The doc surface was the smallest this ledger records: 917 markdown words in
the whole tree** (README 523, CONTRIBUTING 394), no `docs/`, no ADR, no
CHANGELOG, no design notes. So the sweep order inverted — the operating
documents, normally the densest surface by an order of magnitude, do not exist
here, and everything came from the instrument (the search index), the types
(the pydantic models and the index schema), and the route table. **There are
also zero test files across 3,672 lines**, which is a fact about what Phase 6
could verify: nothing here could be checked against the tree's own assertions,
so the one measurable claim was checked by executing the source's functions.

Swept, in yield order: `server/notes/file_system/file_system.py` (394 lines, the
index and the storage), `server/main.py` (266, the route table),
`server/global_config.py` (118, the mode vocabulary), `server/auth/local/local.py`
(127), `server/helpers.py`, `server/notes/models.py`, `server/notes/base.py`,
`server/attachments/`, `Dockerfile`, `pyproject.toml`. README read last.

**Fetch budget: 0 of 3.** Both accepted rows corroborated from code read in a
tree, as the class predicts.

## Design record

Grouped by system, because the routing count is per system (v2.2).

### System A — the note store and its search index

**A1. The index is a derivation reconciled at query time, not at write time.**
- forces: the flat folder is co-owned. A human's editor, a sync client or a
  version-control checkout writes notes while the app is not running, so no
  write path inside the app can be the index's trigger.
- buys: correctness under external writes with no filesystem watcher.
- rejects: watcher-based invalidation; write-through indexing on the app's own
  mutations.
- where: `file_system.py:118` (every `search()` syncs first), `:234-270`.
- stage: query time.
- corpus: **CATCH.** `markdown-vault/mirror-indexes` models this well.

**A2. Change detection is `!=` on mtime, not `>`.**
- forces: the peer writers set mtimes *backwards* — a restore from backup, a
  sync client, a checkout.
- buys: motion detected in both directions.
- where: `file_system.py:250-253`.
- corpus: **CATCH**, and a positive one: `replicated-substrate` already says the
  substrate rewrites timestamps wholesale. Recorded in the application as
  agreement rather than as a finding.

**A3. Tags are extracted from content-minus-code-blocks and stripped from the
full content.**
- forces: a `#word` inside a code sample is not a tag; tag syntax should not be
  indexed as body text.
- buys: nothing — this is the defect. The two passes carry different predicates.
- where: `file_system.py:200-202`, two adjacent lines.
- stage: field projection, *inside* the rebuild.
- corpus: **NONE.** `mirror-indexes` owns the mirror's freshness in five
  mechanisms and its fidelity in none.
- HOME IF NEW: `integration/markdown-vault`.

**A4. The index stores terms, not content; highlights re-read the source file.**
- forces: the vault is authoritative and cheap to read; a stored copy is a
  second copy that can diverge.
- buys: the mirror holds no content with which to contradict the vault.
- where: `IndexSchema:39` (no `stored=True`), `:343`.
- corpus: adjacent to `mirror-indexes`' direction contract. **Folded into A3's
  landing** rather than banked separately — it is the same technique's other
  axis, and it supplies the consequence that makes A3 expensive to debug.

**A5. Index lock contention is a bounded retry that then proceeds against a
stale index, logging an error.**
- forces: concurrent search against a single-writer index.
- buys: availability.
- where: `:272-286` — after 8 retries `_sync_index_with_retry` logs and returns
  normally, so the query runs on stale data with no signal to the caller.
- corpus: **CATCH.** `retry-backoff` and `optional-dependency-degradation` own
  this, and `markdown-vault`'s own "false-clean scan" failure mode names the
  shape. Nothing here is sharper than what those already say.

### System B — the HTTP surface

**B1. Read-only mode is enforced by not registering the mutating routes.**
- forces: the mode is read from the environment once at construction and cannot
  change while the process runs; a per-request check is code a new endpoint's
  author can omit.
- buys: the mutation surface is absent from the router *and* from the generated
  OpenAPI document; a new mutating route is a visible indentation fact in the
  diff; nothing deserializes the body or resolves the path parameter, and that
  parameter is the one that becomes a filesystem path.
- rejects: a permission check in each handler or in a shared dependency.
- where: `main.py:87`, `:227`; the vocabulary at `global_config.py:105-109`.
- stage: application construction / import time.
- corpus: **NONE** for the mechanism. `authorization` models the chokepoint and,
  in `declarative-requirements`, registration-time enforcement of *the
  requirement*. Not of *the operation*.
- HOME IF NEW: `security/identity-and-access/authorization`.

**B2. Authentication is a per-route dependency list computed once.**
- forces: a token's presence varies per request, so it cannot be resolved at
  import time.
- where: `main.py:21`; deliberately omitted on `/api/config` (`:183`) and
  `/health` (`:252`).
- corpus: **CATCH** — `dispatch-chokepoint-gating`. And it is the *boundary* for
  B1: `[Depends(...)] if auth else []` evaporates to an empty list, which
  attaches cleanly to every route and logs nothing. The two mechanisms sit
  twenty lines apart and fail in opposite directions.

**B3. The storage layer re-validates titles the API layer already validated.**
- forces: `get`/`update`/`delete` take the title from the path, not from a
  modelled body, and the storage class cannot know its caller.
- where: `file_system.py:71,82,106` against `models.py:15-19`.
- corpus: **CATCH.** The `markdown-vault` golden path already states the one
  canonical funnel at the vault root as a trust boundary.

### Routing count (v2.2), written before deciding

- **Per system:** System A carries 5 entries, **1 unhomed** (A3). System B
  carries 3 entries, **1 unhomed** (B1). Neither system reaches three.
- **Across systems:** the two `HOME IF NEW` clauses name two *different*
  existing subjects. No three entries share one home-if-new.
- **Neither clause fires — no forge handoff, no XL spec.** This is a small,
  coherent tree whose architecture the corpus already models; the yield is two
  mechanisms at its edges, which is what the class predicted.

## Triage table

Read stated per row; score computed from it. Threshold `G-R >= 2` and `G >= COST`.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Mirror projection can drop content into no field | `integration/markdown-vault` | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | technique | M | A process-constant mode belongs in the route table | `security/.../authorization` | new-technique | real gap | 2/0/2 | **accept** |
| 3 | K | amendment | S | Schema version as the index's *name*, not a field | `markdown-vault/mirror-indexes` | none | partial | 1/0/1 | untriaged |
| 4 | K | amendment | S | TOTP replay guard is per-process in memory | `authorization` | none | thin | 1/1/1 | untriaged |
| 5 | — | — | — | Lazy query-time reconciliation of the index | `mirror-indexes` | none | likely catch | — | already covered |
| 6 | — | — | — | `!=` not `>` on mtime | `replicated-substrate` | none | likely catch | — | already covered |
| 7 | — | — | — | Retry-then-proceed-stale on index lock | `retry-backoff` | none | likely catch | — | already covered |
| 8 | — | — | — | Storage layer re-validates its own inputs | `vault-as-database` | none | likely catch | — | already covered |

`auto=2/0/0`, `fp=0`. No vetoes fired: V1 does not bind (both landings are
techniques inside existing subjects, no new category), V2 satisfied by code read
in a tree for both, V4 satisfied — both strip clean.

**The declared focus decided row 3, and this is the run's clearest instance of
focus item 1.** Version-as-identity is a genuinely elegant mechanism:
`INDEX_SCHEMA_VERSION = "5"` is passed as whoosh's `indexname`, so
`exists_in(path, indexname="5")` is simply false for an index written under
schema 4, the old directory is cleared, and a fresh one is built —
*a stale derived artifact is made unopenable rather than detectably stale, and
no migration code exists to be wrong* (`file_system.py:28`, `:176-192`). I
scored the shape before the row, as the focus asks. As a **technique** it would
have scored G3, cleared the bar and landed. As what it actually is — a boundary
case of `mirror-indexes`' existing "full rebuild exists and is cheap to reach
for", telling you *what triggers* that rebuild automatically — it is an
amendment at G1, and G-R=1 against a threshold of 2. The focus item says pick
the least-rewriting shape that still lands the mechanism, **then** score. The
least-rewriting shape here is the amendment, and the amendment does not clear
the bar. Banked with anchors rather than promoted by choosing a shape that
would have flattered it.

Row 4's promoting question was executed: *does `authorization` model a
single-process in-memory replay guard?* One read of
`machine-credential-consumption` — it models use-counting under an upgraded lock
in a store, which is the multi-process answer, and the tree's single-worker
deployment makes the in-memory version correct rather than defective here.
Not promoted; no finding.

## What landed

**`markdown-vault/projection-covers-the-record`** — a mirror is written from a
*projection* of the record into the mirror's fields, and that stage has no owner
in this subject. Every existing obligation on a mirror is about **freshness**;
this one is about **fidelity**, and the two are independent in a way that is
easy to miss: this tree's index is reconciled on *every single query*, so it is
never stale, and it still cannot find the token. Re-running the rebuild
reproduces the loss exactly, because the loss is inside the rebuild.

Measured, with the harness asserted against a known positive and a known
negative before either real case ran:

| input | `tags` | indexed `content` |
|---|---|---|
| `hello #alpha world` (known positive) | `['alpha']` | `hello # world` |
| `hello alpha world` (known negative) | `[]` | unchanged |
| ``see `git commit #beta here` end`` | `[]` | ``see `git commit # here` end`` |
| ` ```\n#gamma = 1\n``` ` | `[]` | ` ```\n# = 1\n``` ` |

`beta` and `gamma` are in the file, on the user's screen, and in no field of the
index. The technique's rules: one named predicate resolved by both the extractor
and the stripper; a construct the extractor declines still needs a destination;
assert coverage over the **union** of projected fields rather than correctness
per field (the field-level tests both pass here — that is why they do not catch
it); and declare whether the mirror stores content or only terms, because this
one stores terms and therefore the projection cannot be inspected after the
fact, only re-executed.

**`authorization/unregistered-is-stronger-than-refused`** — the subject's thesis
is moving a decision from N handlers that could forget it to one chokepoint that
cannot be bypassed. That is right for every decision made *per request*, and it
assumes the decision has to be made per request. Some are not: a dimension fixed
at process start is answered before the first request arrives, and for that one
there is a construction stronger than the chokepoint — do not build the
operation. It is the operation-level form of the move `identity-bearing-keys`
makes on data, and the discriminator is one question: *can the answer differ
between two requests to this process?*

The technique's boundary was written by the source itself, twenty lines from its
positive case. `auth_deps = [Depends(auth.authenticate)] if auth else []`
(`main.py:21`) is the companion construction, and its disabled state is an
**empty list** that attaches cleanly to all eleven routes, logs nothing, and
leaves the surface fully addressable. One mechanism removes the door when
restricted; the other removes the lock when permissive. Hence the pairing rule:
a construction whose disabled state is "no guards" must announce it; one whose
enabled state is "no route" need not, because the absence is observable from
outside.

Both landed as **new techniques rather than amendments**, per v2: a decision is
a mechanism, and an amendment is for the boundary case of a mechanism the corpus
already owns. Both landings are appends — a new file, a `techniques:` list
entry, a new section — so every existing sentence in both subjects stays true.

## Applied

**Row 1 — `projection-covers-the-record`, seam in this registry, mode
`experiment`, verdict `better`, shipped.** The registry is itself a markdown
vault with a derived mirror: `index.json` projects each document into slug,
`use_when` and law statements, and **drops the body**. `research-map.mjs` reads
that projection. So the corpus's own instrument has the technique's defect, and
the corpus has recorded false absences from it twice (2026-08-31, 2026-09-01)
without naming the mechanism.

Paired, with both assertions run first:

| arm | term | markdown-vault rows | total rows |
|---|---|---|---|
| known positive | `markdown vault` | 2 | 3 |
| known negative | `zzqqxxwv` | 0 | 0 |
| A (index projection) | `shared custody` | **0** | **40** |
| B (`--prose`) | `shared custody` | **2** | 40 |

`shared custody` is in the body of `integration/markdown-vault` and of
`llm-agent/companion/companion-identity`, and in no slug or `use_when` anywhere.
**Arm A's failure is not an empty result — it is forty confident rows with the
concept's owner in none of them.**

That is what shipped. The instrument's own header comment told readers to
"use `--prose` before believing any empty", and *neither recorded failure was
ever empty*: the 2026-08-31 case returned six subjects, mine returned forty. The
imperative was narrower than the evidence sitting beside it. Corrected the
comment with the measured case, and added a printed footer that names what the
matching did **not** read and states that a full result set is not an absence
proof — with the line varying by whether `--prose` and `--deep` were actually
passed, so it describes the run rather than the tool.

**Row 2 — `unregistered-is-stronger-than-refused`, seam in pumper, mode `code`,
verdict `better`, proof `ab-paired`, shipped as `b086a30` (not pushed).**
pumper's MCP surface already implements the technique, and implements it better
than the tree it was forged from: the actuating tools are withheld from
`tools/list` when `[mcp] allow_enqueue` is off, *and* a guarded dispatch arm
returns a readable error naming the switch — where flatnotes can only answer 404
and has to publish its mode through a separate endpoint.

What pumper lacked is the seam the construction opens. The gated set
`{enqueue_job, fetch_readable, deep_research}` is spelled **three times** in
`crates/server/src/mcp/mod.rs` — the `allow_enqueue` block that decides what is
advertised (`:262`), the guarded dispatch arms that decide what is reachable
(`:366-370`), and the refusal arm that decides what gets a readable error
(`:371-374`). Three hand-maintained copies of one closed vocabulary. They agree
today and nothing makes them agree tomorrow, and the drift directions are not
equally loud: a tool advertised behind the gate whose dispatch arm loses its
guard stays **callable while the switch is off**, silently, and it actuates.

Shipped a build-time checker over the registration sites plus fixtures.
**Arm A: 0 of 4 drift directions detectable by anything in the repo. Arm B: 4 of
4**, plus two cannot-check guards so a parser whose shapes have moved reports
that rather than reporting clean. 10/10 green, whole node lane 34/34, wired into
the justfile and the CI job that already runs that lane.

**The instrument was asserted against a known positive and cross-checked from a
different layer** (focus item 3): it parses the three gated names at all three
sites, and its *ungated* set — `list_apps, query_dataset, search, wait_job` —
independently matches the list `crates/server/src/e2e/mcp.rs:173` pins in Rust
from a running server. Two instruments built differently, agreeing.

## Untriaged, with anchors — nobody verified these

- **Schema version as the derived store's identity.** `INDEX_SCHEMA_VERSION = "5"`
  is whoosh's `indexname`, so an index written under an older schema is not
  *detected* as stale, it is **unopenable**, and the load path clears the
  directory and rebuilds (`file_system.py:28`, `:176-192`). The generalization —
  for a disposable derivation, make the stale artifact unaddressable instead of
  migrating it — is real and is a boundary case of `mirror-indexes`' rebuild
  rule. Held back on score, not on doubt; see the focus note above.
- **The TOTP replay guard is process-local.** `self.last_used_totp`
  (`auth/local/local.py:40`, `:65`, `:70`) is in-memory, so two workers would
  each accept the same code once. Correct for this tree's single-worker
  deployment and undocumented as a deployment constraint. The promoting question
  was executed and did not promote it.

## Lead

- **A denylist that is doing two jobs, and documents neither.**
  `is_valid_filename` (`helpers.py:16-25`) rejects exactly `<>:"/\|?*` — the
  Win32 reserved set — and its docstring says only which characters it rejects.
  It is also the entire path-traversal defense, and it works only because that
  set happens to contain **both** separators: `../x` is refused for the `/`, not
  for the `..`. One list, two purposes, one of them accidental and neither
  stated; a maintainer relaxing it for Linux (where `:` is a legal filename
  character) would remove a security property nothing names.
  **Return condition:** when a second tree is found where a
  platform-compatibility denylist is also the security boundary — then it is a
  technique about a validator whose two jobs have different correct answers,
  and one sighting is not enough to write it.

## Board

1 sibling live at claim (`intake-aws-expose-0906`), 1 at Phase 9, holding
`client-fetch-cache`, `rate-limiting`, `retry-backoff`, `model-routing`,
`prompt-safety` and `agent-chaining` — no overlap with either subject here, and
the `check` before the first write came back clear both times.

**`index.json` and `catalog.json` deliberately NOT regenerated.** The sibling
had two uncommitted technique files (`similarity-keyed-admission`,
`failover-horizon`) in the tree throughout, and the index carries per-subject
content digests, so a regeneration would have baked their in-flight edits into
an artifact committed under this run's name. A stale index in a shared checkout
is a known, self-correcting state; that is not.
