# Lessons - agent-guidance-bootstrap

## 0.5.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 0.6.0 - 2026-09-17 - skillbench

Benchmark of 414 judged runs; ~25 verdicts on refresh mode, ~16 on the uncommitted deliverable,
and five measured runs on one repo all choosing the same wrong direction. Applied in 0.7.0.

- **"Keep one canonical file and make the other a one-line pointer" never said which way, and
  every run picked the lossy one.** athena had a 77-line canonical `CLAUDE.md` and no
  `AGENTS.md`; all five high-effort runs made the new `AGENTS.md` canonical and cut `CLAUDE.md`
  to a pointer, when the reverse would have lost nothing. No run kept all three of the old
  file's distinctive rules; one wrote "do not edit the auto-generated block" in the same commit
  that deleted the block. Fixed: an existing canonical file stays canonical, the new file is the
  pointer, and a demotion is no-loss or the report names what was dropped and why.
- **Silence about generated blocks produced two opposite failures.** On athena five runs deleted
  the `personas:context-map` block; on kp, where the block held genuinely stale content (289
  contexts against a real 191), runs that fixed it in place were faulted for hand-editing a
  generated region and runs that deleted it were faulted for deleting. "Copy verbatim" would
  have ratified the stale number. Fixed: never edit, never delete, name the staleness outside
  the block and name the command that regenerates it.
- **Refresh was a mode with no procedure** - one line, "run every command in the Commands
  section", against a file the skill says must also carry architecture, constraints and
  conventions. Both failure modes were punished: ran the commands and produced nothing, and
  found real drift but only proposed it. Refresh now has its own numbered procedure (re-derive,
  diff line by line, mark confirmed / stale / unverifiable, fix in place, report counts), with a
  no-drift refresh named as a valid result that commits nothing and drift-found-but-proposed
  named as a failure.
- **Three of five runs committed nothing.** ~16 verdicts fault the uncommitted guidance file,
  one faults the opposite. The file is the deliverable: one `docs(agents):` commit when the tree
  is otherwise clean.
