---
name: intake
description: "Mine an external source - a YouTube video, a news roundup, an article, pasted notes - for what it should change in THIS registry, and in the connected projects that consume it. Ingests the source, maps every claim against existing bundles for prior art, triages candidates with the operator, and lands only what survives corroboration. News sources mostly yield currency signals and leads, not knowledge; that is a successful run. Use when someone shares a link and asks what it means for us."
category: ai-native
memory: project
version: 0.9.0
tags: research, sources, triage, currency, cross-repo, leads
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
/intake <url> --domain <d>    # constrain routing to one bundle
/intake status                # read the source ledger, touch nothing
/intake reflect               # update LESSONS.md and this method from recent runs
```

## Never count, never construct, never fetch by hand

Two instruments, both dependency-free, both asserting themselves before they report:

```sh
node scripts/research-ingest.mjs <url|path|-> --json    # source  -> deduped transcript + metadata
node scripts/research-map.mjs "<term>" "<term>" ...     # terms   -> prior art + where a new subject goes
```

`research-ingest` exits **2** when the instrument failed and **3** when the source is
genuinely thin. Those lead to opposite next moves, which is why they are different
codes: a 2 is retried or routed around, a 3 is reported and the run stops.

`research-map` returns each hit's `file` from the bundle index. That string is the
subject's **address**. Bundles are nested and depth is dynamic, so a constructed path
writes a document into a folder no consumer walks - the same rule `deepen` workers and
`librarian` dispatches run on.

Neither instrument decides anything. They put you in the neighbourhood; you still open
the file.

## The five outcomes

Rank a run by which of these it produced honestly, never by document count.

| Outcome | What it is | Where it lands |
| --- | --- | --- |
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

A source's class decides what its claims are *for*, and the two seen so far are near
opposites. Record the reading in the ledger; it is what makes run N+1 cheaper.

- **Second-hand survey** (a news roundup, a digest, a "what shipped this week"). Broad,
  shallow, and reliable for exactly one thing: **that the world moved**. Its
  explanations are second-hand by construction and it will state rules backwards with
  total confidence. Mine it for *where to look*, never for *what is true*.
- **First-party practitioner account** (the person who built it, talking about what they
  built). Authoritative about **what they did and what they measured** - no corroboration
  lane improves on a first-hand report of one's own system. **Not** authoritative about
  what works in general, because the sample is one. A measured result here is an
  existence proof, not a distribution.

That second class maps onto the layer contract almost exactly: strong evidence for the
**shape** of a technique, weak evidence for its universality. So its claims land well as
decision rules with their conditions attached, and badly as unqualified assertions -
which is a different editing job, not merely a higher trust level.

- **Second-hand practitioner listicle** (a creator's "N mistakes / N tips", relaying
  vendor documentation with some first-hand pain). Reliable for **where the vendor's
  rules moved**; every number it quotes is a lossy pointer to a primary source - a
  study, a reference page, a pricing page - and is written from the primary, never from
  the quote. Its single most trustworthy sentence is the one where the creator retracts
  their own earlier advice. Items that touch **this registry's own machinery** (how
  skills, rules and workers are loaded) outrank items about bundle content, because the
  registry consumes the harness the listicle describes.

- **Paper aggregator** (an awesome-list or survey repo of research papers). Triage at
  **cluster level, never item level** - map the list's own taxonomy onto the corpus's
  subjects, present clusters with one or two anchor papers each, and read at most ~3
  papers per run, chosen where a bundle or a connected project could act on the result.
  A paper is authoritative for **its measurement, in its protocol**, and weak for its
  framework - framework papers are the class's marketing; measurements, failure
  taxonomies and negative results are its substance, and they survive the strip test
  where architectures do not. Reading a picked paper IS the extraction for this class,
  so the fetch budget is per-paper (~2 each: abstract, then full text) rather than the
  run-wide 3. A vendor paper gets its counter-evidence lane in the same pass - the
  competing vendor's benchmark of the same system is one fetch and is usually the
  cheapest honest number available. The cluster map itself goes in the source note: it
  is what makes the next 300-paper list a one-table triage.

- **App/tutorial aggregator** (a monorepo of small runnable example apps). Cluster-triage
  like the paper aggregator, but the yield lives in the repo's **operational periphery**
  - its CI gates, validators, eval ladders, release discipline - not in any app's
  architecture, because a mature corpus outclasses tutorial-grade app content by
  construction. The apps themselves resolve almost entirely to catches; the two things
  worth per-item attention are entries that instantiate one of OUR laws in code (a
  cheap corroborating tree) and entries whose *popularity* signals a hazard or demand.
  One shallow clone replaces per-item fetches; on this platform verify the checkout
  completed (`git ls-tree HEAD` vs `ls` - a path casualty aborts checkout silently and
  the clone's `-q` eats the error; restore missing dirs with `git checkout HEAD -- <dir>`).

Within the first-party class, the **release walkthrough** is the sub-class to seek out:
a library author going through one version's changes. It is organised around *changes*,
and a change carries its own motivation - the author says what was wrong before, because
that is the reason the release exists. A feature demo shows the solution and hides the
problem; a walkthrough shows both. Three of five accepted findings in one such run came
from the stated failure modes rather than from the features.

**Length is not yield.** A 3,000-word first-party talk has outproduced a 7,000-word
roundup. The `--min-words` floor asks whether anything is there at all; it says nothing
about how much is worth having.

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

Budget corroboration like `deepen` does: at most **3** web fetches for the whole run,
spent only on picked candidates, preferring primary and vendor documents over
commentary about them. A news video reporting on a paper is not the paper.

## Procedure

### Phase 0 - Bootstrap (idempotent)

- `librarian/sources/index.md` exists (the source ledger). Create if missing.
- `.projects.local.json` exists at the repo root. It maps project slug -> absolute path
  -> the domains it consumes, and it is **gitignored**: this registry publishes no
  consumer paths, the same rule that put the evidence layer in a local overlay. Its
  published, path-free half is [`librarian/projects.md`](../../librarian/projects.md),
  which carries slugs and domains only.
- If the bridge is missing and the run needs it, ask for paths rather than guessing.

### Phase 1 - Prove the instruments, then load memory

1. `node scripts/check-bundles.mjs`, then `node scripts/build-index.mjs --check`. A red
   gate means you are about to map claims against a corpus that does not parse. Stop.
2. `node scripts/librarian-scan.mjs --top 15` - the standing worklist. A candidate that
   reduces a measured attention point outranks one that does not, and this is the only
   tie-breaker in the triage that a script can check.
3. Read `librarian/sources/index.md`. **If this source was already mined, say so and
   stop** unless the operator wants a re-run; then read the prior note first, because
   its declines are the answer to half of what you are about to propose.

### Phase 2 - Ingest

```sh
node scripts/research-ingest.mjs "<url>" --json
```

Read the transcript. Then delete this run's scratch files once the text is in context -
scoped to this run's id, never a blind sweep of the work directory, which races a
parallel run sharing it.

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

**Carry your own read on every row**, in its own column: `real gap` / `partial` /
`likely catch` / `thin`. It is the column that makes the gate work - on 2026-08-22 the
operator took four rows marked real and skipped three of four marked likely-catch, which
is a better allocation than either party would have reached alone. Withholding the read
to seem neutral just moves the guesswork to the person with less context.

Say the expected yield for the source class out loud before the table, so a small
number reads as calibration rather than as failure. Flag any candidate that matches a
prior run's decline or a banked lead as `reconsider?` with the earlier reason.

Only picked candidates go deep. If the run is unattended, pick using the registry
impact as the tie-breaker and say which you picked and why.

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
4. **Read the neighbours, not just the gap.** A candidate phrased as "X is missing"
   aims you at the half that is not built and away from the half that is, which is
   where a real defect is likelier to sit. Read the sibling techniques and one
   application before writing the finding up.
5. **Name the home, and expect it to be contested.** A finding whose home is obvious was
   probably already covered. The interesting ones sit between subjects, and picking
   wrong misfiles the technique where nobody looking for it will look. Read the
   candidate subjects' own boundary statements - this corpus states them explicitly, in
   the golden path's opening - and choose the subject whose stated job the finding
   answers, not the one whose slug matches. When two subjects describe the same
   boundary from opposite sides, say so in both notes rather than writing it twice.
6. **Corroborate** per the table above, inside the 3-fetch budget.
7. **Drop honestly.** A picked candidate that resolves to already-covered is a catch,
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

After content changes, regenerate in this order and never the reverse - the catalog's
hash covers the index:

```sh
node scripts/build-index.mjs && node scripts/build-catalog.mjs
node scripts/check-bundles.mjs && node scripts/check-skills.mjs
```

### Phase 8 - The cross-repo lane (opt-in, per run)

A finding can land in the registry AND in a project that consumes it. That second half
is a different repository with its own review, so it is gated separately and never
assumed.

1. Resolve the project from `.projects.local.json`. Do not guess a path.
2. Confirm with the operator before touching a project tree at all.
3. Commit atomically **with a pathspec** on the project's default branch - the fleet
   has one owner and one machine, so a branch-and-PR round trip protects nobody (see
   the single-owner doctrine in memory). The two exceptions: the tree has another
   session's uncommitted work in files you touch, or the change is larger than a few
   lines a reviewer can read in the diff - then a branch, and say why. **Never push**
   from a run; the operator pushes when they have read the diff.
   An operator's triage pick that names the project ("with impact on X") *is* the
   confirmation in step 2 - do not ask twice.
4. The registry-side artifact of a project change is an **application document**: you
   opened a real tree, so you are one of the few things allowed to write `verified_on`
   and `verified_against` truthfully. Write them.
5. **Look for the structural fact that confirms or refutes the technique, not just for a
   place to point at.** An application whose content is "here is where this happens" is
   a bookmark. The valuable one reports something the tree's *shape* says about the
   standard - and the strongest form is negative. On 2026-08-22 a technique claimed one
   term of a four-term model is the one nobody can set; the tree turned out to carry a
   module context for every other term and none for that one, because nothing in a
   codebase can own it. Nobody designed that; it fell out of the structure, and it is
   better evidence than the code the run had just added. Ask what the tree could not
   have been built to prove, and whether it proves it anyway.
6. **Write what the realization CANNOT do.** A stack that judges rather than measures
   should say so in the application, because the reader is deciding whether to copy it.
7. Never copy a project's paths, repo names or internals into a published registry
   file. The application layer may cite code the project has chosen to make public;
   `librarian/` and the upper layers may not cite it at all.

### Phase 9 - Persist

- **Source note** `librarian/sources/<YYYY-MM-DD>-<slug>.md`: frontmatter (`source`,
  `kind`, `url`, `title`, `author`, `words`, `extracted`, `accepted`, `declined`,
  `leads`, `already_covered`, `untriaged`, `dispatched`), then one block per candidate
  with its outcome and, for declines, the reason. A decline nobody wrote down gets re-proposed
  every run forever.
- **Source ledger** `librarian/sources/index.md`: one line per mined source. This is
  what makes "already mined" a one-second check next time.
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
- **Check for parallel sessions before touching the tree.** This checkout is routinely
  shared with other agent sessions: on 2026-08-21 another session switched the branch
  out from under this one mid-run, and on 2026-08-23 a directory-wide `git add` swept a
  sibling's in-flight instrument into a commit. When anything else is live, regenerate
  index/catalog only from files you own, and if a branch is needed after all, take it
  as `git worktree add <short path> -b <branch>` - keep the path SHORT, the deepest
  bundle paths blow past the platform limit under a scratch-directory prefix.
- **Commit with a pathspec**: `git commit -m "..." -- <your paths>`. A worktree isolates
  the checkout but shares the object store and the branch namespace, and a pathspec-less
  commit still takes whatever is staged.
- Treat any modified file you did not touch as live WIP. Never `git add -A`.
- Close by verifying each shipped artifact is in `HEAD` (`git grep <slug> HEAD -- <path>`),
  not by trusting that the commit command succeeded. A parallel session can rewrite
  history and drop your content back into the working tree, where the gates still pass.

### Phase 11 - Reflect

Append to `.claude/skills/intake/LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <source slug>`
plus bullets. Record the version the run **used**. A lesson needs no version bump; a
change to this file does, in the same commit.

Ask the operator once, batched, why the declined picks were declined. A decline reason
seen three times is a rule this file should carry.

## Anti-patterns

- **Letting a video author an upper layer.** The one failure that damages the corpus
  rather than just wasting a run.
- **Padding the findings list.** Nine catches and one lead is a result. Report it.
- **Proposing what the bundle already says.** Phase 4 exists to prevent this; skipping
  it to save a second costs a whole verification round.
- **Constructing a subject path** instead of using the index's `file`.
- **Writing `verified_on` for a tree nobody opened.** That is the one field whose only
  value is that it is a fact.
- **Treating a currency signal as a content gap.** "The world moved" is a clock reset
  or a dispatch, not a new technique.
- **Editing a connected project without asking, or pushing its branch.**
- **Committing without a pathspec in a shared checkout.**
