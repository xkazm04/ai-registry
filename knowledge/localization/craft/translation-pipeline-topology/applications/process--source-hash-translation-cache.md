---
layer: application
type: application
subject: translation-pipeline-topology
technique: source-hash-translation-cache
stack: process
source: mdn/translated-content
status: forged
verified_on: 2026-08-29
---

# A source-commit staleness key at 37,200 documents, with no instrument reading it

`mdn/translated-content` @ `876d0eeb190cddd56d3093b58f0b0b3e52f5478b` (2026-08-29,
`package.json` `1.0.0`) holds the human-translated mirror of `mdn/content` across
eight locales — 37,200 documents. It is the derived-and-served topology's opposite
number, every unit hand-written and committed, and it still runs this technique's
key, because the question the key answers is not "may I skip the machine?" but
"does this translation still answer to its source?".

## The key: a commit, not a digest, and per-file

Front matter carries `l10n.sourceCommit`. `.front-matter-config.json:31-44`
declares it: an `l10n` object with `additionalProperties: false` and
`required: ["sourceCommit"]`, described as "the full commit hash of the commit
from upstream this localization is synchronized with". `CONTRIBUTING.md:98`
gives the contributor procedure — "the commit hash of the latest commit that
modified the file… by running `git log <file>`" — so the intended semantics are
**per-file**, not the upstream tip at sync time.

Measured, they are. Over all 21,351 documents that carry the key there are
**3,302 distinct commits**, and the clustering is by upstream commit *fan-out*,
not by sync date: the most-used value `ada5fa5e` (886 documents) is
`feat(glossary): add sidebar to Glossary pages (#26985)`, and 881 of those 886
documents sit under `glossary/`; the second, `544b8435` (772 documents), is
`chore: Move jsref sidebar into front matter (#40293)`, and 772 of 772 sit under
`web/javascript/reference`. In a 40-document sample the recorded commit itself
touched the mirrored English path in **28 of 40** cases (the remainder are files
the upstream has since renamed, or commits above the API's 300-file listing cap).

So the technique's "digest of the exact source unit" is realized here as a
*pointer to the source unit's version*. Both identify the source; they differ in
what else they can do:

- A digest answers one bit — same or not. A commit is **addressable in history**,
  so the check can hand a reviewer the diff that made the translation stale
  rather than a boolean. For a machine pipeline that re-translates on a miss the
  bit is enough; for a corpus re-translated by **people**, the work order is the
  whole value, and that is why a commit is the right key here.
- A commit is **coarser than the translated scope**, and the cost is measurable
  (below). The technique already contains the fix in its own words — the digest
  is of "the exact text translated", not of the file.

## Coverage: the key is optional, so absence is not a state

`docs/zh-cn/translation-guide.md:16` marks it 可选 (optional); the schema requires
it only once `l10n` is present. `CONTRIBUTING.md:118` says so plainly: "many
documents still do not have a `l10n.sourceCommit`… eventually we aim to have
[one] defined on all files." Counted today, `grep -rl` against `find | wc -l`:

| locale | `.md` | with key | | locale | `.md` | with key |
| --- | --- | --- | --- | --- | --- | --- |
| ja | 10,208 | 9,359 (92%) | | zh-tw | 1,012 | 351 (35%) |
| fr | 7,598 | 5,175 (68%) | | es | 2,671 | 366 (14%) |
| zh-cn | 7,565 | 4,225 (56%) | | ru | 2,787 | 239 (9%) |
| ko | 3,344 | 1,628 (49%) | | pt-br | 2,015 | 8 (0.4%) |

**21,351 of 37,200 (57.4%).** This is the case the technique does not cover: a
cache whose entries are *optional*. A missing entry is indistinguishable from a
never-translated one, so no locale can be asked "how much of you is current?" —
`docs/ko/guides/meta-data-guide.md:53` states exactly that gap in the guide that
introduces the key. A key 0.4% populated in one locale and 92% in another is not
a coverage instrument but a coverage *hypothesis*, and both ends of that table
are the same repository under the same rule.

## Executed evidence: the drift the key can already see

**Harness.** `scripts/get-sourceCommit.js` (run after `npm ci`; Node 24.14.0)
extracts the key but resolves nothing, so the comparison was built: per document,
`gh api repos/mdn/content/commits/<sha>` for the recorded commit's date, then
`gh api "repos/mdn/content/commits?path=<en-path>&since=<date>"` for what came
after. **n = 40**, every 534th row of the 21,351 sorted extractions, 2026-08-29.

- **40/40 recorded commits resolve** in `mdn/content`, and **40/40** mirrored
  English paths still exist. Zero dangling keys — the key does not rot.
- **17/40 documents (42.5%) are behind**, by **51 upstream commits** in total
  (one to ten per document; one `ja` API page is ten behind).
- Classifying each of those 51 by the patch it made to the English file:
  **37 changed body lines** — of which **24 changed four lines or fewer** —
  **6 changed only YAML front matter**, and **8 came from six bulk commits
  above the 300-file API cap** (a Prettier 3.5.3→3.6.0 bump reformatting 5,825
  lines, three information-architecture moves, one Glossary sidebar-into-front-
  matter chore, one repo-wide comma fix).

The last two rows are the coarseness bill: **14 of 51** staleness signals came
from upstream edits that changed nothing a translator would translate. And
`docs/README.md:19-24` proves they *cannot* matter — translated pages carry only
`title`, `short-title`, `slug` and `l10n.sourceCommit`, because the platform
merges the English front matter under them. Upstream front-matter churn is
provably outside the translated unit, and it still moves the key for hundreds of
documents at a stroke. The technique's phrasing survives intact; what this tree
shows is the *price* of scoping the key to the file rather than to the text.

## The contract exists; the instrument does not

`scripts/get-sourceCommit.js:18-21` reads `data.attributes.l10n?.sourceCommit` and
prints it. Nothing resolves it. Grep-scoped: `grep -rn "sourceCommit" --exclude-dir=files`
returns 23 hits in 7 files — the schema, that script, `CONTRIBUTING.md`, and four
translation guides. No CI job compares a recorded commit against upstream:
`pr-check-lint_content.yml:130-145` runs the front-matter linter (shape only) and
`sync-translated-content.yml:22-34,70` runs a daily per-locale sync that opens a
PR, but neither reports staleness. `CONTRIBUTING.md:120-126` is the tell — the
sections "Has a source commit property" and "No source commit present" both read
`XXX Write me...`. The state is recorded and schema-gated; the procedure for
*using* it was never written.

And that one script's machine-readable format **drops the population the key
exists to find**: `printJSON` (`:42-44`) serializes a map whose misses are
`undefined`, which `JSON.stringify` omits. Run on `files/ko`, `-f csv` emits
3,344 rows of which 1,716 are `undefined`; `-f json` emits **1,628 entries** and
no trace of the 1,716 — silently reporting 100% coverage. (Its header comment,
`:1-7`, describes a language-detection script; it is copied from
`scripts/check-document-locale.js:1-5`, which really does use `franc-min`.)

## What this realization does not show

n=40 over the *keyed* 57.4%, so 42.5% is a rate for documents that opted in and
says nothing about the 15,849 that did not. Whether MDN would act on a staleness
report is also unknown — the check is two API calls per document and nobody has
built it, which is itself the finding: at this scale the missing piece is never
the key, it is the one job that reads it.
