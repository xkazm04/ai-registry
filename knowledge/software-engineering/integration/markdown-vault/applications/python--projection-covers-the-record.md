---
layer: application
type: application
subject: markdown-vault
technique: projection-covers-the-record
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.13
---

# Projection fidelity in flatnotes (Python / Whoosh)

*Verified against `dullage/flatnotes` at `7f5b773c9cb37cc84978079ed4790e7de38d3970`
(2026-08-29), app version 5.5.5. The Python version is witnessed three times and
concordantly — `.python-version` reads `3.13`, `pyproject.toml` pins
`requires-python = ">=3.13,<3.14"`, and the runtime stage of the Dockerfile is
`python:3.13-slim-trixie` — so `verified_against` is the tree's own statement,
not a dispatch's guess. The index is Whoosh 2.7.4, pinned exactly.*

flatnotes is a note-taking web app over a flat folder of markdown files: the
folder is the database, and a Whoosh index beside it in `.flatnotes/` is the
mirror. It is a good instance for this technique because it gets the *freshness*
half unusually right and the *fidelity* half wrong, which is the pairing the
technique claims is independent — and here they are independent in one file.

## The freshness half, which is not the finding

`server/notes/file_system/file_system.py:118` calls `_sync_index_with_retry()`
at the top of every `search()`. There is no filesystem watcher and no
write-through path from the app's own mutations; instead each query reconciles
the index against the directory first. `_sync_index()` (`:234-270`) walks the
index's stored fields, deletes entries whose file is gone, re-indexes entries
whose mtime differs, and adds files the index has never seen.

The mtime comparison at `:250-253` is `!=`, not `>`. That is the correct
predicate for this subject's physics and it is worth recording as a positive:
the peer writers here include a sync client and a version-control checkout, both
of which set mtimes *backwards* on restore, and a `>` comparison would silently
never re-index a note restored from backup. The tree chose the predicate that
catches motion in both directions.

So the mirror is about as fresh as a mirror gets. Staleness is bounded by one
query, not by a watcher's reliability.

## The fidelity half, measured

`_extract_tags` (`:194-207`) projects a note's body into two of the index's
fields, and does it in two passes with **two different predicates**:

```python
content_ex_codeblock = re.sub(cls.CODEBLOCK_RE, "", content)
_, tags = cls._re_extract(cls.TAGS_RE, content_ex_codeblock)   # :201
content_ex_tags, _ = cls._re_extract(cls.TAGS_RE, content)     # :202
```

Line 201 extracts tags from the content **with code blocks removed** — a
deliberate and correct exclusion, because `#include` in a code sample is not a
tag. Line 202 strips the tag pattern from the **full** content, code blocks
included. The exclusion that line 201 earned is not applied on line 202.

The consequence is the technique's central defect in its exact shape. Executing
the two functions verbatim against four inputs, with a known positive and a
known negative asserted first so the harness itself is not the thing being
trusted:

| input | `tags` | indexed `content` |
| --- | --- | --- |
| `hello #alpha world` (known positive) | `['alpha']` | `hello # world` |
| `hello alpha world` (known negative) | `[]` | `hello alpha world` |
| ``see `git commit #beta here` end`` | `[]` | ``see `git commit # here` end`` |
| `` ```\n#gamma = 1\n``` `` | `[]` | `` ```\n# = 1\n``` `` |

Rows 3 and 4 are the hole. `beta` and `gamma` are not tags — correctly — and
they are also not in the indexed content, because line 202 removed them. They
are in the file on disk, visible on the user's screen, and in **no field of the
mirror**. A search for `beta` returns nothing.

Two properties make this the technique's argument rather than just a bug:

- **Rebuild frequency cannot help.** This index is reconciled on every single
  query. It is never stale. Re-running the sync reproduces the hole exactly,
  because the loss happens inside the projection, not between projections.
- **Field-level tests would pass.** *Is a `#tag` in a code block excluded from
  the tag set?* Yes. *Is tag syntax removed from the indexed body?* Yes. Both
  passes are individually correct and jointly lossy, which is why the technique
  asks for a coverage assertion over the union of fields rather than a
  correctness test per field. This tree has no tests at all (0 test files across
  3,672 lines of `server/` and `client/`), so the point is structural rather
  than a claim about which suite missed it.

## What the tree proves about the storage question

`IndexSchema.content` (`:39`) is `TEXT(analyzer=...)` with no `stored=True`. The
mirror holds terms, not text. `_search_result_from_hit` (`:343`) therefore
re-reads the source file from disk to build content highlights, and re-runs
`_extract_tags` on it to keep the highlighted text consistent with what was
indexed.

That is the strong position on the technique's other axis — the index cannot
contradict the vault, because it holds no content to contradict it with — and
the tree pays both of the stated costs. The per-result file read is one cost.
The second is the one the technique calls non-obvious and this tree
demonstrates: because the index stores no content, there is nothing to dump.
An operator debugging "why can't I find this note" cannot read the indexed
document back and see the missing token; the only way to observe the projection
is to re-execute it, which is what this application had to do. The choice is
defensible and undeclared, and the undeclared half is what makes the defect
cost an afternoon instead of a minute.

## What this instance cannot show

The hole's user-visible severity depends on how often notes contain
`#`-prefixed tokens inside code spans, which is a property of a corpus, not of
this tree — a vault of prose notes may never hit it, a vault of engineering
notes hits it constantly. Nothing in the repository measures its own corpus, so
this application reports the mechanism and the four executed cases, and makes no
claim about frequency.
