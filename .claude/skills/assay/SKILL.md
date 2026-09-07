---
name: assay
description: "Mine an external source - a skills library, a repository, an article, pasted notes - for craft that belongs in the `recipes/` lane. Cross-checks every candidate against the existing corpus, gives each finding a recommended disposition (new recipe, enrich, example, lesson, lead, discard), puts the whole set in front of the operator on one screen, executes what is accepted, and remembers every deviation from its recommendation so the next run recommends better. Discarding a whole source is a successful run. Use when someone shares a skills repository, a connector's documentation, or a body of practice and asks what it means for our recipes."
category: ai-native
memory: project
version: 2.0.0
tags: recipes, sources, cross-check, disposition, decision-gate, taste-ledger, obsidian-memory, connector-examples, discard
---

# Assay

To assay an ore sample is to find out what metal is actually in it. Most samples are
mostly rock, the result is still worth having, and the assay that reports gold in every
sample is broken rather than lucky.

This skill is `/intake`'s sibling. Intake mines a source for the **knowledge** lane -
subjects, techniques, amendments. Assay mines one for the **recipes** lane: craft, which
is a different artifact with a different contract, a different gate and a different
failure mode. They share a parent rule and a shape, and where this file is silent, read
`.claude/skills/intake/SKILL.md`.

Say this out loud in every session, because the failure mode is a corpus of a hundred
recipes quietly acquiring one repository's habits:

> **A source shows how ONE team does the work. A recipe claims how the work is done
> well.** The distance between those two sentences is the assay. A source ORIGINATES a
> finding and never AUTHORIZES one.

And the distinction this lane exists on, which a skills library will try to blur:

> **A skill is not a recipe.** A skill is a procedure an agent executes. A recipe is
> mastery of a kind of work: what goes wrong without it, the judgment at its centre,
> what is true when it is done well. A well-written skill is a runbook, and a runbook
> converted field-for-field into a recipe produces exactly the thing Recipe v3 was built
> to stop. Most skills yield an `example` or two sentences of `guidance`. A few yield a
> recipe. Some yield nothing, and saying so is the job.

## Invocation

```
/assay <url|path|->              # the full loop: acquire, extract, cross-check, decide, execute, clean up
/assay <url> --dry               # findings and recommendations only; change no published content
/assay <url> --domain <d>        # constrain cross-check and routing to one domain
/assay <url> --keep              # do not delete the acquired source at the end (default is delete)
/assay status                    # read the source ledger in the vault, touch nothing
/assay taste                     # print the taste ledger: what the operator has overruled, and the rule inferred
/assay reflect                   # update LESSONS.md, SCORECARD.md and this method from recent runs
```

## The instruments

Three, and none of them decides anything.

```sh
node scripts/recipe-map.mjs "<term>" ...          # terms -> prior art in the corpus
node scripts/recipe-map.mjs --json "<term>" ...   # the same, machine-readable
node scripts/check-recipes.mjs                    # the lane gate: shape, vocabularies, rendered-view coupling
node ../personas/scripts/templates/_migration/verify.mjs   # the corpus against ITSELF (ids, examples, shape)
```

The fourth instrument is not a script. **[`VALIDATION.md`](./VALIDATION.md) holds three
protocols that decide whether a finding has earned its place**: derivation, for a source
that states a rule and never says what goes wrong; simulation, for a new recipe; and a
blind A/B, for an enrichment. Read it at Phase 5. Two runs shipped 35 enrichments on a
swap test and an opinion, which is an argument that a sentence is not padding rather than
evidence that it changes anything.

`recipe-map` asserts its own measurement functions against a fixture before it reports,
and exits **2** when the instrument is broken rather than reporting an empty corpus as a
clean result. Its `path` field is the recipe's **address**: the lane is nested and its
depth is ours to change, so a constructed path writes into a folder no consumer walks.

**Never cross-check by hand.** A grep for one word finds one neighbour and misses the
one that matters, and reading the whole corpus burns the run. The instrument puts you in
the neighbourhood; you still open the recipe before deciding.

**`recipe-map` scores on words, so it collides, and it collides hardest on abstract
nouns.** Three verified collisions in the spellbook run alone, each of which would have
sent a finding to the wrong recipe:

| the query was about | it returned STRONG against | the shared word |
|---|---|---|
| migrating a data contract | `contract-renewal-window-watch`, a legal recipe about lease renewals | contract |
| reading the source of real systems | `source-grounded-error-root-cause-analysis` | source |
| deriving a reusable rule and deciding where it belongs | `routing-rule-management`, about where events go | rule, belongs |

The last one scored **7.0**, higher than any true positive in that run. **A high score
with matches listed in every field is not corroboration; it is one word counted seven
times**, and the long match list is what makes it read as thorough. So: never accept a
`strong` without opening the recipe it named and confirming the work is the same work,
and be most suspicious when the score is highest.

**The dangerous direction is the other one: a false LOW on the closest prior art.** A
false `strong` costs you the minute it takes to open a recipe and see it is unrelated. A
false `related` costs you a duplicate recipe authored at high confidence, and nothing
downstream will catch it. Both happened in the same run. One evaluator's proposed new
recipe had its nearest neighbour sitting at **4.1 `related`**, holding two of the exact
judgments the proposal claimed were new, and it was found only by opening the list
anyway. Another query returned its own subject nowhere in the top five, on a freshly
rebuilt index, because the recipe and the query shared almost no vocabulary.

So the rule has two halves and the second is the one that saves you:

- Never accept a `strong` without opening the recipe it named.
- **On any query central to a proposed `new-recipe`, open the top five whatever they
  scored.** `related` is not a clearance. A new recipe is the most expensive thing this
  skill can produce and the only one nothing downstream will catch.

Scores seen in one run: a false positive at **9.1**, higher than any true positive, and a
true nearest neighbour at **4.1**. The bands do not separate the cases. Treat the ordering
as a reading list, never as a verdict, which is the same thing the corpus already says
about scores in `scouted-opportunity-triage`.

**A stale generated index makes the instrument lie quietly.** `recipe-map` reads
`recipes/index.json`, not the lane, so a recipe on disk and absent from the index scores
zero and reads as `none`. This happened: the index held 106 while the lane held 109, the
lane gate passed green the whole time because it walks the lane itself, and the failure
surfaced only because an evaluator distrusted a verdict. The gate now fails on index
drift, but check the first line of `recipe-map`'s output anyway: **if the recipe count it
reports is not the number of `recipe.json` on disk, stop and rebuild the index.**

## Where things land, and why it is only one repository

The corpus is dual. The registry holds the craft; the Personas application holds a copy
its installs seed from. **Assay writes to the registry and never to the application.**

- An **enrichment** reaches the application when somebody runs
  `personas/scripts/templates/_migration/sync-back.mjs`, deliberately, with no dev app
  running. That is a separate act because the bundle is compiled into the Rust binary.
- A **new recipe** stays registry-only until somebody chooses to add it to the shipped
  bundle. That is not a gap. The registry is where craft accumulates; the application's
  corpus is what every install adopts, and growing it is a product decision rather than
  a research one.

Read `personas/docs/architecture/recipe-registry-migration.md` once before your first
run. The contract for the artifact itself is `docs/recipes-lane.md`, and the operating
detail the corpus was written to is `personas/scripts/templates/_migration/FIELD_GUIDE.md`.

## Read the source's class before its content

The class decides what a finding can even be, and getting it wrong is the most expensive
error available here.

| Class | What it usually is | What it usually yields |
|---|---|---|
| **skills library** | a repository of agent procedures, one folder each | mostly `example` and `guidance`; occasionally one `new-recipe` where a folder describes a KIND of work rather than a procedure |
| **connector body** | one vendor's documentation, SDK or integration guide | `example` files, and only for connectors a recipe already declares a TYPE for |
| **practice corpus** | a team's written methods, an internal handbook | `enrich` in quantity; a `new-recipe` where the corpus holds a kind of work ours does not |
| **single article** | one argument about one kind of work | one or two `enrich`, or a `lead` |
| **recipe corpus** | somebody else's recipes in a comparable shape | the richest and the most dangerous: their taxonomy is not ours, and importing it wholesale imports their assumptions |
| **link index** | a curated list pointing at other people's writing | **nothing directly.** It contains no craft; it contains addresses. Do not assay one. Use it in Phase 2 to CHOOSE a source, then assay what it points at. |

A source that is mostly a product pitch is `barren` and the run says so in one line.

**In a skills library, read the names first and sort them into two piles: names that are a
JUDGMENT and names that are a PROCEDURE.** `measure-before-you-fix`, `resolve-before-asking`
and `brain-ingest-gate` are judgments and they are where the craft is. `db-repair`,
`smoke-test`, `postgres-adopt` and `setup` are procedures for operating the source's own
product and they are worth nothing here. Over seventy folders that single filter is most of
the extraction, it costs one read of the index, and it was worth about eighty percent of the
first run's findings.

## The seven dispositions

Every finding gets exactly one, and the recommendation is the skill's opinion, not the
operator's decision.

1. **`new-recipe`** - the source describes a kind of work the corpus does not hold. The
   bar is high: `recipe-map` says `none` or `related` on the corpus's own vocabulary as
   well as the source's, AND the work has a need, a judgment and an output that are not
   a slice of an existing recipe. A new recipe is authored to the full contract, gate
   included, or it is not a finding.
2. **`enrich`** - the source sharpens a recipe that exists. Name the recipe, the field
   (`guidance`, one `outcome`, a `use_case`, a `personalization_need`, an `activity`
   label) and the sentence that changes. An enrichment that cannot name the field it
   changes is a `lead`.
3. **`example`** - the source carries knowledge about ONE concrete connector that a
   recipe already declares a type for.

   > **The name filter is INVERTED for this one disposition.** Everywhere else in this
   > skill a name stating a judgment outranks a name stating a procedure. For `example`
   > the opposite holds, and it has been measured: in the spellbook run the connector
   > knowledge sat in a skill indexed as "generate copy and images", a name promising a
   > content template, while the skill promising judgment about the same platform turned
   > out to be voice craft. **Connector knowledge hides behind template-shaped names**,
   > because a team that has learned what a destination really does writes it down beside
   > the thing that posts to it. When hunting this class, open the files the judgment
   > filter told you to skip. Lands as `examples/<connector>.md`, written so it
   stops applying when the connector is swapped and not when the recipe changes.
4. **`lesson`** - **structurally unreachable from an external source, and this
   disposition should almost never fire.** The lane's entry format is
   `## <version used> - <date> - <project>`, where the version is *our recipe's*
   version. A lesson therefore claims that our recipe, at that version, was run in that
   project and taught this. No repository on the internet has run our recipe. A source's
   account of how the work should go is `enrich`; a source's account of its own run of
   its own method is `enrich` too, because it cannot name a version of ours.

   This was recorded as the weakest stage after two runs, with "pick a different class of
   source" as the remedy. That was wrong: no source of any class will exercise it.
   **Lessons come from our own executions and from nowhere else.** If the corpus's
   `LESSONS.md` files are empty, the answer is to run the recipes, not to assay harder.
   Leave this disposition here for the one case that can reach it, a source that is
   itself a record of somebody running a recipe from this registry, and expect never to
   see it.
5. **`lead`** - real, not yet actionable. Goes to the vault note with a return
   condition, never into the lane.
6. **`discard`** - the source's claim is wrong, unverifiable, already held better by the
   corpus, or is configuration rather than craft. Say which; a discard with a reason is
   how the taste ledger learns.
7. **`barren`** - the whole-source verdict. Legitimate and common. A run that acquires a
   source, cross-checks it and reports nothing worth taking has done its job.

**Version discipline.** Any recipe an accepted finding edits takes a version bump in the
same change: patch for a wording fix, minor for a change in the craft. The lane's gate
enforces content-changed-version-did-not on a `--since` run and CI runs it on every pull
request, so a missed bump surfaces later and further from its cause. A new recipe is
`seed` at `0.1.0`. Appending to `LESSONS.md` alone needs no bump.

## The taste ledger

The point of this skill is not one run. It is that the tenth run recommends what this
operator would have chosen anyway.

Memory lives in the Obsidian vault beside the other skills' memory:
`<vault>/Assay/`, where `<vault>` is `C:/Users/kazda/Documents/Obsidian/personas`
(the same root `Spark/`, `Perfect/` and `Architect/` use).

```
Assay/
  Assay.md            # HOME: the source ledger - one row per source ever assayed
  taste.md            # the deviation ledger. THE artifact. Read before every proposal.
  sources/<slug>.md   # one note per source: what it was, what it yielded, the leads
  sessions/<date>.md  # run records, immutable, ending in a `next:` pointer
```

`Assay.md` carries a second table under the source ledger: **the followups, and what
happened to them.** A followup is a finding too large to fold into the run that found it,
so it is the operator's to schedule, and without this table nobody ever learns whether
raising one was worth anything. Add the row when the followup is raised, and close it when
it is acted on, with the commits.

The first one closed the same day it was raised, and taught the rule that governs the rest:
**the finding was a count, and closing the count was the wrong execution.** 87 recipes did
not treat a human correction as a signal; adding a correction sentence to 87 recipes would
have left the corpus looking repaired and taught it nothing. What worked was asking one
question of each recipe and accepting that a real number of answers would be no. 74 yes,
14 no. When you raise a followup, phrase it as the question to ask, never as the number to
close.

**`taste.md` is written only when the operator departs from a recommendation**, and it
records three things, never two:

```markdown
## <YYYY-MM-DD> - <source slug> - <finding>
- **Recommended:** enrich `pull-request-test-verdict` guidance with the merge-queue point.
- **Operator chose:** decline.
- **Rule inferred:** a mechanism only some teams run is a `personalization_need`, not
  guidance. Guidance is what is true for everyone holding the recipe.
```

The third line is the whole value. A deviation without an inferred rule is a diary
entry; the rule is what a later run applies. When the operator gives a reason, the rule
is theirs and is recorded as stated. When they do not, infer one, mark it `(inferred,
unconfirmed)`, and let the next contradicting or confirming decision settle it.

**Read `taste.md` in full at Phase 1, before scoring a single finding.** A rule seen
twice changes the recommendation itself, not the note beside it. A rule contradicted by
a later decision is struck through in place, with the date, never deleted: the reversal
is itself the signal.

## Procedure

### Phase 0 - Bootstrap (idempotent)

Scaffold `<vault>/Assay/` if absent. Check for a live conflict against the recipes lane
in the consuming project's coordination ledger if one exists. Never start with an
unclean registry tree you did not create: `git status` first, and classify every entry
as yours or somebody else's.

### Phase 1 - Prove the instruments, load the taste

Run `node scripts/recipe-map.mjs "<something the corpus certainly holds>"` and confirm a
`STRONG`. An instrument that cannot find what is there will report a source as novel.
Then read `taste.md` in full, and `Assay.md`'s ledger for whether this source, or one
from the same origin, has been assayed before. A re-assay is legitimate at a newer
commit; a re-assay that does not know it is one wastes the run and re-proposes declined
findings, which is the fastest way to make the gate unreadable.

### Phase 2 - Acquire

Clone or fetch into a scratch directory **outside both repositories**, never into the
registry or the application:

```sh
git clone --depth 1 <url> "$SCRATCH/<slug>"
```

A shallow clone is enough: history is not craft. Record the commit you read, because a
finding without one cannot be re-checked and a re-assay cannot tell what is new.

**Not every worthwhile source is a repository.** A published handbook, a vendor's
documentation or a body of practice on the web has no commit to record, so record the
URL and the date fetched instead, and say in the source note that the version is a date
rather than a revision, because that weakens every re-assay against it. Fetch only the
sections the class table says can yield, never the whole site.

**If the source turns out to be a link index, stop.** It holds addresses rather than
craft, and assaying it means assaying two hundred other things. Pick the two or three it
points at that match a known gap in the corpus, and assay those. Record in the source
note that the index was the route rather than the source.

Read the source's own account of itself first (`README`, the folder names, the index),
then the class table above. **Do not read every file.** A skills library with sixty
folders is read by name and by index, then depth-first into the ten that survive.

### Phase 3 - Extract candidates

Cheap: no cross-check, no corpus reads. For each promising unit of the source, write one
line: what kind of work it is about, in **the corpus's vocabulary rather than the
source's**. That translation is the work of this phase and it is where a source's
taxonomy either survives contact with ours or does not.

Cap the extraction. Sixty folders do not produce sixty findings; they produce the ten
that are about a kind of work, and the fifty that are procedures for doing something
with a tool.

**A stated rule with no failure mode is not automatically a discard.** The catalogue
class tells you what to produce and never what to distrust, and throwing all of it away
wastes the one real signal it carries: somebody thought the rule worth writing down. The
source can supply the inventory while we supply the reasoning, provided the split is
declared and never hidden. `VALIDATION.md` section 1 holds the three-part bar, and its
third part, **why a competent practitioner would plausibly do the wrong thing**, is the
platitude filter that does most of the work. Derive only where the corpus has a recipe
that would carry the result.

### Phase 4 - Cross-check

One `recipe-map` call per candidate, with **two vocabularies**: the source's words and
the corpus's. A `none` on the source's words and a `strong` on ours is the commonest
shape and it means `enrich`, not `new-recipe`.

Open every `strong` hit. The instrument puts you in the neighbourhood; the decision
needs the recipe's actual `need` and `core_action` in front of you, because the question
is whether the source says something the recipe does not, and that cannot be answered
from a score.

### Phase 5 - Recommend

Give every candidate a disposition, a confidence (`high` / `low`) and one line of
justification naming the evidence. Apply the taste ledger here: a rule it holds changes
the recommendation and the note says which rule applied.

Then sort by disposition class and count. **If the run has produced more than about
twenty findings, cut the tail before the gate**, not after: a screen the operator cannot
read is a screen they accept wholesale, which is worse than a shorter one they actually
decide. The cut ones become leads with their reason.

**Then validate, before the operator sees anything.** Read `VALIDATION.md` and run it:

- **Every `new-recipe` is walked** against two or three of its own draft use cases, on
  paper, looking deliberately for a scenario where the recipe as written gives the wrong
  answer. The walk's findings travel with the proposal. A proposal that survives the walk
  unchanged is suspicious rather than strong, and the screen says what was looked for.
- **Enrichments are A/B'd blind** against a fixture: one judge on the recipe as it stands,
  one on the enriched recipe, neither told what is being tested, and a third comparing
  their outputs against a question written before either ran. Four verdicts, and only one
  of them is a pass.

Spend the A/B budget on the weak findings FIRST, not the strong ones. If the low-confidence
enrichments come back confirmed alongside everything else, the instrument is a rubber stamp
and that is the run's real finding.

**The decision screen carries the verdicts.** An enrichment that came back
NON-DISCRIMINATING or INEFFECTIVE does not reach the operator as a recommendation; it
reaches them as a finding that was tested and failed, or it does not reach them at all.
Do not ask somebody to approve a sentence you have measured as inert.

### Phase 6 - The decision screen

Print the **full itemized findings table to the terminal first**, numbered, grouped by
disposition, each with its recommendation and one-line justification. That is the
reference the operator reads.

Then ask, in one `AskUserQuestion` call, at most four questions, one per disposition
class that has findings. Each question offers:

- **Accept all N (recommended)** - first, and marked recommended;
- a narrower option where one exists and is honest (`accept the N high-confidence only`);
- **Skip this class**;
- and the operator may always answer `Other` with deviations by number
  (`all except 7 and 12`), which is the path the taste ledger is built from.

Never split one class across two screens, and never ask the operator to decide a finding
they have not been shown. If the run is unattended, **skip the gate, execute nothing,
and say so** - never decide on the operator's behalf.

### Phase 7 - Execute

In the order `example` → `enrich` → `lesson` → `new-recipe`, because the first three
inform the last.

**Before dispatching anything, reconcile the assignment set against the approved set, by
number.** Fan-out loses work at the dispatch step, not at the work step, and it loses it
without a trace: every executor reports success, every gate is green, and a dropped
finding appears nowhere at all. It happened in the spellbook run, where one approved
enrichment fell between the findings table and the eight prompts written from it, and
surfaced only because the per-agent counts were added up by hand before committing. Count
the approved items, count the items named across your prompts, and do not dispatch until
the two match.

**Executors verify sources; evaluators do not.** In that same run three of five sets of
citations were wrong, including the load-bearing sentence behind a new recipe, which was
not in the file credited to it. Tell every executor to open the source and check the
quotation before writing, and to report corrected citations. Executors also catch what no
evaluator can, because it is a property of the recipe AFTER the edit rather than of the
source: an enrichment that makes an existing guidance sentence false, a field choice that
would commit the very error the finding names, a source rule carrying a number the source
never defends.

For every recipe touched:

1. edit `recipe.json` - it is the authored artifact;
2. bump its `version` per the discipline above;
3. re-render with `node ../personas/scripts/templates/_migration/rx.mjs render <slug>` -
   `RECIPE.md` is generated and the gate compares five frontmatter keys against the JSON;
4. run `node scripts/check-recipes.mjs` and fix what it says.

A new recipe is authored into `recipes/<domain>/<topic>/<slug>/` with all four files, at
the worked example's bar, and adds a directory to a level that is capped at **ten**.
Check the cap before choosing a topic; if a new domain would be the eleventh, it does
not land, and that is a finding for the operator rather than a decision for the session.

Then `node scripts/build-recipes-index.mjs` once, and
`node ../personas/scripts/templates/_migration/verify.mjs` for the corpus-level checks
the per-recipe gate cannot make.

**When execution runs in parallel, the lane gate is not readable as a verdict on your own
work.** It walks every recipe directory including a sibling's half-rendered one, so a red
line mid-run usually belongs to somebody else and clears on its own. **Verify by absence:**
grep the gate output for your own slugs, and if they appear in neither the problems nor the
notes, yours are clean. Three of five executing agents on the first run reported a failure
that was not theirs, and this same rule had already been learned once by the corpus
migration, in a file this skill does not read.

### Phase 8 - Release the source

Delete the acquired source unless `--keep`. It is not ours, it is not evidence, and a
scratch clone left behind is read by a later session as a checkout. Record the commit
read in the source note, which is what makes the deletion safe.

### Phase 9 - Persist

Write `sources/<slug>.md` (what the source was, its class, its commit, findings by
disposition, the leads with return conditions), add one row to `Assay.md`'s ledger, and
write `taste.md` entries for **every deviation**, with the inferred rule. Then the
session note with a `next:` pointer.

If the run raised a followup, add its row to the followups table in the same pass. If a
previously raised followup was acted on since the last run, close its row with the commits,
whether or not this run touched it.

### Phase 10 - Commit

One commit in the registry, pathspec-scoped, message naming the source, its commit, and
the counts by disposition. Never push. The vault is not version-controlled and is never
committed.

### Phase 11 - Reflect

Autonomously, without asking. Most runs produce nothing beyond lane 0, and a forced
lesson is pollution.

- **Lane 0, every run:** append a `SCORECARD.md` row - version, date, source slug, class,
  candidates extracted, findings by disposition, accepted, deviations, and the
  whole-source verdict. Then read the last ten rows and name the stage the funnel is
  losing most at. **The number that matters here is the deviation rate**: it should fall
  as the taste ledger fills, and if it does not, the ledger is recording diary entries
  rather than rules.
- **Lane 1, method:** append to `LESSONS.md` only if something generalizes past this
  source. Edit `SKILL.md` only with a version bump, and bump only with an applied edit.
- **Lane 2, cross-corpus patterns:** a pattern that touches many recipes at once is not
  a finding for this run - it is a **followup for the operator**, written into the
  session note and reported in the closing message. A source that shows five recipes
  share a defect has told you something about the corpus, not about itself.

## Anti-patterns

- **Letting a skills library author the lane.** The failure that damages the corpus
  rather than wasting a run. A folder called `pr-review/` is not evidence that
  `pull-request-test-verdict` should adopt its steps.
- **Converting a procedure into `activities`.** Activities are three to eight linear,
  branch-free phrases describing the SHAPE of the work. A source's numbered steps are a
  runbook. If it needs a branch, it is not a recipe.
- **A `new-recipe` because the source used different words.** Cross-check in both
  vocabularies before believing a gap exists.
- **An `example` that restates the recipe.** The test: if you could paste the file under
  another recipe unchanged, you wrote a datasheet. An example must stop applying when
  the connector is swapped.
- **Writing a `LESSONS.md` entry from a source's opinion.** Lessons record runs.
- **Twenty findings on one screen.** Cut to what can be read, and lead the rest.
- **Reporting the source's numbers as our own.** A figure that cannot be verified is
  written as the shape of the finding without the number.
- **Deleting a taste rule that a later decision contradicted.** Strike it through with
  the date. The reversal is the signal.
