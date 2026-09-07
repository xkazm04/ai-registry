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

## 1.1.0 - 2026-09-07 - validation protocols built and tested against our own shipped work

Not a source run. The operator asked whether the skill could supply the layer a catalogue
source omits, and whether new recipes and enrichments could be validated rather than argued
for. `VALIDATION.md` is the answer, and it was tested the only honest way: retroactively,
against six enrichments already committed.

- **The A/B discriminates. It is not a rubber stamp, and the test for that was built in.**
  Six enrichments, weighted deliberately toward the weak: two the executors themselves rated
  low, one medium that had been a close call in a swap test, three high as controls. The
  verdicts came back **exactly ranked by the confidence assigned before any of it ran**: all
  three high confirmed, the medium non-discriminating, and of the two low one
  non-discriminating and one only weakly discriminating. Had everything confirmed, the
  instrument would have been measuring its own optimism, and that outcome was named in the
  protocol before the run so it could not be explained away afterwards.
- **Two shipped enrichments are measurably inert.** The base recipe already reaches the same
  answer without them. Both had been flagged by the agent that wrote them, one with the exact
  words "the one I would drop first". **The swap test passed both.** So the swap test and an
  author's own doubt are cheaper signals than the A/B and they agree with it, but only the
  A/B tells you which side of the line a specific sentence falls on.
- **The protocol found two defects in itself on its first run, and both are the shape a
  proxy measurement fails in.** (1) Two of the six tests were the same recipe with different
  sentences removed, batched to one judge; the judge saw a copy carrying the criterion and a
  copy without it, and the vocabulary leaked into the arm that was supposed to lack it. Both
  void, re-run in isolation. (2) One discriminating question asked two things at once; both
  arms satisfied the first, the comparator answered on it, and the half that actually
  separated them was never scored. Re-asked as a single claim it separated cleanly and the
  enrichment confirmed. **A bundled question does not fail loudly; it returns a clean, wrong
  answer.**
- **A fixture can be better than it was designed to be, and the surplus is where the real
  result was.** The pull-request fixture carried two exit codes: one for the verdict and one,
  incidentally, for attribution. Both arms read the subchecks behind the first. Only the
  enriched arm refused to infer from the second, and the base arm committed, one paragraph
  later, the exact error it had just rejected. Build fixtures that give the recipe a second
  chance to make the same mistake in a different role.
- **The rule we shipped as an enrichment was the rule we were failing.** spellbook's
  `skill-creator` says to run the with-artifact and baseline in the same turn and treat an
  assertion that passes either way as non-discriminating. We read it, agreed, and folded it
  into a recipe about auditing somebody else's library while shipping 35 enrichments of our
  own on a swap test and an opinion.

## 2.0.0 - 2026-09-07 - agentic-awesome-skills

- **The name filter scales to two thousand skills at the cost of one index read.** This
  source held 2,015 skill directories against gbrain's 24 and spellbook's 62, and the
  method did not strain, because sorting names into judgment and procedure was done over
  a generated index rather than over the tree. Thirty candidates came out of it, and
  every file eventually opened was chosen from a name and a one-line description. **A
  large source is not a proportionally larger run.** If a source ever forces reading at
  scale, that is a signal the index is missing, not that the cap should rise.
- **An aggregated skills library is a different class from a team's skills library, and
  the difference is that nobody stands behind any of it.** 63% of entries here carry the
  aggregator's injected boilerplate, twenty ship the literal placeholder description, and
  the twelve-skill marketing-psychology family whose names read as the richest judgment
  vein in the whole index is empty. The craft that did exist came from four or five named
  upstream repos, each recorded in the skill's own `source_repo`. **Assay the contributed
  repo, not the aggregate**, and use the aggregate the way the method says to use a link
  index: as a route to a source, not as one.
- **A grep for a judgment measures your vocabulary, not the corpus.** A pattern search
  across the 28 audit-shaped recipes returned one hit and I read it as a corpus-wide gap.
  Opening the recipes disproved it in minutes: `codebase-latent-defect-hunt` already
  carried the idea in words the pattern could not match. This is the same failure the
  registry has recorded twice under other names, and the remedy is the same one: derive
  the check from a different layer than the instrument, which here means opening three
  recipes before believing an absence.
- **Zero of three enrichments survived the A/B, and two of the base arms were better than
  their enriched twins.** The `deploy-regression-correlation` base arm produced unprompted
  the exact sentence drafted as its enrichment. Against a corpus this mature the
  enrichment disposition may have close to no yield from an external source, because a
  well-written recipe reaches judgments it never states. That is now an open question in
  the followup table rather than a conclusion, but two runs shipping 35 enrichments on a
  swap test look different in this light.
- **A fixture that inventories the evidence available hands the enrichment's behaviour to
  the base arm.** All three fixtures this run listed the material on offer, and two named
  the exact artifact the enrichment was about, which is a hint no real practitioner gets.
  A fixture should state the situation and let the recipe decide what to reach for. This
  weakens all three verdicts above and is the first known defect in VALIDATION.md
  section 3.
