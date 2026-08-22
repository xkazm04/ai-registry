# Shared-resource protocol — the verbatim brief block

One tree means shared mutable state; each piece gets exactly one owner. The block below goes
**verbatim into every builder brief** (Phase B step 3). Fill the `<...>` slots from the overlay's
`## Class B` and `## Class C` sections; when a section is empty, keep the heading and say "none in
this repo" — a builder told nothing will assume the set of whatever project it last saw.

```
SHARED-RESOURCE PROTOCOL (non-negotiable):
- YOUR WRITE SET (Class A) is yours alone; edit freely.
- APPEND-ONLY REGISTRIES (Class B): <overlay ## Class B - e.g. barrel index.ts
  exports, registry tables, CHANGELOG.md, the docs doc-map>. You MAY edit, but
  re-read the file immediately before each edit and anchor on a string unique to
  YOUR change. Never rewrite one whole.
- DIRECTOR-ONLY (Class C), do not touch: the git index, the context map,
  <overlay ## Class C - e.g. locale files and anything generated from them,
  bindings dirs, *.generated.*, anything under generated/>. REPORT what you need
  instead - new locale keys as a JSON fragment in your final report, new
  generated types by name - and the Director applies them once at quiescence.
- COMMITS, in ONE step: `git add <only your NEW files> && git commit --only
  <every path in this commit> -m '...'`. `--only` builds the commit from those
  paths alone and ignores whatever else is staged, so a sibling's in-flight
  staging can never ride along in your commit; the single step minimises the
  window in which your freshly-added file sits unprotected in the shared index.
  FORBIDDEN: git add -A | git add . | git add -u | bare git commit | git commit -a
  | git stash | git checkout <path> | git restore | git commit --amend.
  An index.lock collision is harmless - retry it, never work around it.
  `--only` takes WHOLE files: if a Class-B registry you edited carries a
  sibling's in-flight line, say so in the message rather than hiding it.
- COMMIT MESSAGES: bash **single**-quoted `-m '...'`, or a UNIQUELY-NAMED -F
  file. NEVER the PowerShell here-string form `-m @'...'@` - and this is not a
  "PowerShell-only" caveat: passing that syntax through the BASH tool is exactly
  how it bites, because bash has no here-string operator there and silently
  keeps the leading `@` as the first line, i.e. as your subject. DOUBLE quotes
  are not safe either: `-m "...`code`..."` runs command substitution and
  SILENTLY EATS the backticked word - a commit body naming a symbol in backticks
  loses it. Use single quotes for any message containing code, `$`, or backticks.
  You cannot fix either afterwards: `--amend` is forbidden in a shared tree, and
  a sibling can land a commit on top of yours within minutes. Verify the subject
  with `git log --format=%s -1` right after committing.
- BUILDS: a compile error, type error or failing test in a file OUTSIDE your
  write set is a sibling's half-written state, not your bug: re-run once, then
  REPORT THE FILE IT NAMES. Never fix it, never revert it. A shared build
  cache's lock wait is normal - waiting is correct, ending your turn is not.
- TEMP FILES: scratchpad only, and never inside a test tree. Name them with
  your lot id AND put them in the harness scratchpad directory - never at the
  repo root, and never under the test directory where the integration gate will
  execute them as part of the suite. Builders share one harness scratchpad, so
  a generically named temp file gets overwritten mid-wave.
```

## Why each line is there (incident ledger)

- **`--only` over the index.** Builders still commit their own work because never-lose-work beats
  commit hygiene and builder death is the norm. `--only` disregards foreign staging. Isolated-index
  commits (`GIT_INDEX_FILE` seeded by `git read-tree HEAD`, then `git add <paths>`, then commit) are
  an equivalent form some repo laws mandate; both take whole-file working-tree content, so neither
  protects against a sibling's unstaged edit inside *your* file — only the write-set discipline does.
- **One-step add+commit.** 2026-08-18: a foreign research session appended to a fleet-memory file and
  committed with a BARE `git commit` at the instant a builder had `git add`ed two NEW test files ahead
  of its own `git commit --only`. The sibling's commit swept both files in. Content correct at HEAD,
  attribution off, nothing lost. `--only` protects a builder's commit from the sibling's staging; it
  cannot defend the reverse direction. Hence the single command, and the ask that a repo's own law
  forbid bare commits in a shared checkout.
- **No `--amend`.** A sibling committed between a builder's commit and its amend; the amend
  re-messaged the sibling's commit (recovered byte-for-byte via `commit-tree` + `update-ref`).
- **The `@'...'@` subject.** Leaked a lone `@` as a commit subject twice in one session, and twice
  more within twenty minutes of writing the rule down with the wrong cause ("PowerShell here-string")
  — a rule that names the wrong cause teaches the wrong avoidance.
- **Double-quoted backticks.** A commit body naming a symbol in backticks lost the symbol
  mid-sentence; the 2.1 fix covered the `@` half and missed this one.
- **Temp-file LOCATION.** Told only to name temp files with a lot id, a builder put measurement
  harnesses in the test tree — where the integration gate executed them — and dumps at the repo root.
- **Report the FILE.** A tree-wide typecheck is not a verdict on one builder: the single type error on
  one tree belonged to the one builder still writing; the file name is what separates "this variant
  is broken" from "a sibling is mid-edit".
- **Class C is per-repo.** A repo with no locale codegen and no bindings has a thin list (the git
  index, the context map, generated artifacts). Importing another project's locale-conflict machinery
  into such a brief is noise; derive the list from the overlay and say when it is thin.
