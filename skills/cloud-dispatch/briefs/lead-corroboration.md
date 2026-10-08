---
cloud_ok: true
label: lead corroboration <bundle> (<n> leads)
from: librarian
---

# Lead corroboration: <bundle>

You are a cloud session working in a fresh clone of **ai-registry**, a public registry of
knowledge bundles. Nobody can answer questions while you run: where you would ask, write the
question into RESULT.md and continue with the leads that do not depend on it.

**Read `AGENTS.md` at the repo root first.** It binds everything below.

## Your dispatch

One bundle, and only these leads from `librarian/inbox.md`. A lead key is `L<line>`, the
line number in `librarian/inbox.md` at the commit you cloned (the file is append-only, so the
numbers are stable):

- Bundle: `<bundle>`
- Leads: <L123, L128, ...>
- Base commit the keys were read at: <sha>

Before anything else, open each key's line and confirm it is an unstruck row in `<bundle>`.
A key that is struck through, or names another bundle, is a dispatch error: list it in
RESULT.md and do not rule on it.

## The rules that govern you - read them, do not reconstruct them

- **`librarian/inbox.md`, its header.** A lead originates a finding; it never authorizes one.
  Triage is `/intake`-class work: check prior art against the named subject, corroborate
  against a second source, land only what survives - as a technique, an application, or a
  decline with a reason. Strike a ruled line through and record the ruling in the subject
  note; never delete a line.
- **`.claude/skills/intake/SKILL.md`, section "Corroboration - what a source may authorize
  alone".** The table there says what each target needs: a golden path or technique needs a
  primary source fetched in this run, training-data convergence, or real code read in a
  tree; a law needs convergence across runs; an application needs a tree you opened. The same
  file's Phase 5 veto **V2** applies that table, and its "Which rule governs which shape"
  paragraph routes leads and currency rows. Mind its 3-fetch budget for the run.
- **`librarian/runs/2026-09-20-1.md`, section "Corroboration caught what transcription would
  have published".** The drain this brief descends from: unresolvable commit hashes, a
  "byte-identical" claim that was value-identical, a cited file that was an instance of the
  defect, counts that did not reproduce, and a `kind:` column that proved unreliable. Treat
  every lead's numbers, hashes and file citations as unverified until you reproduce them.

## Method

For each lead, in key order:

1. Read the subject it names - resolve the file through the bundle's `index.json`, never
   build the path from the slug - and the subject's techniques and golden path. A lead the
   corpus already states is **COVERED**, which is a ruling, not a failure.
2. Corroborate or refute it under the table above. Prefer primary sources (vendor docs,
   standards, papers, specs). Quote the passage you rely on verbatim; a paraphrase is not
   evidence.
3. **Project trees are not in this clone.** Most leads cite a file in a connected project.
   If confirming a lead needs that tree and the lead names no public GitHub URL and commit
   you can fetch, the verdict is `undecidable (tree)` and it goes to the Handoff. Never write
   an application against a tree you did not open, and never set `verified_against`.
4. Land only what the governing rules allow: an amendment or technique with its primary
   source cited, a COVERED or DECLINE ruling in the subject note. At most one new technique
   per subject, and only where two independent lanes converge.
5. Strike each ruled lead's line in `librarian/inbox.md` and append the ruling, in the form
   the struck rows above it use. Touch no other line of that file.

## Output

`RESULT.md` carries a verdict table, one row per lead key:

| lead | subject | verdict | evidence (URL) | verbatim quote | proposed landing |
| --- | --- | --- | --- | --- | --- |

`verdict` is one of `corroborated`, `refuted`, `covered`, `undecidable` (with the reason in
the row). `proposed landing` names the file you changed, or the change the Director should
make, or `none`.

Also in RESULT.md:

- `## Handoff` - every `undecidable (tree)` lead with the project and file it needs opened,
  and every landed technique that owes an `applied.md` row (the Director runs that step).
- `## Owed to their owners` - defects you found in a project while corroborating, which are
  not registry changes (the 2026-09-20 run note has the shape).
- The gate tails below.

## Rules that bite here

- **Never run any registry script with `--help`.** Most have no argument handling and
  execute. Read a script's `argv` handling in its source instead.
- **Never hand-edit generated content.** After your source edits, regenerate:
  `node scripts/build-index.mjs`, `node scripts/build-knowledge-rules.mjs`,
  `node scripts/build-catalog.mjs`.
- **Run `node scripts/gate.mjs --lane knowledge`** and put the output tail in RESULT.md. On
  origin/main as of 2026-10-06 it stops at `check-public-paths.mjs` on violations inherited
  under `knowledge/game-production/`. If it stops at a step whose violations name no file you
  touched, say so with the count, then run the remaining steps one by one and report each:
  `node scripts/build-index.mjs --check`, `node scripts/build-knowledge-rules.mjs --check`,
  `node scripts/review-coverage.mjs`, `node scripts/check-hash-stability.mjs`,
  `node scripts/build-catalog.mjs --check`.
- If `check-bundles.mjs` flags a "repo path" inside a cited URL (its per-domain purity
  profile reads segments like `docs/`, `src/` or `lib/` in a technique's link as a path into a
  repo), cite the paper or the page title instead.
- Do not append to `librarian/applied.md`, `librarian/sources/index.md` or any other shared
  ledger; write the rows you would have appended under `## Ledger rows` in RESULT.md.
- No machine paths anywhere you write; this repository is public. A lead that carries one
  is quoted in RESULT.md with the path replaced by `<path>`.
