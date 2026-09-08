---
layer: application
type: application
subject: markdown-vault
technique: read-triggered-reconciliation
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.13
applied: code
ab_verdict: better
proof: ab-paired
---

# A note app that reconciles its search index on every search

flatnotes is a self-hosted note-taking service over a flat directory of
markdown files, with a Whoosh full-text index as its only derived store. The
version witnessed here is commit `7f5b773`; the stack is pinned by
`.python-version` (3.13) and `uv.lock` in the tree, not by a release tag —
those are the witnesses, because the repository publishes no version file.

Its README states the design constraint that forces everything below: *"the
only thing flatnotes caches is the search index and that's incrementally synced
on every search... you're free to add, edit & delete the markdown files outside
of flatnotes even whilst flatnotes is running."*

## Where the reconcile is triggered

`server/notes/file_system/file_system.py` calls `_sync_index_with_retry()` from
exactly three places, and the shape of the set is the technique:

- `__init__` (line 57), once at boot, with `optimize=True`
- `search()` (line 118), before parsing the query
- `get_tags()` (line 157), before reading the term dictionary

Those are all of the read paths and none of the write paths. `create()`,
`update()` and `delete()` write the file and return; they never touch the index.
There is no watcher anywhere in the tree, and no scheduler. A note written by
the human's editor, a `git pull`, or a sync client is picked up by the next
search — and by nothing before it, which is the honest bargain, because nothing
consumes the index except a search.

## The gate stats the file

`_sync_index` (lines 234–270) is the three-armed sweep. Its per-record gate is
lines 250–253:

```python
elif (
    datetime.fromtimestamp(os.path.getmtime(idx_filepath))
    != idx_note["last_modified"]
):
```

`idx_note["last_modified"]` is a field of the *indexed document* — the schema
declares `last_modified = DATETIME(stored=True, sortable=True)` at line 35, and
`_add_note_to_index` writes the source file's mtime into it at line 219. There
is no ledger file, no sidecar, no manifest. The proxy the gate compares against
lives inside the record the gate protects, and the other half of the comparison
is a live `getmtime` on the file itself.

The comparison is `!=`. The tree does not explain why, and the reason is the
substrate: a checkout or a timestamp-preserving copy can install an *older*
file, which a `<` gate would read as "the index is ahead" and skip forever.

## Schema change is a constant

`INDEX_SCHEMA_VERSION = "5"` at line 28 is passed as Whoosh's `indexname` at
lines 177 and 191. `_load_index` (lines 173–192) looks for an index under that
name; not finding one, it clears the whole `.flatnotes` directory and creates a
fresh index, which the constructor then populates via the boot-time sync. The
tree has reached version 5 with no migration code of any kind, and none of the
five bumps required a backfill command or an operator instruction — the process
discovers the mismatch at startup.

This is safe here for the reason the technique requires: the index holds nothing
the walk cannot regenerate. `content` is not even stored (line 39 declares
`TEXT` without `stored=True`), so a content-match highlight re-reads the source
file from disk at line 343 rather than echoing an indexed copy.

## Contention degrades the answer, not the request

`_sync_index_with_retry` (lines 272–286) retries `LockError` eight times at
250 ms, then logs an error and **returns**. The search proceeds against the
index as it stands. Whoosh admits one writer, and every read here opens a
writer, so concurrent readers contend by design; the deployment's own answer to
that is upstream — `entrypoint.sh` launches a single uvicorn process with no
`--workers` flag, which keeps contention to the thread pool rather than across
processes.

## What this realization does not do

- **It does not bound the miss window below the filesystem's mtime
  granularity.** Two writes to one note inside the same stamp tick are one write
  to this gate. The container's `/data` is a bind mount or a volume, and the
  granularity is the host filesystem's.
- **It does not scale past a personal vault**, and nothing in the tree pretends
  otherwise. Every search runs `glob` over the notes directory (line 229) plus a
  `getmtime` per indexed record. That is linear in corpus size per query.
- **It does not defend the tag lane's own extraction.** `_extract_tags` (lines
  200–202) detects tags on content with code blocks removed but strips them from
  the *full* content, so a `#word` inside a fenced block is correctly not indexed
  as a tag and is also removed from the indexed content — searchable text
  disappears from a code block. That is a defect in the derivation, not in the
  reconcile, and this technique is silent about it: reconciling faithfully
  re-derives a wrong record just as promptly as a right one.
