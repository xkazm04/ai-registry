---
subject: markdown-vault
domain: software-engineering
last_touched: 2026-09-06
touched_by: intake
dry_streak: 0
---

# markdown-vault

First touch by `/intake`: 2026-09-04, from a self-hosted markdown note-taking
service handed over by the operator with no framing. The subject was already
mature — 7 techniques, 6 applications, a golden path that states its own physics
("the engine is the filesystem; the concurrent writers include a human with a
text editor") — and sat at 44 attention points on the librarian worklist, third
in the software-engineering domain.

## State

7 → 8 techniques, 6 → 8 applications (first `python` application; the subject was
`rust`-heavy with one `node`).

Landed: **`read-triggered-reconciliation`** — the reconcile's *trigger* rather
than its mechanism, which is the axis `mirror-indexes` and `editor-interop`
between them left unowned.

## How it was found, because the shape is reusable

By the **enumeration hunt** (Phase 6 step 3), on a document that had already
done the hard thinking. `editor-interop:78-94` is an unusually good passage: it
lists the watcher's silent failure modes one by one, concludes that they "turn
the time bound above from prudence into the load-bearing mechanism", and
explicitly demotes the watcher to "an optimization that usually fires first".
That is a two-member enumeration stated with real confidence — a watcher, and a
time-based staleness bound — and confidence is exactly what makes an enumeration
worth one question.

The source contained the third member. Bind the rescan to the *read* and neither
is needed: the staleness window collapses to the query itself, so there is no
window left to bound and no watcher left to fail silently. The subject had
modelled *how* a mirror is rebuilt in depth and *when* almost not at all.

Two things came with it that make the technique more than a trigger swap:

- **The stamp lives in the mirror, so there is no ledger.** `mirror-indexes`
  models the hash-ledger gate honestly, including the confession it owes under
  `gate-sees-target` — the gate reads the ledger and believes it read the disk.
  Storing the source record's own change-stamp *as a field of the mirrored
  record* removes the third store, and with it the gap that needed confessing.
- **The comparison is inequality, not ordering.** Justified from
  `replicated-substrate`, which the subject already owns: a sync client, a
  checkout or a timestamp-preserving copy writes modification times wholesale
  and can install an *older* file. A `<` gate reads that as "the mirror is
  ahead" and serves the superseded derivation forever. The source uses `!=`
  without explaining why; the corpus supplied the reason, which is the run's
  clearest case of the registry being stronger than the tree it read.

One new failure mode was added to the golden path — **the stamp nobody
resolves** — and it is not hypothetical; see below.

## What it cost

Nothing in fetches. Corroboration was training-data convergence (validate-on-use
cache revalidation; mtime-comparison-on-demand as the oldest build-tool
reconciler), and the non-obvious half was corroborated *by the corpus itself*
rather than by the web. Fourth consecutive practitioner-codebase run to spend
zero of three.

## The apply, which found a defect

`personas`, mode `code`, verdict `better`, `ab-paired`, shipped `43988bd6d`.

The project keeps a context index whose records carry a `reconciledToSha`. The
pre-push gate maintaining it computed staleness **entirely from the uncommitted
working diff** and never resolved the stamp — both of the technique's first two
failure modes, live, in the first tree tried. The recorded stamp turns out not
to resolve to a commit in the repository at all, and the root module's context
document was last committed 2026-06-11 with 4,215 commits since. Arm A saw none
of it and had seen none of it for three months.

Fleet reach: 1 of 8 projects carries this seam.

## Leads and open ground

- The subject still has no application from a tree that reconciles on a
  **timer or an explicit refresh** — the two places the technique says the
  trigger moves to when the corpus outgrows the read path. Both branches of that
  boundary are asserted and neither is witnessed.
- Untriaged from the same source, adjacent but not landed: the derived index
  storing no content at all, so a search highlight re-reads the source file
  (`mirror-indexes`' "the vault is authoritative", as a storage consequence).
  Recorded with anchors in the source note.

- `file-browsing` — dematerialized/on-demand files and partial trees are general to any
  directory walker, not vault-specific.
- `sync-replication` — conflict artifacts re-entering a scanned corpus as records; atomic
  rename reading as delete-plus-create to a replication agent.
- [[agent-memory]] — the unwired-optional-tier deletion incident, and in-band review
  dates over substrate-owned timestamps.
- **Home-ambiguous:** the debounce split (recompute vs diff consumers) is general to any
  change-event subject; it currently sits in two techniques here and may belong upstream.

Source note: [[2026-09-04-flatnotes]]

## 2026-09-06 — `/intake` (flatnotes), run `intake-flatnotes-0906`

Source: `github:dullage/flatnotes` @ `7f5b773c` — a Python/Whoosh note app over
a flat markdown folder. Topped the librarian worklist that morning at **44
attention points**, the highest in the fleet, which is what routed the run here.

Landed **`projection-covers-the-record`** (new technique, 7 -> 8) plus a
`python` application — the subject's first Python stack; it was `node,rust`.

**The finding is an asymmetry, not a hole in coverage.** The subject models a
mirror's *freshness* with five separate mechanisms in `mirror-indexes` — the
rebuild path exists, incremental writes are hash-gated, mirror failure never
breaks the primary path, the skip-gate confesses its proxy, direction is the
contract — and models its *fidelity* with nothing. A mirror is written from a
**projection** of the record into the mirror's fields, and that stage had no
owner: the golden path's pipeline assigns the walk to `vault-walking`, the
record contract to `vault-as-database`, and the write and its gating to
`mirror-indexes`, and then the field projection simply happens.

The two properties are independent, and the source proves it in the cheapest
possible way: its index is reconciled **on every single query**, so it is never
stale by more than one search, and it still cannot find the token. Re-running
the rebuild reproduces the loss exactly, because the loss is inside the rebuild.

Measured on the source's own functions (known positive and known negative
asserted first): a `#tag` inside a code span is excluded from the tag set by
the extractor — correctly — and removed from the indexed body by the stripper,
which never heard about the exclusion. The token is in the file, on the user's
screen, and in **no field of the index**. Two adjacent lines,
`file_system.py:200-202`, each individually correct.

Also recorded in the application, as agreement rather than as a finding: the
tree compares mtimes with `!=` and not `>`, which is the predicate
`replicated-substrate` implies and does not state — the peer writers here set
timestamps *backwards*, so a `>` comparison would never re-index a note
restored from backup.

Folded in rather than banked separately: the source stores terms and no
content, which is the strong position on fidelity's other axis (the mirror
holds nothing with which to contradict the vault) and carries the consequence
that makes the defect expensive — with no stored document there is nothing to
dump, so the projection can only be re-executed, never read back.

**Untriaged with anchors**, held back on score and not on doubt:
`INDEX_SCHEMA_VERSION` is passed as the index's *name*, so a stale-schema index
is unopenable rather than detectably stale and no migration code exists. A
genuine mechanism, but honestly a boundary case of `mirror-indexes`' existing
rebuild rule, and as an amendment it scores G1 against a threshold of 2.

**Applied `experiment`, verdict `better`, shipped.** The seam is this registry:
`index.json` projects each document into slug, `use_when` and law statements and
drops the body, and `research-map.mjs` reads that projection — so the corpus's
own instrument carries the technique's defect, and the ledger has recorded false
absences from it twice without naming the mechanism. Paired: `shared custody`
(present in two document bodies, in no slug or `use_when` anywhere) returns
**0 owning rows out of 40** through the index and 2 under `--prose`. The failure
is not an empty result, it is a full one. Corrected the instrument's own
guidance, which had keyed the habit on emptiness while neither recorded failure
was ever empty.
### 2026-09-23 - `/conform --stale` on personas (14 pairs re-judged)

3 deviation, 11 not-applicable. The eleven are credential-vault contexts matched on the
bare word "vault" - a matcher false positive that recurs on every rebuild. Fixed since:
the sidecar's escaping and atomic write, and the graph panel's orphan predicate. Still
short: a second hand-rolled walker in the sidecar, slug-keyed note writes that overwrite
on collision, a Drive pull that writes notes non-atomically and without a divergence check,
two orphan predicates and two duplicate-basename rules between graph and lint, and an
open-in-editor link built from an absolute path. Proposals from the judge, unplaced: (1)
the golden path has no when-not-to-use section - add one naming credential vaults,
database browsers and one-shot vector ingest as out of scope, which would also give the
matcher a precondition to route by; (2) `editor-interop`'s deep-link rule should cover the
reverse path-shape error (absolute where the scheme is vault-relative): convert at one
boundary; (3) `replicated-substrate` should cover the application as its own replication
agent - its writes owe atomic replace and a divergence check, and they reset the mtime
the staleness check reads. **Coverage:** a directory ingest into a vector store is a real
gap for an ingestion subject, not this one.

## Architecture review - 2026-10-31

First architecture review of the subject, against `a2ac51c1c`. All 19 documents read
in full. The techniques hold up, and the watcher failure modes they lean on are
confirmed by the platform documentation. One cross-document error recurs: three
documents name a version-control checkout as a writer that installs an *older*
modification time. The Git FAQ says the opposite. A checkout stamps every file it
writes with the current time. The `!=` predicate stays correct, because sync clients,
backup restores, archive extraction and timestamp-preserving copies can still move a
stamp backwards. Only the attribution is wrong.

Two of the 2026-09-23 conform proposals turn out to be checkable. The deep-link
path-shape error is real: the editor's URI scheme takes a vault-relative `file` and
an absolute `path` as two different parameters. The proposed when-not-to-use section
is a scoping judgment that no source decides, so it stays owed. The third proposal
(the application as its own replication agent) is banked as a lead, not a
correction.

Spot-checks against the private consumer tree at `a7b34f56`: the sidecar's vault-note
write now goes through `atomic_write`, so the seam `applications/rust--editor-interop.md`
measured is closed. The graph's orphan command and its stats still count "no
backlinks" with no entry-point exemption. Whatever the conform note meant by "fixed
since: the graph panel's orphan predicate", the backend divergence recorded in the
lint application is still there.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/markdown-vault",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:7a10f98b2d9488ac",
  "disposition": "clarify",
  "coverage": "All 19 documents (golden path, 9 techniques, 9 applications) read in full. Public sources were opened this run: the flatnotes tree at its pinned commit (re-executed the four projection cases), Foam at its pinned commit (3 of about 20 anchors), the Git FAQ, inotify(7), Apple's FSEvents guide and Obsidian's URI documentation. Private consumer tree applications were spot-checked against a newer commit only. Their dated commits were not re-run.",
  "counterexamples": [
    "A version-control checkout of an older revision writes older content under a NEWER modification time, so an ordering gate catches it. A backup restore or a timestamp-preserving copy is the writer that defeats `<`.",
    "A deep link that is vault-relative in shape can still be wrong: an absolute path placed in the scheme's vault-relative parameter resolves to nothing.",
    "A credential vault or a database browser matches 'vault' lexically and has none of this subject's physics (no human editor peer, no files as records).",
    "A mirror reconciled on every query is never stale and still cannot find a token its projection dropped (retained from the technique; reproduced this run on flatnotes)."
  ],
  "sources": [
    {
      "url": "https://archive.kernel.org/oldwiki/git.wiki.kernel.org/index.php/Git_FAQ.html",
      "result": "'Git sets the current time as the timestamp on every file it modifies, but only those.' Refutes 'a checkout can install an older stamp' in three documents. Supports replicated-substrate's 'a fresh checkout ... writes every file at checkout time'."
    },
    {
      "url": "https://man7.org/linux/man-pages/man7/inotify.7.html",
      "result": "Inotify 'does not catch remote events that occur on network filesystems'. 'the event queue can overflow. In this case, events are lost', and recovery may rebuild 'part or all of the application cache'. max_user_watches is 'an upper limit on the number of watches that can be created per real user ID'. Supports editor-interop and replicated-substrate."
    },
    {
      "url": "https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/UsingtheFSEventsFramework/UsingtheFSEventsFramework.html",
      "result": "Events 'may be coalesced into a single event'. On drops 'you must do a full scan'. 'backup software should still periodically perform a full sweep of any volume'. Supports the coalescing and periodic-full-scan claims."
    },
    {
      "url": "https://obsidian.md/help/Extending+Obsidian/Obsidian+URI",
      "result": "'file can be either a file name, or a path from the vault root'; 'path an absolute file system path to a file' that overrides vault and file; values must be URI encoded. Supports the conform judge's reverse path-shape proposal for editor-interop."
    },
    {
      "url": "https://github.com/dullage/flatnotes/tree/7f5b773c9cb37cc84978079ed4790e7de38d3970",
      "result": "file_system.py, README, entrypoint.sh, .python-version, pyproject.toml and Dockerfile re-read at the pinned commit. Every line anchor in both python applications matches (28, 35, 39, 57, 118, 157, 173-192, 194-207, 200-202, 219, 229, 234-270, 250-253, 272-286, 343). The README quote matches, as do version 5.5.5, whoosh==2.7.4 and the absence of --workers. The four projection cases re-executed with identical output. The tree-wide 'no tests' and 'no watcher' claims were not re-checked (tree listing unavailable)."
    },
    {
      "url": "https://github.com/foambubble/foam/tree/3452c984a7f5d62fbabfa7ed800263aa3c48dfb0",
      "result": "Spot-checked graph.ts:21-29 (placeholders/links/backlinks maps), graph.ts:87-90 (the NOT-debounced comment, verbatim) and workspace.ts:528 (normalize = toLocaleLowerCase). All hold; the other anchors were not reopened."
    },
    {
      "source": "Private consumer tree at a7b34f56 (newer than every application's dated commit)",
      "result": "The MCP sidecar's vault note write now calls atomic_write and yaml_quote, so the rust--editor-interop seam is closed. graph.rs orphan list and stats still have no entry-point exemption, while lint.rs keeps is_likely_entry_point. Spot-check only; the applications' dated commits were not re-run."
    }
  ],
  "documents": {
    "markdown-vault.md": {
      "disposition": "clarify",
      "reason": "Content consistent with the techniques. Owed from the 2026-09-23 conform judge: a when-not-to-use section naming credential vaults, database browsers and one-shot vector ingest as out of scope, which would also give the context matcher a precondition. Scope is a judgment call, not a sourced fact."
    },
    "techniques/vault-as-database.md": {
      "disposition": "keep",
      "reason": "Write-strict/read-tolerant/round-trip, in-band vs out-of-band references, two named path funnels and atomic write with a reaper are coherent and match their application."
    },
    "techniques/link-graph-extraction.md": {
      "disposition": "keep",
      "reason": "Already absorbed the Foam corrections (path suffixes, structure-located links, placeholder nodes, incremental fan-out, debounce for recompute consumers only). The spot-checked Foam anchors hold."
    },
    "techniques/knowledge-integrity-lint.md": {
      "disposition": "keep",
      "reason": "Defect classes, the false-clean rule, the absent-vs-unreadable gap and the reachability-of-the-judgment-tier lesson are consistent with their applications and with replicated-substrate."
    },
    "techniques/vault-walking.md": {
      "disposition": "keep",
      "reason": "Three declared decisions, symlink postures and behaviour-preserving unification are sound. Replication-artifact exclusion is owned by replicated-substrate, which names this gap."
    },
    "techniques/mirror-indexes.md": {
      "disposition": "keep",
      "reason": "Rebuild path, hash-gated writes, non-blocking mirror, confessed ledger gap and direction-as-contract are coherent. Read-triggered reconciliation is correctly framed as an alternative trigger, not a contradiction."
    },
    "techniques/read-triggered-reconciliation.md": {
      "disposition": "clarify",
      "reason": "'a sync client, a checkout, an archive extraction and a timestamp-preserving copy ... any of them can install a record whose stamp is older' is wrong for the checkout: Git stamps written files with the current time. Keep the checkout as a wholesale rewriter, and drop it from the older-stamp claim."
    },
    "techniques/projection-covers-the-record.md": {
      "disposition": "clarify",
      "reason": "Frontmatter `laws` lists derivation-names-recomputation (never invoked in the body) and omits count-carries-predicate (invoked in the coverage-assertion section). Reconciling it changes the generated index, so the Director owes it together with an index regeneration."
    },
    "techniques/editor-interop.md": {
      "disposition": "clarify",
      "reason": "The watcher failure modes are confirmed by inotify(7) and the FSEvents guide. The deep-link rule covers separators and extensions but not relative-vs-absolute shape, and the scheme takes a vault-relative `file` and an absolute `path` as separate parameters. Add: the value's shape follows the parameter it fills, converted at one boundary."
    },
    "techniques/replicated-substrate.md": {
      "disposition": "keep",
      "reason": "Its checkout claim matches the Git FAQ, and its watcher claims match inotify(7) and FSEvents. Lead from the 2026-09-23 conform judge, not a correction: the application is itself a replication agent whose writes reset the mtime the staleness check reads and owe a divergence check."
    },
    "applications/rust--vault-walking.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--vault-as-database.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--mirror-indexes.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. The 2026-09-23 conform note still lists the ledger-vs-disk gap shape as unreconciled."
    },
    "applications/rust--knowledge-integrity-lint.md": {
      "disposition": "reverify",
      "reason": "Dated claims stand as dated. At a7b34f56 the graph orphan list and stats still have no entry-point exemption, so the recorded divergence persists in the backend. The full anchor set was not re-run."
    },
    "applications/rust--editor-interop.md": {
      "disposition": "clarify",
      "reason": "Its header says the seam is unchanged and the sidecar 'still writes naively'. At a7b34f56 the sidecar's vault-note write calls atomic_write. Add a dated note that the seam closed. The A/B, the Windows rename-error finding and the bounded-retry obligation are unaffected."
    },
    "applications/node--link-graph-extraction.md": {
      "disposition": "clarify",
      "reason": "Three 'the technique says' quotes (basename index, unresolved links as edges, blanket debounce) describe the technique before this file corrected it. The current technique says the opposite, so they need past tense. The spot-checked anchors hold."
    },
    "applications/python--read-triggered-reconciliation.md": {
      "disposition": "clarify",
      "reason": "All line anchors and the README quote re-verified at 7f5b773. 'a checkout or a timestamp-preserving copy can install an older file' needs the checkout replaced by a restore-style writer, per the Git FAQ. The tree-wide no-watcher claim was not re-checked, so verified_on stays."
    },
    "applications/node--read-triggered-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Private consumer measurement, not reopened. Internally consistent: the two arms, the 4,215/4,198 counts on different stamps and the cmd.exe caret pitfall are plausible and scoped."
    },
    "applications/python--projection-covers-the-record.md": {
      "disposition": "clarify",
      "reason": "Anchors and the four executed cases reproduced at 7f5b773. 'a sync client and a version-control checkout, both of which set mtimes backwards on restore' contradicts the Git FAQ for the checkout; name a backup restore instead. The 0-test-files count was not re-checked, so verified_on stays."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied six of the eight clarify items from the record above, against `b0759cea0`.
The checkout attribution is corrected in the technique and in both flatnotes
applications. The deep-link rule now covers relative-vs-absolute shape. The Foam
application's stale present-tense quotes of the technique are now past tense. The
editor-interop application carries a dated note that its seam has closed. Still
owed: the golden path's when-not-to-use section (a scoping judgment) and the
projection-covers-the-record `laws` frontmatter (it needs an index regeneration
outside this worker's scope). The overall disposition therefore stays `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/markdown-vault",
  "date": "2026-10-31",
  "baseline": "b0759cea0",
  "digest": "sha256-b2:7eac369df32d979d",
  "disposition": "clarify",
  "coverage": "Second 2026-10-31 record. All 19 documents decided. Six of the eight clarify items were applied from sources opened this run (the Git FAQ, Obsidian's URI documentation, the private consumer tree at a7b34f56) or from the internal contradiction between an application and the current technique. Edited passages were re-read. Untouched documents keep the first record's dispositions. No verified_on date moved, because no application had every citation re-checked.",
  "counterexamples": [
    "A version-control checkout of an older revision writes older content under a NEWER modification time, so an ordering gate catches it. A backup restore or a timestamp-preserving copy is the writer that defeats `<`.",
    "A deep link that is vault-relative in shape can still be wrong: an absolute path placed in the scheme's vault-relative parameter resolves to nothing.",
    "A credential vault or a database browser matches 'vault' lexically and has none of this subject's physics (no human editor peer, no files as records).",
    "A mirror reconciled on every query is never stale and still cannot find a token its projection dropped (retained from the technique; reproduced this run on flatnotes)."
  ],
  "sources": [
    {
      "url": "https://archive.kernel.org/oldwiki/git.wiki.kernel.org/index.php/Git_FAQ.html",
      "result": "'Git sets the current time as the timestamp on every file it modifies, but only those.' Refutes 'a checkout can install an older stamp' in three documents. Supports replicated-substrate's 'a fresh checkout ... writes every file at checkout time'."
    },
    {
      "url": "https://man7.org/linux/man-pages/man7/inotify.7.html",
      "result": "Inotify 'does not catch remote events that occur on network filesystems'. 'the event queue can overflow. In this case, events are lost', and recovery may rebuild 'part or all of the application cache'. max_user_watches is 'an upper limit on the number of watches that can be created per real user ID'. Supports editor-interop and replicated-substrate."
    },
    {
      "url": "https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/UsingtheFSEventsFramework/UsingtheFSEventsFramework.html",
      "result": "Events 'may be coalesced into a single event'. On drops 'you must do a full scan'. 'backup software should still periodically perform a full sweep of any volume'. Supports the coalescing and periodic-full-scan claims."
    },
    {
      "url": "https://obsidian.md/help/Extending+Obsidian/Obsidian+URI",
      "result": "'file can be either a file name, or a path from the vault root'; 'path an absolute file system path to a file' that overrides vault and file; values must be URI encoded. Supports the conform judge's reverse path-shape proposal for editor-interop."
    },
    {
      "url": "https://github.com/dullage/flatnotes/tree/7f5b773c9cb37cc84978079ed4790e7de38d3970",
      "result": "file_system.py, README, entrypoint.sh, .python-version, pyproject.toml and Dockerfile re-read at the pinned commit. Every line anchor in both python applications matches (28, 35, 39, 57, 118, 157, 173-192, 194-207, 200-202, 219, 229, 234-270, 250-253, 272-286, 343). The README quote matches, as do version 5.5.5, whoosh==2.7.4 and the absence of --workers. The four projection cases re-executed with identical output. The tree-wide 'no tests' and 'no watcher' claims were not re-checked (tree listing unavailable)."
    },
    {
      "url": "https://github.com/foambubble/foam/tree/3452c984a7f5d62fbabfa7ed800263aa3c48dfb0",
      "result": "Spot-checked graph.ts:21-29 (placeholders/links/backlinks maps), graph.ts:87-90 (the NOT-debounced comment, verbatim) and workspace.ts:528 (normalize = toLocaleLowerCase). All hold; the other anchors were not reopened."
    },
    {
      "source": "Private consumer tree at a7b34f56 (newer than every application's dated commit)",
      "result": "The MCP sidecar's vault note write now calls atomic_write and yaml_quote, so the rust--editor-interop seam is closed. graph.rs orphan list and stats still have no entry-point exemption, while lint.rs keeps is_likely_entry_point. Spot-check only; the applications' dated commits were not re-run."
    }
  ],
  "documents": {
    "markdown-vault.md": {
      "disposition": "clarify",
      "reason": "Content consistent with the techniques. Owed from the 2026-09-23 conform judge: a when-not-to-use section naming credential vaults, database browsers and one-shot vector ingest as out of scope, which would also give the context matcher a precondition. Scope is a judgment call, not a sourced fact."
    },
    "techniques/vault-as-database.md": {
      "disposition": "keep",
      "reason": "Write-strict/read-tolerant/round-trip, in-band vs out-of-band references, two named path funnels and atomic write with a reaper are coherent and match their application."
    },
    "techniques/link-graph-extraction.md": {
      "disposition": "keep",
      "reason": "Already absorbed the Foam corrections (path suffixes, structure-located links, placeholder nodes, incremental fan-out, debounce for recompute consumers only). The spot-checked Foam anchors hold."
    },
    "techniques/knowledge-integrity-lint.md": {
      "disposition": "keep",
      "reason": "Defect classes, the false-clean rule, the absent-vs-unreadable gap and the reachability-of-the-judgment-tier lesson are consistent with their applications and with replicated-substrate."
    },
    "techniques/vault-walking.md": {
      "disposition": "keep",
      "reason": "Three declared decisions, symlink postures and behaviour-preserving unification are sound. Replication-artifact exclusion is owned by replicated-substrate, which names this gap."
    },
    "techniques/mirror-indexes.md": {
      "disposition": "keep",
      "reason": "Rebuild path, hash-gated writes, non-blocking mirror, confessed ledger gap and direction-as-contract are coherent. Read-triggered reconciliation is correctly framed as an alternative trigger, not a contradiction."
    },
    "techniques/read-triggered-reconciliation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the older-stamp claim now names a sync client, backup restore, archive extraction or timestamp-preserving copy. It states that a checkout stamps with the current time. The 'ordering comparison' failure mode reads 'restore, sync or timestamp-preserving copy' instead of 'checkout'."
    },
    "techniques/projection-covers-the-record.md": {
      "disposition": "clarify",
      "reason": "Frontmatter `laws` lists derivation-names-recomputation (never invoked in the body) and omits count-carries-predicate (invoked in the coverage-assertion section). Reconciling it changes the generated index, so the Director owes it together with an index regeneration."
    },
    "techniques/editor-interop.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the deep-link path-shape rule now covers relative-vs-absolute. A scheme can take both shapes as different parameters, so the value is converted at one boundary."
    },
    "techniques/replicated-substrate.md": {
      "disposition": "keep",
      "reason": "Its checkout claim matches the Git FAQ, and its watcher claims match inotify(7) and FSEvents. Lead from the 2026-09-23 conform judge, not a correction: the application is itself a replication agent whose writes reset the mtime the staleness check reads and owe a divergence check."
    },
    "applications/rust--vault-walking.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--vault-as-database.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--mirror-indexes.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. The 2026-09-23 conform note still lists the ledger-vs-disk gap shape as unreconciled."
    },
    "applications/rust--knowledge-integrity-lint.md": {
      "disposition": "reverify",
      "reason": "Dated claims stand as dated. At a7b34f56 the graph orphan list and stats still have no entry-point exemption, so the recorded divergence persists in the backend. The full anchor set was not re-run."
    },
    "applications/rust--editor-interop.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: a dated source note records that at a7b34f56 the sidecar's vault-note write calls atomic_write, so the measured seam is closed. The rest of the dated anchors were not re-run, so the application stays reverify."
    },
    "applications/node--link-graph-extraction.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the three 'the technique says' quotes (basename index, unresolved links as edges, blanket debounce) are now past tense and attributed to the pre-correction technique. Three pinned anchors were spot-checked and hold. verified_on unchanged."
    },
    "applications/python--read-triggered-reconciliation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the older-stamp writer is now a backup restore, sync client or timestamp-preserving copy, with a note that a checkout stamps the current time. All line anchors re-verified at 7f5b773. The tree-wide no-watcher claim was not re-checked, so verified_on unchanged."
    },
    "applications/node--read-triggered-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Private consumer measurement, not reopened. Internally consistent: the two arms, the 4,215/4,198 counts on different stamps and the cmd.exe caret pitfall are plausible and scoped."
    },
    "applications/python--projection-covers-the-record.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: backwards-mtime writers are now sync clients and backup restores. A checkout moves stamps forward, so even a > comparison catches it. Anchors and the four executed cases reproduced at 7f5b773. The 0-test-files count was not re-checked, so verified_on unchanged."
    }
  }
}
```

Re-verification, 2026-10-31. rust--editor-interop was re-checked against personas at its two pinned commits and at HEAD. The earlier source note was replaced with a dated re-check paragraph, two anchors were moved, verified_on moved, and the application goes from reverify to keep.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/markdown-vault",
  "date": "2026-10-31",
  "baseline": "1212e28aa",
  "digest": "sha256-b2:796799ad76797bb2",
  "disposition": "clarify",
  "coverage": "Re-verification pass for applications/rust--editor-interop.md against the personas checkout (read, not executed). At bf2a1e249 and a2ef6400e, tools.rs:1471 is the bare std::fs::write with the 'write {}: {e}' error, mod.rs:59 is atomic_write, and graph.rs:516-518 is the uuid-temp copy. All match the body. At HEAD 61029d7ae0, atomic_write is pub(crate) at mod.rs:65 with the quoted doc comment intact, and the graph.rs copy is at :445-447. The sidecar's write is atomic_write at tools.rs:1513 with yaml_quote frontmatter and the same error format. There is no retry after a rename error, and mcp_server/obsidian_vault_tests.rs now exercises the tool without any concurrency. The mcp_server module ships in the same Cargo package as the personas-mcp binary, so 'two crates' reads as two writers. rust-toolchain.toml pins 1.96.1, so verified_against goes from rust@1.97 to rust@1.96. The A/B is the document's own measurement and stands. verified_on is 2026-10-31. Every other document carries the earlier 2026-10-31 record.",
  "counterexamples": [
    "A version-control checkout of an older revision writes older content under a NEWER modification time, so an ordering gate catches it. A backup restore or a timestamp-preserving copy is the writer that defeats `<`.",
    "A deep link that is vault-relative in shape can still be wrong: an absolute path placed in the scheme's vault-relative parameter resolves to nothing.",
    "A credential vault or a database browser matches 'vault' lexically and has none of this subject's physics (no human editor peer, no files as records).",
    "A mirror reconciled on every query is never stale and still cannot find a token its projection dropped (retained from the technique; reproduced this run on flatnotes)."
  ],
  "sources": [
    {
      "source": "personas checkout at bf2a1e249, a2ef6400e and 61029d7ae0 (read, not executed)",
      "result": "At the two pinned commits, src-tauri/src/mcp_server/tools.rs:1471 has a bare std::fs::write, obsidian_brain/mod.rs:59 has fn atomic_write, and graph.rs:516 has fn atomic_write with the Uuid::new_v4 temp name. At HEAD, mod.rs:44-76 holds the pub(crate) atomic_write and its doc comment naming the sidecar, with no retry. tools.rs:1513-1514 calls atomic_write and maps the error to 'write {}: {e}'. graph.rs:445-447 holds the copy. src-tauri/rust-toolchain.toml has channel 1.96.1, and Cargo.toml has [[bin]] personas-mcp."
    }
  ],
  "documents": {
    "markdown-vault.md": {
      "disposition": "clarify",
      "reason": "Content consistent with the techniques. Owed from the 2026-09-23 conform judge: a when-not-to-use section naming credential vaults, database browsers and one-shot vector ingest as out of scope, which would also give the context matcher a precondition. Scope is a judgment call, not a sourced fact."
    },
    "techniques/vault-as-database.md": {
      "disposition": "keep",
      "reason": "Write-strict/read-tolerant/round-trip, in-band vs out-of-band references, two named path funnels and atomic write with a reaper are coherent and match their application."
    },
    "techniques/link-graph-extraction.md": {
      "disposition": "keep",
      "reason": "Already absorbed the Foam corrections (path suffixes, structure-located links, placeholder nodes, incremental fan-out, debounce for recompute consumers only). The spot-checked Foam anchors hold."
    },
    "techniques/knowledge-integrity-lint.md": {
      "disposition": "keep",
      "reason": "Defect classes, the false-clean rule, the absent-vs-unreadable gap and the reachability-of-the-judgment-tier lesson are consistent with their applications and with replicated-substrate."
    },
    "techniques/vault-walking.md": {
      "disposition": "keep",
      "reason": "Three declared decisions, symlink postures and behaviour-preserving unification are sound. Replication-artifact exclusion is owned by replicated-substrate, which names this gap."
    },
    "techniques/mirror-indexes.md": {
      "disposition": "keep",
      "reason": "Rebuild path, hash-gated writes, non-blocking mirror, confessed ledger gap and direction-as-contract are coherent. Read-triggered reconciliation is correctly framed as an alternative trigger, not a contradiction."
    },
    "techniques/read-triggered-reconciliation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the older-stamp claim now names a sync client, backup restore, archive extraction or timestamp-preserving copy. It states that a checkout stamps with the current time. The 'ordering comparison' failure mode reads 'restore, sync or timestamp-preserving copy' instead of 'checkout'."
    },
    "techniques/projection-covers-the-record.md": {
      "disposition": "clarify",
      "reason": "Frontmatter `laws` lists derivation-names-recomputation (never invoked in the body) and omits count-carries-predicate (invoked in the coverage-assertion section). Reconciling it changes the generated index, so the Director owes it together with an index regeneration."
    },
    "techniques/editor-interop.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the deep-link path-shape rule now covers relative-vs-absolute. A scheme can take both shapes as different parameters, so the value is converted at one boundary."
    },
    "techniques/replicated-substrate.md": {
      "disposition": "keep",
      "reason": "Its checkout claim matches the Git FAQ, and its watcher claims match inotify(7) and FSEvents. Lead from the 2026-09-23 conform judge, not a correction: the application is itself a replication agent whose writes reset the mtime the staleness check reads and owe a divergence check."
    },
    "applications/rust--vault-walking.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--vault-as-database.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. No contradiction found."
    },
    "applications/rust--mirror-indexes.md": {
      "disposition": "reverify",
      "reason": "Private tree at a2ef6400e not re-run. The 2026-09-23 conform note still lists the ledger-vs-disk gap shape as unreconciled."
    },
    "applications/rust--knowledge-integrity-lint.md": {
      "disposition": "reverify",
      "reason": "Dated claims stand as dated. At a7b34f56 the graph orphan list and stats still have no entry-point exemption, so the recorded divergence persists in the backend. The full anchor set was not re-run."
    },
    "applications/rust--editor-interop.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31. The body's seam holds at its pinned commits bf2a1e249 and a2ef6400e, as the header states. At personas@61029d7ae0 the sidecar writes through atomic_write, which the dated paragraph says plainly: the seam is closed, the bounded-retry obligation is still open, and the writer boundary is a binary rather than a crate. Anchors were moved to mod.rs:65 and graph.rs:445. verified_on 2026-10-31, verified_against rust@1.96."
    },
    "applications/node--link-graph-extraction.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the three 'the technique says' quotes (basename index, unresolved links as edges, blanket debounce) are now past tense and attributed to the pre-correction technique. Three pinned anchors were spot-checked and hold. verified_on unchanged."
    },
    "applications/python--read-triggered-reconciliation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the older-stamp writer is now a backup restore, sync client or timestamp-preserving copy, with a note that a checkout stamps the current time. All line anchors re-verified at 7f5b773. The tree-wide no-watcher claim was not re-checked, so verified_on unchanged."
    },
    "applications/node--read-triggered-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Private consumer measurement, not reopened. Internally consistent: the two arms, the 4,215/4,198 counts on different stamps and the cmd.exe caret pitfall are plausible and scoped."
    },
    "applications/python--projection-covers-the-record.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: backwards-mtime writers are now sync clients and backup restores. A checkout moves stamps forward, so even a > comparison catches it. Anchors and the four executed cases reproduced at 7f5b773. The 0-test-files count was not re-checked, so verified_on unchanged."
    }
  }
}
```
