# Lessons - assay

Append-only. One block per run, newest last:

```markdown
## <version used> - <YYYY-MM-DD> - <source slug>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, never a bump target. A lesson
alone needs no version bump; a `SKILL.md` edit needs one, and a bump needs an applied
edit. A lesson the scorecard confirms three runs running is a rule `SKILL.md` should
carry; until then it stays here.

Most runs produce nothing here. An empty reflection is a valid result and a forced
lesson is pollution.

## 1.0.0 - 2026-09-07 - gbrain

- **A skill that mandates a tool must exercise that tool on the skill's own output shape
  before the first run.** `rx.mjs render` resolved slugs through the migration bundle, so
  it worked for all 106 migrated recipes and failed for the one case this skill exists to
  create: a recipe authored directly in the lane. The method said "edit the JSON, then
  render" and the render step could not run. An executing agent found it in its first
  minute and patched it. Nothing about reading the tool would have shown this; only using
  it the way the new skill uses it.
- **The renderer could not reproduce its own exemplar, and that is a trap rather than an
  inconsistency.** The worked example's rendered view was hand-tuned with per-connector
  example links. Anyone running `render` on it would have silently stripped them, and the
  lane doc's rule that the view is generated would have been false of the one file every
  new author copies. Fixed by making the renderer emit the links, which also removed a
  dead `examples/` link on every recipe that declares a connector type and holds no
  examples.
- **In a skills library, a skill whose NAME is a judgment outranks one whose name is a
  procedure.** `measure-before-you-fix`, `resolve-before-asking` and `brain-ingest-gate`
  produced most of the run's value; `db-repair`, `smoke-test` and `postgres-adopt`
  produced none and were correctly never opened. Over 73 folders that distinction is a
  cheap first filter and it belongs in the method rather than in a lesson, so it is now
  in `SKILL.md` (1.1.0).
- **Parallel execution makes the lane gate unreadable, and this had to be learned twice.**
  Three of five executing agents reported gate failures that belonged to siblings
  mid-render. The recipe migration learned exactly this and wrote it into its own notes
  directory, which this skill does not read. A rule that lives only in the run that
  discovered it will be rediscovered by the next run at full price. Now in `SKILL.md`.
- **The best finding of the run was not about the source.** 87 of 106 recipes never treat
  a human correction as a signal, which is a property of our corpus that only became
  visible because a source treated it as first-class in three places. The method had no
  phase for that, and it arrived as a lane-2 reflection rather than a finding. Worth
  watching: a source's value may be what it reveals about the corpus rather than what it
  contributes to it.
