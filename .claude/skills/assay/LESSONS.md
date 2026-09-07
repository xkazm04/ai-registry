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

## 1.1.0 - 2026-09-07 - spellbook

- **A gate that walks the source of truth cannot see a stale derivative of it, and the
  two failures look identical.** `recipes/index.json` held 106 while the lane held 109.
  The lane gate passed green throughout because it walks the lane; `recipe-map.mjs` reads
  the index, so three recipes were invisible and scored `none` where the truth was prior
  art. Found because an evaluator distrusted a verdict, not by any check. The same file
  then yielded a second instance: `--since` diffs committed history, so run over
  uncommitted work it reports zero changed recipes and prints `recipes lane OK`. One
  shape, twice: **a gate reporting on a set that is empty for a reason unrelated to what
  it was asked to check.** Both fixed, both fault-injected in both directions, because a
  gate that only passes has not been tested.
- **The instrument's score bands do not separate its cases, and the dangerous error is the
  quiet one.** One run produced a false positive at 9.1, higher than any true positive,
  and a true nearest neighbour at 4.1 holding two of the judgments a proposed new recipe
  claimed as novel. A false `strong` costs a minute; a false `related` costs a duplicate
  recipe at high confidence that nothing downstream catches. Now in `SKILL.md` (1.4.0):
  open the top five on any query behind a new recipe, whatever they scored.
- **The judgment-over-procedure name filter is inverted for `example`.** Craft hides
  behind judgment-shaped names and connector knowledge hides behind template-shaped ones,
  because a team writes down what a destination really does beside the thing that posts to
  it. Two runs to learn, and it is why the first run scored zero on this class while
  reading a source that probably contained one.
- **Separating evaluation from execution paid, and the payment came in a form neither role
  could produce alone.** Three of five sets of citations were wrong; executors caught them
  by opening the source. Executors also caught what no evaluator can see, because it is a
  property of the recipe after the edit: an enrichment that made an existing guidance
  sentence false, and a field choice that would have committed the exact error its own
  finding named.
- **Fan-out loses work at the dispatch step and leaves no trace.** One approved enrichment
  fell between the findings table and the eight prompts written from it. Every executor
  reported success, every gate was green, and it surfaced only because the per-agent counts
  were added by hand. Reconciling the assignment set against the approved set before
  dispatch is now in `SKILL.md` (1.5.0).
- **A source's worst practices can be its most transferable content.** The three defects
  found in spellbook were each a mirror: a doctrine that contradicts itself with no check
  comparing two documents, a uniqueness gate keyed on identity fields and therefore blind
  to duplicated content, and a committed verification step only one machine can run. Our
  gate has the second blind spot exactly, and our contract has the first exposure. Reading
  a source for what it got wrong is not a courtesy pass; schedule it.
