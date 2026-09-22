---
layer: application
type: application
subject: test-harness
technique: assert-through-the-reader
stack: node
status: forged
verified_on: 2026-09-20
verified_against: node@24
---

# Two emitted artifacts in one tree: one pinned through its reader, one still pinned by substring

*Verified against the `ascent` tree at `62c252dd` (2026-09-20). The toolchain
witness is the manifest's `engines.node` (`24.x`) and the checkout's `.nvmrc`
(`24`).*

Ascent's local lane emits two artifacts whose only consumers are foreign
programs: a telemetry setup block a user pastes into a shell, and an ignore rule
appended to Git's own local metadata. They took opposite paths, three hours
apart on 2026-09-10, and together they are the whole technique.

## The one that was done: ask Git, then make Git answer

`src/lib/local/lane-cost.ts` keeps the lane's own report out of the branch the
operator reviews, by appending `.ascent/lane-report.json` to the checkout's
`info/exclude`. The original built that path itself — `git rev-parse
--absolute-git-dir`, then join `info/exclude` onto it. In a **linked worktree**
that directory is the worktree's private Git directory, and Git does not read an
`info/exclude` there; it reads the shared one. The write succeeded, the file was
correct, and the report was staged anyway.

Commit `4db2d3512103c5805936c5f8288ec2abee62f85b` made two changes that map
one-to-one onto the technique's first and third moves:

- **Ask the tool where it will read.** `src/lib/local/lane-report-exclude.ts`
  now runs `git rev-parse --path-format=absolute --git-path info/exclude` and
  takes Git's answer. The guard beside it is worth copying: *absolute or
  nothing* — a reply that is not absolute means Git did not answer the question
  asked (a shim, an older binary, a mocked stdout), and joining a relative
  fragment onto the process's working directory had already produced stray
  `sha/` and `headsha/` directories at a worktree root in this repository's own
  suite.
- **Assert through the consuming verb.** `src/lib/local/lane-report-exclude.test.ts`
  builds a real repository in a temp directory, points `core.excludesFile` at an
  empty file so the developer's global ignores cannot answer for it, runs
  `git check-ignore --quiet` **before** (expects status 1) and **after** (expects
  status 0), and then does the thing the product's claim is actually about:
  `git add -A`, followed by `git diff --cached --name-only`, asserting the staged
  set is exactly `deliverable.txt`.

The fixture matrix is the technique's prior-state rule, exactly: `[false, true]`
(plain checkout, linked worktree) crossed with `["plain", "comment", "negated"]`
— six cells. The `comment` cell seeds `# Keep .ascent/lane-report.json out of
commits`; the `negated` cell seeds the path and then `!` the path. Both are
states in which a substring check reads *already handled* and writes nothing,
and both are why the implementation's idempotence check parses the file into
rules — dropping blanks and `#` lines — instead of calling `includes`.

The suite runs at the unit rung. Six repositories are created, committed to,
worktree-added and torn down per run, and it is a sub-second file in a lane that
gates on push.

## The one that was not: a substring that cannot see the defect

`src/features/admin/integrations/envSnippet.ts` builds the copyable setup block
for Claude Code telemetry. It shipped emitting

```
export OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer <token>
```

— unquoted, with a space in the value. Pasted into a POSIX shell, `export` takes
`OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer` and then treats the token as a
second name to export, which is not a valid identifier. The feature could never
have worked for anyone who used it as instructed.

Four DOM assertions in
`src/features/admin/integrations/ClaudeCodeSetup.dom.test.tsx` cover this
surface, and all four are near-side by construction: the token stays masked in
the DOM, one click reveals it in both places, both copy affordances copy the
*real* token, a rotated token masks the same way. Every one of them is about the
characters. None can see that the characters are not a shell statement. Commit
`07ee938740edc04cf7dc61ee53a4dafb35cac29a` added the quoting — and, checked at
`62c252dd`, added **no test at all**; its second file was a documentation
paragraph.

What exists today in `src/features/admin/integrations/envSnippet.test.ts` is a
pair of substring pins, and they demonstrate the technique's warning rather than
its remedy:

```
expect(snippet).toContain("OTEL_EXPORTER_OTLP_ENDPOINT='https://ascent.example/api/integrations/ingest'");
expect(snippet).toContain("Authorization=Bearer asc_otel.acme.secretmac");
```

The first happens to carry the quotes and would fail on a revert. **The second
passes on both forms** — quoting adds characters around the value, so the broken
line contains the same substring — which is the exact blindness the technique
names: a substring pin over emitted output tends to be satisfied by the defect
it was written after. Anchoring the whole line (`export
OTEL_EXPORTER_OTLP_HEADERS='Authorization=Bearer …'`) closes it with no new
machinery.

The reader-based version is also cheap here, and it is the one that would have
caught the original: `spawnSync` a POSIX shell with the snippet plus `env`,
using a synthetic token, and assert the resulting variables. There is no shell
execution anywhere in this tree's tests today, which is why this half of the
application is recorded as a gap rather than as a realization.

## What this realization does not cover

The exclude test proves Git reads the rule and that staging honours it. It does
not cover the other half of the same emission: the lane's report contract also
tells the agent not to commit the file, and `excludeLaneReport` is documented as
"the belt, not the braces". Nothing asserts the braces, so a regression there is
invisible while the belt holds.

Both artifacts are also **write-once per lane**, so neither test covers
concurrent appenders to the same shared `info/exclude` — two linked worktrees of
one repository running lanes at the same time write to one file with a
read-modify-write, and the matrix has no cell for it.
