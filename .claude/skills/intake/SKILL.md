---
name: intake
description: "Mine an external source - a YouTube video, a news roundup, an article, pasted notes - for what it should change in THIS registry, and in the connected projects that consume it. Ingests the source, maps every claim against existing bundles for prior art, triages candidates with the operator, and lands only what survives corroboration. News sources mostly yield currency signals and leads, not knowledge; that is a successful run. Use when someone shares a link and asks what it means for us."
category: ai-native
memory: project
version: 1.5.0
tags: research, sources, triage, currency, cross-repo, leads, apply, ab-test, parallel, reference-index
---

# Intake

The registry has three content engines. `/forge` creates a bundle from
a repository's ceiling. `deepen` raises one subject above any repository, outward, by
researching a topic we chose. **This one runs inward**: someone hands over a source we
did not choose - usually a mixed AI-news video - and the question is what, if anything,
it changes here.

That inversion is the whole design. `deepen` starts from a subject and goes looking for
truth. `/intake` starts from a claim of unknown quality and has to earn its way to a
subject. Most of the time it does not, and the run is still worth having, because the
thing it produces instead - a dated lead, a clock reset, a dispatch - is what keeps a
corpus from aging silently between sweeps.

Say the next sentence out loud in every session, because the failure mode for a skill
like this is a bundle quietly acquiring a YouTube channel's error rate. **A source
ORIGINATES a finding. It never AUTHORIZES one.**

## Invocation

```
/intake <url|path|->          # the full loop: ingest, map, triage, land
/intake <url> --leads-only    # stop at the vault note; change no published content
/intake <url> --spec-only     # write an XL spec but do not forge it in this session
/intake <url> --domain <d>    # constrain routing to one bundle
/intake status                # read the source ledger, touch nothing
/intake reflect               # update LESSONS.md, SCORECARD.md and this method from recent runs
/intake apply <technique> [--project <slug>] [--mode code|experiment|simulation]
                              # run Phase 7.5 alone against knowledge that already landed
/intake <url> --no-apply      # land without applying; the reason goes in the scorecard row
/intake <url> --run <id>      # join the run board under a chosen id (default: derived)
/intake <url> --wave          # reference-index source: mine its references in waves, not its top 3
/intake board                 # read the run board - who else is live, and what they hold
```

The pipeline this skill is trying to master, and the five stages every run is scored
on, is **research -> extract -> test -> apply -> ship**. The first two are Phases 2-6.
The last three are Phase 7.5 and Phase 8, and they are not optional: **a technique that
has never been applied to a managed project is a wiki page**, and this registry is not
a wiki. Every technique and every golden-path amendment that lands must relate to at
least one managed project and one seam in its code, and must have been A/B-tested there
- in real code where the tree allows it, as an experiment where it does not, and as a
recorded thought simulation where nothing else is reachable. The mode is graded; the
step is not skippable.

## Never count, never construct, never fetch by hand

Two instruments, both dependency-free, both asserting themselves before they report:

```sh
node scripts/research-ingest.mjs <url|path|-> --json    # source  -> deduped transcript + metadata
node scripts/research-map.mjs "<term>" "<term>" ...     # terms   -> prior art + where a new subject goes
node scripts/run-board.mjs claim|beat|check|lock|list   # this run -> visible to every sibling session
```

`research-ingest` exits **2** when the instrument failed and **3** when the source is
genuinely thin. Those lead to opposite next moves, which is why they are different
codes: a 2 is retried or routed around, a 3 is reported and the run stops.

`research-map` returns each hit's `file` from the bundle index. That string is the
subject's **address**. Bundles are nested and depth is dynamic, so a constructed path
writes a document into a folder no consumer walks - the same rule `deepen` workers and
`librarian` dispatches run on.

Neither of the first two decides anything. They put you in the neighbourhood; you still
open the file. The third decides nothing either - it makes a collision visible before
you cause it. Its exit **3** means CONTENDED, which is an answer and not a failure.

## Running beside a dozen siblings

This skill is now routinely run **a dozen at a time**, one source per terminal, against
one checkout. That is the intended mode, not an abuse of it - the front of the funnel is
the stage the scorecard keeps naming as weakest, and parallel sources are the only cheap
way to feed it. But every one of those sessions is a *writer*: it lands into shared
bundles, appends to shared ledgers, regenerates a shared index whose hash the catalog
covers, and commits on a shared branch. Run naively, twelve of those do not produce
twelve runs' worth of corpus. They produce interleaved appends that lose lines, an index
built over a neighbour's half-written subject, and commits that carry work nobody
reviewed.

Three rules make it safe, and they are worth stating as one idea: **read the board,
write only what you claimed, and take the lock for the few seconds where sharing is
unavoidable.**

**1. Announce yourself before you read anything.** The board is
`$(git rev-parse --git-common-dir)/run-board/` - inside the git common directory, so it
is shared by every worktree of this repo, can never be staged, and needs no `.gitignore`
line. Every run writes exactly one file there and reads all the others; there is no
shared document to append to, because a shared append is the race the board exists to
prevent.

```sh
node scripts/run-board.mjs claim --skill intake --source "<url>" --run <id>
node scripts/run-board.mjs list                      # who else is live, and what they hold
```

`claim` exits **3** if a live sibling is already mining the same source or already holds
a subject you named. Same source is the cheapest waste there is - two terminals paying
twice for one transcript and then racing to write one source note - and it is invisible
without the board because the ledger only learns about a source *after* it is mined.

**2. Claim a subject before you write in it, not after you decide to.** Add every
address you might land in - as soon as Phase 4 names it, not at Phase 7 - and re-check
before the write:

```sh
node scripts/run-board.mjs beat --run <id> --phase 6 --subject <domain/category/subject>
node scripts/run-board.mjs check --run <id> <path> [<path>...]   # exit 3 = a sibling holds it
```

A contended subject is **not** a stop. It is a different job: two runs adding techniques
to one golden path will collide on that file's `techniques:` list even though their
techniques are unrelated, so the second one either waits for the first to commit, or
writes its technique and takes the `content` lock for the golden-path line alone. Say in
the source note which you did.

**3. Serialize the three things that genuinely cannot be shared**, and nothing else,
with a named lock. A lock is an atomic file create with a TTL; it is breakable after 15
minutes, loudly, so a crashed session cannot deadlock the fleet.

| Lock | What it covers | Hold it for |
| --- | --- | --- |
| `index` | `build-index.mjs` + `build-catalog.mjs` + the two checkers | the regeneration, and nothing before it |
| `ledger` | appending to `librarian/sources/index.md`, `librarian/applied.md`, `SCORECARD.md`, `LESSONS.md` | one append |
| `commit` | `git add` + `git commit` + the HEAD verification | one commit |

```sh
node scripts/run-board.mjs lock index --run <id> --wait 600
node scripts/build-index.mjs && node scripts/build-catalog.mjs
node scripts/check-bundles.mjs && node scripts/check-skills.mjs
node scripts/run-board.mjs unlock index --run <id>
```

**Re-read every shared file inside the lock, immediately before appending to it.** A
ledger you read at Phase 1 is eleven runs out of date by Phase 9. This is the single
most common way parallel runs lose content, and it never fails loudly: the append
succeeds, and one line quietly ceases to exist.

Four consequences that follow from the above and are easy to get wrong:

- **Never switch the branch, ever.** A sibling did this on 2026-08-21 and every other
  session's working tree changed under it. If you need isolation, take a worktree
  (`git worktree add <short path> -b <branch>` - keep the path SHORT; the deepest bundle
  paths blow past the platform limit under a scratch prefix). The board follows you
  there for free.
- **Scratch is per run or it is a hazard.** Every clone, transcript and temp file goes
  under `<scratchpad>/<run-id>/`, and Phase 9 deletes *that* directory by name. A blind
  sweep of the scratch root deletes a neighbour's half-swept clone.
- **`git add -A` is a fleet-wide incident, not a local mistake.** With twelve live runs
  it is guaranteed to stage somebody's in-flight file. Stage new files by name, commit
  with a pathspec, verify in `HEAD`.
- **Do not regenerate to be helpful.** If the index is stale for files you do not own,
  that is the owning run's job and it holds the lock. Regenerate only after your own
  content lands, only under the lock, and only once.

Release the claim when the run ends - `release --run <id>` - or leave it to `gc`, which
reaps any record whose heartbeat is more than 45 minutes old. A run that ends without
releasing costs its siblings 45 minutes of unnecessary caution, so release it.

## The six outcomes

Rank a run by which of these it produced honestly, never by document count.

| Outcome | What it is | Where it lands |
| --- | --- | --- |
| **Applied** | Content that was A/B-tested against a managed project's seam and carries a verdict. Outranks Content: it is the only outcome that proves the corpus changes what a project does. | The project (a commit, an experiment record, or a simulation record under `.ai/`), an application document with `applied:` and `ab_verdict:`, and a row in `librarian/applied.md` |
| **Content** | A claim that survived corroboration and the strip test. | `knowledge/`, `skills/`, `practices/`, `memory/`, `scripts/`, `docs/` |
| **Currency** | The world moved under a claim we already publish. | `verified_on` / `refresh_by` on the affected application, or a scoped `/deepen` dispatch |
| **Lead** | Real, unproven, with a stated return condition. | `librarian/sources/<date>-<slug>.md` |
| **Already covered** | The corpus says it, and says it better. | The source note, as a catch |
| **Untriaged** | Extracted, reached the table, never picked. | The source note, in its own table |

**Untriaged is not declined, and the distinction is load-bearing.** A candidate the
operator never chose carries no judgment at all; filing it as a decline poisons the
decline ledger, which the next run reads as "somebody looked at this and said no" and
which Phase 11 promotes into a rule after three sightings. Record untriaged candidates
with their anchors so a later run does not re-derive them, in a table that says plainly
that nobody verified them.

A mixed-news roundup that yields nine already-covered catches, two leads and one clock
reset is a **good run**. Padding it into three half-corroborated techniques is how the
upper layers rot. Report the counts and let them be small.

## Read the source's class before its content

A source's class decides what its claims are *for*, and it is the cheapest prediction
available: it sets the expected yield, where in the source to look, and whether the
fetch budget is optional. **Read the class at Phase 2 and say the expected yield out
loud before the triage table**, so a small number reads as calibration rather than as
failure. Record the reading in the ledger; it is what makes run N+1 cheaper.

The full description of each class - what it is reliable for, where its yield hides,
and the failure it walks into - is [`references/source-classes.md`](references/source-classes.md).
**Read that file once the ingest tells you what arrived.** This table is the routing
index, not a substitute for it.

| Class | The discriminating question | Reliable for |
| --- | --- | --- |
| **second-hand survey** | is this a digest of other people's news? | *that* the world moved, nothing else |
| **first-party practitioner account** | did they build the thing they are describing? | what they did and measured (n=1) |
| ↳ *release walkthrough* | is it organised around one version's changes? | the stated failure modes - seek this out |
| ↳ *dialogue* | are two practitioners comparing their OWN systems? | their disagreements - each one is a discriminator already drawn |
| **second-hand practitioner listicle** | is it relaying vendor docs with some real pain? | where the vendor's rules moved |
| **second-hand practitioner review** | is it a demo of someone else's release? | that it shipped; the fetch carries the rest |
| **vendor release announcement** | is it the vendor's OWN post about its OWN release? | its numbers - the prose is the strip test's problem |
| ↳ *prediction report* | is it about a year that has not happened yet? | its cited measurements only - future tense is unstrippable, so the forecasts yield nothing |
| **practitioner build-walkthrough** | a personal tool they actually use daily? | the operating half only - see below |
| **paper aggregator** | a list of papers? | measurements in their protocol, not frameworks |
| **reference index** | is its VALUE the outbound links rather than its own text? | nothing itself - it is a bibliography, and the references are the source |
| **vendor repository** | a company's repo over a hosted engine? | its docs' rules page and its client's types |
| **research-model release** | open weights plus real inference code? | its prompt artifacts and its config |
| **app/tutorial aggregator** | a monorepo of example apps? | the operational periphery, not the apps |
| **operator dispatch** | no URL - a framing or a question? | whatever the sub-questions route to |

Four rules cut across every row:

- **Any row that arrives as a repository is mined from a clone, never from the ingest.**
  Five classes do - vendor repository, research-model release, app/tutorial aggregator,
  paper aggregator, and the build-walkthrough in repo form - and each states in its own
  vocabulary that the README is its least reliable surface. `research-ingest` on a repo
  URL returns exactly that surface. Clone it and sweep the tree (Phase 2b), and sweep it
  a second time for engineering worth reusing, not only for claims worth quoting.

- **A hybrid source's halves have opposite reliability, and one question separates
  them.** For the build-walkthrough: *is the creator describing what the tool does, or
  what happened to them while using it?* For any demo: **the segment it is proudest of
  is where its boundary is missing**, because relatability is uncorrelated with
  correctness. The demo half shows the solution and hides the problem; the operating
  half is a first-party account. Route per half, never per source.
- **Whether the fetch budget binds is a property of the class, not of the run.** Five
  runs disagree only because their classes did. First-party accounts, practitioner
  codebases and batches corroborate corpus-internally - three consecutive runs spent
  **zero** of three fetches and landed everything, and reaching for the web there is
  usually a sign the claim has no home yet. Reviews, listicles and papers are lossy
  pointers to a primary that states the constraints they omit: for those the fetch is
  not corroboration, **it is the extraction**. Decide which you are holding at triage.
- **Length is not yield.** A 3,000-word first-party talk has outproduced a 7,000-word
  roundup; the shortest source mined (1,565 words) produced a technique and an
  amendment. Five consecutive runs say the `--min-words` floor answers "is anything
  there at all" and nothing more. The corrective differs by class, though: a thin
  first-party account needs no help, and a thin *review* yields a lead and nothing else
  unless you spend the fetch.

**Batches are their own lane** - N sources mined as one run, with their own triage
signal (within-batch convergence, deduped by *author* not by source) and their own
economics. The lane is written up in
[`references/source-classes.md`](references/source-classes.md) § "The batch lane";
read it before ingesting more than one source.

## The strip test

An upper-layer document carries no product, model, company or tool name - enforced by
`scripts/check-bundles.mjs` for the words on its denylist, and by review for the rest.
A news source is made almost entirely of those names. So there is one question that
routes most findings on its own:

> Remove every proper noun from this claim. Is anything left that a team in another
> company could act on?

- **Something is left** -> it may become a technique or a golden-path correction, once
  corroborated. The vendor was the occasion for the rule, not the rule.
- **Nothing is left** -> it is an application, or it is a lead, or it is nothing. An
  application is where product names are allowed, and it is only writable against a
  tree you actually opened (see the cross-repo lane).

Run the strip test at extraction time, not after drafting. It is cheap and it kills the
candidates that would otherwise consume the corroboration budget.

## Corroboration - what a source may authorize alone

| Target | What the source alone can do |
| --- | --- |
| `_laws.md` (a law) | Nothing. Laws are the most cross-cutting thing here; they need convergence across runs, not a video. |
| Golden path, technique | Nothing. Needs a **primary source** (vendor doc, standard, paper, spec) fetched in-run, OR **training-data convergence** (you reach the same rule without the source in front of you), OR real code you read in a connected project. |
| Application | Only with a tree you opened. `verified_on` is the date YOU resolved its citations; `verified_against` may be written only by something that read the tree. |
| Currency signal | Yes, on its own. "A vendor shipped X" is exactly the class of fact a news source is reliable for, and it is a statement about the world, not about the standard. |
| Lead | Yes, on its own. That is what a lead is. |
| Golden path, technique - *via convergence* | Two independent sources, from different runs, reaching the same rule. This is the cheapest corroboration available and it costs no fetch, but it only exists if past runs wrote down what they saw. It is the reason the untriaged table is not bookkeeping. |
| `skills/`, `practices/`, `memory/`, `scripts/`, `docs/` | Judgment, no gate. These are ours; the bar is whether it would survive `CODEOWNERS` review. |

**A source that is contradicted is the best case, not a dead candidate.** Corroboration
is not a pass/fail gate on the source's wording - it is how the finding gets written. On
2026-08-21 a roundup said "take the highest precision tier your machine allows"; the
primary literature said the compression format dominates the nominal tier and that a
lower-tier variant can beat a higher one. The gap the source pointed at was real and the
rule it gave for filling it was inverted, so the technique was written against the
literature and is stronger for it. When a pick is contradicted, do not drop it: ask
whether the source located something true while explaining it wrongly, and if so write
the finding from the source that can authorize it. Say so in the note - a corrected
premise is the most reusable thing a run produces about a source class.

Four runs now say it more strongly than that: **a source that implements a good idea
badly is worth more than one that implements it well.** A tool that counted how many
newsletters carried a story was measuring promotion rather than corroboration, because
those newsletters relay each other wholesale - and the correction (record carriers at
*publisher* granularity) was the half the technique would not otherwise have had. A
correct source hands you a catch; a wrong one hands you the boundary. When a pick is
contradicted, that is the pick to keep.

Budget corroboration like `deepen` does: at most **3** web fetches for the whole run,
spent only on picked candidates, preferring primary and vendor documents over
commentary about them. A news video reporting on a paper is not the paper.

**Two classes are exempt, and the exemption is structural rather than generous.** For a
paper aggregator and a **reference index**, the referenced documents are not
corroboration for the source - they *are* the source, and the list is a bibliography.
A run-wide budget of 3 against a 200-entry index does not enforce discipline; it
enforces a 1.5% sample and then reports the result as if it were the source's yield.
For those two, the budget is **per reference and lives with the worker that reads it**
(~2 fetches each: the document, then at most one primary it points at), and the
*run-wide* discipline moves to the number of references admitted, which the ranking in
Phase 2c decides and the operator sees before a single fetch is spent.

**Tier sources; never count them.** Convergence means *independent* sources reaching
one rule, and most sources are not independent: a relay is downstream of the primary
it relays, so three relays agreeing with each other are one observation, and three
relays disagreeing with a fresher primary are evidence of the primary's *past* state,
not a vote against its current one. Rank by tier - standard or vendor document, then
repository or paper, then first-party account, then commentary - let the highest tier
present win a conflict, and record the conflict in the note instead of resolving it by
majority. The ledger already dedupes carriers at publisher granularity; this is the
rule that granularity was serving.

## Procedure

### Phase 0 - Bootstrap (idempotent)

- `librarian/sources/index.md` exists (the source ledger). Create if missing.
- `projects.json` exists at the repo root (**committed**) and `.machine.local.json`
  beside it (gitignored). Resolve them through `loadFleet()` in
  [`scripts/lib/projects.mjs`](../../scripts/lib/projects.mjs), never by reading either
  file directly. `projects.json` maps slug -> path RELATIVE to a machine root, plus the
  machines each project is checked out on; `.machine.local.json` supplies this machine's
  name, its root and its contributor id. A relative path names no private tree until a
  root is supplied, which is why only the second one is hidden. Domains are not in
  either: each project declares its own in its `.ai/manifest.yaml`. The prose half is
  [`librarian/projects.md`](../../librarian/projects.md).
- If the bridge is missing and the run needs it, ask for paths rather than guessing.
- **Claim this run on the board before reading anything else.** It costs one command and
  it is what makes the next eleven terminals safe:

  ```sh
  node scripts/run-board.mjs claim --skill intake --source "<url>" --run <id>
  ```

  Exit 3 means a live sibling already holds this source: stop and say so, or take a
  different source. Nothing after this point is safe to write without a claim, and a run
  that skips it is invisible to everyone else for its whole life.

### Phase 1 - Prove the instruments, then load memory

1. `node scripts/check-bundles.mjs`, then `node scripts/build-index.mjs --check`. A red
   gate means you are about to map claims against a corpus that does not parse. Stop.
2. `node scripts/librarian-scan.mjs --top 15` - the standing worklist. A candidate that
   reduces a measured attention point outranks one that does not, and this is the only
   tie-breaker in the triage that a script can check.
3. Read `librarian/sources/index.md`. **If this source was already mined, say so and
   stop** unless the operator wants a re-run; then read the prior note first, because
   its declines are the answer to half of what you are about to propose.
4. `node scripts/run-board.mjs list` - the ledger answers "was this mined", the board
   answers "is this being mined **right now**", and only the second one can see the
   eleven sessions whose notes do not exist yet. Read what the live siblings hold, and
   let it steer the run: a source whose obvious home is a subject two siblings are
   already inside is a source to route elsewhere or to mine for its other half. Say in
   the source note how many siblings were live and which subjects they held - that
   line is what makes a later collision legible instead of mysterious.
5. **Read the last row and the closing paragraph of
   [`SCORECARD.md`](SCORECARD.md), and say this run's declared focus out loud
   before Phase 5.** Phase 11 writes "next run's declared focus" at the end of every
   run; until v1.4.0 nothing read it, so four consecutive runs discovered their own
   instruction at Phase 11 - after shipping the triage table it was meant to shape -
   and each diagnosed a different proximate cause for the same zero. The focus is the
   one input that makes this skill improve across runs rather than merely repeat, and
   it costs one file read. If the focus does not apply to this source, say why in the
   scorecard row; that is a result, not a miss.

### Phase 2 - Ingest

```sh
node scripts/research-ingest.mjs "<url>" --json
```

**Look at the ingest's output before naming the class.** A word count is not evidence
that anything was read, and the dangerous reader failure is not the empty one - it is
the *confidently large* one, which clears every thin-source floor. A `words:` in the
tens of thousands over a document that should be a pamphlet, or a first screen that is
not prose, means the container was decoded rather than parsed. See § "Before any class:
check what CONTAINER arrived" in the reference.

**Then name the class and read its entry in
[`references/source-classes.md`](references/source-classes.md)** before extracting
anything. The ingest metadata usually decides it - the author field, whether the source
is a repo or a talk, how many voices arrived. That entry tells you where in this source
the yield hides, what it is reliable for, and whether you must spend a fetch; all three
change what Phase 3 is looking for. For more than one source, read § "The batch lane"
in the same file.

#### Phase 2b - If the source is a repository, CLONE IT. Always. No exceptions.

`research-ingest` on a repository URL returns **the rendered landing page**, which is
the README plus site chrome. That is not the source. It is the source's advertisement,
and every repository class in this method says so in its own words - the vendor
repository's marketing surface, the research release's method ad, the build-walkthrough's
tour half. **A run that extracts from a README has mined the one file in the tree
written to be quoted, and its findings will be quotes.** That is how a corpus fills up
with restated marketing.

So the ingest is the *trigger*, never the extraction:

```sh
git clone --depth 1 <url> <scratchpad>/<run-id>
git -C <scratchpad>/<run-id> log -1 --format=%H       # pin it; the note records the commit
```

The directory is named for **this run's board id**, never for the source, and never the
scratch root itself. Twelve concurrent runs share one scratch directory, two of them may
be mining the same organisation's repos, and Phase 9's cleanup deletes by name.

Then **sweep the tree before extracting a single candidate**, in this order - it is
ordered by yield density, which is close to the inverse of how prominent each part is:

1. **The operating documents.** `docs/`, `design/`, `spec/`, `*_SPEC.md`,
   `*_CONTRACT.md`, `RUNBOOK`, `owners-manual/`, `ADR/`, `CHANGELOG`. These are
   first-party practitioner documents with paid-for failure modes recorded as
   revisions, and they are usually the densest thing in the repo by an order of
   magnitude. A README is 2,000 words; these are routinely 15,000.
2. **The instrument and its rules.** A linter, a checker, a gate, an eval harness -
   whatever file *implements* a rule the README merely names. The README says the rule
   exists; this file says what the rule actually is, in a form that cannot hedge. When
   a source claims a contract with numbered rules, the checker that enforces them is
   the contract.
3. **The measurement.** `evals/`, `benchmarks/`, `ANALYSIS.md`, results tables, the
   test fixtures. A measured result with its protocol is the strongest thing a
   repository holds, and it is the part the README compresses into one adjective.
   **Read where it was refuted**, not where it held.
4. **The types and the config schema.** What an open client renders a closed engine
   with, the config file's full key set, the enum of states. These publish the real
   data model for free and cannot lie, because something compiles against them.
5. **The tests.** A test enumerates the cases the author believed in, and a test named
   after a failure is a failure mode somebody paid for.
6. **The README last**, as an index into the above and as the source of proper nouns
   you must then strip.

Say what you swept in the source note, with the commit, and record the honest word
counts on both sides - the landing page and the in-tree documents. A note whose
`words:` is a single small number over a repository source is a run that read the ad.

The tree is deleted with the rest of this run's scratch files at Phase 9, not before -
Phase 6 verification reads it, and Phase 7.5 may need it again.

**Read for reusable engineering, not only for claims.** A repository is the one source
class that carries *executable* knowledge, and the intake habit of hunting quotable
assertions leaves most of it on the floor. Sweeping for excellence is a different pass
from sweeping for claims, and it produces different candidates: a dependency-free
instrument worth porting into `scripts/`, a data shape worth stealing, a test strategy
worth copying, a failure taxonomy already enumerated, a config surface that solves a
problem one of our own projects has. Those land in `scripts/`, `practices/` and
`docs/` - the lanes the corroboration table calls "judgment, no gate" - and they are
often the highest-value thing a repository run produces. Ask of the tree the question
you cannot ask of a video: **what here is good enough to reuse, and what does it do
that we do worse?**

#### Phase 2c - If the source's value IS its links, the links are the source

Some repositories carry almost no knowledge of their own. An awesome-list, a curated
bibliography, a "papers we read" vault, a links section in a handbook: what it holds is
**a filtered set of pointers somebody paid attention to build**, and its own prose is a
one-line annotation per row. Mining that source by reading its README is not merely
incomplete, the way it is for a code repository - it is reading a library's card catalog
and filing a report on the catalog.

The tell is a ratio, and it is worth computing rather than eyeballing: **outbound links
to third-party documents, over the source's own word count.** A code repository has a
handful of links across tens of thousands of words. A reference index inverts that -
hundreds of links, a few thousand words, most of them link text. When the ratio inverts,
switch lanes.

**The failure this lane exists to end.** Past runs mined these sources by picking the two
or three references that looked most promising from their titles and reading those. That
is a 1.5% sample chosen on the weakest available signal - a title - and it discarded, by
construction, everything the curator had actually done work to include. The runs then
reported their yield as the source's yield. **Titles do not rank references**; a title
tells you a paper's topic and nothing about whether it measures anything, contradicts us,
or lands anywhere. The corrective is not "read more carefully". It is to stop sampling:
**enumerate every reference, rank the whole set against the corpus, and read the maximum
the run can afford in parallel waves** - explicitly accepting that most will return
`already covered` or `nothing`, because a cheap negative on a real reference is worth
more than a confident guess about an unread one.

Full procedure, worker brief, wave sizing and the stop rule are in
[`references/reference-waves.md`](references/reference-waves.md). Read it before the
first wave. The shape in five steps:

1. **Enumerate exhaustively, by instrument, never by reading.** Clone the tree (Phase 2b
   still applies - the index is a repository) and extract every URL from every file, not
   just the README: sub-lists, `docs/`, per-topic pages and the git history's removed
   entries all carry references. Dedupe by normalized URL, then again by *document* - a
   paper on arXiv, a PDF mirror and a blog summary of it are one reference. Report the
   honest total. A run that says "we found 47 references" over a tree holding 213 has
   already reproduced the failure at a larger sample size.
2. **Classify each reference by its own source class** (paper, vendor doc, first-party
   account, relay) from its URL and the curator's annotation. This costs no fetch and it
   is what makes ranking possible: a relay of a primary already in the set is not a
   second reference, it is a duplicate with a different domain name.
3. **Rank the whole set against the corpus, not against your interest.** One
   `research-map` call carrying every reference's terms at once - that is what the
   instrument is for. Score each reference on: does it map to a subject that
   `librarian-scan` says has attention points; is it a class that can *authorize*
   something (primary/paper) or only originate (relay); does its annotation claim a
   measurement, a negative result or a contradiction; and is it already in the source
   ledger. Rank descending, and **keep the whole ranked list in the source note** - the
   tail is the artifact that makes the next pass over this index cheap instead of a
   re-derivation.
4. **Cut waves, not a top-N.** A wave is 5-8 references read by 5-8 parallel workers,
   one reference each, each with its own ~2-fetch budget. Run wave 1 over the top band,
   read what comes back, then decide wave 2 *from the returns* - the first wave routinely
   moves the ranking, because a reference that came back with a measurement promotes
   everything the curator grouped beside it, and a band that returns eight catches
   demotes its whole cluster. Keep going while a wave is still returning something; the
   stop rule is a yield floor, not a fixed number of waves. Two or three waves over a
   large index is normal and expected.
5. **Merge serially, exactly like a batch.** The director holds every write; workers
   return proposals and touch nothing. Within-index convergence - two independently
   curated references reaching the same rule - is the strongest triage signal this lane
   produces, and it is available *only* because the sample was broad. Dedupe it by
   author, not by reference.

**The board matters more here than anywhere else in this method**, because one reference
index can generate more landings than a dozen video runs. Claim the subjects the ranking
implicates as soon as step 3 names them, before wave 1 dispatches, and heartbeat every
wave. A wave run unclaimed against a bundle two siblings are inside is the worst
collision this skill can produce.

**A reference index also carries one finding of its own, and only one**: what the curator
chose to include and what they left out. A bibliography is a stated opinion about a
field's boundary. When it converges with ours, that is corroboration for a boundary we
drew; when it does not, the gap is a lead worth more than most of the references. Record
it, once, and do not mistake it for the source's yield.

#### Then read, then clean up

Read the transcript (and, for a repository, the swept tree). This run's scratch files -
the ingest's text, the metadata, and any clone - are deleted at Phase 9, scoped to this
run's id, never as a blind sweep of the work directory, which races a parallel run
sharing it.

### Phase 3 - Extract candidates (cheap: no web, no file reads, no greps)

A news roundup is **segmented**: it is ten unrelated items in a trench coat. Split on
the segment boundaries and treat each as its own candidate, because they route
differently and the operator will want to pick across them, not accept the video.

Per candidate record:

- `title` - imperative, under 60 chars
- `claim` - one sentence, in the source's own terms
- `anchor` - `[HH:MM:SS]` or a quote under 20 words
- `strip` - what survives the strip test, or `nothing`
- `lane` - `K` knowledge / `S` skills / `P` practices / `M` memory / `T` tooling+docs / `X` project
- `shape` - `law` / `golden-path` / `technique` / `application` / `correction` / `currency` / `skill` / `practice` / `memory` / `script` / `lead`
- `effort` - `S` (a frontmatter line or two) / `M` (one document) / `L` (several) / `XL` (a subject, a bundle, a lane)

Extract 5-15. Drop only what has no plausible attachment anywhere in the registry.
Do **not** open bundle files yet - that budget belongs to what the operator picks.

### Phase 4 - Map for prior art (one instrument call)

```sh
node scripts/research-map.mjs "<term 1>" "<term 2>" ... --top 4
```

One call, every candidate's terms at once. Add `--deep` when the first pass looks
thin - it reads each document's `use_when`, which is the field written to be matched
on and which the index does not carry. Attach to each candidate its top prior-art hit
(`domain/category/subject`, with the technique that matched) and its **registry
impact**, from a closed vocabulary that maps onto the scan's weights:

`new-subject` - `new-technique` - `corrects-claim` - `fills-stack-gap` - `dates-application` - `resets-clock` - `new-law` - `none`

`none` is honest and common. It is also the value that should make you ask whether the
candidate belongs in `skills/` or `memory/` rather than in a bundle.

**The instrument sees one branch.** It reads the working tree, so bundles that exist on
other branches are invisible to it and it will report "no prior art" over a domain a
sibling branch covers in depth. It now prints which bundles it scanned and on which
branch; read that line. Before trusting an empty result for a domain this branch does not
carry, run `git branch -a` and check. The corpus is bigger than any one checkout.

**It also sees one moment.** The branch warning covers other branches; it cannot cover
commits that land on *this* one after you read the worklist. On 2026-08-27 a parallel
session landed a new subject in the same bundle mid-run, and Phase 4's first map would
have mis-homed two candidates. In a shared checkout, re-run the map - or at least
re-read the bundle's subject list - before Phase 6's homes are final.

**And it cannot see the future at all**, which is the failure the board exists for: a
sibling's subject is not in the index until that sibling commits, so the map reports a
hole over ground another terminal is standing on. As soon as the map names a home,
claim it and check it:

```sh
node scripts/run-board.mjs beat --run <id> --phase 4 --subject <domain/category/subject>
```

A `new-subject` impact over a domain a live sibling holds is the one to distrust hardest.
Read that sibling's claim, and prefer an amendment inside their subject over a competing
one beside it.

**A total empty over banned vocabulary is not evidence of anything.** The upper
layers may not carry product, framework or scaffold names — `check-bundles.mjs` enforces
it — so any query built from those names returns zero by construction. It measures the
purity gate, not the corpus. On 2026-08-31 a run concluded the corpus owned no material
on agentic workflow selection from a grep for two scaffold names, re-ran the same grep as
verification, reported it as confirmed, and was refuted by two later lanes against a
subject holding 1,794 annotated trajectories. **Map on concepts; never let a proper noun
be the query that decides an absence.**

**A near-empty is more dangerous than a total empty.** The instrument matches slugs, so
it cannot see a concept that lives inside a document's prose. Zero hits usually means a
real hole. Two or three weak, semantically unrelated hits mean one of two very different
things - a hole, or a **seam**: the concern already exists inside a subject under a
different name, and what is missing is the boundary rather than the material. On
2026-08-22 a candidate mapped to three spurious matches and turned out to be a seam
inside a nine-technique subject whose golden path already produced the thing in
question. Read the top prior-art subject's golden path before believing a near-empty,
and prefer writing the boundary over writing a duplicate.

### Phase 5 - Triage with the operator (the cheap steering gate)

```
#  Lane  Shape      Eff  Title                            Prior art (subject)        Impact           Anchor
1  K     technique  M    Separate weights from a license  se/llm-agent/model-routing new-technique    [04:12]
2  K     currency   S    Context-window claim moved       se/.../prompt-assembly     resets-clock     [11:40]
3  X     applicat.  M    Personas already does this       -                          fills-stack-gap  [17:05]
```

Then ask: **"Which should I verify and (if real) land? (numbers / all / none / leads-only)"**

**Carry an altitude on every row**, and prefer the highest altitude the corroboration
supports: `law` (a convergence across runs, provider-portable, clock-proof) /
`doctrine` (a design stance) / `technique` / `dated fact` (a number or vendor
behaviour with a shelf life). Dated facts are not lesser - they are the corroboration
the upper layers need - but a run that lands ONLY dated facts must say why nothing
higher was earned, and the cross-run convergence check is mandatory: when this run's
finding and two prior runs' findings share a root, the landing is the root, proposed
at law or golden-path level, with the numbers cited into it. The operator's standing
critique (2026-08-25): low-level numbers and per-provider practices age in months;
the synthesis step must come from the skill, not from the operator.

**Carry your own read on every row**, in its own column: `real gap` / `partial` /
`likely catch` / `thin`. It is the column that makes the gate work - on 2026-08-22 the
operator took four rows marked real and skipped three of four marked likely-catch, which
is a better allocation than either party would have reached alone. Withholding the read
to seem neutral just moves the guesswork to the person with less context.

Say the expected yield for the source class out loud before the table, so a small
number reads as calibration rather than as failure. Flag any candidate that matches a
prior run's decline or a banked lead as `reconsider?` with the earlier reason.

Only picked candidates go deep. If the run is unattended, **only rows whose own read
is `real gap` advance**; pick among them with the registry impact as the tie-breaker
and say which you picked and why. `partial` and `likely catch` rows are recorded
untriaged with their anchors - unverified, never declined - because an unattended run
should spend its verification budget where the corpus can change and leave the
judgment calls to a person (operator rule, 2026-08-28).

### Phase 6 - Verify the picks

1. **Read the actual file** named by `research-map`'s `file`. Slug overlap said
   "neighbourhood", not "same claim". Golden paths in this corpus routinely hedge
   better than their techniques do, and a correction written against a summary is a
   phantom fix - `deepen` names this its dominant failure mode and it is inherited here.
2. **Ask where in the subject's own pipeline the claim happens.** Most real findings in
   a mature corpus are not missing opinions, they are missing *stages*: a decision the
   documents leave to a default because no technique sits at the point where it is
   made. All four findings on 2026-08-22 had this shape - the decision to retrieve at
   all, the promotion of a memory into a capability, the step a limit counts on, what a
   provenance check settles. Walk the subject's stated pipeline, name the point the
   source's claim lands on, and check whether anything owns it. A subject that is
   thorough from stage two onward is exactly where a missing stage one hides.
3. **Hunt where a document declares its own completeness.** "The subject owns two
   flows that are mirror images of each other", "the three cases where strictness is
   still correct", "both naive policies fail" - an enumeration is a claim, it invites
   exactly one question, and asking it is cheap. Two of the strongest findings across
   four runs came from a source demonstrating a case an enumeration did not contain.
   The corpus writes these claims in golden-path openings and in technique section
   headings; they are the highest-yield thing to read once a candidate has a home.
   **A denial is an enumeration too: where a subject explicitly denies a symmetry,
   check whether it denied too much.** On 2026-08-27 a subject insisted its two
   pipelines are "not mirror images" - correct, and that framing had hidden for months
   that their *doors* do mirror and only one of the two had ever been built.
4. **Find what the subject mentions in one place and measures in another.** The third
   hunt, beside the missing stage and the enumeration, and the one that survives a
   corpus getting mature: a real finding is often not an omission but an **asymmetry**.
   On 2026-08-27 a subject named the human reviewer as its bottleneck in one technique's
   prose and modelled the machine bottleneck in another with four measures, distribution
   discipline and an ordered demand-reduction section - so it sized its first server
   against machine-paced arrival and routed the whole output into a second server whose
   rate was never written down. **Neither the slug map nor a summary can see this**: two
   files that both "cover" a concept score identically, and only opening both reveals
   that one gets a model and the other gets a sentence. When a candidate looks
   already-covered because some file says the words, ask which file *measures* it.
5. **Read the neighbours, not just the gap.** A candidate phrased as "X is missing"
   aims you at the half that is not built and away from the half that is, which is
   where a real defect is likelier to sit. Read the sibling techniques and one
   application before writing the finding up.
6. **Name the home, and expect it to be contested.** A finding whose home is obvious was
   probably already covered. The interesting ones sit between subjects, and picking
   wrong misfiles the technique where nobody looking for it will look. Read the
   candidate subjects' own boundary statements - this corpus states them explicitly, in
   the golden path's opening - and choose the subject whose stated job the finding
   answers, not the one whose slug matches. When two subjects describe the same
   boundary from opposite sides, say so in both notes rather than writing it twice.
7. **Corroborate** per the table above, inside the 3-fetch budget.
8. **Drop honestly.** A picked candidate that resolves to already-covered is a catch,
   not a failure, and it goes in the note so nobody proposes it again.

### Phase 7 - Land what survived

Route by shape. Every content change is gate-clean before it is committed.

| Shape | Where it lands | The rule that governs it |
| --- | --- | --- |
| `technique` | `<subject>/techniques/<slug>.md` + the owning golden path's `techniques:` list | Bidirectional or it does not exist. Cite `laws:` that already have anchors; do not invent one. |
| `golden-path` correction | the subject document | Keep the file's prior voice. The corpus reads as one author. |
| `application` | `<subject>/applications/<stack>--<technique>.md` | `verified_on` is today only if you resolved its citations today. `verified_against` only if you opened the tree. |
| `currency` | the affected application's frontmatter, or a `/deepen` dispatch | A re-checked citation MUST move `verified_on`, or the corpus ages while the work says it did not. |
| `skill` | `skills/<name>/` | Bump `version` in the same change; append to `LESSONS.md` after the run. |
| `practice` / `memory` | `practices/<slug>/`, `memory/<kind>/<slug>.md` | ASCII only in these lanes. One idea per file. |
| `script` / `docs` | `scripts/`, `docs/` | Zero dependencies. Assert the instrument before the result. |
| `law` | `_laws.md` | Only on convergence across runs. Record the lead; do not write the law. |
| `amendment` | inside an existing technique | The case a well-forged technique does not cover. In a mature corpus this is often the higher-yield move and it is always the cheaper one - add the section, keep the file's voice, do not mint a competing technique beside it. |
| `lead` | the source note | With a return condition, or it is not a lead, it is a shrug. |

**When a rule inverts across bundles, name the discriminator - do not link.** Cross-bundle
links are forbidden, and the situation is not a contradiction to resolve but a boundary to
state: the same interaction pattern can be correct in one domain and disqualifying in
another, and what the reader needs is the question that tells them which side they are on.
State it in prose on the side you are writing, and record in the subject note that the
other bundle holds the opposite technique, so a later run recognises the shape instead of
re-litigating it.

`XL` is specified, never half-built: write the spec or the handoff and link it from the
source note. Two things make the difference between a spec somebody can execute and a
note nobody acts on:

- **Fold the fragments in.** A subject-sized gap usually arrives as several small
  candidates from the same source that each looked like a standalone technique. Absorb
  them into the spec as its proposed techniques rather than banking them separately -
  four fragments in one dispatchable document beat four leads that will be re-derived
  one at a time.
- **Write it as the engine's input, not as prose.** Name the bundle, the category, the
  proposed technique slugs with the decision rule each must carry, the boundaries it
  must NOT absorb, and the open questions the drafter has to decide rather than
  discover. Point at any instance of the gap that already exists in a tree somebody can
  open - that is what makes the dispatch cheap.

Say plainly why it was proposed rather than written. A spec that does not argue its own
`XL`-ness reads as an excuse.

**Then execute it in the same session.** A spec is proposed rather than written because
one author's account is thin evidence for a whole subject - not because the work should
wait. The evidence that made it `XL` is loaded *now*: the neighbours are open, the
boundary is argued, the placement is verified. Ending the session with a banked spec
throws that context away, and the next session pays to rebuild it before it can start
(operator rule, 2026-08-28). So once the spec is written and the operator has picked
it - or, unattended, once it is the run's highest-impact row - **dispatch one forge
worker on it before Phase 9**, and stay in the director's chair:

- The worker reads `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`,
  the spec, and every neighbour the spec names, in that order; drafts expert-first with
  the spec's listed primaries as its web budget; reconciles read-only against any
  connected tree the bridge names; runs the gate on its own subject; runs no git.
- The intake session reviews the diff, never the report: gate, purity grep against the
  source's own vocabulary, one cited line opened, `use_when` on every technique, the
  taxonomy entry appended not reordered. Then regenerate index and catalog, update the
  bundle tables, mark the spec `EXECUTED` with the overrides recorded, write the subject
  note, and commit with a pathspec - the forge's own Phase 4, run by this skill.
- `--spec-only` banks the spec without forging; use it when the operator says hold, or
  when the spec spans more than one subject, which is `/forge`'s job and not one
  worker's.

The forge worker is dispatched exactly once per spec, and it is the only agent this skill
dispatches **in the course of mining one document**. A reference index is not one
document - it is a bibliography, and Phase 2c dispatches a pool of reader workers across
its waves. The rule those workers inherit is the one that makes any of this safe:
**workers return proposals, the director writes.**

**Verify every structural claim in the spec against the authority, not against a count.**
A dispatch that names the wrong category sends a worker to build in a folder the tooling
rejects. On 2026-08-22 a spec asserted a category was flat and under its cap, from a
subject count; the category was already nested, and the placement rule forbids a category
holding both subjects and subcategories. Read `taxonomy.json` - it is the authority on
placement - and state the resolved path and the resulting link depth in the dispatch.

**Tell the worker to override you and say so.** Both workers dispatched on 2026-08-22
overrode their briefs, both were right, and both explained the reasoning in their report:
one rejected a placement preference because the neighbouring subjects' stated scopes
excluded the work, the other corrected the category error above. A brief that reads as
non-negotiable buys compliance with a mistake. Ask for the override and the argument.

**Review the diff, never the report.** Run the gate yourself, grep the upper layers for
purity against the source's own vocabulary (a game-design source is made of game titles;
a vendor talk is made of product names), confirm `use_when` on every new technique, and
open one cited line to see that it says what the citation claims. The check is the point,
not the result.

**Check the board immediately before the first write, not at Phase 4.** Minutes have
passed and siblings have moved:

```sh
node scripts/run-board.mjs check --run <id> <every file you are about to touch>
```

Exit 3 on a *technique* file you are creating is nearly impossible and means somebody is
writing your document. Exit 3 on a *golden path* or a *taxonomy* entry is expected and
routine, because those are the shared spines every landing has to touch: take the
`content` lock, re-read the file, make your one-line edit, unlock. Never hold a lock
across drafting - only across the edit.

After content changes, regenerate **under the `index` lock**, in this order and never the
reverse - the catalog's hash covers the index, and a regeneration that runs while a
sibling is mid-write bakes their half-written subject into an artifact you then commit:

```sh
node scripts/run-board.mjs lock index --run <id> --wait 600
node scripts/build-index.mjs && node scripts/build-catalog.mjs
node scripts/check-bundles.mjs && node scripts/check-skills.mjs
node scripts/run-board.mjs unlock index --run <id>
```

**The lock serializes writers; it does not give you a private tree.** A regeneration
under the lock still reads every uncommitted file in the checkout, including siblings'.
On 2026-08-31 the regenerated index referenced a sibling's uncommitted technique six
times, and committing it would have baked their WIP into a hash in `HEAD` under this
run's name. So after regenerating, **check whether the artifact describes content that
is not in `HEAD`** — `git grep <their-slug> HEAD` — and if it does, commit your own
content and leave `index.json` and `catalog.json` uncommitted. A stale index in a shared
checkout is a known, self-correcting state; a committed hash over somebody's half-written
subject is not.

If the gate goes red inside that lock on a file you do not own, **unlock first, then
report it**. Holding the lock while you investigate somebody else's breakage stalls
eleven terminals; the red gate is theirs to fix and yours to name.

### Phase 7.5 - Apply and A/B test (mandatory per landed technique or amendment)

Phase 7 made the corpus say something new. This phase asks whether a project would be
better off if it did what the corpus now says - and answers by trying, not by asserting.
It runs once per landed `technique`, `golden-path` correction or `amendment`; a run
that lands N of those owes N rows in `librarian/applied.md`, each with a mode and a
verdict, or a stated reason in the scorecard for every row it does not owe.

**1. Find the seam.** Resolve the fleet with `loadFleet()` and keep the projects whose
declared domains include the finding's bundle. Prefer a project whose
`.ai/registry-map.json` already joins a context to the finding's subject (build it with
`node scripts/build-registry-map.mjs` if the project is registry-wired and the map is
missing); otherwise grep the tree for the decision the technique governs. The seam is
the `file:line` where that decision is currently made - or made by default because no
code owns it. Record it in the project's `.ai/applied.jsonl`, never in `librarian/`.
A technique with no seam in any managed project is not wrong, but it is **unapplied**,
and the row says so with the return condition "when a project grows the seam".

**2. Choose the highest reachable mode, and say why not the one above it.**

| Mode | What A and B are | What the verdict is read from | Reachable when |
| --- | --- | --- | --- |
| `code` | the seam as it is (A) vs the seam with the technique applied (B), behind a flag, a branch, or a worktree | the project's own gate, a metric the project already emits, or a before/after run of the same inputs | the change is a few readable lines, the project has a gate or a metric that can see the difference, and the tree has no foreign WIP in the files touched |
| `experiment` | the same inputs run twice through a harness that does not change product code - a script, an eval slice, a replayed session, a dry-run of the hook against recorded actions | the harness's output, counted with its predicate | the technique's effect is observable without shipping it: hooks, gates, prompts, thresholds, routing rules |
| `simulation` | three concrete cases pulled from the tree or its history - a real incident, a real PR, a real failing run - walked under policy A and policy B, one paragraph each, with the predicted outcome and **what would falsify the prediction** | your own reasoning, labelled as such | nothing above is reachable in this run: no gate can see the effect, the seam is in a tree you may not edit, or the cost of the experiment exceeds the run |

A simulation with three cases from a real tree beats a code A/B against a toy. A
simulation with invented cases is an opinion and does not count as applied.

**3. Record the verdict in a closed vocabulary**, inherited from the sweep lane's
measured Before/After rule: `better` / `not-better` / `unmeasurable`.

- `better` -> Phase 8 ships it (code) or files it as the project's next change
  (experiment, simulation), and the application document carries `applied: <mode>`
  and `ab_verdict: better`.
- `not-better` -> **a rejection, and the most valuable row in the ledger.** The
  technique is not deleted; it gains an amendment stating the condition under which
  it did not hold, written from what the seam showed, and the row names the seam class
  so the next run does not re-run the same test. Two `not-better` rows on one technique
  from different projects demote it to a lead.
- `unmeasurable` -> stays applied at the mode reached, with a return condition naming
  the instrument that would make it measurable. A run may not report `unmeasurable`
  without naming that instrument.

**4. Write the application document** the way Phase 8 already requires - you opened
a tree, so `verified_on` and `verified_against` are facts - and add two frontmatter
lines: `applied: code|experiment|simulation` and `ab_verdict: better|not-better|unmeasurable`.
The body carries what A and B were and what was read; the seam's `file:line` only if
the project has made that code public, per Phase 8 step 7.

**5. Append the row** to `librarian/applied.md`: date, technique slug, project slug,
mode, verdict, return condition. Slugs and dates only. This ledger is what `/intake
apply` reads to find techniques that have never been applied, oldest first, which is
the backlog the wiki has been quietly accumulating.

**Budget.** One project per finding per run; the highest mode reachable; at most the
effort of the landing itself. A finding whose apply step would cost more than its
landing is still owed a `simulation` row - three real cases take twenty minutes and
that is the floor, not an excuse.

### Phase 8 - The cross-repo lane (default for `code` and `better`; confirm before editing)

A finding can land in the registry AND in a project that consumes it. That second half
is a different repository with its own review, so it is gated separately and never
assumed. Phase 7.5 decides *whether* a project change is warranted; this phase governs
*how* it is made.

1. Resolve the project with `loadFleet()` from `scripts/lib/projects.mjs`. Do not guess a path.
2. Confirm with the operator before touching a project tree at all.
   An operator's triage pick that names the project ("with impact on X") *is* the
   confirmation - do not ask twice. It confirms the lane, not the row: a named project
   was still declined at the gate on 2026-08-28.
3. **Pair the proof before the commit - at any scale, but never at none.** A registry
   technique is a claim about a standard; a change to a connected project is a claim
   that the technique *improves that project*, and the second claim is not evidence
   for itself. Before any cross-repo commit, run a **paired comparison** on the tree
   and record it in the application document under a `proof:` field.
   - **Name the measurable first** - the number the technique says will move: a
     split, a rate, a latency, a count of violations, a token cost. No measurable, no
     commit; a change whose effect cannot be named is a lead, not a landing.
   - **Prefer A/B: the same input through both arms**, with and without the change,
     on the same instrument. Any scale is admissible - one prompt, one fixture, one
     session - as long as both arms exist and the arm count travels with the number
     (the `count-carries-predicate` law). The 2026-08-27 playground that measured a
     channel split 67/33 was an in-run A/B at n=1, and it decided the landing.
   - **Fall back to before/after only when a control is impossible**, and then under
     the rules the corpus already holds for that shape
     (`adoption-measurement/before-after-outcome-pairing`): the same instrument on
     both sides, the change instant fixed, and **never invent the missing half** - a
     missing baseline is a `no-before` status, not a cohort average.
   - **Write the status from a closed set**: `ab-paired`, `before-after`,
     `structural-only` (step 6 found the structural fact and no behavioural arm was
     runnable), `unproven`. `unproven` does not commit: the diff stays uncommitted
     or goes to a branch, and the note says what proof would take.
   - **A negative proof is a landing too.** Two arms that measure no difference are
     the application's most useful sentence - the reader is deciding whether to copy
     the technique, and "it did not move X here" is worth more than a bookmark.
   The proof measures the *impact* on this tree; the structural fact in step 6
   measures whether the tree *confirms the standard*. They are different claims, and
   an application may carry either without the other - but a cross-repo commit needs
   the first.
4. Commit atomically **with a pathspec** on the project's default branch - the fleet
   has one owner and one machine, so a branch-and-PR round trip protects nobody (see
   the single-owner doctrine in memory). The two exceptions: the tree has another
   session's uncommitted work in files you touch, or the change is larger than a few
   lines a reviewer can read in the diff - then a branch, and say why. **Never push**
   from a run; the operator pushes when they have read the diff.
5. The registry-side artifact of a project change is an **application document**: you
   opened a real tree, so you are one of the few things allowed to write `verified_on`
   and `verified_against` truthfully. Write them, and write the `proof:` status from
   step 3 beside them.
6. **Look for the structural fact that confirms or refutes the technique, not just for a
   place to point at.** An application whose content is "here is where this happens" is
   a bookmark. The valuable one reports something the tree's *shape* says about the
   standard - and the strongest form is negative. On 2026-08-22 a technique claimed one
   term of a four-term model is the one nobody can set; the tree turned out to carry a
   module context for every other term and none for that one, because nothing in a
   codebase can own it. Nobody designed that; it fell out of the structure, and it is
   better evidence than the code the run had just added. Ask what the tree could not
   have been built to prove, and whether it proves it anyway.
   **The verdict being "no" does not cancel this step - it is often what creates the
   fact.** On 2026-08-27 the consumer assessment came back do-not-adopt, and the tree
   turned out to hold exactly two destinations for the input in question, both
   disqualified by the technique's central rule, which nobody had designed. A negative
   application built from that is better evidence than an adopting tree would have
   given. Write it.
   When the technique is a *contract*, the structural check has a specific shape:
   **enumerate the CALLERS of the optional half.** A compiler no call can skip proves
   only the mandatory half - on 2026-08-27 the text half of a two-channel contract was
   enforced that way while the image half rode an optional field, so production had run
   text-only for weeks beside a playground that measured the split 67/33.
7. **Write what the realization CANNOT do.** A stack that judges rather than measures
   should say so in the application, because the reader is deciding whether to copy it.
8. Never copy a project's paths, repo names or internals into a published registry
   file. The application layer may cite code the project has chosen to make public;
   `librarian/` and the upper layers may not cite it at all.

### Phase 9 - Persist

Everything in this phase except the source note and the subject notes is an **append to
a file every sibling also appends to**. Take the `ledger` lock once, re-read each file
inside it, append, unlock - all of it in one short hold. A ledger read at Phase 1 is
stale by now, and appending from that stale read silently deletes whatever landed in
between.

```sh
node scripts/run-board.mjs lock ledger --run <id> --wait 600
#   re-read, append: librarian/sources/index.md, librarian/applied.md, SCORECARD.md
node scripts/run-board.mjs unlock ledger --run <id>
```

The source note and the subject notes are yours alone (`<date>-<slug>.md`,
`<domain>/<subject>.md`), so they need no lock - except a subject note a sibling also
touched this session, which is an append like any other. Delete this run's scratch
directory **by its run id**, never by sweeping the scratch root.

- **Source note** `librarian/sources/<YYYY-MM-DD>-<slug>.md`: frontmatter (`source`,
  `kind`, `url`, `title`, `author`, `words`, `extracted`, `accepted`, `declined`,
  `leads`, `already_covered`, `untriaged`, `dispatched`, `run_id`, `siblings`), then one
  block per candidate with its outcome and, for declines, the reason. `siblings` is how
  many runs were live on the board when this one started, and it is the field that
  explains, six weeks later, why two notes from one afternoon disagree about what the
  corpus contained. A decline nobody wrote down gets re-proposed
  every run forever.
- **Source ledger** `librarian/sources/index.md`: one line per mined source. This is
  what makes "already mined" a one-second check next time. The source note's
  frontmatter also carries `applied: <n>` and `shipped: <n>` beside `accepted`.
- **Applied ledger** `librarian/applied.md`: one row per Phase 7.5 test (technique,
  project slug, mode, verdict, return condition). The unapplied backlog is every
  technique in the index with no row here.
- **Scorecard** `.claude/skills/intake/SCORECARD.md`: one row per run with the five
  stage counts - research (sources), extract (candidates), test (picks verified),
  apply (rows, by mode), ship (project commits) - and the reason for any zero in the
  last two.
- **Subject notes** `librarian/subjects/<domain>/<subject>.md` for every subject
  touched, same shape `librarian` writes.
- **Leads** carry a return condition. "When the model is actually released", "when a
  connected project adopts it", "when a second independent source says it".
- Public-safe, like every note in that vault: slugs, scores and dates. Never a
  consumer's paths.

### Phase 10 - Commit

- **Direct to `main`, with a pathspec.** Since the 2026-08-23 single-owner redesign
  the registry commits routine work straight to `main`; the gates (`check-bundles`,
  `check-skills`, `build-index --check`) are the review, and the operator pushes after
  reading the log. A branch is for a run whose diff is too large to read in one
  sitting or that the operator asked to hold back - not the default.
- **Take the `commit` lock, and hold it for the commit only.**

  ```sh
  node scripts/run-board.mjs lock commit --run <id> --wait 600
  git add <your new files by name>
  git commit -m "..." -- <your paths>
  git grep <slug> HEAD -- <path>                  # verify inside the lock
  node scripts/run-board.mjs unlock commit --run <id>
  ```

  Git's own index (`.git/index`) is a single shared file: two concurrent `git add`s
  produce `index.lock` errors at best and a commit carrying a sibling's staged work at
  worst. The lock costs seconds and removes the whole class.
- **Check for parallel sessions before touching the tree** - `run-board.mjs list`, plus
  `git status --short` for anything the board does not know about (an operator editing
  by hand is not on the board). This checkout is routinely shared: on 2026-08-21 another
  session switched the branch out from under this one mid-run, and on 2026-08-23 a
  directory-wide `git add` swept a sibling's in-flight instrument into a commit. Never
  switch the branch. If a branch is needed after all, take it as
  `git worktree add <short path> -b <branch>` - keep the path SHORT, the deepest bundle
  paths blow past the platform limit under a scratch-directory prefix, and the board
  follows you into the worktree because it lives in the git common directory.
- **Commit with a pathspec**: `git commit -m "..." -- <your paths>`. A worktree isolates
  the checkout but shares the object store and the branch namespace, and a pathspec-less
  commit still takes whatever is staged.
- **`git add` your NEW files first, by name.** A pathspec commit only sees paths git
  already knows, so every new document - the technique, the application, the source
  note, the subject note - fails the commit with `did not match any file(s) known to
  git` until it is staged. Stage them explicitly, never with `-A`, then commit with the
  pathspec. This bites once per run and the error is easy to misread as a bad path.
- Treat any modified file you did not touch as live WIP. Never `git add -A`.
- Close by verifying each shipped artifact is in `HEAD` (`git grep <slug> HEAD -- <path>`),
  **inside the lock**, not by trusting that the commit command succeeded. A parallel
  session can rewrite history and drop your content back into the working tree, where the
  gates still pass. Verifying after the unlock re-opens exactly that window.
- **Release the claim when the run ends**: `node scripts/run-board.mjs release --run <id>`.
  A record left behind makes every sibling cautious about subjects nobody is holding for
  the next 45 minutes.

### Phase 11 - Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the operator.
The shape is the one every shared skill under `skills/` runs (the `skill-reflection`
clause); this file is not stamped by that machinery because it lives under
`.claude/skills/`, so the clause is restated here and kept in step with
`docs/skill-clauses/skill-reflection.md` by hand. Be honest about volume: most runs
produce nothing beyond lane 0. An empty reflection is a valid result; a forced lesson
is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry
(occasionally) / a redesign proposal (rare).

`SCORECARD.md` and `LESSONS.md` are shared append targets like any ledger: take the
`ledger` lock, **re-read the file inside it**, append, unlock. Twelve runs reflecting at
once onto one scorecard is where the funnel measurement quietly loses rows, and a lost
row is worse than no row - it makes the weakest-stage reading wrong rather than absent.

**Lane 0 - the scorecard, every run, no exceptions.** Append one row to
`SCORECARD.md`: version used, date, source slug, and the five stage counts -
`research` (sources ingested), `extract` (candidates), `test` (picks verified),
`apply` (rows by mode, e.g. `1c/0e/2s`), `ship` (project commits). A zero in `apply`
or `ship` carries its reason in the row. Then read the last ten rows and name, in one
line under the table, **the stage the funnel is losing most at** - that stage is the
next run's declared focus, and the next run's row says whether it moved. This is the
mechanism by which the pipeline is mastered rather than merely repeated: the funnel
is measured, the weakest stage is named, and the method edits (lane 2) are aimed at
it instead of at whatever the last run happened to notice.

**Lane 1 - PROJECT learnings** (what the next session in a managed repo needs).
Anything Phase 7.5 or 8 learned about one project - where its seam is, which gate can
see which effect, what it has no instrument for - goes to that project's
`.ai/applied.jsonl` and its own overlay, never into this file or into `librarian/`. A
project's bytes in a shared method are what made the fleet's skill copies diverge.

**Lane 2 - METHOD learnings** (what would improve this skill for every source and
every project):
1. If nothing generalizes beyond this run, stop here.
2. Append to `LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <source slug>` followed
   by `- ` bullets. Record the version the run **used**, never a bump target. Wrap a
   bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are
   not applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied
   edit: patch for wording, minor for a step or a prompt refinement, major for a
   methodic redesign. A lesson that the scorecard has confirmed three runs running is
   a rule this file carries; until then it stays a lesson.
4. Ask the operator once, batched, why declined picks were declined. A decline reason
   seen three times is a rule this file should carry.
5. Commit the skill's files in their own commit with a pathspec, after
   `node scripts/check-skills.mjs` passes and under the `commit` lock.
6. **A method edit is the one change a parallel fleet cannot absorb quietly.** Eleven
   sessions are reading this file right now, from the version they loaded at their own
   Phase 0. Bump the version, say in `LESSONS.md` what a mid-flight run should do about
   it (usually: nothing, finish on the version you loaded), and never edit `SKILL.md`
   from two runs in the same afternoon without one of them reading the other's diff
   first - the board makes that visible if you claim
   `--path .claude/skills/intake/SKILL.md`.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves
this method, a lead proposes knowledge for a bundle. Intake IS the lane that turns leads
into knowledge, so a domain observation from reflection is filed as a lead in the source
note with a return condition - not landed from the reflection step, which has no
corroboration behind it.

## Anti-patterns

- **Letting a video author an upper layer.** The one failure that damages the corpus
  rather than just wasting a run.
- **Mining a repository at its README.** The ingest returns the landing page; the
  landing page is the one file in the tree written to be quoted. Clone it (Phase 2b),
  sweep the operating documents, the instrument, the measurement and the types, and
  read the README last. A repository note whose `words:` is one small number and whose
  body cites no file from the source's tree is this anti-pattern with a frontmatter.
- **Reading a tree only for claims.** The instrument, the schema, the test strategy and
  the failure taxonomy are the half that a quote-hunting pass never sees, and they are
  the half that lands in `scripts/`, `practices/` and `docs/`.
- **Landing a technique and walking away.** A technique with no `librarian/applied.md`
  row is a wiki page; a run that lands three and applies none has enriched a wiki.
  The scorecard row makes this visible; do not make it normal.
- **Simulating with invented cases.** Three cases from a real tree or its history, or
  it is an opinion with a table around it.
- **Reporting `unmeasurable` without naming the instrument** that would have measured
  it. That word is a return condition, not a shrug.
- **Padding the findings list.** Nine catches and one lead is a result. Report it.
- **Proposing what the bundle already says.** Phase 4 exists to prevent this; skipping
  it to save a second costs a whole verification round.
- **Constructing a subject path** instead of using the index's `file`.
- **Writing `verified_on` for a tree nobody opened.** That is the one field whose only
  value is that it is a fact.
- **Treating a currency signal as a content gap.** "The world moved" is a clock reset
  or a dispatch, not a new technique.
- **Editing a connected project without asking, or pushing its branch.**
- **Banking an XL spec and ending the session.** The context that argued the spec is
  the cheapest forge input the registry will ever have for it; dispatch before Phase 9
  unless `--spec-only` was asked for.
- **Committing to a connected project on an unpaired claim.** A technique landing in
  a tree is a measurement with two arms, or it is a branch.
- **Committing without a pathspec in a shared checkout.**
- **Running without a board claim.** An unclaimed run is invisible to eleven siblings
  and sees none of them; every collision rule in this method degrades to hope.
- **Appending to a ledger from a read taken before the lock.** The append succeeds and a
  line ceases to exist. This is the parallel failure that never announces itself.
- **Regenerating the index outside the `index` lock**, or regenerating "to be helpful"
  over files you do not own. The catalog's hash covers the index; a regeneration over a
  sibling's half-written subject bakes their WIP into an artifact you then commit under
  your name.
- **Switching the branch.** Not once, not briefly. Take a worktree.
- **Sweeping the scratch root at cleanup** instead of deleting this run's own directory
  by its run id.
- **Holding a lock across thinking.** Locks cover an edit, an append, a commit - seconds,
  never a drafting pass. A lock held across a verification round stalls the whole fleet
  and gets broken at its TTL anyway.
- **Mining a reference index at its top three links.** The list IS the source; three of
  its two hundred pointers is a sample, not an extraction. Enumerate all of them, rank
  them, and run waves.
- **Letting a wave worker write.** Workers return proposals. The director writes, holds
  the locks, and owns the diff.
