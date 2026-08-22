# ship-loop overlay template — `.claude/ship-loop/config.md`

Copy this file to `.claude/ship-loop/config.md` in the consuming repo and fill what applies. Every section is optional; the loop runs on the defaults in SKILL.md when a section (or the whole file) is absent. Keep it short — it is read at the start of every run, and it is the only file in `.claude/ship-loop/` a human maintains by hand.

Boot drafts this file when it is missing (gate commands from the repo's scripts, default dimensions, conventions already stated in CLAUDE.md/AGENTS.md) and asks the user to confirm it at CP0. After that the loop proposes edits at checkpoints and never rewrites it silently.

```markdown
# ship-loop overlay - <project>

## Stack
<one line: framework + backend + test runners + external bridges; whether it is a hosted SaaS,
a desktop app, or a local single-user tool (this decides whether auth/billing dimensions exist)>

## Cadence
milestone | continuous | per-item        (default: milestone; asked at CP0)

## Ship bar (default answer at CP0)
<what "done" means, e.g. "distributable beta: a colleague can install + auto-update">

## Gates (ordered - run top to bottom, sequentially)
| step      | command                         | ratchet                 | when / notes                              |
|-----------|---------------------------------|-------------------------|-------------------------------------------|
| typecheck | npm run typecheck               | 0 errors                | AFTER build if the build rewrites types   |
| lint      | npm run lint                    | 0 errors (warnings: N)  |                                           |
| unit      | npm run test -- --run           | 0 failed                |                                           |
| build     | npm run build                   | exits 0                 | test-only diffs may skip                  |
| native    | cargo check && cargo clippy     | 0 errors                | only when the native backend is touched   |
| loc       | <file-size check one-liner>     | zero rows               | only when the limited file type is touched|
| e2e       | npm run test:e2e                | green                   | UI touched; LAST; serialized; pre-warm    |
Notes: <why the order is what it is; known flakes and their retry rule; what is a product
feature that merely sounds like a gate and must not be run as one>

## Value journeys (optional - declaring this turns on the value ledger and journey tags)
| tag | journey                       | what the loop certifies (the steps)     | owner persona  | docs                      |
|-----|-------------------------------|-----------------------------------------|----------------|---------------------------|
| J1  | <name>                        | <step -> step -> step shows the lift>   | <role>         | docs/<file>.md            |
| J2  | <name>                        | <...>                                   | <role>         |                           |
Ship bar default with journeys: every light green. Reuse uat/characters/* for the journey walk
when the repo has a uat/ overlay.

## Dimensions (overrides of the 9 defaults; omit rows that keep the default)
| # | name                         | what it means in this product                              |
|---|------------------------------|------------------------------------------------------------|
| 5 | <re-pointed name>            | <the product's real value/trust surface when no billing>   |
| 6 | <re-pointed name>            | <secrets/input paths when there is no auth surface>        |
| 9 | retired into the ledger      | (only when journeys are declared)                          |

## Conventions (rules the loop respects while executing)
- <file-size limit + how to check it>
- <context map to read before editing and keep accurate>
- <framework docs to read first when the installed version is newer than training data>
- <docs-as-source-of-truth: which docs must move in the same batch>
- <parallel-session ledger path, if the repo keeps one>
- <state dir tracked or gitignored>
- <themes/variants every new UI surface must be verified in>
- <push policy: the user pushes / the loop may push after a green gate>
- <product-call boundaries specific to this product: privacy, pricing, security deviations>

## Lenses (optional: extra or renamed lenses, their dimension mapping, scoping hints)
- <lens name> -> dim <n> (<what it inspects>)
- scope: <N contexts / routes; use context-map.json to target files>

## History (optional, for the reader - not read by the loop)
- <when the loop first ran here, which milestones, adoption date of the skill>
```

## Notes on the keys

- **Gates order is load-bearing.** The SKILL body carries the reasons (shared generated files, CPU contention against e2e bridge windows, typecheck after a build that rewrites generated types). Encode the order here; the loop does not reorder.
- **Re-pointing a dimension** is how a product without billing or auth keeps nine honest rows. "Not applicable, 🟢" is the failure mode the overlay exists to prevent.
- **Journeys are owned by the product, not the loop.** Tags are free (UC1/UC2/UC3, J1/J2, names); the loop only requires that each backlog item carries exactly one of them or `hyg`.
- **Conventions are repo law, not suggestions.** The gate may include a check for any convention that can be checked mechanically.
