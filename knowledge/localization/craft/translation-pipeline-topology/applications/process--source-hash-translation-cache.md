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

## Second tree: personas-web

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14), read that
day. Its model-translated user guide has 116 topics in 13 locales, and it pins each
translation with this technique's key. It gets the scope right where MDN's key was
coarse, and pays for the bytes instead.

**The key.** `hashContent` is sha1 cut to 12 hex characters
(`scripts/i18n/guide-source.mjs:67-70`). Its input is
`JSON.stringify({ title, description, body })` (`:145-147`): exactly the translated
unit, and nothing else in the file. Bodies are hashed as raw source text, with escapes
still escaped and line endings as they are on disk (`:44-48`). The digest is stored
beside each translation in `src/data/guide/locales/<lang>/_meta.json` as
`topics.<id>.translatedFromHash`, next to `translatedAt`. The engine is recorded once
per file as `translator`.

**A shared extraction, learned the hard way.** The pin emitter and the drift detector
each once held a hand-copied extractor. Their digests agreed while "a shared
truncation bug silently shortened 11 of 116 bodies" (`:9-12`): a non-greedy regex
stopped at the first escaped code span followed by a comma (`:28-38`). A key is only
as exact as the extraction that feeds it. The fix is one module that both scripts
import (`check-guide-translations.mjs:21-24`, `emit-source-hashes.mjs:8-13`).

**Line endings are part of the identity, by decision.** There is no `.gitattributes`,
so a Linux checkout hashes 98 of 116 topics differently. The 1,261 stored pins (97
topics × 13 locales) were computed on Windows, so CRLF is declared canonical and "we
are not normalising" (`guide-source.mjs:50-53`). The consequence is recorded where a
gate would otherwise be:
- `.github/workflows/ci.yml:58-74` keeps the detector out of CI "PERMANENTLY".
- It rejects a Windows-only guard as "config that looks like a gate and is not".
- It names the cheap route: force `eol=crlf`, because "normalising to LF instead
  invalidates all 1,261 pins at once".

**Measured on 2026-09-14** (Windows checkout, `core.autocrlf=true`):

| | per locale | 13 locales |
| --- | --- | --- |
| missing | 19 | 247 |
| stale | 48 | 624 |
| drift total | 67 | **871** |
| fresh | 49 | 637 |
| orphaned | 0 | 0 |

The split is identical in every locale: one bootstrap run (`cs/_meta.json`,
2026-05-16), then a corpus that moved under all 13 at once. The command exits 0
(`check-guide-translations.mjs:143-144`). `--strict` exists (`:13`), and nothing runs
it.

### What this technique's rules say about the tree

- **Canonical form is a key field that arrived late.** Refusing to normalize is the
  absence-compatibility rule applied without its name. A change to how bytes are read,
  made after pins exist, is a whole-corpus miss that no string caused. Making every
  checkout produce the bytes the pins already hold has a blast radius of zero. What
  the rule adds is where that decision belongs: in the key function, not in two
  comments. As written, the key means "this source as checked out on Windows", and a
  wrong checkout shows up as nearly every topic reported stale, not as an error.
- **The hash input is absence-compatible by accident.** `JSON.stringify` drops a
  property whose value is `undefined`. Adding `context: note`, with `note` undefined
  for most topics, would leave their digests unchanged. Adding the same field as `""`
  or `null` would re-pin all 1,261 at once. The bill turns on a detail nobody wrote
  down, so state it in the function.
- **Configuration is outside the key.** The template, the glossary and the engine are
  not hashed. The template was amended on 2026-09-14 (`b3fe23f`), and the detector
  still reports 871. Every pin produced under the old template stays fresh
  ([the context side of the same fact](./process--prompt-context-contract.md)).
- **The fourth class is detectable and not detected.** The digest sits beside each
  translation. A renamed topic id would therefore show up as one `missing` entry
  (`:93-95`) and one `orphaned` entry (`:110-114`) whose stored hash equals the new
  id's current hash. The detector lists both and never compares them. There are no
  orphans today, so the class has cost nothing yet. The first slug refactor will
  re-translate everything it touches.
- **Publication is safe by order, not by atomicity.** The template writes the content
  files first and `_meta.json` last (`translate-guide-subagent-prompt.md:188-193` at
  `35d557b`). A crash between the two leaves translations without pins, which are
  reported missing and translated again. It never leaves pins without translations,
  the direction that would skip a unit forever.
