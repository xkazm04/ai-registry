---
name: research
description: "Mine an external source - a YouTube video, a news roundup, an article, pasted notes - for what it should change in THIS registry, and in the connected projects that consume it. Ingests the source, maps every claim against existing bundles for prior art, triages candidates with the operator, and lands only what survives corroboration. News sources mostly yield currency signals and leads, not knowledge; that is a successful run. Use when someone shares a link and asks what it means for us."
category: ai-native
memory: project
version: 0.1.0
tags: research, sources, triage, currency, cross-repo, leads
---

# Research

The registry has three content engines. `domain-knowledge-forge` creates a bundle from
a repository's ceiling. `deepen` raises one subject above any repository, outward, by
researching a topic we chose. **This one runs inward**: someone hands over a source we
did not choose - usually a mixed AI-news video - and the question is what, if anything,
it changes here.

That inversion is the whole design. `deepen` starts from a subject and goes looking for
truth. `/research` starts from a claim of unknown quality and has to earn its way to a
subject. Most of the time it does not, and the run is still worth having, because the
thing it produces instead - a dated lead, a clock reset, a dispatch - is what keeps a
corpus from aging silently between sweeps.

Say the next sentence out loud in every session, because the failure mode for a skill
like this is a bundle quietly acquiring a YouTube channel's error rate. **A source
ORIGINATES a finding. It never AUTHORIZES one.**

## Invocation

```
/research <url|path|->          # the full loop: ingest, map, triage, land
/research <url> --leads-only    # stop at the vault note; change no published content
/research <url> --domain <d>    # constrain routing to one bundle
/research status                # read the source ledger, touch nothing
/research reflect               # update LESSONS.md and this method from recent runs
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

## The four outcomes

Rank a run by which of these it produced honestly, never by document count.

| Outcome | What it is | Where it lands |
| --- | --- | --- |
| **Content** | A claim that survived corroboration and the strip test. | `knowledge/`, `skills/`, `practices/`, `memory/`, `scripts/`, `docs/` |
| **Currency** | The world moved under a claim we already publish. | `verified_on` / `refresh_by` on the affected application, or a scoped `/deepen` dispatch |
| **Lead** | Real, unproven, with a stated return condition. | `librarian/sources/<date>-<slug>.md` |
| **Already covered** | The corpus says it, and says it better. | The source note, as a catch |

A mixed-news roundup that yields nine already-covered catches, two leads and one clock
reset is a **good run**. Padding it into three half-corroborated techniques is how the
upper layers rot. Report the counts and let them be small.

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
| `skills/`, `practices/`, `memory/`, `scripts/`, `docs/` | Judgment, no gate. These are ours; the bar is whether it would survive `CODEOWNERS` review. |

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

### Phase 5 - Triage with the operator (the cheap steering gate)

```
#  Lane  Shape      Eff  Title                            Prior art (subject)        Impact           Anchor
1  K     technique  M    Separate weights from a license  se/llm-agent/model-routing new-technique    [04:12]
2  K     currency   S    Context-window claim moved       se/.../prompt-assembly     resets-clock     [11:40]
3  X     applicat.  M    Personas already does this       -                          fills-stack-gap  [17:05]
```

Then ask: **"Which should I verify and (if real) land? (numbers / all / none / leads-only)"**

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
2. **Read the neighbours, not just the gap.** A candidate phrased as "X is missing"
   aims you at the half that is not built and away from the half that is, which is
   where a real defect is likelier to sit. Read the sibling techniques and one
   application before writing the finding up.
3. **Corroborate** per the table above, inside the 3-fetch budget.
4. **Drop honestly.** A picked candidate that resolves to already-covered is a catch,
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
| `lead` | the source note | With a return condition, or it is not a lead, it is a shrug. |

`XL` is specified, never half-built: write the spec or the handoff and link it from the
source note.

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
3. Work on a **branch** in that repo. Atomic commit. **Never push.** Report the branch
   name and let a human open the pull request there - merging is adopting, on both
   sides of the bridge.
4. The registry-side artifact of a project change is an **application document**: you
   opened a real tree, so you are one of the few things allowed to write `verified_on`
   and `verified_against` truthfully. Write them.
5. Never copy a project's paths, repo names or internals into a published registry
   file. The application layer may cite code the project has chosen to make public;
   `librarian/` and the upper layers may not cite it at all.

### Phase 9 - Persist

- **Source note** `librarian/sources/<YYYY-MM-DD>-<slug>.md`: frontmatter (`source`,
  `kind`, `url`, `title`, `author`, `words`, `extracted`, `accepted`, `declined`,
  `leads`, `already_covered`, `dispatched`), then one block per candidate with its
  outcome and, for declines, the reason. A decline nobody wrote down gets re-proposed
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

- **A branch, always.** Never `main`. The registry's governance model is that merging
  is a human act, and a research run is exactly the kind of automation that erodes it
  if it is allowed to land directly.
- **Commit with a pathspec**: `git commit -m "..." -- <your paths>`. This checkout is
  routinely shared with parallel agent sessions, and a pathspec-less commit takes
  whatever another session staged between your `add` and your `commit`.
- Treat any modified file you did not touch as live WIP. Never `git add -A`.
- Close by verifying each shipped artifact is in `HEAD` (`git grep <slug> HEAD -- <path>`),
  not by trusting that the commit command succeeded. A parallel session can rewrite
  history and drop your content back into the working tree, where the gates still pass.

### Phase 11 - Reflect

Append to `skills/research/LESSONS.md`: `## <version used> - <YYYY-MM-DD> - <source slug>`
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
