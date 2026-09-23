<!--
The shared brief every /harvest backlog measurement worker reads first.
Persisted from the session that ran waves 1-7 (2026-09-16/17): the lessons below
were each earned by a specific failure in a specific wave, and a session that
dispatches workers without them re-derives every one of those failures.
Reference it from the worker prompt by this path; do not paraphrase it.
-->

# Backlog unit worker brief (wave 2+)

You measure ONE backlog unit for `/harvest backlog`. Your prompt names your UNIT FILE and your unit key `<u>`. Read the unit file first: it carries the shared rule, the member items (id, source note, title, claim) and a home subject.

## Trees
- **Registry main (authoritative for landing):** `C:/t/main-land`. It has `.machine.local.json`, so `loadFleet()` resolves from there.
- **Shared checkout (a sibling branch carrying landings not yet on main):** `ai-registry`. Check BOTH for coverage; a technique only on the shared checkout still counts. Say which tree.

## Method - read before step 1
`C:/t/main-land/.claude/skills/harvest/references/backlog.md`, intake Phase 6, 7 and 7.5 in `C:/t/main-land/.claude/skills/intake/SKILL.md`, and `C:/t/main-land/.claude/skills/harvest/references/evaluation.md`.

## Lessons from wave 1 (binding)
1. **COVERED means the WHOLE unit is covered.** Wave 1 returned three whole-unit COVERED verdicts that each hid an uncovered residual (a narrower claim, a condition, an inversion). If the corpus covers most of the rule but not all, do not return COVERED: state what is covered (file:line), then DRAFT and MEASURE the residual as the unit's landing.
2. **Split verdicts are allowed and valued.** A unit's rule can be half true. One wave-1 worker refuted the environment half of its rule by experiment and confirmed the receiver half in code; the landing said exactly that. Report per half.
3. **Declare target AND floor before any arm runs, write them to a file first, and add a positive control** to every instrument (prove the listener can hear, the test can fail, the typecheck can go red).
4. **A gate that could not run is not green.** If the project's test binary will not launch, say so; do not report better on a gate you did not see pass. Use the project's own test runner, not a guessed one (kp: `node scripts/run-unit-tests.mjs <files>`; personas rust: `node scripts/build/run-rust-tests.mjs -- <filter>`).
5. **The unit's home is a hint, and was wrong in about half of wave 1.** Resolve the real owner with research-map plus reading, and say when you override.
6. **Source-note and project names never go into the technique body** (strip test). Put source attribution in your return, not in the draft.
7. **Run the project's formatter and linter on every file your branch touches, yourself.** Hooks do not run in a worktree without the hook manager on PATH, so formatting failures surfaced only at ship time in wave 2 (personas rustfmt). rust: `rustfmt --edition 2021 <leaf files>` (never on a file that declares out-of-line modules - it reformats them too); JS/TS: the project's eslint/prettier on touched files.
8. **Never block on a long gate.** Two workers stalled (the harness stops a worker after 600 s with no output) while waiting on a slow test run. Start any gate that can exceed a few minutes in the background with its output going to a file, then poll that file with short checks. If a module hangs or times out, report it as not green and name the exact command the director should run.
9. **When the unit's own rule prescribes a repair, make that repair its own arm.** Wave 4's c24 ran three arms: A (as-is), B1 (the unit's rule applied literally - share the one computation), and B2 (the residual's rule - share the realized value). B1 scored exactly what A scored; it moved the failure from one assertion to the other. Without B1 the landing would have claimed a win the prescribed repair does not deliver. If your unit says "do X", arm X.
10. **A floor is only real once you have shown its gate can see the change.** Wave 4's c24 deleted a load-bearing component of the thing under test and the module whose whole job is that contract stayed green at 14/14 - the floor held only because other modules caught it. Run one negative control against the floor itself: break the thing deliberately, and name which gate went red. If none does, say so; a floor nothing can fail is not a floor.
11. **Two assertions that pull in opposite directions beat one.** Several wave-4 units had a rule that could be satisfied by over-correcting (separate everything, refuse everything, collapse everything). The pair that catches it is "separate when X moves" AND "agree when X does not", asserted on the same arm. A single target assertion is passed by the null change in one direction and by the sledgehammer in the other.
12. **`echo $?` after a pipe or a redirect reports the WRONG command's status, and it is how a red gate gets reported green.** `cargo clippy ... 2>&1 | tail -6 > out.txt; echo "exit $?"` printed `exit 0` over a build that had failed - `$?` was the redirect's. The director did this on 2026-09-17 and claimed clippy green on a security change, then had to retract it. Run a gate BARE and branch on its status, or redirect to a file with `> log 2>&1` and read `$?` immediately with nothing between. Never pipe a gate into `head`/`tail` and then read `$?`, however long the output is. This is lesson 4's most common concrete cause.

## Do
1. **RE-VERIFY.** Open each member's source note (`librarian/sources/<note>.md`, either tree) for anchors and wording. Resolve prior art with `node scripts/research-map.mjs "<concept terms>" --top 5` (never product or tool names; never construct paths) and OPEN the files.
2. **DRAFT** one landing as text for the unit (or its residual): shape, full file content with frontmatter (`use_when`; `laws` with anchors in the bundle `_laws.md`; `applied:` and `ab_verdict:`), the golden-path `techniques:` line, and a one-to-four-line index bullet in the golden path's house style. No product, company or tool name.
3. **MEASURE** at the highest reachable mode, and say why not the one above: code > experiment > blind-ab > simulation (see backlog.md). Prefer the seam that could FALSIFY the rule, and say what a caught outcome would have taught.
   - Code arms: your OWN worktree only: `git worktree add C:/t/bw-<u> -b backlog/<u>` in the project. Junction node_modules if needed (`cmd //c "mklink /J node_modules <project>\node_modules"`) and `cmd //c "rmdir node_modules"` BEFORE removing the worktree. Commit arm B on `backlog/<u>` only; never the active branch; never push. Remove the worktree, keep the branch.
   - Blind-ab arms: folders under `<your scratchpad>/waves/w<N>/<unit>/`; arms and judge via `claude -p --model claude-opus-5 --dangerously-skip-permissions --output-format json`, prompt on stdin, answers written to files. Note: these headless runs fire the operator's user-wide hooks; that is expected noise.
   - Simulation: three cases from a real tree or its git history, each with its falsifier. Invented cases do not count.

## Fleet gotchas (verified on this machine)
- kp: commit-msg hook accepts only conventional types. politicas: lefthook blocks coupled paths without their doc or a `Doc-sync(...)` trailer, and typecheck has pre-existing failures - grep for your file. personas: worktrees have no node_modules; its hook shim rewrites pnpm-lock.yaml (revert it, never commit it); rust test binaries fail to LAUNCH (STATUS_ENTRYPOINT_NOT_FOUND) under a raw `cargo test` in ANY target dir - run them through `node scripts/build/run-rust-tests.mjs -- <filter>`, which sets up what they need. tracklight: the shared `CARGO_TARGET_DIR` is overwritten by sibling builds and gave a false failure - use a PRIVATE target dir (e.g. `C:/t/tgt-<u>`) and delete it after. tracklight crates are `lighttrack-*`. ascent's tsconfig excludes `*.test.ts` from typecheck.
- personas Rust gates: the test databases are created in the SYSTEM temp dir and stale ones are swept, so two concurrent personas test runs delete each other's databases (one run returned 236 environmental failures, 4 with a private TMP). Set a private `TMP`/`TEMP` as well as a private `CARGO_TARGET_DIR`.
- `athena-everywhere` is PRIVATE: never put its names or paths in draft text.
- Python and Node need Windows paths (`C:/...`), not `/c/...`. A piped exit code is the pipe's (`cmd | tail`). An empty grep is not a pass; read the real summary.

## Write nothing to the registry
No files under either registry tree, no git there, no run-board commands. The director lands your draft.

## RETURN (final message, all of it - a return without a verdict is not a return)
- `verdict`: better | not-better | unmeasurable | COVERED (whole unit only), per half if split
- `mode` and why not the mode above
- target and floor with numbers for every arm, and the positive controls
- what the falsifying seam refuted or confirmed
- the DRAFT in full, its registry path, the golden-path line and the index bullet
- fleet (code only): project, branch, commit sha, files, the project's own gate output
- if unmeasurable: the instrument that WOULD measure it
- source notes to cite, and anything in the corpus or the members you found wrong
