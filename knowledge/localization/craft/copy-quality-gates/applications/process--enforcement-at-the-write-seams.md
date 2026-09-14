---
layer: application
type: application
subject: copy-quality-gates
technique: enforcement-at-the-write-seams
stack: process
status: forged
verified_on: 2026-09-14
---

# Always-on rules that reached no session, and a check that called them healthy

The registry's own delivery path, read on 2026-09-14: `ai-registry` on `main` at
`0f606894` (2026-09-11) for the design as it stood, and at `84f4b6aa` (committed the
same day) for the fix. The probe facts were witnessed by the Director on the coding
agent harness at version 2.1.270, before and after the fix.

This is not a copy defect. It is the technique's second half — delivery of advice
is verified by load telemetry — found in the pipeline that delivers this bundle's
own rules to every fleet project, which makes it the cleanest available case.

## The design, and the premise it rested on

The registry generates one always-on rule card per knowledge bundle and installs
the declared ones into each project's `.claude/rules/`. At `0f606894` the
generator's header stated the premise (`scripts/build-knowledge-rules.mjs:14-19`):
a rule with no `paths:` frontmatter "is loaded into EVERY session", "and the rules
directory supports symlinks so one file can serve every project". The installer
repeated it (`git show 0f606894:scripts/link-registry.mjs`, line 197): "the
harness resolves symlinks in .claude/rules/".

## The check verified the link's shape

In the installer at `0f606894` the rules loop classified an entry by resolving it:

- `:211-213` — `realpathSync(entry)`; a link resolving to the generated source is
  `'ok'`, one resolving elsewhere is `'wrong-target'`, a plain file is `'file'`.
- `:216` — a real file was refused: "is a real file, not a link - not
  overwriting".
- `:217` — under `--check`, anything else was reported as "should be a link to the
  registry".
- `:219` — installation was `symlinkSync(src, entry, 'file')`, with a copy only as
  the fallback when a link could not be made.

`README.md` documented the check as `link-registry.mjs --check  # verify; nothing
to sync, so nothing drifts`. So `--check` was green on every symlinked project,
and the one state that actually loads — a real file — was the state it refused as
a problem. The instrument asserted exactly what was built, and could not see
whether anything was delivered.

## The probe

A headless session with a load-telemetry hook (the harness's `InstructionsLoaded`
event, configured through `--settings` to append each payload to a log):

| setup | loaded |
|---|---|
| throwaway repo, real file in `.claude/rules/` | yes |
| same repo, `mklink` symlink to a file outside the project | **no** |
| same repo, `mklink /H` hard link to that same outside file | yes |
| `kp`, carrying four registry rule symlinks | only `CLAUDE.md`, `.claude/CLAUDE.md` and the `AGENTS.md` include — no `ai-registry-*.md` |
| `kp` after the fix, carrying four rule copies | all four `ai-registry-*.md` plus the three instruction files; the session quoted the localization card's count line verbatim |

The `kp` session before the fix, asked, answered that the rules were not loaded,
and in the same session still saw the symlinked `i18n-translate` skill: skill
directories behind a symlink load, rule files behind one do not. In
`~/.claude.json` every fleet project carried `hasClaudeMdExternalIncludesApproved:
false` and the matching warning-shown flag `false` — the harness treats an
out-of-project rule symlink as an external import awaiting an approval that a
symlink alone never prompts for. When this changed is unknown; an earlier public
report had symlinked rules loading.

The harness documentation additionally says path-scoped rules fire when a
matching file is read. That half was not probed here; it is why the technique
does not count path-scoped instructions as a seam.

## The fix (`84f4b6aa`)

`scripts/link-registry.mjs`:

- `:196-206` records the witnessed behaviour and the decision: "Rules are
  therefore installed as COPIES of the generated files", with the `ai-registry-`
  prefix as the managed namespace the registry overwrites.
- `:211` compares content with line endings normalized, so a checkout's CRLF
  conversion is not drift.
- `:220` classifies an entry as `'symlink'`, `'ok'` (a copy identical to the
  generated rule) or `'stale'`.
- `:224` — `--check` now names the defect: "a symlink, which the harness does not
  load - install a copy", or "a copy that drifted from the generated rule".
- `:228` writes the copy.

The same commit corrected the residue that stated the old premise as current: the
installer's own header (`:3-6`), the generator's header, and the README's script
table, rules row, "present, not fetched" paragraph and `--check` line. One piece
of wording was kept on purpose: the `.gitignore` managed-block comment the
installer writes into every project (`:141`, "Links are machine state"). Rewording
it would have rewritten a tracked `.gitignore` in eleven projects for a comment.

Re-running the installer replaced 35 rule entries across eleven projects with
copies; `--check` then reported every rule `ok`.

The check moved from link shape to content drift. It is still not telemetry: it
proves a current copy is present, and the probe is what establishes that a
present copy loads. A future harness change to rule loading would pass this check
unseen.

## What the registry still owes

- **The check sits at no seam.** `link-registry` is referenced from the README,
  `docs/`, `registry.yaml`, `.gitignore`, explorer config and two scripts'
  comments — no hook, no CI job. A rule rebuilt by `build-knowledge-rules.mjs`
  reaches projects only when an operator re-runs the installer, and a copy now
  goes stale silently where a link used to follow its target. The technique's
  rule applies: a check that sees one path is feedback.
- **The probe is not repeatable.** It was run by hand. A small script that
  installs a known rule beside the delivery under test, starts a headless session
  with the telemetry hook, and fails when the rule is absent from the log would
  turn "verify delivery by telemetry" from a lesson into a gate — and would be
  the instrument to run after every harness upgrade.
- **The installer rewrites a `.gitignore` whose only difference is line endings.**
  Its managed-block comparison is byte-exact, so a CRLF checkout reads as changed
  on every run (observed in two projects on 2026-09-14; both restored).
