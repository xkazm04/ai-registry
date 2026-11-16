---
layer: application
type: application
subject: multi-project
technique: project-identity-and-joins
stack: rust
status: forged
verified_on: 2026-11-16
verified_against: rust@1.96
applied: simulation
ab_verdict: better
---

# Project identity and joins — one repository, two registries

*Verified against the project tree at `bf2a1e249`.*

The strongest evidence for this technique in a real tree was not a design
document. It was a codebase that contains **both** answers at once: one
project registry that learned the lesson and carries the cure in its module
docs, and a second registry, serving a different subsystem, that never did —
with a path string as the only bridge between their id namespaces.

## The seam

The tracking engine resolves which project a pushed signal belongs to at
`src-tauri/src/engine/project_tracking/push.rs:190`:

```sql
SELECT id FROM companion_known_project
 WHERE path = ?1 OR LOWER(path) = LOWER(?1)
```

Everything the subsystem keeps hangs off the id that query returns. The
schema at `src-tauri/db/src/lib.rs:1334-1391` shows how much: the watch
subscription, `engine_cli_event` and `engine_project_pulse` all carry
`project_id` with a foreign key to `companion_known_project(id)` and
`ON DELETE CASCADE`. And that registry's admission door is `path TEXT NOT
NULL UNIQUE` (`:1295`), upserted on path at
`src-tauri/src/companion/projects.rs:123-135`. The portfolio the user
actually manages lives in a different table, in a different database, with
its own minted ids. Nothing joins the two namespaces except a canonicalized
string.

**Policy A** is that arrangement. **Policy B** is one identity minted at one
admission door, with the filesystem path demoted to a re-bindable field —
precisely what the other registry already implements.

## Three real cases

**1. The move, already recorded.** Commit `3fbacba70` exists because this
failure happened. Its module doc at `src-tauri/db/src/project_identity.rs:
3-8` states the incident in the past tense: `dev_projects.root_path` "was
the only identity a project had: move or rename the folder and every
context, KPI, idea, task and milestone hanging off the row silently
detached, and registering the new path minted a second, empty project." The
cure is a minted marker in `.personas/project.json` and an explicit
`IdentityResolution::Relocated` that re-points the binding (`:50-59`).
Walking the same move under policy A on the tracking side: the upsert at
`projects.rs:126` finds no row for the new path, mints a new id, and
`INSERT OR IGNORE` creates a fresh subscription with `enabled = 0` — while
the old row keeps its pulse history and its *enabled* subscription pointed
at a folder that is gone. Prediction: the project's pulse history detaches
and the new registration tracks nothing, in silence. **Falsifier:** any code
that repairs `companion_known_project.path` on a move. Grep for writes to
that table finds an insert, a `last_scan_at` update, and nothing else.

**2. The drift, already fixed — at one consumer.** Commit `a51da6532`
re-pointed the assistant's dev-tools prompt block from
`companion_known_project` to the real `dev_projects` rows. The reason is
written at `src-tauri/src/companion/prompt/capabilities.rs:16-20`: the
path-keyed registry "had drifted to worktree/duplicate registrations
unrelated to the Dev Tools projects the user actually manages — so she'd
'analyze' a registry that bore no relation to reality." This is the
technique's admission-door failure, observed in production and named:
one real project, several paths, several minted rows. Under policy B the
drift cannot form, because a second path for the same project re-binds
rather than mints. Under policy A the fix was per-surface — the *tracking*
subsystem still reads the drifted registry. **Falsifier:** a de-duplication
pass over `companion_known_project`. None exists.

**3. The second machine, admitted by an unrelated contract.** The data
portability limits declare `companion_known_project` non-portable at
`src-tauri/src/commands/core/data_portability/limits.rs:106-109`, in a list
whose category is "MACHINE-LOCAL", with the reason "holds absolute paths".
That exclusion was written to keep an export bundle honest; nobody wrote it
to say anything about identity. But it is a complete statement of the
technique's second test: the registry cannot survive a re-path, so it cannot
be carried to a second machine, so the pulse history keyed to it cannot
either. The portable side (`dev_projects`) travels; the tracking side does
not, and the bridge that would reconstruct the link is a path that is
different on the target by definition. **Falsifier:** a mapping table from
`companion_known_project.id` to `dev_projects.id`. There is none — the join
is the path.

## Verdict

Better, and the tree argues it more forcefully than the reasoning does. The
technique predicts three failures — rename, re-path, re-clone — and this
repository has already lived one of them (case 1), already paid to patch a
consumer of another (case 2), and has independently classified the registry
as unable to survive the third (case 3). The only thing separating the cured
registry from the uncured one is that somebody did the minting work on the
side the user could see.

## What this cannot do or prove

- **Nothing was measured.** This is reasoning over recorded history and
  schema, labelled as such. No project was moved, no clone was taken, no
  before/after counted. A code A/B would mean minting a second identity
  scheme across three cascading tables — larger than the finding that
  prompted it.
- **It cannot say how many rows are already wrong.** Case 2 proves duplicate
  registrations existed at some point; how many `companion_known_project`
  rows in a live install are worktree twins is unknown, and the instrument
  that would answer it — a reconciliation report joining the two registries
  by path and reporting the unmatched on both sides — does not exist. That
  report is also the cheapest next step: it is a read-only query and it
  turns this whole application into a measurement.
- **It does not establish that unification is the right cure.** Two
  registries with an explicit, stored mapping at the ingestion boundary
  would also satisfy the technique's quarantine clause. The simulation
  compares "join on a path" against "join on a minted key"; it does not rank
  the two ways of getting a minted key.
- **Case 3's evidence is circumstantial by construction.** A portability
  exclusion is an author's judgment about what should travel, not a proof
  that the identity is unstable. It is strong because nobody wrote it for
  this argument — and weak for exactly the same reason.

## Re-read 2026-11-16 at `8d076db46a` (local checkout, read-only)

The citations were re-checked against `8d076db46a` (master, 2026-11-08). The
verdict holds, and nothing was run.

### Anchors re-pinned

- the tracking seam is now `push.rs:208-209`;
- the schema is now `db/src/lib.rs:1517-1613`;
- the portability exclusion is now `limits.rs:106-108,122`;
- `project_identity.rs:3-8` and `capabilities.rs:16-20` are unchanged.

The three falsifiers still fail:
- the only writes to `companion_known_project` are the insert-or-update on
  path and the scan stamp (`companion/projects.rs:124-160`);
- there is no de-duplication pass;
- there is no id-to-id mapping table.

### Corrections

- **Textual twins are now folded at admission.** Registration canonicalizes
  the path before the upsert (`companion/projects.rs:110-116`, `3e1bab5947`,
  2026-07-17, which predates the 08-29 read and was missed then). Case,
  trailing-slash and `\?\` duplicates therefore collapse into one row.
  Worktree twins do not, because each worktree is a real, distinct
  directory.
- **The two-namespace bridge has spread to a third consumer.** The stand-up
  report searches both registries because "the two registries mint
  different ids; a plan item may name either" (`companion/standup/report.rs:320-327`).
  That is a consumer adapting to the split instead of a mapping that ends it.

### New: the cured registry's marker is committed, so it travels with copies

The cure from case 1 is the `.personas/project.json` marker. Its resolver
(`project_identity.rs:114-147`) re-binds when the claimed folder is gone. It
**refuses** when that folder still exists ("Two folders cannot share one
project"), and the refusal suggests deleting the marker. It **mints fresh
and overwrites the marker** when the key is unknown to this database
(`:122-126`).

The marker is committed in three fleet repos:
- this one (`.gitignore:21-22`: "the .personas/ dir IS committed"; the
  marker landed in `6031d4080d`, a sweep of in-flight parallel-session work);
- the registry (`39ffea94a`);
- mage-arena (`b9f200c`).

So every clone and worktree carries one database's key. The registry has a
live worktree on this machine (`ai-registry-drain-wt`), which carries the
same key as its main checkout. Registering that worktree is a refusal by
construction, and the escape the refusal suggests edits a tracked file.

gravitone took the other branch. It ignores only the marker, explicitly as
"the machine marker" (`.gitignore:172-175`, `5b8c1aa1`, 2026-09-08).

This is the trap the technique now names ("A marker in the working copy is a
link, not the identity", 2026-11-16). Deploy tools ship the same rule: the
Vercel CLI's own `.vercel` README says its project-link file should not be
shared and is added to `.gitignore` when created (`now@21.0.1`,
`VERCEL_DIR_README.txt`, read 2026-11-16).

Not measured: whether any machine has already overwritten a committed marker.
The one marker commit in this repo has a single id.
