# Subject revisions - ordering beside identity in the index

Every `subjects[<slug>]` entry in `knowledge/<domain>/index.json` carries three derived
fields about the subject's content, written by `scripts/build-index.mjs`:

```json
"digest": "sha256:a81b069ef7e72fbd",
"revision": 8,
"changedAt": "2026-09-03",
```

| Field | Type | What it answers | Derived by |
| --- | --- | --- | --- |
| `digest` | `sha256:` + 16 hex | *is this the subject my verdict was made against?* | `scripts/lib/bundle-hash.mjs` |
| `revision` | integer >= 1, or `null` | *how many landings has this subject had?* | `scripts/lib/subject-revision.mjs` |
| `changedAt` | `YYYY-MM-DD`, or `null` | *when did the newest one land?* | `scripts/lib/subject-revision.mjs` |

## Ordering vs identity

The governing technique is
[`catalog-as-sync-key`](../knowledge/software-engineering/engineering-process/standards-and-gates/knowledge-registry/techniques/catalog-as-sync-key.md):
**revision is ORDERING, digest is IDENTITY, and the digest stays the sync key.**

The digest tells a consumer whether the subject it judged is the subject that exists now.
It cannot tell how far apart the two are: two digests do not order, so a verdict that is
one typo-fix stale and one that is five rewrites stale look the same, and the consumer
has to re-read the whole subject to find out which. The revision is the number that
orders them. It never decides staleness. The two can disagree - a change landed and then
reverted moves the revision by two and the digest by nothing, and a dotfile edit inside
the folder is a commit git counts and bytes the digest deliberately skips - and when
they do, the digest wins: it is computed from the content, the revision from the
history, and a verdict is about content.

## The exact derivation

For each subject directory `<dir>` (the folder holding `<slug>.md`, resolved through
the taxonomy exactly as the index resolves `file`):

```
revision  = git rev-list --count HEAD -- <dir>      + 1 if <dir> is dirty vs HEAD
changedAt = git log -1 --format=%cs -- <dir>          today (UTC) if <dir> is dirty
```

"Dirty" means `git status --porcelain --untracked-files=all -- <dir>` prints anything:
a modified, added, deleted, renamed or untracked file inside the folder.

**The dirty +1** is what keeps `--check` idempotent on both sides of a landing. While an
edit to a subject is uncommitted, the index already carries the number the commit will
produce; when the edit and the regenerated index land together, `--check` is green
before the commit and green after it. Without the +1 the index would be current only
until the commit, and stale the moment it was made. The date is the one field that can
still shift - when the commit lands on a later UTC day than the index was written - and
that is a regenerate, not a defect.

**No `--follow`.** A subject relocated by a taxonomy migration starts counting again at
its new path (the move commit is its revision 1). Ordering within a path is what a
consumer needs; a count that spanned renames would need rename detection whose result
depends on the diff heuristics of the machine that ran it.

### How it is computed without 836 spawns

Two spawns per subject is 836 for the corpus, measured at 72 s on Windows. Instead the
derivation reads the whole commit graph twice - `git log --format=%H%x00%cs%x00%ct%x00%P`
for parents and dates, `git log -m --no-renames --name-only` for the paths each commit
changed against each of its parents - and replays git's default history simplification
per subject in memory (revision.c `try_to_simplify_commit`): a commit counts when the
subject's folder differs from every parent; a merge whose folder equals some parent's is
not counted, and only the first such parent is followed, so the other side of that merge
is never walked. `git log -m` suppresses a parent whose diff is empty, header included,
so a merge with fewer path lists than parents cannot say which parent each list belongs
to; those are resolved in one batched `git diff-tree --stdin` against the first parents.
Five spawns in all, about one second, and the result was checked against per-directory
`rev-list --count` and `log -1` over all 418 subjects (2026-09-06): identical. A single
pathspec-limited walk was tried first and was off by one or two on 29 subjects at
merges - an off-by-one is indistinguishable from a real landing to a consumer computing
`revisionsBehind`, which is why the replay exists.

### The shallow / no-git fallback

A shallow checkout (`git rev-parse --is-shallow-repository` prints `true` - CI's
`actions/checkout` at its default depth is one) or a missing git cannot count. Then:

- the previous `index.json` is read **before** it is overwritten, and each subject's
  `revision` / `changedAt` are **carried forward unchanged**;
- one warning on stderr names the fallback and how many subjects it carried;
- a subject with no previous value gets `revision: null, changedAt: null`.

A count from a truncated history is **never** emitted: `1` from a depth-1 clone is a
confident wrong answer, and a consumer computing `revisionsBehind` would trust it. This
is also why CI's `build-index.mjs --check` stays green on a shallow runner - the checked
values are the committed ones, carried forward.

To exercise the fallback on a full clone, set `AI_REGISTRY_REVISIONS=carry-forward`:

```sh
AI_REGISTRY_REVISIONS=carry-forward node scripts/build-index.mjs --check
# subject-revision WARNING: AI_REGISTRY_REVISIONS=carry-forward is set; revision/changedAt
# CARRIED FORWARD from the previous index for 418/418 subject(s), null for the rest. ...
```

## How a consumer computes `revisionsBehind`

A verdict stores the subject's digest as `evaluatedAgainst` (identity) and its revision
as `evaluatedRevision` (ordering) at the moment it is written - `/conform` copies both
from the pair it judged. Then, against the current index:

```
stale           = subject.digest !== pair.evaluatedAgainst        // the digest decides
revisionsBehind = stale && subject.revision !== null && pair.evaluatedRevision != null
                    ? subject.revision - pair.evaluatedRevision
                    : null                                          // unknown distance
```

- `stale` comes from the digest alone. The revision never promotes or demotes it.
- `null` means *unknown distance*, not zero: the registry could not count (a shallow
  clone with no earlier value), or the verdict predates the field.
- The number is a re-read budget, not a severity: one behind is a touch-up, five behind
  is a rewrite, and `/conform --stale` can order its queue by it.

A verdict written with a `null` `evaluatedRevision` on a subject that later gains one is
simply "unknown distance" until it is re-judged; there is nothing to backfill.

## Churn

A registry map carries its verdicts forward by the context's key - the human string
`c.id ?? "<group>/<name>"` - so when the context map moves, the join has to say what each
previous context became. Before 2026-09-06 a context absent from the new `context-map.json`
dropped every verdict on it, silently: no stat, no `--check` signal, and a context-map
rebuild could erase weeks of `/conform` work while the map looked fine. Now every
regeneration classifies each previous context as one of four things, and records the
result in the map (`scripts/lib/map-churn.mjs`; the wire keys are additive and the schema
stays `rkb-registry-map/1`, so a reader that predates them ignores them).

| Previous context is... | What happens to its judged pairs | Where you see it |
| --- | --- | --- |
| **matched** - its key is in the current map | carried, as always | `stats.carriedVerdicts`, `stats.restoredPairs` |
| **renamed** - absent, but one *new* context holds >= 60% of its recorded paths | carried onto the new key; each inherited pair gets `source: "renamed"` and `renamedFrom: "<old key>"` | the row carries `renamedFrom` and `renameOverlap` (or `renameBy: "id"`); `stats.renamedContexts` |
| **orphaned** - absent and nothing adopts it | parked under the top-level `orphans[]` | `stats.orphanedVerdicts` (pairs, not contexts) |
| (the inverse) **arrived** - a current context the previous map did not have and no rename produced | nothing to carry; the row and every pair get `arrived: true` | `stats.arrivedContexts` |

"Judged pairs" means what the carry rule has always meant: `state` other than `unknown`,
or `source: "conform"` (a pairing somebody established by reading code). A pair rewritten
to `source: "renamed"` stays in that set on the next regeneration - otherwise an inherited
`conform` pairing would be dropped for having lost the word that protected it.

### Orphans

```json
"orphans": [
  { "context": "Platform/X Gate", "name": "X Gate", "group": "Platform",
    "paths": ["src/gate/gate.ts", "src/gate/checks.ts"],
    "subjects": [ { "subject": "quality-gates", "bundle": "software-engineering", "...": "the pair, verbatim",
                    "state": "conformant", "evaluatedAt": "2026-09-01", "evaluatedAgainst": "sha256:...",
                    "evaluatedRevision": 3, "revision": 7, "changedAt": "2026-09-04", "revisionsBehind": 4 } ] }
]
```

An orphan **persists across regenerations**: it stays under `orphans[]` until its key
returns to the context map (its pairs re-attach as ordinary carried verdicts), a later
rename adopts it (previous orphans are in the rename pool too), or the operator deletes the
entry by hand. The generator never deletes one. Orphaned pairs keep their `revision` /
`changedAt` mirror so a debt table can price them, but they are not counted in
`stats.staleVerdicts` - they have no context to be stale *in*.

### The rename heuristic, and its two honest limits

For each vanished context, the candidates are the contexts that are new in this build. The
score is `|oldPaths ∩ newPaths| / |oldPaths|` - the share of the *old* context's recorded
paths the candidate still holds - and a candidate is adopted at `RENAME_OVERLAP = 0.6` or
above. Ties go to the highest ratio, then lexically (old key, then new key), so the plan is
the same on every machine; one old context adopts at most one new one and vice versa
(greedy in that order). The row records the ratio as `renameOverlap`.

Two things the heuristic cannot do, on purpose:

- **Paths are compared as the map records them.** A row's `paths` is capped at 12 entries
  (`build-registry-map.mjs`, the `paths: c.paths.slice(0, 12)` on every row), on both
  sides - the old side is the previous map's row, the new side is the current one. A
  context with 40 files is matched on the first 12 the context map listed, and a listed
  path that no longer exists was already filtered out of both. This is the documented
  trade: the map stays small and the heuristic is exactly as good as the sample.
- **Renamed *and relocated* scores 0 and becomes an orphan.** If the files moved with the
  name, nothing here can tell "renamed" from "deleted and replaced", and attaching
  verdicts to code they were not written about is the worse error. The orphan is the honest
  answer; adopt it by hand (move the pairs onto the new row, keep `evaluatedAt` /
  `evaluatedAgainst` / `evaluatedRevision`) or let `/conform` re-judge the arrival.

The threshold is high for the same reason: 0.6 means "clearly the same files", and a
borderline case is better parked than guessed.

### The id fast path

When the context-map export puts an `id` on **every** context, the key *is* the identity:
a rename keeps its id, so it matches as an ordinary pair and no heuristic runs; a key that
vanished is a deletion, exactly, and its verdicts are orphaned without a path search. The
map says which kind of key it carries in the top-level `contextKey` (`"id"` or
`"group/name"`), and the fast path is taken only when **both** the previous map and the
current export are keyed by id - the migration build from names to ids is a keyed-by-name
previous map against an idd current one, and that build still runs the path heuristic so
nothing is orphaned for having gained an identity. A map written before `contextKey`
existed is read as `group/name`.

### First build

A build with no previous map marks nothing `arrived` and orphans nothing: there is no
"previous" for anything to be absent from. The map is born whole.

### Revision mirror on every pair

Beside `digest`, each pair now carries the subject's `revision` (a monotonic commit count)
and `changedAt` (`YYYY-MM-DD`) copied from the bundle index - omitted, not nulled, when
the index has neither (an index built before they existed, or on a shallow clone). A pair
`/conform` judged with `evaluatedRevision` alongside `evaluatedAgainst` also carries
`revisionsBehind = revision - evaluatedRevision`; when either side is missing the key is
omitted, never `0` (a zero would read as current). `stale` is unchanged: it is still the
digest comparison. The digest says *whether* a verdict is behind; the revision says *how
far*.

### Reading `--churn`

```
node scripts/build-registry-map.mjs --project <slug> --churn [--out <file>]
```

prints only the churn the **last build recorded** and exits - no matching, no write. It
reads the map (`--out` names which file; otherwise `<project>/.ai/registry-map.json`), so
`/straighten` and `/project-populate` run it right after a rebuild:

```
churn - fixture (map generated 2026-09-06T11:37:25Z, 3 contexts, 7 pairs)
  orphanedVerdicts=1  renamedContexts=1  arrivedContexts=1  staleVerdicts=1

  orphans (1): contexts gone from context-map.json whose verdicts were kept
    Platform/X Gate  1 pair(s), 1 judged  [src/gate/gate.ts, src/gate/gate.test.ts, src/gate/checks.ts, ...]

  renamed (1): contexts adopted by path overlap >= 0.6 (or by id)
    Platform/Y Limits  ->  Platform/Y Throttling  (overlap 0.8, 1 pair(s) inherited)

  arrived (1): contexts the previous map did not have - unjudged, not stale
    Platform/W Hooks  4 pair(s): webhook-ingestion, agent-runtime-assembly, signed-artifacts, terminal-multiplexing
```

Renames and arrivals are **one-generation** marks (the row-level `renamedFrom` /
`renameOverlap` / `arrived`): the next build finds the context in its previous map and
reports zero of each. Orphans are not - they are listed until adopted. The pair-level
`source: "renamed"` / `renamedFrom` is provenance and carries forward with the verdict.

`--check` prints the same three numbers beside the stale summary (a churn line per project
that has any), and its impact table gained a `contexts` column: how many contexts in the
project subscribe to each stale subject, counted after restored pairs are attached - the
size of the re-judging a landing bought, not only the part already overdue.

### Flags that keep the project tree untouched

- `--out <file>` writes there instead of `<project>/.ai/registry-map.json`. The previous
  map is read from that file when it exists (repeated `--out` runs converge on it) and from
  the project's committed map otherwise, so a first `--out` run still inherits every
  verdict. Needs one project (`--project` or `--path`).
- `--dry-run` computes and reports; nothing is written.
- `--path <dir> [--project <slug>]` names one checkout directly and bypasses the fleet
  (`projects.json` + `.machine.local.json`): a fixture, a worktree, a box with no machine
  identity. Domains still come from that checkout's `.ai/manifest.yaml`.
