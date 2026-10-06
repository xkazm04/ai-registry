# Lite mode - the procedure

Read the **Lite mode** section of `SKILL.md` first: it says when lite is the right call, what it does not
judge, and why it is never an approval. This file is the order of work for the one session
that runs it. **Every phase of `SKILL.md` not named here runs as written.**

1. **Resolve** (phase 0) with `council.mjs round --runs-dir <runs> --slug <slug> --mode lite`,
   which prints the next `run_id` (`<YYYY-MM-DD>-<slug>-lite-r<n>`) and its
   `supersedes_run_id`. A human rejection's reason still opens `must_address`, verbatim. A
   lite round 4 is `stalled`: write that result and stop.
2. **Receipt and drift** (phase 1) against the previous **lite** receipt only. A verdict
   carries lite to lite and never across modes: a single-pass opinion is not a member's
   verdict, and a member's verdict is not relabelled a lite one. `started.json` carries
   `mode: "lite"`.
3. **The pack** (phase 2): the same pack, built the same way, with the same exclusions -
   never the implementer's report, plan, self-assessment or commit messages as argument,
   never the subject's own product documentation. Leave out what only a skipped row reads
   (`price-book.md`, market briefs) and the per-member slices (one reader needs no index).
   Gates resolve exactly as **Resolving the gates** says and are recorded as two numbers.
   **When the repo declares no gate anywhere**, say so in the pack index and score
   robustness from the evidence that remains - the test inventory, the failure paths in the
   span, whether errors reach an error door - with `confidence: "low"` and a `med` finding
   naming both places you looked. This is the one rule where lite departs from
   `member-robustness.md`, which records `unmeasured`: in a gate-less repo that would make
   every lite pass `incomplete` by construction. The robustness floor still binds.
4. **Robustness first**, by `member-robustness.md` under `member-common.md`, hard-fail check
   and `hard-failures.json` included. Then the **early exit** of phase 3, unchanged: a hard
   failure or robustness below 0.50 ends the pass, and value and craft are written
   `unmeasured` with "the pass exited early on <what>".
5. **Then value, then craft**, each by its own member brief, with two limits: no web lookups
   (craft's outside read does not happen, and its brief says how that caps confidence), and
   L1 only for value. The ownership table in `member-common.md` binds one pass exactly as it
   binds five members: a defect moves one row's score.
6. **One verdict file per row, written and validated before the next row's brief is read** -
   `council.mjs validate --verdict <file> --mode lite`, which also refuses a file for a row
   lite does not judge. Never reopen an earlier verdict once a later one is written, and
   never after `aggregate`: the order is the only blindness a single pass has.
7. **Aggregate** (phase 5) with the same command. The instrument reads `mode` from
   `started.json`, writes `rivalry` and `economics` as `unmeasured` with its fixed reason,
   names them in `skipped_dimensions`, adds no `must_address` line for them, and refuses an
   empty summary. `must_address` is always present, possibly empty. Write the `summary` for
   the implementer who reworks from it: what holds, what must change, and what a lite pass
   could not see.
8. **Report** per `references/synthesis.md`, opening with: *"Lite review - one pass over
   value, craft and robustness; rivalry and economics were not judged. This is not the
   council and not an approval."* Coverage is read aloud like any other: a complete lite
   pass rests on 70% of `feature-v1`.
9. **Vault**: the run note (`runs/<run_id>.md`, `mode: lite` in its frontmatter) and the
   `Council.md` row. Never `Bar.md` - a single pass clearing the bar would lower it - and
   never `Calibration.md` or a market brief.

## Headless by contract

Lite runs under `claude -p`, with nobody to answer. It asks no question at any point - no
`AskUserQuestion`, no "shall I". Anything that would need an answer is recorded where a
reader finds it (the pack index, an `unmeasured_reason`, the summary), and the pass
continues or ends with an outcome. An unresolvable slug ends the pass with a printed reason
and no result, exactly as in phase 0.
