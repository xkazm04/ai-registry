# The reference-wave lane

For sources whose value is their **outbound links**: awesome-lists, curated
bibliographies, "papers we read" vaults, handbook reading lists, a research group's
public reading index. The source is a bibliography. Its own prose is annotation.

Read this before the first wave. `SKILL.md` § Phase 2c is the summary; this is the
procedure.

---

## Why this lane exists

The old behaviour was to skim such a source, pick the two or three references whose
titles read most promising, read those, and report the result as the source's yield.
Every part of that is wrong in a way worth naming, because each part has its own
corrective:

- **Two or three of two hundred is a 1.5% sample.** The number was never chosen; it fell
  out of a run-wide 3-fetch budget written for a source class where fetching is
  *corroboration*. Here the references are the *extraction*, so that budget was
  enforcing a sample size, silently, under a name that sounded like discipline.
- **The sample was drawn on titles**, which is the weakest signal in the set. A title
  states a topic. It does not say whether the document measures anything, whether it
  contradicts something we publish, whether its subject has attention points, or whether
  it is a relay of another entry in the same list.
- **The tail was discarded rather than recorded.** The 197 unread references left no
  trace, so the next pass over the same index re-derived the same ranking from the same
  titles and read the same three. A tail nobody wrote down is a tail that gets re-earned
  forever.
- **A curator's inclusion decision was thrown away.** Someone did work to assemble that
  list. Reading three entries uses none of it.

The corrective is breadth with cheap negatives: **read the maximum the run can afford,
accept that most will return `already covered` or `nothing`, and write down the ranking
of everything you did not read.** A negative on a reference actually read is worth more
than a confident guess about one that was not.

## Step 1 - Enumerate, by instrument, exhaustively

Clone the tree. Phase 2b applies in full - a reference index is a repository, and its
rendered landing page is one page of many.

Extract every URL from every file, not from the README:

```sh
git clone --depth 1 <url> <scratchpad>/<run-id>
git -C <scratchpad>/<run-id> log -1 --format=%H
grep -rhoE 'https?://[^ )>"'"'"'`\]]+' <scratchpad>/<run-id> --include='*.md' \
  --include='*.mdx' --include='*.rst' --include='*.txt' --include='*.json' \
  | sed 's/[.,;:]*$//' | sort -u
```

Then look for what that misses, because it always misses some:

- **sub-lists and per-topic pages** - a large index splits by topic into `docs/`,
  `topics/`, `papers/`, one file per cluster, and the README links to the files;
- **the git history** - `git log -p --diff-filter=D` over the index files. A removed
  reference is a curator's judgment and sometimes the most interesting row in the set;
- **non-URL references** - a DOI, an arXiv id, a paper title with authors and a year, a
  book. These carry no link and are frequently the primaries;
- **the curator's own annotations** - the sentence beside each row. Keep it with the
  reference; it is what step 2 classifies on.

**Dedupe twice.** First by normalized URL (strip `utm_*`, trailing slashes, `www.`,
`#anchor`, `m.` hosts). Then by **document**: an arXiv abstract page, its PDF, a PDF
mirror, an ACM landing page and a blog write-up of the same paper are one reference
with five addresses, and counting them as five inflates the total and wastes a wave slot.

**Report the honest total, before ranking.** "213 references, 168 distinct documents,
across 9 topic files and the README" is the line. A run that reports 47 over a tree
holding 213 has reproduced the old failure at a larger sample size, which is worse than
the old failure because it looks thorough.

## Step 2 - Classify each reference, no fetch

From the URL and the curator's annotation alone, tag each with its own source class
(`source-classes.md`) and with what it can authorize:

| Tag | Recognised by | Can it authorize? |
| --- | --- | --- |
| `primary` | standard, spec, RFC, vendor doc, official reference | yes, alone |
| `paper` | arXiv/DOI/conference/journal | yes, for its measurement in its protocol |
| `repository` | a code host | yes, as a tree you can open |
| `first-party` | a practitioner's own build/postmortem/talk | yes, as n=1 |
| `relay` | a newsletter, a listicle, "X explained", a summary of another row | no - originates only |
| `dead` | 404, parked domain, a vanished blog | no - and worth recording as currency |

Two rules that pay for themselves immediately:

- **A relay of a primary already in the set is not a reference.** Fold it into that
  primary as a carrier and drop it from the ranking. This routinely removes 20-30% of a
  list and it is the single cheapest step here.
- **Carriers are counted at publisher granularity**, per the tiering rule in `SKILL.md`.
  Five newsletters relaying one paper are one observation.

## Step 3 - Rank the whole set against the corpus

One `research-map` call, every reference's terms at once:

```sh
node scripts/research-map.mjs "<terms from ref 1>" "<terms from ref 2>" ... --top 4
```

Score each reference. The weights are deliberately about *the corpus*, not about how
interesting the reference sounds:

| Signal | Where it comes from | Weight |
| --- | --- | --- |
| maps to a subject with measured attention points | `librarian-scan.mjs --top 15` | highest - this is the only signal a script can check |
| can authorize (`primary` / `paper` / `repository`) | step 2 | high - a relay can never close a gap |
| annotation claims a **measurement, a negative result, or a contradiction** | the curator's own sentence | high - and it is where the curator's work is visible |
| maps to a subject we publish and might **refute** | `research-map` + the subject's own claims | high - a refutation outranks a confirmation |
| maps to a hole (`new-subject`) | `research-map` empty | medium - and distrust it; check the board and the branches first |
| already in `librarian/sources/index.md` | the ledger | excluded, unless the ledger's outcome was `untriaged` |
| topic sounds interesting | your taste | zero. This is the signal the old failure ran on |

Sort descending and **write the whole ranked list into the source note** - every
reference, its class, its map hit, its score band, read or unread. That table is the
lane's most durable artifact: it turns the next pass over this index (or over the same
field's next index, which will overlap heavily) into a diff rather than a re-derivation.

Then **claim the subjects the top bands implicate**, before any worker dispatches:

```sh
node scripts/run-board.mjs beat --run <id> --phase 2c --subject <addr> --subject <addr>
```

## Step 4 - Cut waves

A **wave** is 5-8 references, one worker each, dispatched together.

- **Cap 8 concurrent.** A reference reader fetches, reads a full document and reasons
  against a bundle - heavier than a librarian sweep worker, comparable to a harvest
  miner. Beyond 8 the director cannot review the returns faithfully, and an unreviewed
  return is the whole risk of this lane.
- **Per-worker budget: ~2 fetches.** The document, plus at most one primary it points
  at. A worker that wants a third says so in its return and the director decides.
- **Wave 1 is the top band. Wave 2 is decided from wave 1's returns, never pre-planned.**
  This is the point of waves rather than one large batch: the first returns move the
  ranking. A reference that comes back carrying a measurement promotes everything the
  curator grouped beside it; a band that returns eight catches demotes its whole cluster
  and the run should skip to a different cluster rather than grinding down the list.
- **Stop on yield, not on count.** Continue while a wave still returns something that
  is not `already covered` or `nothing`. Two or three waves over a large index is normal.
  Stop early and say so when two consecutive waves return nothing but catches - that is
  a real result about the index (the corpus is ahead of it) and it belongs in the note.
- **Unread is `untriaged`, never `declined`.** Same rule as the triage table, same
  reason: nobody looked. The ranked list makes the distinction visible per row.

### The worker brief

Workers **read and return. They never write, never touch git, never take a lock.** The
director holds every write. This is the same single-writer rule harvest's miners run on,
and it is what makes the parallelism safe.

```
You are one lane of a reference wave for the /intake method (read
.claude/skills/intake/SKILL.md and references/source-classes.md).

REFERENCE:   <url or citation>
CLASS:       <the step-2 tag - verify it and say so if it is wrong>
CURATOR SAID: "<the annotation, verbatim>"
FROM INDEX:  <the index repo and commit>
WHY RANKED:  <the subject it maps to, its attention points, what it might refute>
PRIOR ART:   <research-map output for this reference's terms, verbatim>
FETCH BUDGET: 2. Say if you needed a third and did not spend it.

Read the document itself, not a summary of it. Then RETURN AS TEXT, writing NOTHING
to disk and running no git command:

 1. the class you actually found, and whether the curator's annotation was accurate
 2. 0-4 candidates, each with: claim (one sentence, in the document's terms) |
    anchor (quote under 20 words, or section) | strip-test result | what it can
    authorize | proposed outcome (content / currency / lead / covered / nothing) |
    target subject, FROM PRIOR ART ONLY - never a constructed path
 3. anything here that CONTRADICTS what the prior-art excerpt says we publish. This is
    the highest-value thing you can return; report it even when you are unsure.
 4. what you did NOT extract and why
 5. one line: was this reference worth a wave slot? Answer honestly - "no" is the
    return that makes the next wave better.

If the document is dead, paywalled or a redirect to something else, say so in one line
and stop. That is a complete result and it is currency for the index.
```

### Reviewing the returns

- **Two workers reaching the same rule from independently curated references is the
  strongest signal this lane produces** - genuine within-index convergence, and it only
  exists because the sample was broad. Dedupe by *author*, not by reference: one team's
  three papers are one voice.
- **A contradiction return is picked before any confirmation return.** Same rule as
  everywhere in this method: a source that locates something true while explaining it
  wrongly is the best case.
- **Do not trust a worker's "target subject".** It read one excerpt of prior art. The
  director opens the file, per Phase 6.
- **A worker's "not worth a slot" is data about the ranking**, not about the worker.
  Fold it back into step 3's weights and say so in the reflection.

## Step 5 - Merge serially

Land through the ordinary phases - 5 (triage), 6 (verify), 7 (land), 7.5 (apply), 8, 9 -
with the batch lane's bookkeeping. The wave structure ends here; nothing about it changes
what may authorize a landing.

Two additions to the source note for this class:

- the **ranked reference table**, complete, with read/unread per row;
- the **boundary finding**: what the curator included and excluded. A bibliography is a
  stated opinion about a field's edge. Where it converges with ours, that is
  corroboration for a boundary we drew; where it diverges, the gap is a lead and is often
  worth more than any single reference in the list. Record it once, and do not let it
  stand in for the source's yield.

## Frontmatter for a reference-index source note

```yaml
kind: reference-index
refs_found: 213          # every URL, before dedupe
refs_distinct: 168       # after URL and document dedupe
refs_ranked: 168
refs_read: 22            # across all waves
waves: 3
refs_untriaged: 146      # ranked, unread, recorded - NOT declined
fetches: 41
```

`refs_read / refs_distinct` is this lane's read fraction, and it is the number that makes
the old failure impossible to report as a success. A note showing `refs_read: 3` over
`refs_distinct: 168` is the failure this document exists to end, wearing a frontmatter.
